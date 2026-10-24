import http.server, os, sys
import os
ROOT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'public')
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=ROOT,**k)
    def translate_path(s,path):
        p=path.split('?')[0]
        if p!='/' and '.' not in os.path.basename(p) and os.path.exists(ROOT+p+'.html'): path=p+'.html'
        return super().translate_path(path)
    def do_POST(s):
        n=int(s.headers.get('Content-Length',0)); s.rfile.read(n); s.send_response(200); s.end_headers(); s.wfile.write(b'ok')
    def log_message(s,*a): pass
http.server.ThreadingHTTPServer(('127.0.0.1',8765),H).serve_forever()
