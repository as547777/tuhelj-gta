/* ===================== street lighting at night =====================
   Every street lamp gets a lens that glows after dusk and a warm pool of light on the road; the eight lamps
   nearest the camera also carry real point lights, and the car you drive gets headlights. */
const LAMPS=[];
const NL={on:false,pts:[]};
{ const _tod=setTimeOfDay; setTimeOfDay=function(r,s,h){ _tod(r,s,h); try{ SKY.hemiBase=SKY.hemi.intensity; }catch(e){} }; }
function poolTex(){ const c=cvs(128,128), g=c.getContext('2d'); const gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(255,214,150,1)'); gr.addColorStop(0.35,'rgba(255,190,120,0.55)'); gr.addColorStop(1,'rgba(255,170,100,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function lightsInit(scene){ if(NL.on) return; NL.on=true; try{ villageLamps(scene); }catch(e){ console.warn('lampe',e); } const n=LAMPS.length;
  if(n){ const lg=new THREE.BoxGeometry(0.62,0.05,0.26); const lm=new THREE.MeshStandardMaterial({color:0x2a2a28,emissive:0xffe2b0,emissiveIntensity:0,roughness:0.4}); const lens=new THREE.InstancedMesh(lg,lm,n);
    const pg=new THREE.PlaneGeometry(1,1); pg.rotateX(-Math.PI/2); const pm=new THREE.MeshBasicMaterial({map:poolTex(),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}); const pools=new THREE.InstancedMesh(pg,pm,n);
    const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0); for(let i=0;i<n;i++){ const L=LAMPS[i]; q.setFromAxisAngle(up,-L.a); m4.compose(new THREE.Vector3(L.x,L.y-0.03,L.z),q,new THREE.Vector3(1,1,1)); lens.setMatrixAt(i,m4); const gy=getHeight(L.x,L.z)+0.09; m4.compose(new THREE.Vector3(L.x,gy,L.z),new THREE.Quaternion(),new THREE.Vector3(19,1,19)); pools.setMatrixAt(i,m4); }
    lens.frustumCulled=false; pools.frustumCulled=false; pools.renderOrder=3; scene.add(lens); scene.add(pools); NL.lens=lm; NL.pool=pm; }
  for(let i=0;i<(GAME.touch?0:8);i++){ const l=new THREE.PointLight(0xffcf96,0,26,1.7); l.position.set(0,-500,0); scene.add(l); NL.pts.push(l); }
  if(!GAME.touch){ const hl=new THREE.SpotLight(0xfff2dc,0,70,0.55,0.55,1.3); hl.position.set(0,-500,0); scene.add(hl); scene.add(hl.target); NL.head=hl; } } /* phones: no real lights (every extra light is paid for on every pixel) — lamp glow and light pools only */
function lightsTick(){ if(!NL.on) return; const n=(typeof SKY!=='undefined'&&SKY.night)||0; if(SKY.hemi){ const base=SKY.hemiBase!==undefined?SKY.hemiBase:SKY.hemi.intensity; const P=PLAYER.pos; const under=GAME.started&&!PLAYER.driving&&floorAt(P.x,P.z)>getHeight(P.x,P.z)+0.3; const inside=(typeof INSIDE!=='undefined'&&INSIDE)||under; SKY.hemi.intensity=inside?Math.max(base,1.05):Math.max(base,0.3+0.3*n);
    /* a warm ceiling light follows you indoors (pub, church, house): rooms are never pitch black */ if(!NL.room){ NL.room=new THREE.PointLight(0xffd9a0,0,14,1.4); GAME.scene.add(NL.room); } NL.room.intensity+=((inside?(GAME.touch?14:24):0)-NL.room.intensity)*0.15; NL.room.position.set(P.x,P.y+2.6,P.z); } /* moonlight outside, lights on indoors (the pub was pitch black at night) */ const k=smooth(0.15,0.6,n); if(typeof TREEFILL!=='undefined') TREEFILL.value=0.36*(1-0.85*n);
  if(NL.lens){ NL.lens.emissiveIntensity=k*4.5; NL.pool.opacity=k*0.7; }
  const cam=GAME.camera.position; if(k>0.01&&LAMPS.length){ const near=[]; for(const L of LAMPS){ const d=(L.x-cam.x)**2+(L.z-cam.z)**2; if(d<160*160) near.push([d,L]); } near.sort((a,b)=>a[0]-b[0]);
    for(let i=0;i<NL.pts.length;i++){ const l=NL.pts[i], e=near[i]; if(e){ l.position.set(e[1].x,e[1].y-0.25,e[1].z); l.intensity=k*55; } else l.intensity=0; } } else for(const l of NL.pts) l.intensity=0;
  const v=PLAYER.driving; if(!NL.head) return; if(v&&k>0.05&&!v.bike){ const s=v.st; const fx=-Math.sin(s.yaw), fz=-Math.cos(s.yaw); NL.head.position.set(s.x+fx*(v.len*0.5),s.y+0.75,s.z+fz*(v.len*0.5)); NL.head.target.position.set(s.x+fx*30,s.y-0.6,s.z+fz*30); NL.head.target.updateMatrixWorld(); NL.head.intensity=k*260; } else NL.head.intensity=0; }

// street lamps along every village road (there were only a handful in the centre)
function villageLamps(scene){ const gb=new GB(); const C=lin('#6c7176'), D=lin('#4a4e52'); let n=0;
  for(const r of ROADS){ if(!r.S||r.t==='track'||r.t==='path') continue; let acc=14, side=1; for(let i=1;i<r.S.length;i++){ const p=r.S[i]; if(Math.hypot(p[0]-CENTER[0],p[1]-CENTER[1])>520) { acc=14; continue; } acc+=1.5; if(acc<30) continue;
      const t=r.T[i]; const nx=-t[1]*side, nz=t[0]*side; const x=p[0]+nx*(r.w/2+1.0), z=p[1]+nz*(r.w/2+1.0); if(BHASH.hit(x,z,0.8)||LAMPS.some(L=>Math.abs(L.x-x)<12&&Math.abs(L.z-z)<12)) continue; acc=0; side=-side;
      const y=getHeight(x,z); const a=Math.atan2(-nz,-nx); const f=frame(x,z,a,y); gb.cyl(f,0.07,0.055,0,6.6,6,C,1,false); gb.box(f,0,1.3,6.5,6.6,-0.04,0.04,C); gb.box(f,1.0,1.6,6.38,6.52,-0.15,0.15,D); const hp=f(1.3,6.36,0); LAMPS.push({x:hp[0],y:hp[1],z:hp[2],a}); addCollider(x,z,0,0.3,0.3,y-1,y+6.6); n++; } }
  if(n){ const m=new THREE.Mesh(gb.geometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.6,metalness:0.4})); m.castShadow=true; m.matrixAutoUpdate=false; scene.add(m); } return n; }
