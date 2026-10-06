/* ===================== smoother frames =====================
   The sun's shadow map used to be redrawn every second frame, so frames alternated ~16 ms / ~25 ms and turning
   on the spot felt jerky. Small parts (wheel bolts, bike spokes, lamp caps, cones of little trees…) no longer cast
   shadows, which makes the shadow pass cheap enough to redraw every frame, and tiny parts far from the camera are
   skipped (render layer 1) so the number of draw calls stays even while you look around. */
const PF={list:[],i:0,t:0,V:new THREE.Vector3(),S:new THREE.Vector3()};
function pfScan(){ GAME.scene.traverse(o=>{ if(!o.isMesh||o.__pf||o.isInstancedMesh||o.isSkinnedMesh) return; o.__pf=true; const g=o.geometry; if(!g) return; if(!g.boundingSphere) g.computeBoundingSphere(); if(!g.boundingSphere) return;
    o.getWorldScale(PF.S); const r=g.boundingSphere.radius*Math.max(PF.S.x,PF.S.y,PF.S.z); if(r<0.6) o.castShadow=false; if(r<0.3&&o.layers.mask===1) PF.list.push(o); }); }
function perfTick(dt){ if(!GAME.scene) return; PF.t-=dt; if(PF.t<=0){ PF.t=4; pfScan(); PF.list=PF.list.filter(o=>o.parent); }
  const L=PF.list; if(!L.length) return; const cam=GAME.camera.position, R2=GAME.touch?45*45:80*80; const n=Math.min(L.length,400);
  for(let k=0;k<n;k++){ const o=L[PF.i++%L.length]; o.getWorldPosition(PF.V); o.layers.mask=PF.V.distanceToSquared(cam)>R2?2:1; } }

/* raw mouse input under pointer lock (no OS acceleration → no sudden jumps when you flick the mouse round) */
{ const _rpl=HTMLCanvasElement.prototype.requestPointerLock; HTMLCanvasElement.prototype.requestPointerLock=function(o){ try{ const p=_rpl.call(this,Object.assign({unadjustedMovement:true},o||{})); if(p&&p.catch) return p.catch(()=>_rpl.call(this)); return p; }catch(e){ return _rpl.call(this); } }; }
/* iPhone home-screen apps change the window size after start (status bar, safe areas) without a resize event:
   the picture then did not fill the screen and its centre was not under the aim dot, so shots seemed to go to the side.
   Watch the real window size and re-fit the canvas whenever it differs. */
function pfFit(){ const R=GAME.renderer; if(!R) return; const c=R.domElement; const W=VW(), H=VH(); const s=R.getSize(PF.sz||(PF.sz=new THREE.Vector2()));
  if(Math.abs(s.x-W)>1||Math.abs(s.y-H)>1||Math.abs(c.clientWidth-W)>1||Math.abs(c.clientHeight-H)>1) dispatchEvent(new Event('resize')); }
setInterval(()=>{ try{ pfFit(); }catch(e){} },400);
if(window.visualViewport) visualViewport.addEventListener('resize',()=>setTimeout(()=>{ try{ pfFit(); }catch(e){} },60));
