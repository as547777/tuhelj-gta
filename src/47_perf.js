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
