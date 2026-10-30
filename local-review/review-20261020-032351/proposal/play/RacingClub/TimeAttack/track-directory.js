(() => {
  "use strict";

  const root = document.querySelector('[data-page-root]');
  if (!root || document.body?.dataset.view !== "tracks") return;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

  const bi = (zh, en) => `<span class="zh">${esc(zh || en || "")}</span><span class="en">${esc(en || zh || "")}</span>`;
  const norm = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
  const runTotal = (board) => (board?.routes || []).reduce((sum, route) => sum + Number(route.record_count || 0), 0);

  const flattenMapTracks = (data) => {
    const rows = [];
    (data?.countries || []).forEach((country) => {
      (country.regions || []).forEach((region) => {
        (region.localities || []).forEach((locality) => {
          (locality.tracks || []).forEach((track) => rows.push({
            ...track,
            country_name: country.name_zh || country.name || "",
            country_name_en: country.name_en || "",
            region_name: region.name_zh || region.name || "",
            region_name_en: region.name_en || "",
            locality_name: locality.name_zh || locality.name || "",
            locality_name_en: locality.name_en || "",
          }));
        });
      });
    });
    (data?.unlocated || []).forEach((track) => rows.push({ ...track, unlocated: true }));
    return rows;
  };

  const explicitTimingState = (item) => {
    const raw = norm(item.timing_support || item.timing_capability || item.timing_state || "").replace(/[\s-]+/g, "_");
    if (["none", "no", "no_timing", "free_drive", "drive_only", "untimed"].includes(raw)) return "none";
    if (["timed", "built_in", "builtin", "yes", "supported", "time_attack"].includes(raw)) return "timed";
    return "";
  };

  const timingState = (item) => {
    const explicit = explicitTimingState(item);
    if (explicit) return explicit;
    if ((item.routes || []).length > 0 || Number(item.route_count || 0) > 0) return "timed";
    return "unknown";
  };

  const mergeInventory = (trackData, mapData) => {
    const byCode = new Map();
    flattenMapTracks(mapData).forEach((track) => {
      if (!track.track_world_code) return;
      byCode.set(track.track_world_code, {
        ...track,
        routes: [],
        source_map: true,
      });
    });

    (trackData?.boards || []).forEach((board) => {
      const existing = byCode.get(board.track_world_code) || {};
      byCode.set(board.track_world_code, {
        ...existing,
        ...board,
        route_count: (board.routes || []).length || Number(existing.route_count || 0),
        record_count: runTotal(board) || Number(existing.record_count || 0),
        source_board: true,
      });
    });

    return [...byCode.values()].map((item) => ({
      ...item,
      timing_state: timingState(item),
    })).sort((a, b) => {
      const aName = a.track_display_name || a.world_name || a.track_world_code || "";
      const bName = b.track_display_name || b.world_name || b.track_world_code || "";
      return aName.localeCompare(bName, "zh-Hant", { numeric: true, sensitivity: "base" });
    });
  };

  const statusBadge = (item) => {
    if (item.timing_state === "none") {
      return `<span class="ta-directory-state is-drive">${bi("自由駕駛", "No Timing")}</span>`;
    }
    if (item.timing_state === "unknown") {
      return `<span class="ta-directory-state is-unknown">${bi("計時待確認", "Timing Unknown")}</span>`;
    }
    if (Number(item.record_count || 0) > 0) {
      return `<span class="ta-directory-state is-recorded">${bi("已有紀錄", "Recorded")}</span>`;
    }
    return `<span class="ta-directory-state is-empty">${bi("尚無紀錄", "No Records Yet")}</span>`;
  };

  const locationText = (item) => [
    item.country_name,
    item.region_name,
    item.locality_name,
  ].filter(Boolean).join(" · ");

  const searchCorpus = (item) => norm([
    item.track_world_code,
    item.track_display_name,
    item.world_name,
    item.track_author,
    item.system_name,
    item.track_env,
    item.track_shape,
    item.track_distance,
    item.difficulty,
    item.country_name,
    item.country_name_en,
    item.region_name,
    item.region_name_en,
    item.locality_name,
    item.locality_name_en,
    ...(item.tech_tags || []),
    ...(item.routes || []).flatMap((route) => [route.route_code, route.route_display_name, route.route_note_zh, route.route_note_en]),
  ].filter(Boolean).join(" "));

  const systemKey = (item) => {
    const value = norm(item.system_name);
    if (value.includes("sacc")) return "sacc";
    if (value.includes("cvs")) return "cvs";
    if (!value || value === "unknown") return "unknown";
    return "other";
  };

  const renderRoutePills = (item) => {
    if (!item.source_board || !(item.routes || []).length) return "";
    const id = encodeURIComponent(item.track_world_code);
    return `<div class="ta-route-pill-row">${item.routes.map((route) => `
      <a class="ta-route-pill" href="./track.html?id=${id}&route=${encodeURIComponent(route.route_code)}">
        <span class="ta-route-pill-name">${esc(route.route_display_name || route.route_code)}</span>
        <span class="ta-route-pill-stat">${esc(route.record_count || 0)}</span>
      </a>`).join("")}</div>`;
  };

  const renderCard = (item) => {
    const title = item.track_display_name || item.world_name || item.track_world_code;
    const world = item.world_name && item.world_name !== title ? item.world_name : "";
    const location = locationText(item);
    const meta = [item.system_name && item.system_name !== "Unknown" ? item.system_name : "", item.track_env, item.difficulty]
      .filter(Boolean);
    const trackHref = item.source_board ? `./track.html?id=${encodeURIComponent(item.track_world_code)}` : "";
    const worldHref = /^https?:\/\//.test(item.world_url || "") ? item.world_url : "";
    const routes = Number(item.route_count || (item.routes || []).length || 0);
    const records = Number(item.record_count || 0);

    return `
      <article class="ta-track-board ta-track-list-card ta-directory-card"
        data-track-code="${esc(item.track_world_code)}"
        data-search="${esc(searchCorpus(item))}"
        data-system="${esc(systemKey(item))}"
        data-timing="${esc(item.timing_state)}"
        data-records="${records > 0 ? "recorded" : "empty"}">
        <div class="ta-directory-card-top">
          <div>
            <div class="ta-label">${world ? `${bi("VRChat 世界", "VRChat World")} · ${esc(world)}` : bi("VRChat 賽道世界", "VRChat Track World")}</div>
            <h3 class="ta-track-board-title">${esc(title)}</h3>
          </div>
          ${statusBadge(item)}
        </div>
        ${item.track_author ? `<div class="ta-track-list-author">${esc(item.track_author)}</div>` : ""}
        ${location ? `<div class="ta-directory-location">${esc(location)}</div>` : ""}
        <div class="ta-track-chiprow">
          ${meta.map((value) => `<span class="ta-tag-chip is-meta">${esc(value)}</span>`).join("")}
        </div>
        <div class="ta-track-list-stat">
          ${routes} ${bi("條路線", "routes")} ・ ${records} ${bi("筆紀錄", "runs")}
        </div>
        ${item.timing_state === "timed" && records === 0 ? `<p class="ta-directory-note">${bi("已確認有計時能力，目前尚無收錄成績。", "Timing is available, but no submitted records are indexed yet.")}</p>` : ""}
        ${item.timing_state === "none" ? `<p class="ta-directory-note">${bi("此 Track 已確認不使用計時系統，適合自由駕駛與探索。", "This Track is explicitly marked as untimed and is listed for free driving / exploration.")}</p>` : ""}
        ${item.timing_state === "unknown" ? `<p class="ta-directory-note">${bi("目前資料不足以判定是否具有計時功能；不以 0 route 推定為無計時。", "Timing capability has not been classified yet; zero registered routes are not treated as proof of no timing.")}</p>` : ""}
        ${renderRoutePills(item)}
        <div class="ta-directory-actions">
          ${worldHref ? `<a class="ta-world-link-btn is-primary" href="${esc(worldHref)}" target="_blank" rel="noopener noreferrer">${bi("前往 VRChat", "Open in VRChat")}</a>` : ""}
          ${trackHref ? `<a class="ta-world-link-btn" href="${trackHref}">${bi("賽道詳情", "Track Detail")}</a>` : ""}
        </div>
      </article>`;
  };

  const sectionMarkup = (key, titleZh, titleEn, descriptionZh, descriptionEn, items, open = true) => {
    if (!items.length && key !== "untimed") return "";
    const cards = items.map(renderCard).join("");
    if (key === "unknown") {
      return `<details class="ta-directory-section is-${key}"${open ? " open" : ""}>
        <summary class="ta-directory-section-head">
          <span><strong>${bi(titleZh, titleEn)}</strong><small>${bi(descriptionZh, descriptionEn)}</small></span>
          <span class="ta-directory-count">${items.length}</span>
        </summary>
        <div class="ta-track-list-grid" data-directory-grid="${key}">${cards}</div>
      </details>`;
    }
    return `<section class="ta-directory-section is-${key}">
      <div class="ta-directory-section-head">
        <span><strong>${bi(titleZh, titleEn)}</strong><small>${bi(descriptionZh, descriptionEn)}</small></span>
        <span class="ta-directory-count">${items.length}</span>
      </div>
      ${items.length ? `<div class="ta-track-list-grid" data-directory-grid="${key}">${cards}</div>` : `<p class="ta-directory-empty">${bi("目前尚無已明確標記的項目。", "No explicitly classified entries yet.")}</p>`}
    </section>`;
  };

  const renderDirectory = (inventory) => {
    const systems = [...new Set(inventory.map(systemKey))];
    root.innerHTML = `
      <section class="ta-track-directory" data-track-directory>
        <div class="ta-directory-controls">
          <label class="ta-directory-search">
            <span>${bi("搜尋賽道、世界、作者、地點或路線", "Search track, world, creator, place, or route")}</span>
            <input type="search" data-directory-query autocomplete="off" placeholder="Akina / 秋名 / Taiwan / CVS…">
          </label>
          <label>
            <span>${bi("系統", "System")}</span>
            <select data-directory-system>
              <option value="all">${bi("全部", "All")}</option>
              ${systems.includes("sacc") ? `<option value="sacc">Sacc</option>` : ""}
              ${systems.includes("cvs") ? `<option value="cvs">CVS</option>` : ""}
              ${systems.includes("other") ? `<option value="other">${bi("其他", "Other")}</option>` : ""}
              ${systems.includes("unknown") ? `<option value="unknown">${bi("未標記", "Unspecified")}</option>` : ""}
            </select>
          </label>
          <label>
            <span>${bi("狀態", "Status")}</span>
            <select data-directory-status>
              <option value="all">${bi("全部", "All")}</option>
              <option value="recorded">${bi("已有紀錄", "Recorded")}</option>
              <option value="empty">${bi("尚無紀錄", "No Records")}</option>
              <option value="timed">${bi("已確認可計時", "Timed")}</option>
              <option value="none">${bi("無計時", "No Timing")}</option>
              <option value="unknown">${bi("待確認", "Unknown")}</option>
            </select>
          </label>
          <div class="ta-directory-result" data-directory-result></div>
        </div>
        <div data-directory-sections></div>
      </section>`;

    const queryInput = root.querySelector("[data-directory-query]");
    const systemSelect = root.querySelector("[data-directory-system]");
    const statusSelect = root.querySelector("[data-directory-status]");
    const sectionsNode = root.querySelector("[data-directory-sections]");
    const resultNode = root.querySelector("[data-directory-result]");

    const apply = () => {
      const query = norm(queryInput.value);
      const system = systemSelect.value;
      const status = statusSelect.value;
      const filtered = inventory.filter((item) => {
        if (query && !searchCorpus(item).includes(query)) return false;
        if (system !== "all" && systemKey(item) !== system) return false;
        if (status === "recorded" && Number(item.record_count || 0) <= 0) return false;
        if (status === "empty" && Number(item.record_count || 0) > 0) return false;
        if (["timed", "none", "unknown"].includes(status) && item.timing_state !== status) return false;
        return true;
      });

      const timed = filtered.filter((item) => item.timing_state === "timed");
      const untimed = filtered.filter((item) => item.timing_state === "none");
      const unknown = filtered.filter((item) => item.timing_state === "unknown");
      sectionsNode.innerHTML = [
        sectionMarkup("timed", "計時賽道", "Timed Tracks", "已確認有計時能力；沒有成績的 Track 仍保留 Empty Card。", "Tracks confirmed to support timing; zero-record entries remain visible as empty cards.", timed),
        sectionMarkup("untimed", "自由駕駛／無計時", "Driveable / No Timing", "已明確確認不使用計時系統，與 Time Attack Track 分區顯示。", "Tracks explicitly confirmed as untimed, separated from the Time Attack directory.", untimed),
        sectionMarkup("unknown", "計時能力待確認", "Timing Unclassified", "目前資料不足，不把 0 route 自動判定成無計時。", "Capability is not yet classified; zero routes are not treated as proof of no timing.", unknown, false),
      ].join("");
      resultNode.innerHTML = `${filtered.length} / ${inventory.length} ${bi("筆 Track", "Tracks")}`;
    };

    queryInput.addEventListener("input", apply);
    systemSelect.addEventListener("change", apply);
    statusSelect.addEventListener("change", apply);
    apply();
  };

  const waitForBaseRenderer = () => new Promise((resolve) => {
    if (root.querySelector(".ta-track-list-grid")) return resolve();
    const observer = new MutationObserver(() => {
      if (root.querySelector(".ta-track-list-grid")) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 6000);
  });

  Promise.all([
    fetch("./data/tracks.json").then((response) => {
      if (!response.ok) throw new Error(`tracks.json HTTP ${response.status}`);
      return response.json();
    }),
    fetch("./data/trackmap.json").then((response) => {
      if (!response.ok) throw new Error(`trackmap.json HTTP ${response.status}`);
      return response.json();
    }),
    waitForBaseRenderer(),
  ])
    .then(([trackData, mapData]) => renderDirectory(mergeInventory(trackData, mapData)))
    .catch((error) => {
      console.error("Racing Hub track directory enhancement failed", error);
      // Keep the existing timeattack.js list as a complete fallback.
    });
})();
