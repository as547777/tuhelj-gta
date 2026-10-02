/* ===================== village centre, round 2 — from the Street View shots the player sent =====================
   - red brick paving all round the church, a car park where OSM still draws a house beside it
   - the bus stop on the café side, in front of the gravel lot east of the arcade
   - the pub's walled yard behind the café: white wall with tiled coping and a gate, concrete yard, firewood
     stacked by "Kod Ruže", black mesh fence round the back, the Desinić / Zagreb signpost on the corner */
const PUBYARD={apt:[-232,-66.5], gate:[-247.2,-63]};
function nearOnPoly(P,x,z){ let best=null, bd=1e18; for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1]; const dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz||1e-9; const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1); const px=a[0]+dx*t, pz=a[1]+dz*t; const d=(x-px)**2+(z-pz)**2; if(d<bd){ bd=d; const L=Math.sqrt(L2); best={x:px,z:pz,tx:dx/L,tz:dz/L,d:Math.sqrt(d)}; } } return best; }
function paverTex(kind){ const S=512, c=cvs(S,S), g=c.getContext('2d'); const R=mulberry32(kind.length*131+7);
  if(kind==='red'){ // 20x10 cm clay pavers, running bond, 3 m per tile
    g.fillStyle='#7d6a5c'; g.fillRect(0,0,S,S); const pw=S/15, ph=S/30;
    for(let r=0;r<30;r++){ const off=(r%2)*pw/2; for(let k=-1;k<16;k++){ const x=k*pw+off, y=r*ph; const v=R(); const base=v<0.15?[132,52,38]:v<0.5?[158,66,46]:v<0.85?[172,78,54]:[146,84,62]; const j=(R()-0.5)*18;
      g.fillStyle=`rgb(${base[0]+j|0},${base[1]+j*0.6|0},${base[2]+j*0.5|0})`; g.fillRect(x+1.2,y+1.2,pw-2.4,ph-2.4); g.fillStyle='rgba(255,230,210,0.08)'; g.fillRect(x+1.2,y+1.2,pw-2.4,1.5); } }
    for(let i=0;i<2600;i++){ g.fillStyle=`rgba(40,20,10,${R()*0.18})`; g.fillRect(R()*S,R()*S,1.5,1.5); } }
  else if(kind==='concrete'){ g.fillStyle='#b9b7b1'; g.fillRect(0,0,S,S); for(let i=0;i<22000;i++){ const v=150+R()*70|0; g.fillStyle=`rgba(${v},${v},${v-4},0.35)`; g.fillRect(R()*S,R()*S,1.6,1.6); }
    for(let i=0;i<40;i++){ g.fillStyle=`rgba(90,88,82,${R()*0.08})`; g.beginPath(); g.arc(R()*S,R()*S,10+R()*40,0,TAU); g.fill(); }
    g.strokeStyle='rgba(70,70,66,0.55)'; g.lineWidth=2; for(const q of [0,S/2]){ g.beginPath(); g.moveTo(q,0); g.lineTo(q,S); g.stroke(); g.beginPath(); g.moveTo(0,q); g.lineTo(S,q); g.stroke(); } }
  else if(kind==='asphalt'){ g.fillStyle='#6b6c6e'; g.fillRect(0,0,S,S); for(let i=0;i<30000;i++){ const v=80+R()*80|0; g.fillStyle=`rgba(${v},${v},${v+2},0.45)`; g.fillRect(R()*S,R()*S,1.4,1.4); } }
  else { // gravel lot
    g.fillStyle='#a8a396'; g.fillRect(0,0,S,S); for(let i=0;i<30000;i++){ const v=130+R()*100|0; g.fillStyle=`rgb(${v},${v-5|0},${v-16|0})`; g.beginPath(); g.arc(R()*S,R()*S,0.6+R()*2.0,0,TAU); g.fill(); }
    for(let i=0;i<2000;i++){ g.fillStyle='rgba(60,56,48,0.35)'; g.fillRect(R()*S,R()*S,1.5,1.5); } }
  const t=mkTex(c); t.anisotropy=ANISO; return t; }
