/* ===================== ulazak u zgrade: trgovine, DVD, općina (prostorije kao u GTA-u) =====================
   Vrata su na stvarnim zgradama s OpenStreetMap karte Tuhlja: Trgovina PZ Tuhelj, Strahinjčica,
   Vatrogasni dom (DVD Tuhelj) i Općina Tuhelj. Ulaz: tipka E ili gumb na mobitelu. Uvijek je otvoreno. */
const INTS=[]; let INSIDE=null; const INT_PEOPLE=[];
function intInit(){ if(INTS.length||typeof LANDMARKS==='undefined'||!LANDMARKS.church) return;
  INTS.push({id:'pz',name:'Trgovina PZ Tuhelj',ico:'🛒',door:()=>SHOP_POS(),r:3.5,room:SHOPIN,spawn:[0,3.8],look:[0,0],
    build(){ buildShopInterior(); intCeil(SHOPIN.x,SHOPIN.z,SHOPIN.y+3.095,6,5,0xdedcd4); const A=SHOPIN.cashier; if(A&&!INT_PEOPLE.includes(A)){ A.rbKey='Female_Adult_01'; INT_PEOPLE.push(A); } },
    spots:[{x:2.6,z:2.9,r:1.6,t:'🛒 Kupi na blagajni',fn:()=>openShop()},{x:0,z:4.6,r:1.3,t:'🚪 Izađi van',fn:()=>intExit()}],
    hello(){ if(SHOPIN.cashier) bubble(SHOPIN.cashier,'Dobar dan! Izvolite?',4); }});
  const sd=(LANDMARKS.shopDoors||[]).find(d=>/strahinj/i.test(d.n||''));
  if(sd) INTS.push({id:'strah',name:'Strahinjčica',ico:'🛒',door:()=>[sd.p[0],sd.p[2]],r:3.4,room:{x:-1390,z:-1450,y:260},spawn:[0,4.3],look:[0,-1],build:buildStrah,
    spots:[{x:3.1,z:2.2,r:1.7,t:'🛒 Kupi na blagajni',fn:()=>openShop()},{x:-4.0,z:-3.3,r:1.6,t:'🥐 Pekarnica — kupi',fn:()=>openShop()},{x:0,z:5.1,r:1.3,t:'🚪 Izađi van',fn:()=>intExit()}],
    hello(){ const A=INTS.find(i=>i.id==='strah').staff; if(A) bubble(A,'Dobar dan, dobrodošli u Strahinjčicu!',4); }});
  if(LANDMARKS.fireDoor) INTS.push({id:'dvd',name:'Vatrogasni dom DVD Tuhelj',ico:'🚒',door:()=>[LANDMARKS.fireDoor[0],LANDMARKS.fireDoor[2]],r:4.5,room:{x:-1330,z:-1450,y:260},spawn:[0,5.2],look:[0,-2],build:buildDVD,
    spots:[{x:0,z:-4.9,r:2.2,t:'🧑‍🚒 Obuci / skini vatrogasnu opremu',fn:dvdGear},{x:4.6,z:0.4,r:1.8,t:'💬 Razgovaraj sa zapovjednikom',fn:dvdTalk},{x:0,z:6.1,r:1.4,t:'🚪 Izađi van',fn:()=>intExit()}],
    hello(){ const A=INTS.find(i=>i.id==='dvd').staff; if(A) bubble(A,LIFE.fire?'Gori! Kamion je u dvorištu, brzo!':'Pozdrav! Dobro došao u vatrogasni dom.',4); }});
  if(LANDMARKS.townhallDoor) INTS.push({id:'opcina',name:'Općina Tuhelj',ico:'🏛️',door:()=>[LANDMARKS.townhallDoor[0],LANDMARKS.townhallDoor[2]],r:3.4,room:{x:-1270,z:-1450,y:260},spawn:[0,4.8],look:[0,-1],build:buildOpcina,
    spots:[{x:-1.2,z:-0.2,r:1.7,t:'🏛️ Šalter — izvolite',fn:opcinaDesk},{x:0,z:5.6,r:1.3,t:'🚪 Izađi van',fn:()=>intExit()}],
    hello(){ const A=INTS.find(i=>i.id==='opcina').staff; if(A) bubble(A,'Dobar dan! Kako vam možemo pomoći?',4); }}); }
