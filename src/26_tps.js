/* ===================== third-person camera (GTA style) + the player's own body =====================
   On foot the camera sits behind the right shoulder; the player's avatar (realistic Rocketbox model or the
   procedural fallback) is visible and holds the selected gun in its hands. V switches to first person and back.
   The sniper scope and the walkable interiors still work: aiming the sniper drops into first person. */
const TPS={on:true,cur:3.6,face:0,aimK:0,armK:0,dt:0.016,muzzle:new THREE.Vector3(),hasMuzzle:false,guns:{},gunKey:null};
try{ if(localStorage.getItem('tuhelj_tps')==='0') TPS.on=false; }catch(e){}
function tpsScoped(){ return COMBAT.armed&&COMBAT.ads&&COMBAT.wi===2&&COMBAT.fovK>0.8; }
function tpsActive(){ return TPS.on&&GAME.started&&!PLAYER.fly&&!PLAYER.driving&&!PLAYER.riding&&!PLAYER.heli&&!(typeof PKC!=='undefined'&&PKC.sit)&&!tpsScoped(); }
function tpsToggle(){ TPS.on=!TPS.on; try{ localStorage.setItem('tuhelj_tps',TPS.on?'1':'0'); }catch(e){} UI.toast(TPS.on?'Kamera iz trećeg lica (V)':'Kamera iz prvog lica (V)'); }
addEventListener('keydown',e=>{ if(e.target&&e.target.tagName==='INPUT') return; if(e.code==='KeyC'&&GAME.started&&!GAME.paused&&!PLAYER.fly&&!PLAYER.driving&&!PLAYER.riding&&!PLAYER.heli&&!COMBAT.dead){ PLAYER.crouch=!PLAYER.crouch; } if(e.code==='Space'&&PLAYER.crouch) PLAYER.crouch=false; if(e.code==='KeyV'&&GAME.started&&!GAME.paused&&!PLAYER.driving&&!PLAYER.riding&&!PLAYER.heli) tpsToggle(); });

const _tv=new THREE.Vector3(), _tw=new THREE.Vector3(), _tq=new THREE.Quaternion(), _tq2=new THREE.Quaternion(), _tq3=new THREE.Quaternion();
function tpsForward(out){ const P=PLAYER, cp=Math.cos(P.pitch); return out.set(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp); }
// is the straight line a→b blocked by terrain or a building/wall collider?  returns the free fraction 0..1
function tpsFree(a,b){ const L=a.distanceTo(b); const n=Math.max(2,Math.ceil(L/0.18)); for(let i=1;i<=n;i++){ const t=i/n; const x=a.x+(b.x-a.x)*t, y=a.y+(b.y-a.y)*t, z=a.z+(b.z-a.z)*t; if(t*L<0.4) continue; // standing next to a wall must not collapse the camera
    if(!INSIDE&&y<getHeight(x,z)+0.25) return Math.max(0,(i-1)/n);
    for(const o of BHASH.near(x,z)){ if(y>o.y1+0.1||y<o.y0-0.1) continue; if(!INSIDE&&o.y1-getHeight(o.cx,o.cz)<1.4) continue; /* look over fences and low walls */ const dx=x-o.cx, dz=z-o.cz; const lx=dx*o.c+dz*o.s, lz=-dx*o.s+dz*o.c; if(Math.abs(lx)<o.hl+0.32&&Math.abs(lz)<o.hw+0.32) return Math.max(0,(i-1)/n); } }
  return 1; }
