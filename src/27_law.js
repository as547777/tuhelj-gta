/* ===================== police officers and paramedics you can see =====================
   Every police car carries two officers (Rocketbox Police_Male_01). In a chase the car stops near you, the
   officers jump out and come after you with pistols: at 1 star they try to arrest you, from 2 stars they shoot.
   Drive away and they run back to the car and follow. Ambulances bring two paramedics who kneel by the
   victim, do CPR with a first-aid kit beside them and bring the person back to their feet. */
const LAW={crew:[],kits:[]};
const _lv=new THREE.Vector3(), _lw=new THREE.Vector3();
function lawPerson(kind){ const cop=kind==='cop'; const A=makePerson(cop?'Policajac':'Bolničar',cop?'#1f3f8f':'#2e8b3a'); A.rbKey=cop?'Police_Male_01':'Medical_Male_01'; A.female=false; A.noReal=false; if(A.sprite) A.sprite.visible=false; A.hp=100; GAME.scene.add(A.group); EXTRA_PEOPLE.push(A); return A; }
function lawCrew(car,kind){ if(car.crew) return car.crew; car.crew=[0,1].map(k=>{ const c={A:lawPerson(kind),car,kind,seat:k,out:false,st:'in',t:0,cd:1+Math.random(),gun:null,hold:0,face:0,arrestT:0}; LAW.crew.push(c); return c; }); return car.crew; }
function lawRemove(c){ GAME.scene.remove(c.A.group); if(c.A.real) detachReal(c.A); const i=EXTRA_PEOPLE.indexOf(c.A); if(i>=0) EXTRA_PEOPLE.splice(i,1); const j=LAW.crew.indexOf(c); if(j>=0) LAW.crew.splice(j,1); if(c.gun) GAME.scene.remove(c.gun); if(c.kit){ GAME.scene.remove(c.kit); } }
function seatWorld(car,k){ const v=car.v; const S=[[-0.28,-0.38],[-0.28,0.38]]; const p=new THREE.Vector3(S[k][0],v.seatY!==undefined?v.seatY:-0.33,S[k][1]); v.group.updateMatrixWorld(); return v.group.localToWorld(p); }
function doorWorld(car,k){ const v=car.v; const p=new THREE.Vector3(-0.3,0,(k?1:-1)*((v.wid||1.8)/2+0.55)); v.group.updateMatrixWorld(); v.group.localToWorld(p); p.y=groundAt(p.x,p.z); return p; }
function sitIn(c){ const A=c.A, car=c.car; const p=seatWorld(car,c.seat); A.group.position.copy(p); A.group.rotation.set(0,car.st.yaw,0); A.seatT=GAME.time; A.legL.rotation.x=A.legR.rotation.x=-1.45; A.armL.rotation.x=A.armR.rotation.x=c.seat?-0.6:-1.25; A.group.visible=true; c.out=false; A.forceClip=null; }
function walkTo(c,x,z,sp,dt){ const A=c.A, p=A.group.position; const dx=x-p.x, dz=z-p.z, d=Math.hypot(dx,dz); if(d<0.05) return d; const s=Math.min(d,sp*dt); const q={x:p.x+dx/d*s,z:p.z+dz/d*s}; const pv=new THREE.Vector3(q.x,0,q.z); BHASH.collide(pv,0.3,groundAt(q.x,q.z)+0.5); p.x=pv.x; p.z=pv.z; p.y=groundAt(p.x,p.z); c.face=angLerp(c.face,faceYaw(dx,dz),Math.min(1,dt*10)); A.group.rotation.set(0,c.face,0); return d; }
function sees(a,b){ const dx=b.x-a.x, dz=b.z-a.z; for(let t=0.08;t<0.95;t+=0.08){ const hb=BHASH.hit(a.x+dx*t,a.z+dz*t,0); if(hb&&hb.y1>a.y+1) return false; } return true; }
/* ---- police ---- */
function copCarTick(C,dt){ const crew=lawCrew(C,'cop'); const me=PLAYER.pos; const d=Math.hypot(C.st.x-me.x,C.st.z-me.z); const want=GTA.wanted;
  const playerCar=PLAYER.driving; const fleeing=playerCar&&Math.abs(playerCar.st.v)>6;
  const anyOut=crew.some(c=>c.out&&!c.A.dead);
  // decide: park & get out, or keep driving
  if(!C.parked&&want>0&&COP.state==='CHASE'&&d<30&&!fleeing) { C.parked=true; C.parkT=0; }
  if(C.parked){ C.parkT+=dt; C.tgt=[C.st.x,C.st.z]; C.st.v*=Math.exp(-dt*4);
    const wantBack=want===0||(fleeing&&d>28)||d>70;
    if(wantBack){ const allIn=crew.every(c=>!c.out||c.A.dead); if(allIn&&C.parkT>1){ C.parked=false; for(const c of crew) if(c.A.dead&&c.out){ /* left behind */ } } } }
  for(const c of crew){ const A=c.A; c.t+=dt;
    if(A.dead){ c.st='dead'; continue; } if(c.st==='dead'){ c.st='out'; }
    if(!c.out){ if(C.parked&&Math.abs(C.st.v)<1.5&&C.parkT>0.4+c.seat*0.3&&!(want===0)){ c.out=true; c.st='out'; const dp=doorWorld(C,c.seat); A.group.position.copy(dp); A.seatT=-1; A.legL.rotation.x=A.legR.rotation.x=0; c.cd=0.8+Math.random()*0.8; try{ blip('door'); }catch(e){} } else { sitIn(c); continue; } }
    // on foot
    const wantBack=!C.parked||want===0||(fleeing&&d>28)||d>70;
    if(wantBack){ const dp=doorWorld(C,c.seat); const r=walkTo(c,dp.x,dp.z,5.8,dt); c.aim=false; if(r<0.8){ sitIn(c); try{ blip('door'); }catch(e){} } continue; }
    const p=A.group.position; const dx=me.x-p.x, dz=me.z-p.z, dd=Math.hypot(dx,dz);
    const eye=_lv.set(p.x,p.y+1.6,p.z), tgt=_lw.set(me.x,me.y+1.2,me.z); const los=sees(eye,tgt);
    const shoot=want>=2&&los&&dd<45&&!COMBAT.dead;
    const keep=shoot?(want>=3?9:12):1.3;
    if(dd>keep||!los){ walkTo(c,me.x+(c.seat?1.5:-1.5)*(dd>4?1:0),me.z,dd>8?6.2:4.0,dt); c.aim=shoot&&dd<25; }
    else { c.face=angLerp(c.face,faceYaw(dx,dz),Math.min(1,dt*8)); A.group.rotation.set(0,c.face,0); c.aim=shoot; }
    // arrest when you're on foot and they catch you (1 star, or anyone close enough)
    if(!PLAYER.driving&&!COMBAT.dead&&dd<1.6&&want<=2){ c.arrestT+=dt; if(c.arrestT>1.0){ c.arrestT=0; busted(); } } else c.arrestT=Math.max(0,c.arrestT-dt);
    if(c.aim){ c.cd-=dt; if(c.cd<=0){ c.cd=(want>=4?0.45:0.75)+Math.random()*0.7; copShoot(c,dd); } } } }
