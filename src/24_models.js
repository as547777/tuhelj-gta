/* ===================== 3D model packs (models/*.js): people, animations, vehicles, weapons =====================
   Ljudi i animacije: Microsoft Rocketbox (MIT) · auti i puške: Quaternius (CC0) · traktor: Kenney Car Kit (CC0)
   Paketi su obične skripte (TUHELJ_PACK(...)), pa rade i na Netlifyju i kad se index.html otvori dvoklikom. */
const MODELS={packs:{},gltf:{},wait:{},failed:{},prom:{}};
window.TUHELJ_PACK=function(name,data){ MODELS.packs[name]=data; const w=MODELS.wait[name]; if(w){ delete MODELS.wait[name]; w.res(data); } };
function packURL(n){ return (window.TUHELJ_MODELS_BASE||'models/')+n+'.js'+(window.TUHELJ_PACK_V?'?v='+window.TUHELJ_PACK_V:''); }
function loadPackScript(n){ if(MODELS.packs[n]) return Promise.resolve(MODELS.packs[n]); if(MODELS.wait[n]) return MODELS.wait[n].p;
  let res,rej; const p=new Promise((a,b)=>{ res=a; rej=b; }); MODELS.wait[n]={p,res,rej};
  const s=document.createElement('script'); s.src=packURL(n); s.async=true; s.onerror=()=>{ delete MODELS.wait[n]; MODELS.failed[n]=true; rej(new Error('nema paketa modela: '+n)); }; document.head.appendChild(s); return p; }
function b64buf(s){ const bin=atob(s); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u.buffer; }
let GLTFL=null; function gltfL(){ if(!GLTFL){ GLTFL=new THREE.GLTFLoader(); if(THREE.MeshoptDecoder) GLTFL.setMeshoptDecoder(THREE.MeshoptDecoder); } return GLTFL; }
function parseGLB(s){ return new Promise((res,rej)=>{ try{ gltfL().parse(b64buf(s),'',res,rej); }catch(e){ rej(e); } }); }
function loadModelPack(n){ if(MODELS.prom[n]) return MODELS.prom[n];
  MODELS.prom[n]=(async()=>{ if(!THREE.GLTFLoader) throw new Error('GLTFLoader nije učitan'); const P=await loadPackScript(n); const out={};
    for(const k of Object.keys(P.files||{})){ try{ out[k]=await parseGLB(P.files[k]); }catch(e){ console.warn('model '+k,e); } P.files[k]=null; }
    MODELS.gltf[n]=out; return out; })();
  MODELS.prom[n].catch(e=>console.warn(e.message)); return MODELS.prom[n]; }
function waitPack(n,ms){ return Promise.race([loadModelPack(n).catch(()=>null),new Promise(r=>setTimeout(()=>r(null),ms))]); }
function peoplePack(){ return GAME.touch?'people_m':'people'; }
function startModelPacks(){ for(const n of ['vehicles','weapons','anims',peoplePack()]) loadModelPack(n); }
function f32attr(a){ const n=a.count, s=a.itemSize, o=new Float32Array(n*s); for(let i=0;i<n;i++){ o[i*s]=a.getX(i); if(s>1) o[i*s+1]=a.getY(i); if(s>2) o[i*s+2]=a.getZ(i); if(s>3) o[i*s+3]=a.getW(i); } return new THREE.BufferAttribute(o,s); }
/* geometry of a glTF mesh baked into the car frame (+X naprijed, +Y gore, +Z desno, metri) */
function bakeGeo(o,M){ const src=o.geometry, g=new THREE.BufferGeometry(); for(const k of ['position','normal','uv']) if(src.attributes[k]) g.setAttribute(k,f32attr(src.attributes[k])); if(src.index) g.setIndex(Array.from(src.index.array));
  g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(M,o.matrixWorld)); if(!g.attributes.normal) g.computeVertexNormals(); return g; }