const PAVE={};
function paveMat(kind){ if(!PAVE[kind]) PAVE[kind]=new THREE.MeshStandardMaterial({map:paverTex(kind),roughness:kind==='asphalt'?0.88:0.93,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}); return PAVE[kind]; }
function onRoadOrWalk(x,z){ const n=nearestRoad(x,z,14); if(!n) return false; const big=n.s.t==='secondary'||n.s.t==='primary'||n.s.t==='tertiary'; return n.d<(big?1.9:0.25); }
// ground-hugging surface over a polygon (world coords); the grid is aligned to `ang` so straight edges stay straight
function paveArea(scene,P,kind,o={}){ const st=o.step||0.9, tile=o.tile||3, lift=o.lift||0.045;
  // exact edges: triangulate the outline, subdivide each triangle, drop the bits that fall on roads / skip()
  const V2=P.map(p=>new THREE.Vector2(p[0],p[1])); const tris=THREE.ShapeUtils.triangulateShape(V2,[]); const pos=[], uv=[], idx=[]; const vid=new Map();
  const vert=(x,z)=>{ const k=Math.round(x*200)+'|'+Math.round(z*200); let id=vid.get(k); if(id!==undefined) return id; pos.push(x,getHeight(x,z)+lift,z); uv.push(x/tile,-z/tile); id=pos.length/3-1; vid.set(k,id); return id; };
  for(const t of tris){ const A=P[t[0]], B=P[t[1]], C=P[t[2]]; const L=Math.max(Math.hypot(B[0]-A[0],B[1]-A[1]),Math.hypot(C[0]-B[0],C[1]-B[1]),Math.hypot(A[0]-C[0],A[1]-C[1])); const n=Math.max(1,Math.ceil(L/st));
    const at=(i,j)=>{ const u=i/n, v=j/n; return [A[0]+(B[0]-A[0])*u+(C[0]-A[0])*v, A[1]+(B[1]-A[1])*u+(C[1]-A[1])*v]; };
    const tri=(p,q,r)=>{ const cx=(p[0]+q[0]+r[0])/3, cz=(p[1]+q[1]+r[1])/3; if(!o.roads&&onRoadOrWalk(cx,cz)) return; if(o.skip&&o.skip(cx,cz)) return; const a=vert(p[0],p[1]), b=vert(q[0],q[1]), c=vert(r[0],r[1]);
      const ux=q[0]-p[0], uz=q[1]-p[1], vx=r[0]-p[0], vz=r[1]-p[1]; if(ux*vz-uz*vx>0) idx.push(a,c,b); else idx.push(a,b,c); };
    for(let i=0;i<n;i++) for(let j=0;j<n-i;j++){ tri(at(i,j),at(i+1,j),at(i,j+1)); if(i+j<n-1) tri(at(i+1,j),at(i+1,j+1),at(i,j+1)); } }
  if(!idx.length) return null; const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx); geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,o.mat||paveMat(kind)); m.receiveShadow=true; m.matrixAutoUpdate=false; m.updateMatrix(); scene.add(m); return m; }
function nearWater(x,z,r){ for(const w of WATER){ for(let i=0;i<w.P.length-1;i++){ const a=w.P[i], b=w.P[i+1]; if(Math.abs(a[0]-x)>40&&Math.abs(b[0]-x)>40) continue; const n=nearOnPoly([a,b],x,z); if(n.d<r) return true; } } return false; }
// white painted line on the ground (parking stalls)
function groundLine(scene,M,x0,z0,x1,z1,w=0.12){ const L=Math.hypot(x1-x0,z1-z0); const n=Math.max(1,Math.ceil(L/1)); const pos=[], idx=[]; const nx=-(z1-z0)/L*w/2, nz=(x1-x0)/L*w/2;
  for(let k=0;k<=n;k++){ const t=k/n, x=x0+(x1-x0)*t, z=z0+(z1-z0)*t; for(const sd of [-1,1]){ const px=x+nx*sd, pz=z+nz*sd; pos.push(px,getHeight(px,pz)+0.07,pz); } if(k){ const b=(k-1)*2; idx.push(b,b+1,b+3,b,b+3,b+2); } }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g,M); m.receiveShadow=true; scene.add(m); }

