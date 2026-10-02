/* ===================== cars: models, parked cars, drivable cars ===================== */
const CAR_SPECS={
  hatch:{L:4.05,W:1.76,r:0.31,xf:1.28,xr:-1.22,body:[[2.03,0.46],[2.03,0.66],[1.86,0.82],[0.95,0.98],[-1.72,1.02],[-1.95,0.98],[-2.02,0.72],[-2.03,0.45]],glass:[[0.95,0.98],[0.18,1.40],[-1.3,1.43],[-1.74,1.04]],roof:[[0.2,1.395],[-1.28,1.425],[-1.26,1.48],[0.15,1.455]]},
  sedan:{L:4.6,W:1.8,r:0.31,xf:1.45,xr:-1.35,body:[[2.3,0.46],[2.3,0.66],[2.1,0.82],[1.05,0.97],[-1.55,1.0],[-2.2,1.02],[-2.28,0.95],[-2.3,0.5]],glass:[[1.05,0.97],[0.3,1.38],[-0.95,1.40],[-1.6,1.0]],roof:[[0.32,1.375],[-0.93,1.395],[-0.9,1.45],[0.28,1.43]]},
  suv:{L:4.45,W:1.84,r:0.35,xf:1.35,xr:-1.3,body:[[2.22,0.5],[2.22,0.78],[2.0,0.95],[1.05,1.1],[-2.05,1.14],[-2.2,1.05],[-2.22,0.5]],glass:[[1.05,1.1],[0.35,1.6],[-1.95,1.62],[-2.12,1.16]],roof:[[0.37,1.595],[-1.93,1.615],[-1.9,1.68],[0.33,1.66]]},
  troc:{L:4.23,W:1.82,r:0.36,xf:1.34,xr:-1.26,body:[[2.12,0.52],[2.12,0.8],[1.92,0.97],[1.0,1.1],[-1.95,1.12],[-2.1,1.02],[-2.12,0.52]],glass:[[1.0,1.1],[0.3,1.52],[-1.35,1.54],[-1.98,1.13]],roof:[[0.32,1.515],[-1.33,1.535],[-1.3,1.6],[0.28,1.58]]},
  van:{L:4.9,W:1.96,r:0.33,xf:1.62,xr:-1.5,body:[[2.45,0.5],[2.45,0.8],[2.25,1.0],[1.65,1.12],[0.35,1.14],[0.35,1.93],[-2.4,1.93],[-2.45,1.8],[-2.45,0.5]],glass:[[1.65,1.12],[1.0,1.62],[0.37,1.64],[0.37,1.14]],roof:[[1.0,1.615],[0.37,1.635],[0.37,1.7],[0.95,1.66]]},
};
const CARGEO={};
function carGeos(type){ if(CARGEO[type]) return CARGEO[type]; const S=CAR_SPECS[type]; const L=S.L, W=S.W, r=S.r, cl=0.3, ra=r+0.06;
  const sh=new THREE.Shape(); sh.moveTo(-L/2+0.08,cl);
  const arch=(xc)=>{ sh.lineTo(xc-ra,cl); for(let k=1;k<=10;k++){ const a=Math.PI-k/10*Math.PI; sh.lineTo(xc+Math.cos(a)*ra, r+Math.sin(a)*ra*0.95); } sh.lineTo(xc+ra,cl); };
  arch(S.xr); arch(S.xf); sh.lineTo(L/2-0.05,cl); for(const p of S.body) sh.lineTo(p[0],p[1]); sh.lineTo(-L/2+0.08,cl);
  const ex=(shape,depth,bev)=>{ const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:3,steps:1}); g.translate(0,0,-depth/2); g.computeVertexNormals(); return g; };
  const poly=(pts)=>{ const s=new THREE.Shape(); s.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) s.lineTo(pts[i][0],pts[i][1]); s.lineTo(pts[0][0],pts[0][1]); return s; };
  const body=ex(sh,W-0.12,0.06), glass=ex(poly(S.glass),W-0.16,0.0), roof=ex(poly(S.roof),W-0.14,0.02);
  const tire=new THREE.CylinderGeometry(r,r,0.23,18); tire.rotateX(Math.PI/2); const rim=new THREE.CylinderGeometry(r*0.6,r*0.6,0.24,12); rim.rotateX(Math.PI/2);
  const dark=[], light=[];
  const bx=(x0,x1,y0,y1,z0,z1)=>{ const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0); g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); return g; };
  dark.push(bx(L/2-0.05,L/2+0.06,0.3,0.5,-W/2+0.02,W/2-0.02), bx(-L/2-0.06,-L/2+0.05,0.3,0.5,-W/2+0.02,W/2-0.02));
  for(const sz of [-1,1]) dark.push(bx(0.72,0.9,0.98,1.1,sz*(W/2)-0.06,sz*(W/2)+0.06));
  const head=[bx(L/2-0.04,L/2+0.02,0.66,0.78,-W/2+0.12,-W/2+0.46),bx(L/2-0.04,L/2+0.02,0.66,0.78,W/2-0.46,W/2-0.12)], tail=[bx(-L/2-0.02,-L/2+0.04,0.72,0.86,-W/2+0.1,-W/2+0.38),bx(-L/2-0.02,-L/2+0.04,0.72,0.86,W/2-0.38,W/2-0.1)];
  CARGEO[type]={S,body,glass,roof,tire,rim,dark,head,tail}; return CARGEO[type]; }
function gbAppend(G,geo,m4,C){ const g=geo.index?geo.toNonIndexed():geo; const p=g.attributes.position, n=g.attributes.normal, uv=g.attributes.uv; const nm=new THREE.Matrix3().getNormalMatrix(m4); const v=new THREE.Vector3(), w=new THREE.Vector3();
  for(let i=0;i<p.count;i+=3){ const P=[],N=[],U=[]; for(let k=0;k<3;k++){ v.fromBufferAttribute(p,i+k).applyMatrix4(m4); w.fromBufferAttribute(n,i+k).applyMatrix3(nm).normalize(); P.push([v.x,v.y,v.z]); N.push([w.x,w.y,w.z]); U.push(uv?[uv.getX(i+k),uv.getY(i+k)]:[0,0]); } G.triN(P[0],P[1],P[2],N[0],N[1],N[2],U[0],U[1],U[2],C); } }
