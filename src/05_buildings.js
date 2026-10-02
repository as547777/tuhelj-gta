/* ===================== buildings ===================== */
const BHASH={cell:16,map:new Map(),
  add(o){ const r=Math.hypot(o.hl,o.hw)+1; const x0=Math.floor((o.cx-r)/16), x1=Math.floor((o.cx+r)/16), z0=Math.floor((o.cz-r)/16), z1=Math.floor((o.cz+r)/16);
    for(let i=x0;i<=x1;i++) for(let j=z0;j<=z1;j++){ const k=i+'|'+j; let a=this.map.get(k); if(!a){a=[];this.map.set(k,a);} a.push(o); } },
  near(x,z){ return this.map.get(Math.floor(x/16)+'|'+Math.floor(z/16))||[]; },
  hit(x,z,r=0){ for(const o of this.near(x,z)){ const dx=x-o.cx, dz=z-o.cz; const lx=dx*o.c+dz*o.s, lz=-dx*o.s+dz*o.c; if(Math.abs(lx)<o.hl+r && Math.abs(lz)<o.hw+r) return o; } return null; },
  collide(p,r,y){ for(const o of this.near(p.x,p.z)){ if(y!==undefined && (y>o.y1+0.3 || y<o.y0-2)) continue; const dx=p.x-o.cx, dz=p.z-o.cz; let lx=dx*o.c+dz*o.s, lz=-dx*o.s+dz*o.c; const px=o.hl+r-Math.abs(lx), pz=o.hw+r-Math.abs(lz);
      if(px>0 && pz>0){ if(px<pz) lx+=Math.sign(lx||1)*px; else lz+=Math.sign(lz||1)*pz; p.x=o.cx+lx*o.c-lz*o.s; p.z=o.cz+lx*o.s+lz*o.c; } } }
};
function addCollider(cx,cz,ang,L,W,y0=-1e4,y1=1e4){ BHASH.add({cx,cz,c:Math.cos(ang),s:Math.sin(ang),hl:L/2,hw:W/2,y0,y1}); }
const BLD=[]; // runtime building records
const WALLCOLS=[['#f2f0ea',22],['#eee5d3',16],['#ecdcb6',13],['#efd98c',9],['#e3c47c',5],['#e8b9a2',8],['#ecc8a2',8],['#d8d7d0',5],['#d0dcc2',3],['#cfdbe2',2],['#dcc4a2',6]];
const ROOFCOLS=[['#b95a36',34],['#9b4731',24],['#613b2d',17],['#4d4c4e',9],['#c8703f',12],['#8a3a2a',6]];
const PLINTHCOLS=['#8c877c','#6f5a4a','#a39b8c','#7a3a34','#5f6360','#9a8f7c'];
const WINSETS=[['roller_brown',32],['roller_white',14],['roller_red',9],['roller_dark',10],['shut',12],['modern',12],['old4',6],['flowers',5]];
function prepBuildings(){
  RNG=mulberry32(31337);
  for(const b of D.bld){
    const rects=b.r.map(r=>r.slice()); let f=b.f;
    if(rects.length===1){ const r=rects[0]; if(r[4]>r[3]+0.3 && b.k!=='church' && b.k!=='fire'){ r[2]+=Math.PI/2; const t=r[3]; r[3]=r[4]; r[4]=t; f=({0:3,1:2,2:0,3:1})[f]; } }
    if(b.k==='house' && Math.hypot(rects[0][0]+203.9,rects[0][1]+76.5)<3){ b.k='apt'; b.n='Studio apartman Kod Ruže'; }
    const R={k:b.k,lv:b.lv||0,n:b.n||'',st:b.st||'',att:!!b.att,osm:!!b.o,rects,f,dw:b.dw,rect:rects[0]};
    // front midpoint / back point
    const [cx,cz,ang,L,W]=R.rect; const fr=frame(cx,cz,ang); const N=[[1,0],[-1,0],[0,1],[0,-1]][f]; const d=(f<2?L:W)/2;
    const fm=fr(N[0]*d,0,N[1]*d); R.front={mid:[fm[0],fm[2]],n:N};
    const bk=fr(-N[0]*(d+2.5),0,-N[1]*(d+2.5)); const Nw=worldN(ang,N); R.back=[bk[0],bk[2],Math.atan2(Nw[0],-Nw[2])];
    // base heights
    let hmin=1e9,hmax=-1e9; for(const r of rects){ const g=frame(r[0],r[1],r[2]); for(const [sx,sz] of [[1,1],[-1,1],[-1,-1],[1,-1],[0,0]]){ const p=g(sx*r[3]/2,0,sz*r[4]/2); const h=getHeight(p[0],p[2]); hmin=Math.min(hmin,h); hmax=Math.max(hmax,h); } }
    R.hmin=hmin; R.hmax=hmax;
    BLD.push(R);
    if(b.k==='church'||b.k==='cafe'||b.k==='fire'||b.k==='apt'){ R.custom=true; continue; }
    for(const r of rects){ if(b.k==='shrine') addCollider(r[0],r[1],r[2],r[3]*0.7,r[4]*0.7,hmin-2,hmax+6); else addCollider(r[0],r[1],r[2],r[3],r[4],hmin-3,hmax+40); }
  }
}
/* ---- side helpers (local frame: x along ridge, z across) ---- */
const SIDE=[{n:[1,0],r:[0,-1]},{n:[-1,0],r:[0,1]},{n:[0,1],r:[1,0]},{n:[0,-1],r:[-1,0]}];
function sideInfo(k,hl,hw){ const s=SIDE[k]; const d=k<2?hl:hw, e=k<2?hw:hl; return {n:s.n,r:s.r,d,e,len:2*e}; }
function worldN(ang,n){ const c=Math.cos(ang), s=Math.sin(ang); return [c*n[0]-s*n[1],0,s*n[0]+c*n[1]]; }
// decal on wall: local centre t along side, y bottom
function decal(G,f,ang,si,t,yb,name,off=0.045,scale=1){ const w=WIN[name]; if(!w) return; const W=w.w*scale, H=w.h*scale;
  const cx=si.n[0]*(si.d+off)+si.r[0]*t, cz=si.n[1]*(si.d+off)+si.r[1]*t;
  const a=f(cx-si.r[0]*W/2,yb,cz-si.r[1]*W/2), b=f(cx+si.r[0]*W/2,yb,cz+si.r[1]*W/2), c=f(cx+si.r[0]*W/2,yb+H,cz+si.r[1]*W/2), d=f(cx-si.r[0]*W/2,yb+H,cz-si.r[1]*W/2);
  G.quad(a,b,c,d,[w.u0,w.v0],[w.u1,w.v0],[w.u1,w.v1],[w.u0,w.v1],WHITE,worldN(ang,si.n)); return {W,H}; }
