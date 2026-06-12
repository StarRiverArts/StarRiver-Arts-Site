const TA_ROUTE_LABELS = {
  overview: {
    zh: "總覽",
    en: "Overview",
  },
  tracks: {
    zh: "賽道",
    en: "Tracks",
  },
  track: {
    zh: "賽道詳情",
    en: "Track Detail",
  },
  players: {
    zh: "玩家",
    en: "Players",
  },
  player: {
    zh: "玩家檔案",
    en: "Driver File",
  },
  vehicles: {
    zh: "車輛",
    en: "Vehicles",
  },
  vehicle: {
    zh: "車輛檔案",
    en: "Car File",
  },
  events: {
    zh: "活動",
    en: "Events",
  },
  catalog: {
    zh: "索引",
    en: "Index",
  },
  info: {
    zh: "資訊",
    en: "Info",
  },
  review: {
    zh: "審核",
    en: "Review",
  },
  trackmap: {
    zh: "賽道地圖",
    en: "Track Map",
  },
};

const ENABLE_HISTORY_CHARTS = false;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });

const renderBilingual = (zh, en) => `
  <span class="zh">${escapeHtml(zh || "")}</span>
  <span class="en">${escapeHtml(en || "")}</span>
`;

// 表格內的車手 / 車輛名稱直接連到各自詳情頁(需 row 帶 player_id / vehicle_model_code)。
const taPlayerHref = (row) => (row && row.player_id ? `./player.html?id=${encodeURIComponent(row.player_id)}` : "");
const taVehicleHref = (row) => (row && row.vehicle_model_code ? `./vehicle.html?id=${encodeURIComponent(row.vehicle_model_code)}` : "");
const taEntityLink = (name, href) =>
  href ? `<a class="ta-entity-link" href="${href}">${escapeHtml(name || "")}</a>` : escapeHtml(name || "");

const renderCardLink = (href, labelZh, labelEn) => {
  if (!href) {
    return "";
  }
  return `
    <a class="ta-card-link" href="${escapeHtml(href)}">
      ${renderBilingual(labelZh || "開啟", labelEn || "Open")}
    </a>
  `;
};

const renderSummaryCards = (cards, options = {}) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return '<p class="ta-empty">No summary cards yet.</p>';
  }

  return `
    <div class="ta-summary-grid${options.compact ? " is-compact" : ""}" style="--ta-summary-count:${cards.length}">
      ${cards
        .map(
          (card) => `
            <article class="ta-summary-card">
              <div class="ta-label">
                ${renderBilingual(card.label_zh, card.label_en)}
              </div>
              <div class="ta-summary-value">${escapeHtml(card.value ?? "-")}</div>
              <p class="ta-summary-text">
                ${renderBilingual(card.note_zh, card.note_en)}
              </p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderPageSnapshot = (metricCards) => {
  if (!Array.isArray(metricCards) || metricCards.length === 0) {
    return "";
  }

  return `
    <section class="ta-content-card ta-page-info-card">
      <div class="ta-label">
        ${renderBilingual("頁面資訊", "Page Info")}
      </div>
      ${renderSummaryCards(metricCards, { compact: true })}
    </section>
  `;
};

const renderBoardCards = (cards) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return "";
  }

  return `
    <div class="ta-board-grid">
      ${cards
        .map(
          (card) => `
            <article class="ta-board-card">
              <div class="ta-label">
                ${renderBilingual(card.label_zh, card.label_en)}
              </div>
              <h3 class="ta-board-title">
                ${renderBilingual(card.title_zh, card.title_en)}
              </h3>
              <p class="ta-board-text">
                ${renderBilingual(card.description_zh, card.description_en)}
              </p>
              ${renderCardLink(card.href, card.href_label_zh, card.href_label_en)}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderSectionCards = (sections) => {
  if (!Array.isArray(sections) || sections.length === 0) {
    return "";
  }

  return `
    <div class="ta-section-grid">
      ${sections
        .map(
          (section) => `
            <article class="ta-content-card ta-content-card-inner">
              <div class="ta-label">
                ${renderBilingual(section.label_zh, section.label_en)}
              </div>
              <h3 class="ta-section-title">
                ${renderBilingual(section.title_zh, section.title_en)}
              </h3>
              <p class="ta-section-text">
                ${renderBilingual(section.body_zh, section.body_en)}
              </p>
              ${
                Array.isArray(section.items_zh) && section.items_zh.length
                  ? `
                    <ul class="ta-bullet-list">
                      ${section.items_zh
                        .map(
                          (item, index) => `
                            <li>
                              ${renderBilingual(item, (section.items_en || [])[index] || "")}
                            </li>
                          `,
                        )
                        .join("")}
                    </ul>
                  `
                  : ""
              }
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderModule = (labelZh, labelEn, titleZh, titleEn, content) => {
  if (!content) {
    return "";
  }
  return `
    <section class="ta-content-card">
      <div class="ta-content-head">
        <div class="ta-headline-group">
          <div class="ta-label">
            ${renderBilingual(labelZh, labelEn)}
          </div>
          <h2>
            ${renderBilingual(titleZh, titleEn)}
          </h2>
        </div>
      </div>
      ${content}
    </section>
  `;
};

const renderChipList = (chips) => {
  if (!Array.isArray(chips) || chips.length === 0) {
    return "";
  }
  return `
    <div class="ta-chip-list">
      ${chips.map((chip) => `<span class="ta-chip">${escapeHtml(chip)}</span>`).join("")}
    </div>
  `;
};

// ── Track board (leaderboard demo adaptation) ─────────────────────────────

const badgeTone = (row) => (row.badge_tone || row.badge_code || "").toLowerCase() || "empty";

const tagToneForText = (text) => {
  const value = String(text || "");
  if (!value) return "meta";
  if (/(山道|公路|高速公路|賽道|卡丁車|其他|Clockwise|Counter|Downhill|Uphill)/i.test(value)) {
    return "env";
  }
  if (/(高速|High|Speed|Long)/i.test(value)) {
    return "speed";
  }
  if (/(技術|髮夾|Technical|Hairpin|Switchback)/i.test(value)) {
    return "skill";
  }
  if (/(隧道|Tunnel|Night|City)/i.test(value)) {
    return "meta";
  }
  return "skill";
};

const renderToneChip = (text, tone) =>
  `<span class="ta-tag-chip is-${escapeHtml(tone || "meta")}">${escapeHtml(text || "")}</span>`;

const renderRouteTagChips = (row) => {
  const chips = [];
  if (row.track_env) {
    chips.push(renderToneChip(row.track_env, "env"));
  }
  (row.track_tags || []).slice(0, 2).forEach((tag) => {
    chips.push(renderToneChip(tag, tagToneForText(tag)));
  });
  return chips.length ? `<div class="ta-record-chiprow">${chips.join("")}</div>` : "";
};

const renderRecordBadge = (row) => {
  if (!row.badge_code) {
    return '<span class="ta-record-badge is-empty">—</span>';
  }
  return `
    <span class="ta-record-badge is-${escapeHtml(badgeTone(row))}">
      <span class="ta-record-badge-code">${escapeHtml(row.badge_code)}</span>
      <span class="ta-record-badge-text">${renderBilingual(row.badge_label_zh, row.badge_label_en)}</span>
    </span>
  `;
};

const renderTrackLegend = () => `
  <div class="ta-board-legend" aria-label="Badge legend">
    <span class="ta-record-badge is-tr"><span class="ta-record-badge-code">TR</span><span class="ta-record-badge-text">${renderBilingual("賽道紀錄", "Track Record")}</span></span>
    <span class="ta-record-badge is-cr"><span class="ta-record-badge-code">CR</span><span class="ta-record-badge-text">${renderBilingual("車輛紀錄", "Car Record")}</span></span>
    <span class="ta-record-badge is-pr"><span class="ta-record-badge-code">PR</span><span class="ta-record-badge-text">${renderBilingual("個人紀錄", "Personal Record")}</span></span>
  </div>
`;

const renderTrackLeaderboardTable = (rows, view) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '<p class="ta-board-empty">No records yet.</p>';
  }

  const primaryTitle =
    view === "vehicle"
      ? renderBilingual("車輛", "Vehicle")
      : renderBilingual("車手", "Driver");
  const peerTitle =
    view === "vehicle"
      ? renderBilingual("最快車手", "Fastest Driver")
      : renderBilingual("代表車輛", "Representative Car");

  return `
    <div class="ta-track-table-wrap">
      <table class="ta-record-table">
        <thead>
          <tr>
            <th>#</th>
            <th>${primaryTitle}</th>
            <th>${peerTitle}</th>
            <th>${renderBilingual("時間", "Time")}</th>
            <th>${renderBilingual("差距", "Gap")}</th>
            <th>${renderBilingual("標記", "Badge")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => {
              const primary =
                view === "vehicle"
                  ? taEntityLink(row.vehicle_model_name, taVehicleHref(row))
                  : taEntityLink(row.player_display_name, taPlayerHref(row));
              const peer =
                view === "vehicle"
                  ? taEntityLink(row.player_display_name, taPlayerHref(row))
                  : taEntityLink(row.vehicle_model_name, taVehicleHref(row));
              return `
                <tr class="ta-record-row${row.rank === 1 ? " is-leader" : ""}" data-plat="${escapeHtml(row.platform || "")}">
                  <td class="ta-record-rank">${escapeHtml(row.rank)}</td>
                  <td>
                    <div class="ta-record-primary">
                      <strong>${primary}</strong>
                      <div class="ta-record-meta">
                        <span>${escapeHtml((row.platform || "unknown").toUpperCase())}</span>
                        <span>${escapeHtml(row.record_date || "")}</span>
                        ${row.verified ? `<span class="ta-verified" title="${escapeHtml(row.proof_text || "")}">✓ <span class="zh">已驗證</span><span class="en">Verified</span></span>` : ""}
                      </div>
                      ${renderRouteTagChips(row)}
                    </div>
                  </td>
                  <td class="ta-record-peer">${peer}</td>
                  <td class="ta-record-time">${escapeHtml(row.lap_time_text || "-")}</td>
                  <td class="ta-record-gap">${escapeHtml(row.delta_to_best_text || "-")}</td>
                  <td class="ta-record-badge-cell">${renderRecordBadge(row)}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

