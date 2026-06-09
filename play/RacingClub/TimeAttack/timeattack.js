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

const renderCatalogCards = (cards) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return "";
  }

  return `
    <div class="ta-catalog-grid">
      ${cards
        .map(
          (card) => `
            <article class="ta-catalog-card">
              <div class="ta-label">
                ${renderBilingual(card.label_zh, card.label_en)}
              </div>
              <h3 class="ta-section-title">
                ${renderBilingual(card.title_zh, card.title_en)}
              </h3>
              <p class="ta-section-text">
                ${renderBilingual(card.body_zh, card.body_en)}
              </p>
              <p class="ta-meta">
                ${renderBilingual(card.meta_zh, card.meta_en)}
              </p>
              ${renderChipList(card.chips)}
              ${renderCardLink(card.href, card.href_label_zh, card.href_label_en)}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderLbRows = (rows, nameKey, subKey) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '<p class="ta-board-empty">No rows yet.</p>';
  }
  return rows
    .map(
      (row) => `
        <div class="ta-lb-row">
          <span class="ta-lb-rank">${escapeHtml(row.rank)}</span>
          <span class="ta-lb-name">${escapeHtml(row[nameKey] || "")}</span>
          <span class="ta-lb-sub">${escapeHtml(row[subKey] || "")}</span>
          <span class="ta-lb-time">${escapeHtml(row.lap_time_text || "")}</span>
        </div>
      `,
    )
    .join("");
};

