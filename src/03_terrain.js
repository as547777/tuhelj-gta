/* ===================== terrain ===================== */
const NX=M.NX, NZ=M.NZ, CELL=M.CELL, X0=M.X0, Z0=M.Z0;
const GW=(NX-1)*CELL, GH=(NZ-1)*CELL;
const HEI=new Float32Array(NX*NZ);
function decodeHeights(){ const bin=atob(D.h); for(let i=0;i<NX*NZ;i++){ const v=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8); HEI[i]=M.HB+v/M.HS; } }
// level building pads on slopes (cut uphill, fill downhill) so houses don't stand on huge plinths
function flattenSites(){
  const acc=new Float32Array(NX*NZ), ws=new Float32Array(NX*NZ), wm=new Float32Array(NX*NZ);
  for(const b of D.bld){ const R=b.r; const hs=[];
    for(const r of R){ const f=frame(r[0],r[1],r[2]); for(const [sx,sz] of [[1,1],[-1,1],[-1,-1],[1,-1],[0,0],[1,0],[-1,0],[0,1],[0,-1]]){ const p=f(sx*r[3]/2,0,sz*r[4]/2); hs.push(getHeight(p[0],p[2])); } }
    hs.sort((a,b)=>a-b); const hmin=hs[0], hmax=hs[hs.length-1]; if(hmax-hmin<0.5) continue;
    const target=b.k==='school'||R.length>1? hs[Math.floor(hs.length/2)] : hmin+0.42*(hmax-hmin);
    const big=b.k==='school'||b.k==='church'; const IN=big?4:2.0, OUT=big?16:10;
    for(const r of R){ const c=Math.cos(r[2]), sn=Math.sin(r[2]); const hl=r[3]/2, hw=r[4]/2; const ext=Math.hypot(hl,hw)+OUT;
      const ix0=Math.max(0,Math.floor((r[0]-ext-X0)/CELL)), ix1=Math.min(NX-1,Math.ceil((r[0]+ext-X0)/CELL)), iz0=Math.max(0,Math.floor((r[1]-ext-Z0)/CELL)), iz1=Math.min(NZ-1,Math.ceil((r[1]+ext-Z0)/CELL));
      for(let iz=iz0;iz<=iz1;iz++) for(let ix=ix0;ix<=ix1;ix++){ const x=X0+ix*CELL-r[0], z=Z0+iz*CELL-r[1]; const lx=Math.abs(x*c+z*sn)-hl, lz=Math.abs(-x*sn+z*c)-hw; const d=Math.hypot(Math.max(lx,0),Math.max(lz,0));
        const w=d<=IN?1:d>=OUT?0:1-smooth(IN,OUT,d); if(w<=0) continue; const i=iz*NX+ix; acc[i]+=w*target; ws[i]+=w; if(w>wm[i]) wm[i]=w; } } }
  for(let i=0;i<NX*NZ;i++){ if(ws[i]>0){ const t=acc[i]/ws[i]; HEI[i]=HEI[i]+(t-HEI[i])*wm[i]*(1-(typeof ROADMASK!=='undefined'?ROADMASK[i]:0)); } }
}
function hAt(ix,iz){ if(ix<0)ix=0; else if(ix>NX-1)ix=NX-1; if(iz<0)iz=0; else if(iz>NZ-1)iz=NZ-1; return HEI[iz*NX+ix]; }
function getHeight(x,z){
  let fx=(x-X0)/CELL, fz=(z-Z0)/CELL; let ix=Math.floor(fx), iz=Math.floor(fz);
  if(ix<0){ix=0;fx=0;} else if(ix>NX-2){ix=NX-2;fx=1;} else fx-=ix;
  if(iz<0){iz=0;fz=0;} else if(iz>NZ-2){iz=NZ-2;fz=1;} else fz-=iz;
  const a=HEI[iz*NX+ix], b=HEI[iz*NX+ix+1], c=HEI[(iz+1)*NX+ix], d=HEI[(iz+1)*NX+ix+1];
  return (fx+fz<=1)? a+(b-a)*fx+(c-a)*fz : d+(c-d)*(1-fx)+(b-d)*(1-fz);
}
function terrainNormal(x,z){ const e=1.5; const n=[getHeight(x-e,z)-getHeight(x+e,z), 2*e, getHeight(x,z-e)-getHeight(x,z+e)]; const l=Math.hypot(...n); return [n[0]/l,n[1]/l,n[2]/l]; }
function buildTerrainMeshes(mat){
  const CH=64, out=[];
  for(let cz=0; cz<NZ-1; cz+=CH) for(let cx=0; cx<NX-1; cx+=CH){
    const nx=Math.min(CH,NX-1-cx), nz=Math.min(CH,NZ-1-cz), vx=nx+1, vz=nz+1;
    const pos=new Float32Array(vx*vz*3), nor=new Float32Array(vx*vz*3);
    for(let j=0;j<vz;j++) for(let i=0;i<vx;i++){
      const ix=cx+i, iz=cz+j, k=(j*vx+i)*3;
      pos[k]=X0+ix*CELL; pos[k+1]=HEI[iz*NX+ix]; pos[k+2]=Z0+iz*CELL;
      const n0=hAt(ix-1,iz)-hAt(ix+1,iz), n1=2*CELL, n2=hAt(ix,iz-1)-hAt(ix,iz+1); const l=Math.hypot(n0,n1,n2);
      nor[k]=n0/l; nor[k+1]=n1/l; nor[k+2]=n2/l;
    }
    const idx=new Uint32Array(nx*nz*6); let t=0;
    for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const a=j*vx+i, b=a+1, c=a+vx, d=c+1; idx[t++]=a; idx[t++]=c; idx[t++]=b; idx[t++]=b; idx[t++]=c; idx[t++]=d; }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setIndex(new THREE.BufferAttribute(idx,1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    const m=new THREE.Mesh(g,mat); m.receiveShadow=true; m.castShadow=false; m.matrixAutoUpdate=false; out.push(m);
  }
  return out;
}
function heightTexture(){ const t=new THREE.DataTexture(HEI,NX,NZ,THREE.RedFormat,THREE.FloatType); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; }

/* ===================== ground painting ===================== */
const GROUND={};
const LAND=D.land.map(l=>({t:l.t,P:unflat(l.p)}));
const ROADS=D.roads.map(r=>({...r,P:unflat(r.p)}));
const WATER=D.water.map(w=>({n:w.n,P:unflat(w.p)}));
const CORN=[]; // corn strips for row geometry
const FIELDS=[];
function paintGround(ALB_W){
  RNG=mulberry32(4242);
  const AW=ALB_W, AH=Math.round(AW*GH/GW), MW=Math.round(AW/2), MH=Math.round(AH/2);
  const A=cvs(AW,AH), a=A.getContext('2d'); const MX=cvs(MW,MH), m=MX.getContext('2d');
  const sa=AW/GW, sm=MW/GW;
  const pa=(x,z)=>[(x-X0)*sa,(z-Z0)*sa], pm=(x,z)=>[(x-X0)*sm,(z-Z0)*sm];
  const poly=(ctx,P,f)=>{ ctx.beginPath(); P.forEach((p,i)=>{ const q=f(p[0],p[1]); i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); }); ctx.closePath(); };
  const line=(ctx,P,f)=>{ ctx.beginPath(); P.forEach((p,i)=>{ const q=f(p[0],p[1]); i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); }); };
  const rgb=(c)=>`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
  // 1. base meadow with large-scale variation
  { const w=560, h=Math.round(560*AH/AW); const c=pixelCanvas(w,h,(x,y,o)=>{ const wx=X0+x/w*GW, wz=Z0+y/h*GH; const n1=fbm2(wx/300,wz/300,4,3), n2=fbm2(wx/80,wz/80,3,7), n3=fbm2(wx/35,wz/35,2,9);
      const dry=smooth(0.45,0.72,n1*0.7+n3*0.3), lush=smooth(0.55,0.8,n2);
      o[0]=lerp(lerp(96,142,dry),76,lush*0.6); o[1]=lerp(lerp(122,138,dry),108,lush*0.5); o[2]=lerp(lerp(52,74,dry),44,lush*0.5); });
    a.imageSmoothingEnabled=true; a.drawImage(c,0,0,AW,AH); }
  m.fillStyle='rgb(255,0,0)'; m.fillRect(0,0,MW,MH);
  // 2. residential lawns
  a.globalAlpha=0.55; a.fillStyle=rgb([108,146,60]);
  for(const l of LAND) if(l.t==='residential'){ poly(a,l.P,pa); a.fill(); }
  a.globalAlpha=1;
  // 3. farmland strips
  const crops=[['hay',34],['corn',24],['stubble',15],['plowed',12],['pasture',15]];
  const cropCol={hay:[[132,154,72],[116,140,62]],pasture:[[112,136,58],[104,128,54]],corn:[[70,98,44],[82,92,52]],stubble:[[188,170,100],[172,152,86]],plowed:[[118,90,62],[100,76,52]],veg:[[104,88,60],[84,110,52]]};
  const cropMix={hay:[255,0,0],pasture:[255,0,0],corn:[60,190,0],stubble:[110,150,0],plowed:[0,255,0],veg:[40,215,0]};
  const stripePat=(ctx,crop,scale,ang,ox,oy)=>{ const [c1,c2]=cropCol[crop]; const s=cvs(64,64), g=s.getContext('2d'); g.fillStyle=rgb(c1); g.fillRect(0,0,64,64);
    if(crop==='hay'||crop==='stubble'){ g.fillStyle=rgb(c2); g.fillRect(0,0,64,32); }
    else if(crop==='plowed'||crop==='corn'||crop==='veg'){ g.fillStyle=rgb(c2); for(let y=0;y<64;y+=8) g.fillRect(0,y,64,3); }
    else { for(let i=0;i<60;i++){ g.fillStyle=`rgba(${c2[0]},${c2[1]},${c2[2]},0.6)`; g.fillRect(rnd(0,64),rnd(0,64),rnd(3,10),rnd(3,10)); } }
    const p=ctx.createPattern(s,'repeat'); const k=scale; p.setTransform(new DOMMatrix().translate(ox,oy).rotate(ang*180/Math.PI).scale(k,k)); return p; };
  for(const l of LAND){ if(l.t!=='farmland') continue;
    const P=l.P; const bb=polyBBox(P); const ar=Math.abs(polyArea(P));
    const ang=longestEdgeAngle(P); const u=[Math.cos(ang),Math.sin(ang)], v=[-u[1],u[0]];
    // project bbox corners on v
    let vmin=1e9,vmax=-1e9,umin=1e9,umax=-1e9; for(const p of P){ const pv=p[0]*v[0]+p[1]*v[1], pu=p[0]*u[0]+p[1]*u[1]; vmin=Math.min(vmin,pv); vmax=Math.max(vmax,pv); umin=Math.min(umin,pu); umax=Math.max(umax,pu); }
    let s=vmin; const strips=[];
    while(s<vmax){ const w = ar<6000? (vmax-vmin+1) : rnd(14,46); strips.push([s,Math.min(vmax,s+w)]); s+=w; }
    a.save(); poly(a,P,pa); a.clip(); m.save(); poly(m,P,pm); m.clip();
    for(const [s0,s1] of strips){ const crop=wpick(crops);
      const corners=[[u[0]*umin+v[0]*s0,u[1]*umin+v[1]*s0],[u[0]*umax+v[0]*s0,u[1]*umax+v[1]*s0],[u[0]*umax+v[0]*s1,u[1]*umax+v[1]*s1],[u[0]*umin+v[0]*s1,u[1]*umin+v[1]*s1]];
      const q0=pa(corners[0][0],corners[0][1]);
      const wsz=(crop==='hay'||crop==='stubble')?rnd(9,14):28;
      a.fillStyle=stripePat(a,crop,wsz*sa/64,ang,q0[0],q0[1]);
      poly(a,corners,pa); a.fill();
      a.globalAlpha=0.25; a.strokeStyle='rgba(60,70,30,1)'; a.lineWidth=Math.max(1,sa*1.2); poly(a,corners,pa); a.stroke(); a.globalAlpha=1;
      m.fillStyle=rgb(cropMix[crop]); poly(m,corners,pm); m.fill();
      if(crop==='corn') CORN.push({P, u, v, umin, umax, s0:s0+0.8, s1:s1-0.8});
      FIELDS.push({P,u,v,umin,umax,s0,s1,crop});
    }
    a.restore(); m.restore();
  }
  // 4. forest floor
  a.fillStyle=rgb([60,70,38]); m.fillStyle='rgb(0,0,255)';
  m.filter='blur(1.5px)';
  for(const l of LAND) if(l.t==='forest'){ poly(a,l.P,pa); a.fill(); poly(m,l.P,pm); m.fill(); }
  a.fillStyle=rgb([86,100,50]); m.fillStyle='rgb(150,0,105)';
  for(const l of LAND) if(l.t==='scrub'){ poly(a,l.P,pa); a.fill(); poly(m,l.P,pm); m.fill(); }
  m.filter='none';
  a.fillStyle=rgb([104,132,58]); m.fillStyle='rgb(255,0,0)';
  for(const l of LAND) if(l.t==='hole'){ poly(a,l.P,pa); a.fill(); poly(m,l.P,pm); m.fill(); }
  // forest floor mottling
  { const w=900, h=Math.round(900*AH/AW); const c=pixelCanvas(w,h,(x,y,o)=>{ const wx=X0+x/w*GW, wz=Z0+y/h*GH; const n=fbm2(wx/25,wz/25,3,13); o[0]=90; o[1]=70; o[2]=40; o[3]=n>0.6?70:0; }); a.save(); for(const l of LAND) if(l.t==='forest'){ poly(a,l.P,pa); } a.clip(); a.drawImage(c,0,0,AW,AH); a.restore(); }
  // 5. special areas
  for(const l of LAND){
    if(l.t==='cemetery'){ a.fillStyle=rgb([112,136,66]); poly(a,l.P,pa); a.fill(); }
    if(l.t==='school'){ a.fillStyle=rgb([116,146,64]); poly(a,l.P,pa); a.fill(); }
    if(l.t==='parking'||l.t==='industrial'){ a.fillStyle=rgb(l.t==='parking'?[92,92,94]:[128,122,110]); poly(a,l.P,pa); a.fill(); m.fillStyle='rgb(0,255,0)'; poly(m,l.P,pm); m.fill(); }
  }
  for(const l of LAND) if(l.t==='pitch'){ a.fillStyle=rgb([86,94,104]); poly(a,l.P,pa); a.fill(); m.fillStyle='rgb(0,255,0)'; poly(m,l.P,pm); m.fill();
    a.strokeStyle='rgba(235,235,230,0.9)'; a.lineWidth=Math.max(1,0.12*sa); const bb=polyBBox(l.P); const c1=pa(bb[0]+1,bb[2]+1), c2=pa(bb[1]-1,bb[3]-1); a.strokeRect(c1[0],c1[1],c2[0]-c1[0],c2[1]-c1[1]); const mid=pa((bb[0]+bb[1])/2,(bb[2]+bb[3])/2); a.beginPath(); a.arc(mid[0],mid[1],2*sa,0,TAU); a.stroke(); }
  // 6. streams: lush banks
  a.strokeStyle=rgb([70,94,44]); a.lineCap='round'; a.lineJoin='round';
  for(const w of WATER){ a.lineWidth=10*sa; line(a,w.P,pa); a.stroke(); }
  a.strokeStyle=rgb([74,70,52]); for(const w of WATER){ a.lineWidth=4.2*sa; line(a,w.P,pa); a.stroke(); }
  m.strokeStyle='rgb(0,200,55)'; m.lineCap='round'; for(const w of WATER){ m.lineWidth=4*sm; line(m,w.P,pm); m.stroke(); }
  // 7. roads: shoulders + base
  const order={path:0,track:1,service:2,residential:3,unclassified:4,tertiary:5,secondary:6,primary:7};
  const rs=[...ROADS].sort((p,q)=>order[p.t]-order[q.t]);
  a.lineCap='round'; a.lineJoin='round'; m.lineCap='round'; m.lineJoin='round';
  for(const r of rs){ const sh=(r.t==='track'||r.t==='path')?0.6:2.2; a.strokeStyle=rgb(r.t==='track'||r.t==='path'?[120,112,84]:[134,124,100]); a.lineWidth=(r.w+sh)*sa; line(a,r.P,pa); a.stroke(); }
  for(const r of rs){ a.strokeStyle=rgb(r.t==='track'||r.t==='path'?[140,128,100]:[88,88,88]); a.lineWidth=r.w*sa; line(a,r.P,pa); a.stroke(); m.strokeStyle='rgb(0,255,0)'; m.lineWidth=(r.w+(r.t==='track'?0.4:1.4))*sm; line(m,r.P,pm); m.stroke(); }
  GROUND.painter={a,m,pa,pm,sa,sm,poly,line,rgb};
  GROUND.A=A; GROUND.MX=MX; GROUND.AW=AW; GROUND.AH=AH; GROUND.MW=MW; GROUND.MH=MH;
}
// building yards / driveways / gardens (called after building list is ready)
function paintYards(blds){
  const {a,m,pa,pm,sa,sm,poly,line,rgb}=GROUND.painter; RNG=mulberry32(99);
  a.lineCap='round'; m.lineCap='round';
  for(const b of blds){ if(!b.rect) continue; const [cx,cz,ang,L,W]=b.rect; const f=frame(cx,cz,ang);
    const big = (b.k==='house'||b.k==='shop'||b.k==='cafe'||b.k==='townhall'||b.k==='parish'||b.k==='fire'||b.k==='school');
    if(big && b.front){ // driveway
      const fp=b.front.mid; const dw=b.dw; if(dw && Math.hypot(dw[0]-fp[0],dw[1]-fp[1])<45){ const paved=RNG()<0.45||b.k!=='house'; a.strokeStyle=rgb(paved?[112,112,110]:[150,142,122]); a.lineWidth=(b.k==='house'?rnd(2.6,3.4):5)*sa; line(a,[fp,dw],pa); a.stroke(); m.strokeStyle='rgb(0,255,0)'; m.lineWidth=3*sm; line(m,[fp,dw],pm); m.stroke(); }
    }
    const e=b.k==='house'?1.1:0.7; const P=[f(-L/2-e,0,-W/2-e),f(L/2+e,0,-W/2-e),f(L/2+e,0,W/2+e),f(-L/2-e,0,W/2+e)].map(p=>[p[0],p[2]]);
    a.fillStyle=rgb(b.k==='barn'||b.k==='shed'?[112,108,84]:b.k==='church'?[214,210,200]:[150,146,136]); poly(a,P,pa); a.fill(); m.fillStyle='rgb(0,255,0)'; poly(m,P,pm); m.fill();
    if(b.k==='house' && b.back && RNG()<0.35){ // vegetable garden behind the house
      const [bx,bz,bang]=b.back; const gw=rnd(6,11), gl=rnd(5,9); const g=frame(bx,bz,bang); const Q=[g(-gw/2,0,0),g(gw/2,0,0),g(gw/2,0,gl),g(-gw/2,0,gl)].map(p=>[p[0],p[2]]);
      if(!insideAnyBuilding(Q)){ a.fillStyle=rgb([108,84,58]); poly(a,Q,pa); a.fill(); a.strokeStyle='rgba(70,110,50,0.9)'; a.lineWidth=Math.max(1,0.35*sa); for(let k=0.5;k<gl;k+=0.9){ line(a,[[g(-gw/2+0.4,0,k)[0],g(-gw/2+0.4,0,k)[2]],[g(gw/2-0.4,0,k)[0],g(gw/2-0.4,0,k)[2]]],pa); a.stroke(); } m.fillStyle='rgb(40,215,0)'; poly(m,Q,pm); m.fill(); }
    }
  }
}
// paved aprons in front of public buildings (fire station yard, church plaza, shop parking...)
function paintAprons(blds){ const {a,m,pa,pm,poly,rgb}=GROUND.painter;
  for(const b of blds){ if(!['fire','townhall','shop','cafe','church','chapel','parish'].includes(b.k)) continue; const [cx,cz,ang,L,W]=b.rect; const f=frame(cx,cz,ang);
    const sides=b.k==='church'?[0,1,2,3]:[b.f];
    for(const sk of sides){ const si=sideInfo(sk,L/2,W/2); const mid=wallPoint(f,si,0,0.2); const n=nearestRoad(mid[0],mid[2],40); let depth=n? clamp(n.d+1.0,4,24):8; if(b.k==='church') depth=sk===0?14:5; if(b.k==='chapel') depth=4;
      const e=si.e+(b.k==='fire'?4:b.k==='church'?2.5:1.5); const Q=[[-e,0.1],[e,0.1],[e,depth],[-e,depth]].map(([t,o])=>{ const p=wallPoint(f,si,t,o); return [p[0],p[2]]; });
      const paving=(b.k==='church'||b.k==='chapel'||b.k==='parish'); a.fillStyle=rgb(b.k==='church'?[160,118,102]:paving?[176,170,158]:[104,104,103]); poly(a,Q,pa); a.fill();
      if(paving){ a.strokeStyle='rgba(120,112,100,0.35)'; a.lineWidth=1; for(let k=1;k<depth;k+=1.2){ const p0=wallPoint(f,si,-e,k), p1=wallPoint(f,si,e,k); const A=pa(p0[0],p0[2]), B=pa(p1[0],p1[2]); a.beginPath(); a.moveTo(A[0],A[1]); a.lineTo(B[0],B[1]); a.stroke(); } }
      m.fillStyle='rgb(0,255,0)'; poly(m,Q,pm); m.fill();
      if(b.k==='fire'){ a.strokeStyle='rgba(240,240,236,0.85)'; a.lineWidth=Math.max(1,0.16*GROUND.painter.sa); for(const t of [-e*0.6,-e*0.2,e*0.2,e*0.6]){ const p0=wallPoint(f,si,t,2.5), p1=wallPoint(f,si,t,depth-1.5); const A=pa(p0[0],p0[2]), B=pa(p1[0],p1[2]); a.beginPath(); a.moveTo(A[0],A[1]); a.lineTo(B[0],B[1]); a.stroke(); }
        const q0=wallPoint(f,si,-e*0.6,depth*0.55), q1=wallPoint(f,si,e*0.6,depth*0.55); const A=pa(q0[0],q0[2]), B=pa(q1[0],q1[2]); a.beginPath(); a.moveTo(A[0],A[1]); a.lineTo(B[0],B[1]); a.stroke(); } } } }
function insideAnyBuilding(Q){ for(const p of Q){ if(BHASH.hit(p[0],p[1],0.5)) return true; } return false; }
function polyArea(P){ let s=0; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; s+=a[0]*b[1]-b[0]*a[1]; } return s/2; }
function longestEdgeAngle(P){ let best=0, ang=0; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L>best){ best=L; ang=Math.atan2(b[1]-a[1],b[0]-a[0]); } } return ang; }
function finishGround(){
  GROUND.alb=mkTex(GROUND.A,{repeat:false}); GROUND.alb.wrapS=GROUND.alb.wrapT=THREE.ClampToEdgeWrapping; GROUND.alb.flipY=false; GROUND.alb.needsUpdate=true;
  GROUND.mix=mkTex(GROUND.MX,{repeat:false,srgb:false}); GROUND.mix.wrapS=GROUND.mix.wrapT=THREE.ClampToEdgeWrapping; GROUND.mix.flipY=false; GROUND.mix.needsUpdate=true;
  const id=GROUND.MX.getContext('2d').getImageData(0,0,GROUND.MW,GROUND.MH); GROUND.mixData=id.data;
}
function mixAt(x,z){ const ix=clamp(Math.floor((x-X0)/GW*GROUND.MW),0,GROUND.MW-1), iz=clamp(Math.floor((z-Z0)/GH*GROUND.MH),0,GROUND.MH-1); const k=(iz*GROUND.MW+ix)*4, d=GROUND.mixData; return [d[k]/255,d[k+1]/255,d[k+2]/255]; }
function makeTerrainMaterial(){
  const mat=new THREE.MeshStandardMaterial({color:0xffffff, roughness:0.96, metalness:0});
  mat.onBeforeCompile=(sh)=>{
    Object.assign(sh.uniforms,{uAlb:{value:GROUND.alb},uMix:{value:GROUND.mix},uGrass:{value:TEX.grass},uDirt:{value:TEX.dirt},uLitter:{value:TEX.litter},uOrigin:{value:new THREE.Vector2(X0,Z0)},uSize:{value:new THREE.Vector2(GW,GH)}});
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <fog_vertex>','#include <fog_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform sampler2D uAlb,uMix,uGrass,uDirt,uLitter; uniform vec2 uOrigin,uSize; varying vec3 vWP;`).replace('#include <map_fragment>',`
vec2 suv=(vWP.xz-uOrigin)/uSize;
vec3 alb=texture2D(uAlb,suv).rgb;
vec3 w=texture2D(uMix,suv).rgb; float ws=w.r+w.g+w.b; float wg=w.r+max(0.0,1.0-ws); w/=max(ws,1.0);
float dcam=length(vWP-cameraPosition);
vec2 d1=vWP.xz*0.21, d2=vWP.xz*0.057;
vec3 gd=texture2D(uGrass,d1).rgb*0.62+texture2D(uGrass,d2).rgb*0.38;
vec3 dd=texture2D(uDirt,d1*1.4).rgb*0.62+texture2D(uDirt,d2).rgb*0.38;
vec3 ld=texture2D(uLitter,d1*1.2).rgb*0.62+texture2D(uLitter,d2).rgb*0.38;
vec3 det=(gd*wg+dd*w.g+ld*w.b)/max(wg+w.g+w.b,0.001);
det=mix(vec3(0.5),det,1.7); det=mix(det,vec3(0.5),smoothstep(60.0,380.0,dcam));
diffuseColor.rgb*=alb*det*2.0;`);
  };
  return mat;
}
