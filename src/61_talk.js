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
