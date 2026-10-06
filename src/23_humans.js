/* ===================== realistic animated people (glTF, motion capture) =====================
   Mještani: Microsoft Rocketbox avatari + Rocketbox mocap animacije (MIT) — hodanje, šetnja, trčanje, stajanje,
   sjedenje za stolom/na stolici, pijenje, razgovor, mahanje, pijano hodanje. Igrač "vojnik": Soldier.glb (three.js/Mixamo).
   Proceduralni lik (makeAvatar) ostaje ispod kao rezerva: za daleke ljude, bicikliste i dok se modeli učitavaju. */
const EXTRA_PEOPLE=[]; // police officers, paramedics, story characters: avatars with A.rbKey set
const REAL={ready:false,gltf:null,variants:[],list:[],rb:{},rbReady:false,clips:{m:{},f:{}},pel:{m:{},f:{}},sortT:0,chosen:new Set(),n:0};
const RB_M=['Male_Adult_02','Male_Adult_05','Male_Adult_06','Male_Adult_08','Male_Adult_13','Male_Adult_16','Male_Adult_20','Delivery_Male_01','Gardener_Male_01','Male_Adult_03'];
const RB_F=['Female_Adult_01','Female_Adult_02','Female_Adult_04','Female_Adult_07','Female_Adult_13','Female_Adult_17'];
const RB_ROLE={'Dealer':'Female_Adult_17','Vatrogasac Krtek':'Fire_Male_01','Poljanec Martin':'Male_Adult_03','Joža st.':'Male_Adult_03','Lidija':'Female_Adult_02','Valentina':'Female_Adult_13','Kenka':'Kenka_Mandura','Jovo':'Male_Adult_20','Kiki Poljanec':'Male_Adult_16','Prgac':'Delivery_Male_01','Tuljulju':'Male_Adult_13','Štefica':'Female_Adult_07','Dragica':'Female_Adult_01','Mirko':'Male_Adult_08','Ivek':'Male_Adult_06','Barica':'Female_Adult_04'};
const RB_IDLE={'Tuljulju':'talk','Prgac':'talk','Vatrogasac Krtek':'look','Lidija':'idle'};
const SKINS=[{n:'obični'},{n:'realistični vojnik',k:'soldier'},{n:'Tomo (crveni pulover)',k:'Male_Adult_06'},{n:'Marko (plava majica)',k:'Male_Adult_16'},{n:'Ivan (košulja)',k:'Male_Adult_08'},{n:'Ana (zelena majica)',k:'Female_Adult_17'},{n:'Maja (smeđa jakna)',k:'Female_Adult_04'},{n:'Policajac',k:'Police_Male_01'},{n:'Vatrogasac',k:'Fire_Male_01'},{n:'Hitna',k:'Medical_Male_01'},{n:'Seljak (gumene čizme)',k:'Gardener_Male_01'}];
const MALE_W=new Set(['Kenka','Jovo','Joža','Štef','Šemso','Krtek','Prgac','Tuljulju','Dealer','Vatrogasac','Poljanec','Ivek','Mirko','Kiki']);
function realInit(){ if(REAL.started||typeof SOLDIER_B64==='undefined'||!THREE.GLTFLoader) return; REAL.started=true;
  try{ const bin=atob(SOLDIER_B64); const buf=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) buf[i]=bin.charCodeAt(i);
    new THREE.GLTFLoader().parse(buf.buffer,'',(g)=>{ REAL.gltf=g; g.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } }); REAL.ready=true; },(e)=>{ console.warn('glTF',e); }); }catch(e){ console.warn('real',e); } }
function rbInit(){ if(REAL.rbStarted||typeof loadModelPack!=='function') return; REAL.rbStarted=true;
  Promise.all([loadModelPack('anims'),loadModelPack(peoplePack())]).then(([AN,PE])=>{
    for(const g of ['m','f']){ const G=AN&&AN['anim_'+g]; if(!G) continue; REAL.spd=REAL.spd||{m:{},f:{}}; for(const c of G.animations){ c.tracks=c.tracks.filter(t=>!/Footsteps|MotionExtraction/.test(t.name)); REAL.clips[g][c.name]=c; const pt=c.tracks.find(t=>t.name==='Bip01.position'); REAL.pel[g][c.name]=pt?pt.values[1]*0.01:0.9;
        // mocap walk/run cycles carry root motion (the pelvis travels ~1-2 m forward, then snaps back on loop → the character
        // "goes forward and gets pulled back"). Remove the drift and remember the real stride speed to drive the playback rate.
        if(pt&&pt.values.length>=6){ const v=pt.values, tm=pt.times, n=tm.length, dur=tm[n-1]-tm[0]||1; const dx=v[3*n-3]-v[0], dz=v[3*n-1]-v[2];
          if(Math.hypot(dx,dz)>20){ for(let i=0;i<n;i++){ const k=(tm[i]-tm[0])/dur; v[3*i]-=dx*k; v[3*i+2]-=dz*k; } REAL.spd[g][c.name]=Math.hypot(dx,dz)*0.01/dur; } } } }
    for(const k of Object.keys(PE||{})){ const G=PE[k]; G.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=false; if(o.material) o.material.envMapIntensity=0.55; } }); REAL.rb[k]=G; }
    REAL.rbReady=Object.keys(REAL.rb).length>0&&Object.keys(REAL.clips.m).length>0;
  }).catch(e=>console.warn('ljudi:',e&&e.message)); }
