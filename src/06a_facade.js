/* ===================== facade builder: walls with real openings ===================== */
// a wall segment from local point a to c (outward normal = (-dz,dx)); facade coords (s along the wall from a, y up), depth = inward
function segMap(f,ang,a,c){ const dx=c[0]-a[0], dz=c[1]-a[1], L=Math.hypot(dx,dz); const ux=dx/L, uz=dz/L, nx=-uz, nz=ux;
  const P=(s,y,dep=0)=>f(a[0]+ux*s-nx*dep, y, a[1]+uz*s-nz*dep);
  const T=(x,y,z)=>f(a[0]+ux*x+nx*z, y, a[1]+uz*x+nz*z); // box frame: x=s, z=outwards
  const W=(vs,vy,vn)=>{ const h=worldN(ang,[ux*vs+nx*vn, uz*vs+nz*vn]); return [h[0],vy,h[2]]; }; // local dir -> world hint
  return {L,ux,uz,nx,nz,P,T,W,ang}; }
function facadeSeg(G,m,outline,holes,C,uvS=3){ const V=outline.map(p=>new THREE.Vector2(p[0],p[1])); const H=holes.map(h=>h.map(p=>new THREE.Vector2(p[0],p[1])));
  const tris=THREE.ShapeUtils.triangulateShape(V,H); const all=outline.concat(...holes); const N=m.W(0,0,1);
  for(const t of tris){ const A=all[t[0]],B=all[t[1]],D=all[t[2]]; G.tri(m.P(A[0],A[1]),m.P(B[0],B[1]),m.P(D[0],D[1]),[A[0]/uvS,A[1]/uvS],[B[0]/uvS,B[1]/uvS],[D[0]/uvS,D[1]/uvS],C,N); } }
function holeRect(s0,s1,y0,y1){ return [[s0,y0],[s1,y0],[s1,y1],[s0,y1]]; }
function holeArch(s0,s1,y0,y1,n=10){ const r=(s1-s0)/2, cx=(s0+s1)/2, yc=y1-r; const P=[[s0,y0],[s1,y0]]; for(let k=0;k<=n;k++){ const a=k/n*Math.PI; P.push([cx+Math.cos(a)*r, yc+Math.sin(a)*r]); } return P; }
function holePointed(s0,s1,y0,y1,n=6){ const w=s1-s0, ysp=y1-w*0.866; const P=[[s0,y0],[s1,y0]]; for(let k=0;k<=n;k++){ const a=k/n*Math.PI/3; P.push([s0+Math.cos(a)*w, ysp+Math.sin(a)*w]); } for(let k=1;k<=n;k++){ const a=Math.PI*2/3+k/n*Math.PI/3; P.push([s1+Math.cos(a)*w, ysp+Math.sin(a)*w]); } P.pop(); P.push([s0,ysp]); return P; }
function polyCentroid(P){ let x=0,y=0; for(const p of P){ x+=p[0]; y+=p[1]; } return [x/P.length,y/P.length]; }
function insetPoly(P,w){ const n=P.length, c=polyCentroid(P); const out=[];
  const nrm=(a,b)=>{ let nx=-(b[1]-a[1]), ny=b[0]-a[0]; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l; const mx=(a[0]+b[0])/2-c[0], my=(a[1]+b[1])/2-c[1]; if(nx*mx+ny*my>0){ nx=-nx; ny=-ny; } return [nx,ny]; };
  for(let i=0;i<n;i++){ const p0=P[(i-1+n)%n], p1=P[i], p2=P[(i+1)%n]; const n1=nrm(p0,p1), n2=nrm(p1,p2);
    const a1=[p0[0]+n1[0]*w,p0[1]+n1[1]*w], b1=[p1[0]+n1[0]*w,p1[1]+n1[1]*w], a2=[p1[0]+n2[0]*w,p1[1]+n2[1]*w], b2=[p2[0]+n2[0]*w,p2[1]+n2[1]*w];
    const d1=[b1[0]-a1[0],b1[1]-a1[1]], d2=[b2[0]-a2[0],b2[1]-a2[1]]; const den=d1[0]*d2[1]-d1[1]*d2[0];
    if(Math.abs(den)<1e-6){ out.push([p1[0]+n1[0]*w,p1[1]+n1[1]*w]); continue; } const t=((a2[0]-a1[0])*d2[1]-(a2[1]-a1[1])*d2[0])/den; out.push([a1[0]+d1[0]*t,a1[1]+d1[1]*t]); }
  return out; }
