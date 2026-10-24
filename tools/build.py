# Render the design's .dc.html pages to static HTML for brodbandproductions.com
import re, json, subprocess, html, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from assets import copy_all

import tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'design') + '/'      # canvas pages (.dc.html)
OUT = os.path.join(ROOT, 'public') + '/'      # the website Netlify publishes
TMP = tempfile.gettempdir() + '/'
SITE = 'https://brodbandproductions.com'

PAGES = [
    # dc file, output, path, nav label, title, description, page script
    ('Main', 'index.html', '/', 'Featured', 'brodband productions · music and video production',
     'brodband productions is a creative hub in Alberta, Canada for original music, live sessions and animated music videos, made together with artists and musicians.', None),
    ('AIVideos', 'animated.html', '/animated', 'Animated', 'Animated · brodband productions',
     'Original songs brought to life in AI-animated music videos by brodband productions: Always, Day Dream, Move On, Rain and Steady State.', None),
    ('Loopers', 'improvised.html', '/improvised', 'Improvised', 'Improvised · Casual Loopers · brodband productions',
     'Casual Loopers: music composed in the moment. Live improvised sessions with drums, guitar, keys and loops, recorded in one take.', 'improvised.js'),
    ('Collabs', 'collaborated.html', '/collaborated', 'Collaborated', 'Collaborated · brodband productions',
     'Music made, recorded and shared with artists and musicians: live performance, audio recording and video production by brodband productions.', None),
    ('About', 'formulated.html', '/formulated', 'Formulated', 'Formulated · brodband productions',
     'Bring an idea to brodband productions: songwriting and co-writing, full arrangements, recording and production, filmed live sessions and animated music videos.', 'formulated.js'),
    ('Connect', 'connected.html', '/connected', 'Connected', 'Connected · brodband productions',
     'Get in touch with brodband productions about music projects, songwriting, arrangements, recording and video production.', 'connected.js'),
]
LINKS = {p[0] + '.dc.html': p[2] for p in PAGES}

STUB = '''var window={scrollY:0,innerHeight:800,addEventListener:function(){},scrollTo:function(){}};var history={};var location={hash:''};var document={documentElement:{scrollHeight:3000}};
class DCLogic{constructor(p){this.props=p}setState(o){Object.assign(this.state,o)}};'''

def vals_for(script):
    js = STUB + script + ''';var c=new Component({});var v=c.renderVals();
process.stdout.write(JSON.stringify(v,function(k,x){return typeof x==='function'?undefined:x}));'''
    open(TMP + 'bb_vals.js', 'w').write(js)
    return json.loads(subprocess.check_output(['node', TMP + 'bb_vals.js']))

def lookup(scope, expr):
    expr = expr.strip()
    if expr in ('true', 'false'):
        return expr == 'true'
    cur = scope
    for part in expr.split('.'):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur

HOLE = re.compile(r'\{\{\s*([^}]+?)\s*\}\}')

def fill(text, scope):
    def rep(m):
        v = lookup(scope, m.group(1))
        if v is None or v is True or v is False:
            return ''
        return html.escape(str(v), quote=True)
    return HOLE.sub(rep, text)

TOK = re.compile(r'<sc-(for|if)\b([^>]*)>|</sc-(for|if)>')

def parse(src):
    root = []; stack = [root]; pos = 0
    for m in TOK.finditer(src):
        stack[-1].append(src[pos:m.start()]); pos = m.end()
        if m.group(1):
            node = {'kind': m.group(1), 'attrs': m.group(2), 'body': []}
            stack[-1].append(node); stack.append(node['body'])
        else:
            stack.pop()
    stack[-1].append(src[pos:])
    return root

def attr(attrs, name):
    m = re.search(name + r'="([^"]*)"', attrs)
    return m.group(1) if m else None

def render(nodes, scope):
    out = []
    for n in nodes:
        if isinstance(n, str):
            out.append(fill(n, scope))
        elif n['kind'] == 'for':
            lst = lookup(scope, HOLE.search(attr(n['attrs'], 'list')).group(1)) or []
            name = attr(n['attrs'], 'as')
            for item in lst:
                s = dict(scope); s[name] = item
                out.append(render(n['body'], s))
        else:
            v = lookup(scope, HOLE.search(attr(n['attrs'], 'value')).group(1))
            if v:
                out.append(render(n['body'], scope))
    return ''.join(out)

