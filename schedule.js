// CFG: {title, id, sport:'football/college-football', types:[2] or [1,2], typeNames}
async function load(){document.getElementById('upd').textContent='Refreshing…';let live=false;const el=document.getElementById('sched');
 try{
  const res=await Promise.all(CFG.types.map(t=>j(`${CFG.sport}/teams/${CFG.id}/schedule${t?'?seasontype='+t:''}`).catch(e=>({err:e.message}))));
  const ok=res.filter(r=>!r.err);if(!ok.length)throw Error(res[0].err);
  if(CFG.sb){try{const s=await j(CFG.sb);for(const e of s.events||[])for(const r of ok){const i=(r.events||[]).findIndex(x=>x.id==e.id);if(i>=0)r.events[i]=e;}}catch(_){}}
  const reg=res[res.length-1].err?ok[0]:res[res.length-1];const team=reg.team||{};
  document.getElementById('rec').innerHTML=`<span class=big>${esc(team.recordSummary||'—')}</span> <span class=meta>${esc(reg.requestedSeason?.displayName||'')} record (ESPN)${team.standingSummary?' · '+esc(team.standingSummary):''}</span>`;
  let h='';
  res.forEach((r,i)=>{if(CFG.types.length>1)h+=`<div class=sec>${esc(CFG.typeNames[i])}</div>`;
   if(r.err){h+=`<div class=err>Couldn't load (${esc(r.err)})</div>`;return;}
   if(!(r.events||[]).length){h+='<div class=meta>No games listed by ESPN.</div>';return;}
   for(const e of r.events){const c=e.competitions[0],st=c.status.type;
    const me=c.competitors.find(k=>k.team.id==CFG.id)||c.competitors[0],op=c.competitors.find(k=>k!==me)||{team:{}};
    let res2;if(st.state=='in'){live=true;res2=`<span class=livetag>LIVE ${esc(sc(me))}-${esc(sc(op))}</span><div class=meta>${esc(st.shortDetail)}</div>`;}
    else if(st.completed){const w=me.winner,l=op.winner;res2=`<span class="${w?'win':l?'loss':''}">${w?'W':l?'L':'T'} ${esc(sc(me))}-${esc(sc(op))}</span>`;}
    else if(st.name=='STATUS_POSTPONED'||st.name=='STATUS_CANCELED')res2=`<span class=meta>${esc(st.description)}</span>`;
    else res2=`<span class=meta>${c.timeValid===false||st.shortDetail=='TBD'?'TBD':fmtT(e.date)}</span>`;
    const rk=op.curatedRank?.current&&op.curatedRank.current<26?'#'+op.curatedRank.current+' ':'';
    h+=`<div class="sg ${st.state=='in'?'live':''}"><div class=meta>${fmtD(e.date)}${st.state=='pre'&&c.timeValid!==false?' · '+fmtT(e.date):''}${tv(c)?' · '+esc(tv(c)):''}</div><div class=opp>${me.homeAway=='home'?'vs':'@'} ${rk}${esc(op.team.displayName||'TBD')}${c.neutralSite?' <span class=meta>(neutral)</span>':''}</div><div class=res>${res2}</div></div>`;}
  });
  el.innerHTML=h;
 }catch(err){el.innerHTML=`<div class=err>Couldn't load schedule (${esc(err.message)})</div>`;}
 document.getElementById('upd').textContent='Last updated '+stamp()+' · source: ESPN';autoRefresh(load,live);}
load();
