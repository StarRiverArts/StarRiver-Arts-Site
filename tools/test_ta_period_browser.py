"""Offline TA period/browser regression using installed Edge and websockets.

The fixture is served from memory, never written into public data. HTTP and CDP
bind only to loopback. A fresh temporary profile is removed after Edge stops.
"""
import argparse
import functools
import json
import subprocess
import tempfile
import threading
import time
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlencode, urlsplit

from websockets.sync.client import connect

ROOT = Path(__file__).resolve().parents[1]
TA = "/play/RacingClub/TimeAttack/"
WORLD = "pt_ych_starriver_arts"
EDGE = Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")


def fixture():
    manifest = json.loads((ROOT / TA.lstrip('/') / 'data/manifest.json').read_text(encoding='utf-8'))
    tracks = json.loads((ROOT / TA.lstrip('/') / 'data/tracks.json').read_text(encoding='utf-8'))
    manifest['routes']['leaderboard_periods'] = 'leaderboard-periods.json'
    scopes = []
    for board in tracks['boards']:
        if board['track_world_code'] != WORLD:
            continue
        for route in board['routes']:
            code = route['route_code']
            old, new = f'{code}-old', f'{code}-new'
            periods = [dict(period_id=old, index_code='beta', label='YCH beta 測試期紀錄榜', ruleset_id='original',
                            starts_at_utc=None, ends_at_utc='2026-10-22T04:00:00Z', archive_href='data/history/qa/index.html'),
                       dict(period_id=new, index_code='current', label='目前榜期', ruleset_id='original',
                            starts_at_utc='2026-10-22T04:00:00Z', ends_at_utc=None),
                       dict(period_id=f'{code}-empty', index_code='empty', label='空白測試期', ruleset_id='original',
                            starts_at_utc='2027-01-01T00:00:00Z', ends_at_utc=None)]
            memberships = [dict(record_id=row['record_id'], period_id=old if i == 0 else new)
                           for i, row in enumerate(route['route_rows'])]
            scopes.append(dict(track_world_code=WORLD, route_code=code, current_period_id=new,
                               periods=periods, records=memberships))
    return {TA+'data/manifest.json': manifest, TA+'data/tracks.json': tracks,
            TA+'data/leaderboard-periods.json': dict(scopes=scopes)}


class Handler(SimpleHTTPRequestHandler):
    overlay = {}

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if path == '/__health':
            self.send_response(200); self.end_headers(); self.wfile.write(b'OK'); return
        parts = Path(path).parts
        if any(p.startswith('.') for p in parts) or path.startswith(('/docs/', '/tools/')):
            self.send_error(404); return
        if path in self.overlay:
            body = json.dumps(self.overlay[path], ensure_ascii=False).encode('utf-8')
            self.send_response(200); self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        if self.overlay and path == TA+'data/history/qa/index.html':
            self.send_response(200); self.end_headers(); self.wfile.write(b'<h1>QA archive</h1>'); return
        if Path(path).suffix.lower() not in {'.html','.js','.css','.json','.svg','.png','.jpg','.jpeg','.webp','.ico','.woff','.woff2','.ttf','.csv','.txt'} and not path.endswith('/'):
            self.send_error(404); return
        super().do_GET()

    def list_directory(self, path):
        self.send_error(404)

    def log_message(self, *args):
        pass


class CDP:
    def __init__(self, ws):
        self.ws, self.seq, self.errors, self.session = ws, 0, [], None

    def send(self, method, params=None):
        self.seq += 1
        seq = self.seq
        command = dict(id=seq, method=method, params=params or {})
        if self.session and method != 'Browser.close':
            command['sessionId'] = self.session
        self.ws.send(json.dumps(command))
        while True:
            message = json.loads(self.ws.recv(timeout=20))
            if message.get('method') == 'Fetch.requestPaused':
                request = message['params']; url = request['request']['url']
                self.seq += 1
                local = url.startswith(('http://127.0.0.1:', 'data:'))
                self.ws.send(json.dumps(dict(id=self.seq, sessionId=self.session, method='Fetch.continueRequest' if local else 'Fetch.fulfillRequest',
                    params=dict(requestId=request['requestId']) if local else dict(requestId=request['requestId'], responseCode=200, body=''))))
            if message.get('method') == 'Runtime.exceptionThrown':
                self.errors.append(message['params']['exceptionDetails'].get('text', 'JS exception'))
            if message.get('id') == seq:
                if 'error' in message:
                    raise RuntimeError(message['error'])
                return message.get('result', {})

    def evaluate(self, expression):
        result = self.send('Runtime.evaluate', dict(expression=expression, returnByValue=True, awaitPromise=True))
        if result.get('exceptionDetails'):
            raise RuntimeError(result['exceptionDetails'])
        return result.get('result', {}).get('value')