function copShoot(c,dd){ const A=c.A; const muzzle=c.muzzle?c.muzzle.clone():A.group.position.clone().add(new THREE.Vector3(0,1.4,0)); const me=PLAYER.pos;
  const moving=Math.hypot(PLAYER.vel.x,PLAYER.vel.z)>5||(PLAYER.driving&&Math.abs(PLAYER.driving.st.v)>5);
  let pHit=0.36*(1-dd/50)*(moving?0.5:1)*(GTA.wanted>=3?1.15:0.85); if(COMBAT.ads) pHit*=0.85;
  const hit=Math.random()<pHit; const aimP=new THREE.Vector3(me.x+(hit?0:(Math.random()-0.5)*2.4),me.y+(PLAYER.driving?1.0:1.0+Math.random()*0.6),me.z+(hit?0:(Math.random()-0.5)*2.4));
  if(!hit) aimP.add(aimP.clone().sub(muzzle).normalize().multiplyScalar(12));
  addTracer(muzzle,aimP); fxFlash(muzzle,2,0.05,10); sfxAt('pistol',muzzle,200); c.recoil=0.12;
  if(hit){ if(PLAYER.driving){ const V={v:PLAYER.driving,st:PLAYER.driving.st,ref:PLAYER.driving,kind:'drive'}; damageVehicle(V,4); if(Math.random()<0.3) takeDamage(5,'policija'); } else takeDamage(GTA.wanted>=4?11:7,'policija'); } }
