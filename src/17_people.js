/* ===================== people in the pub, school court, car occupants ===================== */
const NPCS=[]; let ME_AV=null;
function faceYaw(dx,dz){ return Math.atan2(-dx,-dz); }
function makePerson(name,color,opt){ const A=makeAvatar(name,color); opt=opt||{}; A.female=opt.female===true?true:undefined;
  if(opt.female){ const hm=new THREE.MeshStandardMaterial({color:opt.hair||0x5a3a22,roughness:0.9}); const hb=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.36,0.12),hm); hb.position.set(0,1.6,0.09); A.group.add(hb);
    const sk=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.3,0.48,14),new THREE.MeshStandardMaterial({color:opt.skirt||0x1b1b1b,roughness:0.85})); sk.position.y=0.7; A.group.add(sk); A.body.push(hb,sk); }
  if(opt.apron){ const ap=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.52,0.02),new THREE.MeshStandardMaterial({color:0xf4f2ea,roughness:0.9})); ap.position.set(0,0.98,-0.145); A.group.add(ap); A.body.push(ap); }
  return A; }
function spawnNPCs(){ const L=LANDMARKS.pubNPC; if(!L||NPCS.length) return; for(const d of L){ const A=makePerson(d.n,d.c,d.opt); A.group.position.set(d.x,d.y,d.z); A.group.rotation.y=d.face; A.pose=d.pose;
    if(d.pose==='sit'||d.pose==='stool'){ A.legL.rotation.x=A.legR.rotation.x=d.pose==='stool'?-1.2:-1.45; A.armL.rotation.x=-0.75; A.armR.rotation.x=-0.75; }
    GAME.scene.add(A.group); NPCS.push({A,d,t:Math.random()*10}); } }
function npcTick(dt){ if(!NPCS.length) spawnNPCs(); for(const N of NPCS){ N.t+=dt; const d=N.d, A=N.A;
    if(d.walk&&N.srv&&N.srv.st!=='patrol'){ continue; }
    if(d.walk){ const [a,b]=d.walk; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const tw=L/0.95, per=2*tw+6; const u=N.t%per; let k,dir; if(u<tw){ k=u/tw; dir=1; } else if(u<tw+3){ k=1; dir=0; } else if(u<2*tw+3){ k=1-(u-tw-3)/tw; dir=-1; } else { k=0; dir=0; }
      const x=a[0]+(b[0]-a[0])*k, z=a[1]+(b[1]-a[1])*k; A.group.position.set(x,d.y,z); if(dir) A.group.rotation.y=faceYaw((b[0]-a[0])*dir,(b[1]-a[1])*dir); const sw=dir?Math.sin(N.t*6.5)*0.5:0; A.legL.rotation.x=sw; A.legR.rotation.x=-sw; A.armL.rotation.x=-sw*0.6; A.armR.rotation.x=dir?-0.9:-0.4; }
    else if(d.pose==='stand'){ A.armR.rotation.x=-0.5+Math.sin(N.t*1.4)*0.35; A.armL.rotation.x=-0.3+Math.sin(N.t*0.9)*0.15; }
    else { A.armR.rotation.x=-0.75+Math.max(0,Math.sin(N.t*0.7))*-0.6; A.seatT=GAME.time; } } }
