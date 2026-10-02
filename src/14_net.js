/* ===================== multiplayer ===================== */
const NET={mode:'off',name:'',color:'#e8412c',remotes:new Map(),sendT:0,last:null,pk:null,status:''};
function cleanName(s){ s=String(s||'').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g,'').trim().slice(0,16); return s; }
function nameColor(n){ let h=0; for(const ch of n) h=(h*31+ch.charCodeAt(0))>>>0; const hues=[0,24,48,120,165,200,220,265,300,330]; const c=new THREE.Color(); c.setHSL(hues[h%hues.length]/360,0.62,0.5); return '#'+c.getHexString(); }
function tagTex(name,color){ const c=cvs(1024,128), g=c.getContext('2d'); g.clearRect(0,0,1024,128); g.font='800 54px Manrope, Arial'; const w=Math.min(1010,g.measureText(name).width+96);
  g.fillStyle='rgba(15,17,15,0.72)'; const x0=(1024-w)/2; g.beginPath(); g.roundRect?g.roundRect(x0,20,w,88,44):g.rect(x0,20,w,88); g.fill(); g.fillStyle=color; g.beginPath(); g.arc(x0+40,64,14,0,TAU); g.fill();
  g.fillStyle='#fff'; g.textAlign='left'; g.textBaseline='middle'; g.fillText(name,x0+64,66); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function makeAvatar(name,color){ const g=new THREE.Group(); let h=0; for(const ch of String(name||'x')) h=(h*31+ch.charCodeAt(0))>>>0; const rnd=(k)=>((h>>>(k*3))%97)/97;
  const SK=['#f1c7a6','#e8b48f','#d9a078','#c68a62','#f5d2b8'], HR=['#2b1d14','#4a3020','#6b4a2a','#a8783f','#1a1a1a','#8a8a8a','#c9a066'], PN=['#2f4a78','#2c3440','#3b3b3b','#5a4a3a','#27406a','#6b6f57'], SH=['#f2f2f0','#1d1d1d','#6b4a2f','#2a2f36'];
  const M=(c,r=0.8,m=0)=>new THREE.MeshStandardMaterial({color:new THREE.Color(c),roughness:r,metalness:m});
  const shirt=M(color,0.85), pants=M(PN[Math.floor(rnd(1)*PN.length)],0.9), skin=M(SK[Math.floor(rnd(2)*SK.length)],0.62), hair=M(HR[Math.floor(rnd(3)*HR.length)],0.9), shoe=M(SH[Math.floor(rnd(4)*SH.length)],0.6), dark=M('#1a1412',0.5), lip=M('#a4524a',0.6), white=M('#f4f2ee',0.4);
  const mesh=(geo,mat,parent,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x||0,y||0,z||0); if(sx) m.scale.set(sx,sy,sz); m.castShadow=true; (parent||g).add(m); return m; };
  const piv=(parent,x,y,z)=>{ const p=new THREE.Group(); p.position.set(x,y,z); parent.add(p); return p; };
  // hips + torso (tapered, flatter front-back) + shoulders
  mesh(new THREE.CylinderGeometry(0.165,0.175,0.2,14),pants,g,0,0.99,0,1,1,0.72);
  mesh(new THREE.CylinderGeometry(0.2,0.165,0.5,14),shirt,g,0,1.25,0,1,1,0.66);
  mesh(new THREE.SphereGeometry(0.2,14,10,0,TAU,0,Math.PI/2),shirt,g,0,1.49,0,1.12,0.42,0.7);
  mesh(new THREE.CylinderGeometry(0.052,0.058,0.1,10),skin,g,0,1.555,0);
  // head with face and hair
  const head=piv(g,0,1.67,0); mesh(new THREE.SphereGeometry(0.112,18,14),skin,head,0,0,0,0.9,1.12,1.0); mesh(new THREE.SphereGeometry(0.06,12,10),skin,head,0,-0.07,-0.03,1.2,0.7,1.1);
  const hairStyle=rnd(5); mesh(new THREE.SphereGeometry(0.118,18,12,0,TAU,0,Math.PI*(hairStyle<0.5?0.52:0.6)),hair,head,0,0.012,0.012,0.92,1.14,1.04);
  for(const sx of [-1,1]){ mesh(new THREE.SphereGeometry(0.016,8,6),white,head,sx*0.038,0.018,-0.094); mesh(new THREE.SphereGeometry(0.009,8,6),dark,head,sx*0.038,0.018,-0.106); mesh(new THREE.BoxGeometry(0.035,0.007,0.01),hair,head,sx*0.04,0.047,-0.1); mesh(new THREE.SphereGeometry(0.022,8,6),skin,head,sx*0.101,0,0,0.5,1,0.8); }
  mesh(new THREE.ConeGeometry(0.016,0.045,8),skin,head,0,-0.008,-0.112).rotation.x=-Math.PI/2; mesh(new THREE.BoxGeometry(0.04,0.008,0.01),lip,head,0,-0.05,-0.101);
  // arms: shoulder → elbow → hand (hand ends ~0.62 below the shoulder)
  const arm=(sx)=>{ const sh=piv(g,sx*0.235,1.455,0); mesh(new THREE.SphereGeometry(0.058,10,8),shirt,sh,0,0,0); mesh(new THREE.CylinderGeometry(0.05,0.043,0.3,10),shirt,sh,0,-0.15,0); const el=piv(sh,0,-0.3,0); mesh(new THREE.CylinderGeometry(0.041,0.034,0.27,10),skin,el,0,-0.135,0); mesh(new THREE.SphereGeometry(0.046,10,8),skin,el,0,-0.3,-0.01,0.75,1.15,0.5); sh.userData.el=el; return sh; };
  const armL=arm(-1), armR=arm(1);
  // legs: hip → knee → shoe (foot on the ground)
  const leg=(sx)=>{ const hp=piv(g,sx*0.092,0.9,0); const th=mesh(new THREE.CylinderGeometry(0.078,0.062,0.44,12),pants,hp,0,-0.22,0); const kn=piv(hp,0,-0.44,0); mesh(new THREE.CylinderGeometry(0.06,0.046,0.42,12),pants,kn,0,-0.21,0); const sho=mesh(new THREE.BoxGeometry(0.1,0.075,0.25),shoe,kn,0,-0.43,-0.055); sho.geometry.translate(0,0,0); hp.userData.kn=kn; th.userData.hp=hp; return hp; };
  const legL=leg(-1), legR=leg(1);
  // knees and elbows follow the hip/shoulder angles automatically (walking, sitting, driving)
  const joints=()=>{ for(const L of [legL,legR]){ const a=L.rotation.x; L.userData.kn.rotation.x=a<-0.9?1.55:(a>0?a*1.25:0.06); } for(const A of [armL,armR]){ const a=A.rotation.x; A.userData.el.rotation.x=a<-0.6?-0.55:-0.18-Math.max(0,-a)*0.3; } };
  g.children[0].onBeforeRender=joints;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tagTex(name,color),depthTest:true,transparent:true})); sp.scale.set(3.4,0.42,1); sp.position.y=2.25; g.add(sp);
  const gun=new THREE.Group(); const gm=new THREE.MeshStandardMaterial({color:0x222528,metalness:0.5,roughness:0.5}); const gb=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.09,0.62),gm); gb.position.set(0,-0.5,-0.22); gun.add(gb); gun.visible=false; armR.add(gun);
  const body=g.children.filter(c=>c!==sp); return {group:g,legL,legR,armL,armR,head,sprite:sp,phase:0,body,gun,name,color}; }
