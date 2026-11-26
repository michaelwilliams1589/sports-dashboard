// Shared hub configuration. Michael's setup is the in-code default.
// A saved config lives in localStorage (homehub_config_v1) on that phone/browser only.
const HUB_STORE='homehub_config_v1';
const HUB_SHARE='https://michaelwilliams1589.github.io/sports-dashboard/?setup=1';

const LEAGUES={
  nba:{label:'NBA',sport:'basketball/nba',types:[1,2],typeNames:['Preseason','Regular Season'],sb:'basketball/nba/scoreboard',tab:'nba'},
  nfl:{label:'NFL',sport:'football/nfl',types:[1,2],typeNames:['Preseason','Regular Season'],sb:'football/nfl/scoreboard',tab:'nfl'},
  mlb:{label:'MLB',sport:'baseball/mlb',types:[2],sb:'baseball/mlb/scoreboard',tab:'mlb'},
  nhl:{label:'NHL',sport:'hockey/nhl',types:[2],sb:'hockey/nhl/scoreboard',tab:'nhl'},
  cfb:{label:'College Football',sport:'football/college-football',types:[0],tab:'cfb'},
  cbb:{label:'College Basketball',sport:'basketball/mens-college-basketball',types:[2],tab:'cbb'},
  wcbb:{label:'Women\'s College Basketball',sport:'basketball/womens-college-basketball',types:[2],tab:'cbb'}
};
const LEAGUE_BY_SLUG={nba:'nba',nfl:'nfl',mlb:'mlb',nhl:'nhl','college-football':'cfb','mens-college-basketball':'cbb','womens-college-basketball':'wcbb'};

const CORE_TABS=[
  {id:'home',label:'Home',href:'index.html',locked:true},
  {id:'calendar',label:'Calendar',href:'calendar.html'},
  {id:'scores',label:'Scores',href:'scores.html'},
  {id:'playoffs',label:'Playoffs',href:'playoffs.html'},
  {id:'nfl',label:'NFL',href:'nfl.html'},
  {id:'rankings',label:'Rankings',href:'rankings.html'},
  {id:'tech',label:'Tech',href:'tech.html'},
  {id:'packages',label:'Packages',href:'packages.html'}
];

function defaultTeams(){
  return [
    {key:'ou-football',id:'201',sport:'football/college-football',league:'cfb',name:'Oklahoma Sooners Football',short:'OU 🏈',href:'ou-football.html',types:[0],on:true},
    {key:'osu-football',id:'197',sport:'football/college-football',league:'cfb',name:'Oklahoma State Cowboys Football',short:'OSU 🏈',href:'osu-football.html',types:[0],on:true},
    {key:'thunder',id:'25',sport:'basketball/nba',league:'nba',name:'OKC Thunder',short:'Thunder',href:'thunder.html',types:[1,2],typeNames:['Preseason','Regular Season'],sb:'basketball/nba/scoreboard',on:true},
    {key:'ou-basketball',id:'201',sport:'basketball/mens-college-basketball',league:'cbb',name:'Oklahoma Sooners Basketball',short:'OU 🏀',href:'ou-basketball.html',types:[2],on:true},
    {key:'osu-basketball',id:'197',sport:'basketball/mens-college-basketball',league:'cbb',name:'Oklahoma State Cowboys Basketball',short:'OSU 🏀',href:'osu-basketball.html',types:[2],on:true}
  ];
}

function defaultConfig(){
  return {
    v:1,
    origin:'default',
    name:"Michael's Hub",
    tz:'America/Chicago',
    units:'fahrenheit',
    weather:{name:'Okmulgee, OK',lat:35.62,lon:-95.96,country:'US'},
    calendar:{googleSrc:'michael.williams1589@gmail.com',secondaryLabel:'Open Outlook Calendar',secondaryUrl:'https://outlook.live.com/calendar/'},
    modules:{home:true,calendar:true,scores:true,playoffs:true,nfl:true,rankings:true,tech:true,packages:true},
    tabOrder:['home','calendar','scores','ou-football','osu-football','ou-basketball','osu-basketball','thunder','playoffs','nfl','rankings','tech','packages'],
    teams:defaultTeams(),
    techItems:null
  };
}

function setupConfig(){
  let tz='America/Chicago';
  try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||tz;}catch(_){}
  return {
    v:1,
    origin:'setup',
    name:'My Hub',
    tz,
    units:'fahrenheit',
    weather:{name:'',lat:null,lon:null,country:''},
    calendar:{googleSrc:'',secondaryLabel:'',secondaryUrl:''},
    modules:{home:true,calendar:true,scores:true,playoffs:false,nfl:false,rankings:false,tech:true,packages:true},
    tabOrder:['home','calendar','scores','playoffs','nfl','rankings','tech','packages'],
    teams:[],
    techItems:[]
  };
}