function photoPaving(cs,scene){
  // 1) church: red clay pavers right round it, a wider square on the entrance side
  const ch=BLD.find(b=>b.k==='church'); if(ch){ const [cx,cz,ang,L,W]=ch.rect; const f=frame(cx,cz,ang); const e=4.6;
    const P=[[-L/2-e,-W/2-e],[L/2+13,-W/2-e],[L/2+13,W/2+e],[-L/2-e,W/2+e]].map(q=>{ const p=f(q[0],0,q[1]); return [p[0],p[2]]; });
    paveArea(scene,P,'red',{ang,tile:3,skip:(x,z)=>nearWater(x,z,2.6)}); PHOTO.churchPave=P;
    // granite kerb round the paving
    const K=cs.get('curb',cx,cz); const KC=lin('#b9b6ae'); for(let i=0;i<4;i++){ const a=P[i], b=P[(i+1)%4]; const dl=Math.hypot(b[0]-a[0],b[1]-a[1]); for(let t=0;t<dl;t+=1){ const x=a[0]+(b[0]-a[0])*t/dl, z=a[1]+(b[1]-a[1])*t/dl; if(onRoadOrWalk(x,z)||nearWater(x,z,2.6)) continue; const kf=frame(x,z,Math.atan2(b[1]-a[1],b[0]-a[0]),getHeight(x,z)); K.box(kf,0,Math.min(1,dl-t),-0.06,0.1,-0.09,0.09,KC); } } }
  // 2) car park on the plot beside the church
  if(PHOTO.churchPark){ const [px,pz,pa,pl,pw]=PHOTO.churchPark; const f=frame(px,pz,pa); const hl=pl/2+0.8, hw=Math.max(5.2,pw/2+0.5); /* exactly the old house plot */
    const P=[[-hl,-hw],[hl,-hw],[hl,hw],[-hl,hw]].map(q=>{ const p=f(q[0],0,q[1]); return [p[0],p[2]]; }); paveArea(scene,P,'asphalt',{ang:pa,tile:4,skip:(x,z)=>PHOTO.churchPave&&pointInPoly(x,z,PHOTO.churchPave)});
    const LM=new THREE.MeshStandardMaterial({color:0xe9e9e4,roughness:0.7,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
    for(let x=-hl+0.6;x<=hl-0.5;x+=2.6){ for(const sd of [-1,1]){ const a=f(x,0,sd*hw), b=f(x,0,sd*(hw-5)); if(PHOTO.churchPave&&(pointInPoly(a[0],a[2],PHOTO.churchPave)||pointInPoly(b[0],b[2],PHOTO.churchPave))) continue; groundLine(scene,LM,a[0],a[2],b[0],b[2]); } }
    const ch2=BLD.find(b=>b.k==='church'); const far=ch2?((()=>{ const A=f(0,0,-hw), B=f(0,0,hw); return Math.hypot(A[0]-ch2.rect[0],A[2]-ch2.rect[1])>Math.hypot(B[0]-ch2.rect[0],B[2]-ch2.rect[1])?-1:1; })()):1; let k=0; for(let x=-hl+1.9;x<hl-1;x+=2.6){ for(const sd of [far]){ if((k++)%2===1) continue; const q=f(x,0,sd*(hw-2.5)); if(PHOTO.churchPave&&pointInPoly(q[0],q[2],PHOTO.churchPave)) continue; EXTRA_PARK.push([q[0],q[2],pa+Math.PI/2,'']); } } }
  // 3) gravel lot with the bus stop between the café arcade and the next house
  { const rd=ROADS.find(r=>r.t==='secondary'&&r.P.some(q=>Math.hypot(q[0]+213,q[1]+30)<12)); if(rd){ const n=nearOnPoly(rd.P,-211,-33); const a=Math.atan2(n.tz,n.tx); const f=frame(n.x,n.z,a);
      const P=[[-8.3,-4.9],[2.6,-4.9],[2.6,-15.5],[-7.6,-15.5]].map(q=>{ const p=f(q[0],0,q[1]); return [p[0],p[2]]; }); paveArea(scene,P,'gravel',{ang:a,tile:5});
      for(const x of [-4.8,-1.9]){ const q=f(x,0,-11.5); EXTRA_PARK.push([q[0],q[2],a+Math.PI/2,'']); } } }
  // 4) the square with the column in front of Ultra is asphalt, not grass (Street View / Mapillary)
  { const T=[[-250,-54],[-263,-31],[-239,-38]]; const c=[(T[0][0]+T[1][0]+T[2][0])/3,(T[0][1]+T[1][1]+T[2][1])/3]; const P=T.map(p=>{ const dx=p[0]-c[0], dz=p[1]-c[1], l=Math.hypot(dx,dz); return [p[0]+dx/l*3.5,p[1]+dz/l*3.5]; });
    paveArea(scene,P,'asphalt',{tile:4,roads:true,step:0.5,skip:(x,z)=>Math.hypot(x+252.5,z+42.5)<2.6||BHASH.hit(x,z,0.2)}); NOHEDGE.push([c[0],c[1],10]); }
  // 4) the pub yard (concrete), walls, gate, fence, firewood, signpost
  photoPubYard(cs,scene); }

function logTex(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#4a3524'; g.fillRect(0,0,S,S); const R=mulberry32(55);
  for(let y=30;y<S+40;y+=58) for(let x=((y-30)/58%2)*29;x<S+40;x+=58){ const r=22+R()*8; const cx=x+(R()-0.5)*5, cy=y+(R()-0.5)*5; { const v=R(); g.fillStyle=`rgb(${168+v*45|0},${128+v*38|0},${86+v*30|0})`; } g.beginPath(); g.arc(cx,cy,r,0,TAU); g.fill();
    g.strokeStyle='rgba(90,60,35,0.6)'; g.lineWidth=1; for(let k=1;k<3;k++){ g.beginPath(); g.arc(cx,cy,r*k/3,0,TAU); g.stroke(); } g.strokeStyle='rgba(60,40,25,0.9)'; g.lineWidth=2.5; g.beginPath(); g.arc(cx,cy,r,0,TAU); g.stroke(); }
  return mkTex(c); }
function arrowSignTex(txt){ const c=cvs(512,128), g=c.getContext('2d'); g.clearRect(0,0,512,128); g.fillStyle='#f2c22e'; g.strokeStyle='#2b2b2b'; g.lineWidth=5; g.beginPath(); g.moveTo(6,8); g.lineTo(440,8); g.lineTo(504,64); g.lineTo(440,120); g.lineTo(6,120); g.closePath(); g.fill(); g.stroke();
  g.fillStyle='#262626'; g.font='800 78px "Arial Narrow", Arial, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,225,68); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function photoPubYard(cs,scene){ const cafeB=BLD.find(b=>b.k==='cafe'), apt=BLD.find(b=>b.k==='apt'); if(!cafeB||!apt) return;
  const [cx,cz,ang]=cafeB.rect; const f=frame(cx,cz,ang); const WN=f(-10.5,0,-5.25), BE=f(3.6,0,-6.0), WS=f(-10.5,0,4.25);
  const rd=ROADS.find(r=>r.t==='secondary'&&r.P.some(q=>Math.hypot(q[0]+250,q[1]+83)<6)); if(!rd) return;
  // the yard is laid out in the café's own frame: the road wall continues the gable plane (it stands on the pavement, photo)
  const L2=(x,z)=>{ const p=f(x,0,z); return [p[0],p[2]]; }; const RPs=smoothCorners(rd.P,8,2); const off=rd.w/2+2.05; const onWall=(q)=>{ const n=nearOnPoly(RPs,q[0],q[1]); const dx=q[0]-n.x, dz=q[1]-n.z, l=Math.hypot(dx,dz)||1; return [n.x+dx/l*off,n.z+dz/l*off]; };
  // the road wall stands on the back of the pavement (photo): it follows the road, the house corner joins it
  const WNc=L2(-10.5,-5.25), R0=onWall(WNc), R1=onWall(L2(-10.5,-21)), NE=L2(11.2,-21), BEc=L2(10.6,-6.0);
  const yard=[WNc,R0,R1,NE,BEc,L2(3.6,-6.0),L2(3.6,-5.25)]; paveArea(scene,[L2(-10.4,4.4),L2(-10.4,-20.5),L2(-17,-20.5),L2(-17,4.4)],'concrete',{tile:5}); /* pavement right up to the gable (photo) */ paveArea(scene,yard,'concrete',{tile:6,roads:false});
  NOHEDGE.push([(R0[0]+NE[0])/2,(R0[1]+NE[1])/2,16]);
  const G=cs.get('wall',cx,cz), Tl=cs.get('roof',cx,cz), Mt=cs.get('metal',cx,cz), Wd=cs.get('wood',cx,cz); const WALL=lin('#f1f1ee'), CAP=lin('#a9452c'), GRN=lin('#2b2f2c');
  const wall=(a,b,h,gaps=[])=>{ const dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz); const an=Math.atan2(dz,dx); const n=Math.ceil(L/1.5);
    for(let k=0;k<n;k++){ const t0=k*L/n, t1=(k+1)*L/n; if(gaps.some(g=>t1>g[0]&&t0<g[1])) continue; const mx=a[0]+dx*(t0+t1)/2/L, mz=a[1]+dz*(t0+t1)/2/L; const y=getHeight(mx,mz); const wf=frame(mx,mz,an,y); const hl=(t1-t0)/2+0.01;
      G.box(wf,-hl,hl,-0.5,h,-0.12,0.12,WALL,1.2); Tl.quad(wf(-hl,h+0.16,0),wf(hl,h+0.16,0),wf(hl,h,0.2),wf(-hl,h,0.2),[0,0],[1,0],[1,1],[0,1],CAP,[0,1,0]); Tl.quad(wf(hl,h+0.16,0),wf(-hl,h+0.16,0),wf(-hl,h,-0.2),wf(hl,h,-0.2),[0,0],[1,0],[1,1],[0,1],CAP,[0,1,0]); addCollider(mx,mz,an,t1-t0,0.3,y-1,y+h+0.2); } };
  const fence=(a,b,h)=>{ const dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz); const an=Math.atan2(dz,dx); const n=Math.ceil(L/2.5);
    for(let k=0;k<n;k++){ const t0=k*L/n, t1=(k+1)*L/n; const mx=a[0]+dx*(t0+t1)/2/L, mz=a[1]+dz*(t0+t1)/2/L; const y=getHeight(mx,mz); const ff=frame(mx,mz,an,y); const hl=(t1-t0)/2;
      Mt.box(ff,-hl,-hl+0.06,0,h,-0.03,0.03,GRN); Mt.box(ff,-hl,hl,h-0.04,h,-0.02,0.02,GRN); Mt.box(ff,-hl,hl,0.05,0.09,-0.02,0.02,GRN); for(let x=-hl+0.1;x<hl;x+=0.1) Mt.box(ff,x-0.006,x+0.006,0.07,h-0.02,-0.006,0.006,GRN); for(let yy=0.25;yy<h;yy+=0.2) Mt.box(ff,-hl,hl,yy-0.006,yy+0.006,-0.008,0.008,GRN); addCollider(mx,mz,an,t1-t0,0.15,y-1,y+h); } };
  // white wall from the house corner to the pavement, then along the road with the gate
  const LR=Math.hypot(R1[0]-R0[0],R1[1]-R0[1]); const gt=[LR*0.33,LR*0.33+3.8];
  if(Math.hypot(R0[0]-WNc[0],R0[1]-WNc[1])>0.4) wall(WNc,R0,1.75); wall(R0,R1,1.75,[gt]); fence(R1,NE,1.6); fence(NE,BEc,1.6);
  pubBackAnnex(cs,scene,cafeB,f);
  // gate: white pillars with red caps, one wing slid open (photo)
  { const an=Math.atan2(R1[1]-R0[1],R1[0]-R0[0]); for(const t of gt){ const x=R0[0]+(R1[0]-R0[0])*t/LR, z=R0[1]+(R1[1]-R0[1])*t/LR; const y=getHeight(x,z); const pf=frame(x,z,an,y); G.box(pf,-0.2,0.2,-0.5,1.95,-0.2,0.2,WALL); Tl.box(pf,-0.24,0.24,1.95,2.05,-0.24,0.24,CAP); addCollider(x,z,an,0.4,0.4,y-1,y+2); }
    const t=gt[1]+0.3, x=R0[0]+(R1[0]-R0[0])*t/LR, z=R0[1]+(R1[1]-R0[1])*t/LR; const y=getHeight(x,z); const lf=frame(x,z,an,y); const RUST=lin('#8a4a2c');
    Mt.box(lf,0,3.4,0.05,1.55,0.26,0.3,lin('#f4f4f2')); for(const yy of [0.05,1.5]) Mt.box(lf,0,3.4,yy,yy+0.06,0.25,0.31,RUST); for(const xx of [0,3.35]) Mt.box(lf,xx,xx+0.06,0.05,1.55,0.25,0.31,RUST); addCollider(...(()=>{ const q=lf(1.7,0,0.28); return [q[0],q[2]]; })(),an,3.4,0.12,y-1,y+1.6); }
  // firewood stacked in front of the apartment's gable, with flower pots on top
  { const [ax,az,aa]=apt.rect; const F=frame(ax,az,aa-Math.PI/2); const lm=new THREE.MeshStandardMaterial({map:logTex(),roughness:0.95}); lm.map.repeat.set(4,1);
    const p=F(-7.1,0,-0.6); const y=getHeight(p[0],p[2]); const box=new THREE.Mesh(new THREE.BoxGeometry(0.85,1.3,5.6),lm); box.position.set(p[0],y+0.62,p[2]); box.rotation.y=-(aa-Math.PI/2); box.castShadow=true; box.receiveShadow=true; scene.add(box); addCollider(p[0],p[2],aa-Math.PI/2,0.9,5.7,y-1,y+1.3);
    const Cl=cs.get('cloth',ax,az), Hd=cs.get('hedge',ax,az); for(const zz of [-2.4,0.2,1.9]){ const q=F(-7.1,0,zz); const pf=frame(q[0],q[2],0,y+1.27); lathe(Cl,pf,[[0.16,0],[0.24,0.22],[0,0.22]],12,lin('#a85c34')); for(let k=0;k<6;k++) lathe(Hd,frame(q[0]+rnd(-0.15,0.15),q[2]+rnd(-0.15,0.15),0,y+1.48),[[0.08,0],[0.06,0.12],[0,0.14]],6,lin(k%2?'#d8344a':'#4f7d34')); }
    // blue bin by the wall and a tall potted yucca by the house door (photo)
    { const q0=onWall(L2(-10.5,-15.6)); const n0=nearOnPoly(RPs,q0[0],q0[1]); const q=[q0[0]+(n0.x-q0[0])*0.25,q0[1]+(n0.z-q0[1])*0.25]; const bf=frame(q[0],q[1],ang,getHeight(q[0],q[1])); Mt.box(bf,-0.3,0.3,0,1.0,-0.35,0.35,lin('#1f6fd0')); Mt.box(bf,-0.33,0.33,1.0,1.06,-0.38,0.38,lin('#1a5fb5')); } }
  // Desinić / Zagreb signpost on the corner of the house (Street View "38 Tuhelj")
  { const n=nearOnPoly(rd.P,WS[0],WS[2]); const dx=WS[0]-n.x, dz=WS[2]-n.z, dl=Math.hypot(dx,dz)||1; const sx=n.x+dx/dl*4.7, sz=n.z+dz/dl*4.7; const y=getHeight(sx,sz);
    const look=Math.atan2(PUBYARD.gate[0]-6-sx,PUBYARD.gate[1]-6-sz); const pf=frame(sx,sz,0,y); Mt.cyl(pf,0.04,0.04,0,3.2,8,lin('#9ba0a4'),1,false); addCollider(sx,sz,0,0.15,0.15,y-1,y+3);
    const plate=(tex,w,h,yy)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,roughness:0.6})); m.position.set(sx+Math.sin(look)*0.06+Math.cos(look)*w*0.42,y+yy,sz+Math.cos(look)*0.06-Math.sin(look)*w*0.42); m.rotation.y=look; scene.add(m); };
    plate(arrowSignTex('Desinić'),1.25,0.31,2.42); plate(arrowSignTex('Zagreb'),1.25,0.31,2.05);
    const vt=signTex(['VENTEK'],{w:384,h:128,bg:'#7a3b1e',fg:'#ffffff',border:'#ffffff',bw:6,size:64}); plate(vt,0.62,0.22,1.7);
    const bt=signTex([''],{w:256,h:192,bg:'#f4f4f2',fg:'#000',border:'#c8161d',bw:14,size:10}); const bm=new THREE.Mesh(new THREE.PlaneGeometry(0.85,0.62),new THREE.MeshStandardMaterial({map:bt,side:THREE.DoubleSide})); bm.position.set(sx+Math.sin(look)*0.06,y+2.95,sz+Math.cos(look)*0.06); bm.rotation.y=look; scene.add(bm); } }

