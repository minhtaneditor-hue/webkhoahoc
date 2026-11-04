# Builds the free "Bộ 75 Skill Edit Video" PDF from the blog post's text: a clickable catalogue.
# It only links to each repo on GitHub and copies no repo's files, so every author's licence stays theirs.
# Usage: python scripts/make-skill-pack.py <post.json> <out.pdf>   (post.json = the blog_posts row)
import html
import json
import pathlib
import re
import subprocess
import sys
import tempfile

post_path, out_path = sys.argv[1:3]
post = json.load(open(post_path, encoding='utf-8'))
content = post['content']
root = pathlib.Path(__file__).resolve().parent.parent
fonts = (root / 'src/assets/fonts').as_uri()
mark = (root / 'public/brand/tan-va-mark.png').as_uri()

section = content[content.index('## Danh sách 75 repo'):content.index('## Ai nên dùng')]
groups = []
for line in section.splitlines():
    m = re.match(r'### \d+\. (.+)', line)
    if m:
        groups.append({'name': m.group(1), 'repos': []})
    m = re.match(r'- \[(.+?)\]\((https://github\.com/[^)]+)\): (.+)', line)
    if m:
        groups[-1]['repos'].append(dict(zip(('name', 'url', 'desc'), m.groups())))
total = sum(len(g['repos']) for g in groups)
assert total == 75 and len(groups) == 8, (total, len(groups))

chooser = re.search(r'!\[[^\]]*\]\((https://[^)]*chon-skill-theo-nhu-cau[^)]*)\)', content).group(1)
checks = re.findall(r'^- \*\*(.+?):\*\* (.+)$', content[content.index('## Kiểm tra gì'):content.index('## Danh sách 75 repo')], re.M)
plain = lambda s: re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)
e = html.escape

toc = ''.join(f'<li><a href="#g{i}"><span>{i}</span>{e(g["name"])}<em>{len(g["repos"])} repo</em></a></li>' for i, g in enumerate(groups, 1))
check_rows = ''.join(f'<li><strong>{e(a)}.</strong> {e(plain(b))}</li>' for a, b in checks)
group_html = ''
for i, g in enumerate(groups, 1):
    cards = ''.join(
        f'<li><a class="name" href="{e(r["url"])}">{e(r["name"])}</a><p>{e(r["desc"])}</p>'
        f'<a class="url" href="{e(r["url"])}">{e(r["url"].replace("https://", ""))}</a></li>' for r in g['repos'])
    group_html += f'<section id="g{i}"><h2><span>{i}</span>{e(g["name"])}<em>{len(g["repos"])} repo</em></h2><ul class="repos">{cards}</ul></section>'

