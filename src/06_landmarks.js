/* ===================== landmark buildings ===================== */
function lathe(G,T,prof,seg,C,phase=0){ for(let i=0;i<prof.length-1;i++){ const [r0,y0]=prof[i], [r1,y1]=prof[i+1];
  for(let k=0;k<seg;k++){ const a0=phase+k/seg*TAU, a1=phase+(k+1)/seg*TAU, am=(a0+a1)/2;
    const p0=T(Math.cos(a0)*r0,y0,Math.sin(a0)*r0), p1=T(Math.cos(a1)*r0,y0,Math.sin(a1)*r0), p2=T(Math.cos(a1)*r1,y1,Math.sin(a1)*r1), p3=T(Math.cos(a0)*r1,y1,Math.sin(a0)*r1);
    const c0=T(0,(y0+y1)/2,0), o=T(Math.cos(am),(y0+y1)/2,Math.sin(am)); const out=[o[0]-c0[0],(r0-r1)*0.6,o[2]-c0[2]];
    if(r0<0.001) G.tri(p0,p2,p3,[0,0],[1,1],[0,1],C,out); else if(r1<0.001) G.tri(p0,p1,p2,[0,0],[1,0],[1,1],C,out); else G.quad(p0,p1,p2,p3,[k/seg,y0/3],[(k+1)/seg,y0/3],[(k+1)/seg,y1/3],[k/seg,y1/3],C,out); } } }