const renderTrackRouteCard = (board, route) => {
  const metaChips = [board.track_env, board.track_shape, board.track_distance, board.difficulty]
    .filter(Boolean)
    .map((tag) => renderToneChip(tag, "meta"))
    .join("");
  const techChips = (board.tech_tags || []).map((tag) => renderToneChip(tag, tagToneForText(tag))).join("");
  const fastest = route.fastest;
  const fastestStrip = fastest
    ? `
      <div class="ta-fastest-strip">
        <div class="ta-fastest-kicker">
          <span class="ta-record-badge is-tr"><span class="ta-record-badge-code">TR</span><span class="ta-record-badge-text">${renderBilingual("目前最快", "Fastest Now")}</span></span>
        </div>
        <div class="ta-fastest-main">
          <strong>${taEntityLink(fastest.player_display_name, taPlayerHref(fastest))}</strong>
          <span>${taEntityLink(fastest.vehicle_model_name, taVehicleHref(fastest))}</span>
        </div>
        <div class="ta-fastest-time">${escapeHtml(fastest.lap_time_text || "-")}</div>
      </div>
    `
    : "";

  return `
    <article class="ta-track-board ta-route-card">
      <div class="ta-track-board-head">
        <div class="ta-label">${escapeHtml(board.world_name)}</div>
        <h3 class="ta-track-board-title">${escapeHtml(board.track_display_name)}</h3>
        <div class="ta-route-head">
          <div>
            <div class="ta-route-label">${escapeHtml(route.route_display_name)}</div>
            ${
              route.route_note_zh || route.route_note_en
                ? `<p class="ta-route-note">${renderBilingual(route.route_note_zh, route.route_note_en)}</p>`
                : ""
            }
          </div>
          <div class="ta-route-stat">${escapeHtml(route.record_count || 0)} ${renderBilingual("筆有效紀錄", "valid runs")}</div>
        </div>
        <div class="ta-track-chiprow">${metaChips}${techChips}</div>
      </div>
      ${fastestStrip}
      <div class="ta-board-view" data-board-view="route">
        ${renderTrackLeaderboardTable(route.route_rows, "route")}
      </div>
      <div class="ta-board-view" data-board-view="vehicle">
        ${renderTrackLeaderboardTable(route.vehicle_rows, "vehicle")}
      </div>
      <div class="ta-board-view" data-board-view="player">
        ${renderTrackLeaderboardTable(route.player_rows, "player")}
      </div>
    </article>
  `;
};

const renderTrackBoards = (data) => {
  const boards = data.boards || [];
  const platforms = data.platforms || [];
  const routeCards = boards.reduce((cards, board) => {
    (board.routes || []).forEach((route) => cards.push(renderTrackRouteCard(board, route)));
    return cards;
  }, []);

  const platBtns = [
    `<button class="ta-toggle-btn is-active" data-plat="all"><span class="zh">全部平台</span><span class="en">All Platforms</span></button>`,
    ...platforms.map(
      (platform) =>
        `<button class="ta-toggle-btn" data-plat="${escapeHtml(platform)}">${escapeHtml(platform.toUpperCase())}</button>`,
    ),
  ].join("");

  return `
    <div class="ta-board-controls">
      <div class="ta-toggle-group" data-view-toggle>
        <button class="ta-toggle-btn is-active" data-view="route">
          <span class="zh">賽道榜</span><span class="en">Route Board</span>
        </button>
        <button class="ta-toggle-btn" data-view="vehicle">
          <span class="zh">車輛榜</span><span class="en">Car Board</span>
        </button>
        <button class="ta-toggle-btn" data-view="player">
          <span class="zh">玩家榜</span><span class="en">Player Board</span>
        </button>
      </div>
      <div class="ta-toggle-group" data-plat-toggle>${platBtns}</div>
    </div>
    ${renderTrackLegend()}
    <div class="ta-boards-container" data-boards-container data-active-view="route" data-active-plat="all">
      ${routeCards.join("")}
    </div>
  `;
};

// ---- Tracks list (one card per track world, links into track.html detail) ----
const trackRunTotal = (board) =>
  (board.routes || []).reduce((sum, route) => sum + (route.record_count || 0), 0);

const renderTrackListCard = (board) => {
  const metaChips = [board.track_env, board.track_shape, board.track_distance, board.difficulty]
    .filter(Boolean)
    .map((tag) => renderToneChip(tag, "meta"))
    .join("");
  const techChips = (board.tech_tags || []).map((tag) => renderToneChip(tag, tagToneForText(tag))).join("");
  const id = encodeURIComponent(board.track_world_code);
  const routeLinks = (board.routes || [])
    .map(
      (route) => `
        <a class="ta-route-pill" href="./track.html?id=${id}&route=${encodeURIComponent(route.route_code)}">
          <span class="ta-route-pill-name">${escapeHtml(route.route_display_name)}</span>
          <span class="ta-route-pill-stat">${escapeHtml(route.record_count || 0)}</span>
        </a>
      `,
    )
    .join("");

  return `
    <article class="ta-track-board ta-track-list-card">
      <a class="ta-track-list-head" href="./track.html?id=${id}">
        <div class="ta-label">${escapeHtml(board.world_name)}</div>
        <h3 class="ta-track-board-title">${escapeHtml(board.track_display_name)}</h3>
        <div class="ta-track-list-stat">
          ${escapeHtml((board.routes || []).length)} ${renderBilingual("條路線", "routes")}
          ・ ${escapeHtml(trackRunTotal(board))} ${renderBilingual("筆紀錄", "runs")}
        </div>
      </a>
      <div class="ta-track-chiprow">${metaChips}${techChips}</div>
      <div class="ta-route-pill-row">${routeLinks}</div>
    </article>
  `;
};

const renderTrackList = (data) => {
  const boards = data.boards || [];
  if (!boards.length) {
    return '<p class="ta-empty">No track worlds yet.</p>';
  }
  return `
    ${renderTrackLegend()}
    <div class="ta-track-list-grid">
      ${boards.map(renderTrackListCard).join("")}
    </div>
  `;
};

// ---- Single track detail (reuses renderTrackBoards with a one-board subset) ----
const getQueryParam = (key) => {
  try {
    return new URLSearchParams(window.location.search).get(key) || "";
  } catch (error) {
    return "";
  }
};

// In-page lateral switcher: filter box + dropdown + prev/next to jump ids.
const renderDetailSwitcher = (kind, items, currentId, labelZh, labelEn) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }
  const options = items
    .map(
      (item) =>
        `<option value="${escapeHtml(item.id)}"${item.id === currentId ? " selected" : ""}>${escapeHtml(item.name)}</option>`,
    )
    .join("");
  return `
    <div class="ta-detail-switch" data-detail-switch-kind="${escapeHtml(kind)}">
      <span class="ta-label ta-switch-label">${renderBilingual(labelZh, labelEn)}</span>
      <button type="button" class="ta-switch-btn" data-switch-step="-1" aria-label="Previous">◀</button>
      <input type="text" class="ta-switch-filter" data-switch-filter placeholder="篩選 / Filter…" autocomplete="off">
      <select class="ta-switch-select" data-switch-select aria-label="Switch">${options}</select>
      <button type="button" class="ta-switch-btn" data-switch-step="1" aria-label="Next">▶</button>
    </div>
  `;
};

