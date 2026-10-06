/* ===================== realistic house fire =====================
   Flames are many small soft billboards that rise, stretch and fade from yellow-white to orange to dark red, licking out of
   the windows and over the roof; a thick black smoke column rises and drifts; embers float up; the house glows
   (flickering light on desktop) and its roof is scorched. Same gameplay as before (spray water to put it out). */
const FIRE2={tex:null,smoke:null};
function fire2Tex(){ if(FIRE2.tex) return FIRE2.tex; const c=cvs(128,256), g=c.getContext('2d'); const gr=g.createRadialGradient(64,170,4,64,150,90); gr.addColorStop(0,'rgba(255,255,230,1)'); gr.addColorStop(0.25,'rgba(255,210,90,0.95)'); gr.addColorStop(0.55,'rgba(255,110,20,0.65)'); gr.addColorStop(1,'rgba(160,30,0,0)');
  g.fillStyle=gr; g.beginPath(); g.moveTo(64,6); g.bezierCurveTo(118,90,122,190,64,250); g.bezierCurveTo(6,190,10,90,64,6); g.fill(); return FIRE2.tex=new THREE.CanvasTexture(c); }
function smoke2Tex(){ if(FIRE2.smoke) return FIRE2.smoke; const c=cvs(128,128), g=c.getContext('2d'); for(let i=0;i<14;i++){ const x=40+Math.random()*48, y=40+Math.random()*48, r=18+Math.random()*26; const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(40,38,36,0.55)'); gr.addColorStop(1,'rgba(40,38,36,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); } return FIRE2.smoke=new THREE.CanvasTexture(c); }
{ const _start=startFire; startFire=function(){ _start(); const F=LIFE.fire; if(!F) return; for(const s of F.fl) F.g.remove(s); F.fl=[];
    const b=F.b, [cx,cz,ang,L,W]=b.rect; F.L=L; F.W=W; F.ang=ang; F.flames=[]; F.smokes=[]; F.embers=[];
    const fm=new THREE.SpriteMaterial({map:fire2Tex(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const nF=GAME.touch?36:70; for(let i=0;i<nF;i++){ const s=new THREE.Sprite(fm.clone()); s.userData={t:Math.random(),life:0.7+Math.random()*0.9,ox:0,oz:0,oy:0}; F.g.add(s); F.flames.push(s); }
    const sm=new THREE.SpriteMaterial({map:smoke2Tex(),transparent:true,depthWrite:false,color:0x3a3530});
    for(let i=0;i<(GAME.touch?14:26);i++){ const s=new THREE.Sprite(sm.clone()); s.userData={t:Math.random()}; F.g.add(s); F.smokes.push(s); }
    const em=new THREE.SpriteMaterial({color:0xffa040,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false});
    for(let i=0;i<(GAME.touch?10:24);i++){ const s=new THREE.Sprite(em); s.scale.set(0.08,0.08,1); s.userData={t:Math.random(),vx:0,vz:0}; F.g.add(s); F.embers.push(s); }
    if(!GAME.touch){ F.light=new THREE.PointLight(0xff7a20,0,45,1.6); F.light.position.set(0,1.5,0); F.g.add(F.light); }
    // scorched roof plane
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(L*0.9,W*0.9),new THREE.MeshBasicMaterial({color:0x111010,transparent:true,opacity:0.0,depthWrite:false})); sc.rotation.x=-Math.PI/2; sc.rotation.z=-ang; sc.position.y=0.3; F.g.add(sc); F.scorch=sc; }; }
function fire2Tick(dt){ const F=LIFE.fire; if(!F||!F.flames) return; const k=Math.max(0.05,F.hp/100); const ca=Math.cos(F.ang), sa=Math.sin(F.ang); const wind=[0.8,0.3];
  const spot=()=>{ const u=(Math.random()-0.5)*F.L*0.85, v=(Math.random()-0.5)*F.W*0.85; return [ca*u-sa*v, sa*u+ca*v]; };
  for(const s of F.flames){ const d=s.userData; d.t+=dt/d.life; if(d.t>=1){ d.t=0; d.life=0.6+Math.random()*0.9; const p=spot(); d.ox=p[0]; d.oz=p[1]; d.oy=-1.6+Math.random()*2.2; d.big=0.8+Math.random()*1.4; }
    const t=d.t; const h=(1.2+2.8*t)*d.big*(0.35+0.65*k); s.scale.set(h*0.55*(1-t*0.4),h,1); s.position.set(d.ox+wind[0]*t*1.2,d.oy+t*3.2*k+h*0.4,d.oz+wind[1]*t*1.2);
    const m=s.material; m.opacity=Math.sin(Math.PI*Math.min(1,t*1.15))*0.95*k; m.color.setRGB(1,0.72-0.45*t,0.38-0.33*t); }
  for(const s of F.smokes){ const d=s.userData; d.t+=dt*0.09; if(d.t>=1){ d.t=0; const p=spot(); d.ox=p[0]; d.oz=p[1]; }
    const t=d.t; const sz=(3+t*14)*(0.4+0.6*k); s.scale.set(sz,sz,1); s.position.set(d.ox+wind[0]*t*22,2+t*28,d.oz+wind[1]*t*22); s.material.opacity=(1-t)*0.75*(0.3+0.7*k); s.material.rotation+=dt*0.1; }
  for(const s of F.embers){ const d=s.userData; d.t+=dt*0.35; if(d.t>=1){ d.t=0; const p=spot(); s.position.set(p[0],1,p[1]); d.vx=(Math.random()-0.5)*1.5+wind[0]; d.vz=(Math.random()-0.5)*1.5+wind[1]; }
    s.position.x+=d.vx*dt; s.position.z+=d.vz*dt; s.position.y+=dt*(4.5-d.t*3); s.material.opacity=(1-d.t)*k; }
  if(F.light) F.light.intensity=(60+Math.random()*30)*k; if(F.scorch) F.scorch.material.opacity=Math.min(0.75,(F.t||0)*0.02); }
