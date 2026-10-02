/* ===================== arsenal: pištolj, SMG, sačmarica, puška, snajper, bazuka =====================
   Indeksi 0-3 ostaju isti kao prije (multiplayer šalje w=3 za rakete); pištolj i sačmarica su dodani na kraj.
   Kotačić miša / 1-6 mijenja oružje (redom kao u GTA-u: ruke → pištolj → SMG → sačmarica → puška → snajper → bazuka). */
const WEAPONS=[
  {n:'Puška',mag:30,cd:0.13,dmg:25,head:50,spread:0.008,ads:0.002,fov:50,reload:1.4,auto:true,ico:'rifle',snd:'rifle'},
  {n:'SMG',mag:40,cd:0.07,dmg:14,head:28,spread:0.024,ads:0.011,fov:58,reload:1.2,auto:true,ico:'smg',snd:'smg'},
  {n:'Snajper',mag:5,cd:1.1,dmg:100,head:150,spread:0.045,ads:0.0,fov:16,reload:2.0,auto:false,ico:'sniper',snd:'sniper'},
  {n:'Bazuka',mag:1,cd:1.0,dmg:110,head:110,spread:0.01,ads:0.004,fov:55,reload:2.2,auto:false,rocket:true,ico:'rpg',snd:'rpg'},
  {n:'Pištolj',mag:12,cd:0.2,dmg:30,head:75,spread:0.014,ads:0.004,fov:60,reload:1.1,auto:false,ico:'pistol',snd:'pistol'},
  {n:'Sačmarica',mag:6,cd:0.8,dmg:13,head:20,spread:0.065,ads:0.05,fov:62,reload:2.4,auto:false,pellets:9,range:48,ico:'shotgun',snd:'shotgun'}];
const WORDER=[4,1,5,0,2,3]; // wheel / number-key order
// weapons you own: pistol, hunting rifle and SMG from the start; the story hands out the shotgun, sniper and bazooka
const ARMORY=new Set((()=>{ try{ const a=JSON.parse(localStorage.getItem('tuhelj_arms')||'null'); if(Array.isArray(a)) return a; }catch(e){} return [4,0,1]; })());
function armUnlock(i,silent){ if(ARMORY.has(i)) return; ARMORY.add(i); try{ localStorage.setItem('tuhelj_arms',JSON.stringify([...ARMORY])); }catch(e){} COMBAT.mags[i]=WEAPONS[i].mag; if(!silent){ banner(WEAPONS[i].n.toUpperCase(),'NOVO ORUŽJE','#f2c9a8'); } }
function owned(){ return WORDER.filter(i=>ARMORY.has(i)); }
COMBAT.wi=4; COMBAT.mags=WEAPONS.map(w=>w.mag); COMBAT.ads=false; COMBAT.fovK=0; COMBAT.shake=0;
let WMODELS=null; const ROCKETS=[], BOOMS=[], PUFFS=[], DEBRIS=[], WRECKS=[], SCORCH=[];
const FX={};
/* ---- shared textures: soft smoke, fire ball, scorch ---- */
function fxInit(){ if(FX.ready) return; FX.ready=true;
  const rad=(stops,n=128)=>{ const c=cvs(n,n), g=c.getContext('2d'); const gr=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2); for(const [o,col] of stops) gr.addColorStop(o,col); g.fillStyle=gr; g.fillRect(0,0,n,n); return c; };
  const smoke=rad([[0,'rgba(255,255,255,0.85)'],[0.45,'rgba(255,255,255,0.45)'],[1,'rgba(255,255,255,0)']]);
  { const g=smoke.getContext('2d'); g.globalCompositeOperation='destination-out'; for(let i=0;i<70;i++){ g.fillStyle='rgba(0,0,0,'+(0.05+Math.random()*0.12)+')'; g.beginPath(); g.arc(Math.random()*128,Math.random()*128,4+Math.random()*16,0,TAU); g.fill(); } }
  FX.smoke=new THREE.CanvasTexture(smoke); FX.smoke.colorSpace=THREE.SRGBColorSpace;
  FX.fire=new THREE.CanvasTexture(rad([[0,'rgba(255,250,220,1)'],[0.2,'rgba(255,214,110,0.95)'],[0.5,'rgba(255,120,30,0.6)'],[1,'rgba(160,30,0,0)']])); FX.fire.colorSpace=THREE.SRGBColorSpace;
  FX.scorch=new THREE.CanvasTexture(rad([[0,'rgba(10,8,6,0.92)'],[0.55,'rgba(20,16,12,0.7)'],[1,'rgba(30,24,18,0)']])); FX.scorch.colorSpace=THREE.SRGBColorSpace;
  FX.ring=new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:0.6,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  FX.debM=new THREE.MeshStandardMaterial({color:0x2b2622,roughness:0.9}); FX.debG=new THREE.BoxGeometry(0.22,0.14,0.18);
  // one light reused for muzzle flashes / rockets / explosions (adding lights later would recompile every shader)
  FX.light=new THREE.PointLight(0xffa040,0,40,2); FX.light.castShadow=false; GAME.scene.add(FX.light); FX.lightT=0; }
