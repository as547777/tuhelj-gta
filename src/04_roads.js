/* ===================== roads ===================== */
const CENTER=[-258,-46];
function smoothCorners(P,r=6,it=2){ let Q=P.map(p=>[p[0],p[1]]);
  for(let k=0;k<it;k++){ if(Q.length<3) return Q; const R=[Q[0]];
    for(let i=1;i<Q.length-1;i++){ const a=Q[i-1], b=Q[i], c=Q[i+1]; const l1=Math.hypot(b[0]-a[0],b[1]-a[1]), l2=Math.hypot(c[0]-b[0],c[1]-b[1]); if(l1<0.01||l2<0.01){ R.push(b); continue; }
      const d1=Math.min(r,0.3*l1), d2=Math.min(r,0.3*l2); R.push([b[0]-(b[0]-a[0])/l1*d1, b[1]-(b[1]-a[1])/l1*d1],[b[0]+(c[0]-b[0])/l2*d2, b[1]+(c[1]-b[1])/l2*d2]); }
    R.push(Q[Q.length-1]); Q=R; r*=0.5; }
  return Q; }
function resample(P,step){ const out=[[P[0][0],P[0][1],0]]; let s=0, carry=0;
  for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L<1e-6) continue; let d=step-carry;
    while(d<=L){ const t=d/L; out.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, s+d]); d+=step; }
    carry=L-(d-step); s+=L; }
  const last=P[P.length-1]; const lp=out[out.length-1]; if(Math.hypot(last[0]-lp[0],last[1]-lp[1])>0.3) out.push([last[0],last[1],s]);
  return out; }
function tangents(S){ const T=[]; for(let i=0;i<S.length;i++){ const a=S[Math.max(0,i-1)], b=S[Math.min(S.length-1,i+1)]; let tx=b[0]-a[0], tz=b[1]-a[1]; const l=Math.hypot(tx,tz)||1; T.push([tx/l,tz/l]); } return T; }
// spatial index of road samples
const RIDX={cell:10,map:new Map(),samples:[]};
function ridxAdd(s){ const k=Math.floor(s.x/10)+'|'+Math.floor(s.z/10); let a=RIDX.map.get(k); if(!a){a=[];RIDX.map.set(k,a);} a.push(s); RIDX.samples.push(s); }
function nearestRoad(x,z,maxd=20,filter){ let best=null, bd=maxd; const r=Math.ceil(maxd/10); const cx=Math.floor(x/10), cz=Math.floor(z/10);
  for(let i=-r;i<=r;i++) for(let j=-r;j<=r;j++){ const a=RIDX.map.get((cx+i)+'|'+(cz+j)); if(!a) continue; for(const s of a){ if(filter && !filter(s)) continue; const d=Math.hypot(s.x-x,s.z-z)-s.w/2; if(d<bd){ bd=d; best=s; } } }
  return best? {s:best,d:bd}:null; }