function lawCarWrecked(V){ const C=V.ref; if(!C.crew) return; for(const c of C.crew){ if(!c.out){ c.out=true; const dp=doorWorld(C,c.seat); c.A.group.position.copy(dp); c.A.seatT=-1; } hurtPerson({A:c.A,n:c.A.name,crew:c},500,false); } }
function lawCarGone(C){ if(!C.crew) return; for(const c of C.crew) lawRemove(c); C.crew=null; }
/* ---- Crni Vukovi on foot (story missions): guard a spot, then come at you and shoot ---- */
const THUG_LOOK=['Male_Adult_05','Male_Adult_02','Male_Adult_13','Male_Adult_20','Male_Adult_16'];
function spawnThug(x,z,opt){ opt=opt||{}; const A=makePerson('Vuk','#141414'); A.rbKey=THUG_LOOK[LAW.crew.length%THUG_LOOK.length]; A.female=false; A.noRevive=true; A.noCrime=true; A.hp=opt.hp||70; if(A.sprite) A.sprite.visible=false; GAME.scene.add(A.group); EXTRA_PEOPLE.push(A);
  const p=offRoad(x,z,1.2); A.group.position.set(p[0],groundAt(p[0],p[1]),p[1]); const c={A,car:null,kind:'thug',seat:0,out:true,st:'guard',t:0,cd:1.5+Math.random(),gun:null,face:Math.random()*TAU,arrestT:0,wi:opt.wi===undefined?(Math.random()<0.35?1:4):opt.wi,home:[p[0],p[1]],alert:false,tag:opt.tag||'story'};
  A.group.rotation.y=c.face; LAW.crew.push(c); return c; }
function thugTick(c,dt){ const A=c.A; if(A.dead){ c.st='dead'; return; } const me=PLAYER.pos, p=A.group.position; const dx=me.x-p.x, dz=me.z-p.z, dd=Math.hypot(dx,dz);
  const eye=_lv.set(p.x,p.y+1.6,p.z), tgt=_lw.set(me.x,me.y+1.2,me.z); const los=dd<60&&sees(eye,tgt);
  if(!c.alert&&(dd<38&&los||A.hp<70||dd<12)){ c.alert=true; try{ bubble(A,['Eno ga!','Sredi ga!','Ti si mrtav!'][Math.floor(Math.random()*3)],2); }catch(e){} for(const o of LAW.crew) if(o.kind==='thug'&&o.tag===c.tag&&Math.hypot(o.A.group.position.x-p.x,o.A.group.position.z-p.z)<40) o.alert=true; }
  c.aim=false; if(!c.alert){ c.t+=dt; c.face=angLerp(c.face,c.face+Math.sin(c.t*0.3)*0.5,dt); A.group.rotation.set(0,c.face,0); return; }
  if(COMBAT.dead) return; const keep=c.wi===1?11:14;
  if(dd>keep||!los){ walkTo(c,me.x+Math.sin(c.t+c.home[0])*3,me.z+Math.cos(c.t+c.home[1])*3,dd>14?5.8:3.2,dt); c.aim=los&&dd<30; }
  else { c.t+=dt; c.face=angLerp(c.face,faceYaw(dx,dz),Math.min(1,dt*8)); A.group.rotation.set(0,c.face,0); c.aim=true; const sx=Math.cos(c.t*0.7+c.home[0])*1.8*dt; const pv=new THREE.Vector3(p.x+(-dz/dd)*sx,0,p.z+(dx/dd)*sx); BHASH.collide(pv,0.3,p.y+0.5); p.x=pv.x; p.z=pv.z; p.y=groundAt(p.x,p.z); }
  if(c.aim){ c.cd-=dt; if(c.cd<=0){ c.cd=(c.wi===1?0.18:0.7)+Math.random()*0.5; if(c.wi===1){ c.burst=(c.burst||0)+1; if(c.burst>5){ c.burst=0; c.cd=1.4; } } thugShoot(c,dd); } } }
