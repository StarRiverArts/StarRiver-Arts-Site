/* Time Attack — render + interactions.
   Badge logic mirrors leaderboard_builder.apply_badges():
   per route → TR (fastest overall) > CR (fastest per vehicle) > PR (fastest per driver). */
(function () {
  var DATA = window.TA_DATA;

  // ---- helpers ----
  function fmt(ms) {
    if (ms == null) return "—";
    var m = Math.floor(ms / 60000);
    var s = Math.floor((ms % 60000) / 1000);
    var mm = ms % 1000;
    var sec = (s < 10 ? "0" : "") + s;
    var mil = ("00" + mm).slice(-3);
    return m + ":" + sec + "." + mil;
  }
  function gap(ms, best) {
    var d = ms - best;
    if (d === 0) return { txt: "—", best: true };
    var s = Math.floor(d / 1000), mm = d % 1000;
    return { txt: "+" + s + "." + ("00" + mm).slice(-3), best: false };
  }
  // returns sorted copy with badge assigned (TR/CR/PR/"")
  function withBadges(records) {
    var sorted = records.map(function (r, i) { return Object.assign({ _i: i }, r); })
      .sort(function (a, b) { return a.ms - b.ms; });
    var seenV = {}, seenP = {};
    sorted.forEach(function (r) { r.badge = ""; });
    if (sorted.length) { sorted[0].badge = "TR"; }
    sorted.forEach(function (r) {
      if (!(r.vehicle in seenV)) { seenV[r.vehicle] = r; }
      if (!(r.driver in seenP)) { seenP[r.driver] = r; }
    });
    Object.keys(seenV).forEach(function (v) { var r = seenV[v]; if (!r.badge) r.badge = "CR"; });
    Object.keys(seenP).forEach(function (p) { var r = seenP[p]; if (!r.badge) r.badge = "PR"; });
    return sorted;
  }
  function variantById(id) { return DATA.variants.find(function (v) { return v.id === id; }); }
  function variantRecordCount(v) { return v.routes.reduce(function (a, r) { return a + r.records.length; }, 0); }
  function bestOf(v) {
    var best = null;
    v.routes.forEach(function (r) { r.records.forEach(function (rec) { if (!best || rec.ms < best.ms) best = rec; }); });
    return best;
  }
  function groupCount(g) { return DATA.variants.filter(function (v) { return v.group === g; }).length; }
  function scrollToEl(el) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - 16;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  var REGION_SHORT = {
    "北部山道 North": "北部 North", "中部山道 Central": "中部 Central",
    "東部山道 East": "東部 East", "南部山道 South": "南部 South",
    "虛構場景 Fiction": "虛構 Fiction"
  };
  function routeById(v, id) { return v.routes.find(function (r) { return r.id === id; }); }
  function firstNonEmptyRoute(v) {
    return v.routes.find(function (r) { return r.records.length; }) || v.routes[0];
  }
  // slug for image-slot ids (drop spaces/symbols; CJK is a valid id char)
  function slug(s) { return String(s).replace(/[^\w\u4e00-\u9fff]+/g, "-"); }
  function avatarSlot(driver, cls) {
    return '<image-slot class="' + cls + '" id="av-' + slug(driver) + '" shape="circle" placeholder="頭像"></image-slot>';
  }

  // ---- state ----
  var state = { variantId: DATA.variants[0].id, routeId: firstNonEmptyRoute(DATA.variants[0]).id, view: "route", theme: "dark", query: "", region: "__all", collapsed: {} };

  // ---- build rows for the active view ----
  function rowsFor(route, view) {
    var ranked = withBadges(route.records); // sorted asc, with badges
    if (view === "route") return ranked;
    var seen = {}, key = view === "vehicle" ? "vehicle" : "driver", out = [];
    ranked.forEach(function (r) { if (!(r[key] in seen)) { seen[r[key]] = true; out.push(r); } });
    return out; // already time-sorted; one row per vehicle/driver
  }

  // ---- renderers ----
  // active-track strip (replaces the old flat tab row)
  function renderActiveStrip() {
    var v = variantById(state.variantId);
    document.getElementById("activeStrip").innerHTML =
      '<div class="shield" style="background:' + v.signColor + '">' + v.sign + '<small>' + v.signSub + '</small></div>' +
      '<div class="as-tx"><span class="as-eyebrow">目前賽道 · Now viewing</span>' +
        '<span class="as-name">' + v.name + '</span><span class="as-fam">' + v.fam + '</span></div>' +
      '<div class="as-meta">' +
        '<div class="as-stat"><b>' + v.routes.length + '</b><span>路線 routes</span></div>' +
        '<div class="as-stat"><b>' + variantRecordCount(v) + '</b><span>紀錄 runs</span></div>' +
        '<button class="as-change" id="changeTrack">切換賽道 Change ▾</button>' +
      '</div>';
  }

  // region filter chips
  function renderRegionChips() {
    var el = document.getElementById("regionChips");
    var chips = ['<button class="rchip' + (state.region === "__all" ? " on" : "") + '" data-g="__all">全部 All <i>' + DATA.variants.length + '</i></button>'];
    DATA.groups.forEach(function (g) {
      chips.push('<button class="rchip' + (state.region === g ? " on" : "") + '" data-g="' + g + '">' + (REGION_SHORT[g] || g) + ' <i>' + groupCount(g) + '</i></button>');
    });
    el.innerHTML = chips.join("");
  }

  function matchesQuery(v, q) {
    if (!q) return true;
    return (v.name + " " + v.fam + " " + v.sign + " " + v.group).toLowerCase().indexOf(q) >= 0;
  }
  function trackRow(v) {
    var on = v.id === state.variantId ? " on" : "";
    var best = bestOf(v);
    var bestHtml = best
      ? '<div class="tr-best"><span class="t">' + fmt(best.ms) + '</span><span class="who">' + best.driver + '</span></div>'
      : '<div class="tr-best"><span class="empty">待刷新 —</span></div>';
    return '<div class="trow' + on + '" data-v="' + v.id + '">' +
      '<div class="shield" style="background:' + v.signColor + '">' + v.sign + '<small>' + v.signSub + '</small></div>' +
      '<div class="tr-main"><div class="tr-name">' + v.name + '</div><div class="tr-fam">' + v.fam + '</div></div>' +
      '<div class="tr-routes">' + v.routes.length + ' 路線 · ' + variantRecordCount(v) + ' 紀錄</div>' +
      bestHtml +
    '</div>';
  }
  function renderList() {
    var q = state.query.trim().toLowerCase();
    var el = document.getElementById("tlist");
    var groups = state.region === "__all" ? DATA.groups.slice() : [state.region];
    var shown = 0, html = "";
    groups.forEach(function (g) {
      var vs = DATA.variants.filter(function (v) { return v.group === g && matchesQuery(v, q); });
      if (!vs.length) return;
      shown += vs.length;
      var collapsed = q ? false : !!state.collapsed[g]; // a live search always expands
      html += '<div class="tgroup' + (collapsed ? " collapsed" : "") + '" data-g="' + g + '">' +
        '<div class="tg-head"><span class="tg-caret"></span>' +
          '<span class="tg-name">' + g + '</span><span class="tg-count">' + vs.length + ' 賽道</span></div>' +
        '<div class="tg-body">' + vs.map(trackRow).join("") + '</div></div>';
    });
    el.innerHTML = shown ? html : '<div class="tlist-empty">找不到符合「' + (state.query.trim() || "—") + '」的賽道 · No tracks match</div>';
    document.getElementById("ovCount").textContent = "顯示 " + shown + " / " + DATA.variants.length + " 賽道";
  }
  function renderFinder() { renderRegionChips(); renderList(); }

  function renderRouteSeg() {
    var v = variantById(state.variantId);
    var el = document.getElementById("routeSeg");
    el.innerHTML = v.routes.map(function (r) {
      var on = r.id === state.routeId ? " on" : "";
      var empty = r.records.length ? "" : " style='opacity:.45'";
      return '<button data-r="' + r.id + '"' + on + empty + '>' + r.name + '</button>';
    }).join("");
  }

  function renderTrackBanner() {
    var v = variantById(state.variantId);
    var el = document.getElementById("trackBanner");
    el.innerHTML =
      '<image-slot id="trk-' + v.id + '" shape="rect" placeholder="拖入賽道照片 · Track photo"></image-slot>' +
      '<div class="tb-overlay"><div><div class="tb-name">' + v.name + '</div><div class="tb-fam">' + v.fam + '</div></div></div>';
  }

  function renderHero() {
    var v = variantById(state.variantId), route = routeById(v, state.routeId);
    var el = document.getElementById("hero");
    if (!route.records.length) {
      el.innerHTML = '<div class="hero-mid"><span class="hero-label">尚無紀錄 · No records yet</span>' +
        '<span class="hero-driver" style="color:var(--b-fg-dim)">' + route.name + '</span></div>';
      return;
    }
    var fast = withBadges(route.records)[0];
    el.innerHTML =
      '<div class="hero-badge"><span class="bt">TR</span><span class="bl">Track Rec</span></div>' +
      avatarSlot(fast.driver, "hero-av") +
      '<div class="hero-mid">' +
        '<div class="hero-top"><span class="hero-label">最快一筆 · Fastest Lap</span>' +
          '<span class="hero-route">' + v.name + ' — ' + route.name + '</span></div>' +
        '<div class="hero-driver">' + fast.driver + '</div>' +
        '<div class="hero-meta"><span>' + fast.vehicle + '</span><span class="dot"></span>' +
          '<span class="pchip ' + (fast.plat === "PCVR" ? "pcvr" : "") + '">' + fast.plat + '</span>' +
          '<span>' + fast.fps + ' fps</span><span class="dot"></span><span>' + fast.date + '</span></div>' +
      '</div>' +
      '<div class="hero-time"><div class="t mono">' + fmt(fast.ms) + '</div><div class="tl">' + route.dist + ' · ' + route.records.length + ' runs</div></div>';
  }

  function renderTable() {
    var v = variantById(state.variantId), route = routeById(v, state.routeId);
    var rows = rowsFor(route, state.view);
    var tbody = document.getElementById("tbody");
    document.getElementById("colHead").textContent =
      state.view === "vehicle" ? "車輛 Vehicle" : (state.view === "driver" ? "車手 Driver" : "車手 Driver");

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:34px;text-align:center;color:var(--b-fg-dim);font-family:var(--font-mono);letter-spacing:.06em">此路線尚無紀錄 · No records on this route yet</td></tr>';
    } else {
      var best = rows[0].ms;
      tbody.innerHTML = rows.map(function (r, i) {
        var g = gap(r.ms, best);
        var leader = i === 0 ? " leader" : "";
        // primary cell: in vehicle view show vehicle as headline, driver underneath; else driver headline + vehicle col
        var headline, vehCol;
        if (state.view === "vehicle") {
          headline = r.vehicle; vehCol = r.driver;
        } else {
          headline = r.driver; vehCol = r.vehicle;
        }
        var badge = r.badge ? '<span class="bdg ' + r.badge.toLowerCase() + '">' + r.badge + '</span>' : '';
        var headCell = state.view === "vehicle"
          ? '<div class="veh-wrap"><image-slot class="veh-ph" id="veh-' + slug(r.vehicle) + '" shape="rounded" radius="3" placeholder="車"></image-slot>' +
              '<div class="c-driver">' + headline +
                '<span class="plat"><span class="pchip ' + (r.plat === "PCVR" ? "pcvr" : "") + '">' + r.plat + '</span>' + r.fps + ' fps · ' + r.date + '</span></div></div>'
          : '<div class="c-driver-wrap">' + avatarSlot(r.driver, "row-av") +
              '<div class="c-driver">' + headline +
                '<span class="plat"><span class="pchip ' + (r.plat === "PCVR" ? "pcvr" : "") + '">' + r.plat + '</span>' + r.fps + ' fps · ' + r.date + '</span></div></div>';
        return '<tr class="' + leader.trim() + '">' +
          '<td class="c-rank"><span class="rank">' + (i + 1) + '</span></td>' +
          '<td>' + headCell + '</td>' +
          '<td class="thead-veh c-veh">' + vehCol + '</td>' +
          '<td class="c-time"><span class="t mono">' + fmt(r.ms) + '</span></td>' +
          '<td class="c-gap"><span class="g mono' + (g.best ? ' best' : '') + '">' + g.txt + '</span></td>' +
          '<td class="c-badge">' + badge + '</td>' +
        '</tr>';
      }).join("");
    }

    // foot summary
    var totalRuns = v.routes.reduce(function (a, r) { return a + r.records.length; }, 0);
    var viewLabel = state.view === "route" ? "全部紀錄 all runs" : (state.view === "vehicle" ? "每車最快 best per vehicle" : "每位車手最快 best per driver");
    document.getElementById("footL").innerHTML = '顯示 <b>' + rows.length + '</b> 列 · ' + viewLabel;
    document.getElementById("footR").innerHTML = v.name + ' 共 <b>' + totalRuns + '</b> 筆紀錄 · <b>' + v.routes.length + '</b> 條路線';
  }

  function renderBoard() { renderRouteSeg(); renderTrackBanner(); renderHero(); renderTable(); }
  function renderAll() { renderActiveStrip(); renderBoard(); renderFinder(); renderClub(); }

  // ---- club / members ----
  function driverStats() {
    var stat = {}; // driver -> {TR,CR,PR,runs,veh:{}}
    function ensure(d) { return stat[d] || (stat[d] = { TR: 0, CR: 0, PR: 0, runs: 0, veh: {} }); }
    DATA.variants.forEach(function (v) {
      v.routes.forEach(function (r) {
        withBadges(r.records).forEach(function (rec) {
          var s = ensure(rec.driver);
          s.runs++; s.veh[rec.vehicle] = (s.veh[rec.vehicle] || 0) + 1;
          if (rec.badge) s[rec.badge]++;
        });
      });
    });
    return stat;
  }
  function topVeh(veh) {
    var best = "", n = -1;
    Object.keys(veh).forEach(function (k) { if (veh[k] > n) { n = veh[k]; best = k; } });
    return best;
  }
  function renderClub() {
    var stat = driverStats();
    var drivers = Object.keys(stat).sort(function (a, b) {
      return (stat[b].TR - stat[a].TR) || (stat[b].runs - stat[a].runs);
    });
    document.getElementById("members").innerHTML = drivers.map(function (d) {
      var s = stat[d];
      var chips = [];
      if (s.TR) chips.push('<span class="mb tr">TR<small>×' + s.TR + '</small></span>');
      if (s.CR) chips.push('<span class="mb cr">CR<small>×' + s.CR + '</small></span>');
      if (s.PR) chips.push('<span class="mb pr">PR<small>×' + s.PR + '</small></span>');
      while (chips.length < 3) chips.push('<span class="mb empty"></span>'); // reserved badge slots
      return '<div class="member">' +
        '<div class="member-photo"><image-slot id="photo-' + slug(d) + '" shape="rect" placeholder="個人照片"></image-slot></div>' +
        '<div class="member-body">' +
          avatarSlot(d, "member-av") +
          '<div class="member-name">' + d + '</div>' +
          '<div class="member-sub">' + s.runs + ' runs · 常用 ' + topVeh(s.veh) + '</div>' +
          '<div class="member-badges">' + chips.join("") + '</div>' +
        '</div></div>';
    }).join("");
  }

  // ---- selection ----
  function selectVariant(id) {
    state.variantId = id;
    state.routeId = firstNonEmptyRoute(variantById(id)).id;
    renderActiveStrip(); renderBoard();
    // toggle highlight in place (no list re-render — keeps scroll position)
    document.querySelectorAll(".trow").forEach(function (r) { r.classList.toggle("on", r.dataset.v === id); });
  }

  // ---- events ----
  // active strip: "change track" jumps to the finder and focuses search
  document.getElementById("activeStrip").addEventListener("click", function (e) {
    if (e.target.closest("#changeTrack")) {
      scrollToEl(document.getElementById("finderHead"));
      var s = document.getElementById("trackSearch"); if (s) setTimeout(function () { s.focus(); }, 380);
    }
  });
  // search (live filter)
  document.getElementById("trackSearch").addEventListener("input", function (e) {
    state.query = e.target.value; renderList();
  });
  // region chips
  document.getElementById("regionChips").addEventListener("click", function (e) {
    var b = e.target.closest(".rchip"); if (!b) return;
    state.region = b.dataset.g;
    renderRegionChips(); renderList();
  });
  // track list: collapse a region group, or select a track row
  document.getElementById("tlist").addEventListener("click", function (e) {
    var head = e.target.closest(".tg-head");
    if (head) {
      var grp = head.parentElement; var g = grp.dataset.g;
      var c = grp.classList.toggle("collapsed"); state.collapsed[g] = c; return;
    }
    var row = e.target.closest(".trow");
    if (row) { selectVariant(row.dataset.v); scrollToEl(document.getElementById("activeStrip")); }
  });
  document.getElementById("routeSeg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.routeId = b.dataset.r;
    document.querySelectorAll("#routeSeg button").forEach(function (x) { x.classList.toggle("on", x === b); });
    renderHero(); renderTable();
  });
  document.getElementById("viewSeg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.view = b.dataset.view;
    document.querySelectorAll("#viewSeg button").forEach(function (x) { x.classList.toggle("on", x === b); });
    renderTable();
  });
  document.getElementById("themeToggle").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.theme = b.dataset.theme;
    document.getElementById("board").classList.toggle("paper", state.theme === "paper");
    document.querySelectorAll("#themeToggle button").forEach(function (x) {
      var on = x === b; x.classList.toggle("on", on); x.classList.toggle("paper", on && state.theme === "paper");
    });
  });

  renderAll();
})();
