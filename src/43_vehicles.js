/* ===================== emergency vehicles & helicopter, detailed =====================
   Police: the realistic sedan in Croatian police livery (white, blue band, POLICIJA, light bar).
   Ambulance: a high-roof van (Sprinter type) — white, red/yellow chequer band, HITNA POMOĆ 194, blue lights.
   Fire engine: two-axle crew-cab truck, roller-shutter lockers, ladder rack, beacons, VATROGASCI DVD TUHELJ.
   Helicopter: EC135 style — shaped cabin, skids, tail boom with fenestron, four-blade rotor. */
const VX={};
function vxTex(w,h,draw){ const c=cvs(w,h), g=c.getContext('2d'); draw(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=ANISO; return t; }
function vxMat(c,r=0.5,m=0.1,o={}){ return new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o)); }
function vxWheels(g,list,r,w){ const BLK=vxMat(0x161718,0.85), RIM=vxMat(0xc9ccd0,0.3,0.85), HUB=vxMat(0x3a3c40,0.5,0.6); const wheels=[];
  for(const [x,z,front] of list){ const wg=new THREE.Group(); wg.position.set(x,r,z); const sp=new THREE.Group(); wg.add(sp); g.add(wg);
    const tg=new THREE.CylinderGeometry(r,r,w,24); tg.rotateX(Math.PI/2); const t=new THREE.Mesh(tg,BLK); t.castShadow=true; sp.add(t);
    const rg=new THREE.CylinderGeometry(r*0.6,r*0.6,w+0.02,20); rg.rotateX(Math.PI/2); sp.add(new THREE.Mesh(rg,RIM)); const hg=new THREE.CylinderGeometry(r*0.2,r*0.2,w+0.05,10); hg.rotateX(Math.PI/2); sp.add(new THREE.Mesh(hg,HUB));
    for(let k=0;k<6;k++){ const b=new THREE.Mesh(new THREE.BoxGeometry(r*0.08,r*0.36,w+0.03),HUB); b.rotation.z=k/6*TAU; sp.add(b); } wheels.push({w:wg,spin:sp,front}); } return wheels; }
