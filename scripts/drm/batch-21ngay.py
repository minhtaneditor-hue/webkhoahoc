"""Encrypt + upload every lesson in supabase/data/drm-21ngay-map.local.json (skips ids already in drm_videos)."""
import json, re, subprocess, sys, urllib.request
env = dict(re.findall(r'^([A-Z0-9_]+)=(.*)$', open('.env.local', encoding='utf-8').read(), re.M))
b, k = env['NEXT_PUBLIC_SUPABASE_URL'].strip(), env['SUPABASE_SERVICE_ROLE_KEY'].strip()
done = {v['id'] for v in json.load(urllib.request.urlopen(urllib.request.Request(f"{b}/rest/v1/drm_videos?select=id", headers={'apikey': k, 'Authorization': f'Bearer {k}'})))}
for m in json.load(open('supabase/data/drm-21ngay-map.local.json', encoding='utf-8')):
    if m['video_id'] in done:
        print('skip', m['video_id'], flush=True); continue
    print('==>', m['video_id'], m['title'], flush=True)
    r = subprocess.run(['node', 'scripts/drm/encrypt-upload.mjs', m['file'], m['video_id'], '--title', m['title']], capture_output=True, text=True, encoding='utf-8')
    print('   ', 'OK' if r.returncode == 0 else 'FAILED\n' + r.stderr[-800:], flush=True)
