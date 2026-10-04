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
  else if(kind==='setts'){ g.fillStyle='#5e5d59'; g.fillRect(0,0,S,S); const n=30, c=S/n; for(let r=0;r<n;r++) for(let q=0;q<n;q++){ const v=118+R()*40|0, j=(R()-0.5)*1.4; g.fillStyle=`rgb(${v},${v-2},${v-6})`; g.fillRect(q*c+1.2+j,r*c+1.2+j,c-2.4,c-2.4); g.fillStyle='rgba(255,255,255,0.06)'; g.fillRect(q*c+1.2,r*c+1.2,c-2.4,1.2); } }
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
  if(PHOTO.forecourt) paveArea(scene,PHOTO.forecourt,'concrete',{tile:2.5,roads:true,lift:0.05,mat:PHOTO.foreMat||null});
  // 1) church: red clay pavers right round it, a wider square on the entrance side
  const ch=BLD.find(b=>b.k==='church'); if(ch){ const [cx,cz,ang,L,W]=ch.rect; const f=frame(cx,cz,ang); const e=4.6;
    const P=[[-L/2-e,-W/2-e],[L/2+13,-W/2-e],[L/2+13,W/2+e],[-L/2-e,W/2+e]].map(q=>{ const p=f(q[0],0,q[1]); return [p[0],p[2]]; });
    paveArea(scene,P,'red',{ang,tile:3,skip:(x,z)=>nearWater(x,z,2.6)}); PHOTO.churchPave=P;
    // granite kerb round the paving
    const K=cs.get('curb',cx,cz); const KC=lin('#b9b6ae'); for(let i=0;i<4;i++){ const a=P[i], b=P[(i+1)%4]; const dl=Math.hypot(b[0]-a[0],b[1]-a[1]); for(let t=0;t<dl;t+=1){ const x=a[0]+(b[0]-a[0])*t/dl, z=a[1]+(b[1]-a[1])*t/dl; if(onRoadOrWalk(x,z)||nearWater(x,z,2.6)) continue; const kf=frame(x,z,Math.atan2(b[1]-a[1],b[0]-a[0]),getHeight(x,z)); K.box(kf,0,Math.min(1,dl-t),-0.06,0.1,-0.09,0.09,KC); } } }
  // 2) the church car park (Street View "35 Tuhelj"): on the grass between the church paving and Ultra, entered from the church road —
  //    an asphalt lane with a strip of granite setts beside it, cars nose-in, granite kerbs, green mesh fence, street lamps; church on the other side
  { const ch=BLD.find(b=>b.k==='church'); const sv=ROADS.find(r=>r.t==='service'&&r.P.some(q=>Math.hypot(q[0]+273,q[1]+11)<2)); if(ch&&sv){
      const zL=-24.5, xE=nearOnPoly(sv.P,-266,zL).x+1.0, xW=-303; const a=0; const LW=5.0, PD=5.2; const skip=(x,z)=>(PHOTO.churchPave&&pointInPoly(x,z,PHOTO.churchPave))||bigHit(x,z,0.3);
      paveArea(scene,[[xE,zL-LW/2],[xW,zL-LW/2],[xW,zL+LW/2],[xE,zL+LW/2]],'asphalt',{tile:4,roads:true,skip});
      const z0=zL+LW/2, z1=z0+PD; paveArea(scene,[[xE-4,z0],[xW+1,z0],[xW+1,z1],[xE-4,z1]],'setts',{tile:3,roads:true,lift:0.06,skip});
      const K=cs.get('curb',-285,-24), Mt=cs.get('metal',-285,-24), Hd=cs.get('hedge',-285,-24); const KC=lin('#d6d3cc'), FG=lin('#2f6b45');
      const LM=new THREE.MeshStandardMaterial({color:0xe9e9e4,roughness:0.7,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}); let k=0;
      for(let x=xE-4;x>=xW+1;x-=2.6){ groundLine(scene,LM,x,z0+0.3,x,z1-0.2,0.1); const y=getHeight(x,z1+0.15); K.box(frame(x-1.3,z1+0.15,0,y),-1.3,1.3,-0.2,0.18,-0.12,0.12,KC,0.8);
        const fy=getHeight(x-1.3,z1+1.1); Mt.box(frame(x-1.3,z1+1.1,0,fy),-1.3,1.3,0.05,1.45,-0.006,0.006,lin('#3b7a52')); Mt.box(frame(x,z1+1.1,0,fy),-0.03,0.03,0,1.5,-0.03,0.03,FG); addCollider(x-1.3,z1+1.1,0,2.6,0.1,fy-1,fy+1.5);
        if(x-1.3>xW+1&&(k++)%3!==1) EXTRA_PARK.push([x-1.3,z0+2.6,Math.PI/2,'']); }
      // kerb along the church side of the lane, lamps on both sides, grass island with the sign at the entrance
      for(let x=xE;x>=xW;x-=1.6){ const y=getHeight(x,zL-LW/2-0.12); if(!skip(x,zL-LW/2-0.12)) K.box(frame(x-0.8,zL-LW/2-0.12,0,y),-0.8,0.8,-0.2,0.16,-0.12,0.12,KC,0.8); }
      for(let x=xE-6;x>=xW+2;x-=13){ for(const z of [zL-LW/2-1.0,z1+2.0]){ if(skip(x,z)) continue; const ly=getHeight(x,z); Mt.cyl(frame(x,z,0,ly),0.06,0.05,0,6.2,8,lin('#a7acaf'),1,false); Mt.box(frame(x,z,0,ly),-0.05,0.05,6.1,6.2,-0.05,0.05,lin('#a7acaf')); addCollider(x,z,0,0.25,0.25,ly-1,ly+6); if(typeof LAMPS!=='undefined') LAMPS.push({x,y:ly+6.1,z,a:0}); } }
      { const c=[xE-1.6,z0+2.6]; const y=getHeight(c[0],c[1]); const f=frame(c[0],c[1],0,y); K.box(f,-1.6,1.6,-0.2,0.16,-2.4,2.4,KC,0.8); Hd.box(f,-1.45,1.45,0.1,0.18,-2.25,2.25,lin('#6d8f45'),0.7); Mt.cyl(frame(c[0],c[1],0,y),0.035,0.035,0,2.4,8,lin('#a7acaf'),1,false); }
      NOHEDGE.push([(xE+xW)/2,zL+3,24]); PHOTO.churchStrip=true; } }
  // the old plot beside the church stays grass (the car park is the strip along the road)
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
function photoPubYard(cs,scene){ const cafeB=BLD.find(b=>b.k==='cafe'), apt=BLD.find(b=>b.k==='apt'); if(!cafeB) return;
  const [cx,cz,ang]=cafeB.rect; const f=frame(cx,cz,ang); const L2=(x,z)=>{ const p=f(x,0,z); return [p[0],p[2]]; };
  const rd=ROADS.find(r=>r.t==='secondary'&&r.P.some(q=>Math.hypot(q[0]+250,q[1]+83)<6)); if(!rd) return; const RPs=smoothCorners(rd.P,8,2);
  const off=rd.w/2+1.9; const onWall=(q)=>{ const n=nearOnPoly(RPs,q[0],q[1]); const dx=q[0]-n.x, dz=q[1]-n.z, l=Math.hypot(dx,dz)||1; return [n.x+dx/l*off,n.z+dz/l*off]; };
  const G=cs.get('wall',cx,cz), Tl=cs.get('roof',cx,cz), Mt=cs.get('metal',cx,cz), Wd=cs.get('wood',cx,cz); const WALL=lin('#f1f1ee'), CAP=lin('#a9452c'), GRN=lin('#2b2f2c');
  const wall=(a,b,h,gaps=[])=>{ const dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz); const an=Math.atan2(dz,dx); const n=Math.ceil(L/1.5);
    for(let k=0;k<n;k++){ const t0=k*L/n, t1=(k+1)*L/n; if(gaps.some(g=>t1>g[0]&&t0<g[1])) continue; const mx=a[0]+dx*(t0+t1)/2/L, mz=a[1]+dz*(t0+t1)/2/L; const y=getHeight(mx,mz); const wf=frame(mx,mz,an,y); const hl=(t1-t0)/2+0.01;
      G.box(wf,-hl,hl,-0.5,h,-0.12,0.12,WALL,1.2); Tl.quad(wf(-hl,h+0.16,0),wf(hl,h+0.16,0),wf(hl,h,0.2),wf(-hl,h,0.2),[0,0],[1,0],[1,1],[0,1],CAP,[0,1,0]); Tl.quad(wf(hl,h+0.16,0),wf(-hl,h+0.16,0),wf(-hl,h,-0.2),wf(hl,h,-0.2),[0,0],[1,0],[1,1],[0,1],CAP,[0,1,0]); addCollider(mx,mz,an,t1-t0,0.3,y-1,y+h+0.2); } };
  const fence=(a,b,h)=>{ const dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz); const an=Math.atan2(dz,dx); const n=Math.ceil(L/2.5);
    for(let k=0;k<n;k++){ const t0=k*L/n, t1=(k+1)*L/n; const mx=a[0]+dx*(t0+t1)/2/L, mz=a[1]+dz*(t0+t1)/2/L; const y=getHeight(mx,mz); const ff=frame(mx,mz,an,y); const hl=(t1-t0)/2;
      Mt.box(ff,-hl,-hl+0.06,0,h,-0.03,0.03,GRN); Mt.box(ff,-hl,hl,h-0.04,h,-0.02,0.02,GRN); Mt.box(ff,-hl,hl,0.05,0.09,-0.02,0.02,GRN); for(let x=-hl+0.1;x<hl;x+=0.1) Mt.box(ff,x-0.006,x+0.006,0.07,h-0.02,-0.006,0.006,GRN); addCollider(mx,mz,an,t1-t0,0.15,y-1,y+h); } };
  // yard north of the house: the white wall stands on the back of the pavement of the road from the north, in line with the house front
  const NWc=L2(-10.5,4.25), R0=onWall(NWc), R1=onWall(L2(-21.5,4.25)), NE=L2(-21.5,-15.6), SE=L2(3.6,-15.6);
  // all of it asphalt: the yard and the strip behind the house up to the arcade (no grass, photo)
  paveArea(scene,[NWc,R0,R1,NE,SE,L2(3.6,-5.25),L2(-10.5,-5.25)],'asphalt',{tile:4,roads:false}); NOHEDGE.push([(R0[0]+NE[0])/2,(R0[1]+NE[1])/2,18]);
  const LR=Math.hypot(R1[0]-R0[0],R1[1]-R0[1]); const gt=[1.2,5.0]; if(Math.hypot(R0[0]-NWc[0],R0[1]-NWc[1])>0.3) wall(NWc,R0,1.75); wall(R0,R1,1.75,[gt,[LR-1.5,LR]]); fence(R1,NE,1.6); fence(NE,SE,1.6); fence(SE,L2(3.6,-15.75),1.6);
  // gate wing slid open (photo "38 Tuhelj") and the blue garden gate at the north end (Mapillary)
  { const an=Math.atan2(R1[1]-R0[1],R1[0]-R0[0]); const P=(t)=>[R0[0]+(R1[0]-R0[0])*t/LR,R0[1]+(R1[1]-R0[1])*t/LR];
    for(const t of gt){ const [x,z]=P(t); const y=getHeight(x,z); const pf=frame(x,z,an,y); G.box(pf,-0.2,0.2,-0.5,1.95,-0.2,0.2,WALL); Tl.box(pf,-0.24,0.24,1.95,2.05,-0.24,0.24,CAP); addCollider(x,z,an,0.4,0.4,y-1,y+2); }
    { const [x,z]=P(gt[1]+0.3); const y=getHeight(x,z); const lf=frame(x,z,an,y); Mt.box(lf,0,3.4,0.05,1.55,0.26,0.3,lin('#f4f4f2')); Mt.box(lf,0,3.4,1.5,1.56,0.25,0.31,lin('#8a4a2c')); }
    { const [x,z]=P(LR-0.75); const y=getHeight(x,z); const bf=frame(x,z,an,y); Wd.box(bf,-0.75,0.75,0,1.7,-0.05,0.05,lin('#2f8fd0')); addCollider(x,z,an,1.5,0.12,y-1,y+1.7); }
    // flower troughs and the blue bin on the pavement in front of the wall
    for(const t of [7.5,9.0]){ const [x,z]=P(t); const y=getHeight(x,z); const tf=frame(x,z,an,y); Wd.box(tf,-0.45,0.45,0,0.38,-0.75,-0.4,lin('#c46a45')); for(let k=0;k<4;k++) lathe(cs.get('hedge',x,z),frame(...(()=>{ const q=tf(-0.3+k*0.2,0,-0.58); return [q[0],q[2]]; })(),k,y+0.36),[[0.12,0],[0.09,0.22],[0,0.3]],6,lin(k%2?'#7a9a5a':'#9a7ac0')); }
    { const [x,z]=P(8.25); const y=getHeight(x,z); const bf=frame(x,z,an,y); Mt.box(bf,-0.3,0.3,0,1.0,-0.95,-0.35,lin('#1f6fd0')); Mt.box(bf,-0.33,0.33,1.0,1.06,-0.98,-0.32,lin('#1a5fb5')); } }
  // firewood stacked in front of the little white house (photo)
  { const p=L2(-11.9,-3.0); const y=getHeight(p[0],p[1]); const lm=new THREE.MeshStandardMaterial({map:logTex(),roughness:0.95}); lm.map.repeat.set(4,1); const box=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.25,4.6),lm); box.position.set(p[0],y+0.6,p[1]); box.rotation.y=-ang; box.castShadow=true; box.receiveShadow=true; scene.add(box); addCollider(p[0],p[1],ang,0.95,4.7,y-1,y+1.3); }
  // Desinić / Zagreb signpost on the house's north-west corner
  { const q=onWall(L2(-9.6,4.25)); const sx=q[0], sz=q[1]; const y=getHeight(sx,sz); const look=-Math.PI/2+0.25; Mt.cyl(frame(sx,sz,0,y),0.04,0.04,0,3.2,8,lin('#9ba0a4'),1,false); addCollider(sx,sz,0,0.15,0.15,y-1,y+3);
    const plate=(tex,w,h,yy,o)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,roughness:0.6})); m.position.set(sx+Math.cos(look)*o,y+yy,sz-Math.sin(look)*o); m.rotation.y=look; scene.add(m); };
    plate(arrowSignTex('Desinić'),1.25,0.31,2.42,0.45); plate(arrowSignTex('Zagreb'),1.25,0.31,2.05,0.45); plate(signTex(['VENTEK'],{w:384,h:128,bg:'#7a3b1e',fg:'#ffffff',border:'#ffffff',bw:6,size:64}),0.62,0.22,1.7,0); }
  pubBackAnnex(cs,scene,cafeB,f); }
