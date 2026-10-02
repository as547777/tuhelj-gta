/* ===================== first-person player ===================== */
const PLAYER={pos:new THREE.Vector3(),vel:new THREE.Vector3(),yaw:0,pitch:0,ground:false,fly:false,eye:1.68,bob:0,run:false,enabled:false};
const KEYS={}; const TOUCH={mx:0,mz:0,active:false};
function setupInput(canvas,onLockChange){
  addEventListener('keydown',e=>{ if(e.target&&e.target.tagName==='INPUT') return; KEYS[e.code]=true; if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); if(e.code==='KeyE' && PLAYER.enabled && GAME.started && !GAME.paused){ useCarKey(); } if(e.code==='KeyQ' && PLAYER.enabled && GAME.started && !GAME.paused) toggleGun(); { const dg=['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6'].indexOf(e.code); if(dg>=0 && PLAYER.enabled && GAME.started && !GAME.paused) selectSlot(dg); } if(e.code==='KeyR' && GAME.started) reloadGun(); if(e.code==='Escape' && COMBAT.menuOpen) closeDrinks(); if(e.code==='KeyV' && (PLAYER.driving||PLAYER.riding)){ CARCAM.first=!CARCAM.first; CARCAM.init=false; } if(e.code==='KeyF' && PLAYER.enabled && !PLAYER.driving){ toggleFly(); } });
  addEventListener('keyup',e=>{ KEYS[e.code]=false; });
  addEventListener('blur',()=>{ for(const k in KEYS) KEYS[k]=false; });
  document.addEventListener('pointerlockchange',()=>{ const locked=document.pointerLockElement===canvas; onLockChange(locked); });
  document.addEventListener('mousedown',e=>{ if(e.button===0&&PLAYER.driving&&PLAYER.driving.truck) LIFE.spray=true; if((document.pointerLockElement===canvas||GAME.dragLook) && GAME.started && !GAME.paused && COMBAT.armed){ if(e.button===0){ COMBAT.fired=false; fireGun(); COMBAT.hold=true; } if(e.button===2) COMBAT.ads=true; } });
  document.addEventListener('mouseup',e=>{ if(e.button===0){ COMBAT.hold=false; COMBAT.fired=false; LIFE.spray=false; } if(e.button===2) COMBAT.ads=false; });
  document.addEventListener('contextmenu',e=>{ if(GAME.started) e.preventDefault(); });
  document.addEventListener('mousemove',e=>{ if(document.pointerLockElement!==canvas) return; if(PLAYER.driving||PLAYER.riding){ CARCAM.orbit-=e.movementX*0.0025; if(CARCAM.first) CARCAM.pitchFP=clamp(CARCAM.pitchFP-e.movementY*0.002,-0.5,0.35); else CARCAM.pitch=clamp(CARCAM.pitch+e.movementY*0.002,-0.1,0.6); CARCAM.t=0; return; } const zs=GAME.camera.fov/72; PLAYER.yaw-=e.movementX*0.0021*zs; PLAYER.pitch-=e.movementY*0.0021*zs; PLAYER.pitch=clamp(PLAYER.pitch,-1.45,1.45); });
  // touch: fixed joystick bottom-left (in #joyzone), run toggle bottom-right, drag anywhere else to look
  const look={id:null,x:0,y:0};
  canvas.addEventListener('touchstart',e=>{ if(!PLAYER.enabled&&!PKC.sit) return; for(const t of e.changedTouches){ if(look.id===null){ look.id=t.identifier; look.x=t.clientX; look.y=t.clientY; } } e.preventDefault(); },{passive:false});
  canvas.addEventListener('touchmove',e=>{ for(const t of e.changedTouches){ if(t.identifier===look.id){ if(PKC.sit){ PKC.lookY=clamp((PKC.lookY||0)-(t.clientX-look.x)*0.005,-2.7,2.7); PKC.lookP=clamp((PKC.lookP||0)-(t.clientY-look.y)*0.003,-0.5,0.7); } else if(PLAYER.driving||PLAYER.riding){ CARCAM.orbit-=(t.clientX-look.x)*0.007; if(CARCAM.first) CARCAM.pitchFP=clamp(CARCAM.pitchFP-(t.clientY-look.y)*0.004,-0.5,0.35); else CARCAM.pitch=clamp(CARCAM.pitch+(t.clientY-look.y)*0.004,-0.1,0.6); CARCAM.t=0; } else { const zs=GAME.camera.fov/72; PLAYER.yaw-=(t.clientX-look.x)*0.0055*zs; PLAYER.pitch=clamp(PLAYER.pitch-(t.clientY-look.y)*0.0055*zs,-1.45,1.45); } look.x=t.clientX; look.y=t.clientY; } } e.preventDefault(); },{passive:false});
  const endLook=e=>{ for(const t of e.changedTouches) if(t.identifier===look.id) look.id=null; };
  canvas.addEventListener('touchend',endLook); canvas.addEventListener('touchcancel',endLook);
  const zone=document.getElementById('joyzone'), base=document.getElementById('joy'), knob=base?base.querySelector('.knob'):null; let jid=null; let R=54;
  const upd=(t)=>{ const r=base.getBoundingClientRect(); R=Math.max(30,r.width*0.36); const cx=r.left+r.width/2, cy=r.top+r.height/2; let dx=t.clientX-cx, dy=t.clientY-cy; const l=Math.hypot(dx,dy); if(l>R){ dx*=R/l; dy*=R/l; } knob.style.transform=`translate(${dx}px,${dy}px)`; let mx=dx/R, mz=dy/R; if(Math.hypot(mx,mz)<0.12){ mx=0; mz=0; } TOUCH.mx=mx; TOUCH.mz=mz; };
  if(zone){ zone.addEventListener('touchstart',e=>{ if(!PLAYER.enabled) return; for(const t of e.changedTouches){ if(jid===null){ jid=t.identifier; upd(t); base.classList.add('act'); } } e.preventDefault(); },{passive:false});
    zone.addEventListener('touchmove',e=>{ for(const t of e.changedTouches) if(t.identifier===jid) upd(t); e.preventDefault(); },{passive:false});
    const endJ=e=>{ for(const t of e.changedTouches) if(t.identifier===jid){ jid=null; TOUCH.mx=0; TOUCH.mz=0; knob.style.transform=''; base.classList.remove('act'); } };
    zone.addEventListener('touchend',endJ); zone.addEventListener('touchcancel',endJ); }
  const rb=document.getElementById('runbtn');
  if(rb){ const tog=(e)=>{ TOUCH.run=!TOUCH.run; rb.classList.toggle('on',TOUCH.run); if(e){ e.preventDefault(); e.stopPropagation(); } }; rb.addEventListener('touchstart',tog,{passive:false}); rb.addEventListener('click',e=>{ if(e.pointerType==='mouse'||e.detail>0&&!('ontouchstart' in window)) tog(e); }); }
}
function teleport(x,z,lookX,lookZ){ PLAYER.pos.set(x,groundAt(x,z),z); PLAYER.vel.set(0,0,0); if(lookX!==undefined){ PLAYER.yaw=Math.atan2(-(lookX-x),-(lookZ-z)); PLAYER.pitch=0.02; } VEG.lastRebuild.set(1e9,0,1e9); }
function updatePlayer(dt){
  const P=PLAYER; if(!P.enabled) return;
  let fx=0,fz=0; if(KEYS.KeyW||KEYS.ArrowUp) fz-=1; if(KEYS.KeyS||KEYS.ArrowDown) fz+=1; if(KEYS.KeyA||KEYS.ArrowLeft) fx-=1; if(KEYS.KeyD||KEYS.ArrowRight) fx+=1;
  fx+=TOUCH.mx; fz+=TOUCH.mz; const l=Math.hypot(fx,fz); if(l>1){ fx/=l; fz/=l; }
  const run=(KEYS.ShiftLeft||KEYS.ShiftRight||TOUCH.run)&&OW.stam>1; const cy=Math.cos(P.yaw), sy=Math.sin(P.yaw);
  const wx=fx*cy+fz*sy, wz=-fx*sy+fz*cy;
  if(COMBAT.dead){ fx=0; fz=0; }
  if(COMBAT.bac>0.25){ const w=Math.sin(GAME.time*1.3)*Math.min(0.6,COMBAT.bac*0.35); if(Math.abs(fx)+Math.abs(fz)>0.1) fx+=w; }
  if(P.fly){ const sp=run?75:24; const up=((KEYS.Space||TOUCH.up)?1:0)-((KEYS.KeyC||KEYS.ControlLeft||TOUCH.down)?1:0); const cp=Math.cos(P.pitch), spp=Math.sin(P.pitch);
    const fw=[-sy*cp, spp, -cy*cp], rt=[cy,0,-sy]; const tv=new THREE.Vector3((fw[0]*-fz+rt[0]*fx)*sp,(fw[1]*-fz+up*0.7)*sp,(fw[2]*-fz+rt[2]*fx)*sp);
    P.vel.lerp(tv,1-Math.exp(-dt*5)); P.pos.addScaledVector(P.vel,dt); const g=getHeight(P.pos.x,P.pos.z); if(P.pos.y<g+0.3) P.pos.y=g+0.3; if(P.pos.y>g+700) P.pos.y=g+700; }
  else {
    const aimWalk=COMBAT.ads&&COMBAT.armed; const sp=PLAYER.crouch?(run?2.4:1.2):aimWalk?(run?2.6:1.3):run?4.6:1.45; /* W = walk, Shift = run (GTA) */ const acc=P.ground?9:2.5; const tx=wx*sp, tz=wz*sp;
    P.vel.x+= (tx-P.vel.x)*(1-Math.exp(-dt*acc)); P.vel.z+=(tz-P.vel.z)*(1-Math.exp(-dt*acc));
    P.vel.y-=22*dt; if(P.ground && (KEYS.Space||TOUCH.jump) && !COMBAT.dead){ P.vel.y=6.0; P.ground=false; } TOUCH.jump=false;
    const ox=P.pos.x, oz=P.pos.z; P.pos.x+=P.vel.x*dt; P.pos.z+=P.vel.z*dt; P.pos.y+=P.vel.y*dt;
    BHASH.collide(P.pos,0.32,P.pos.y+0.5);
    if(VEG.trunks) for(const [tx2,tz2,r] of VEG.trunks){ const dx=P.pos.x-tx2, dz=P.pos.z-tz2; const d=Math.hypot(dx,dz), m=r+0.3; if(d<m && d>1e-4){ P.pos.x=tx2+dx/d*m; P.pos.z=tz2+dz/d*m; } }
    const tN=getHeight(P.pos.x,P.pos.z), tO=getHeight(ox,oz); const hd=Math.max(0.001,Math.hypot(P.pos.x-ox,P.pos.z-oz));
    const onFloor=floorAt(P.pos.x,P.pos.z)>tN-0.05;
    if(P.ground && !onFloor && !INSIDE && (tN-tO)/hd>2.4){ P.pos.x=ox; P.pos.z=oz; }
    let g2=groundAt(P.pos.x,P.pos.z);
    if(P.ground && g2-P.pos.y>0.85){ P.pos.x=ox; P.pos.z=oz; g2=groundAt(ox,oz); }
    if(P.pos.y<=g2 || (P.ground && P.pos.y-g2<0.35 && P.vel.y<=0)){ P.pos.y=g2; P.vel.y=0; P.ground=true; } else P.ground=false;
    const hs=Math.hypot(P.vel.x,P.vel.z); if(P.ground && hs>0.5) P.bob+=dt*hs*1.75; else P.bob*=0.9;
  }
  if(typeof INSIDE==='undefined'||!INSIDE){ P.pos.x=clamp(P.pos.x,M.XMIN-150,M.XMAX+150); P.pos.z=clamp(P.pos.z,M.ZMIN-150,M.ZMAX+150); } // interior rooms sit outside the map
}
function groundAt(x,z){ if(typeof INSIDE!=='undefined'&&INSIDE){ const fl=floorAt(x,z); if(fl>-1e8) return fl; } const g=getHeight(x,z)+walkLift(x,z); return FLOORS.length?Math.max(g,floorAt(x,z)):g; }
function walkLift(x,z){ // sidewalks & road surface
  const n=nearestRoad(x,z,4); if(!n) return 0; return n.d<0? 0.07 : 0; }
function applyCamera(cam){ const P=PLAYER; const b=P.fly?0:Math.sin(P.bob*2)*0.035; const sw=drunkSway(); const dy=COMBAT.dead?-1.2:0; cam.position.set(P.pos.x,P.pos.y+P.eye+b+dy,P.pos.z); cam.rotation.set(P.pitch+COMBAT.recoil*0.6,P.yaw+sw[1],Math.sin(P.bob)*0.004+sw[0]+(COMBAT.dead?0.5:0),'YXZ'); }
