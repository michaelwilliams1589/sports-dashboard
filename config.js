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


function detectDevice(){
  try{
    const ua=navigator.userAgent||'';
    const touch=navigator.maxTouchPoints||0;
    if(/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&touch>1))return 'ios';
    if(/Android/i.test(ua))return 'android';
  }catch(_){}
  return '';
}
function hubDevice(){
  if(typeof HUB!=='undefined'&&(HUB.device==='android'||HUB.device==='ios'))return HUB.device;
  return detectDevice();
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
    techItems:null,
    device:'',
    appearance:{theme:'dark',accent:'#fbbf24',background:'default',backgroundPhoto:'',iconType:'default',iconEmoji:'🏠',iconColor:'#fbbf24',iconPhoto:''}
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
    techItems:[],
    device:detectDevice(),
    appearance:{theme:'dark',accent:'#fbbf24',background:'default',backgroundPhoto:'',iconType:'default',iconEmoji:'🏠',iconColor:'#fbbf24',iconPhoto:''}
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
  if(raw.device==='android'||raw.device==='ios')c.device=raw.device;
  else if(raw.device==='')c.device='';
  c.appearance=normalizeAppearance(raw.appearance);
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
  try{
    localStorage.setItem(HUB_STORE,JSON.stringify(next));
  }catch(e){
    console.warn('Could not save settings',e);
    throw Error('Could not save (storage is full). Try a smaller photo, or clear the background photo.');
  }
  HUB=next;
  if(typeof applyAppearance==='function')applyAppearance();
  return next;
}

function resetConfig(){
  try{localStorage.removeItem(HUB_STORE);}catch(_){}
  HUB=defaultConfig();
  if(typeof applyAppearance==='function')applyAppearance();
  return HUB;
}

function exportConfig(){
  const copy=JSON.parse(JSON.stringify(HUB||{}));
  const a=copy.appearance||{};
  const omitted=!!(isDataUrl(a.backgroundPhoto)||isDataUrl(a.iconPhoto));
  if(a.background==='photo'&&isDataUrl(a.backgroundPhoto))a.background='default';
  if(a.iconType==='photo'&&isDataUrl(a.iconPhoto))a.iconType='default';
  a.backgroundPhoto='';
  a.iconPhoto='';
  copy.appearance=a;
  if(omitted)copy._photosOmitted=true;
  return JSON.stringify(copy,null,2);
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


const ACCENT_SWATCHES=['#fbbf24','#38bdf8','#34d399','#fb7185','#a78bfa','#fb923c','#f87171','#60a5fa','#e2e8f0','#f472b6'];
const BG_PRESETS=[
  {id:'default',label:'Default'},
  {id:'dusk',label:'Dusk'},
  {id:'ocean',label:'Ocean'},
  {id:'forest',label:'Forest'},
  {id:'aurora',label:'Aurora'},
  {id:'slate',label:'Slate'},
  {id:'photo',label:'Photo'}
];

function isDataUrl(s){
  return typeof s==='string'&&s.indexOf('data:image/')===0&&s.length>32&&s.length<900000;
}
function sanitizeHex(h,fallback){
  const t=String(h||'').trim();
  if(/^#([0-9a-fA-F]{6})$/.test(t))return t.toLowerCase();
  if(/^#([0-9a-fA-F]{3})$/.test(t)){
    const x=t.slice(1).toLowerCase();
    return '#'+x[0]+x[0]+x[1]+x[1]+x[2]+x[2];
  }
  return fallback||'#fbbf24';
}
function normalizeAppearance(a){
  a=(a&&typeof a==='object')?a:{};
  const theme=(a.theme==='light'||a.theme==='auto')?a.theme:'dark';
  const accent=sanitizeHex(a.accent,'#fbbf24');
  const ids=BG_PRESETS.map(p=>p.id);
  let background=ids.includes(a.background)?a.background:'default';
  const backgroundPhoto=isDataUrl(a.backgroundPhoto)?a.backgroundPhoto:'';
  if(background==='photo'&&!backgroundPhoto)background='default';
  let iconType=(a.iconType==='emoji'||a.iconType==='photo')?a.iconType:'default';
  const iconEmoji=(typeof a.iconEmoji==='string'&&a.iconEmoji.trim())?a.iconEmoji.trim().slice(0,8):'🏠';
  const iconColor=sanitizeHex(a.iconColor,accent);
  const iconPhoto=isDataUrl(a.iconPhoto)?a.iconPhoto:'';
  if(iconType==='photo'&&!iconPhoto)iconType='default';
  return {theme,accent,background,backgroundPhoto,iconType,iconEmoji,iconColor,iconPhoto};
}
function parseHex(h){
  const t=sanitizeHex(h,'#fbbf24').slice(1);
  return [parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)];
}
function luminance(hex){
  const a=parseHex(hex).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});
  return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}
