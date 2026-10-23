const B='https://site.api.espn.com/apis/site/v2/sports/';
const PAGES=[['index.html','Dashboard'],['ou-football.html','OU 🏈'],['osu-football.html','OSU 🏈'],['ou-basketball.html','OU 🏀'],['osu-basketball.html','OSU 🏀'],['thunder.html','Thunder'],['nfl.html','NFL'],['rankings.html','Rankings']];
const fmt=s=>new Date(s).toLocaleString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' CT';
const fmtD=s=>new Date(s).toLocaleDateString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric'});
const fmtT=s=>new Date(s).toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'})+' CT';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sc=c=>c.score==null?'':(typeof c.score=='object'?c.score.displayValue:c.score);
const tv=c=>[...new Set((c.broadcasts||[]).map(b=>b.media?.shortName||(b.names||[])[0]).filter(Boolean))].join(', ');
async function j(u){let r;try{r=await fetch(B+u,{cache:'no-store'});}catch(e){throw Error(navigator.onLine===false?"You're offline. Reconnect to see live scores":"Can't reach ESPN right now. Will retry");}if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
function nav(){const cur=location.pathname.split('/').pop()||'index.html';const n=document.createElement('nav');
 n.innerHTML=PAGES.map(([h,t])=>`<a href="${h}" class="${h==cur?'on':''}">${t}</a>`).join('');document.body.appendChild(n);}
function stamp(){return new Date().toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit',second:'2-digit'})+' CT';}
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
