#!/usr/bin/env python3
"""Self-contained, loopback-only server for this website review bundle."""
from __future__ import annotations
import argparse
import json
import threading
import urllib.request
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, manifest=None, **kwargs):
        self.manifest = manifest
        self.allowed = set(manifest['files'])
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('X-Robots-Tag', 'noindex, nofollow, noarchive')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        # Copies are local-only. Navigation to external destinations remains an explicit click.
        self.send_header('Content-Security-Policy', "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src 'self' 'unsafe-inline' data: blob:; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'self' data: blob:; object-src 'none'")
        super().end_headers()

    def safe_path(self):
        raw = unquote(urlsplit(self.path).path)
        parts = PurePosixPath(raw).parts
        if '\\' in raw or any(p in {'.', '..'} or (p.startswith('.') and p != '/') for p in parts):
            return None
        rel = raw.lstrip('/')
        if not rel or rel.endswith('/'):
            rel += 'index.html'
        path = (ROOT / rel).resolve()
        if not path.is_relative_to(ROOT) or rel not in self.allowed:
            return None
        return rel

    def do_GET(self):
        if urlsplit(self.path).path == '/__health':
            data = json.dumps({'bundle_id': self.manifest['bundle_id'], 'files': len(self.allowed), 'bind': '127.0.0.1', 'port': self.server.server_port}).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data)
            return
        if urlsplit(self.path).path == '/favicon.ico':
            self.path = '/favicon.png'
        rel = self.safe_path()
        if rel is None:
            self.send_error(404); return
        self.path = '/' + rel
        super().do_GET()

    def do_HEAD(self):
        if self.safe_path() is None:
            self.send_error(404); return
        super().do_HEAD()

    def do_POST(self):
        origin = self.headers.get('Origin')
        allowed_origin = f'http://127.0.0.1:{self.server.server_port}'
        if self.path != '/__shutdown' or self.headers.get('X-Local-Review') != 'stop' or origin not in {None, allowed_origin}:
            self.send_error(403); return
        self.send_response(200); self.send_header('Content-Length', '0'); self.end_headers()
        threading.Thread(target=self.server.shutdown, daemon=True).start()

    def log_message(self, *args):
        pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4190)
    parser.add_argument('--open', action='store_true')
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    for port in range(args.port, args.port + 10):
        url = f'http://127.0.0.1:{port}/'
        try:
            server = ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, manifest=manifest))
            break
        except OSError:
            try:
                with urllib.request.urlopen(url + '__health', timeout=1) as response:
                    active = json.load(response)
                if active.get('bundle_id') == manifest['bundle_id']:
                    print(url, flush=True)
                    if args.open: webbrowser.open(url)
                    return
            except (OSError, ValueError):
                pass
    else:
        raise SystemExit('No available loopback port in the requested range.')
    print('StarRiver Arts local review: ' + url, flush=True)
    print('Stop using the review page button or Ctrl+C in this window.', flush=True)
    if args.open:
        threading.Timer(.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
