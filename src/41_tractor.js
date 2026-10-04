/* ===================== tractor: a proper Zagorje tractor (red, IMT/Zetor style) with a plough =====================
   Built from parts (no cartoon pack): long hood with grille and side vents, exhaust stack, glazed cab with a white roof,
   big lugged rear tyres under mudguards, small front tyres, steps, lights, a 3-point hitch and a three-share plough.
   On farmland the plough drops and the tractor turns the soil: brown furrows are laid behind it and you earn a little. */
const TRACT={furrow:null,n:0,cap:6000,last:null,acc:0,paid:0,dust:0};
function tractorFurrowTex(){ const c=cvs(256,256), g=c.getContext('2d'); g.fillStyle='#5a3f2b'; g.fillRect(0,0,256,256); const R=mulberry32(31);
  for(let i=0;i<6;i++){ const x=i*42+4; const gr=g.createLinearGradient(x,0,x+42,0); gr.addColorStop(0,'#3e2a1b'); gr.addColorStop(0.35,'#6e4f36'); gr.addColorStop(0.7,'#5d4130'); gr.addColorStop(1,'#33231a'); g.fillStyle=gr; g.fillRect(x,0,42,256); }
  for(let i=0;i<2500;i++){ const v=R(); g.fillStyle=`rgba(${v<0.5?30:120},${v<0.5?20:90},${v<0.5?12:60},${0.15+R()*0.25})`; g.fillRect(R()*256,R()*256,1+R()*3,1+R()*2); } return mkTex(c); }
