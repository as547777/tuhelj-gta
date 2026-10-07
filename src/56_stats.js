/* ===================== the player gets better: stats and the outdoor gym =====================
   Four stats from 0 to 100, saved: KONDICIJA (faster sprint), SNAGA (harder punches), GAĐANJE (tighter aim),
   VOŽNJA (stronger acceleration). They grow by doing things — sprinting, punching, hitting what you shoot at,
   driving fast — and quickest in the workout park by the bus stop: walk up to a bar and press E for a set
   (pull-ups and dips build strength, step-ups and sit-ups build stamina). A set takes about 10 seconds and the
   same station needs a short rest afterwards. The stats are shown in the pause menu. */
const STAT=(()=>{ try{ const s=JSON.parse(localStorage.getItem('tuhelj_stats')||'null'); if(s&&typeof s==='object') return Object.assign({kond:10,snaga:10,gadj:10,voz:10},s); }catch(e){} return {kond:10,snaga:10,gadj:10,voz:10}; })();
const STAT_N={kond:'KONDICIJA',snaga:'SNAGA',gadj:'GAĐANJE',voz:'VOŽNJA'};
let statSaveT=0; function statSave(){ try{ localStorage.setItem('tuhelj_stats',JSON.stringify(STAT)); }catch(e){} }
function statAdd(k,d,quiet){ const was=Math.floor(STAT[k]); STAT[k]=Math.min(100,STAT[k]+d); statSaveT=1; if(!quiet&&Math.floor(STAT[k]/5)>Math.floor(was/5)) UI.toast('💪 '+STAT_N[k]+' '+Math.floor(STAT[k])+' / 100'); }
function statRun(){ return 1+0.16*STAT.kond/100; }
function fistDmg(){ return Math.round(18+22*STAT.snaga/100); }
// stronger punches
{ const _hp=hurtPerson; let inFist=false; const _fh=fistHit; fistHit=function(){ inFist=true; try{ _fh(); } finally{ inFist=false; } };
  hurtPerson=function(P,dmg,byMe){ if(inFist&&byMe){ dmg=fistDmg(); statAdd('snaga',0.35); } return _hp(P,dmg,byMe); }; }
// tighter aim
{ const _fg=fireGun; fireGun=function(){ const C=COMBAT; if(!C.armed) return _fg(); const W=WEAPONS[C.wi]; const s0=W.spread, a0=W.ads, k=1-0.45*STAT.gadj/100; W.spread=s0*k; W.ads=a0*k; const n=C.shotN;
    try{ return _fg(); } finally{ W.spread=s0; W.ads=a0; } }; }
{ const _sm=showHitMarker; showHitMarker=function(head){ _sm(head); statAdd('gadj',head?0.3:0.15); }; }
// sprinting and fast driving
const ST={x:0,z:0,init:false,set:null,rest:new Map()};
function statTick(dt){ if(!GAME.started||GAME.paused) return; const p=PLAYER.pos; if(!ST.init){ ST.x=p.x; ST.z=p.z; ST.init=true; } const d=Math.hypot(p.x-ST.x,p.z-ST.z); ST.x=p.x; ST.z=p.z; if(d>20) return;
  const v=PLAYER.driving; if(v&&!v.bike){ if(Math.abs(v.st.v)>15) statAdd('voz',d*0.0012); } else if(!v&&!PLAYER.fly&&(KEYS.ShiftLeft||KEYS.ShiftRight||TOUCH.run)&&d>0.03) statAdd('kond',d*0.004);
  statSaveT-=dt; if(statSaveT>0&&statSaveT<0.5){ statSave(); statSaveT=0; } }
// stronger acceleration with better driving (applied to the car the player drives)
{ const _ud=updateDriving; updateDriving=function(dt){ const v=PLAYER.driving; const v0=v?v.st.v:0; _ud(dt); if(v&&!v.bike){ const dv=v.st.v-v0; if(dv*v0>0||(v0===0&&dv!==0)) v.st.v+=dv*0.25*STAT.voz/100; } }; }
/* ---- outdoor gym ---- */
const GYM_N={pull:['Zgibovi','snaga'],bars:['Propadanja','snaga'],step:['Step','kond'],bench:['Trbušnjaci','kond']};
function gymNear(){ if(INSIDE||PLAYER.driving||PLAYER.riding||COMBAT.armed||!window.GYM) return null; let best=null, bd=1.9; for(const g of GYM){ const d=Math.hypot(PLAYER.pos.x-g.x,PLAYER.pos.z-g.z); if(d<bd){ bd=d; best=g; } } return best; }
function gymStart(g){ const rest=ST.rest.get(g)||0; if(GAME.time<rest){ UI.toast('Odmori se još '+Math.ceil(rest-GAME.time)+' s'); return; } const [n,k]=GYM_N[g.k]||['Vježba','kond'];
  const f=frame(g.x,g.z,g.a,g.y); const q=f(0,0,1); const dx=q[0]-g.x, dz=q[2]-g.z; ST.set={g,n,k,t:0,reps:0,dur:10,face:Math.atan2(-dx,-dz)}; PLAYER.enabled=false; PLAYER.vel.set(0,0,0);
  const off=g.k==='bench'?0.9:g.k==='step'?0.7:0; teleport(g.x+dx*off,g.z+dz*off); PLAYER.yaw=ST.set.face+(g.k==='step'||g.k==='bench'?Math.PI:0); if(typeof TPS!=='undefined') TPS.face=PLAYER.yaw; UI.toast('💪 '+n+' — E za prekid'); }