/* ---------- realistic cars: Quaternius Realistic Car Pack ---------- */
const QCAR={ready:false,m:{},mc:{}};
const QTYPE={hatch:'NormalCar2',sedan:'NormalCar1',suv:'SUV',troc:'SUV',sport:'SportsCar',sport2:'SportsCar2',taxi:'Taxi',police:'Cop'};
const QSCALE=1.12, QFIXED={Taxi:1,Cop:1};
function qcls(n){ n=String(n||''); if(/^Windows/i.test(n)) return 'glass'; if(/^(Head|White)Lights?/i.test(n)) return 'head'; if(/^TailLights?/i.test(n)) return 'tail'; if(/^BlueLights?/i.test(n)) return 'blue'; if(/^(Black|Grey|Gray)/i.test(n)) return 'misc'; return 'paint'; }
function prepVehicles(){ if(QCAR.ready) return true; const V=MODELS.gltf.vehicles; if(!V) return false; const s=0.01*QSCALE;
  const M=new THREE.Matrix4().set(0,s,0,0, 0,0,s,0, s,0,0,0, 0,0,0,1);
  for(const name of ['NormalCar1','NormalCar2','SUV','SportsCar','SportsCar2','Taxi','Cop']){ const G=V[name]; if(!G) continue; G.scene.updateMatrixWorld(true); const parts=[], wg={};
    G.scene.traverse(o=>{ if(!o.isMesh) return; const nm=(o.name||'')+' '+((o.parent&&o.parent.name)||''); const wm=nm.match(/(Front(?:Left|Right)Wheel|BackWheels)/); const mn=o.material&&o.material.name;
      const p={geo:bakeGeo(o,M),cls:qcls(mn),color:o.material&&o.material.color?o.material.color.clone():new THREE.Color(0x222222),mn,tris:(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3};
      if(wm){ (wg[wm[1]]=wg[wm[1]]||[]).push(p); } else parts.push(p); });
    const bb=new THREE.Box3(), tb=new THREE.Box3(); for(const p of parts){ p.geo.computeBoundingBox(); bb.union(p.geo.boundingBox); }
    const wl=Object.entries(wg); for(const [,ps] of wl) for(const p of ps){ p.geo.computeBoundingBox(); tb.union(p.geo.boundingBox); bb.union(p.geo.boundingBox); }
    const off=new THREE.Vector3(-(bb.min.x+bb.max.x)/2,-tb.min.y,-(bb.min.z+bb.max.z)/2); for(const p of parts) p.geo.translate(off.x,off.y,off.z);
    const wheels=[]; for(const [wn,ps] of wl){ const b=new THREE.Box3(); for(const p of ps){ p.geo.translate(off.x,off.y,off.z); p.geo.computeBoundingBox(); b.union(p.geo.boundingBox); } const c=b.getCenter(new THREE.Vector3()); for(const p of ps) p.geo.translate(-c.x,-c.y,-c.z); wheels.push({name:wn,c,parts:ps,front:/Front/.test(wn),r:(b.max.y-b.min.y)/2}); }
    // paint: the biggest non-standard material is the body colour; a second one (DarkOrange) becomes a darker shade
    const paintMats=[...new Set(parts.filter(p=>p.cls==='paint').map(p=>p.mn))]; const area=m=>parts.filter(p=>p.mn===m).reduce((a,p)=>a+p.tris,0); paintMats.sort((a,b)=>area(b)-area(a));
    for(const p of parts){ p.k=p.cls==='paint'?(p.mn===paintMats[0]?1:0.72):1; if(QFIXED[name]&&p.cls==='paint'){ p.cls='misc'; }
      if(name==='Cop'&&/^Black/i.test(p.mn||'')){ p.color=new THREE.Color('#15306e'); } }   // hrvatska policija: plavo-bijela
    const fr=wheels.filter(w=>w.front), bk=wheels.find(w=>!w.front)||wheels[0]; const fx=fr.length?fr[0].c.x:1.3;
    const size=bb.getSize(new THREE.Vector3());
    QCAR.m[name]={parts,wheels,len:size.x,wid:size.z,h:bb.max.y-tb.min.y,wb:fx-(bk?bk.c.x:-1.3),track:fr.length>1?Math.abs(fr[0].c.z-fr[1].c.z):size.z-0.3,r:bk?bk.r:0.32,fixed:!!QFIXED[name]}; }
  QCAR.ready=Object.keys(QCAR.m).length>0; return QCAR.ready; }
function qmat(cls,color){ const key=cls+':'+color.getHexString(); if(QCAR.mc[key]) return QCAR.mc[key]; const M=carMats(); let m;
  if(cls==='glass') m=M.glass; else if(cls==='head') m=M.head; else if(cls==='tail') m=M.tail;
  else if(cls==='blue') m=new THREE.MeshStandardMaterial({color:0x2a5cff,emissive:0x0b2ea8,emissiveIntensity:0.7,roughness:0.3});
  else m=new THREE.MeshStandardMaterial({color,roughness:0.62,metalness:0.25});
  return QCAR.mc[key]=m; }
function makeQCar(type,color){ if(!QCAR.ready&&!prepVehicles()) return null; const Q=QCAR.m[QTYPE[type]]; if(!Q) return null; const g=new THREE.Group();
  const paint=new THREE.MeshStandardMaterial({color:new THREE.Color(color),metalness:0.55,roughness:0.3,envMapIntensity:1.2}); let paint2=null;
  const mk=(geo,mat,par)=>{ const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true; (par||g).add(m); return m; };
  for(const p of Q.parts){ let mat; if(p.cls==='paint'){ if(p.k<1){ if(!paint2){ paint2=paint.clone(); paint2.color.multiplyScalar(0.72); } mat=paint2; } else mat=paint; } else mat=qmat(p.cls,p.color); mk(p.geo,mat); }
  const wheels=[]; for(const W of Q.wheels){ const w=new THREE.Group(); w.position.copy(W.c); const spin=new THREE.Group(); w.add(spin); for(const p of W.parts) mk(p.geo,qmat(p.cls==='paint'?'misc':p.cls,p.color),spin); g.add(w); wheels.push({w,spin,front:W.front}); }
  return {group:g,wheels,wb:Q.wb,track:Q.track,len:Q.len,wid:Q.wid,r:Q.r,paint,col:color,halfL:Q.len/2,roofY:Q.h,seatY:Math.min(-0.33,Q.h-1.92),glb:QTYPE[type]}; }
/* parked cars: merged into the big static meshes of buildCars (one draw call per material for the whole village) */
function appendQCarStatic(G,type,m4,C){ if(!QCAR.ready&&!prepVehicles()) return null; const Q=QCAR.m[QTYPE[type]]; if(!Q) return null; if(!G.qmisc) G.qmisc=new GB();
  const put=(p,M4,forceMisc)=>{ const cls=forceMisc&&p.cls==='paint'?'misc':p.cls;
    if(cls==='paint') gbAppend(G.paint,p.geo,M4,p.k<1?C.clone().multiplyScalar(0.72):C); else if(cls==='glass') gbAppend(G.glass,p.geo,M4,WHITE); else if(cls==='head') gbAppend(G.head,p.geo,M4,WHITE); else if(cls==='tail') gbAppend(G.tail,p.geo,M4,WHITE); else gbAppend(G.qmisc,p.geo,M4,p.color); };
  for(const p of Q.parts) put(p,m4,false);
  for(const W of Q.wheels){ const wm=m4.clone().multiply(new THREE.Matrix4().makeTranslation(W.c.x,W.c.y,W.c.z)); for(const p of W.parts) put(p,wm,true); }
  return Q; }

/* ---------- traktor (Kenney Car Kit, CC0) — Zagorje bez traktora ne ide ---------- */
function makeTractor(){ const V=MODELS.gltf.vehicles; const G=V&&V.tractor; if(!G){ const f=makeCarGroup('suv','#3f7a2e'); return Object.assign(f,{label:'Traktor',tractor:true,phys:{maxV:10.5,rev:-4,acc:3.0,brake:9,maxSteer:0.6,sv:6}}); } const S=1.7; const M=new THREE.Matrix4().set(0,0,S,0, 0,S,0,0, -S,0,0,0, 0,0,0,1);
  G.scene.updateMatrixWorld(true); const g=new THREE.Group(); const wheels=[]; const body=[]; const wl=[];
  G.scene.traverse(o=>{ if(!o.isMesh) return; const nm=(o.name||'')+' '+((o.parent&&o.parent.name)||''); const geo=bakeGeo(o,M); const mat=o.material; if(mat){ mat.roughness=0.75; mat.metalness=0.05; } if(/wheel/i.test(nm)) wl.push({geo,mat,front:/front/i.test(nm)}); else body.push({geo,mat}); });
  const bb=new THREE.Box3(); for(const p of body.concat(wl)){ p.geo.computeBoundingBox(); bb.union(p.geo.boundingBox); } const off=new THREE.Vector3(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2);
  for(const p of body){ p.geo.translate(off.x,off.y,off.z); const m=new THREE.Mesh(p.geo,p.mat); m.castShadow=true; m.receiveShadow=true; g.add(m); }
  let rr=0.5, fx=1.2, bx=-1.0, tz=1.6; for(const p of wl){ p.geo.translate(off.x,off.y,off.z); p.geo.computeBoundingBox(); const c=p.geo.boundingBox.getCenter(new THREE.Vector3()); p.geo.translate(-c.x,-c.y,-c.z);
    const w=new THREE.Group(); w.position.copy(c); const spin=new THREE.Group(); w.add(spin); const m=new THREE.Mesh(p.geo,p.mat); m.castShadow=true; spin.add(m); g.add(w); wheels.push({w,spin,front:p.front});
    if(p.front) fx=c.x; else { bx=c.x; rr=(p.geo.boundingBox.max.y-p.geo.boundingBox.min.y)/2; tz=Math.abs(c.z)*2; } }
  const size=bb.getSize(new THREE.Vector3());
  return {group:g,wheels,wb:fx-bx,track:tz,len:size.x,wid:size.z,r:rr,paint:null,col:'#3f7a2e',halfL:size.x/2,label:'Traktor',tractor:true,roofY:size.y,seatY:0.25,eyeH:2.05,phys:{maxV:10.5,rev:-4,acc:3.0,brake:9,maxSteer:0.6,sv:6}}; }
function placeTractors(scene){ const near=(b)=>Math.hypot(b.rect[0]-START.x,b.rect[1]-START.z);
  const cand=BLD.filter(b=>b.rect&&(b.k==='barn'||b.k==='shed'||b.k==='garage')).sort((a,b)=>near(a)-near(b)); let n=0;
  const tryAt=(x,z,yaw)=>{ if(BHASH.hit(x,z,2.2)||!roadClear(x,z,1.2)) return false; const v=makeTractor(); if(!v) return false; placeVehicle(scene,v,x,z,yaw); n++; return true; };
  for(const [dx,dz] of [[9,-7],[-8,9],[12,8],[-12,-6]]){ if(tryAt(START.x+dx,START.z+dz,1.2)) break; }
  for(const b of cand){ if(n>=4) break; const [cx,cz,a,L,W]=b.rect; const c=Math.cos(a), s=Math.sin(a);
    for(const [u,w] of [[L/2+3.4,0],[-L/2-3.4,0],[0,W/2+3.4],[0,-W/2-3.4]]){ const x=cx+c*u-s*w, z=cz+s*u+c*w; if(tryAt(x,z,-a)) break; } } }

/* ---------- puške (Quaternius Animated FPS Guns, CC0) ---------- */
const GUNFIT={Rifle:[0,-0.03,0],P90:[0,-0.012,0],SniperRifle:[0,-0.04,0],Pistol:[0,-0.02,0],Shotgun:[0,-0.03,0]};
function upgradeGuns(){ const W=MODELS.gltf.weapons; if(!W||typeof RIFLE==='undefined'||!RIFLE) return false; if(!WMODELS&&typeof buildWeaponModels==='function') buildWeaponModels(); if(!WMODELS) return false;
  [['Rifle',0],['P90',1],['SniperRifle',2],['Pistol',4],['Shotgun',5]].forEach(([k,i])=>{ const G=W[k], grp=WMODELS[i]; if(!G||!grp||grp.userData.glb) return; const fl=grp.userData.flash;
    for(const c of grp.children) if(c!==fl&&c.isMesh) c.visible=false;
    let m=G.scene.clone(true); if(k==='Pistol'){ const w=new THREE.Group(); m.rotation.y=-Math.PI/2; w.add(m); m=w; }
    m.traverse(o=>{ if(o.isMesh){ o.renderOrder=10; o.frustumCulled=false; o.castShadow=false; if(typeof gunMaterial==='function'&&o.material&&!o.material.userData.gunfix) o.material=gunMaterial(o.material); } });
    const b=new THREE.Box3().setFromObject(m); const f=GUNFIT[k]||[0,0,0]; const fz=fl?fl.position.z:-0.6; m.position.set(f[0],f[1],fz-b.min.z+0.015+f[2]); grp.add(m); grp.userData.glb=m; });
  return true; }
function upgradeAvatarGun(A){ const W=MODELS.gltf.weapons; if(!W||!W.Rifle||!A||!A.gun||A.gun.userData.glb) return; for(const c of A.gun.children) if(c.isMesh) c.visible=false; const m=W.Rifle.scene.clone(true); m.position.set(0,-0.5,-0.2); m.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); A.gun.add(m); A.gun.userData.glb=m; }
function modelsTick(){ if(!MODELS.gunsDone&&MODELS.gltf.weapons&&typeof RIFLE!=='undefined'&&RIFLE){ MODELS.gunsDone=upgradeGuns(); } }