/* ---- people inside cars: driver and passengers visible, seat by seat ---- */
const SEATS_CAR=[[-0.28,-0.38],[-0.28,0.38],[-1.08,-0.4],[-1.08,0.4],[-1.08,0]], SEATS_TRUCK=[[2.75,-0.55],[2.75,0.55],[2.0,-0.55],[2.0,0.55],[2.0,0],[1.4,0]];
function carOccupants(v){ if(!v) return {driver:null,pas:[]}; const me=NET.myId||'me'; let driver=null; if(PLAYER.driving===v) driver=me; else if(v.remote) driver=v.remote; const pas=[]; if(PLAYER.riding===v) pas.push(me); for(const R of NET.remotes.values()) if(R.pa===v.idx&&R.id!==driver) pas.push(R.id); pas.sort(); return {driver,pas}; }
function mySeat(v){ const o=carOccupants(v); const me=NET.myId||'me'; if(o.driver===me) return 0; const i=o.pas.indexOf(me); return i<0?1:i+1; }
function occupantTick(){ const me=NET.myId||'me'; const used=new Set();
  for(const v of DRIVE){ if(v.bike) continue; const o=carOccupants(v); if(v.formula&&v.helmet&&!o.driver) v.helmet.visible=false; if(!o.driver&&!o.pas.length) continue; const S=v.truck?SEATS_TRUCK:SEATS_CAR; const ids=[o.driver].concat(o.pas);
    if(v.formula){ if(v.helmet) v.helmet.visible=!!o.driver&&!(o.driver===me&&CARCAM.first); const id=o.driver; if(id&&id!==me){ const R=NET.remotes.get(id); if(R&&R.av){ R.av.group.visible=false; } } if(id===me&&ME_AV) ME_AV.group.visible=false; continue; }
    ids.forEach((id,k)=>{ if(!id||k>=S.length) return; let A=null; if(id===me){ if(!ME_AV){ ME_AV=makeAvatar(NET.name||'Ti',NET.color||'#e8412c'); GAME.scene.add(ME_AV.group); } A=ME_AV; } else { const R=NET.remotes.get(id); A=R&&R.av; } if(!A) return; used.add(A);
      const p=new THREE.Vector3(S[k][0],v.truck?0.95:(v.seatY!==undefined?v.seatY:-0.33),S[k][1]); v.group.updateMatrixWorld(); v.group.localToWorld(p); A.group.position.copy(p); A.seatT=GAME.time; A.group.rotation.set(0,v.st.yaw,0); A.legL.rotation.x=A.legR.rotation.x=-1.45; const drv=k===0; A.armL.rotation.x=A.armR.rotation.x=drv?-1.25:-0.6;
      const hideSelf=(id===me&&CARCAM.first); A.group.visible=!hideSelf; for(const bp of A.body) bp.visible=true; if(A.sprite) A.sprite.visible=id!==me; }); }
  if(ME_AV&&!used.has(ME_AV)) ME_AV.group.visible=false;
  for(const v of DRIVE) if(v.interior&&v.handsG) v.handsG.visible=(PLAYER.driving===v); }
/* ---- school court: surface with painted lines, handball goals, basketball hoops, fence ---- */
function courtTex(){ const W=1024,H=512, c=cvs(W,H), g=c.getContext('2d'); g.fillStyle='#b5523a'; g.fillRect(0,0,W,H); const m=36; g.fillStyle='#2f6f9a'; g.fillRect(m,m,W-2*m,H-2*m);
  g.strokeStyle='#f4f4f0'; g.lineWidth=5; g.strokeRect(m,m,W-2*m,H-2*m); g.beginPath(); g.moveTo(W/2,m); g.lineTo(W/2,H-m); g.stroke(); g.beginPath(); g.arc(W/2,H/2,55,0,TAU); g.stroke();
  const sx=(W-2*m)/40; for(const side of [-1,1]){ const gx=side<0?m:W-m; g.beginPath(); g.moveTo(gx,H/2-1.5*sx-6*sx); g.arc(gx,H/2-1.5*sx,6*sx,side<0?-Math.PI/2:-Math.PI/2,side<0?0:Math.PI,side>0); g.lineTo(gx+side*6*sx,H/2+1.5*sx); g.arc(gx,H/2+1.5*sx,6*sx,side<0?0:Math.PI,Math.PI/2,side>0); g.stroke();
    g.setLineDash([14,12]); g.beginPath(); g.arc(gx,H/2-1.5*sx,9*sx,side<0?-Math.PI/2:-Math.PI/2,side<0?0:Math.PI,side>0); g.lineTo(gx+side*9*sx,H/2+1.5*sx); g.arc(gx,H/2+1.5*sx,9*sx,side<0?0:Math.PI,Math.PI/2,side>0); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(gx+side*7*sx,H/2-8); g.lineTo(gx+side*7*sx,H/2+8); g.stroke(); }
  return mkTex(c,{repeat:false}); }