const WHITE=new THREE.Color(1,1,1);
function lin(hex){ return new THREE.Color(hex); }
/* ---- roof ---- */
function emitRoof(cs,f,ang,hl,hw,e,type,pitchDeg,ov,ovg,Croof,Csof,mat='roof',ext=15,k=0.5){
  const tanP=Math.tan(pitchDeg*Math.PI/180), cosP=Math.cos(pitchDeg*Math.PI/180);
  const oE=(ext&4)?ov:0.05, oW=(ext&8)?ov:0.05; // +z / -z eaves
  const E1=hw+oE, E2=hw+oW; const rt=e+hw*tanP;
  const g=cs.get(mat,f(0,0,0)[0],f(0,0,0)[2]); const s=cs.get('soffit',f(0,0,0)[0],f(0,0,0)[2]);
  const TH=0.16, UV=1.25;
  const plane=(pts,upN)=>{ // pts local [x,y,z]; tile uv along x and slope
    const P=pts.map(p=>f(p[0],p[1],p[2]));
    const uv=pts.map(p=>[p[0]/UV, (Math.abs(p[3]!==undefined?p[3]:0))/UV]);
    const nW=upN; if(P.length===3) g.tri(P[0],P[1],P[2],uv[0],uv[1],uv[2],Croof,nW); else { g.quad(P[0],P[1],P[2],P[3],uv[0],uv[1],uv[2],uv[3],Croof,nW); }
    const Q=pts.map(p=>f(p[0],p[1]-TH,p[2])); const dn=[-nW[0],-nW[1],-nW[2]];
    if(Q.length===3) s.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],Csof,dn); else s.quad(Q[0],Q[1],Q[2],Q[3],[0,0],[1,0],[1,1],[0,1],Csof,dn);
  };
  const fasc=(a,b)=>{ const A=f(...a), B=f(...b), C=f(a[0],a[1]-TH,a[2]), Dd=f(b[0],b[1]-TH,b[2]); const mx=(a[0]+b[0])/2, mz=(a[2]+b[2])/2; const o=worldN(ang,[mx,mz]); s.quad(C,Dd,B,A,[0,0],[1,0],[1,1],[0,1],Csof,o); };
  const nUp=(lx,lz)=>{ const w=worldN(ang,[lx,lz]); return [w[0],1,w[2]]; };
  const sl=(d)=>d/cosP; // slope distance for uv
  if(type==='flat'){ const y=e+0.1; const A=f(-hl-0.2,y,-hw-0.2),B=f(hl+0.2,y,-hw-0.2),C=f(hl+0.2,y,hw+0.2),Dd=f(-hl-0.2,y,hw+0.2); g.quad(A,B,C,Dd,[0,0],[1,0],[1,1],[0,1],Croof,[0,1,0]); for(const [a,b] of [[[-hl-0.2,y,-hw-0.2],[hl+0.2,y,-hw-0.2]],[[hl+0.2,y,-hw-0.2],[hl+0.2,y,hw+0.2]],[[hl+0.2,y,hw+0.2],[-hl-0.2,y,hw+0.2]],[[-hl-0.2,y,hw+0.2],[-hl-0.2,y,-hw-0.2]]]) fasc(a,b); return e+0.1; }
  if(type==='shed'){ const X=hl+ovg; const yLo=e-oE*tanP, yHi=e+(2*hw)*tanP+oW*tanP; // slopes down toward +z
    const pts=[[-X,yLo,E1,0],[X,yLo,E1,0],[X,yHi,-E2,sl(E1+E2)],[-X,yHi,-E2,sl(E1+E2)]]; plane(pts,nUp(0,1)); fasc([-X,yLo,E1],[X,yLo,E1]); fasc([X,yHi,-E2],[-X,yHi,-E2]); fasc([X,yLo,E1],[X,yHi,-E2]); fasc([-X,yHi,-E2],[-X,yLo,E1]);
    return yHi; }
  const e1=e-oE*tanP, e2=e-oW*tanP;
  if(type==='gable'){ const X=hl+ovg;
    plane([[-X,e1,E1,0],[X,e1,E1,0],[X,rt,0,sl(E1)],[-X,rt,0,sl(E1)]],nUp(0,1));
    plane([[X,e2,-E2,0],[-X,e2,-E2,0],[-X,rt,0,sl(E2)],[X,rt,0,sl(E2)]],nUp(0,-1));
    fasc([-X,e1,E1],[X,e1,E1]); fasc([X,e2,-E2],[-X,e2,-E2]);
    fasc([X,e1,E1],[X,rt,0]); fasc([X,rt,0],[X,e2,-E2]); fasc([-X,e2,-E2],[-X,rt,0]); fasc([-X,rt,0],[-X,e1,E1]);
    return rt; }
  if(type==='hip'){ const oX=hl+ov; const rl=Math.max(0,hl-hw);
    const ridge=(rl>0.05);
    if(ridge){ plane([[-oX,e1,E1,0],[oX,e1,E1,0],[rl,rt,0,sl(E1)],[-rl,rt,0,sl(E1)]],nUp(0,1)); plane([[oX,e2,-E2,0],[-oX,e2,-E2,0],[-rl,rt,0,sl(E2)],[rl,rt,0,sl(E2)]],nUp(0,-1)); }
    else { plane([[-oX,e1,E1,0],[oX,e1,E1,0],[0,rt,0,sl(E1)]],nUp(0,1)); plane([[oX,e2,-E2,0],[-oX,e2,-E2,0],[0,rt,0,sl(E2)]],nUp(0,-1)); }
    plane([[oX,e1,E1,0],[oX,e2,-E2,0],[rl,rt,0,sl(hw+ov)]],nUp(1,0)); plane([[-oX,e2,-E2,0],[-oX,e1,E1,0],[-rl,rt,0,sl(hw+ov)]],nUp(-1,0));
    fasc([-oX,e1,E1],[oX,e1,E1]); fasc([oX,e2,-E2],[-oX,e2,-E2]); fasc([oX,e1,E1],[oX,e2,-E2]); fasc([-oX,e2,-E2],[-oX,e1,E1]);
    return rt; }
  if(type==='halfhip'){ const X=hl+ovg; const ek=e+k*(rt-e); const zk=E1-(ek-e1)/tanP; const rl=X-zk;
    plane([[-X,e1,E1,0],[X,e1,E1,0],[X,ek,zk,sl(E1-zk)],[-X,ek,zk,sl(E1-zk)]],nUp(0,1));
    plane([[-X,ek,zk,sl(E1-zk)],[X,ek,zk,sl(E1-zk)],[rl,rt,0,sl(E1)],[-rl,rt,0,sl(E1)]],nUp(0,1));
    plane([[X,e2,-E2,0],[-X,e2,-E2,0],[-X,ek,-zk,sl(E2-zk)],[X,ek,-zk,sl(E2-zk)]],nUp(0,-1));
    plane([[X,ek,-zk,sl(E2-zk)],[-X,ek,-zk,sl(E2-zk)],[-rl,rt,0,sl(E2)],[rl,rt,0,sl(E2)]],nUp(0,-1));
    plane([[X,ek,zk,0],[X,ek,-zk,0],[rl,rt,0,sl(zk)]],nUp(1,0)); plane([[-X,ek,-zk,0],[-X,ek,zk,0],[-rl,rt,0,sl(zk)]],nUp(-1,0));
    fasc([-X,e1,E1],[X,e1,E1]); fasc([X,e2,-E2],[-X,e2,-E2]); fasc([X,e1,E1],[X,ek,zk]); fasc([X,ek,-zk],[X,e2,-E2]); fasc([-X,e2,-E2],[-X,ek,-zk]); fasc([-X,ek,zk],[-X,e1,E1]);
    fasc([X,ek,zk],[X,ek,-zk]); fasc([-X,ek,-zk],[-X,ek,zk]);
    // soffit under gable overhang
    const sA=f(hl,ek-0.02,zk), sB=f(X,ek-0.02,zk), sC=f(X,ek-0.02,-zk), sD=f(hl,ek-0.02,-zk); s.quad(sA,sB,sC,sD,[0,0],[1,0],[1,1],[0,1],Csof,[0,-1,0]);
    const tA=f(-hl,ek-0.02,-zk), tB=f(-X,ek-0.02,-zk), tC=f(-X,ek-0.02,zk), tD=f(-hl,ek-0.02,zk); s.quad(tA,tB,tC,tD,[0,0],[1,0],[1,1],[0,1],Csof,[0,-1,0]);
    return rt; }
  return e;
}
// roof height at local (x,z) for gable-like (used for chimneys)
function roofYat(z,hw,e,pitch){ return e+(hw-Math.abs(z))*Math.tan(pitch*Math.PI/180); }
/* ---- walls with gables ---- */
function emitWalls(cs,f,ang,hl,hw,yb,e,roof,pitch,C,mat,ext=15,k=0.5,gableSides=[0,1]){
  const g=cs.get(mat,f(0,0,0)[0],f(0,0,0)[2]); const uvS=mat==='wall'?3:2; const tanP=Math.tan(pitch*Math.PI/180); const rt=e+hw*tanP; const ek=e+k*(rt-e);
  for(let sk=0;sk<4;sk++){ const si=sideInfo(sk,hl,hw);
    const pL=[si.n[0]*si.d-si.r[0]*si.e, si.n[1]*si.d-si.r[1]*si.e], pR=[si.n[0]*si.d+si.r[0]*si.e, si.n[1]*si.d+si.r[1]*si.e];
    const A=f(pL[0],yb,pL[1]),B=f(pR[0],yb,pR[1]),Cc=f(pR[0],e,pR[1]),Dd=f(pL[0],e,pL[1]); const N=worldN(ang,si.n);
    g.quad(A,B,Cc,Dd,[0,yb/uvS],[si.len/uvS,yb/uvS],[si.len/uvS,e/uvS],[0,e/uvS],C,N);
    if(sk<2 && (roof==='gable'||roof==='halfhip'||roof==='shed')){
      if(roof==='gable'){ const top=f(si.n[0]*si.d,rt,0); g.tri(Dd,Cc,top,[0,e/uvS],[si.len/uvS,e/uvS],[si.len/2/uvS,rt/uvS],C,N); }
      else if(roof==='halfhip'){ const zk=(hw)*(1-k);
        const lu=f(pL[0],ek,pL[1]*(zk/hw)), ru=f(pR[0],ek,pR[1]*(zk/hw)); g.quad(Dd,Cc,ru,lu,[0,e/uvS],[si.len/uvS,e/uvS],[(si.len/2+zk)/uvS,ek/uvS],[(si.len/2-zk)/uvS,ek/uvS],C,N); }
      else if(roof==='shed'){ // side walls rise toward -z
        const yHi=e+2*hw*tanP; const lz=pL[1], rz=pR[1]; const yl=e+(hw-lz)*tanP, yr=e+(hw-rz)*tanP; if(Math.max(yl,yr)>e+0.01){ const lu=f(pL[0],yl,pL[1]), ru=f(pR[0],yr,pR[1]); g.quad(Dd,Cc,ru,lu,[0,e/uvS],[si.len/uvS,e/uvS],[si.len/uvS,yr/uvS],[0,yl/uvS],C,N); } }
    }
    if(sk===3 && roof==='shed'){ const yHi=e+2*hw*tanP; const lu=f(pL[0],yHi,pL[1]), ru=f(pR[0],yHi,pR[1]); g.quad(Dd,Cc,ru,lu,[0,e/uvS],[si.len/uvS,e/uvS],[si.len/uvS,yHi/uvS],[0,yHi/uvS],C,N); }
  }
}
function emitPlinth(cs,f,ang,hl,hw,yb,yt,C){ const g=cs.get('plinth',f(0,0,0)[0],f(0,0,0)[2]); const o=0.035;
  for(let sk=0;sk<4;sk++){ const si=sideInfo(sk,hl+o,hw+o); const pL=[si.n[0]*si.d-si.r[0]*si.e, si.n[1]*si.d-si.r[1]*si.e], pR=[si.n[0]*si.d+si.r[0]*si.e, si.n[1]*si.d+si.r[1]*si.e];
    g.quad(f(pL[0],yb,pL[1]),f(pR[0],yb,pR[1]),f(pR[0],yt,pR[1]),f(pL[0],yt,pL[1]),[0,0],[si.len/1.5,0],[si.len/1.5,(yt-yb)/1.5],[0,(yt-yb)/1.5],C,worldN(ang,si.n)); } }