const _fpApplyCamera=applyCamera;
applyCamera=function(cam){ if(!tpsActive()){ _fpApplyCamera(cam); return; }
  const P=PLAYER, C=COMBAT; const k=TPS.aimK, a=TPS.armK, dead=C.dead;
  if(typeof HOME!=='undefined'&&HOME.showcase){ // wardrobe: look at the character from the front
    const f=TPS.face, fx=-Math.sin(f), fz=-Math.cos(f); const t=GAME.time*0.25; const ox=fx*Math.cos(Math.sin(t)*0.5)-fz*Math.sin(Math.sin(t)*0.5), oz=fz*Math.cos(Math.sin(t)*0.5)+fx*Math.sin(Math.sin(t)*0.5);
    const piv=new THREE.Vector3(P.pos.x,P.pos.y+1.05,P.pos.z); const want=new THREE.Vector3(P.pos.x+ox*2.1-fz*0.5,P.pos.y+1.35,P.pos.z+oz*2.1+fx*0.5); const fr=tpsFree(piv,want); cam.position.lerpVectors(piv,want,Math.max(0.45,fr*0.95)); cam.lookAt(P.pos.x-fz*0.35,P.pos.y+1.0,P.pos.z+fx*0.35); return; }
  const pitch=clamp(P.pitch,-1.15,0.95);
  const indoor=!!INSIDE||floorAt(P.pos.x,P.pos.z)>getHeight(P.pos.x,P.pos.z)+0.4; TPS.indoor=indoor;
  let dist=lerp(lerp(2.55,2.05,a),1.2,k), side=lerp(lerp(0.36,0.52,a),0.6,k), up=lerp(0.16,0.1,k);
  if(indoor){ dist=Math.min(dist,lerp(2.2,1.25,k)); side=Math.min(side,0.45); }
  if(dead){ dist=4.2; side=0; up=0.9; }
  const piv=_tv.set(P.pos.x,(TPS.ys!==undefined&&P.ground?TPS.ys:P.pos.y)+(dead?0.4:1.6-0.55*TPS.ck),P.pos.z);
  const fw=tpsForward(_tw).clone(), rt=new THREE.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw));
  const sidePt=piv.clone().addScaledVector(rt,side).add(new THREE.Vector3(0,up,0)); const sideOk=tpsFree(piv,sidePt); sidePt.lerpVectors(piv,sidePt,sideOk);
  const want=sidePt.clone().addScaledVector(fw,-dist); const f=tpsFree(sidePt,want); const d=Math.max(0.35,dist*f-0.15);
  TPS.cur=d<TPS.cur?d:TPS.cur+(d-TPS.cur)*Math.min(1,TPS.dt*4);
  cam.position.copy(sidePt).addScaledVector(fw,-TPS.cur);
  if(INSIDE){ cam.position.y=Math.min(cam.position.y,P.pos.y+2.55); const B=INT_BOX.find(b=>Math.abs(P.pos.x-b.x)<b.W+0.5&&Math.abs(P.pos.z-b.z)<b.D+0.5&&Math.abs(P.pos.y-b.y)<3);
    if(B){ cam.position.x=clamp(cam.position.x,B.x-B.W+0.25,B.x+B.W-0.25); cam.position.z=clamp(cam.position.z,B.z-B.D+0.25,B.z+B.D-0.25); cam.position.y=Math.min(cam.position.y,B.y+B.H-0.2); } }
  const sw=drunkSway(); cam.rotation.set(pitch+C.recoil*0.45,P.yaw+sw[1],sw[0],'YXZ'); };

