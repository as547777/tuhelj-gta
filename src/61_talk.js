/* ===================== walk and talk =====================
   During a conversation you are free to move (the game used to keep turning you towards the speaker, so you stood
   still while e.g. Poljanec Martin kept walking his route). Now the person you talk to leaves their own route:
   if you stand, they stop in front of you and look at you; if you walk, they walk beside you while the subtitles
   carry on (E / tap still skips a line). When the talk is over they stroll back to where they were going. */
const TALK={A:null,V:null,f:null,back:null};
function talkMoving(){ return !!((KEYS.KeyW||KEYS.KeyA||KEYS.KeyS||KEYS.KeyD||KEYS.ArrowUp||KEYS.ArrowDown||KEYS.ArrowLeft||KEYS.ArrowRight)||Math.hypot(TOUCH.mx||0,TOUCH.mz||0)>0.15)&&!PLAYER.driving; }
function talkPartner(){ const D=GTA.dlg; if(!D) return null; for(let i=D.i;i<D.lines.length;i++){ const who=D.lines[i]&&D.lines[i][0]; if(!who||who==='Ti'||who==='Tuhelj'||who===NET.name) continue; const V=LIFE.villagers.find(v=>v.n===who); if(V) return {A:V.A,V}; const A=typeof npcA==='function'?npcA(who):null; if(A) return {A,V:null}; } return null; }
function talkWalk(A,tx,tz,sp,dt,faceX,faceZ){ const p=A.group.position; const dx=tx-p.x, dz=tz-p.z, d=Math.hypot(dx,dz); let moved=0;
  if(d>0.15){ const s=Math.min(d,sp*dt); const q=new THREE.Vector3(p.x+dx/d*s,0,p.z+dz/d*s); BHASH.collide(q,0.3,groundAt(q.x,q.z)+0.5); p.x=q.x; p.z=q.z; moved=s/dt; }
  p.y=groundAt(p.x,p.z); const fy=moved>0.4?faceYaw(dx,dz):faceYaw(faceX-p.x,faceZ-p.z); A.group.rotation.set(0,angLerp(A.group.rotation.y,fy,Math.min(1,dt*7)),0); A.spdOv=moved; A.seatT=-1;
  const ph=(A.talkPh=(A.talkPh||0)+dt*moved*3.4); const sw=moved>0.3?Math.sin(ph)*0.5:0; if(A.legL){ A.legL.rotation.x=sw; A.legR.rotation.x=-sw; } return d; }
function talkTick(dt){ if(!GAME.started) return;
  if(GTA.dlg&&!PLAYER.driving){ if(!TALK.A){ const P=talkPartner(); if(P&&P.V&&!P.V.bike&&P.V.path){ TALK.A=P.A; TALK.V=P.V; TALK.f=P.V.f; P.V.f=()=>{}; TALK.back=null; } }
    if(TALK.A){ const A=TALK.A, p=PLAYER.pos, q=A.group.position; const sp=Math.hypot(PLAYER.vel.x,PLAYER.vel.z);
      if(sp>0.6){ const fx=PLAYER.vel.x/sp, fz=PLAYER.vel.z/sp; const rx=-fz, rz=fx; const side=((q.x-p.x)*rx+(q.z-p.z)*rz)>=0?1:-1; talkWalk(A,p.x+rx*side*1.15-fx*0.15,p.z+rz*side*1.15-fz*0.15,Math.min(7,sp*1.25+1),dt,p.x+fx*5,p.z+fz*5); }
      else { const dx=q.x-p.x, dz=q.z-p.z, d=Math.hypot(dx,dz)||1; const k=d>2.2?1.6/d:d<1.1?1.3/d:1; talkWalk(A,p.x+dx*k,p.z+dz*k,2.2,dt,p.x,p.z); } }
    return; }
  // the talk is over: walk back to the route, then carry on as before
  if(TALK.A&&!TALK.back){ const V=TALK.V, P=V.path; let bi=0, bd=1e9; const q=TALK.A.group.position; for(let i=0;i<P.length;i++){ const d=Math.hypot(P[i][0]-q.x,P[i][1]-q.z); if(d<bd){ bd=d; bi=i; } } TALK.back={i:bi,pt:P[bi]}; }
  if(TALK.back){ const A=TALK.A, b=TALK.back; const d=talkWalk(A,b.pt[0],b.pt[1],1.3,dt,b.pt[0]+1,b.pt[1]); if(d<0.3||GTA.dlg){ TALK.V.u=b.i; TALK.V.f=TALK.f; A.spdOv=undefined; TALK.A=TALK.V=TALK.f=TALK.back=null; } } }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); try{ talkTick(dt); }catch(e){ if(!TALK.err){ TALK.err=1; console.warn('razgovor',e); } } }; }
