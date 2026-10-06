/* ===================== phone controls, round two =====================
   · The map: on iPhone the big map canvas could not be created (Safari has a budget for all canvas memory and the
     map comes last), so the radar and the map were empty beige. On phones it is drawn smaller, checked, and rebuilt
     if it came out empty.
   · The big map has a red ✕ to close it, and the HUD hides underneath it.
   · Top bar gone: ⚙ in the corner holds Karta, Let, Kamera, Cijeli zaslon and Izbornik; tapping the radar opens the
     map; 📱 sits on the left edge; the weapon is a round button next to the fire button and opens the weapon wheel,
     where you tap or slide to the gun you want.
   · Fire button: keep your thumb on it and slide — the gun follows your thumb (aim while you shoot). */
function mapBlank(){ try{ if(!MAP.c) return true; const g=MAP.c.getContext('2d'); if(!g) return true; const W=MAP.c.width, H=MAP.c.height; let ok=0; for(const [fx,fy] of [[0.5,0.5],[0.3,0.4],[0.7,0.6]]){ const d=g.getImageData((W*fx)|0,(H*fy)|0,1,1).data; if(d[3]>200) ok++; } return ok===0; }catch(e){ return true; } }
{ const _bm=buildMapCanvas; buildMapCanvas=function(){ if(GAME.touch){ MAP.scale=0.4; MAP.c=null; } _bm(); if(GAME.touch&&mapBlank()){ MAP.scale=0.26; MAP.c=null; MAP.labels=null; try{ _bm(); }catch(e){} } MAP.retry=mapBlank(); };
  setInterval(()=>{ if(!MAP.retry||!GAME.started) return; try{ MAP.scale=0.26; buildMapCanvas(); }catch(e){} },6000); }