// "Kod Ruže": the long low white building with the red tiled roof, wooden windows and the brown door, behind the bus stop
// on the north side of the gravel lot east of the arcade (Street View "7 Tuhelj")
function kodRuzeRow(cs,scene){ const sh=PUBYARD.cafeShift||[0,0]; const cx=-215.8+Math.max(0,sh[0]), cz=-50.6+Math.min(0,sh[1]), ang=0.32; const f=frame(cx,cz,ang); const hl=9.0, hw=3.4; let y0=1e9; for(const [x,z] of [[-hl,-hw],[hl,-hw],[-hl,hw],[hl,hw]]){ const p=f(x,0,z); y0=Math.min(y0,getHeight(p[0],p[2])); } y0+=0.12; const e=y0+2.75;
  const G=cs.get('wall',cx,cz), T=cs.get('trim',cx,cz), Wd=cs.get('wood',cx,cz), Gs=cs.get('glassW',cx,cz); const WH=lin('#efefea'), WOOD=lin('#8a4f2a');
  emitWalls(cs,f,ang,hl,hw,y0-0.8,e,'gable',22,WH,'wall'); emitPlinth(cs,f,ang,hl,hw,y0-0.8,y0+0.35,lin('#b9b4aa')); emitRoof(cs,f,ang,hl,hw,e,'gable',22,0.55,0.5,lin('#b05a38'),lin('#6e4a30'));
  for(const [s0,w,door] of [[-6.5,1.2,false],[-3.8,1.2,false],[0.6,1.1,false],[2.6,1.1,false],[5.2,1.0,true],[7.3,1.0,false]]){ const zz=hw+0.02; if(door){ Wd.box(f,s0-0.5,s0+0.5,y0,y0+2.15,zz-0.05,zz+0.04,WOOD); for(const xx of [s0-0.3,s0+0.3]) Wd.box(f,xx-0.03,xx+0.03,y0+0.2,y0+2.0,zz+0.04,zz+0.06,lin('#6e3e22')); continue; }
    Wd.box(f,s0-w/2,s0+w/2,y0+0.95,y0+2.05,zz-0.03,zz+0.04,WOOD); Gs.box(f,s0-w/2+0.08,s0+w/2-0.08,y0+1.03,y0+1.97,zz+0.04,zz+0.05,WHITE); Wd.box(f,s0-0.03,s0+0.03,y0+1.0,y0+2.0,zz+0.05,zz+0.07,WOOD); }
  // little porch roof over the door, the "Kod Ruže" sign and a lamp
  { const pc=f(5.2,0,hw+0.55); emitRoof(cs,frame(pc[0],pc[2],ang),ang,0.9,0.55,y0+2.35,'shed',20,0.1,0.1,lin('#b05a38'),lin('#6e4a30'),'roof',4); }
  { const p=f(3.9,0,hw+0.06); signMesh(scene,kodRuzeTex(),1.0,0.42,p[0],y0+2.1,p[2],-ang); }
  localCollider(f,ang,-hl,hl,-hw,hw,y0-1,e+2); NOHEDGE.push([cx,cz+hw+3,12]); }

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