makeTractor=function(){ const g=new THREE.Group(); const M=(c,r=0.55,m=0.15)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const RED=M(0xb51f1a,0.42,0.25), RED2=M(0x8e1712,0.5,0.2), WH=M(0xefefea,0.5,0.1), BLK=M(0x1d1e20,0.8,0.1), DARK=M(0x2c2d30,0.6,0.4), CHR=M(0xc9ccd0,0.25,0.9), RIM=M(0xe0b81e,0.45,0.3), GL=new THREE.MeshStandardMaterial({color:0x8fa6b4,roughness:0.05,metalness:0.1,transparent:true,opacity:0.38}), LMP=new THREE.MeshStandardMaterial({color:0xfff4d0,emissive:0xfff0c0,emissiveIntensity:0.3});
  const box=(w,h,d,mat,x,y,z,ry=0,rz=0)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.rotation.set(0,ry,rz); m.castShadow=true; m.receiveShadow=true; g.add(m); return m; };
  const cyl=(rt,rb,h,mat,x,y,z,ax='y',seg=14)=>{ const geo=new THREE.CylinderGeometry(rt,rb,h,seg); if(ax==='z') geo.rotateX(Math.PI/2); if(ax==='x') geo.rotateZ(Math.PI/2); const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; };
  // frame, engine block and long hood (front = +x)
  box(3.0,0.32,0.62,DARK,0.35,0.62,0); box(1.75,0.62,0.86,RED,1.05,1.12,0); box(1.75,0.08,0.9,RED2,1.05,1.46,0);
  { const geo=new THREE.CylinderGeometry(0.43,0.43,1.75,16,1,false,0,Math.PI); geo.rotateZ(Math.PI/2); geo.rotateX(Math.PI/2); const m=new THREE.Mesh(geo,RED); m.position.set(1.05,1.42,0); m.scale.set(1,0.18,1); m.castShadow=true; g.add(m); }
  box(0.08,0.66,0.8,BLK,1.95,1.1,0); for(let k=0;k<6;k++) box(0.09,0.03,0.74,CHR,1.97,0.86+k*0.1,0); box(0.1,0.12,0.86,WH,1.97,1.48,0); // grille + badge band
  for(const s of [-1,1]){ for(let k=0;k<5;k++) box(0.5,0.025,0.02,BLK,1.1,1.0+k*0.07,s*0.435); box(0.13,0.11,0.06,LMP,1.9,1.32,s*0.36); } // side vents, headlights
  cyl(0.055,0.055,1.05,CHR,1.45,1.95,-0.25); cyl(0.07,0.055,0.12,BLK,1.45,2.5,-0.25); // exhaust stack
  // cab: posts, glass, white roof, seat and wheel inside
  const cx0=-0.95, cx1=0.25, cw=0.62; for(const [x,z] of [[cx0,cw],[cx0,-cw],[cx1,cw],[cx1,-cw]]) box(0.07,1.45,0.07,BLK,x,1.95,z);
  box(cx1-cx0,1.3,0.02,GL,(cx0+cx1)/2,1.9,cw); box(cx1-cx0,1.3,0.02,GL,(cx0+cx1)/2,1.9,-cw); box(0.02,1.3,2*cw,GL,cx1,1.9,0); box(0.02,1.3,2*cw,GL,cx0,1.9,0);
  box(cx1-cx0+0.22,0.09,2*cw+0.22,WH,(cx0+cx1)/2,2.7,0); box(cx1-cx0+0.1,0.05,2*cw+0.1,RED2,(cx0+cx1)/2,2.63,0); box(1.15,0.08,1.3,DARK,(cx0+cx1)/2,1.22,0);
  box(0.46,0.08,0.46,BLK,-0.42,1.4,-0.38); box(0.07,0.55,0.46,BLK,-0.68,1.68,-0.38); cyl(0.19,0.19,0.03,BLK,0.08,1.82,-0.38,'y',16).rotation.z=0.9; cyl(0.02,0.02,0.45,DARK,0.2,1.62,-0.38).rotation.z=0.9; /* driver sits low in the cab, in line with the seat */
  for(const s of [-1,1]){ box(0.5,0.04,0.22,DARK,-0.35,0.95,s*0.78); box(0.5,0.04,0.22,DARK,-0.35,0.62,s*0.78); box(0.1,0.12,0.06,M(0xd62a1a,0.4),cx0-0.05,2.45,s*0.6); }
  // mudguards over the rear wheels
  for(const s of [-1,1]){ box(1.05,0.05,0.56,RED,-0.85,1.68,s*0.95); box(0.32,0.05,0.56,RED,-0.27,1.5,s*0.95,0,0.95); box(0.32,0.05,0.56,RED,-1.43,1.5,s*0.95,0,-0.95); box(1.1,0.75,0.04,RED2,-0.85,1.2,s*0.7); } /* flat mudguards over the rear wheels */
  // 3-point hitch and the plough (rear = -x)
  const pl=new THREE.Group(); pl.position.set(-1.75,0.9,0); g.add(pl); const pbox=(w,h,d,mat,x,y,z,ry=0,rx=0)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.rotation.set(rx,ry,0); m.castShadow=true; pl.add(m); return m; };
  box(0.6,0.08,0.08,DARK,-1.5,0.85,0.35); box(0.6,0.08,0.08,DARK,-1.5,0.85,-0.35); box(0.5,0.08,0.08,DARK,-1.5,1.35,0);
  pbox(0.12,0.12,1.9,M(0x2b4c8f,0.5,0.3),-0.3,0,0,0.5); for(let k=0;k<3;k++){ const z=-0.65+k*0.65, x=-0.3-k*0.28; pbox(0.08,0.7,0.08,M(0x2b4c8f,0.5,0.3),x,-0.38,z); pbox(0.55,0.32,0.05,CHR,x-0.2,-0.78,z+0.12,0.6,-0.25); pbox(0.3,0.05,0.12,DARK,x-0.05,-0.92,z); }
  // wheels: big lugged rears, small fronts (spin about z like the cars)
  const wheels=[]; const mk=(x,z,r,w,front)=>{ const wg=new THREE.Group(); wg.position.set(x,r,z); const sp=new THREE.Group(); wg.add(sp); g.add(wg);
    const tg=new THREE.CylinderGeometry(r*0.93,r*0.93,w,24); tg.rotateX(Math.PI/2); const t=new THREE.Mesh(tg,BLK); t.castShadow=true; sp.add(t);
    const n=front?14:20; for(let k=0;k<n;k++){ const a=k/n*TAU; for(const sd of [-1,1]){ const lug=new THREE.Mesh(new THREE.BoxGeometry(r*0.12,r*0.1,w*0.52),BLK); lug.position.set(Math.cos(a)*r*0.95,Math.sin(a)*r*0.95,sd*w*0.25); lug.rotation.set(sd*0.5,0,a); sp.add(lug); } }
    const rg=new THREE.CylinderGeometry(r*0.55,r*0.55,w+0.02,16); rg.rotateX(Math.PI/2); sp.add(new THREE.Mesh(rg,RIM)); const hg=new THREE.CylinderGeometry(r*0.18,r*0.18,w+0.06,10); hg.rotateX(Math.PI/2); sp.add(new THREE.Mesh(hg,DARK));
    for(let k=0;k<6;k++){ const b=new THREE.Mesh(new THREE.BoxGeometry(r*0.08,r*0.08,w+0.04),DARK); const a=k/6*TAU; b.position.set(Math.cos(a)*r*0.38,Math.sin(a)*r*0.38,0); sp.add(b); }
    wheels.push({w:wg,spin:sp,front}); };
  for(const s of [-1,1]){ mk(-0.85,s*0.95,0.8,0.46,false); mk(1.45,s*0.78,0.44,0.24,true); }
  return {group:g,wheels,wb:2.3,track:1.9,len:4.1,wid:2.2,r:0.8,paint:null,col:'#b51f1a',halfL:2.05,label:'Traktor',tractor:true,plough:pl,roofY:2.75,seatY:0.72,eyeH:2.25,phys:{maxV:10.5,rev:-4,acc:3.0,brake:9,maxSteer:0.6,sv:6}}; };