(function(){ const st=document.createElement('style'); st.textContent=`
#mapx{position:fixed;z-index:61;top:calc(10px + env(safe-area-inset-top,0px));right:calc(12px + env(safe-area-inset-right,0px));width:48px;height:48px;border-radius:50%;border:3px solid #fff;background:#d1262e;color:#fff;font:700 26px/40px Manrope,sans-serif;text-align:center;display:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.45)}
body.mapon #mapx{display:block}
body.mapon #mini,body.mapon #hudpanel,body.mapon #touchui,body.mapon #tgear,body.mapon #gearpop,body.mapon #tphone,body.mapon #twpn,body.mapon #gtacash,body.mapon #gstars{visibility:hidden!important}
body.touch #tbtns{display:none!important}
body.touch #mini{top:calc(6px + env(safe-area-inset-top,0px))!important;right:calc(6px + env(safe-area-inset-right,0px))!important}
#tgear{position:fixed;z-index:30;left:calc(10px + env(safe-area-inset-left,0px));top:calc(8px + env(safe-area-inset-top,0px));width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(20,22,24,.55);color:#fff;font-size:24px;line-height:40px;text-align:center;display:none;-webkit-tap-highlight-color:transparent}
body.touch.ingame #tgear{display:block}
body.touch #gtacash{left:calc(66px + env(safe-area-inset-left,0px))!important}
#gearpop{position:fixed;z-index:31;left:calc(10px + env(safe-area-inset-left,0px));top:calc(58px + env(safe-area-inset-top,0px));display:none;flex-direction:column;gap:6px;background:rgba(16,18,20,.82);padding:8px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.4)}
#gearpop.on{display:flex} #gearpop .tbtn{display:block!important;position:static!important;min-width:150px;text-align:left;font:700 15px Manrope,sans-serif;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;border:0}
body:not(.driving) #gearpop #tcam{display:none!important}
body.touch #tphone{position:fixed!important;z-index:30;left:calc(12px + env(safe-area-inset-left,0px));top:calc(50% - 6px);width:48px;height:48px;border-radius:50%;padding:0;font-size:22px;display:block;border:2px solid rgba(255,255,255,.5);background:rgba(20,22,24,.55);color:#fff}
body.touch #tphone #phonebadge{position:absolute;right:-2px;top:-2px}
body.touch #twpn{position:fixed!important;z-index:30;width:64px;height:64px;border-radius:50%;padding:0;border:3px solid rgba(255,255,255,.42);background:rgba(20,22,24,.5);color:#fff;font:800 9px Manrope,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden}
body.touch #twpn img{width:52px;height:22px;object-fit:contain;filter:drop-shadow(0 1px 1px #000)}
body.touch.driving #twpn,body:not(.ingame) #twpn{display:none!important}
body.touch.armed #carbtn,body.touch.armed #gtabtn,body.touch.armed #barbtn,body.touch.armed #pokerbtn{transform:translateX(-118px)}
#twheel{position:fixed;inset:0;z-index:41;display:none;background:rgba(0,0,0,.25);touch-action:none} #twheel.on{display:block}`; document.head.appendChild(st); })();
function t2Setup(){ if(t2Setup.done||!GAME.touch) return; t2Setup.done=true;
  // ✕ on the map
  const x=document.createElement('button'); x.id='mapx'; x.textContent='✕'; x.setAttribute('aria-label','Zatvori kartu'); document.body.appendChild(x);
  x.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); openMap(false); try{ resumeGame(); }catch(er){} });
  // ⚙ with the old top-bar buttons inside
  const gear=document.createElement('button'); gear.id='tgear'; gear.textContent='⚙'; gear.setAttribute('aria-label','Postavke'); document.body.appendChild(gear);
  const pop=document.createElement('div'); pop.id='gearpop'; document.body.appendChild(pop);
  const lab={tmap:'🗺  Karta',tfly:'🕊  Let',tcam:'🎥  Kamera',tfs:'⛶  Cijeli zaslon',tmenu:'☰  Izbornik'};
  for(const id of ['tmap','tfly','tcam','tfs','tmenu']){ const b=document.getElementById(id); if(!b) continue; if(id==='tfs'&&b.style.display==='none') continue; b.textContent=lab[id]; pop.appendChild(b); b.addEventListener('pointerdown',()=>setTimeout(()=>pop.classList.remove('on'),60)); }
  gear.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); pop.classList.toggle('on'); });
  document.addEventListener('pointerdown',e=>{ if(pop.classList.contains('on')&&!pop.contains(e.target)&&e.target!==gear) pop.classList.remove('on'); },true);
  // 📱 and the gun button out of the old bar
  const ph=document.getElementById('tphone'); if(ph) document.body.appendChild(ph);
  const gun=document.getElementById('tgun'); if(gun){ document.body.appendChild(gun); const fresh=gun.cloneNode(false); gun.replaceWith(fresh); fresh.id='twpn'; fresh.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); t2Wheel(true); }); }
  // radar → big map
  const mini=document.getElementById('mini'); if(mini) mini.addEventListener('pointerdown',e=>{ if(!GAME.started) return; e.preventDefault(); openMap(true); });
  // the weapon wheel for fingers
  const tw=document.createElement('div'); tw.id='twheel'; document.body.appendChild(tw);
  const pick=(e)=>{ const cx=innerWidth/2, cy=innerHeight/2; const dx=e.clientX-cx, dy=e.clientY-cy; const S=wheelSlots(), n=S.length; if(Math.hypot(dx,dy)<40) return -1; const a=Math.atan2(dx,-dy); return ((Math.round(a/TAU*n)%n)+n)%n; };
  let moved=false;
  tw.addEventListener('pointerdown',e=>{ e.preventDefault(); moved=false; const i=pick(e); if(i>=0){ WHEEL.sel=i; renderWheel(); } });
  tw.addEventListener('pointermove',e=>{ if(!e.buttons&&e.pointerType!=='touch') return; const i=pick(e); if(i>=0&&i!==WHEEL.sel){ WHEEL.sel=i; moved=true; renderWheel(); } });
  tw.addEventListener('pointerup',e=>{ e.preventDefault(); const i=pick(e); if(i<0&&!moved){ t2Wheel(false); return; } if(i>=0) WHEEL.sel=i; const s=wheelSlots()[WHEEL.sel]; t2Wheel(false); if(s===undefined||s<0) holster(); else selectWeapon(s); });
  // fire button: slide to aim while shooting
  const fb=document.getElementById('firebtn'); if(fb){ let fid=null, fx=0, fy=0;
    fb.addEventListener('touchstart',e=>{ const t=e.changedTouches[0]; if(fid===null&&t){ fid=t.identifier; fx=t.clientX; fy=t.clientY; } },{passive:false});
    fb.addEventListener('touchmove',e=>{ for(const t of e.changedTouches){ if(t.identifier!==fid) continue; const zs=GAME.camera.fov/72; PLAYER.yaw-=(t.clientX-fx)*0.0055*zs; PLAYER.pitch=clamp(PLAYER.pitch-(t.clientY-fy)*0.0055*zs,-1.45,1.45); fx=t.clientX; fy=t.clientY; } e.preventDefault(); },{passive:false});
    const end=e=>{ for(const t of e.changedTouches) if(t.identifier===fid) fid=null; }; fb.addEventListener('touchend',end); fb.addEventListener('touchcancel',end); }
  setInterval(t2Tick,150); }
function t2Wheel(on){ const tw=document.getElementById('twheel'); if(!tw) return; if(on){ if(!canHoldGun()) return; const S=wheelSlots(); WHEEL.open=true; WHEEL.hold=true; WHEEL.sel=COMBAT.armed?Math.max(0,S.indexOf(COMBAT.wi)):0; tw.classList.add('on'); renderWheel(); }
  else { WHEEL.open=false; WHEEL.hold=false; tw.classList.remove('on'); const el=document.getElementById('wwheel'); if(el) el.classList.remove('on'); } }