function intEnter(I){ try{ blip('door'); }catch(e){} if(!I.built){ I.built=true; try{ I.build(I); }catch(e){ console.warn('prostorija',I.id,e); } }
  INSIDE=I; SHOPIN.inside=I.id==='pz'; I.back=[PLAYER.pos.x,PLAYER.pos.z]; const R=I.room; teleport(R.x+I.spawn[0],R.z+I.spawn[1],R.x+I.look[0],R.z+I.look[1]); PLAYER.pos.y=R.y; PLAYER.vel.set(0,0,0);
  try{ I.hello&&I.hello(); }catch(e){} UI.toast(I.ico+' '+I.name+' — otvoreno'); }
function intExit(){ try{ blip('door'); }catch(e){} const I=INSIDE; INSIDE=null; SHOPIN.inside=false; const b=(I&&I.back)||SHOP_POS(); teleport(b[0],b[1]); }
function intSpot(){ const I=INSIDE; if(!I) return null; const dx=PLAYER.pos.x-I.room.x, dz=PLAYER.pos.z-I.room.z; for(const s of I.spots) if(Math.hypot(dx-s.x,dz-s.z)<s.r) return s; return null; }
function intNearDoor(){ intInit(); if(INSIDE||PLAYER.driving||PLAYER.riding||PLAYER.heli) return null; for(const I of INTS){ const d=I.door(); if(d&&Math.hypot(PLAYER.pos.x-d[0],PLAYER.pos.z-d[1])<I.r) return I; } return null; }
function intUse(){ const s=intSpot(); if(s){ s.fn(); return true; } const I=intNearDoor(); if(I){ intEnter(I); return true; } return false; }
function intPrompt(){ if(INSIDE){ const s=intSpot(); return s?s.t:''; } const I=intNearDoor(); return I?'uđi — '+I.name:''; } /* doors open with E (walking through them made the game hitch) */
function intIcons(){ intInit(); return INTS.filter(I=>I.id!=='pz').map(I=>[I.door(),I.ico]); }
/* ---- building blocks ---- */
const INT_BOX=[]; // room boxes, so the third-person camera stays inside
function intShell(cs,x,z,y,W,D,H,C){ const f=frame(x,z,0,0); INT_BOX.push({x,z,y,W,D,H}); const G=cs.get('wall',x,z), Wd=cs.get('wood',x,z);
  G.box(f,-W,W,y-0.3,y,-D,D,C.floor); G.box(f,-W,W,y+H,y+H+0.2,-D,D,C.ceil);
  G.box(f,-W-0.2,-W,y,y+H,-D,D,C.wall); G.box(f,W,W+0.2,y,y+H,-D,D,C.wall); G.box(f,-W,W,y,y+H,-D-0.2,-D,C.wall);
  G.box(f,-W,-1.0,y,y+H,D,D+0.2,C.wall); G.box(f,1.0,W,y,y+H,D,D+0.2,C.wall); G.box(f,-1.0,1.0,y+2.3,y+H,D,D+0.2,C.wall);
  if(C.stripe) for(const [a,b,c2,d2] of [[-W,W,-D,-D+0.04],[-W,-W+0.04,-D,D],[W-0.04,W,-D,D]]) G.box(f,a,b,y+1.0,y+1.2,c2,d2,C.stripe);
  G.box(f,-W,W,y,y+0.12,-D,-D+0.03,C.skirt||lin('#6b6f73')); Wd.box(f,-1.0,1.0,y,y+2.3,D+0.15,D+0.2,C.door||lin('#6d5a44'));
  addFloor(f,0,-W,W,-D,D,y); addCollider(x-W-0.1,z,0,0.3,2*D,y-1,y+H); addCollider(x+W+0.1,z,0,0.3,2*D,y-1,y+H); addCollider(x,z-D-0.1,0,2*W,0.3,y-1,y+H);
  addCollider(x-(W+1)/2,z+D+0.1,0,W-1,0.3,y-1,y+H); addCollider(x+(W+1)/2,z+D+0.1,0,W-1,0.3,y-1,y+H); intCeil(x,z,y+H-0.005,W,D,C.ceilLit||0xdedcd4); return f; }
