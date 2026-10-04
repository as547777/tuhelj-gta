/* ===================== street lighting at night =====================
   Every street lamp gets a lens that glows after dusk and a warm pool of light on the road; the eight lamps
   nearest the camera also carry real point lights, and the car you drive gets headlights. */
const LAMPS=[];
const NL={on:false,pts:[]};
function poolTex(){ const c=cvs(128,128), g=c.getContext('2d'); const gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(255,214,150,1)'); gr.addColorStop(0.35,'rgba(255,190,120,0.55)'); gr.addColorStop(1,'rgba(255,170,100,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function lightsInit(scene){ if(NL.on) return; NL.on=true; const n=LAMPS.length;
  if(n){ const lg=new THREE.BoxGeometry(0.62,0.05,0.26); const lm=new THREE.MeshStandardMaterial({color:0x2a2a28,emissive:0xffe2b0,emissiveIntensity:0,roughness:0.4}); const lens=new THREE.InstancedMesh(lg,lm,n);
    const pg=new THREE.PlaneGeometry(1,1); pg.rotateX(-Math.PI/2); const pm=new THREE.MeshBasicMaterial({map:poolTex(),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}); const pools=new THREE.InstancedMesh(pg,pm,n);
    const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0); for(let i=0;i<n;i++){ const L=LAMPS[i]; q.setFromAxisAngle(up,-L.a); m4.compose(new THREE.Vector3(L.x,L.y-0.03,L.z),q,new THREE.Vector3(1,1,1)); lens.setMatrixAt(i,m4); const gy=getHeight(L.x,L.z)+0.09; m4.compose(new THREE.Vector3(L.x,gy,L.z),new THREE.Quaternion(),new THREE.Vector3(15,1,15)); pools.setMatrixAt(i,m4); }
    lens.frustumCulled=false; pools.frustumCulled=false; pools.renderOrder=3; scene.add(lens); scene.add(pools); NL.lens=lm; NL.pool=pm; }
  for(let i=0;i<(GAME.touch?3:8);i++){ const l=new THREE.PointLight(0xffcf96,0,26,1.7); l.position.set(0,-500,0); scene.add(l); NL.pts.push(l); }
  const hl=new THREE.SpotLight(0xfff2dc,0,70,0.55,0.55,1.3); hl.position.set(0,-500,0); scene.add(hl); scene.add(hl.target); NL.head=hl; }
function lightsTick(){ if(!NL.on) return; const n=(typeof SKY!=='undefined'&&SKY.night)||0; const k=smooth(0.15,0.6,n); if(typeof TREEFILL!=='undefined') TREEFILL.value=0.36*(1-0.85*n);
  if(NL.lens){ NL.lens.emissiveIntensity=k*4.5; NL.pool.opacity=k*0.42; }
  const cam=GAME.camera.position; if(k>0.01&&LAMPS.length){ const near=[]; for(const L of LAMPS){ const d=(L.x-cam.x)**2+(L.z-cam.z)**2; if(d<160*160) near.push([d,L]); } near.sort((a,b)=>a[0]-b[0]);
    for(let i=0;i<NL.pts.length;i++){ const l=NL.pts[i], e=near[i]; if(e){ l.position.set(e[1].x,e[1].y-0.25,e[1].z); l.intensity=k*55; } else l.intensity=0; } } else for(const l of NL.pts) l.intensity=0;
  const v=PLAYER.driving; if(v&&k>0.05&&!v.bike){ const s=v.st; const fx=-Math.sin(s.yaw), fz=-Math.cos(s.yaw); NL.head.position.set(s.x+fx*(v.len*0.5),s.y+0.75,s.z+fz*(v.len*0.5)); NL.head.target.position.set(s.x+fx*30,s.y-0.6,s.z+fz*30); NL.head.target.updateMatrixWorld(); NL.head.intensity=k*260; } else NL.head.intensity=0; }