def run(output, use_fixture, world_code=WORLD, route_code='FCIB'):
    results = []
    overview_results = []
    platform_results = []
    switcher_results = []
    archive_results = []
    if use_fixture and (world_code != WORLD or route_code != 'FCIB'):
        raise ValueError('The fixture covers the default YCH/FCIB scope only')
    Handler.overlay = fixture() if use_fixture else {}
    def data_file(name):
        return Handler.overlay.get(TA+'data/'+name) or json.loads((ROOT/TA.lstrip('/')/'data'/name).read_text(encoding='utf-8'))
    period_data = data_file('leaderboard-periods.json')
    track_data = data_file('tracks.json')
    popularity = data_file('summary.json')['popularity_chart']
    expected_popularity = [dict(code=t['code'], count=t['count']) for t in popularity['tracks'][:20]]
    world = next(b for b in track_data['boards'] if b['track_world_code'] == world_code)
    scopes = {s['route_code']:s for s in period_data['scopes'] if s['track_world_code'] == world_code}
    assert route_code in scopes, 'Real-data validation requires configured periods for the selected scope'
    historical = next(p['index_code'] for p in scopes[route_code]['periods'] if p.get('ends_at_utc'))
    def expected_rows(route, requested):
        scope = scopes.get(route['route_code'])
        if not scope:
            return route['route_rows'] if requested in ['latest','all'] else []
        current = next(p for p in scope['periods'] if p['period_id'] == scope['current_period_id'])
        selected = next((p for p in scope['periods'] if requested in [p['period_id'],p['index_code']]), None)
        if requested == 'latest': selected = current
        allowed_periods = {p['period_id'] for p in scope['periods'] if p['ruleset_id'] == current['ruleset_id']} if requested == 'all' else {selected['period_id']} if selected else set()
        unresolved_comparable = requested == 'all' and bool(current.get('ruleset_id')) and all(p.get('ruleset_id') == current['ruleset_id'] for p in scope['periods'])
        allowed = {r['record_id'] for r in scope['records'] if r['period_id'] in allowed_periods or (r.get('period_id') is None and unresolved_comparable)}
        return sorted((r for r in route['route_rows'] if r['record_id'] in allowed),key=lambda r:(r['lap_time_ms'],r.get('record_date',''),r['record_id']))
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    with urllib.request.urlopen(base+'/__health', timeout=5) as response:
        assert response.status == 200
    for scope in period_data['scopes']:
        for period in scope['periods']:
            archive = period.get('archive_href')
            if not archive:
                continue
            assert archive.startswith('data/history/') and '..' not in archive.split('/'), archive
            with urllib.request.urlopen(base+TA+archive, timeout=5) as response:
                assert response.status == 200
                archive_results.append(dict(world=scope['track_world_code'],route=scope['route_code'],
                    period=period['period_id'],href=archive,status=response.status))
    with tempfile.TemporaryDirectory(prefix='ta-browser-', dir=output.parent) as profile:
        process = subprocess.Popen([str(EDGE), '--headless=new', '--disable-gpu', '--no-first-run',
            '--disable-background-networking', '--disable-component-update', '--disable-sync',
            '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', f'--user-data-dir={profile}', 'about:blank'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            active = Path(profile)/'DevToolsActivePort'
            for _ in range(150):
                if active.exists(): break
                time.sleep(.1)
            port = int(active.read_text().splitlines()[0])
            browser_url = f'ws://127.0.0.1:{port}'+active.read_text().splitlines()[1]
            with connect(browser_url, proxy=None, max_size=16*1024*1024) as ws:
                cdp = CDP(ws)
                target = cdp.send('Target.createTarget', dict(url='about:blank'))['targetId']
                cdp.session = cdp.send('Target.attachToTarget', dict(targetId=target, flatten=True))['sessionId']
                for domain in ['Page.enable', 'Runtime.enable', 'Network.enable']:
                    cdp.send(domain)
                cdp.send('Fetch.enable', dict(patterns=[dict(urlPattern='*')]))
                states = ['latest',historical,'all','empty','missing'] if use_fixture else ['latest',historical,'all','missing']
                for width in [320,390,1440]:
                    cdp.send('Emulation.setDeviceMetricsOverride', dict(width=width,height=844,deviceScaleFactor=1,mobile=width<500))
                    cdp.errors.clear()
                    cdp.send('Page.navigate', dict(url=base+TA+'index.html'))
                    for _ in range(100):
                        overview = cdp.evaluate("""(() => {
                          const chart=document.querySelector('.ta-popularity-chart');
                          if (!chart) return null;
                          return {rows:[...chart.querySelectorAll('a.ta-chart-bar')].map(a=>({
                            code:new URL(a.href).searchParams.get('id'),
                            count:Number(a.querySelector('.ta-chart-bar-value').textContent)})),
                            cumulative:chart.textContent.includes('Ranked by all-time valid runs')};
                        })()""")
                        if overview is not None: break
                        time.sleep(.05)
                    assert overview is not None and overview['rows'] == expected_popularity, overview
                    assert overview['cumulative'] == (popularity.get('scope') == 'all_time_valid_runs'), overview
                    assert not cdp.errors, cdp.errors
                    overview_results.append(dict(width=width,passed=True,**overview))
                    for period in states:
                        cdp.errors.clear()
                        url = base+TA+'track.html?'+urlencode(dict(id=world_code,route=route_code,period=period))
                        cdp.send('Page.navigate', dict(url=url))
                        for _ in range(100):
                            value = cdp.evaluate("(() => {const r=document.querySelector('[data-page-root]');return !!r && !!r.querySelector('.ta-track-board,.ta-content-card')})()")
                            if value: break
                            time.sleep(.05)
                        cdp.evaluate('document.fonts.ready.then(()=>true)')
                        metrics = cdp.evaluate("""(() => ({overflow:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth,
                          cards:document.querySelectorAll('.ta-route-card').length,
                          selected:document.querySelector('[data-ta-period]')?.value,
                          rows:[...document.querySelectorAll('[data-board-view="route"] .ta-record-row')].filter(r=>!r.hidden).length,
                          total_rows:document.querySelectorAll('[data-board-view="route"] .ta-record-row').length,
                          fastest:document.querySelector('.ta-fastest-time')?.textContent.trim(),
                          error:document.querySelector('[data-page-root]').textContent.includes('Data Load Error'),
                          missing:document.querySelector('[data-page-root]').textContent.includes('Leaderboard period not found'),
                          links:[...document.querySelectorAll('[data-track-route-code]')].map(a=>a.getAttribute('href')),
                          archive:document.querySelector('a[href^="data/history/"]')?.getAttribute('href')}))()""")
                        assert metrics['overflow'] <= 2, metrics
                        assert metrics['cards'] == 1 and not metrics['error'], metrics
                        assert not cdp.errors, cdp.errors
                        expected = expected_rows(next(r for r in world['routes'] if r['route_code']==route_code),period)
                        assert metrics['total_rows'] == len(expected), (period,metrics,len(expected))
                        assert metrics['missing'] == (period == 'missing'), metrics
                        if expected: assert metrics.get('fastest') == expected[0]['lap_time_text'], metrics
                        if period == 'latest': assert metrics['selected'] == 'latest', metrics
                        if period == historical:
                            assert metrics.get('archive'), 'Missing history archive link'
                            with urllib.request.urlopen(base+TA+metrics['archive'],timeout=5) as response:
                                assert response.status == 200
                        if use_fixture:
                            assert metrics['missing'] == (period == 'missing'), metrics
                            if period == 'latest': assert metrics['selected'] == 'latest' and metrics['rows'] > 0, metrics
                            if period == 'beta': assert metrics['rows'] == 1 and metrics['archive'], metrics
                            if period == 'empty': assert metrics['rows'] == 0, metrics
                            if period in ['all','beta']: assert all('period='+period in link for link in metrics['links']), metrics
                        if period == 'latest':
                            for platform in ['all','pc','pcvr','quest']:
                                clicked = cdp.evaluate("(() => {const b=document.querySelector('[data-plat-toggle] [data-plat=\""+platform+"\"]');if(!b)return false;b.click();return true})()")
                                if not clicked:
                                    assert platform != 'all' and not any((r.get('platform') or '').lower() == platform for r in expected)
                                    platform_results.append(dict(width=width,period=period,platform=platform,button_available=False,expected=0,passed=True))
                                    continue
                                pages, visited = [], []
                                while True:
                                    page = cdp.evaluate("""(() => {
                                      const wrap=document.querySelector('[data-board-view="route"] .ta-track-table-wrap');
                                      const rows=[...wrap.querySelectorAll('tbody .ta-record-row')].filter(r=>!r.hidden);
                                      return {active:wrap.closest('[data-boards-container]').dataset.activePlat,
                                        page:Number(wrap.dataset.page),
                                        visible:rows.map(r=>({platform:r.dataset.plat,signature:r.textContent.replace(/\\s+/g,' ').trim()})),
                                        next_disabled:wrap.querySelector('.ta-page-next')?.disabled ?? true};
                                    })()""")
                                    assert page['active'] == platform, page
                                    assert len(page['visible']) <= (10 if width <= 900 else 25), page
                                    if platform != 'all':
                                        assert all(r['platform'] == platform for r in page['visible']), page
                                    visited.extend(page['visible'])
                                    pages.append(dict(page=page['page'],visible_count=len(page['visible']),next_disabled=page['next_disabled']))
                                    if page['next_disabled']:
                                        break
                                    assert len(pages) <= len(expected)+1, 'Pagination did not terminate'
                                    cdp.evaluate("document.querySelector('[data-board-view=\"route\"] .ta-page-next').click()")
                                expected_count = len(expected) if platform == 'all' else sum((r.get('platform') or '').lower() == platform for r in expected)
                                assert len(visited) == len({r['signature'] for r in visited}) == expected_count, (platform,pages,expected_count)
                                platform_results.append(dict(width=width,period=period,platform=platform,button_available=True,
                                    expected=expected_count,visited_unique_count=len(visited),unknown_count=sum(r['platform'] in ('','unknown') for r in visited),
                                    pages=pages,passed=True))
                            cdp.evaluate("document.querySelector('[data-plat-toggle] [data-plat=\"all\"]').click()")
                            historic_period = next(p for p in scopes[route_code]['periods'] if p['index_code'] == historical)
                            for requested, selected in [(historical,historic_period['period_id']),('all','all'),('latest','latest')]:
                                assert cdp.evaluate("(() => {const s=document.querySelector('[data-ta-period]');if(![...s.options].some(o=>o.value==="+json.dumps(selected)+"))return false;window.__ta_period_nav_pending=true;s.value="+json.dumps(selected)+";s.dispatchEvent(new Event('change',{bubbles:true}));return true})()")
                                target_rows = len(expected_rows(next(r for r in world['routes'] if r['route_code']==route_code),requested))
                                for _ in range(120):
                                    changed = cdp.evaluate("(() => {const s=document.querySelector('[data-ta-period]');return !window.__ta_period_nav_pending && s && {selected:s.value,rows:document.querySelectorAll('[data-board-view=\"route\"] .ta-record-row').length}})()")
                                    if changed and changed['selected'] == selected and changed['rows'] == target_rows:
                                        break
                                    time.sleep(.05)
                                assert changed and changed['selected'] == selected and changed['rows'] == target_rows, (selected,changed,target_rows)
                                assert not cdp.errors, cdp.errors
                                switcher_results.append(dict(width=width,requested=requested,selected=selected,rows=target_rows,passed=True))
                        results.append(dict(width=width,period=period,passed=True,**metrics))
                        cdp.send('Page.navigate',dict(url=base+TA+'tracks.html?'+urlencode(dict(period=period))))
                        for _ in range(120):
                            directory = cdp.evaluate("(() => {const card=document.querySelector("+json.dumps('[data-track-code="'+world_code+'"]')+");return card && Object.fromEntries([...card.querySelectorAll('.ta-route-pill')].map(a=>[new URL(a.href).searchParams.get('route'),Number(a.querySelector('.ta-route-pill-stat').textContent)]))})()")
                            if directory is not None: break
                            time.sleep(.05)
                        counts = {r['route_code']:len(expected_rows(r,period)) for r in world['routes']}
                        assert directory == counts, (period,'directory/detail count disagreement',directory,counts)
                        results[-1]['directory_counts'] = directory
                evidence = dict(fixture=use_fixture,world=world_code,route=route_code,http_bind=base,cdp_bind=f'127.0.0.1:{port}',browser_pid=process.pid,
                    shutdown='Browser.close then process wait; HTTP server.shutdown in finally; no persistence',cases=results,
                    overview_cases=overview_results,platform_cases=platform_results,
                    switcher_cases=switcher_results,archive_cases=archive_results)
                cdp.send('Browser.close')
        finally:
            try: process.wait(timeout=10)
            except subprocess.TimeoutExpired: process.terminate(); process.wait(timeout=10)
            server.shutdown(); server.server_close()
    output.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{len(results)} TA period, {len(overview_results)} overview, {len(platform_results)} platform, {len(switcher_results)} switcher and {len(archive_results)} archive cases PASS; fixture={use_fixture}; evidence={output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--fixture', action='store_true')
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--world', default=WORLD)
    parser.add_argument('--route', default='FCIB')
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True,exist_ok=True)
    run(args.output.resolve(),args.fixture,args.world,args.route)
