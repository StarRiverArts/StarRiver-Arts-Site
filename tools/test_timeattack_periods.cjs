const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const events={};
const context={URL,URLSearchParams,window:{location:{search:''}},document:{addEventListener(name,handler){events[name]=handler},documentElement:{lang:'zh-TW',classList:{contains(){return false}}}}};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../play/RacingClub/TimeAttack/timeattack-periods.js'),'utf8'),context);
const api=context.window.TAPeriods;
const rows=[{record_id:'old',player_id:'p',vehicle_variant_code:'v',lap_time_ms:1000,badge_code:'TR',badge_tone:'tr'},
  {record_id:'new',player_id:'p',vehicle_variant_code:'v',lap_time_ms:2000},
  {record_id:'new2',player_id:'q',vehicle_variant_code:'v',lap_time_ms:3000}];
const data={boards:[{track_world_code:'w',routes:[{route_code:'DH',route_rows:rows}]}]};
const periods=[{period_id:'old-period',index_code:'first',ruleset_id:'same',label:'第一期'},
  {period_id:'new-period',index_code:'second',ruleset_id:'same',label:'第二期'}];
const payload={scopes:[{track_world_code:'w',route_code:'DH',current_period_id:'new-period',periods,
  records:rows.map((r,i)=>({...r,period_id:i?'new-period':'old-period'}))}]};
const route=value=>api.apply(data,payload,value).boards[0].routes[0];
assert.equal(route().fastest.record_id,'new');assert.equal(route().fastest.badge_code,'TR');
assert.equal(route('first').fastest.record_id,'old');assert.equal(route('all').record_count,3);
assert.equal(route('bad').record_count,0);assert.equal(route('bad').period_not_found,true);
assert.equal(route().vehicle_rows.length,1);assert.equal(route().player_rows[1].rank,2);
const unresolvedRows=[...rows,{record_id:'date-only',player_id:'r',vehicle_variant_code:'v',lap_time_ms:1500},
  {record_id:'missing-period',player_id:'s',vehicle_variant_code:'v',lap_time_ms:1200}];
const unresolvedData={boards:[{track_world_code:'w',routes:[{route_code:'DH',route_rows:unresolvedRows}]}]};
const unresolvedScope={...payload.scopes[0],periods:periods.map(p=>({...p})),records:[...payload.scopes[0].records,
  {record_id:'date-only',period_id:null},{record_id:'missing-period',period_id:'not-a-public-period'}]};
const unresolvedRoute=requested=>api.apply(unresolvedData,{scopes:[unresolvedScope]},requested).boards[0].routes[0];
assert.equal(unresolvedRoute('all').record_count,4,'same-ruleset all-time retains unresolved completion-date membership');
assert.equal(unresolvedRoute('latest').record_count,2,'latest never guesses unresolved membership');
assert.equal(unresolvedRoute('first').record_count,1,'history never guesses unresolved membership');
assert.equal(unresolvedRoute('all').route_rows.some(r=>r.record_id==='missing-period'),false,'unknown non-null period is not unresolved');
unresolvedScope.periods[0].ruleset_id='incompatible';
assert.equal(unresolvedRoute('all').record_count,2,'mixed rulesets exclude unresolved membership');
assert.equal(unresolvedRoute('all').route_rows.some(r=>r.record_id==='date-only'),false);
unresolvedScope.current_period_id='missing-active';
assert.equal(unresolvedRoute('all').route_rows.some(r=>r.record_id==='date-only'),false,'missing active ruleset cannot prove comparability');
const escape=value=>String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const bilingual=(zh,en)=>context.document.documentElement.lang==='en'?en:zh;
const picker=value=>api.picker(data.boards[0],route(value),escape,bilingual);
assert.match(picker(),/value="latest" selected/);
assert.match(picker('latest'),/value="latest" selected/);
assert.match(picker('first'),/value="old-period" selected/);
assert.match(picker('all'),/value="all" selected/);
assert.match(picker('bad'),/value="" selected disabled/);
periods[0].archive_href='data/history/w/DH/old/index.html';
assert.match(picker('first'),/href="data\/history\/w\/DH\/old\/index.html"/);
for(const unsafe of ['https://example.test/archive','data/history/../../../index.html']){
  periods[0].archive_href=unsafe;
  assert.doesNotMatch(picker('first'),/ta-card-link/);
}
periods[0].starts_at_utc='2026-10-21T00:00:00Z';
periods[0].ends_at_utc='2026-10-22T04:00:00Z';
assert.match(picker('first'),/12:00:00/);
periods[0].label='<script>alert(1)</script>';
assert.doesNotMatch(picker('first'),/<script>/);
periods[0].label='第一期';
context.document.documentElement.lang='en';assert.match(picker(),/Latest period/);
context.document.documentElement.lang='zh-TW';
context.location={href:'http://127.0.0.1/tracks.html?lang=en',assign(url){this.assigned=url}};
events.change({target:{closest(){return {dataset:{world:'w',route:'DH'},value:'all'}}}});
assert.equal(context.location.assigned.pathname,'/track.html');
assert.equal(context.location.assigned.searchParams.get('period'),'all');
assert.equal(context.location.assigned.searchParams.get('lang'),'en');
context.routeData=api.apply(data,payload,'first');
const source=fs.readFileSync(path.join(__dirname,'../play/RacingClub/TimeAttack/timeattack.js'),'utf8').replace(/initTimeAttack\(\);\s*$/,'');
vm.runInContext(source,context);
context.window.location.search='?period=old-period';
const html=vm.runInContext('renderTrackDetail(routeData,"w","DH")',context);
assert.match(html,/period=first/);
context.window.location.search='?period=all';
assert.match(vm.runInContext('renderTrackDetail(routeData,"w","DH")',context),/period=all/);
assert.match(vm.runInContext('renderTrackListCard(routeData.boards[0])',context),/period=all/);
assert.match(vm.runInContext('renderTrackDetail(routeData,"w","unknown")',context),/not found/i);
periods[1].ruleset_id='changed';assert.equal(route('all').record_count,2);
assert.equal(data.boards[0].routes[0].route_rows.length,3);
payload.scopes[0].records=payload.scopes[0].records.filter(r=>r.period_id==='old-period');
assert.equal(route().record_count,0);assert.equal(route().fastest,null);
const dirContext={URLSearchParams,window:{location:{search:'?period=first'}},document:{body:{dataset:{view:'tracks'}},querySelector(){return {}}}};
vm.createContext(dirContext);
const dirSource=fs.readFileSync(path.join(__dirname,'../play/RacingClub/TimeAttack/track-directory.js'),'utf8')
  .replace(/\n  Promise\.all\(\[[\s\S]*$/,'\n window.testDirectory={mergeInventory,renderRoutePills};})();');
vm.runInContext(dirSource,dirContext);
const merged=dirContext.window.testDirectory.mergeInventory(api.apply(data,payload,'latest'),{unlocated:[{track_world_code:'w',record_count:100}]});
assert.equal(merged[0].record_count,0,'empty latest directory must not revive old map record_count');
assert.match(dirContext.window.testDirectory.renderRoutePills(merged[0]),/period=first/);
console.log('TA period frontend: data membership/reranking/empty/unknown/immutability, unresolved all-time ruleset compatibility, picker/UTC+8/escaping/archive guards, route period navigation PASS');