const SIGNS=[]; // extra meshes with own materials
function signMesh(scene,tex,w,h,x,y,z,ang,emiss=0){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:0.6,metalness:0,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3})); m.position.set(x,y,z); m.rotation.y=ang; m.receiveShadow=true; scene.add(m); SIGNS.push(m); return m; }
function wallPoint(f,si,t,off){ return f(si.n[0]*(si.d+off)+si.r[0]*t,0,si.n[1]*(si.d+off)+si.r[1]*t); }
function sideAngle(ang,si){ const n=worldN(ang,si.n); return Math.atan2(n[0],n[2]); }
function findB(pred){ return BLD.find(pred); }
function emitLandmarks(cs,scene){
  RNG=mulberry32(555);
  for(const b of BLD){
    switch(b.k){
      case 'church': church(cs,scene,b); break;
      case 'fire': fireStation(cs,scene,b); break;
      case 'apt': apartment(cs,scene,b); break;
      case 'townhall': townhall(cs,scene,b); break;
      case 'chapel': chapel(cs,scene,b); break;
      case 'school': school(cs,scene,b); break;
      case 'shrine': shrine(cs,b); break;
      case 'tank': tank(cs,b); break;
      case 'shop': case 'cafe': case 'parish': centreBuilding(cs,scene,b); break;
      default: if(b.st) centreBuilding(cs,scene,b);
    }
  }
  statueColumn(cs,-252.5,-42.5);
}
/* ---------- Općina & pošta (white building) ---------- */
function townhall(cs,scene,b){
  const [cx,cz,ang,L,W]=b.rect; const f=frame(cx,cz,ang); const y0=b.hmax+0.2, yb=b.hmin-0.6; b.y0=y0;
  const hl=L/2, hw=W/2; const wallC=lin('#efe6cf'), roofC=lin('#4e3226'), sofC=lin('#4a3223'), stoneC=lin('#bdb6a8');
  const e=y0+6.2; emitWalls(cs,f,ang,hl,hw,yb,e,'gable',42,wallC,'wall'); emitPlinth(cs,f,ang,hl,hw,yb,y0+0.75,stoneC);
  emitRoof(cs,f,ang,hl,hw,e,'gable',42,0.8,0.7,roofC,sofC);
  const Wn=cs.get('win',cx,cz), T=cs.get('trim',cx,cz); const front=b.f;
  for(let sk=0;sk<4;sk++){ const si=sideInfo(sk,hl,hw); const n=Math.max(1,Math.floor((si.len-1)/3.1));
    for(let i=0;i<n;i++){ const t=-si.e+si.len*(i+0.5)/n;
      if(sk===front && i===Math.floor(n/2)){ decal(Wn,f,ang,si,t,y0-0.02,'door_glass'); decal(Wn,f,ang,si,t+1.6,y0-0.02,'door_wood'); LANDMARKS.townhallDoor=wallPoint(f,si,t,1.4); }
      else decal(Wn,f,ang,si,t,y0+0.72,'old4');
      decal(Wn,f,ang,si,t,y0+3.55,'old4'); }
    // chimneys
  }
  for(const cxp of [-hl*0.4,hl*0.35]){ const zc=hw*0.3; const yr=roofYat(zc,hw,e,33); const p=f(cxp,0,zc); const cf=frame(p[0],p[2],ang); cs.get('wall',cx,cz).box(cf,-0.3,0.3,yr-0.5,e+hw*Math.tan(33*Math.PI/180)+0.8,-0.3,0.3,wallC,0.33); }
  // signs
  const si=sideInfo(front,hl,hw); const sp=wallPoint(f,si,0,0.06);
  signMesh(scene,signTex(['OPĆINA TUHELJ'],{w:640,h:128,bg:'#1f4e8c',fg:'#ffffff',border:'#ffffff',bw:6,size:58}),2.4,0.48,sp[0],y0+2.75,sp[2],sideAngle(ang,si));
  const pp=wallPoint(f,si,3.2,0.06); signMesh(scene,postTex(),0.75,0.75,pp[0],y0+2.8,pp[2],sideAngle(ang,si));
  { const pq=wallPoint(f,si,4.4,0.06); signMesh(scene,signTex(['Pošta'],{w:384,h:160,bg:'#f4f1e8',fg:'#1a3f8f',border:'#1a3f8f',bw:6,size:76}),0.9,0.38,pq[0],y0+2.75,pq[2],sideAngle(ang,si)); const mb=wallPoint(f,si,4.4,0.12); const Tm=cs.get('trim',cx,cz); Tm.box(frame(mb[0],mb[2],sideAngle(ang,si)),-0.2,0.2,y0+1.1,y0+1.55,-0.12,0.12,lin('#f2c318')); }
  // three flags on tall poles and a row of thujas along the front (as on the street photos)
  { const M=cs.get('metal',cx,cz), Hd=cs.get('hedge',cx,cz); const fl=[flagTex(),countyFlagTex(),muniFlagTex()];
    for(let k=0;k<3;k++){ const p=wallPoint(f,si,-2.2+k*1.3,3.2); const y=getHeight(p[0],p[2]); const pf=frame(p[0],p[2],ang,y); M.cyl(pf,0.04,0.03,0,7.2,6,lin('#d8dadc'),1,true); M.box(pf,-0.03,0.03,6.95,7.0,-0.5,0.5,lin('#d8dadc'));
      const m=new THREE.Mesh(new THREE.PlaneGeometry(0.95,2.3),new THREE.MeshStandardMaterial({map:fl[k],side:THREE.DoubleSide,roughness:0.9})); const q=wallPoint(f,si,-2.2+k*1.3,3.23); m.position.set(q[0],y+5.8,q[2]); m.rotation.y=sideAngle(ang,si); m.castShadow=true; scene.add(m); addCollider(p[0],p[2],ang,0.2,0.2,y-1,y+7); }
    for(let t=-si.e+0.6;t<si.e-0.4;t+=0.75){ if(Math.abs(t-0)<1.6) continue; const p=wallPoint(f,si,t,1.1); const y=getHeight(p[0],p[2]); lathe(Hd,frame(p[0],p[2],ang,y),[[0.3,0],[0.34,0.35],[0.24,1.1],[0.1,1.6],[0,1.75]],8,colJ(lin('#2f5a2a'),0.08)); } }
  // annex kiosk at the end nearest the junction
  const endSk=(()=>{ const p0=f(hl,0,0), p1=f(-hl,0,0); const d0=Math.hypot(p0[0]-CENTER[0],p0[2]-CENTER[1]), d1=Math.hypot(p1[0]-CENTER[0],p1[2]-CENTER[1]); return d0<d1?0:1; })();
  const s0=sideInfo(endSk,hl,hw); const zOff=(front===2?1:-1)*(hw-2.6); const ap=f(s0.n[0]*(hl+2.4),0,zOff); const af=frame(ap[0],ap[2],ang);
  const ay0=Math.max(getHeight(ap[0],ap[2]),y0-0.4)+0.1;
  emitWalls(cs,af,ang,2.4,2.4,yb,ay0+2.9,'hip',30,lin('#f2efe8'),'wall'); emitPlinth(cs,af,ang,2.4,2.4,yb,ay0+0.6,stoneC); emitRoof(cs,af,ang,2.4,2.4,ay0+2.9,'hip',30,0.45,0.45,lin('#c0603a'),lin('#e8e4da'));
  for(let sk=0;sk<4;sk++){ const s2=sideInfo(sk,2.4,2.4); if(sk===(endSk^1)) continue; if(sk===front) decal(Wn,af,ang,s2,-0.9,ay0-0.02,'door_glass'); else decal(Wn,af,ang,s2,0,ay0+0.6,'modern',0.05,1.0); }
  addCollider(ap[0],ap[2],ang,5,5,ay0-2,ay0+5);
  LANDMARKS.townhall={x:wallPoint(f,si,0,9)[0],z:wallPoint(f,si,0,9)[2],look:[cx,cz]};
}
function postTex(){ const c=cvs(256,256), g=c.getContext('2d'); g.fillStyle='#ffd21a'; g.beginPath(); g.arc(128,128,124,0,TAU); g.fill(); g.strokeStyle='#1a3f8f'; g.lineWidth=18; g.beginPath(); g.arc(128,128,70,Math.PI*0.2,Math.PI*1.2); g.stroke(); g.fillStyle='#1a3f8f'; g.font='900 64px Manrope, Arial'; g.textAlign='center'; g.fillText('HP',128,150); return mkTex(c,{repeat:false}); }
/* ---------- hand-placed centre buildings ---------- */
function centreBuilding(cs,scene,b){
  const st=b.st||b.k; if(st==='cafe'){ cafe(cs,scene,b); return; } const s=styleFor(b);
  if(st==='shopPink'){ s.wall=lin('#efe7d6'); s.plinth=lin('#8c2a26'); s.roof=lin('#4f3328'); s.sof=lin('#5a3a26'); s.roofType='hip'; s.pitch=32; s.win='roller_brown'; s.balcony=false; s.garage=false; }
  if(st==='shopCream'){ s.wall=lin('#efe2c4'); s.roof=lin('#a54a31'); s.roofType='gable'; s.pitch=30; s.balcony=false; s.garage=false; }
  if(st==='cafe'){ s.wall=lin('#f1e8d6'); s.roof=lin('#b85b37'); s.roofType='gable'; s.pitch=28; s.balcony=false; s.garage=false; s.chim=true; }
  if(st==='parish'){ s.wall=lin('#efe3c2'); s.roof=lin('#6e4131'); s.roofType='hip'; s.pitch=47; s.win='old4'; s.balcony=false; s.garage=false; }
  if(st==='yellow'){ s.wall=lin('#efd68a'); s.roof=lin('#9d4a33'); s.roofType='gable'; s.pitch=36; s.win='roller_brown'; s.balcony=false; }
  if(st==='whiteGarage'){ s.wall=lin('#f4f2ec'); s.roof=lin('#a94c33'); s.roofType='gable'; s.pitch=36; s.garage=true; s.win='roller_white'; }
  if(st==='salmon'){ s.wall=lin('#e9b89e'); s.roofType='gable'; }
  const shop=(st==='shopPink'||st==='shopCream');
  const floors=(st==='cafe'||shop||st==='parish')?1:(b.lv||2);
  if(shop||st==='cafe'){
    // custom facade: ground floor openings from list
    const [cx,cz,ang,L,W]=b.rect; const f=frame(cx,cz,ang); const hl=L/2, hw=W/2; const y0=b.hmax+0.15, yb=b.hmin-0.6; b.y0=y0;
    const ultraB=b.n==='Trgovina PZ Tuhelj'; const e=y0+(st==='cafe'?3.4:3.6)+(shop?0.9:0)+(ultraB?1.0:0); const roof=s.roofType;
    emitWalls(cs,f,ang,hl,hw,yb,e,roof,s.pitch,s.wall,'wall'); emitPlinth(cs,f,ang,hl,hw,yb,y0+0.5,s.plinth); emitRoof(cs,f,ang,hl,hw,e,roof,s.pitch,0.7,0.5,s.roof,s.sof);
    const Wn=cs.get('win',cx,cz), T=cs.get('trim',cx,cz); const fsi=sideInfo(b.f,hl,hw);
    if(st==='cafe'){ const n=Math.floor(fsi.len/2.1); for(let i=0;i<n;i++){ const t=-fsi.e+fsi.len*(i+0.5)/n; decal(Wn,f,ang,fsi,t,y0-0.02+(i===2?0:0.3),i===2?'door_glass':'arched',0.05,i===2?1:1.0); }
      const sp=wallPoint(f,fsi,-fsi.e*0.55,0.06); signMesh(scene,signTex(['Kafić Putniku'],{w:640,h:128,bg:'#3b2a20',fg:'#f3e2c0',border:'#c9a45c',bw:6,size:60,font:'Georgia, serif',weight:700}),2.6,0.52,sp[0],y0+2.95,sp[2],sideAngle(ang,fsi));
      // terrace
      for(let i=0;i<3;i++){ const t=-fsi.e+fsi.len*(0.2+i*0.18); const p=wallPoint(f,fsi,t,2.6); PROPS_EXTRA.push({t:'table',x:p[0],z:p[2],ang}); }
    } else {
      const n=Math.max(2,Math.floor(fsi.len/3.4)); for(let i=0;i<n;i++){ const t=-fsi.e+fsi.len*(i+0.5)/n; decal(Wn,f,ang,fsi,t,y0-0.02,i===Math.floor(n/2)?'door_glass':'shop',0.05,1); }
      { const td=-fsi.e+fsi.len*(Math.floor(n/2)+0.5)/n; (LANDMARKS.shopDoors=LANDMARKS.shopDoors||[]).push({n:b.n||'',p:wallPoint(f,fsi,td,1.3)}); }
      const sp=wallPoint(f,fsi,0,0.35); T.box(frame(sp[0],sp[2],ang),-(b.f<2?0.35:fsi.e),(b.f<2?0.35:fsi.e),y0+2.55,y0+2.65,-(b.f<2?fsi.e:0.35),(b.f<2?fsi.e:0.35),lin(b.n==='Trgovina PZ Tuhelj'?'#5a3b28':'#2e6b3a'));
      const ultra=b.n==='Trgovina PZ Tuhelj'; const nm=ultra?'ULTRA':b.n.toUpperCase(); const sp2=wallPoint(f,fsi,0,0.06); signMesh(scene,signTex([nm],ultra?{w:1024,h:128,bg:'#f6f3ee',fg:'#d8262e',border:'#d8262e',bw:6,size:84,weight:900}:{w:1024,h:128,bg:'#2e6b3a',fg:'#ffffff',border:null,size:62}),Math.min(6.5,fsi.len*0.7),0.8,sp2[0],y0+3.15,sp2[2],sideAngle(ang,fsi));
      // attic windows
      for(const sk of [0,1,2,3]){ const si=sideInfo(sk,hl,hw); if(sk===b.f) continue; const n2=Math.max(1,Math.floor((si.len-1)/3.2)); for(let i=0;i<n2;i++){ const t=-si.e+si.len*(i+0.5)/n2; decal(Wn,f,ang,si,t,y0+0.9,'roller_brown0'); } }
      if(ultraB) ultraExtras(cs,scene,b,f,ang,hl,hw,y0,e,fsi);
      if(st==='shopPink'){ const sk=(b.f<2?2:0); const si=sideInfo(sk,hl,hw); const pp=wallPoint(f,si,0,0.06); signMesh(scene,posterTex(),Math.min(7,si.len*0.8),2.6,pp[0],y0+1.9,pp[2],sideAngle(ang,si)); }
    }
    b.top=e; return;
  }
  emitHouse(cs,b,{style:s,floors,attic:st==='parish'?false:undefined});
  if(st==='parish'){ LANDMARKS.parish={x:b.rect[0],z:b.rect[1]}; }
}
// Ultra (Street View): cornice over the shop band, small upper windows under the eaves, the taller tan house behind, Ožujsko umbrellas on the square
function ultraExtras(cs,scene,b,f,ang,hl,hw,y0,e,fsi){ const [cx,cz]=b.rect; const Wn=cs.get('win',cx,cz), T=cs.get('trim',cx,cz), Mt=cs.get('metal',cx,cz), Cl=cs.get('cloth',cx,cz); const CR=lin('#f4eee2');
  for(const sk of [0,1,2,3]){ const si=sideInfo(sk,hl,hw); const L=si.len/2+0.08;
    const mm=(t,o)=>wallPoint(f,si,t,o); const q0=mm(-L,0), q1=mm(L,0); let ax=Math.atan2(q1[2]-q0[2],q1[0]-q0[0]); { const N=worldN(ang,si.n); if(-Math.sin(ax)*N[0]+Math.cos(ax)*N[2]<0) ax+=Math.PI; } const cf=frame((q0[0]+q1[0])/2,(q0[2]+q1[2])/2,ax,0);
    T.box(cf,-L,L,y0+3.42,y0+3.62,-0.02,0.16,CR); T.box(cf,-L,L,y0+3.62,y0+3.7,-0.02,0.1,CR); T.box(cf,-L,L,e-0.32,e-0.12,-0.02,0.12,CR); }
  { const n=Math.max(3,Math.floor(fsi.len/3.6)); for(let i=0;i<n;i++){ const t=-fsi.e+fsi.len*(i+0.5)/n; decal(Wn,f,ang,fsi,t,y0+3.85,'roller_brown0',0.05,0.8); } }
  // taller tan house joined at the back
  { const bk=fsi.n[0]!==0?(fsi.n[0]>0?1:0):(fsi.n[1]>0?3:2); const bi=sideInfo(bk,hl,hw); const c=wallPoint(f,bi,bi.e*0.25,2.2); const L2=bi.len*0.55, W2=7.0; const ba=bk<2?ang+Math.PI/2:ang; const bf=frame(c[0],c[2],ba); const yb=b.hmin-0.6, e2=e+1.4;
    emitWalls(cs,bf,ba,L2/2,W2/2,yb,e2,'gable',38,lin('#d8c09a'),'wall'); emitRoof(cs,bf,ba,L2/2,W2/2,e2,'gable',38,0.5,0.4,lin('#5b3a2b'),lin('#4a3022'));
    for(const sd of [-1,1]){ for(let k=-1;k<=1;k++){ const wp=bf(k*L2/3.4,0,sd*(W2/2+0.05)); decal(Wn,frame(wp[0],wp[2],ba+(sd<0?Math.PI:0)),ba+(sd<0?Math.PI:0),{n:[0,1],r:[1,0],d:0,e:1,len:2},0,e2-1.9,'roller_brown0',0.02,0.85); } }
    addCollider(c[0],c[2],ba,L2,W2,yb,e2+3); }
  // yellow Ožujsko umbrellas with tables on the square in front (Mapillary 2929753964012017)
  for(const t of [-fsi.e*0.62,-fsi.e*0.22]){ const p=wallPoint(f,fsi,t,3.4); const y=getHeight(p[0],p[2]); const uf=frame(p[0],p[2],0,y); Mt.cyl(uf,0.03,0.03,0,2.35,8,lin('#d9d9d4'),1,false);
    lathe(Cl,uf,[[0,2.75],[1.35,2.3],[1.38,2.22],[0,2.24]],10,lin('#f0c227')); Mt.cyl(uf,0.42,0.42,0.72,0.75,14,lin('#e8e6df')); Mt.cyl(uf,0.04,0.06,0,0.73,6,lin('#555'),1,false); addCollider(p[0],p[2],0,0.8,0.8,y-1,y+0.9);
    for(const a of [0.4,2.0,3.6,5.2]){ const q=uf(Math.cos(a)*0.75,0,Math.sin(a)*0.75); const chf=frame(q[0],q[2],-a,y); Mt.box(chf,-0.2,0.2,0.44,0.48,-0.2,0.2,lin('#e8e6df')); Mt.box(chf,0.17,0.21,0.44,0.86,-0.2,0.2,lin('#e8e6df')); } } }