// A provided-but-unknown id must not silently render the first entry.
const renderDetailNotFound = (kindZh, kindEn, id, backHref, backZh, backEn) => `
  <article class="ta-content-card ta-content-card-inner">
    <h2 class="ta-section-title">${renderBilingual("找不到" + kindZh, kindEn + " not found")}</h2>
    <p class="ta-section-text">
      ${renderBilingual("沒有對應的" + kindZh + "資料：", "No matching " + kindEn.toLowerCase() + " for id:")}
      <code>${escapeHtml(id || "(empty)")}</code>
    </p>
    <a class="ta-card-link" href="${escapeHtml(backHref)}">${renderBilingual(backZh, backEn)}</a>
  </article>
`;

const renderTrackDetail = (data, id, routeCode) => {
  const boards = data.boards || [];
  if (!boards.length) {
    return '<p class="ta-empty">No tracks yet.</p>';
  }
  const board = id ? boards.find((item) => item.track_world_code === id) : boards[0];
  if (!board) {
    return renderDetailNotFound("賽道", "Track", id, "./tracks.html", "返回賽道清單", "Back to Tracks");
  }
  // If a specific route is requested, narrow the board to that route.
  let focusBoard = board;
  if (routeCode) {
    const route = (board.routes || []).find((item) => item.route_code === routeCode);
    if (route) {
      focusBoard = { ...board, routes: [route] };
    }
  }
  const switcher = renderDetailSwitcher(
    "track",
    boards.map((item) => ({ id: item.track_world_code, name: item.track_display_name })),
    board.track_world_code,
    "切換賽道",
    "Switch Track",
  );
  const header = `
    <article class="ta-track-board ta-track-detail-head">
      <div class="ta-label">${escapeHtml(board.world_name)}</div>
      <h2 class="ta-track-board-title">${escapeHtml(board.track_display_name)}</h2>
      <div class="ta-track-list-stat">
        ${escapeHtml((board.routes || []).length)} ${renderBilingual("條路線", "routes")}
        ・ ${escapeHtml(trackRunTotal(board))} ${renderBilingual("筆紀錄", "runs")}
      </div>
    </article>
  `;
  const analysis = renderTrackAnalysis(board);
  // 放在排行榜「之前」:熱門賽道的榜單可長達上萬 px,分析若擺頁尾會被埋到滾不到。
  const analysisModule = analysis
    ? renderModule("圈速分布", "Lap Spread", "競爭密度", "Competition Density", analysis)
    : "";
  return switcher + header + analysisModule + renderTrackBoards({ boards: [focusBoard], platforms: data.platforms });
};

// Lateral id switching for the detail pages (track/player/vehicle).
const attachDetailSwitchListeners = () => {
  const root = document.querySelector("[data-detail-switch-kind]");
  if (!root) {
    return;
  }
  const select = root.querySelector("[data-switch-select]");
  const filter = root.querySelector("[data-switch-filter]");
  if (!select) {
    return;
  }
  const go = (id) => {
    if (id) {
      window.location.search = "?id=" + encodeURIComponent(id);
    }
  };
  select.addEventListener("change", () => go(select.value));
  root.querySelectorAll("[data-switch-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const visible = Array.from(select.options).filter((opt) => !opt.hidden);
      const idx = visible.findIndex((opt) => opt.value === select.value);
      const next = visible[idx + Number(btn.dataset.switchStep)];
      if (next) {
        go(next.value);
      }
    });
  });
  if (filter) {
    filter.addEventListener("input", () => {
      const q = filter.value.trim().toLowerCase();
      Array.from(select.options).forEach((opt) => {
        opt.hidden = q !== "" && !opt.textContent.toLowerCase().includes(q);
      });
    });
  }
};

const attachBoardToggleListeners = () => {
  document.addEventListener("click", (e) => {
    const viewBtn = e.target.closest("[data-view-toggle] [data-view]");
    if (viewBtn) {
      document.querySelectorAll("[data-view-toggle] .ta-toggle-btn").forEach((button) =>
        button.classList.remove("is-active"),
      );
      viewBtn.classList.add("is-active");
      const container = document.querySelector("[data-boards-container]");
      if (container) {
        container.dataset.activeView = viewBtn.dataset.view;
      }
    }

    const platBtn = e.target.closest("[data-plat-toggle] [data-plat]");
    if (platBtn) {
      document.querySelectorAll("[data-plat-toggle] .ta-toggle-btn").forEach((button) =>
        button.classList.remove("is-active"),
      );
      platBtn.classList.add("is-active");
      const container = document.querySelector("[data-boards-container]");
      if (container) {
        container.dataset.activePlat = platBtn.dataset.plat;
      }
    }
  });
};

// ── Track group rows (player/vehicle pages) ────────────────────────────────

const renderTrackGroupRows = (groups, subKey) => {
  if (!groups || groups.length === 0) return "";
  return groups
    .map(
      (g) => `
      <div class="ta-track-group">
        <div class="ta-track-group-label">${escapeHtml(g.env)}</div>
        <div class="ta-detail-list">
          ${g.rows
            .map(
              (row, i) => `
            <div class="ta-mini-row ta-mini-row-track">
              <span class="ta-mini-rank">${i + 1}</span>
              <span class="ta-mini-name">${escapeHtml(row.track_name || "")}</span>
              <span class="ta-mini-sub">${escapeHtml(row[subKey] || "")}</span>
              <span class="ta-mini-plat">${escapeHtml((row.platform || "").toUpperCase())}</span>
              <span class="ta-mini-time">${escapeHtml(row.lap_time_text || "")}</span>
            </div>`,
            )
            .join("")}
        </div>
      </div>`,
    )
    .join("");
};