function clone(o){return JSON.parse(JSON.stringify(o));}

function normalize(raw){
  const base=raw&&raw.origin==='setup'?setupConfig():defaultConfig();
  if(!raw||typeof raw!=='object')return base;
  const c=clone(base);
  if(typeof raw.name==='string'&&raw.name.trim())c.name=raw.name.trim().slice(0,40);
  if(typeof raw.tz==='string'&&raw.tz)c.tz=raw.tz;
  if(raw.units==='celsius'||raw.units==='fahrenheit')c.units=raw.units;
  if(raw.weather&&typeof raw.weather==='object')c.weather=Object.assign(c.weather,raw.weather);
  if(raw.calendar&&typeof raw.calendar==='object')c.calendar=Object.assign({},c.calendar,raw.calendar);
  if(raw.modules&&typeof raw.modules==='object')c.modules=Object.assign({},c.modules,raw.modules);
  c.modules.home=true;
  if(Array.isArray(raw.tabOrder)&&raw.tabOrder.length)c.tabOrder=raw.tabOrder.slice();
  if(Array.isArray(raw.teams))c.teams=raw.teams.map(normalizeTeam).filter(Boolean);
  if(raw.techItems===null)c.techItems=c.origin==='setup'?[]:null;
  else if(Array.isArray(raw.techItems))c.techItems=raw.techItems.map(it=>({
    item:String(it.item||it.name||'').trim(),
    category:String(it.category||'Links').trim()||'Links',
    link:String(it.link||'').trim(),
    targetPrice:it.targetPrice==null||it.targetPrice===''?null:it.targetPrice,
    notes:String(it.notes||'').trim()
  })).filter(it=>it.item);
  c.origin=raw.origin==='setup'?'setup':'custom';
  c.v=1;
  return c;
}