function setTagHP(R){ const c=cvs(1024,160), g=c.getContext('2d'); g.clearRect(0,0,1024,160); g.font='800 54px Manrope, Arial'; const w=Math.min(1010,g.measureText(R.name).width+96); const x0=(1024-w)/2;
  g.fillStyle='rgba(15,17,15,0.72)'; g.beginPath(); g.roundRect?g.roundRect(x0,10,w,88,44):g.rect(x0,10,w,88); g.fill(); g.fillStyle=R.color; g.beginPath(); g.arc(x0+40,54,14,0,TAU); g.fill(); g.fillStyle='#fff'; g.textBaseline='middle'; g.fillText(R.name,x0+64,56);
  const hp=Math.max(0,Math.min(100,R.hp??100)); g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(412,112,200,18); g.fillStyle=hp>50?'#5fc46a':hp>25?'#f0b43a':'#e5483b'; g.fillRect(414,114,196*hp/100,14);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; const old=R.av.sprite.material.map; R.av.sprite.material.map=t; R.av.sprite.material.needsUpdate=true; if(old) old.dispose(); R.av.sprite.scale.set(3.4,0.53,1); }
function upsertRemote(id,st){ if(!st||typeof st!=='object') return; const n=cleanName(st.n)||'Igrač'; const col=/^#[0-9a-f]{6}$/i.test(st.c||'')?st.c:nameColor(n);
  let R=NET.remotes.get(id); if(!R){ R={id,name:n,color:col,av:makeAvatar(n,col),cur:null,tgt:null,d:-1,seen:0}; GAME.scene.add(R.av.group); NET.remotes.set(id,R); UI.toast(n+' je u Tuhelju'); updateOnline(); }
  if(R.name!==n||R.color!==col){ R.name=n; R.color=col; R.av.sprite.material.map=tagTex(n,col); R.av.sprite.material.needsUpdate=true; updateOnline(); }
  const num=(v,d=0)=>Number.isFinite(+v)?+v:d; R.tgt={x:num(st.x),y:num(st.y),z:num(st.z),h:num(st.h)}; if(!R.cur) R.cur={...R.tgt}; R.seen=performance.now();
  R.pa=Number.isInteger(st.pa)?st.pa:-1; const d=Number.isInteger(st.d)?st.d:-1; if(R.d!==d){ if(R.d>=0&&DRIVE[R.d]&&DRIVE[R.d].remote===id){ DRIVE[R.d].remote=null; } R.d=d; }
  if(d>=0 && DRIVE[d] && Array.isArray(st.cv)){ const v=DRIVE[d]; if(PLAYER.driving===v){ /* collision of claims: the one already driving keeps it */ } else { v.remote=id; v.tgt={x:num(st.cv[0]),z:num(st.cv[1]),yaw:num(st.cv[2]),steer:num(st.cv[3]),v:num(st.cv[4])}; v.tgtT=performance.now(); } }
  combatRemote(R,st); R.sk=(Number.isInteger(st.sk)&&st.sk>=0&&st.sk<32)?st.sk:0; R.hl=(Array.isArray(st.hl)&&st.hl.length===4&&st.hl.every(n=>Number.isFinite(+n)))?st.hl.map(Number):null; R.wa=st.wa?1:0; R.wy=Number.isFinite(+st.wy)?+st.wy:0; R.pq=(st.pq&&typeof st.pq==='object')?st.pq:null; R.pt=(st.pt&&typeof st.pt==='object'&&Array.isArray(st.pt.s))?st.pt:null;
  if(Array.isArray(st.pk) && st.pk.length===4){ const v=DRIVE[st.pk[0]|0]; if(v && !v.remote && PLAYER.driving!==v && v.parkedBy!=='me' && Math.hypot(num(st.pk[1])-v.st.x,num(st.pk[2])-v.st.z)>0.3){ v.st.x=num(st.pk[1],v.st.x); v.st.z=num(st.pk[2],v.st.z); v.st.yaw=num(st.pk[3],v.st.yaw); v.st.v=0; poseVehicle(v); v.parkedBy=id; } } }