const PAINTS=[['#e9e9e6',24],['#9ea3a8',18],['#1d1f22',16],['#28406e',8],['#8c1f1f',7],['#5a5f63',10],['#3b5b3a',3],['#b8a58a',4],['#6b2233',3]];
const CARMAT={};
function carMats(){ if(CARMAT.paint) return CARMAT;
  CARMAT.paint=new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.55,roughness:0.28,envMapIntensity:1.2});
  CARMAT.glass=new THREE.MeshStandardMaterial({color:0x151b21,metalness:0.3,roughness:0.06,envMapIntensity:1.4});
  CARMAT.dark=new THREE.MeshStandardMaterial({color:0x161718,roughness:0.85});
  CARMAT.chrome=new THREE.MeshStandardMaterial({color:0xcfd4d8,metalness:1,roughness:0.25});
  CARMAT.head=new THREE.MeshStandardMaterial({color:0xf4f2ea,emissive:0x333333,roughness:0.2});
  CARMAT.tail=new THREE.MeshStandardMaterial({color:0xb3141a,emissive:0x220000,roughness:0.3});
  return CARMAT; }
/* ---- drivable vehicles ---- */
const DRIVE=[]; // {type,group,wheels:[...],st:{x,z,yaw,v,steer,y,pitch,roll,spin},wb,track,len,wid,truck}
const CARCAM={orbit:0,pitch:0.12,t:0,first:false,pitchFP:0};
function makeCarGroup(type,color,roofCol){ if(typeof makeQCar==='function'){ const q=makeQCar(type,color); if(q) return q; } if(!CAR_SPECS[type]) type=type==='police'||type==='taxi'||type==='sport2'?'sedan':type==='sport'?'hatch':type; const Gd=carGeos(type), S=Gd.S, M=carMats(); const g=new THREE.Group(); const paint=new THREE.MeshStandardMaterial({color:new THREE.Color(color),metalness:0.55,roughness:0.28,envMapIntensity:1.2}); const roofM=roofCol?new THREE.MeshStandardMaterial({color:new THREE.Color(roofCol),metalness:0.5,roughness:0.3}):paint;
  const add=(geo,mat)=>{ const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true; g.add(m); return m; };
  add(Gd.body,paint); add(Gd.glass,M.glass); add(Gd.roof,roofM); if(type==='troc'){ const cl=new THREE.Mesh(new THREE.BoxGeometry(S.L-0.1,0.2,S.W+0.02),new THREE.MeshStandardMaterial({color:0x232426,roughness:0.8})); cl.position.set(0,0.42,0); g.add(cl); for(const sz of [-1,1]){ const rr=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.04,0.04),new THREE.MeshStandardMaterial({color:0xc9cdd1,metalness:0.9,roughness:0.3})); rr.position.set(-0.5,1.62,sz*(S.W/2-0.2)); g.add(rr); } } for(const d of Gd.dark) add(d,M.dark); for(const h of Gd.head) add(h,M.head); for(const t of Gd.tail) add(t,M.tail);
  const wheels=[]; for(const [x,sz] of [[S.xf,-1],[S.xf,1],[S.xr,-1],[S.xr,1]]){ const w=new THREE.Group(); const spin=new THREE.Group(); const t=new THREE.Mesh(Gd.tire,M.dark), rm=new THREE.Mesh(Gd.rim,M.chrome); t.castShadow=true; spin.add(t); spin.add(rm); w.add(spin); w.position.set(x,S.r,sz*(S.W/2-0.12)); g.add(w); wheels.push({w,spin,front:x>0}); }
  return {group:g,wheels,wb:S.xf-S.xr,track:S.W-0.24,len:S.L,wid:S.W,r:S.r,paint,col:color,halfL:S.L/2}; }
function makeFireTruck(){ const gb=new GB(), gl=new GB(), gd=new GB(); const T=(x,y,z)=>[x,y,z]; const RED=lin('#c0171a'), WHITEC=lin('#f2f2ee'), GREY=lin('#8a8e92');
  gb.box(T,-3.5,2.1,0.55,3.05,-1.2,1.2,RED); gb.box(T,2.1,3.55,0.55,2.75,-1.2,1.2,RED); gb.box(T,-3.5,2.1,1.25,1.45,-1.23,1.23,WHITEC); gb.box(T,2.1,3.55,1.25,1.4,-1.23,1.23,WHITEC);
  for(const sz of [-1,1]) for(let i=0;i<3;i++) gd.box(T,-3.2+i*1.75,-1.8+i*1.75,1.6,2.85,sz*1.2-0.02*sz,sz*1.22,GREY);
  gl.box(T,3.54,3.58,1.7,2.55,-1.05,1.05,WHITE); for(const sz of [-1,1]) gl.box(T,2.35,3.4,1.75,2.55,sz*1.21-0.01,sz*1.22+0.01*sz,WHITE);
  gd.box(T,-3.3,1.9,3.1,3.2,-0.55,-0.45,GREY); gd.box(T,-3.3,1.9,3.1,3.2,0.45,0.55,GREY); for(let x=-3.2;x<1.9;x+=0.4) gd.box(T,x,x+0.06,3.1,3.2,-0.5,0.5,GREY);
  gd.box(T,3.5,3.7,0.45,0.75,-1.2,1.2,lin('#222')); const blue=new GB(); blue.box(T,2.4,3.2,2.75,2.95,-0.9,0.9,lin('#1f5bff'));
  const g=new THREE.Group(); const M=carMats(); const add=(G,mat)=>{ const m=new THREE.Mesh(G.geometry(),mat); m.castShadow=true; m.receiveShadow=true; g.add(m); return m; };
  add(gb,new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.4,roughness:0.35})); add(gl,M.glass); add(gd,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.6,metalness:0.3})); const bl=add(blue,new THREE.MeshStandardMaterial({vertexColors:true,emissive:0x0b2ea8,emissiveIntensity:0.2,roughness:0.3}));
  const tire=new THREE.CylinderGeometry(0.5,0.5,0.34,18); tire.rotateX(Math.PI/2); const rim=new THREE.CylinderGeometry(0.3,0.3,0.35,12); rim.rotateX(Math.PI/2);
  const wheels=[]; for(const [x,sz] of [[2.55,-1],[2.55,1],[-1.6,-1],[-1.6,1],[-2.7,-1],[-2.7,1]]){ const w=new THREE.Group(); const spin=new THREE.Group(); const t=new THREE.Mesh(tire,M.dark), rm=new THREE.Mesh(rim,M.chrome); t.castShadow=true; spin.add(t); spin.add(rm); w.add(spin); w.position.set(x,0.5,sz*1.05); g.add(w); wheels.push({w,spin,front:x>0}); }
  return {group:g,wheels,wb:4.6,track:2.1,len:7.2,wid:2.45,r:0.5,truck:true,beacon:bl,col:'#c8161d',halfL:3.6}; }