function intCeil(x,z,y,W,D,col){ const m=new THREE.Mesh(new THREE.PlaneGeometry(2*W,2*D),new THREE.MeshBasicMaterial({color:col})); m.rotation.x=Math.PI/2; m.position.set(x,y,z); GAME.scene.add(m); return m; }
function intLights(cs,x,z,y,H,W,D){ const f=frame(x,z,0,0), Gl=cs.get('glow',x,z); for(let i=-Math.floor(W/2.4);i<=Math.floor(W/2.4);i++) for(let j=-Math.floor(D/2.6);j<=Math.floor(D/2.6);j++) Gl.box(f,i*2.4-0.5,i*2.4+0.5,y+H-0.04,y+H,j*2.6-0.16,j*2.6+0.16,lin('#fffbe8')); }
const INT_COLS=['#c62828','#f2c318','#1e4fb3','#2e8b3a','#e07a1a','#7b2cbf','#f4f2ea','#8a5a36','#d84a7a','#3aa0c8'];
function intShelf(cs,x,z,y,sx,sz,len,rot,seed){ const Mt=cs.get('metal',x,z), G=cs.get('wall',x,z); const sf=frame(x+sx,z+sz,rot,0); const C=INT_COLS;
  Mt.box(sf,-len/2,len/2,y,y+1.9,-0.025,0.025,lin('#8fa3b3')); for(const ex of [-1,1]) Mt.box(sf,ex*len/2-0.03,ex*len/2+0.03,y,y+1.95,-0.32,0.32,lin('#2a4f86')); Mt.box(sf,-len/2,len/2,y,y+0.12,-0.32,0.32,lin('#2a4f86'));
  for(let lv=0;lv<4;lv++){ const yy=y+0.25+lv*0.45; Mt.box(sf,-len/2,len/2,yy,yy+0.03,-0.32,0.32,lin('#c9cfd4')); for(let k=0;k<Math.floor(len/0.2);k++){ const px=-len/2+0.11+k*0.2; for(const side of [-1,1]){ const h=0.14+((k*7+lv*3+seed+(side>0?1:0))%5)*0.05; const w=0.07+((k+lv+seed)%3)*0.015; G.box(sf,px-w,px+w,yy+0.03,yy+0.03+h,side>0?0.06:-0.27,side>0?0.27:-0.06,lin(C[(k+lv*3+seed+(side>0?2:0))%C.length])); } } }
  addCollider(x+sx,z+sz,rot,len+0.1,0.7,y-1,y+2); }
function intSign(txt,w,h,bg,fg,x,y,z,ry,size){ const c=cvs(1024,Math.round(1024*h/w)), g=c.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,c.width,c.height); g.fillStyle=fg; const L=[].concat(txt); const fs=size||Math.min(c.height*0.62/L.length,1024*1.6/Math.max(...L.map(s=>s.length)));
  g.font='900 '+Math.round(fs)+'px Manrope, Arial'; g.textAlign='center'; g.textBaseline='middle'; L.forEach((s,i)=>g.fillText(s,512,c.height*(i+0.5)/L.length)); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t})); m.position.set(x,y,z); m.rotation.y=ry||0; GAME.scene.add(m); return m; }
