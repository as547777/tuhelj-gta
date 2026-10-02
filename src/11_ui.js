/* ===================== UI ===================== */
const UI={};
const $=(id)=>document.getElementById(id);
UI.progress=(f,label)=>{ $('bar').style.width=(f*100).toFixed(1)+'%'; if(label) $('ltxt').textContent=label; };
UI.toast=(t)=>{ const el=$('toast'); el.textContent=t; el.classList.add('on'); clearTimeout(UI._tt); UI._tt=setTimeout(()=>el.classList.remove('on'),1600); };
UI.stick=()=>{};
/* ---- map canvas ---- */
const MAP={scale:0.6};
function buildMapCanvas(){
  const s=MAP.scale; const W=Math.round(GW*s), H=Math.round(GH*s); const c=cvs(W,H), g=c.getContext('2d');
  g.drawImage(GROUND.A,0,0,W,H);
  g.fillStyle='rgba(245,242,232,0.18)'; g.fillRect(0,0,W,H);
  const P=(x,z)=>[(x-X0)*s,(z-Z0)*s];
  g.lineCap='round'; g.lineJoin='round';
  for(const w of WATER){ g.strokeStyle='#4f86b8'; g.lineWidth=Math.max(1.5,2.2*s); g.beginPath(); w.P.forEach((p,i)=>{ const q=P(p[0],p[1]); i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]); }); g.stroke(); }
  const order={path:0,track:1,service:2,residential:3,unclassified:4,tertiary:5,secondary:6,primary:7};
  const rs=[...ROADS].sort((a,b)=>order[a.t]-order[b.t]);
  for(const pass of [0,1]) for(const r of rs){ const main=r.t==='secondary'||r.t==='primary'||r.t==='tertiary'; const tr=r.t==='track'||r.t==='path';
    g.strokeStyle=pass===0?(tr?'rgba(120,100,70,0.0)':'#6b6353'):(tr?'#a58f6a':main?'#f6d37a':'#fbfaf5'); g.lineWidth=pass===0?(r.w+3)*s+1.5:(tr?Math.max(1,1.2*s):(r.w+1)*s); if(tr) g.setLineDash([4,3]); else g.setLineDash([]);
    g.beginPath(); r.P.forEach((p,i)=>{ const q=P(p[0],p[1]); i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]); }); g.stroke(); }
  g.setLineDash([]);
  for(const b of BLD){ for(const r of b.rects){ const f=frame(r[0],r[1],r[2]); const pts=[f(-r[3]/2,0,-r[4]/2),f(r[3]/2,0,-r[4]/2),f(r[3]/2,0,r[4]/2),f(-r[3]/2,0,r[4]/2)].map(p=>P(p[0],p[2])); g.fillStyle=b.k==='church'||b.k==='chapel'?'#8a4a3a':(b.k==='house'||b.k==='shop'||b.k==='cafe')?'#b9866c':'#9a8a7c'; g.beginPath(); pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath(); g.fill(); g.strokeStyle='rgba(60,40,30,0.55)'; g.lineWidth=0.8; g.stroke(); } }
  MAP.c=c; MAP.W=W; MAP.H=H;
  // labels canvas (separate so the minimap stays clean)
  const L=cvs(W,H), lg=L.getContext('2d'); lg.textAlign='center'; lg.textBaseline='middle';
  const label=(t,x,z,size,wt=700,col='#2a2622')=>{ const q=P(x,z); lg.font=`${wt} ${size}px Manrope, Arial`; lg.lineWidth=4; lg.strokeStyle='rgba(255,255,255,0.85)'; lg.strokeText(t,q[0],q[1]); lg.fillStyle=col; lg.fillText(t,q[0],q[1]); };
  for(const p of D.places){ label(p.n,p.x,p.z,p.n==='Tuhelj'?30:19,800); }
  for(const p of D.peaks){ label('▲ '+(p.n||'')+' '+Math.round(p.e||0)+' m',p.x,p.z,13,600,'#4a3a2a'); }
  const lm=[['Crkva Uznesenja BDM',LANDMARKS.church],['Općina · Pošta',LANDMARKS.townhall],['Vatrogasni dom',LANDMARKS.fire],['Osnovna škola',LANDMARKS.school],['Kapela sv. Josipa',LANDMARKS.chapel]];
  for(const [t,o] of lm){ if(o) label(t,o.look?o.look[0]:o.x,(o.look?o.look[1]:o.z)+14,12,700,'#5a2a1a'); }
  MAP.labels=L;
}
function placeName(x,z){ for(const s of D.settl){ if(!s.bb) s.bb=polyBBox(unflat(s.p)), s.P=unflat(s.p); const b=s.bb; if(x<b[0]||x>b[1]||z<b[2]||z>b[3]) continue; if(pointInPoly(x,z,s.P)) return s.n; } let best='', bd=1e9; for(const p of D.places){ const d=Math.hypot(p.x-x,p.z-z); if(d<bd){ bd=d; best=p.n; } } return best; }
function roadLabel(x,z){ const n=nearestRoad(x,z,22); if(!n) return ''; const s=n.s; if(s.n) return s.n; if(s.ref) return (s.t==='secondary'?'Županijska cesta ':'Lokalna cesta ')+s.ref; if(s.t==='track') return 'Poljski put'; if(s.t==='residential'||s.t==='service'||s.t==='unclassified') return 'Seoski put'; return ''; }
UI.updateHUD=(()=>{ let t=0; return (dt)=>{ t-=dt; if(t>0) return; t=0.4; const p=PLAYER.pos; $('place').textContent=placeName(p.x,p.z)||'Tuhelj'; $('road').textContent=roadLabel(p.x,p.z); $('alt').textContent=Math.round(p.y)+' m n.v.'; }; })();
UI.drawMini=()=>{ const c=$('mini'); const g=c.getContext('2d'); const S=c.width; const p=PLAYER.pos; const k=1.35; // px per map px
  g.save(); g.clearRect(0,0,S,S); g.beginPath(); g.arc(S/2,S/2,S/2-2,0,TAU); g.clip(); g.fillStyle='#8d9a6a'; g.fillRect(0,0,S,S);
  g.translate(S/2,S/2); g.rotate(PLAYER.driving?PLAYER.driving.st.yaw:PLAYER.yaw); g.scale(k,k); g.translate(-(p.x-X0)*MAP.scale,-(p.z-Z0)*MAP.scale); g.drawImage(MAP.c,0,0);
  for(const v of DRIVE){ if(v===PLAYER.driving) continue; g.fillStyle=v.truck?'#c0171a':'#ffffff'; g.strokeStyle='rgba(0,0,0,.6)'; g.lineWidth=1; const X=(v.st.x-X0)*MAP.scale, Z=(v.st.z-Z0)*MAP.scale; g.beginPath(); g.rect(X-2.5,Z-2.5,5,5); g.fill(); g.stroke(); }
  for(const R of NET.remotes.values()){ if(!R.cur) continue; const X=(R.cur.x-X0)*MAP.scale, Z=(R.cur.z-Z0)*MAP.scale; g.fillStyle=R.color; g.strokeStyle='#fff'; g.lineWidth=1.5; g.beginPath(); g.arc(X,Z,4,0,TAU); g.fill(); g.stroke(); }
  g.restore();
  try{ miniOverlay(); }catch(e){}
  g.save(); g.translate(S/2,S/2); g.fillStyle='#e8412c'; g.strokeStyle='#fff'; g.lineWidth=2; g.beginPath(); g.moveTo(0,-9); g.lineTo(6.5,7); g.lineTo(0,3.5); g.lineTo(-6.5,7); g.closePath(); g.fill(); g.stroke(); g.restore();
  // north marker
  g.save(); g.translate(S/2,S/2); g.rotate(PLAYER.yaw); g.fillStyle='#fff'; g.font='800 13px Manrope, Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('S',0,-S/2+13); g.restore();
  g.beginPath(); g.arc(S/2,S/2,S/2-2,0,TAU); g.strokeStyle='rgba(255,255,255,0.9)'; g.lineWidth=3; g.stroke(); };