function outsetPoly(P,w){ return insetPoly(P,-w); }
// reveal (jambs, head, sill) from the wall plane to depth dep
function reveal(G,m,hole,d0,d1,C){ const n=hole.length, c=polyCentroid(hole);
  for(let i=0;i<n;i++){ const a=hole[i], b=hole[(i+1)%n]; let ns=-(b[1]-a[1]), ny=b[0]-a[0]; const mx=(a[0]+b[0])/2-c[0], my=(a[1]+b[1])/2-c[1]; if(ns*mx+ny*my>0){ ns=-ns; ny=-ny; }
    G.quad(m.P(a[0],a[1],d0),m.P(b[0],b[1],d0),m.P(b[0],b[1],d1),m.P(a[0],a[1],d1),[0,0],[1,0],[1,0.3],[0,0.3],C,m.W(ns,ny,0)); } }
// flat polygon (glass / backing) at a depth, uv mapped onto a texture sub-rect
function pane(G,m,hole,dep,C,uvRect=[0,0,1,1],facing=1){ const V=hole.map(p=>new THREE.Vector2(p[0],p[1])); const tris=THREE.ShapeUtils.triangulateShape(V,[]); let s0=1e9,s1=-1e9,y0=1e9,y1=-1e9; for(const p of hole){ s0=Math.min(s0,p[0]); s1=Math.max(s1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); }
  const uv=(p)=>[uvRect[0]+(uvRect[2]-uvRect[0])*(p[0]-s0)/(s1-s0), uvRect[1]+(uvRect[3]-uvRect[1])*(p[1]-y0)/(y1-y0)]; const N=m.W(0,0,facing);
  for(const t of tris){ const A=hole[t[0]],B=hole[t[1]],D=hole[t[2]]; G.tri(m.P(A[0],A[1],dep),m.P(B[0],B[1],dep),m.P(D[0],D[1],dep),uv(A),uv(B),uv(D),C,N); } }
// frame ring: band between outline P and inset(P,w) at depth dep (front face) with thickness th (inner edge)
function frameRing(G,m,P,w,dep,th,C){ const I=insetPoly(P,w); const n=P.length; const N=m.W(0,0,1); const c=polyCentroid(P);
  for(let i=0;i<n;i++){ const a=P[i], b=P[(i+1)%n], ia=I[i], ib=I[(i+1)%n]; G.quad(m.P(a[0],a[1],dep),m.P(b[0],b[1],dep),m.P(ib[0],ib[1],dep),m.P(ia[0],ia[1],dep),[0,0],[1,0],[1,1],[0,1],C,N);
    let ns=-(ib[1]-ia[1]), ny=ib[0]-ia[0]; const mx=(ia[0]+ib[0])/2-c[0], my=(ia[1]+ib[1])/2-c[1]; if(ns*mx+ny*my>0){ ns=-ns; ny=-ny; }
    G.quad(m.P(ia[0],ia[1],dep),m.P(ib[0],ib[1],dep),m.P(ib[0],ib[1],dep+th),m.P(ia[0],ia[1],dep+th),[0,0],[1,0],[1,1],[0,1],C,m.W(ns,ny,0)); }
  return I; }
// raised surround ring on the wall face (outside the opening), protruding pr
function surround(G,m,hole,w,pr,C){ const O=outsetPoly(hole,w); const n=hole.length; const N=m.W(0,0,1); const c=polyCentroid(hole);
  for(let i=0;i<n;i++){ const a=O[i], b=O[(i+1)%n], ia=hole[i], ib=hole[(i+1)%n]; G.quad(m.P(a[0],a[1],-pr),m.P(b[0],b[1],-pr),m.P(ib[0],ib[1],-pr),m.P(ia[0],ia[1],-pr),[0,0],[1,0],[1,1],[0,1],C,N);
    let ns=-(b[1]-a[1]), ny=b[0]-a[0]; const mx=(a[0]+b[0])/2-c[0], my=(a[1]+b[1])/2-c[1]; if(ns*mx+ny*my<0){ ns=-ns; ny=-ny; }
    G.quad(m.P(a[0],a[1],0),m.P(b[0],b[1],0),m.P(b[0],b[1],-pr),m.P(a[0],a[1],-pr),[0,0],[1,0],[1,1],[0,1],C,m.W(ns,ny,0)); } }