// ploughing: furrows behind the tractor on farmland
function furrowInit(){ const n=TRACT.cap; const pos=new Float32Array(n*4*3), uv=new Float32Array(n*4*2), idx=new Uint32Array(n*6); for(let i=0;i<n;i++){ const b=i*4; idx.set([b,b+2,b+1,b+1,b+2,b+3],i*6); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.BufferAttribute(uv,2)); geo.setIndex(new THREE.BufferAttribute(idx,1)); geo.setDrawRange(0,0); geo.computeBoundingSphere(); geo.boundingSphere.radius=1e5;
  const mat=new THREE.MeshStandardMaterial({map:tractorFurrowTex(),roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6}); const m=new THREE.Mesh(geo,mat); m.receiveShadow=true; m.frustumCulled=false; GAME.scene.add(m); TRACT.furrow=m; }
function furrowAdd(a,b){ if(!TRACT.furrow) furrowInit(); const i=TRACT.n%TRACT.cap; TRACT.n++; const geo=TRACT.furrow.geometry, P=geo.attributes.position.array, U=geo.attributes.uv.array; const dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; const nx=-dz/l*1.15, nz=dx/l*1.15; const v0=TRACT.n*0.6;
  const q=[[a[0]-nx,a[1]-nz],[a[0]+nx,a[1]+nz],[b[0]-nx,b[1]-nz],[b[0]+nx,b[1]+nz]]; q.forEach((p,k)=>{ P[(i*4+k)*3]=p[0]; P[(i*4+k)*3+1]=getHeight(p[0],p[1])+0.04; P[(i*4+k)*3+2]=p[1]; U[(i*4+k)*2]=k%2; U[(i*4+k)*2+1]=v0+(k>1?0.6:0); });
  geo.attributes.position.needsUpdate=true; geo.attributes.uv.needsUpdate=true; geo.setDrawRange(0,Math.min(TRACT.n,TRACT.cap)*6); geo.computeVertexNormals(); }
function tractorTick(dt){ const v=PLAYER.driving; for(const o of DRIVE){ if(o.plough&&o!==v) o.plough.rotation.z+=(-0.3-o.plough.rotation.z)*Math.min(1,dt*4); }
  if(!v||!v.tractor||!v.plough){ TRACT.last=null; return; } const s=v.st; const fx=-Math.sin(s.yaw), fz=-Math.cos(s.yaw); const hx=s.x-fx*2.6, hz=s.z-fz*2.6;
  const field=typeof inFarmland==='function'&&inFarmland(hx,hz); const down=field&&Math.abs(s.v)>0.6&&s.v>0; v.plough.rotation.z+=((down?0:-0.3)-v.plough.rotation.z)*Math.min(1,dt*4);
  if(!down){ TRACT.last=null; return; } if(!TRACT.last){ TRACT.last=[hx,hz]; return; } const d=Math.hypot(hx-TRACT.last[0],hz-TRACT.last[1]); if(d<1.1) return;
  furrowAdd(TRACT.last,[hx,hz]); TRACT.last=[hx,hz]; TRACT.acc+=d; if(Math.random()<0.5) try{ puff(new THREE.Vector3(hx,getHeight(hx,hz)+0.4,hz),1.2,0x7a5a3c); }catch(e){}
  if(TRACT.acc>60){ TRACT.acc-=60; try{ money(6,'oranje'); }catch(e){} if(!TRACT.told){ TRACT.told=true; UI.toast('🚜 Oreš njivu — svakih 60 m brazde 6 €'); } } }
