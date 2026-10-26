/* Public period view. DATA assigns memberships; Record Manager edits definitions. */
(() => {
  const best = (rows, key) => [...new Map([...rows].reverse().map(r => [r[key],r])).values()].sort((a,b)=>a.lap_time_ms-b.lap_time_ms).map((r,i)=>({...r,rank:i+1}));
  const ranked = (rows) => {
    const cars=new Set(), players=new Set();
    return rows.map((row,i)=>{
      const cr=!cars.has(row.vehicle_variant_code),pr=!players.has(row.player_id);
      cars.add(row.vehicle_variant_code); players.add(row.player_id);
      const code=i===0?'TR':cr?'CR':pr?'PR':'';
      return {...row,rank:i+1,badge_code:code,badge_tone:code.toLowerCase(),badge_label_zh:{TR:'賽道紀錄',CR:'車輛紀錄',PR:'個人紀錄'}[code]||'',
        badge_label_en:{TR:'Track Record',CR:'Car Record',PR:'Personal Record'}[code]||'',
        delta_to_best_text:i?'+'+((row.lap_time_ms-rows[0].lap_time_ms)/1000).toFixed(3):'-'};
    });
  };
  const selectRoute = (route, scope, requested) => {
    const periodId = !requested || requested==='latest' ? scope.current_period_id : requested;
    const period = scope.periods.find(p=>p.period_id===periodId||p.index_code===periodId);
    const allTime = requested==='all';
    const active = scope.periods.find(p=>p.period_id===scope.current_period_id);
    const unresolvedComparable = !!active?.ruleset_id && scope.periods.length>0 &&
      scope.periods.every(p=>p.ruleset_id===active.ruleset_id);
    const allowed = new Set(scope.records.filter(r=>allTime
      ? scope.periods.some(p=>p.period_id===r.period_id&&p.ruleset_id===(active?.ruleset_id||'original')) ||
        (r.period_id==null&&unresolvedComparable)
      : period&&r.period_id===period.period_id).map(r=>r.record_id));
    const rows = ranked((route.route_rows||[]).filter(r=>allowed.has(r.record_id)).sort((a,b)=>a.lap_time_ms-b.lap_time_ms||(a.record_date||'').localeCompare(b.record_date||'')||a.record_id.localeCompare(b.record_id)));
    return {...route,route_rows:rows,player_rows:best(rows,'player_id'),vehicle_rows:best(rows,'vehicle_variant_code'),
      fastest:rows[0]||null,record_count:rows.length,period_scope:scope,selected_period:period||null,
      period_all_time:allTime,period_requested:requested||'latest',period_not_found:!allTime&&!period};
  };
  window.TAPeriods={
    apply(data,payload,requested){
      return {...data,boards:(data.boards||[]).map(board=>({...board,routes:(board.routes||[]).map(route=>{
        const scope=(payload.scopes||[]).find(s=>s.track_world_code===board.track_world_code&&s.route_code===route.route_code);
        return scope?selectRoute(route,scope,requested):requested&&!['latest','all'].includes(requested)
          ?{...route,route_rows:[],player_rows:[],vehicle_rows:[],fastest:null,record_count:0,period_not_found:true}:route;
      })}))};
    },
    picker(board,route,escape,bilingual){
      const scope=route.period_scope;if(!scope)return '';
      const selected=route.period_all_time?'all':route.period_requested==='latest'?'latest':route.selected_period?.period_id;
      const options=[{id:'latest',label:document.documentElement.lang==='en'?'Latest period':'最新榜期'},
        {id:'all',label:document.documentElement.lang==='en'?'All-time board':'歷代總榜'},
        ...scope.periods.map(p=>({id:p.period_id,label:p.label}))];
      if(route.period_not_found)options.unshift({id:'',label:document.documentElement.lang==='en'?'Unavailable period':'找不到此榜期'});
      const period=route.selected_period;
      const date = value => value ? new Intl.DateTimeFormat(document.documentElement.lang==='en'?'en-GB':'zh-TW',
        {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value)) : '';
      return `<label class="ta-period-picker">${bilingual('榜期','Leaderboard period')}<select data-ta-period data-world="${escape(board.track_world_code)}" data-route="${escape(route.route_code)}">${options.map(p=>`<option value="${escape(p.id)}"${p.id===selected||(route.period_not_found&&p.id==='')?' selected':''}${p.id===''?' disabled':''}>${escape(p.label)}</option>`).join('')}</select></label>`+
        (period?`<p class="ta-period-range">${escape(period.label)} · ${escape(date(period.starts_at_utc)||'—')} → ${escape(date(period.ends_at_utc)||'…')} (UTC+8)</p>`:'')+
        (period?.archive_href?.startsWith('data/history/')&&!period.archive_href.split('/').includes('..')?`<a class="ta-card-link" href="${escape(period.archive_href)}">${bilingual('查看結算榜與下載','Open archived board and downloads')}</a>`:'');
    }
  };
  document.addEventListener('change',event=>{
    const input=event.target.closest('[data-ta-period]');if(!input)return;
    const url=new URL(location.href);url.pathname=url.pathname.replace(/[^/]*$/,'track.html');
    url.searchParams.set('id',input.dataset.world);url.searchParams.set('route',input.dataset.route);
    url.searchParams.set('period',input.value);location.assign(url);
  });
})();