// straight bar (mullion/transom) in facade coords from (s0,y0) to (s1,y1) with width w at depth dep..dep+th
function bar(G,m,s0,y0,s1,y1,w,dep,th,C){ const ds=s1-s0, dy=y1-y0, L=Math.hypot(ds,dy); if(L<1e-4) return; const ps=-dy/L*w/2, py=ds/L*w/2;
  const q=[[s0+ps,y0+py],[s1+ps,y1+py],[s1-ps,y1-py],[s0-ps,y0-py]]; const N=m.W(0,0,1);
  G.quad(m.P(q[0][0],q[0][1],dep),m.P(q[1][0],q[1][1],dep),m.P(q[2][0],q[2][1],dep),m.P(q[3][0],q[3][1],dep),[0,0],[1,0],[1,1],[0,1],C,N);
  for(const [A,B,sg] of [[q[0],q[1],1],[q[3],q[2],-1]]) G.quad(m.P(A[0],A[1],dep),m.P(B[0],B[1],dep),m.P(B[0],B[1],dep+th),m.P(A[0],A[1],dep+th),[0,0],[1,0],[1,1],[0,1],C,m.W(sg*ps,sg*py,0)); }
// plinth band with gaps (door ranges)
function plinthSeg(G,m,yb,yp,gaps,C,prot=0.05){ const cuts=[[0,0]].concat(gaps.slice().sort((a,b)=>a[0]-b[0])).concat([[m.L,m.L]]);
  for(let i=0;i<cuts.length-1;i++){ const s0=cuts[i][1], s1=cuts[i+1][0]; if(s1-s0<0.02) continue; G.box(m.T,s0,s1,yb,yp,-0.02,prot,C,0.66,0x3f^8); } }
