'use strict';
/* ===================== utilities ===================== */
const D = JSON.parse(document.getElementById('tuhelj-data').textContent);
const M = D.meta;
const TAU = Math.PI * 2;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let RNG = mulberry32(20250901);
const rnd = (a=0,b=1)=>a+(b-a)*RNG();
const rndi = (a,b)=>Math.floor(rnd(a,b+1));
const pick = arr => arr[Math.floor(RNG()*arr.length)];
function wpick(pairs){ let s=0; for(const p of pairs) s+=p[1]; let r=RNG()*s; for(const p of pairs){ r-=p[1]; if(r<=0) return p[0]; } return pairs[pairs.length-1][0]; }
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function hash2(x,z){ let h = Math.imul((x|0)^0x27d4eb2d, 0x165667b1) ^ Math.imul((z|0)+0x9e3779b9, 0x85ebca6b); h = Math.imul(h ^ (h>>>15), 0x2c1b3c6d); h ^= h>>>12; return (h>>>0)/4294967296; }
// value noise
function vnoise2(x,z,seed=0){
  const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi;
  const s=seed*1013;
  const a=hash2(xi+s,zi), b=hash2(xi+1+s,zi), c=hash2(xi+s,zi+1), d=hash2(xi+1+s,zi+1);
  const u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf);
  return lerp(lerp(a,b,u),lerp(c,d,u),v);
}
function fbm2(x,z,oct=4,seed=0){ let s=0,a=0.5,f=1,n=0; for(let i=0;i<oct;i++){ s+=a*vnoise2(x*f,z*f,seed+i); n+=a; a*=0.5; f*=2.03; } return s/n; }
function unflat(a){ const o=[]; for(let i=0;i<a.length;i+=2) o.push([a[i],a[i+1]]); return o; }
function pointInPoly(x,z,P){ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const xi=P[i][0], zi=P[i][1], xj=P[j][0], zj=P[j][1]; if(((zi>z)!==(zj>z)) && (x < (xj-xi)*(z-zi)/(zj-zi)+xi)) c=!c; } return c; }
function polyBBox(P){ let a=1e9,b=-1e9,c=1e9,d=-1e9; for(const p of P){ if(p[0]<a)a=p[0]; if(p[0]>b)b=p[0]; if(p[1]<c)c=p[1]; if(p[1]>d)d=p[1]; } return [a,b,c,d]; }
function segDist(px,pz,ax,az,bx,bz){ const dx=bx-ax, dz=bz-az; const L2=dx*dx+dz*dz; let t=L2>0?((px-ax)*dx+(pz-az)*dz)/L2:0; t=clamp(t,0,1); const qx=ax+dx*t, qz=az+dz*t; return Math.hypot(px-qx,pz-qz); }
function col(hex){ return new THREE.Color(hex); }
function colJ(c, amt){ const hsl={}; c.getHSL(hsl); const o=new THREE.Color(); o.setHSL(hsl.h+(RNG()-0.5)*amt*0.1, clamp(hsl.s+(RNG()-0.5)*amt*0.3,0,1), clamp(hsl.l+(RNG()-0.5)*amt*0.25,0,1)); return o; }
// Safari < 16 has no roundRect
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect){ CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){ r=Math.min(typeof r==='number'?r:(r&&r[0])||0,w/2,h/2); this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); this.closePath(); return this; }; }
const NOHEDGE=[]; function noHedge(x,z){ for(const c of NOHEDGE) if(Math.hypot(x-c[0],z-c[1])<c[2]) return true; return false; } // keep-clear circles (bus stop, parkings, pub yard)
const yieldFrame = ()=>new Promise(r=>{ let d=false; const go=()=>{ if(!d){ d=true; r(); } }; requestAnimationFrame(go); setTimeout(go,60); }); // timeout too: keeps loading in a background tab