/* ---- full map ---- */
const MAPV={z:1,cx:0,cz:0,drag:null};
function openMap(on){ UI.mapOpen=on; $('map').classList.toggle('on',on); if(on){ if(document.pointerLockElement) document.exitPointerLock(); MAPV.cx=PLAYER.pos.x; MAPV.cz=PLAYER.pos.z; const vw=$('mapc').clientWidth; MAPV.z=Math.max(vw/(GW*MAP.scale)*1.0, 0.9); drawMap(); } }
function mapXform(){ const c=$('mapc'); const W=c.width, H=c.height; const s=MAPV.z*MAP.scale*(c.width/c.clientWidth); return {W,H,s,ox:W/2-(MAPV.cx-X0)*s,oz:H/2-(MAPV.cz-Z0)*s}; }
function drawMap(){ const c=$('mapc'); const dpr=Math.min(2,devicePixelRatio||1); if(c.width!==Math.round(c.clientWidth*dpr)){ c.width=Math.round(c.clientWidth*dpr); c.height=Math.round(c.clientHeight*dpr); }
  const g=c.getContext('2d'); const t=mapXform(); g.fillStyle='#d9d4c2'; g.fillRect(0,0,t.W,t.H); g.imageSmoothingEnabled=true;
  g.drawImage(MAP.c,t.ox,t.oz,MAP.W*t.s/MAP.scale,MAP.H*t.s/MAP.scale); g.drawImage(MAP.labels,t.ox,t.oz,MAP.W*t.s/MAP.scale,MAP.H*t.s/MAP.scale);
  for(const v of DRIVE){ const X=t.ox+(v.st.x-X0)*t.s, Z=t.oz+(v.st.z-Z0)*t.s; g.fillStyle=v.truck?'#c0171a':'#ffffff'; g.strokeStyle='rgba(0,0,0,.7)'; g.lineWidth=1.5; g.beginPath(); g.rect(X-5,Z-5,10,10); g.fill(); g.stroke(); }
  { const dpr2=Math.min(2,devicePixelRatio||1); for(const R of NET.remotes.values()){ if(!R.cur) continue; const X=t.ox+(R.cur.x-X0)*t.s, Z=t.oz+(R.cur.z-Z0)*t.s; g.fillStyle=R.color; g.strokeStyle='#fff'; g.lineWidth=2*dpr2; g.beginPath(); g.arc(X,Z,7*dpr2,0,TAU); g.fill(); g.stroke(); g.font=`800 ${13*dpr2}px Manrope, Arial`; g.textAlign='center'; g.lineWidth=4*dpr2; g.strokeStyle='rgba(0,0,0,.65)'; g.strokeText(R.name,X,Z-12*dpr2); g.fillStyle='#fff'; g.fillText(R.name,X,Z-12*dpr2); } }
  const px=t.ox+(PLAYER.pos.x-X0)*t.s, pz=t.oz+(PLAYER.pos.z-Z0)*t.s; g.save(); g.translate(px,pz); g.rotate(-(PLAYER.driving?PLAYER.driving.st.yaw:PLAYER.yaw)); const k=dpr; g.fillStyle='#e8412c'; g.strokeStyle='#fff'; g.lineWidth=2*k; g.beginPath(); g.moveTo(0,-11*k); g.lineTo(8*k,9*k); g.lineTo(0,4*k); g.lineTo(-8*k,9*k); g.closePath(); g.fill(); g.stroke(); g.restore(); }
