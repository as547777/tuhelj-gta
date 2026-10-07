/* ===================== nicer looks: wet roads in the rain, glowing street lamps at night =====================
   Rain soaks the asphalt (darker, glossy, reflects the sky and the lamps) and it dries slowly after the rain.
   At night every street lamp gets a soft halo — all of them in one draw call (THREE.Points). */
const LOOK2={wet:0,base:null,halo:null,t:0};
function lookTick(dt){ if(!GAME.started) return; LOOK2.t-=dt; if(LOOK2.t>0) return; LOOK2.t=0.25; const R=window.ROADMATS; if(!R) return;
  if(!LOOK2.base) LOOK2.base=R.map(m=>({r:m.roughness,c:m.color.clone(),e:m.envMapIntensity||1}));
  const rain=OW.rain||0; LOOK2.wet+=rain>LOOK2.wet?(rain-LOOK2.wet)*0.12:(rain-LOOK2.wet)*0.008; const w=clamp(LOOK2.wet*1.3,0,1);
  R.forEach((m,i)=>{ const b=LOOK2.base[i]; m.roughness=b.r*(1-0.6*w); m.color.copy(b.c).multiplyScalar(1-0.35*w); m.envMapIntensity=b.e*(1+2.2*w); });
  // lamp halos
  if(!LOOK2.halo&&typeof LAMPS!=='undefined'&&LAMPS.length){ const pos=new Float32Array(LAMPS.length*3); LAMPS.forEach((L,i)=>{ pos[i*3]=L.x; pos[i*3+1]=L.y-0.12; pos[i*3+2]=L.z; }); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const c=cvs(64,64), x=c.getContext('2d'); const gr=x.createRadialGradient(32,32,1,32,32,31); gr.addColorStop(0,'rgba(255,236,190,1)'); gr.addColorStop(0.25,'rgba(255,214,150,.55)'); gr.addColorStop(1,'rgba(255,200,120,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); const t=new THREE.CanvasTexture(c);
    const m=new THREE.PointsMaterial({map:t,size:3.2,sizeAttenuation:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}); LOOK2.halo=new THREE.Points(g,m); LOOK2.halo.frustumCulled=false; LOOK2.halo.renderOrder=5; GAME.scene.add(LOOK2.halo); }
  if(LOOK2.halo){ const n=SKY.night||0; LOOK2.halo.material.opacity=n*(0.75+0.25*w); LOOK2.halo.visible=n>0.05; LOOK2.halo.material.size=3.2+w*1.2; } }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); try{ lookTick(dt); }catch(e){} }; }
