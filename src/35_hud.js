/* ===================== GTA V HUD =====================
   radar bottom-left (rounded square) with the green health and blue stamina bars under it, cash top-right in
   white, wanted stars only while the police are after you (big, flashing when they lost sight of you), help text
   in a black box top-left. No location line, player count, key chips, fire pill or credits in play
   (the credits stay on the start screen / pause menu, the map licences ask for them). */
(function(){ const st=document.createElement('style'); st.id='gtahud'; st.textContent=`
#loc,#hint,#fireind,#online{display:none!important}
body.ingame .attr{display:none!important}
#hudpanel{left:calc(22px + env(safe-area-inset-left,0px))!important;top:auto!important;bottom:calc(16px + env(safe-area-inset-bottom,0px))!important;background:none!important;padding:0!important;border-radius:0!important;gap:0!important;transform:none!important}
#hudpanel .av,#hudpanel .lbl,#hudpanel .cash{display:none!important}
#hudpanel .bars{width:226px!important;display:flex;gap:4px;align-items:center}
#hudpanel .bar{flex:1;height:8px!important;border-radius:0!important;background:rgba(40,74,30,.62)!important;box-shadow:0 0 0 2px rgba(0,0,0,.45)}
#hudpanel .bar i{background:#5fae4b!important;transition:width .25s}
#hudpanel .bar.s{background:rgba(26,56,96,.62)!important} #hudpanel .bar.s i{background:#3f95dc!important}
#hudpanel.low .bar:not(.s) i{background:#d23a2e!important;animation:hlow .8s infinite} @keyframes hlow{50%{opacity:.45}}
body:not(.touch) #mini{top:auto!important;right:auto!important;left:calc(22px + env(safe-area-inset-left,0px))!important;bottom:calc(34px + env(safe-area-inset-bottom,0px))!important;width:226px!important;height:226px!important;border-radius:12px!important;border:0!important;box-shadow:0 0 0 3px rgba(0,0,0,.55),0 8px 24px rgba(0,0,0,.35)!important}
#gtacash{position:fixed;right:calc(30px + env(safe-area-inset-right,0px));top:calc(18px + env(safe-area-inset-top,0px));font:400 40px Anton,Impact,"Arial Narrow",sans-serif;color:#fff;-webkit-text-stroke:1.5px #000;text-shadow:2px 2px 0 #000,0 0 10px rgba(0,0,0,.4);letter-spacing:.02em;z-index:15;pointer-events:none}
#gtacash .d{position:absolute;right:0;top:44px;font-size:28px;color:#8fe07a;opacity:0;transition:opacity .3s} #gtacash .d.on{opacity:1} #gtacash .d.neg{color:#ff6b5e}
#wbox{display:none!important;background:none!important;right:calc(26px + env(safe-area-inset-right,0px))!important;top:calc(70px + env(safe-area-inset-top,0px))!important;padding:0!important;animation:none!important}
#wbox.on{display:flex!important} #wbox span,#wbox em{display:none!important}
#wbox b{font:400 42px Anton,Impact,sans-serif!important;letter-spacing:2px!important;text-shadow:none!important}
#wbox b i{font-style:normal;color:rgba(255,255,255,.22);-webkit-text-stroke:1.4px rgba(0,0,0,.75)} #wbox b i.f{color:#fff;-webkit-text-stroke:1.6px #000;text-shadow:2px 2px 0 rgba(0,0,0,.6)}
#wbox.lost b i.f{animation:wfl .55s infinite} @keyframes wfl{50%{color:rgba(150,150,150,.6)}}
#toast{left:calc(22px + env(safe-area-inset-left,0px))!important;top:calc(20px + env(safe-area-inset-top,0px))!important;transform:translate(0,-8px)!important;border-radius:3px!important;background:rgba(0,0,0,.8)!important;max-width:340px;padding:11px 15px!important;font-size:14px!important;line-height:1.35}
#toast.on{transform:translate(0,0)!important}
#objcard{top:calc(130px + env(safe-area-inset-top,0px))!important}
#speedo{left:auto!important;right:calc(30px + env(safe-area-inset-right,0px))!important;bottom:calc(24px + env(safe-area-inset-bottom,0px))!important;top:auto!important;font:400 34px Anton,Impact,sans-serif!important;color:#fff!important;-webkit-text-stroke:1.2px #000;background:none!important}
`; document.head.appendChild(st); })();
const GHUD={cash:null,last:null,dT:0};
function hudGTA(){ const b=document.body; b.classList.toggle('ingame',!!(GAME.started&&!GAME.paused));
  let c=document.getElementById('gtacash'); if(!c){ c=document.createElement('div'); c.id='gtacash'; c.innerHTML='<span class="v"></span><span class="d"></span>'; document.body.appendChild(c); }
  c.style.display=GAME.started&&!b.classList.contains('poker')?'block':'none';
  const m=GTA.money|0; if(GHUD.last===null) GHUD.last=m; if(m!==GHUD.last){ const d=c.querySelector('.d'); const dv=m-GHUD.last; d.textContent=(dv>0?'+':'-')+'€'+Math.abs(dv); d.classList.toggle('neg',dv<0); d.classList.add('on'); GHUD.dT=GAME.time+2.5; GHUD.last=m; }
  if(GHUD.dT&&GAME.time>GHUD.dT){ c.querySelector('.d').classList.remove('on'); GHUD.dT=0; }
  const v=c.querySelector('.v'); const tx='€'+m.toLocaleString('hr-HR'); if(v.textContent!==tx) v.textContent=tx;
  const w=document.getElementById('wbox'); let ws=document.getElementById('gstars'); if(w&&!ws){ ws=document.createElement('b'); ws.id='gstars'; w.appendChild(ws); const o=document.getElementById('wstars'); if(o) o.style.display='none'; } if(w&&ws){ const n=GTA.wanted|0; w.classList.toggle('on',n>0); w.classList.toggle('lost',n>0&&typeof COP!=='undefined'&&COP.state!=='CHASE'); const h='<i class="f">★</i>'.repeat(n)+'<i>★</i>'.repeat(5-n); if(ws.dataset.h!==h){ ws.innerHTML=h; ws.dataset.h=h; } }
  const hp=document.getElementById('hudpanel'); if(hp) hp.classList.toggle('low',COMBAT.hp<25); }
if(typeof hudTick==='function'){ const _ht=hudTick; hudTick=function(){ _ht(); try{ hudGTA(); }catch(e){} }; }
// rounded-square radar (GTA V) instead of the round one
{ const _dm=UI.drawMini; const rr=(g,S)=>{ g.beginPath(); g.roundRect(2,2,S-4,S-4,20); };
  const A0=CanvasRenderingContext2D.prototype.arc; UI.drawMini=function(){ const c=document.getElementById('mini'); const g=c&&c.getContext('2d'); if(!g) return _dm(); const S=c.width;
    g.arc=function(x,y,r,a0,a1,ccw){ if(Math.abs(x-S/2)<0.5&&Math.abs(y-S/2)<0.5&&r>S/2-4){ this.roundRect(2,2,S-4,S-4,20); return; } return A0.call(this,x,y,r,a0,a1,ccw); };
    try{ _dm(); } finally { delete g.arc; } }; }
// fire alarms no longer pop a pill on screen: the minimap still shows the fire