// the low annex on the yard side of the pub with the glass-railed terrace and the steel-and-glass canopy above (Street View "38 Tuhelj")
function pubBackAnnex(cs,scene,b,f){ const [cx,cz,ang]=b.rect; const y0=b.y0||getHeight(cx,cz); const G=cs.get('wall',cx,cz), Mt=cs.get('metal',cx,cz), Gs=cs.get('glassW',cx,cz), T=cs.get('trim',cx,cz);
  const W=lin('#eef0ef'), STEEL=lin('#9aa0a5'); const x0=-10.5, x1=-8.05, z0=-8.9, z1=-5.25, h=2.95; /* stops short of the pub's back door at x≈-7.3 */
  G.box(f,x0,x1,y0-0.6,y0+h,z0,z1,W,1.2); T.box(f,x0-0.05,x1+0.05,y0+h,y0+h+0.16,z0-0.05,z1,lin('#d6d8d6'));
  // window and door to the yard
  T.box(f,x0+0.7,x0+1.8,y0+0.95,y0+2.1,z0-0.03,z0+0.02,lin('#3a3f44')); 
  Gs.box(f,x0+0.75,x0+1.75,y0+1.0,y0+2.05,z0-0.04,z0-0.02,WHITE);
  // glass railing on the terrace
  for(const [a0,a1,za] of [[x0,x1,z0+0.05]]) { Gs.box(f,a0,a1,y0+h+0.16,y0+h+1.15,za-0.02,za+0.02,WHITE); Mt.box(f,a0,a1,y0+h+1.12,y0+h+1.18,za-0.04,za+0.04,STEEL); }
  Gs.box(f,x0+0.03,x0+0.07,y0+h+0.16,y0+h+1.15,z0,z1,WHITE); Mt.box(f,x0,x0+0.1,y0+h+1.12,y0+h+1.18,z0,z1,STEEL);
  localCollider(f,ang,x0,x1,z0,z1,y0-2,y0+h); addFloor(f,ang,x0,x1,z0,z1,y0+h+0.16);
  // canopy: steel posts and a sloping glass roof from the gable wall out over the terrace
  for(const [px,pz,yb] of [[x0+0.1,z0+0.1,y0+h+0.16],[-4.0,z0+0.1,y0-0.1]]) Mt.box(f,px-0.05,px+0.05,yb,y0+5.15,pz-0.05,pz+0.05,STEEL);
  const yA=y0+5.7, yB=y0+5.1, zA=z1, zB=z0-0.35, cx1=-3.8; Gs.quad(f(x0-0.2,yA,zA),f(cx1,yA,zA),f(cx1,yB,zB),f(x0-0.2,yB,zB),[0,0],[1,0],[1,1],[0,1],WHITE,[0,1,0]);
  for(let x=x0-0.2;x<=cx1+0.01;x+=1.15) beam(Mt,f(x,yA,zA),f(x,yB,zB),0.035,STEEL); beam(Mt,f(x0-0.2,yB,zB),f(cx1,yB,zB),0.05,STEEL); }