function rbFemale(A,n){ if(A.female!==undefined) return !!A.female; const w=String(n||A.name||'').split(/\s+/)[0]; if(MALE_W.has(w)) return false; return /a$/i.test(w); }
function hashN(s){ let h=0; for(const ch of String(s||'x')) h=(h*31+ch.charCodeAt(0))>>>0; return h; }
function rbKeyFor(A,n){ if(A.rbKey) return A.rbKey; const nm=String(n||A.name||'x'); const r=RB_ROLE[nm]; if(r&&REAL.rb[r]) return (A.rbKey=r);
  const L=(rbFemale(A,nm)?RB_F:RB_M).filter(k=>REAL.rb[k]); if(!L.length) return null; return (A.rbKey=L[hashN(nm)%L.length]); }
function isFemaleKey(k){ return /Female/.test(k); }
/* ---- attach a model on top of the procedural avatar A (A.group) ---- */
function attachReal(A,key){ let m, act={}, g='m', mixer; const h=hashN(A.name);
  if(key==='soldier'){ const G=REAL.gltf; m=THREE.SkeletonUtils.clone(G.scene); mixer=new THREE.AnimationMixer(m); for(const clip of G.animations){ const n=clip.name.toLowerCase(); if(n.includes('idle')) act.idle=mixer.clipAction(clip); else if(n.includes('walk')) act.walk=mixer.clipAction(clip); else if(n.includes('run')) act.run=mixer.clipAction(clip); } m.scale.setScalar(0.96+((h>>5)%9)*0.01); }
  else { const G=REAL.rb[key]; m=THREE.SkeletonUtils.clone(G.scene); g=isFemaleKey(key)?'f':'m'; mixer=new THREE.AnimationMixer(m); for(const [nm,clip] of Object.entries(REAL.clips[g])) act[nm]=mixer.clipAction(clip); m.scale.setScalar(0.97+((h>>4)%7)*0.01); }
  m.rotation.y=Math.PI; m.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } }); A.group.add(m);
  const extras=A.group.children.filter(c=>c!==m&&c!==A.sprite&&c!==A.bub&&!A.body.includes(c)&&c.isMesh);
  A.real={m,mixer,act,g,key,cur:null,last:A.group.position.clone(),spd:0,acc:1,extras,sc:m.scale.x,cat:0,catT:-9}; REAL.list.push(A); }
function detachReal(A){ const R=A.real; if(!R) return; A.group.remove(R.m); R.mixer.stopAllAction(); showProc(A,true); A.real=null; const i=REAL.list.indexOf(A); if(i>=0) REAL.list.splice(i,1); }
function showProc(A,on){ for(const bp of A.body) bp.visible=on; if(A.real) for(const e of A.real.extras) e.visible=on; }
const RB_FALL={stroll:'walk',drunkwalk:'walk',look:'idle',talk:'idle',phone:'idle',drink:'idle',wave:'idle',dance:'idle',drunk:'idle'};
function rbPlay(R,name,ts){ let a=R.act[name]; if(!a&&RB_FALL[name]) a=R.act[RB_FALL[name]]; if(!a) a=R.act.idle; if(!a) return;
  if(R.cur!==a){ a.reset(); a.enabled=true; a.setEffectiveTimeScale(1); a.setEffectiveWeight(1); if(!R.cur) a.time=Math.random()*a.getClip().duration; a.play(); if(R.cur) R.cur.crossFadeTo(a,0.3,false); R.cur=a; }
  if(ts!==undefined) a.timeScale=ts; }
