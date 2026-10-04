/* ===================== Vatrogasni dom Tuhelj ===================== */
function letterTex(lines,{w=1024,h=320,fg='#b3261e',font='Georgia, "Times New Roman", serif',sizes=[120,110],weight=700}={}){ const c=cvs(w,h), g=c.getContext('2d'); g.clearRect(0,0,w,h); g.textAlign='center'; g.textBaseline='middle';
  lines.forEach((t,i)=>{ g.font=`${weight} ${sizes[i]}px ${font}`; const y=h*(i+0.5)/lines.length; g.fillStyle='rgba(90,20,15,0.55)'; g.fillText(t,w/2+3,y+4); g.fillStyle=fg; g.fillText(t,w/2,y); }); return mkTex(c,{repeat:false}); }
function wallSign(scene,tex,w,h,x,y,z,ang){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,transparent:false,alphaTest:0.4,roughness:0.6,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3})); m.position.set(x,y,z); m.rotation.y=ang; m.receiveShadow=true; scene.add(m); SIGNS.push(m); return m; }
function segSign(scene,m,tex,w,h,s,y,out=0.06){ const p=m.P(s,y,-out); const N=m.W(0,0,1); return wallSign(scene,tex,w,h,p[0],y,p[2],Math.atan2(N[0],N[2])); }
function heroGroups(cs,x,z){ return {wall:cs.get('wall',x,z),trim:cs.get('trim',x,z),glass:cs.get('glassW',x,z),slats:cs.get('slats',x,z),leaded:cs.get('leaded',x,z),stone:cs.get('stonem',x,z),metal:cs.get('metal',x,z),plinth:cs.get('plinth',x,z),hedge:cs.get('hedge',x,z),awning:cs.get('awning',x,z)}; }
function fireStation(cs,scene,b){
  const [cx,cz,ang,L,W]=b.rect; const y0=b.hmax+0.15, yb=b.hmin-0.6; b.y0=y0;
  const sk=b.f; const si0=sideInfo(sk,L/2,W/2); const nW=worldN(ang,si0.n); const a2=Math.atan2(nW[0],-nW[2]); const F=frame(cx,cz,a2);
  const hx=(sk<2?W:L)/2, hz=(sk<2?L:W)/2; // x across the front (viewer u = -x), z depth, front at z=-hz
  const WALLC=lin('#f1c3a2'), REV=lin('#f5d2b6'), ROOFC=lin('#f4e6de'), SOF=lin('#3d4043'), STONE=lin('#a09a90'), TRIMC=lin('#f6ede2'), DARK=lin('#34383c'), DARKF=lin('#2e3236');
  const H=heroGroups(cs,cx,cz); const Mt=H.metal, T=H.trim, G=H.wall;
  const at=(x,z)=>{ const p=F(x,0,z); return [p[0],p[2]]; };
  const mhx=10.8, mhz=6.6, mz=-hz+mhz; const fb=frame(...at(0,mz),a2); const e=y0+6.0, pitch=48, tanP=Math.tan(pitch*Math.PI/180); const rtF=e+mhz*tanP, ek=e+0.5*(rtF-e), zk=mhz*0.5;
  const gx=-1.2, ghw=3.8, gpitch=52, tg=Math.tan(gpitch*Math.PI/180);
  const dwin=(m,hole,o={})=>rectWindow(H,m,hole,Object.assign({wc:WALLC,rc:REV,fc:DARKF,cols:2,rows:2,dep:0.2,fw:0.08,mw:0.06,sc:DARK,sillOut:0.1,gv:'plain'},o));
  // ---- main block walls with openings ----
  const FL=[mhx,-mhz], FR=[-mhx,-mhz], BR=[-mhx,mhz], BL=[mhx,mhz];
  const mF=segMap(fb,a2,FL,FR), mLft=segMap(fb,a2,BL,FL), mRgt=segMap(fb,a2,FR,BR), mB=segMap(fb,a2,BR,BL);
  const gable=(Lg)=>[[0,yb],[Lg,yb],[Lg,e],[Lg/2+zk,ek],[Lg/2-zk,ek],[0,e]];
  { const s=(u)=>mhx+u; const holes=[holeRect(s(-8.4),s(-4.4),y0,y0+4.0),holeRect(s(6.4)-0.62,s(6.4)+0.62,y0+0.85,y0+2.95),holeRect(s(9.0)-0.62,s(9.0)+0.62,y0+0.85,y0+2.95),holeRect(s(-9.95)-0.42,s(-9.95)+0.42,y0+1.0,y0+2.5)];
    facadeSeg(G,mF,[[0,yb],[mF.L,yb],[mF.L,e],[0,e]],holes,WALLC);
    const gh=holes[0]; reveal(G,mF,gh,0,0.32,REV); frameRing(T,mF,gh,0.12,0.02,0.3,DARK); pane(H.slats,mF,insetPoly(gh,0.12),0.3,lin('#7b7f84'),[0,0,3.3,3.3]); T.box(mF.T,gh[0][0]+0.12,gh[1][0]-0.12,gh[2][1]-0.45,gh[2][1]-0.12,-0.3,-0.22,lin('#62666b'));
    for(let i=1;i<4;i++) dwin(mF,holes[i],{rows:3});
    plinthSeg(H.plinth,mF,yb,y0+0.4,[[gh[0][0]-0.02,gh[1][0]+0.02]],STONE);
    segSign(scene,mF,letterTex(['VATROGASNI DOM','TUHELJ'],{sizes:[104,96]}),4.4,1.15,s(-6.4),y0+4.62,0.06);
    segSign(scene,mF,signTex(['28a'],{w:256,h:128,bg:'#ffffff',fg:'#1b2a4a',border:'#1b2a4a',bw:6,size:70}),0.36,0.22,s(-4.0),y0+2.6,0.05);
  }
  for(const [m,door] of [[mLft,true],[mRgt,false]]){ const L2=m.L; const holes=[]; for(const s of [2.4,5.2,8.0,10.8]) holes.push(holeRect(s-0.55,s+0.55,y0+4.3,y0+5.6)); for(const s of [5.3,7.9]) holes.push(holeRect(s-0.48,s+0.48,y0+7.3,y0+8.4));
    holes.push(holeRect(2.4,3.6,y0+0.85,y0+2.95)); holes.push(holeRect(9.6,10.8,y0+0.85,y0+2.95)); holes.push(door?holeArch(5.95,7.25,y0,y0+2.6):holeRect(6.0,7.2,y0+0.85,y0+2.95));
    facadeSeg(G,m,gable(L2),holes,WALLC);
    holes.forEach((h,i)=>{ if(door&&i===holes.length-1){ archWindow(H,m,h,{wc:WALLC,rc:REV,fc:DARKF,dep:0.2,fw:0.08,sill:false,gv:'plain'}); } else dwin(m,h,{rows:i>=6?3:2}); });
    plinthSeg(H.plinth,m,yb,y0+0.4,door?[[5.9,7.3]]:[],STONE); }
  facadeSeg(G,mB,[[0,yb],[mB.L,yb],[mB.L,e],[0,e]],[],WALLC); plinthSeg(H.plinth,mB,yb,y0+0.4,[],STONE);
  const rtM=emitRoof(cs,fb,a2,mhx,mhz,e,'halfhip',pitch,0.6,0.55,ROOFC,SOF,'roofB',15,0.5);
  localCollider(F,a2,-mhx,mhx,-hz,-hz+2*mhz,y0-3,y0+14);
  for(const sz of [-1,1]){ const ez=sz*(mhz+0.52), ey=e-0.6*tanP-0.12; Mt.box(fb,-mhx-0.6,mhx+0.6,ey-0.12,ey,ez-0.07,ez+0.07,DARK); }
  for(const x of [-mhx+0.15,mhx-0.15,gx-ghw-0.3,gx+ghw+0.3]){ const p=fb(x,0,-mhz-0.12); Mt.box(frame(p[0],p[2],a2,0),-0.05,0.05,y0,e-0.6,-0.05,0.05,DARK); }
  // ---- rear hall ----
  const rz0=-hz+2*mhz, rz1=hz; const rhz=(rz1-rz0)/2, rhx=Math.min(hx,11.2); const rb=frame(...at(0,(rz0+rz1)/2),a2);
  emitWalls(cs,rb,a2,rhx,rhz+0.2,yb,y0+5.0,'gable',20,WALLC,'wall'); emitPlinth(cs,rb,a2,rhx,rhz+0.2,yb,y0+0.4,STONE); emitRoof(cs,rb,a2,rhx,rhz+0.2,y0+5.0,'gable',20,0.5,0.4,ROOFC,SOF,'roofB');
  localCollider(F,a2,-rhx,rhx,rz0,rz1,y0-3,y0+8);
  const Wn=cs.get('win',cx,cz); for(let i=0;i<3;i++){ const s2=sideInfo(2,rhx,rhz+0.2); decal(Wn,rb,a2,s2,-rhx+rhx*2*(i+0.5)/3,y0-0.02,'garage_white'); }
  for(const s of [0,1]){ const s2=sideInfo(s,rhx,rhz+0.2); decal(Wn,rb,a2,s2,0,y0+2.6,'fire_grid',0.05); }
  // ---- central cross gable with big glazing and portico ----
  const gz0=-hz-0.35, gz1=-hz+5.2; const cgA=a2+Math.PI/2; const cg=frame(...at(gx,(gz0+gz1)/2),cgA); const chl=(gz1-gz0)/2; const apex=e+ghw*tg;
  { const mG=segMap(cg,cgA,[-chl,-ghw],[-chl,ghw]); const yb2=e+0.1, mm=0.45; const topAt=(t)=>apex-Math.abs(t)*tg-mm; const c0=ghw;
    const hC=[[c0-1.0,yb2],[c0+1.0,yb2],[c0+1.0,topAt(1.0)],[c0,apex-0.55],[c0-1.0,topAt(1.0)]];
    const hL=[[c0-2.9,yb2],[c0-1.25,yb2],[c0-1.25,topAt(1.25)],[c0-2.9,topAt(2.9)]], hR=[[c0+1.25,yb2],[c0+2.9,yb2],[c0+2.9,topAt(2.9)],[c0+1.25,topAt(1.25)]];
    const hD=holeArch(c0-0.75,c0+0.75,y0,y0+2.65), hW1=holeArch(c0-2.7,c0-1.5,y0+0.6,y0+2.8), hW2=holeArch(c0+1.5,c0+2.7,y0+0.6,y0+2.8);
    facadeSeg(G,mG,[[0,yb],[mG.L,yb],[mG.L,e],[c0,apex],[0,e]],[hC,hL,hR,hD,hW1,hW2],WALLC);
    for(const h of [hC,hL,hR]){ reveal(G,mG,h,0,0.16,REV); const I=frameRing(T,mG,h,0.1,0.14,0.05,DARKF); pane(H.glass,mG,I,0.18,WHITE,GLASSV.plain);
      let s0=1e9,s1=-1e9,ya=1e9,yz=-1e9; for(const p of I){ s0=Math.min(s0,p[0]); s1=Math.max(s1,p[0]); ya=Math.min(ya,p[1]); yz=Math.max(yz,p[1]); }
      const sm=(s0+s1)/2; bar(T,mG,sm,ya,sm,(h===hC?apex-0.62:Math.max(topAt(sm-c0)-0.08,ya+0.1)),0.07,0.14,0.05,DARKF);
      const ymx=h===hC?topAt(1.0)-0.25:Math.min(topAt(1.25),topAt(2.9))-0.25; for(let y=ya+0.8;y<ymx;y+=0.8) bar(T,mG,s0,y,s1,y,0.06,0.145,0.05,DARKF); }
    for(const t of [-1.13,1.13]) T.box(mG.T,c0+t-0.1,c0+t+0.1,yb2,topAt(t)+0.12,-0.04,0.06,TRIMC); T.box(mG.T,c0-3.1,c0+3.1,yb2-0.22,yb2,-0.04,0.1,TRIMC);
    archWindow(H,mG,hD,{wc:WALLC,rc:REV,fc:DARKF,dep:0.2,fw:0.08,sill:false,gv:'plain'}); for(const h of [hW1,hW2]) archWindow(H,mG,h,{wc:WALLC,rc:REV,fc:DARKF,dep:0.2,fw:0.08,gv:'plain',sc:DARK});
    plinthSeg(H.plinth,mG,yb,y0+0.4,[[c0-0.8,c0+0.8]],STONE);
    for(const sd of [-1,1]){ const a=sd<0?[chl,-ghw]:[-chl,ghw], c=sd<0?[-chl,-ghw]:[chl,ghw]; segWall(G,cg,cgA,a[0],a[1],c[0],c[1],yb,e,WALLC); }
    emitRoof(cs,cg,cgA,chl,ghw,e,'gable',gpitch,0.65,0.4,ROOFC,SOF,'roofB');
    const pz0=gz0, pz1=gz0-2.4, ptop=y0+3.55; const pc=F(gx,0,(pz0+pz1)/2); const pf=frame(pc[0],pc[2],a2,0);
    G.box(pf,-ghw+0.3,ghw-0.3,ptop,ptop+0.4,-(pz0-pz1)/2,(pz0-pz1)/2,WALLC,0.5); T.box(pf,-ghw+0.25,ghw-0.25,ptop+0.4,ptop+0.5,-(pz0-pz1)/2-0.05,(pz0-pz1)/2+0.05,TRIMC); T.box(pf,-ghw+0.3,ghw-0.3,ptop-0.12,ptop,-(pz0-pz1)/2,(pz0-pz1)/2,TRIMC);
    for(const x of [-ghw+0.9,ghw-0.9]){ const cp=F(gx+x,0,pz1+0.45); const lf=frame(cp[0],cp[2],a2,0); lathe(G,lf,[[0.4,y0],[0.4,y0+0.18],[0.34,y0+0.24],[0.3,y0+0.4],[0.27,ptop-0.45],[0.3,ptop-0.35],[0.38,ptop-0.2],[0.4,ptop]],14,TRIMC); addCollider(cp[0],cp[2],a2,0.8,0.8,y0-1,ptop); }
    H.stone.box(pf,-ghw+0.3,ghw-0.3,y0-0.3,y0+0.02,-(pz0-pz1)/2,(pz0-pz1)/2,lin('#b9b3a8'),0.5); addFloor(pf,a2,-ghw+0.3,ghw-0.3,-(pz0-pz1)/2,(pz0-pz1)/2,y0+0.02);
  }
  localCollider(F,a2,gx-ghw,gx+ghw,gz0,gz1,y0-3,y0+11);
  // ---- dormers ----
  for(const dx of [6.4,-8.0]){ const dz=-mhz+1.9; const yr=e+(mhz-Math.abs(dz))*tanP; const dA=a2+Math.PI/2; const df=frame(...(()=>{ const p=fb(dx,0,dz); return [p[0],p[2]]; })(),dA); const dl=1.55, dw=1.1;
    const mD=segMap(df,dA,[-dl,-dw],[-dl,dw]); const hole=holeRect(0.5,1.7,yr-1.55,yr-0.3); facadeSeg(G,mD,[[0,yr-2.2],[2*dw,yr-2.2],[2*dw,yr],[dw,yr+dw],[0,yr]],[hole],WALLC); dwin(mD,hole,{sill:false});
    for(const sd of [-1,1]){ const a=sd<0?[dl,-dw]:[-dl,dw], c=sd<0?[-dl,-dw]:[dl,dw]; segWall(Mt,df,dA,a[0],a[1],c[0],c[1],yr-2.2,yr,lin('#4a4d50')); }
    emitRoof(cs,df,dA,dl,dw,yr,'gable',45,0.25,0.2,ROOFC,SOF,'roofB'); }
  // ---- siren pole, satellite dish, hedge, yard markings ----
  { const p=fb(-2.0,0,0); const sp=frame(p[0],p[2],a2,0); Mt.cyl(sp,0.06,0.05,rtM-0.6,rtM+3.4,6,lin('#9aa0a6'),1,false); Mt.cyl(sp,0.28,0.22,rtM+3.4,rtM+3.75,10,lin('#5d6166'),1,true); Mt.cyl(sp,0.12,0.12,rtM+3.75,rtM+3.9,8,lin('#5d6166'),1,true); }
  { const p=F(gx-ghw-0.6,0,-hz-0.2); const tf2=(x,y,z)=>{ const c=Math.cos(-0.9), s=Math.sin(-0.9); return frame(p[0],p[2],a2+Math.PI,y0+5.2)(x,y*c-z*s,y*s+z*c); }; lathe(Mt,tf2,[[0,-0.05],[0.25,-0.02],[0.45,0.08]],12,lin('#e8e8e4')); }
  const fm0=F(0,0,-hz); const nr=nearestRoad(fm0[0],fm0[2],45); const dep=nr?clamp(nr.d-2.2,6,28):16;
  { const L2=10; const hp=F(hx-L2/2+2,0,-hz-dep); const hf=frame(hp[0],hp[2],a2,getHeight(hp[0],hp[2])-0.2); H.hedge.box(hf,-L2/2,L2/2,0,1.7,-0.55,0.55,colJ(lin('#3e6a2e'),0.1),0.8,0x3f^8); addCollider(hp[0],hp[2],a2,L2,1.1,-1e4,1e4); }
  { const WL=lin('#eeeeea'); const line=(x0,z0,x1,z1,w)=>{ const L3=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.ceil(L3/1.5)); const ux=(x1-x0)/L3, uz=(z1-z0)/L3; const px=-uz*w/2, pz=ux*w/2;
      for(let i=0;i<n;i++){ const t0=i/n*L3, t1=(i+1)/n*L3; const q=(t,sg)=>{ const lx=x0+ux*t+px*sg, lz=z0+uz*t+pz*sg; const p=F(lx,0,lz); return [p[0],getHeight(p[0],p[2])+0.035,p[2]]; }; T.quad(q(t0,-1),q(t1,-1),q(t1,1),q(t0,1),[0,0],[1,0],[1,1],[0,1],WL,[0,1,0]); } };
    const zA=-hz-2.5, zB=-hz-dep+1.5; for(const x of [7.5,3.5,-0.5,-4.5,-8.5]) line(x,zA,x,zB,0.12); const zm=zA-(zA-zB)*0.55; line(8.5,zm,-9.5,zm,0.12); line(8.5,zB+0.4,-9.5,zB+0.4,0.12); }
  const lp=F(0,0,-hz-14); LANDMARKS.fire={x:lp[0],z:lp[2],look:[cx,cz]}; LANDMARKS.fireDoor=F(0,0,-hz-1.4);
  const hp2=F(-hx-1.5,0,-hz-3); PROPS_EXTRA.push({t:'hydrant',x:hp2[0],z:hp2[2]});
}
/* ===================== Kafić Putniku ===================== */
function beerSignTex(){ const c=cvs(256,256), g=c.getContext('2d'); g.clearRect(0,0,256,256); g.fillStyle='#6b3d1c'; g.beginPath(); g.arc(128,128,124,0,TAU); g.fill(); g.fillStyle='#f2c230'; g.beginPath(); g.arc(128,128,108,0,TAU); g.fill();
  g.fillStyle='#fff7e0'; g.fillRect(92,96,62,88); g.fillStyle='#e7a526'; g.fillRect(96,118,54,62); g.strokeStyle='#fff7e0'; g.lineWidth=10; g.beginPath(); g.arc(160,140,18,-Math.PI/2,Math.PI/2); g.stroke(); g.fillStyle='#fffdf5'; for(const [x,y,r] of [[98,92,14],[118,84,16],[140,90,14]]){ g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
  g.fillStyle='#6b3d1c'; g.font='800 30px Manrope, Arial'; g.textAlign='center'; g.fillText('PIVO',128,222); return mkTex(c,{repeat:false}); }
function chalkTex(){ const c=cvs(256,320), g=c.getContext('2d'); g.fillStyle='#5a3a22'; g.fillRect(0,0,256,320); g.fillStyle='#262b27'; g.fillRect(14,14,228,292); g.fillStyle='rgba(255,255,255,0.9)'; g.textAlign='center';
  g.font='700 34px Georgia, serif'; g.fillText('Kafić',128,70); g.fillText('Putniku',128,112); g.font='500 24px Manrope, Arial'; g.fillStyle='rgba(255,255,255,0.8)'; ['kava','pivo','sokovi','čaj'].forEach((t,i)=>g.fillText(t,128,165+i*34)); return mkTex(c,{repeat:false}); }
let CAFE_CTX={};
function cafe(cs,scene,b){ CAFE_CTX={};
  const [cx,cz,ang,L,W]=b.rect; const f=frame(cx,cz,ang); const y0=b.hmax+0.15, yb=b.hmin-0.6; b.y0=y0;
  const WALLC=lin('#d5dbe0'), REV=lin('#e6eaec'), TRIMC=lin('#f6f6f2'), ROOFC=lin('#3a3735'), SOF=lin('#f1f1ec'), STONEC=lin('#e3e0d8'), SHUT=lin('#7a3b27');
  const H=heroGroups(cs,cx,cz); const G=H.wall, T=H.trim, Mt=H.metal, Gs=cs.get('glass',cx,cz), Aw=H.awning;
  const mx0=-10.5, mx1=3.6, mz0=-5.25, mz1=4.25; const mhl=(mx1-mx0)/2, mhw=(mz1-mz0)/2; const mb=frame(...(()=>{ const p=f((mx0+mx1)/2,0,(mz0+mz1)/2); return [p[0],p[2]]; })(),ang);
  const e=y0+6.35, pitch=35, rt=e+mhw*Math.tan(pitch*Math.PI/180);
  const A=[mx0,mz1], B=[mx1,mz1], C=[mx1,mz0], D=[mx0,mz0];
  const mF=segMap(f,ang,A,B), mE=segMap(f,ang,B,C), mBk=segMap(f,ang,C,D), mWs=segMap(f,ang,D,A);
  const win=(m,hole,o={})=>rectWindow(H,m,hole,Object.assign({wc:WALLC,rc:REV,fc:TRIMC,cols:2,dep:0.25,sc:TRIMC},o));
  const openDoor=(m,hole,hinge,dir,w,col,glass)=>{ reveal(G,m,hole,0,0.25,REV); frameRing(T,m,hole,0.06,0.02,0.23,col); const phi=Math.atan2(dir[1],dir[0]); const hp=f(hinge[0],0,hinge[1]); const lf=frame(hp[0],hp[2],ang+phi,0);
    T.box(lf,0,w,y0,y0+2.22,-0.03,0.03,col); if(glass) Gs.box(lf,0.08,w-0.08,y0+0.12,y0+2.1,-0.035,0.035,WHITE); };
  const up=(s)=>holeRect(s-0.58,s+0.58,y0+3.6,y0+4.95), dn=(s)=>holeRect(s-0.75,s+0.75,y0+0.95,y0+2.3);
  { const hs=[dn(1.5),dn(4.15),dn(6.8),holeRect(10.8,12.3,y0+0.95,y0+2.3),up(1.5),up(4.15),up(6.8),holeRect(11.93,12.87,y0+3.32,y0+5.45),holeRect(13.3,13.8,y0+4.05,y0+4.95)];
    facadeSeg(G,mF,[[0,yb],[mF.L,yb],[mF.L,e],[0,e]],hs,WALLC); CAFE_CTX.frontHoles=hs;
    for(let i=0;i<3;i++) win(mF,hs[i],{shutter:{k:0.32,col:SHUT}});
    win(mF,hs[3],{shutter:{k:0.45,col:SHUT}});
    for(let i=4;i<7;i++) win(mF,hs[i],{shutter:{k:0.72,col:SHUT},surround:{w:0.12,p:0.035,c:TRIMC}});
    win(mF,hs[7],{cols:1,shutter:{k:0.18,col:SHUT},sill:false}); win(mF,hs[8],{cols:1,shutter:{k:0.4,col:SHUT}});
    plinthSeg(H.plinth,mF,yb,y0+0.75,[],STONEC);
    for(const s of [1.5,4.15,6.8]){ const hw2=1.0, top=y0+2.8, out=0.85, drop=0.5; const Tt=mF.T;
      Aw.quad(Tt(s-hw2,top,0.02),Tt(s+hw2,top,0.02),Tt(s+hw2,top-drop,out),Tt(s-hw2,top-drop,out),[0,0],[2,0],[2,1],[0,1],WHITE,mF.W(0,1,1));
      Aw.quad(Tt(s-hw2,top-drop,out),Tt(s+hw2,top-drop,out),Tt(s+hw2,top-drop-0.24,out+0.02),Tt(s-hw2,top-drop-0.24,out+0.02),[0,0],[2,0],[2,0.25],[0,0.25],WHITE,mF.W(0,0,1));
      for(const sd of [-1,1]) Aw.tri(Tt(s+sd*hw2,top,0.02),Tt(s+sd*hw2,top-drop,out),Tt(s+sd*hw2,top-drop-0.24,out+0.02),[0,0],[1,0],[1,0.3],WHITE,mF.W(sd,0,0));
      Mt.box(Tt,s-hw2,s+hw2,top-drop-0.03,top-drop+0.01,out-0.02,out+0.03,lin('#8a8d90'),1); for(const sd of [-1,1]) bar(Mt,mF,s+sd*(hw2-0.03),top-0.02,s+sd*(hw2-0.03),top-drop,0.03,-out,0.03,lin('#8a8d90')); }
    segSign(scene,mF,chalkTex(),0.8,1.0,9.3,y0+1.55,0.06); segSign(scene,mF,beerSignTex(),0.62,0.62,10.55,y0+4.0,0.12);
    segSign(scene,mF,signTex(['KLADIONICA'],{w:512,h:256,bg:'#1f4f9c',fg:'#ffffff',border:'#ffffff',bw:8,size:64}),0.62,0.34,10.55,y0+3.2,0.07);
    const s0=10.7, s1=14.05, bd=1.55, by=y0+3.3; const Tt=mF.T;
    T.box(Tt,s0,s1,by-0.18,by,0,bd,lin('#e3e3de')); Gs.box(Tt,s0+0.04,s1-0.04,by+0.05,by+1.0,bd-0.06,bd-0.02,WHITE); for(const s of [s0,s1]) Gs.box(Tt,s-0.02,s+0.02,by+0.05,by+1.0,0.05,bd-0.04,WHITE);
    Mt.box(Tt,s0,s1,by+1.0,by+1.05,bd-0.08,bd,lin('#c9ccd0')); for(const s of [s0,s1]) Mt.box(Tt,s-0.03,s+0.03,by,by+1.05,bd-0.08,bd-0.02,lin('#c9ccd0'));
    const cy0=e-0.35, cy1=cy0-0.55; Gs.quad(Tt(s0-0.1,cy0,0.05),Tt(s1+0.1,cy0,0.05),Tt(s1+0.1,cy1,bd+0.25),Tt(s0-0.1,cy1,bd+0.25),[0,0],[1,0],[1,1],[0,1],WHITE,mF.W(0,1,0.4));
    for(const s of [s0,(s0+s1)/2,s1]) Mt.box(Tt,s-0.03,s+0.03,cy1-0.03,cy1+0.03,0.05,bd+0.25,lin('#8e9397')); for(const s of [s0-0.05,s1+0.05]) Mt.box(Tt,s-0.03,s+0.03,by,cy1,bd+0.2,bd+0.26,lin('#8e9397'));
    const dp=Tt(s1-0.45,0,bd-0.35); const tf2=(x,y,z)=>{ const c=Math.cos(-1.0), s=Math.sin(-1.0); return frame(dp[0],dp[2],ang,by+1.35)(x,y*c-z*s,y*s+z*c); }; lathe(Mt,tf2,[[0,-0.04],[0.2,-0.02],[0.36,0.06]],12,lin('#e6e6e2')); Mt.box(frame(dp[0],dp[2],ang,0),-0.02,0.02,by,by+1.35,-0.02,0.02,lin('#888888'));
  }
  { const g5=(m)=>[[0,yb],[m.L,yb],[m.L,e],[m.L/2,rt],[0,e]];
    const hBar=holeRect(0.75,2.15,y0,y0+2.3); const hE=[up(2.75),up(6.75),holeRect(4.45,5.05,e+0.8,e+1.55)]; facadeSeg(G,mE,g5(mE),hE.concat([hBar]),WALLC); hE.forEach((h,i)=>win(mE,h,{cols:i===2?1:2,shutter:i===2?null:{k:0.7,col:SHUT},surround:i===2?null:{w:0.12,p:0.035,c:TRIMC}})); plinthSeg(H.plinth,mE,yb,y0+0.75,[[0.24,mE.L]],STONEC);
    { reveal(G,mE,hBar,0,0.25,lin('#6b4428')); frameRing(T,mE,hBar,0.08,0.0,0.25,lin('#4a2d19')); const WD=lin('#6b4428'); for(const [hz,dz] of [[3.5,-1],[2.1,1]]){ const dir=[-0.985,0.174*dz]; const phi=Math.atan2(dir[1],dir[0]); const hp=f(3.35,0,hz); const lf=frame(hp[0],hp[2],ang+phi,0); T.box(lf,0,0.68,y0,y0+2.22,-0.035,0.035,WD); for(const yy of [0.25,1.25]) Gs.box(lf,0.1,0.58,y0+yy,y0+yy+0.85,-0.04,0.04,WHITE); } }
    const hW=[dn(2.55),dn(6.95),up(2.55),up(6.95),holeRect(4.45,5.05,e+0.8,e+1.55)]; facadeSeg(G,mWs,g5(mWs),hW,WALLC); hW.forEach((h,i)=>win(mWs,h,{cols:i===4?1:2,shutter:i===4?null:{k:i<2?0.35:0.7,col:SHUT},surround:(i===2||i===3)?{w:0.12,p:0.035,c:TRIMC}:null})); plinthSeg(H.plinth,mWs,yb,y0+0.75,[],STONEC);
    const hB=[up(2.5),up(5.5),up(8.5),up(11.5),dn(2.5),dn(7.0),holeRect(10.35,11.45,y0,y0+2.2)]; facadeSeg(G,mBk,[[0,yb],[mBk.L,yb],[mBk.L,e],[0,e]],hB,WALLC); CAFE_CTX.backHoles=hB; hB.forEach((h,i)=>win(mBk,h,{cols:i===6?1:2,shutter:i===6?null:{k:0.55,col:SHUT},fc:i===6?lin('#6b4428'):TRIMC,gv:i===6?'drape':undefined,sill:i!==6})); plinthSeg(H.plinth,mBk,yb,y0+0.75,[[10.33,11.47]],STONEC);
  }
  for(const m of [mF,mE,mBk,mWs]){ T.box(m.T,0,m.L,y0+3.0,y0+3.28,-0.02,0.05,TRIMC,1,0x3f); T.box(m.T,0,0.34,y0+0.75,e-0.05,-0.02,0.06,TRIMC,1,0x3f^8^4); T.box(m.T,m.L-0.34,m.L,y0+0.75,e-0.05,-0.02,0.06,TRIMC,1,0x3f^8^4); }
  emitRoof(cs,mb,ang,mhl,mhw,e,'gable',pitch,0.8,0.65,ROOFC,SOF);
  { const Y0=y0-3, Y1=y0+11; localCollider(f,ang,mx0,mx1,mz1-0.25,mz1,Y0,Y1); localCollider(f,ang,mx0,mx1,mz0,mz0+0.25,Y0,Y1); localCollider(f,ang,mx0,mx0+0.25,mz0,mz1,Y0,Y1); localCollider(f,ang,mx1-0.25,mx1,mz0,2.1,Y0,Y1); localCollider(f,ang,mx1-0.25,mx1,3.5,mz1,Y0,Y1); }
  for(const [x,z] of [[-4.0,-1.6],[3.9,1.8]]){ const p=mb(x,0,z); const yr=roofYat(z,mhw,e,pitch); const cfr=frame(p[0],p[2],ang,0); G.box(cfr,-0.25,0.25,yr-0.5,rt+0.7,-0.25,0.25,lin('#6f6c69'),0.5); T.box(cfr,-0.32,0.32,rt+0.7,rt+0.78,-0.32,0.32,lin('#4c4a48')); }
  for(const x of [-5.5,-1.0]){ const p=mb(x,0,0); const af=frame(p[0],p[2],ang+0.4,0); Mt.cyl(af,0.03,0.025,rt-0.2,rt+2.6,5,lin('#9da2a6'),1,false); Mt.box(af,-0.9,0.9,rt+2.2,rt+2.24,-0.02,0.02,lin('#9da2a6')); for(let k=-4;k<=4;k++) Mt.box(af,k*0.2-0.012,k*0.2+0.012,rt+2.2,rt+2.24,-0.35+Math.abs(k)*0.03,0.35-Math.abs(k)*0.03,lin('#9da2a6')); Mt.box(af,-0.02,0.02,rt+1.4,rt+1.43,-0.45,0.45,lin('#9da2a6')); }
  // ---- covered terrace (the only entrance): long room along the main block, arched windows, chamfered corner ----
  { const ea=y0+3.3; const AWALL=lin('#8f959b'), AREV=lin('#cfd2d5'), FRM=lin('#b9bdc1');
    const pts=[[3.6,4.0],[8.4,4.0],[10.4,2.0],[10.4,-15.6],[3.6,-15.6],[3.6,-5.25]]; /* the annex runs on east along the main road (photos) */ const annexHoles=[];
    const arch=(s0,s1)=>holeArch(s0,s1,y0+0.45,y0+2.75,12);
    for(let i=0;i<pts.length-1;i++){ const m=segMap(f,ang,pts[i],pts[i+1]); const Ls=m.L; let holes=[], gaps=[];
      if(i===0){ holes=[holeRect(0.15,2.45,y0,y0+2.45)]; gaps=[[0.13,2.47]]; }
      else if(i===1){ holes=[arch(0.42,Ls-0.42)]; }
      else if(i===2){ const n=Math.floor((Ls-1.2)/2.45); holes=Array.from({length:n},(_,k)=>0.6+(Ls-1.2)*(k+0.5)/n).map(c=>arch(c-0.75,c+0.75)); } else if(i===3){ holes=[arch(1.2,2.6),arch(4.2,5.6)]; }
      else if(i===3){ holes=[arch(0.6,1.9)]; }
      annexHoles.push(holes);
      facadeSeg(G,m,[[0,yb],[Ls,yb],[Ls,ea],[0,ea]],holes,AWALL);
      holes.forEach((h,j)=>{ if(i===0){ reveal(G,m,h,0,0.25,AREV); frameRing(T,m,h,0.08,0.02,0.23,TRIMC); const Tt=m.T; const W2=TRIMC;
          const leaf=(s0,s1)=>{ T.box(Tt,s0,s0+0.08,y0,y0+2.37,-0.17,-0.09,W2); T.box(Tt,s1-0.08,s1,y0,y0+2.37,-0.17,-0.09,W2); T.box(Tt,s0,s1,y0,y0+0.34,-0.17,-0.09,W2); T.box(Tt,s0,s1,y0+1.17,y0+1.25,-0.17,-0.09,W2); T.box(Tt,s0,s1,y0+2.29,y0+2.37,-0.17,-0.09,W2); Gs.box(Tt,s0+0.08,s1-0.08,y0+0.34,y0+2.29,-0.14,-0.12,WHITE); };
          leaf(0.23,1.28); const hp=f(3.6+2.37,0,3.75); const dir=[-0.342,-0.94]; const lf=frame(hp[0],hp[2],ang+Math.atan2(dir[1],dir[0]),0);
          T.box(lf,0,0.08,y0,y0+2.37,-0.04,0.04,W2); T.box(lf,1.0,1.08,y0,y0+2.37,-0.04,0.04,W2); T.box(lf,0,1.08,y0,y0+0.34,-0.04,0.04,W2); T.box(lf,0,1.08,y0+1.17,y0+1.25,-0.04,0.04,W2); T.box(lf,0,1.08,y0+2.29,y0+2.37,-0.04,0.04,W2); Gs.box(lf,0.08,1.0,y0+0.34,y0+2.29,-0.012,0.012,WHITE); }
        else { archWindow(H,m,h,{wc:AWALL,rc:AREV,fc:TRIMC,dep:0.25,fw:0.09}); surround(T,m,h,0.14,0.045,FRM); } });
      if(i===0){ segCollider(f,ang,pts[0][0],pts[0][1],pts[0][0]+0.15,pts[0][1],0.3,y0-3,y0+6); segCollider(f,ang,pts[0][0]+2.45,pts[0][1],pts[1][0],pts[1][1],0.3,y0-3,y0+6); } else segCollider(f,ang,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],0.3,y0-3,y0+6);
      plinthSeg(H.plinth,m,yb,y0+0.35,gaps,lin('#8a8f94')); T.box(m.T,-0.02,Ls+0.02,ea-0.2,ea,-0.02,0.06,lin('#a3a8ad'),1,0x3f^8);
      if(i===0) T.box(m.T,2.95,3.45,y0+0.35,ea-0.2,-0.02,0.08,FRM); if(i===2){ const n=Math.floor((Ls-1.2)/2.45); for(let k=0;k<=n;k++){ const c=0.6+(Ls-1.2)*k/n-(k===0?0.3:k===n?-0.3:0); T.box(m.T,c-0.2,c+0.2,y0+0.35,ea-0.2,-0.02,0.06,FRM); } } }
    // hipped roof with barrel tiles over the real (chamfered) footprint, wooden soffit + fascia + grey gutter, rafter tails
    const roofP=[[3.6,4.0],[8.4,4.0],[10.4,2.0],[10.4,-15.6],[3.6,-15.6]];
    const RR=hipRoofOver(cs,f,ang,roofP,ea,30,0.55,{mat:'roofK',color:lin('#f6ece6'),soffit:lin('#8a5c3c'),fascia:lin('#6a4630'),skipEave:(a,b)=>Math.abs(a[0]-b[0])<0.01&&a[0]<3.6});
    { const Wd=cs.get('wood',cx,cz); const tn=Math.tan(30*Math.PI/180); for(let i=0;i<4;i++){ const a=roofP[i], b=roofP[i+1]; const L2=Math.hypot(b[0]-a[0],b[1]-a[1]); const ux=(b[0]-a[0])/L2, uz=(b[1]-a[1])/L2; const E=RR.E[i]; const ox=-E.nIn[0], oz=-E.nIn[1];
      for(let t=0.3;t<L2-0.1;t+=0.62){ const px=a[0]+ux*t, pz=a[1]+uz*t; beam(Wd,f(px,ea-0.2,pz),f(px+ox*0.46,ea-0.2-0.46*tn,pz+oz*0.46),0.045,lin('#6a4630')); } } }
    { const dp=f(10.4+0.62,0,-15.6-0.62); Mt.box(frame(dp[0],dp[2],ang,0),-0.05,0.05,y0-0.3,ea-0.5,-0.05,0.05,lin('#5d6166')); }
    Object.assign(CAFE_CTX,{pts,annexHoles,ea,roofP});
    { const p=f(11.2,0,-2.0); const y=getHeight(p[0],p[2]); const bf=frame(p[0],p[2],ang+Math.PI/2,y); const R=lin('#b32b26'); const Wd2=cs.get('wood',cx,cz); Wd2.box(bf,-0.9,0.9,0.42,0.47,-0.22,0.22,R); Wd2.box(bf,-0.9,0.9,0.55,0.85,0.2,0.24,R); for(const xx of [-0.75,0.75]) Mt.box(bf,xx-0.03,xx+0.03,0,0.45,-0.2,0.2,lin('#333333')); addCollider(p[0],p[2],ang+Math.PI/2,1.9,0.6,y-1,y+1); }
  }
  cafeDecor(cs,scene,f,ang,y0,cx,cz); segSign(scene,mE,putnikuTex(),1.5,0.62,1.1,y0+4.05,0.06);
  pubInterior(cs,scene,{f,ang,y0,cx,cz,ea:CAFE_CTX.ea,pts:CAFE_CTX.pts,roofP:CAFE_CTX.roofP,annexHoles:CAFE_CTX.annexHoles,barDoor:[2.1,3.5],barDoorZ:[2.1,3.5],frontHoles:CAFE_CTX.frontHoles,backHoles:CAFE_CTX.backHoles});
  const lp=f(-3,0,14); LANDMARKS.cafe={x:lp[0],z:lp[2],look:[cx,cz]}; const lin2=f(7.0,0,3.0); LANDMARKS.terrace={x:lin2[0],z:lin2[2],look:[f(7.0,0,-5.0)[0],f(7.0,0,-5.0)[2]]};
}

