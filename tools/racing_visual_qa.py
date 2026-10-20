#!/usr/bin/env python3
"""Racing Hub Playwright smoke/full visual regression, read-only."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "play/RacingClub/TimeAttack/"
CASES = {
    "overview": ("", "overview"),
    "tracks": ("tracks.html", "tracks"),
    "map": ("TrackMap/", "trackmap"),
    "racers": ("players.html", "players"),
    "vehicles": ("vehicles.html", "vehicles"),
    "teams": ("teams.html", "teams"),
    "events": ("events.html", "events"),
    "index": ("catalog.html", "catalog"),
    "info": ("info.html", "info"),
    "track": ("track.html?id=kamidomarizaka_calme", "track"),
    "route": ("track.html?id=pt_ych_starriver_arts&route=FCIB", "track"),
    "world-routes": ("track.html?id=pt_ych_starriver_arts", "track"),
    "bad-route": ("track.html?id=pt_ych_starriver_arts&route=QA_INVALID_ROUTE", "track"),
    "racer": ("player.html?id=plr_cannedcarbon", "player"),
    "vehicle": ("vehicle.html?id=veh_fd3s_rx7", "vehicle"),
    "team": ("team.html?id=team_thdk", "team"),
    "event": ("event.html?id=vrrctw_ryuoukouzan_20260329", "event"),
    "bad-track": ("track.html?id=QA_INVALID_ID", "track"),
    "bad-player": ("player.html?id=QA_INVALID_ID", "player"),
    "bad-vehicle": ("vehicle.html?id=QA_INVALID_ID", "vehicle"),
    "bad-team": ("team.html?id=QA_INVALID_ID", "team"),
    "bad-event": ("event.html?id=QA_INVALID_ID", "event"),
}
SIZES = [(320, 568), (390, 844), (768, 1024), (1440, 900), (1920, 1080)]
DETAILS = {"track", "racer", "vehicle", "team", "event", "route"}
CRITICAL = {"overview", "tracks", "map", "events", "route", "world-routes", "bad-route", "bad-track"}
FULL_ONLY = {(320,568), (768,1024), (1920,1080)}

def run(base_url, profile, output):
    output.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for key,(path,view) in CASES.items():
            sizes = SIZES if profile == "full" and key in CRITICAL else [(390,844),(1440,900)]
            for width,height in sizes:
                if profile == "smoke" and key not in CRITICAL and width == 390:
                    continue
                for lang in (("zh","en") if width in (390,1440) and key in CRITICAL else ("zh",)):
                    context = browser.new_context(viewport={"width":width,"height":height},
                        device_scale_factor=1, reduced_motion="reduce", locale="zh-TW")
                    page = context.new_page()
                    errors, warnings = [], []
                    name = f"{key}__{width}x{height}__{lang}"
                    try:
                        page.route("https://www.clarity.ms/**", lambda route: route.fulfill(status=200,body="",content_type="application/javascript"))
                        page.on("pageerror", lambda error: errors.append("JS: "+str(error)))
                        resp = page.goto(base_url.rstrip("/")+"/"+BASE+path, wait_until="domcontentloaded", timeout=45000)
                        if not resp or resp.status >= 400:
                            errors.append(f"HTTP: {resp.status if resp else 'none'}")
                        page.locator("[data-page-root]").wait_for(state="attached", timeout=15000)
                        page.wait_for_function("""() => {
                          const r = document.querySelector('[data-page-root]');
                          return r && (r.children.length > 0 || r.textContent.includes('Data Load Error') || r.textContent.toLowerCase().includes('not found'));
                        }""", timeout=30000)
                        if key == "tracks":
                            page.locator("[data-track-directory]").wait_for(timeout=25000)
                        if key == "map":
                            page.locator("[data-trackmap-root]").wait_for(timeout=15000)
                        if page.locator("[data-lang-select]").count():
                            page.locator("[data-lang-select]").first.select_option(lang)
                        page.evaluate("document.fonts.ready")
                        page.add_style_tag(content="*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}")
                        metrics = page.evaluate("""() => {
                          const v=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return !!(r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none')};
                          return {width:innerWidth, scrollWidth:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
                            h1:[...document.querySelectorAll('h1')].filter(v).length,
                            lang:document.documentElement.lang,title:document.title,
                            loading:document.querySelector('[data-page-root]').textContent.includes('Data Load Error'),
                            notFound:document.querySelector('[data-page-root]').textContent.toLowerCase().includes('not found')||document.querySelector('[data-page-root]').textContent.includes('找不到'),
                            brokenImages:[...document.images].filter(v).filter(e=>!e.complete||!e.naturalWidth).map(e=>e.getAttribute('src')),
                            routeCards:document.querySelectorAll('[data-boards-container] .ta-route-card').length,
                            supplementCards:document.querySelectorAll('[data-supplemental-route]').length,
                            trackDirectory:!!document.querySelector('[data-track-directory]')};
                        }""")
                        if metrics["scrollWidth"] > metrics["width"]+2: errors.append("horizontal overflow")
                        if metrics["h1"] != 1: errors.append("visible H1 count")
                        if metrics["loading"]: errors.append("data load failed")
                        if metrics["lang"] != ("zh-TW" if lang=="zh" else "en"): errors.append("language toggle mismatch")
                        if not metrics["title"].startswith("Racing Hub"): errors.append("browser title not Racing Hub")
                        if metrics["brokenImages"]: errors.append("broken visible images")
                        if key.startswith("bad-") and not metrics["notFound"]: errors.append("invalid ID does not show not-found")
                        if key == "route":
                            if metrics["routeCards"] != 1 or metrics["supplementCards"] != 0:
                                errors.append("route-scoped detail has extra/missing route cards")
                            if page.locator('[data-track-route-code="FCIB"][aria-current="page"]').count() != 1:
                                errors.append("requested route is not selected")
                            if page.locator("[data-track-route-all]").count() != 1:
                                errors.append("return-to-all route link missing")
                        if key == "world-routes":
                            if metrics["routeCards"] < 2 or metrics["supplementCards"] != 0:
                                errors.append("world overview did not retain all generated route boards")
                            if page.locator('[data-track-route-all][aria-current="page"]').count() != 1:
                                errors.append("all routes selection not active")
                        if key == "bad-route" and not metrics["notFound"]:
                            errors.append("unknown route silently falls back to world overview")
                        if key == "tracks" and not metrics["trackDirectory"]: errors.append("full track directory missing")
                        if key == "tracks":
                            query = page.locator("[data-directory-query]")
                            query.fill("kamidomarizaka")
                            if page.locator("[data-directory-card]:visible").count() == 0:
                                warnings.append("search filter returned zero visible cards")
                        if key == "event":
                            # Event vehicle_variant_code must not point at a non-existent model.
                            grid = page.locator(".ta-event-info-grid")
                            bad = grid.locator("a[href*='vehicle.html?id=veh_gc8_attack']")
                            if bad.count(): errors.append("historical variant links to invalid model page")
                            if not grid.locator("a[href*='vehicle.html?id=veh_gc8_impreza']").count():
                                errors.append("historical variant did not resolve to model page")
                            if grid.locator("a[href*='vehicle.html?id=veh_gtr34_attack']").count():
                                errors.append("unknown variant guessed a model link")
                        if key == "events":
                            if page.locator(".ta-event-status.is-needs-update").count() == 0:
                                warnings.append("no elapsed upcoming event flagged; check editorial updates")
                        if key == "route" and page.locator("[data-view-toggle] [data-view='vehicle']").count():
                            page.locator("[data-view-toggle] [data-view='vehicle']").click()
                            if page.locator("[data-boards-container]").get_attribute("data-active-view") != "vehicle":
                                errors.append("board switch broken")
                        page.screenshot(path=str(output / (name+".png")),full_page=True,animations="disabled",caret="hide")
                    except Exception as ex:
                        errors.append(type(ex).__name__+": "+str(ex).splitlines()[0][:250])
                        metrics = {}
                    finally:
                        results.append({"case":name,"path":path,"metrics":metrics,"errors":errors,"warnings":warnings})
                        context.close()
        browser.close()
    report={"schema":"racing-visual-qa/1","profile":profile,"passed":not any(x["errors"] for x in results),"cases":results}
    (output/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    failed=[x for x in results if x["errors"]]
    print(f"Racing browser QA: {len(results)} cases; {len(failed)} failed")
    for x in failed:print(x["case"], ":","; ".join(x["errors"]))
    return int(bool(failed))

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--base-url",default="http://127.0.0.1:4173")
    parser.add_argument("--profile",choices=("smoke","full"),default="smoke")
    parser.add_argument("--output",type=Path,default=Path("racing-qa-artifacts/browser"))
    args=parser.parse_args()
    raise SystemExit(run(args.base_url,args.profile,args.output))
