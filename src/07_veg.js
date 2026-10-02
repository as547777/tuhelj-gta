/* ===================== vegetation ===================== */
const TREES={x:[],z:[],y:[],h:[],w:[],r:[],c:[],t:[]}; // t: 0 broad, 1 conifer, 2 bush
function addTree(x,z,h,w,col,t){ TREES.x.push(x); TREES.z.push(z); TREES.y.push(getHeight(x,z)); TREES.h.push(h); TREES.w.push(w); TREES.r.push(RNG()*TAU); TREES.c.push(col); TREES.t.push(t); }
const BROAD=['#4c6a2d','#56772f','#5f7f35','#4a6629','#66843a','#6f8a3c','#7a8c3a','#58733a'];
const CONIF=['#2e4a2e','#34502f','#2b4430','#3a5634'];
function tcol(list,j=0.25){ return colJ(new THREE.Color(pick(list)),j); }
function inFarmland(x,z){ for(const l of LAND){ if(l.t!=='farmland') continue; if(!l.bb) l.bb=polyBBox(l.P); const b=l.bb; if(x<b[0]||x>b[1]||z<b[2]||z>b[3]) continue; if(pointInPoly(x,z,l.P)) return true; } return false; }
function placeTrees(){
  RNG=mulberry32(8080);
  const S=8.0;
  // forest
  for(let x=X0+2;x<X0+GW-2;x+=S) for(let z=Z0+2;z<Z0+GH-2;z+=S){
    const px=x+rnd(-S*0.45,S*0.45), pz=z+rnd(-S*0.45,S*0.45); const m=mixAt(px,pz);
    if(m[1]>0.25) continue;
    if(m[2]>0.5){ if(BHASH.hit(px,pz,2.5)) continue; const n=fbm2(px/170,pz/170,3,5); const con=n>0.62||RNG()<0.05; const hh=(con?rnd(15,26):rnd(12,22))*(0.8+0.45*fbm2(px/60,pz/60,2,8));
      addTree(px,pz,hh,hh*(con?0.32:rnd(0.85,1.15)),con?tcol(CONIF,0.2):tcol(BROAD,0.35),con?1:0);
      if(RNG()<0.18){ const bx=px+rnd(-3,3), bz=pz+rnd(-3,3); addTree(bx,bz,rnd(2,4),rnd(2.5,4),tcol(BROAD,0.3),2); } }
    else if(m[2]>0.22 && m[0]<0.7){ if(RNG()<0.55 && !BHASH.hit(px,pz,2)) addTree(px,pz,rnd(2.5,6),rnd(3,5),tcol(BROAD,0.35),2); }
  }
  // riparian trees along streams
  for(const w of WATER){ const S2=resample(w.P,rnd(7,10));
    for(const p of S2){ for(const side of [1,-1]){ if(RNG()<0.35) continue; const q=[p[0]+rnd(-2,2)+side*rnd(3,7), p[1]+rnd(-2,2)+side*rnd(2,6)]; const m=mixAt(q[0],q[1]); if(m[1]>0.35 || BHASH.hit(q[0],q[1],3) || !roadClear(q[0],q[1],2)) continue;
      const willow=RNG()<0.3; const hh=willow?rnd(8,13):rnd(10,18); addTree(q[0],q[1],hh,hh*(willow?1.15:0.8),willow?colJ(new THREE.Color('#8ba050'),0.3):tcol(BROAD,0.3),0); if(RNG()<0.4) addTree(q[0]+rnd(-2,2),q[1]+rnd(-2,2),rnd(2,4),rnd(2.5,4),tcol(BROAD,0.3),2); } } }
  // gardens around houses
  for(const b of BLD){ if(b.k!=='house') continue; const [cx,cz,ang,L,W]=b.rect; const n=rndi(1,4);
    for(let i=0;i<n;i++){ for(let tries=0;tries<6;tries++){ const a=RNG()*TAU, d=Math.hypot(L,W)/2+rnd(3,12); const x=cx+Math.cos(a)*d, z=cz+Math.sin(a)*d; if(BHASH.hit(x,z,2.2)||!roadClear(x,z,2.5)) continue; const m=mixAt(x,z); if(m[1]>0.5) continue;
      const u=RNG(); if(u<0.62) addTree(x,z,rnd(3.5,6.5),rnd(3.5,6),colJ(new THREE.Color('#5d7f33'),0.35),0); else if(u<0.82) addTree(x,z,rnd(6,13),rnd(2.5,4.5),tcol(CONIF,0.2),1); else addTree(x,z,rnd(1.5,3),rnd(2,3.5),tcol(BROAD,0.3),2); break; } } }
  // meadow trees and orchards
  for(let i=0;i<1400;i++){ const x=rnd(X0+50,X0+GW-50), z=rnd(Z0+50,Z0+GH-50); const m=mixAt(x,z); if(m[0]<0.85||m[1]>0.1||m[2]>0.1) continue; if(BHASH.hit(x,z,5)||!roadClear(x,z,4)) continue; if(inFarmland(x,z)) continue;
    if(RNG()<0.25){ // small orchard
      const ang=RNG()*TAU, nx=rndi(3,6), nz=rndi(3,5); for(let a=0;a<nx;a++) for(let c=0;c<nz;c++){ const ox=(a-nx/2)*6, oz=(c-nz/2)*6; const px=x+Math.cos(ang)*ox-Math.sin(ang)*oz, pz=z+Math.sin(ang)*ox+Math.cos(ang)*oz; const mm=mixAt(px,pz); if(mm[1]>0.2||mm[2]>0.3||BHASH.hit(px,pz,3)||!roadClear(px,pz,3)) continue; addTree(px,pz,rnd(3.8,6),rnd(4,6),colJ(new THREE.Color('#62823a'),0.3),0); } }
    else { const hh=rnd(9,20); addTree(x,z,hh,hh*rnd(0.8,1.1),tcol(BROAD,0.3),0); if(RNG()<0.5) addTree(x+rnd(-4,4),z+rnd(-4,4),rnd(2,4),rnd(3,4.5),tcol(BROAD,0.3),2); }
  }
  // hedgerows along some field edges
  for(const l of LAND){ if(l.t!=='farmland') continue; const P=l.P; for(let i=0;i<P.length;i++){ if(RNG()>0.22) continue; const a=P[i], b=P[(i+1)%P.length]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); for(let s=0;s<L;s+=rnd(5,9)){ const t=s/L; const x=a[0]+(b[0]-a[0])*t+rnd(-1,1), z=a[1]+(b[1]-a[1])*t+rnd(-1,1); if(BHASH.hit(x,z,3)||!roadClear(x,z,2.5)) continue; if(RNG()<0.3) addTree(x,z,rnd(8,16),rnd(6,10),tcol(BROAD,0.3),0); else addTree(x,z,rnd(2,4.5),rnd(2.5,4.5),tcol(BROAD,0.3),2); } } }
  // big lindens around the church
  if(LANDMARKS.church){ const c=LANDMARKS.church; for(const [ox,oz] of [[-14,20],[6,22],[-29,-19],[-27,15],[18,16],[-4,-22]]){ const x=c.look[0]+ox, z=c.look[1]+oz; if(BHASH.hit(x,z,4)||!roadClear(x,z,2)) continue; addTree(x,z,rnd(17,23),rnd(13,17),colJ(new THREE.Color('#5a7a32'),0.2),0); } }
  for(const e of PROPS_EXTRA){ if(e.t==='bushring'){ for(let k=0;k<7;k++){ const a=k/7*TAU; addTree(e.x+Math.cos(a)*e.r,e.z+Math.sin(a)*e.r,rnd(0.9,1.4),rnd(1.3,1.9),colJ(new THREE.Color('#3f6a2c'),0.3),2); } } }
  TREES.n=TREES.x.length;
}
/* ---- tree templates ---- */
function blobGeo(det,seed){ const g=new THREE.IcosahedronGeometry(1,det); const p=g.attributes.position; const r=mulberry32(seed);
  for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const k=0.82+0.3*vnoise2(x*2.3+seed,z*2.3+y*1.7,seed%7); p.setXYZ(i,x*k,y*k,z*k); } return g; }