function placeVehicle(scene,v,x,z,yaw){ v.st={x,z,yaw,v:0,steer:0,y:getHeight(x,z),pitch:0,roll:0,spin:0}; v.idx=DRIVE.length; DRIVE.push(v); scene.add(v.group); poseVehicle(v); }
function poseVehicle(v){ const s=v.st; const fx=-Math.sin(s.yaw), fz=-Math.cos(s.yaw), rx=Math.cos(s.yaw), rz=-Math.sin(s.yaw); const hb=v.wb/2, ht=v.track/2;
  const hf=groundAt(s.x+fx*hb,s.z+fz*hb), hr=groundAt(s.x-fx*hb,s.z-fz*hb), hl=groundAt(s.x-rx*ht,s.z-rz*ht), hR=groundAt(s.x+rx*ht,s.z+rz*ht);
  const ty=(hf+hr+hl+hR)/4; const tp=Math.atan2(hf-hr,v.wb), tr=Math.atan2(hl-hR,v.track); if(s.ys===undefined){ s.ys=ty; s.pitch=tp; s.roll=tr; } const kk=v.drivenByMe||v.remote?0.25:1; s.ys+=(ty-s.ys)*Math.min(1,kk*2.2); s.y=Math.max(ty-0.05,s.ys); s.pitch+=(tp-s.pitch)*kk; s.roll+=(tr-s.roll)*kk;
  v.group.position.set(s.x,s.y,s.z); v.group.rotation.set(s.roll,s.yaw+Math.PI/2,s.pitch,'YZX');
  for(const w of v.wheels){ w.spin.rotation.z=-s.spin; if(w.front) w.w.rotation.y=s.steer; } }
function nearestVehicle(x,z,maxd,any){ let best=null, bd=maxd; for(const v of DRIVE){ if(v.remote&&!any) continue; const d=Math.hypot(v.st.x-x,v.st.z-z)-v.len*0.35; if(d<bd){ bd=d; best=v; } } return best; }
function enterCar(v){ if(!v||v.remote) return; PLAYER.driving=v; v.drivenByMe=true; CARCAM.orbit=0; CARCAM.t=0; document.body.classList.add('driving'); UI.toast(v.truck?'Vatrogasno vozilo — sretno!':(GAME.touch?'Krug: volan i gas · Izađi dolje desno':'W/S gas i kočnica · A/D volan · Space ručna · E izlaz')); }
function exitCar(){ const v=PLAYER.driving; if(!v) return; if(v.exterior) for(const m of v.exterior) m.visible=true; if(v.interior) v.interior.visible=false; if(GAME.camera.fov!==72){ GAME.camera.fov=72; GAME.camera.updateProjectionMatrix(); } const s=v.st; const rx=Math.cos(s.yaw), rz=-Math.sin(s.yaw); let px=s.x-rx*(v.wid/2+0.9), pz=s.z-rz*(v.wid/2+0.9); if(BHASH.hit(px,pz,0.4)){ px=s.x+rx*(v.wid/2+0.9); pz=s.z+rz*(v.wid/2+0.9); }
  PLAYER.pos.set(px,groundAt(px,pz),pz); PLAYER.vel.set(0,0,0); PLAYER.yaw=s.yaw; PLAYER.pitch=0; v.drivenByMe=false; v.st.v=0; v.parkedBy='me'; PLAYER.driving=null; document.body.classList.remove('driving'); VEG.lastRebuild.set(1e9,0,1e9); if(v.beacon) v.beacon.material.emissiveIntensity=0.2; }
