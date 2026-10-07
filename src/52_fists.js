/* ===================== fists =====================
   With no gun in your hands you fight with your fists, like in GTA: left click (or the ✊ button on the phone)
   throws a punch — left, right, left… — whether or not anyone is there. A punch that lands on someone within arm's
   reach in front of you hurts them and knocks them back (and, as in GTA, people do not like being hit). */
const FIST={t:-1,side:0,cd:0,dur:0.4,stance:0};
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
function fistTick(dt){ FIST.cd=Math.max(0,FIST.cd-dt); FIST.stance=Math.max(0,(FIST.stance||0)-dt); if(COMBAT.armed||PLAYER.driving) FIST.stance=0; if(FIST.t<0) return; FIST.t+=dt; FIST.stance=2.5; if(!FIST.hitDone&&FIST.t>FIST.dur*0.42){ FIST.hitDone=true; fistHit(); COMBAT.recoil=Math.max(COMBAT.recoil,0.035); } if(FIST.t>FIST.dur) FIST.t=-1; }
// rotate a bone about an axis given in the avatar's own space (X sideways, Y up, Z forward)
const _fxa=new THREE.Vector3(), _fxq=new THREE.Quaternion(), _fxr=new THREE.Quaternion(), _fxp=new THREE.Quaternion(), FX_X=new THREE.Vector3(1,0,0), FX_Y=new THREE.Vector3(0,1,0), FX_Z=new THREE.Vector3(0,0,1);
function boneRotA(root,bone,ax,ang){ if(!bone||!bone.parent||!ang) return; bone.parent.updateWorldMatrix(true,false); root.getWorldQuaternion(_fxr); bone.parent.getWorldQuaternion(_fxp); _fxa.copy(ax).applyQuaternion(_fxr).applyQuaternion(_fxp.invert()).normalize(); _fxq.setFromAxisAngle(_fxa,ang); bone.quaternion.premultiply(_fxq); }
const sstep=x=>{ x=clamp(x,0,1); return x*x*(3-2*x); };
/* a real punch on top of the walk / idle animation: guard (fists up by the face), wind-up (fist pulled back, body turns away),
   strike (shoulder and hips turn in, the arm shoots out straight) and back to guard */
// the player's mixer does not refresh every bone every frame, so offsets would pile up: keep each bone's pose from the
// animation and start from it again whenever the animation has not written a new one
const FPZ=new Map();
function fpBase(bones,keep){ for(const b of bones){ if(!b) continue; let e=FPZ.get(b); if(!e){ e={base:b.quaternion.clone(),wrote:new THREE.Quaternion(),has:false}; FPZ.set(b,e); }
    if(e.has&&b.quaternion.equals(e.wrote)) b.quaternion.copy(e.base); else e.base.copy(b.quaternion); if(!keep) e.has=false; } }
function fpWrote(bones){ for(const b of bones){ const e=b&&FPZ.get(b); if(e){ e.wrote.copy(b.quaternion); e.has=true; } } }
function fistPose(){ if(!ME_AV||!ME_AV.real||!ME_AV.real.m.visible) return; const R=ME_AV.real, B=rbBones(R); const bones=[B.ru,B.rf,B.lu,B.lf,B.sp,B.head];
  const st=COMBAT.armed?0:(FIST.stance||0); if(st<=0&&FIST.t<0){ if(FPZ.size){ fpBase(bones,false); FPZ.clear(); } return; } fpBase(bones,true);
  const D=Math.PI/180, m=R.m; const g=Math.min(1,st*2); // guard weight
  let wind=0, hit=0; if(FIST.t>=0){ const u=FIST.t/FIST.dur; wind=sstep(u/0.3)*(1-sstep((u-0.3)/0.12)); hit=sstep((u-0.3)/0.14)*(1-sstep((u-0.55)/0.45)); }
  const side=FIST.side?1:-1; // 1 = right hand
  const P={u:FIST.side?B.ru:B.lu, f:FIST.side?B.rf:B.lf}, O={u:FIST.side?B.lu:B.ru, f:FIST.side?B.lf:B.rf};
  // guard for both arms
  for(const A of [P,O]){ boneRot(m,A.u,-48*g*D); boneRot(m,A.f,-118*g*D); boneRotA(m,A.u,FX_Y,(A===P?side:-side)*12*g*D); }
  // punching arm: wind-up pulls it back, the strike throws it forward and straight
  // (angles measured on the Rocketbox rig: this throws the fist straight out in front of the chin)
  boneRotA(m,P.u,FX_X,(20*wind-30*hit)*D); boneRotA(m,P.f,FX_X,(-20*wind+70*hit)*D); boneRotA(m,P.u,FX_Y,side*17*hit*D);
  // body: turn away on the wind-up, turn into the punch, lean in a little
  if(B.sp){ boneRotA(m,B.sp,FX_Y,side*(-16*wind+26*hit)*D); boneRotA(m,B.sp,FX_X,(4*g+8*hit)*D); }
  if(B.head) boneRotA(m,B.head,FX_Y,-side*(-8*wind+13*hit)*D); fpWrote(bones); }
{ const _fg=fireGun; fireGun=function(){ if(!COMBAT.armed){ punch(); return; } return _fg(); }; }
{ const _tl=tpsLate; tpsLate=function(){ _tl(); try{ fistPose(); }catch(e){} }; }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); try{ fistTick(dt); }catch(e){} }; }
document.addEventListener('mousedown',e=>{ if(e.button!==0||COMBAT.armed) return; const cv=GAME.renderer&&GAME.renderer.domElement; if(!(document.pointerLockElement===cv||GAME.dragLook)) return; punch(); });
// phone: with no gun the red button becomes a fist
(function(){ const st=document.createElement('style'); st.textContent=`body.touch.ingame:not(.armed):not(.driving):not(.flying) #firebtn{display:flex!important;background:rgba(200,120,40,.55)!important}
body.touch:not(.armed) #firebtn svg{display:none} body.touch:not(.armed) #firebtn::after{content:"✊";font-size:38px;line-height:1}`; document.head.appendChild(st); })();