function posterTex(){ const c=cvs(1024,384), g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,1024,384); gr.addColorStop(0,'#f6d34a'); gr.addColorStop(1,'#f39a2b'); g.fillStyle=gr; g.fillRect(0,0,1024,384);
  for(let i=0;i<26;i++){ g.fillStyle=pick(['#d62828','#3a9d23','#f77f00','#7b2cbf','#e63946','#90be6d']); g.beginPath(); g.arc(560+rnd(0,440),rnd(60,340),rnd(22,46),0,TAU); g.fill(); }
  g.fillStyle='#ffffff'; g.font='800 78px Manrope, Arial'; g.fillText('Svježe',40,150); g.fillText('svaki dan',40,245); g.font='600 34px Manrope, Arial'; g.fillText('voće · povrće · kruh',44,320); return mkTex(c,{repeat:false}); }
/* ---------- Kapela sv. Josipa ---------- */
function chapel(cs,scene,b){
  let [cx,cz,ang,L,W]=b.rect; if(Math.cos(ang)<0) ang+=Math.PI; // +x east (apse)
  const f=frame(cx,cz,ang); const y0=b.hmax+0.3, yb=b.hmin-0.6; b.y0=y0; const wallC=lin('#f5f2ea'), roofC=lin('#6b3f2e'), sofC=lin('#e8e2d4'), stoneC=lin('#a39b8c'), trimC=lin('#e6dcc5');
  const nL=5.6, nw=3.6, e=y0+6.2; const nf=frame(...(()=>{ const p=f(-1.2,0,0); return [p[0],p[2]]; })(),ang);
  emitWalls(cs,nf,ang,nL,nw,yb,e,'gable',48,wallC,'wall'); emitPlinth(cs,nf,ang,nL,nw,yb,y0+0.6,stoneC); const rt=emitRoof(cs,nf,ang,nL,nw,e,'gable',48,0.45,0.35,roofC,sofC);
  const Wn=cs.get('win',cx,cz), T=cs.get('trim',cx,cz);
  for(const sk of [2,3]){ const si=sideInfo(sk,nL,nw); for(const t of [-2.2,2.2]) decal(Wn,nf,ang,si,t,y0+2.2,'arched',0.05,1.0); }
  const w=sideInfo(1,nL,nw); decal(Wn,nf,ang,w,0,y0-0.02,'door_wood2'); decal(Wn,nf,ang,w,0,y0+3.4,'round',0.05,0.8);
  // apse
  { const R=nw*0.92, G=cs.get('wall',cx,cz), Rf=cs.get('roof',cx,cz); const ac=nf(nL,0,0); const af=frame(ac[0],ac[2],ang); const segs=5; const pts=[]; for(let i=0;i<=segs;i++){ const a=-Math.PI/2+i/segs*Math.PI; pts.push([Math.cos(a)*R,Math.sin(a)*R]); }
    const ea=e-0.6, tanP=Math.tan(45*Math.PI/180);
    for(let i=0;i<segs;i++){ const [x0,z0]=pts[i],[x1,z1]=pts[i+1]; const out=worldN(ang,[(x0+x1)/2,(z0+z1)/2]); G.quad(af(x0,yb,z0),af(x1,yb,z1),af(x1,ea,z1),af(x0,ea,z0),[0,0],[1,0],[1,2],[0,2],wallC,out);
      const s0=(R+0.4)/R; Rf.tri(af(x0*s0,ea-0.4*tanP,z0*s0),af(x1*s0,ea-0.4*tanP,z1*s0),af(0,ea+R*0.95,0),[0,0],[1,0],[0.5,1.5],roofC,[out[0],1,out[2]]); } }
  // bell turret on west end of ridge
  const tp=nf(-nL+1.0,0,0); const tf=frame(tp[0],tp[2],ang);
  const G=cs.get('wood',cx,cz); G.box(tf,-0.6,0.6,rt-1.2,rt+1.5,-0.6,0.6,lin('#e9e4da'),0.5); T.box(tf,-0.7,0.7,rt+1.5,rt+1.6,-0.7,0.7,trimC);
  const H=cs.get('metal',cx,cz); lathe(H,tf,[[0.95,rt+1.6],[0.5,rt+2.6],[0.12,rt+3.4],[0,rt+3.7]],4,lin('#454a4f'),Math.PI/4);
  const gC=lin('#c9a55a'); const gg=cs.get('gold',cx,cz); gg.box(tf,-0.04,0.04,rt+3.6,rt+4.5,-0.04,0.04,gC); gg.box(tf,-0.04,0.04,rt+4.1,rt+4.2,-0.3,0.3,gC);
  const wp=nf(-nL-6,0,0); LANDMARKS.chapel={x:wp[0],z:wp[2],look:[cx,cz]};
}
/* ---------- Osnovna škola Lijepa Naša ---------- */
function school(cs,scene,b){
  const y0=b.hmax+0.2, yb=b.hmin-0.8; b.y0=y0; const wallC=lin('#eab39b'), bandC=lin('#f6f1ea'), roofC=lin('#7a4232'), sofC=lin('#efe9df'), stoneC=lin('#9a958a');
  const Wn=cs.get('win',b.rect[0],b.rect[1]), T=cs.get('trim',b.rect[0],b.rect[1]);
  let best=null;
  b.rects.forEach((r0,i)=>{ let [cx,cz,ang,L,W,fl]=r0; if(W>L){ ang+=Math.PI/2; const t=L; L=W; W=t; fl=(fl&1?8:0)|(fl&2?4:0)|(fl&4?1:0)|(fl&8?2:0); }
    const f=frame(cx,cz,ang); const hl=L/2, hw=W/2; const gym=(i===4); const e=y0+(gym?8.4:7.0);
    emitWalls(cs,f,ang,hl,hw,yb,e,'none',16,wallC,'wall'); emitPlinth(cs,f,ang,hl,hw,yb,y0+0.5,stoneC); emitRoof(cs,f,ang,hl,hw,e,'hip',gym?12:17,0.6,0.6,roofC,sofC,'roof',fl);
    for(let sk=0;sk<4;sk++){ if(!(fl&(1<<sk))) continue; const si=sideInfo(sk,hl,hw); const n=Math.floor(si.len/3.0);
      const nW=worldN(ang,si.n); const wp=wallPoint(f,si,0,0); if(!gym && nW[2]>0.9 && si.len>14 && (!best || wp[2]>best.z)) best={f,ang,si,z:wp[2],cx,cz};
      for(let k=0;k<n;k++){ const t=-si.e+si.len*(k+0.5)/n; if(gym){ decal(Wn,f,ang,si,t,y0+5.2,'school',0.05,1.0); } else { if(Math.abs(t)<2.2 && best && best.si===si) continue; decal(Wn,f,ang,si,t,y0+0.95,'school'); decal(Wn,f,ang,si,t,y0+4.35,'school'); } }
      const p=wallPoint(f,si,0,0.1); const bf=frame(p[0],p[2],ang); const ex=sk<2?0.1:si.e+0.1, ez=sk<2?si.e+0.1:0.1; T.box(bf,-ex,ex,y0+3.3,y0+3.6,-ez,ez,bandC,1,0x3f); }
  });
  if(best){ const {f,ang,si}=best; for(const t of [-0.75,0.75]) decal(Wn,f,ang,si,t,y0-0.02,'door_glass',0.08);
    const sp=wallPoint(f,si,0,0.14); signMesh(scene,signTex(['Osnovna škola Lijepa Naša'],{w:1024,h:128,bg:'#f6f1ea',fg:'#2a4a7a',border:null,size:58}),6.5,0.8,sp[0],y0+3.05,sp[2],sideAngle(ang,si));
    const cp=wallPoint(f,si,0,1.1); const cf=frame(cp[0],cp[2],ang); const ex=si.r[0]!==0?2.2:1.1, ez=si.r[0]!==0?1.1:2.2; T.box(cf,-ex,ex,y0+2.72,y0+2.88,-ez,ez,bandC);
    const lp=wallPoint(f,si,0,18); LANDMARKS.school={x:lp[0],z:lp[2],look:[best.cx,best.cz]}; }
}
/* ---------- wayside shrine (kapelica) ---------- */
function shrine(cs,b){ const [cx,cz,ang]=b.rect; const f=frame(cx,cz,ang); const y0=b.hmin-0.2; const wallC=lin('#f3efe6'), roofC=lin('#7d3e2c');
  const G=cs.get('wall',cx,cz); G.box(f,-0.7,0.7,y0,y0+2.3,-0.6,0.6,wallC,0.5); emitRoof(cs,frame(cx,cz,ang),ang,0.7,0.6,y0+2.3,'gable',45,0.25,0.2,roofC,lin('#5a3a26'));
  const Wn=cs.get('win',cx,cz); const si=sideInfo(b.f,0.7,0.6); decal(Wn,f,ang,si,0,y0+0.9,'arched',0.03,0.55);
  const gC=lin('#3a2a20'); const T=cs.get('trim',cx,cz); const rt=y0+2.3+0.6; T.box(f,-0.03,0.03,rt,rt+0.7,-0.03,0.03,gC); T.box(f,-0.03,0.03,rt+0.4,rt+0.47,-0.22,0.22,gC); }