function netTex(){ const c=cvs(128,128), g=c.getContext('2d'); g.clearRect(0,0,128,128); g.strokeStyle='rgba(245,245,245,0.95)'; g.lineWidth=3; for(let i=0;i<=128;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,128); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(128,i); g.stroke(); } return mkTex(c); }
function buildCourts(scene){ const courtM=new THREE.MeshStandardMaterial({map:courtTex(),roughness:0.85}); const netM=new THREE.MeshStandardMaterial({map:netTex(),transparent:true,alphaTest:0.3,side:THREE.DoubleSide,roughness:0.9}); const fenceM=new THREE.MeshStandardMaterial({map:netTex(),color:0x2f5f3a,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,roughness:0.8});
  const G=new GB(), R=new GB();
  for(const l of LAND){ if(l.t!=='pitch') continue; const P=l.P; let best=null; for(let a=0;a<Math.PI;a+=Math.PI/90){ const c=Math.cos(a), s=Math.sin(a); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const p of P){ const u=p[0]*c+p[1]*s, v=-p[0]*s+p[1]*c; x0=Math.min(x0,u); x1=Math.max(x1,u); z0=Math.min(z0,v); z1=Math.max(z1,v); } const A=(x1-x0)*(z1-z0); if(!best||A<best.A) best={A,a,x0,x1,z0,z1}; }
    let {a,x0,x1,z0,z1}=best; if(x1-x0<z1-z0){ a+=Math.PI/2; const t0=x0,t1=x1; x0=z0; x1=z1; z0=-t1; z1=-t0; } const c=Math.cos(a), s=Math.sin(a); const cu=(x0+x1)/2, cv=(z0+z1)/2; const cx=cu*c-cv*s, cz=cu*s+cv*c; const hl=(x1-x0)/2, hw=(z1-z0)/2; if(hl<6) continue; const f=frame(cx,cz,a);
    const nx=16, nz=8; const mesh=new THREE.PlaneGeometry(1,1,nx,nz); const pos=mesh.attributes.position, uv=mesh.attributes.uv; const verts=[];
    for(let i=0;i<pos.count;i++){ const lx=(pos.getX(i))*2*hl, lz=-(pos.getY(i))*2*hw; const w=f(lx,0,lz); pos.setXYZ(i,w[0],getHeight(w[0],w[2])+0.04,w[2]); } mesh.computeVertexNormals(); const cm=new THREE.Mesh(mesh,courtM); cm.receiveShadow=true; scene.add(cm);
    const y=(lx,lz)=>{ const w=f(lx,0,lz); return getHeight(w[0],w[2]); };
    for(const sd of [-1,1]){ const gx=sd*(hl-1.25); const fy=y(gx,0); const gf=frame(...(()=>{ const w=f(gx,0,0); return [w[0],w[2]]; })(),a,fy);
      for(const zz of [-1.5,1.5]) for(let k=0;k<5;k++) G.box(gf,-0.04,0.04,k*0.4,(k+1)*0.4,zz-0.04,zz+0.04,k%2?lin('#f4f4f0'):lin('#c62828')); for(let k=0;k<8;k++) G.box(gf,-0.04,0.04,1.96,2.04,-1.5+k*0.375,-1.5+(k+1)*0.375,k%2?lin('#f4f4f0'):lin('#c62828'));
      const q=(x,yy,z)=>gf(x,yy,z); const back=sd*0.9; const nm=(A,B,C,D)=>{ R.quad(A,B,C,D,[0,0],[4,0],[4,3],[0,3],WHITE,[0,1,0]); };
      nm(q(0,2,-1.5),q(0,2,1.5),q(back,2,1.5),q(back,2,-1.5)); nm(q(back,0,-1.5),q(back,0,1.5),q(back,2,1.5),q(back,2,-1.5)); nm(q(0,0,-1.5),q(back,0,-1.5),q(back,2,-1.5),q(0,2,-1.5)); nm(q(0,0,1.5),q(back,0,1.5),q(back,2,1.5),q(0,2,1.5));
      const hx=sd*(hl+0.3); const hy=y(hx,0); const hf=frame(...(()=>{ const w=f(hx,0,0); return [w[0],w[2]]; })(),a,hy); G.cyl(hf,0.07,0.07,0,3.3,10,lin('#2d5d8a'),1,false); G.box(hf,-sd*0.05-0.03,-sd*0.05+0.03,2.75,3.85,-0.9,0.9,lin('#f4f4f2')); G.box(hf,-sd*0.1-0.02,-sd*0.1,3.0,3.45,-0.3,0.3,lin('#e0572a'));
      const rim=f(hx-sd*0.45,0,0); G.cyl(frame(rim[0],rim[2],a,hy+3.05),0.23,0.23,0,0.025,14,lin('#e0572a'),1,false); addCollider(f(gx+sd*0.45,0,0)[0],f(gx+sd*0.45,0,0)[2],a,0.9,3.1,fy-1,fy+2.1); }
    const FH=2.2, fl=hl+2.5, fw=hw+2.0; const corners=[[-fl,-fw],[fl,-fw],[fl,fw],[-fl,fw]];
    for(let i=0;i<4;i++){ const A2=corners[i], B2=corners[(i+1)%4]; const L=Math.hypot(B2[0]-A2[0],B2[1]-A2[1]); const n=Math.max(1,Math.round(L/3)); for(let k=0;k<n;k++){ const t0=k/n, t1=(k+1)/n; const p0=[A2[0]+(B2[0]-A2[0])*t0,A2[1]+(B2[1]-A2[1])*t0], p1=[A2[0]+(B2[0]-A2[0])*t1,A2[1]+(B2[1]-A2[1])*t1]; if(i===2&&k===Math.floor(n/2)) continue;
        const w0=f(p0[0],0,p0[1]), w1=f(p1[0],0,p1[1]); const y0=getHeight(w0[0],w0[2]), y1=getHeight(w1[0],w1[2]); G.cyl(frame(w0[0],w0[2],0,y0),0.035,0.035,0,FH,6,lin('#2f5f3a'),1,false);
        const fg=new THREE.Mesh(new THREE.PlaneGeometry(1,1),fenceM); const L2=Math.hypot(w1[0]-w0[0],w1[2]-w0[2]); fg.scale.set(L2,FH,1); fg.position.set((w0[0]+w1[0])/2,(y0+y1)/2+FH/2,(w0[2]+w1[2])/2); fg.rotation.y=-Math.atan2(w1[2]-w0[2],w1[0]-w0[0]); fg.material.map.repeat.set(1,1); scene.add(fg); } }
    for(const [x,z] of [[-hl*0.4,-hw-1.2],[hl*0.4,-hw-1.2]]){ const w=f(x,0,z); const bf=frame(w[0],w[2],a,getHeight(w[0],w[2])); G.box(bf,-0.9,0.9,0.42,0.47,-0.2,0.2,lin('#8a5a36')); G.box(bf,-0.9,0.9,0.55,0.85,0.18,0.22,lin('#8a5a36')); for(const xx of [-0.75,0.75]) G.box(bf,xx-0.03,xx+0.03,0,0.45,-0.18,0.18,lin('#333')); }
  }
  const m1=new THREE.Mesh(G.geometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.5,metalness:0.2})); m1.castShadow=true; scene.add(m1); if(R.count){ const m2=new THREE.Mesh(R.geometry(),netM); scene.add(m2); } }