const renderStatPills = (stats) => {
  if (!Array.isArray(stats) || stats.length === 0) {
    return "";
  }
  return `
    <div class="ta-stat-grid" style="--ta-stat-count:${stats.length}">
      ${stats
        .map(
          (stat) => `
            <div class="ta-stat-pill">
              <div class="ta-label">
                ${renderBilingual(stat.label_zh, stat.label_en)}
              </div>
              <strong>${escapeHtml(stat.value ?? "-")}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderCounterRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '<p class="ta-empty">No counters yet.</p>';
  }
  return `
    <div class="ta-counter-list">
      ${rows
        .map(
          (row) => `
            <div class="ta-counter-row">
              <span class="ta-counter-label">${escapeHtml(row.label || row.route_label || "")}</span>
              <span class="ta-counter-value">${escapeHtml(row.value ?? row.lap_time_text ?? "-")}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderDetailRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '<p class="ta-empty">No detail rows yet.</p>';
  }
  return `
    <div class="ta-detail-list">
      ${rows
        .map(
          (row) => `
            <div class="ta-mini-row">
              <span class="ta-mini-rank">${escapeHtml(row.rank)}</span>
              <span class="ta-mini-name">${escapeHtml(row.route_label || "")}</span>
              <span class="ta-mini-sub">${escapeHtml(row.sub_label || "")}</span>
              <span class="ta-mini-time">${escapeHtml(row.lap_time_text || row.value || "-")}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderHistoryChart = (route) => {
  const runs = route.runs;
  if (!runs || runs.length < 2) return "";

  const W = 320;
  const H = 72;
  const PAD = { top: 12, right: 6, bottom: 18, left: 28 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const dates = runs.map((r) => new Date(r.date + "T00:00:00Z").getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateSpan = maxDate - minDate || 1;

  const times = runs.map((r) => r.lap_time_ms);
  const bestMs = Math.min(...times);
  const worstMs = Math.max(...times);
  const deltaSpan = worstMs - bestMs || 1;

  const toX = (i) =>
    PAD.left + ((dates[i] - minDate) / dateSpan) * plotW;
  const toY = (ms) =>
    PAD.top + ((ms - bestMs) / deltaSpan) * plotH;

  const pts = runs.map((r, i) => `${toX(i).toFixed(1)},${toY(r.lap_time_ms).toFixed(1)}`).join(" ");

  const dots = runs
    .map((r, i) => {
      const cx = toX(i).toFixed(1);
      const cy = toY(r.lap_time_ms).toFixed(1);
      const cls = r.is_pb ? "ta-chart-dot is-pb" : "ta-chart-dot";
      const deltaText = `+${((r.lap_time_ms - bestMs) / 1000).toFixed(3)}`;
      const tip = `${r.date} · ${r.lap_time_text} · ${escapeHtml(r.vehicle)} · ${deltaText}`;
      return `<circle cx="${cx}" cy="${cy}" r="3.5" class="${cls}"><title>${tip}</title></circle>`;
    })
    .join("");

  const firstMs = runs[0].lap_time_ms;
  const lastMs = runs[runs.length - 1].lap_time_ms;
  const diffMs = firstMs - lastMs;
  const diffSign = diffMs > 0 ? "▼ " : diffMs < 0 ? "▲ " : "";
  const diffText = diffMs !== 0 ? `${diffSign}${Math.abs(diffMs / 1000).toFixed(3)}s` : "持平";
  const diffCls = diffMs > 0 ? "is-improve" : diffMs < 0 ? "is-regress" : "";
  const bestRun = runs.reduce(
    (currentBest, run) => (run.lap_time_ms < currentBest.lap_time_ms ? run : currentBest),
    runs[0],
  );

  return `
    <div class="ta-history-block">
      <div class="ta-history-route-label">${escapeHtml(route.route_label)}</div>
      <svg viewBox="0 0 ${W} ${H}" class="ta-history-svg" role="img" aria-label="${escapeHtml(route.route_label)} history">
        <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left + plotW}" y2="${PAD.top}" class="ta-chart-axis"/>
        <text x="${PAD.left - 6}" y="${PAD.top + 3}" text-anchor="end" class="ta-chart-axis-label">0</text>
        <polyline points="${pts}" class="ta-chart-line"/>
        ${dots}
      </svg>
      <div class="ta-chart-meta">
        <span>${runs.length} runs</span>
        <span class="ta-chart-diff ${diffCls}">${diffText}</span>
        <span class="ta-chart-best">PB ${bestRun.lap_time_text}</span>
      </div>
    </div>
  `;
};

const renderHistorySection = (history) => {
  if (!ENABLE_HISTORY_CHARTS) return "";
  if (!Array.isArray(history) || history.length === 0) return "";
  const charts = history.map((route) => renderHistoryChart(route)).filter(Boolean).join("");
  if (!charts) return "";
  return `
    <section class="ta-detail-card ta-history-section">
      <div class="ta-lb-col-head">
        <span class="zh">賽道歷史成績</span>
        <span class="en">Track History</span>
      </div>
      <div class="ta-history-grid">${charts}</div>
    </section>
  `;
};

const renderProfileGrid = (cards, labels) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return '<p class="ta-empty">No profile cards yet.</p>';
  }

  return `
    <div class="ta-profile-grid">
      ${cards
        .map(
          (card) => {
            const hasUsage = Array.isArray(card.usage_rows) && card.usage_rows.length > 0;
            const hasTags = Array.isArray(card.tag_rows) && card.tag_rows.length > 0;
            const detailGrid =
              hasUsage || hasTags
                ? `
                  <div class="ta-detail-grid">
                    ${
                      hasUsage
                        ? `
                          <section class="ta-detail-card">
                            <div class="ta-lb-col-head">
                              ${renderBilingual(labels.usageZh, labels.usageEn)}
                            </div>
                            ${renderCounterRows(card.usage_rows)}
                          </section>
                        `
                        : ""
                    }
                    ${
                      hasTags
                        ? `
                          <section class="ta-detail-card">
                            <div class="ta-lb-col-head">
                              ${renderBilingual(labels.tagZh, labels.tagEn)}
                            </div>
                            ${renderCounterRows(card.tag_rows)}
                          </section>
                        `
                        : ""
                    }
                  </div>
                `
                : "";

            return `
              <article class="ta-profile-card">
                <div class="ta-profile-head">
                  <div>
                    <h3 class="ta-section-title">${escapeHtml(card.title || "")}</h3>
                    <p class="ta-profile-subtitle">
                      ${renderBilingual(card.subtitle_zh, card.subtitle_en)}
                    </p>
                  </div>
                  ${renderStatPills(card.stats)}
                </div>
                ${renderChipList(card.tags)}
                ${detailGrid}
                ${
                  Array.isArray(card.track_groups) && card.track_groups.length
                    ? `<section class="ta-detail-card ta-track-groups">
                        <div class="ta-lb-col-head">
                          ${renderBilingual(labels.listZh, labels.listEn)}
                        </div>
                        ${renderTrackGroupRows(card.track_groups, labels.subKey || "vehicle")}
                      </section>`
                    : `<section class="ta-detail-card">
                        <div class="ta-lb-col-head">
                          ${renderBilingual(labels.listZh, labels.listEn)}
                        </div>
                        ${renderDetailRows(card.best_times)}
                      </section>`
                }
                ${renderHistorySection(card.history)}
              </article>
            `;
          },
        )
        .join("")}
    </div>
  `;
};

const renderProfilePlaceholder = (modifier, labelZh, labelEn) => `
  <div class="ta-profile-placeholder ${modifier}">
    <span class="zh">${escapeHtml(labelZh)}</span>
    <span class="en">${escapeHtml(labelEn)}</span>
  </div>
`;

const renderProfileTagChips = (chips) => {
  if (!Array.isArray(chips) || chips.length === 0) {
    return "";
  }
  return `
    <div class="ta-profile-chiprow">
      ${chips.map((chip) => renderToneChip(chip.label, chip.tone)).join("")}
    </div>
  `;
};

const renderProfileBadgeRail = (counts = {}) => {
  const countRail = ["TR", "CR", "PR"]
    .map((code) => {
      const count = Number(counts[code] || 0);
      return `
        <span class="ta-profile-stamp is-${code.toLowerCase()}">
          <strong>${code}</strong>
          <small>${count}</small>
        </span>
      `;
    })
    .join("");

  return `
    <div class="ta-profile-badge-rail">
      ${countRail}
      <span class="ta-profile-stamp is-reserved">${renderBilingual("賽事徽章預留", "Event Badge Slot")}</span>
      <span class="ta-profile-stamp is-reserved">${renderBilingual("成就徽章預留", "Achievement Slot")}</span>
    </div>
  `;
};

const renderProfilePanel = (labelZh, labelEn, rows) => `
  <section class="ta-profile-panel">
    <div class="ta-lb-col-head">${renderBilingual(labelZh, labelEn)}</div>
    ${renderCounterRows(rows)}
  </section>
`;