/* ---- the player's avatar ---- */
function meAvatar(){ if(!ME_AV){ ME_AV=makeAvatar(NET.name||'Ti',NET.color||'#e8412c'); GAME.scene.add(ME_AV.group); } return ME_AV; }
function angLerp(a,b,t){ let d=b-a; while(d>Math.PI) d-=TAU; while(d<-Math.PI) d+=TAU; return a+d*t; }
function tpsTick(dt){ TPS.dt=dt; const C=COMBAT, act=tpsActive(); TPS.ck=(TPS.ck||0)+(((PLAYER.crouch&&!C.dead&&act)?1:0)-(TPS.ck||0))*Math.min(1,dt*8);
  const armed=C.armed&&!C.dead&&!C.drink; TPS.armK+=((armed?1:0)-TPS.armK)*Math.min(1,dt*6); TPS.aimK+=((armed&&C.ads?1:0)-TPS.aimK)*Math.min(1,dt*10);
  if(act&&typeof WMODELS!=='undefined'&&WMODELS) for(const g of WMODELS) g.visible=false;
  if(act&&typeof GLASS!=='undefined'&&GLASS) GLASS.visible=false;
  if(!act){ TPS.hasMuzzle=false; for(const k in TPS.guns) TPS.guns[k].visible=false; if(!PLAYER.driving&&!PLAYER.riding&&ME_AV&&!PLAYER.heli) ME_AV.group.visible=false; return; }
  const A=meAvatar(), P=PLAYER; A.group.visible=TPS.cur>0.7||C.dead; for(const bp of A.body) bp.visible=true; if(A.sprite) A.sprite.visible=false;
  const hs=Math.hypot(P.vel.x,P.vel.z); if(C.dead){ P.yaw+=dt*0.22; P.pitch+=(-0.5-P.pitch)*Math.min(1,dt*1.5); }
  let want=TPS.face; if(armed||C.ads) want=P.yaw; else if(hs>0.6) want=faceYaw(P.vel.x,P.vel.z);
  TPS.face=angLerp(TPS.face,want,Math.min(1,dt*(armed?16:10)));
  // steps and kerbs: ease the body up instead of popping (falling stays instant)
  if(TPS.ys===undefined||Math.abs(P.pos.y-TPS.ys)>1.2||!P.ground) TPS.ys=P.pos.y; else TPS.ys+=(P.pos.y-TPS.ys)*Math.min(1,dt*(P.pos.y>TPS.ys?11:20));
  A.group.position.set(P.pos.x,TPS.ys,P.pos.z); A.group.rotation.set(C.dead?-Math.PI/2*0.98:0,TPS.face,0);
  if(C.dead) A.group.position.y+=0.2; A.dead=C.dead;
  A.forceClip=C.drink?'drink':null; A.spdOv=P.ground?hs:Math.min(hs,2);
  // procedural fallback body: swing legs/arms from speed
  if(!A.real){ P._ph=(P._ph||0)+dt*hs*1.9; const s=Math.min(1,hs/4)*0.7; A.legL.rotation.x=Math.sin(P._ph)*s; A.legR.rotation.x=-Math.sin(P._ph)*s; A.armL.rotation.x=-Math.sin(P._ph)*s*0.7; A.armR.rotation.x=armed?-1.45:Math.sin(P._ph)*s*0.7; } }

/* ---- guns in the hands (world-space each frame, after the mocap pose) ---- */
const GUN_HOLD=[ // per weapon: model key, grip offset along the barrel (m, + = forward of the hand), up offset, two-handed?
  {k:'Rifle',f:0.20,u:0.035,two:true}, {k:'P90',f:0.07,u:0.03,two:true}, {k:'SniperRifle',f:0.24,u:0.04,two:true}, {k:'bazooka',f:0.0,u:0.0,two:true,shoulder:true},
  {k:'Pistol',f:0.035,u:0.045,two:true,pistol:true}, {k:'Shotgun',f:0.22,u:0.035,two:true}];
function makeHeldGun(i){ const H=GUN_HOLD[i]; if(!H) return null; const W=MODELS.gltf.weapons; let inner=null, len=0.6;
  if(H.k==='bazooka'){ inner=bazookaModel(); len=1.1; }
  else if(W&&W[H.k]){ inner=W[H.k].scene.clone(true); const b=new THREE.Box3().setFromObject(inner); if(H.k==='Pistol'){ inner.rotation.y=-Math.PI/2; len=b.max.x-b.min.x; } else len=b.max.z-b.min.z; }
  else { inner=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.09,H.pistol?0.2:0.8),new THREE.MeshStandardMaterial({color:0x222426,metalness:0.8,roughness:0.35})); len=H.pistol?0.2:0.8; }
  const g=new THREE.Group(); g.add(inner); inner.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; if(o.material&&!o.material.userData.gunfix){ o.material=gunMaterial(o.material); } } }); g.userData.len=len; g.userData.glb=!!(W&&W[H.k])||H.k==='bazooka'; g.visible=false; GAME.scene.add(g); return g; }