def build_page(dc, out, path, label, title, desc, pagejs, blobmap):
    t = open(SRC + dc + '.dc.html').read()
    helmet = t[t.index('<helmet>') + 8:t.index('</helmet>')]
    css = re.search(r'<style>([\s\S]*?)</style>', helmet).group(1)
    body = t[t.index('</helmet>') + 9:t.index('</x-dc>')]
    script = re.search(r'<script type="text/x-dc"[^>]*>([\s\S]*?)</script>', t).group(1)
    v = vals_for(script)
    # force-render toggled blocks; scripts hide them again
    v['menuOpen'] = True
    if dc == 'Connect':
        v['showForm'] = True; v['showThanks'] = True
    if dc == 'Loopers':
        v['noneShown'] = True
    # event handler attributes are replaced by plain scripts
    body = re.sub(r'\s(on[A-Z][a-zA-Z]+)="\{\{[^}]*\}\}"', '', body)
    body = re.sub(r'\shint-placeholder-[a-z]+="[^"]*"', '', body)
    html_body = render(parse(body), v)
    # links between pages
    for k, p in LINKS.items():
        html_body = html_body.replace('href="' + k + '"', 'href="' + p + '"')
    # menu: closed by default
    html_body = html_body.replace('id="bb-mobile-menu" class="bb-mobile"', 'id="bb-mobile-menu" class="bb-mobile" hidden')
    html_body = html_body.replace('aria-expanded="true" aria-controls="bb-mobile-menu">Close</button>',
                                  'aria-expanded="false" aria-controls="bb-mobile-menu">Menu</button>')
    html_body = html_body.replace('<button type="button" class="bb-mbtn"', '<button type="button" class="bb-mbtn" data-menu-toggle')
    # strip leftover empty class slots
    html_body = re.sub(r'class="([^"]*?)\s+"', r'class="\1"', html_body)
    page = TEMPLATE.format(title=html.escape(title), desc=html.escape(desc, quote=True), url=SITE + path,
                           css=css + EXTRA_CSS, body=html_body.strip(),
                           pagejs=('<script src="/js/%s" defer></script>\n' % pagejs) if pagejs else '')
    for bid, p in blobmap.items():
        page = page.replace('/_blob/' + bid, p)
    page = POST.get(dc, lambda s: s)(page)
    assert '_blob' not in page, (dc, re.findall(r'_blob/\w+', page)[:3])
    assert '{{' not in page, (dc, page[page.index('{{') - 80:page.index('{{') + 40])
    open(OUT + out, 'w').write(page)
    return v

EXTRA_CSS = '''
/* site build additions */
.bb-mobile[hidden]{display:none !important}
.bb-yt{position:relative;aspect-ratio:16 / 9;width:100%;background:#000}
.bb-yt iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
a[data-yt]{cursor:pointer}
'''

TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="brodband productions">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://brodbandproductions.com/images/social-share.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B0B0B">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@400&amp;display=swap">
<style>{css}</style>
</head>
<body>
{body}
<script src="/js/site.js" defer></script>
{pagejs}</body>
</html>
'''

def post_connect(p):
    p = p.replace('<form class="bb-form">',
        '<form class="bb-form" name="contact" method="POST" action="/thank-you" data-netlify="true" netlify-honeypot="bot-field">\n'
        '<input type="hidden" name="form-name" value="contact">\n'
        '<p class="bb-hp" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>')
    p = p.replace('<div role="status" style="border: 1.5px solid #F2EDE0;', '<div role="status" data-thanks hidden style="border: 1.5px solid #F2EDE0;')
    p = p.replace('This is a preview of the confirmation. On the live site the message is delivered to your inbox.',
                  'Your message is on its way. Expect a reply soon.')
    p = p.replace('thanks for reaching out.', 'thanks for reaching out')
    p = p.replace('<button type="button" class="bb-b3">Back to the form</button>', '<button type="button" class="bb-b3" data-again>Send another message</button>')
    p = p.replace('</style>', '.bb-hp{position:absolute;left:-9999px}\nform[hidden]{display:none !important}\n[data-thanks][hidden]{display:none !important}\n</style>', 1)
    return p

def post_loopers(p):
    a = '<div style="padding: 28px 0; color: #A9A6A6; border-bottom: 1px solid #3A3936">No trio'
    assert p.count(a) == 1
    return p.replace(a, '<div data-log-empty hidden style="padding: 28px 0; color: #A9A6A6; border-bottom: 1px solid #3A3936">No trio')

POST = {'Connect': post_connect, 'Loopers': post_loopers}

def extra_pages():
    base = open(OUT + 'connected.html').read()
    head, rest = base.split('<section class="bb-wrap bb-ph">', 1)
    foot = rest[rest.index('<footer'):]
    head = head.replace(' class="bb-nl bb-nl-on" aria-current="page"', ' class="bb-nl"').replace('class="bb-ml bb-ml-on"', 'class="bb-ml"')
    def page(fname, title, h1, text, extra='', plate=''):
        h = head.replace('<title>Connected · brodband productions</title>', '<title>%s</title>' % title)
        h = h.replace('<script src="/js/connected.js" defer></script>', '')
        body = ('<section class="bb-wrap bb-ph" style="min-height: 46vh">\n<h1 class="bb-h bb-pt">%s</h1>\n'
                '<div class="bb-dbl" aria-hidden="true"></div>\n<p class="bb-pd">%s</p>\n%s'
                '<div style="display: flex; gap: 14px; flex-wrap: wrap; padding-top: 8px"><a href="/" class="bb-b1">Back to featured</a>%s</div>\n</section>\n\n') % (h1, text, plate, extra)
        f = foot.replace('<script src="/js/connected.js" defer></script>\n', '')
        out = h + body + f
        if fname == '404.html':
            out = out.replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"')
        open(OUT + fname, 'w').write(out)
    page('thank-you.html', 'Thank you · brodband productions', 'thanks for reaching out',
         'Your message is on its way. Expect a reply soon.')
    page('404.html', 'Page not found · brodband productions', 'this page is off the map',
         'The page you were looking for has moved or never existed.',
         plate='<div class="bb-plate"><div class="bb-plate-img" role="img" aria-label="Engraving of a compass on a star chart with its needle spinning" style="background-image: url(/images/plates/not-found.jpg)"></div></div>\n')


if __name__ == '__main__':
    blobmap = copy_all()
    for pg in PAGES:
        v = build_page(*pg, blobmap)
        if pg[0] == 'Loopers':
            pass
        if pg[0] == 'About':
            pass
        print('built', pg[1])
    extra_pages()