// keep the gun button next to the aim / fire buttons and showing the current weapon
function t2Tick(){ const gun=document.getElementById('twpn'), ab=document.getElementById('aimbtn'), fb=document.getElementById('firebtn'); document.body.classList.toggle('mapon',!!UI.mapOpen);
  if(!gun) return; const jb=document.getElementById('jumpbtn'); const q=jb?jb.getBoundingClientRect():null; /* fixed elements have no offsetParent */ // bottom row, left of the jump button (clear of the Vozi / uđi buttons)
  if(q&&q.width){ gun.style.left=(q.left-64-14)+'px'; gun.style.top=(q.top+q.height/2-32)+'px'; gun.style.right='auto'; gun.style.bottom='auto'; }
  const k=COMBAT.armed?COMBAT.wi:-1; if(gun._k!==k){ gun._k=k; gun.innerHTML=''; const im=document.createElement('img'); im.src=weaponIcon(k<0?'fist':WEAPONS[k].ico); im.alt=''; const s=document.createElement('i'); s.className='am'; s.style.fontStyle='normal'; gun.append(im,s); }
  const am=gun.querySelector('.am'); const t=k<0?'ORUŽJE':(COMBAT.reload>0?'punim…':(COMBAT.mags[k]+' / '+WEAPONS[k].mag)); if(am&&am.textContent!==t) am.textContent=t; }
{ const _sg=startGame; startGame=function(){ _sg(); document.body.classList.add('ingame'); try{ t2Setup(); }catch(e){ console.warn('touch2',e); } }; }
/* ---- map on phones, part two: Safari's canvas budget is already spent by the time the map is drawn at the end of
   loading, so on phones the map is drawn right after the roads and houses (before murals, signs, normal maps…), and the
   place names are drawn live on the big map instead of in a second full-size canvas. */
{ const _br=buildRoads; buildRoads=function(scene){ const r=_br(scene); if(GAME.touch){ try{ MAP.early=true; MAP.scale=0.4; MAP.noLabels=true; buildMapCanvas(); MAP.earlyOk=!mapBlank(); }catch(e){ console.warn('karta',e); } } return r; }; }
{ const _bm2=buildMapCanvas; buildMapCanvas=function(){ if(GAME.touch&&MAP.earlyOk&&!MAP.early){ return; } if(GAME.touch&&MAP.early){ MAP.early=false; }
    if(GAME.touch){ MAP.c=null; MAP.labels=null; } _bm2(); }; }
{ const _cv=cvs; cvs=function(w,h){ if(MAP.noLabels&&MAP.c&&w===MAP.W&&h===MAP.H){ /* the labels canvas: tiny on phones */ return _cv(1,1); } return _cv(w,h); }; }
{ const _dm=drawMap; drawMap=function(){ _dm(); if(!GAME.touch) return; const c=$('mapc'), g=c.getContext('2d'), t=mapXform(); const dpr=Math.min(2,devicePixelRatio||1); g.textAlign='center'; g.textBaseline='middle';
    const lab=(txt,x,z,size,col)=>{ const X=t.ox+(x-X0)*t.s, Z=t.oz+(z-Z0)*t.s; if(X<-80||Z<-40||X>t.W+80||Z>t.H+40) return; g.font=`800 ${size*dpr}px Manrope, Arial`; g.lineWidth=4*dpr; g.strokeStyle='rgba(255,255,255,.85)'; g.strokeText(txt,X,Z); g.fillStyle=col; g.fillText(txt,X,Z); };
    for(const p of D.places) lab(p.n,p.x,p.z,p.n==='Tuhelj'?18:13,'#2a2622');
    for(const [tx,o] of [['Crkva',LANDMARKS.church],['Općina · Pošta',LANDMARKS.townhall],['Vatrogasni dom',LANDMARKS.fire],['Škola',LANDMARKS.school],['Kafić Putniku',LANDMARKS.cafe]]) if(o) lab(tx,o.x,o.z+12,11,'#5a2a1a'); }; }
/* ---- one rifle: the SMG was the same automatic gun with another name, so the player only has the Puška ---- */
{ const _ow=owned; owned=function(){ return _ow().filter(i=>i!==1); }; const _sw=selectWeapon; selectWeapon=function(i){ _sw(i===1?0:i); }; if(COMBAT.wi===1) COMBAT.wi=0; }
/* ---- ammo on the weapon button, not a second "SMG 36/40" label on the screen ---- */
(function(){ const st=document.createElement('style'); st.textContent='body.touch #ammo{display:none!important} body.touch #twpn .am{font:800 11px Manrope,sans-serif;color:#ffd24a;margin-top:1px}'; document.head.appendChild(st); })();