function removeRemote(id){ const R=NET.remotes.get(id); if(!R) return; GAME.scene.remove(R.av.group); if(R.d>=0&&DRIVE[R.d]&&DRIVE[R.d].remote===id) DRIVE[R.d].remote=null; NET.remotes.delete(id); UI.toast(R.name+' je otišao'); updateOnline(); }
function updateOnline(){ const el=document.getElementById('online'); if(!el) return; const names=[...NET.remotes.values()].map(r=>r.name); if(NET.mode==='off'||NET.mode==='connecting'){ el.textContent=NET.status||''; el.style.display=NET.status?'block':'none'; return; }
  el.style.display='block'; const rs=[...NET.remotes.values()]; el.textContent='● '+(rs.length+1)+' u igri: '+[NET.name+' (ti '+COMBAT.kills+'/'+COMBAT.deaths+')'].concat(rs.map(r=>r.name+' '+(r.kills||0)+'/'+(r.deaths||0))).slice(0,8).join(', ')+(rs.length>7?'…':''); }
function netState(){ const P=PLAYER; const st={n:NET.name,c:NET.color,x:+P.pos.x.toFixed(2),y:+P.pos.y.toFixed(2),z:+P.pos.z.toFixed(2),h:+P.yaw.toFixed(3),d:-1,pa:P.riding?P.riding.idx:-1};
  const C=COMBAT; st.hp=Math.round(C.hp); st.dead=C.dead?1:0; st.dc=C.deaths; if(C.killer) st.kb=C.killer; st.ar=C.armed?(C.wi||0)+1:0; if(C.shot) st.sh=C.shot; const hk=Object.keys(C.hits); if(hk.length){ st.hits={}; for(const k of hk) st.hits[k]=C.hits[k]; }
  if(P.driving){ const s=P.driving.st; st.d=P.driving.idx; st.cv=[+s.x.toFixed(2),+s.z.toFixed(2),+s.yaw.toFixed(3),+s.steer.toFixed(2),+s.v.toFixed(2)]; NET.pk=[P.driving.idx,+s.x.toFixed(2),+s.z.toFixed(2),+s.yaw.toFixed(3)]; st.h=+s.yaw.toFixed(3); }
  if(NET.pk) st.pk=NET.pk; st.pq=pkPQ(); st.sk=OW.skin|0; if(P.heli){ const h=P.heli.st; st.hl=[+h.x.toFixed(2),+h.y.toFixed(2),+h.z.toFixed(2),+h.yaw.toFixed(3)]; } if(LIFE.sprayOn&&P.driving){ st.wa=1; let wy=GAME.camera.rotation.y-P.driving.st.yaw; while(wy>Math.PI) wy-=TAU; while(wy<-Math.PI) wy+=TAU; st.wy=+wy.toFixed(2); } if(pkIsHost()&&PKH.pub) st.pt=PKH.pub; return st; }