function intPerson(name,col,opt,key,x,z,y,face){ const A=makePerson(name,col,opt); A.rbKey=key; A.group.position.set(x,y,z); A.group.rotation.y=face; GAME.scene.add(A.group); INT_PEOPLE.push(A); return A; }
function intMesh(geo,mat,x,y,z,rx,ry,rz){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); m.castShadow=false; GAME.scene.add(m); return m; }
function intFinish(cs){ for(const m of cs.meshes(GAME.bm,{cast:false})) GAME.scene.add(m); }
/* ---- Strahinjčica: supermarket with bakery, fruit & veg, fridges ---- */
function buildStrah(I){ const {x,z,y}=I.room; const cs=new ChunkSet(); const W=6.6, D=5.6, H=3.2; const f=intShell(cs,x,z,y,W,D,H,{floor:lin('#d5d8d4'),wall:lin('#f2f0ea'),ceil:lin('#f7f6f1'),stripe:lin('#1f4e9c')});
  intLights(cs,x,z,y,H,W,D); const G=cs.get('wall',x,z), Wd=cs.get('wood',x,z), Mt=cs.get('metal',x,z), Gl=cs.get('glow',x,z);
  intShelf(cs,x,z,y,-2.4,-0.6,4.2,0,1); intShelf(cs,x,z,y,-2.4,1.8,4.2,0,3); intShelf(cs,x,z,y,1.9,-1.6,3.2,0,5);
  for(let k=0;k<4;k++){ const ff=frame(x+W-0.45,z-4.4+k*1.1,Math.PI/2,0); Mt.box(ff,-0.5,0.5,y,y+2.0,-0.35,0.35,lin('#f4f4f2')); Gl.box(ff,-0.44,0.44,y+0.15,y+1.9,0.34,0.36,lin('#e2f1ff')); for(let lv=0;lv<4;lv++) for(let j=0;j<5;j++) G.box(ff,-0.4+j*0.17,-0.3+j*0.17,y+0.25+lv*0.42,y+0.52+lv*0.42,0.1,0.25,lin(INT_COLS[(j+lv*2+k)%INT_COLS.length])); } addCollider(x+W-0.45,z-2.8,0,0.8,4.5,y-1,y+2.1);
  // bakery counter "PEKARNICA"
  { const bf=frame(x-4.0,z-4.6,0,0); Wd.box(bf,-1.6,1.6,y,y+0.95,-0.45,0.45,lin('#b07a4a')); Gl.box(bf,-1.55,1.55,y+0.95,y+1.4,0.38,0.42,lin('#fff3d6')); for(let i=0;i<9;i++){ const px=-1.4+i*0.35; G.box(bf,px-0.13,px+0.13,y+0.97,y+1.08,-0.3,0.25,lin(i%3===0?'#c98a3c':i%3===1?'#a86a2a':'#d9a45a')); } addCollider(x-4.0,z-4.6,0,3.3,1.0,y-1,y+1.4);
    intSign('PEKARNICA',2.4,0.42,'#8a5a2a','#fff6e0',x-4.0,y+2.35,z-D+0.03,0); }
  // fruit & vegetable crates near the entrance
  for(let i=0;i<4;i++){ const cf=frame(x-4.9+i*0.95,z+3.4,0,0); Wd.box(cf,-0.4,0.4,y,y+0.55,-0.3,0.3,lin('#9c6b3c')); const fc=['#d62f2f','#f28c1b','#e8d23a','#3f9a36'][i]; for(let a=0;a<4;a++) for(let b=0;b<3;b++) G.box(cf,-0.33+a*0.17,-0.2+a*0.17,y+0.55,y+0.66,-0.23+b*0.16,-0.11+b*0.16,lin(fc)); } addCollider(x-3.5,z+3.4,0,3.8,0.7,y-1,y+0.7);
  // checkout
  { const cf=frame(x+3.1,z+1.4,0,0); Wd.box(cf,-1.3,1.3,y,y+0.92,-0.4,0.4,lin('#e8e4dc')); Mt.box(cf,-1.3,0.4,y+0.92,y+0.96,-0.35,0.35,lin('#2a2c30')); Mt.box(cf,0.6,0.95,y+0.96,y+1.26,-0.2,0.1,lin('#1c1f22')); Mt.box(cf,0.62,0.93,y+1.06,y+1.24,0.1,0.12,lin('#57c7ff')); addCollider(x+3.1,z+1.4,0,2.7,0.9,y-1,y+1.1); }
  intSign(['STRAHINJČICA'],3.4,0.62,'#1f4e9c','#ffffff',x+1.6,y+2.55,z-D+0.03,0); intSign(['Dobro došli!'],1.9,0.36,'#ffffff','#1f4e9c',x+3.1,y+2.2,z+D-0.03,Math.PI);
  intFinish(cs); I.staff=intPerson('Prodavačica Ana','#1f4e9c',{female:true,apron:true},'Female_Adult_17',x+3.1,z+0.7,y,faceYaw(0,1));
  intPerson('Baka Jaga','#7a4a6a',{female:true,skirt:0x3a2a3a},'Female_Adult_02',x-2.4,z+0.6,y,faceYaw(-1,0)); }