/* ---- window units ---- */
const GLASSV={plain:[0,0.5,0.5,1],sheer:[0.5,0.5,1,1],drape:[0,0,0.5,0.5],blind:[0.5,0,1,0.5]};
function glassVar(){ return wpick([['plain',30],['sheer',34],['drape',22],['blind',14]]); }
// rectangular window: reveal, frame, mullions, glass, sill; opts: {cs, x (world for chunk), dep, fw, fc, cols, rows, sill, shutter:{k,col}, surround:{w,c}}
function rectWindow(H,m,hole,o){ const dep=o.dep??0.18, fw=o.fw??0.07; const fc=o.fc||lin('#f2f2ee');
  reveal(H.wall,m,hole,0,dep,o.rc||o.wc);
  const I=frameRing(H.trim,m,hole,fw,dep-0.02,0.06,fc); const s0=I[0][0], s1=I[1][0], y0=I[0][1], y1=I[2][1];
  const cols=o.cols??2, rows=o.rows??1; for(let i=1;i<cols;i++){ const s=s0+(s1-s0)*i/cols; bar(H.trim,m,s,y0,s,y1,o.mw??0.07,dep-0.02,0.05,fc); } for(let j=1;j<rows;j++){ const y=y0+(y1-y0)*j/rows; bar(H.trim,m,s0,y,s1,y,o.mw??0.06,dep-0.015,0.05,fc); }
  pane(H.glass,m,I,dep+0.02,WHITE,GLASSV[o.gv||glassVar()]);
  if(o.shutter){ const k=o.shutter.k; const yb=hole[3][1]-(hole[3][1]-hole[0][1])*k; if(k>0.02){ const sh=[[hole[0][0]+0.02,yb],[hole[1][0]-0.02,yb],[hole[1][0]-0.02,hole[2][1]],[hole[0][0]+0.02,hole[3][1]]]; pane(H.slats,m,sh,dep-0.06,o.shutter.col,[0,0,(hole[1][0]-hole[0][0])/1.2,(hole[2][1]-yb)/1.2]); H.trim.box(m.T,hole[0][0]+0.02,hole[1][0]-0.02,yb-0.04,yb,-dep+0.03,-dep+0.1,o.shutter.col); } }
  if(o.sill!==false){ H.trim.box(m.T,hole[0][0]-0.06,hole[1][0]+0.06,hole[0][1]-0.05,hole[0][1]+0.01,-0.02,o.sillOut??0.13,o.sc||fc); }
  if(o.surround) surround(H.trim,m,hole,o.surround.w,o.surround.p??0.03,o.surround.c);
}
function archWindow(H,m,hole,o){ const dep=o.dep??0.18, fw=o.fw??0.07; const fc=o.fc||lin('#f2f2ee');
  reveal(H.wall,m,hole,0,dep,o.rc||o.wc); const I=frameRing(H.trim,m,hole,fw,dep-0.02,0.06,fc);
  const s0=hole[0][0]+fw, s1=hole[1][0]-fw, r=(hole[1][0]-hole[0][0])/2, yc=hole[hole.length-1][1]; const cx=(s0+s1)/2;
  bar(H.trim,m,s0,yc,s1,yc,0.06,dep-0.015,0.05,fc); if(o.mullion!==false) bar(H.trim,m,cx,hole[0][1]+fw,cx,yc,0.06,dep-0.015,0.05,fc);
  for(const a of [Math.PI/4,Math.PI/2,Math.PI*3/4]) bar(H.trim,m,cx,yc,cx+Math.cos(a)*(r-fw),yc+Math.sin(a)*(r-fw),0.045,dep-0.012,0.04,fc);
  pane(H.glass,m,I,dep+0.02,WHITE,GLASSV[o.gv||glassVar()]);
  if(o.sill!==false) H.trim.box(m.T,hole[0][0]-0.06,hole[1][0]+0.06,hole[0][1]-0.05,hole[0][1]+0.01,-0.02,0.12,o.sc||fc);
}
/* ---- extra textures ---- */
function glassTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); const q=S/2;
  const base=(x,y)=>{ const gr=g.createLinearGradient(x,y,x+q*0.5,y+q); gr.addColorStop(0,'#7d93a6'); gr.addColorStop(0.35,'#34424f'); gr.addColorStop(1,'#141a20'); g.fillStyle=gr; g.fillRect(x,y,q,q); g.fillStyle='rgba(255,255,255,0.08)'; g.beginPath(); g.moveTo(x+q*0.1,y); g.lineTo(x+q*0.35,y); g.lineTo(x+q*0.05,y+q); g.lineTo(x-q*0.2,y+q); g.fill(); };
  base(0,0); base(q,0); base(0,q); base(q,q);
  // sheer (top-right in canvas = uv [0.5,0.5..1,1])
  g.fillStyle='rgba(236,234,226,0.72)'; g.fillRect(q,0,q,q*0.78); for(let i=0;i<q;i+=6){ g.fillStyle='rgba(205,200,190,0.5)'; g.fillRect(q+i,0,2,q*0.78); }
  // drapes (bottom-left) : two side curtains
  for(const [x0,x1] of [[0,q*0.28],[q*0.72,q]]){ const gr=g.createLinearGradient(x0,0,x1,0); gr.addColorStop(0,'#b9a790'); gr.addColorStop(0.5,'#e2d6c0'); gr.addColorStop(1,'#b09c84'); g.fillStyle=gr; g.fillRect(x0,q,x1-x0,q); } g.fillStyle='rgba(240,238,230,0.5)'; g.fillRect(q*0.28,q,q*0.44,q*0.3);
  // blinds (bottom-right)
  for(let y=q;y<S;y+=9){ g.fillStyle='rgba(222,220,212,0.85)'; g.fillRect(q,y,q,6); }
  const t=mkTex(c,{repeat:false}); return t; }
function leadedTex(){ const W=256,H=512, c=cvs(W,H), g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,W,H); gr.addColorStop(0,'#5d6b68'); gr.addColorStop(0.5,'#39433f'); gr.addColorStop(1,'#20272a'); g.fillStyle=gr; g.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){ g.fillStyle=pick(['rgba(150,60,55,0.35)','rgba(60,80,150,0.35)','rgba(190,160,70,0.3)','rgba(70,120,80,0.3)','rgba(220,220,210,0.18)']); const x=rnd(0,W), y=rnd(0,H); g.fillRect(x,y,18,24); }
  g.strokeStyle='rgba(30,30,30,0.9)'; g.lineWidth=3; for(let k=-H;k<W+H;k+=26){ g.beginPath(); g.moveTo(k,0); g.lineTo(k+H*0.55,H); g.stroke(); g.beginPath(); g.moveTo(k,0); g.lineTo(k-H*0.55,H); g.stroke(); }
  g.fillStyle='rgba(40,40,40,0.95)'; for(const y of [H*0.33,H*0.66]) g.fillRect(0,y,W,7); return mkTex(c); }
