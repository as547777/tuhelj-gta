/* ===================== Kafić Putniku: enterable terrace + bar room ===================== */
function pineTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); const n=12, bw=S/n;
  for(let i=0;i<n;i++){ const base=pick(['#c9853f','#d49348','#c27a38','#d99d55','#cc8a45']); g.fillStyle=base; g.fillRect(i*bw,0,bw,S);
    for(let k=0;k<9;k++){ g.strokeStyle=`rgba(120,60,20,${rnd(0.08,0.2)})`; g.lineWidth=rnd(0.6,1.6); g.beginPath(); const x=i*bw+rnd(2,bw-2); g.moveTo(x,0); for(let y=0;y<=S;y+=32) g.lineTo(x+Math.sin(y*0.02+k)*rnd(0.5,2.5),y); g.stroke(); }
    if(RNG()<0.6){ const ky=rnd(20,S-20), kx=i*bw+rnd(8,bw-8); g.fillStyle='rgba(110,55,20,0.55)'; g.beginPath(); g.ellipse(kx,ky,rnd(2,4),rnd(4,8),0,0,TAU); g.fill(); }
    g.fillStyle='rgba(70,35,10,0.75)'; g.fillRect(i*bw,0,2,S); g.fillStyle='rgba(255,220,170,0.18)'; g.fillRect(i*bw+2,0,1,S); }
  return mkTex(c); }
function tileFloorTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#6f7479'; g.fillRect(0,0,S,S); const n=2, t=S/n;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const v=rnd(-10,10); g.fillStyle=`rgb(${146+v},${150+v},${155+v})`; g.fillRect(i*t+3,j*t+3,t-6,t-6); for(let k=0;k<120;k++){ g.fillStyle=`rgba(${pick(['255,255,255','60,60,60'])},${rnd(0.03,0.08)})`; g.fillRect(i*t+rnd(4,t-8),j*t+rnd(4,t-8),rnd(2,10),rnd(2,10)); } }
  return mkTex(c); }
function muralTex(){ const W=1850,H=600, c=cvs(W,H), g=c.getContext('2d'); g.fillStyle='#3f4246'; g.fillRect(0,0,W,H); const px=W/9.25;
  for(const [c0,r] of [[3.75,1.62],[6.75,1.25]]){ g.save(); g.beginPath(); g.rect(0,22,W,H-60); g.clip(); g.fillStyle='#efefed'; g.beginPath(); g.arc(c0*px,H*0.5,r*px,0,TAU); g.fill(); g.restore();
    g.fillStyle='#3f4246'; for(const sx of [-1,1]) for(const sy of [-1,1]){ const x=c0*px+sx*r*px*0.72, y=H*0.5+sy*(H*0.5-30); g.fillRect(x-(sx<0?40:0),y-(sy<0?0:28),40,28); } }
  g.fillStyle='#cfd0cd'; g.fillRect(0,H-38,W,38); return mkTex(c,{repeat:false}); }
function barPanelTex(){ const W=512,H=256, c=cvs(W,H), g=c.getContext('2d'); const base='#6a2a17'; g.fillStyle=base; g.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){ g.strokeStyle=`rgba(40,12,5,${rnd(0.05,0.15)})`; g.lineWidth=rnd(1,3); g.beginPath(); const y=rnd(0,H); g.moveTo(0,y); g.bezierCurveTo(W*0.3,y+rnd(-8,8),W*0.6,y+rnd(-8,8),W,y+rnd(-6,6)); g.stroke(); }
  g.strokeStyle='rgba(30,8,3,0.8)'; g.lineWidth=6; g.strokeRect(14,14,W-28,H-28); g.strokeStyle='rgba(160,80,50,0.35)'; g.lineWidth=2; g.strokeRect(20,20,W-40,H-40);
  const dm=(cx,cy,w,h,mir)=>{ g.beginPath(); g.moveTo(cx,cy-h); g.lineTo(cx+w,cy); g.lineTo(cx,cy+h); g.lineTo(cx-w,cy); g.closePath(); g.fillStyle='#4c1b0d'; g.fill(); g.lineWidth=5; g.strokeStyle='#8a4428'; g.stroke();
    if(mir){ g.beginPath(); g.moveTo(cx,cy-h*0.62); g.lineTo(cx+w*0.62,cy); g.lineTo(cx,cy+h*0.62); g.lineTo(cx-w*0.62,cy); g.closePath(); const gr=g.createLinearGradient(cx-w,cy-h,cx+w,cy+h); gr.addColorStop(0,'#dfe6e8'); gr.addColorStop(0.5,'#9aa4a8'); gr.addColorStop(1,'#eef2f2'); g.fillStyle=gr; g.fill(); } };
  dm(W/2,H/2,150,78,true); return mkTex(c,{repeat:false}); }
function stripeTex(){ const c=cvs(128,128), g=c.getContext('2d'); for(let x=0;x<128;x+=32){ g.fillStyle='#e9e2cf'; g.fillRect(x,0,20,128); g.fillStyle='#4f6b52'; g.fillRect(x+20,0,6,128); g.fillStyle='#c9bfa4'; g.fillRect(x+26,0,6,128); } for(let y=0;y<128;y+=16){ g.fillStyle='rgba(160,60,70,0.55)'; g.beginPath(); g.arc(10,y+8,3,0,TAU); g.arc(74,y+8,3,0,TAU); g.fill(); } return mkTex(c); }
function kanalicaTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#5a2c1c'; g.fillRect(0,0,S,S); const cw=S/6, rh=S/5;
  for(let row=-1;row<6;row++) for(let i=0;i<6;i++){ const x=i*cw, y=row*rh+(i%2)*rh*0.25; const col=pick(['#a4563a','#b0603f','#96503a','#b86b48','#8e4a32','#a85f44']); const gr=g.createLinearGradient(x,0,x+cw,0); gr.addColorStop(0,colAdj(col,-40)); gr.addColorStop(0.5,colAdj(col,22)); gr.addColorStop(1,colAdj(col,-45));
    g.fillStyle=gr; g.beginPath(); g.moveTo(x+cw*0.08,y); g.lineTo(x+cw*0.92,y); g.lineTo(x+cw*0.96,y+rh*1.08); g.quadraticCurveTo(x+cw/2,y+rh*1.2,x+cw*0.04,y+rh*1.08); g.closePath(); g.fill(); g.strokeStyle='rgba(30,12,6,0.5)'; g.lineWidth=2; g.stroke();
    if(RNG()<0.4){ g.fillStyle=`rgba(40,30,20,${rnd(0.08,0.22)})`; g.fillRect(x+rnd(0,cw*0.6),y+rnd(0,rh*0.6),rnd(6,20),rnd(6,20)); } }
  return mkTex(c); }
