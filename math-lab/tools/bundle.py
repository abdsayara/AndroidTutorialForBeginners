"""يبني نسخة من ملف واحد (dist/math-lab.html) لمشاركتها: يدمج CSS و JS، ويحمّل KaTeX من cdnjs.
الاستخدام: python3 tools/bundle.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')

css = (root / 'css/app.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/app.css">', '<style>\n' + css + '\n</style>')

katex_cdn = ('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">\n'
             '  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>')
html = re.sub(r'<!--KATEX-START-->.*?<!--KATEX-END-->', katex_cdn, html, flags=re.S)

def inline(m):
    srcs = re.findall(r'<script src="([^"]+)"></script>', m.group(0))
    code = '\n'.join((root / s).read_text(encoding='utf-8').replace('</script', '<\\/script') for s in srcs)
    return '<script>\n' + code + '\n</script>'
html = re.sub(r'<!--BUNDLE-START-->.*?<!--BUNDLE-END-->', inline, html, flags=re.S)

out = root / 'dist' / 'math-lab.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out, f'{out.stat().st_size / 1024:.0f} KB')

# نسخة Artifact: بلا غلاف html/head/body، و CSS الخاص بـ KaTeX مضمّن مع خطوطه (data URIs)
import base64, sys
if '--artifact' in sys.argv:
    kcss = (root / 'vendor/katex/katex.min.css').read_text(encoding='utf-8')
    def font(m):
        f = root / 'vendor/katex' / m.group(1)
        return 'url(data:font/woff2;base64,' + base64.b64encode(f.read_bytes()).decode() + ') format("woff2")'
    kcss = re.sub(r'url\((fonts/[^)]+\.woff2)\) format\("woff2"\)', font, kcss)
    kcss = re.sub(r',url\(fonts/[^)]+\.(woff|ttf)\) format\("(woff|truetype)"\)', '', kcss)
    a = html.replace('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">', '<style>' + kcss + '</style>')
    a = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>', '', a)
    a = re.sub(r'<meta charset="utf-8">\s*<meta name="viewport"[^>]*>', '', a)
    a = a.replace('</head>', '').replace('<body>', '').replace('</body>', '').replace('</html>', '')
    a = a.replace('<div id="app"></div>', '<div id="app" dir="rtl" lang="ar"></div>')
    o2 = root / 'dist' / 'math-lab-artifact.html'
    o2.write_text(a.strip() + '\n', encoding='utf-8')
    print(o2, f'{o2.stat().st_size / 1024:.0f} KB')