function normalizeTeam(t){
  if(!t||!t.id||!t.sport)return null;
  const league=t.league||leagueFromSport(t.sport);
  const meta=LEAGUES[league]||{};
  const key=t.key||(String(t.sport).replace(/\//g,'-')+'-'+t.id);
  return {
    key,id:String(t.id),sport:t.sport,league,
    name:t.name||t.displayName||'Team',
    short:t.short||t.abbreviation||t.name||'Team',
    href:t.href||('team.html?t='+encodeURIComponent(key)),
    types:Array.isArray(t.types)&&t.types.length?t.types:(meta.types||[2]),
    typeNames:t.typeNames||meta.typeNames,
    sb:t.sb||meta.sb,
    on:t.on!==false
  };
}

function leagueFromSport(sport){
  for(const [k,v] of Object.entries(LEAGUES)) if(v.sport===sport)return k;
  return '';
}

function teamKey(t){return t.key||(String(t.sport).replace(/\//g,'-')+'-'+t.id);}
function teamHref(t){return t.href||('team.html?t='+encodeURIComponent(teamKey(t)));}

function storedConfig(){
  try{
    const raw=localStorage.getItem(HUB_STORE);
    if(!raw)return null;
    return normalize(JSON.parse(raw));
  }catch(_){return null;}
}

function loadConfig(){
  const saved=storedConfig();
  return saved||defaultConfig();
}

function saveConfig(c){
  const next=normalize(c);
  if(next.origin==='default')next.origin='custom';
  try{localStorage.setItem(HUB_STORE,JSON.stringify(next));}catch(e){console.warn('Could not save settings',e);}
  HUB=next;
  return next;
}

function resetConfig(){
  try{localStorage.removeItem(HUB_STORE);}catch(_){}
  HUB=defaultConfig();
  return HUB;
}

function exportConfig(){
  return JSON.stringify(HUB,null,2);
}

function importConfig(text){
  if(typeof text!=='string')throw Error('Nothing to import');
  let raw=text.trim();
  if(!raw)throw Error('Nothing to import');
  if(raw.startsWith('HOMEHUB1:'))raw=raw.slice(9).trim();
  let obj;
  try{obj=JSON.parse(raw);}
  catch(_){
    try{obj=JSON.parse(decodeURIComponent(escape(atob(raw))));}
    catch(e){throw Error('That code is not valid JSON');}
  }
  return saveConfig(obj);
}

function hubOn(id){return !HUB.modules||HUB.modules[id]!==false;}

function visibleTeams(){return (HUB.teams||[]).filter(t=>t.on!==false);}

function nbaTeam(){return visibleTeams().find(t=>t.league==='nba'||t.sport==='basketball/nba')||null;}

function navPages(){
  const core=Object.fromEntries(CORE_TABS.map(t=>[t.id,t]));
  const teams=HUB.teams||[];
  const seen=new Set();
  const pages=[];
  const order=(HUB.tabOrder&&HUB.tabOrder.length)?HUB.tabOrder.slice():CORE_TABS.map(t=>t.id);
  for(const t of teams) if(!order.includes(t.key)){const i=order.indexOf('scores');order.splice(i>=0?i+1:order.length,0,t.key);}
  for(const id of order){
    if(seen.has(id))continue;
    const tab=core[id];
    if(tab){
      if(tab.locked||hubOn(id)){pages.push([tab.href,tab.label]);seen.add(id);}
      continue;
    }
    const team=teams.find(t=>t.key===id);
    if(team&&team.on!==false){pages.push([teamHref(team),team.short||team.name]);seen.add(id);}
  }
  pages.push(['customize.html','Customize']);
  return pages;
}

function weatherApiUrl(){
  const w=HUB.weather||{};
  if(w.lat==null||w.lon==null)return null;
  const metric=HUB.units==='celsius';
  const tz=encodeURIComponent(HUB.tz||'auto');
  const unit=metric?'celsius':'fahrenheit';
  const wind=metric?'kmh':'mph';
  const precip=metric?'mm':'inch';
  return `https://api.open-meteo.com/v1/forecast?latitude=${w.lat}&longitude=${w.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,cloud_cover&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=${tz}&forecast_days=7&wind_speed_unit=${wind}&temperature_unit=${unit}&precipitation_unit=${precip}`;
}

function alertsUrl(){
  const w=HUB.weather||{};
  if(w.lat==null||w.lon==null)return null;
  if(w.country&&w.country!=='US'&&w.country!=='USA')return null;
  return `https://api.weather.gov/alerts/active?point=${w.lat},${w.lon}`;
}

function calendarEmbedSrc(mode){
  const src=(HUB.calendar&&HUB.calendar.googleSrc||'').trim();
  if(!src)return '';
  let url=src;
  if(/calendar\.google\.com\/calendar\/embed/i.test(src)){
    try{
      const u=new URL(src);
      if(mode)u.searchParams.set('mode',mode);
      if(!u.searchParams.get('ctz')&&HUB.tz)u.searchParams.set('ctz',HUB.tz);
      return u.toString();
    }catch(_){return src;}
  }
  const p=new URLSearchParams({src,ctz:HUB.tz||'America/Chicago',mode:mode||'AGENDA',showTitle:'0',showPrint:'0',showCalendars:'0',showTz:'0',showTabs:'1',showDate:'1',showNav:'1',wkst:'1'});
  return 'https://calendar.google.com/calendar/embed?'+p.toString();
}

function teamSchedulePath(t){
  const types=t.types||[];
  const q=types.length===1&&types[0]!==0?'?seasontype='+types[0]:'';
  return `${t.sport}/teams/${t.id}/schedule${q}`;
}

function teamFromSearchItem(it){
  const slug=it.league||it.defaultLeagueSlug||'';
  const league=LEAGUE_BY_SLUG[slug];
  if(!league)return null;
  const meta=LEAGUES[league];
  const key=(meta.sport.replace(/\//g,'-')+'-'+it.id);
  const short=it.abbreviation||it.name||it.displayName;
  return normalizeTeam({
    key,id:String(it.id),sport:meta.sport,league,
    name:it.displayName||it.name,short,
    types:meta.types,typeNames:meta.typeNames,sb:meta.sb,on:true
  });
}

function hasSavedConfig(){return !!storedConfig();}

// Apply ?setup=1: start a blank customizable state, and never pre-fill Michael's calendar.
if(typeof location!=='undefined'&&typeof localStorage!=='undefined'){
  try{
    const q=new URLSearchParams(location.search);
    if(q.get('setup')==='1'&&!localStorage.getItem(HUB_STORE)){
      localStorage.setItem(HUB_STORE,JSON.stringify(setupConfig()));
      const page=(location.pathname.split('/').pop()||'index.html');
      if(!page||page==='index.html'||page==='sports-dashboard'){
        location.replace('customize.html?welcome=1');
      }
    }
  }catch(_){}
}

var HUB=loadConfig();