doc = f"""<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Bộ 75 Skill Edit Video cho AI Agent · TẤN VA</title><style>
@font-face {{ font-family: BVP; font-weight: 500; src: url('{fonts}/BeVietnamPro-Medium.ttf'); }}
@font-face {{ font-family: BVP; font-weight: 700; src: url('{fonts}/BeVietnamPro-Bold.ttf'); }}
@font-face {{ font-family: BVP; font-weight: 800; src: url('{fonts}/BeVietnamPro-ExtraBold.ttf'); }}
@page {{ size: A4; margin: 16mm 15mm 16mm; }}
@page :first {{ margin: 0; }}
* {{ box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }}
body {{ margin: 0; font: 500 10.5pt/1.55 BVP, sans-serif; color: #1F1C1B; }}
a {{ color: inherit; text-decoration: none; }}
.cover {{ width: 210mm; height: 297mm; padding: 22mm 20mm 20mm; color: #F5F0E9; display: flex; flex-direction: column; break-after: page;
  background: radial-gradient(circle at 85% 12%, #7A2B2F 0%, #5A1F25 38%, #242321 92%); position: relative; overflow: hidden; }}
.cover .wm {{ position: absolute; right: -36mm; bottom: -26mm; width: 170mm; opacity: .1; }}
.brand {{ display: flex; align-items: center; gap: 3mm; font-size: 17pt; font-weight: 800; }}
.brand img {{ width: 11mm; }} .brand b {{ color: #E8956B; font-weight: 800; }}
.cover .mid {{ margin-top: auto; margin-bottom: auto; position: relative; }}
.pill {{ display: inline-block; background: #E8956B; color: #242321; font-weight: 700; font-size: 10pt; letter-spacing: .08em; padding: 1.4mm 4mm; border-radius: 99px; }}
.cover h1 {{ font-size: 50pt; line-height: 1.06; font-weight: 800; letter-spacing: -.02em; margin: 7mm 0 0; }}
.cover h1 b {{ color: #E8956B; font-weight: 800; }}
.cover .sub {{ font-size: 14pt; color: #DDC3A7; margin: 7mm 0 0; max-width: 140mm; line-height: 1.45; }}
.stats {{ display: flex; gap: 10mm; margin-top: 13mm; }}
.stats strong {{ display: block; font-size: 30pt; line-height: 1; font-weight: 800; color: #E8956B; }}
.stats span {{ font-size: 10pt; color: #DDC3A7; }}
.cover .foot {{ position: relative; font-weight: 700; color: #E8956B; font-size: 11pt; }}
h2 {{ font-size: 19pt; line-height: 1.25; font-weight: 800; margin: 0 0 4mm; color: #1F1C1B; break-after: avoid; }}
h3 {{ font-size: 14pt; font-weight: 800; margin: 8mm 0 2.5mm; break-after: avoid; }}
.toc {{ list-style: none; margin: 0; padding: 0; columns: 2; column-gap: 8mm; }}
.toc li {{ break-inside: avoid; border-bottom: .3mm solid #E6DCD0; }}
.toc a {{ display: flex; align-items: center; gap: 3mm; padding: 2mm 0; font-weight: 700; }}
.toc span {{ color: #A84E3C; font-weight: 800; width: 5mm; }} .toc em {{ margin-left: auto; font-style: normal; font-weight: 500; font-size: 9pt; color: #6A5A53; white-space: nowrap; }}
.note {{ background: #F1E2D2; border-radius: 3mm; padding: 4mm 5mm; margin-top: 5mm; }}
.chooser {{ width: 56%; border-radius: 3mm; margin: 3mm auto 0; display: block; }}
.checks {{ margin: 0; padding-left: 4.5mm; }} .checks li {{ margin-bottom: 1.8mm; }}
.intro {{ break-after: page; }}
section {{ margin-bottom: 9mm; }}
section h2 {{ display: flex; align-items: baseline; gap: 3mm; padding-bottom: 2.5mm; border-bottom: .6mm solid #A84E3C; }}
section h2 span {{ color: #A84E3C; }} section h2 em {{ margin-left: auto; font-style: normal; font-size: 10pt; font-weight: 500; color: #6A5A53; }}
.repos {{ list-style: none; margin: 0; padding: 0; }}
.repos li {{ break-inside: avoid; padding: 2.6mm 0; border-bottom: .25mm solid #E6DCD0; }}
.repos .name {{ font-weight: 800; font-size: 11pt; color: #5A1F25; }}
.repos p {{ margin: .5mm 0 .5mm; }}
.repos .url {{ font-size: 8.5pt; color: #A84E3C; word-break: break-all; }}
.end {{ break-inside: avoid; background: radial-gradient(circle at 85% 15%, #5A1F25, #242321 80%); color: #F5F0E9; border-radius: 4mm; padding: 8mm; }}
.end h2 {{ color: #F5F0E9; }} .end p {{ margin: 0 0 3mm; color: #DDC3A7; }} .end a {{ color: #E8956B; font-weight: 700; }}
.small {{ font-size: 8.5pt; color: #6A5A53; margin: 0 0 4mm; break-inside: avoid; }}
</style></head><body>
<div class="cover">
  <img class="wm" src="{mark}" alt="">
  <div class="brand"><img src="{mark}" alt=""><span>TẤN <b>VA</b></span></div>
  <div class="mid">
    <span class="pill">SKILL CHO AI AGENT</span>
    <h1>Bộ {total} Skill<br><b>Edit Video</b></h1>
    <p class="sub">Danh sách repo chia theo từng loại video, từ clip bán hàng, video giải thích tới dựng từ cảnh quay có sẵn.</p>
    <div class="stats"><div><strong>{total}</strong><span>repo trên GitHub</span></div><div><strong>{len(groups)}</strong><span>nhóm theo nhu cầu</span></div></div>
  </div>
  <div class="foot">minhtanacademy.com</div>
</div>
<div class="intro">
  <h2>Trong bộ này</h2>
  <ul class="toc">{toc}</ul>
  <div class="note"><strong>Chọn nhanh:</strong> có sẵn cảnh quay thì xem nhóm 6. Cần video từ một link hay một ý tưởng thì xem nhóm 1 và 2. Muốn hiệu ứng riêng thì xem nhóm 4.</div>
  <h3>Nên chọn theo nguyên liệu bạn đang có</h3>
  <img class="chooser" src="{chooser}" alt="Bảng gợi ý chọn skill edit video theo nguyên liệu đang có">
  <h3>Kiểm tra trước khi cài</h3>
  <ul class="checks">{check_rows}</ul>
</div>
{group_html}
<p class="small">Danh sách tổng hợp ngày 4/11/2026. Mô tả được tóm từ README của từng repo, không phải kết quả chạy thử đủ cả {total} repo. Mỗi repo thuộc về tác giả của nó và có giấy phép riêng; bộ này chỉ dẫn link, không kèm file của repo. Hãy đọc kỹ repo bạn chọn trước khi cài.</p>
<div class="end">
  <h2>Muốn học bài bản hơn?</h2>
  <p>Skill làm nhanh hơn, nhưng bạn vẫn là người quyết định cắt gì và giữ gì. Xem các khóa học làm video bằng điện thoại cùng Minh Tấn, có bài học thử miễn phí.</p>
  <a href="https://www.minhtanacademy.com/courses">minhtanacademy.com/courses</a>
</div>
</body></html>"""

with tempfile.TemporaryDirectory() as tmp:
    page = pathlib.Path(tmp) / 'pack.html'
    page.write_text(doc, encoding='utf-8')
    chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    subprocess.run([chrome, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files', '--virtual-time-budget=8000',
                    f'--user-data-dir={tmp}\\profile', f'--print-to-pdf={pathlib.Path(out_path).resolve()}', page.as_uri()], check=True, capture_output=True)
print('saved', out_path, total, 'repos', len(groups), 'groups')