/* ---- Vatrogasni dom DVD Tuhelj: equipment, hoses, trophies, meeting table ---- */
function buildDVD(I){ const {x,z,y}=I.room; const cs=new ChunkSet(); const W=8, D=6.6, H=4.2; intShell(cs,x,z,y,W,D,H,{floor:lin('#a7aaa6'),wall:lin('#eee7d6'),ceil:lin('#f2efe6'),stripe:lin('#b3121c'),door:lin('#8c1d1d')});
  intLights(cs,x,z,y,H,W,D); const G=cs.get('wall',x,z), Wd=cs.get('wood',x,z), Mt=cs.get('metal',x,z), Gl=cs.get('glow',x,z); const f=frame(x,z,0,0);
  // lockers + hanging fire suits on the back wall
  const helmG=new THREE.SphereGeometry(0.16,14,10,0,TAU,0,Math.PI/2), helmM=new THREE.MeshStandardMaterial({color:0xd8c21a,roughness:0.35,metalness:0.2}), helmR=new THREE.MeshStandardMaterial({color:0xc8161d,roughness:0.35,metalness:0.2});
  for(let i=0;i<8;i++){ const lx=-5.6+i*1.6; Mt.box(f,lx-0.72,lx+0.72,y,y+2.1,-D,-D+0.55,lin('#9aa3ab')); Mt.box(f,lx-0.7,lx+0.7,y+0.05,y+2.05,-D+0.55,-D+0.57,lin(i%2?'#b3121c':'#a01018'));
    G.box(f,lx-0.26,lx+0.26,y+0.9,y+1.75,-D+0.6,-D+0.76,lin('#1c2a4a')); for(const yy of [1.12,1.42]) G.box(f,lx-0.27,lx+0.27,y+yy,y+yy+0.05,-D+0.6,-D+0.77,lin('#f2e03a'));
    intMesh(helmG,i%3===2?helmR:helmM,x+lx,y+2.12,z-D+0.3); G.box(f,lx-0.2,lx-0.04,y,y+0.34,-D+0.6,-D+0.8,lin('#161616')); G.box(f,lx+0.04,lx+0.2,y,y+0.34,-D+0.6,-D+0.8,lin('#161616')); }
  addCollider(x,z-D+0.45,0,2*W,0.9,y-1,y+2.2);
  intSign(['DVD TUHELJ'],4.2,0.7,'#b3121c','#ffffff',x,y+3.2,z-D+0.03,0); intSign(['Bogu na slavu – narodu na pomoć'],4.2,0.32,'#ffffff','#b3121c',x,y+2.62,z-D+0.03,0);
  // hose reels on the left wall
  const hoseG=new THREE.CylinderGeometry(0.26,0.26,0.13,20), hoseM=new THREE.MeshStandardMaterial({color:0xe8e2cf,roughness:0.7}); for(let i=0;i<6;i++){ const hz=-3.8+(i%3)*1.2, hy=y+0.6+Math.floor(i/3)*0.62; intMesh(hoseG,hoseM,x-W+0.18,hy,z+hz,0,0,Math.PI/2); } Mt.box(f,-W,-W+0.36,y,y+0.3,-4.5,-1.0,lin('#555a60'));
  { const ex=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.55,14),new THREE.MeshStandardMaterial({color:0xc8161d,roughness:0.35})); ex.position.set(x+1.5,y+0.3,z+D-0.25); GAME.scene.add(ex); }
  // trophy cabinet (natjecanja!) on the right wall
  Wd.box(f,W-0.5,W,y,y+2.2,-3.6,0.6,lin('#6b4a2c')); Gl.box(f,W-0.52,W-0.5,y+0.3,y+2.1,-3.5,0.5,lin('#fff6df')); for(const yy of [0.75,1.3,1.85]) Wd.box(f,W-0.48,W-0.05,y+yy-0.03,y+yy,-3.5,0.5,lin('#5a3c22'));
  const cupG=new THREE.CylinderGeometry(0.09,0.04,0.26,14), cupM=new THREE.MeshStandardMaterial({color:0xd4a72c,metalness:1,roughness:0.25}); for(let s=0;s<3;s++) for(let i=0;i<5;i++) intMesh(cupG,cupM,x+W-0.28,y+[0.75,1.3,1.85][s]+0.13,z-3.1+i*0.85);
  addCollider(x+W-0.25,z-1.5,0,0.5,4.3,y-1,y+2.2);
  // meeting table with benches
  { const tf=frame(x+1.4,z+0.6,0,0); Wd.box(tf,-2.4,2.4,y+0.72,y+0.78,-0.5,0.5,lin('#9a6b3f')); for(const [a,b] of [[-2.2,-0.4],[2.2,-0.4],[-2.2,0.4],[2.2,0.4]]) Wd.box(tf,a-0.05,a+0.05,y,y+0.72,b-0.05,b+0.05,lin('#7a5230')); for(const s of [-1,1]) Wd.box(tf,-2.3,2.3,y+0.42,y+0.47,s*0.85-0.16,s*0.85+0.16,lin('#8a5f38')); addCollider(x+1.4,z+0.6,0,4.9,2.1,y-1,y+0.8); }
  intFinish(cs); I.staff=intPerson('Zapovjednik DVD-a','#1c2a4a',{},'Fire_Male_01',x+4.6,z-0.4,y,faceYaw(-1,0.4)); }