function netTick(dt){
  // animate remotes
  const k=1-Math.exp(-dt*9);
  for(const R of NET.remotes.values()){ if(!R.tgt) continue; const c=R.cur, t=R.tgt; const dx=t.x-c.x, dz=t.z-c.z; const jump=Math.hypot(dx,dz)>30; c.x=jump?t.x:c.x+dx*k; c.y=jump?t.y:c.y+(t.y-c.y)*k; c.z=jump?t.z:c.z+dz*k; let dh=t.h-c.h; while(dh>Math.PI) dh-=TAU; while(dh<-Math.PI) dh+=TAU; c.h+=dh*k;
    const drivingI=R.d>=0&&DRIVE[R.d]&&DRIVE[R.d].remote===R.id; const riding=!drivingI&&R.pa>=0&&DRIVE[R.pa]; const driving=drivingI||riding; for(const bp of R.av.body) bp.visible=true;
    if(driving){ R.av.sprite.position.y=2.25; } else R.av.sprite.position.y=2.25; if(!driving){ const sp=Math.hypot(dx,dz)/Math.max(dt,1e-3)*k; R.av.phase+=Math.min(sp,9)*dt*1.9; const sw=Math.sin(R.av.phase)*0.6*Math.min(1,sp/3); R.av.legL.rotation.x=sw; R.av.legR.rotation.x=-sw; R.av.armL.rotation.x=-sw*0.8; R.av.armR.rotation.x=sw*0.8; R.av.group.position.set(c.x,groundAt(c.x,c.z),c.z); R.av.group.rotation.y=c.h; }
    if(performance.now()-R.seen>(NET.mode==='mqtt'?7000:15000)) removeRemote(R.id); }
  for(const v of DRIVE){ if(!v.remote||!v.tgt) continue; const s=v.st, t=v.tgt; const age=Math.min(0.5,(performance.now()-(v.tgtT||0))/1000); const px=t.x-Math.sin(t.yaw)*t.v*age, pz=t.z-Math.cos(t.yaw)*t.v*age;
    s.x+=-Math.sin(s.yaw)*t.v*dt; s.z+=-Math.cos(s.yaw)*t.v*dt; const ex=px-s.x, ez=pz-s.z; if(Math.hypot(ex,ez)>25){ s.x=px; s.z=pz; } else { const kc=1-Math.exp(-dt*5); s.x+=ex*kc; s.z+=ez*kc; }
    let dh=t.yaw-s.yaw; while(dh>Math.PI) dh-=TAU; while(dh<-Math.PI) dh+=TAU; s.yaw+=dh*(1-Math.exp(-dt*7)); s.steer+=(t.steer-s.steer)*(1-Math.exp(-dt*8)); s.spin+=t.v*dt/v.r; s.v=t.v; poseVehicle(v); if(v.beacon) v.beacon.material.emissiveIntensity=Math.abs(t.v)>0.5?(Math.sin(GAME.time*12)>0?1:0.3):0.2; }
  // send own state
  NET.sendT-=dt; if(NET.sendT<=0 && NET.send){ NET.sendT=PLAYER.driving?0.066:0.1; try{ NET.send(netState()); }catch(e){} }
}
/* ---- transports ---- */
async function netStart(name){ NET.name=cleanName(name)||('Igrač '+(10+Math.floor(Math.random()*89))); NET.color=nameColor(NET.name);
  if(window.claude && typeof window.claude.use==='function'){ NET.mode='connecting'; NET.status='Spajam se s drugim igračima…'; updateOnline();
    let room=null; try{ room=await window.claude.use('room'); }catch(e){ room=null; }
    if(room){ let R=null; try{ R=await room.join('tuhelj-svijet'); }catch(e){ R=null; } const RR=R||room;
      try{ RR.onPeers(ch=>{ for(const p of ch.peers){ if(p.isMe&&p.sameTab){ NET.myId=p.peer; continue; } if(p.presence&&p.presence.n!==undefined) upsertRemote(p.peer,p.presence); } for(const p of ch.left) removeRemote(p.peer); },(e)=>{ NET.mode='off'; NET.status='Igraš sam — prijatelji se ovdje ne mogu spojiti.'; updateOnline(); });
        NET.send=(st)=>{ RR.presence(st).catch(()=>{}); }; NET.mode='room'; NET.status=''; updateOnline(); return; }catch(e){} }
    NET.mode='off'; NET.status='Igraš sam — za igru s prijateljima otvori verziju s Netlifyja.'; updateOnline(); return; }
  if(window.mqtt){ mqttStart(0); return; }
  if(window.Peer){ peerStart(); return; }
  NET.mode='off'; NET.status='Igraš sam — s prijateljima igrajte na Netlify poveznici.'; updateOnline(); }
