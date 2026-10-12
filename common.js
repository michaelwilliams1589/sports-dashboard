const B='https://site.api.espn.com/apis/site/v2/sports/';
const PAGES=[['index.html','Dashboard'],['ou-football.html','OU 🏈'],['osu-football.html','OSU 🏈'],['ou-basketball.html','OU 🏀'],['osu-basketball.html','OSU 🏀'],['thunder.html','Thunder'],['nfl.html','NFL']];
const fmt=s=>new Date(s).toLocaleString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' CT';
const fmtD=s=>new Date(s).toLocaleDateString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric'});
const fmtT=s=>new Date(s).toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'})+' CT';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sc=c=>c.score==null?'':(typeof c.score=='object'?c.score.displayValue:c.score);
const tv=c=>[...new Set((c.broadcasts||[]).map(b=>b.media?.shortName||(b.names||[])[0]).filter(Boolean))].join(', ');
async function j(u){const r=await fetch(B+u,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
function nav(){const cur=location.pathname.split('/').pop()||'index.html';const n=document.createElement('nav');
 n.innerHTML=PAGES.map(([h,t])=>`<a href="${h}" class="${h==cur?'on':''}">${t}</a>`).join('');document.body.appendChild(n);}
function stamp(){return new Date().toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit',second:'2-digit'})+' CT';}
let _timer;function autoRefresh(fn,live){clearTimeout(_timer);const ms=live?30000:60000;const el=document.getElementById('next');if(el)el.textContent=`Auto-refresh every ${ms/1000}s${live?' (games live)':''}`;_timer=setTimeout(fn,ms);}
document.addEventListener('DOMContentLoaded',nav);
