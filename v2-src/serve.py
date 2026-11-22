#!/usr/bin/env python3
"""Local preview server for the Shop Row redesign.

Serves the repo root, with one change: opening the bare address (/) lands on the newest redesign
(/v3/ once it is built, otherwise /v2/), so the preview never opens on the live design by mistake.
The live design is at /?live=1.

  python3 -I v2-src/serve.py [port]     (default 8872)
"""
import os, sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/', '/index.html'):
            # the newest redesign that has been built wins
            target = '/v3/' if os.path.exists(os.path.join(ROOT, 'v3', 'index.html')) else '/v2/'
            self.send_response(302)
            self.send_header('Location', target)
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        # a preview should never show a stale stylesheet
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8872
    ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=ROOT)).serve_forever()