function fxFlash(p,intensity,dur,dist){ if(!FX.light) return; if(FX.light.intensity>intensity&&FX.lightT>0) return; FX.light.position.copy(p); FX.light.intensity=intensity; FX.light.distance=dist||40; FX.lightI=intensity; FX.lightT=dur; FX.lightD=dur; }
/* ---- sounds (WebAudio noise bursts shaped per weapon) ---- */
function sfx(type,vol){ const C=typeof AUD!=='undefined'&&AUD.ctx; if(!C||OW.muted) { return; } const t=C.currentTime; const v=(vol===undefined?1:vol);
  const burst=(f0,q,amp,dur,kind)=>{ const s=C.createBufferSource(); s.buffer=AUD.noise; const f=C.createBiquadFilter(); f.type=kind||'bandpass'; f.frequency.value=f0; f.Q.value=q; const g=C.createGain(); s.connect(f); f.connect(g); g.connect(AUD.master); g.gain.setValueAtTime(amp*v,t); g.gain.exponentialRampToValueAtTime(0.0008,t+dur); s.start(t,Math.random()); s.stop(t+dur+0.05); };
  const thump=(f0,f1,amp,dur)=>{ const o=C.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+dur); const g=C.createGain(); o.connect(g); g.connect(AUD.master); g.gain.setValueAtTime(amp*v,t); g.gain.exponentialRampToValueAtTime(0.0008,t+dur); o.start(t); o.stop(t+dur+0.05); };
  if(type==='pistol'){ burst(1700,0.8,0.55,0.16); thump(180,60,0.35,0.12); }
  else if(type==='smg'){ burst(2100,0.9,0.4,0.1); thump(160,70,0.2,0.08); }
  else if(type==='rifle'){ burst(1300,0.7,0.6,0.22); thump(140,50,0.45,0.18); }
  else if(type==='sniper'){ burst(900,0.6,0.8,0.55); thump(110,35,0.7,0.45); }
  else if(type==='shotgun'){ burst(700,0.5,0.85,0.45); thump(120,40,0.75,0.35); }
  else if(type==='rpg'){ burst(500,0.4,0.6,0.7,'lowpass'); burst(2500,0.6,0.25,0.9); }
  else if(type==='boom'){ burst(260,0.5,1.0,2.2,'lowpass'); thump(70,22,1.0,1.6); burst(1200,0.5,0.35,0.6); }
  else if(type==='dry'){ burst(3200,3,0.12,0.04); }
  else if(type==='reload'){ burst(2600,4,0.15,0.05); setTimeout(()=>{ try{ sfx('dry',1.4*v); }catch(e){} },260); }
  else if(type==='ricochet'){ burst(4200,2,0.12,0.12); } }
function sfxAt(type,p,maxD){ const d=GAME.camera.position.distanceTo(p); const m=maxD||180; if(d<m) sfx(type,Math.max(0.05,1-d/m)); }
/* ---- view models (first person) ---- */
function bazookaModel(){ const g=new THREE.Group(); const M=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
  const ol=M(0x4a5532,0.25,0.62), dk=M(0x1f2224,0.75,0.38), wd=M(0x6a4428,0.0,0.6), br=M(0x8a7a4a,0.6,0.4);
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,1.0,18),ol); tube.rotation.x=Math.PI/2; g.add(tube);
  const back=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.085,0.24,18,1,true),dk); back.rotation.x=Math.PI/2; back.position.z=0.58; g.add(back);
  const front=new THREE.Mesh(new THREE.CylinderGeometry(0.052,0.048,0.08,18),dk); front.rotation.x=Math.PI/2; front.position.z=-0.5; g.add(front);
  const heat=new THREE.Mesh(new THREE.CylinderGeometry(0.052,0.052,0.3,18),wd); heat.rotation.x=Math.PI/2; heat.position.z=0.05; g.add(heat);
  for(const z of [-0.08,0.18]){ const gp=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.12,0.045),dk); gp.position.set(0,-0.1,z); gp.rotation.x=0.25; g.add(gp); }
  const trig=new THREE.Mesh(new THREE.TorusGeometry(0.025,0.006,6,12,Math.PI),dk); trig.position.set(0,-0.06,-0.1); g.add(trig);
  const sight=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.05,0.12),dk); sight.position.set(-0.055,0.07,-0.12); g.add(sight);
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.014,0.01,10),new THREE.MeshStandardMaterial({color:0x2a4a6a,metalness:0.9,roughness:0.05,emissive:0x0a1a2a})); lens.rotation.x=Math.PI/2; lens.position.set(-0.055,0.075,-0.185); g.add(lens);
  // warhead (visible while loaded)
  const war=new THREE.Group(); const prof=[[0.0,0.0],[0.03,0.02],[0.055,0.08],[0.062,0.16],[0.05,0.2],[0.03,0.22],[0,0.22]].map(p=>new THREE.Vector2(p[0],p[1]));
  const head=new THREE.Mesh(new THREE.LatheGeometry(prof,18),ol); head.rotation.x=-Math.PI/2; war.add(head);
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.012,0.05,8),br); tip.rotation.x=Math.PI/2; tip.position.z=-0.245; war.add(tip);
  war.position.z=-0.52; g.add(war); g.userData.war=war;
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.material.userData.gunfix=true; } }); return g; }
function buildWeaponModels(){ if(WMODELS||!RIFLE) return; fxInit(); const cam=GAME.camera; const M=(c,m=0.5,r=0.5)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
  const flashMesh=(z,s)=>{ const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:FX.fire,color:0xffd27a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); fl.scale.setScalar(s); fl.position.set(0,0.015,z); fl.visible=false; return fl; };
  const mk=(parts,flashZ,fs)=>{ const g=new THREE.Group(); for(const [w,h,d,mat,x,y,z,rx] of parts){ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); b.position.set(x,y,z); if(rx) b.rotation.x=rx; g.add(b); } const fl=flashMesh(flashZ,fs||0.16); g.add(fl); g.userData.flash=fl; g.visible=false; g.traverse(o=>{ if(o.isMesh||o.isSprite){ o.renderOrder=10; o.frustumCulled=false; } }); cam.add(g); return g; };
  const dk=M(0x25282b,0.7,0.4), wd=M(0x6b4428,0,0.6), bl=M(0x111214,0.8,0.3);
  const smg=mk([[0.055,0.075,0.28,dk,0,0,-0.08],[0.024,0.024,0.14,dk,0,0.01,-0.28],[0.035,0.16,0.04,dk,0,-0.1,-0.1],[0.03,0.09,0.04,dk,0,-0.07,0.03],[0.04,0.04,0.14,dk,0,0.0,0.12]],-0.36);
  const snp=mk([[0.055,0.08,0.5,dk,0,0,-0.1],[0.022,0.022,0.6,bl,0,0.012,-0.62],[0.05,0.1,0.26,wd,0,-0.04,0.24],[0.04,0.1,0.05,wd,0,-0.08,0.04]],-0.93,0.22);
  { const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.3,14),bl); sc.rotation.x=Math.PI/2; sc.position.set(0,0.075,-0.1); snp.add(sc); sc.renderOrder=10; sc.frustumCulled=false; }
  const baz=new THREE.Group(); { const b=bazookaModel(); baz.add(b); baz.userData.war=b.userData.war; const fl=flashMesh(-0.62,0.5); baz.add(fl); baz.userData.flash=fl; baz.visible=false; baz.traverse(o=>{ if(o.isMesh||o.isSprite){ o.renderOrder=10; o.frustumCulled=false; } }); cam.add(baz); }
  const pis=mk([[0.032,0.035,0.19,dk,0,0.02,-0.06],[0.03,0.11,0.045,dk,0,-0.045,0.01,0.2],[0.012,0.012,0.03,bl,0,0.02,-0.165]],-0.18,0.12);
  const sho=mk([[0.05,0.07,0.32,dk,0,0,-0.05],[0.026,0.026,0.5,bl,0,0.02,-0.45],[0.03,0.03,0.32,wd,0,-0.025,-0.42],[0.05,0.11,0.24,wd,0,-0.045,0.22],[0.035,0.09,0.045,wd,0,-0.075,0.04]],-0.72,0.3);
  RIFLE.userData.flash=FLASHM; if(FLASHM){ const fl=flashMesh(FLASHM.position.z,0.18); FLASHM.parent.add(fl); FLASHM.parent.remove(FLASHM); FLASHM=fl; RIFLE.userData.flash=fl; fl.renderOrder=10; fl.frustumCulled=false; }
  WMODELS=[RIFLE,smg,snp,baz,pis,sho];
  WMODELS.hip=[[0.19,-0.2,-0.38],[0.17,-0.19,-0.34],[0.2,-0.21,-0.36],[0.2,-0.13,-0.28],[0.16,-0.17,-0.36],[0.19,-0.2,-0.38]];
  WMODELS.aim=[[0,-0.155,-0.3],[0,-0.16,-0.3],[0,-0.13,-0.25],[0.09,-0.1,-0.25],[0,-0.11,-0.34],[0,-0.15,-0.32]]; }
