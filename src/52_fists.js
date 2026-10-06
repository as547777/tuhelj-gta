/* ===================== fists =====================
   With no gun in your hands you fight with your fists, like in GTA: left click (or the ✊ button on the phone)
   throws a punch — left, right, left… — whether or not anyone is there. A punch that lands on someone within arm's
   reach in front of you hurts them and knocks them back (and, as in GTA, people do not like being hit). */
const FIST={t:-1,side:0,cd:0,dur:0.34};
function fistSnd(hit){ const C=typeof AUD!=='undefined'&&AUD.ctx; if(!C||OW.muted) return; const t=C.currentTime;
  const n=C.createBufferSource(), len=Math.floor(C.sampleRate*0.18), b=C.createBuffer(1,len,C.sampleRate), d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
  n.buffer=b; const f=C.createBiquadFilter(); f.type=hit?'lowpass':'bandpass'; f.frequency.value=hit?900:2200; f.Q.value=hit?0.7:1.4; const g=C.createGain();
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(hit?0.55:0.12,t+(hit?0.005:0.04)); g.gain.exponentialRampToValueAtTime(0.0001,t+(hit?0.14:0.17)); n.connect(f); f.connect(g); g.connect(AUD.master||C.destination); n.start(t); n.stop(t+0.2);
  if(hit){ const o=C.createOscillator(), og=C.createGain(); o.type='sine'; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(55,t+0.12); og.gain.setValueAtTime(0.35,t); og.gain.exponentialRampToValueAtTime(0.0001,t+0.15); o.connect(og); og.connect(AUD.master||C.destination); o.start(t); o.stop(t+0.16); } }
function canPunch(){ const C=COMBAT; return GAME.started&&!GAME.paused&&!C.armed&&!C.dead&&!C.drink&&!PLAYER.driving&&!PLAYER.riding&&!PLAYER.heli&&!(typeof PKC!=='undefined'&&PKC.sit)&&!GTA.dlg&&!UI.mapOpen&&!INSIDE_BLOCK(); }
function INSIDE_BLOCK(){ return typeof HOME!=='undefined'&&HOME.showcase; }
function punch(){ if(!canPunch()||FIST.cd>0) return; FIST.cd=0.42; FIST.t=0; FIST.side^=1; FIST.hitDone=false;
  // face where the camera looks, like GTA
  if(typeof TPS!=='undefined') TPS.face=PLAYER.yaw; }
function fistHit(){ const p=PLAYER.pos, f=PLAYER.yaw; const fx=-Math.sin(f), fz=-Math.cos(f); let best=null, bd=1e9;
  for(const P of allPeople()){ const A=P.A; if(!A||A.dead||!A.group.visible||A===ME_AV) continue; const q=A.group.position; const dx=q.x-p.x, dz=q.z-p.z, d=Math.hypot(dx,dz); if(d>1.7||Math.abs(q.y-p.y)>1.2) continue; const dot=(dx*fx+dz*fz)/(d||1); if(dot<0.45) continue; if(d<bd){ bd=d; best={P,dx,dz,d}; } }
  if(!best){ fistSnd(false); return; }
  try{ HITDIR.set(best.dx/best.d,0.15,best.dz/best.d); HITHEAD=false; }catch(e){}
  hurtPerson(best.P,22,true); fistSnd(true); try{ const q=best.P.A.group.position; puff(new THREE.Vector3(q.x,q.y+1.4,q.z),0.5,0xcfcfcf); }catch(e){}
  try{ if(!best.P.A.dead) bubble(best.P.A,['Au!','Joj!','Kaj delaš?!','Ti si lud!'][Math.floor(Math.random()*4)],1.6); }catch(e){}
  try{ if(typeof crimeEvent==='function'&&Math.random()<0.35&&!best.P.crew) crimeEvent(p.x,p.z,1); }catch(e){} }
function fistTick(dt){ FIST.cd=Math.max(0,FIST.cd-dt); if(FIST.t<0) return; FIST.t+=dt; if(!FIST.hitDone&&FIST.t>FIST.dur*0.45){ FIST.hitDone=true; fistHit(); } if(FIST.t>FIST.dur) FIST.t=-1; }
// arm pose on top of the walk / idle animation: shoulder up, elbow straightens, fist flies forward and comes back
function fistPose(){ if(FIST.t<0||!ME_AV||!ME_AV.real||!ME_AV.real.m.visible) return; const R=ME_AV.real, B=rbBones(R), D=Math.PI/180; const u=FIST.t/FIST.dur; const k=Math.sin(Math.min(1,u*1.25)*Math.PI);
  const up=FIST.side?B.ru:B.lu, fo=FIST.side?B.rf:B.lf, other=FIST.side?B.lu:B.ru, ofo=FIST.side?B.lf:B.rf;
  boneRot(R.m,up,-(25+60*k)*D); boneRot(R.m,fo,-(70-60*k)*D); boneRot(R.m,other,-35*D); boneRot(R.m,ofo,-95*D); if(B.sp) boneRot(R.m,B.sp,6*k*D); }
{ const _fg=fireGun; fireGun=function(){ if(!COMBAT.armed){ punch(); return; } return _fg(); }; }
{ const _tl=tpsLate; tpsLate=function(){ _tl(); try{ fistPose(); }catch(e){} }; }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); try{ fistTick(dt); }catch(e){} }; }
document.addEventListener('mousedown',e=>{ if(e.button!==0||COMBAT.armed) return; const cv=GAME.renderer&&GAME.renderer.domElement; if(!(document.pointerLockElement===cv||GAME.dragLook)) return; punch(); });
// phone: with no gun the red button becomes a fist
(function(){ const st=document.createElement('style'); st.textContent=`body.touch.ingame:not(.armed):not(.driving):not(.flying) #firebtn{display:flex!important;background:rgba(200,120,40,.55)!important}
body.touch:not(.armed) #firebtn svg{display:none} body.touch:not(.armed) #firebtn::after{content:"✊";font-size:38px;line-height:1}`; document.head.appendChild(st); })();
