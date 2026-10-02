/* ===================== Studio apartman "Kod Ruže" (yard behind the café) ===================== */
function kodRuzeTex(){ const W=1024,H=420, c=cvs(W,H), g=c.getContext('2d'); g.clearRect(0,0,W,H);
  g.beginPath(); g.moveTo(20,60); for(let x=20;x<=W-20;x+=40) g.lineTo(x,56+Math.sin(x*0.02)*10+rnd(-4,4)); g.lineTo(W-14,70); g.lineTo(W-22,H-60); for(let x=W-22;x>=20;x-=40) g.lineTo(x,H-64+Math.sin(x*0.03)*8+rnd(-3,3)); g.closePath();
  const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#d98e3e'); gr.addColorStop(0.5,'#e6a454'); gr.addColorStop(1,'#c77c32'); g.fillStyle=gr; g.fill(); g.save(); g.clip();
  for(let i=0;i<60;i++){ g.strokeStyle=`rgba(120,60,20,${rnd(0.08,0.22)})`; g.lineWidth=rnd(1,3); g.beginPath(); const y=rnd(60,H-60); g.moveTo(0,y); g.bezierCurveTo(W*0.3,y+rnd(-12,12),W*0.7,y+rnd(-12,12),W,y+rnd(-10,10)); g.stroke(); } g.restore();
  g.fillStyle='#6d1414'; g.strokeStyle='#3a0808'; g.lineWidth=3; g.font='italic 700 150px "Brush Script MT", "Segoe Script", Georgia, cursive'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('Kod Ruže',W*0.58,H*0.54); g.strokeText('Kod Ruže',W*0.58,H*0.54);
  g.save(); g.translate(150,H*0.5); g.rotate(-0.5); g.fillStyle='#6d1414'; for(let k=0;k<6;k++){ g.beginPath(); g.ellipse(Math.cos(k)*12,-40+Math.sin(k)*10,34-k*3,22-k*2,k,0,TAU); g.fill(); } g.fillRect(-4,-10,8,110); g.beginPath(); g.ellipse(24,40,24,10,-0.6,0,TAU); g.fill(); g.restore();
  return mkTex(c,{repeat:false}); }