function curW(){ return WEAPONS[COMBAT.wi]; }
function canHoldGun(){ return !(PLAYER.driving||PLAYER.riding||COMBAT.dead||(typeof PKC!=='undefined'&&PKC.sit)||PLAYER.heli); }
function selectWeapon(i){ if(!canHoldGun()) return; if(!ARMORY.has(i)){ UI.toast('Još nemaš: '+WEAPONS[i].n+' — nastavi priču'); return; } const was=COMBAT.armed&&COMBAT.wi===i; COMBAT.wi=i; COMBAT.reload=0; if(!COMBAT.armed){ COMBAT.armed=true; document.body.classList.add('armed'); } COMBAT.ads=false; if(!was){ try{ sfx('reload',0.6); }catch(e){} } showWeaponWheel(); updateCombatHUD(); }
function holster(){ COMBAT.armed=false; COMBAT.ads=false; document.body.classList.remove('armed'); showWeaponWheel(); updateCombatHUD(); }
function toggleGun(){ if(!canHoldGun()) return; if(COMBAT.armed) holster(); else selectWeapon(ARMORY.has(COMBAT.wi)?COMBAT.wi:owned()[0]); }
function weaponStep(dir){ if(!canHoldGun()) return; const slots=[-1].concat(owned()); let k=COMBAT.armed?slots.indexOf(COMBAT.wi):0; if(k<0) k=0; k=(k+dir+slots.length)%slots.length; const s=slots[k]; if(s<0) holster(); else selectWeapon(s); }
function cycleGun(){ weaponStep(1); }
function selectSlot(n){ const s=WORDER[n]; if(s===undefined) return; if(COMBAT.armed&&COMBAT.wi===s){ holster(); return; } selectWeapon(s); }
function reloadGun(){ const W=curW(); if(!COMBAT.armed||COMBAT.reload>0||COMBAT.mags[COMBAT.wi]===W.mag) return; COMBAT.reload=W.reload; COMBAT.ads=false; try{ sfx('reload'); }catch(e){} updateCombatHUD(); }
/* ---- weapon wheel HUD (GTA style strip that pops up on change) ---- */
const WICO={ // tiny side-view silhouettes, drawn on canvas once
  pistol:[[10,14,30,8],[12,22,8,14],[38,14,6,4]], smg:[[6,14,40,10],[18,24,7,12],[30,24,6,9],[44,16,10,4]], shotgun:[[2,15,60,6],[8,21,40,5],[2,15,14,12]], rifle:[[2,16,58,6],[2,16,16,10],[28,22,6,10],[56,17,8,3]], sniper:[[2,17,62,5],[22,10,20,6],[2,17,14,10],[30,22,6,9]], rpg:[[2,15,62,9],[18,24,6,9],[34,24,6,9],[24,8,12,6],[0,13,8,13]], fist:[[18,10,24,22]] };