let DVD_PREV_SKIN=null;
function dvdGear(){ const fi=SKINS.findIndex(s=>s.k==='Fire_Male_01'); if(fi<0) return; if(OW.skin===fi){ OW.skin=DVD_PREV_SKIN!==null?DVD_PREV_SKIN:0; DVD_PREV_SKIN=null; UI.toast('Skinuo si vatrogasnu opremu'); } else { DVD_PREV_SKIN=OW.skin|0; OW.skin=fi; OW.skinSet=true; UI.toast('🧑‍🚒 Obukao si vatrogasnu opremu — kamion je u dvorištu'); } try{ owSave(); }catch(e){} }
function dvdTalk(){ const I=INTS.find(i=>i.id==='dvd'); const A=I&&I.staff; const t=LIFE.fire?'Gori u selu! Sjedaj u kamion, voda je na G ili gumbu 💧':['Kad se oglasi sirena, kamion čeka u dvorištu.','Subotom imamo vježbu — dođi!','Ovi pehari su s vatrogasnih natjecanja 🏆'][Math.floor(Math.random()*3)]; if(A) bubble(A,t,4.5); else UI.toast(t); }
/* ---- Općina Tuhelj: šalter, čekaonica, zastave, oglasna ploča ---- */
function flagTex(eu){ const c=cvs(256,384), g=c.getContext('2d'); if(eu){ g.fillStyle='#1f3f9a'; g.fillRect(0,0,256,384); g.fillStyle='#f2c318'; for(let i=0;i<12;i++){ const a=i/12*TAU; g.beginPath(); g.arc(128+Math.cos(a)*70,192+Math.sin(a)*70,9,0,TAU); g.fill(); } }
  else { const S=['#d01c1f','#ffffff','#1f3f9a']; for(let i=0;i<3;i++){ g.fillStyle=S[i]; g.fillRect(0,i*128,256,128); } for(let a=0;a<5;a++) for(let b=0;b<5;b++){ g.fillStyle=(a+b)%2?'#ffffff':'#d01c1f'; g.fillRect(98+a*12,150+b*14,12,14); } }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function buildOpcina(I){ const {x,z,y}=I.room; const cs=new ChunkSet(); const W=7, D=6.1, H=3.4; intShell(cs,x,z,y,W,D,H,{floor:lin('#9a6b43'),wall:lin('#f3f0e6'),ceil:lin('#fbfaf6'),stripe:null,skirt:lin('#5a4030'),door:lin('#5a3c24')});
  intLights(cs,x,z,y,H,W,D); const G=cs.get('wall',x,z), Wd=cs.get('wood',x,z), Mt=cs.get('metal',x,z), Cl=cs.get('cloth',x,z); const f=frame(x,z,0,0);
  // šalter (counter) with glass partition, desks and cabinets behind it
  Wd.box(f,-4.6,2.2,y,y+1.05,-1.9,-1.3,lin('#e7ddc9')); Wd.box(f,-4.7,2.3,y+1.05,y+1.1,-1.95,-1.25,lin('#7a5230')); for(let i=0;i<5;i++){ const gx=-4.5+i*1.35; Mt.box(f,gx,gx+0.04,y+1.1,y+2.1,-1.62,-1.58,lin('#9aa3ab')); } Mt.box(f,-4.6,2.2,y+2.08,y+2.12,-1.66,-1.54,lin('#9aa3ab'));
  addCollider(x-1.2,z-1.6,0,7.0,0.7,y-1,y+2.2);
  for(const dx of [-3.4,-0.6]){ Wd.box(f,dx-0.8,dx+0.8,y+0.72,y+0.77,-3.4,-2.6,lin('#8a5f38')); Mt.box(f,dx-0.25,dx+0.25,y+0.77,y+1.12,-3.3,-3.26,lin('#1c1f22')); Mt.box(f,dx-0.22,dx+0.22,y+0.8,y+1.09,-3.25,-3.24,lin('#3aa0c8')); }
  for(let i=0;i<5;i++) Wd.box(f,-5.8+i*1.3,-4.7+i*1.3,y,y+2.0,-D,-D+0.45,lin('#b58b5a'));
  intSign(['OPĆINA TUHELJ'],3.6,0.55,'#1f3f6a','#ffffff',x-1.2,y+2.7,z-D+0.03,0); intSign(['Jedinstveni upravni odjel'],3.0,0.26,'#ffffff','#1f3f6a',x-1.2,y+2.3,z-D+0.03,0);
  // flags (Hrvatska + EU) in the corner
  const pole=new THREE.CylinderGeometry(0.025,0.025,2.4,8), poleM=new THREE.MeshStandardMaterial({color:0xc9a44c,metalness:0.9,roughness:0.3});
  for(const [px,eu] of [[W-1.3,false],[W-0.7,true]]){ intMesh(pole,poleM,x+px,y+1.2,z-D+0.8); const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.62,0.93),new THREE.MeshStandardMaterial({map:flagTex(eu),side:THREE.DoubleSide,roughness:0.8})); fl.position.set(x+px+0.33,y+1.85,z-D+0.8); GAME.scene.add(fl); }
  // noticeboard + waiting chairs on the left wall
  Wd.box(f,-W,-W+0.05,y+1.1,y+2.2,1.0,3.6,lin('#8a6a44')); for(let i=0;i<8;i++){ const pz=1.2+(i%4)*0.6, py=1.25+Math.floor(i/4)*0.48; G.box(f,-W+0.05,-W+0.07,y+py,y+py+0.36,pz,pz+0.42,lin(i%3===0?'#fff6c8':'#ffffff')); }
  intSign(['OGLASNA PLOČA'],1.6,0.22,'#8a6a44','#ffffff',x-W+0.09,y+2.35,z+2.3,Math.PI/2);
  for(let i=0;i<5;i++){ const cz=0.9+i*0.7; Mt.box(f,-W+0.35,-W+0.85,y,y+0.44,cz-0.25,cz+0.25,lin('#3a3d42')); Cl.box(f,-W+0.33,-W+0.87,y+0.44,y+0.5,cz-0.27,cz+0.27,lin('#2f4f7a')); Cl.box(f,-W+0.33,-W+0.4,y+0.5,y+0.95,cz-0.27,cz+0.27,lin('#2f4f7a')); } addCollider(x-W+0.6,z+2.3,0,0.7,3.6,y-1,y+0.9);
  // plant
  { Wd.box(f,W-0.8,W-0.3,y,y+0.45,3.9,4.4,lin('#8a4a2a')); Cl.box(f,W-0.95,W-0.15,y+0.45,y+1.3,3.75,4.55,lin('#3f7a36')); addCollider(x+W-0.55,z+4.15,0,0.6,0.6,y-1,y+1.3); }
  intFinish(cs); I.staff=intPerson('Službenica Vesna','#6a2a4a',{female:true},'Female_Adult_04',x-1.2,z-2.4,y,faceYaw(0,1)); intPerson('Načelnik','#2a3440',{},'Male_Adult_02',x+W-2.2,z-3.0,y,faceYaw(-1,1)); }