function tank(cs,b){ const [cx,cz,ang,L,W]=b.rect; const f=frame(cx,cz,ang); const y0=b.hmin; const G=cs.get('curb',cx,cz); G.box(f,-L/2,L/2,y0-1,y0+2.2,-W/2,W/2,lin('#c8c4ba'),0.4); cs.get('trim',cx,cz).box(f,-L/2-0.1,L/2+0.1,y0+2.2,y0+2.4,-W/2-0.1,W/2+0.1,lin('#9d998f')); const Wn=cs.get('win',cx,cz); decal(Wn,f,ang,sideInfo(b.f,L/2,W/2),0,y0-0.02,'garage_white',0.03,0.8); }
/* ---------- statue column at the junction ---------- */
function statueColumn(cs,x,z){ const y=getHeight(x,z); const f=frame(x,z,0.3); const S=cs.get('stonem',x,z); const c=lin('#dcd6c8'), c2=lin('#cfc8b8');
  S.box(f,-1.6,1.6,y-0.4,y+0.2,-1.6,1.6,lin('#b9b3a6'),0.5); S.box(f,-0.75,0.75,y+0.2,y+1.7,-0.75,0.75,c2,0.5); S.box(f,-0.9,0.9,y+1.7,y+1.9,-0.9,0.9,c,0.5);
  lathe(S,f,[[0.34,y+1.9],[0.3,y+2.2],[0.26,y+5.4],[0.36,y+5.6]],12,c); S.box(f,-0.5,0.5,y+5.6,y+5.85,-0.5,0.5,c,0.5);
  // figure
  lathe(S,f,[[0.36,y+5.85],[0.38,y+6.3],[0.3,y+6.9],[0.24,y+7.1],[0.12,y+7.2]],12,lin('#e8e3d6'));
  lathe(S,f,[[0,y+7.15],[0.12,y+7.2],[0.13,y+7.35],[0.09,y+7.48],[0,y+7.52]],10,lin('#ece7da'));
  const g=cs.get('gold',x,z); lathe(g,f,[[0.2,y+7.55],[0.24,y+7.55],[0.24,y+7.6],[0.2,y+7.6]],14,lin('#c9a55a'));
  addCollider(x,z,0.3,3.2,3.2,y-1,y+8);
  PROPS_EXTRA.push({t:'bushring',x,z,r:2.6});
  LANDMARKS.column={x:x+8,z:z-6,look:[x,z]};
}
const LANDMARKS={};
const PROPS_EXTRA=[];