function weaponIcon(k){ FX.icons=FX.icons||{}; if(FX.icons[k]) return FX.icons[k]; const c=cvs(64,40), g=c.getContext('2d'); g.fillStyle='#fff'; for(const r of (WICO[k]||[])) g.fillRect(r[0],r[1],r[2],r[3]); return FX.icons[k]=c.toDataURL(); }
function showWeaponWheel(){ let el=document.getElementById('wwheel'); if(!el){ el=document.createElement('div'); el.id='wwheel'; document.body.appendChild(el);
    const st=document.createElement('style'); st.textContent='#wwheel{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:6px;z-index:31;pointer-events:none;opacity:0;transition:opacity .25s}#wwheel.on{opacity:1}#wwheel .s{width:84px;padding:8px 6px 6px;border-radius:10px;background:rgba(10,12,10,.62);border:1px solid rgba(255,255,255,.12);text-align:center;color:rgba(255,255,255,.7);font:700 10.5px Manrope,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}#wwheel .s img{display:block;width:56px;height:35px;margin:0 auto 4px;opacity:.75}#wwheel .s.on{background:rgba(216,101,58,.85);border-color:transparent;color:#fff}#wwheel .s.on img{opacity:1}#wwheel .a{display:block;font-weight:600;opacity:.85;margin-top:2px;letter-spacing:0}body.touch #wwheel{bottom:auto;top:calc(70px + env(safe-area-inset-top,0px))}#wwheel .s{flex:none}@media (max-width:640px){#wwheel .s{width:52px;padding:6px 3px}#wwheel .s img{width:40px;height:25px}#wwheel{gap:3px}}';
    document.head.appendChild(st); }
  const slots=[-1].concat(owned()); el.replaceChildren(...slots.map(i=>{ const d=document.createElement('div'); const on=i<0?!COMBAT.armed:(COMBAT.armed&&COMBAT.wi===i); d.className='s'+(on?' on':''); const im=document.createElement('img'); im.src=weaponIcon(i<0?'fist':WEAPONS[i].ico); im.alt=''; const n=document.createElement('span'); n.textContent=i<0?'Ruke':WEAPONS[i].n; d.append(im,n); if(i>=0){ const a=document.createElement('span'); a.className='a'; a.textContent=COMBAT.mags[i]+'/'+WEAPONS[i].mag; d.append(a); } return d; }));
  el.classList.add('on'); clearTimeout(FX.wwT); FX.wwT=setTimeout(()=>el.classList.remove('on'),1500); }
let _wheelT=0; addEventListener('wheel',e=>{ if(!GAME.started||GAME.paused||UI.mapOpen||COMBAT.menuOpen||(typeof OW!=='undefined'&&OW.phone)) return; const n=performance.now(); if(n-_wheelT<110) return; _wheelT=n; weaponStep(e.deltaY>0?1:-1); },{passive:true});
/* ---- shooting ---- */
function allVehicles(){ const L=[]; for(const v of DRIVE) L.push({v,st:v.st,ref:v,kind:'drive'}); for(const T of GTA.traffic) L.push({v:T.v,st:T.st,ref:T,kind:'traffic'}); for(const C of GTA.chasers) L.push({v:C.v,st:C.st,ref:C,kind:C.kind}); for(const A of GTA.amb) L.push({v:A.v,st:A.st,ref:A,kind:'hitna'}); return L; }
function vehY(V){ return V.v&&V.v.group?V.v.group.position.y:getHeight(V.st.x,V.st.z); }
function damageVehicle(V,dmg,p){ const r=V.ref; if(r.wreck||r.burnT>0) return; if(r.hp===undefined) r.hp=100; r.hp-=dmg; if(V.kind==='drive') V.v.hp=Math.min(V.v.hp===undefined?100:V.v.hp,r.hp); if(r.hp<=0){ r.burnT=V.kind==='drive'&&V.v===PLAYER.driving?4:2.5; WRECKS.push({V,t:0,burning:true}); } }
function shootRay(o,d,maxR,W,wantVeh){ let best=null; for(const R of NET.remotes.values()){ if(!R.cur||R.dead||(R.d>=0)||(R.pa>=0)) continue; const gy=groundAt(R.cur.x,R.cur.z); const h=rayCyl(o,d,R.cur.x,R.cur.z,gy,gy+1.85,0.36); if(h&&h.t<maxR&&(!best||h.t<best.t)) best={t:h.t,R,head:h.y>gy+1.55}; }
  let end=maxR, wall=false; for(let t=1;t<(best?best.t:maxR);t+=0.6){ const x=o.x+d.x*t, y=o.y+d.y*t, z=o.z+d.z*t; if(y<getHeight(x,z)){ end=t; best=null; wall=true; break; } const hb=BHASH.hit(x,z,0); if(hb&&y<hb.y1&&y>hb.y0){ end=t; best=null; wall=true; break; } }
  let veh=null; if(wantVeh!==false) for(const V of allVehicles()){ if(V.v===PLAYER.driving) continue; const y0=vehY(V); const h=rayCyl(o,d,V.st.x,V.st.z,y0,y0+1.5,1.05); if(h&&h.t<end&&(!best||h.t<best.t)&&(!veh||h.t<veh.t)) veh={t:h.t,V}; }
  const pp=peopleRay(o,d,veh?veh.t:(best?best.t:end)); let person=null; if(pp){ person=pp; end=pp.t; best=null; veh=null; }
  if(veh){ end=veh.t; best=null; } else if(best) end=best.t;
  return {end,best,person,veh,wall}; }
