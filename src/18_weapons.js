/* ===================== arsenal: puška, SMG, snajper, bazuka ===================== */
const WEAPONS=[
  {n:'Puška',mag:30,cd:0.13,dmg:25,head:50,spread:0.008,ads:0.002,fov:50,reload:1.4,auto:true},
  {n:'SMG',mag:40,cd:0.07,dmg:14,head:28,spread:0.024,ads:0.011,fov:58,reload:1.2,auto:true},
  {n:'Snajper',mag:5,cd:1.1,dmg:100,head:150,spread:0.045,ads:0.0,fov:16,reload:2.0,auto:false},
  {n:'Bazuka',mag:1,cd:1.0,dmg:110,head:110,spread:0.01,ads:0.004,fov:55,reload:2.2,auto:false,rocket:true}];
COMBAT.wi=0; COMBAT.mags=WEAPONS.map(w=>w.mag); COMBAT.ads=false; COMBAT.fovK=0; COMBAT.shake=0;
let WMODELS=null; const ROCKETS=[], BOOMS=[], PUFFS=[];
function buildWeaponModels(){ if(WMODELS||!RIFLE) return; const cam=GAME.camera; const M=(c,m=0.5,r=0.5)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
  const mk=(parts,flashZ)=>{ const g=new THREE.Group(); for(const [w,h,d,mat,x,y,z,rx] of parts){ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); b.position.set(x,y,z); if(rx) b.rotation.x=rx; g.add(b); } const fl=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,6),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0.95})); fl.position.set(0,0.015,flashZ); fl.visible=false; g.add(fl); g.userData.flash=fl; g.visible=false; g.traverse(o=>{ if(o.isMesh){ o.renderOrder=10; o.frustumCulled=false; } }); cam.add(g); return g; };
  const dk=M(0x25282b,0.6,0.45), wd=M(0x6b4428,0,0.7), ol=M(0x4d5a2e,0.2,0.7), bl=M(0x111214,0.7,0.35);
  const smg=mk([[0.055,0.075,0.28,dk,0,0,-0.08],[0.024,0.024,0.14,dk,0,0.01,-0.28],[0.035,0.16,0.04,dk,0,-0.1,-0.1],[0.03,0.09,0.04,dk,0,-0.07,0.03],[0.04,0.04,0.14,dk,0,0.0,0.12]],-0.36);
  const snp=mk([[0.055,0.08,0.5,dk,0,0,-0.1],[0.022,0.022,0.6,bl,0,0.012,-0.62],[0.05,0.1,0.26,wd,0,-0.04,0.24],[0.04,0.1,0.05,wd,0,-0.08,0.04]],-0.93);
  { const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.3,14),bl); sc.rotation.x=Math.PI/2; sc.position.set(0,0.075,-0.1); snp.add(sc); sc.renderOrder=10; sc.frustumCulled=false; }
  const baz=new THREE.Group(); { const tube=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.075,1.05,16,1,true),new THREE.MeshStandardMaterial({color:0x4d5a2e,roughness:0.7,side:THREE.DoubleSide})); tube.rotation.x=Math.PI/2; baz.add(tube); for(const [z,y] of [[-0.05,-0.12],[0.15,-0.11]]){ const gp=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.12,0.04),dk); gp.position.set(0,y,z); baz.add(gp); } const sight=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.06,0.08),dk); sight.position.set(-0.07,0.09,-0.2); baz.add(sight);
    const war=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.2,12),M(0x6b6f57,0.3,0.6)); war.rotation.x=-Math.PI/2; war.position.z=-0.6; baz.add(war); baz.userData.war=war; const fl=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),new THREE.MeshBasicMaterial({color:0xffb35a,transparent:true,opacity:0.9})); fl.position.z=-0.62; fl.visible=false; baz.add(fl); baz.userData.flash=fl;
    baz.visible=false; baz.traverse(o=>{ if(o.isMesh){ o.renderOrder=10; o.frustumCulled=false; } }); cam.add(baz); }
  RIFLE.userData.flash=FLASHM; WMODELS=[RIFLE,smg,snp,baz];
  WMODELS.hip=[[0.19,-0.2,-0.38],[0.17,-0.19,-0.34],[0.2,-0.21,-0.36],[0.2,-0.13,-0.28]]; WMODELS.aim=[[0,-0.155,-0.3],[0,-0.16,-0.3],[0,-0.13,-0.25],[0.09,-0.1,-0.25]]; }