function thugShoot(c,dd){ const muzzle=c.muzzle?c.muzzle.clone():c.A.group.position.clone().add(new THREE.Vector3(0,1.4,0)); const me=PLAYER.pos;
  const moving=Math.hypot(PLAYER.vel.x,PLAYER.vel.z)>5||(PLAYER.driving&&Math.abs(PLAYER.driving.st.v)>5);
  const hit=Math.random()<0.42*(1-dd/55)*(moving?0.5:1)*(c.wi===1?0.6:1); const aimP=new THREE.Vector3(me.x+(hit?0:(Math.random()-0.5)*2.6),me.y+1.0+Math.random()*0.5,me.z+(hit?0:(Math.random()-0.5)*2.6)); if(!hit) aimP.add(aimP.clone().sub(muzzle).normalize().multiplyScalar(10));
  addTracer(muzzle,aimP); fxFlash(muzzle,2,0.05,10); sfxAt(c.wi===1?'smg':'pistol',muzzle,200); c.recoil=0.12;
  if(hit){ if(PLAYER.driving){ damageVehicle({v:PLAYER.driving,st:PLAYER.driving.st,ref:PLAYER.driving,kind:'drive'},3); if(Math.random()<0.25) takeDamage(4,'Crni Vukovi'); } else takeDamage(c.wi===1?5:8,'Crni Vukovi'); } }
function thugsLeft(tag){ return LAW.crew.filter(c=>c.kind==='thug'&&(!tag||c.tag===tag)&&!c.A.dead).length; }
function clearThugs(tag){ for(const c of LAW.crew.slice()) if(c.kind==='thug'&&(!tag||c.tag===tag)) lawRemove(c); }
/* ---- paramedics ---- */
function medkit(){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.22,0.3),new THREE.MeshStandardMaterial({color:0xd8261e,roughness:0.5})); b.position.y=0.11; b.castShadow=true; g.add(b); const w=new THREE.MeshBasicMaterial({color:0xffffff}); for(const [x,z] of [[0.18,0.05],[0.05,0.18]]){ const c=new THREE.Mesh(new THREE.BoxGeometry(x,0.005,z),w); c.position.y=0.223; g.add(c); } const h=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.012,6,12,Math.PI),new THREE.MeshStandardMaterial({color:0x222222})); h.position.y=0.22; g.add(h); return g; }
function victimNear(x,z){ let best=null, bd=14; for(const P of allPeople()){ const A=P.A; if(!A.dead||!A.deadPos||A.noRevive) continue; const d=Math.hypot(A.deadPos.x-x,A.deadPos.z-z); if(d<bd){ bd=d; best=P; } } return best; }
function ambTick(Am,dt){ const crew=lawCrew(Am,'med'); const tg=Am.target;
  const d=Math.hypot(Am.st.x-tg[0],Am.st.z-tg[1]);
  if(!Am.busy&&!Am.done&&!Am.leaving&&d<10&&Math.abs(Am.st.v)<2.5){ const V=victimNear(tg[0],tg[1]); if(V){ Am.busy=true; Am.victim=V; Am.cpr=0; } else { Am.done=true; } }
  if(Am.done&&!Am.leaving&&crew.every(c=>!c.out)){ const n=nearestRoad(Am.st.x-Math.sin(Am.st.yaw)*120,Am.st.z-Math.cos(Am.st.yaw)*120,60); Am.leaving=n?[n.s.x,n.s.z]:[Am.st.x+100,Am.st.z]; }
  for(const c of crew){ const A=c.A; c.t+=dt;
    if(!c.out){ if(Am.busy&&!Am.done&&c.t>0.5+c.seat*0.4){ c.out=true; c.t=0; const dp=doorWorld(Am,c.seat); A.group.position.copy(dp); A.seatT=-1; try{ blip('door'); }catch(e){} } else { sitIn(c); continue; } }
    if(Am.done||!Am.victim){ A.forceClip=null; if(c.kit){ GAME.scene.remove(c.kit); c.kit=null; } const dp=doorWorld(Am,c.seat); if(walkTo(c,dp.x,dp.z,2.6,dt)<0.8){ sitIn(c); } continue; }
    const V=Am.victim.A; const chest=V.group.localToWorld(new THREE.Vector3(0,1.25,0)); const legs=V.group.localToWorld(new THREE.Vector3(0,0.5,0));
    const side=new THREE.Vector3().subVectors(legs,chest).normalize(); const perp=new THREE.Vector3(-side.z,0,side.x);
    const spot=(c.seat?legs:chest).clone().addScaledVector(perp,c.seat?-0.6:0.6);
    const r=walkTo(c,spot.x,spot.z,2.4,dt);
    if(r<0.15){ const look=(c.seat?chest:chest); c.face=angLerp(c.face,faceYaw(look.x-A.group.position.x,look.z-A.group.position.z),Math.min(1,dt*6)); A.group.rotation.set(0,c.face,0); A.forceClip='sitchair'; A.forceY=-0.42; c.work=chest;
      if(c.seat&&!c.kit){ c.kit=medkit(); const kp=A.group.position.clone().addScaledVector(side,0.55); c.kit.position.set(kp.x,groundAt(kp.x,kp.z),kp.z); c.kit.rotation.y=c.face; GAME.scene.add(c.kit); }
      if(!c.seat){ Am.cpr+=dt; if(Am.cpr>7.5){ // revived
          V.deadT=0.0001; Am.done=true; Am.busy=false; try{ bubble(V,['Hvala vam!','Gdje sam to?','Joj, glava…'][Math.floor(Math.random()*3)],3); }catch(e){} UI.toast('🚑 Bolničari su spasili: '+(Am.victim.n||'mještanin')); } } }
    else { A.forceClip=null; c.work=null; } }
  if(Am.busy&&Am.victim&&!Am.victim.A.dead){ Am.done=true; Am.busy=false; } }
