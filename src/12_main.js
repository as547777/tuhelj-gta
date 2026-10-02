/* ===================== main ===================== */
const GAME={perf:{ema:16,t:0},basePR:1,started:false,paused:false,time:0,hour:16.5,q:1,touch:('ontouchstart' in window)&&matchMedia('(pointer:coarse)').matches,dragLook:false};
const START={x:-395,z:6,look:[-300,-2]};
const GRASSN=[16000,34000,60000];
function detectQuality(){ return 2; } // always the highest quality
function setQuality(q){ GAME.q=q; const r=GAME.renderer; r.setPixelRatio(q===0?Math.min(devicePixelRatio,1)*0.85:q===1?Math.min(devicePixelRatio,1.25):Math.min(devicePixelRatio,GAME.touch?1.8:1.75)); r.setSize(innerWidth,innerHeight);
  GAME.basePR=r.getPixelRatio(); SKY.setShadowQuality(q); { const mts=Math.min(r.capabilities.maxTextureSize||4096,GAME.ios?2048:8192); if(SKY.sun.shadow.mapSize.x>mts){ SKY.sun.shadow.mapSize.set(mts,mts); } } if(q>=1) setupPost(r); else { disposePost(); POST.enabled=false; } if(VEG.grass) VEG.grass.geometry.instanceCount=GRASSN[q]; for(const m of VEG.far){ m.count=Math.max(1,Math.floor(m.userData.full*[0.6,0.85,1][q])); } VEG.uniforms.uLodR.value=[80,110,145][q]; VEG.lastRebuild.set(1e9,0,1e9); }