function updateDriving(dt){ const v=PLAYER.driving; if(!v) return; const s=v.st; const P=v.phys||{maxV:v.truck?24:34,rev:-7,acc:v.truck?5.2:7.5,brake:16,maxSteer:v.truck?0.5:0.62,sv:9};
  let thr=0, steer=0; if(KEYS.KeyW||KEYS.ArrowUp) thr+=1; if(KEYS.KeyS||KEYS.ArrowDown) thr-=1; if(KEYS.KeyA||KEYS.ArrowLeft) steer-=1; if(KEYS.KeyD||KEYS.ArrowRight) steer+=1;
  thr+=-TOUCH.mz; steer+=TOUCH.mx; thr=clamp(thr,-1,1); steer=clamp(steer,-1,1); const hand=!!KEYS.Space;
  const vs=Math.abs(s.v)/(P.sv||9); const wob=COMBAT.bac>0.4?Math.sin(GAME.time*1.7)*Math.min(0.25,COMBAT.bac*0.12):0; const target=-(steer+wob)*P.maxSteer/(1+vs*vs); s.steer+=(target-s.steer)*Math.min(1,dt*(Math.abs(target)<Math.abs(s.steer)?6:3.5));
  if(thr>0){ if(s.v<-0.3) s.v+=P.brake*thr*dt; else s.v+=P.acc*thr*dt*(1-Math.max(0,s.v)/P.maxV); }
  else if(thr<0){ if(s.v>0.3) s.v+=P.brake*thr*dt; else { s.v+=P.acc*0.6*thr*dt; if(s.v<P.rev) s.v=P.rev; } }
  else { const d=(0.9+Math.abs(s.v)*0.03)*dt; s.v=Math.abs(s.v)<=d?0:s.v-Math.sign(s.v)*d; }
  if(hand){ const d=P.brake*1.2*dt; s.v=Math.abs(s.v)<=d?0:s.v-Math.sign(s.v)*d; }
  s.v-=9.81*Math.sin(s.pitch)*dt*0.55;
  s.yaw+=s.v/v.wb*Math.tan(s.steer)*dt; const fx=-Math.sin(s.yaw), fz=-Math.cos(s.yaw); s.x+=fx*s.v*dt; s.z+=fz*s.v*dt;
  // collisions: push the body out of obstacles (slide along walls), damp only the speed going into them
  vehicleCollide(v,fx,fz,true);
  s.x=clamp(s.x,M.XMIN-140,M.XMAX+140); s.z=clamp(s.z,M.ZMIN-140,M.ZMAX+140);
  s.spin+=s.v*dt/v.r; poseVehicle(v); if(v.beacon) v.beacon.material.emissiveIntensity=0.4+0.6*(Math.sin(GAME.time*12)>0?1:0);
  PLAYER.pos.set(s.x,s.y,s.z); PLAYER.vel.set(fx*s.v,0,fz*s.v);
  CARCAM.t+=dt; if(CARCAM.t>0.7) CARCAM.orbit*=Math.exp(-dt*4);
  const sp=document.getElementById('speedo'); if(sp) sp.textContent=Math.round(Math.abs(s.v)*3.6)+' km/h';
}
function carCamera(cam,dt){ const v=PLAYER.driving||PLAYER.riding; const s=v.st;
  if(!CARCAM.init||CARCAM.sy===undefined) CARCAM.sy=s.yaw; let dyw=s.yaw-CARCAM.sy; while(dyw>Math.PI) dyw-=TAU; while(dyw<-Math.PI) dyw+=TAU; CARCAM.sy+=dyw*(1-Math.exp(-dt*3.2));
  if(!v.interior&&!v.formula&&!v.bike&&!v.tractor) buildCockpit(v); for(const o of DRIVE){ if(o.interior) o.interior.visible=(o===v&&CARCAM.first); if(o.exterior){ const hide=(o===v&&CARCAM.first); for(const m of o.exterior) if(m!==o.interior) m.visible=!hide; } } if(v.wheelG) v.wheelG.rotation.x=-s.steer*4.5; if(v.speedNeedle){ const kmh=Math.abs(s.v||0)*3.6; v.speedNeedle.rotation.x=-2.36+Math.min(1,kmh/220)*4.71; v.rpmNeedle.rotation.x=-2.36+Math.min(1,0.12+(kmh%40)/40*0.5+kmh/400)*4.71; }
  if(CARCAM.first){ const cfx=-Math.sin(s.yaw), cfz=-Math.cos(s.yaw), rx=Math.cos(s.yaw), rz=-Math.sin(s.yaw); const SS=(v.formula||v.bike)?[[0.05,0]]:v.truck?SEATS_TRUCK:SEATS_CAR; const sk=Math.min(SS.length-1,mySeat(v)); const fo=SS[sk][0]-(v.truck?0.03:0.06), side=SS[sk][1]; const eh=v.eyeH||(v.bike?1.66:v.formula?0.86:v.truck?2.4:1.24);
    cam.position.set(s.x+cfx*fo+rx*side, s.y+eh, s.z+cfz*fo+rz*side); cam.rotation.set(-0.06+s.pitch*0.85+CARCAM.pitchFP, s.yaw+CARCAM.orbit, -s.roll*0.6, 'YXZ'); if(cam.fov!==82){ cam.fov=82; cam.updateProjectionMatrix(); } CARCAM.init=true; if(CARCAM.t>0.7) CARCAM.pitchFP*=Math.exp(-dt*3); return; }
  if(cam.fov!==72){ cam.fov=72; cam.updateProjectionMatrix(); }
  const yaw=CARCAM.sy+CARCAM.orbit; const fx=-Math.sin(yaw), fz=-Math.cos(yaw);
  const back=v.truck?11:6.4, up=v.truck?4.2:2.35; const tx=s.x-fx*back, tz=s.z-fz*back; let ty=s.y+up+CARCAM.pitch*back; ty=Math.max(ty,getHeight(tx,tz)+0.7);
  const k=1-Math.exp(-dt*9); if(!CARCAM.init||cam.position.distanceTo(new THREE.Vector3(tx,ty,tz))>40){ cam.position.set(tx,ty,tz); CARCAM.init=true; } else { cam.position.x+=(tx-cam.position.x)*k; cam.position.y+=(ty-cam.position.y)*k; cam.position.z+=(tz-cam.position.z)*k; }
  cam.lookAt(s.x,s.y+1.25,s.z); }
