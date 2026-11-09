// SERVER ONLY: reads DRM_SECRET and R2 credentials.
import { createHmac, timingSafeEqual } from 'crypto';
import { AwsClient } from 'aws4fetch';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/admin';

// tVNDRM running inside the website: Supabase holds sessions + keys, Cloudflare R2 holds
// the encrypted HLS files. Same policy as the old VPS server (DRM STACK/server).

const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);
export const DRM = {
  maxDevices: num(process.env.DRM_MAX_DEVICES, 1),               // concurrent streams per account
  sessionTimeoutMs: num(process.env.DRM_SESSION_TIMEOUT_MS, 45000), // heartbeat grace
  maxViolations: num(process.env.DRM_MAX_VIOLATIONS, 3),
  bindIp: process.env.DRM_BIND_PLAYBACK_IP === 'true',            // off by default: mobile networks change IP mid-lesson
  riskMaxRate: num(process.env.DRM_RISK_MAX_RATE, 2),             // fastest playbackRate offered
  riskBufferS: num(process.env.DRM_RISK_BUFFER_S, 120),           // forward buffer + seeks
};

export const SAFE_ID = /^[a-zA-Z0-9_-]+$/;
export const SAFE_FILE = /^[a-zA-Z0-9_-]+\.(m3u8|ts)$/;

/* ---------- Playback token (HS256 JWT signed with DRM_SECRET) ---------- */

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');

function secret() {
  const s = process.env.DRM_SECRET;
  if (!s) throw new Error('DRM_SECRET is not set');
  return s;
}

export type PlaybackClaims = { typ: 'playback'; sid: string; vid: string; uid: string; ip: string; exp: number };

export function signPlayback(claims: Omit<PlaybackClaims, 'typ' | 'exp'>, ttlSeconds = 6 * 3600) {
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ typ: 'playback', ...claims, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const sig = createHmac('sha256', secret()).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

export function verifyPlayback(token: string | null): PlaybackClaims | null {
  if (!token) return null;
  const [head, body, sig] = token.split('.');
  if (!head || !body || !sig) return null;
  const expected = Buffer.from(createHmac('sha256', secret()).update(`${head}.${body}`).digest('base64url'));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString()) as PlaybackClaims;
    if (claims.typ !== 'playback' || claims.exp < Date.now() / 1000) return null;
    return claims;
  } catch {
    return null;
  }
}

export const clientIp = (req: Request) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';

/* ---------- Cloudflare R2 (S3 API) ---------- */

let r2: AwsClient | null = null;
function r2Client() {
  const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET) {
    throw new Error('R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET are not set');
  }
  r2 ??= new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' });
  return r2;
}
const r2Url = (key: string) =>
  `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${key}`;

export const r2Get = (key: string) => r2Client().fetch(r2Url(key));
export const r2Put = (key: string, body: Uint8Array, type: string) =>
  r2Client().fetch(r2Url(key), { method: 'PUT', body: body as BodyInit, headers: { 'Content-Type': type } });

/** Short-lived signed URL for one encrypted segment (useless without the keys), or a shop file (downloadAs). */
export async function r2SignedUrl(key: string, seconds = 120, downloadAs?: string) {
  const url = new URL(r2Url(key));
  url.searchParams.set('X-Amz-Expires', String(seconds));
  if (downloadAs) url.searchParams.set('response-content-disposition', `attachment; filename="${downloadAs.replace(/"/g, '')}"`);
  const signed = await r2Client().sign(new Request(url), { aws: { signQuery: true } });
  return signed.url;
}

/*
 * Shop file links on our own domain (/api/shop/file). A signed R2 URL breaks as soon as anything
 * adds a query parameter: Facebook's in-app browser appends ?fbclid= to every outbound link, and R2
 * then answers SignatureDoesNotMatch. Our own HMAC only covers k/n/e, so extra parameters are ignored.
 */
const fileSig = (key: string, name: string, exp: number) =>
  createHmac('sha256', secret()).update(`shopfile\n${key}\n${name}\n${exp}`).digest('base64url');

export function shopFileLink(key: string, name: string, seconds: number) {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  const q = new URLSearchParams({ k: key, n: name, e: String(exp), s: fileSig(key, name, exp) });
  return `/api/shop/file?${q}`;
}

export function verifyShopFile(params: URLSearchParams) {
  const key = params.get('k') || '', name = params.get('n') || '', exp = Number(params.get('e'));
  const given = Buffer.from(params.get('s') || '');
  if (!key || !name || !exp || exp < Date.now() / 1000) return null;
  const expected = Buffer.from(fileSig(key, name, exp));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return { key, name };
}

/* ---------- Licence: may this user watch this video? ---------- */

