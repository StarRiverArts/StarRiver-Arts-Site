const TA_ROUTE_LABELS = {
  overview: {
    zh: "總覽",
    en: "Overview",
  },
  tracks: {
    zh: "賽道",
    en: "Tracks",
  },
  players: {
    zh: "玩家",
    en: "Players",
  },
  vehicles: {
    zh: "車輛",
    en: "Vehicles",
  },
  events: {
    zh: "活動",
    en: "Events",
  },
  review: {
    zh: "審核",
    en: "Review",
  },
};

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

const renderSummaryCards = (cards) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return '<p class="ta-empty">No summary cards yet.</p>';
  }

  return `
    <div class="ta-summary-grid">
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
    <div class="ta-stat-grid">
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
                <section class="ta-detail-card">
                  <div class="ta-lb-col-head">
                    ${renderBilingual(labels.listZh, labels.listEn)}
                  </div>
                  ${renderDetailRows(card.best_times)}
                </section>
              </article>
            `;
          },
        )
        .join("")}
    </div>
  `;
};

const renderPlayerCards = (cards) =>
  renderProfileGrid(cards, {
    usageZh: "常用車輛",
    usageEn: "Vehicle Usage",
    tagZh: "賽道標籤",
    tagEn: "Track Tags",
    listZh: "個人最佳",
    listEn: "Personal Bests",
  });

const renderVehicleCards = (cards) =>
  renderProfileGrid(cards, {
    usageZh: "變體使用",
    usageEn: "Variant Usage",
    tagZh: "常見車手",
    tagEn: "Frequent Drivers",
    listZh: "母型最佳",
    listEn: "Model Bests",
  });

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

const renderOverview = (data) => [
  renderModule("頁面入口", "Page Entry", "分析分頁", "Analysis Views", renderBoardCards(data.board_cards)),
  renderModule("資料流", "Data Flow", "實作說明", "Implementation Notes", renderSectionCards(data.sections)),
]
  .filter(Boolean)
  .join("");

const renderPageModules = (view, data) => {
  if (view === "overview") {
    return renderOverview(data);
  }

  const modules = [];
  if (Array.isArray(data.metric_cards) && data.metric_cards.length) {
    modules.push(renderModule("分析摘要", "Shared Metrics", "核心指標", "Core Metrics", renderSummaryCards(data.metric_cards)));
  }
  if (Array.isArray(data.catalog_cards) && data.catalog_cards.length) {
    modules.push(renderModule("世界索引", "World Index", "賽道世界", "Track Worlds", renderCatalogCards(data.catalog_cards)));
  }
  if (Array.isArray(data.leaderboards) && data.leaderboards.length) {
    modules.push(renderModule("雙榜單", "Dual Boards", "路線排行榜", "Route Boards", renderTrackLeaderboards(data.leaderboards)));
  }
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
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === view);
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
    const summaryPromise = loadJson(`./data/${manifest.routes.overview}`);
    const pagePromise = view === "overview" ? summaryPromise : loadJson(`./data/${manifest.routes[view]}`);
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

    setHtml("[data-summary-root]", renderSummaryCards(summary.count_cards));
    setHtml("[data-page-root]", renderPageModules(view, pageData));
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