function tpsGun(i){ const H=GUN_HOLD[i]; if(!H) return null; const have=TPS.guns[H.k]; if(have&&(have.userData.glb||!MODELS.gltf.weapons)) return have; if(have){ GAME.scene.remove(have); } return TPS.guns[H.k]=makeHeldGun(i); }
// Quaternius palette materials are flat; give metal parts a gunmetal sheen and wood a satin finish
function gunMaterial(m){ const n=m.clone(); n.userData.gunfix=true; const c=n.color||new THREE.Color(0x333333); const hsl={}; c.getHSL(hsl);
  if(hsl.l<0.25){ n.metalness=0.85; n.roughness=0.32; n.color=c.clone().multiplyScalar(0.8); } else if(hsl.h<0.12&&hsl.s>0.3){ n.metalness=0.0; n.roughness=0.55; } else { n.metalness=0.5; n.roughness=0.45; }
  n.envMapIntensity=1.1; return n; }
const _ikS=new THREE.Vector3(), _ikE=new THREE.Vector3(), _ikH=new THREE.Vector3(), _ikT=new THREE.Vector3(), _ikP=new THREE.Vector3(), _ikD=new THREE.Vector3();
function aimBoneTo(bone,child,target){ bone.updateWorldMatrix(true,false); const bp=bone.getWorldPosition(_ikS).clone(); const cp=child.getWorldPosition(_ikH).clone();
  const cur=cp.sub(bp).normalize(), want=_ikD.copy(target).sub(bp).normalize(); if(cur.lengthSq()<1e-6||want.lengthSq()<1e-6) return;
  _tq.setFromUnitVectors(cur,want); bone.getWorldQuaternion(_tq2); _tq2.premultiply(_tq); bone.parent.getWorldQuaternion(_tq3); bone.quaternion.copy(_tq3.invert().multiply(_tq2)); bone.updateWorldMatrix(false,true); }
// two-bone IK: shoulder→elbow→hand reaches `target`, elbow bends toward `pole`
function armIK(up,fore,hand,target,pole){ if(!up||!fore||!hand) return; up.updateWorldMatrix(true,true); const S=up.getWorldPosition(new THREE.Vector3()), E=fore.getWorldPosition(new THREE.Vector3()), H=hand.getWorldPosition(new THREE.Vector3());
  const a=S.distanceTo(E), b=E.distanceTo(H); const T=target.clone(); const st=T.clone().sub(S); let d=st.length(); const maxd=(a+b)*0.995; if(d>maxd){ st.setLength(maxd); d=maxd; T.copy(S).add(st); } d=Math.max(d,Math.abs(a-b)+0.01);
  const dir=st.clone().normalize(); const ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1); const sa=Math.sqrt(1-ca*ca);
  const pv=pole.clone().sub(S); pv.addScaledVector(dir,-pv.dot(dir)); if(pv.lengthSq()<1e-6) pv.set(0,-1,0); pv.normalize();
  const elbow=S.clone().addScaledVector(dir,ca*a).addScaledVector(pv,sa*a);
  aimBoneTo(up,fore,elbow); aimBoneTo(fore,hand,T); }