function countyFlagTex(){ const c=cvs(256,512), g=c.getContext('2d'); g.fillStyle='#c8161d'; g.fillRect(0,0,128,512); g.fillStyle='#f3c316'; g.fillRect(128,0,128,512); g.fillStyle='#f6f2e8'; g.beginPath(); g.moveTo(78,150); g.lineTo(178,150); g.lineTo(178,250); g.quadraticCurveTo(128,300,78,250); g.closePath(); g.fill(); g.fillStyle='#1d4f9c'; g.fillRect(98,170,60,50); return mkTex(c,{repeat:false}); }
function muniFlagTex(){ const c=cvs(256,512), g=c.getContext('2d'); g.fillStyle='#7fc2e6'; g.fillRect(0,0,256,512); g.fillStyle='#f4f2ea'; g.beginPath(); g.moveTo(78,150); g.lineTo(178,150); g.lineTo(178,250); g.quadraticCurveTo(128,300,78,250); g.closePath(); g.fill(); g.fillStyle='#2f7a3a'; g.beginPath(); g.moveTo(128,168); g.lineTo(162,238); g.lineTo(94,238); g.closePath(); g.fill(); g.fillStyle='#e8c23a'; for(let k=0;k<8;k++){ const a=k/8*TAU; g.beginPath(); g.arc(128+Math.cos(a)*70,205+Math.sin(a)*70,6,0,TAU); g.fill(); } return mkTex(c,{repeat:false}); }
