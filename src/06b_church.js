/* ===================== generic segment helpers ===================== */
// wall quad from local (x0,z0)->(x1,z1); outward normal = (-dz,dx) (i.e. traverse left->right as seen from outside)
function segWall(G,f,ang,x0,z0,x1,z1,yb,yt,C,uvS=3,u0=0){ const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz); if(L<1e-4) return; const N=worldN(ang,[-dz/L,dx/L]);
  G.quad(f(x0,yb,z0),f(x1,yb,z1),f(x1,yt,z1),f(x0,yt,z0),[u0/uvS,yb/uvS],[(u0+L)/uvS,yb/uvS],[(u0+L)/uvS,yt/uvS],[u0/uvS,yt/uvS],C,N); }
function segDecal(G,f,ang,x0,z0,x1,z1,t,yb,name,off=0.045,scale=1){ const w=WIN[name]; if(!w) return; const Wd=w.w*scale, Ht=w.h*scale; const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz); const rx=dx/L, rz=dz/L, nx=-rz, nz=rx;
  const cx=x0+rx*t+nx*off, cz=z0+rz*t+nz*off;
  G.quad(f(cx-rx*Wd/2,yb,cz-rz*Wd/2),f(cx+rx*Wd/2,yb,cz+rz*Wd/2),f(cx+rx*Wd/2,yb+Ht,cz+rz*Wd/2),f(cx-rx*Wd/2,yb+Ht,cz-rz*Wd/2),[w.u0,w.v0],[w.u1,w.v0],[w.u1,w.v1],[w.u0,w.v1],WHITE,worldN(ang,[nx,nz])); }
// quad with arbitrary texture rect (u0,v0,u1,v1)
function segTex(G,f,ang,x0,z0,x1,z1,t,yb,Wd,Ht,uv,off,C){ const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz); const rx=dx/L, rz=dz/L, nx=-rz, nz=rx; const cx=x0+rx*t+nx*off, cz=z0+rz*t+nz*off;
  G.quad(f(cx-rx*Wd/2,yb,cz-rz*Wd/2),f(cx+rx*Wd/2,yb,cz+rz*Wd/2),f(cx+rx*Wd/2,yb+Ht,cz+rz*Wd/2),f(cx-rx*Wd/2,yb+Ht,cz-rz*Wd/2),[uv[0],uv[1]],[uv[2],uv[1]],[uv[2],uv[3]],[uv[0],uv[3]],C||WHITE,worldN(ang,[nx,nz])); }
// sloped cap (weathering) in a frame whose local +z points away from the wall
function slopeCap(G,T,x0,x1,zOut,zIn,yLow,yHigh,C){ const a=T(x0,yLow,zOut), b=T(x1,yLow,zOut), c=T(x1,yHigh,zIn), d=T(x0,yHigh,zIn); const nrm=(()=>{ const o=T(0,0,0), p=T(0,1,1); return [p[0]-o[0],p[1]-o[1],p[2]-o[2]]; })();
  G.quad(a,b,c,d,[0,0],[1,0],[1,1],[0,1],C,nrm); const a2=T(x0,yLow-0.1,zOut), b2=T(x1,yLow-0.1,zOut); const o=T(0,0,0), fz=T(0,0,1); G.quad(a2,b2,b,a,[0,0],[1,0],[1,0.1],[0,0.1],C,[fz[0]-o[0],0,fz[2]-o[2]]);
  const sx=T(1,0,0); const sd=[sx[0]-o[0],0,sx[2]-o[2]]; G.tri(T(x1,yLow-0.1,zOut),T(x1,yHigh,zIn),T(x1,yLow-0.1,zIn),[0,0],[1,1],[0,1],C,sd); G.tri(T(x0,yLow-0.1,zOut),T(x0,yLow-0.1,zIn),T(x0,yHigh,zIn),[0,0],[0,1],[1,1],C,[-sd[0],0,-sd[2]]); }
function frameFacing(f,ang,x,z,nx,nz,y0=0){ const p=f(x,0,z); const N=worldN(ang,[nx,nz]); return {T:frame(p[0],p[2],Math.atan2(-N[0],N[2]),y0), a:Math.atan2(-N[0],N[2])}; }
const FLOORS=[]; // walkable floor zones {cx,cz,c,s,hl,hw,y}
function addFloor(f,ang,x0,x1,z0,z1,y){ const p=f((x0+x1)/2,0,(z0+z1)/2); FLOORS.push({cx:p[0],cz:p[2],c:Math.cos(ang),s:Math.sin(ang),hl:Math.abs(x1-x0)/2,hw:Math.abs(z1-z0)/2,y}); }
function floorAt(x,z){ let best=-1e9; for(const F of FLOORS){ const dx=x-F.cx, dz=z-F.cz; const lx=dx*F.c+dz*F.s, lz=-dx*F.s+dz*F.c; if(Math.abs(lx)<=F.hl && Math.abs(lz)<=F.hw && F.y>best) best=F.y; } return best; }
function localCollider(f,ang,x0,x1,z0,z1,y0,y1){ const p=f((x0+x1)/2,0,(z0+z1)/2); addCollider(p[0],p[2],ang,Math.abs(x1-x0),Math.abs(z1-z0),y0,y1); }
function segCollider(f,ang,x0,z0,x1,z1,th,y0,y1){ const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz); const nx=-dz/L, nz=dx/L; const mx=(x0+x1)/2-nx*th/2, mz=(z0+z1)/2-nz*th/2; const p=f(mx,0,mz); addCollider(p[0],p[2],ang+Math.atan2(dz,dx),L,th,y0,y1); }
function flagTex(){ const c=cvs(256,512), g=c.getContext('2d'); const cols=['#d52b1e','#ffffff','#171796']; for(let i=0;i<3;i++){ g.fillStyle=cols[i]; g.fillRect(i*256/3,0,256/3+1,512); }
  const s=70, x0=128-s/2, y0=190; g.fillStyle='#fff'; g.fillRect(x0-3,y0-3,s+6,s*1.25+6); for(let i=0;i<5;i++) for(let j=0;j<6;j++){ if(j===5 && (i===0||i===4)) continue; g.fillStyle=(i+j)%2?'#fff':'#d52b1e'; g.fillRect(x0+i*s/5,y0+j*s*1.25/6,s/5+0.5,s*1.25/6+0.5); }
  const t=mkTex(c,{repeat:false}); return t; }
