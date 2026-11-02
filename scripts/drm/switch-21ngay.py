"""Point each 21 Ngày lesson at its DRM video once that video is uploaded (drm_videos row exists).
Old YouTube links stay in supabase/data/drm-21ngay-map.local.json; run with --revert to restore them."""
import json, re, sys, urllib.request
env = dict(re.findall(r'^([A-Z0-9_]+)=(.*)$', open('.env.local', encoding='utf-8').read(), re.M))
b, k = env['NEXT_PUBLIC_SUPABASE_URL'].strip(), env['SUPABASE_SERVICE_ROLE_KEY'].strip()
H = {'apikey': k, 'Authorization': f'Bearer {k}', 'Content-Type': 'application/json'}
get = lambda p: json.load(urllib.request.urlopen(urllib.request.Request(f'{b}/rest/v1/{p}', headers=H)))
ready = {v['id'] for v in get('drm_videos?select=id')}
revert = '--revert' in sys.argv
switched = []
for m in json.load(open('supabase/data/drm-21ngay-map.local.json', encoding='utf-8')):
    target = m['youtube'] if revert else f"drm:{m['video_id']}"
    if not revert and m['video_id'] not in ready: continue
    current = get(f"lessons?select=video_url&id=eq.{m['lesson_id']}")[0]['video_url']
    if current == target: continue
    urllib.request.urlopen(urllib.request.Request(f"{b}/rest/v1/lessons?id=eq.{m['lesson_id']}", data=json.dumps({'video_url': target}).encode(), method='PATCH', headers=H))
    switched.append(m['n'])
print(('reverted' if revert else 'switched'), switched, '| uploaded:', len(ready & {m['video_id'] for m in json.load(open('supabase/data/drm-21ngay-map.local.json', encoding='utf-8'))}), '/ 35')