function setupMap(){
  const c=$('mapc');
  c.addEventListener('wheel',e=>{ e.preventDefault(); const t=mapXform(); const r=c.getBoundingClientRect(); const mx=(e.clientX-r.left)*(c.width/c.clientWidth), my=(e.clientY-r.top)*(c.height/c.clientHeight); const wx=(mx-t.ox)/t.s+X0, wz=(my-t.oz)/t.s+Z0; const f=Math.exp(-e.deltaY*0.0015); MAPV.z=clamp(MAPV.z*f,0.35,8); const t2=mapXform(); MAPV.cx+= (wx-((mx-t2.ox)/t2.s+X0)); MAPV.cz+=(wz-((my-t2.oz)/t2.s+Z0)); drawMap(); },{passive:false});
  const ptrs=new Map(); let pinch=null;
  const toWorld=(cxp,cyp)=>{ const t=mapXform(); const r=c.getBoundingClientRect(); const mx=(cxp-r.left)*(c.width/c.clientWidth), my=(cyp-r.top)*(c.height/c.clientHeight); return [(mx-t.ox)/t.s+X0,(my-t.oz)/t.s+Z0,mx,my]; };
  const zoomAt=(f,cxp,cyp)=>{ const [wx,wz,mx,my]=toWorld(cxp,cyp); MAPV.z=clamp(MAPV.z*f,0.35,8); const t2=mapXform(); MAPV.cx+=(wx-((mx-t2.ox)/t2.s+X0)); MAPV.cz+=(wz-((my-t2.oz)/t2.s+Z0)); drawMap(); };
  c.addEventListener('pointerdown',e=>{ ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); c.setPointerCapture(e.pointerId);
    if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y)}; MAPV.drag=null; } else if(ptrs.size===1){ MAPV.drag={x:e.clientX,y:e.clientY,cx:MAPV.cx,cz:MAPV.cz,moved:false}; } });
  c.addEventListener('pointermove',e=>{ if(!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch && ptrs.size>=2){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); if(d>10){ zoomAt(d/pinch.d,(a.x+b.x)/2,(a.y+b.y)/2); pinch.d=d; } return; }
    const d=MAPV.drag; if(!d) return; const dx=e.clientX-d.x, dy=e.clientY-d.y; if(Math.hypot(dx,dy)>8) d.moved=true; const t=mapXform(); const k=c.width/c.clientWidth; MAPV.cx=d.cx-dx*k/t.s; MAPV.cz=d.cz-dy*k/t.s; drawMap(); });
  const up=e=>{ const wasPinch=!!pinch; ptrs.delete(e.pointerId); if(ptrs.size<2) pinch=null; const d=MAPV.drag; if(ptrs.size===0) MAPV.drag=null; if(e.type!=='pointerup'||wasPinch) return;
    if(d && !d.moved){ let [wx,wz]=toWorld(e.clientX,e.clientY); wx=clamp(wx,X0+5,X0+GW-5); wz=clamp(wz,Z0+5,Z0+GH-5); const bh=BHASH.hit(wx,wz,0.5); if(bh){ wx+=(wx-bh.cx)>0?bh.hl+2:-bh.hl-2; } if(PLAYER.driving) exitCar(); teleport(wx,wz); UI.toast('Premješteno: '+placeName(wx,wz)); openMap(false); resumeGame(); } };
  c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up);
  const zi=$('zin'), zo=$('zout'); if(zi) zi.onclick=()=>{ const r=c.getBoundingClientRect(); zoomAt(1.45,r.left+r.width/2,r.top+r.height/2); }; if(zo) zo.onclick=()=>{ const r=c.getBoundingClientRect(); zoomAt(1/1.45,r.left+r.width/2,r.top+r.height/2); };
  $('mapclose').onclick=()=>{ openMap(false); resumeGame(); };
  const tp=$('tplist'); const dest=[['Crkva',()=>LANDMARKS.church],['Unutar crkve',()=>LANDMARKS.churchIn],['Kafić Putniku',()=>LANDMARKS.cafe],['Terasa kafića',()=>LANDMARKS.terrace],['Apartman Kod Ruže',()=>LANDMARKS.apt],['Općina i pošta',()=>LANDMARKS.townhall],['Vatrogasni dom',()=>LANDMARKS.fire],['Škola',()=>LANDMARKS.school],['Kapela sv. Josipa',()=>LANDMARKS.chapel],['Pristava',()=>({x:-561,z:112,look:[-600,80]})],['Brdo Veternik',()=>{ const p=D.peaks.find(q=>/Veternik/.test(q.n||''))||D.peaks[0]; return p?{x:p.x+6,z:p.z+6,look:[CENTER[0],CENTER[1]]}:null; }]];
  for(const [n,fn] of dest){ const b=document.createElement('button'); b.textContent=n; b.onclick=()=>{ const o=fn(); if(!o) return; if(PLAYER.driving) exitCar(); teleport(o.x,o.z,o.look?o.look[0]:undefined,o.look?o.look[1]:undefined); openMap(false); resumeGame(); UI.toast(n); }; tp.appendChild(b); }
  addEventListener('keydown',e=>{ if(e.code==='KeyM' && GAME.started){ openMap(!UI.mapOpen); if(!UI.mapOpen) resumeGame(); } });
}
/* ---- pause / settings ---- */
function setupMenus(){
  $('go').onclick=()=>startGame();
  $('resume').onclick=()=>resumeGame();
  $('openmap').onclick=()=>{ $('pause').classList.remove('on'); openMap(true); };
  document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ setQuality(+b.dataset.q); document.querySelectorAll('[data-q]').forEach(x=>x.classList.toggle('sel',x===b)); });
  const tod=$('tod'); tod.oninput=()=>{ $('todv').textContent=fmtHour(+tod.value); }; tod.onchange=()=>{ setTimeOfDay(GAME.renderer,GAME.scene,+tod.value); GAME.hour=+tod.value; };
  $('todv').textContent=fmtHour(+tod.value);
  $('flytg').onclick=()=>{ toggleFly(); };
}
function fmtHour(h){ const H=Math.floor(h), m=Math.round((h-H)*60); return H+':'+String(m).padStart(2,'0'); }
