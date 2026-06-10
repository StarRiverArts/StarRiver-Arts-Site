/* Driver / Vehicle records — aggregates the SAME window.TA_DATA used by Time Attack,
   re-centred on a person (車手榜) or a machine (車輛榜).
   The page sets window.REC_MODE = "driver" | "vehicle" before loading this file.
   Badge logic mirrors ta-core: per route → TR > CR (per vehicle) > PR (per driver). */
(function () {
  var DATA = window.TA_DATA;
  var MODE = window.REC_MODE === "vehicle" ? "vehicle" : "driver";
  var CFG = {
    driver:  { key: "driver",  other: "vehicle", otherLbl: "車輛 Vehicle", listLbl: "車手 Drivers",
               eyebrow: "車手 · DRIVER", slotShape: "circle", slotPh: "車手頭像",
               bannerPh: "個人橫幅 Banner", unit: "車手" },
    vehicle: { key: "vehicle", other: "driver",  otherLbl: "車手 Driver",  listLbl: "車輛 Vehicles",
               eyebrow: "車輛 · VEHICLE", slotShape: "rect", slotPh: "車輛照片",
               bannerPh: "車輛主視覺 Hero", unit: "車輛" }
  }[MODE];

  function fmt(ms) {
    if (ms == null) return "—";
    var m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), mm = ms % 1000;
    return m + ":" + (s < 10 ? "0" : "") + s + "." + ("00" + mm).slice(-3);
  }
  function gapTxt(ms, best) {
    var d = ms - best; if (d <= 0) return "—";
    var s = Math.floor(d / 1000); return "+" + s + "." + ("00" + (d % 1000)).slice(-3);
  }
  function slug(s) { return String(s).replace(/[^\w\u4e00-\u9fff]/g, "").slice(0, 24); }

  // per-route badges → flat record index
  function withBadges(records) {
    var sorted = records.slice().sort(function (a, b) { return a.ms - b.ms; });
    var seenV = {}, seenP = {};
    sorted.forEach(function (r) { r.badge = ""; });
    if (sorted.length) sorted[0].badge = "TR";
    sorted.forEach(function (r) {
      if (!(r.vehicle in seenV)) seenV[r.vehicle] = r;
      if (!(r.driver in seenP)) seenP[r.driver] = r;
    });
    Object.keys(seenV).forEach(function (v) { if (!seenV[v].badge) seenV[v].badge = "CR"; });
    Object.keys(seenP).forEach(function (p) { if (!seenP[p].badge) seenP[p].badge = "PR"; });
    return sorted;
  }

  var FLAT = [];
  DATA.variants.forEach(function (v) {
    v.routes.forEach(function (r) {
      if (!r.records.length) return;
      var sorted = withBadges(r.records), trBest = sorted[0].ms;
      sorted.forEach(function (rec, i) {
        FLAT.push({
          driver: rec.driver, vehicle: rec.vehicle, ms: rec.ms, plat: rec.plat, fps: rec.fps,
          date: rec.date, badge: rec.badge, rank: i + 1, trBest: trBest,
          track: v.name, fam: v.fam, sign: v.sign, signSub: v.signSub, signColor: v.signColor,
          group: v.group, route: r.name, dist: r.dist, variantId: v.id
        });
      });
    });
  });

  // group FLAT into entities keyed by driver|vehicle
  var ENT = {};
  FLAT.forEach(function (rec) {
    var k = rec[CFG.key];
    var e = ENT[k] || (ENT[k] = { name: k, runs: 0, recs: [], variants: {}, others: {}, TR: 0, CR: 0, PR: 0 });
    e.runs++; e.recs.push(rec); e.variants[rec.variantId] = 1; e.others[rec[CFG.other]] = 1;
    if (rec.badge === "TR") e.TR++; else if (rec.badge === "CR") e.CR++; else if (rec.badge === "PR") e.PR++;
  });
  var ENTITIES = Object.keys(ENT).map(function (k) {
    var e = ENT[k];
    e.tracks = Object.keys(e.variants).length;
    e.otherCount = Object.keys(e.others).length;
    // best run per variant (for the table) — keep one row per track
    var perV = {};
    e.recs.forEach(function (r) { if (!perV[r.variantId] || r.ms < perV[r.variantId].ms) perV[r.variantId] = r; });
    e.best = Object.keys(perV).map(function (id) { return perV[id]; })
      .sort(function (a, b) { return (a.rank - b.rank) || (a.ms - b.ms); });
    return e;
  }).sort(function (a, b) { return (b.TR - a.TR) || (b.runs - a.runs); });

  var state = { id: ENTITIES[0] ? ENTITIES[0].name : null, query: "", theme: "dark" };
  function getEnt(id) { return ENTITIES.filter(function (e) { return e.name === id; })[0]; }

  // ---------- render: master list ----------
  function listItem(e) {
    var on = e.name === state.id ? " on" : "";
    var mark = CFG.slotShape === "circle"
      ? '<span class="li-av"></span>'
      : '<span class="li-chip" style="background:' + (e.best[0] ? e.best[0].signColor : "#2F4F3A") + '"></span>';
    return '<button class="li' + on + '" data-id="' + encodeURIComponent(e.name) + '">' +
      mark +
      '<span class="li-tx"><span class="li-name">' + e.name + '</span>' +
        '<span class="li-sub">' + e.tracks + ' ' + (MODE === "driver" ? "賽道" : "賽道") + ' · ' + e.runs + ' 紀錄</span></span>' +
      '<span class="li-tr">' + (e.TR ? '<b>' + e.TR + '</b><i>TR</i>' : '<span class="li-dash">—</span>') + '</span>' +
    '</button>';
  }
  function renderList() {
    var q = state.query.trim().toLowerCase();
    var rows = ENTITIES.filter(function (e) { return !q || e.name.toLowerCase().indexOf(q) >= 0; });
    document.getElementById("recList").innerHTML = rows.length
      ? rows.map(listItem).join("")
      : '<div class="li-empty">找不到符合「' + (state.query.trim() || "—") + '」· No match</div>';
    document.getElementById("listCount").textContent = rows.length + " / " + ENTITIES.length + " " + CFG.unit;
  }

  // ---------- render: detail (reserved personal block + records) ----------
  function badgeChip(b) {
    if (!b) return '<span class="bz bz-none">—</span>';
    return '<span class="bz bz-' + b.toLowerCase() + '">' + b + '</span>';
  }
  function recRow(r) {
    return '<tr>' +
      '<td class="c-track"><span class="shield" style="background:' + r.signColor + '">' + r.sign + '<small>' + r.signSub + '</small></span>' +
        '<span class="ct-tx"><b>' + r.track + '</b><i>' + r.route + ' · ' + r.dist + '</i></span></td>' +
      '<td class="c-other">' + r[CFG.other] + '</td>' +
      '<td class="c-time mono">' + fmt(r.ms) + '</td>' +
      '<td class="c-bz">' + badgeChip(r.badge) + '</td>' +
      '<td class="c-gap mono">' + (r.badge === "TR" ? '<span class="lead">領先</span>' : gapTxt(r.ms, r.trBest)) + '</td>' +
    '</tr>';
  }
  function renderDetail() {
    var e = getEnt(state.id);
    var el = document.getElementById("recDetail");
    if (!e) { el.innerHTML = '<div class="li-empty" style="padding:80px 20px">選擇一位' + CFG.unit + ' · pick one</div>'; return; }
    var sid = slug(e.name);
    // reserved personal block — banner + avatar/photo image-slots the team fills in
    var hero = '<div class="pblock pblock-' + MODE + '">' +
      '<div class="pb-banner"><image-slot id="rec-banner-' + sid + '" shape="rect" placeholder="' + CFG.bannerPh + '"></image-slot></div>' +
      '<div class="pb-id">' +
        '<div class="pb-slot ' + CFG.slotShape + '"><image-slot id="rec-av-' + sid + '" shape="' + CFG.slotShape + '" placeholder="' + CFG.slotPh + '"></image-slot></div>' +
        '<div class="pb-meta"><span class="pb-eyebrow">' + CFG.eyebrow + '</span>' +
          '<h2 class="pb-name">' + e.name + '</h2>' +
          '<span class="pb-line">' + (MODE === "driver"
            ? (e.otherCount + ' 部愛車 · 橫跨 ' + e.tracks + ' 條賽道')
            : (e.otherCount + ' 位車手駕馭 · ' + e.tracks + ' 條賽道留下紀錄')) + '</span></div>' +
      '</div></div>';
    var stats = '<div class="pb-stats">' +
      stat(e.TR, "TR", "賽道紀錄", "tr") + stat(e.CR, "CR", "同車最快", "cr") +
      stat(e.PR, "PR", "個人最佳", "pr") + stat(e.runs, "", "總紀錄 Runs", "") +
      stat(e.tracks, "", "賽道 Tracks", "") + '</div>';
    var table = '<div class="rec-tbl-wrap"><div class="rec-tbl-head"><h3>各賽道最佳 · Best per track</h3>' +
        '<span class="ct-note">' + e.best.length + ' 條賽道</span></div>' +
      '<table class="rec-tbl"><thead><tr>' +
        '<th>賽道 Track</th><th>' + CFG.otherLbl + '</th><th>時間 Time</th><th>標記</th><th>vs TR</th>' +
      '</tr></thead><tbody>' + e.best.map(recRow).join("") + '</tbody></table></div>';
    el.innerHTML = hero + stats + table;
  }
  function stat(n, tag, lbl, cls) {
    return '<div class="pst' + (cls ? " pst-" + cls : "") + '"><b class="mono">' + n + (tag ? '<span class="pst-tag">' + tag + '</span>' : '') + '</b><span>' + lbl + '</span></div>';
  }

  function applyTheme() { document.documentElement.classList.toggle("theme-paper", state.theme === "paper"); }

  function init() {
    document.getElementById("listLbl").textContent = CFG.listLbl;
    document.getElementById("recSearch").placeholder = "搜尋" + CFG.unit + "… · search";
    renderList(); renderDetail(); applyTheme();

    document.getElementById("recSearch").addEventListener("input", function (e) { state.query = e.target.value; renderList(); });
    document.getElementById("recList").addEventListener("click", function (e) {
      var b = e.target.closest(".li"); if (!b) return;
      state.id = decodeURIComponent(b.dataset.id);
      document.querySelectorAll(".li").forEach(function (x) { x.classList.toggle("on", x === b); });
      renderDetail();
      if (window.matchMedia("(max-width:880px)").matches) {
        var d = document.getElementById("recDetail");
        window.scrollTo({ top: d.getBoundingClientRect().top + window.pageYOffset - 16, behavior: "smooth" });
      }
    });
    var tg = document.getElementById("themeToggle");
    if (tg) tg.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      state.theme = btn.dataset.theme; applyTheme();
      tg.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === btn); x.classList.toggle("paper", x === btn && state.theme === "paper"); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