function clusterTex(){ const c=cvs(512,200), g=c.getContext('2d'); g.fillStyle='#0b0c0e'; g.fillRect(0,0,512,200);
  const dial=(cx,max,step,lab)=>{ g.strokeStyle='#d9dde2'; g.lineWidth=3; g.beginPath(); g.arc(cx,100,82,Math.PI*0.75,Math.PI*2.25); g.stroke(); g.fillStyle='#e8ebee'; g.font='600 15px Manrope, Arial'; g.textAlign='center';
    for(let k=0;k<=max;k+=step){ const a=Math.PI*0.75+(k/max)*Math.PI*1.5; g.fillRect(0,0,0,0); g.beginPath(); g.moveTo(cx+Math.cos(a)*82,100+Math.sin(a)*82); g.lineTo(cx+Math.cos(a)*70,100+Math.sin(a)*70); g.stroke(); g.fillText(String(k),cx+Math.cos(a)*56,106+Math.sin(a)*56); }
    g.fillStyle='#9aa3ab'; g.font='600 12px Manrope, Arial'; g.fillText(lab,cx,150); };
  dial(110,8,1,'x1000 o/min'); dial(402,220,20,'km/h'); g.fillStyle='#10202c'; g.fillRect(206,40,100,120); g.fillStyle='#57c7ff'; g.font='700 20px Manrope, Arial'; g.textAlign='center'; g.fillText('TUHELJ',256,92); g.fillStyle='#9fe3a4'; g.font='600 14px Manrope, Arial'; g.fillText('D  ●  22°C',256,122);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function buildCockpit(v){ const g=new THREE.Group(); const T=v.truck; const W=v.wid;
  const M=(c,r=0.8,m=0,e)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e||0x000000});
  const dash=M(0x1d1e21,0.85), soft=M(0x2a2c30,0.9), chrome=M(0xb9bec4,0.3,0.9), skin=M(0xd9a88a,0.75), sleeve=M(0x24324a,0.9), seatM=M(0x2c2f35,0.95);
  const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); g.add(m); return m; };
  const box=(x0,x1,y0,y1,z0,z1,mat)=>add(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),mat,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
  const stick=(a,b,r,mat,parent)=>{ const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]); const L=d.length(); const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*0.95,L,10),mat); m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); (parent||g).add(m); return m; };
  const X=T?3.05:0.52, Y=T?1.72:0.84, dz=T?-0.53:-0.38, roofY=T?2.8:1.56;
  // dashboard, instrument hood with lit dials, centre console with screen, vents
  box(X,X+0.5,Y,Y+0.2,-W/2+0.08,W/2-0.08,dash); box(X+0.05,X+0.55,Y+0.2,Y+0.24,-W/2+0.1,W/2-0.1,soft);
  box(X-0.04,X+0.16,Y+0.2,Y+0.3,dz-0.2,dz+0.2,dash); const cl=new THREE.Mesh(new THREE.PlaneGeometry(0.36,0.14),new THREE.MeshBasicMaterial({map:clusterTex()})); cl.position.set(X-0.02,Y+0.22,dz); cl.rotation.y=-Math.PI/2; cl.rotation.x=0; g.add(cl);
  const needle=(ox)=>{ const n=new THREE.Mesh(new THREE.BoxGeometry(0.003,0.05,0.004),new THREE.MeshBasicMaterial({color:0xff5a2c})); const piv=new THREE.Group(); piv.position.set(X-0.025,Y+0.221,dz+ox); piv.rotation.y=-Math.PI/2; n.position.y=0.022; piv.add(n); g.add(piv); return piv; };
  v.speedNeedle=needle(0.115); v.rpmNeedle=needle(-0.115);
  box(X-0.35,X+0.12,Y-0.42,Y+0.12,-0.12,0.12,soft); const scr=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.12),M(0x0d1b26,0.2,0,0x0a2436)); scr.position.set(X-0.005,Y+0.02,0); scr.rotation.y=-Math.PI/2; g.add(scr);
  for(const zz of [dz-0.28,0.2,0.36]) add(new THREE.CylinderGeometry(0.035,0.035,0.02,14),chrome,X-0.004,Y+0.13,zz,0,0,Math.PI/2);
  // A-pillars, roof liner, rear-view mirror, door panel, seats
  for(const sd of [-1,1]) stick([X+0.4,Y+0.22,sd*(W/2-0.12)],[X-0.3,roofY-0.02,sd*(W/2-0.16)],0.045,dash);
  box(X-1.4,X-0.25,roofY-0.04,roofY,-W/2+0.12,W/2-0.12,M(0x5d5f63,0.95));
  box(X-0.27,X-0.22,roofY-0.17,roofY-0.1,-0.13,0.13,dash); const mir=new THREE.Mesh(new THREE.PlaneGeometry(0.24,0.06),chrome); mir.position.set(X-0.275,roofY-0.135,0); mir.rotation.y=Math.PI/2; g.add(mir);
  box(X-1.0,X+0.35,Y-0.45,Y+0.12,-W/2+0.05,-W/2+0.1,soft); box(X-0.8,X-0.2,Y+0.05,Y+0.09,-W/2+0.1,-W/2+0.2,dash);
  for(const sz of [-1,1]){ box(X-1.05,X-0.9,Y-0.4,Y+0.35,sz*0.38-0.25,sz*0.38+0.25,seatM); box(X-1.05,X-0.55,Y-0.45,Y-0.33,sz*0.38-0.25,sz*0.38+0.25,seatM); }
  // steering wheel with hub + spokes, driver's hands at 10 and 2 with forearms
  const wb=new THREE.Group(); wb.position.set(X-0.14,Y+0.1,dz); wb.rotation.z=0.42; const wg=new THREE.Group(); wb.add(wg); const R=T?0.23:0.185;
  const rim=new THREE.Mesh(new THREE.TorusGeometry(R,0.024,10,32),M(0x151618,0.6)); rim.rotation.y=Math.PI/2; wg.add(rim);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.075,0.05,18),M(0x202226,0.7)); hub.rotation.z=Math.PI/2; wg.add(hub);
  const badge=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.052,16),chrome); badge.rotation.z=Math.PI/2; wg.add(badge);
  for(const a of [Math.PI/2+0.1,Math.PI/2-0.1+Math.PI,-Math.PI/2]){ const sp=new THREE.Mesh(new THREE.BoxGeometry(0.02,R*0.95,0.035),M(0x2a2c30,0.6,0.3)); sp.position.set(0,Math.cos(a)*R*0.48,Math.sin(a)*R*0.48); sp.rotation.x=-a; wg.add(sp); }
  stick([0,0,0],[0.18,-0.06,0],0.03,M(0x1a1b1d,0.8),wb);
  const handsG=new THREE.Group(); wg.add(handsG); if(!v.truck || true){ for(const sd of [-1,1]){ const a=sd*0.85; const hx=0, hy=Math.cos(a)*R, hz=Math.sin(a)*R; const hand=new THREE.Mesh(new THREE.SphereGeometry(0.05,12,10),skin); hand.scale.set(0.9,1.35,0.8); hand.position.set(-0.02,hy,hz); handsG.add(hand);
      const fore=stick([-0.03,hy-0.02,hz],[-0.5,hy-0.38,hz+sd*0.08],0.036,sleeve,handsG); const wrist=stick([-0.02,hy,hz],[-0.1,hy-0.06,hz+sd*0.01],0.032,skin,handsG); } }
  { const paintI=new THREE.MeshStandardMaterial({color:new THREE.Color(v.col||'#888'),metalness:0.5,roughness:0.3}); const hl=v.halfL||2.1;
    box(X+0.45,hl-0.05,Y+0.08,Y+0.13,-W/2+0.06,W/2-0.06,paintI); box(hl-0.12,hl-0.02,Y-0.3,Y+0.1,-W/2+0.06,W/2-0.06,paintI);
    for(const sd of [-1,1]){ box(-hl+0.3,X+0.5,Y-0.5,Y+0.17,sd*(W/2-0.05)-0.03,sd*(W/2-0.05)+0.03,soft); box(-hl+0.3,X+0.45,Y+0.17,Y+0.21,sd*(W/2-0.08)-0.05,sd*(W/2-0.08)+0.05,dash); }
    box(-hl+0.15,-hl+0.7,Y+0.05,Y+0.1,-W/2+0.1,W/2-0.1,dash); box(-hl+0.1,-hl+0.2,Y+0.1,roofY-0.05,-W/2+0.12,-W/2+0.2,dash); box(-hl+0.1,-hl+0.2,Y+0.1,roofY-0.05,W/2-0.2,W/2-0.12,dash);
    box(-hl+0.2,X+0.5,Y-0.6,Y-0.55,-W/2+0.08,W/2-0.08,M(0x2a2a2c,0.95));
    const liner=M(0x6a6c70,0.95); box(-hl+0.3,X-0.28,roofY-0.03,roofY+0.01,-W/2+0.06,W/2-0.06,liner);
    for(const sd of [-1,1]){ const zz=sd*(W/2-0.07); box(X-1.02,X-0.9,Y+0.17,roofY,zz-0.04,zz+0.04,dash); stick([-hl+0.62,Y+0.2,zz],[-hl+0.25,roofY-0.02,zz*0.97],0.05,dash); }
    const glassI=new THREE.MeshStandardMaterial({color:0x9fb6c4,transparent:true,opacity:0.16,roughness:0.05,metalness:0.2,depthWrite:false});
    const pane=(a,b,c,d)=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3)); geo.computeVertexNormals(); const m=new THREE.Mesh(geo,glassI); m.material.side=THREE.DoubleSide; g.add(m); };
    pane([X+0.44,Y+0.22,-W/2+0.12],[X+0.44,Y+0.22,W/2-0.12],[X-0.29,roofY-0.02,W/2-0.16],[X-0.29,roofY-0.02,-W/2+0.16]);
    for(const sd of [-1,1]){ const zz=sd*(W/2-0.07); pane([X+0.4,Y+0.19,zz],[-hl+0.62,Y+0.19,zz],[-hl+0.3,roofY-0.03,zz],[X-0.28,roofY-0.03,zz]); }
    pane([-hl+0.62,Y+0.2,-W/2+0.14],[-hl+0.62,Y+0.2,W/2-0.14],[-hl+0.25,roofY-0.03,W/2-0.18],[-hl+0.25,roofY-0.03,-W/2+0.18]);
    box(-hl+0.55,-hl+0.7,Y-0.45,Y+0.2,-W/2+0.12,W/2-0.12,seatM); }
  g.add(wb); g.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } }); v.exterior=v.group.children.slice(); g.visible=false; v.group.add(g); v.interior=g; v.wheelG=wg; v.handsG=handsG; }
