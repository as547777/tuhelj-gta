/* ===================== dev helpers (only with ?dev in the URL) ===================== */
// CAM(x,y,z,lx,ly,lz) pins the camera for screenshots, CAM() releases it; devStart() starts the game without pointer lock.
if(/[?&]dev\b/.test(location.search)){
  window.CAMO=null;
  const _apply=applyCamera; applyCamera=function(c){ if(window.CAMO){ c.position.set(CAMO[0],CAMO[1],CAMO[2]); c.lookAt(CAMO[3],CAMO[4],CAMO[5]); } else _apply(c); };
  window.CAM=(x,y,z,lx,ly,lz)=>{ window.CAMO=x===undefined?null:[x,y,z,lx,ly,lz]; };
  window.CAMG=(x,h,z,lx,lh,lz)=>CAM(x,getHeight(x,z)+h,z,lx,getHeight(lx,lz)+lh,lz);
  window.SNAP=(n=1)=>{ for(let i=0;i<n;i++) GAME.frame(performance.now()); };
  window.devStart=()=>{ GAME.dragLook=true; startGame(); GAME.paused=false; PLAYER.enabled=true; };
  window.devReady=()=>new Promise(res=>{ const t=setInterval(()=>{ const g=document.getElementById('go'); if(g&&!g.disabled){ clearInterval(t); res(true); } },500); });
}