// the arcade in front of the pub reaches out to the pavement of the main road and follows its bend (Street View at the bus stop):
// grey walls with white arched windows, a glazed door at the end, red tiled hip roof
function pubFrontArcade(cs,scene,b,f,RPs,rw){ const [cx,cz,ang]=b.rect; const y0=b.y0||getHeight(cx,cz); const yb=y0-1.2, ea=y0+3.3; const c=Math.cos(ang), s2=Math.sin(ang);
  const toL=(x,z)=>{ const dx=x-cx, dz=z-cz; return [dx*c+dz*s2,-dx*s2+dz*c]; }; const off=rw/2+2.25;
  const outer=(lx)=>{ const p=f(lx,0,4.25); const n=nearOnPoly(RPs,p[0],p[2]); const dx=p[0]-n.x, dz=p[2]-n.z, l=Math.hypot(dx,dz)||1; const q=[n.x+dx/l*off,n.z+dz/l*off]; return toL(q[0],q[1]); };
  const xs=[-6.5,-2.5,1.5,5.5,10.4]; const O=xs.map(x=>{ const q=outer(x); return [x,Math.max(4.25+1.6,q[1])]; }); if(O.every(q=>q[1]<4.25+1.7)) return;
  const H=heroGroups(cs,cx,cz); const G=H.wall, T=H.trim; const AWALL=lin('#a3a8ad'), AREV=lin('#d4d6d8'), TRIMC=lin('#f6f6f2'), FRM=lin('#c3c6ca');
  const seg=(A,B,kind)=>{ const m=segMap(f,ang,A,B); const L=m.L; let holes=[];
    if(kind==='arches'){ const n=Math.max(1,Math.floor(L/2.7)); for(let k=0;k<n;k++){ const cc=L*(k+0.5)/n; holes.push(holeArch(cc-0.72,cc+0.72,y0+0.45,y0+2.75,12)); } }
    if(kind==='door'){ const cc=L*0.5; holes=[holeArch(cc-0.6,cc+0.6,y0,y0+2.5,10)]; }
    facadeSeg(G,m,[[0,yb],[L,yb],[L,ea],[0,ea]],holes,AWALL); holes.forEach(h=>{ archWindow(H,m,h,{wc:AWALL,rc:AREV,fc:TRIMC,dep:0.25,fw:0.09}); surround(T,m,h,0.12,0.04,FRM); });
    plinthSeg(H.plinth,m,yb,y0+0.35,kind==='door'?[[L*0.5-0.6,L*0.5+0.6]]:[],lin('#8a8f94')); T.box(m.T,-0.02,L+0.02,ea-0.2,ea,-0.02,0.06,lin('#b0b4b8'),1,0x3f^8);
    if(kind!=='door') segCollider(f,ang,A[0],A[1],B[0],B[1],0.3,y0-3,y0+5); };
  // end wall with the glazed door (left, toward the bend), the arched front along the road, end wall on the right
  seg([xs[0],4.25],O[0],'door'); for(let i=0;i<O.length-1;i++) seg(O[i],O[i+1],'arches'); seg(O[O.length-1],[xs[xs.length-1],2.0],'plain');
  const roofP=O.concat([[xs[xs.length-1],2.0],[xs[0],4.25]]); hipRoofOver(cs,f,ang,roofP,ea,28,0.5,{mat:'roofK',color:lin('#f6ece6'),soffit:lin('#8a5c3c'),fascia:lin('#6a4630'),skipEave:(a,b2)=>Math.abs(a[1]-4.25)<0.01&&Math.abs(b2[1]-4.25)<0.01});
  addFloor(f,ang,xs[0],xs[xs.length-1],4.25,Math.min(...O.map(q=>q[1])),y0); }