function fireGun(){ const C=COMBAT, W=curW(); if(!C.armed||C.dead||C.cd>0||C.reload>0||PLAYER.driving||PLAYER.riding||C.drink||(typeof PKC!=='undefined'&&PKC.sit)) return; if(!W.auto&&C.hold&&C.fired) return; C.fired=true; if(C.mags[C.wi]<=0){ sfx('dry'); reloadGun(); return; }
  buildWeaponModels(); fxInit(); C.cd=W.cd; C.mags[C.wi]--; C.mag=C.mags[C.wi]; C.recoil=Math.min(W.rocket?0.2:0.14,C.recoil+(W.rocket?0.16:C.wi===2?0.1:W.pellets?0.12:C.wi===4?0.06:0.03)); const vm=WMODELS[C.wi]; const fl=vm&&vm.userData.flash; if(fl){ fl.visible=true; fl.material.rotation=Math.random()*TAU; C.flash=0.05; C.flashM=fl; }
  const cam=GAME.camera; const o=cam.getWorldPosition(new THREE.Vector3()); const d0=new THREE.Vector3(0,0,-1).applyQuaternion(cam.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const tps=typeof tpsActive==='function'&&tpsActive(); if(tps) o.addScaledVector(d0,TPS.cur+0.2);
  const muzzle=(tps&&TPS.hasMuzzle)?TPS.muzzle.clone():(fl?fl.getWorldPosition(new THREE.Vector3()):o.clone());
  fxFlash(muzzle,W.rocket?6:2.2,0.06,12); sfx(W.snd);
  const spread=()=>{ const d=d0.clone(); const sp=(C.ads?W.ads:W.spread)+(C.bac>0.3?C.bac*0.02:0); if(sp>0){ d.x+=(Math.random()-0.5)*sp*2; d.y+=(Math.random()-0.5)*sp*2; d.z+=(Math.random()-0.5)*sp*2; d.normalize(); } return d; };
  if(W.rocket){ const d=spread(); gtaShot(); spawnRocket(muzzle,d,true); if(vm&&vm.userData.war) vm.userData.war.visible=false; C.shot={n:++C.shotN,w:3,a:[+muzzle.x.toFixed(2),+muzzle.y.toFixed(2),+muzzle.z.toFixed(2)],d:[+d.x.toFixed(3),+d.y.toFixed(3),+d.z.toFixed(3)]}; if(C.mags[C.wi]<=0) setTimeout(()=>reloadGun(),350); updateCombatHUD(); return; }
  const maxR=C.wi===2?400:(W.range||150); const n=W.pellets||1; let lastE=null;
  for(let k=0;k<n;k++){ const d=spread(); const R=shootRay(o,d,maxR,W); const fall=W.range?clamp(1.15-R.end/W.range,0.25,1):1;
    if(R.person){ hurtPerson(R.person.P,Math.round((R.person.head?W.head:W.dmg)*fall),true); if(k===0||n===1) showHitMarker(R.person.head); bloodPuff(o.clone().addScaledVector(d,R.end)); }
    else if(R.best){ const dmg=Math.round((R.best.head?W.head:W.dmg)*fall); C.hits[R.best.R.id]=(C.hits[R.best.R.id]||0)+dmg; showHitMarker(R.best.head); }
    else if(R.veh){ damageVehicle(R.veh.V,W.dmg*0.45*fall,o.clone().addScaledVector(d,R.end)); sparks(o.clone().addScaledVector(d,R.end)); if(Math.random()<0.3) sfx('ricochet',0.5); }
    else if(R.wall&&R.end<120){ dustHit(o.clone().addScaledVector(d,R.end)); }
    const e=o.clone().addScaledVector(d,R.end); lastE=e; if(k<4) addTracer(muzzle,e); }
  gtaShot(); OW.panic=Math.max(OW.panic,8); C.shot={n:++C.shotN,w:C.wi,a:[+muzzle.x.toFixed(2),+muzzle.y.toFixed(2),+muzzle.z.toFixed(2)],b:[+lastE.x.toFixed(2),+lastE.y.toFixed(2),+lastE.z.toFixed(2)]};
  if(C.mags[C.wi]<=0) setTimeout(()=>reloadGun(),200); updateCombatHUD(); }
/* ---- small impact effects ---- */
function smokeSprite(){ let P=PUFFS.find(q=>!q.m.visible); if(!P){ if(PUFFS.length>260) return null; const m=new THREE.Sprite(new THREE.SpriteMaterial({map:FX.smoke,transparent:true,depthWrite:false,opacity:0.6})); m.renderOrder=3; GAME.scene.add(m); P={m}; PUFFS.push(P); } return P; }
function puff(p,s,col,o){ fxInit(); const P=smokeSprite(); if(!P) return; o=o||{}; const m=P.m; m.visible=true; m.position.copy(p); P.t=0; P.s=s; P.life=o.life||1.4; P.rise=o.rise===undefined?0.8:o.rise; P.op=o.op||0.6; P.grow=o.grow||1.6; P.add=!!o.fire; P.vx=o.vx||0; P.vz=o.vz||0; P.vy=o.vy||0;
  m.material.map=o.fire?FX.fire:FX.smoke; m.material.blending=o.fire?THREE.AdditiveBlending:THREE.NormalBlending; m.material.color.setHex(col||0xb9b6ae); m.material.rotation=Math.random()*TAU; P.spin=(Math.random()-0.5)*0.8; m.scale.setScalar(s*0.35); m.material.opacity=P.op; }
function bloodPuff(p){ for(let i=0;i<4;i++) puff(p.clone().add(new THREE.Vector3((Math.random()-0.5)*0.3,(Math.random()-0.5)*0.3,(Math.random()-0.5)*0.3)),0.35,0x7a0d0d,{life:0.5,rise:-0.4,op:0.85,grow:1.2}); }
function dustHit(p){ puff(p,0.5,0xa89c88,{life:0.7,rise:0.3,op:0.55,grow:1.4}); }
function sparks(p){ puff(p,0.35,0xffc060,{life:0.15,rise:0,op:1,grow:1,fire:true}); }
/* ---- rockets ---- */
const ROCKET_M=new THREE.MeshStandardMaterial({color:0x56603a,roughness:0.55,metalness:0.2}), ROCKET_D=new THREE.MeshStandardMaterial({color:0x222426,roughness:0.4,metalness:0.7});
function rocketMesh(){ const g=new THREE.Group(); const body=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.42,10),ROCKET_D); body.rotation.x=Math.PI/2; body.position.z=0.12; g.add(body);
  const prof=[[0,0],[0.03,0.02],[0.055,0.08],[0.06,0.15],[0.04,0.2],[0,0.2]].map(p=>new THREE.Vector2(p[0],p[1])); const head=new THREE.Mesh(new THREE.LatheGeometry(prof,12),ROCKET_M); head.rotation.x=-Math.PI/2; head.position.z=-0.09; g.add(head);
  for(let k=0;k<4;k++){ const f=new THREE.Mesh(new THREE.BoxGeometry(0.004,0.09,0.1),ROCKET_D); const a=k*Math.PI/2; f.position.set(Math.cos(a)*0.06,Math.sin(a)*0.06,0.3); f.rotation.z=a+Math.PI/2; g.add(f); }
  const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:FX.fire,color:0xffd090,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); fl.scale.setScalar(0.9); fl.position.z=0.42; g.add(fl); g.userData.flame=fl;
  const cone=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.5,10,1,true),new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending})); cone.rotation.x=-Math.PI/2; cone.position.z=0.6; g.add(cone); g.userData.cone=cone;
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; }
function spawnRocket(p,d,local){ fxInit(); const m=rocketMesh(); m.position.copy(p); m.lookAt(p.clone().sub(d)); GAME.scene.add(m); ROCKETS.push({m,p:p.clone(),d:d.clone(),v:32,t:0,local,pt:0}); sfxAt('rpg',p,120);
  for(let i=0;i<6;i++) puff(p.clone().addScaledVector(d,-0.6-Math.random()*0.8),0.9,0xd6d2ca,{life:1.8,rise:0.3,op:0.55,grow:2.4,vx:-d.x*2+(Math.random()-0.5),vz:-d.z*2+(Math.random()-0.5)}); }