function putnikuTex(){ const c=cvs(768,320), g=c.getContext('2d'); g.fillStyle='#f7f7f4'; g.fillRect(0,0,768,320); g.strokeStyle='#c9c9c4'; g.lineWidth=10; g.strokeRect(5,5,758,310);
  g.fillStyle='#8b1d18'; g.textAlign='center'; g.font='italic 700 56px Georgia, serif'; g.fillText('Caffe bar',384,86); g.font='800 92px Georgia, serif'; g.fillText('»PUTNIKU«',384,190); g.fillStyle='#2a2a2a'; g.font='700 44px Manrope, Arial'; g.fillText('TUHELJ 30',384,270); return mkTex(c,{repeat:false}); }
function bikeAt(G,W3,x,z,y,a,col,basket){ const d=[Math.cos(a),Math.sin(a)], n=[-Math.sin(a),Math.cos(a)]; const P=(u,v,h)=>W3(x+d[0]*u+n[0]*v,y+h,z+d[1]*u+n[1]*v); const R=0.34;
  const ring=(u)=>{ for(let k=0;k<20;k++){ const a0=k/20*TAU, a1=(k+1)/20*TAU; beam(G,P(u+Math.cos(a0)*R,0,R+Math.sin(a0)*R),P(u+Math.cos(a1)*R,0,R+Math.sin(a1)*R),0.018,col); } for(let k=0;k<8;k++){ const aa=k/8*TAU; beam(G,P(u,0,R),P(u+Math.cos(aa)*R,0,R+Math.sin(aa)*R),0.004,col); } };
  ring(-0.52); ring(0.52); const S=P(-0.12,0,0.95), H=P(0.42,0,1.02), B=P(-0.02,0,0.36);
  beam(G,P(-0.52,0,R),B,0.018,col); beam(G,B,S,0.02,col); beam(G,S,H,0.02,col); beam(G,B,H,0.02,col); beam(G,P(0.52,0,R),H,0.018,col); beam(G,P(-0.52,0,R),S,0.016,col);
  beam(G,P(0.42,-0.26,1.08),P(0.42,0.26,1.08),0.015,col); beam(G,P(-0.16,-0.1,0.98),P(-0.16,0.1,0.98),0.05,lin('#6b4a33')); return {P}; }