function gymStop(done){ const S=ST.set; if(!S) return; ST.set=null; PLAYER.enabled=true; if(ME_AV) ME_AV.spdOv=undefined; ST.rest.set(S.g,GAME.time+(done?20:4)); if(done){ statAdd(S.k,3,true); UI.toast('✅ '+S.n+': 10 / 10 · '+STAT_N[S.k]+' '+Math.floor(STAT[S.k])+' / 100'); try{ blip('coin'); }catch(e){} } }
function gymTick(dt){ const S=ST.set; if(!S) return; if(COMBAT.dead||PLAYER.driving){ gymStop(false); return; } S.t+=dt; const per=S.dur/10; const r=Math.min(10,Math.floor(S.t/per)); if(r>S.reps){ S.reps=r; UI.toast('💪 '+S.n+' '+r+' / 10'); } if(S.t>=S.dur) gymStop(true); }
// body on the bar / at the step: lift and lower the whole avatar, arms set for the exercise
function gymPose(){ const S=ST.set; if(!S||!ME_AV||!ME_AV.real||!ME_AV.real.m.visible) return; const R=ME_AV.real, B=rbBones(R), m=R.m, D=Math.PI/180; const bones=[B.ru,B.rf,B.lu,B.lf,B.sp,B.head]; fpBase(bones,true);
  const ph=(S.t/(S.dur/10))%1, w=0.5-0.5*Math.cos(ph*TAU); const g=ME_AV.group; ME_AV.spdOv=0;
  if(S.g.k==='pull'){ g.position.y=PLAYER.pos.y+0.32+0.42*w; for(const [u,f] of [[B.ru,B.rf],[B.lu,B.lf]]){ boneRot(m,u,(-168+38*w)*D); boneRot(m,f,(-4-95*w)*D); } } // hanging from the bar, chin up to it
  else if(S.g.k==='bars'){ g.position.y=PLAYER.pos.y+0.35-0.3*w; for(const [u,f] of [[B.ru,B.rf],[B.lu,B.lf]]){ boneRot(m,u,(10+45*w)*D); boneRot(m,f,(-10-60*w)*D); } }
  else if(S.g.k==='step'){ g.position.y=PLAYER.pos.y+0.3*w; for(const [u,f] of [[B.ru,B.rf],[B.lu,B.lf]]){ boneRot(m,u,-20*w*D); boneRot(m,f,-90*D); } }
  else { if(B.sp) boneRotA(m,B.sp,FX_X,(10+40*w)*D); for(const [u,f] of [[B.ru,B.rf],[B.lu,B.lf]]){ boneRot(m,u,-60*D); boneRot(m,f,-120*D); } }
  fpWrote(bones); }
{ const _ip=intPrompt; intPrompt=function(){ const t=_ip(); if(t) return t; if(ST.set) return '✋ Prekini vježbu'; const g=gymNear(); return g?'💪 Vježbaj — '+(GYM_N[g.k]||['Vježba'])[0]:''; }; }
{ const _gu=gtaUse; gtaUse=function(){ if(ST.set){ gymStop(false); return true; } if(!GTA.dlg){ const g=gymNear(); if(g&&!giverNear()){ gymStart(g); return true; } } return _gu(); }; }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); try{ statTick(dt); gymTick(dt); }catch(e){} }; }
{ const _tl=tpsLate; tpsLate=function(){ _tl(); try{ gymPose(); }catch(e){} }; }
// stats in the pause menu (IGRA tab)
setInterval(()=>{ const pn=document.querySelector('#pause .pm .panel'); if(!pn||!/STANJE/.test(pn.textContent)||pn.querySelector('.stbars')) return; const d=document.createElement('div'); d.className='stbars';
  d.innerHTML='<h4 style="margin-top:18px">LIK</h4>'+Object.keys(STAT_N).map(k=>`<div style="display:flex;align-items:center;gap:10px;margin:6px 0"><span style="min-width:110px;font:800 11px Manrope;letter-spacing:.14em;color:rgba(255,255,255,.7)">${STAT_N[k]}</span><span style="flex:1;height:8px;background:rgba(255,255,255,.12)"><i style="display:block;height:100%;width:${Math.floor(STAT[k])}%;background:#ffd24a"></i></span><b style="min-width:30px;text-align:right">${Math.floor(STAT[k])}</b></div>`).join('')+'<div style="font-size:12px;opacity:.6">Vježbaj u parku kraj autobusne stanice (E kod sprave).</div>'; pn.appendChild(d); },400);
// during a set the camera stands to one side where nothing blocks the view (the bars would otherwise push it into the avatar)
function gymCam(){ const S=ST.set; if(S.cam) return S.cam; const p=PLAYER.pos; const piv=new THREE.Vector3(p.x,p.y+1.5,p.z); let best=null, bf=-1;
  // front or back of the athlete first, a little to the side (looking along the bar puts a post in the way)
  for(const da of [0.4,Math.PI+0.4,-0.4,Math.PI-0.4,0.9,Math.PI+0.9]){ const a=S.face+da; const w=piv.clone().add(new THREE.Vector3(Math.sin(a)*3.4,0.5,Math.cos(a)*3.4)); const f=tpsFree(piv,w); if(f>bf+0.05){ bf=f; best=w; } if(f>0.95) break; }
  S.cam=best; return best; }
{ const _ac=applyCamera; applyCamera=function(cam){ if(ST.set&&!window.CAMO){ const c=gymCam(); cam.position.copy(c); cam.lookAt(PLAYER.pos.x,PLAYER.pos.y+1.5,PLAYER.pos.z); TPS.cur=3; if(ME_AV) ME_AV.group.visible=true; return; } return _ac(cam); }; }