function laminateTex(){ const W=512,H=512, c=cvs(W,H), g=c.getContext('2d'); const n=4, bw=W/n; for(let i=0;i<n;i++){ let y=-(i*97)%160; while(y<H){ const L=rnd(150,260); const v=rnd(-12,12); g.fillStyle=`rgb(${176+v},${170+v},${160+v})`; g.fillRect(i*bw,y,bw,L);
    for(let k=0;k<7;k++){ g.strokeStyle=`rgba(110,100,90,${rnd(0.08,0.2)})`; g.lineWidth=rnd(0.5,1.5); g.beginPath(); const x=i*bw+rnd(3,bw-3); g.moveTo(x,y); g.lineTo(x+rnd(-3,3),y+L); g.stroke(); } g.fillStyle='rgba(70,65,60,0.55)'; g.fillRect(i*bw,y,bw,2); y+=L; } g.fillStyle='rgba(70,65,60,0.6)'; g.fillRect(i*bw,0,2,H); }
  return mkTex(c); }
function bathTileTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#9f978c'; g.fillRect(0,0,S,S); for(let j=0;j<4;j++){ const v=rnd(-8,8); g.fillStyle=`rgb(${196+v},${189+v},${178+v})`; g.fillRect(3,j*128+3,S-6,122); for(let k=0;k<14;k++){ g.strokeStyle=`rgba(150,140,128,${rnd(0.1,0.25)})`; g.beginPath(); const y=j*128+rnd(8,120); g.moveTo(0,y); g.bezierCurveTo(S*0.3,y+rnd(-5,5),S*0.7,y+rnd(-5,5),S,y+rnd(-4,4)); g.stroke(); } } return mkTex(c); }
function duvetTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#b9bcbf'; g.fillRect(0,0,S,S);
  for(let i=0;i<26;i++){ const x=rnd(0,S), y=rnd(0,S), r=rnd(26,46); g.fillStyle=pick(['#e9e9e6','#d9d4c6','#8e9296','#f2efe8']); for(const [dx,dy,k] of [[0,0,1],[r*0.7,r*0.1,0.75],[-r*0.7,r*0.15,0.7],[r*0.2,-r*0.45,0.7]]){ g.beginPath(); g.arc(x+dx,y+dy,r*k*0.6,0,TAU); g.fill(); } }
  const star=(x,y,r,col)=>{ g.fillStyle=col; g.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, rr=k%2?r*0.45:r; g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } g.fill(); };
  for(let i=0;i<70;i++) star(rnd(0,S),rnd(0,S),rnd(5,13),pick(['#9a7a4a','#5b6068','#f2efe6','#b08a55'])); return mkTex(c); }
function roseDecalTex(){ const c=cvs(512,256), g=c.getContext('2d'); g.clearRect(0,0,512,256); g.fillStyle='#141414';
  const rose=(cx,cy,R,rot)=>{ g.save(); g.translate(cx,cy); g.rotate(rot); for(let k=0;k<7;k++){ const a=k*0.9, r=R*(1-k*0.11); g.beginPath(); g.ellipse(Math.cos(a)*r*0.25,Math.sin(a)*r*0.25,r,r*0.62,a,0,Math.PI*1.35); g.lineWidth=R*0.09; g.strokeStyle='#141414'; g.stroke(); }
    g.beginPath(); g.ellipse(0,0,R*1.05,R*0.8,0,0,TAU); g.lineWidth=R*0.12; g.stroke(); g.beginPath(); g.moveTo(-R*0.2,R*0.75); g.quadraticCurveTo(-R*0.6,R*1.6,-R*0.3,R*2.2); g.lineWidth=R*0.12; g.stroke(); g.beginPath(); g.ellipse(-R*0.75,R*1.3,R*0.35,R*0.16,-0.6,0,TAU); g.fill(); g.restore(); };
  rose(150,100,70,0.2); rose(380,90,48,-0.3); return mkTex(c,{repeat:false}); }
function fridgeTex(){ const W=256,H=512, c=cvs(W,H), g=c.getContext('2d'); g.fillStyle='#10160f'; g.fillRect(0,0,W,H); const gr=g.createLinearGradient(0,0,W,0); gr.addColorStop(0,'rgba(255,255,255,0.05)'); gr.addColorStop(0.5,'rgba(255,255,255,0.18)'); gr.addColorStop(1,'rgba(255,255,255,0.04)');
  for(let sh=0;sh<5;sh++){ const y=40+sh*92; g.fillStyle='#c9ced0'; g.fillRect(12,y+80,W-24,4); for(let x=18;x<W-24;x+=rnd(16,24)){ const hh=rnd(48,74); const col=pick(['#2f7a2c','#6b3b1a','#d9d9d0','#c9a24a','#b2291f','#1c4a8a','#e8e0c0']); g.fillStyle=col; g.fillRect(x,y+80-hh,13,hh); g.fillRect(x+4,y+80-hh-14,5,14); g.fillStyle='rgba(255,255,255,0.35)'; g.fillRect(x+2,y+80-hh+4,2,hh-8); } }
  g.fillStyle=gr; g.fillRect(0,0,W,H); return mkTex(c,{repeat:false}); }