function cafeDecor(cs,scene,f,ang,y0,cx,cz){ const Wd=cs.get('wood',cx,cz), Cl=cs.get('cloth',cx,cz), Mt=cs.get('metal',cx,cz), Hd=cs.get('hedge',cx,cz); const W3=(x,y,z)=>f(x,y,z); const gy=(x,z)=>{ const p=f(x,0,z); return getHeight(p[0],p[2]); };
  // woven wicker fence with sunflowers and dried corn
  { const x0=1.85, x1=3.45, zf=5.0; const y=gy((x0+x1)/2,zf); for(let x=x0;x<=x1+1e-6;x+=0.16) beam(Wd,W3(x,y,zf),W3(x,y+0.98,zf),0.02,lin('#6e5236'));
    for(let r=0;r<11;r++){ const yy=y+0.08+r*0.085; let prev=null; for(let x=x0;x<=x1+1e-6;x+=0.08){ const zz=zf+((Math.round((x-x0)/0.16+r))%2?0.03:-0.03); const q=W3(x,yy,zz); if(prev) beam(Wd,prev,q,0.016,lin(r%2?'#8a6a45':'#7a5c3a')); prev=q; } }
    for(const x of [2.0,2.5,3.0,3.35]){ const q=f(x,0,zf+0.05); const sf=frame(q[0],q[2],ang+Math.PI/2,y+rnd(0.95,1.1)); lathe(Cl,sf,[[0,0],[0.11,0.0],[0.12,0.015],[0,0.02]],14,lin('#e8b81a')); Cl.box(sf,-0.05,0.05,0.02,0.035,-0.05,0.05,lin('#4a2e14')); }
    for(const x of [2.25,2.8,3.2]){ const q=f(x,0,zf+0.06); Cl.box(frame(q[0],q[2],ang,y+0.55),-0.035,0.035,-0.14,0.14,-0.035,0.035,lin('#e3a21a')); } localCollider(f,ang,x0,x1,zf-0.1,zf+0.1,y-1,y+1.1); }
  // oak barrel with an old red hand pump and dried flowers
  { const x=6.35, z=4.8; const q=f(x,0,z); const y=gy(x,z); const bf=frame(q[0],q[2],ang,y); lathe(Wd,bf,[[0.27,0],[0.31,0.15],[0.335,0.42],[0.31,0.7],[0.27,0.86],[0,0.86]],16,lin('#7a4e2b'));
    for(const h of [0.1,0.3,0.56,0.76]){ const r=h<0.4?0.31+ (h-0.1)*0.1:0.33-(h-0.42)*0.14; lathe(Mt,bf,[[r+0.008,h],[r+0.012,h+0.03],[r+0.008,h+0.06]],16,lin('#2b2b2b')); }
    Mt.cyl(bf,0.07,0.06,0.86,1.35,10,lin('#9b1e18'),1,true); Mt.box(bf,0.05,0.25,1.18,1.23,-0.025,0.025,lin('#9b1e18')); beam(Mt,bf(0,1.35,0),bf(-0.28,1.5,0),0.018,lin('#9b1e18')); lathe(Mt,bf,[[0.1,1.35],[0.11,1.4],[0,1.42]],10,lin('#7d1612'));
    for(let k=0;k<9;k++){ const a=k/9*TAU; beam(Hd,bf(0.03,1.0,0.03),bf(Math.cos(a)*0.3,1.55+rnd(0,0.25),Math.sin(a)*0.3),0.012,lin(pick(['#9a8a4a','#7d8a3a','#b39a5a']))); } addCollider(q[0],q[2],ang,0.7,0.7,y-1,y+1.5); }
  // tall dark planter with agave
  { const x=8.35, z=4.75; const q=f(x,0,z); const y=gy(x,z); const pf=frame(q[0],q[2],ang,y); lathe(Cl,pf,[[0.2,0],[0.27,0.95],[0.25,0.95],[0,0.93]],14,lin('#3c3f43'));
    for(let k=0;k<16;k++){ const a=k/16*TAU+rnd(-0.1,0.1), L=rnd(0.55,0.85), el=rnd(0.7,1.25); const b0=pf(0,0.93,0), tip=pf(Math.cos(a)*L*Math.cos(el),0.93+L*Math.sin(el),Math.sin(a)*L*Math.cos(el)); const s1=pf(Math.cos(a+1.4)*0.05,0.93,Math.sin(a+1.4)*0.05), s2=pf(Math.cos(a-1.4)*0.05,0.93,Math.sin(a-1.4)*0.05); Hd.tri(s1,s2,tip,[0,0],[1,0],[0.5,1],lin('#5f7d58'),[Math.cos(a),0.5,Math.sin(a)]); Hd.tri(s2,s1,tip,[0,0],[1,0],[0.5,1],lin('#5f7d58'),[-Math.cos(a),0.5,-Math.sin(a)]); }
    addCollider(q[0],q[2],ang,0.6,0.6,y-1,y+1.3); }
  // white bicycle with a flower basket
  { const x=11.1, z=2.6; const y=gy(x,z); const b=bikeAt(Mt,W3,x,z,y,Math.PI/2+0.25,lin('#f2f2ee'),true); const P=b.P; Cl.box(frame(...(()=>{ const q=P(0.62,0,1.0); return [q[0],q[2]]; })(),ang+Math.PI/2+0.25,y),-0.14,0.14,0.95,1.12,-0.18,0.18,lin('#b58a55'));
    for(let k=0;k<7;k++){ const q=P(0.62+rnd(-0.1,0.1),rnd(-0.14,0.14),1.16); const g2=new THREE.IcosahedronGeometry(0.06,0); const pos=g2.attributes.position; for(let i=0;i<pos.count;i+=3){ const Q=[0,1,2].map(kk=>[q[0]+pos.getX(i+kk),q[1]+pos.getY(i+kk),q[2]+pos.getZ(i+kk)]); Hd.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],lin(k%3?'#d8344a':'#f07aa0'),[0,1,0]); } } const q=f(x,0,z); addCollider(q[0],q[2],ang+0.25,0.5,1.8,y-1,y+1.2); }
}