function stainTex(){ const W=256,H=768; const c=cvs(W,H), g=c.getContext('2d'); g.clearRect(0,0,W,H); const ys=W*0.866; g.save(); g.beginPath(); g.moveTo(0,H); g.lineTo(0,ys); g.arc(W,ys,W,Math.PI,Math.PI*4/3); g.arc(0,ys,W,Math.PI*5/3,Math.PI*2); g.lineTo(W,H); g.closePath(); g.clip();
  const pal=['#b51f2e','#1e3f9e','#e0b53a','#2e7d4f','#6a2f8f','#d8742a','#2a8fb5']; for(let y=0;y<H;y+=26) for(let x=0;x<W;x+=26){ g.fillStyle=pal[(x*7+y*3+((x^y)&5))%pal.length]; g.fillRect(x,y,26,26); }
  g.fillStyle='rgba(255,245,220,0.35)'; g.fillRect(0,0,W,H);
  g.fillStyle='#f3e6c4'; g.beginPath(); g.arc(W/2,H*0.42,W*0.32,0,TAU); g.fill(); g.fillStyle='#2451a8'; g.beginPath(); g.ellipse(W/2,H*0.47,W*0.13,H*0.1,0,0,TAU); g.fill(); g.fillStyle='#f2d7b0'; g.beginPath(); g.arc(W/2,H*0.35,W*0.07,0,TAU); g.fill(); g.strokeStyle='#e6c04a'; g.lineWidth=6; g.beginPath(); g.arc(W/2,H*0.35,W*0.11,0,TAU); g.stroke();
  g.strokeStyle='#1c1a18'; g.lineWidth=5; for(let y=0;y<H;y+=78){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); } g.beginPath(); g.moveTo(W/2,H*0.62); g.lineTo(W/2,H); g.stroke(); g.lineWidth=14; g.strokeStyle='#1c1a18'; g.beginPath(); g.moveTo(0,H); g.lineTo(0,ys); g.arc(W,ys,W,Math.PI,Math.PI*4/3); g.arc(0,ys,W,Math.PI*5/3,Math.PI*2); g.lineTo(W,H); g.stroke(); g.restore();
  const t=mkTex(c,{repeat:false}); return t; }
