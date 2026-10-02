/* ===================== phones and tablets (iPhone Safari, Android Chrome) =====================
   - sound: iOS only lets audio start inside a touch, so every touch resumes the audio contexts
   - HUD for thumbs: radar top-right with the health/stamina bars under it, cash and wanted stars top-left,
     nothing under the joystick (bottom-left) or the action buttons (bottom-right)
   - radio button while driving, lighter post-processing (fewer AO samples) */
(function(){ const st=document.createElement('style'); st.textContent=`
body.touch #hudpanel{left:auto!important;right:calc(16px + env(safe-area-inset-right,0px))!important;top:calc(16px + 122px + env(safe-area-inset-top,0px))!important;bottom:auto!important}
body.touch #hudpanel .bars{width:118px!important}
body.touch #mini{border-radius:12px!important}
body.touch #gtacash{right:auto;left:calc(18px + env(safe-area-inset-left,0px));top:calc(12px + env(safe-area-inset-top,0px));font-size:30px}
body.touch #wbox{right:auto!important;left:calc(16px + env(safe-area-inset-left,0px))!important;top:calc(50px + env(safe-area-inset-top,0px))!important}
body.touch #wbox b{font-size:30px!important}
body.touch #toast{top:calc(100px + env(safe-area-inset-top,0px))!important;max-width:60vw}
body.touch #objcard{top:calc(176px + env(safe-area-inset-top,0px))!important;max-width:230px}
body.touch #speedo{right:calc(96px + env(safe-area-inset-right,0px))!important;bottom:calc(140px + env(safe-area-inset-bottom,0px))!important;font-size:26px!important}
#radiobtn{display:none;position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(196px + env(safe-area-inset-bottom,0px));width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(10,12,10,.55);color:#fff;font-size:26px;z-index:31;touch-action:manipulation}
body.touch.driving #radiobtn{display:block}
@media (max-height:520px){ body.touch #hudpanel{top:calc(12px + 112px + env(safe-area-inset-top,0px))!important} body.touch #hudpanel .bars{width:112px!important} body.touch #radiobtn{bottom:calc(150px + env(safe-area-inset-bottom,0px))} }
`; document.head.appendChild(st);
  const b=document.createElement('button'); b.id='radiobtn'; b.setAttribute('aria-label','Radio'); b.textContent='📻'; document.body.appendChild(b);
  b.addEventListener('touchstart',e=>{ e.preventDefault(); e.stopPropagation(); try{ radioStep(1); }catch(_){} },{passive:false}); b.addEventListener('click',()=>{ try{ radioStep(1); }catch(_){} });
  const unlock=()=>{ try{ if(typeof AUD!=='undefined'&&AUD.ctx&&AUD.ctx.state!=='running') AUD.ctx.resume(); }catch(_){} try{ if(RADIO.ctx&&RADIO.ctx.state!=='running') RADIO.ctx.resume(); }catch(_){} };
  for(const ev of ['touchend','pointerup','keydown']) addEventListener(ev,unlock,{passive:true});
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){ try{ if(RADIO.ctx) RADIO.ctx.suspend(); }catch(_){} } else unlock(); });
})();
// lighter ambient occlusion on phones (the comp pass stays; only the sample count drops)
if(typeof setupPost==='function'){ const _sp=setupPost; setupPost=function(r){ _sp(r); try{ if(GAME.touch&&POST.ao&&POST.ao.uniforms.nS) POST.ao.uniforms.nS.value=6; }catch(e){} }; }