function mergeGeos(list){ // list of {g, m (Matrix4), shade(y)->}
  let n=0; for(const it of list) n+= it.g.index? it.g.index.count : it.g.attributes.position.count;
  const P=new Float32Array(n*3), N=new Float32Array(n*3), U=new Float32Array(n*2), C=new Float32Array(n*3); let o=0; const v=new THREE.Vector3(), nm=new THREE.Vector3(), c=new THREE.Vector3();
  for(const it of list){ const g=it.g.index?it.g.toNonIndexed():it.g; const p=g.attributes.position, nn=g.attributes.normal, uv=g.attributes.uv; const nmat=new THREE.Matrix3().getNormalMatrix(it.m); c.set(0,0,0).applyMatrix4(it.m);
    for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).applyMatrix4(it.m); if(it.sphereN){ nm.copy(v).sub(it.center).normalize(); nm.lerp(new THREE.Vector3().fromBufferAttribute(nn,i).applyMatrix3(nmat).normalize(),0.25).normalize(); } else nm.fromBufferAttribute(nn,i).applyMatrix3(nmat).normalize();
      P[o*3]=v.x; P[o*3+1]=v.y; P[o*3+2]=v.z; N[o*3]=nm.x; N[o*3+1]=nm.y; N[o*3+2]=nm.z; if(uv){ U[o*2]=uv.getX(i)*(it.uvs||1); U[o*2+1]=uv.getY(i)*(it.uvs||1); } const sh=it.shade?it.shade(v):1; C[o*3]=sh; C[o*3+1]=sh; C[o*3+2]=sh; o++; } }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(N,3)); g.setAttribute('uv',new THREE.BufferAttribute(U,2)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.computeBoundingSphere(); return g; }