function curW(){ return WEAPONS[COMBAT.wi]; }
function selectWeapon(i){ if(PLAYER.driving||PLAYER.riding||COMBAT.dead||PKC.sit) return; COMBAT.wi=i; COMBAT.reload=0; if(!COMBAT.armed){ COMBAT.armed=true; document.body.classList.add('armed'); } COMBAT.ads=false; UI.toast(WEAPONS[i].n+(GAME.touch?' — nišan: tipka s okom':' — desni klik nišani')); updateCombatHUD(); }
function toggleGun(){ if(PLAYER.driving||PLAYER.riding||COMBAT.dead||PKC.sit) return; COMBAT.armed=!COMBAT.armed; COMBAT.ads=false; document.body.classList.toggle('armed',COMBAT.armed); UI.toast(COMBAT.armed?WEAPONS[COMBAT.wi].n+' u ruci — 1-4 mijenja oružje':'Oružje spremljeno'); updateCombatHUD(); }
function cycleGun(){ if(PLAYER.driving||PLAYER.riding||COMBAT.dead||PKC.sit) return; if(!COMBAT.armed){ selectWeapon(COMBAT.wi); return; } if(COMBAT.wi===WEAPONS.length-1){ COMBAT.armed=false; COMBAT.ads=false; document.body.classList.remove('armed'); COMBAT.wi=0; UI.toast('Oružje spremljeno'); updateCombatHUD(); return; } selectWeapon(COMBAT.wi+1); }
function reloadGun(){ const W=curW(); if(!COMBAT.armed||COMBAT.reload>0||COMBAT.mags[COMBAT.wi]===W.mag) return; COMBAT.reload=W.reload; COMBAT.ads=false; updateCombatHUD(); }
function fireGun(){ const C=COMBAT, W=curW(); if(!C.armed||C.dead||C.cd>0||C.reload>0||PLAYER.driving||PLAYER.riding||C.drink||PKC.sit) return; if(!W.auto&&C.hold&&C.fired) return; C.fired=true; if(C.mags[C.wi]<=0){ reloadGun(); return; }
  buildWeaponModels(); C.cd=W.cd; C.mags[C.wi]--; C.mag=C.mags[C.wi]; C.recoil=Math.min(W.rocket?0.2:0.12,C.recoil+(W.rocket?0.16:C.wi===2?0.1:0.03)); const vm=WMODELS[C.wi]; const fl=vm&&vm.userData.flash; if(fl){ fl.visible=true; C.flash=0.05; C.flashM=fl; }
  const cam=GAME.camera; const o=cam.getWorldPosition(new THREE.Vector3()); const d=new THREE.Vector3(0,0,-1).applyQuaternion(cam.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const sp=(C.ads?W.ads:W.spread)+(C.bac>0.3?C.bac*0.02:0); if(sp>0){ d.x+=(Math.random()-0.5)*sp*2; d.y+=(Math.random()-0.5)*sp*2; d.z+=(Math.random()-0.5)*sp*2; d.normalize(); }
  const muzzle=fl?fl.getWorldPosition(new THREE.Vector3()):o.clone();
  if(W.rocket){ gtaShot(); spawnRocket(muzzle,d,true); if(vm&&vm.userData.war) vm.userData.war.visible=false; C.shot={n:++C.shotN,w:3,a:[+muzzle.x.toFixed(2),+muzzle.y.toFixed(2),+muzzle.z.toFixed(2)],d:[+d.x.toFixed(3),+d.y.toFixed(3),+d.z.toFixed(3)]}; if(C.mags[C.wi]<=0) setTimeout(()=>reloadGun(),350); updateCombatHUD(); return; }
  let best=null; for(const R of NET.remotes.values()){ if(!R.cur||R.dead||(R.d>=0)||(R.pa>=0)) continue; const gy=groundAt(R.cur.x,R.cur.z); const h=rayCyl(o,d,R.cur.x,R.cur.z,gy,gy+1.85,0.36); if(h&&h.t<(C.wi===2?400:150)&&(!best||h.t<best.t)) best={t:h.t,R,head:h.y>gy+1.55}; }
  const maxR=C.wi===2?400:150; let end=maxR; for(let t=1;t<(best?best.t:maxR);t+=0.7){ const x=o.x+d.x*t, y=o.y+d.y*t, z=o.z+d.z*t; if(y<getHeight(x,z)){ end=t; best=null; break; } const hb=BHASH.hit(x,z,0); if(hb&&y<hb.y1&&y>hb.y0){ end=t; best=null; break; } }
  { const pp=peopleRay(o,d,best?best.t:end); if(pp){ hurtPerson(pp.P,pp.head?W.head:W.dmg,true); showHitMarker(pp.head); end=pp.t; best=null; } }
  if(best){ end=best.t; const dmg=best.head?W.head:W.dmg; C.hits[best.R.id]=(C.hits[best.R.id]||0)+dmg; showHitMarker(best.head); }
  gtaShot(); blip('shot'); OW.panic=Math.max(OW.panic,8); const e=o.clone().addScaledVector(d,end); addTracer(muzzle,e); C.shot={n:++C.shotN,w:C.wi,a:[+muzzle.x.toFixed(2),+muzzle.y.toFixed(2),+muzzle.z.toFixed(2)],b:[+e.x.toFixed(2),+e.y.toFixed(2),+e.z.toFixed(2)]};
  if(C.mags[C.wi]<=0) setTimeout(()=>reloadGun(),200); updateCombatHUD(); }
const ROCKET_M=new THREE.MeshStandardMaterial({color:0x6b6f57,roughness:0.6}), PUFF_M=new THREE.MeshStandardMaterial({color:0xb9b6ae,roughness:1,transparent:true,opacity:0.6,depthWrite:false});
function spawnRocket(p,d,local){ const m=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,0.55,8),ROCKET_M); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d); m.position.copy(p); GAME.scene.add(m); ROCKETS.push({m,p:p.clone(),d:d.clone(),t:0,local,pt:0}); }
function puff(p,s,col){ let P=PUFFS.find(q=>!q.m.visible); if(!P){ if(PUFFS.length>90) return; const m=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),PUFF_M.clone()); GAME.scene.add(m); P={m}; PUFFS.push(P); } P.m.visible=true; P.m.position.copy(p); P.t=0; P.s=s; P.life=1.1; P.m.material.color.setHex(col||0xb9b6ae); P.m.scale.setScalar(s*0.3); }
function explode(p,local){ try{ blip('boom'); OW.panic=10; }catch(e){} const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xffa53a,transparent:true,opacity:0.95,depthWrite:false})); m.position.copy(p); GAME.scene.add(m); BOOMS.push({m,t:0});
  for(let k=0;k<9;k++) puff(p.clone().add(new THREE.Vector3((Math.random()-0.5)*2,Math.random()*1.5,(Math.random()-0.5)*2)),1.6+Math.random(),k<3?0x3a3a3a:0x8f8b84);
  const dc=GAME.camera.position.distanceTo(p); if(dc<30) COMBAT.shake=Math.max(COMBAT.shake,(1-dc/30)*0.6);
  if(local){ peopleSplash(p,6.5); for(const R of NET.remotes.values()){ if(!R.cur||R.dead) continue; const dd=Math.hypot(R.cur.x-p.x,R.cur.z-p.z,(groundAt(R.cur.x,R.cur.z)+0.9)-p.y); if(dd<6.5){ const dmg=Math.round(110*(1-dd/6.5)+15); COMBAT.hits[R.id]=(COMBAT.hits[R.id]||0)+dmg; showHitMarker(dmg>80); } } } }
