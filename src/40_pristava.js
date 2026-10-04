/* ===================== Pristava 82 (Street View "82 Pristava", kol 2025.) =====================
   By the main road at the Medeni brijeg turn: a salmon-pink house, its gable with the wooden balcony facing the road,
   a raised terrace with a brown picket railing along the gable, a dark brown door on the long side toward the driveway,
   white window surrounds, brown tiled roof and a red-roofed wing behind. North of it a dark-red timber carport with a car,
   gravel driveway from the road, fruit orchard and flower beds toward the road. */
const PRIST={H:[-688.9,135.2], garage:[-681.5,147.8]};
function pristavaLand(){ const h=D.bld.find(b=>b.k==='house'&&Math.hypot(b.r[0][0]-PRIST.H[0],b.r[0][1]-PRIST.H[1])<3); if(h){ h.st='pristava82'; h.n='Pristava 82'; }
  for(let i=D.bld.length-1;i>=0;i--){ const r=D.bld[i].r[0]; if(Math.hypot(r[0]-PRIST.garage[0],r[1]-PRIST.garage[1])<2.5) D.bld.splice(i,1); } /* no garage in front of the orchard (photo) */
  NOHEDGE.push([-672,138,24]); }
function pristavaHouse(cs,scene,b){ const [cx,cz]=b.rect; const ang=0; const F=frame(cx,cz,ang); const y0=b.hmax+0.15, yb=b.hmin-0.6; b.y0=y0;
  const g=(k)=>cs.get(k,cx,cz); const G=g('wall'), T=g('trim'), Wd=g('wood'), St=g('stonem'), Hd=g('hedge'), Mt=g('metal'); const Hh={wall:G,trim:T,glass:g('glassW'),slats:g('slats')};
  const PINK=lin('#efc9b4'), WHT=lin('#f5f3ee'), BROWN=lin('#4e2f22'), RAIL=lin('#5a3a2a'), ROOF=lin('#8a5a44'), SOF=lin('#6e4a36'), PL=lin('#c9c2b6');
  const hl=5.0, hw=4.2, pitch=42, e=y0+3.35, rt=e+hw*Math.tan(pitch*Math.PI/180);
  const A=[-hl,hw], B=[hl,hw], C=[hl,-hw], Dd=[-hl,-hw];
  const mF=segMap(F,ang,A,B), mE=segMap(F,ang,B,C), mB=segMap(F,ang,C,Dd), mW=segMap(F,ang,Dd,A);
  const gab=(m)=>[[0,yb],[m.L,yb],[m.L,e],[m.L/2,rt],[0,e]], rect=(m)=>[[0,yb],[m.L,yb],[m.L,e],[0,e]];
  const win=(m,h,o={})=>{ rectWindow(Hh,m,h,Object.assign({wc:PINK,rc:lin('#f3e6dc'),fc:WHT,cols:2,dep:0.2,fw:0.07,sc:WHT,gv:'sheer'},o)); surround(T,m,h,0.15,0.04,WHT); };
  const door=(m,h)=>{ reveal(G,m,h,0,0.2,lin('#f3e6dc')); surround(T,m,h,0.15,0.04,WHT); T.box(m.T,h[0][0],h[1][0],h[0][1],h[2][1],-0.2,-0.14,BROWN); };
  // east gable to the road: window, terrace door, window; balcony door above
  const hE=[holeRect(1.1,2.1,y0+0.95,y0+2.15),holeRect(3.3,4.2,y0+0.05,y0+2.2),holeRect(5.2,6.2,y0+0.95,y0+2.15),holeRect(3.25,5.15,y0+3.05,y0+5.05)];
  facadeSeg(G,mE,gab(mE),hE,PINK); win(mE,hE[0]); door(mE,hE[1]); win(mE,hE[2]); win(mE,hE[3],{cols:2,sill:false,gv:'plain'});
  // long side to the driveway: dark brown front door, two windows
  const hB=[holeRect(1.6,2.6,y0+0.05,y0+2.2),holeRect(4.4,5.4,y0+0.95,y0+2.15),holeRect(7.4,8.4,y0+0.95,y0+2.15)];
  facadeSeg(G,mB,rect(mB),hB,PINK); door(mB,hB[0]); win(mB,hB[1]); win(mB,hB[2]);
  const hF=[holeRect(1.6,2.6,y0+0.95,y0+2.15),holeRect(5,6,y0+0.95,y0+2.15),holeRect(7.8,8.8,y0+0.95,y0+2.15)]; facadeSeg(G,mF,rect(mF),hF,PINK); hF.forEach(h=>win(mF,h));
  const hW=[holeRect(3.7,4.7,y0+0.95,y0+2.15),holeRect(3.8,4.6,y0+3.3,y0+4.4)]; facadeSeg(G,mW,gab(mW),hW,PINK); hW.forEach(h=>win(mW,h));
  for(const m of [mF,mE,mB,mW]) plinthSeg(g('plinth'),m,yb,y0+0.3,[],PL);
  // white corner pilasters (photo)
  for(const [x,z] of [[hl,hw],[hl,-hw],[-hl,hw],[-hl,-hw]]){ const p=F(x,0,z); T.box(frame(p[0],p[2],ang,0),-0.12,0.12,y0+0.3,e,-0.12,0.12,WHT); }
  emitRoof(cs,F,ang,hl,hw,e,'gable',pitch,0.7,0.6,ROOF,SOF);
  localCollider(F,ang,-hl,hl,-hw,hw,yb-1,rt);
  // gable balcony: slab + dark picket railing
  { const Tt=mE.T, s0=2.75, s1=5.65, by=y0+2.95, bd=1.15; T.box(Tt,s0,s1,by-0.18,by,0,bd,lin('#d9d4cc'));
    for(let s=s0+0.08;s<s1;s+=0.12) Wd.box(Tt,s-0.02,s+0.02,by,by+1.0,bd-0.06,bd-0.02,RAIL); for(const s of [s0,s1]) for(let o=0.1;o<bd;o+=0.12) Wd.box(Tt,s-0.02,s+0.02,by,by+1.0,o-0.02,o+0.02,RAIL);
    Wd.box(Tt,s0,s1,by+1.0,by+1.06,bd-0.08,bd,RAIL); Wd.box(Tt,s0,s0+0.06,by+1.0,by+1.06,0,bd,RAIL); Wd.box(Tt,s1-0.06,s1,by+1.0,by+1.06,0,bd,RAIL); addFloor(F,ang,hl,hl+bd,-hw+s0,-hw+s1,by); }
  // raised terrace along the gable with the brown picket railing
  { const x0=hl, x1=hl+2.4, z0=-hw+0.6, z1=hw+0.3, ty=y0+0.02; St.box(F,x0,x1,yb,ty,z0,z1,lin('#cfc9bf')); addFloor(F,ang,x0,x1,z0,z1,ty);
    const rail=(ax,az,bx,bz)=>{ const L=Math.hypot(bx-ax,bz-az); for(let t=0;t<=L;t+=0.11){ const x=ax+(bx-ax)*t/L, z=az+(bz-az)*t/L; Wd.box(F,x-0.022,x+0.022,ty,ty+0.95,z-0.022,z+0.022,RAIL); } Wd.box(F,Math.min(ax,bx)-0.03,Math.max(ax,bx)+0.03,ty+0.92,ty+1.0,Math.min(az,bz)-0.03,Math.max(az,bz)+0.03,RAIL); };
    rail(x1,z0+1.2,x1,z1); rail(x0,z1,x1,z1); localCollider(F,ang,x1-0.05,x1+0.05,z0+1.2,z1,ty-1,ty+1); localCollider(F,ang,x0,x1,z1-0.05,z1+0.05,ty-1,ty+1);
    for(let k=0;k<3;k++) St.box(F,x0+0.2,x0+1.3,yb,ty-0.17*k,z0-0.35*(k+1),z0-0.35*k,lin('#cfc9bf')); }
  // red-roofed wing behind (west, toward the barn)
  { const wc=F(-hl+2.0,0,-hw-2.6); const wa=ang+Math.PI/2; const wf=frame(wc[0],wc[2],wa); const whl=2.8, whw=2.6, we=y0+3.0;
    emitWalls(cs,wf,wa,whl,whw,yb,we,'gable',38,PINK,'wall'); emitRoof(cs,wf,wa,whl,whw,we,'gable',38,0.5,0.45,lin('#b5523a'),SOF); localCollider(wf,wa,-whl,whl,-whw,whw,yb-1,we+2); }
  // flower bed along the long side, air-conditioner on the gable
  for(let k=0;k<18;k++){ const p=F(hl-0.5-k*0.45,0,-hw-0.55); lathe(Hd,frame(p[0],p[2],k,getHeight(p[0],p[2])),[[0.2,0],[0.16,0.25],[0,0.32]],6,lin(k%3===0?'#d8344a':k%3===1?'#e98a2a':'#4f7d34')); }
  { const Tt=mE.T; T.box(Tt,1.0,1.85,rt-1.7,rt-1.15,0,0.28,lin('#f2f2f0')); }
  pristavaYard(cs,scene,F,y0); }