function spineAim(R,pitch,rt){ const sp=R.bn2.sp; if(!sp) return; sp.updateWorldMatrix(true,false); _tq.setFromAxisAngle(rt,pitch*0.55); sp.getWorldQuaternion(_tq2); _tq2.premultiply(_tq); sp.parent.getWorldQuaternion(_tq3); sp.quaternion.copy(_tq3.invert().multiply(_tq2)); sp.updateWorldMatrix(false,true); }
function rbBones(R){ if(R.bn2) return R.bn2; const m=R.m, g=k=>m.getObjectByName('Bip01_'+k); return R.bn2={sp:g('Spine1'),neck:g('Neck'),head:g('Head'),ru:g('R_UpperArm'),rf:g('R_Forearm'),rh:g('R_Hand'),lu:g('L_UpperArm'),lf:g('L_Forearm'),lh:g('L_Hand'),rc:g('R_Clavicle')}; }
/* pose an avatar holding gun `wi`, aiming along `dir` (unit, world); returns the muzzle point.  Used for the player and for police. */
function holdGun(A,wi,dir,gun,recoil){ const H=GUN_HOLD[wi]; if(!H||!gun) return null; const rt=new THREE.Vector3(-dir.z,0,dir.x).normalize(), upv=new THREE.Vector3().crossVectors(rt,dir).normalize();
  let base;
  if(A.real&&A.real.m.visible){ const R=A.real, B=rbBones(R); spineAim(R,Math.asin(clamp(dir.y,-1,1)),rt);
    const chest=(B.neck||B.sp).getWorldPosition(new THREE.Vector3());
    if(H.shoulder){ const sh=(B.ru||B.sp).getWorldPosition(new THREE.Vector3()); base=sh.clone().addScaledVector(upv,0.1).addScaledVector(rt,-0.02);
      gun.position.copy(base).addScaledVector(dir,0.1-recoil*0.6);
      armIK(B.ru,B.rf,B.rh,gun.position.clone().addScaledVector(dir,0.08).addScaledVector(upv,-0.14),chest.clone().addScaledVector(rt,0.5).addScaledVector(upv,-0.6));
      armIK(B.lu,B.lf,B.lh,gun.position.clone().addScaledVector(dir,0.42).addScaledVector(upv,-0.1),chest.clone().addScaledVector(rt,-0.6).addScaledVector(upv,-0.6)); }
    else if(H.pistol){ const hand=chest.clone().addScaledVector(dir,0.46-recoil*0.5).addScaledVector(upv,0.02).addScaledVector(rt,-0.04);
      armIK(B.ru,B.rf,B.rh,hand,chest.clone().addScaledVector(rt,0.6).addScaledVector(upv,-0.7));
      const rh=B.rh.getWorldPosition(new THREE.Vector3());
      gun.position.copy(rh).addScaledVector(dir,H.f).addScaledVector(upv,H.u);
      armIK(B.lu,B.lf,B.lh,rh.clone().addScaledVector(rt,-0.045).addScaledVector(upv,-0.035).addScaledVector(dir,-0.02),chest.clone().addScaledVector(rt,-0.45).addScaledVector(upv,-0.9));
      /* support hand wraps the grip: same orientation as the gun hand, mirrored about the barrel (was an open, twisted palm) */ { B.rh.getWorldQuaternion(_tq2); _tq.setFromAxisAngle(dir,Math.PI*0.85); _tq2.premultiply(_tq); B.lh.parent.getWorldQuaternion(_tq3); B.lh.quaternion.copy(_tq3.invert().multiply(_tq2)); B.lh.updateWorldMatrix(false,true); } }
    else { // long gun: butt in the right shoulder, right hand on the grip, left hand under the fore-end
      const sh=(B.ru||B.sp).getWorldPosition(new THREE.Vector3()); const L=gun.userData.len;
      const hd=(B.head||B.neck||B.sp).getWorldPosition(new THREE.Vector3()); const butt=sh.addScaledVector(dir,0.06-recoil*0.6).addScaledVector(rt,-0.11); butt.y+=((hd.y-0.13)-butt.y)*0.85; /* butt in the shoulder pocket, sights at eye level: cheek on the stock */
      gun.position.copy(butt).addScaledVector(dir,L*0.5);
      armIK(B.ru,B.rf,B.rh,butt.clone().addScaledVector(dir,Math.min(0.22,L*0.3)).addScaledVector(upv,-0.08),chest.clone().addScaledVector(rt,0.7).addScaledVector(upv,-0.6));
      armIK(B.lu,B.lf,B.lh,butt.clone().addScaledVector(dir,Math.min(L*0.62,0.55)).addScaledVector(upv,-0.06),chest.clone().addScaledVector(rt,-0.15).addScaledVector(upv,-0.9)); } }
  else { // procedural body: arm straight forward, gun at the end
    const g=A.group; base=new THREE.Vector3(0,1.38,0).applyMatrix4(g.matrixWorld); gun.position.copy(base).addScaledVector(rt,H.shoulder?0.15:0.2).addScaledVector(dir,H.shoulder?0.1:0.42).addScaledVector(upv,H.shoulder?0.18:0); }
  gun.lookAt(_ikT.copy(gun.position).sub(dir)); gun.visible=true;
  return gun.position.clone().addScaledVector(dir,gun.userData.len*0.5+0.03); }