function pubMaterials(){ TEX.pine=pineTex(); TEX.tileF=tileFloorTex(); TEX.mural=muralTex();
  return { pine:new THREE.MeshStandardMaterial({map:TEX.pine,normalMap:normalMapFrom(TEX.pine,2.2),normalScale:new THREE.Vector2(0.6,0.6),vertexColors:true,roughness:0.62}),
    floorT:new THREE.MeshStandardMaterial({map:TEX.tileF,normalMap:normalMapFrom(TEX.tileF,2.0),normalScale:new THREE.Vector2(0.5,0.5),vertexColors:true,roughness:0.32,metalness:0.05}),
    mural:new THREE.MeshStandardMaterial({map:TEX.mural,roughness:0.9,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
    blackGlass:new THREE.MeshStandardMaterial({color:0x08090b,roughness:0.04,metalness:0.35,envMapIntensity:1.3}),
    chrome:new THREE.MeshStandardMaterial({color:0xdfe3e7,roughness:0.18,metalness:1.0}),
    bottle:new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.08,metalness:0.1,envMapIntensity:1.2}),
    barPanel:new THREE.MeshStandardMaterial({map:barPanelTex(),roughness:0.42,metalness:0.05}),
    stripe:new THREE.MeshStandardMaterial({map:stripeTex(),vertexColors:true,roughness:0.9}),
    roofK:(()=>{ TEX.kanal=kanalicaTex(); return new THREE.MeshStandardMaterial({map:TEX.kanal,normalMap:normalMapFrom(TEX.kanal,4.0),normalScale:new THREE.Vector2(1.4,1.4),vertexColors:true,roughness:0.8}); })(),
    lamin:(()=>{ TEX.lamin=laminateTex(); return new THREE.MeshStandardMaterial({map:TEX.lamin,normalMap:normalMapFrom(TEX.lamin,1.4),normalScale:new THREE.Vector2(0.35,0.35),vertexColors:true,roughness:0.45}); })(),
    tileW:(()=>{ TEX.tileW=bathTileTex(); return new THREE.MeshStandardMaterial({map:TEX.tileW,vertexColors:true,roughness:0.3}); })(),
    duvet:new THREE.MeshStandardMaterial({map:duvetTex(),vertexColors:true,roughness:0.95}),
    roseDecal:new THREE.MeshStandardMaterial({map:roseDecalTex(),alphaTest:0.5,roughness:0.9,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
    fridge:new THREE.MeshStandardMaterial({map:fridgeTex(),roughness:0.15,metalness:0.1,emissive:0xffffff,emissiveIntensity:0.12,emissiveMap:null}) }; }
// polygon with holes, custom uv
function texPoly(G,m,outline,holes,C,uv){ const V=outline.map(p=>new THREE.Vector2(p[0],p[1])); const H=holes.map(h=>h.map(p=>new THREE.Vector2(p[0],p[1]))); const tris=THREE.ShapeUtils.triangulateShape(V,H); const all=outline.concat(...holes); const N=m.W(0,0,1);
  for(const t of tris){ const A=all[t[0]],B=all[t[1]],D=all[t[2]]; G.tri(m.P(A[0],A[1]),m.P(B[0],B[1]),m.P(D[0],D[1]),uv(A),uv(B),uv(D),C,N); } }
function floorPoly(G,f,pts,y,C,sc=1.2,rot=0){ const V=pts.map(p=>new THREE.Vector2(p[0],p[1])); const tris=THREE.ShapeUtils.triangulateShape(V,[]); const cr=Math.cos(rot), sr=Math.sin(rot); const uv=(p)=>[(p[0]*cr-p[1]*sr)/sc,(p[0]*sr+p[1]*cr)/sc]; for(const t of tris){ const A=pts[t[0]],B=pts[t[1]],D=pts[t[2]]; G.tri(f(A[0],y,A[1]),f(B[0],y,B[1]),f(D[0],y,D[1]),uv(A),uv(B),uv(D),C,[0,1,0]); } }
function ceilPoly(G,f,pts,y,C){ const V=pts.map(p=>new THREE.Vector2(p[0],p[1])); const tris=THREE.ShapeUtils.triangulateShape(V,[]); for(const t of tris){ const A=pts[t[0]],B=pts[t[1]],D=pts[t[2]]; G.tri(f(A[0],y,A[1]),f(B[0],y,B[1]),f(D[0],y,D[1]),[0,0],[1,0],[0,1],C,[0,-1,0]); } }
// inner face of an outer wall segment a->c (offset inward by th), holes given in OUTER facade coords
function innerWall(G,f,ang,a,c,th,yb,yt,holesOuter,C){ const dx=c[0]-a[0], dz=c[1]-a[1], L=Math.hypot(dx,dz); const nx=-dz/L, nz=dx/L; const a2=[c[0]-nx*th,c[1]-nz*th], c2=[a[0]-nx*th,a[1]-nz*th];
  const m=segMap(f,ang,a2,c2); const holes=holesOuter.map(h=>h.map(([s,y])=>[L-s,y]).reverse()); facadeSeg(G,m,[[0,yb],[m.L,yb],[m.L,yt],[0,yt]],holes,C); return m; }
function chairAt(Gm,Gc,Gw,x,z,y,a){ const T=frame(x,z,a,y); const MC=lin('#3a3d41'), W=lin('#a8733f'), CU=lin('#8d9196');
  for(const [lx,lz] of [[-0.21,-0.2],[0.21,-0.2],[-0.21,0.2],[0.21,0.2]]) Gm.box(T,lx-0.02,lx+0.02,0,0.44,lz-0.02,lz+0.02,MC);
  Gm.box(T,-0.24,0.24,0.42,0.45,-0.23,0.23,MC); Gc.box(T,-0.22,0.22,0.45,0.5,-0.21,0.21,CU);
  const bk=(yy)=>[0.24+0.1*(yy-0.45)/0.55]; Gm.box(frame(...(()=>{ const p=T(0,0,0.25); return [p[0],p[2]]; })(),a,y),-0.24,0.24,0.47,1.02,-0.02,0.02,MC);
  for(const sx of [-1,1]){ Gw.box(T,sx*0.25-0.03,sx*0.25+0.03,0.66,0.7,-0.24,0.2,W); Gm.box(T,sx*0.25-0.015,sx*0.25+0.015,0.45,0.66,-0.18,-0.15,MC); } }
function pubInterior(cs,scene,o){
  const {f,ang,y0,cx,cz}=o; const PM=o.PM; const G=cs.get('wall',cx,cz), T=cs.get('trim',cx,cz), Mt=cs.get('metal',cx,cz), Wd=cs.get('wood',cx,cz), Cl=cs.get('cloth',cx,cz), Pn=cs.get('pine',cx,cz), Fl=cs.get('floorT',cx,cz), Mu=cs.get('mural',cx,cz), BG=cs.get('blackGlass',cx,cz), Ch=cs.get('chrome',cx,cz), Bt=cs.get('bottle',cx,cz), Gl=cs.get('glow',cx,cz), Hd=cs.get('hedge',cx,cz), Gs=cs.get('glass',cx,cz);
  const ea=o.ea, th=0.25, BEAM=lin('#b86f33');
  /* ---------- terrace: long covered room after the photos ---------- */
  const pts=o.pts; const BL=lin('#b7c0ca');
  for(let i=0;i<pts.length-1;i++){ innerWall(G,f,ang,pts[i],pts[i+1],th,y0-0.01,ea,o.annexHoles[i]||[],i===2?BL:lin('#f2f2ef')); }
  // mural on the main block's wall: charcoal with big white clipped circles, bar door near the entrance, closed door at the back
  { const mm=segMap(f,ang,[3.61,4.0-th],[3.61,-5.25]); const Hm=ea-0.3; const dS=[4.0-th-o.barDoor[1],4.0-th-o.barDoor[0]];
    texPoly(Mu,mm,[[0,y0-0.01],[mm.L,y0-0.01],[mm.L,Hm],[0,Hm]],[holeRect(dS[0],dS[1],y0,y0+2.3)],WHITE,(p)=>[p[0]/mm.L,(p[1]-y0)/(Hm-y0)]);
    const lp=mm.P(dS[1]+0.45,0,-0.02); lathe(G,frame(lp[0],lp[2],ang,0),[[0.16,y0+2.25],[0.18,y0+2.35],[0.12,y0+2.45],[0,y0+2.47]],10,lin('#f4f2ec'));
    for(const s2 of [3.2,6.3]){ const p=mm.P(s2,0,-0.02); const pf=frame(p[0],p[2],ang,0); Wd.box(pf,-0.03,0.03,y0+2.05,y0+2.55,-0.18,0.18,lin('#3b2a1e')); T.box(pf,0.03,0.035,y0+2.1,y0+2.5,-0.14,0.14,lin('#b9a88a')); }

    { const Wn=cs.get('win',cx,cz); segDecal(Wn,f,ang,3.6,4.0-th,3.6,-5.25,8.35,y0-0.02,'door_wood',0.025); } }
  // floor (grey tiles laid diagonally) + walkable zones
  { const fp=insetPoly(o.roofP,th); floorPoly(Fl,f,fp,y0+0.005,lin('#c9ccd0'),1.2,Math.PI/4); Fl.box(f,3.75,6.05,y0-0.05,y0+0.005,3.7,4.3,lin('#c9ccd0'),0.8,4);
    addFloor(f,ang,3.6,10.4,-6.0,2.0,y0); addFloor(f,ang,3.6,8.4,2.0,4.3,y0); addFloor(f,ang,8.4,9.4,2.0,3.0,y0); }
  // wooden ceiling (tongue & groove) following the real hipped roof, with exposed trusses
  { const CE=hipCeiling(Pn,f,ang,o.roofP,ea,30,0.34,lin('#ffffff'),th); const BEAM2=lin('#9a5a2c'); const W3=(x,y,z)=>f(x,y,z);
    const yt=ea-0.1, xr=7.0, zr0=-2.6, zr1=0.6, yr=ea+3.4*Math.tan(30*Math.PI/180)-0.42;
    for(const z of [2.6,-0.2,-3.0,-5.2]) beam(Pn,W3(3.85,yt,z),W3(10.15,yt,z),0.12,BEAM2);
    beam(Pn,W3(xr,yr,zr0),W3(xr,yr,zr1),0.1,BEAM2); for(const z of [-0.2,-3.0]) beam(Pn,W3(xr,yt,z),W3(xr,yr,Math.min(zr1,Math.max(zr0,z))),0.09,BEAM2);
    for(const [a,b] of [[[3.85,-5.75],[xr,zr0]],[[10.15,-5.75],[xr,zr0]],[[3.85,3.75],[xr,zr1]],[[8.3,3.75],[xr,zr1]],[[10.15,1.9],[xr,zr1]]]) beam(Pn,W3(a[0],ea-0.16,a[1]),W3(b[0],yr,b[1]),0.09,BEAM2);
    for(const sx of [-1,1]){ const x=xr+sx*1.65; const y=ea-0.16+(3.4-1.65)*Math.tan(30*Math.PI/180); beam(Pn,W3(x,y-0.05,-4.7),W3(x,y-0.05,2.4),0.08,BEAM2); for(const z of [-0.2,-3.0]) beam(Pn,W3(xr,yt+0.25,z),W3(x,y-0.1,z),0.06,BEAM2); }
    // fluorescent tubes, mirror ball, penny-farthing
    for(const z of [1.4,-1.6]){ const p=f(xr,0,z); const tf=frame(p[0],p[2],ang+Math.PI/2,0); T.box(tf,-0.7,0.7,yt-0.2,yt-0.12,-0.06,0.06,lin('#e9ecef')); Gl.box(tf,-0.66,0.66,yt-0.22,yt-0.2,-0.04,0.04,lin('#f2f7ff')); }
    { const p=f(xr+0.2,0,-0.2); const mf=frame(p[0],p[2],ang,0); beam(Mt,mf(0,yt-0.12,0),mf(0,yt-0.55,0),0.004,lin('#222')); const gg=new THREE.IcosahedronGeometry(0.15,2); const pos=gg.attributes.position; for(let i=0;i<pos.count;i+=3){ const Q=[0,1,2].map(k=>mf(pos.getX(i+k),pos.getY(i+k)+yt-0.7,pos.getZ(i+k))); Ch.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],WHITE,[Q[0][0]-p[0],Q[0][1]-(yt-0.7),Q[0][2]-p[2]]); } }
    { const bx=xr-0.9, by=yr-0.95, bz=2.25; const R1=0.72, R2=0.3; const rust=lin('#4e3e31');
      const ring=(ccx,ccy,r,ccz)=>{ const n=28; for(let k=0;k<n;k++){ const a0=k/n*TAU, a1=(k+1)/n*TAU; beam(Mt,W3(ccx+Math.cos(a0)*r,ccy+Math.sin(a0)*r,ccz),W3(ccx+Math.cos(a1)*r,ccy+Math.sin(a1)*r,ccz),0.022,rust); } for(let k=0;k<14;k++){ const a=k/14*TAU; beam(Mt,W3(ccx,ccy,ccz),W3(ccx+Math.cos(a)*r,ccy+Math.sin(a)*r,ccz),0.005,rust); } };
      ring(bx,by,R1,bz); ring(bx+1.08,by-R1+R2,R2,bz); beam(Mt,W3(bx,by+R1+0.02,bz),W3(bx+0.5,by+R1-0.12,bz),0.028,rust); beam(Mt,W3(bx+0.5,by+R1-0.12,bz),W3(bx+1.08,by-R1+R2,bz),0.028,rust); beam(Mt,W3(bx-0.05,by+R1+0.12,bz-0.3),W3(bx-0.05,by+R1+0.12,bz+0.3),0.018,rust);
      for(const dx of [0,1.0]) beam(Mt,W3(bx+dx,by+(dx?0.2:R1),bz),W3(bx+dx,yr-0.05,bz),0.006,lin('#222')); }
    // speakers, gas heater, projection screen with quiz + desk with laptop
    for(const c of [[4.0,-5.55],[10.0,-5.55],[10.0,3.2]]){ const p=f(c[0],0,c[1]); T.box(frame(p[0],p[2],ang,0),-0.15,0.15,ea-0.8,ea-0.35,-0.15,0.15,lin('#141516')); }
    { const p=f(9.75,0,-4.9); const hf=frame(p[0],p[2],ang,y0); Ch.cyl(hf,0.24,0.24,0,0.06,12,WHITE,1,true); Ch.cyl(hf,0.045,0.045,0.06,2.15,8,WHITE,1,false); lathe(Ch,hf,[[0.08,2.15],[0.44,2.28],[0.46,2.32],[0,2.3]],14,WHITE); addCollider(p[0],p[2],ang,0.5,0.5,y0-1,y0+2.4); }
    { const m=segMap(f,ang,[10.4-th,-6.0+th+0.01],[3.6,-6.0+th+0.01]); const q=(s2,y)=>m.P(s2,y,-0.01); const s0=3.2, s1=6.0; const scr=new THREE.Mesh(new THREE.PlaneGeometry(s1-s0,1.65),new THREE.MeshStandardMaterial({map:quizTex(),emissive:0xffffff,emissiveMap:null,emissiveIntensity:0.08,roughness:0.9}));
      const c2=q((s0+s1)/2,y0+1.8); scr.position.set(c2[0],c2[1],c2[2]); const N=m.W(0,0,1); scr.rotation.y=Math.atan2(N[0],N[2]); scene.add(scr); T.box(m.T,s0-0.05,s1+0.05,y0+2.63,y0+2.7,-0.12,-0.02,lin('#e8e8e4'));
      const dp=f(6.1,0,-5.05); const df=frame(dp[0],dp[2],ang,y0); Wd.box(df,-0.45,0.45,0,0.95,-0.28,0.28,lin('#2a2a2a')); T.box(df,-0.18,0.18,0.95,0.97,-0.12,0.12,lin('#8d9196')); T.box(df,-0.18,0.18,0.97,1.2,0.1,0.12,lin('#1c1f22')); addCollider(dp[0],dp[2],ang,1.0,0.7,y0-1,y0+1.1); }
  }
  // plaster pier where the house wall meets the long room: hides the outer corner trim and closes the gap (seen from inside)
  G.box(f,3.55,4.0,y0-0.02,ea,-5.75,-4.85,lin('#f2f2ef')); localCollider(f,ang,3.55,4.0,-5.75,-4.85,y0-1,ea);
  // round black tables with rattan bases and mesh chairs with wooden armrests; beer bucket
  { const tables=[[5.7,1.0],[8.7,1.3],[5.6,-1.6],[8.7,-1.4],[5.6,-4.0],[8.6,-3.9],[5.6,-6.6],[8.6,-6.8],[5.6,-9.2],[8.6,-9.4],[5.6,-11.8],[8.6,-12.0],[5.6,-14.3],[8.6,-14.4]]; /* tables all the way to the end of the long room */
    tables.forEach(([x,z],i)=>{ const y=y0; const tf=frame(...(()=>{ const p=f(x,0,z); return [p[0],p[2]]; })(),ang,y);
      lathe(Cl,tf,[[0.32,0],[0.2,0.18],[0.13,0.4],[0.2,0.62],[0.42,0.7],[0,0.7]],14,lin('#3a2f26')); lathe(Cl,tf,[[0.47,0.7],[0.49,0.72],[0.47,0.74],[0,0.74]],20,lin('#2e251e')); lathe(BG,tf,[[0.455,0.745],[0.455,0.76],[0,0.762]],24,WHITE);
      const n=4; for(let k=0;k<n;k++){ const a=k/n*TAU+0.4+i*0.3; const px=x+Math.cos(a)*0.8, pz=z+Math.sin(a)*0.8; const p=f(px,0,pz); chairAt(Mt,Cl,Wd,p[0],p[2],y,ang+Math.atan2(-Math.cos(a),Math.sin(a))); }
      const p=f(x,0,z); addCollider(p[0],p[2],ang,1.05,1.05,y0-1,y0+1.1);
      if(i===1){ const bf=frame(p[0],p[2],ang,y+0.762); lathe(Cl,bf,[[0.12,0],[0.17,0.2],[0,0.01]],12,lin('#ef7a1a')); lathe(Cl,bf,[[0.18,0.2],[0.19,0.22],[0.17,0.22]],12,lin('#ef7a1a'));
        for(const [dx,dz] of [[-0.06,0.03],[0.05,-0.05],[0.06,0.06]]){ const bp=bf(dx,0,dz); const bt=frame(bp[0],bp[2],ang,y+0.78); lathe(Bt,bt,[[0.035,0],[0.035,0.16],[0.013,0.23],[0.013,0.27],[0,0.27]],8,lin('#2f7a2c')); }
        for(const [dx,dz] of [[0.28,0.22],[-0.3,-0.2]]){ const gp=f(x+dx,0,z+dz); lathe(Gs,frame(gp[0],gp[2],ang,y+0.762),[[0.035,0],[0.006,0.01],[0.006,0.09],[0.03,0.11],[0.042,0.16],[0.036,0.22]],10,WHITE); } } }); }
  // topiary boxwood balls by the bar door, plants on the window sills
  for(const zz of [o.barDoor[1]+0.3,o.barDoor[0]-0.35]){ if(zz>3.7) continue; const p=f(3.6+th+0.3,0,zz); const pf=frame(p[0],p[2],ang,y0); lathe(Cl,pf,[[0.15,0],[0.19,0.3],[0,0.3]],10,lin('#8a4a2f')); Wd.cyl(pf,0.018,0.018,0.3,1.6,5,lin('#c8a04a'),1,false);
    for(const yb of [0.95,1.55]){ const g2=new THREE.IcosahedronGeometry(0.22,1); const pos=g2.attributes.position; for(let i=0;i<pos.count;i+=3){ const a=[pos.getX(i),pos.getY(i),pos.getZ(i)], b=[pos.getX(i+1),pos.getY(i+1),pos.getZ(i+1)], c=[pos.getX(i+2),pos.getY(i+2),pos.getZ(i+2)]; const w=(q)=>pf(q[0],q[1]+yb,q[2]); const mid=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3]; Hd.tri(w(a),w(b),w(c),[a[0]*2,a[1]*2],[b[0]*2,b[1]*2],[c[0]*2,c[1]*2],lin('#4f7d34'),worldN(ang,[mid[0],mid[2]]).map((v,k)=>k===1?mid[1]:v)); } } addCollider(p[0],p[2],ang,0.45,0.45,y0-1,y0+1.8); }
  for(const [x,z] of [[10.1,-2.1],[9.2,-5.75],[10.1,0.4]]){ const p=f(x,0,z); const pf=frame(p[0],p[2],ang,y0+0.45); lathe(Cl,pf,[[0.08,0],[0.1,0.14],[0,0.14]],8,lin('#e9e6de')); const g2=new THREE.IcosahedronGeometry(0.16,0); const pos=g2.attributes.position; for(let i=0;i<pos.count;i+=3){ const P=[0,1,2].map(k=>pf(pos.getX(i+k),pos.getY(i+k)+0.3,pos.getZ(i+k))); Hd.tri(P[0],P[1],P[2],[0,0],[1,0],[0,1],lin('#3f7a33'),[0,1,0]); } }
  /* ---------- bar room (ground floor of the main block), after the photo ---------- */
  { const X0=-4.6, X1=3.6-th, Z0=-5.25+th, Z1=4.25-th, yc=y0+3.0; const WAL=lin('#f2efe9'); const BP=cs.get('barPanel',cx,cz), SP=cs.get('stripe',cx,cz), Fr=cs.get('fridge',cx,cz);
    innerWall(G,f,ang,[X0-0.001,4.25],[3.6,4.25],th,y0-0.01,yc,o.frontHoles.map(h=>h.map(([s2,y])=>[s2-(X0+10.5),y])).filter(h=>h.every(p=>p[0]>0.05&&p[0]<3.6-X0-0.05)),WAL);
    innerWall(G,f,ang,[3.6,4.25],[3.6,-5.25],th,y0-0.01,yc,[holeRect(4.25-o.barDoor[1],4.25-o.barDoor[0],y0,y0+2.3)],WAL);
    innerWall(G,f,ang,[3.6,-5.25],[X0-0.001,-5.25],th,y0-0.01,yc,o.backHoles.filter(h=>h.every(p=>p[0]>0.05&&p[0]<3.6-X0-0.05)),WAL);
    { const m=segMap(f,ang,[X0,Z1],[X0,Z0]); facadeSeg(G,m,[[0,y0-0.01],[m.L,y0-0.01],[m.L,yc],[0,yc]],[],WAL); const Wn=cs.get('win',cx,cz); segDecal(Wn,f,ang,X0,Z1,X0,Z0,m.L*0.22,y0-0.02,'door_wood',0.02); localCollider(f,ang,X0-0.25,X0,Z0,Z1,y0-3,y0+10);
      for(const s2 of [4.2,5.4]){ const p=m.P(s2,0,-0.02); const pf=frame(p[0],p[2],ang,0); Wd.box(pf,-0.02,0.03,y0+1.75,y0+2.3,-0.24,0.24,lin('#2c211a')); T.box(pf,0.03,0.035,y0+1.8,y0+2.25,-0.2,0.2,lin('#9c9a90')); } }
    // flat ceiling + barrel vault over the bar
    const vz0=Z0, vz1=-2.0, ys=y0+2.45, rise=0.5; ceilPoly(G,f,[[X0,vz1],[X1,vz1],[X1,Z1],[X0,Z1]],yc,lin('#f5f3ee'));
    { const N=12, zc=(vz0+vz1)/2, hw=(vz1-vz0)/2; const R=(hw*hw+rise*rise)/(2*rise); const yc0=ys+rise-R; let prev=null;
      for(let k=0;k<=N;k++){ const a=Math.asin(hw/R)*(k/N*2-1); const z=zc+Math.sin(a)*R, y=yc0+Math.cos(a)*R; if(prev){ const nz=-(Math.sin((prev.a+a)/2)), ny=-Math.cos((prev.a+a)/2); G.quad(f(X0,prev.y,prev.z),f(X1,prev.y,prev.z),f(X1,y,z),f(X0,y,z),[0,0],[1,0],[1,1],[0,1],lin('#f7f6f2'),[worldN(ang,[0,nz])[0],ny,worldN(ang,[0,nz])[2]]); } prev={a,y,z}; }
      G.quad(f(X0,ys,vz1),f(X1,ys,vz1),f(X1,yc,vz1),f(X0,yc,vz1),[0,0],[1,0],[1,1],[0,1],lin('#f7f6f2'),worldN(ang,[0,1])); }
    floorPoly(Fl,f,[[X0,Z0],[X1,Z0],[X1,Z1],[X0,Z1]],y0+0.005,lin('#ffd39c'),0.9);
    addFloor(f,ang,X0,3.6,Z0,Z1,y0);
    const MAH=lin('#6f2d18'), MAH2=lin('#5a2212');
    // back bar: cabinets, glass shelves with glasses, espresso machine, ice machine, register
    const bx0=-3.3, bx1=1.4, bz=Z0; Wd.box(f,bx0,bx1,y0,y0+0.9,bz,bz+0.55,MAH2,0.8); BG.box(f,bx0,bx1,y0+0.9,y0+0.94,bz,bz+0.57,WHITE);
    for(let x=bx0+0.05;x<bx1-0.3;x+=0.62){ const q=(xx,yy)=>f(xx,yy,bz+0.556); BP.quad(q(x,y0+0.08),q(x+0.56,y0+0.08),q(x+0.56,y0+0.82),q(x,y0+0.82),[0,0],[1,0],[1,1],[0,1],WHITE,worldN(ang,[0,1])); }
    Wd.box(f,bx0,bx1,y0+0.94,y0+2.35,bz,bz+0.04,MAH,0.8); for(const x of [bx0,bx1-0.06]) Wd.box(f,x,x+0.06,y0+0.94,y0+2.35,bz,bz+0.34,MAH,0.8);
    for(const yy of [y0+1.35,y0+1.72,y0+2.08]){ Gs.box(f,bx0+0.06,bx1-0.06,yy-0.012,yy,bz+0.04,bz+0.32,WHITE); for(let x=bx0+0.14;x<bx1-0.12;x+=0.13){ const p=f(x,0,bz+0.17); const gf=frame(p[0],p[2],ang,yy); if(yy<y0+2) lathe(Gs,gf,[[0.03,0],[0.034,0.11],[0,0.11]],8,WHITE); else lathe(Gs,gf,[[0.028,0],[0.004,0.01],[0.004,0.08],[0.03,0.1],[0.036,0.15]],8,WHITE); } }
    { const p=f(-1.0,0,bz+0.3); const ef=frame(p[0],p[2],ang,y0+0.94); Ch.box(ef,-0.35,0.35,0,0.42,-0.22,0.22,WHITE); Ch.box(ef,-0.36,0.36,0.42,0.47,-0.24,0.24,WHITE); T.box(ef,-0.3,0.3,0.12,0.2,0.2,0.23,lin('#1a1a1a')); for(const dx of [-0.18,0.18]) T.box(ef,dx-0.04,dx+0.04,0.05,0.1,0.23,0.3,lin('#1a1a1a')); for(let k=0;k<6;k++) lathe(G,frame(...(()=>{ const q=ef(-0.3+k*0.12,0,0); return [q[0],q[2]]; })(),ang,y0+1.41),[[0.035,0],[0.045,0.06],[0,0.06]],8,lin('#f4f4f0')); }
    { const p=f(0.5,0,bz+0.3); const mf=frame(p[0],p[2],ang,y0+0.94); Ch.box(mf,-0.24,0.24,0,0.72,-0.24,0.24,WHITE); T.box(mf,-0.18,0.18,0.45,0.62,0.24,0.25,lin('#2b3a44')); }
    { const p=f(-2.55,0,-3.55); const rf=frame(p[0],p[2],ang,y0+1.12); T.box(rf,-0.2,0.2,0,0.08,-0.18,0.18,lin('#111')); T.box(rf,-0.03,0.03,0.08,0.22,-0.03,0.03,lin('#111')); const sc=frame(...(()=>{ const q=rf(0,0,0.02); return [q[0],q[2]]; })(),ang,y0+1.12); T.box(sc,-0.2,0.2,0.22,0.46,-0.02,0.02,lin('#0d1014')); }
    localCollider(f,ang,bx0,bx1,Z0,bz+0.6,y0-1,y0+2.6);
    // front counter with diamond panels, brass foot rail and a wooden canopy with diamond mirrors
    const cz0=-3.55, cz1=-3.0, cx0=-2.95, cx1=1.15; Wd.box(f,cx0,cx1,y0,y0+1.08,cz0,cz1,MAH,0.8); Wd.box(f,cx0-0.06,cx1+0.06,y0+1.08,y0+1.14,cz0-0.05,cz1+0.08,lin('#7a3a20'),0.8);
    for(let x=cx0+0.04;x<cx1-0.3;x+=0.66){ const q=(xx,yy)=>f(xx,yy,cz1+0.006); BP.quad(q(x,y0+0.14),q(x+0.62,y0+0.14),q(x+0.62,y0+1.0),q(x,y0+1.0),[0,0],[1,0],[1,1],[0,1],WHITE,worldN(ang,[0,1])); }
    Ch.box(f,cx0,cx1,y0+0.16,y0+0.2,cz1+0.15,cz1+0.19,lin('#d8b25a')); localCollider(f,ang,cx0-0.06,cx1+0.06,cz0-0.05,cz1+0.25,y0-1,y0+1.2);
    { const bp=f((cx0+cx1)/2,0,cz1+0.95); LANDMARKS.bar={x:bp[0],z:bp[2],y:y0}; }
    Wd.box(f,cx0-0.4,cx1+0.4,y0+2.32,y0+2.44,bz,cz1+0.1,MAH2,0.8); Wd.box(f,cx0-0.4,cx1+0.4,y0+2.44,y0+2.62,cz1-0.02,cz1+0.1,MAH,0.8);
    for(let x=cx0-0.35;x<cx1+0.3;x+=0.68){ const q=(xx,yy)=>f(xx,yy,cz1+0.106); BP.quad(q(x,y0+2.44),q(x+0.64,y0+2.44),q(x+0.64,y0+2.62),q(x,y0+2.62),[0,0.25],[1,0.25],[1,0.75],[0,0.75],WHITE,worldN(ang,[0,1])); }
    for(const x of [cx0-0.2,-0.9,cx1+0.2]){ const p=f(x,0,cz1-0.2); Gl.box(frame(p[0],p[2],ang,0),-0.05,0.05,y0+2.28,y0+2.32,-0.05,0.05,lin('#fff3d0')); }
    // beer taps + glasses on the counter
    for(const x of [-1.9,-1.7]){ const p=f(x,0,-3.3); const tf=frame(p[0],p[2],ang,y0+1.14); Ch.cyl(tf,0.03,0.03,0,0.34,8,WHITE,1,true); Ch.box(tf,-0.02,0.02,0.28,0.32,0,0.12,WHITE); Cl.box(tf,-0.016,0.016,0.34,0.45,-0.016,0.016,lin('#111')); }
    // green beer fridge (no brand), bottles inside
    { const p=f(-3.95,0,-4.55); const ff=frame(p[0],p[2],ang,y0); T.box(ff,-0.34,0.34,0,1.95,-0.33,0.33,lin('#1e6a38')); T.box(ff,-0.36,0.36,1.95,2.2,-0.35,0.35,lin('#1b5c31')); T.box(ff,-0.3,0.3,1.99,2.16,0.35,0.36,lin('#e9efe6'));
      const q=(xx,yy)=>ff(xx,yy,0.335); Fr.quad(q(-0.28,0.12),q(0.28,0.12),q(0.28,1.86),q(-0.28,1.86),[0,0],[1,0],[1,1],[0,1],WHITE,worldN(ang,[0,1])); localCollider(f,ang,-4.35,-3.55,-4.95,-4.15,y0-1,y0+2.3); }
    // iron bar stools with round black seats
    for(const x of [-2.4,-1.35,-0.3,0.7]){ const p=f(x,0,-2.62); const sf=frame(p[0],p[2],ang,y0); for(let k=0;k<4;k++){ const a=k/4*TAU+0.4; beam(Mt,sf(Math.cos(a)*0.2,0,Math.sin(a)*0.2),sf(Math.cos(a)*0.12,0.74,Math.sin(a)*0.12),0.016,lin('#141414')); } lathe(Mt,sf,[[0.15,0.28],[0.16,0.3],[0.15,0.32]],10,lin('#141414')); lathe(Cl,sf,[[0.18,0.74],[0.19,0.8],[0.17,0.83],[0,0.83]],14,lin('#1b1b1b')); addCollider(p[0],p[2],ang,0.42,0.42,y0-1,y0+0.85); }
    // wood-framed mirrors on the east wall
    { const m=segMap(f,ang,[X1,Z0+0.2],[X1,-1.2]); for(const s2 of [0.5,1.6]){ const p=m.P(s2,0,0); const pf=frame(p[0],p[2],ang,0); Wd.box(pf,-0.06,0.0,y0+1.0,y0+2.35,-0.46,0.46,MAH,0.8); Ch.box(pf,-0.07,-0.06,y0+1.08,y0+2.27,-0.38,0.38,lin('#c9d0d4')); } }
    // wooden tables + chairs with striped upholstery
    const LW=lin('#b67c48'); const chair=(x,z,a)=>{ const T3=frame(x,z,a,y0); for(const [lx,lz] of [[-0.2,-0.19],[0.2,-0.19],[-0.2,0.19],[0.2,0.19]]) Wd.box(T3,lx-0.022,lx+0.022,0,0.45,lz-0.022,lz+0.022,LW); Wd.box(T3,-0.23,0.23,0.42,0.46,-0.22,0.22,LW); SP.box(T3,-0.21,0.21,0.46,0.52,-0.2,0.2,WHITE,2.2);
      for(const sx of [-0.2,0.2]) Wd.box(T3,sx-0.025,sx+0.025,0.46,1.0,0.17,0.22,LW); Wd.box(T3,-0.22,0.22,0.92,1.02,0.16,0.22,LW); SP.box(T3,-0.17,0.17,0.56,0.9,0.18,0.2,WHITE,2.2); };
    pokerTable(cs,f,ang,y0,cx,cz,-1.05,1.85);
    { const W=(x,z)=>{ const q=f(x,0,z); return [q[0],q[2]]; }; const dir=(dx,dz)=>{ const a=W(dx,dz), o=W(0,0); return faceYaw(a[0]-o[0],a[1]-o[1]); };
      const L=[]; const add=(n,c,x,z,y,face,pose,opt,walk)=>{ const q=W(x,z); L.push({n,c,x:q[0],z:q[1],y,face,pose,opt,walk}); };
      add('Lidija','#7a1f3d',-1.0,-4.35,y0,dir(0,1),'stand',{female:true,apron:true,hair:0x3a2416,skirt:0x1b1b1b});
      add('Kenka','#3b5f8a',-1.35,-2.62,y0-0.08,dir(0,-1),'stool'); add('Jovo','#6b4a2f',-0.3,-2.62,y0-0.08,dir(0,-1),'stool');
      add('Kiki Poljanec','#2f6b3a',8.91,-0.63,y0-0.43,dir(-0.21,-0.77),'sit');
      const wa=W(6.9,2.9), wb=W(6.9,-4.9); L.push({n:'Valentina',c:'#b8324a',x:wa[0],z:wa[1],y:y0,face:0,pose:'walk',opt:{female:true,apron:true,hair:0xc9a066,skirt:0x222222},walk:[wa,wb]});
      LANDMARKS.pubNPC=L; LANDMARKS.cafeF={f,ang,y0}; }
    for(const [x,z] of []){ const p=f(x,0,z); const tf=frame(p[0],p[2],ang,y0); Wd.box(tf,-0.42,0.42,0.72,0.77,-0.42,0.42,lin('#c68a52'),0.8); for(const [lx,lz] of [[-0.36,-0.36],[0.36,-0.36],[-0.36,0.36],[0.36,0.36]]) Wd.box(tf,lx-0.03,lx+0.03,0,0.72,lz-0.03,lz+0.03,LW);
      for(let k=0;k<4;k++){ const a=k/4*TAU+0.25; const q=f(x+Math.cos(a)*0.72,0,z+Math.sin(a)*0.72); chair(q[0],q[2],ang+Math.atan2(-Math.cos(a),Math.sin(a))); } addCollider(p[0],p[2],ang,1.0,1.0,y0-1,y0+1); }
    for(const [x,z] of [[-2.8,-0.6],[1.0,-0.5],[-1.0,3.2]]){ const p=f(x,0,z); Gl.box(frame(p[0],p[2],ang,0),-0.07,0.07,yc-0.02,yc,-0.07,0.07,lin('#fff6de')); }
  }
}

function quizTex(){ const c=cvs(1024,640), g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,640); gr.addColorStop(0,'#eef1f4'); gr.addColorStop(1,'#d9dee4'); g.fillStyle=gr; g.fillRect(0,0,1024,640);
  g.fillStyle='#6d7b8c'; g.font='700 64px Manrope, Arial'; g.textAlign='left'; g.fillText('PUB QUIZ »PUTNIKU«',80,250); g.font='500 40px Manrope, Arial'; g.fillStyle='#8a97a6'; g.fillText('SUBOTA, 20:00',80,320); g.fillStyle='#7d8ea3'; g.fillRect(80,350,300,4); return mkTex(c,{repeat:false}); }