/* Geometry builder (non-indexed, flat normals, auto winding) */
class GB {
  constructor(){ this.p=[]; this.n=[]; this.uv=[]; this.c=[]; }
  get count(){ return this.p.length/3; }
  _v(P,N,U,C){ this.p.push(P[0],P[1],P[2]); this.n.push(N[0],N[1],N[2]); this.uv.push(U[0],U[1]); this.c.push(C.r,C.g,C.b); }
  tri(a,b,c,ua,ub,uc,C,out){
    let ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    const l=Math.hypot(nx,ny,nz); if(l<1e-9) return;
    nx/=l; ny/=l; nz/=l;
    if(out && nx*out[0]+ny*out[1]+nz*out[2]<0){ const t=b; b=c; c=t; const tu=ub; ub=uc; uc=tu; nx=-nx; ny=-ny; nz=-nz; }
    const N=[nx,ny,nz];
    this._v(a,N,ua,C); this._v(b,N,ub,C); this._v(c,N,uc,C);
  }
  quad(a,b,c,d,ua,ub,uc,ud,C,out){ this.tri(a,b,c,ua,ub,uc,C,out); this.tri(a,c,d,ua,uc,ud,C,out); }
  // smooth tri with explicit normals
  triN(a,b,c,na,nb,nc,ua,ub,uc,C){ this._v(a,na,ua,C); this._v(b,nb,ub,C); this._v(c,nc,uc,C); }
  // axis box in local frame given by transform fn
  box(T, x0,x1,y0,y1,z0,z1, C, uvs=1, faces=0x3f){
    const P=(x,y,z)=>T(x,y,z);
    const cx=(x0+x1)/2, cy=(y0+y1)/2, cz=(z0+z1)/2;
    const cen=P(cx,cy,cz);
    const F=(a,b,c,d,w,h)=>{ const pa=P(...a),pb=P(...b),pc=P(...c),pd=P(...d); const m=[(pa[0]+pc[0])/2-cen[0],(pa[1]+pc[1])/2-cen[1],(pa[2]+pc[2])/2-cen[2]]; this.quad(pa,pb,pc,pd,[0,0],[w*uvs,0],[w*uvs,h*uvs],[0,h*uvs],C,m); };
    const sx=x1-x0, sy=y1-y0, sz=z1-z0;
    if(faces&1) F([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],sz,sy);
    if(faces&2) F([x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],sz,sy);
    if(faces&4) F([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],sx,sz);
    if(faces&8) F([x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0],sx,sz);
    if(faces&16) F([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],sx,sy);
    if(faces&32) F([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],sx,sy);
  }
  // cylinder (prism) along y
  cyl(T, r0, r1, y0, y1, seg, C, uvScale=1, caps=true, phase=0){
    for(let i=0;i<seg;i++){
      const a0=phase+i/seg*TAU, a1=phase+(i+1)/seg*TAU;
      const p0=T(Math.cos(a0)*r0,y0,Math.sin(a0)*r0), p1=T(Math.cos(a1)*r0,y0,Math.sin(a1)*r0);
      const p2=T(Math.cos(a1)*r1,y1,Math.sin(a1)*r1), p3=T(Math.cos(a0)*r1,y1,Math.sin(a0)*r1);
      const am=(a0+a1)/2; const c0=T(0,(y0+y1)/2,0); const o=T(Math.cos(am),(y0+y1)/2,Math.sin(am)); const out=[o[0]-c0[0],o[1]-c0[1],o[2]-c0[2]];
      const u0=i/seg*uvScale, u1=(i+1)/seg*uvScale;
      this.quad(p0,p1,p2,p3,[u0,0],[u1,0],[u1,(y1-y0)],[u0,(y1-y0)],C,out);
      if(caps){
        const ct=T(0,y1,0), cb=T(0,y0,0);
        if(r1>0.001) this.tri(ct,p3,p2,[0.5,0.5],[0,0],[1,0],C,[0,1,0]);
        if(r0>0.001) this.tri(cb,p1,p0,[0.5,0.5],[0,0],[1,0],C,[0,-1,0]);
      }
    }
  }
  geometry(){
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(this.uv,2));
    g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));
    g.computeBoundingSphere(); g.computeBoundingBox();
    this._n=this.p.length/3; this.p=[]; this.n=[]; this.uv=[]; this.c=[]; // free the JS arrays: the GPU copy is all we need (phones ran out of memory)
    return g;
  }
}
// Chunked builder: groups geometry per material & spatial tile
class ChunkSet {
  constructor(tile=420){ this.tile=tile; this.map=new Map(); }
  get(matKey, x, z){ const k=matKey+'|'+Math.floor(x/this.tile)+'|'+Math.floor(z/this.tile); let g=this.map.get(k); if(!g){ g=new GB(); g.matKey=matKey; this.map.set(k,g);} return g; }
  meshes(mats, opts={}){
    const out=[];
    for(const [k,g] of this.map){ if(g.count===0) continue; const geo=g.geometry(); if(typeof GAME!=='undefined'&&GAME.touch){ for(const at of Object.values(geo.attributes)) at.onUpload(function(){ this.array=new this.array.constructor(this.itemSize); }); } /* phones: static meshes live on the GPU only */ const m=new THREE.Mesh(geo, mats[g.matKey]); m.castShadow = opts.cast!==undefined? (typeof opts.cast==='function'?opts.cast(g.matKey):opts.cast) : true; m.receiveShadow=true; m.matrixAutoUpdate=false; m.updateMatrix(); out.push(m); }
    return out;
  }
}
// frame helper: local building frame -> world
function frame(cx,cz,ang,y0=0){ const c=Math.cos(ang), s=Math.sin(ang); return (x,y,z)=>[cx + c*x - s*z, y0+y, cz + s*x + c*z]; }