/* foot IK: drop the pelvis to the lower foot's ground and lift the other foot onto its own ground (slopes, kerbs, steps) */
const _fl=new THREE.Vector3(), _fr=new THREE.Vector3();
function footIK(A){ const R=A.real; if(!R||!R.m.visible) return; const m=R.m, g=k=>m.getObjectByName('Bip01_'+k); if(!R.legs) R.legs={lt:g('L_Thigh'),lc:g('L_Calf'),lf:g('L_Foot'),rt:g('R_Thigh'),rc:g('R_Calf'),rf:g('R_Foot')}; const L=R.legs; if(!L.lf||!L.rf) return;
  const base=A.group.position.y; m.updateMatrixWorld(true); L.lf.getWorldPosition(_fl); L.rf.getWorldPosition(_fr);
  const dl=groundAt(_fl.x,_fl.z)-base, dr=groundAt(_fr.x,_fr.z)-base; const drop=clamp(Math.min(dl,dr,0)-0.44*(TPS.ck||0),-0.9,0); R.ikDrop=(R.ikDrop||0)+(drop-(R.ikDrop||0))*0.35;
  m.position.y+=R.ikDrop; m.updateMatrixWorld(true);
  const fw=new THREE.Vector3(-Math.sin(TPS.face),0,-Math.cos(TPS.face));
  for(const [t,c,f,d] of [[L.lt,L.lc,L.lf,dl],[L.rt,L.rc,L.rf,dr]]){ const lift=clamp(d-R.ikDrop,0,0.95); if(lift<0.01) continue; const fp=f.getWorldPosition(new THREE.Vector3()); const tp=t.getWorldPosition(new THREE.Vector3()); armIK(t,c,f,fp.add(new THREE.Vector3(0,lift,0)),tp.addScaledVector(fw,1.2)); } }
function tpsLate(){ const act=tpsActive(); const C=COMBAT; for(const k in TPS.guns) TPS.guns[k].visible=false; TPS.hasMuzzle=false; if(!act||!ME_AV||!ME_AV.group.visible) return;
  const A=ME_AV, R=A.real; if(PLAYER.ground&&!C.dead) footIK(A);
  if(R&&R.m.visible&&!C.dead){ const rt=new THREE.Vector3(Math.cos(TPS.face),0,-Math.sin(TPS.face)); if((TPS.ck||0)>0.05&&!(C.armed&&TPS.armK>0.3)){ rbBones(R); spineAim(R,-0.6*TPS.ck,rt); }
    if(!PLAYER.ground&&!PLAYER.fly&&R.legs){ const D=Math.PI/180, L=R.legs; const k=clamp(PLAYER.vel.y>0?1:0.7,0,1); boneRot(R.m,L.lt,-38*D*k); boneRot(R.m,L.rt,-22*D*k); boneRot(R.m,L.lc,62*D*k); boneRot(R.m,L.rc,40*D*k); } }
  if(R&&R.cur){ const P=PLAYER; const fx=-Math.sin(TPS.face), fz=-Math.cos(TPS.face); const back=(P.vel.x*fx+P.vel.z*fz)<-0.4; R.cur.timeScale=back?-Math.abs(R.cur.timeScale):Math.abs(R.cur.timeScale); }
  if(!C.armed||C.dead||C.drink||TPS.armK<0.3) return;
  const gun=tpsGun(C.wi); if(!gun) return; A.group.updateMatrixWorld(true);
  // aim at what the crosshair is on: from the camera along its forward, ~40 m out (or the first hit)
  const cam=GAME.camera; const o=cam.getWorldPosition(new THREE.Vector3()); const fw=new THREE.Vector3(0,0,-1).applyQuaternion(cam.getWorldQuaternion(new THREE.Quaternion()));
  if(window.CAMO){ o.set(PLAYER.pos.x,PLAYER.pos.y+1.6,PLAYER.pos.z); tpsForward(fw); } // dev camera pinned elsewhere: aim where the player looks
  const tgt=o.clone().addScaledVector(fw,40); const chest=new THREE.Vector3(PLAYER.pos.x,PLAYER.pos.y+1.42,PLAYER.pos.z); const dir=tgt.sub(chest).normalize();
  const m=holdGun(A,C.wi,dir,gun,C.recoil); if(m){ TPS.muzzle.copy(m); TPS.hasMuzzle=true; } }