const renderProfileRecordTable = (rows, peerLabelZh, peerLabelEn, peerField) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '<p class="ta-empty">No records yet.</p>';
  }

  return `
    <div class="ta-profile-record-wrap">
      <table class="ta-profile-record-table">
        <thead>
          <tr>
            <th>#</th>
            <th>${renderBilingual("路線", "Route")}</th>
            <th>${renderBilingual(peerLabelZh, peerLabelEn)}</th>
            <th>${renderBilingual("時間", "Time")}</th>
            <th>${renderBilingual("差距", "Gap")}</th>
            <th>${renderBilingual("標記", "Badge")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td class="ta-profile-record-rank">${escapeHtml(row.rank)}</td>
                  <td>
                    <div class="ta-record-primary">
                      <strong>${renderBilingual(row.route_label_zh || "", row.route_label_en || "")}</strong>
                      <div class="ta-record-meta">
                        <span>${escapeHtml((row.platform || "unknown").toUpperCase())}</span>
                        <span>${escapeHtml(row.record_date || "")}</span>
                        ${row.verified ? `<span class="ta-verified" title="${escapeHtml(row.proof_text || "")}">✓ <span class="zh">已驗證</span><span class="en">Verified</span></span>` : ""}
                      </div>
                      ${renderRouteTagChips(row)}
                    </div>
                  </td>
                  <td class="ta-profile-record-peer">${
                    peerField === "player_display_name"
                      ? taEntityLink(row.player_display_name, taPlayerHref(row))
                      : taEntityLink(row.vehicle_model_name, taVehicleHref(row))
                  }</td>
                  <td class="ta-profile-record-time">${escapeHtml(row.lap_time_text || "-")}</td>
                  <td class="ta-profile-record-gap">${escapeHtml(row.delta_to_best_text || "-")}</td>
                  <td class="ta-profile-record-badge">${renderRecordBadge(row)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

const renderProfileFeatureCard = (card, config) => {
  const usagePanel = renderProfilePanel(config.usageZh, config.usageEn, card.usage_rows || []);
  const tagPanel = renderProfilePanel(config.tagZh, config.tagEn, card.tag_rows || []);

  return `
    <article class="ta-profile-feature">
      <div class="ta-profile-marquee">
        ${renderProfilePlaceholder("is-main", config.bannerZh, config.bannerEn)}
        ${renderProfileBadgeRail(card.badge_counts)}
        ${renderProfilePlaceholder("is-team", "車隊橫幅預留", "Team Banner Slot")}
      </div>
      <div class="ta-profile-feature-main">
        <div class="ta-profile-feature-head">
          <div class="ta-headline-group">
            <div class="ta-label">${renderBilingual(config.fileZh, config.fileEn)}</div>
            <h3 class="ta-section-title">${escapeHtml(card.title || "")}</h3>
            <p class="ta-profile-subtitle">${renderBilingual(card.subtitle_zh, card.subtitle_en)}</p>
          </div>
          ${renderStatPills(card.stats)}
        </div>
        ${renderProfileTagChips(card.tag_chips)}
        <div class="ta-profile-panels">
          ${usagePanel}
          ${tagPanel}
        </div>
        <section class="ta-profile-panel is-records">
          <div class="ta-lb-col-head">${renderBilingual(config.listZh, config.listEn)}</div>
          ${renderProfileRecordTable(card.record_rows, config.peerZh, config.peerEn, config.peerField)}
        </section>
        ${renderHistorySection(card.history)}
      </div>
    </article>
  `;
};

const PLAYER_PROFILE_CONFIG = {
  fileZh: "玩家檔案",
  fileEn: "Driver File",
  bannerZh: "個人橫幅預留",
  bannerEn: "Personal Banner Slot",
  usageZh: "常用車輛",
  usageEn: "Vehicle Usage",
  tagZh: "路線標籤",
  tagEn: "Track Tags",
  listZh: "個人最佳路線",
  listEn: "Route Personal Bests",
  peerZh: "使用車輛",
  peerEn: "Car Used",
  peerField: "vehicle_model_name",
};

const renderPlayerCards = (cards) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return '<p class="ta-empty">No player profiles yet.</p>';
  }

  return `
    <div class="ta-profile-stack">
      ${cards.map((card) => renderProfileFeatureCard(card, PLAYER_PROFILE_CONFIG)).join("")}
    </div>
  `;
};

// ---- Phase 1: profile list card (shared by players + vehicles lists) ----
const renderProfileListCard = (card, href, subtitleZh, subtitleEn) => {
  const counts = card.badge_counts || {};
  const badges = ["TR", "CR", "PR"]
    .map(
      (code) =>
        `<span class="ta-profile-stamp is-${code.toLowerCase()}"><strong>${code}</strong><small>${Number(counts[code] || 0)}</small></span>`,
    )
    .join("");
  const validRuns = (card.stats || []).find((stat) => stat.label_en === "Valid Runs");
  return `
    <a class="ta-track-board ta-profile-list-card" href="${escapeHtml(href)}">
      <div class="ta-label">${renderBilingual(subtitleZh, subtitleEn)}</div>
      <h3 class="ta-track-board-title">${escapeHtml(card.title || "")}</h3>
      <p class="ta-profile-subtitle">${renderBilingual(card.subtitle_zh, card.subtitle_en)}</p>
      <div class="ta-profile-badge-rail is-compact">${badges}</div>
      ${
        validRuns
          ? `<div class="ta-track-list-stat">${escapeHtml(validRuns.value)} ${renderBilingual("筆有效紀錄", "valid runs")}</div>`
          : ""
      }
    </a>
  `;
};

const renderPlayerList = (data) => {
  const cards = data.player_cards || [];
  if (!cards.length) {
    return '<p class="ta-empty">No player profiles yet.</p>';
  }
  return `
    <div class="ta-track-list-grid">
      ${cards
        .map((card) =>
          renderProfileListCard(card, `./player.html?id=${encodeURIComponent(card.player_id)}`, "玩家檔案", "Driver File"),
        )
        .join("")}
    </div>
  `;
};

const renderPlayerDetail = (data, id) => {
  const cards = data.player_cards || [];
  if (!cards.length) {
    return '<p class="ta-empty">No players yet.</p>';
  }
  const card = id ? cards.find((item) => item.player_id === id) : cards[0];
  if (!card) {
    return renderDetailNotFound("玩家", "Player", id, "./players.html", "返回玩家清單", "Back to Players");
  }
  const switcher = renderDetailSwitcher(
    "player",
    cards.map((item) => ({ id: item.player_id, name: item.title })),
    card.player_id,
    "切換玩家",
    "Switch Player",
  );
  const progression = renderPlayerProgression(card);
  const progressionModule = progression
    ? renderModule("進步曲線", "Progression", "圈速進步", "Lap-time Progression", progression)
    : "";
  return switcher + `<div class="ta-profile-stack">${renderProfileFeatureCard(card, PLAYER_PROFILE_CONFIG)}</div>` + progressionModule;
};

const VEHICLE_PROFILE_CONFIG = {
  fileZh: "車輛檔案",
  fileEn: "Car File",
  bannerZh: "車輛橫幅預留",
  bannerEn: "Car Banner Slot",
  usageZh: "世界變體",
  usageEn: "World Variants",
  tagZh: "常見車手",
  tagEn: "Frequent Drivers",
  listZh: "車型最佳路線",
  listEn: "Model Best Routes",
  peerZh: "最快車手",
  peerEn: "Fastest Driver",
  peerField: "player_display_name",
};

const renderVehicleCards = (cards) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return '<p class="ta-empty">No vehicle profiles yet.</p>';
  }

  const bucketOrder = ["spotlight", "active", "rare"];
  const grouped = new Map();
  cards.forEach((card) => {
    const key = card.popularity_bucket_key || "rare";
    if (!grouped.has(key)) {
      grouped.set(key, {
        label_zh: card.popularity_bucket_zh || "少量紀錄",
        label_en: card.popularity_bucket_en || "Rare Cars",
        cards: [],
      });
    }
    grouped.get(key).cards.push(card);
  });

  return `
    <div class="ta-profile-groups">
      ${bucketOrder
        .filter((key) => grouped.has(key))
        .map((key) => {
          const group = grouped.get(key);
          return `
            <section class="ta-profile-group">
              <div class="ta-profile-group-head">
                <h3 class="ta-board-title">${renderBilingual(group.label_zh, group.label_en)}</h3>
                <p class="ta-board-text">${escapeHtml(group.cards.length)} ${renderBilingual("台車型", "models")}</p>
              </div>
              <div class="ta-profile-stack">
                ${group.cards
                  .map((card) => renderProfileFeatureCard(card, VEHICLE_PROFILE_CONFIG))
                  .join("")}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
};

const renderVehicleList = (data) => {
  const cards = data.vehicle_cards || [];
  if (!cards.length) {
    return '<p class="ta-empty">No vehicle profiles yet.</p>';
  }
  return `
    <div class="ta-track-list-grid">
      ${cards
        .map((card) =>
          renderProfileListCard(card, `./vehicle.html?id=${encodeURIComponent(card.vehicle_model_code)}`, "車輛檔案", "Car File"),
        )
        .join("")}
    </div>
  `;
};

const renderVehicleDetail = (data, id) => {
  const cards = data.vehicle_cards || [];
  if (!cards.length) {
    return '<p class="ta-empty">No vehicles yet.</p>';
  }
  const card = id ? cards.find((item) => item.vehicle_model_code === id) : cards[0];
  if (!card) {
    return renderDetailNotFound("車輛", "Vehicle", id, "./vehicles.html", "返回車輛清單", "Back to Vehicles");
  }
  const switcher = renderDetailSwitcher(
    "vehicle",
    cards.map((item) => ({ id: item.vehicle_model_code, name: item.title })),
    card.vehicle_model_code,
    "切換車輛",
    "Switch Vehicle",
  );
  const analysis = renderVehicleAnalysis(card);
  const analysisModule = analysis
    ? renderModule("車輛取向", "Profile", "環境與涵蓋", "Environment & Coverage", analysis)
    : "";
  return switcher + `<div class="ta-profile-stack">${renderProfileFeatureCard(card, VEHICLE_PROFILE_CONFIG)}</div>` + analysisModule;
};

const renderEventCards = (cards) =>
  renderProfileGrid(cards, {
    usageZh: "保留欄位",
    usageEn: "Reserved",
    tagZh: "保留欄位",
    tagEn: "Reserved",
    listZh: "最近提交",
    listEn: "Recent Submissions",
  });

const renderReviewCards = (cards) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return '<p class="ta-empty">No review queue yet.</p>';
  }
  return `
    <div class="ta-review-grid">
      ${cards
        .map(
          (card) => `
            <article class="ta-review-card">
              <div class="ta-review-head">
                <span class="ta-status-pill ${card.status_en === "Pending" ? "is-pending" : "is-rejected"}">
                  ${renderBilingual(card.status_zh, card.status_en)}
                </span>
                <div class="ta-meta">${escapeHtml(card.record_date || "")}</div>
              </div>
              <h3 class="ta-section-title">
                ${renderBilingual(card.title_zh, card.title_en)}
              </h3>
              <p class="ta-section-text">
                <span class="zh">${escapeHtml(card.player_display_name || "")} / ${escapeHtml(card.vehicle_display_name || "")} / ${escapeHtml(card.event_name || "")}</span>
                <span class="en">${escapeHtml(card.player_display_name || "")} / ${escapeHtml(card.vehicle_display_name || "")} / ${escapeHtml(card.event_name || "")}</span>
              </p>
              <div class="ta-summary-value ta-summary-value-small">${escapeHtml(card.lap_time_text || "")}</div>
              <p class="ta-meta">${escapeHtml(card.submission_note || "")}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderTimeline = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }
  return `
    <div class="ta-timeline">
      ${items
        .map(
          (item) => `
            <article class="ta-timeline-item">
              <div class="ta-label">
                ${renderBilingual(item.label_zh, item.label_en)}
              </div>
              <h3 class="ta-section-title">
                ${renderBilingual(item.title_zh, item.title_en)}
              </h3>
              <p class="ta-meta">${escapeHtml(item.date || "")}</p>
              <p class="ta-section-text">
                ${renderBilingual(item.meta_zh, item.meta_en)}
              </p>
              <p class="ta-meta">
                ${renderBilingual(item.body_zh, item.body_en)}
              </p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderIndexRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '<p class="ta-board-empty">No entries yet.</p>';
  }
  return `<div class="ta-board-rows">${rows
    .map((row, i) => {
      const nameInner = escapeHtml(row.name || "");
      const name = row.href
        ? `<a class="ta-index-link" href="${escapeHtml(row.href)}" target="_blank" rel="noopener">${nameInner}</a>`
        : nameInner;
      const meta = row.meta ? `<span class="ta-row-plat">${escapeHtml(row.meta)}</span>` : `<span></span>`;
      return `
      <div class="ta-board-row">
        <span class="ta-row-rank">${i + 1}</span>
        <span class="ta-row-name">${name}</span>
        <span class="ta-row-sub">${escapeHtml(row.sub || "")}</span>
        ${meta}
        <span class="ta-row-time">${escapeHtml(row.value || "")}</span>
      </div>`;
    })
    .join("")}</div>`;
};

const renderIndexTables = (indexes) => {
  if (!Array.isArray(indexes) || indexes.length === 0) {
    return '<p class="ta-empty">No index yet.</p>';
  }
  return indexes
    .map(
      (group) => `
        <article class="ta-track-board">
          <div class="ta-track-board-head">
            <h3 class="ta-section-title">
              ${renderBilingual(group.label_zh, group.label_en)}
            </h3>
            <p class="ta-section-text">${escapeHtml((group.rows || []).length)} ${escapeHtml(
              "筆",
            )}</p>
          </div>
          ${renderIndexRows(group.rows)}
        </article>
      `,
    )
    .join("");
};

const renderHighlights = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }
  return `
    <div class="ta-highlight-grid">
      ${items
        .map(
          (item) => `
            <article class="ta-highlight-card">
              <div class="ta-label">${renderBilingual(item.label_zh, item.label_en)}</div>
              <div class="ta-highlight-name">${escapeHtml(item.name || "-")}</div>
              <div class="ta-highlight-value">${escapeHtml(item.value || "")}</div>
            </article>`,
        )
        .join("")}
    </div>`;
};

const renderTrackJump = (options) => {
  if (!Array.isArray(options) || options.length === 0) {
    return "";
  }
  return `
    <div class="ta-jump">
      <span class="ta-label">${renderBilingual("快速查賽道", "Jump to Track")}</span>
      <select class="ta-jump-select" data-track-jump>
        <option value="">${"— 選擇賽道 / Pick a track —"}</option>
        ${options.map((o) => `<option value="${escapeHtml(o.code)}">${escapeHtml(o.name)}</option>`).join("")}
      </select>
    </div>`;
};

const renderRecentRuns = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "";
  }
  return `
    <div class="ta-track-table-wrap">
      <table class="ta-record-table">
        <thead><tr>
          <th>${renderBilingual("日期", "Date")}</th>
          <th>${renderBilingual("賽道 / 路線", "Track / Route")}</th>
          <th>${renderBilingual("車手", "Driver")}</th>
          <th>${renderBilingual("車輛", "Vehicle")}</th>
          <th>${renderBilingual("時間", "Time")}</th>
          <th>${renderBilingual("標記", "Badge")}</th>
        </tr></thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr class="ta-record-row" data-plat="${escapeHtml(row.platform || "")}">
                  <td class="ta-record-gap">${escapeHtml(row.record_date || "")}</td>
                  <td><a class="ta-index-link" href="./track.html?id=${encodeURIComponent(row.track_world_code)}&route=${encodeURIComponent(row.route_code)}">${renderBilingual(row.route_label_zh, row.route_label_en)}</a></td>
                  <td>${taEntityLink(row.player_display_name, taPlayerHref(row))}</td>
                  <td class="ta-record-peer">${taEntityLink(row.vehicle_model_name, taVehicleHref(row))}</td>
                  <td class="ta-record-time">${escapeHtml(row.lap_time_text || "-")}${row.verified ? ` <span class="ta-verified" title="${escapeHtml(row.proof_text || "")}">✓</span>` : ""}</td>
                  <td class="ta-record-badge-cell">${renderRecordBadge(row)}</td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
};

const attachOverviewListeners = () => {
  const sel = document.querySelector("[data-track-jump]");
  if (sel) {
    sel.addEventListener("change", () => {
      if (sel.value) window.location.href = "./track.html?id=" + encodeURIComponent(sel.value);
    });
  }
};

// ── 頁尾分析圖表(手刻 inline SVG / CSS,無外部圖表庫)──────────────
// 共用色彩:色相=國家、彩度=系統(CVS 高/Sacc 低),色碼由 builder 算好
// (category_style.colors),首頁頻率圖與地圖頁查同一份,顏色一致。
const taCategoryColor = (style, country, system) => {
  if (!style || !style.colors) return "#7a857e";
  const key = `${(country || "").trim()}|${(system || "").trim()}`;
  return style.colors[key] || style.neutral || "#7a857e";
};

const renderCategoryLegend = (legend) => {
  if (!Array.isArray(legend) || !legend.length) return "";
  return `
    <div class="ta-chart-legend">
      ${legend
        .map(
          (item) =>
            `<span class="ta-chart-legend-item"><span class="ta-chart-swatch" style="background:${item.color}"></span>${renderBilingual(item.label_zh, item.label_en)}</span>`,
        )
        .join("")}
    </div>`;
};

// rows: [{ label, value, color?, sub?, href? }]
const renderBarChart = (rows) => {
  if (!Array.isArray(rows) || !rows.length) {
    return '<p class="ta-empty">資料太少 / Not enough data</p>';
  }
  const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
  return `
    <div class="ta-chart-bars">
      ${rows
        .map((r) => {
          const pct = Math.max(2, Math.round(((Number(r.value) || 0) / max) * 100));
          const inner = `
            <span class="ta-chart-bar-label">${escapeHtml(r.label)}</span>
            <span class="ta-chart-bar-track"><span class="ta-chart-bar-fill" style="width:${pct}%;background:${r.color || "var(--ta-accent)"}"></span></span>
            <span class="ta-chart-bar-value">${escapeHtml(r.value)}${r.sub ? `<small>${escapeHtml(r.sub)}</small>` : ""}</span>`;
          return r.href
            ? `<a class="ta-chart-bar is-link" href="${escapeHtml(r.href)}">${inner}</a>`
            : `<div class="ta-chart-bar">${inner}</div>`;
        })
        .join("")}
    </div>`;
};

const fmtLap = (ms) => {
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
};

// 進步曲線:最快紀錄拉一條基準橫線,每個點對基準線做垂線並標 +幾秒;含時間軸(日期)與圈速差軸。
// runs = [{date, lap_time_ms, lap_time_text, vehicle, is_pb}](已依時間排序)
const renderProgression = (runs) => {
  const pts = (runs || []).filter((r) => typeof r.lap_time_ms === "number");
  if (pts.length < 2) return '<p class="ta-empty">資料太少 / Not enough data</p>';
  const best = Math.min(...pts.map((r) => r.lap_time_ms));
  const bestText = pts.find((r) => r.lap_time_ms === best).lap_time_text;
  const gaps = pts.map((r) => (r.lap_time_ms - best) / 1000); // 秒
  const maxGap = Math.max(...gaps, 0.001);
  const W = 720;
  const H = 260;
  const mL = 44;
  const mR = 14;
  const mT = 24;
  const mB = 30;
  const plotW = W - mL - mR;
  const plotH = H - mT - mB;
  const x = (i) => mL + plotW * (pts.length === 1 ? 0.5 : i / (pts.length - 1));
  const yBase = mT + plotH; // 基準線(gap=0)在底
  const y = (g) => yBase - plotH * (g / maxGap);
  const fmtGap = (g) => (g === 0 ? "最快" : `+${g.toFixed(g < 10 ? 2 : 1)}s`);

  const drops = pts
    .map((r, i) => `<line class="ta-prog-drop" x1="${x(i).toFixed(1)}" y1="${y(gaps[i]).toFixed(1)}" x2="${x(i).toFixed(1)}" y2="${yBase}"/>`)
    .join("");
  const linePath = pts.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(gaps[i]).toFixed(1)}`).join(" ");
  const dots = pts
    .map(
      (r, i) =>
        `<circle class="ta-prog-dot${r.lap_time_ms === best ? " is-best" : ""}" cx="${x(i).toFixed(1)}" cy="${y(gaps[i]).toFixed(1)}" r="${r.lap_time_ms === best ? 4.5 : 3.2}"><title>${escapeHtml(r.date)} · ${escapeHtml(r.lap_time_text)} · ${escapeHtml(r.vehicle)}</title></circle>`,
    )
    .join("");
  // 每個點標 +幾秒;奇偶交錯避免重疊。
  const glabels = pts
    .map((r, i) => `<text class="ta-prog-glabel" x="${x(i).toFixed(1)}" y="${(y(gaps[i]) - (i % 2 ? 14 : 7)).toFixed(1)}" text-anchor="middle">${escapeHtml(fmtGap(gaps[i]))}</text>`)
    .join("");
  // X 軸(時間):頭、尾、(夠長時)中間各標日期。
  const xticks = pts.length >= 5 ? [0, Math.floor((pts.length - 1) / 2), pts.length - 1] : [0, pts.length - 1];
  const xlabels = xticks
    .map((i) => `<text class="ta-prog-axis" x="${x(i).toFixed(1)}" y="${(yBase + 16).toFixed(1)}" text-anchor="middle">${escapeHtml(pts[i].date)}</text>`)
    .join("");

  return `
    <svg class="ta-prog" viewBox="0 0 ${W} ${H}" role="img" aria-label="lap-time progression">
      <line class="ta-prog-baseline" x1="${mL}" y1="${yBase}" x2="${W - mR}" y2="${yBase}"/>
      <text class="ta-prog-axis" x="4" y="${(mT + 3).toFixed(1)}">+${maxGap.toFixed(maxGap < 10 ? 2 : 1)}s</text>
      <text class="ta-prog-axis" x="4" y="${(yBase + 3).toFixed(1)}">0s</text>
      ${drops}
      <path class="ta-prog-line" d="${linePath}" fill="none"/>
      ${dots}
      ${glabels}
      ${xlabels}
    </svg>
    <div class="ta-prog-caption">${renderBilingual("基準線 = 最快", "Baseline = best")} ${escapeHtml(bestText)}　·　${renderBilingual("縱軸：與最快的差距(秒)", "Y: gap to best (s)")}</div>`;
};

// 圈速頻率密度直方圖:把該路線所有跑次的圈速分箱計數。rows = route_rows
const renderLaptimeHistogram = (rows) => {
  const pts = (rows || []).filter((r) => typeof r.lap_time_ms === "number");
  if (pts.length < 2) return '<p class="ta-empty">資料太少 / Not enough data</p>';
  const times = pts.map((r) => r.lap_time_ms);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;
  const k = Math.min(8, Math.max(3, Math.round(Math.sqrt(pts.length))));
  const bins = new Array(k).fill(0);
  times.forEach((t) => {
    let b = Math.floor(((t - min) / span) * k);
    if (b >= k) b = k - 1;
    bins[b] += 1;
  });
  const maxCount = Math.max(...bins, 1);
  const cols = bins
    .map((c, i) => {
      const lo = min + (span * i) / k;
      const hi = min + (span * (i + 1)) / k;
      const h = Math.round((c / maxCount) * 100);
      return `<div class="ta-hist-col" title="${escapeHtml(fmtLap(lo))}–${escapeHtml(fmtLap(hi))}: ${c}"><span class="ta-hist-count">${c || ""}</span><span class="ta-hist-bar" style="height:${h}%"></span></div>`;
    })
    .join("");
  const drivers = new Set(pts.map((r) => r.player_display_name)).size;
  const spreadPct = (span / min) * 100;
  return `
    <div class="ta-hist">${cols}</div>
    <div class="ta-hist-axis"><span>${escapeHtml(fmtLap(min))} ${renderBilingual("最快", "fastest")}</span><span>${escapeHtml(fmtLap(max))} ${renderBilingual("最慢", "slowest")}</span></div>
    <div class="ta-strip-stats">
      <span>${pts.length} ${renderBilingual("筆", "runs")}</span>
      <span>${drivers} ${renderBilingual("位車手", "drivers")}</span>
      <span>${renderBilingual("差距", "spread")} ${spreadPct.toFixed(1)}%</span>
    </div>`;
};

// 把 JSON 安全嵌進 <script type="application/json">(避免 </script> 提前關閉)
const embedJsonData = (attr, payload) =>
  `<script type="application/json" ${attr}>${JSON.stringify(payload).replace(/</g, "\\u003c")}</script>`;

// 首頁:賽道熱門度頻率圖(依國家×系統著色,與地圖頁同色)
const renderPopularityChart = (data) => {
  const pc = data.popularity_chart;
  if (!pc || !Array.isArray(pc.tracks) || !pc.tracks.length) return "";
  const style = data.category_style;
  const rows = pc.tracks.slice(0, 20).map((t) => ({
    label: t.name,
    value: t.count,
    color: taCategoryColor(style, t.country, t.system),
    href: `./track.html?id=${encodeURIComponent(t.code)}`,
  }));
  return renderCategoryLegend(style && style.legend) + renderBarChart(rows);
};

// 車手:進步曲線(路線下拉,一次畫一條,資料來自既有 history,不預先攤平)
const renderPlayerProgression = (card) => {
  const history = (card.history || []).filter((h) => (h.runs || []).length >= 2);
  if (!history.length) return "";
  const options = history
    .map((h, i) => `<option value="${i}"${i === 0 ? " selected" : ""}>${escapeHtml(h.route_label)}（${h.runs.length}）</option>`)
    .join("");
  return `
    <div class="ta-progression" data-progression>
      <div class="ta-chart-controls">
        <span class="ta-label">${renderBilingual("選擇路線", "Route")}</span>
        <select class="ta-switch-select" data-progression-select>${options}</select>
      </div>
      <div data-progression-chart>${renderProgression(history[0].runs)}</div>
      ${embedJsonData("data-progression-data", history)}
    </div>`;
};

// 賽道:圈速分布(路線下拉,一次畫一條)
const renderTrackAnalysis = (board) => {
  const routes = (board.routes || []).filter((r) => (r.route_rows || []).length >= 2);
  if (!routes.length) return "";
  routes.sort((a, b) => b.route_rows.length - a.route_rows.length);
  const options = routes
    .map((r, i) => `<option value="${i}"${i === 0 ? " selected" : ""}>${escapeHtml(r.route_display_name)}（${r.route_rows.length}）</option>`)
    .join("");
  return `
    <div class="ta-laptime" data-laptime>
      <div class="ta-chart-controls">
        <span class="ta-label">${renderBilingual("選擇路線", "Route")}</span>
        <select class="ta-switch-select" data-laptime-select>${options}</select>
      </div>
      <div data-laptime-chart>${renderLaptimeHistogram(routes[0].route_rows)}</div>
      ${embedJsonData("data-laptime-data", routes.map((r) => r.route_rows))}
    </div>`;
};

// 車輛:環境適性 + 路線涵蓋
const renderVehicleAnalysis = (card) => {
  const envTotal = (card.env_rows || []).reduce((s, e) => s + (Number(e.value) || 0), 0) || 1;
  const env = (card.env_rows || []).map((e) => ({
    label: e.label,
    value: e.value,
    sub: `${Math.round((e.value / envTotal) * 100)}%`,
    color: "var(--ta-accent-warm)",
  }));
  const routeCount = (card.record_rows || []).length;
  const tr = card.badge_counts ? card.badge_counts.TR : 0;
  const cr = card.badge_counts ? card.badge_counts.CR : 0;
  const coverage = `
    <div class="ta-coverage">
      <div class="ta-coverage-cell"><span class="ta-coverage-num">${routeCount}</span><span class="ta-coverage-lab">${renderBilingual("有紀錄路線", "Routes Run")}</span></div>
      <div class="ta-coverage-cell"><span class="ta-coverage-num">${tr}</span><span class="ta-coverage-lab">${renderBilingual("賽道最佳 TR", "Track Records")}</span></div>
      <div class="ta-coverage-cell"><span class="ta-coverage-num">${cr}</span><span class="ta-coverage-lab">${renderBilingual("車種最佳 CR", "Car Records")}</span></div>
    </div>`;
  if (!env.length) return coverage;
  return `${coverage}<div class="ta-chart-sub">${renderBilingual("環境適性", "Environment Mix")}</div>${renderBarChart(env)}`;
};

// 委派:路線下拉切換 → 重繪該圖(資料已在嵌入的 JSON,一次只畫一張)
const attachAnalysisInteractions = () => {
  const root = document.querySelector("[data-page-root]");
  if (!root || root.dataset.analysisBound === "1") return;
  root.dataset.analysisBound = "1";
  root.addEventListener("change", (e) => {
    const progSel = e.target.closest("[data-progression-select]");
    if (progSel) {
      const wrap = progSel.closest("[data-progression]");
      const hist = JSON.parse(wrap.querySelector("[data-progression-data]").textContent);
      wrap.querySelector("[data-progression-chart]").innerHTML = renderProgression((hist[Number(progSel.value)] || {}).runs);
      return;
    }
    const lapSel = e.target.closest("[data-laptime-select]");
    if (lapSel) {
      const wrap = lapSel.closest("[data-laptime]");
      const routeRows = JSON.parse(wrap.querySelector("[data-laptime-data]").textContent);
      wrap.querySelector("[data-laptime-chart]").innerHTML = renderLaptimeHistogram(routeRows[Number(lapSel.value)]);
    }
  });
};

const renderOverview = (data) =>
  [
    renderHighlights(data.highlights),
    renderModule("傳送門", "Portals", "分析分頁", "Analysis Views", renderBoardCards(data.board_cards) + renderTrackJump(data.track_options)),
    Array.isArray(data.recent_runs) && data.recent_runs.length
      ? renderModule("近期紀錄", "Recent Runs", "最新登錄", "Latest Entries", renderRecentRuns(data.recent_runs))
      : "",
    data.popularity_chart && Array.isArray(data.popularity_chart.tracks) && data.popularity_chart.tracks.length
      ? renderModule("熱門度", "Popularity", "賽道熱門度", "Track Popularity", renderPopularityChart(data))
      : "",
  ]
    .filter(Boolean)
    .join("");

const renderPageModules = (view, data) => {
  if (view === "overview") {
    return renderOverview(data);
  }

  if (view === "catalog") {
    return [renderPageSnapshot(data.metric_cards), renderIndexTables(data.indexes)].filter(Boolean).join("");
  }

  if (view === "info") {
    return renderModule("分析摘要", "Metrics", "核心指標", "Core Metrics", renderSummaryCards(data.metric_cards));
  }

  if (view === "tracks") {
    const listHtml = Array.isArray(data.boards) && data.boards.length
      ? renderTrackList(data)
      : "";
    return [renderPageSnapshot(data.metric_cards), listHtml].filter(Boolean).join("");
  }

  if (view === "track") {
    return renderTrackDetail(data, getQueryParam("id"), getQueryParam("route"));
  }

  if (view === "trackmap") {
    // Map/tree rendering lives in TrackMap/trackmap-view.js (initTrackMap),
    // invoked after this shell lands in the DOM.
    return [renderPageSnapshot(data.metric_cards), '<div data-trackmap-root class="ta-empty">Loading map view.</div>']
      .filter(Boolean)
      .join("");
  }

  if (view === "players") {
    const listHtml = Array.isArray(data.player_cards) && data.player_cards.length
      ? renderPlayerList(data)
      : "";
    return [renderPageSnapshot(data.metric_cards), listHtml].filter(Boolean).join("");
  }

  if (view === "player") {
    return renderPlayerDetail(data, getQueryParam("id"));
  }

  if (view === "vehicles") {
    const listHtml = Array.isArray(data.vehicle_cards) && data.vehicle_cards.length
      ? renderVehicleList(data)
      : "";
    return [renderPageSnapshot(data.metric_cards), listHtml].filter(Boolean).join("");
  }

  if (view === "vehicle") {
    return renderVehicleDetail(data, getQueryParam("id"));
  }

  const modules = [renderPageSnapshot(data.metric_cards)];
  if (Array.isArray(data.player_cards) && data.player_cards.length) {
    modules.push(renderModule("個人頁", "Player Profiles", "玩家分析", "Player Analysis", renderPlayerCards(data.player_cards)));
  }
  if (Array.isArray(data.vehicle_cards) && data.vehicle_cards.length) {
    modules.push(renderModule("車輛頁", "Vehicle Profiles", "車輛分析", "Vehicle Analysis", renderVehicleCards(data.vehicle_cards)));
  }
  if (Array.isArray(data.event_cards) && data.event_cards.length) {
    modules.push(renderModule("賽季索引", "Season Index", "活動列表", "Event Index", renderEventCards(data.event_cards)));
  }
  if (Array.isArray(data.review_cards) && data.review_cards.length) {
    modules.push(renderModule("審核佇列", "Review Queue", "待處理送件", "Pending And Rejected", renderReviewCards(data.review_cards)));
  }
  if (Array.isArray(data.timeline) && data.timeline.length) {
    modules.push(renderModule("時間線", "Timeline", "最近變化", "Recent Changes", renderTimeline(data.timeline)));
  }
  if (Array.isArray(data.sections) && data.sections.length) {
    modules.push(renderModule("後續規劃", "Next Layers", "預留分析", "Reserved Expansion", renderSectionCards(data.sections)));
  }

  return modules.filter(Boolean).join("");
};

const setTextContent = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value;
  }
};

const setHtml = (selector, html) => {
  const node = document.querySelector(selector);
  if (node) {
    node.innerHTML = html;
  }
};

const activateNav = (view) => {
  // Detail views share their parent list nav entry (track→tracks, player→players, vehicle→vehicles).
  const navView = { track: "tracks", player: "players", vehicle: "vehicles" }[view] || view;
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === navView);
  });
};

const loadJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json();
};

const initTimeAttack = async () => {
  const view = document.body.dataset.view || "overview";
  // Pages living one directory deeper (TrackMap/) set data-base="../" so the
  // shared data/ fetches still resolve; default "./" keeps every flat page as-is.
  const base = document.body.dataset.base || "./";
  const labels = TA_ROUTE_LABELS[view] || TA_ROUTE_LABELS.overview;
  activateNav(view);

  try {
    const manifest = await loadJson(`${base}data/manifest.json`);
    // Detail views are fed by the same list artifact (track→tracks, player→players, vehicle→vehicles).
    const DETAIL_DATA_KEY = { track: "tracks", player: "players", vehicle: "vehicles" };
    const dataKey = DETAIL_DATA_KEY[view] || view;
    const summaryPromise = loadJson(`${base}data/${manifest.routes.overview}`);
    const pagePromise = view === "overview" ? summaryPromise : loadJson(`${base}data/${manifest.routes[dataKey]}`);
    const [summary, pageData] = await Promise.all([summaryPromise, pagePromise]);

    const pageTitle = pageData.title_zh || labels.zh;
    const pageTitleEn = pageData.title_en || labels.en;
    const pageDesc = pageData.description_zh || "";
    const pageDescEn = pageData.description_en || "";

    document.title = `${pageTitleEn} | VR Racing Club | StarRiver Arts`;

    setTextContent("[data-generated-at]", manifest.generated_at || "pending");
    setTextContent("[data-schema-version]", manifest.schema_version || "0.0.0");
    setTextContent("[data-build-state]", pageData.build_state || summary.build_state || manifest.build_state || "pending");
    setTextContent("[data-source-label]", manifest.source_label || "local builder pending");

    setTextContent("[data-page-title-zh]", pageTitle);
    setTextContent("[data-page-title-en]", pageTitleEn);
    setTextContent("[data-page-desc-zh]", pageDesc);
    setTextContent("[data-page-desc-en]", pageDescEn);
    setTextContent("[data-sidebar-view-zh]", labels.zh);
    setTextContent("[data-sidebar-view-en]", labels.en);

    setHtml("[data-page-root]", renderPageModules(view, pageData));
    if (view === "track") attachBoardToggleListeners();
    if (view === "track" || view === "player" || view === "vehicle") attachDetailSwitchListeners();
    if (view === "track" || view === "player") attachAnalysisInteractions();
    if (view === "trackmap" && typeof window.initTrackMap === "function") {
      window.initTrackMap(pageData, base);
    }
    setHtml(
      "[data-sidebar-list]",
      `
        <ul class="ta-inline-list">
          ${(pageData.sidebar_zh || [])
            .map(
              (note, index) => `
                <li>
                  ${renderBilingual(note, (pageData.sidebar_en || [])[index] || "")}
                </li>
              `,
            )
            .join("")}
        </ul>
      `,
    );
  } catch (error) {
    console.error(error);
    setTextContent("[data-build-state]", "load-error");
    setHtml(
      "[data-page-root]",
      `
        <article class="ta-content-card ta-content-card-inner">
          <h2 class="ta-section-title">Data Load Error</h2>
          <p class="ta-section-text">The page shell is ready, but the JSON artifact could not be loaded.</p>
        </article>
      `,
    );
  }
};

initTimeAttack();