const renderBoardSection = (labelZh, labelEn, fastest, playerRows, vehicleRows) => `
  <section class="ta-board-section">
    <div class="ta-board-section-head">
      <div class="ta-label">
        ${renderBilingual(labelZh, labelEn)}
      </div>
      ${
        fastest
          ? `
            <p class="ta-lb-fastest">
              <span class="ta-lb-fastest-time">${escapeHtml(fastest.lap_time_text)}</span>
              <span class="ta-lb-fastest-meta">${escapeHtml(fastest.racer_display_name)} / ${escapeHtml(
                fastest.vehicle_display_name,
              )}</span>
            </p>
          `
          : '<p class="ta-board-empty">No board entry yet.</p>'
      }
    </div>
    <div class="ta-lb-cols">
      <div class="ta-lb-col">
        <div class="ta-lb-col-head">
          ${renderBilingual("玩家最佳", "Player Best")}
        </div>
        ${renderLbRows(playerRows, "player_display_name", "vehicle_model_name")}
      </div>
      <div class="ta-lb-col">
        <div class="ta-lb-col-head">
          ${renderBilingual("車輛最佳", "Vehicle Best")}
        </div>
        ${renderLbRows(vehicleRows, "vehicle_model_name", "player_display_name")}
      </div>
    </div>
  </section>
`;

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
                view === "vehicle" ? row.vehicle_model_name || "" : row.player_display_name || "";
              const peer =
                view === "vehicle" ? row.player_display_name || "" : row.vehicle_model_name || "";
              return `
                <tr class="ta-record-row${row.rank === 1 ? " is-leader" : ""}" data-plat="${escapeHtml(row.platform || "")}">
                  <td class="ta-record-rank">${escapeHtml(row.rank)}</td>
                  <td>
                    <div class="ta-record-primary">
                      <strong>${escapeHtml(primary)}</strong>
                      <div class="ta-record-meta">
                        <span>${escapeHtml((row.platform || "unknown").toUpperCase())}</span>
                        <span>${escapeHtml(row.record_date || "")}</span>
                        ${row.verified ? `<span class="ta-verified" title="${escapeHtml(row.proof_text || "")}">✓ <span class="zh">已驗證</span><span class="en">Verified</span></span>` : ""}
                      </div>
                      ${renderRouteTagChips(row)}
                    </div>
                  </td>
                  <td class="ta-record-peer">${escapeHtml(peer)}</td>
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
          <strong>${escapeHtml(fastest.player_display_name || "")}</strong>
          <span>${escapeHtml(fastest.vehicle_model_name || "")}</span>
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

const renderTrackDetail = (data, id, routeCode) => {
  const boards = data.boards || [];
  const board = boards.find((item) => item.track_world_code === id) || boards[0];
  if (!board) {
    return '<p class="ta-empty">Track not found.</p>';
  }
  // If a specific route is requested, narrow the board to that route.
  let focusBoard = board;
  if (routeCode) {
    const route = (board.routes || []).find((item) => item.route_code === routeCode);
    if (route) {
      focusBoard = { ...board, routes: [route] };
    }
  }
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
  return header + renderTrackBoards({ boards: [focusBoard], platforms: data.platforms });
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

// ── (kept for potential legacy use) ────────────────────────────────────────
const renderTrackLeaderboards = (leaderboards) => {
  if (!Array.isArray(leaderboards) || leaderboards.length === 0) {
    return '<p class="ta-empty">No track boards yet.</p>';
  }

  return leaderboards
    .map(
      (board) => `
        <article class="ta-lb-card">
          <div class="ta-lb-card-head">
            <div class="ta-label">
              ${escapeHtml(board.variant_name || "")}
            </div>
            <h3 class="ta-lb-title">${escapeHtml(board.route_name || "")}</h3>
            <p class="ta-section-text">
              ${renderBilingual(board.route_note_zh, board.route_note_en)}
            </p>
            <div class="ta-chip-list">
              <span class="ta-chip">${escapeHtml(board.world_name || "")}</span>
              <span class="ta-chip">${escapeHtml(`Pending ${board.pending_submissions || 0}`)}</span>
            </div>
          </div>
          <div class="ta-board-stack">
            ${renderBoardSection(
              "Approved Record",
              "Approved Record",
              board.approved_fastest,
              board.approved_player_best,
              board.approved_vehicle_best,
            )}
            ${renderBoardSection(
              "Normal Time Attack",
              "Normal Time Attack",
              board.normal_fastest,
              board.normal_player_best,
              board.normal_vehicle_best,
            )}
          </div>
        </article>
      `,
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
                  <td class="ta-profile-record-peer">${escapeHtml(row[peerField] || "")}</td>
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
  const card = cards.find((item) => item.player_id === id) || cards[0];
  if (!card) {
    return '<p class="ta-empty">Player not found.</p>';
  }
  return `<div class="ta-profile-stack">${renderProfileFeatureCard(card, PLAYER_PROFILE_CONFIG)}</div>`;
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
                  .map((card) =>
                    renderProfileFeatureCard(card, {
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
                    }),
                  )
                  .join("")}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
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

const renderOverview = (data) =>
  // Core metrics and the data-model notes now live on the Info page; the
  // overview is a clean landing that routes into the analysis views.
  renderModule("頁面入口", "Page Entry", "分析分頁", "Analysis Views", renderBoardCards(data.board_cards));

const renderPageModules = (view, data) => {
  if (view === "overview") {
    return renderOverview(data);
  }

  if (view === "catalog") {
    return [renderPageSnapshot(data.metric_cards), renderIndexTables(data.indexes)].filter(Boolean).join("");
  }

  if (view === "info") {
    return [
      renderModule("分析摘要", "Metrics", "核心指標", "Core Metrics", renderSummaryCards(data.metric_cards)),
      renderModule("資料流", "Data Flow", "資料模型", "Data Model", renderSectionCards(data.sections)),
    ]
      .filter(Boolean)
      .join("");
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

  if (view === "players") {
    const listHtml = Array.isArray(data.player_cards) && data.player_cards.length
      ? renderPlayerList(data)
      : "";
    return [renderPageSnapshot(data.metric_cards), listHtml].filter(Boolean).join("");
  }

  if (view === "player") {
    return renderPlayerDetail(data, getQueryParam("id"));
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
  // Detail views share their parent list nav entry (track→tracks, player→players).
  const navView = { track: "tracks", player: "players" }[view] || view;
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
  const labels = TA_ROUTE_LABELS[view] || TA_ROUTE_LABELS.overview;
  activateNav(view);

  try {
    const manifest = await loadJson("./data/manifest.json");
    // Detail views are fed by the same list artifact (track→tracks, player→players).
    const DETAIL_DATA_KEY = { track: "tracks", player: "players" };
    const dataKey = DETAIL_DATA_KEY[view] || view;
    const summaryPromise = loadJson(`./data/${manifest.routes.overview}`);
    const pagePromise = view === "overview" ? summaryPromise : loadJson(`./data/${manifest.routes[dataKey]}`);
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