/* ---- explosions ---- */
function explode(p,local,scale){ fxInit(); const S=scale||1; try{ sfxAt('boom',p,400); OW.panic=12; }catch(e){}
  fxFlash(p.clone().add(new THREE.Vector3(0,1.2,0)),60*S,0.55,55*S);
  for(let k=0;k<10;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:FX.fire,color:k<3?0xfff4d0:0xffa040,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); const o=new THREE.Vector3((Math.random()-0.5)*2.6,Math.random()*1.8,(Math.random()-0.5)*2.6).multiplyScalar(S); sp.position.copy(p).add(o); sp.material.rotation=Math.random()*TAU; GAME.scene.add(sp); BOOMS.push({m:sp,t:-k*0.025,life:0.55+Math.random()*0.35,s:(2.5+Math.random()*2.5)*S,vy:1.5+Math.random()*2}); }
  { const ring=new THREE.Mesh(new THREE.RingGeometry(0.8,1.0,40),FX.ring.clone()); ring.rotation.x=-Math.PI/2; ring.position.set(p.x,Math.max(p.y-0.6,getHeight(p.x,p.z)+0.15),p.z); GAME.scene.add(ring); BOOMS.push({m:ring,t:0,life:0.45,ring:true,s:14*S}); }
  for(let k=0;k<14;k++) puff(p.clone().add(new THREE.Vector3((Math.random()-0.5)*3,Math.random()*2,(Math.random()-0.5)*3).multiplyScalar(S)),(2.2+Math.random()*1.5)*S,k<8?0x2e2b28:0x6f6a64,{life:3+Math.random()*2.5,rise:1.6+Math.random(),op:0.7,grow:2.2,vx:(Math.random()-0.5)*2,vz:(Math.random()-0.5)*2});
  for(let k=0;k<Math.round(16*S);k++){ const m=new THREE.Mesh(FX.debG,FX.debM); m.position.copy(p).add(new THREE.Vector3(0,0.4,0)); const a=Math.random()*TAU, sp=4+Math.random()*9; m.scale.setScalar(0.4+Math.random()*1.2); m.castShadow=true; GAME.scene.add(m); DEBRIS.push({m,v:new THREE.Vector3(Math.cos(a)*sp,5+Math.random()*9,Math.sin(a)*sp),w:new THREE.Vector3(Math.random()*12,Math.random()*12,Math.random()*12),t:0}); }
  { const gy=getHeight(p.x,p.z); if(p.y-gy<2.5&&!INSIDE){ const s=new THREE.Mesh(new THREE.CircleGeometry(2.6*S,24),new THREE.MeshBasicMaterial({map:FX.scorch,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4})); s.rotation.x=-Math.PI/2; s.position.set(p.x,gy+0.09,p.z); GAME.scene.add(s); SCORCH.push({m:s,t:0}); if(SCORCH.length>14){ const o=SCORCH.shift(); GAME.scene.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); } } }
  const dc=GAME.camera.position.distanceTo(p); if(dc<45) COMBAT.shake=Math.max(COMBAT.shake,(1-dc/45)*0.9*S);
  // the player is hurt too
  if(!COMBAT.dead){ const dp=Math.hypot(PLAYER.pos.x-p.x,PLAYER.pos.z-p.z,(PLAYER.pos.y+0.9)-p.y); const R=7*S; if(dp<R){ takeDamage(Math.round(95*(1-dp/R)+5),'eksplozija'); if(!PLAYER.driving){ const k=(1-dp/R)*9; PLAYER.vel.x+=(PLAYER.pos.x-p.x)/(dp+0.1)*k; PLAYER.vel.z+=(PLAYER.pos.z-p.z)/(dp+0.1)*k; PLAYER.vel.y+=k*0.6; PLAYER.ground=false; } } }
  for(const V of allVehicles()){ const dv=Math.hypot(V.st.x-p.x,V.st.z-p.z); const R=7.5*S; if(dv<R){ damageVehicle(V,140*(1-dv/R)+20,p); if(V.st.v!==undefined) V.st.v*=0.3; } }
  if(typeof lawSplash==='function') lawSplash(p,7*S);
  if(local){ peopleSplash(p,6.5*S); for(const R of NET.remotes.values()){ if(!R.cur||R.dead) continue; const dd=Math.hypot(R.cur.x-p.x,R.cur.z-p.z,(groundAt(R.cur.x,R.cur.z)+0.9)-p.y); if(dd<6.5*S){ const dmg=Math.round(110*(1-dd/6.5)+15); COMBAT.hits[R.id]=(COMBAT.hits[R.id]||0)+dmg; showHitMarker(dmg>80); } } } }
