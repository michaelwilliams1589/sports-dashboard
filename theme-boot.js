// Runs in <head> before first paint. Reads saved appearance and sets theme attributes.
(function(){
  function hex(h,fb){
    h=String(h||'').trim();
    if(/^#([0-9a-fA-F]{6})$/.test(h))return h.toLowerCase();
    if(/^#([0-9a-fA-F]{3})$/.test(h)){h=h.slice(1);return '#'+h[0]+h[0]+h[1]+h[1]+h[2]+h[2];}
    return fb||'#fbbf24';
  }
  function rgb(h){h=hex(h).slice(1);return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  function lum(h){var a=rgb(h).map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
  function mix(h,t,amt){var a=rgb(h),b=rgb(t);return '#'+[0,1,2].map(function(i){return Math.round(a[i]+(b[i]-a[i])*amt).toString(16).padStart(2,'0');}).join('');}
  function ink(h){return lum(h)>0.45?'#0f172a':'#ffffff';}
  function text(h,theme){
    if(theme==='light')return lum(h)>0.35?mix(h,'#0f172a',0.55):h;
    return lum(h)<0.25?mix(h,'#ffffff',0.45):h;
  }
  try{
    var raw=localStorage.getItem('homehub_config_v1');
    var a=(raw&&JSON.parse(raw).appearance)||{};
    var theme=a.theme||'dark';
    if(theme==='auto')theme=(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';
    if(theme!=='light')theme='dark';
    var accent=hex(a.accent,'#fbbf24');
    var root=document.documentElement;
    root.setAttribute('data-theme',theme);
    root.style.setProperty('--accent',accent);
    root.style.setProperty('--accent-ink',ink(accent));
    root.style.setProperty('--accent-text',text(accent,theme));
    var bg=a.background||'default';
    root.setAttribute('data-bg',bg);
    if(bg==='photo'&&typeof a.backgroundPhoto==='string'&&a.backgroundPhoto.indexOf('data:image/')===0){
      root.style.setProperty('--bg-image','url('+a.backgroundPhoto+')');
      root.classList.add('has-bg');
    }else if(bg&&bg!=='default'){
      root.classList.add('has-bg');
    }
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',theme==='light'?'#f1f5f9':'#0f172a');
  }catch(e){}
})();