/* ===================== Church of the Assumption (Tuhelj) ===================== */
function church(cs,scene,b){
  let [cx,cz,ang,L,W]=b.rect; if(Math.cos(ang)>0) ang+=Math.PI; // local +x = west (tower end), +z = north
  const zc=-1.4; const P0=frame(cx,cz,ang); const pc=P0(0,0,zc); const f=frame(pc[0],pc[2],ang); // body frame centred on nave axis
  const y0=b.hmax+0.3, yb=b.hmin-0.9; b.y0=y0;
  const WALL=lin('#f4f1e8'), TRIM=lin('#e2dac8'), STONE=lin('#b9b2a4'), ROOF=lin('#f3e3da'), SOF=lin('#e9e3d5'), METAL=lin('#3c4146'), CAP=lin('#4a4e51'), INNER=lin('#d3c8b2'), RIB=lin('#e8e3d8');
  const hl=L/2, r=5.5, T=0.9, ri=r-T, s8=Math.tan(Math.PI/8);
  const xT0=hl-7.2, xT1=hl, TW=3.6, TT=1.0; const xW=xT0+0.3; // body west wall
  const xc=-11.0; const e=y0+10.5, pitch=50, tanP=Math.tan(pitch*Math.PI/180), rt=e+r*tanP;
  const G=cs.get('wall',cx,cz), Tr=cs.get('trim',cx,cz), Wn=cs.get('win',cx,cz), St=cs.get('stonem',cx,cz), Pl=cs.get('plinth',cx,cz), Rf=cs.get('roofB',cx,cz), So=cs.get('soffit',cx,cz), Mt=cs.get('metal',cx,cz), Gd=cs.get('gold',cx,cz), Wd=cs.get('wood',cx,cz), Cl=cs.get('cloth',cx,cz), Sg=cs.get('stain',cx,cz), Gl=cs.get('glow',cx,cz);
  const vA=[xc-r*s8,r], vB=[xc-r,r*s8], vC=[xc-r,-r*s8], vD=[xc-r*s8,-r];
  const outline=[[xW,-r],vD,vC,vB,vA,[xW,r]]; // + west wall back to start
  // ---- exterior walls with real Gothic openings (deep reveals, stone frames, leaded glass) ----
  const H=heroGroups(cs,cx,cz); const STONEF=lin('#dcd6c8');
  const lancet=(sc,w,ya,yz)=>holePointed(sc-w/2,sc+w/2,ya,yz,7);
  for(let i=0;i<outline.length;i++){ const a=outline[i], c=outline[(i+1)%outline.length]; const m=segMap(f,ang,a,c); const holes=[], big=[];
    if(i===0){ for(const x of [-2.6,1.6,5.8]) holes.push(lancet(xW-x,1.1,y0+3.1,y0+7.1)); big.push(holes.length); holes.push(lancet(xW-(xc+3.8),1.45,y0+2.7,y0+7.7)); }
    else if(i>=1&&i<=3){ big.push(0); holes.push(lancet(m.L/2,1.35,y0+2.7,y0+7.5)); }
    else if(i===4){ for(const x of [-2.6,1.6,5.8]) holes.push(lancet(x-vA[0],1.1,y0+3.1,y0+7.1)); }
    const outl=i===5?[[0,yb],[m.L,yb],[m.L,e],[m.L/2,rt],[0,e]]:[[0,yb],[m.L,yb],[m.L,e],[0,e]];
    const pass=i===5?[holeRect(r-1.75,r+1.75,y0-0.02,y0+3.9)]:[];
    facadeSeg(G,m,outl,holes.concat(pass),WALL);
    holes.forEach((h,j)=>{ const wv=h[1][0]-h[0][0]; let yt=-1e9; for(const p of h) yt=Math.max(yt,p[1]); const hv=yt-h[0][1];
      reveal(G,m,h,0,0.55,WALL); surround(H.stone,m,h,0.13,0.05,STONEF); pane(H.leaded,m,h,0.55,WHITE,[0,0,wv/1.2,hv/2.4]);
      if(big.includes(j)){ const sc=(h[0][0]+h[1][0])/2, ysp=yt-wv*0.866; bar(H.stone,m,sc,h[0][1],sc,ysp+0.25,0.12,0.44,0.1,STONEF); bar(H.stone,m,h[0][0],h[0][1]+hv*0.58,h[1][0],h[0][1]+hv*0.58,0.08,0.46,0.08,STONEF); } });
  }
  // plinth
  for(let i=0;i<outline.length;i++){ const a=outline[i], c=outline[(i+1)%outline.length]; const dx=c[0]-a[0], dz=c[1]-a[1], l=Math.hypot(dx,dz); const nx=-dz/l, nz=dx/l; segWall(Pl,f,ang,a[0]+nx*0.05,a[1]+nz*0.05,c[0]+nx*0.05,c[1]+nz*0.05,yb,y0+0.95,STONE,1.5); }
  // eaves cornice
  for(let i=0;i<5;i++){ const a=outline[i], c=outline[i+1]; const dx=c[0]-a[0], dz=c[1]-a[1], l=Math.hypot(dx,dz); const nx=-dz/l, nz=dx/l; const m=[(a[0]+c[0])/2+nx*0.1,(a[1]+c[1])/2+nz*0.1]; const fr=frameFacing(f,ang,m[0],m[1],nx,nz); Tr.box(fr.T,-l/2-0.1,l/2+0.1,e-0.4,e,-0.12,0.12,TRIM,1,0x3f^8); }
  // ---- roof (gable at west, polygonal hip over the apse) ----
  { const ov=0.6, R2=r+ov, e1=e-ov*tanP, sinP=Math.sin(pitch*Math.PI/180); const xw=xW+0.45; const TH=0.16;
    const plane=(pts,eA,eB,upN)=>{ const dir=[eB[0]-eA[0],eB[2]-eA[2]]; const dl=Math.hypot(dir[0],dir[1])||1; dir[0]/=dl; dir[1]/=dl;
      const uv=pts.map(p=>[((p[0]-eA[0])*dir[0]+(p[2]-eA[2])*dir[1])/1.25,(p[1]-e1)/sinP/1.25]);
      const P=pts.map(p=>f(p[0],p[1],p[2])), Q=pts.map(p=>f(p[0],p[1]-TH,p[2])); const N=worldN(ang,upN); const nU=[N[0],1,N[2]], nD=[-N[0],-1,-N[2]];
      if(P.length===3){ Rf.tri(P[0],P[1],P[2],uv[0],uv[1],uv[2],ROOF,nU); So.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],SOF,nD); } else { Rf.quad(P[0],P[1],P[2],P[3],uv[0],uv[1],uv[2],uv[3],ROOF,nU); So.quad(Q[0],Q[1],Q[2],Q[3],[0,0],[1,0],[1,1],[0,1],SOF,nD); } };
    const xs=xc-R2*s8, ap=[xc,rt,0];
    const sS=[xw,e1,-R2], sE=[xs,e1,-R2], nS=[xs,e1,R2], nW2=[xw,e1,R2], fC=[xc-R2,e1,-R2*s8], fB=[xc-R2,e1,R2*s8];
    plane([sS,sE,ap,[xw,rt,0]],sS,sE,[0,-1]); plane([nS,nW2,[xw,rt,0],ap],nS,nW2,[0,1]);
    plane([sE,fC,ap],sE,fC,[-0.707,-0.707]); plane([fC,fB,ap],fC,fB,[-1,0]); plane([fB,nS,ap],fB,nS,[-0.707,0.707]);
    const edge=[sS,sE,fC,fB,nS,nW2]; for(let i=0;i<edge.length-1;i++){ const a=edge[i], c=edge[i+1]; const A=f(...a), B=f(...c), C=f(a[0],a[1]-TH,a[2]), D=f(c[0],c[1]-TH,c[2]); const ddx=c[0]-a[0], ddz=c[2]-a[2]; So.quad(C,D,B,A,[0,0],[1,0],[1,1],[0,1],SOF,worldN(ang,[-ddz,ddx])); }
    for(const sd of [-1,1]){ const A=f(xw,e1,sd*R2), B=f(xw,rt,0), C=f(xw,e1-TH,sd*R2), D=f(xw,rt-TH,0); So.quad(C,D,B,A,[0,0],[1,0],[1,1],[0,1],SOF,worldN(ang,[1,0])); }
    // ridge cap
    Mt.box(f,xc,xw,rt-0.05,rt+0.12,-0.12,0.12,lin('#7a3a24'));
  }
  // ---- ridge turret (dark slate, louvered) above the presbytery ----
  { const tx=xc+1.9; const tt=frame(...(()=>{ const p=f(tx,0,0); return [p[0],p[2]]; })(),ang); const hw=0.68; const SL=lin('#3f4448');
    Mt.box(tt,-hw,hw,rt-1.1,rt+1.55,-hw,hw,SL,1,0x3f^8); for(let k=0;k<4;k++){ const si=sideInfo(k,hw,hw); decal(Wn,tt,ang,si,0,rt+0.15,'louver',0.02,0.5); }
    Mt.box(tt,-hw-0.1,hw+0.1,rt+1.55,rt+1.68,-hw-0.1,hw+0.1,SL);
    lathe(Mt,tt,[[(hw+0.1)*Math.SQRT2,rt+1.68],[0.55,rt+2.6],[0.18,rt+4.2],[0.03,rt+5.3],[0,rt+5.4]],4,SL,Math.PI/4);
    Mt.box(tt,-0.035,0.035,rt+5.3,rt+6.2,-0.035,0.035,lin('#2e3236')); Mt.box(tt,-0.035,0.035,rt+5.85,rt+5.92,-0.28,0.28,lin('#2e3236')); Mt.box(tt,-0.3,0.3,rt+5.6,rt+5.66,-0.035,0.035,lin('#2e3236')); }
  // ---- buttresses ----
  const buttress=(x,z,nx,nz,skip)=>{ if(skip) return; const fr=frameFacing(f,ang,x,z,nx,nz); const Tb=fr.T;
    St.box(Tb,-0.5,0.5,yb,y0+1.5,0,1.3,STONE,0.5,0x3f^8); G.box(Tb,-0.5,0.5,y0+1.5,y0+3.4,0,1.3,WALL,0.4,0x3f^8^4); slopeCap(Mt,Tb,-0.52,0.52,1.32,1.0,y0+3.4,y0+3.95,CAP);
    G.box(Tb,-0.45,0.45,y0+3.4,y0+6.6,0,1.0,WALL,0.4,0x3f^8^4); slopeCap(Mt,Tb,-0.47,0.47,1.02,0.65,y0+6.6,y0+7.15,CAP);
    G.box(Tb,-0.4,0.4,y0+6.6,y0+9.0,0,0.65,WALL,0.4,0x3f^8^4); slopeCap(Mt,Tb,-0.42,0.42,0.67,0.02,y0+9.0,y0+9.9,CAP);
    for(let yy=y0+1.5;yy<y0+8.8;yy+=0.62){ const dd=yy<y0+3.4?1.3:yy<y0+6.6?1.0:0.65; const hw=yy<y0+3.4?0.5:yy<y0+6.6?0.45:0.4; const alt=Math.round((yy-y0)/0.62)%2; for(const sx of [-1,1]) St.box(Tb,sx>0?hw-(alt?0.38:0.22):-hw,sx>0?hw+0.015:-hw+(alt?0.38:0.22),yy,yy+0.28,dd-0.02,dd+0.015,lin('#cfc9bb'),0.5,0x3f^8); } };
  buttress(xc+1.4,-r,0,-1); buttress(xc+6.2,-r,0,-1); buttress(xc+6.2,r,0,1);
  const bcol=(x,z,nx,nz)=>{ const fr=frameFacing(f,ang,x,z,nx,nz); const p=fr.T(0,0,0.65); addCollider(p[0],p[2],fr.a,1.0,1.3,y0-4,y0+10); };
  bcol(xc+1.4,-r,0,-1); bcol(xc+6.2,-r,0,-1); bcol(xc+6.2,r,0,1);
  const bis=(v)=>{ const dx=v[0]-xc, dz=v[1]; const l=Math.hypot(dx,dz); return [dx/l,dz/l]; };
  for(const v of [vA,vB,vC,vD]){ const n=bis(v); buttress(v[0],v[1],n[0],n[1]); bcol(v[0],v[1],n[0],n[1]); }
  for(const sz of [-1,1]){ buttress(xW,sz*r,0.707,0.707*sz); bcol(xW,sz*r,0.707,0.707*sz); }
  { const Hd=cs.get('hedge',cx,cz); const HC=colJ(lin('#4a7a3a'),0.06); for(const [x0,x1] of [[-1.4,8.6],[xc+2.25,xc+5.35]]){ Hd.box(f,x0,x1,y0-0.9,y0+rnd(1.5,1.8),-r-1.15,-r-0.12,HC,0.8,0x3f^8); localCollider(f,ang,x0,x1,-r-1.15,-r-0.12,y0-3,y0+2); }
    for(const [x,z] of [[xW-0.4,-r-0.14],[xc+7.3,-r-0.14],[xW-0.4,r+0.14]]) Mt.box(f,x-0.055,x+0.055,y0-0.6,e-0.25,z-0.055,z+0.055,lin('#5d6166')); }
  // niche with statue on the west front, south of the tower
  segDecal(Wn,f,ang,xW,r,xW,-r,r+4.55,y0+1.3,'niche',0.05);
  // ---- sacristy (north) ----
  { const sx0=xc-1.5, sx1=xc+5.6, sz0=r-0.1, sz1=r+2.9; const e2=y0+4.3; const cxs=(sx0+sx1)/2, czs=(sz0+sz1)/2; const pp=f(cxs,0,czs); const sf=frame(pp[0],pp[2],ang); const sL=(sx1-sx0)/2, sW=(sz1-sz0)/2;
    emitWalls(cs,sf,ang,sL,sW,yb,e2,'shed',16,WALL,'wall'); emitPlinth(cs,sf,ang,sL,sW,yb,y0+0.7,STONE); emitRoof(cs,sf,ang,sL,sW,e2,'shed',16,0.4,0.3,ROOF,SOF,'roofB');
    const si=sideInfo(2,sL,sW); decal(Wn,sf,ang,si,-1.8,y0+1.3,'old4'); decal(Wn,sf,ang,si,1.6,y0+1.3,'old4'); decal(Wn,sf,ang,sideInfo(1,sL,sW),0,y0-0.02,'door_wood');
    localCollider(f,ang,sx0,sx1,sz0,sz1,y0-3,y0+8); }
  // ---- tower ----
  const tf=frame(...(()=>{ const p=f(xT0+3.6,0,0); return [p[0],p[2]]; })(),ang); const tH=y0+26.0; const hx0=-3.6+TT, hx1=3.6-TT; // tower-local x: -3.6 (east) .. 3.6 (west)
  { // outer walls; west face (local +x) has the portal opening |z|<0.85, h 3.7
    const Wo=G; const pw=0.85, ph=y0+3.7;
    const tw=[segMap(tf,ang,[3.6,3.6],[3.6,-3.6]),segMap(tf,ang,[3.6,-3.6],[-3.6,-3.6]),segMap(tf,ang,[-3.6,3.6],[3.6,3.6]),segMap(tf,ang,[-3.6,-3.6],[-3.6,3.6])]; // west, south, north, east
    const portal=holePointed(2.75,4.45,y0,y0+3.7,7); const sq=(y)=>holeRect(3.32,3.88,y,y+0.56);
    tw.forEach((m,k)=>{ const holes=[holeArch(2.93,3.43,y0+19.6,y0+21.6,8),holeArch(3.77,4.27,y0+19.6,y0+21.6,8)]; if(k===0) holes.push(portal,sq(y0+9.8),sq(y0+15.2)); else if(k<3) holes.push(sq(y0+15.2));
      facadeSeg(Wo,m,[[0,yb],[7.2,yb],[7.2,tH],[0,tH]],holes,WALL);
      for(let j=0;j<2;j++){ const h=holes[j]; reveal(Wo,m,h,0,0.5,WALL); pane(Tr,m,h,0.5,lin('#1b1917')); for(let y=h[0][1]+0.22;y<h[0][1]+1.6;y+=0.26) Tr.box(m.T,h[0][0]+0.03,h[1][0]-0.03,y,y+0.07,-0.42,-0.3,lin('#5b4a3c')); }
      Tr.box(m.T,2.76,4.44,y0+19.44,y0+19.6,-0.02,0.07,TRIM); Tr.box(m.T,2.76,4.44,y0+21.6,y0+21.78,-0.02,0.07,TRIM); Tr.box(m.T,2.76,2.93,y0+19.6,y0+21.6,-0.02,0.07,TRIM); Tr.box(m.T,4.27,4.44,y0+19.6,y0+21.6,-0.02,0.07,TRIM);
      for(let j=2;j<holes.length;j++){ const h=holes[j]; if(h===portal) continue; rectWindow(H,m,h,{wc:WALL,rc:WALL,fc:lin('#ecebe5'),cols:1,dep:0.45,gv:'plain',surround:{w:0.1,p:0.03,c:TRIM}}); }
      plinthSeg(Pl,m,yb,y0+1.2,k===0?[[2.62,4.58]]:[],STONE,0.06); });
    { const mW=tw[0]; reveal(H.stone,mW,portal,0,TT,lin('#d8d1c1')); surround(H.stone,mW,portal,0.17,0.1,lin('#e8e2d4')); surround(H.stone,mW,outsetPoly(portal,0.17),0.15,0.05,lin('#d2cbbb')); }
    // string courses
    for(const yy of [y0+7.5,y0+13.0,y0+18.5]) Tr.box(tf,-3.75,3.75,yy-0.3,yy,-3.75,3.75,TRIM,1,0x3f);
    // top cornice interrupted by raised arches over the clocks
    const yc=y0+25.9; for(let s=0;s<4;s++){ const si=sideInfo(s,3.6,3.6); const fr=frameFacing(tf,ang,si.n[0]*3.6,si.n[1]*3.6,si.n[0],si.n[1]);
      for(const [t0,t1] of [[-3.95,-1.25],[1.25,3.95]]) Tr.box(fr.T,t0,t1,yc,yc+0.55,-0.02,0.38,TRIM,1,0x3f);
      // tympanum + arched cornice
      const Rr=1.25; const pts=[]; for(let k=0;k<=10;k++){ const a=Math.PI*k/10; pts.push([Math.cos(a)*Rr,Math.sin(a)*Rr]); }
      for(let k=0;k<10;k++){ const [x0,y1]=pts[k], [x1,y2]=pts[k+1]; G.tri(fr.T(0,yc+0.3,0.01),fr.T(x0,yc+0.3+y1,0.01),fr.T(x1,yc+0.3+y2,0.01),[0,0],[1,0],[0,1],WALL,[fr.T(0,0,1)[0]-fr.T(0,0,0)[0],0,fr.T(0,0,1)[2]-fr.T(0,0,0)[2]]);
        const m=(k+0.5)/10*Math.PI; const bx=Math.cos(m)*(Rr+0.12), by=Math.sin(m)*(Rr+0.12); const bf=frame(fr.T(bx,0,0.18)[0],fr.T(bx,0,0.18)[2],fr.a,0); Tr.box(bf,-0.22,0.22,yc+0.3+by-0.16,yc+0.3+by+0.16,-0.2,0.2,TRIM,1,0x3f); }
      decal(Wn,tf,ang,si,0,yc-0.55,'clock',0.06,0.95);
    }
    // portal surround + steps + open door leaves
    St.box(tf,3.6,5.2,y0-0.55,y0-0.02,-1.7,1.7,lin('#b5ae9f'),0.5); St.box(tf,5.2,6.0,y0-0.85,y0-0.3,-1.7,1.7,lin('#b5ae9f'),0.5);
    for(const sz of [-1,1]){ const hx=3.6-TT+0.05, hz=sz*0.86; const phi=Math.atan2(sz,-0.02); const p=tf(hx,0,hz); const lf=frame(p[0],p[2],ang+phi,0); Wd.box(lf,0,0.8,y0,y0+3.2,-0.05,0.05,lin('#5a3822'),0.6); }
    Cl.box(tf,-3.55,3.6,y0+0.004,y0+0.014,-0.55,0.55,lin('#8e1c22'),0.8); Cl.box(tf,3.6,5.15,y0-0.275,y0-0.265,-0.55,0.55,lin('#8e1c22'),0.8);
    for(const sz of [-1,1]){ const q=tf(3.72,0,sz*1.35); const lf=frame(q[0],q[2],ang,0); Mt.box(lf,-0.06,0.06,y0+2.35,y0+2.75,-0.06,0.06,lin('#2a2a2a')); Gl.box(lf,-0.045,0.045,y0+2.4,y0+2.7,-0.045,0.045,lin('#ffd98a')); }
    { const q=tf(0.2,0,0); const lf=frame(q[0],q[2],ang,0); Gl.box(lf,-0.3,0.3,y0+4.85,y0+4.9,-0.3,0.3,lin('#fff1c8')); }
    { const q=tf(4.8,0,0), q2=tf(14,0,0); LANDMARKS.churchDoor={x:q[0],z:q[2],ox:q2[0],oz:q2[2]}; }
    addFloor(tf,ang,3.6,5.2,-1.7,1.7,y0-0.28); addFloor(tf,ang,5.2,6.0,-1.7,1.7,y0-0.58);
    // flag on a diagonal pole next to the portal
    { const d=[0.72,-0.69]; const base=[3.62,-1.5], yp=y0+4.35; const plen=1.35; const Dw=worldN(ang,d); const pa0=Math.atan2(Dw[2],Dw[0]);
      const b0=tf(base[0],0,base[1]); Mt.box(frame(b0[0],b0[2],pa0,0),0,plen,yp-0.03,yp+0.03,-0.03,0.03,lin('#d8d8d4'));
      const mid=tf(base[0]+d[0]*plen*0.55,0,base[1]+d[1]*plen*0.55); const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.62,1.25),new THREE.MeshStandardMaterial({map:flagTex(),side:THREE.DoubleSide,roughness:0.9}));
      fl.position.set(mid[0],yp-0.66,mid[2]); fl.rotation.y=Math.atan2(-Dw[2],Dw[0]); fl.castShadow=true; scene.add(fl); }
    // helmet
    const yh=yc+0.55; const cr=3.6*Math.SQRT2+0.35;
    lathe(Mt,tf,[[cr,yh],[cr*0.8,yh+0.4],[cr*0.64,yh+1.0],[cr*0.58,yh+1.4]],4,METAL,Math.PI/4);
    lathe(Mt,tf,[[3.05,yh+1.35],[3.35,yh+2.1],[3.3,yh+2.9],[2.8,yh+3.7],[1.6,yh+4.4],[0.95,yh+4.8],[0.85,yh+5.0]],8,METAL,Math.PI/8);
    for(let k=0;k<8;k++){ const a=Math.PI/8+k/8*TAU; const p=tf(Math.cos(a)*0.85,0,Math.sin(a)*0.85); Mt.box(frame(p[0],p[2],ang-a,0),-0.08,0.08,yh+5.0,yh+6.8,-0.1,0.1,METAL); }
    lathe(Tr,tf,[[0.62,yh+5.0],[0.62,yh+6.8]],8,lin('#1f2326')); lathe(Mt,tf,[[1.08,yh+6.8],[1.15,yh+6.95],[0.3,yh+7.0]],8,METAL);
    lathe(Mt,tf,[[1.05,yh+7.0],[1.3,yh+7.6],[1.05,yh+8.3],[0.4,yh+8.9],[0.16,yh+9.6],[0.06,yh+10.9],[0,yh+11.1]],8,METAL,Math.PI/8);
    const gC=lin('#c9a55a'); lathe(Gd,tf,[[0,yh+10.5],[0.22,yh+10.65],[0.22,yh+10.85],[0,yh+11.0]],10,gC); Gd.box(tf,-0.055,0.055,yh+10.9,yh+12.7,-0.055,0.055,gC); Gd.box(tf,-0.055,0.055,yh+11.9,yh+12.06,-0.5,0.5,gC);
    // tower hall interior
    const hy=y0+5.0; const IN=lin('#d9c7a2');
    segWall(G,tf,ang,hx0,2.6,hx0,1.75,y0,hy,IN); segWall(G,tf,ang,hx0,-1.75,hx0,-2.6,y0,hy,IN); segWall(G,tf,ang,hx0,1.75,hx0,-1.75,y0+3.9,hy,IN);
    { const mI=segMap(tf,ang,[hx1,-2.6],[hx1,2.6]); facadeSeg(G,mI,[[0,y0-0.02],[5.2,y0-0.02],[5.2,hy],[0,hy]],[holePointed(1.75,3.45,y0,y0+3.7,7)],IN); }
    segWall(G,tf,ang,hx1,2.6,hx0,2.6,y0,hy,IN); segWall(G,tf,ang,hx0,-2.6,hx1,-2.6,y0,hy,IN);
    { const A=tf(hx0,hy,-2.6), B=tf(hx1,hy,-2.6), C=tf(hx1,hy,2.6), D=tf(hx0,hy,2.6); G.quad(A,B,C,D,[0,0],[1,0],[1,1],[0,1],IN,[0,-1,0]); }
    { const A=tf(hx0,y0+0.005,-2.6), B=tf(hx1,y0+0.005,-2.6), C=tf(hx1,y0+0.005,2.6), D=tf(hx0,y0+0.005,2.6); G.quad(A,B,C,D,[0,0],[2,0],[2,2],[0,2],lin('#cdb58f'),[0,1,0]); }
    addFloor(tf,ang,hx0-0.1,hx1+TT+0.1,-2.6,2.6,y0);
  }
  // ---- colliders (walls, openings kept free) ----
  { const Y0=y0-4, Y1=y0+40;
    segCollider(f,ang,xW,-r,vD[0],vD[1],T,Y0,Y1); segCollider(f,ang,vA[0],vA[1],xW,r,T,Y0,Y1);
    segCollider(f,ang,vD[0],vD[1],vC[0],vC[1],T,Y0,Y1); segCollider(f,ang,vC[0],vC[1],vB[0],vB[1],T,Y0,Y1); segCollider(f,ang,vB[0],vB[1],vA[0],vA[1],T,Y0,Y1);
    // west wall of the body beside the tower
    segCollider(f,ang,xW,r,xW,3.6,T+0.3,Y0,Y1); segCollider(f,ang,xW,-3.6,xW,-r,T+0.3,Y0,Y1);
    // tower: north/south walls, west wall beside portal, partition with passage (|z|<1.1)
    const tx=(x)=>xT0+3.6+x; // tower-local x -> body-local x
    localCollider(f,ang,xT0,xT1,3.6-TT,3.6,Y0,Y1); localCollider(f,ang,xT0,xT1,-3.6,-3.6+TT,Y0,Y1);
    localCollider(f,ang,xT1-TT,xT1,-3.6,-0.85,Y0,Y1); localCollider(f,ang,xT1-TT,xT1,0.85,3.6,Y0,Y1);
    localCollider(f,ang,xW-T-0.3,xT0+TT,-3.6,-1.75,Y0,Y1); localCollider(f,ang,xW-T-0.3,xT0+TT,1.75,3.6,Y0,Y1);
    // buttresses as solid blocks (approx)
  }
  // ---- interior ----
  const ys=y0+6.0, R=1.35*ri, d=0.35*ri, pa=Math.acos(d/R), apexY=ys+R*Math.sin(pa); const xin1=xW-T-0.3; // inner face of the west wall
  const viA=[xc-ri*s8,ri], viB=[xc-ri,ri*s8], viC=[xc-ri,-ri*s8], viD=[xc-ri*s8,-ri];
  // inner walls (facing inward -> traverse reversed)
  const inner=[[xin1,ri],viA,viB,viC,viD,[xin1,-ri]];
  for(let i=0;i<inner.length-1;i++){ const a=inner[i], c=inner[i+1]; segWall(G,f,ang,a[0],a[1],c[0],c[1],y0,ys,INNER); }
  // west inner wall with passage |z|<1.1 (h 3.4) and loft above
  segWall(G,f,ang,xin1,-ri,xin1,-1.75,y0,ys,INNER); segWall(G,f,ang,xin1,1.75,xin1,ri,y0,ys,INNER); segWall(G,f,ang,xin1,-1.75,xin1,1.75,y0+3.9,ys,INNER);
  // passage reveals
  segWall(G,f,ang,xT0+TT,1.75,xin1,1.75,y0,y0+3.9,lin('#d9c7a2')); segWall(G,f,ang,xin1,-1.75,xT0+TT,-1.75,y0,y0+3.9,lin('#d9c7a2'));
  { const A=f(xin1,y0+3.9,-1.75), B=f(xT0+TT,y0+3.9,-1.75), C=f(xT0+TT,y0+3.9,1.75), D=f(xin1,y0+3.9,1.75); G.quad(A,B,C,D,[0,0],[1,0],[1,1],[0,1],lin('#d9c7a2'),[0,-1,0]); }
  // interior west tympanum above springing
  { const N=12; const sec=[]; for(let k=0;k<=N;k++){ const p=pa*k/N; sec.push([d-R*Math.cos(p), ys+R*Math.sin(p)]); } // z<=0 side
    for(let k=0;k<N;k++){ for(const sd of [-1,1]){ const [z0,y1]=sec[k], [z1,y2]=sec[k+1]; G.tri(f(xin1,ys,0),f(xin1,y1,sd*z0),f(xin1,y2,sd*z1),[0,0],[1,0],[0,1],INNER,worldN(ang,[-1,0])); } } }
  // floor
  { const pts=[[xin1,-ri],[xin1,ri],viA,viB,viC,viD]; const yF=y0+0.005; for(let i=1;i<pts.length-1;i++){ G.tri(f(pts[0][0],yF,pts[0][1]),f(pts[i][0],yF,pts[i][1]),f(pts[i+1][0],yF,pts[i+1][1]),[pts[0][0]/1.6,pts[0][1]/1.6],[pts[i][0]/1.6,pts[i][1]/1.6],[pts[i+1][0]/1.6,pts[i+1][1]/1.6],lin('#cdb58f'),[0,1,0]); }
    St.box(f,xin1+0.05,xT0+TT,y0-0.05,y0+0.005,-1.1,1.1,lin('#e2dacb'),0.5,4); }
  addFloor(f,ang,xc-ri,xin1+0.2,-ri,ri,y0); addFloor(f,ang,xin1-0.1,xT0+TT+0.15,-1.1,1.1,y0);
  // pointed barrel vault over nave + presbytery, with transverse ribs
  { const N=10; const sec=[]; for(let k=0;k<=N;k++){ const p=pa*k/N; sec.push([d-R*Math.cos(p), ys+R*Math.sin(p)]); }
    const inw=(z,y,sd)=>{ const nz=sd*(d-z), ny=ys-y; const l=Math.hypot(nz,ny)||1; return [nz/l,ny/l]; }; // local inward (z,y) for section point
    const hint=(z,y,sd,hx=0)=>{ const [nz,ny]=inw(z,y,sd); const H=worldN(ang,[hx,nz]); return [H[0],ny,H[2]]; };
    const x0=xc, x1=xin1;
    for(const sd of [-1,1]) for(let k=0;k<N;k++){ const [za,ya]=sec[k], [zb,yb2]=sec[k+1]; const zm=(za+zb)/2, ym=(ya+yb2)/2;
      G.quad(f(x0,ya,sd*za),f(x1,ya,sd*za),f(x1,yb2,sd*zb),f(x0,yb2,sd*zb),[0,0],[1,0],[1,1],[0,1],INNER,hint(zm,ym,sd)); }
    const off=(z,y,sd,o)=>{ const [nz,ny]=inw(z,y,sd); return [sd*z+nz*o, y+ny*o]; };
    for(const xr of [xin1-0.15,4.6,0.4,-3.8,-7.6,xc+0.15]){ for(const sd of [-1,1]) for(let k=0;k<N;k++){ const [za,ya]=sec[k], [zb,yb2]=sec[k+1]; const pA=off(za,ya,sd,0.12), pB=off(zb,yb2,sd,0.12);
        Tr.quad(f(xr-0.14,pA[1],pA[0]),f(xr+0.14,pA[1],pA[0]),f(xr+0.14,pB[1],pB[0]),f(xr-0.14,pB[1],pB[0]),[0,0],[1,0],[1,1],[0,1],RIB,hint((za+zb)/2,(ya+yb2)/2,sd));
        for(const xe of [xr-0.14,xr+0.14]){ const qA=off(za,ya,sd,0.0), qB=off(zb,yb2,sd,0.0); Tr.quad(f(xe,qA[1],qA[0]),f(xe,pA[1],pA[0]),f(xe,pB[1],pB[0]),f(xe,qB[1],qB[0]),[0,0],[1,0],[1,1],[0,1],RIB,worldN(ang,[xe<xr?-1:1,0])); } } }
    // apse vault: ribs from polygon vertices to the apex
    const ribs=[[xc,-ri],viD,viC,viB,viA,[xc,ri]];
    const ribPts=ribs.map(v=>sec.map(([z,y])=>{ const rho=(-z)/ri; return [xc+(v[0]-xc)*rho, y, (v[1])*rho, z]; }));
    for(let i=0;i<ribPts.length-1;i++){ const A=ribPts[i], B=ribPts[i+1]; for(let k=0;k<N;k++){ const p=[A[k],B[k],B[k+1],A[k+1]].map(q=>f(q[0],q[1],q[2]));
        const mx=(A[k][0]+B[k][0])/2-xc, mz=(A[k][2]+B[k][2])/2; const ml=Math.hypot(mx,mz)||1; const zs=A[k][3]; const [nzr,ny]=[d-zs,ys-A[k][1]]; const Hw=worldN(ang,[-mx/ml*nzr,-mz/ml*nzr]);
        G.quad(p[0],p[1],p[2],p[3],[0,0],[1,0],[1,1],[0,1],INNER,[Hw[0],ny-0.05,Hw[2]]); }
      if(i>0){ for(let k=0;k<N;k++){ const a=A[k], c=A[k+1]; const rx=a[0]-xc, rz=a[2]; const rl=Math.hypot(rx,rz)||1; const px=-rz/rl*0.13, pz=rx/rl*0.13; const ix=-rx/rl*0.08, iz=-rz/rl*0.08;
          const rx2=c[0]-xc, rz2=c[2]; const rl2=Math.hypot(rx2,rz2)||1; const px2=-rz2/rl2*0.13, pz2=rx2/rl2*0.13; const ix2=-rx2/rl2*0.08, iz2=-rz2/rl2*0.08;
          const Hw=worldN(ang,[-rx/rl,-rz/rl]); Tr.quad(f(a[0]-px+ix,a[1]-0.08,a[2]-pz+iz),f(a[0]+px+ix,a[1]-0.08,a[2]+pz+iz),f(c[0]+px2+ix2,c[1]-0.08,c[2]+pz2+iz2),f(c[0]-px2+ix2,c[1]-0.08,c[2]-pz2+iz2),[0,0],[1,0],[1,1],[0,1],RIB,[Hw[0],-0.6,Hw[2]]); } } }
  }
  // stained glass (inside)
  { const sq=(x,zside,yb2,w,h)=>{ const z=zside*(ri-0.04); const N=worldN(ang,[0,-zside]); const A=f(x-w/2,yb2,z), B=f(x+w/2,yb2,z), C=f(x+w/2,yb2+h,z), D=f(x-w/2,yb2+h,z); Sg.quad(A,B,C,D,[0,0],[1,0],[1,1],[0,1],WHITE,N); };
    for(const x of [-2.6,1.6,5.8]){ sq(x,-1,y0+3.2,0.95,2.95); sq(x,1,y0+3.2,0.95,2.95); } sq(xc+3.8,-1,y0+2.9,1.25,3.2);
    for(const [a,c] of [[viA,viB],[viB,viC],[viC,viD]]){ const mx=(a[0]+c[0])/2, mz=(a[1]+c[1])/2; const dx=c[0]-a[0], dz=c[1]-a[1], l=Math.hypot(dx,dz); const rx=dx/l, rz=dz/l; const nx=-rz, nz=rx; const w=1.15, h=3.2; const px=mx+nx*0.04, pz=mz+nz*0.04;
      Sg.quad(f(px-rx*w/2,y0+2.8,pz-rz*w/2),f(px+rx*w/2,y0+2.8,pz+rz*w/2),f(px+rx*w/2,y0+2.8+h,pz+rz*w/2),f(px-rx*w/2,y0+2.8+h,pz-rz*w/2),[0,0],[1,0],[1,1],[0,1],WHITE,worldN(ang,[nx,nz])); } }
  // choir loft (west gallery)
  { const lx0=4.8, ly=y0+4.3; G.box(f,lx0,xin1,ly,ly+0.35,-ri,ri,INNER,0.5); G.box(f,lx0-0.05,lx0+0.2,ly+0.35,ly+1.35,-ri,ri,INNER,0.5); Gd.box(f,lx0-0.08,lx0+0.02,ly+1.1,ly+1.18,-ri,ri,lin('#c9a55a'));
    for(const z of [-2.3,2.3]){ lathe(G,frame(...(()=>{ const p=f(lx0+0.3,0,z); return [p[0],p[2]]; })(),ang,0),[[0.34,y0],[0.3,y0+0.4],[0.26,y0+0.5],[0.26,ly-0.3],[0.34,ly]],10,INNER); localCollider(f,ang,lx0+0.02,lx0+0.58,z-0.28,z+0.28,y0-1,ly); }
    for(let k=0;k<3;k++) Cl.box(f,lx0+0.9+k*0.95,lx0+1.3+k*0.95,ly+0.35,ly+0.8,-3.8,3.8,lin('#9a2b2b')); }
  // pews
  { const wood=lin('#9a6a43'), red=lin('#a3262c'); const px0=3.4, px1=xc+7.2; const rows=[]; for(let x=px0;x>px1;x-=0.95) rows.push(x);
    for(const zs of [-1,1]){ const z0=zs*0.85, z1=zs*4.2; const zA=Math.min(z0,z1), zB=Math.max(z0,z1);
      for(const x of rows){ Wd.box(f,x-0.2,x+0.22,y0+0.42,y0+0.47,zA,zB,wood,0.6); Wd.box(f,x+0.18,x+0.24,y0+0.47,y0+0.98,zA,zB,wood,0.6); Wd.box(f,x-0.52,x-0.4,y0+0.12,y0+0.2,zA,zB,wood,0.6); Cl.box(f,x-0.19,x+0.17,y0+0.47,y0+0.52,zA+0.05,zB-0.05,red);
        for(const zz of [zA,zB-0.06]) Wd.box(f,x-0.55,x+0.26,y0,y0+1.02,zz,zz+0.06,wood,0.6); }
      localCollider(f,ang,rows[rows.length-1]-0.58,rows[0]+0.28,zA,zB,y0-1,y0+1.1); }
    Cl.box(f,xc+6.8,xin1-0.1,y0+0.005,y0+0.025,-0.62,0.62,lin('#8c1f24')); }
  // sanctuary: platform, altar, retable, statues, candles
  { const sx=xc+5.4, py=y0+0.3; const pts=[[sx,-ri],[sx,ri],viA,viB,viC,viD]; for(let i=1;i<pts.length-1;i++) St.tri(f(pts[0][0],py,pts[0][1]),f(pts[i][0],py,pts[i][1]),f(pts[i+1][0],py,pts[i+1][1]),[0,0],[2,0],[2,2],lin('#e9e2d4'),[0,1,0]);
    St.box(f,sx-0.02,sx+0.02,y0,py,-ri,ri,lin('#d9d1c2'),0.5,1|2); addFloor(f,ang,xc-ri,sx,-ri,ri,py);
    const ax=xc+2.4; St.box(f,ax-0.5,ax+0.5,py,py+1.0,-1.2,1.2,lin('#efebe3'),0.5); Cl.box(f,ax-0.55,ax+0.55,py+1.0,py+1.04,-1.3,1.3,lin('#f7f6f2')); Cl.box(f,ax+0.5,ax+0.53,py+0.55,py+1.0,-1.3,1.3,lin('#f7f6f2')); localCollider(f,ang,ax-0.55,ax+0.55,-1.3,1.3,y0-1,py+1.1);
    for(const z of [-0.9,0.9]){ lathe(Gd,frame(...(()=>{ const p=f(ax,0,z); return [p[0],p[2]]; })(),ang,0),[[0.08,py+1.04],[0.03,py+1.1],[0.03,py+1.35],[0.06,py+1.38]],6,lin('#c9a55a')); Gl.box(f,ax-0.02,ax+0.02,py+1.38,py+1.55,z-0.02,z+0.02,lin('#fff2cf')); }
    const rx=xc-ri+0.2; St.box(f,rx,rx+0.8,py,py+1.2,-1.7,1.7,lin('#f0ece2'),0.5); G.box(f,rx,rx+0.4,py+1.2,py+6.0,-1.55,1.55,lin('#f5f2ea'),0.5); Gd.box(f,rx+0.38,rx+0.45,py+1.2,py+6.0,-1.6,-1.45,lin('#c9a55a')); Gd.box(f,rx+0.38,rx+0.45,py+1.2,py+6.0,1.45,1.6,lin('#c9a55a'));
    for(const z of [-1.1,1.1]) lathe(Gd,frame(...(()=>{ const p=f(rx+0.55,0,z); return [p[0],p[2]]; })(),ang,0),[[0.16,py+1.2],[0.13,py+1.5],[0.13,py+5.4],[0.2,py+5.6]],10,lin('#c9a55a'));
    Gd.box(f,rx+0.38,rx+0.5,py+5.6,py+6.1,-1.6,1.6,lin('#c9a55a')); Tr.box(f,rx+0.4,rx+0.44,py+2.2,py+4.6,-0.65,0.65,lin('#46607e'));
    const sf2=frame(...(()=>{ const p=f(rx+0.75,0,0); return [p[0],p[2]]; })(),ang,0); lathe(G,sf2,[[0.34,py+2.25],[0.36,py+2.9],[0.28,py+3.6],[0.2,py+3.95],[0.1,py+4.05]],12,lin('#f3f0e8')); lathe(Tr,sf2,[[0.3,py+2.6],[0.33,py+3.2],[0.26,py+3.6]],12,lin('#3a5c9a')); lathe(G,sf2,[[0,py+4.0],[0.11,py+4.05],[0.12,py+4.2],[0.08,py+4.32],[0,py+4.35]],10,lin('#f1e3cf')); lathe(Gd,sf2,[[0.13,py+4.36],[0.16,py+4.36],[0.16,py+4.46],[0.13,py+4.46]],12,lin('#e3c05a'));
    localCollider(f,ang,xc-ri,rx+0.85,-1.8,1.8,y0-1,py+6);
    for(const zs of [-1,1]){ const z=zs*(ri-0.2); const bx=xc+6.6; Tr.box(f,bx-0.25,bx+0.25,y0+2.0,y0+2.1,Math.min(z,z-0.2*zs),Math.max(z,z-0.2*zs),lin('#d9d2c2')); lathe(Gd,frame(...(()=>{ const p=f(bx,0,z-0.12*zs); return [p[0],p[2]]; })(),ang,0),[[0.16,y0+2.1],[0.18,y0+2.5],[0.13,y0+2.95],[0.09,y0+3.1],[0.1,y0+3.2],[0,y0+3.3]],10,lin('#c9a55a')); } }
  // chandeliers
  for(const x of [1.0,-4.6]){ const cf=frame(...(()=>{ const p=f(x,0,0); return [p[0],p[2]]; })(),ang,0); const cy=y0+7.1; Gd.box(cf,-0.02,0.02,cy+1.5,apexY,-0.02,0.02,lin('#b8954a'));
    lathe(Gd,cf,[[0,cy-0.5],[0.12,cy-0.35],[0.06,cy],[0.16,cy+0.25],[0.05,cy+0.9],[0.12,cy+1.2],[0.03,cy+1.5]],10,lin('#c9a55a'));
    for(let k=0;k<12;k++){ const a=k/12*TAU; const px=Math.cos(a)*0.95, pz=Math.sin(a)*0.95; Gd.box(cf,px*0.5-0.02,px*0.5+0.02,cy+0.02,cy+0.06,pz*0.5-0.02,pz*0.5+0.02,lin('#c9a55a')); Gd.box(frame(...(()=>{ const p=cf(px*0.5,0,pz*0.5); return [p[0],p[2]]; })(),ang+a,0),0,0.48,cy+0.02,cy+0.05,-0.015,0.015,lin('#c9a55a')); Gd.box(cf,px-0.05,px+0.05,cy+0.05,cy+0.1,pz-0.05,pz+0.05,lin('#c9a55a')); Gl.box(cf,px-0.018,px+0.018,cy+0.1,cy+0.3,pz-0.018,pz+0.018,lin('#fff4d6')); }
    for(let k=0;k<6;k++){ const a=k/6*TAU+0.3; const px=Math.cos(a)*0.5, pz=Math.sin(a)*0.5; Gl.box(cf,px-0.016,px+0.016,cy+0.55,cy+0.72,pz-0.016,pz+0.016,lin('#fff4d6')); } }
  // stations of the cross
  for(const zs of [-1,1]) for(const x of [-0.5,3.7,7.6,-4.7]){ const z=zs*(ri-0.03); Gd.box(f,x-0.3,x+0.3,y0+2.1,y0+2.85,z-0.03,z+0.03,lin('#b8954a')); const N=worldN(ang,[0,-zs]); const zz=z-zs*0.035; Tr.quad(f(x-0.24,y0+2.16,zz),f(x+0.24,y0+2.16,zz),f(x+0.24,y0+2.79,zz),f(x-0.24,y0+2.79,zz),[0,0],[1,0],[1,1],[0,1],lin('#3a3028'),N); }
  // holy water font
  for(const zs of [-1,1]){ const p=f(xin1-0.8,0,zs*1.6); const hf=frame(p[0],p[2],ang,0); lathe(St,hf,[[0.12,y0],[0.1,y0+0.8],[0.3,y0+0.95],[0.28,y0+1.05],[0,y0+1.0]],10,lin('#d6cfc0')); }
  const tp=f(xT1+9,0,0); LANDMARKS.church={x:tp[0],z:tp[2],look:[cx,cz]};
  LANDMARKS.churchIn={x:f(xin1-1.5,0,0)[0],z:f(xin1-1.5,0,0)[2],look:[f(xc,0,0)[0],f(xc,0,0)[2]]};
}
