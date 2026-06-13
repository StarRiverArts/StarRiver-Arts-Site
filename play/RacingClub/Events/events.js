/* Events — JSON-fed static pages for Racing Club activities.
 * Mirrors the TimeAttack pattern: body[data-view] picks the renderer, data
 * comes from ./data/*.json (built by build_events.py). Reuses timeattack.css
 * component classes (ta-*) plus events.css for Events-specific bits.
 */
(() => {
  "use strict";

  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
  const bi = (zh, en) => `<span class="zh">${esc(zh || en || "")}</span><span class="en">${esc(en || zh || "")}</span>`;
  const qp = (k) => new URLSearchParams(location.search).get(k);

  const loadJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return res.json();
  };

  const setText = (sel, v) => { const n = document.querySelector(sel); if (n) n.textContent = v; };
  const setHtml = (sel, v) => { const n = document.querySelector(sel); if (n) n.innerHTML = v; };

  const module = (labelZh, labelEn, titleZh, titleEn, content) =>
    !content ? "" : `
      <section class="ta-content-card">
        <div class="ta-content-head">
          <div class="ta-headline-group">
            <div class="ta-label">${bi(labelZh, labelEn)}</div>
            <h2>${bi(titleZh, titleEn)}</h2>
          </div>
        </div>
        ${content}
      </section>`;

  const metricCards = (cards) => !Array.isArray(cards) || !cards.length ? "" : `
    <div class="ev-metrics">
      ${cards.map((c) => `
        <div class="ev-metric">
          <div class="ev-metric-value">${esc(c.value)}</div>
          <div class="ev-metric-label">${bi(c.label_zh, c.label_en)}</div>
          <div class="ev-metric-note">${bi(c.note_zh, c.note_en)}</div>
        </div>`).join("")}
    </div>`;

  const typeChip = (e) => `<span class="ev-chip ev-chip-type">${bi(e.type_label_zh, e.type_label_en)}</span>`;
  const statusChip = (e) => `<span class="ev-chip ev-status-${esc(e.status)}">${bi(e.status_label_zh, e.status_label_en)}</span>`;
  const pointsChip = (e) => e.is_points_event ? `<span class="ev-chip ev-chip-points">${bi("積分", "Points")}</span>` : "";
  const playerLink = (id, name) => id ? `<a class="ta-entity-link" href="./players.html?id=${encodeURIComponent(id)}">${esc(name || id)}</a>` : esc(name || "");
  const HONOR_SPECS = {
    1: { icon: "♛", zh: "冠軍", en: "Champion" },
    2: { icon: "✦", zh: "亞軍", en: "Runner-up" },
    3: { icon: "▲", zh: "季軍", en: "Third Place" },
    4: { icon: "◆", zh: "殿軍", en: "Fourth Place" },
  };
  const honorSpec = (rank) => HONOR_SPECS[Number(rank)] || null;
  const honorBadge = (rank, { compact = false } = {}) => {
    const spec = honorSpec(rank);
    if (!spec) return "";
    const title = `${spec.zh} / ${spec.en}`;
    return `
      <span class="ev-honor-badge is-rank-${rank}${compact ? " is-compact" : ""}" title="${esc(title)}">
        <span class="ev-honor-mark">${spec.icon}</span>
        <span class="ev-honor-copy">
          <strong class="ev-honor-title">${bi(spec.zh, spec.en)}</strong>
          ${compact ? `<small class="ev-honor-rank">#${rank}</small>` : `<small class="ev-honor-rank">TOP ${rank}</small>`}
        </span>
      </span>`;
  };
  const rankDisplay = (rank, { honors = false } = {}) => {
    if (honors && honorSpec(rank)) {
      return honorBadge(rank, { compact: true });
    }
    return `<span class="ev-rank-number">${esc(rank ?? "-")}</span>`;
  };
  const rankedRows = (rows) =>
    (rows || [])
      .filter((row) => Number.isFinite(Number(row.position)) && Number(row.position) > 0)
      .slice()
      .sort((a, b) => Number(a.position) - Number(b.position));
  const pickHonorMatch = (matches) =>
    (matches || [])
      .filter((m) => Array.isArray(m.results) && m.results.some((r) => r.status === "classified"))
      .sort((a, b) => {
        const score = (m) => {
          if (m.round === "最終名次") return 0;
          if (m.round === "qualifying") return 1;
          if (m.type === "time_attack") return 2;
          return 9;
        };
        return score(a) - score(b) || rankedRows(b.results).length - rankedRows(a.results).length;
      })[0] || null;
  const renderHonorStrip = (matches) => {
    const featured = pickHonorMatch(matches);
    if (!featured) return "";
    const rows = rankedRows(featured.results).filter((row) => Number(row.position) >= 1 && Number(row.position) <= 4);
    if (!rows.length) return "";
    const isTA = featured.type === "time_attack";
    return `
      <div class="ev-honor-strip">
        ${rows
          .map((row) => {
            const meta = [
              row.vehicle_name || "",
              isTA ? row.time_text || "" : row.status === "win" ? "W" : row.status === "loss" ? "L" : "",
              row.points ? `${row.points} pts` : "",
            ].filter(Boolean).join(" · ");
            return `
              <article class="ev-honor-card is-rank-${row.position}">
                ${honorBadge(row.position)}
                <div class="ev-honor-name">${playerLink(row.player_id, row.player_name)}</div>
                <div class="ev-honor-meta">${esc(meta || "-")}</div>
              </article>`;
          })
          .join("")}
      </div>`;
  };
  const topFourCounts = (results) =>
    [1, 2, 3, 4]
      .map((rank) => ({
        rank,
        count: (results || []).filter((row) => Number(row.position) === rank).length,
      }))
      .filter((row) => row.count > 0);
  const renderHonorSummary = (results, labelZh = "單場前四名", labelEn = "Top 4 Match Finishes") => {
    const tallies = topFourCounts(results);
    if (!tallies.length) return "";
    return `
      <div class="ev-honor-shell ev-honor-shell-compact">
        <div class="ta-label">${bi(labelZh, labelEn)}</div>
        <div class="ev-honor-tally-strip">
          ${tallies
            .map((row) => `
              <article class="ev-honor-tally is-rank-${row.rank}">
                ${honorBadge(row.rank, { compact: true })}
                <div class="ev-honor-tally-count">
                  <strong>${row.count}</strong>
                  <span>${bi("次得名", "finishes")}</span>
                </div>
              </article>`)
            .join("")}
        </div>
      </div>`;
  };

  // ── overview ──
  const renderOverview = (d) => {
    const recent = (d.recent_results || []).map((r) => `
      <a class="ev-row ev-row-link" href="${esc(r.href)}">
        <span class="ev-row-date">${esc(r.date)}</span>
        <span class="ev-row-main"><strong>${bi(r.title, r.title_en)}</strong>
          <span class="ev-row-sub">${bi(r.type_label_zh, r.type_label_en)} · ${bi(r.summary_zh, r.summary_en)}</span></span>
      </a>`).join("");
    const upcoming = (d.upcoming_events || []).map((e) => `
      <a class="ev-row ev-row-link" href="${esc(e.href)}">
        <span class="ev-row-date">${esc(e.date)}</span>
        <span class="ev-row-main"><strong>${bi(e.title, e.title_en)}</strong>
          <span class="ev-row-sub">${bi(e.type_label_zh, e.type_label_en)} · ${esc(e.host)} ${e.is_points_event ? "· " + "積分" : ""}</span></span>
      </a>`).join("");
    const series = (d.active_series || []).map((s) => `
      <article class="ev-series-card">
        <div class="ev-series-head">
          <h3>${bi(s.display_name, s.display_name_en)}</h3>
          <span class="ev-chip ev-status-${esc(s.status)}">${bi("進行中", "Active")}</span>
        </div>
        <div class="ev-series-progress">${bi("已完成", "Done")} ${s.progress_done} / ${s.progress_total} ${bi("場", "events")}</div>
        ${s.next_event ? `<div class="ev-series-line">${bi("下一場", "Next")}: <a class="ta-entity-link" href="${esc(s.next_event.href)}">${esc(s.next_event.title)}</a> · ${esc(s.next_event.date)}</div>` : ""}
        ${s.last_event ? `<div class="ev-series-line">${bi("最近結果", "Latest")}: <a class="ta-entity-link" href="${esc(s.last_event.href)}">${esc(s.last_event.title)}</a>${s.last_event.winner_name ? " · " + esc(s.last_event.winner_name) : ""}</div>` : ""}
        ${(s.standings_top || []).length
          ? `<div class="ev-series-standings">${s.standings_top
              .map((p) => `<span class="ev-series-honor">${rankDisplay(p.rank, { honors: true })}<span>${esc(p.name)} — ${p.points} pts</span></span>`)
              .join("")}</div>`
          : ""}
        <a class="ta-tm-btn" href="${esc(s.href)}">${bi("查看系列賽", "Open Series")}</a>
      </article>`).join("");

    const quick = `
      <div class="ev-quick">
        ${[["./calendar.html", "賽事日曆", "Calendar"], ["./players.html", "玩家戰績", "Drivers"],
           ["./tracks.html", "賽道戰績", "Tracks"], ["./vehicles.html", "車輛戰績", "Vehicles"],
           ["./teams.html", "車隊戰績", "Teams"], ["../TimeAttack/", "Time Attack 紀錄", "Time Attack"]]
          .map(([h, zh, en]) => `<a class="ta-tm-btn" href="${h}">${bi(zh, en)}</a>`).join("")}
      </div>`;

    return [
      metricCards(d.metric_cards),
      module("近期結果", "Recent Results", "最近完成", "Latest Finished", recent || `<p class="ta-empty">${bi("尚無結果", "No results yet")}</p>`),
      module("即將活動", "Upcoming", "接下來", "What's Next", upcoming || `<p class="ta-empty">${bi("尚無排定活動", "Nothing scheduled")}</p>`),
      (d.active_series || []).length ? module("進行中系列賽", "Active Series", "賽季", "Seasons", `<div class="ev-series-grid">${series}</div>`) : "",
      module("快速入口", "Quick Links", "前往", "Go To", quick),
    ].filter(Boolean).join("");
  };

  // ── calendar ──
  const renderCalendar = (d) => {
    const events = d.events || [];
    if (!events.length) return `<p class="ta-empty">${bi("尚無活動", "No events")}</p>`;
    const hosts = Array.from(new Set(events.map((e) => e.host).filter(Boolean)));
    const filterBar = `
      <div class="ev-filter">
        <label class="ta-label">${bi("篩選", "Filter")}</label>
        <select class="ta-switch-select" data-ev-filter="scope">
          <option value="">${"全部"} / All</option>
          <option value="points">積分賽事 / Points</option>
          <option value="casual">休閒 / Casual</option>
        </select>
        <select class="ta-switch-select" data-ev-filter="host">
          <option value="">${"全部主辦"} / All hosts</option>
          ${hosts.map((h) => `<option value="${esc(h)}">${esc(h)}</option>`).join("")}
        </select>
      </div>`;
    const rows = events.map((e) => `
      <a class="ev-cal-row ev-row-link" href="${esc(e.href)}" data-host="${esc(e.host || "")}" data-points="${e.is_points_event ? "1" : "0"}">
        <span class="ev-cal-date">${esc(e.date)}</span>
        <span class="ev-cal-main">
          <strong>${bi(e.title, e.title_en)}</strong>
          <span class="ev-cal-chips">${typeChip(e)} ${statusChip(e)} ${pointsChip(e)} ${e.series_name ? `<span class="ev-chip">${esc(e.series_name)}</span>` : ""}</span>
        </span>
        <span class="ev-cal-meta">${esc(e.host || "")}${e.winner_name ? " · 🏆 " + esc(e.winner_name) : ""}</span>
      </a>`).join("");
    return filterBar + `<div class="ev-cal-list" data-ev-callist>${rows}</div>`;
  };

  // ── event detail ──
  const renderEvent = (data) => {
    const { events, matches, results } = data;
    const id = qp("id");
    const e = (events.events || []).find((x) => x.event_id === id) || (events.events || [])[0];
    if (!e) return `<p class="ta-empty">${bi("找不到活動", "Event not found")}</p>`;
    const evMatches = (matches.matches || []).filter((m) => m.event_id === e.event_id);
    const honorStrip = renderHonorStrip(evMatches);

    const head = `
      <article class="ta-content-card">
        <div class="ta-label">${esc(e.host || "")} · ${esc(e.date)}</div>
        <h2 class="ev-event-title">${bi(e.title, e.title_en)}</h2>
        <div class="ev-cal-chips">${typeChip(e)} ${statusChip(e)} ${pointsChip(e)}
          ${e.series_name ? `<a class="ev-chip ev-chip-link" href="${esc("./series.html?id=" + e.series_id)}">${esc(e.series_name)}</a>` : ""}</div>
        <p class="ta-section-text">${bi(e.description_zh, e.description_en)}</p>
        <div class="ev-meta-grid">
          <div><span class="ev-meta-k">${bi("時間", "Time")}</span><span>${esc((e.start_time || "").replace("T", " ").slice(0, 16))}</span></div>
          <div><span class="ev-meta-k">${bi("賽道", "Track")}</span><span>${(e.track_names || []).map(esc).join("、") || "-"}</span></div>
          <div><span class="ev-meta-k">${bi("參賽", "Drivers")}</span><span>${e.participant_count}</span></div>
          <div><span class="ev-meta-k">${bi("賽制", "Format")}</span><span>${bi(e.type_label_zh, e.type_label_en)}</span></div>
        </div>
        ${e.rules_zh ? `<p class="ta-section-text"><span class="ev-meta-k">${bi("規則", "Rules")}</span> ${bi(e.rules_zh, e.rules_en)}</p>` : ""}
        ${honorStrip ? `<div class="ev-honor-shell"><div class="ta-label">${bi("榮譽席次", "Honor Finishers")}</div>${honorStrip}</div>` : ""}
      </article>`;

    const matchBlocks = evMatches.map((m) => {
      const isTA = m.type === "time_attack";
      const rows = (m.results || []).map((r) => `
        <tr class="${(isTA || r.status === "classified") && honorSpec(r.position) ? `ev-place-row is-rank-${r.position}` : ""}">
          <td class="ta-record-rank ev-rank-cell">${rankDisplay(r.position, { honors: (isTA || r.status === "classified") })}</td>
          <td>${playerLink(r.player_id, r.player_name)}${r.team_name ? `<span class="ev-row-sub"> · ${esc(r.team_name)}</span>` : ""}</td>
          <td>${esc(r.vehicle_name || "")}</td>
          <td class="ta-record-time">${isTA ? esc(r.time_text) : (r.status === "win" ? bi("勝", "W") : bi("敗", "L"))}</td>
          <td>${r.points ? r.points + " pts" : ""}</td>
        </tr>`).join("");
      return `
        <div class="ev-match">
          <div class="ev-match-head">${m.round_label_zh ? bi(m.round_label_zh, m.round_label_en) + " · " : ""}${esc(m.track_name)}${m.winner_name ? ` · 🏆 ${esc(m.winner_name)}` : ""}</div>
          <table class="ta-record-table"><thead><tr>
            <th>#</th><th>${bi("車手", "Driver")}</th><th>${bi("車輛", "Vehicle")}</th>
            <th>${isTA ? bi("時間", "Time") : bi("勝負", "Result")}</th><th>${bi("積分", "Pts")}</th>
          </tr></thead><tbody>${rows}</tbody></table>
        </div>`;
    }).join("");

    const taLinks = (e.track_ids || []).map((t) =>
      `<a class="ta-tm-btn" href="../TimeAttack/track.html?id=${encodeURIComponent(t)}">${bi("此賽道 TimeAttack 榜", "TimeAttack board")}</a>`).join(" ");

    return head
      + module("戰績", "Matches", "單場結果", "Match Results", matchBlocks || `<p class="ta-empty">${bi("尚無戰績", "No matches")}</p>`)
      + module("相關紀錄", "Related", "開放計時", "Open Records", taLinks || "");
  };

  // ── series detail ──
  const renderSeries = (d) => {
    const id = qp("id");
    const s = (d.series || []).find((x) => x.series_id === id) || (d.series || [])[0];
    if (!s) return `<p class="ta-empty">${bi("找不到系列賽", "Series not found")}</p>`;
    const head = `
      <article class="ta-content-card">
        <div class="ta-label">${bi("系列賽 / 賽季", "Series / Season")}</div>
        <h2 class="ev-event-title">${bi(s.display_name, s.display_name_en)}</h2>
        <div class="ev-series-progress">${bi("已完成", "Done")} ${s.progress_done} / ${s.progress_total} ${bi("場", "events")}</div>
        <p class="ta-section-text">${bi(s.scope_zh, s.scope_en)}</p>
        <p class="ta-section-text"><span class="ev-meta-k">${bi("積分規則", "Points")}</span> ${bi(s.points_rule_zh, s.points_rule_en)}</p>
      </article>`;
    const cal = (s.events || []).map((e) => `
      <a class="ev-cal-row ev-row-link" href="${esc(e.href)}">
        <span class="ev-cal-date">${esc(e.date)}</span>
        <span class="ev-cal-main"><strong>${bi(e.title, e.title_en)}</strong>
          <span class="ev-cal-chips"><span class="ev-chip ev-chip-type">${bi(e.type_label_zh, e.type_label_en)}</span>
          <span class="ev-chip ev-status-${esc(e.status)}">${bi(e.status_label_zh, e.status_label_en)}</span></span></span>
        <span class="ev-cal-meta">${e.winner_name ? "🏆 " + esc(e.winner_name) : ""}</span>
      </a>`).join("");
    const standTable = (rows, isTeam) => !rows.length ? `<p class="ta-empty">${bi("尚無積分", "No points yet")}</p>` : `
      <table class="ta-record-table"><thead><tr>
        <th>#</th><th>${isTeam ? bi("車隊", "Team") : bi("車手", "Driver")}</th>${isTeam ? "" : `<th>${bi("車隊", "Team")}</th>`}<th>${bi("積分", "Points")}</th>
      </tr></thead><tbody>${rows.map((r) => `
        <tr class="${honorSpec(r.rank) ? `ev-place-row is-rank-${r.rank}` : ""}"><td class="ta-record-rank ev-rank-cell">${rankDisplay(r.rank, { honors: true })}</td>
          <td>${isTeam ? esc(r.name) : playerLink(r.player_id, r.name)}</td>
          ${isTeam ? "" : `<td>${esc(r.team_name || "")}</td>`}
          <td class="ta-record-time">${r.points}</td></tr>`).join("")}</tbody></table>`;
    return head
      + module("賽程", "Schedule", "賽季活動", "Season Events", `<div class="ev-cal-list">${cal}</div>`)
      + module("積分", "Standings", "玩家積分", "Driver Standings", standTable(s.standings.players, false))
      + module("車隊積分", "Team Standings", "車隊", "Teams", standTable(s.standings.teams, true));
  };

  // ── stats list pages (players/tracks/vehicles/teams) ──
  const statColumns = {
    players: { key: "players", cols: [["name", "車手", "Driver", "link"], ["team_name", "車隊", "Team"], ["events", "參賽", "Events"], ["wins", "勝", "Wins"], ["win_rate", "勝率", "Win%"], ["points", "積分", "Pts"], ["top_vehicle", "常用車", "Top Car"]] },
    teams: { key: "teams", cols: [["name", "車隊", "Team"], ["member_count", "成員", "Members"], ["events", "參賽", "Events"], ["wins", "勝", "Wins"], ["points", "積分", "Pts"]] },
    tracks: { key: "tracks", cols: [["name", "賽道", "Track", "ta"], ["events", "賽事", "Events"], ["matches", "場次", "Matches"], ["best_time_text", "最快活動成績", "Best"]] },
    vehicles: { key: "vehicles", cols: [["name", "車輛", "Vehicle", "ta"], ["uses", "總出場", "Entries"], ["duels", "對戰", "Duels"], ["wins", "對戰勝", "Duel Wins"], ["win_rate", "對戰勝率", "Duel Win%"], ["best_time_text", "最佳計時", "Best Lap"]] },
  };
  const ID_FIELD = { players: "player_id", teams: "team_id", tracks: "track_id", vehicles: "vehicle_id" };
  const selfLink = (view, id, name) =>
    id ? `<a class="ta-entity-link" href="./${view}.html?id=${encodeURIComponent(id)}">${esc(name || id)}</a>` : esc(name || "");
  const backLink = (view, zh, en) => `<a class="ta-tm-btn" href="./${view}.html">← ${bi(zh, en)}</a>`;
  const notFound = (view) => `<p class="ta-empty">${bi("找不到資料", "Not found")}</p>${backLink(view, "返回清單", "Back")}`;

  const renderStatsList = (view, d) => {
    const cfg = statColumns[view];
    const rows = d[cfg.key] || [];
    if (!rows.length) return `<p class="ta-empty">${bi("尚無資料", "No data")}</p>`;
    const head = cfg.cols.map((c) => `<th>${bi(c[1], c[2])}</th>`).join("");
    const body = rows.map((r) => `<tr>${cfg.cols.map((c, ci) => {
      const v = r[c[0]];
      if (ci === 0) {
        const link = selfLink(view, r[ID_FIELD[view]], v);
        return `<td>${link}${r.ta_href ? ` <a class="ta-entity-link" href="${esc(r.ta_href)}">TA</a>` : ""}</td>`;
      }
      return `<td>${esc(v ?? "-")}</td>`;
    }).join("")}</tr>`).join("");
    const note = view === "players" || view === "teams"
      ? `<p class="ta-section-text">${bi("積分僅計入系列賽積分賽事;開放計時紀錄請看 TimeAttack。", "Points come from series points-events only; open lap records live in TimeAttack.")}</p>`
      : view === "vehicles"
        ? `<p class="ta-section-text">${bi("車輛統計以單場出場與對戰計算;點進車輛頁可查看每一場次。", "Vehicle stats are match-based entries and duel results; open a vehicle page to inspect each match.")}</p>`
        : `<p class="ta-section-text">${bi("此處為活動內成績;完整開放計時榜請看 TimeAttack。", "Activity results only; full open boards live in TimeAttack.")}</p>`;
    return note + `<div class="ta-track-table-wrap"><table class="ta-record-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  };

  const statChip = (zh, en, val) => `<span class="ev-stat-chip"><b>${esc(val)}</b> ${bi(zh, en)}</span>`;
  const eventIndex = (loaded) => Object.fromEntries(((loaded.events && loaded.events.events) || []).map((e) => [e.event_id, e]));
  const matchIndex = (loaded) => {
    const byId = {};
    const groups = new Map();
    const eventSeq = new Map();
    ((loaded.matches && loaded.matches.matches) || []).forEach((m) => {
      const eventOrder = (eventSeq.get(m.event_id) || 0) + 1;
      eventSeq.set(m.event_id, eventOrder);
      byId[m.match_id] = { ...m, event_order: eventOrder };
      const groupKey = `${m.event_id}::${m.round_label_zh || m.round || m.type || ""}`;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(m.match_id);
    });
    groups.forEach((ids) => ids.forEach((id, idx) => {
      if (!byId[id]) return;
      byId[id].round_order = idx + 1;
      byId[id].round_total = ids.length;
    }));
    return byId;
  };
  const sortEntityResults = (results, evIdx, matchIdx) => (results || []).slice().sort((a, b) => {
    const dateCmp = ((evIdx[b.event_id] || {}).date || "").localeCompare((evIdx[a.event_id] || {}).date || "");
    if (dateCmp) return dateCmp;
    const eventCmp = ((matchIdx[a.match_id] || {}).event_order || 999) - ((matchIdx[b.match_id] || {}).event_order || 999);
    if (eventCmp) return eventCmp;
    return Number(a.position || 999) - Number(b.position || 999);
  });
  const eventLinkCell = (ev, fallbackId) => {
    const title = ev.href
      ? `<a class="ta-entity-link" href="${esc(ev.href)}">${bi(ev.title || fallbackId, ev.title_en || ev.title || fallbackId)}</a>`
      : bi(ev.title || fallbackId, ev.title_en || ev.title || fallbackId);
    return `<div class="ev-table-stack"><div class="ev-table-title">${title}</div>${ev.date ? `<div class="ev-table-sub">${esc(ev.date)}</div>` : ""}</div>`;
  };
  const matchRoundHtml = (m) => {
    if (!m) return "";
    if (m.round_label_zh) return bi(m.round_label_zh, m.round_label_en || m.round_label_zh);
    return esc(m.round || m.type || m.match_id || "");
  };
  const matchLinkCell = (m) => {
    if (!m) return `<span class="ev-table-sub">${bi("缺少場次資料", "Missing match metadata")}</span>`;
    const meta = [];
    if ((m.round_total || 0) > 1) meta.push(bi(`第${m.round_order}戰`, `Match ${m.round_order}`));
    if (m.track_name) meta.push(esc(m.track_name));
    return `<div class="ev-table-stack"><div class="ev-table-title">${matchRoundHtml(m)}</div>${meta.length ? `<div class="ev-table-sub">${meta.join(" · ")}</div>` : ""}</div>`;
  };

  const entityResultsTable = (results, evIdx, matchIdx, { honors = false, entity = "player" } = {}) => {
    if (!results.length) return `<p class="ta-empty">${bi("尚無戰績", "No results")}</p>`;
    const rows = sortEntityResults(results, evIdx, matchIdx).map((r) => {
      const ev = evIdx[r.event_id] || {};
      const match = matchIdx[r.match_id] || {};
      const res = match.type !== "time_attack"
        ? (r.status === "win" ? bi("勝", "W") : r.status === "loss" ? bi("敗", "L") : "-")
        : (r.time_text || "-");
      const isHonor = honors && honorSpec(r.position);
      const entityCell = entity === "vehicle"
        ? playerLink(r.player_id, r.player_name)
        : entity === "team"
          ? `${playerLink(r.player_id, r.player_name)}${r.vehicle_name ? `<span class="ev-row-sub"> · ${esc(r.vehicle_name)}</span>` : ""}`
          : esc(r.vehicle_name || "");
      return `<tr class="${isHonor ? `ev-place-row is-rank-${r.position}` : ""}">
        <td>${eventLinkCell(ev, r.event_id)}</td>
        <td>${matchLinkCell(match)}</td>
        <td>${entityCell}</td>
        <td class="ta-record-rank ev-rank-cell">${rankDisplay(r.position, { honors })}</td>
        <td class="ta-record-time">${res}</td>
        <td>${r.points ? r.points + " pts" : ""}</td></tr>`;
    }).join("");
    const subjectHead = entity === "vehicle"
      ? bi("車手", "Driver")
      : entity === "team"
        ? bi("車手 / 車輛", "Driver / Car")
        : bi("車輛", "Vehicle");
    return `<div class="ta-track-table-wrap"><table class="ta-record-table"><thead><tr>
      <th>${bi("活動", "Event")}</th><th>${bi("場次", "Match")}</th><th>${subjectHead}</th><th>#</th>
      <th>${bi("成績", "Result")}</th><th>${bi("積分", "Pts")}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  };

  const renderPlayerDetail = (loaded, id) => {
    const p = ((loaded.players && loaded.players.players) || []).find((x) => x.player_id === id);
    if (!p) return notFound("players");
    const evIdx = eventIndex(loaded);
    const matchIdx = matchIndex(loaded);
    const results = ((loaded.results && loaded.results.results) || [])
      .filter((r) => r.player_id === id);
    const honorSummary = renderHonorSummary(results, "單場前四名", "Top 4 Match Finishes");
    const head = `<article class="ta-content-card">
      ${backLink("players", "返回玩家清單", "Back to Drivers")}
      <h2 class="ev-event-title">${esc(p.name)}</h2>
      <div class="ev-cal-chips">${p.team_name ? `<a class="ev-chip ev-chip-link" href="./teams.html?id=${encodeURIComponent(p.team_id)}">${esc(p.team_name)}</a>` : ""}
        <a class="ev-chip ev-chip-link" href="../TimeAttack/player.html?id=${encodeURIComponent(id)}">TimeAttack ${bi("計時檔案", "Profile")}</a></div>
      <div class="ev-stat-chips">${statChip("參賽", "Events", p.events)}${statChip("勝", "Wins", p.wins)}${statChip("敗", "Losses", p.losses)}${statChip("勝率", "Win%", p.win_rate)}${statChip("積分", "Points", p.points)}${statChip("常用車", "Top Car", p.top_vehicle || "-")}</div>
      ${honorSummary}
    </article>`;
    return head + module("戰績", "Results", "單場紀錄", "Match Results", entityResultsTable(results, evIdx, matchIdx, { honors: true, entity: "player" }));
  };

  const renderTeamDetail = (loaded, id) => {
    const t = ((loaded.teams && loaded.teams.teams) || []).find((x) => x.team_id === id);
    if (!t) return notFound("teams");
    const evIdx = eventIndex(loaded);
    const matchIdx = matchIndex(loaded);
    const results = ((loaded.results && loaded.results.results) || []).filter((r) => r.team_id === id);
    const members = (t.members || []).map((m) => esc(m)).join("、") || "-";
    const head = `<article class="ta-content-card">
      ${backLink("teams", "返回車隊清單", "Back to Teams")}
      <h2 class="ev-event-title">${esc(t.name)}</h2>
      <div class="ev-stat-chips">${statChip("成員", "Members", t.member_count)}${statChip("參賽", "Events", t.events)}${statChip("勝", "Wins", t.wins)}${statChip("積分", "Points", t.points)}</div>
      <p class="ta-section-text"><span class="ev-meta-k">${bi("成員", "Members")}</span> ${members}</p>
    </article>`;
    return head + module("戰績", "Results", "單場紀錄", "Match Results", entityResultsTable(results, evIdx, matchIdx, { honors: true, entity: "team" }));
  };

  const renderTrackDetail = (loaded, id) => {
    const t = ((loaded.tracks && loaded.tracks.tracks) || []).find((x) => x.track_id === id);
    if (!t) return notFound("tracks");
    const evIdx = eventIndex(loaded);
    const ms = ((loaded.matches && loaded.matches.matches) || []).filter((m) => m.track_id === id);
    const head = `<article class="ta-content-card">
      ${backLink("tracks", "返回賽道清單", "Back to Tracks")}
      <h2 class="ev-event-title">${esc(t.name)}</h2>
      <div class="ev-cal-chips"><a class="ev-chip ev-chip-link" href="../TimeAttack/track.html?id=${encodeURIComponent(id)}">TimeAttack ${bi("計時榜", "Board")}</a></div>
      <div class="ev-stat-chips">${statChip("賽事", "Events", t.events)}${statChip("場次", "Matches", t.matches)}${statChip("最快活動成績", "Best", t.best_time_text)}</div>
    </article>`;
    const rows = ms.map((m) => {
      const ev = evIdx[m.event_id] || {};
      return `<tr>
        <td>${ev.href ? `<a class="ta-entity-link" href="${esc(ev.href)}">${bi(ev.title || m.event_id, ev.title_en || "")}</a>` : esc(m.event_id)}</td>
        <td>${m.round_label_zh ? bi(m.round_label_zh, m.round_label_en) : bi(m.type, m.type)}</td>
        <td>${m.winner_name ? "🏆 " + esc(m.winner_name) : ""}</td></tr>`;
    }).join("");
    const tbl = ms.length ? `<div class="ta-track-table-wrap"><table class="ta-record-table"><thead><tr>
      <th>${bi("活動", "Event")}</th><th>${bi("輪次/賽制", "Round/Type")}</th><th>${bi("勝者", "Winner")}</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="ta-empty">${bi("尚無戰績", "No matches")}</p>`;
    return head + module("賽事", "Matches", "此賽道戰績", "Matches Here", tbl);
  };

  const renderVehicleDetail = (loaded, id) => {
    const v = ((loaded.vehicles && loaded.vehicles.vehicles) || []).find((x) => x.vehicle_id === id);
    if (!v) return notFound("vehicles");
    const evIdx = eventIndex(loaded);
    const matchIdx = matchIndex(loaded);
    const results = ((loaded.results && loaded.results.results) || [])
      .filter((r) => r.vehicle_id === id);
    const honorSummary = renderHonorSummary(results, "這台車的單場前四名", "Top 4 Match Finishes with This Car");
    const head = `<article class="ta-content-card">
      ${backLink("vehicles", "返回車輛清單", "Back to Vehicles")}
      <h2 class="ev-event-title">${esc(v.name)}</h2>
      <div class="ev-cal-chips"><a class="ev-chip ev-chip-link" href="../TimeAttack/vehicle.html?id=${encodeURIComponent(id)}">TimeAttack ${bi("車輛檔案", "Profile")}</a></div>
      <div class="ev-stat-chips">${statChip("總出場", "Entries", v.uses)}${statChip("對戰", "Duels", v.duels ?? "-")}${statChip("對戰勝", "Duel Wins", v.wins)}${statChip("對戰勝率", "Duel Win%", v.win_rate)}${statChip("最佳計時", "Best Lap", v.best_time_text)}</div>
      <p class="ta-section-text"><span class="ev-meta-k">${bi("使用車手", "Drivers")}</span> ${(v.drivers || []).map(esc).join("、") || "-"}</p>
      ${honorSummary}
    </article>`;
    return head + module("戰績", "Results", "單場紀錄", "Match Results", entityResultsTable(results, evIdx, matchIdx, { honors: true, entity: "vehicle" }));
  };

  const renderStats = (view, loaded) => {
    const id = qp("id");
    if (id) {
      if (view === "players") return renderPlayerDetail(loaded, id);
      if (view === "teams") return renderTeamDetail(loaded, id);
      if (view === "tracks") return renderTrackDetail(loaded, id);
      if (view === "vehicles") return renderVehicleDetail(loaded, id);
    }
    return renderStatsList(view, loaded[view]);
  };

  const FILES = {
    overview: ["summary.json"],
    calendar: ["events.json"],
    event: ["events.json", "matches.json", "results.json"],
    series: ["series.json"],
    players: ["players_stats.json", "results.json", "events.json", "matches.json"],
    teams: ["teams_stats.json", "results.json", "events.json", "matches.json"],
    tracks: ["tracks_stats.json", "matches.json", "events.json"],
    vehicles: ["vehicles_stats.json", "results.json", "events.json", "matches.json"],
  };
  const LABELS = {
    overview: ["活動總覽", "Events Overview"], calendar: ["賽事日曆", "Event Calendar"],
    event: ["賽事詳情", "Event"], series: ["系列賽 / 賽季", "Series"],
    players: ["玩家戰績", "Driver Records"], teams: ["車隊戰績", "Team Records"],
    tracks: ["賽道戰績", "Track Records"], vehicles: ["車輛戰績", "Vehicle Records"],
  };

  const attachCalendarFilter = () => {
    const list = document.querySelector("[data-ev-callist]");
    if (!list) return;
    const apply = () => {
      const scope = document.querySelector('[data-ev-filter="scope"]').value;
      const host = document.querySelector('[data-ev-filter="host"]').value;
      list.querySelectorAll(".ev-cal-row").forEach((row) => {
        const okHost = !host || row.dataset.host === host;
        const okScope = !scope || (scope === "points" && row.dataset.points === "1") || (scope === "casual" && row.dataset.points === "0");
        row.style.display = okHost && okScope ? "" : "none";
      });
    };
    document.querySelectorAll("[data-ev-filter]").forEach((el) => el.addEventListener("change", apply));
  };

  const init = async () => {
    const view = document.body.dataset.view || "overview";
    try {
      const manifest = await loadJson("./data/manifest.json");
      const files = FILES[view] || ["summary.json"];
      const loaded = {};
      await Promise.all(files.map(async (f) => {
        const key = f.replace("_stats.json", "").replace(".json", "");
        loaded[key] = await loadJson(`./data/${f}`);
      }));

      // primary = first declared file's payload (deterministic; Promise.all key order is not).
      const primaryKey = files[0].replace("_stats.json", "").replace(".json", "");
      const primary = loaded[primaryKey];
      const lab = LABELS[view] || LABELS.overview;
      setText("[data-page-title-zh]", (primary && primary.title_zh) || lab[0]);
      setText("[data-page-title-en]", (primary && primary.title_en) || lab[1]);
      setText("[data-page-desc-zh]", (primary && primary.description_zh) || "");
      setText("[data-page-desc-en]", (primary && primary.description_en) || "");
      setText("[data-generated-at]", manifest.generated_at || "pending");
      setText("[data-build-state]", manifest.build_state || "seed");

      let html = "";
      if (view === "overview") html = renderOverview(loaded.summary);
      else if (view === "calendar") html = renderCalendar(loaded.events);
      else if (view === "event") html = renderEvent({ events: loaded.events, matches: loaded.matches, results: loaded.results });
      else if (view === "series") html = renderSeries(loaded.series);
      else if (["players", "teams", "tracks", "vehicles"].includes(view)) html = renderStats(view, loaded);

      setHtml("[data-page-root]", html);
      if (view === "calendar") attachCalendarFilter();

      // sidebar notes
      setHtml("[data-sidebar-list]", `<ul class="ta-inline-list">${((primary && primary.sidebar_zh) || []).map((n, i) =>
        `<li>${bi(n, ((primary && primary.sidebar_en) || [])[i] || "")}</li>`).join("")}</ul>`);
    } catch (err) {
      console.error(err);
      setText("[data-build-state]", "load-error");
      setHtml("[data-page-root]", `<article class="ta-content-card"><h2 class="ta-section-title">Data Load Error</h2><p class="ta-section-text">${esc(String(err))}</p></article>`);
    }
  };

  init();
})();