async function main(){
  setTimeout(()=>{ try{ startModelPacks(); }catch(e){ console.warn('modeli',e); } },0);
  const step=async(f,l)=>{ UI.progress(f,l); await yieldFrame(); await yieldFrame(); };
  try{ await Promise.race([Promise.all([document.fonts.load('800 64px Manrope'),document.fonts.load('600 32px Manrope'),document.fonts.load('400 64px "Instrument Serif"')]),new Promise(r=>setTimeout(r,2500))]); }catch(e){}
  if(GAME.touch) document.body.classList.add('touch');
  GAME.ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false}); document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
  { const el=document.documentElement; const canFS=!!(el.requestFullscreen||el.webkitRequestFullscreen); if(!canFS){ const tf=document.getElementById('tfs'); if(tf) tf.style.display='none'; const fb=document.getElementById('fsbtn'); if(fb) fb.style.display='none'; }
    if(GAME.ios && !navigator.standalone){ const th=document.querySelector('.touchhelp'); if(th) th.innerHTML='<b>iPhone:</b> za cijeli zaslon dodirni Podijeli → „Dodaj na početni zaslon” i pokreni ikonu. '+th.innerHTML; } }
  const q=detectQuality(); GAME.q=q;
  document.querySelectorAll('[data-q]').forEach(x=>x.classList.toggle('sel',+x.dataset.q===q));
  const renderer=new THREE.WebGLRenderer({antialias:!GAME.touch,powerPreference:'high-performance',stencil:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.92;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.setSize(innerWidth,innerHeight); $('view').appendChild(renderer.domElement);
  ANISO=Math.min(8,renderer.capabilities.getMaxAnisotropy()); GAME.renderer=renderer;
  const scene=new THREE.Scene(); GAME.scene=scene; const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,0.15,7000); GAME.camera=camera;
  await step(0.03,'Učitavam teren…'); decodeHeights();
  { const cb=D.bld.find(b=>b.k==='cafe'); if(cb&&cb.r.length===1){ const r=cb.r[0]; const c=Math.cos(r[2]), sn=Math.sin(r[2]); const lx=7.0, lz=-5.1; cb.r.push([r[0]+c*lx-sn*lz, r[1]+sn*lx+c*lz, r[2], 7.4, 2.6, r[5]]); } }
  photoTerrain(); photoLand(); gradeRoads(); flattenSites();
  await step(0.08,'Izrađujem teksture…'); buildTextures(); photoTextures(); buildWindowAtlas();
  await step(0.16,'Crtam polja i livade…'); paintGround(GAME.ios?3072:(q>=2?4096:3072));
  await step(0.26,'Postavljam kuće…'); prepBuildings();
  await step(0.30,'Asfaltiram ceste…'); buildRoads(scene);
  await step(0.38,'Gradim crkvu i kuće…');
  const cs=new ChunkSet(420); const HM=Object.assign(heroMaterials(),pubMaterials()); emitLandmarks(cs,scene); try{ photoHouse(cs,scene); }catch(e){ console.warn('kuća',e); } try{ photoCentre(cs,scene); }catch(e){ console.warn('centar',e); } RNG=mulberry32(90210);
  const special=new Set(['church','fire','townhall','chapel','school','shrine','tank','shop','cafe','parish','apt']);
  let i=0; for(const b of BLD){ if(special.has(b.k)||b.st) continue; if(b.k==='garage'||b.k==='shed'||b.k==='barn') emitOutbuilding(cs,b); else emitHouse(cs,b); if(++i%120===0){ UI.progress(0.38+0.14*i/BLD.length); await yieldFrame(); } }
  const pm=propMats(); const bm=Object.assign({},pm,HM,{brick:new THREE.MeshStandardMaterial({map:TEX.brick,vertexColors:true,roughness:0.95}),plinth:new THREE.MeshStandardMaterial({map:TEX.stone,vertexColors:true,roughness:0.95}),gold:new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.9,roughness:0.3}),metal:new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.55,roughness:0.4})}); addNormalMaps(bm);
  GAME.bm=bm; for(const m of cs.meshes(bm,{cast:k=>k!=='win'&&k!=='glassW'&&k!=='leaded'&&k!=='stain'&&k!=='glow'&&k!=='mural'&&k!=='floorT'})) scene.add(m);
  await step(0.54,'Uređujem dvorišta…'); paintYards(BLD); paintAprons(BLD); 
  await step(0.58,'Postavljam stupove i ograde…'); buildProps(scene,q); try{ await waitPack('vehicles',7000); prepVehicles(); }catch(e){ console.warn('vozila',e); } buildCars(scene); buildCourts(scene);
  finishGround();
  await step(0.66,'Oblikujem brežuljke…'); const tmat=makeTerrainMaterial(); for(const m of buildTerrainMeshes(tmat)) scene.add(m);
  await step(0.72,'Sadim šume i voćnjake…'); placeTrees(); try{ photoTrees(); }catch(e){ console.warn(e); }
  await step(0.8,'Sadim stabla…'); buildTrees(scene,q); buildCorn(scene); try{ photoWillows(scene); }catch(e){ console.warn(e); }
  await step(0.88,'Kosim travu…'); buildGrass(scene,GRASSN[2],30); VEG.grass.geometry.instanceCount=GRASSN[q];
  await step(0.92,'Palim sunce…'); buildSky(scene); SKY.setShadowQuality(q); setTimeOfDay(renderer,scene,GAME.hour); buildWater(scene);
  await step(0.96,'Crtam kartu…'); buildMapCanvas(); setupMap(); setupMenus();
  setupInput(renderer.domElement,onLock); scene.add(camera); buildViewModels(); buildDrinkMenu(); pkSetup(); renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;
  renderer.domElement.addEventListener('mousedown',e=>{ if(GAME.started && !document.pointerLockElement && !GAME.touch && !GAME.dragLook && !UI.mapOpen && !GAME.paused) renderer.domElement.requestPointerLock(); });
  document.addEventListener('pointerlockerror',()=>{ GAME.dragLook=true; PLAYER.enabled=true; $('pause').classList.remove('on'); GAME.paused=false; UI.toast('Drži lijevu tipku miša i povuci za pogled'); });
  let drag=null; renderer.domElement.addEventListener('pointerdown',e=>{ if((GAME.dragLook||PKC.sit) && e.pointerType==='mouse') drag={x:e.clientX,y:e.clientY}; });
  addEventListener('pointerup',()=>drag=null);
  addEventListener('pointermove',e=>{ if(!drag) return; if(PKC.sit){ PKC.lookY=clamp((PKC.lookY||0)-(e.clientX-drag.x)*0.004,-2.7,2.7); PKC.lookP=clamp((PKC.lookP||0)-(e.clientY-drag.y)*0.003,-0.5,0.7); } else if(PLAYER.driving){ CARCAM.orbit-=(e.clientX-drag.x)*0.005; CARCAM.pitch=clamp(CARCAM.pitch+(e.clientY-drag.y)*0.003,-0.1,0.6); CARCAM.t=0; } else { PLAYER.yaw-=(e.clientX-drag.x)*0.004; PLAYER.pitch=clamp(PLAYER.pitch-(e.clientY-drag.y)*0.004,-1.45,1.45); } drag.x=e.clientX; drag.y=e.clientY; });
  addEventListener('keydown',e=>{ if(e.code==='Escape' && GAME.dragLook && GAME.started){ togglePause(!GAME.paused); } });
  const onResize=()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); if(POST.enabled) setupPost(renderer); updateRotate(); };
  addEventListener('resize',onResize); addEventListener('orientationchange',()=>setTimeout(onResize,300)); document.addEventListener('fullscreenchange',()=>{ setTimeout(onResize,150); updateFsLabel(); }); document.addEventListener('webkitfullscreenchange',()=>{ setTimeout(onResize,150); updateFsLabel(); });
  setQuality(q);
  teleport(START.x,START.z,START.look[0],START.look[1]);
  // warm up shaders
  renderer.compile(scene,camera);
  UI.progress(1,'Spremno'); $('go').disabled=false; $('go').textContent=goLabel(); $('start').classList.add('ready'); try{ lookInit(); }catch(e){ console.warn(e); }
  let last=performance.now(), fr=0;
  GAME.frame=(t)=>{ const dt=Math.max(0,Math.min(0.05,(t-last)/1000)); last=Math.max(last,t); GAME.time+=dt; fr++;
    // a page loaded in a hidden tab/pane starts with a 0x0 window -> aspect NaN and a black screen; fix it as soon as the window has a size
    if(innerHeight>0 && !(Math.abs(camera.aspect-innerWidth/innerHeight)<1e-3)) onResize();
    if(GAME.started){ if(!GAME.paused){ if(PLAYER.heli) heliTick(dt); else if(PLAYER.driving) updateDriving(dt); else if(PLAYER.riding) updateRiding(dt); else updatePlayer(dt); } if(PLAYER.heli) heliCamera(camera,dt); else if(PLAYER.driving||PLAYER.riding) carCamera(camera,dt); else if(PKC.sit) pkCamera(camera); else applyCamera(camera);
      if(fr%6===0){ const inCar=PLAYER.driving||PLAYER.riding; const nv=(!inCar&&!GAME.paused)?nearestVehicle(PLAYER.pos.x,PLAYER.pos.z,3.4,true):null; GAME.nearCar=nv; const cb=document.getElementById('carbtn'); if(cb){ cb.classList.toggle('on',!!nv); const sp=cb.querySelector('span'); if(sp) sp.textContent=nv&&nv.remote?'Sjedni':'Vozi'; } const pr=document.getElementById('prompt'); if(pr){ const gg=giverNear(); const txt=GTA.dlg?'':PLAYER.heli?'E — izađi iz helikoptera (na tlu)':gg?'E — misija: '+gg.title:nearHeli()?'E — uđi u helikopter':intPrompt()?'E — '+intPrompt():(!PLAYER.driving&&nearPt(HOME_POS(),4))?(GTA.home?'E — odmori se kod kuće':'E — kupi stan Kod Ruže (800 €)'):PLAYER.driving?'E — izađi iz auta · V — pogled iz auta':PLAYER.riding?'E — izađi (suvozač) · V — pogled':(nv?(nv.remote?'E — sjedni kao suvozač':(nv.truck?'E — uđi u vatrogasno vozilo':nv.bike?'E — sjedni na bicikl':nv.label?'E — uđi u '+nv.label:'E — uđi u auto')):(nearValentina()?'E — naruči kod Valentine':nearBar()?'E — naruči piće na šanku':(nearPoker()?'E — sjedni za poker':(LANDMARKS.churchDoor&&Math.hypot(PLAYER.pos.x-LANDMARKS.churchDoor.x,PLAYER.pos.z-LANDMARKS.churchDoor.z)<7?'Crkva je otvorena — samo uđi ⛪':'')))); if(pr.dataset.t!==txt){ pr.dataset.t=txt; pr.innerHTML=promptHTML(txt); } pr.classList.toggle('on',!!txt); } }
      netTick(dt); occupantTick(); npcTick(dt); lifeTick(dt); gtaTick(dt); gta2Tick(dt); owTick(dt); modelsTick(); combatTick(dt); weaponTick(dt); tpsTick(dt); pokerTick(dt); try{ intTick(dt); }catch(e){ console.warn(e); } try{ lawTick(dt); }catch(e){ console.warn('law',e); } try{ homeTick(dt); storyTick(dt); voicesTick(dt); }catch(e){ console.warn('story',e); } humansTick(dt); tpsLate(); try{ lawLate(); }catch(e){ console.warn('lawLate',e); } if(COMBAT.hold&&COMBAT.armed) fireGun(); }
    else { startCam(camera,dt); lookTick(dt); }
    const cp=GAME.started?PLAYER.pos:camera.position; VEG.uniforms.uPlayer.value.set(cp.x,cp.y,cp.z); VEG.uniforms.uTime.value=GAME.time; SKY.uni.uTime.value=GAME.time;
    if(Math.hypot(cp.x-VEG.lastRebuild.x,cp.z-VEG.lastRebuild.z)>((PLAYER.driving||PLAYER.riding)?38:14)) rebuildNearTrees(cp.x,cp.z);
    if(fr%2===0||!GAME.started){ updateSun(new THREE.Vector3(cp.x,getHeight(cp.x,cp.z),cp.z)); renderer.shadowMap.needsUpdate=true; } SKY.mesh.position.copy(camera.position);
    TEX.waterN.offset.set(GAME.time*0.012,GAME.time*0.03);
    renderFrame(renderer,scene,camera);
    if(GAME.started){ UI.updateHUD(dt); if(fr%4===0) UI.drawMini(); if(UI.mapOpen && fr%6===0) drawMap(); }
    { const P2=GAME.perf; const ft=dt*1000; P2.ema=P2.ema*0.94+ft*0.06; P2.t+=dt; if(GAME.started && P2.t>2.0){ P2.t=0; const cur=renderer.getPixelRatio(); const minPR=GAME.touch?Math.min(GAME.basePR,1.5):0.8; let np=cur; if(P2.ema>30 && cur>minPR+0.01) np=Math.max(minPR,cur-0.1); else if(P2.ema<17 && cur<GAME.basePR-0.01) np=Math.min(GAME.basePR,cur+0.1); if(Math.abs(np-cur)>0.01){ renderer.setPixelRatio(np); renderer.setSize(innerWidth,innerHeight); if(POST.enabled) setupPost(renderer); } } }
  };
  const loop=(t)=>{ requestAnimationFrame(loop); GAME.frame(t); };
  if(!window.__NOLOOP) requestAnimationFrame(loop);
}
function fsElement(){ return document.fullscreenElement||document.webkitFullscreenElement||null; }
function goFullscreen(){ const el=document.documentElement; const req=el.requestFullscreen||el.webkitRequestFullscreen; if(!req||fsElement()) return Promise.resolve(); try{ const p=req.call(el,{navigationUI:'hide'}); return (p&&p.then?p:Promise.resolve()).then(()=>{ if(GAME.touch && screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').catch(()=>{}); }).catch(()=>{}); }catch(e){ return Promise.resolve(); } }
function exitFullscreen(){ const ex=document.exitFullscreen||document.webkitExitFullscreen; if(ex&&fsElement()) try{ ex.call(document); }catch(e){} }
function toggleFullscreen(){ if(fsElement()){ GAME.wantFS=false; exitFullscreen(); } else { GAME.wantFS=true; goFullscreen(); } }
function updateFsLabel(){ const b=document.getElementById('fsbtn'); if(b) b.textContent=fsElement()?'Izađi iz cijelog zaslona':'Cijeli zaslon'; }
function updateRotate(){ const el=document.getElementById('rotate'); if(!el) return; el.classList.toggle('on',!!(GAME.touch && GAME.started && innerHeight>innerWidth*1.05 && !GAME.allowPortrait)); }
function startGame(){ GAME.started=true; GAME.wantFS=true; { const pn=document.getElementById('pname'); const nm=pn?pn.value:''; try{ localStorage.setItem('tuhelj_name',nm); }catch(e){} if(pn) pn.blur(); netStart(nm); } $('start').classList.add('gone'); $('hud').classList.add('on'); { const hd=typeof houseDoor==='function'&&houseDoor(); if(hd) teleport(hd[0],hd[1],-326,-5); else teleport(START.x,START.z,START.look[0],START.look[1]); } PLAYER.enabled=true;
  if(GAME.touch){ $('touchui').classList.add('on'); goFullscreen(); setTimeout(updateRotate,400); } else { try{ const p=GAME.renderer.domElement.requestPointerLock(); if(p&&p.catch) p.catch(()=>{ GAME.dragLook=true; UI.toast('Drži lijevu tipku miša i povuci za pogled'); }); }catch(e){ GAME.dragLook=true; } }
  if(!GAME.touch) goFullscreen(); updateRotate();
  UI.toast(GAME.touch?'Krug lijevo — hodanje · čovječuljak — trčanje':'WASD hodanje · Shift trčanje · M karta'); }
function resumeGame(){ GAME.paused=false; $('pause').classList.remove('on'); PLAYER.enabled=true; if(GAME.wantFS && !fsElement()) goFullscreen(); if(!GAME.touch && !GAME.dragLook){ try{ const p=GAME.renderer.domElement.requestPointerLock(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} } }
function togglePause(on){ GAME.paused=on; PLAYER.enabled=!on; $('pause').classList.toggle('on',on); }
function onLock(locked){ if(locked){ GAME.paused=false; if(!COMBAT.menuOpen) PLAYER.enabled=true; $('pause').classList.remove('on'); } else if(GAME.started && !UI.mapOpen && !GAME.dragLook && !COMBAT.menuOpen){ togglePause(true); } }
main().catch(e=>{ console.error(e); UI.progress(1,'Greška: '+e.message); });