function treeTemplates(){
  const T={};
  const shadeY=(lo,hi,y0,y1)=>(v)=>lerp(lo,hi,clamp((v.y-y0)/(y1-y0),0,1));
  // broadleaf, unit height
  { const parts=[]; const center=new THREE.Vector3(0,0.64,0); const r=mulberry32(5);
    const blobs=[[0,0.6,0,0.25],[0.15,0.52,0.06,0.19],[-0.14,0.55,-0.08,0.19],[0.03,0.74,-0.1,0.17],[-0.05,0.43,0.13,0.16]];
    for(const [x,y,z,s] of blobs){ const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(s,s*0.92,s)); parts.push({g:blobGeo(1,Math.floor(r()*1000)),m,sphereN:true,center,uvs:2.2,shade:shadeY(0.5,1.1,0.3,0.9)}); }
    T.broadCrown=mergeGeos(parts);
    const far=[{g:blobGeo(0,11),m:new THREE.Matrix4().compose(new THREE.Vector3(0,0.6,0),new THREE.Quaternion(),new THREE.Vector3(0.31,0.29,0.31)),sphereN:true,center,shade:shadeY(0.6,1.05,0.3,0.88)}];
    T.broadFar=mergeGeos(far);
    const trunk=new THREE.CylinderGeometry(0.013,0.024,0.5,6,1,true); trunk.translate(0,0.25,0); const br1=new THREE.CylinderGeometry(0.005,0.01,0.2,4,1,true); br1.rotateZ(0.7); br1.translate(0.06,0.5,0); const br2=br1.clone(); br2.rotateY(2.2);
    T.broadTrunk=mergeGeos([{g:trunk,m:new THREE.Matrix4(),shade:()=>1},{g:br1,m:new THREE.Matrix4(),shade:()=>1},{g:br2,m:new THREE.Matrix4(),shade:()=>1}]); }
  // conifer
  { const parts=[]; const center=new THREE.Vector3(0,0.55,0); const tiers=[[0.14,0.42,0.19],[0.34,0.36,0.16],[0.52,0.3,0.13],[0.68,0.24,0.1],[0.82,0.18,0.065]];
    for(const [y,h,r] of tiers){ const c=new THREE.ConeGeometry(1,1,9,1,true); c.translate(0,0.5,0); const m=new THREE.Matrix4().compose(new THREE.Vector3(0,y,0),new THREE.Quaternion(),new THREE.Vector3(r,h,r)); parts.push({g:c,m,uvs:3,shade:shadeY(0.5,1.05,0.1,0.95)}); }
    T.conCrown=mergeGeos(parts);
    const c=new THREE.ConeGeometry(0.19,0.9,7,1,false); c.translate(0,0.55,0); T.conFar=mergeGeos([{g:c,m:new THREE.Matrix4(),shade:shadeY(0.55,1.0,0.1,1.0)}]);
    const trunk=new THREE.CylinderGeometry(0.008,0.02,0.4,5,1,true); trunk.translate(0,0.2,0); T.conTrunk=mergeGeos([{g:trunk,m:new THREE.Matrix4(),shade:()=>1}]); }
  // bush (unit height)
  { const parts=[]; const center=new THREE.Vector3(0,0.45,0); const r=mulberry32(9); for(const [x,y,z,s] of [[0,0.45,0,0.42],[0.25,0.35,0.1,0.3],[-0.22,0.38,-0.12,0.32],[0.05,0.62,-0.15,0.28]]){ const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(s,s*0.85,s)); parts.push({g:blobGeo(1,Math.floor(r()*1000)),m,sphereN:true,center,uvs:1.5,shade:shadeY(0.5,1.05,0.05,0.9)}); }
    T.bush=mergeGeos(parts); T.bushFar=mergeGeos([{g:blobGeo(0,3),m:new THREE.Matrix4().compose(new THREE.Vector3(0,0.42,0),new THREE.Quaternion(),new THREE.Vector3(0.45,0.4,0.45)),sphereN:true,center,shade:shadeY(0.55,1.0,0.05,0.9)}]); }
  return T;
}
const VEG={near:[],far:[],uniforms:{uPlayer:{value:new THREE.Vector3()},uLodR:{value:110},uTime:{value:0}}, lastRebuild:new THREE.Vector3(1e9,0,1e9)};
function lodMaterial(base,near){
  base.onBeforeCompile=(sh)=>{ sh.uniforms.uPlayer=VEG.uniforms.uPlayer; sh.uniforms.uLodR=VEG.uniforms.uLodR; sh.uniforms.uTime=VEG.uniforms.uTime;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform vec3 uPlayer; uniform float uLodR; uniform float uTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
      vec3 ic=(instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xyz; float dd=distance(ic.xz,uPlayer.xz);
      ${near?'if(dd>uLodR) transformed=vec3(0.0); else { float sw=sin(uTime*1.3+ic.x*0.13+ic.z*0.11)*0.012*position.y*position.y; transformed.x+=sw; transformed.z+=sw*0.6; }':'if(dd<uLodR) transformed=vec3(0.0);'}`); };
  base.customProgramCacheKey=()=>near?'lodnear':'lodfar';
  return base;
}
function buildTrees(scene,quality){
  const T=treeTemplates();
  const leafMat=lodMaterial(new THREE.MeshStandardMaterial({map:TEX.leaves,alphaTest:0.42,side:THREE.DoubleSide,vertexColors:true,roughness:0.85,metalness:0}),true);
  const needleMat=lodMaterial(new THREE.MeshStandardMaterial({map:TEX.needles,alphaTest:0.3,side:THREE.DoubleSide,vertexColors:true,roughness:0.9,metalness:0}),true);
  const barkMat=lodMaterial(new THREE.MeshStandardMaterial({color:0x5b4a3c,vertexColors:true,roughness:0.95}),true);
  const farMat=lodMaterial(new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.92,metalness:0}),false);
  const farBush=lodMaterial(new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.92,metalness:0}),false);
  for(const m of [leafMat,needleMat,farMat,farBush]) foliageFill(m); /* light through the leaves: crowns are never black blocks */
  VEG.T=T; VEG.mats={leafMat,needleMat,barkMat,farMat};
  // far chunks
  const CH=560; const chunks=new Map(); const n=TREES.n; const mtx=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(), p=new THREE.Vector3(), up=new THREE.Vector3(0,1,0);
  for(let i=0;i<n;i++){ const k=Math.floor(TREES.x[i]/CH)+'|'+Math.floor(TREES.z[i]/CH)+'|'+TREES.t[i]; let a=chunks.get(k); if(!a){a=[];chunks.set(k,a);} a.push(i); }
  const sr=mulberry32(77); for(const [k,list] of chunks){ for(let a=list.length-1;a>0;a--){ const b=Math.floor(sr()*(a+1)); const t2=list[a]; list[a]=list[b]; list[b]=t2; } const t=+k.split('|')[2]; const geo=t===0?T.broadFar:t===1?T.conFar:T.bushFar; const mesh=new THREE.InstancedMesh(geo,t===2?farBush:farMat,list.length);
    list.forEach((i,j)=>{ q.setFromAxisAngle(up,TREES.r[i]); const sc=scaleFor(i); s.set(sc[0],sc[1],sc[2]); p.set(TREES.x[i],TREES.y[i]-0.2,TREES.z[i]); mtx.compose(p,q,s); mesh.setMatrixAt(j,mtx); mesh.setColorAt(j,TREES.c[i]); });
    mesh.computeBoundingSphere(); mesh.castShadow=false; mesh.receiveShadow=false; mesh.matrixAutoUpdate=false; mesh.userData.full=list.length; scene.add(mesh); VEG.far.push(mesh); }
  // near meshes
  const cap=quality>=2?4200:2600;
  const mk=(geo,mat,cast)=>{ const m=new THREE.InstancedMesh(geo,mat,cap); m.count=0; m.castShadow=cast; m.receiveShadow=true; m.frustumCulled=false; m.matrixAutoUpdate=false; scene.add(m); return m; };
  VEG.nb=mk(T.broadCrown,leafMat,true); VEG.nbt=mk(T.broadTrunk,barkMat,true); VEG.nc=mk(T.conCrown,needleMat,true); VEG.nct=mk(T.conTrunk,barkMat,true); VEG.nbush=mk(T.bush,leafMat,true);
  VEG.cap=cap;
  // spatial grid for near queries
  VEG.grid=new Map(); for(let i=0;i<n;i++){ const k=Math.floor(TREES.x[i]/40)+'|'+Math.floor(TREES.z[i]/40); let a=VEG.grid.get(k); if(!a){a=[];VEG.grid.set(k,a);} a.push(i); }
}
function scaleFor(i){ const t=TREES.t[i]; if(t===1) return [TREES.w[i]*3.1,TREES.h[i],TREES.w[i]*3.1]; return [TREES.w[i],TREES.h[i],TREES.w[i]]; }
function rebuildNearTrees(px,pz){
  const R=VEG.uniforms.uLodR.value+24; const g=Math.ceil(R/40); const cx=Math.floor(px/40), cz=Math.floor(pz/40);
  const mtx=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(), p=new THREE.Vector3(), up=new THREE.Vector3(0,1,0);
  let nb=0,nc=0,nu=0; VEG.trunks=[];
  for(let i=-g;i<=g;i++) for(let j=-g;j<=g;j++){ const a=VEG.grid.get((cx+i)+'|'+(cz+j)); if(!a) continue;
    for(const k of a){ const dx=TREES.x[k]-px, dz=TREES.z[k]-pz; if(dx*dx+dz*dz>R*R) continue; const t=TREES.t[k];
      q.setFromAxisAngle(up,TREES.r[k]); const sc=scaleFor(k); s.set(sc[0],sc[1],sc[2]); p.set(TREES.x[k],TREES.y[k]-0.2,TREES.z[k]); mtx.compose(p,q,s);
      if(t===0 && nb<VEG.cap){ VEG.nb.setMatrixAt(nb,mtx); VEG.nb.setColorAt(nb,TREES.c[k]); VEG.nbt.setMatrixAt(nb,mtx); VEG.nbt.setColorAt(nb,TREE_BARK); nb++; if(dx*dx+dz*dz<900) VEG.trunks.push([TREES.x[k],TREES.z[k],Math.max(0.25,TREES.h[k]*0.02)]); }
      else if(t===1 && nc<VEG.cap){ VEG.nc.setMatrixAt(nc,mtx); VEG.nc.setColorAt(nc,TREES.c[k]); VEG.nct.setMatrixAt(nc,mtx); VEG.nct.setColorAt(nc,TREE_BARK); nc++; if(dx*dx+dz*dz<900) VEG.trunks.push([TREES.x[k],TREES.z[k],Math.max(0.2,TREES.h[k]*0.016)]); }
      else if(t===2 && nu<VEG.cap){ VEG.nbush.setMatrixAt(nu,mtx); VEG.nbush.setColorAt(nu,TREES.c[k]); nu++; } } }
  for(const [m,c] of [[VEG.nb,nb],[VEG.nbt,nb],[VEG.nc,nc],[VEG.nct,nc],[VEG.nbush,nu]]){ m.count=c; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; }
  VEG.lastRebuild.set(px,0,pz);
}
const TREE_BARK=new THREE.Color('#8a7a6a');
/* ---- corn rows ---- */
function cornTexture(){ const W=256,H=256; const c=cvs(W,H), g=c.getContext('2d'); g.clearRect(0,0,W,H);
  for(let i=0;i<7;i++){ const x=18+i*36+rnd(-6,6); const hh=H*rnd(0.78,0.95); g.strokeStyle='#6f8a3a'; g.lineWidth=5; g.beginPath(); g.moveTo(x,H); g.lineTo(x+rnd(-4,4),H-hh); g.stroke();
    for(let k=0;k<7;k++){ const y=H-hh*(0.15+k*0.12); const dir=k%2?1:-1; g.strokeStyle=pick(['#557a2e','#648a34','#4d6e2a','#7a9a44']); g.lineWidth=rnd(5,8); g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+dir*rnd(14,22),y-rnd(10,18),x+dir*rnd(26,40),y+rnd(4,14)); g.stroke(); }
    g.strokeStyle='#c9b36a'; g.lineWidth=3; for(let k=0;k<5;k++){ g.beginPath(); g.moveTo(x,H-hh); g.lineTo(x+rnd(-10,10),H-hh-rnd(10,18)); g.stroke(); }
    if(RNG()<0.8){ g.fillStyle='#a6b35a'; g.beginPath(); g.ellipse(x+5,H-hh*0.45,5,14,0.2,0,TAU); g.fill(); } }
  return mkTex(c); }
function buildCorn(scene){
  if(!CORN.length) return; RNG=mulberry32(1212); const gb=new GB(); const col=new THREE.Color(1,1,1);
  for(const st of CORN){ const {P,u,v}=st; for(let s=st.s0; s<st.s1; s+=1.25){ // row line: points q(t)=u*t+v*s
      const hits=[]; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; const av=a[0]*v[0]+a[1]*v[1]-s, bv=b[0]*v[0]+b[1]*v[1]-s; if((av>0)!==(bv>0)){ const t=av/(av-bv); const x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t; hits.push(x*u[0]+z*u[1]); } }
      hits.sort((p,q)=>p-q);
      for(let k=0;k+1<hits.length;k+=2){ const t0=hits[k]+0.8, t1=hits[k+1]-0.8; for(let t=t0;t<t1;t+=3.5){ const te=Math.min(t1,t+3.5); const x0=u[0]*t+v[0]*s, z0=u[1]*t+v[1]*s, x1=u[0]*te+v[0]*s, z1=u[1]*te+v[1]*s; const h=rnd(1.9,2.4);
          if(!roadClear((x0+x1)/2,(z0+z1)/2,1.5)) continue; if(typeof creekDist==='function'&&(creekDist(x0,z0)<CREEK.Wc+3.5||creekDist(x1,z1)<CREEK.Wc+3.5)) continue; const y0=getHeight(x0,z0)-0.05, y1=getHeight(x1,z1)-0.05;
          gb.quad([x0,y0,z0],[x1,y1,z1],[x1,y1+h,z1],[x0,y0+h,z0],[t/2,0],[te/2,0],[te/2,1],[t/2,1],col,[v[0],0,v[1]]); } } } }
  const mat=new THREE.MeshStandardMaterial({map:cornTexture(),alphaTest:0.4,side:THREE.DoubleSide,roughness:0.9});
  const m=new THREE.Mesh(gb.geometry(),mat); m.castShadow=true; m.receiveShadow=true; m.matrixAutoUpdate=false; scene.add(m);
}
/* ---- GPU grass around the player ---- */
function buildGrass(scene,count,R){
  const blades=5; const pos=[], bh=[], idx=[]; const rr=mulberry32(17);
  for(let b=0;b<blades;b++){ const a=rr()*Math.PI, ca=Math.cos(a), sa=Math.sin(a); const ox=(rr()-0.5)*0.22, oz=(rr()-0.5)*0.22; const w=0.016+rr()*0.014, h=0.26+rr()*0.26; const lean=(rr()-0.5)*0.25;
    const base=pos.length/3; const V=[[-w,0,0],[w,0,0],[-w*0.55,0.55,lean*0.4],[w*0.55,0.55,lean*0.4],[0,1,lean]];
    for(const [x,y,l] of V){ pos.push(ox+ca*x-sa*l, y*h, oz+sa*x+ca*l); bh.push(y*h); }
    idx.push(base,base+1,base+3, base,base+3,base+2, base+2,base+3,base+4); }
  const g=new THREE.InstancedBufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('bh',new THREE.Float32BufferAttribute(bh,1)); g.setIndex(idx);
  g.setAttribute('normal',new THREE.Float32BufferAttribute(new Array(pos.length).fill(0).map((v,i)=>i%3===1?1:0),3));
  const T=2*R; const off=new Float32Array(count*3); const r=mulberry32(3);
  for(let i=0;i<count;i++){ off[i*3]=r()*T; off[i*3+1]=r()*T; off[i*3+2]=r(); }
  g.setAttribute('aOff',new THREE.InstancedBufferAttribute(off,3)); g.instanceCount=count;
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:0.95,metalness:0});
  const U=VEG.uniforms; const hTex=heightTexture();
  mat.onBeforeCompile=(sh)=>{ Object.assign(sh.uniforms,{uPlayer:U.uPlayer,uTime:U.uTime,uT:{value:T},uR:{value:R},uH:{value:hTex},uMix:{value:GROUND.mix},uAlb:{value:GROUND.alb},uOrigin:{value:new THREE.Vector2(X0,Z0)},uSize:{value:new THREE.Vector2(GW,GH)},uCell:{value:CELL},uN:{value:new THREE.Vector2(NX,NZ)},uCk:{value:(typeof CREEK!=='undefined'&&CREEK.tex)||GROUND.mix},uCkB:{value:(typeof CREEK!=='undefined'&&CREEK.texB)||new THREE.Vector4(0,0,-1,-1)}});
    sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute vec3 aOff; attribute float bh; uniform vec3 uPlayer; uniform float uTime,uT,uR,uCell; uniform sampler2D uH,uMix,uAlb,uCk; uniform vec4 uCkB; uniform vec2 uOrigin,uSize,uN; varying float vBH; varying vec3 vTint;
float hF(ivec2 p){ p=clamp(p,ivec2(0),ivec2(uN)-1); return texelFetch(uH,p,0).r; }
float terrainH(vec2 w){ vec2 f=(w-uOrigin)/uCell; ivec2 i=ivec2(floor(f)); vec2 t=f-floor(f); float a=hF(i), b=hF(i+ivec2(1,0)), c=hF(i+ivec2(0,1)), d=hF(i+ivec2(1,1)); return (t.x+t.y<=1.0)? a+(b-a)*t.x+(c-a)*t.y : d+(c-d)*(1.0-t.x)+(b-d)*(1.0-t.y); }`)
      .replace('#include <begin_vertex>',`
vec2 base=uPlayer.xz; vec2 wp=base+mod(aOff.xy-base,uT)-uT*0.5;
float dist=distance(wp,base); float fade=1.0-smoothstep(uR*0.55,uR,dist);
vec2 suv=(wp-uOrigin)/uSize; vec3 mx=texture(uMix,suv).rgb; float dens=mx.r*(1.0-mx.g*1.6)*(1.0-mx.b*1.5); { vec2 cku=(wp-uCkB.xy)/uCkB.zw; if(uCkB.z>0.0&&cku.x>0.0&&cku.x<1.0&&cku.y>0.0&&cku.y<1.0&&texture(uCk,cku).g>0.3) dens=-1.0; }
float hs=(0.16+0.3*fract(aOff.z*13.7))*(0.5+0.6*mx.r)*fade;
float a=aOff.z*6.2831*9.0; float ca=cos(a), sa=sin(a);
vec3 transformed=vec3(position.x*ca-position.z*sa, position.y*hs, position.x*sa+position.z*ca);
float wv=sin(uTime*1.9+wp.x*0.37+wp.y*0.23)+0.5*sin(uTime*3.1+wp.x*1.1);
transformed.x+=wv*0.09*bh*bh*hs*2.5; transformed.z+=wv*0.05*bh*bh*hs*2.5;
if(aOff.z>dens || fade<=0.001) transformed=vec3(0.0,-1000.0,0.0);
transformed.xz+=wp; transformed.y+=terrainH(wp)-0.02;
vBH=bh; vTint=texture(uAlb,suv).rgb; float cv=fract(aOff.z*7.31); vTint*= cv<0.18? vec3(1.18,1.08,0.72) : (cv<0.4? vec3(0.82,0.9,0.8) : vec3(0.95,0.97,0.92));`)
      .replace('#include <beginnormal_vertex>','vec3 objectNormal=vec3(0.0,1.0,0.0);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vBH; varying vec3 vTint;').replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize(vNormal);').replace('#include <map_fragment>','diffuseColor.rgb*=vTint*mix(0.5,1.35,vBH)*vec3(1.0,1.05,0.88);');
  };
  const m=new THREE.Mesh(g,mat); m.frustumCulled=false; m.castShadow=false; m.receiveShadow=true; scene.add(m); VEG.grass=m; return m;
}

const TREEFILL={value:0.2};
function foliageFill(m){ const prev=m.onBeforeCompile; const key=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):null;
  m.onBeforeCompile=(sh,r)=>{ if(prev) prev(sh,r); sh.uniforms.uFill=TREEFILL; sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFill;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*uFill;'); };
  m.customProgramCacheKey=()=>(key?key():'')+'|fill'; m.needsUpdate=true; }