function opcinaDesk(){ const I=INTS.find(i=>i.id==='opcina'); const A=I&&I.staff; let t;
  if(GTA.wanted>0){ if(GTA.money>=50){ money(-50,'kazna u općini'); GTA.wanted=0; for(const C of GTA.chasers) if(C.kind==='policija') C.leave=true; t='Kazna plaćena ✅ Policija te više ne traži.'; } else t='Za kaznu treba 50 €, a nemaš toliko.'; }
  else t=['Izvolite, potvrda o prebivalištu ✅','Uredovno vrijeme: pon–pet 7–15 h, ali za vas uvijek 🙂','Načelnik poručuje: vozite polako kroz selo!','Prijava za Tuheljske dane je otvorena!'][Math.floor(Math.random()*4)];
  try{ blip('door'); }catch(e){} if(A) bubble(A,t,4.5); UI.toast('🏛️ '+t); }
/* ---- green rings in front of every open door, a little life inside ---- */
function intTick(dt){ intInit(); if(!INTS.length) return; if(!INTS.rings){ INTS.rings=[]; const g=new THREE.RingGeometry(0.75,1.0,40); for(const I of INTS){ const d=I.door(); if(!d) continue; const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x5fe08a,transparent:true,opacity:0.55,depthWrite:false,side:THREE.DoubleSide})); m.rotation.x=-Math.PI/2; m.position.set(d[0],groundAt(d[0],d[1])+0.04,d[1]); m.renderOrder=2; GAME.scene.add(m); INTS.rings.push(m); } }
  const k=0.45+0.25*Math.sin(GAME.time*3); for(const m of INTS.rings){ m.material.opacity=k; m.visible=!INSIDE; }
  if(INSIDE&&Math.random()<dt*0.05){ const P=INT_PEOPLE.filter(A=>Math.hypot(A.group.position.x-PLAYER.pos.x,A.group.position.z-PLAYER.pos.z)<9); const A=P[Math.floor(Math.random()*P.length)]; if(A) bubble(A,['Lijep dan danas!','Kaj ima novoga?','Jeste čuli za požar?','Evo, samo malo…'][Math.floor(Math.random()*4)],3); } }
/* ---- "E" prompt: key caps instead of plain text ---- */
function promptHTML(t){ const esc=String(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); return esc.replace(/(^|· )([A-Z0-9]{1,5}|Esc|Shift|Space) — /g,'$1<kbd>$2</kbd>'); }