function slatsTex(){ const c=cvs(128,128), g=c.getContext('2d'); for(let y=0;y<128;y+=8){ g.fillStyle='#d8d8d8'; g.fillRect(0,y,128,6); g.fillStyle='#8a8a8a'; g.fillRect(0,y+6,128,2); g.fillStyle='rgba(255,255,255,0.35)'; g.fillRect(0,y,128,1); } return mkTex(c); }
function awningTex(){ const c=cvs(256,128), g=c.getContext('2d'); g.fillStyle='#7c2a22'; g.fillRect(0,0,256,128); for(let x=0;x<256;x+=32){ g.fillStyle='#8f3a2e'; g.fillRect(x,0,14,128); } g.fillStyle='rgba(0,0,0,0.12)'; for(let y=0;y<128;y+=4) g.fillRect(0,y,256,1); return mkTex(c); }
function biberTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#6e3522'; g.fillRect(0,0,S,S); const tw=S/7, th=S/8;
  for(let row=-1;row<9;row++){ const y=row*th; const off=(row%2)*tw/2; for(let i=-1;i<8;i++){ const x=i*tw+off; const col=pick(['#c46a44','#cf7650','#b8603d','#d7815a','#bf6743','#c97049','#b35a39']); const gr=g.createLinearGradient(0,y,0,y+th*1.45); gr.addColorStop(0,colAdj(col,-18)); gr.addColorStop(0.75,col); gr.addColorStop(1,colAdj(col,-35));
      g.fillStyle=gr; g.beginPath(); g.moveTo(x+2,y); g.lineTo(x+tw-2,y); g.lineTo(x+tw-2,y+th*1.2); g.quadraticCurveTo(x+tw/2,y+th*1.55,x+2,y+th*1.2); g.closePath(); g.fill(); g.strokeStyle='rgba(40,15,8,0.45)'; g.lineWidth=2; g.stroke(); } }
  for(let i=0;i<220;i++){ g.fillStyle=`rgba(${pick(['40,30,20','90,80,60','20,20,20'])},${rnd(0.03,0.09)})`; g.beginPath(); g.arc(rnd(0,S),rnd(0,S),rnd(4,18),0,TAU); g.fill(); }
  return mkTex(c); }
function colAdj(hex,d){ const n=parseInt(hex.slice(1),16); const r=clamp((n>>16)+d,0,255), gg=clamp(((n>>8)&255)+d,0,255), b=clamp((n&255)+d,0,255); return `rgb(${r},${gg},${b})`; }
// normal map from a texture's luminance (height)
function normalMapFrom(tex,strength=2.5,invert=false){ const src=tex.image; const w=src.width, h=src.height; const g=src.getContext?src.getContext('2d'):null; if(!g) return null; const d=g.getImageData(0,0,w,h).data;
  const H=new Float32Array(w*h); for(let i=0;i<w*h;i++){ H[i]=(d[i*4]*0.3+d[i*4+1]*0.59+d[i*4+2]*0.11)/255*(invert?-1:1); }
  const c=cvs(w,h), o=c.getContext('2d'); const id=o.createImageData(w,h); const q=id.data;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const xl=(x-1+w)%w, xr=(x+1)%w, yu=(y-1+h)%h, yd=(y+1)%h; const dx=(H[y*w+xr]-H[y*w+xl])*strength, dy=(H[yd*w+x]-H[yu*w+x])*strength; let nx=-dx, ny=dy, nz=1; const l=Math.hypot(nx,ny,nz); const k=(y*w+x)*4; q[k]=(nx/l*0.5+0.5)*255; q[k+1]=(ny/l*0.5+0.5)*255; q[k+2]=(nz/l*0.5+0.5)*255; q[k+3]=255; }
  o.putImageData(id,0,0); const t=new THREE.CanvasTexture(c); t.wrapS=tex.wrapS; t.wrapT=tex.wrapT; t.anisotropy=ANISO; t.colorSpace=THREE.NoColorSpace; return t; }