const MQ={brokers:['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081'],base:'tuhelj3d/v3/svijet/',client:null,tries:0};
function mqttStart(k){ const M=window.mqtt; const connect=M&&(M.connect||(M.default&&M.default.connect)); if(!connect){ if(window.Peer) peerStart(); return; }
  if(!NET.myId) NET.myId='m'+Math.random().toString(36).slice(2,10); NET.mode='connecting'; NET.status='Spajam se s drugim igračima…'; updateOnline();
  const url=MQ.brokers[k%MQ.brokers.length]; let ok=false; let cl;
  try{ cl=connect(url,{clientId:'tj_'+NET.myId+'_'+Math.floor(Math.random()*1e6),clean:true,connectTimeout:8000,reconnectPeriod:4000,keepalive:30,will:{topic:MQ.base+'p/'+NET.myId,payload:'{"bye":1}',qos:0,retain:false}}); }catch(e){ if(k<5) setTimeout(()=>mqttStart(k+1),1500); return; }
  MQ.client=cl; const to=setTimeout(()=>{ if(!ok){ try{ cl.end(true); }catch(e){} if(k<5) mqttStart(k+1); else if(window.Peer) peerStart(); else { NET.mode='off'; NET.status='Veza s drugim igračima nije uspjela.'; updateOnline(); } } },9000);
  cl.on('connect',()=>{ ok=true; clearTimeout(to); cl.subscribe(MQ.base+'p/+',{qos:0}); NET.mode='mqtt'; NET.status=''; updateOnline();
    NET.send=(st)=>{ try{ cl.publish(MQ.base+'p/'+NET.myId,JSON.stringify(st),{qos:0,retain:false}); }catch(e){} }; });
  cl.on('message',(topic,payload)=>{ if(!topic.startsWith(MQ.base+'p/')) return; const id=topic.slice(MQ.base.length+2); if(!id||id===NET.myId||id.length>24) return; if(payload.length>6000) return; let st=null; try{ st=JSON.parse(payload.toString()); }catch(e){ return; } if(!st||typeof st!=='object') return; if(st.bye){ removeRemote(id); return; } upsertRemote(id,st); });
  cl.on('offline',()=>{ NET.status='Veza je pukla, spajam se ponovno…'; updateOnline(); }); cl.on('reconnect',()=>{}); cl.on('error',()=>{}); }