function apartment(cs,scene,b){
  const [cx,cz,a0]=b.rect; const ang=a0-Math.PI/2; const F=frame(cx,cz,ang); const y0=b.hmax+0.12, yb=b.hmin-0.6; b.y0=y0;
  const g=(k)=>cs.get(k,cx,cz); const G=g('wall'), T=g('trim'), Wd=g('wood'), Mt=g('metal'), Gs=g('glass'), Cl=g('cloth'), Hd=g('hedge'), St=g('stonem'), Fl=g('floorT'), Lm=g('lamin'), Tw=g('tileW'), Dv=g('duvet'), Rd=g('roseDecal'), Ch=g('chrome'), Gl=g('glow'), Wt=g('bottle'), BG=g('blackGlass'), Pn=g('pine');
  const H={wall:G,trim:T,glass:g('glassW'),slats:g('slats')};
  const EXT=lin('#eef0ee'), REV=lin('#e2e4e2'), WOODF=lin('#7a4a24'), BLIND=lin('#484d53'), WHT=lin('#f4f4f1'), e=y0+2.75, pitch=40, /* white, steep gable with a wooden balcony facing the gate (Street View "38 Tuhelj") */ rt=e+3.2*Math.tan(pitch*Math.PI/180);
  const win=(m,h,o={})=>rectWindow(H,m,h,Object.assign({wc:EXT,rc:REV,fc:WOODF,cols:2,dep:0.22,fw:0.08,sc:lin('#d9d7d0'),shutter:{k:0.5,col:BLIND},gv:'plain'},o));
  // ---- outer walls with openings ----
  const A=[-6.0,3.2], B=[2.2,3.2], C=[2.2,-3.2], D=[-6.0,-3.2];
  const mF=segMap(F,ang,A,B), mE=segMap(F,ang,B,C), mB=segMap(F,ang,C,D), mW=segMap(F,ang,D,A);
  const hF=[holeRect(1.0,2.2,y0+0.95,y0+2.05),holeRect(4.55,5.45,y0,y0+2.15)], hE=[holeRect(1.0,2.2,y0+0.95,y0+2.05),holeRect(4.3,5.3,y0+1.1,y0+2.0)], hB=[holeRect(6.35,7.25,y0+1.3,y0+2.0)];
  const gab=(m)=>[[0,yb],[m.L,yb],[m.L,e],[m.L/2,rt],[0,e]], rect=(m)=>[[0,yb],[m.L,yb],[m.L,e],[0,e]];
  facadeSeg(G,mF,rect(mF),hF,EXT); facadeSeg(G,mE,gab(mE),hE,EXT); facadeSeg(G,mB,rect(mB),hB,EXT); const hW=[holeRect(2.55,3.85,y0+0.95,y0+2.05),holeRect(2.65,3.75,e-0.12,e+1.95)]; facadeSeg(G,mW,gab(mW),hW,EXT);
  win(mF,hF[0],{rows:2}); win(mE,hE[0],{rows:2,shutter:{k:0.35,col:BLIND}}); win(mE,hE[1],{shutter:{k:0.6,col:BLIND}}); win(mB,hB[0],{cols:1,shutter:{k:0.7,col:lin('#d9d6cf')}});
  win(mW,hW[0],{shutter:{k:0.25,col:BLIND}}); win(mW,hW[1],{cols:2,shutter:{k:0.8,col:lin('#3b3e42')},sill:false});
  { const Tt=mW.T, bw0=1.85, bw1=4.55, by=e-0.2, bd=1.05, BR=lin('#6e4526');
    Wd.box(Tt,bw0,bw1,by-0.14,by,0,bd,BR,0.8); addFloor(F,ang,-6-bd,-6,bw0-3.2,bw1-3.2,by); // walkable balcony slab
    for(let s2=bw0+0.1;s2<=bw1-0.05;s2+=0.21) Wd.box(Tt,s2-0.04,s2+0.04,by,by+0.92,bd-0.05,bd-0.02,BR,0.8);
    for(const sz of [bw0,bw1]) for(let o2=0.12;o2<bd-0.05;o2+=0.21) Wd.box(Tt,sz-0.025,sz+0.025,by,by+0.92,o2-0.04,o2+0.04,BR,0.8);
    Wd.box(Tt,bw0-0.03,bw1+0.03,by+0.92,by+1.0,bd-0.09,bd+0.01,BR,0.8); for(const sz of [bw0,bw1]) Wd.box(Tt,sz-0.04,sz+0.04,by+0.92,by+1.0,0,bd,BR,0.8);
    for(const sz of [bw0+0.15,bw1-0.15]) beam(Wd,mW.P(sz,by-0.7,-0.02),mW.P(sz,by-0.14,-bd*0.8),0.05,BR);
    // small awning over the ground-floor window
    Mt.quad(Tt(2.35,y0+2.45,0.02),Tt(4.05,y0+2.45,0.02),Tt(4.05,y0+2.2,0.62),Tt(2.35,y0+2.2,0.62),[0,0],[1,0],[1,1],[0,1],lin('#c9cbcc'),mW.W(0,1,0.4)); }
  for(const [m,gaps] of [[mF,[[4.53,5.47]]],[mE,[]],[mB,[]],[mW,[]]]) plinthSeg(g('plinth'),m,yb,y0+0.25,gaps,lin('#8f969c'));
  // entrance: wooden door with glass, open inwards
  { const h=hF[1]; reveal(G,mF,h,0,0.22,REV); frameRing(T,mF,h,0.07,0.02,0.2,WOODF); const hp=F(-1.45,0,3.0); const lf=frame(hp[0],hp[2],ang+Math.atan2(-0.94,0.342),0);
    Wd.box(lf,0,0.88,y0,y0+2.08,-0.03,0.03,lin('#8a5428'),0.8); Gs.box(lf,0.12,0.76,y0+0.95,y0+1.95,-0.035,0.035,WHITE); Mt.box(lf,0.74,0.8,y0+1.0,y0+1.04,-0.07,0.07,lin('#c9a54a')); }
  // gable roof, gutter, rooster weathervane
  const fh=frame(...(()=>{ const p=F(-1.9,0,0); return [p[0],p[2]]; })(),ang); emitRoof(cs,fh,ang,4.1,3.2,e,'gable',pitch,0.5,0.45,lin('#8a6150'),lin('#5e3f2a'));
  for(const sz of [-1,1]){ const ey=e-0.5*Math.tan(pitch*Math.PI/180)-0.1; Mt.box(fh,-4.6,4.6,ey-0.14,ey,sz*3.7-0.07,sz*3.7+0.07,lin('#8d9297')); }
  { const rp=fh(0,0,0); const vf=frame(rp[0],rp[2],ang,0); Mt.cyl(vf,0.02,0.02,rt+0.05,rt+0.9,6,lin('#2e2e2e'),1,false);
    const sh=new THREE.Shape(); const R=[[-0.22,0],[0.18,0],[0.26,0.1],[0.22,0.24],[0.3,0.34],[0.24,0.38],[0.2,0.3],[0.12,0.34],[0.08,0.2],[-0.1,0.18],[-0.2,0.42],[-0.3,0.32],[-0.3,0.12]]; sh.moveTo(R[0][0],R[0][1]); for(const p of R) sh.lineTo(p[0],p[1]);
    const geo=new THREE.ExtrudeGeometry(sh,{depth:0.02,bevelEnabled:false}); const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x2a2a2a,metalness:0.6,roughness:0.5})); m.position.set(rp[0],rt+0.62,rp[2]); m.rotation.y=-ang+0.6; m.castShadow=true; scene.add(m); }
  // wall lamp, house number, "Kod Ruže" sign with a pink rose
  { const p=mF.P(3.35,0,-0.02); const lf=frame(p[0],p[2],ang,0); T.box(lf,-0.08,0.08,y0+2.02,y0+2.3,-0.02,0.14,lin('#2a2a2a')); Gl.box(lf,-0.06,0.06,y0+2.06,y0+2.24,0.02,0.12,lin('#ffd98a')); }
  segSign(scene,mF,signTex(['30'],{w:256,h:192,bg:'#1d3f7a',fg:'#ffffff',border:'#ffffff',bw:6,size:110}),0.22,0.17,0.45,y0+1.05,0.05);
  segSign(scene,mF,kodRuzeTex(),1.05,0.43,6.55,y0+1.6,0.05);
  { const p=mF.P(6.55,0,-0.1); const rf=frame(p[0],p[2],ang,y0+1.86); const gg=new THREE.IcosahedronGeometry(0.1,1); const pos=gg.attributes.position; for(let i=0;i<pos.count;i+=3){ const Q=[0,1,2].map(k=>rf(pos.getX(i+k)*1.1,pos.getY(i+k)*0.8,pos.getZ(i+k))); Cl.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],lin('#b8707a'),[0,1,0]); }
    for(const sx of [-0.48,0.48]) beam(Mt,mF.P(6.55+sx,y0+1.82,-0.03),mF.P(6.55+sx,y0+2.1,-0.01),0.006,lin('#4a3a2a')); }
  // collisions: walls with the entrance gap
  const Y0=y0-3, Y1=y0+8; localCollider(F,ang,-6.0,-1.45,2.95,3.2,Y0,Y1); localCollider(F,ang,-0.55,2.2,2.95,3.2,Y0,Y1); localCollider(F,ang,-6.0,2.2,-3.2,-2.95,Y0,Y1); localCollider(F,ang,-6.0,-5.75,-3.2,3.2,Y0,Y1); localCollider(F,ang,1.95,2.2,-3.2,3.2,Y0,Y1);
  // ---- pergola (dark timber) with tiles, hot tub, flowers ----
  { const DW=lin('#4a3222'); const px0=2.2, px1=6.7, pz0=-3.3, pz1=3.3; const yT=y0+2.42, yH=e-0.08;
    for(const [x,z] of [[6.45,3.05],[6.45,0],[6.45,-3.05],[3.9,3.05]]){ const p=F(x,0,z); Wd.box(frame(p[0],p[2],ang,0),-0.075,0.075,y0-0.1,yT,-0.075,0.075,DW,0.8); addCollider(p[0],p[2],ang,0.2,0.2,y0-1,yT); }
    Wd.box(F,px0,px1,yT-0.22,yT,2.98,3.12,DW,0.8); Wd.box(F,6.38,6.52,yT-0.22,yT,pz0,pz1,DW,0.8); Wd.box(F,px0,px1,yT-0.22,yT,-3.12,-2.98,DW,0.8);
    for(let z=pz0+0.2;z<=pz1;z+=0.82) beam(Wd,F(px0,yH,z),F(px1+0.2,yT+0.02,z),0.06,DW);
    for(const [x,z,dx,dz] of [[6.45,3.05,-1,0],[6.45,0,0,1],[6.45,0,0,-1],[3.9,3.05,-1,0],[3.9,3.05,1,0],[6.45,-3.05,-1,0]]) beam(Wd,F(x,yT-0.8,z),F(x+dx*0.65,yT-0.2,z+dz*0.65),0.045,DW);
    const RB=g('roofB'); const r0=[px0,yH+0.1], r1=[px1+0.35,yT+0.12]; RB.quad(F(r0[0],r0[1],pz0-0.2),F(r1[0],r1[1],pz0-0.2),F(r1[0],r1[1],pz1+0.2),F(r0[0],r0[1],pz1+0.2),[0,0],[(r1[0]-r0[0])/1.25,0],[(r1[0]-r0[0])/1.25,(pz1-pz0)/1.25],[0,(pz1-pz0)/1.25],lin('#f2e2da'),[0,1,0]);
    Pn.quad(F(r0[0],r0[1]-0.03,pz0-0.2),F(r1[0],r1[1]-0.03,pz0-0.2),F(r1[0],r1[1]-0.03,pz1+0.2),F(r0[0],r0[1]-0.03,pz1+0.2),[0,0],[3,0],[3,5],[0,5],lin('#9a6a45'),[0,-1,0]);
    Mt.box(F,r1[0]-0.02,r1[0]+0.12,r1[1]-0.12,r1[1],pz0-0.2,pz1+0.2,lin('#8d9297')); { const p=F(r1[0]+0.05,0,pz1+0.12); Mt.box(frame(p[0],p[2],ang,0),-0.045,0.045,y0-0.1,r1[1]-0.05,-0.045,0.045,lin('#8d9297')); }
    floorPoly(Fl,F,[[px0,pz0-0.1],[px1+0.2,pz0-0.1],[px1+0.2,pz1+0.1],[px0,pz1+0.1]],y0-0.08,lin('#cfd1d3'),1.0); addFloor(F,ang,px0,px1+0.2,pz0-0.1,pz1+0.1,y0-0.08);
    // round hot tub
    { const p=F(4.55,0,-0.8); const tf=frame(p[0],p[2],ang,y0-0.08); lathe(Cl,tf,[[0.92,0],[0.97,0.35],[0.96,0.7],[0.88,0.74],[0,0.72]],28,lin('#352f2a')); lathe(Wt,tf,[[0.8,0.66],[0,0.66]],24,lin('#7fc6d4')); for(let k=0;k<6;k++) lathe(Cl,tf,[[0.975,0.1+k*0.1],[0.99,0.14+k*0.1],[0.975,0.18+k*0.1]],28,lin(k%2?'#2c2723':'#403832')); addCollider(p[0],p[2],ang,1.9,1.9,y0-1,y0+0.8); }
    // hanging geraniums, stone planter, yucca, white oven with chimney, stone garden wall
    for(const x of [3.1,5.3]){ const p=F(x,0,3.05); const hf=frame(p[0],p[2],ang,0); beam(Mt,hf(0,yT-0.22,0),hf(0,yT-0.62,0),0.006,lin('#333')); lathe(Cl,hf,[[0.08,yT-0.95],[0.15,yT-0.72],[0.16,yT-0.68],[0,yT-0.7]],12,lin('#b8653d'));
      for(let k=0;k<10;k++){ const q=hf(rnd(-0.16,0.16),yT-0.62+rnd(0,0.14),rnd(-0.16,0.16)); const gg=new THREE.IcosahedronGeometry(0.06,0); const pos=gg.attributes.position; for(let i=0;i<pos.count;i+=3){ const Q=[0,1,2].map(kk=>[q[0]+pos.getX(i+kk),q[1]+pos.getY(i+kk),q[2]+pos.getZ(i+kk)]); Hd.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],lin(k%3?'#c81d2a':'#3f7a33'),[0,1,0]); } } }
    { const p=F(3.2,0,3.85); const sf=frame(p[0],p[2],ang,getHeight(p[0],p[2])); St.box(sf,-0.5,0.5,0,0.42,-0.25,0.25,lin('#cfc6b4'),0.8); for(let k=0;k<5;k++){ const q=sf(-0.35+k*0.18,0.5,0); lathe(Hd,frame(q[0],q[2],ang,q[1]),[[0.09,0],[0.07,0.12],[0,0.14]],6,lin(k%2?'#d8344a':'#4f7d34')); } addCollider(p[0],p[2],ang,1.0,0.5,-1e4,1e4); }
    { const p=F(6.35,0,4.15); const y=getHeight(p[0],p[2]); const yf=frame(p[0],p[2],ang,y); lathe(Cl,yf,[[0.2,0],[0.3,0.5],[0.33,0.52],[0,0.5]],14,lin('#b8653d'));
      for(let k=0;k<22;k++){ const a=k/22*TAU, L=rnd(0.6,0.95), el=rnd(0.6,1.35); const tip=yf(Math.cos(a)*L*Math.cos(el),0.5+L*Math.sin(el),Math.sin(a)*L*Math.cos(el)); const s1=yf(Math.cos(a+1.5)*0.035,0.52,Math.sin(a+1.5)*0.035), s2=yf(Math.cos(a-1.5)*0.035,0.52,Math.sin(a-1.5)*0.035); Hd.tri(s1,s2,tip,[0,0],[1,0],[0.5,1],lin('#4f7d34'),[Math.cos(a),0.4,Math.sin(a)]); Hd.tri(s2,s1,tip,[0,0],[1,0],[0.5,1],lin('#4f7d34'),[-Math.cos(a),0.4,-Math.sin(a)]); } addCollider(p[0],p[2],ang,0.7,0.7,y-1,y+1.3); }
    { const p=F(7.35,0,-2.3); const y=getHeight(p[0],p[2]); const of=frame(p[0],p[2],ang,y); T.box(of,-0.45,0.45,0,0.95,-0.45,0.45,lin('#ecebe6')); lathe(T,of,[[0.45,0.95],[0.38,1.2],[0.18,1.35],[0,1.36]],12,lin('#ecebe6')); Mt.cyl(of,0.12,0.12,1.3,2.75,10,lin('#e8e8e4'),1,false); Mt.box(of,-0.18,0.18,2.75,2.8,-0.18,0.18,lin('#6d7176')); Mt.box(of,-0.14,0.14,2.86,2.9,-0.14,0.14,lin('#6d7176')); addCollider(p[0],p[2],ang,1.0,1.0,y-1,y+2.9); }
    { const y=getHeight(...(()=>{ const p=F(5,0,-3.7); return [p[0],p[2]]; })()); St.box(F,px0,7.9,y-0.3,y+1.0,-3.85,-3.55,lin('#b9b2a4'),0.7); St.box(F,7.6,7.9,y-0.3,y+1.0,-3.85,-1.4,lin('#b9b2a4'),0.7); localCollider(F,ang,px0,7.9,-3.85,-3.55,-1e4,1e4); localCollider(F,ang,7.6,7.9,-3.85,-1.4,-1e4,1e4); }
    // paved path in front of the house
    floorPoly(Fl,F,[[-6.3,3.2],[2.2,3.2],[2.2,4.8],[-6.3,4.8]],y0-0.1,lin('#a4a8ad'),0.5); addFloor(F,ang,-6.3,2.2,3.2,4.8,y0-0.1); addFloor(F,ang,-1.45,-0.55,2.9,3.4,y0);
  }
  /* ---------- interior ---------- */
  const X0=-5.8, X1=2.0, Z0=-3.0, Z1=3.0, yc=y0+2.55, pz=-0.35, th=0.2;
  innerWall(G,F,ang,A,B,th,y0-0.01,yc,hF,WHT); innerWall(G,F,ang,B,C,th,y0-0.01,yc,hE,WHT); innerWall(G,F,ang,C,D,th,y0-0.01,yc,hB,WHT); innerWall(G,F,ang,D,A,th,y0-0.01,yc,[],WHT);
  ceilPoly(G,F,[[X0,Z0],[X1,Z0],[X1,Z1],[X0,Z1]],yc,lin('#f7f7f5'));
  floorPoly(Lm,F,[[X0,pz],[X1,pz],[X1,Z1],[X0,Z1]],y0+0.005,lin('#d6d2cc'),1.4,Math.PI/2); floorPoly(Lm,F,[[-1.85,Z0],[X1,Z0],[X1,pz],[-1.85,pz]],y0+0.005,lin('#d6d2cc'),1.4,Math.PI/2); floorPoly(Lm,F,[[X0,Z0],[-1.95,Z0],[-1.95,pz],[X0,pz]],y0+0.005,lin('#a57f5c'),1.2,Math.PI/2);
  addFloor(F,ang,X0,X1,Z0,Z1,y0);
  // partitions: front/back with two doors, bath/bedroom
  { const dB=[-3.1,-2.3], dR=[-0.6,0.2]; for(const [a,c] of [[[X0,pz+0.05],[X1,pz+0.05]],[[X1,pz-0.05],[X0,pz-0.05]]]){ const m=segMap(F,ang,a,c); const toS=(x)=>a[0]<c[0]?x-a[0]:a[0]-x; const hs=[dB,dR].map(d=>{ const s0=Math.min(toS(d[0]),toS(d[1])), s1=Math.max(toS(d[0]),toS(d[1])); return holeRect(s0,s1,y0,y0+2.05); }); facadeSeg(G,m,[[0,y0-0.01],[m.L,y0-0.01],[m.L,yc],[0,yc]],hs,WHT); }
    for(const d of [dB,dR]){ G.box(F,d[0],d[1],y0+2.05,y0+2.06,pz-0.05,pz+0.05,WHT); for(const x of d) G.box(F,x-0.005,x+0.005,y0,y0+2.05,pz-0.05,pz+0.05,WHT); }
    localCollider(F,ang,X0,dB[0],pz-0.06,pz+0.06,y0-1,yc); localCollider(F,ang,dB[1],dR[0],pz-0.06,pz+0.06,y0-1,yc); localCollider(F,ang,dR[1],X1,pz-0.06,pz+0.06,y0-1,yc);
    for(const [a,c] of [[[-1.9,Z0],[-1.9,pz-0.05]],[[-1.9,pz-0.05],[-1.9,Z0]]]){ const m=segMap(F,ang,[a[0]+(a[1]<c[1]?0.05:-0.05),a[1]],[c[0]+(a[1]<c[1]?0.05:-0.05),c[1]]); facadeSeg(G,m,[[0,y0-0.01],[m.L,y0-0.01],[m.L,yc],[0,yc]],[],WHT); } localCollider(F,ang,-1.95,-1.85,Z0,pz,y0-1,yc);
    // interior doors (white, open)
    for(const [d,dir] of [[dB,[0.2,-0.98]],[dR,[0.2,-0.98]]]){ const hp=F(d[0]+0.02,0,pz-0.05); const lf=frame(hp[0],hp[2],ang+Math.atan2(dir[1],dir[0]),0); T.box(lf,0,0.76,y0,y0+2.02,-0.02,0.02,lin('#f5f5f2')); Mt.box(lf,0.66,0.72,y0+1.0,y0+1.03,-0.05,0.05,lin('#c9ccd0')); }
    // bathroom wall tiles
    const tile=(m,holes)=>texPoly(Tw,m,[[0,y0],[m.L,y0],[m.L,yc-0.01],[0,yc-0.01]],holes,WHITE,(p)=>[p[0]/1.2,(p[1]-y0)/1.2]);
    tile(segMap(F,ang,[X0+0.01,Z0+0.01],[-1.96,Z0+0.01]),[holeRect(-5.05-X0-0.01,-4.15-X0-0.01,y0+1.3,y0+2.0)]); tile(segMap(F,ang,[X0+0.01,pz-0.06],[X0+0.01,Z0]),[]); tile(segMap(F,ang,[-1.96,pz-0.061],[X0,pz-0.061]),[holeRect(-1.96-dB[1],-1.96-dB[0],y0,y0+2.05)]); tile(segMap(F,ang,[-1.961,Z0],[-1.961,pz-0.06]),[]);
  }
  // kitchen: tall oven column, base run with wooden top and backsplash, hob, sink, black hood, fridge
  { const KW=lin('#f4f4f2'), WT=lin('#b98a55'); T.box(F,X0,X0+0.62,y0,y0+2.2,pz+0.06,0.4,KW); BG.box(F,X0+0.62,X0+0.63,y0+0.95,y0+1.5,-0.18,0.3,WHITE); Ch.box(F,X0+0.62,X0+0.66,y0+1.42,y0+1.45,-0.12,0.24,WHITE);
    T.box(F,X0,X0+0.6,y0,y0+0.86,0.4,2.3,KW); for(const z of [0.95,1.6,2.25]) T.box(F,X0+0.6,X0+0.605,y0+0.1,y0+0.8,z-0.62,z-0.02,lin('#e9e9e6')); Pn.box(F,X0,X0+0.64,y0+0.86,y0+0.9,0.4,2.3,lin('#e7c08a'),0.8); Pn.box(F,X0,X0+0.02,y0+0.9,y0+1.5,0.4,2.3,lin('#e7c08a'),0.8);
    BG.box(F,X0+0.08,X0+0.55,y0+0.9,y0+0.905,0.55,1.15,WHITE); BG.box(F,X0+0.12,X0+0.5,y0+0.9,y0+0.91,1.55,1.95,WHITE); beam(Mt,F(X0+0.1,y0+0.9,1.75),F(X0+0.12,y0+1.2,1.75),0.012,lin('#111')); beam(Mt,F(X0+0.12,y0+1.2,1.75),F(X0+0.28,y0+1.2,1.75),0.012,lin('#111'));
    BG.box(F,X0,X0+0.5,y0+1.62,y0+1.7,0.55,1.15,WHITE); BG.box(F,X0,X0+0.08,y0+1.7,y0+2.1,0.55,1.15,WHITE); BG.box(F,X0,X0+0.24,y0+2.1,yc,0.75,0.95,WHITE);
    for(const z of [0.6,1.0]) Gl.box(F,X0+0.1,X0+0.2,y0+1.12,y0+1.2,z-0.06,z+0.06,lin('#ffd38a'));
    T.box(F,X0,X0+0.66,y0,y0+1.45,2.35,2.96,KW); localCollider(F,ang,X0,X0+0.66,pz,Z1,y0-1,y0+2.3);
    // island with wooden top + two grey stools, cage pendant lamps, rose wall decals
    T.box(F,-4.45,-3.85,y0,y0+0.88,0.6,1.95,KW); Pn.box(F,-4.5,-3.62,y0+0.88,y0+0.93,0.55,2.0,lin('#e7c08a'),0.8); localCollider(F,ang,-4.5,-3.62,0.55,2.0,y0-1,y0+1);
    for(const z of [0.95,1.62]){ const p=F(-3.3,0,z); const sf=frame(p[0],p[2],ang+Math.PI/2,y0); Mt.cyl(sf,0.2,0.2,0,0.03,14,lin('#141414'),1,true); Mt.cyl(sf,0.03,0.03,0.03,0.66,8,lin('#141414'),1,false); lathe(Mt,sf,[[0.15,0.3],[0.16,0.32],[0.15,0.34]],12,lin('#141414'));
      lathe(Cl,sf,[[0,0.66],[0.2,0.67],[0.23,0.74],[0.24,0.82],[0.22,0.84],[0.2,0.76],[0,0.76]],14,lin('#55595e')); Cl.box(sf,-0.2,0.2,0.74,1.0,0.14,0.2,lin('#55595e')); addCollider(p[0],p[2],ang,0.45,0.45,y0-1,y0+1); }
    for(const z of [0.95,1.6]){ const p=F(-4.05,0,z); const lf=frame(p[0],p[2],ang,0); beam(Mt,lf(0,yc,0),lf(0,yc-0.4,0),0.004,lin('#111')); for(let k=0;k<6;k++){ const a=k/6*TAU; beam(Mt,lf(0,yc-0.4,0),lf(Math.cos(a)*0.08,yc-0.52,Math.sin(a)*0.08),0.004,lin('#111')); beam(Mt,lf(Math.cos(a)*0.08,yc-0.52,Math.sin(a)*0.08),lf(0,yc-0.68,0),0.004,lin('#111')); } Gl.box(lf,-0.03,0.03,yc-0.6,yc-0.54,-0.03,0.03,lin('#ffe2a0')); }
    { const m=segMap(F,ang,[-2.8,Z1-0.01],[-4.1,Z1-0.01]); texPoly(Rd,m,[[0,y0+1.15],[m.L,y0+1.15],[m.L,y0+1.8],[0,y0+1.8]],[],WHITE,(p)=>[p[0]/m.L,(p[1]-y0-1.15)/0.65]); }
  }
  // living corner: grey corner sofa under the window, round white table, TV, dome pendant, topiary with fairy lights, picture
  { const SC=lin('#4d5156'); Cl.box(F,1.2,X1,y0,y0+0.45,0.05,2.6,SC); Cl.box(F,X1-0.24,X1,y0+0.45,y0+0.88,0.05,2.6,SC); for(const z of [0.35,1.2,2.05]) Cl.box(F,X1-0.38,X1-0.22,y0+0.45,y0+0.85,z-0.4,z+0.4,lin('#55595f'));
    Cl.box(F,1.2,X1,y0+0.45,y0+0.68,0.05,0.25,SC); Cl.box(F,0.4,1.2,y0,y0+0.45,1.95,2.6,SC); Cl.box(F,0.4,1.2,y0+0.45,y0+0.66,2.42,2.6,SC); localCollider(F,ang,1.15,X1,0.05,2.6,y0-1,y0+0.9); localCollider(F,ang,0.4,1.2,1.95,2.6,y0-1,y0+0.7);
    { const p=F(0.55,0,1.05); const tf=frame(p[0],p[2],ang,y0); lathe(T,tf,[[0.25,0.44],[0.25,0.47],[0,0.47]],18,lin('#f2f0ea')); for(let k=0;k<3;k++){ const a=k/3*TAU; beam(Wd,tf(Math.cos(a)*0.18,0,Math.sin(a)*0.18),tf(Math.cos(a)*0.1,0.44,Math.sin(a)*0.1),0.015,lin('#caa77a')); } T.box(tf,-0.08,0.08,0.47,0.49,-0.02,0.02,lin('#111')); }
    { const m=segMap(F,ang,[1.7,pz+0.06],[0.5,pz+0.06]); const p=m.P(0.6,0,-0.01); const tvf=frame(p[0],p[2],ang,0); T.box(tvf,-0.58,0.58,y0+1.3,y0+1.98,-0.02,0.02,lin('#0c0d0f')); }
    { const p=F(0.8,0,1.3); const lf=frame(p[0],p[2],ang,0); beam(Mt,lf(0,yc,0),lf(0,yc-0.28,0),0.005,lin('#111')); lathe(Mt,lf,[[0.03,yc-0.28],[0.12,yc-0.34],[0.2,yc-0.44],[0.21,yc-0.5],[0,yc-0.48]],16,lin('#161616')); Gl.box(lf,-0.06,0.06,yc-0.52,yc-0.48,-0.06,0.06,lin('#fff4dc')); }
    { const p=F(1.72,0,2.72); const tf=frame(p[0],p[2],ang,y0); lathe(Cl,tf,[[0.14,0],[0.17,0.32],[0,0.32]],12,lin('#1a1a1a')); for(let k=0;k<26;k++){ const t2=k/26, a=t2*TAU*3.2, r=0.2*(1-t2*0.7); const q=tf(Math.cos(a)*r,0.35+t2*1.05,Math.sin(a)*r); const gg=new THREE.IcosahedronGeometry(0.075,0); const pos=gg.attributes.position; for(let i=0;i<pos.count;i+=3){ const Q=[0,1,2].map(kk=>[q[0]+pos.getX(i+kk),q[1]+pos.getY(i+kk),q[2]+pos.getZ(i+kk)]); Hd.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],lin('#2f4f28'),[0,1,0]); } if(k%3===0) Gl.box(frame(q[0],q[2],ang,0),-0.012,0.012,q[1]+0.05,q[1]+0.075,-0.012,0.012,lin('#fff0b0')); } }
    { const m=segMap(F,ang,[1.9,Z1-0.01],[0.9,Z1-0.01]); const p=m.P(0.5,0,-0.01); const pf=frame(p[0],p[2],ang,0); Wd.box(pf,-0.28,0.28,y0+1.35,y0+1.85,-0.02,0.02,lin('#5f7a6a')); T.box(pf,-0.22,0.22,y0+1.41,y0+1.79,-0.025,0.025,lin('#efe9d8')); }
  }
  // bedroom: upholstered bed with star duvet, white wardrobe, rug, ceiling light
  { const GC=lin('#5b5f64'); Cl.box(F,X1-0.12,X1,y0,y0+1.15,-2.5,-0.9,GC); Cl.box(F,0.0,X1-0.12,y0,y0+0.42,-2.45,-0.95,GC); T.box(F,0.02,X1-0.14,y0+0.42,y0+0.56,-2.43,-0.97,lin('#f1f1ee'));
    Dv.box(F,0.0,X1-0.55,y0+0.52,y0+0.62,-2.5,-0.9,WHITE,1.2); for(const z of [-2.1,-1.35]) Dv.box(F,X1-0.52,X1-0.16,y0+0.56,y0+0.78,z-0.33,z+0.33,lin('#6a6f76'),1.4); localCollider(F,ang,0.0,X1,-2.5,-0.9,y0-1,y0+1.2);
    T.box(F,-1.85,-1.25,y0,y0+2.15,-2.95,-1.75,lin('#f6f6f4')); for(const z of [-2.35,-2.25]) Mt.box(F,-1.25,-1.22,y0+1.0,y0+1.25,z-0.01,z+0.01,lin('#bbbbbb')); localCollider(F,ang,-1.85,-1.25,-2.95,-1.75,y0-1,y0+2.2);
    Cl.box(F,-0.9,-0.1,y0+0.005,y0+0.02,-2.3,-1.0,lin('#cdbd9f')); { const p=F(0.3,0,-1.7); Gl.box(frame(p[0],p[2],ang,0),-0.15,0.15,yc-0.04,yc,-0.15,0.15,lin('#fff8e6')); } }
  // bathroom: walk-in shower with glass, rain shower, vanity with vessel sink + mirror, wall-hung toilet, mats, ceiling lamp
  { const sx=-2.85; Gs.box(F,sx-0.01,sx+0.01,y0,y0+2.0,Z0,-1.55,WHITE); Ch.box(F,sx-0.015,sx+0.015,y0+1.98,y0+2.0,Z0,-1.55,WHITE); localCollider(F,ang,sx-0.03,sx+0.03,Z0,-1.55,y0-1,y0+2.1);
    beam(Ch,F(-2.15,y0+0.9,Z0+0.03),F(-2.15,y0+2.15,Z0+0.03),0.015,WHITE); beam(Ch,F(-2.15,y0+2.15,Z0+0.03),F(-2.15,y0+2.2,Z0+0.3),0.012,WHITE); lathe(Ch,frame(...(()=>{ const q=F(-2.15,0,Z0+0.32); return [q[0],q[2]]; })(),ang,y0+2.17),[[0.12,0],[0.12,0.015],[0,0.02]],16,WHITE); Cl.box(F,-2.8,-2.0,y0+0.006,y0+0.012,Z0+0.05,-1.6,lin('#3a3c3f'));
    T.box(F,-4.35,-3.55,y0+0.45,y0+0.85,Z0,Z0+0.46,lin('#f4f4f2')); Pn.box(F,-4.37,-3.53,y0+0.85,y0+0.88,Z0,Z0+0.48,lin('#e7c08a'),0.8); { const p=F(-3.95,0,Z0+0.25); lathe(T,frame(p[0],p[2],ang,y0+0.88),[[0.12,0],[0.2,0.08],[0.21,0.14],[0.19,0.14],[0,0.1]],18,lin('#fbfbfa')); } beam(Ch,F(-3.95,y0+0.88,Z0+0.03),F(-3.95,y0+1.12,Z0+0.03),0.012,WHITE); beam(Ch,F(-3.95,y0+1.12,Z0+0.03),F(-3.95,y0+1.12,Z0+0.15),0.01,WHITE);
    T.box(F,-4.3,-3.6,y0+1.2,y0+1.85,Z0,Z0+0.03,lin('#f2f2f0')); Ch.box(F,-4.24,-3.66,y0+1.26,y0+1.79,Z0+0.03,Z0+0.035,lin('#d9e2e6')); localCollider(F,ang,-4.37,-3.53,Z0,Z0+0.5,y0-1,y0+0.9);
    { const p=F(X0+0.3,0,-1.4); const tf=frame(p[0],p[2],ang+Math.PI/2,y0); T.box(tf,-0.18,0.18,0.3,0.42,-0.26,0.22,lin('#fbfbfa')); lathe(T,frame(...(()=>{ const q=tf(0,0,-0.02); return [q[0],q[2]]; })(),ang,y0+0.3),[[0.17,0],[0.19,0.1],[0.18,0.14],[0,0.14]],16,lin('#fbfbfa')); T.box(tf,-0.25,0.25,0.55,1.1,0.2,0.26,lin('#efefec')); addCollider(p[0],p[2],ang,0.5,0.6,y0-1,y0+0.6); }
    for(const [x,z] of [[-4.0,-1.55],[-5.1,-1.4]]){ const p=F(x,0,z); lathe(Cl,frame(p[0],p[2],ang,y0),[[0.3,0.005],[0.3,0.015],[0,0.015]],18,lin('#e8e0cc')); }
    { const p=F(-4.0,0,-1.6); lathe(Gl,frame(p[0],p[2],ang,0),[[0.18,yc],[0.18,yc-0.03],[0.14,yc-0.07],[0,yc-0.08]],16,lin('#fffaf0')); } }
  const lp=F(-2.0,0,8.5); LANDMARKS.apt={x:lp[0],z:lp[2],look:[cx,cz]}; LANDMARKS.aptF={F,ang};
}