/* ---- all parked cars (static merged) + drivable ones at key places ---- */
function buildCars(scene){
  RNG=mulberry32(2468); const M=carMats();
  const spots=[]; const add=(x,z,a,tag)=>{ if(BHASH.hit(x,z,1.2)) return; spots.push([x,z,a,tag]); };
  const shop=findB(b=>b.n==='Trgovina PZ Tuhelj'); if(shop){ const fr=frame(shop.rect[0],shop.rect[1],shop.rect[2]); const si=sideInfo(shop.f,shop.rect[3]/2,shop.rect[4]/2); [-5,-2.4,2.4].forEach((t,i)=>{ const p=wallPoint(fr,si,t,4.2); add(p[0],p[2],sideAngle(shop.rect[2],si)+Math.PI/2,i===0?'drive':''); }); }
  const cafeB=findB(b=>b.k==='cafe'); if(cafeB){ const fr=frame(cafeB.rect[0],cafeB.rect[1],cafeB.rect[2]); const si=sideInfo(cafeB.f,cafeB.rect[3]/2,cafeB.rect[4]/2); [13.6,16.4].forEach((t,i)=>{ const p=wallPoint(fr,si,t,5.2); add(p[0],p[2],sideAngle(cafeB.rect[2],si),i===0?'drive':''); }); }
  for(const l of LAND){ if(l.t!=='parking') continue; const bb=polyBBox(l.P); let first=true; for(let x=bb[0]+3;x<bb[1]-2;x+=2.7){ for(const z of [bb[2]+3.2,bb[3]-3.2]){ if(RNG()<0.45 && pointInPoly(x,z,l.P)){ add(x,z,Math.PI/2+(RNG()<0.5?0:Math.PI),first?'drive':''); first=false; } } } }
  for(const [x,z,a,tg] of [[-289,-38,2.6,'drive'],[-333,-24,0.65,''],[-236,-73,1.6,''],[-224,-35,0.3,'']]) add(x,z,a,tg);
  for(const b of BLD){ if(b.k!=='house' || !b.dw || RNG()>0.34) continue; const fm=b.front.mid; const dx=b.dw[0]-fm[0], dz=b.dw[1]-fm[1]; const L=Math.hypot(dx,dz); if(L<5.5||L>30) continue; const t=clamp(2.8/L,0,0.6); const x=fm[0]+dx*t, z=fm[1]+dz*t; if(!roadClear(x,z,1.3)) continue; add(x,z,Math.atan2(dz,dx),''); }
  // extra drivable car on the road near the start and in Pristava
  for(const [x,z] of [[START.x+10,START.z+3],[-561,112]]){ const n=nearestRoad(x,z,40,s=>s.t==='secondary'||s.t==='tertiary'||s.t==='unclassified'||s.t==='residential'); if(!n) continue; const s=n.s; const off=s.w*0.26; const px=s.x-s.tz*off, pz=s.z+s.tx*off; spots.push([px,pz,Math.atan2(s.tz,s.tx),'drive']); }
  const G={paint:new GB(),glass:new GB(),dark:new GB(),chrome:new GB(),head:new GB(),tail:new GB()}; const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0);
  let nd=0;
  for(const [x,z,a,tag] of spots){ const type=wpick([['hatch',38],['sedan',25],['suv',21],['van',10],['sport2',6]]); const col=wpick(PAINTS);
    if(tag==='drive' && nd<8){ const v=makeCarGroup(type,col); placeVehicle(scene,v,x,z,Math.atan2(-Math.cos(a),-Math.sin(a))); nd++; continue; }
    const y=getHeight(x,z); q.setFromAxisAngle(up,-a); m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(1,1,1)); const C=colJ(lin(col),0.12);
    { const Q=(typeof appendQCarStatic==='function')?appendQCarStatic(G,type,m4,C):null; if(Q){ addCollider(x,z,a,Q.len,Q.wid,y-1,y+2); continue; } }
    const Gd=carGeos(CAR_SPECS[type]?type:'sedan');
    gbAppend(G.paint,Gd.body,m4,C); gbAppend(G.paint,Gd.roof,m4,C); gbAppend(G.glass,Gd.glass,m4,WHITE); for(const d of Gd.dark) gbAppend(G.dark,d,m4,WHITE); for(const h of Gd.head) gbAppend(G.head,h,m4,WHITE); for(const t of Gd.tail) gbAppend(G.tail,t,m4,WHITE);
    const S=Gd.S; for(const [wx,sz] of [[S.xf,-1],[S.xf,1],[S.xr,-1],[S.xr,1]]){ const wm=new THREE.Matrix4().makeTranslation(wx,S.r,sz*(S.W/2-0.12)); const mm=m4.clone().multiply(wm); gbAppend(G.dark,Gd.tire,mm,WHITE); gbAppend(G.chrome,Gd.rim,mm,WHITE); }
    addCollider(x,z,a,S.L,S.W,y-1,y+2); }
  const mk=(gb,mat)=>{ if(!gb.count) return; const m=new THREE.Mesh(gb.geometry(),mat); m.castShadow=true; m.receiveShadow=true; m.matrixAutoUpdate=false; scene.add(m); };
  mk(G.paint,M.paint); mk(G.glass,M.glass); mk(G.dark,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.85,color:0x161718})); mk(G.chrome,M.chrome); mk(G.head,M.head); mk(G.tail,M.tail); if(G.qmisc) mk(G.qmisc,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.6,metalness:0.25}));
  // fire truck in the fire station yard (settled out of the hedge/props)
  { const n=nearestRoad(START.x+26,START.z+6,60,s=>s.t==='secondary'||s.t==='tertiary'||s.t==='unclassified'||s.t==='residential'); if(n){ const s2=n.s; const off=s2.w*0.26; const px=s2.x-s2.tz*off, pz=s2.z+s2.tx*off; const v=makeFormula(); placeVehicle(scene,v,px,pz,Math.atan2(s2.tz,s2.tx)-Math.PI/2); } }
  spawnBikes(scene);
  if(LANDMARKS.aptF){ const {F,ang}=LANDMARKS.aptF; const q=F(-3.4,0,6.3), d=F(0,0,6.3); const v=makeCarGroup('troc','#b81d24','#141414'); v.label='T-Roc'; placeVehicle(scene,v,q[0],q[2],faceYaw(d[0]-q[0],d[2]-q[2])); }
  const fire=findB(b=>b.k==='fire'); if(fire && LANDMARKS.fire){ const Lf=LANDMARKS.fire; const dx=fire.rect[0]-Lf.x, dz=fire.rect[1]-Lf.z; const dl=Math.hypot(dx,dz); const ux=dx/dl, uz=dz/dl; const px=Lf.x+ux*5.5+(-uz)*6.0, pz=Lf.z+uz*5.5+ux*6.0; const yaw=Math.atan2(ux,uz); const v=makeFireTruck(); placeVehicle(scene,v,px,pz,yaw); }
  try{ if(typeof placeTractors==='function') placeTractors(scene); }catch(e){ console.warn('traktori',e); }
  for(const v of DRIVE){ freeSpot(v); poseVehicle(v); }
}