/* ---- road graph + A*: police, gang and ambulances drive along the roads instead of across fields ---- */
const ROADG={nodes:null,hash:new Map()};
function roadGraph(){ if(ROADG.nodes) return ROADG.nodes; const N=[]; const key=(x,z)=>Math.floor(x/8)+'|'+Math.floor(z/8);
  for(const r of ROADS){ if(!r.S||r.t==='path') continue; let prev=null; for(let i=0;i<r.S.length;i+=4){ const j=Math.min(i,r.S.length-1); const n={x:r.S[j][0],z:r.S[j][1],adj:[],rid:r.rid,id:N.length}; N.push(n); const k=key(n.x,n.z); let a=ROADG.hash.get(k); if(!a){ a=[]; ROADG.hash.set(k,a); } a.push(n); if(prev){ prev.adj.push(n); n.adj.push(prev); } prev=n; }
    const L=r.S[r.S.length-1]; if(prev&&Math.hypot(prev.x-L[0],prev.z-L[1])>1){ const n={x:L[0],z:L[1],adj:[prev],rid:r.rid,id:N.length}; prev.adj.push(n); N.push(n); const k=key(n.x,n.z); let a=ROADG.hash.get(k); if(!a){ a=[]; ROADG.hash.set(k,a); } a.push(n); } }
  for(const n of N){ const cx=Math.floor(n.x/8), cz=Math.floor(n.z/8); for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++){ const a=ROADG.hash.get((cx+i)+'|'+(cz+j)); if(!a) continue; for(const m of a){ if(m.rid===n.rid||n.adj.includes(m)) continue; if(Math.hypot(m.x-n.x,m.z-n.z)<5){ n.adj.push(m); m.adj.push(n); } } } }
  ROADG.nodes=N; return N; }
function nearNode(x,z){ roadGraph(); let best=null, bd=1e9; const cx=Math.floor(x/8), cz=Math.floor(z/8); for(let r=0;r<6&&!best;r++) for(let i=-r;i<=r;i++) for(let j=-r;j<=r;j++){ if(Math.max(Math.abs(i),Math.abs(j))!==r) continue; const a=ROADG.hash.get((cx+i)+'|'+(cz+j)); if(!a) continue; for(const n of a){ const d=Math.hypot(n.x-x,n.z-z); if(d<bd){ bd=d; best=n; } } } return best; }
function roadRoute(ax,az,bx,bz){ const A=nearNode(ax,az), B=nearNode(bx,bz); if(!A||!B) return null; if(A===B) return [[B.x,B.z]];
  const g=new Map([[A,0]]), from=new Map(), open=[A], f=new Map([[A,Math.hypot(A.x-B.x,A.z-B.z)]]), closed=new Set(); let it=0;
  while(open.length&&it++<6000){ let bi=0; for(let i=1;i<open.length;i++) if(f.get(open[i])<f.get(open[bi])) bi=i; const cur=open[bi]; open.splice(bi,1); if(cur===B) break; closed.add(cur);
    for(const m of cur.adj){ if(closed.has(m)) continue; const ng=g.get(cur)+Math.hypot(m.x-cur.x,m.z-cur.z); if(ng<(g.has(m)?g.get(m):1e18)){ g.set(m,ng); from.set(m,cur); f.set(m,ng+Math.hypot(m.x-B.x,m.z-B.z)); if(!open.includes(m)) open.push(m); } } }
  if(!from.has(B)) return null; const out=[]; let n=B; while(n){ out.push([n.x,n.z]); n=from.get(n); } return out.reverse(); }