/* burning cars: smoke + fire for a few seconds, then a big bang, then a black smoking wreck */
function wreckTick(dt){ for(let i=WRECKS.length-1;i>=0;i--){ const W=WRECKS[i], V=W.V, r=V.ref; W.t+=dt; const gy=vehY(V); const p=new THREE.Vector3(V.st.x,gy+1.0,V.st.z);
    W.pt=(W.pt||0)-dt; if(W.pt<=0){ W.pt=W.burning?0.06:0.25; if(W.burning||W.t<20) puff(p.clone().add(new THREE.Vector3((Math.random()-0.5)*1.6,0.3,(Math.random()-0.5)*1.6)),1.4,W.burning?0x3a3632:0x4a4642,{life:2.6,rise:1.8,op:0.65,grow:2.2}); if(W.burning||W.t<12) puff(p.clone().add(new THREE.Vector3((Math.random()-0.5)*1.4,0,(Math.random()-0.5)*1.4)),0.9,0xffb060,{life:0.45,rise:1.6,op:0.95,grow:1.3,fire:true}); }
    if(W.burning){ r.burnT-=dt; if(V.st.v!==undefined) V.st.v*=Math.exp(-dt*3); if(r.burnT<=0){ W.burning=false; r.wreck=true; W.t=0; explode(p.clone(),V.kind==='drive'&&V.v===PLAYER.driving,1.25); burnPaint(V.v); if(V.kind==='drive'){ V.v.dead=true; V.v.hp=0; if(PLAYER.driving===V.v){ exitCar(); takeDamage(60,'eksplozija'); } } if(V.st.v!==undefined) V.st.v=0; if(typeof lawCarWrecked==='function') lawCarWrecked(V); } }
    else if(W.t>60&&V.kind!=='drive'){ WRECKS.splice(i,1); if(V.kind==='traffic'){ /* respawn the traffic car fresh */ r.wreck=false; r.burnT=0; r.hp=100; r.u=Math.random()*(r.path.length-2); unburnPaint(V.v); } else { r.gone=true; } }
    else if(W.t>90){ WRECKS.splice(i,1); } } }