function carCollide(p,r,y){ for(const o of BHASH.near(p.x,p.z)){ if(o.hl<0.32&&o.hw<0.32) continue; if(y!==undefined && (y>o.y1+0.3 || y<o.y0-2)) continue; const dx=p.x-o.cx, dz=p.z-o.cz; let lx=dx*o.c+dz*o.s, lz=-dx*o.s+dz*o.c; const px=o.hl+r-Math.abs(lx), pz=o.hw+r-Math.abs(lz);
    if(px>0 && pz>0){ if(px<pz) lx+=Math.sign(lx||1)*px; else lz+=Math.sign(lz||1)*pz; p.x=o.cx+lx*o.c-lz*o.s; p.z=o.cz+lx*o.s+lz*o.c; } } }
function vehicleCollide(v,fx,fz,damp){ const s=v.st; const rr=v.wid*0.46; let sx=0, sz=0, n=0; const TR=VEG.trunks?VEG.trunks.filter(t=>Math.abs(t[0]-s.x)<v.len+3&&Math.abs(t[1]-s.z)<v.len+3):[];
  for(let it=0;it<3;it++){ let mx=0, mz=0, hits=0;
    for(const t of [-0.36,0,0.36]){ const p={x:s.x+fx*v.len*t, z:s.z+fz*v.len*t}; const q={x:p.x,z:p.z}; carCollide(q,rr,s.y+0.6);
      for(const [tx,tz,tr] of TR){ const ddx=q.x-tx, ddz=q.z-tz, dd=Math.hypot(ddx,ddz), m=tr+rr*0.8; if(dd<m&&dd>1e-4){ q.x=tx+ddx/dd*m; q.z=tz+ddz/dd*m; } }
      for(const o of DRIVE){ if(o===v) continue; const ddx=q.x-o.st.x, ddz=q.z-o.st.z, dd=Math.hypot(ddx,ddz), m=(o.wid+v.wid)*0.5; if(dd<m&&dd>1e-4){ q.x=o.st.x+ddx/dd*m; q.z=o.st.z+ddz/dd*m; } }
      const ddx=q.x-p.x, ddz=q.z-p.z; if(Math.abs(ddx)+Math.abs(ddz)>1e-4){ mx+=ddx; mz+=ddz; hits++; } }
    if(!hits) break; s.x+=mx/hits; s.z+=mz/hits; sx+=mx/hits; sz+=mz/hits; n++; }
  if(n && damp){ const pl=Math.hypot(sx,sz); if(pl>1e-4){ const into=(fx*sx+fz*sz)/pl*Math.sign(s.v); if(into<-0.2) s.v*=Math.max(0.15,1+into*0.85*Math.min(1,pl*8)); else s.v*=0.985; } }
  return n>0; }
function freeSpot(v){ const s=v.st; const fx=-Math.sin(s.yaw), fz=-Math.cos(s.yaw); for(let k=0;k<8;k++){ if(!vehicleCollide(v,fx,fz,false)) break; } }