export async function canWatch(admin: SupabaseClient, user: User, videoId: string) {
  if (isAdmin(user.email)) return { ok: true as const };
  const { data: lessons } = await admin.from('lessons').select('course_id, is_free').eq('video_url', `drm:${videoId}`);
  if (!lessons?.length) return { ok: false as const, status: 404, error: 'Không tìm thấy video.' };
  if (lessons.some((l) => l.is_free)) return { ok: true as const };
  const { data: enrolled } = await admin.from('enrollments').select('course_id')
    .eq('user_id', user.id).eq('status', 'active').in('course_id', lessons.map((l) => l.course_id)).limit(1);
  return enrolled?.length ? { ok: true as const } : { ok: false as const, status: 403, error: 'Bạn chưa đăng ký khóa học này.' };
}

/* ---------- Sessions ---------- */

export type DrmSession = {
  id: string; user_id: string; video_id: string; ip: string | null; violations: number;
  revoked: boolean; revoke_reason: string | null; created_at: string; last_seen: string;
};

export const revoke = (admin: SupabaseClient, sid: string, reason: string) =>
  admin.from('drm_sessions').update({ revoked: true, revoke_reason: reason }).eq('id', sid).eq('revoked', false);

export const logViolation = (admin: SupabaseClient, v: { user_id: string; session_id?: string | null; video_id?: string | null; type: string; ip: string }) =>
  admin.from('drm_violations').insert(v);

/**
 * Validates ?pt= and the live session behind it. A copied playlist/segment/key URL dies as soon
 * as the owner's session stops heart-beating or is revoked.
 */
export async function checkPlayback(admin: SupabaseClient, req: Request, videoId: string) {
  const claims = verifyPlayback(new URL(req.url).searchParams.get('pt'));
  if (!claims || claims.vid !== videoId) return { error: 'Invalid or expired playback token', status: 403 } as const;
  if (DRM.bindIp && claims.ip !== clientIp(req)) return { error: 'Token bound to another network', status: 403 } as const;

  const { data: session } = await admin.from('drm_sessions').select('*').eq('id', claims.sid).maybeSingle<DrmSession>();
  if (!session || session.revoked) return { error: session?.revoke_reason || 'Session revoked', status: 409 } as const;
  if (Date.now() - new Date(session.last_seen).getTime() > DRM.sessionTimeoutMs) {
    await revoke(admin, session.id, 'heartbeat_timeout');
    return { error: 'Session expired', status: 409 } as const;
  }
  return { session } as const;
}

/* ---------- Risk engine (download-tool detection) ---------- */

// Seconds of content a real viewer could have consumed since the session opened
const contentBudget = (s: DrmSession) => ((Date.now() - new Date(s.created_at).getTime()) / 1000) * DRM.riskMaxRate + DRM.riskBufferS;

async function overBudget(admin: SupabaseClient, s: DrmSession, kind: 'segment' | 'key', n: number, seconds: number, ip: string) {
  const { data: count } = await admin.rpc('drm_track', { sid: s.id, kind, n });
  // Keys get one group of slack for the group currently buffering
  const fetched = (kind === 'key' ? Math.max(0, Number(count) - 1) : Number(count)) * seconds;
  if (fetched <= contentBudget(s)) return false;
  await logViolation(admin, { user_id: s.user_id, session_id: s.id, video_id: s.video_id, type: `${kind}_rate_exceeded`, ip });
  await revoke(admin, s.id, 'download_tool_suspected');
  return true;
}
export const segmentOverBudget = (admin: SupabaseClient, s: DrmSession, n: number, segSeconds: number, ip: string) =>
  overBudget(admin, s, 'segment', n, segSeconds, ip);
export const keyOverBudget = (admin: SupabaseClient, s: DrmSession, n: number, groupSeconds: number, ip: string) =>
  overBudget(admin, s, 'key', n, groupSeconds, ip);

/** Account-level signals when a session opens: logged, never blocking by themselves. */
export async function sessionStartSignals(admin: SupabaseClient, s: { id: string; user_id: string; video_id: string; device_id: string }, ip: string) {
  const day = new Date(Date.now() - 86400e3).toISOString();
  const hour = new Date(Date.now() - 3600e3).toISOString();
  const [{ data: dev }, { data: ips }, { count: burst }] = await Promise.all([
    admin.from('drm_sessions').select('user_id').eq('device_id', s.device_id).gt('created_at', day),
    admin.from('drm_sessions').select('ip').eq('user_id', s.user_id).gt('created_at', day),
    admin.from('drm_sessions').select('id', { count: 'exact', head: true }).eq('user_id', s.user_id).gt('created_at', hour),
  ]);
  const flags: string[] = [];
  if (new Set(dev?.map((r) => r.user_id)).size >= 3) flags.push('many_accounts_one_device');
  if (new Set(ips?.map((r) => r.ip)).size >= 5) flags.push('ip_hopping');
  if ((burst || 0) >= 20) flags.push('session_burst');
  for (const type of flags) await logViolation(admin, { user_id: s.user_id, session_id: s.id, video_id: s.video_id, type, ip });
}

export const noStore = { 'Cache-Control': 'no-store, no-cache, must-revalidate, private', 'X-Content-Type-Options': 'nosniff' };
