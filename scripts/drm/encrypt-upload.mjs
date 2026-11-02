#!/usr/bin/env node
/**
 * tVNDRM: encrypt a lesson video and publish it to the website.
 *
 *   node scripts/drm/encrypt-upload.mjs <video.mp4> <video-id> [--title "Bài 1"] [--group 30]
 *
 * 1. ffmpeg -> HLS in 3 qualities (1080p/720p/480p, never above the source), 6 s segments
 * 2. key rotation: every --group seconds of video gets its own AES-128 key
 * 3. uploads playlists + encrypted segments to Cloudflare R2 (<video-id>/...)
 * 4. stores the keys in Supabase (drm_keys, service role only) and the video in drm_videos
 * Then set the lesson's video to  drm:<video-id>  in Admin > Khóa học.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and R2_* from .env.local.
 * Port of DRM STACK/server/scripts/encrypt_enterprise.ps1 + rotate_keys.js.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { AwsClient } from 'aws4fetch';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const opt = (name, d) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args.splice(i, 2)[1] : d; };
const title = opt('title', null);
const GROUP = Number(opt('group', 30));
const SEG = 6;
const [input, videoId] = args;
if (!input || !fs.existsSync(input) || !/^[a-zA-Z0-9_-]+$/.test(videoId || '')) {
  console.error('Usage: node scripts/drm/encrypt-upload.mjs <video.mp4> <video-id> [--title "..."] [--group 30]');
  process.exit(1);
}

// .env.local (KEY=value lines)
for (const line of fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const env = (k) => { if (!process.env[k]) { console.error(`Missing ${k} in .env.local`); process.exit(1); } return process.env[k]; };
const r2 = new AwsClient({ accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY'), service: 's3', region: 'auto' });
const r2Base = `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com/${env('R2_BUCKET')}`;
const db = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

const work = fs.mkdtempSync(path.join(os.tmpdir(), `tanva-drm-${videoId}-`));
try {
  // 1. Transcode (fixed GOP keeps segment boundaries aligned across qualities)
  const [srcWidth, srcHeight] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', input])
    .toString().trim().split(',').map(Number);
  // Balanced profile sized for R2's free 10 GB (~40 MB per minute for all three): talking-head
  // and screen-recorded lessons compress well, so 1080p stays sharp at 3 Mbps.
  // The player starts at 720p; students can switch to 1080p or 480p.
  const qualities = [
    { name: '1080p', h: 1080, br: '3000k', buf: '4500k', bw: 3200000 },
    { name: '720p', h: 720, br: '1400k', buf: '2100k', bw: 1500000 },
    { name: '480p', h: 480, br: '600k', buf: '900k', bw: 700000 },
  ].filter((q, i, all) => q.h <= (srcHeight || 1080) || i === all.length - 1)
    .map((q) => ({ ...q, w: Math.round(((srcWidth || 16) / (srcHeight || 9)) * q.h / 2) * 2 }));

  for (const q of qualities) {
    console.log(`encoding ${q.name}…`);
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', input,
      '-vf', `scale=-2:${q.h}`, '-c:v', 'libx264', '-preset', 'veryfast', '-b:v', q.br, '-maxrate', q.br, '-bufsize', q.buf,
      '-force_key_frames', `expr:gte(t,n_forced*${SEG})`, '-c:a', 'aac', '-b:a', '96k', '-ac', '2',
      '-hls_time', String(SEG), '-hls_playlist_type', 'vod',
      '-hls_segment_filename', path.join(work, `${q.name}_%03d.ts`), path.join(work, `${q.name}.m3u8`), '-y'], { stdio: 'inherit' });
  }

  // 2. Key rotation. IV = media sequence number (the HLS default when the playlist omits IV)
  const keys = new Map();
  const keyFor = (n) => { if (!keys.has(n)) keys.set(n, crypto.randomBytes(16)); return keys.get(n); };
  const ivFor = (seq) => { const iv = Buffer.alloc(16); iv.writeUInt32BE(seq, 12); return iv; };
  for (const q of qualities) {
    const file = path.join(work, `${q.name}.m3u8`);
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    let seq = Number(lines.find((l) => l.startsWith('#EXT-X-MEDIA-SEQUENCE:'))?.split(':')[1] || 0);
    let elapsed = 0, group = -1, inf = null;
    const out = [];
    for (const line of lines) {
      if (line.startsWith('#EXTINF:')) { inf = line; continue; }
      if (line && !line.startsWith('#') && inf) {
        const g = Math.floor((elapsed + 0.001) / GROUP);
        if (g !== group) { out.push(`#EXT-X-KEY:METHOD=AES-128,URI="tvndrm://key/${videoId}/${g}"`); group = g; }
        const seg = path.join(work, line.trim());
        const c = crypto.createCipheriv('aes-128-cbc', keyFor(g), ivFor(seq));
        fs.writeFileSync(seg, Buffer.concat([c.update(fs.readFileSync(seg)), c.final()]));
        out.push(inf, line.trim());
        elapsed += parseFloat(inf.slice(8)); seq += 1; inf = null;
        continue;
      }
      out.push(line);
    }
    fs.writeFileSync(file, out.join('\n'));
  }
  fs.writeFileSync(path.join(work, 'index.m3u8'),
    '#EXTM3U\n#EXT-X-VERSION:3\n' + qualities.map((q) => `#EXT-X-STREAM-INF:BANDWIDTH=${q.bw},RESOLUTION=${q.w}x${q.h}\n${q.name}.m3u8`).join('\n') + '\n');
  console.log(`encrypted with ${keys.size} keys (${GROUP}s each)`);

  // 3. Upload to R2, 3 at a time (leaves bandwidth for the office), retrying network drops
  const files = fs.readdirSync(work);
  let done = 0;
  const queue = [...files];
  const put = async (f) => {
    const type = f.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t';
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await r2.fetch(`${r2Base}/${videoId}/${f}`, { method: 'PUT', body: fs.readFileSync(path.join(work, f)), headers: { 'Content-Type': type } });
        if (res.ok) return;
        if (attempt >= 5) throw new Error(`R2 upload failed for ${f}: ${res.status} ${await res.text()}`);
      } catch (e) {
        if (attempt >= 5) throw e;
      }
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }
  };
  await Promise.all(Array.from({ length: 3 }, async () => {
    for (let f; (f = queue.shift());) {
      await put(f);
      process.stdout.write(`\ruploaded ${++done}/${files.length}`);
    }
  }));
  console.log('');

  // 4. Keys + video row (replacing any earlier upload of the same id)
  const { error: vErr } = await db.from('drm_videos').upsert({ id: videoId, title, group_duration: GROUP, segment_duration: SEG, key_count: keys.size });
  if (vErr) throw vErr;
  await db.from('drm_keys').delete().eq('video_id', videoId);
  const { error: kErr } = await db.from('drm_keys').insert([...keys].map(([idx, key]) => ({ video_id: videoId, idx, key: `\\x${key.toString('hex')}` })));
  if (kErr) throw kErr;

  console.log(`\nDone. Set the lesson video to:  drm:${videoId}`);
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
