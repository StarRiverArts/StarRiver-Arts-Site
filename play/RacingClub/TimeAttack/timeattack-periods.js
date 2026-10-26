/* Public period view. DATA assigns memberships; Record Manager edits definitions. */
(() => {
  const best = (rows, key) => [...new Map([...rows].reverse().map(r => [r[key], r])).values()]
    .sort((a, b) => a.lap_time_ms - b.lap_time_ms).map((r, i) => ({ ...r, rank: i + 1 }));
  const ranked = rows => {
    const cars = new Set(), players = new Set();
    return rows.map((row, i) => {
      const cr = !cars.has(row.vehicle_variant_code), pr = !players.has(row.player_id);
      cars.add(row.vehicle_variant_code); players.add(row.player_id);
      const code = i === 0 ? 'TR' : cr ? 'CR' : pr ? 'PR' : '';
      return {
        ...row, rank: i + 1, badge_code: code, badge_tone: code.toLowerCase(),
        badge_label_zh: ({ TR: '\u8cfd\u9053\u7d00\u9304', CR: '\u8eca\u8f1b\u7d00\u9304', PR: '\u500b\u4eba\u7d00\u9304' })[code] || '',
        badge_label_en: ({ TR: 'Track Record', CR: 'Car Record', PR: 'Personal Record' })[code] || '',
        delta_to_best_text: i ? '+' + ((row.lap_time_ms - rows[0].lap_time_ms) / 1000).toFixed(3) : '-',
      };
    });
  };
  const periodKey = period => period.starts_at_utc
    ? `at:${period.starts_at_utc}`
    : period.index_code ? `code:${period.index_code}` : `label:${period.label || period.period_id}`;
  const selectRoute = (route, scope, requested) => {
    const period = !requested || requested === 'latest'
      ? scope.periods.find(p => p.period_id === scope.current_period_id)
      : scope.periods.find(p => periodKey(p) === requested || p.period_id === requested || p.index_code === requested);
    const allTime = requested === 'all';
    const active = scope.periods.find(p => p.period_id === scope.current_period_id);
    const allowed = new Set(scope.records.filter(r => allTime
      ? scope.periods.some(p => p.period_id === r.period_id && p.ruleset_id === (active?.ruleset_id || 'original'))
      : period && r.period_id === period.period_id).map(r => r.record_id));
    const rows = ranked((route.route_rows || []).filter(r => allowed.has(r.record_id))
      .sort((a, b) => a.lap_time_ms - b.lap_time_ms || (a.record_date || '').localeCompare(b.record_date || '') || a.record_id.localeCompare(b.record_id)));
    return {
      ...route, route_rows: rows, player_rows: best(rows, 'player_id'), vehicle_rows: best(rows, 'vehicle_variant_code'),
      fastest: rows[0] || null, record_count: rows.length, period_scope: scope, selected_period: period || null,
      selected_period_key: period ? periodKey(period) : '', period_all_time: allTime,
      period_not_found: !allTime && !period,
    };
  };
  const requestedPeriod = payload => {
    const params = new URLSearchParams(window.location.search);
    let requested = params.get('period') || 'latest';
    if (['latest', 'all'].includes(requested) || /^(at|code|label):/.test(requested)) return requested;
    const routeCode = params.get('route');
    const scope = (payload.scopes || []).find(s => s.track_world_code === params.get('id') && (!routeCode || s.route_code === routeCode));
    const legacyPeriod = scope?.periods.find(p => p.period_id === requested || p.index_code === requested);
    return legacyPeriod ? periodKey(legacyPeriod) : requested;
  };
  window.TAPeriods = {
    apply(data, payload) {
      const requested = requestedPeriod(payload);
      return {
        ...data,
        boards: (data.boards || []).map(board => ({
          ...board,
          routes: (board.routes || []).map(route => {
            const scope = (payload.scopes || []).find(s => s.track_world_code === board.track_world_code && s.route_code === route.route_code);
            return scope ? selectRoute(route, scope, requested) : requested !== 'latest' && requested !== 'all'
              ? { ...route, route_rows: [], player_rows: [], vehicle_rows: [], fastest: null, record_count: 0, period_not_found: true }
              : route;
          }),
        })),
      };
    },
    trackPicker(board, escape, bilingual) {
      const scopes = (board.routes || []).map(route => route.period_scope).filter(Boolean);
      if (!scopes.length) return '';
      const keySets = scopes.map(scope => new Set(scope.periods.map(periodKey)));
      const sharedKeys = [...keySets[0]].filter(key => keySets.every(keys => keys.has(key)));
      const options = [
        { id: 'latest', label: document.documentElement.lang === 'en' ? 'Latest period' : '\u6700\u65b0\u699c\u671f' },
        { id: 'all', label: document.documentElement.lang === 'en' ? 'All-time best' : '\u6b77\u4ee3\u6700\u4f73' },
        ...sharedKeys.map(key => ({ id: key, label: scopes[0].periods.find(p => periodKey(p) === key)?.label || key })),
      ];
      let selected = requestedPeriod({ scopes });
      if (!options.some(option => option.id === selected)) selected = 'latest';
      const period = scopes[0].periods.find(p => periodKey(p) === selected);
      const date = value => value ? new Intl.DateTimeFormat(document.documentElement.lang === 'en' ? 'en-GB' : 'zh-TW', {
        timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).format(new Date(value)) : '';
      return `<div class="ta-track-period-picker"><label class="ta-period-picker">${bilingual('\u6392\u884c\u699c\u671f', 'Leaderboard period')}<select data-ta-track-period>${options.map(option => `<option value="${escape(option.id)}"${option.id === selected ? ' selected' : ''}>${escape(option.label)}</option>`).join('')}</select></label>${period ? `<p class="ta-period-range">${escape(period.label)} · ${escape(date(period.starts_at_utc) || '\u8d77')} – ${escape(date(period.ends_at_utc) || '\u81f3\u4eca')} (UTC+8)</p>` : ''}</div>`;
    },
    archiveLink(route, escape, bilingual) {
      const period = route.selected_period;
      return period?.archive_href?.startsWith('data/history/')
        ? `<a class="ta-card-link ta-route-archive-link" href="${escape(period.archive_href)}">${bilingual('\u67e5\u770b\u6b64\u8cfd\u6bb5\u5c01\u5b58\u699c\u55ae\u8207\u4e0b\u8f09', 'Open archived board and downloads')}</a>`
        : '';
    },
  };
  document.addEventListener('change', event => {
    const input = event.target.closest('[data-ta-track-period]');
    if (!input) return;
    const url = new URL(location.href);
    url.pathname = url.pathname.replace(/[^/]*$/, 'track.html');
    url.searchParams.delete('route');
    url.searchParams.set('period', input.value);
    location.assign(url);
  });
})();