function pristavaYard(cs,scene,F,y0){ const g=(k)=>cs.get(k,PRIST.H[0],PRIST.H[1]); const Wd=g('wood'), G=g('wall'), Hd=g('hedge'), St=g('stonem');
  // the long low garage east of the house, off the uphill side road (Street View "83 Pristava"): hipped tile roof,
  // toward the main road a timber part (lattice above, brown boards below), a white block wall with a window, boards at the end
  { const cx=-679.6, cz=127.6, a=Math.PI/2; const f=frame(cx,cz,a,0); const hl=4.8, hw=2.5; let y=1e9; for(const [x,z] of [[-hl,-hw],[hl,-hw],[-hl,hw],[hl,hw]]){ const p=f(x,0,z); y=Math.min(y,getHeight(p[0],p[2])); } const ye=y+2.55;
    const BLK=lin('#e4e2dc'), WOOD=lin('#6e4430'), WOOD2=lin('#7c4e36'), DARK=lin('#2e231c'), T=g('trim'), Gs=g('glassW');
    St.box(f,-hl,hl,y-0.6,ye,hw-0.22,hw,BLK,0.7); St.box(f,-hl,-hl+0.22,y-0.6,ye,-hw,hw,BLK,0.7); St.box(f,hl-0.22,hl,y-0.6,ye,-hw,hw,BLK,0.7); St.box(f,-hl,hl,y-0.6,y+0.02,-hw,hw,lin('#bdb9b0'),0.7);
    // east face (local z=-hw): boards at the north end, block wall with a window, timber with lattice toward the house
    for(let x=-hl;x<-3.5;x+=0.2) Wd.box(f,x,x+0.19,y,ye,-hw,-hw+0.06,((x+hl)/0.2|0)%2?WOOD:WOOD2,0.8);
    St.box(f,-3.5,0.35,y-0.6,ye,-hw,-hw+0.25,BLK,0.7); T.box(f,-2.25,-0.95,y+1.05,y+2.05,-hw-0.05,-hw+0.02,lin('#f6f6f2')); Gs.box(f,-2.15,-1.05,y+1.12,y+1.98,-hw-0.06,-hw-0.03,WHITE);
    Wd.box(f,0.35,hl,y,y+1.15,-hw,-hw+0.05,WOOD,0.8); Wd.box(f,0.35,hl,y+0.2,ye,-hw+0.35,-hw+0.4,DARK);
    for(const x of [0.35,2.55,hl-0.08]) Wd.box(f,x-0.08,x+0.08,y,ye,-hw-0.02,-hw+0.12,WOOD);
    Wd.box(f,0.35,hl,y+1.12,y+1.22,-hw-0.02,-hw+0.08,WOOD); Wd.box(f,0.35,hl,ye-0.2,ye,-hw-0.02,-hw+0.1,WOOD);
    for(let k=-12;k<=18;k++){ const x0=0.35+k*0.32; for(const sd of [1,-1]){ const ax=x0, bx=x0+sd*1.1; const cl=(v)=>Math.max(0.42,Math.min(hl-0.1,v)); const A=[cl(ax),y+1.22], B=[cl(bx),ye-0.2]; if(Math.abs(A[0]-B[0])<0.05) continue; beam(Wd,f(A[0],A[1],-hw+0.02),f(B[0],B[1],-hw+0.02),0.018,WOOD2); } }
    emitRoof(cs,f,a,hl,hw,ye,'hip',24,0.5,0.55,lin('#9a5a3c'),lin('#5a3b2a'));
    localCollider(f,a,-hl,hl,-hw,hw,y-1,ye+1.5); }
  // gravel driveway from the road to the carport and the forecourt
  if(typeof paveArea==='function'){ paveArea(scene,[[-657,124.5],[-657,137],[-676.8,137],[-676.8,124.5]],'gravel',{tile:5}); EXTRA_PARK.push([-670.5,130.5,0,'drive']); }
  // fruit orchard and flowers between the house and the road are planted in pristavaTrees()
  { const rd=ROADS.find(r=>r.t==='secondary'&&r.P.some(p=>Math.hypot(p[0]+648,p[1]-136)<4)); if(rd){ const RP=smoothCorners(rd.P,8,2); for(let k=0;k<40;k++){ const q=[-652-k*0.9,140+k*0.95]; const n=nearOnPoly(RP,q[0],q[1]); const dx=q[0]-n.x, dz=q[1]-n.z, l=Math.hypot(dx,dz)||1; const x=n.x+dx/l*(rd.w/2+2.4), z=n.z+dz/l*(rd.w/2+2.4); lathe(Hd,frame(x,z,k,getHeight(x,z)),[[0.3,0],[0.24,0.32],[0,0.42]],6,lin(k%3===0?'#e2672e':k%3===1?'#d8344a':'#527f36')); } } } /* flower bed along the road edge (photo) */ }
function pristavaTrees(){ const R=mulberry32(8282); let n=0; for(let x=-684;x<=-656;x+=6.5) for(let z=141;z<=170;z+=6.5){ const px=x+(R()-0.5)*2.5, pz=z+(R()-0.5)*2.5; if(!roadClear(px,pz,3)||BHASH.hit(px,pz,3)) continue; const h=3.6+R()*1.6; addTree(px,pz,h,h*0.95,colJ(new THREE.Color(R()<0.5?0x6d8f3e:0x5f8436),0.15),0); n++; } TREES.n=TREES.x.length; return n; }