function contrastInk(hex){return luminance(hex)>0.45?'#0f172a':'#ffffff'}
function mixHex(hex,toward,amt){
  const a=parseHex(hex),b=parseHex(toward);
  return '#'+[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*amt).toString(16).padStart(2,'0')).join('');
}
function accentTextColor(hex,theme){
  if(theme==='light'){
    if(luminance(hex)>0.35)return mixHex(hex,'#0f172a',0.55);
    return hex;
  }
  if(luminance(hex)<0.25)return mixHex(hex,'#ffffff',0.45);
  return hex;
}
function resolvedTheme(pref){
  if(pref==='light')return 'light';
  if(pref==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)return 'light';
  return 'dark';
}
function applyThemeColorMeta(theme,accent){
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',theme==='light'?'#f1f5f9':(accent&&luminance(accent)<0.4?accent:'#0f172a'));
  const bar=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if(bar)bar.setAttribute('content',theme==='light'?'default':'black-translucent');
}
function applyCustomIconLinks(app){
  let url='';
  if(app.iconType==='photo'&&isDataUrl(app.iconPhoto))url=app.iconPhoto;
  else if(app.iconType==='emoji')url=makeEmojiIcon(app.iconEmoji,app.iconColor);
  document.querySelectorAll('link[rel="apple-touch-icon"]').forEach(el=>{
    el.setAttribute('href',url||'icons/apple-touch-icon.png?v=8');
  });
  const fav=document.querySelector('link[rel="icon"][type="image/png"]')||document.querySelector('link[rel="icon"]');
  if(fav){
    if(url)fav.setAttribute('href',url);
    else if(fav.getAttribute('type')==='image/png')fav.setAttribute('href','icons/favicon-32.png?v=8');
  }
}
function makeEmojiIcon(emoji,color){
  try{
    const c=document.createElement('canvas');
    c.width=180;c.height=180;
    const x=c.getContext('2d');
    x.fillStyle=sanitizeHex(color,'#fbbf24');
    x.fillRect(0,0,180,180);
    x.font='110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    x.textAlign='center';
    x.textBaseline='middle';
    x.fillText((emoji||'🏠').slice(0,4),90,100);
    return c.toDataURL('image/png');
  }catch(e){return ''}
}
function applyAppearance(){
  if(typeof document==='undefined')return;
  const app=normalizeAppearance((typeof HUB!=='undefined'&&HUB&&HUB.appearance)||{});
  if(typeof HUB!=='undefined'&&HUB)HUB.appearance=app;
  const theme=resolvedTheme(app.theme);
  const root=document.documentElement;
  root.setAttribute('data-theme',theme);
  root.style.setProperty('--accent',app.accent);
  root.style.setProperty('--accent-ink',contrastInk(app.accent));
  root.style.setProperty('--accent-text',accentTextColor(app.accent,theme));
  root.setAttribute('data-bg',app.background);
  root.classList.remove('has-bg');
  root.style.removeProperty('--bg-image');
  if(app.background==='photo'&&app.backgroundPhoto){
    root.style.setProperty('--bg-image','url('+app.backgroundPhoto+')');
    root.classList.add('has-bg');
  }else if(app.background&&app.background!=='default'){
    root.classList.add('has-bg');
  }
  applyThemeColorMeta(theme,app.accent);
  applyCustomIconLinks(app);
  applyHubBadge(app);
}
function applyHubBadge(app){
  if(typeof document==='undefined'||!document.body)return;
  let el=document.getElementById('hubBadge');
  const show=app&&(app.iconType==='emoji'||app.iconType==='photo');
  if(!show){
    if(el)el.remove();
    document.body.classList.remove('has-hub-badge');
    return;
  }
  if(!el){
    el=document.createElement('a');
    el.id='hubBadge';
    el.className='hub-badge';
    el.href='index.html';
    el.title='Home';
    document.body.appendChild(el);
  }
  document.body.classList.add('has-hub-badge');
  if(app.iconType==='photo'&&app.iconPhoto){
    el.innerHTML='<img alt="" src="'+app.iconPhoto+'">';
    el.style.background='transparent';
    el.style.color='';
  }else{
    el.innerHTML='';
    el.textContent=app.iconEmoji||'🏠';
    el.style.background=app.iconColor||app.accent||'#fbbf24';
    el.style.color=contrastInk(app.iconColor||app.accent||'#fbbf24');
  }
}
function resizeImageFile(file,maxW,quality,mime){
  return new Promise((resolve,reject)=>{
    if(!file||!file.type||file.type.indexOf('image/')!==0)return reject(Error('Please pick an image.'));
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      try{
        const scale=Math.min(1,(maxW||900)/Math.max(img.width,img.height||1));
        const w=Math.max(1,Math.round(img.width*scale));
        const h=Math.max(1,Math.round(img.height*scale));
        const c=document.createElement('canvas');
        c.width=w;c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL(mime||'image/jpeg',quality==null?0.72:quality));
      }catch(e){URL.revokeObjectURL(url);reject(e)}
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not read that image.'))};
    img.src=url;
  });
}
function cropSquarePng(file,size){
  return new Promise((resolve,reject)=>{
    if(!file||!file.type||file.type.indexOf('image/')!==0)return reject(Error('Please pick an image.'));
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      try{
        const s=size||180;
        const side=Math.min(img.width,img.height);
        const sx=Math.floor((img.width-side)/2);
        const sy=Math.floor((img.height-side)/2);
        const c=document.createElement('canvas');
        c.width=s;c.height=s;
        c.getContext('2d').drawImage(img,sx,sy,side,side,0,0,s,s);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/png'));
      }catch(e){URL.revokeObjectURL(url);reject(e)}
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not read that image.'))};
    img.src=url;
  });
}

var HUB=loadConfig();
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyAppearance);
  else applyAppearance();
}

function applyDeviceClass(){
  if(typeof document==='undefined'||!document.body)return;
  const d=hubDevice();
  document.body.classList.toggle('hub-android',d==='android');
  document.body.classList.toggle('hub-ios',d==='ios');
}
if(typeof window!=='undefined'){
  try{
    if(window.matchMedia){
      matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>{
        if(typeof HUB!=='undefined'&&HUB&&HUB.appearance&&HUB.appearance.theme==='auto')applyAppearance();
      });
    }
  }catch(_){}
  window.__hubInstallPrompt=null;
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    window.__hubInstallPrompt=e;
    window.dispatchEvent(new Event('hub-install-ready'));
  });
  window.addEventListener('appinstalled',()=>{window.__hubInstallPrompt=null;window.dispatchEvent(new Event('hub-install-ready'));});
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyDeviceClass);
    else applyDeviceClass();
  }
}

