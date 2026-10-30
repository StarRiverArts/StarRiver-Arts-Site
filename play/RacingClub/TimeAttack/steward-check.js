"use strict";
(() => {
  const root = document.getElementById("findings");
  const summary = document.getElementById("summary");
  const state = document.getElementById("state");
  const button = document.getElementById("run");
  const base = "./";
  const sources = {
    editorial: base + "data/event-editorial.json",
    vrc: base + "vrc/events.json"
  };
  const dayMs = 86400000;
  const id = x => typeof x === "string" ? x.trim() : "";
  const findings = [];
  function report(kind, title, detail, refs = []) {
    findings.push({ kind, title, detail, refs });
  }
  async function fetchJson(path) {
    const response = await fetch(path + "?steward=" + Date.now(), {cache: "no-store"});
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.json();
  }
  function localDay(utcNow) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit"
    }).format(utcNow);
  }
  function safeDay(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.slice(0,10))
      ? value.slice(0,10) : null;
  }
  function checkEvents(editorial, vrc, now) {
    const a = editorial && editorial.events;
    const b = vrc && vrc.events;
    if (!Array.isArray(a) || !Array.isArray(b)) {
      report("error", "資料結構不符", "預期兩份資料的 events 都是陣列。", [sources.editorial, sources.vrc]);
      return;
    }
    const vrcById = new Map(b.filter(x => x && id(x.id)).map(x => [id(x.id), x]));
    const editorialIds = new Set();
    const today = localDay(now);
    for (const item of a) {
      if (!item || !id(item.event_id)) {
        report("warning", "活動缺少 ID", "Editorial 有一筆活動缺少 event_id。", [sources.editorial]);
        continue;
      }
      const eid = id(item.event_id);
      if (editorialIds.has(eid)) report("error", "活動 ID 重複", eid, [sources.editorial]);
      editorialIds.add(eid);
      const vr = vrcById.get(eid);
      if (!vr) {
        report("warning", "活動缺少 VRC 對應資料", eid, [sources.editorial, sources.vrc]);
      } else if (id(item.status) !== id(vr.status)) {
        report("error", "活動狀態不同步",
          eid + "：網站 editorial = " + String(item.status) + "；VRC = " + String(vr.status),
          [sources.editorial, sources.vrc]);
      }
      const start = safeDay(item.starts_at);
      if (!start) {
        report("warning", "活動日期缺失或格式不正確", eid, [sources.editorial]);
      } else if (id(item.status) === "upcoming" && start < today) {
        report("warning", "過期的 Upcoming，等待主辦確認",
          eid + "（" + start + "）。日期經過不代表已完成。", [sources.editorial]);
      } else if (id(item.status) === "upcoming") {
        const offset = Math.round((Date.parse(start+"T00:00:00Z") - Date.parse(today+"T00:00:00Z")) / dayMs);
        if (offset <= 7 && offset >= 0) report("info", "七日內預定活動", eid + "（" + start + "）", [sources.editorial]);
      }
    }
    for (const item of b) if (item && id(item.id) && !editorialIds.has(id(item.id))) {
      report("warning", "VRC 活動缺少 Editorial 對應資料", id(item.id), [sources.vrc, sources.editorial]);
    }
  }
  function draw() {
    root.replaceChildren(); summary.replaceChildren();
    const counts = {error: 0, warning: 0, info: 0};
    for (const finding of findings) counts[finding.kind]++;
    for (const [label,count] of [["差異",counts.error],["待確認",counts.warning],["近期提示",counts.info]]) {
      const el = document.createElement("span"); el.textContent = label + "：" + count; summary.append(el);
    }
    if (!findings.length) {
      const p=document.createElement("p");
      p.textContent="本次可執行的檢核未發現差異；不代表所有系統或發布狀態皆已驗證。";
      root.append(p); return;
    }
    for (const finding of findings) {
      const el=document.createElement("article"); el.className=finding.kind;
      const title=document.createElement("h3"); title.textContent=finding.title;
      const msg=document.createElement("p"); msg.textContent=finding.detail;
      const refs=document.createElement("small");
      for (const path of finding.refs) {
        const a=document.createElement("a"); a.href=path; a.textContent=path.replace(/^\.\//,"");
        a.rel="noopener noreferrer"; refs.append(a,document.createTextNode(" "));
      }
      el.append(title,msg,refs);root.append(el);
    }
  }
  async function run() {
    button.disabled=true; state.textContent="正在讀取已公開的資料…"; findings.length=0;
    const [a,b]=await Promise.allSettled([fetchJson(sources.editorial),fetchJson(sources.vrc)]);
    for (const [name,result] of [["Editorial",a],["VRC",b]]) {
      if (result.status==="rejected") report("error","BLOCKED：無法讀取 "+name,
        String(result.reason?.message||result.reason),[name==="Editorial"?sources.editorial:sources.vrc]);
    }
    if (a.status==="fulfilled" && b.status==="fulfilled") checkEvents(a.value,b.value,new Date());
    else report("warning","UNKNOWN：跨資料比對未完成",
      "缺少至少一個可信來源，不能宣告兩份資料一致。");
    draw();state.textContent="檢查時間："+new Date().toLocaleString("zh-TW",{timeZone:"Asia/Taipei"})+"（臺灣時間）";
    button.disabled=false;
  }
  button.addEventListener("click",run);run();
})();
