#!/usr/bin/env python3
"""Repeatable browser smoke/visual evidence for public entry pages."""
import argparse
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

SMOKE = [(320,568),(390,844),(768,1024),(1024,768),(1440,900),(1920,1080)]
FULL = [(320,568),(360,800),(375,667),(390,844),(430,932),(600,800),(768,1024),(820,1180),(1024,768),(1280,800),(1440,900),(1920,1080),(2560,1440),(3440,1440)]
PAGES = {"home":"index.html","social-cybergum":"social.html?theme=cybergum","social-blueprint":"social.html?theme=blueprint"}

def run(base, profile, output):
    output.mkdir(parents=True,exist_ok=True)
    cases=[]
    with sync_playwright() as engine:
        browser=engine.chromium.launch()
        for name,path in PAGES.items():
            for width,height in (SMOKE if profile=="smoke" else FULL):
                for lang in (["zh","en"] if width in (390,1440) else ["zh"]):
                    context=browser.new_context(viewport={"width":width,"height":height},device_scale_factor=1,reduced_motion="reduce",locale="zh-TW")
                    page=context.new_page()
                    page.route("https://www.clarity.ms/**",lambda route: route.fulfill(status=200,content_type="application/javascript",body=""))
                    problems=[]
                    errors=[]
                    page.on("pageerror",lambda error: errors.append(str(error)))
                    label=f"{name}__{width}x{height}__{lang}"
                    evidence={"case":label,"errors":problems}
                    try:
                        response=page.goto(base+path,wait_until="load",timeout=30000)
                        if not response or response.status>=400: problems.append("HTTP page failure")
                        page.locator("#lang").select_option(lang,timeout=5000)
                        page.evaluate("document.fonts.ready")
                        page.add_style_tag(content="*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}")
                        page.screenshot(path=str(output/(label+".png")),full_page=True,animations="disabled",caret="hide",scale="css")
                        metric=page.evaluate("""() => {
                          const isVisible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
                          const selectors=['.lp-card','.lp-connect-link','.link-card','.back-link','.lp-lang','.language'];
                          const small=selectors.flatMap(s=>[...document.querySelectorAll(s)].filter(isVisible).filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44}).map(e=>({selector:s,text:e.textContent.trim().slice(0,40)})));
                          return {viewport:innerWidth,contentWidth:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),h1:[...document.querySelectorAll('h1')].filter(isVisible).length,brokenImages:[...document.images].filter(isVisible).filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),smallTargets:small,lang:document.documentElement.lang,theme:document.documentElement.dataset.theme||null,primary:['.lp-card--studio','.lp-card--play','.lp-card--museum'].every(s=>{const e=document.querySelector(s);return e&&isVisible(e)}),socialBack:!!document.querySelector('.back-link[href="./"]')};
                        }""")
                        evidence["metrics"]=metric
                        if metric["contentWidth"]>metric["viewport"]+2:problems.append("horizontal overflow")
                        if metric["h1"]!=1:problems.append("expected one visible H1")
                        if metric["brokenImages"]:problems.append("broken visible images")
                        if metric["lang"]!=("zh-TW" if lang=="zh" else "en"):problems.append("incorrect document language")
                        if name=="home" and not metric["primary"]:problems.append("missing primary cards")
                        if name.startswith("social"):
                            if not metric["socialBack"]:problems.append("missing home return")
                            if metric["theme"]!=name.removeprefix("social-"):problems.append("theme mismatch")
                        if errors:problems.extend(errors)
                        evidence["warnings"]=["interactive targets below 44 CSS px"] if metric["smallTargets"] else []
                    except Exception as exc:
                        problems.append(f"runner exception: {exc}")
                    finally:
                        cases.append(evidence)
                        context.close()
        browser.close()
    report={"schema":"starriver-responsive-qa/1","profile":profile,"cases":cases,"passed":not any(c["errors"] for c in cases)}
    (output/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    failed=[c for c in cases if c["errors"]]
    print(f"QA {'PASS' if not failed else 'FAIL'}: {len(cases)} cases; {len(failed)} failures")
    for case in failed:print(case["case"],":","; ".join(case["errors"]))
    return bool(failed)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--base-url",default="http://127.0.0.1:4173/")
    parser.add_argument("--profile",choices=["smoke","full"],default="smoke")
    parser.add_argument("--output",type=Path,default=Path("visual-qa-artifacts"))
    args=parser.parse_args()
    sys.exit(run(args.base_url.rstrip("/")+"/",args.profile,args.output))