/* ---- generic house ---- */
function styleFor(b){
  const s={};
  s.wall=lin(wpick(WALLCOLS)); s.wallMat=(b.k==='house' && RNG()<0.075)?'brick':'wall';
  s.roof=lin(wpick(ROOFCOLS)); s.roof=colJ(s.roof,0.4);
  s.plinth=lin(pick(PLINTHCOLS)); s.sof=lin(pick(['#5a3a26','#6b4a30','#e8e4da','#4a3223']));
  s.win=wpick(WINSETS); s.door=wpick([['door_wood',60],['door_wood2',20],['door_glass',20]]);
  s.roofType=wpick([['gable',58],['hip',22],['halfhip',20]]);
  s.pitch=s.roofType==='hip'?rnd(27,36):rnd(33,44);
  s.ov=rnd(0.45,0.85); s.ovg=rnd(0.3,0.65); s.floorH=rnd(2.75,3.0);
  s.balcony = RNG()<0.5; s.rail=wpick([['wood',45],['metal',30],['wall',25]]);
  s.chim = RNG()<0.85; s.dish = RNG()<0.12; s.garage = RNG()<0.22;
  s.shutter = pick(['#3f5b3a','#6a3f22','#7a7a72']);
  return s;
}
function winName(s,k){ if(s.win==='shut') return 'shut_'+s.shutter; if(s.win.startsWith('roller')) return s.win+(k%3===0?1:0); return s.win; }
function emitHouse(cs,b,opt={}){
  const s=opt.style||styleFor(b); const [cx,cz,ang0,L0,W0]=b.rect; const ang=ang0; const hl=L0/2, hw=W0/2;
  const f=frame(cx,cz,ang);
  const floors=opt.floors|| (b.lv||(RNG()<0.55?2:1)); const attic=opt.attic!==undefined?opt.attic:(b.att|| (floors===1 && RNG()<0.35));
  const knee=attic?rnd(0.6,1.0):0.15; const y0=b.hmax+0.15; const yb=b.hmin-0.6;
  const e=y0+floors*s.floorH+knee; b.y0=y0; b.top=e;
  let roof=opt.roof||s.roofType; let pitch=opt.pitch||(attic?Math.max(s.pitch,40):s.pitch);
  if(Math.abs(hl-hw)<0.6 && roof!=='hip') roof='hip';
  emitWalls(cs,f,ang,hl,hw,yb,e,roof,pitch,s.wall,s.wallMat,15,0.5);
  emitPlinth(cs,f,ang,hl,hw,yb,y0+rnd(0.3,0.7),s.plinth);
  const rt=emitRoof(cs,f,ang,hl,hw,e,roof,pitch,s.ov,s.ovg,s.roof,s.sof);
  b.ridge=rt;
  const W=cs.get('win',cx,cz), T=cs.get('trim',cx,cz);
  const trimC=lin(s.wallMat==='brick'?'#b8b2a6':'#f4f2ec');
  const sp=rnd(2.6,3.3);
  const front=b.f;
  for(let sk=0;sk<4;sk++){ const si=sideInfo(sk,hl,hw); if(si.len<2.2) continue;
    let n=Math.floor((si.len-1.0)/sp); if(n<1) n=1; if(n>1 && si.len<4) n=1;
    for(let fl=0;fl<floors;fl++){ const yf=y0+fl*s.floorH;
      let doorAt=-1, garAt=-1, balcony=false;
      if(fl===0 && sk===front){ doorAt=Math.floor(n/2); if(n>2 && RNG()<0.5) doorAt=RNG()<0.5?0:n-1; }
      if(fl===0 && s.garage && sk===(front<2?2:0) && n>=2){ garAt=0; }
      if(fl===1 && sk===front && s.balcony) balcony=true;
      for(let i=0;i<n;i++){ const t=-si.e+si.len*(i+0.5)/n;
        if(i===doorAt){ decal(W,f,ang,si,t,y0-0.02,s.door);
          const po=f(si.n[0]*(si.d+1.0)+si.r[0]*t,0,si.n[1]*(si.d+1.0)+si.r[1]*t); const st=Math.max(0,y0-getHeight(po[0],po[2]));
          const depth=clamp(st*1.6,0.7,1.8); const pc=f(si.n[0]*(si.d+depth/2)+si.r[0]*t,0,si.n[1]*(si.d+depth/2)+si.r[1]*t); const sf=frame(pc[0],pc[2],ang,0);
          const ex=sk<2?depth/2:0.8, ez=sk<2?0.8:depth/2;
          T.box(sf,-ex,ex,y0-st-0.3,y0-0.02,-ez,ez,lin('#b9b4aa'));
          if(RNG()<0.6){ const cf=f(si.n[0]*(si.d+0.5)+si.r[0]*t,0,si.n[1]*(si.d+0.5)+si.r[1]*t); const cx2=sk<2?0.5:0.9, cz2=sk<2?0.9:0.5; T.box(frame(cf[0],cf[2],ang,0),-cx2,cx2,y0+2.45,y0+2.55,-cz2,cz2,trimC); }
          continue; }
        if(i===garAt){ decal(W,f,ang,si,t,y0-0.02,pick(['garage_white','garage_brown','garage_red'])); continue; }
        let nm=winName(s,i+fl*3+sk); if(balcony && i===Math.floor(n/2)) nm='balcony_door';
        if(fl===0 && s.win==='old4' && floors===1) nm='old4';
        const wy=nm==='balcony_door'?yf+0.02:yf+(nm.startsWith('roller')||nm==='flowers'?0.72:0.9);
        const dd=decal(W,f,ang,si,t,wy,nm); if(!dd) continue;
        if(nm!=='balcony_door'){ const p=f(si.n[0]*(si.d+0.08)+si.r[0]*t,0,si.n[1]*(si.d+0.08)+si.r[1]*t); const sa=ang+(sk<2?Math.PI/2:0); T.box(frame(p[0],p[2],sa,0),-dd.W/2-0.05,dd.W/2+0.05,wy-0.07,wy+0.02,-0.1,0.1,trimC); }
      }
      if(balcony){ const bw=Math.min(si.len-0.8,rnd(3.4,6.5)); const bd=rnd(1.1,1.5); const by=yf; const bc=f(si.n[0]*(si.d+bd/2),0,si.n[1]*(si.d+bd/2)); const bf=frame(bc[0],bc[2],ang+(sk<2?Math.PI/2:0),0);
        // in bf frame: x along wall, z outward (sign depends)
        const zs=(sk===0||sk===3)?-1:1; // orientation fix so z points outward
        const outZ=(v)=>zs*v;
        T.box(bf,-bw/2,bw/2,by-0.2,by,Math.min(outZ(-bd/2),outZ(bd/2)),Math.max(outZ(-bd/2),outZ(bd/2)),lin('#d9d6ce'));
        const RC=s.rail==='wood'?lin('#5d3b22'):s.rail==='metal'?lin('#e6e6e2'):s.wall;
        const zo=outZ(bd/2-0.05), zw=outZ(-bd/2);
        if(s.rail==='wall'){ T.box(bf,-bw/2,bw/2,by,by+1.0,Math.min(zo,zo-outZ(0.14)),Math.max(zo,zo-outZ(0.14)),RC); for(const xe of [-bw/2+0.07,bw/2-0.07]) T.box(bf,xe-0.07,xe+0.07,by,by+1.0,Math.min(zw,zo),Math.max(zw,zo),RC); }
        else { T.box(bf,-bw/2,bw/2,by+0.92,by+1.0,Math.min(zo-0.05,zo+0.05),Math.max(zo-0.05,zo+0.05),RC); T.box(bf,-bw/2,bw/2,by+0.08,by+0.14,Math.min(zo-0.03,zo+0.03),Math.max(zo-0.03,zo+0.03),RC);
          const stp=s.rail==='wood'?0.16:0.13; for(let x=-bw/2+0.05;x<=bw/2;x+=stp) T.box(bf,x-0.025,x+0.025,by,by+0.95,Math.min(zo-0.025,zo+0.025),Math.max(zo-0.025,zo+0.025),RC,1,0x3f^8);
          for(const xe of [-bw/2+0.03,bw/2-0.03]) T.box(bf,xe-0.03,xe+0.03,by+0.92,by+1.0,Math.min(zw,zo),Math.max(zw,zo),RC); }
      }
    }
    // attic / gable windows
    if(sk<2 && (roof==='gable'||roof==='halfhip') && (attic || floors>=2) && si.len>5){ const yA=e+0.25; const na=attic?(si.len>8.5?2:1):1; for(let i=0;i<na;i++){ const t=na===1?0:(i?1:-1)*si.len*0.18; decal(W,f,ang,si,t,yA,attic?(s.win==='modern'?'modern':'attic'):'vent',0.045,attic?0.85:1); } }
  }
  // chimney
  if(s.chim && roof!=='flat'){ const zc=rnd(0.3,hw*0.55)*(RNG()<0.5?1:-1); const xc=rnd(-hl*0.55,hl*0.55); const yr=roofYat(zc,hw,e,pitch); const top=rt+rnd(0.5,1.0); const cf=frame(...(()=>{ const p=f(xc,0,zc); return [p[0],p[2]]; })(),ang,0);
    cs.get('wall',cx,cz).box(cf,-0.28,0.28,yr-0.6,top,-0.28,0.28,s.wall,0.33); T.box(cf,-0.36,0.36,top,top+0.08,-0.36,0.36,lin('#8a8680')); T.box(cf,-0.2,0.2,top+0.08,top+0.28,-0.2,0.2,lin('#6d6a66'),1,0x3f^8); }
  b.style=s;
  return s;
}
/* ---- outbuildings ---- */
function emitOutbuilding(cs,b){
  const [cx,cz,ang,L,W]=b.rect; const hl=L/2, hw=W/2; const f=frame(cx,cz,ang);
  const y0=(b.hmin+b.hmax)/2+0.05, yb=b.hmin-0.4;
  if(b.k==='garage'){ const e=y0+rnd(2.5,2.8); const C=lin(wpick(WALLCOLS)); const roof=RNG()<0.5?'shed':'gable'; const pitch=roof==='shed'?rnd(6,10):rnd(22,30);
    emitWalls(cs,f,ang,hl,hw,yb,e,roof,pitch,C,'wall'); emitPlinth(cs,f,ang,hl,hw,yb,y0+0.3,lin(pick(PLINTHCOLS)));
    emitRoof(cs,f,ang,hl,hw,e,roof,pitch,0.3,0.25,colJ(lin(wpick(ROOFCOLS)),0.5),lin('#e0dcd2'),roof==='shed'&&RNG()<0.6?'roofMetal':'roof');
    const W2=cs.get('win',cx,cz); const sk=b.f; const si=sideInfo(sk,hl,hw); if(si.len>2.8) decal(W2,f,ang,si,0,y0-0.02,pick(['garage_white','garage_brown','garage_red']));
    b.top=e; return; }
  const barn=b.k==='barn'; const woodC=colJ(lin(barn?'#9a8878':'#a39080'),0.6);
  const e=y0+(barn?rnd(3.8,4.6):rnd(2.2,2.6)); const pitch=barn?rnd(38,46):rnd(24,34);
  const roof=barn?(RNG()<0.35?'halfhip':'gable'):(RNG()<0.35?'shed':'gable');
  const brickBase=barn && RNG()<0.35;
  if(brickBase){ emitWalls(cs,f,ang,hl,hw,yb,y0+2.4,'none',pitch,lin('#ffffff'),'brick'); emitWalls(cs,f,ang,hl+0.02,hw+0.02,y0+2.4,e,roof,pitch,woodC,'wood'); }
  else emitWalls(cs,f,ang,hl,hw,yb,e,roof,pitch,woodC,'wood');
  const metal=!barn && RNG()<0.45;
  emitRoof(cs,f,ang,hl,hw,e,roof,pitch,barn?0.6:0.35,barn?0.5:0.25,metal?colJ(lin('#8d8f90'),0.5):colJ(lin(barn?'#6b3f2c':wpick(ROOFCOLS)),0.5),lin('#4a3223'),metal?'roofMetal':'roof');
  const W2=cs.get('win',cx,cz); const si=sideInfo(b.f,hl,hw); if(si.len>2.8) decal(W2,f,ang,si,barn?0:si.e*0.35,y0-0.02,'barn_door',0.045,barn?1:0.8);
  b.top=e;
}