function roadClear(x,z,margin){ const n=nearestRoad(x,z,margin+8); return !n || n.d>margin; }
const ROADMESH={};
function buildRoads(scene){
  const matMain=new THREE.MeshStandardMaterial({map:TEX.asphalt,roughness:0.88,metalness:0,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  const matLocal=new THREE.MeshStandardMaterial({map:TEX.asphaltOld,roughness:0.9,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const matTrack=new THREE.MeshStandardMaterial({map:TEX.track,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const matPaint=new THREE.MeshStandardMaterial({color:0xe9e8e0,roughness:0.65,metalness:0,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5});
  const matCurb=new THREE.MeshStandardMaterial({map:TEX.concrete,roughness:0.9,vertexColors:true});
  const cs=new ChunkSet(500);
  const LIFT=0.07;
  const surfY=(x,z,tx,tz,st)=> Math.max(getHeight(x,z), getHeight(x+tx*st*0.5,z+tz*st*0.5), getHeight(x-tx*st*0.5,z-tz*st*0.5))+LIFT;
  const white=new THREE.Color(1,1,1);
  let rid=0;
  for(const r of ROADS){ rid++;
    const main=(r.t==='primary'||r.t==='secondary'||r.t==='tertiary'||r.t==='unclassified');
    const kind=(r.t==='track'||r.t==='path')?'track':(main && r.t!=='unclassified'?'main':'local');
    const step=1.5; const P=smoothCorners(r.P,8,2); const S=resample(P,step); if(S.length<2) continue; const T=tangents(S);
    r.S=S; r.T=T; r.rid=rid;
    for(let i=0;i<S.length;i++) ridxAdd({x:S[i][0],z:S[i][1],tx:T[i][0],tz:T[i][1],w:r.w,t:r.t,n:r.n,ref:r.ref,rid,i,road:r});
    const hw=r.w/2; const across=kind==='track'?[-1,0,1]:[-1,-0.5,0,0.5,1];
    const rows=S.map((p,i)=>{ const nx=-T[i][1], nz=T[i][0]; return across.map(k=>{ const x=p[0]+nx*k*hw, z=p[1]+nz*k*hw; return [x, surfY(x,z,T[i][0],T[i][1],step), z]; }); });
    r.rows=rows;
    const g=cs.get(kind,S[0][0],S[0][1]);
    for(let i=0;i<S.length-1;i++){ const A=rows[i], B=rows[i+1];
      for(let k=0;k<across.length-1;k++){
        let u0,u1,v0,v1; if(kind==='track'){ u0=(across[k]+1)/2; u1=(across[k+1]+1)/2; v0=S[i][2]/5; v1=S[i+1][2]/5; } else { u0=across[k]*hw/4; u1=across[k+1]*hw/4; v0=S[i][2]/4; v1=S[i+1][2]/4; }
        g.quad(A[k],A[k+1],B[k+1],B[k],[u0,v0],[u1,v0],[u1,v1],[u0,v1],white,[0,1,0]);
      }
    }
    // markings on main roads
    if(r.t==='primary'||r.t==='secondary'||r.t==='tertiary'){
      const pg=cs.get('paint',S[0][0],S[0][1]);
      const strip=(off,width,dash,gap)=>{ let on=true, acc=0;
        for(let i=0;i<S.length-1;i++){ const segL=S[i+1][2]-S[i][2]; acc+=segL; if(dash){ if(on && acc>dash){ on=false; acc=0; } else if(!on && acc>gap){ on=true; acc=0; } if(!on) continue; }
          const q=(j,o)=>{ const nx=-T[j][1], nz=T[j][0]; const x=S[j][0]+nx*o, z=S[j][1]+nz*o; return [x, surfY(x,z,T[j][0],T[j][1],step)+0.012, z]; };
          const a0=q(i,off-width/2), a1=q(i,off+width/2), b1=q(i+1,off+width/2), b0=q(i+1,off-width/2);
          pg.quad(a0,a1,b1,b0,[0,0],[1,0],[1,1],[0,1],white,[0,1,0]); } };
      if(r.t!=='tertiary'){ strip(hw-0.32,0.14,0,0); strip(-(hw-0.32),0.14,0,0); }
      strip(0,0.12,3,5);
    }
  }
  // sidewalks near centre
  const sideR=175;
  for(const r of ROADS){ if(!r.S || !(r.t==='secondary'||r.t==='primary')) continue;
    for(const side of [1,-1]){
      let run=[];
      const flush=()=>{ if(run.length>3) sidewalk(run,side,r); run=[]; };
      for(let i=0;i<r.S.length;i++){ const p=r.S[i]; const inR=Math.hypot(p[0]-CENTER[0],p[1]-CENTER[1])<sideR;
        const nx=-r.T[i][1]*side, nz=r.T[i][0]*side; const ox=p[0]+nx*(r.w/2+0.9), oz=p[1]+nz*(r.w/2+0.9);
        const other=nearestRoad(ox,oz,12,s=>s.rid!==r.rid);
        const blocked=(other && other.d<2.2) || BHASH.hit(ox,oz,1.2);
        if(inR && !blocked) run.push(i); else flush(); }
      flush();
    }
  }
  function sidewalk(idx,side,r){ const g=cs.get('curb',r.S[idx[0]][0],r.S[idx[0]][1]); const hw=r.w/2; const W=1.7, H=0.14; const c=new THREE.Color(0.95,0.95,0.93), cdark=new THREE.Color(0.8,0.8,0.78);
    const pts=idx.map(i=>{ const p=r.S[i], t=r.T[i]; const nx=-t[1]*side, nz=t[0]*side; const ix=p[0]+nx*hw, iz=p[1]+nz*hw; const ox=p[0]+nx*(hw+W), oz=p[1]+nz*(hw+W); const y0=surfY(ix,iz,t[0],t[1],1.5); const yt=Math.max(y0, getHeight(ox,oz)+0.02)+H; return {i:[ix,y0-0.05,iz], it:[ix,yt,iz], ot:[ox,yt,oz], o:[ox,Math.min(getHeight(ox,oz)-0.1,yt-0.2),oz], s:p[2], n:[nx,nz]}; });
    for(let k=0;k<pts.length-1;k++){ const A=pts[k], B=pts[k+1]; const u0=A.s/2, u1=B.s/2;
      g.quad(A.it,A.ot,B.ot,B.it,[u0,0],[u0,W/2],[u1,W/2],[u1,0],c,[0,1,0]);
      g.quad(A.i,A.it,B.it,B.i,[u0,0],[u0,0.1],[u1,0.1],[u1,0],cdark,[-A.n[0],0,-A.n[1]]);
      g.quad(A.ot,A.o,B.o,B.ot,[u0,0],[u0,0.1],[u1,0.1],[u1,0],cdark,[A.n[0],0,A.n[1]]); }
    SIDEWALKS.push(pts);
  }
  // crosswalks
  const zebra=[[-214,-31],[-249,-56],[-292,-58],[-372,-1],[-257,-104]];
  const pg0=cs.get('paint',CENTER[0],CENTER[1]);
  for(const [x,z] of zebra){ const n=nearestRoad(x,z,15,s=>s.t==='secondary'||s.t==='primary'); if(!n) continue; const s=n.s; const hw=s.w/2-0.4; const nx=-s.tz, nz=s.tx;
    for(let k=-hw;k<hw-0.3;k+=1.0){ const q=(o,a)=>{ const X=s.x+nx*o+s.tx*a, Z=s.z+nz*o+s.tz*a; return [X,getHeight(X,Z)+LIFT+0.02,Z]; }; pg0.quad(q(k,-1.6),q(k+0.5,-1.6),q(k+0.5,1.6),q(k,1.6),[0,0],[1,0],[1,1],[0,1],white,[0,1,0]); }
    CROSSINGS.push([s.x,s.z,s.tx,s.tz,s.w]); }
  // bridge rails
  const railG=cs.get('rail',0,0); const railC=new THREE.Color(0.72,0.74,0.76);
  for(const r of ROADS){ if(!r.b || !r.S) continue; for(const side of [1,-1]){ for(let i=0;i<r.S.length-1;i++){ const p=r.S[i], t=r.T[i]; const nx=-t[1]*side, nz=t[0]*side; const x=p[0]+nx*(r.w/2+0.25), z=p[1]+nz*(r.w/2+0.25); const y=getHeight(x,z); const f=frame(x,z,Math.atan2(t[1],t[0]),y);
      if(i%2==0) railG.box(f,-0.05,0.05,0,0.95,-0.05,0.05,railC); railG.box(f,-0.78,0.78,0.72,0.9,-0.03,0.03,railC); } } }
  const mats={main:matMain,local:matLocal,track:matTrack,paint:matPaint,curb:matCurb,rail:new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,metalness:0.6,roughness:0.4})};
  const meshes=cs.meshes(mats,{cast:k=>k==='curb'||k==='rail'});
  for(const m of meshes){ if(m.material!==matCurb && m.material!==mats.rail){ m.castShadow=false; } scene.add(m); }
  ROADMESH.mats=mats;
}
const SIDEWALKS=[], CROSSINGS=[];