// next point to steer at: along the road route, ~20 m ahead; straight at the target once close
function routeTo(C,tx,tz,dt){ const s=C.st; const d=Math.hypot(tx-s.x,tz-s.z); if(d<45) { C.route=null; return [tx,tz]; }
  C.rt=(C.rt||0)-dt; if(!C.route||C.rt<=0||(C.rtgt&&Math.hypot(C.rtgt[0]-tx,C.rtgt[1]-tz)>30)){ C.rt=2.5; C.rtgt=[tx,tz]; C.route=roadRoute(s.x,s.z,tx,tz); C.ri=0; }
  const R=C.route; if(!R||!R.length) return [tx,tz];
  while(C.ri<R.length-1&&Math.hypot(R[C.ri][0]-s.x,R[C.ri][1]-s.z)<20) C.ri++;
  return R[C.ri]; }
/* ---- per frame ---- */
function lawTick(dt){ if(!GAME.started) return;
  for(const C of GTA.chasers) if(C.kind==='policija'&&!C.wreck) copCarTick(C,dt);
  for(const Am of GTA.amb) if(!Am.wreck) ambTick(Am,dt);
  for(const c of LAW.crew) if(c.kind==='thug') thugTick(c,dt);
  // crew whose vehicle disappeared
  for(let i=LAW.crew.length-1;i>=0;i--){ const c=LAW.crew[i]; if(c.kind==='thug') continue; const alive=c.kind==='cop'?GTA.chasers.includes(c.car):GTA.amb.includes(c.car); if(!alive) lawRemove(c); } }
function lawLate(){ for(const c of LAW.crew){ const A=c.A; if(!c.out||A.dead){ if(c.gun) c.gun.visible=false; continue; }
    if(c.kind==='cop'||c.kind==='thug'){ const wi=c.kind==='thug'?c.wi:4; if(!c.gun||(!c.gun.userData.glb&&MODELS.gltf.weapons)){ if(c.gun) GAME.scene.remove(c.gun); c.gun=makeHeldGun(wi); }
      if(c.aim||(c.kind==='cop'&&GTA.wanted>=2)||(c.kind==='thug'&&c.alert)){ const me=PLAYER.pos; const p=A.group.position; const dir=new THREE.Vector3(me.x-p.x,(me.y+1.1)-(p.y+1.42),me.z-p.z).normalize(); A.group.updateMatrixWorld(true); c.recoil=(c.recoil||0)*0.85; c.muzzle=holdGun(A,wi,dir,c.gun,c.recoil); }
      else { c.gun.visible=false; c.muzzle=null; } }
    else if(c.work&&A.real&&A.real.m.visible){ // CPR: both hands on the chest, pumping
      const R=A.real, B=rbBones(R); const pump=c.seat?0:Math.max(0,Math.sin(GAME.time*11))*0.07; const t=c.work.clone().add(new THREE.Vector3(0,0.06+pump,0)); A.group.updateMatrixWorld(true);
      const rt=new THREE.Vector3(Math.cos(c.face),0,-Math.sin(c.face)); spineAim(R,-0.5,rt);
      const chestB=(B.neck||B.sp).getWorldPosition(new THREE.Vector3());
      if(c.seat){ const kitP=c.kit?c.kit.position.clone().add(new THREE.Vector3(0,0.25,0)):t; armIK(B.ru,B.rf,B.rh,kitP,chestB.clone().addScaledVector(rt,0.6)); armIK(B.lu,B.lf,B.lh,t.clone().addScaledVector(rt,-0.1),chestB.clone().addScaledVector(rt,-0.6)); }
      else { armIK(B.ru,B.rf,B.rh,t.clone().addScaledVector(rt,0.04),chestB.clone().addScaledVector(rt,0.5).add(new THREE.Vector3(0,0.3,0))); armIK(B.lu,B.lf,B.lh,t.clone().addScaledVector(rt,-0.04),chestB.clone().addScaledVector(rt,-0.5).add(new THREE.Vector3(0,0.3,0))); } } } }