/* ---- talking with the hands: whoever is speaking gestures (forearms up, hands moving, a nod), on top of their animation ---- */
const TGZ=new Map();
function tgBase(bones){ for(const b of bones){ if(!b) continue; let e=TGZ.get(b); if(!e){ e={base:b.quaternion.clone(),wrote:new THREE.Quaternion(),has:false}; TGZ.set(b,e); } if(e.has&&b.quaternion.equals(e.wrote)) b.quaternion.copy(e.base); else e.base.copy(b.quaternion); } }
function tgWrote(bones){ for(const b of bones){ const e=b&&TGZ.get(b); if(e){ e.wrote.copy(b.quaternion); e.has=true; } } }
function talkSpeaker(){ const D=GTA.dlg; if(!D) return null; const who=D.lines[D.i]&&D.lines[D.i][0]; if(!who) return null; if(who==='Ti'||who===NET.name) return ME_AV; if(who==='Tuhelj') return null; const V=LIFE.villagers.find(v=>v.n===who); if(V) return V.A; return typeof npcA==='function'?npcA(who):null; }
function gesture(A,t,k){ const R=A&&A.real; if(!R||!R.m.visible) return; const B=rbBones(R), m=R.m, D=Math.PI/180; const bones=[B.ru,B.rf,B.lu,B.lf,B.head]; tgBase(bones);
  const a=Math.sin(t*2.3), b=Math.sin(t*3.1+1.3), c=Math.sin(t*1.7+0.4);
  boneRot(m,B.rf,(-55-28*Math.max(0,a))*k*D); boneRot(m,B.ru,(-14-12*b)*k*D); boneRotA(m,B.ru,FX_Y,(10*c)*k*D);
  boneRot(m,B.lf,(-35-25*Math.max(0,-b))*k*D); boneRot(m,B.lu,(-8-10*Math.max(0,c))*k*D);
  if(B.head) boneRot(m,B.head,(4*Math.sin(t*4.2))*k*D); tgWrote(bones); }
function gestureTick(){ const S=GTA.dlg?talkSpeaker():null; TALK.gT=(TALK.gT||0)+1/60; if(S!==TALK.gA){ TALK.gA=S; TALK.gk=0; } TALK.gk=Math.min(1,(TALK.gk||0)+0.06);
  if(S&&!(S===ME_AV&&COMBAT.armed)&&!PLAYER.driving) gesture(S,TALK.gT,TALK.gk); if(!S&&TGZ.size){ for(const [b,e] of TGZ){ if(e.has&&b.quaternion.equals(e.wrote)) b.quaternion.copy(e.base); } TGZ.clear(); } }
{ const _tl=tpsLate; tpsLate=function(){ _tl(); try{ gestureTick(); }catch(e){} }; }
/* ---- walking together: a tracking shot from the side, framing both of you ---- */
{ const _ac=applyCamera; applyCamera=function(cam){ const A=TALK.A; if(!A||!GTA.dlg||window.CAMO||PLAYER.driving||COMBAT.armed) return _ac(cam); const sp=Math.hypot(PLAYER.vel.x,PLAYER.vel.z); if(sp<0.6){ TALK.camK=Math.max(0,(TALK.camK||0)-0.03); if(TALK.camK<=0) return _ac(cam); } else TALK.camK=Math.min(1,(TALK.camK||0)+0.03);
    _ac(cam); const k=TALK.camK; const p=PLAYER.pos, q=A.group.position; const mx=(p.x+q.x)/2, mz=(p.z+q.z)/2, y=p.y+1.55; const fx=sp>0.6?PLAYER.vel.x/sp:-Math.sin(PLAYER.yaw), fz=sp>0.6?PLAYER.vel.z/sp:-Math.cos(PLAYER.yaw);
    const rx=-fz, rz=fx; const side=((q.x-p.x)*rx+(q.z-p.z)*rz)>=0?-1:1; const want=new THREE.Vector3(mx+fx*2.6+rx*side*2.4,y+0.15,mz+fz*2.6+rz*side*2.4); // ahead and to the side, looking back at the pair
    const piv=new THREE.Vector3(mx,y,mz); const f=typeof tpsFree==='function'?tpsFree(piv,want):1; want.lerpVectors(piv,want,Math.max(0.4,f)); TALK.cam=TALK.cam?TALK.cam.lerp(want,0.08):want.clone();
    cam.position.lerp(TALK.cam,k); const look=new THREE.Vector3(mx-fx*0.6,y-0.1,mz-fz*0.6); const m=new THREE.Matrix4().lookAt(cam.position,look,new THREE.Vector3(0,1,0)); const qq=new THREE.Quaternion().setFromRotationMatrix(m); cam.quaternion.slerp(qq,k); }; }