function vxBox(g,w,h,d,mat,x,y,z,o={}){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); if(o.rz) m.rotation.z=o.rz; if(o.ry) m.rotation.y=o.ry; m.castShadow=o.cast!==false; m.receiveShadow=true; g.add(m); return m; }
function vxPlane(g,tex,w,h,x,y,z,ry){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:0.45,metalness:0.05,polygonOffset:true,polygonOffsetFactor:-2})); m.position.set(x,y,z); m.rotation.y=ry; g.add(m); return m; }
function vxBar(g,x,y,z,len,blueOnly){ const base=vxBox(g,0.32,0.08,len,vxMat(0x2a2c30,0.4,0.5),x,y,z); const L=[]; for(const sd of [-1,1]){ const col=blueOnly||sd<0?0x1f5fff:0xff2a2a; const m=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.12,len*0.44),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.6,transparent:true,opacity:0.9,roughness:0.2})); m.position.set(x,y+0.09,z+sd*len*0.25); g.add(m); L.push(m); } return L; }
// ---- police: realistic sedan + livery ----
function makePolice(){ const v=VX.base('sedan','#f4f5f6'); const g=v.group; const L=v.len, W=v.wid, top=v.roofY||1.45;
  const band=vxTex(1024,128,(c,w,h)=>{ c.clearRect(0,0,w,h); c.fillStyle='#1d3f99'; c.fillRect(0,22,w,62); c.fillStyle='#c9d3e0'; c.fillRect(0,84,w,10); c.fillStyle='#ffffff'; c.font='900 54px Manrope, Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('POLICIJA',w/2,55); });
  // decals sit on the real body: ray-cast the car's own meshes so nothing hovers above the hood or beside the doors
  g.updateMatrixWorld(true); const body=[]; g.traverse(o=>{ if(o.isMesh) body.push(o); }); const RC=new THREE.Raycaster(), V3=THREE.Vector3;
  const gi=new THREE.Matrix4().copy(g.matrixWorld).invert();
  const hit=(o,d)=>{ RC.set(o.applyMatrix4(g.matrixWorld),d.transformDirection(g.matrixWorld)); const h=RC.intersectObjects(body,false)[0]; return h?h.point.applyMatrix4(gi):null; };
  const surfY=(x,z)=>{ const h=hit(new V3(x,6,z),new V3(0,-1,0)); return h?h.y:null; };
  const sideZ=(x,y,sd)=>{ const h=hit(new V3(x,y,sd*6),new V3(0,0,-sd)); return h?Math.abs(h.z):null; };
  { const N=6, len=L*0.8, by=0.72, mat=new THREE.MeshStandardMaterial({map:band,transparent:true,roughness:0.45,metalness:0.05,polygonOffset:true,polygonOffsetFactor:-2});
    for(const sd of [-1,1]){ const zs=[]; for(let i=0;i<=N;i++){ const x=-len/2+len*i/N; zs.push([x,(sideZ(x,by,sd)||W/2)+0.012]); }
      for(let i=0;i<N;i++){ const [x0,z0]=zs[i], [x1,z1]=zs[i+1]; const seg=new THREE.PlaneGeometry(Math.hypot(x1-x0,z1-z0),0.34); const uv=seg.attributes.uv; for(let k=0;k<uv.count;k++){ const u=uv.getX(k); uv.setX(k,sd>0?(i+u)/N:1-(i+1-u)/N); }
        const m=new THREE.Mesh(seg,mat); m.position.set((x0+x1)/2,by,sd*(z0+z1)/2); m.rotation.y=(sd>0?0:Math.PI)+sd*Math.atan2(z1-z0,x1-x0)*-1; g.add(m); } } }
  const hood=vxTex(512,128,(c,w,h)=>{ c.clearRect(0,0,w,h); c.fillStyle='#1d3f99'; c.font='900 70px Manrope, Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('POLICIJA',w/2,h/2); }); { const p=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.28),new THREE.MeshStandardMaterial({map:hood,transparent:true,polygonOffset:true,polygonOffsetFactor:-2})); p.rotation.set(-Math.PI/2,0,-Math.PI/2); const hx=L*0.33, y0=surfY(hx-0.45,0), y1=surfY(hx+0.45,0), yc=surfY(hx,0); const hg=new THREE.Group(); hg.position.set(hx,(yc!==null?yc:0.98)+0.015,0); if(y0!==null&&y1!==null) hg.rotation.z=Math.atan2(y1-y0,0.9); hg.add(p); g.add(hg); }
  { const ry=surfY(-0.2,0); v.lights=vxBar(g,-0.2,(ry!==null?ry:top)+0.03,0,1.2,false); } v.custom=true; v.label='Policija'; return v; }
// ---- ambulance: high-roof van ----
function makeAmbulance(){ const g=new THREE.Group(); const WH=vxMat(0xf6f6f2,0.4,0.15), GL=vxMat(0x22313d,0.08,0.3,{transparent:true,opacity:0.85}), DK=vxMat(0x26282b,0.7,0.2), RED=vxMat(0xd3151e,0.45,0.1), YEL=vxMat(0xf1d21b,0.45,0.1);
  const L=5.9, W=2.0, H=2.6;
  vxBox(g,3.9,H-0.45,W,WH,-0.95,0.45+(H-0.45)/2,0); // box body
  vxBox(g,1.55,1.05,W-0.04,WH,1.75,0.95,0); // cab lower / bonnet
  { const geo=new THREE.BoxGeometry(1.0,0.95,W-0.06); geo.translate(0.5,0,0); const m=new THREE.Mesh(geo,WH); m.position.set(1.0,1.95,0); m.rotation.z=-0.45; m.castShadow=true; g.add(m); } // sloped cab roof to the box
  vxBox(g,0.04,0.78,W-0.2,GL,2.12,1.88,0,{rz:-0.5}); for(const sd of [-1,1]) vxBox(g,0.95,0.62,0.02,GL,1.55,1.85,sd*(W/2+0.005));
  vxBox(g,0.2,0.45,W*0.96,DK,2.52,0.72,0); vxBox(g,0.1,0.14,W*0.8,vxMat(0x777b80,0.3,0.8),2.6,0.95,0); for(const sd of [-1,1]) vxBox(g,0.06,0.16,0.32,vxMat(0xfff4d0,0.2,0,{emissive:0xfff0c0,emissiveIntensity:0.3}),2.62,1.05,sd*0.72);
  for(const sd of [-1,1]){ vxBox(g,0.7,0.5,0.02,GL,-0.1,2.1,sd*(W/2+0.006)); vxBox(g,0.04,1.9,0.02,DK,0.85,1.35,sd*(W/2+0.008)); }
  vxBox(g,0.02,1.85,W*0.9,DK,-2.91,1.4,0); vxBox(g,0.03,0.55,W*0.7,GL,-2.92,2.05,0); for(const sd of [-1,1]) vxBox(g,0.05,0.4,0.12,vxMat(0xc81818,0.3,0,{emissive:0x880000,emissiveIntensity:0.3}),-2.92,0.95,sd*0.9);
  // chequered red/yellow band, red stripe, HITNA POMOĆ 194
  const chk=vxTex(1024,128,(c,w,h)=>{ const n=24; for(let i=0;i<n;i++) for(let j=0;j<2;j++){ c.fillStyle=(i+j)%2?'#f1d21b':'#d3151e'; c.fillRect(i*w/n,j*h/2,w/n+1,h/2+1); } });
  const txt=vxTex(1024,160,(c,w,h)=>{ c.clearRect(0,0,w,h); c.fillStyle='#d3151e'; c.font='900 84px Manrope, Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('HITNA POMOĆ  194',w/2,h/2); });
  for(const sd of [-1,1]){ vxPlane(g,chk,5.7,0.3,0,1.05,sd*(W/2+0.012),sd>0?0:Math.PI); vxPlane(g,txt,3.4,0.5,-0.9,1.62,sd*(W/2+0.012),sd>0?0:Math.PI); }
  const bk=vxTex(512,128,(c,w,h)=>{ c.fillStyle='#d3151e'; c.fillRect(0,0,w,h); c.fillStyle='#fff'; c.font='900 70px Manrope, Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('194',w/2,h/2); }); vxPlane(g,bk,0.9,0.22,-2.94,1.75,0,-Math.PI/2);
  const lights=vxBar(g,1.25,2.72,0,1.5,true); for(const sd of [-1,1]){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.1,0.12),new THREE.MeshStandardMaterial({color:0x1f5fff,emissive:0x1f5fff,emissiveIntensity:1.4})); m.position.set(-2.88,2.65,sd*0.85); g.add(m); }
  const wheels=vxWheels(g,[[1.75,-0.86,true],[1.75,0.86,true],[-1.75,-0.86,false],[-1.75,0.86,false]],0.38,0.24);
  return {group:g,wheels,wb:3.5,track:1.72,len:L,wid:W,r:0.38,paint:null,col:'#f6f6f2',halfL:L/2,roofY:2.7,seatY:0.1,eyeH:1.95,custom:true,lights,label:'Hitna'}; }
// ---- fire engine ----
makeFireTruck=function(){ const g=new THREE.Group(); const RED=vxMat(0xc0171a,0.35,0.3), RED2=vxMat(0x9a1214,0.5,0.3), WHT=vxMat(0xf2f2ee,0.5,0.1), GL=vxMat(0x22313d,0.08,0.3,{transparent:true,opacity:0.85}), DK=vxMat(0x222326,0.7,0.3), AL=vxMat(0xc9ccd0,0.3,0.85), SH=vxMat(0xb3b6ba,0.35,0.8);
  // crew cab
  vxBox(g,2.3,2.0,2.45,RED,2.45,1.75,0); vxBox(g,0.05,0.85,2.2,GL,3.61,2.2,0); for(const sd of [-1,1]){ vxBox(g,0.8,0.65,0.02,GL,3.0,2.25,sd*1.235); vxBox(g,0.9,0.6,0.02,GL,1.85,2.25,sd*1.235); vxBox(g,0.05,1.7,0.02,DK,2.45,1.65,sd*1.24); }
  vxBox(g,0.12,0.55,2.45,DK,3.62,1.05,0); for(let k=0;k<5;k++) vxBox(g,0.13,0.04,1.9,AL,3.63,0.9+k*0.09,0); for(const sd of [-1,1]) vxBox(g,0.08,0.18,0.4,vxMat(0xfff4d0,0.2,0,{emissive:0xfff0c0,emissiveIntensity:0.3}),3.64,1.25,sd*0.95);
  vxBox(g,0.24,0.3,2.5,DK,3.7,0.62,0); vxBox(g,2.3,0.12,2.5,WHT,2.45,1.55,0);
  // equipment body with roller shutters
  vxBox(g,4.4,2.3,2.5,RED,-0.95,1.85,0); vxBox(g,4.42,0.12,2.52,WHT,-0.95,1.55,0);
  for(const sd of [-1,1]) for(let i=0;i<3;i++){ const x=-2.65+i*1.45; vxBox(g,1.3,1.6,0.03,SH,x,1.95,sd*1.255); for(let k=0;k<14;k++) vxBox(g,1.3,0.015,0.035,vxMat(0x8e9296,0.4,0.7),x,1.2+k*0.11,sd*1.258); vxBox(g,0.3,0.05,0.05,DK,x,1.18,sd*1.27); }
  vxBox(g,0.04,2.0,2.3,SH,-3.16,1.85,0); for(let k=0;k<17;k++) vxBox(g,0.045,0.015,2.3,vxMat(0x8e9296,0.4,0.7),-3.17,0.95+k*0.11,0);
  // roof: ladder rack, hose reel box
  for(const sd of [-0.42,0.42]) vxBox(g,4.6,0.06,0.07,AL,-0.7,3.18,sd); for(let x=-2.9;x<1.6;x+=0.38) vxBox(g,0.05,0.05,0.84,AL,x,3.18,0); for(const x of [-2.6,1.2]) vxBox(g,0.08,0.22,0.9,DK,x,3.06,0);
  vxBox(g,0.9,0.35,2.2,RED2,1.2,3.15,0);
  // livery
  const t=vxTex(1024,160,(c,w,h)=>{ c.clearRect(0,0,w,h); c.fillStyle='#ffffff'; c.font='900 74px Manrope, Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('VATROGASCI',w/2,52); c.font='800 46px Manrope, Arial'; c.fillText('DVD TUHELJ  ·  193',w/2,118); });
  for(const sd of [-1,1]) vxPlane(g,t,2.2,0.34,2.45,1.15,sd*1.24,sd>0?0:Math.PI);
  // beacons
  const blue=new THREE.MeshStandardMaterial({color:0x1f5fff,emissive:0x1f5fff,emissiveIntensity:0.6,roughness:0.2}); const bar=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.16,2.0),blue); bar.position.set(3.2,2.82,0); g.add(bar); for(const sd of [-1,1]){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.18,10),blue); b.position.set(-3.0,3.0,sd*1.0); g.add(b); }
  const wheels=vxWheels(g,[[2.55,-1.05,true],[2.55,1.05,true],[-1.75,-1.05,false],[-1.75,1.05,false]],0.52,0.36); for(const w of wheels) w.w.position.y=0.52;
  vxBox(g,6.6,0.35,1.2,DK,0.0,0.65,0); for(const x of [2.55,-1.75]) for(const sd of [-1,1]) vxBox(g,1.5,0.06,0.5,DK,x,1.2,sd*1.05); /* flat black mudguards over the wheels */
  return {group:g,wheels,wb:4.3,track:2.1,len:7.4,wid:2.5,r:0.52,truck:true,beacon:bar,col:'#c0171a',halfL:3.7}; };
// ---- helicopter ----
makeHeli=function(){ const g=new THREE.Group(); const RED=vxMat(0xc8161d,0.3,0.35), WHT=vxMat(0xf2f2ee,0.4,0.2), GL=vxMat(0x1f2c38,0.05,0.4,{transparent:true,opacity:0.8}), DK=vxMat(0x26282b,0.6,0.4);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),RED); body.scale.set(2.2,1.05,0.95); body.position.set(0.2,1.55,0); body.castShadow=true; g.add(body);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(1,24,16,0,TAU,0,Math.PI*0.62),GL); nose.scale.set(1.25,0.98,0.92); nose.rotation.z=-Math.PI/2+0.28; nose.position.set(0.95,1.62,0); g.add(nose);
  for(const sd of [-1,1]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.55),GL); w.position.set(-0.3,1.75,sd*0.93); w.rotation.y=sd>0?0:Math.PI; g.add(w); vxBox(g,1.6,0.04,0.02,WHT,-0.2,1.32,sd*0.95,{cast:false}); }
  vxBox(g,1.6,0.35,1.1,RED,-0.4,2.55,0); vxBox(g,0.6,0.2,0.7,DK,-0.9,2.62,0); // engine housing
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.42,4.3,14),RED); boom.rotation.z=Math.PI/2+0.06; boom.position.set(-3.6,1.9,0); boom.castShadow=true; g.add(boom);
  const fen=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.32,22,1,true),RED); fen.material=vxMat(0xc8161d,0.3,0.35,{side:THREE.DoubleSide}); fen.rotation.x=Math.PI/2; fen.position.set(-5.85,2.05,0); g.add(fen);
  vxBox(g,0.7,1.05,0.06,RED,-5.95,2.55,0,{rz:-0.25}); for(const sd of [-1,1]) vxBox(g,0.55,0.05,0.5,RED,-4.9,1.98,sd*0.42);
  const tr=new THREE.Group(); tr.position.set(-5.85,2.05,0); for(let k=0;k<6;k++){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.48,0.03),DK); b.rotation.z=k/6*Math.PI; tr.add(b); } g.add(tr);
  for(const sd of [-1,1]){ const sk=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,3.0,8),DK); sk.rotation.z=Math.PI/2; sk.position.set(0.1,0.06,sd*0.95); g.add(sk); const tip=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.4,8),DK); tip.rotation.z=Math.PI/2-0.6; tip.position.set(1.72,0.17,sd*0.95); g.add(tip);
    for(const x of [-0.65,0.75]){ const st=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.95,6),DK); st.position.set(x,0.5,sd*0.78); st.rotation.x=sd*0.35; g.add(st); } }
  const rot=new THREE.Group(); rot.position.set(-0.35,2.95,0); const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,0.25,12),DK); rot.add(hub); for(let k=0;k<4;k++){ const b=new THREE.Mesh(new THREE.BoxGeometry(4.9,0.04,0.28),DK); b.position.x=2.45; const arm=new THREE.Group(); arm.rotation.y=k*Math.PI/2; arm.add(b); rot.add(arm); } g.add(rot);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.3,10),DK); mast.position.set(-0.35,2.8,0); g.add(mast);
  const reg=vxTex(256,64,(c,w,h)=>{ c.clearRect(0,0,w,h); c.fillStyle='#fff'; c.font='900 44px Manrope, Arial'; c.textAlign='center'; c.fillText('9A-TUH',128,48); }); for(const sd of [-1,1]) vxPlane(g,reg,1.3,0.33,-2.6,1.95,sd*0.36,sd>0?0:Math.PI);
  return {g,rot,tr,st:{x:0,y:0,z:0,yaw:0,vx:0,vy:0,vz:0,pitch:0,roll:0,spin:0}}; };
// hook into the car factory: police/ambulance kinds get the detailed vehicles
VX.base=makeCarGroup;
makeCarGroup=function(type,color,roof){ if(type==='police') return makePolice(); if(type==='van'&&color==='#f7f7f7') return makeAmbulance(); return VX.base(type,color,roof); };
