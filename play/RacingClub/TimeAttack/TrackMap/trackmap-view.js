/* TrackMap view — tree + Leaflet map for the trackmap page.
 *
 * Loaded only by TrackMap/index.html; timeattack.js calls window.initTrackMap
 * after the page shell renders. Display priority per track:
 *   full route trace (lazy-loaded GeoJSON) → locality marker → unlocated list.
 * If Leaflet fails to load, the tree alone remains a complete fallback.
 */
(() => {
  "use strict";

  const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);

  const bi = (zh, en) => {
    const z = esc(zh || en || "");
    const e = esc(en || zh || "");
    return `<span class="zh">${z}</span><span class="en">${e}</span>`;
  };

  const TRACE_STYLE = { color: "#EFD95B", weight: 3, opacity: 0.9 };

  const renderTrackRow = (track, base) => {
    const worldBtn = track.world_url
      ? `<a class="ta-tm-btn" href="${esc(track.world_url)}" target="_blank" rel="noopener">
           ${bi("VRChat 世界", "VRChat World")}</a>`
      : "";
    const traceBtn = track.has_trace
      ? `<button class="ta-tm-btn ta-tm-btn-trace" type="button" data-trace-focus="${esc(track.track_world_code)}">
           ${bi("聚焦軌跡", "Focus Trace")}</button>`
      : "";
    const meta = [track.track_env, track.difficulty].filter(Boolean).map(esc).join(" · ");
    return `
      <li class="ta-tm-track" data-track-code="${esc(track.track_world_code)}"${track.has_trace ? ` data-trace-code="${esc(track.track_world_code)}" data-trace-file="${esc(track.trace_file)}"` : ""}>
        <div class="ta-tm-track-head">
          <span class="ta-tm-track-name">${bi(track.track_display_name, track.world_name)}</span>
          ${track.has_trace ? '<span class="ta-tm-tag">' + bi("軌跡", "Trace") + "</span>" : ""}
        </div>
        <div class="ta-tm-track-meta">${meta}${meta ? " · " : ""}${track.record_count} runs / ${track.route_count} routes</div>
        <div class="ta-tm-track-actions">
          <a class="ta-tm-btn" href="${base}track.html?id=${encodeURIComponent(track.track_world_code)}">
            ${bi("賽道詳情", "Track Detail")}</a>
          ${worldBtn}
          ${traceBtn}
        </div>
      </li>`;
  };

  const renderLocality = (loc, locIndex, base) => `
    <details class="ta-tm-loc" data-loc-index="${locIndex}">
      <summary>
        <span class="ta-tm-loc-name">${bi(loc.name_zh, loc.name_en)}</span>
        <span class="ta-tm-count">${loc.tracks.length}</span>
        ${loc.has_point
          ? `<button class="ta-tm-btn ta-tm-btn-focus" type="button" data-loc-focus="${locIndex}">${bi("地圖", "Map")}</button>`
          : `<span class="ta-tm-nopoint">${bi("無座標", "No point")}</span>`}
      </summary>
      <ul class="ta-tm-tracks">${loc.tracks.map((t) => renderTrackRow(t, base)).join("")}</ul>
    </details>`;

  const renderTree = (data, base, locRefs) => {
    const countries = (data.countries || []).map((country) => {
      const regions = country.regions.map((region) => {
        const localities = region.localities.map((loc) => {
          const locIndex = locRefs.push({ loc, country, region }) - 1;
          return renderLocality(loc, locIndex, base);
        }).join("");
        if (!region.name) {
          // 城邦型國家(如摩納哥)沒有區域層,地名直接掛在國家下。
          return localities;
        }
        return `
          <details class="ta-tm-region" open>
            <summary>${bi(region.name_zh, region.name_en)}</summary>
            ${localities}
          </details>`;
      }).join("");
      return `
        <details class="ta-tm-country" open>
          <summary>${bi(country.name_zh, country.name_en)}</summary>
          ${regions}
        </details>`;
    }).join("");

    const unlocated = (data.unlocated || []).length
      ? `
        <section class="ta-tm-unlocated">
          <h3>${bi("未定位 / 虛構世界", "Unlocated / Fictional")}</h3>
          <ul class="ta-tm-tracks">
            ${(data.unlocated || []).map((t) => renderTrackRow(t, base)).join("")}
          </ul>
        </section>`
      : "";

    return `<nav class="ta-tm-tree" aria-label="Track map tree">${countries}</nav>${unlocated}`;
  };

  window.initTrackMap = (data, base) => {
    const root = document.querySelector("[data-trackmap-root]");
    if (!root) return;

    const locRefs = [];
    const treeHtml = renderTree(data, base, locRefs);
    root.classList.remove("ta-empty");
    root.innerHTML = `
      <div class="ta-trackmap-layout">
        <div class="ta-tm-side">${treeHtml}</div>
        <div class="ta-tm-mapcol">
          <div class="ta-tm-breadcrumb" data-map-breadcrumb>
            <button class="ta-tm-btn" type="button" data-map-reset>${bi("地球", "Earth")}</button>
            <span class="ta-tm-crumbs" data-map-crumbs></span>
          </div>
          <div id="ta-map"></div>
        </div>
      </div>`;

    const mapNode = document.getElementById("ta-map");
    if (typeof L === "undefined" || !mapNode) {
      // Leaflet 沒載到(離線/被擋):退化成單欄純樹,功能仍完整。
      root.classList.add("ta-trackmap-nomap");
      return;
    }

    const map = L.map("ta-map", { worldCopyJump: true }).setView([23.5, 121], 3);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // 共用色彩(色相=國家、彩度=系統),色碼由 builder 算好,與首頁同色。
    const style = data.category_style || { colors: {}, neutral: "#7a857e" };
    const colorFor = (country, system) => {
      const key = `${(country || "").trim()}|${(system || "").trim()}`;
      return (style.colors && style.colors[key]) || style.neutral || "#7a857e";
    };
    const dominantSystem = (tracks) => {
      const counts = {};
      let best = "";
      let bestN = 0;
      (tracks || []).forEach((t) => {
        const s = t.system_name || "";
        counts[s] = (counts[s] || 0) + 1;
        if (counts[s] > bestN) {
          bestN = counts[s];
          best = s;
        }
      });
      return best;
    };
    const traceColorByCode = new Map();
    locRefs.forEach(({ country, loc }) =>
      (loc.tracks || []).forEach((t) =>
        traceColorByCode.set(t.track_world_code, colorFor(country.name, t.system_name)),
      ),
    );

    const markers = new Map(); // locIndex -> L.Marker
    const group = L.featureGroup();
    locRefs.forEach((ref, locIndex) => {
      const { loc, country, region } = ref;
      if (!loc.has_point) return;
      const markerColor = colorFor(country.name, dominantSystem(loc.tracks));
      const icon = L.divIcon({
        className: "ta-map-marker-wrap",
        html: `<span class="ta-map-marker" style="background:${markerColor}">${loc.tracks.length}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -12],
      });
      const popupHtml = `
        <div class="ta-tm-popup">
          <h3>${bi(loc.name_zh, loc.name_en)}</h3>
          <p class="ta-tm-popup-path">${esc(country.name_zh)} ${region.name ? "› " + esc(region.name_zh) : ""}${loc.point_source === "trace" ? " ·" + " trace-derived" : ""}</p>
          <ul class="ta-tm-tracks">${loc.tracks.map((t) => renderTrackRow(t, base)).join("")}</ul>
        </div>`;
      const marker = L.marker([loc.lat, loc.lng], { icon })
        .bindPopup(popupHtml, { maxWidth: 320, className: "ta-tm-leaflet-popup" });
      marker._taRef = ref;
      marker.addTo(group);
      markers.set(locIndex, marker);
    });
    group.addTo(map);
    if (group.getLayers().length) {
      map.fitBounds(group.getBounds().pad(0.2));
    }

    // ── 軌跡懶載與快取 ──
    const traceLayers = new Map(); // code -> L.GeoJSON
    const tracePending = new Map(); // code -> Promise
    const loadTrace = (code, file) => {
      if (traceLayers.has(code)) return Promise.resolve(traceLayers.get(code));
      if (tracePending.has(code)) return tracePending.get(code);
      const promise = fetch(`${base}data/${file}`)
        .then((res) => {
          if (!res.ok) throw new Error(`trace ${code}: ${res.status}`);
          return res.json();
        })
        .then((geojson) => {
          const traceStyle = { ...TRACE_STYLE, color: traceColorByCode.get(code) || TRACE_STYLE.color };
          const layer = L.geoJSON(geojson, { style: traceStyle }).addTo(map);
          traceLayers.set(code, layer);
          return layer;
        })
        .catch((err) => {
          console.warn(err);
          tracePending.delete(code);
          return null;
        });
      tracePending.set(code, promise);
      return promise;
    };

    const crumbs = root.querySelector("[data-map-crumbs]");
    const setCrumbs = (ref) => {
      if (!crumbs) return;
      if (!ref) {
        crumbs.innerHTML = "";
        return;
      }
      const parts = [ref.country, ref.region.name ? ref.region : null, ref.loc].filter(Boolean);
      crumbs.innerHTML = parts
        .map((p) => `<span class="ta-tm-crumb">${bi(p.name_zh, p.name_en)}</span>`)
        .join('<span class="ta-tm-crumb-sep">›</span>');
    };

    map.on("popupopen", (e) => {
      const marker = e.popup._source;
      if (marker && marker._taRef) setCrumbs(marker._taRef);
      const node = e.popup.getElement();
      if (!node) return;
      // popup 內每條有軌跡的賽道:開啟即懶載畫線。
      node.querySelectorAll("[data-trace-code]").forEach((item) => {
        loadTrace(item.dataset.traceCode, item.dataset.traceFile);
      });
    });

    // ── 互動委派:聚焦軌跡 / 樹→地圖 / 重設 ──
    root.addEventListener("click", (e) => {
      const focusTrace = e.target.closest("[data-trace-focus]");
      if (focusTrace) {
        const code = focusTrace.dataset.traceFocus;
        const item = root.querySelector(`[data-trace-code="${CSS.escape(code)}"]`)
          || document.querySelector(`[data-trace-code="${CSS.escape(code)}"]`);
        const file = item ? item.dataset.traceFile : `geo/${code}.geojson`;
        loadTrace(code, file).then((layer) => {
          if (layer) map.fitBounds(layer.getBounds().pad(0.3));
        });
        return;
      }
      const focusLoc = e.target.closest("[data-loc-focus]");
      if (focusLoc) {
        e.preventDefault();
        const marker = markers.get(Number(focusLoc.dataset.locFocus));
        if (marker) {
          map.setView(marker.getLatLng(), Math.max(map.getZoom(), 11));
          marker.openPopup();
        }
        return;
      }
      if (e.target.closest("[data-map-reset]")) {
        if (group.getLayers().length) map.fitBounds(group.getBounds().pad(0.2));
        map.closePopup();
        setCrumbs(null);
      }
    });

    // Leaflet popup 的點擊不冒泡到 root,獨立掛一次委派。
    map.getContainer().addEventListener("click", (e) => {
      const focusTrace = e.target.closest("[data-trace-focus]");
      if (!focusTrace) return;
      const code = focusTrace.dataset.traceFocus;
      const item = document.querySelector(`[data-trace-code="${CSS.escape(code)}"]`);
      const file = item ? item.dataset.traceFile : `geo/${code}.geojson`;
      loadTrace(code, file).then((layer) => {
        if (layer) map.fitBounds(layer.getBounds().pad(0.3));
      });
    });
  };
})();