function weaponTick(dt){ const C=COMBAT; buildWeaponModels(); if(!WMODELS) return; const W=curW();
  if(C.flashM&&C.flash<=0) C.flashM.visible=false;
  const inCar=PLAYER.driving||PLAYER.riding; const show=C.armed&&!C.dead&&!inCar&&!C.drink&&!PKC.sit; const scoped=show&&C.ads&&C.wi===2&&C.fovK>0.8;
  WMODELS.forEach((g,i)=>{ g.visible=show&&i===C.wi&&!scoped; });
  const vm=WMODELS[C.wi]; if(vm&&show){ const hp=WMODELS.hip[C.wi], ap=WMODELS.aim[C.wi]; const k=C.fovK; vm.position.set(hp[0]+(ap[0]-hp[0])*k,hp[1]+(ap[1]-hp[1])*k,hp[2]+(ap[2]-hp[2])*k+C.recoil*(C.wi===3?0.6:1.4)); vm.rotation.x=C.recoil*(C.wi===3?0.8:2.2)+(C.reload>0?-0.6*Math.sin(Math.min(1,(W.reload-C.reload)/W.reload)*Math.PI):0); if(C.wi===3&&vm.userData.war) vm.userData.war.visible=C.mags[3]>0; }
  const want=(show&&C.ads)?1:0; C.fovK+=(want-C.fovK)*Math.min(1,dt*12); const cam=GAME.camera;
  if(!inCar&&!PKC.sit){ const f=72+(W.fov-72)*C.fovK; if(Math.abs(cam.fov-f)>0.05){ cam.fov=f; cam.updateProjectionMatrix(); } }
  const sc=document.getElementById('scope'); if(sc) sc.classList.toggle('on',scoped); if(!show&&C.ads) C.ads=false; const ab=document.getElementById('aimbtn'); if(ab&&ab.classList.contains('on')!==!!C.ads) ab.classList.toggle('on',!!C.ads); document.body.classList.toggle('scoped',!!scoped);
  if(C.shake>0){ C.shake=Math.max(0,C.shake-dt*1.5); cam.rotation.x+=(Math.random()-0.5)*C.shake*0.05; cam.rotation.y+=(Math.random()-0.5)*C.shake*0.05; }
  for(let i=ROCKETS.length-1;i>=0;i--){ const R=ROCKETS[i]; R.t+=dt; const step=46*dt; let hit=false; const np=R.p.clone().addScaledVector(R.d,step);
    if(np.y<getHeight(np.x,np.z)+0.05) hit=true; const hb=BHASH.hit(np.x,np.z,0); if(hb&&np.y<hb.y1&&np.y>hb.y0) hit=true; if(R.maxD!==undefined&&R.t*46>=R.maxD) hit=true;
    if(R.local&&!hit) for(const Q of NET.remotes.values()){ if(!Q.cur||Q.dead) continue; const gy=groundAt(Q.cur.x,Q.cur.z); if(Math.hypot(np.x-Q.cur.x,np.z-Q.cur.z)<0.5&&np.y>gy&&np.y<gy+1.9){ hit=true; break; } }
    if(R.t>6) hit=true; R.p.copy(np); R.m.position.copy(np); R.pt+=dt; if(R.pt>0.025){ R.pt=0; puff(np.clone(),0.35,0xd8d4cc); }
    if(hit){ explode(np,R.local); GAME.scene.remove(R.m); R.m.geometry.dispose(); ROCKETS.splice(i,1); } }
  for(let i=BOOMS.length-1;i>=0;i--){ const B=BOOMS[i]; B.t+=dt; const u=B.t/0.45; B.m.scale.setScalar(0.4+u*4.2); B.m.material.opacity=Math.max(0,0.95*(1-u)); if(u>=1){ GAME.scene.remove(B.m); B.m.geometry.dispose(); B.m.material.dispose(); BOOMS.splice(i,1); } }
  for(const P of PUFFS){ if(!P.m.visible) continue; P.t+=dt; const u=P.t/P.life; P.m.position.y+=dt*0.8; P.m.scale.setScalar(P.s*(0.3+u*0.9)); P.m.material.opacity=Math.max(0,0.6*(1-u)); if(u>=1) P.m.visible=false; } }
function updateCombatHUD(){ const C=COMBAT, W=curW(); const hb=document.getElementById('hpfill'); if(hb){ hb.style.width=C.hp+'%'; hb.style.background=C.hp>50?'#5fc46a':C.hp>25?'#f0b43a':'#e5483b'; } const am=document.getElementById('ammo'); if(am) am.textContent=W.n+'  '+(C.reload>0?'punim…':(C.mags[C.wi]+' / '+W.mag)); const ba=document.getElementById('bac'); if(ba){ ba.style.display=C.bac>0.02?'block':'none'; ba.textContent='🍺 '+C.bac.toFixed(2)+' ‰'; } const tg=document.getElementById('tgun'); if(tg) tg.textContent=C.armed?W.n:'Oružje'; }
/* remote rockets: presence carries the launch point and direction */
function remoteShot(R,sh){ if(sh.w===3&&Array.isArray(sh.a)&&Array.isArray(sh.d)){ const p=new THREE.Vector3(+sh.a[0],+sh.a[1],+sh.a[2]), d=new THREE.Vector3(+sh.d[0],+sh.d[1],+sh.d[2]); if(d.lengthSq()>0.5) spawnRocket(p,d.normalize(),false); return true; } return false; }