function heroMaterials(){ // extra materials for hero buildings
  TEX.glassW=glassTex(); TEX.leaded=leadedTex(); TEX.slats=slatsTex(); TEX.awning=awningTex(); TEX.biber=biberTex();
  const n=(t,s,inv)=>normalMapFrom(t,s,inv);
  const M={
    glassW:new THREE.MeshStandardMaterial({map:TEX.glassW,roughness:0.06,metalness:0.25,envMapIntensity:1.25}),
    leaded:new THREE.MeshStandardMaterial({map:TEX.leaded,roughness:0.2,metalness:0.2,envMapIntensity:1.1}),
    slats:new THREE.MeshStandardMaterial({map:TEX.slats,vertexColors:true,roughness:0.6,metalness:0.1}),
    awning:new THREE.MeshStandardMaterial({map:TEX.awning,vertexColors:true,roughness:0.9,side:THREE.DoubleSide}),
    roofB:new THREE.MeshStandardMaterial({map:TEX.biber,normalMap:n(TEX.biber,3.2),normalScale:new THREE.Vector2(1.1,1.1),vertexColors:true,roughness:0.78}),
  };
  return M; }
function addNormalMaps(mats){ const nm=(t,s)=>normalMapFrom(t,s); const set=(m,t,s,sc)=>{ if(!m||!t) return; const N=nm(t,s); if(!N) return; m.normalMap=N; m.normalScale=new THREE.Vector2(sc,sc); m.needsUpdate=true; };
  set(mats.roof,TEX.tiles,3.0,1.0); set(mats.stonem,TEX.stone,3.0,1.1); set(mats.plinth,TEX.stone,3.0,1.1); set(mats.brick,TEX.brick,2.6,1.0); set(mats.wall,TEX.plaster,1.6,0.45); set(mats.wood,TEX.wood,2.0,0.6); set(mats.hedge,TEX.hedge,3.2,1.2); }
/* ---- exact hipped roof over a convex footprint (straight skeleton = nearest edge line) ---- */
function clipHalf(P,a,b,c){ const out=[]; for(let i=0;i<P.length;i++){ const p=P[i], q=P[(i+1)%P.length]; const vp=a*p[0]+b*p[1]+c, vq=a*q[0]+b*q[1]+c; if(vp>=0) out.push(p); if((vp>=0)!==(vq>=0)){ const t=vp/(vp-vq); out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]); } } return out; }
function hipEdges(P){ const n=P.length, c=polyCentroid(P); const E=[]; for(let i=0;i<n;i++){ const a=P[i], b=P[(i+1)%n]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const dir=[(b[0]-a[0])/L,(b[1]-a[1])/L]; let nIn=[-dir[1],dir[0]]; if((c[0]-a[0])*nIn[0]+(c[1]-a[1])*nIn[1]<0) nIn=[-nIn[0],-nIn[1]]; E.push({a,b,L,dir,nIn}); } return E; }
function hipFaces(E,domain){ const d=(e,p)=>(p[0]-e.a[0])*e.nIn[0]+(p[1]-e.a[1])*e.nIn[1]; const faces=[];
  E.forEach((ei,i)=>{ let F=domain.slice(); E.forEach((ej,j)=>{ if(i===j||F.length<3) return; const A=ej.nIn[0]-ei.nIn[0], B=ej.nIn[1]-ei.nIn[1], C=-(ej.a[0]*ej.nIn[0]+ej.a[1]*ej.nIn[1])+(ei.a[0]*ei.nIn[0]+ei.a[1]*ei.nIn[1]); if(Math.abs(A)+Math.abs(B)<1e-9) return; F=clipHalf(F,A,B,C); }); if(F.length>=3) faces.push({e:ei,i,P:F}); });
  return {faces,d}; }
