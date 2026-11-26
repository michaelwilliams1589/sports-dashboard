const B='https://site.api.espn.com/apis/site/v2/sports/';
function hubTz(){return (typeof HUB!=='undefined'&&HUB.tz)||'America/Chicago';}
function tzAbbr(){try{const p=new Intl.DateTimeFormat('en-US',{timeZone:hubTz(),timeZoneName:'short'}).formatToParts(new Date());return (p.find(x=>x.type==='timeZoneName')||{}).value||'';}catch(_){return '';}}
const fmt=s=>new Date(s).toLocaleString('en-US',{timeZone:hubTz(),weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+(tzAbbr()?' '+tzAbbr():'');
const fmtD=s=>new Date(s).toLocaleDateString('en-US',{timeZone:hubTz(),weekday:'short',month:'short',day:'numeric'});
const fmtT=s=>new Date(s).toLocaleTimeString('en-US',{timeZone:hubTz(),hour:'numeric',minute:'2-digit'})+(tzAbbr()?' '+tzAbbr():'');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sc=c=>c.score==null?'':(typeof c.score=='object'?c.score.displayValue:c.score);
const tv=c=>[...new Set((c.broadcasts||[]).map(b=>b.media?.shortName||(b.names||[])[0]).filter(Boolean))].join(', ');
async function jany(u){let r;try{r=await fetch(u,{cache:'no-store'});}catch(e){throw Error(navigator.onLine===false?"You're offline. Reconnect to see live data":"Can't reach the data source right now. Will retry");}if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
const ymdCT=s=>new Date(s).toLocaleDateString('en-CA',{timeZone:hubTz()});
const todayCT=()=>new Date().toLocaleDateString('en-CA',{timeZone:hubTz()});
const fmtLong=()=>new Date().toLocaleString('en-US',{timeZone:hubTz(),weekday:'long',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'})+(tzAbbr()?' '+tzAbbr():'');
async function j(u){let r;try{r=await fetch(B+u,{cache:'no-store'});}catch(e){throw Error(navigator.onLine===false?"You're offline. Reconnect to see live scores":"Can't reach ESPN right now. Will retry");}if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
function nav(){
 const cur=location.pathname.split('/').pop()||'index.html';
 const pages=(typeof navPages==='function'?navPages():[['index.html','Home'],['customize.html','Customize']]);
 const n=document.createElement('nav');
 n.innerHTML=pages.map(([h,t])=>`<a href="${h}" class="${navOn(h,cur)?'on':''}">${t}</a>`).join('');
 document.body.appendChild(n);
 if(!document.querySelector('a.gear')){
  const g=document.createElement('a');g.href='customize.html';g.className='gear';g.title='Customize';g.setAttribute('aria-label','Customize');g.textContent='⚙';
  document.body.appendChild(g);
 }
}
function navOn(href,cur){
 if(href===cur)return true;
 if((cur===''||cur==='index.html')&&href==='index.html')return true;
 if(cur==='team.html'&&href.startsWith('team.html')){
  try{return new URL(href,location.href).search===location.search;}catch(_){return href===cur+location.search;}
 }
 return false;
}
function stamp(){return new Date().toLocaleTimeString('en-US',{timeZone:hubTz(),hour:'numeric',minute:'2-digit',second:'2-digit'})+(tzAbbr()?' '+tzAbbr():'');}
let _timer;function autoRefresh(fn,live){clearTimeout(_timer);const ms=live?30000:60000;const el=document.getElementById('next');if(el)el.textContent=`Auto-refresh every ${ms/1000}s${live?' (games live)':''}`;_timer=setTimeout(fn,ms);}
document.addEventListener('DOMContentLoaded',nav);

// Offline banner (live data is never cached, so tell the user when it can't refresh)
function offlineBanner(){let b=document.getElementById('offline');const off=navigator.onLine===false;
 if(off&&!b){b=document.createElement('div');b.id='offline';b.textContent="You're offline. Showing the app only; scores will refresh when you reconnect.";document.body.prepend(b);}
 else if(!off&&b){b.remove();if(typeof load==='function')try{load();}catch(_){}}}
addEventListener('online',offlineBanner);addEventListener('offline',offlineBanner);document.addEventListener('DOMContentLoaded',offlineBanner);
// Service worker (installable PWA + app-shell cache). ESPN API calls are never cached.
if('serviceWorker' in navigator){
 const had=!!navigator.serviceWorker.controller;let reloaded=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!reloaded){reloaded=true;location.reload();}});
 addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>r.update()).catch(e=>console.warn('SW registration failed',e)));
}