addEventListener('pagehide',()=>{ try{ if(MQ.client&&NET.myId) MQ.client.publish(MQ.base+'p/'+NET.myId,'{"bye":1}'); }catch(e){} });
const PEER={host:'tuhelj3d-svijet-v2',peer:null,conns:new Map(),conn:null,states:new Map(),timer:0,retry:0};
function peerStart(){ NET.mode='connecting'; NET.status='Tražim druge igrače…'; updateOnline(); try{ if(PEER.peer) PEER.peer.destroy(); }catch(e){}
  const p=new window.Peer(PEER.host,{debug:0}); PEER.peer=p;
  p.on('open',()=>{ NET.mode='host'; NET.status=''; NET.myId=PEER.host; updateOnline();
    p.on('connection',c=>{ c.on('open',()=>{ PEER.conns.set(c.peer,c); }); c.on('data',d=>{ if(d&&d.t==='st'&&d.s){ PEER.states.set(c.peer,d.s); upsertRemote(c.peer,d.s); } }); const bye=()=>{ PEER.conns.delete(c.peer); PEER.states.delete(c.peer); removeRemote(c.peer); }; c.on('close',bye); c.on('error',bye); });
    NET.send=(st)=>{ const snap={t:'snap',p:{}}; snap.p[PEER.host]=st; for(const [id,s] of PEER.states) snap.p[id]=s; for(const c of PEER.conns.values()){ try{ if(c.open) c.send(snap); }catch(e){} } }; });
  p.on('error',e=>{ if(e&&e.type==='unavailable-id'){ try{ p.destroy(); }catch(_){} peerClient(); } else if(NET.mode!=='host'){ NET.status='Veza s drugim igračima nije uspjela, pokušavam ponovo…'; updateOnline(); setTimeout(peerStart,4000+Math.random()*3000); } }); }
function peerClient(){ const p=new window.Peer({debug:0}); PEER.peer=p; let opened=false;
  p.on('open',id=>{ NET.myId=id; const c=p.connect(PEER.host,{serialization:'json',reliable:true}); PEER.conn=c;
    const to=setTimeout(()=>{ if(!opened){ try{ p.destroy(); }catch(_){} setTimeout(peerStart,800+Math.random()*1500); } },7000);
    c.on('open',()=>{ opened=true; clearTimeout(to); NET.mode='client'; NET.status=''; updateOnline(); NET.send=(st)=>{ try{ if(c.open) c.send({t:'st',s:st}); }catch(e){} }; });
    c.on('data',d=>{ if(!d||d.t!=='snap'||!d.p) return; const seen=new Set(); for(const id in d.p){ if(id===NET.myId) continue; seen.add(id); upsertRemote(id,d.p[id]); } for(const id of [...NET.remotes.keys()]) if(!seen.has(id)) removeRemote(id); });
    c.on('close',()=>{ NET.send=null; for(const id of [...NET.remotes.keys()]) removeRemote(id); NET.mode='connecting'; setTimeout(peerStart,500+Math.random()*1800); }); });
  p.on('error',()=>{ if(!opened) setTimeout(peerStart,2500+Math.random()*2500); }); }