function hipRoofOver(cs,f,ang,P,ea,pitch,ov,o){ const tn=Math.tan(pitch*Math.PI/180), cp=Math.cos(pitch*Math.PI/180); const E=hipEdges(P); const eave=outsetPoly(P,ov); const {faces,d}=hipFaces(E,eave);
  const cx=f(0,0,0); const R=cs.get(o.mat||'roofK',cx[0],cx[2]), So=cs.get('soffit',cx[0],cx[2]), Wd=cs.get('wood',cx[0],cx[2]), Mt=cs.get('metal',cx[0],cx[2]);
  const H=(e,p)=>ea+d(e,p)*tn; const uv=(e,p)=>[((p[0]-e.a[0])*e.dir[0]+(p[1]-e.a[1])*e.dir[1])/1.25,(d(e,p)+ov)/cp/1.25];
  for(const F of faces){ const e=F.e; const up=[e.nIn[0]*tn*0,1,0]; const nw=worldN(ang,[-e.nIn[0]*tn,-e.nIn[1]*tn]); const hint=[nw[0],1,nw[2]];
    for(let k=1;k<F.P.length-1;k++){ const A=F.P[0],B=F.P[k],C=F.P[k+1]; R.tri(f(A[0],H(e,A),A[1]),f(B[0],H(e,B),B[1]),f(C[0],H(e,C),C[1]),uv(e,A),uv(e,B),uv(e,C),o.color||WHITE,hint); }
    const S=clipHalf(F.P,-e.nIn[0],-e.nIn[1],e.a[0]*e.nIn[0]+e.a[1]*e.nIn[1]); for(let k=1;k<S.length-1;k++){ const A=S[0],B=S[k],C=S[k+1]; So.tri(f(A[0],H(e,A)-0.16,A[1]),f(B[0],H(e,B)-0.16,B[1]),f(C[0],H(e,C)-0.16,C[1]),[A[0]/1.2,A[1]/1.2],[B[0]/1.2,B[1]/1.2],[C[0]/1.2,C[1]/1.2],o.soffit||lin('#8a5c3c'),[0,-1,0]); } }
  const ye=ea-ov*tn; for(let i=0;i<eave.length;i++){ const a=eave[i], b=eave[(i+1)%eave.length]; if(o.skipEave&&o.skipEave(a,b)) continue; const dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz); const nw=worldN(ang,[dz/L,-dx/L]); const c0=polyCentroid(eave); const out=((a[0]+b[0])/2-c0[0])*(dz/L)+((a[1]+b[1])/2-c0[1])*(-dx/L)>0?1:-1;
    Wd.quad(f(a[0],ye-0.18,a[1]),f(b[0],ye-0.18,b[1]),f(b[0],ye,b[1]),f(a[0],ye,a[1]),[0,0],[L,0],[L,0.2],[0,0.2],o.fascia||lin('#6a4630'),[nw[0]*out,0,nw[2]*out]);
    const fr=frame(...(()=>{ const p=f((a[0]+b[0])/2,0,(a[1]+b[1])/2); return [p[0],p[2]]; })(),ang+Math.atan2(dz,dx),0); const z0=-out*0.02, z1=-out*0.16; Mt.box(fr,-L/2-0.03,L/2+0.03,ye-0.2,ye-0.06,Math.min(z0,z1),Math.max(z0,z1),o.gutter||lin('#5d6166')); }
  return {E,eave,faces,H,tn}; }
function hipCeiling(G,f,ang,P,ea,pitch,drop,C,inset){ const tn=Math.tan(pitch*Math.PI/180); const E=hipEdges(P); const inner=insetPoly(P,inset); const {faces,d}=hipFaces(E,inner); const H=(e,p)=>ea+d(e,p)*tn-drop;
  for(const F of faces){ const e=F.e; const nw=worldN(ang,[e.nIn[0]*tn,e.nIn[1]*tn]); const hint=[nw[0],-1,nw[2]]; const uv=(p)=>[((p[0]-e.a[0])*e.dir[0]+(p[1]-e.a[1])*e.dir[1])/1.2,d(e,p)/1.2];
    for(let k=1;k<F.P.length-1;k++){ const A=F.P[0],B=F.P[k],Cc=F.P[k+1]; G.tri(f(A[0],H(e,A),A[1]),f(B[0],H(e,B),B[1]),f(Cc[0],H(e,Cc),Cc[1]),uv(A),uv(B),uv(Cc),C,hint); } }
  return {E,faces,H,inner}; }