function burnPaint(v){ if(!v) return; v._burnt=v._burnt||[]; if(v.paint){ if(!v._paint0) v._paint0={c:v.paint.color.clone(),r:v.paint.roughness,m:v.paint.metalness}; v.paint.color.setHex(0x161412); v.paint.roughness=0.95; v.paint.metalness=0.1; } v.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material!==v.paint&&o.material.color&&!o.material.userData.burnt){ v._burnt.push([o,o.material]); o.material=o.material.clone(); o.material.userData.burnt=true; o.material.color.multiplyScalar(0.25); if(o.material.emissive) o.material.emissive.setHex(0); } }); }
function unburnPaint(v){ if(!v) return; if(v.paint&&v._paint0){ v.paint.color.copy(v._paint0.c); v.paint.roughness=v._paint0.r; v.paint.metalness=v._paint0.m; } for(const [o,m] of (v._burnt||[])){ o.material.dispose(); o.material=m; } v._burnt=[]; }
/* ---- per frame ---- */
function weaponTick(dt){ const C=COMBAT; buildWeaponModels(); if(!WMODELS) return; fxInit(); const W=curW();
  if(C.flashM&&C.flash<=0) C.flashM.visible=false;
  const inCar=PLAYER.driving||PLAYER.riding; const show=C.armed&&!C.dead&&!inCar&&!C.drink&&!(typeof PKC!=='undefined'&&PKC.sit); const scoped=show&&C.ads&&C.wi===2&&C.fovK>0.8;
  WMODELS.forEach((g,i)=>{ g.visible=show&&i===C.wi&&!scoped; });
  const vm=WMODELS[C.wi]; if(vm&&show){ const hp=WMODELS.hip[C.wi], ap=WMODELS.aim[C.wi]; const k=C.fovK; vm.position.set(hp[0]+(ap[0]-hp[0])*k,hp[1]+(ap[1]-hp[1])*k,hp[2]+(ap[2]-hp[2])*k+C.recoil*(C.wi===3?0.6:1.4)); vm.rotation.x=C.recoil*(C.wi===3?0.8:2.2)+(C.reload>0?-0.6*Math.sin(Math.min(1,(W.reload-C.reload)/W.reload)*Math.PI):0); if(C.wi===3&&vm.userData.war) vm.userData.war.visible=C.mags[3]>0; }
  if(TPS&&TPS.guns&&TPS.guns.bazooka&&TPS.guns.bazooka.children[0]) { const war=TPS.guns.bazooka.children[0].userData.war; if(war) war.visible=C.mags[3]>0; }
  const want=(show&&C.ads)?1:0; C.fovK+=(want-C.fovK)*Math.min(1,dt*12); const cam=GAME.camera;
  if(!inCar&&!(typeof PKC!=='undefined'&&PKC.sit)&&!PLAYER.heli){ const base=(typeof tpsActive==='function'&&tpsActive())?66:72; const f=base+(W.fov-base)*C.fovK; if(Math.abs(cam.fov-f)>0.05){ cam.fov=f; cam.updateProjectionMatrix(); } }
  const sc=document.getElementById('scope'); if(sc) sc.classList.toggle('on',scoped); if(!show&&C.ads) C.ads=false; const ab=document.getElementById('aimbtn'); if(ab&&ab.classList.contains('on')!==!!C.ads) ab.classList.toggle('on',!!C.ads); document.body.classList.toggle('scoped',!!scoped);
  if(C.shake>0){ C.shake=Math.max(0,C.shake-dt*1.5); cam.rotation.x+=(Math.random()-0.5)*C.shake*0.05; cam.rotation.y+=(Math.random()-0.5)*C.shake*0.05; }
  if(FX.lightT>0){ FX.lightT-=dt; FX.light.intensity=Math.max(0,FX.lightI*(FX.lightT/FX.lightD)); if(FX.lightT<=0) FX.light.intensity=0; }
  for(let i=ROCKETS.length-1;i>=0;i--){ const R=ROCKETS[i]; R.t+=dt; R.v=Math.min(78,R.v+dt*95); R.d.y-=dt*0.025; R.d.normalize(); const step=R.v*dt; let hit=false; const np=R.p.clone().addScaledVector(R.d,step);
    if(np.y<getHeight(np.x,np.z)+0.05&&!INSIDE) hit=true; const hb=BHASH.hit(np.x,np.z,0); if(hb&&np.y<hb.y1&&np.y>hb.y0) hit=true;
    if(!hit) for(const V of allVehicles()){ const y0=vehY(V); if(Math.hypot(np.x-V.st.x,np.z-V.st.z)<1.3&&np.y>y0-0.2&&np.y<y0+1.8&&V.v!==PLAYER.driving){ hit=true; break; } }
    if(!hit){ for(const P of allPeople()){ const A=P.A; if(A.dead) continue; const q=A.group.position; if(Math.hypot(np.x-q.x,np.z-q.z)<0.5&&np.y>q.y&&np.y<q.y+1.9){ hit=true; break; } } }
    if(!hit&&typeof lawRocketHit==='function'&&lawRocketHit(np)) hit=true;
    if(R.local&&!hit) for(const Q of NET.remotes.values()){ if(!Q.cur||Q.dead) continue; const gy=groundAt(Q.cur.x,Q.cur.z); if(Math.hypot(np.x-Q.cur.x,np.z-Q.cur.z)<0.5&&np.y>gy&&np.y<gy+1.9){ hit=true; break; } }
    if(R.t>6) hit=true; R.p.copy(np); R.m.position.copy(np); R.m.rotateZ(dt*14); const fl=R.m.userData.flame; if(fl) fl.scale.setScalar(0.7+Math.random()*0.5); if(R.m.userData.cone) R.m.userData.cone.scale.set(1,0.7+Math.random()*0.6,1);
    fxFlash(np,4,0.05,10);
    R.pt+=dt; while(R.pt>0.016){ R.pt-=0.016; puff(np.clone().addScaledVector(R.d,-0.5-Math.random()*0.3).add(new THREE.Vector3((Math.random()-0.5)*0.12,(Math.random()-0.5)*0.12,(Math.random()-0.5)*0.12)),0.55,0xdedad2,{life:2.4+Math.random(),rise:0.25,op:0.5,grow:2.6}); }
    if(hit){ explode(np,R.local); GAME.scene.remove(R.m); R.m.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); ROCKETS.splice(i,1); } }
  for(let i=BOOMS.length-1;i>=0;i--){ const B=BOOMS[i]; B.t+=dt; if(B.t<0){ B.m.visible=false; continue; } B.m.visible=true; const u=B.t/B.life;
    if(B.ring){ B.m.scale.setScalar(1+u*B.s); B.m.material.opacity=0.55*(1-u); } else { B.m.scale.setScalar(B.s*(0.35+Math.pow(u,0.5)*0.9)); B.m.position.y+=B.vy*dt; B.m.material.opacity=Math.max(0,1-u*u); B.m.material.color.lerp(new THREE.Color(0xff5010),dt*2.5); }
    if(u>=1){ GAME.scene.remove(B.m); if(B.m.geometry) B.m.geometry.dispose(); B.m.material.dispose(); BOOMS.splice(i,1); } }
  for(const P of PUFFS){ if(!P.m.visible) continue; P.t+=dt; const u=P.t/P.life; P.m.position.x+=P.vx*dt; P.m.position.z+=P.vz*dt; P.m.position.y+=(P.rise+P.vy)*dt; P.vx*=Math.exp(-dt*1.5); P.vz*=Math.exp(-dt*1.5); P.m.material.rotation+=P.spin*dt; P.m.scale.setScalar(P.s*(0.35+u*P.grow*0.6)); P.m.material.opacity=Math.max(0,P.op*(u<0.1?u/0.1:1-(u-0.1)/0.9)); if(u>=1) P.m.visible=false; }
  for(let i=DEBRIS.length-1;i>=0;i--){ const D=DEBRIS[i]; D.t+=dt; D.v.y-=20*dt; D.m.position.addScaledVector(D.v,dt); D.m.rotation.x+=D.w.x*dt; D.m.rotation.y+=D.w.y*dt; const gy=getHeight(D.m.position.x,D.m.position.z)+0.05; if(D.m.position.y<gy){ D.m.position.y=gy; D.v.y=Math.abs(D.v.y)*0.3; D.v.x*=0.5; D.v.z*=0.5; D.w.multiplyScalar(0.5); } if(D.t>5){ GAME.scene.remove(D.m); DEBRIS.splice(i,1); } }
  for(const S of SCORCH){ S.t+=dt; if(S.t>60) S.m.material.opacity=Math.max(0,1-(S.t-60)/20); }
  wreckTick(dt); }
function updateCombatHUD(){ const C=COMBAT, W=curW(); const hb=document.getElementById('hpfill'); if(hb){ hb.style.width=C.hp+'%'; hb.style.background=C.hp>50?'#5fc46a':C.hp>25?'#f0b43a':'#e5483b'; } const am=document.getElementById('ammo'); if(am) am.textContent=C.armed?(W.n+'  '+(C.reload>0?'punim…':(C.mags[C.wi]+' / '+W.mag))):''; const ba=document.getElementById('bac'); if(ba){ ba.style.display=C.bac>0.02?'block':'none'; ba.textContent='🍺 '+C.bac.toFixed(2)+' ‰'; } const tg=document.getElementById('tgun'); if(tg) tg.textContent=C.armed?W.n:'Oružje'; }
/* remote rockets: presence carries the launch point and direction */
function remoteShot(R,sh){ if(sh.w===3&&Array.isArray(sh.a)&&Array.isArray(sh.d)){ const p=new THREE.Vector3(+sh.a[0],+sh.a[1],+sh.a[2]), d=new THREE.Vector3(+sh.d[0],+sh.d[1],+sh.d[2]); if(d.lengthSq()>0.5) spawnRocket(p,d.normalize(),false); return true; } if(Array.isArray(sh.a)){ const W=WEAPONS[sh.w|0]; if(W&&W.snd) sfxAt(W.snd,new THREE.Vector3(+sh.a[0],+sh.a[1],+sh.a[2]),200); } return false; }