function seatsOf(v){ return (v.formula||v.bike)?1:v.truck?6:5; }
function riders(v){ let n=0; for(const R of NET.remotes.values()) if(R.pa===v.idx) n++; return n; }
function enterAsPassenger(v){ if(!v) return; if(1+riders(v)>=seatsOf(v)){ UI.toast('Auto je puno'); return; } PLAYER.riding=v; CARCAM.orbit=0; CARCAM.init=false; document.body.classList.add('driving'); UI.toast('Sjedio si kao suvozač — E ili Izađi za izlaz'); }
function exitRide(){ const v=PLAYER.riding; if(!v) return; if(v.exterior) for(const m of v.exterior) m.visible=true; if(v.interior) v.interior.visible=false; if(GAME.camera.fov!==72){ GAME.camera.fov=72; GAME.camera.updateProjectionMatrix(); } const s=v.st; const rx=Math.cos(s.yaw), rz=-Math.sin(s.yaw); let px=s.x+rx*(v.wid/2+0.9), pz=s.z+rz*(v.wid/2+0.9); if(BHASH.hit(px,pz,0.4)){ px=s.x-rx*(v.wid/2+0.9); pz=s.z-rz*(v.wid/2+0.9); }
  PLAYER.pos.set(px,groundAt(px,pz),pz); PLAYER.vel.set(0,0,0); PLAYER.yaw=s.yaw; PLAYER.riding=null; document.body.classList.remove('driving'); VEG.lastRebuild.set(1e9,0,1e9); }
function updateRiding(dt){ const v=PLAYER.riding; if(!v) return; const s=v.st; PLAYER.pos.set(s.x,s.y,s.z); CARCAM.t+=dt; if(CARCAM.t>1.4) CARCAM.orbit*=Math.exp(-dt*2.5); const sp=document.getElementById('speedo'); if(sp) sp.textContent=Math.round(Math.abs(s.v||0)*3.6)+' km/h'; }
function useCarKey(){ if(gtaUse()) return; if(PLAYER.driving){ exitCar(); return; } if(PLAYER.riding){ exitRide(); return; } if(COMBAT.dead) return; const v=nearestVehicle(PLAYER.pos.x,PLAYER.pos.z,3.4,true); if(!v){ if(nearValentina()) openDrinks('valentina'); else if(nearBar()) openDrinks(); else if(nearPoker()) pkOpen(); return; } COMBAT.armed=false; document.body.classList.remove('armed'); if(v.remote) enterAsPassenger(v); else { enterCar(v); if(COMBAT.bac>0.5) setTimeout(()=>UI.toast('Pijan si — bolje ne voziti! 🚫🍺'),900); } }

function makeFormula(){ const g=new THREE.Group(); const M=(c,m=0.4,r=0.35)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r}); const red=M(0xc8161d,0.5,0.28), wht=M(0xf4f2ea,0.3,0.4), blk=M(0x151618,0.3,0.6), crb=M(0x2a2c30,0.4,0.5);
  const box=(w,h,d,m,x,y,z)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,z); b.castShadow=true; g.add(b); return b; };
  box(2.3,0.32,0.72,red,0.05,0.34,0); box(1.2,0.22,0.36,red,1.7,0.3,0); { const nose=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.2,0.9,10),red); nose.rotation.z=-Math.PI/2; nose.position.set(2.65,0.26,0); nose.castShadow=true; g.add(nose); }
  for(const sd of [-1,1]){ box(1.35,0.34,0.36,red,-0.25,0.3,sd*0.55); box(0.26,0.3,0.05,blk,0.42,0.3,sd*0.74); }
  box(1.5,0.3,0.46,red,-0.95,0.52,0); box(0.5,0.42,0.3,red,-0.35,0.62,0);
  box(0.62,0.05,1.9,crb,3.05,0.1,0); for(const sd of [-1,1]) box(0.5,0.18,0.04,crb,3.05,0.17,sd*0.95); box(0.22,0.04,1.8,red,3.1,0.18,0);
  box(0.4,0.04,1.1,crb,-2.35,0.95,0); box(0.3,0.04,1.1,red,-2.2,1.05,0); for(const sd of [-1,1]) box(0.62,0.62,0.04,crb,-2.3,0.72,sd*0.56); box(0.12,0.5,0.1,crb,-2.1,0.7,0);
  const chk=(()=>{ const c=cvs(128,128), x=c.getContext('2d'); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ x.fillStyle=(i+j)%2?'#f4f2ea':'#c8161d'; x.fillRect(i*32,j*32,32,32); } const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
  { const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.34),new THREE.MeshStandardMaterial({map:chk,roughness:0.4})); pl.rotation.x=-Math.PI/2; pl.position.set(1.6,0.415,0); g.add(pl); const n=cvs(128,64), x=n.getContext('2d'); x.fillStyle='#fff'; x.font='900 54px Manrope, Arial'; x.textAlign='center'; x.fillText('1',64,54); const tn=new THREE.CanvasTexture(n); tn.colorSpace=THREE.SRGBColorSpace; for(const sd of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.15),new THREE.MeshBasicMaterial({map:tn,transparent:true})); p.position.set(2.2,0.34,sd*0.19); p.rotation.y=sd>0?0:Math.PI; g.add(p); } }
  { const halo=new THREE.Mesh(new THREE.TorusGeometry(0.36,0.03,8,20,Math.PI),blk); halo.rotation.set(-Math.PI/2,0,Math.PI/2); halo.position.set(0.25,0.82,0); g.add(halo); box(0.04,0.3,0.05,blk,0.6,0.66,0); }
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(0.16,16,12),M(0xf2c318,0.3,0.3)); helmet.position.set(0.05,0.78,0); helmet.visible=false; g.add(helmet); const visor=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.07,0.24),M(0x111111,0.8,0.1)); visor.position.set(0.18,0.8,0); helmet.add(visor); visor.position.set(0.13,0.02,0);
  const tire=new THREE.CylinderGeometry(0.34,0.34,0.36,24); tire.rotateX(Math.PI/2); const rim=new THREE.CylinderGeometry(0.2,0.2,0.37,16); rim.rotateX(Math.PI/2);
  const wheels=[]; for(const [x,sz,wd] of [[1.9,-1,0.3],[1.9,1,0.3],[-1.7,-1,0.4],[-1.7,1,0.4]]){ const w=new THREE.Group(), spin=new THREE.Group(); const t=new THREE.Mesh(tire,blk), rm=new THREE.Mesh(rim,M(0x9aa0a6,0.9,0.3)); t.scale.z=wd/0.36; rm.scale.z=wd/0.36; t.castShadow=true; spin.add(t,rm); w.add(spin); w.position.set(x,0.34,sz*0.82); g.add(w); wheels.push({w,spin,front:x>0}); }
  return {group:g,wheels,wb:3.6,track:1.64,len:5.4,wid:1.95,r:0.34,formula:true,helmet,label:'Formulu',col:'#c8161d',halfL:2.7,phys:{maxV:88,rev:-8,acc:17,brake:34,maxSteer:0.34,sv:24}}; }