function seatedFlag(A){ A.seatT=GAME.time; }
/* who should look how: players choose a skin (SKINS), villagers get a Rocketbox avatar by name */
function wantedKey(A,kind,n){ if(kind==='me'){ if(!OW.skinSet&&!(OW.skin|0)){ const nm=String(NET.name||'Igrač'); const L=rbFemale({},nm)?[5,6]:[2,3,4]; OW.skin=L[hashN(nm)%L.length]; } return (SKINS[OW.skin|0]||{}).k||null; } if(kind==='remote') return (SKINS[A._sk|0]||{}).k||null; if(OW.realPeople===false||A.noReal) return null; return REAL.rbReady?rbKeyFor(A,n):null; }
function waitingPeople(){ return OW.realPeople!==false&&!MODELS.failed[peoplePack()]&&!MODELS.failed.anims&&!REAL.rbReady&&GAME.time<90; }
function humansTick(dt){ realInit(); rbInit(); if(!REAL.ready&&!REAL.rbReady){ if(waitingPeople()){ const hide=A=>{ if(A&&A.group&&A!==ME_AV) showProc(A,false); }; for(const N of NPCS) hide(N.A); for(const V of LIFE.villagers) hide(V.A); for(const Q of GTA.peds) hide(Q.A); for(const A of EXTRA_PEOPLE) hide(A); for(const A of INT_PEOPLE) hide(A); } return; }
  const cand=[]; const push=(A,kind,n)=>{ if(A&&A.group) cand.push({A,kind,n}); };
  for(const R of NET.remotes.values()) if(R.av){ R.av._sk=R.sk|0; push(R.av,'remote',R.name); } if(ME_AV) push(ME_AV,'me',NET.name);
  for(const N of NPCS) push(N.A,'npc',N.d.n); for(const V of LIFE.villagers) push(V.A,'npc',V.n); if(typeof INT_PEOPLE!=='undefined') for(const A of INT_PEOPLE) push(A,'npc',A.name); if(typeof SHOPIN!=='undefined'&&SHOPIN.cashier&&!(typeof INT_PEOPLE!=='undefined'&&INT_PEOPLE.includes(SHOPIN.cashier))) push(SHOPIN.cashier,'npc',SHOPIN.cashier.name); for(const Q of GTA.peds) push(Q.A,'npc',Q.A.name); for(const A of EXTRA_PEOPLE) push(A,'npc',A.name);
  if(typeof PK3!=='undefined'&&PK3&&PK3.npc) for(const [n,A] of PK3.npc){ A.pk=true; push(A,'npc',n); }
  const cam=GAME.camera.position; const MAXR=GAME.touch?12:40, RMAX=GAME.touch?70:140;
  const FR=REAL.fr||(REAL.fr=new THREE.Frustum()), PM=REAL.pm||(REAL.pm=new THREE.Matrix4()), SPH=REAL.sph||(REAL.sph=new THREE.Sphere(new THREE.Vector3(),1.5)); GAME.camera.updateMatrixWorld(); PM.multiplyMatrices(GAME.camera.projectionMatrix,GAME.camera.matrixWorldInverse); FR.setFromProjectionMatrix(PM);
  REAL.sortT-=dt; if(REAL.sortT<=0){ REAL.sortT=0.3; const L=cand.filter(c=>c.A.group.visible).map(c=>({c,d:Math.hypot(c.A.group.position.x-cam.x,c.A.group.position.z-cam.z)})).filter(e=>e.d<RMAX||e.c.kind!=='npc').sort((a,b)=>a.d-b.d); REAL.chosen=new Set(L.slice(0,MAXR).map(e=>e.c.A)); }
  let attached=0;
  for(const {A,kind,n} of cand){ let key=wantedKey(A,kind,n); if(key==='soldier'&&!REAL.ready) key=null; if(key&&key!=='soldier'&&!REAL.rb[key]) key=null;
    if(A.gun&&MODELS.gltf.weapons) upgradeAvatarGun(A);
    if(A.real&&A.real.key!==key) detachReal(A);
    // never show the old block figures while the real people are on their way, or for people too far to get a model
    if(!key){ showProc(A,!(waitingPeople()&&A.wantReal!==false)); continue; }
    const pick=REAL.chosen.has(A)||kind!=='npc';
    if(!A.real){ if(!pick||attached>=4){ if(kind==='npc') showProc(A,false); continue; } attachReal(A,key); attached++; }
    const R=A.real, p=A.group.position; const d=Math.hypot(p.x-cam.x,p.z-cam.z);
    const onBike=A.bikeT!==undefined&&GAME.time-A.bikeT<0.25; const seated=!onBike&&(A.seatT!==undefined&&A.seatT>=0&&GAME.time-A.seatT<0.25);
    const odd=A.group.rotation.x!==0&&!A.dead;
    let sitClip=null; if(seated){ sitClip=(A.pose==='sit'||A.pk)?'sittable':'sitchair'; if(!R.act[sitClip]) sitClip=null; }
    const show=pick&&A.group.visible&&!odd&&!(seated&&!sitClip)&&!(onBike&&R.key==='soldier')&&d<(kind==='npc'?RMAX:220);
    SPH.center.set(p.x,p.y+0.9,p.z); const inView=FR.intersectsSphere(SPH);
    R.m.visible=show&&inView; showProc(A,!show); if(A.gun&&show) A.gun.visible=false;
    if(A.spdOv!==undefined){ R.last.copy(p); R.spd+=(A.spdOv-R.spd)*Math.min(1,dt*10); } else { const v=R.last.distanceTo(p)/Math.max(dt,1e-3); R.last.copy(p); R.spd+=(Math.min(v,9)-R.spd)*Math.min(1,dt*6); }
    if(!show||!inView) continue;
    const shd=GAME.touch?d<12:d<40; if(R.shd!==shd){ R.shd=shd; R.m.traverse(o=>{ if(o.isMesh) o.castShadow=shd; }); }
    const s=A.dead?0:R.spd; let clip, ts=1;
    // speed → idle / stroll / walk / run, with hysteresis and a minimum hold so people don't twitch between clips
    const BND=[0.25,0.85,2.05]; let c=R.cat; while(c<3&&s>BND[c]+0.12) c++; while(c>0&&s<BND[c-1]-0.12) c--; if(c!==R.cat&&GAME.time-R.catT>(kind==='me'?0.12:0.4)){ R.cat=c; R.catT=GAME.time; }
    if(A.forceClip&&(R.act[A.forceClip]||RB_FALL[A.forceClip])){ clip=A.forceClip; ts=A.forceTs||1; }
    else if(sitClip){ clip=sitClip; }
    else if(onBike){ clip='idle'; }
    else if(R.cat===0) clip=RB_IDLE[n]||'idle';
    else { const SP=(REAL.spd&&REAL.spd[R.g])||{}; // playback rate = ground speed / stride speed of the clip → feet stay planted
      if(R.cat===1){ clip='stroll'; ts=clamp(s/(SP.stroll||0.7),0.5,1.6); }
      else if(R.cat===2){ clip=(n==='Kenka'||n==='Jovo')?'drunkwalk':'walk'; const k=s/(SP[clip]||SP.walk||1.0); ts=clamp(k<1?k:Math.pow(k,0.7),0.6,1.6); }
      else { clip='run'; const k=s/(SP.run||2.9); ts=clamp(k<1?k:Math.pow(k,0.72),0.7,1.8); } }  // faster running = longer strides, not just faster legs
    rbPlay(R,clip,ts);
    R.m.position.y=A.forceY!==undefined&&A.forceClip?A.forceY:sitClip?(0.99-(REAL.pel[R.g][sitClip]||0.58)*R.sc):onBike?0.04:0;
    if(A.dead){ continue; }
    R.acc+=dt; const step=onBike?0:GAME.touch?(d<12?1/40:d<30?1/15:1/8):(d<25?0:d<55?1/20:1/10); if(R.acc>=step){ R.mixer.update(R.acc); R.acc=0; if(onBike) bikePose(R,A.bikePh||0); } } }