/* ---- something happens while you talk: a car comes racing past and honks, and they comment on it ---- */
function hornSnd(){ const C=typeof AUD!=='undefined'&&AUD.ctx; if(!C||OW.muted) return; const t=C.currentTime; for(const [f,d] of [[392,0.22],[392,0.5]]){ for(const ff of [f,f*1.26]){ const o=C.createOscillator(), g=C.createGain(); o.type='square'; o.frequency.value=ff; g.gain.setValueAtTime(0.0001,t+(d>0.3?0.3:0)); g.gain.exponentialRampToValueAtTime(0.06,t+(d>0.3?0.32:0.02)); g.gain.exponentialRampToValueAtTime(0.0001,t+(d>0.3?0.3:0)+d); o.connect(g); g.connect(AUD.master||C.destination); o.start(t); o.stop(t+1); } } }
const PASS={C:null,done:false};
function passTick(dt){ if(!GTA.dlg||!TALK.A){ PASS.done=false; } const C=PASS.C;
  if(!C&&GTA.dlg&&TALK.A&&!PASS.done&&(TALK.tT=(TALK.tT||0)+dt)>1.8){ PASS.done=true; TALK.tT=0; const n=nearestRoad(PLAYER.pos.x,PLAYER.pos.z,16); if(!n) return; const tx=n.s.tx, tz=n.s.tz, dir=Math.random()<0.5?1:-1; const w=(n.s.w||6)/4;
    const sx=n.s.x-tx*dir*70+(-tz)*w*dir, sz=n.s.z-tz*dir*70+tx*w*dir; const s0=nearestRoad(sx,sz,30); const typ=['sport','hatch','suv','sedan'][Math.floor(Math.random()*4)], col=['#b3121c','#1f4fa8','#e8b81a','#141518','#f2f2ef'][Math.floor(Math.random()*5)]; const v=makeCarGroup(typ,col); GAME.scene.add(v.group); const P={v,kind:'traffic',L:[],st:{x:0,z:0,yaw:0,v:0,steer:0,y:0,pitch:0,roll:0,spin:0},t:0}; P.st.x=s0?s0.s.x+(-tz)*w*dir:sx; P.st.z=s0?s0.s.z+tx*w*dir:sz; P.st.yaw=faceYaw(tx*dir,tz*dir); P.v.st=P.st; P.st.v=19; poseVehicle(P.v); P.to=[n.s.x+tx*dir*160,n.s.z+tz*dir*160]; P.t=0; P.honk=false; PASS.C=P; return; }
  if(C){ C.t+=dt; const w=routeTo(C,C.to[0],C.to[1],dt); driveAI(C,w[0],w[1],21,dt); const d=Math.hypot(C.st.x-PLAYER.pos.x,C.st.z-PLAYER.pos.z);
    if(!C.honk&&d<28){ C.honk=true; hornSnd(); setTimeout(()=>{ const A=TALK.A||C.react; const line=['Ajme, kak ovaj vozi!','Bu se zabil, budala!','Pa di ide tak brzo?!','Ovo su ti ovi mladi…'][Math.floor(Math.random()*4)]; const D=GTA.dlg; if(D&&A){ D.lines.splice(D.i+1,0,[A.name||'',line]); D.dur=Math.min(D.dur||4,(D.t||0)+0.3); } else if(A) try{ bubble(A,line,2.6); }catch(e){} },650); /* the reaction becomes the next line of the conversation */ C.react=TALK.A; }
    if(C.t>14||Math.hypot(C.st.x-C.to[0],C.st.z-C.to[1])<10){ GAME.scene.remove(C.v.group); PASS.C=null; } } }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); try{ passTick(dt); }catch(e){ if(!PASS.err){ PASS.err=1; console.warn('auto u prolazu',e); } } }; }
