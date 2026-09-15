(() => {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get("id") || "";
  if (!trackId) return;

  const routeParam = params.get("route") || "";
  const normalize = (value) => String(value || "")
    .toLowerCase()
    .replace(/[–—－]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const englishPart = (value) => {
    const text = String(value || "");
    const slash = text.lastIndexOf("/");
    return normalize(slash >= 0 ? text.slice(slash + 1) : text);
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);

  const waitForBoards = () => new Promise((resolve) => {
    const current = document.querySelector("[data-boards-container]");
    if (current) { resolve(current); return; }
    const observer = new MutationObserver(() => {
      const node = document.querySelector("[data-boards-container]");
      if (!node) return;
      observer.disconnect();
      resolve(node);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => { observer.disconnect(); resolve(null); }, 10000);
  });

  const renderEmptyRoute = (world, route, compactRoute) => {
    const status = compactRoute && compactRoute.status === "prep" ? "prep" : "empty";
    const zhStatus = status === "prep" ? "建置中，尚無紀錄" : "尚無紀錄";
    const enStatus = status === "prep" ? "Coming soon · No records yet" : "No records yet";
    const routeName = route.name || route.route_id || "Route";
    const worldName = world.name || trackId;
    const shortWorld = worldName.includes("/") ? worldName.split("/")[0].trim() : worldName;
    return `
      <article class="ta-track-board ta-route-card" data-supplemental-route="${escapeHtml(route.route_id)}">
        <div class="ta-track-board-head">
          <div class="ta-label">${escapeHtml(worldName)}</div>
          <h3 class="ta-track-board-title">${escapeHtml(shortWorld)}</h3>
          <div class="ta-route-head">
            <div>
              <div class="ta-route-label">${escapeHtml(routeName)}</div>
              <p class="ta-board-text"><span class="zh">${escapeHtml(zhStatus)}</span><span class="en">${escapeHtml(enStatus)}</span><span class="jp">${escapeHtml(enStatus)}</span></p>
            </div>
          </div>
        </div>
        <div class="ta-board-view" data-board-view="route"><p class="ta-board-empty">No records yet.</p></div>
        <div class="ta-board-view" data-board-view="vehicle"><p class="ta-board-empty">No records yet.</p></div>
        <div class="ta-board-view" data-board-view="player"><p class="ta-board-empty">No records yet.</p></div>
      </article>`;
  };

  Promise.all([
    fetch(`./vrc/toolkit/worlds/${encodeURIComponent(trackId)}.json`).then((r) => r.ok ? r.json() : null).catch(() => null),
    fetch(`./vrc/${encodeURIComponent(trackId)}.json`).then((r) => r.ok ? r.json() : null).catch(() => null),
    waitForBoards(),
  ]).then(([worldDoc, compactDoc, container]) => {
    if (!container || !worldDoc || !worldDoc.data || !Array.isArray(worldDoc.data.routes)) return;

    const existingLabels = Array.from(container.querySelectorAll(".ta-route-label"))
      .map((node) => normalize(node.textContent));
    const compactRoutes = new Map();
    if (compactDoc && Array.isArray(compactDoc.routes)) {
      compactDoc.routes.forEach((item) => {
        const code = item && item.route && item.route.code;
        if (code) compactRoutes.set(code, item);
      });
    }

    const missing = worldDoc.data.routes.filter((route) => {
      const name = normalize(route.name);
      const en = englishPart(route.name);
      const alreadyShown = existingLabels.some((label) => label === name || label === en || (en && label === en.replace(/\bto\b/g, "to")));
      return !alreadyShown;
    });
    if (!missing.length) return;

    // timeattack.js falls back to the full track when ?route= points at a route
    // absent from data/tracks.json. For a supplemental route, correct that here.
    if (routeParam && missing.some((route) => route.route_id === routeParam)) {
      container.innerHTML = "";
      const selected = missing.find((route) => route.route_id === routeParam);
      container.insertAdjacentHTML("beforeend", renderEmptyRoute(worldDoc.data, selected, compactRoutes.get(selected.route_id)));
      return;
    }

    missing.forEach((route) => {
      container.insertAdjacentHTML("beforeend", renderEmptyRoute(worldDoc.data, route, compactRoutes.get(route.route_id)));
    });
  });
})();