/* cycling: realistic riders keep the idle clip and get legs/arms/spine posed per frame (pedalling from the wheel phase) */
const _bq=new THREE.Quaternion(), _bp=new THREE.Quaternion(), _br=new THREE.Quaternion(), _bx=new THREE.Vector3(), BX=new THREE.Vector3(1,0,0);
function boneRot(root,bone,ang){ if(!bone||!bone.parent) return; bone.parent.updateWorldMatrix(true,false); root.getWorldQuaternion(_br); bone.parent.getWorldQuaternion(_bp); _bx.copy(BX).applyQuaternion(_br).applyQuaternion(_bp.invert()).normalize(); _bq.setFromAxisAngle(_bx,ang); bone.quaternion.premultiply(_bq); }
function bikePose(R,ph){ const m=R.m; if(!R.bn){ const g=k=>m.getObjectByName('Bip01_'+k); R.bn={sp:g('Spine1'),hd:g('Head'),lt:g('L_Thigh'),lc:g('L_Calf'),rt:g('R_Thigh'),rc:g('R_Calf'),lu:g('L_UpperArm'),lf:g('L_Forearm'),ru:g('R_UpperArm'),rf:g('R_Forearm')}; } const B=R.bn, D=Math.PI/180;
  boneRot(m,B.sp,22*D); boneRot(m,B.hd,-16*D);
  const leg=(th,ca,a)=>{ boneRot(m,th,-(66+26*Math.sin(a))*D); boneRot(m,ca,(72+36*Math.sin(a))*D); }; leg(B.lt,B.lc,ph); leg(B.rt,B.rc,ph+Math.PI);
  boneRot(m,B.lu,-55*D); boneRot(m,B.lf,-20*D); boneRot(m,B.ru,-55*D); boneRot(m,B.rf,-20*D); }
