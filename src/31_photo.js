/* ===================== Tuhelj as in the photos: the family house opposite the church =====================
   OSM "Obiteljska kuća Slaviček" is the player's home. From its balcony you look south-east over a flat mown
   meadow to the church; a gravel lane with bins and a basketball hoop on a wooden lamp post runs past the front;
   the wooded hill rises right behind the house. The coarse elevation data had the house 28 m up the slope — fixed here. */
const PHOTO={};
function photoHouseRaw(){ return D.bld.find(b=>/Slavi/.test(b.n||'')); }
// 1) terrain (before road grading and building pads)
// the house stands close to the gravel lane (photo 6): pull the OSM footprint up to ~7 m from the lane
function photoMoveHouse(hb){ if(hb.moved) return; hb.moved=true; const lane=ROADS.find(r=>r.t==='unclassified'&&r.P.some(p=>Math.hypot(p[0]+434,p[1]+119)<12)); if(!lane) return; const r0=hb.r[0]; const n=nearOnPoly(lane.P,r0[0],r0[1]);
  // front parallel to the lane, ~7 m from its centre line (photo: the house stands right by the road)
  let nx=n.x-r0[0], nz=n.z-r0[1]; const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l; let a=Math.atan2(n.tz,n.tx); if(-Math.sin(a)*nx+Math.cos(a)*nz<0) a+=Math.PI; const da=a-r0[2];
  const cx=n.x-nx*12.0, cz=n.z-nz*12.0; const ox=r0[0], oz=r0[1]; const c=Math.cos(da), sn=Math.sin(da);
  for(const q of hb.r){ const dx=q[0]-ox, dz=q[1]-oz; q[0]=cx+dx*c-dz*sn; q[1]=cz+dx*sn+dz*c; q[2]+=da; } if(hb.dw){ hb.dw=[n.x,n.z]; } }
function photoTerrain(){ const hb=photoHouseRaw(); if(!hb) return; photoMoveHouse(hb); const H=[hb.r[0][0],hb.r[0][1]], C=[-326,-5];
  const ax=C[0]-H[0], az=C[1]-H[1], L=Math.hypot(ax,az), ux=ax/L, uz=az/L; const hC=173.3, hH=178.6;
  PHOTO.axis={H,C,L,ux,uz};
  for(let iz=0;iz<NZ;iz++) for(let ix=0;ix<NX;ix++){ const x=X0+ix*CELL, z=Z0+iz*CELL; const dx=x-H[0], dz=z-H[1]; const t=(dx*ux+dz*uz)/L, d=Math.abs(-dx*uz+dz*ux);
    if(t<-0.6||t>1.4||d>190) continue;
    // weight: flat core (yard → church road), the hill comes back behind the house and at the sides
    const wl=1-smooth(95,165,d), wb=1-smooth(-0.16,-0.42,t), wf=1-smooth(1.04,1.3,t); const w=Math.min(wl,t<0?wb:1,wf); if(w<=0) continue;
    const tt=clamp(t,0,1); let hT=hH+(hC-hH)*tt; if(t<0) hT=hH+(-t)*L*0.05; hT+=Math.sin(x*0.05)*0.15+Math.cos(z*0.043)*0.15;
    const k=iz*NX+ix; HEI[k]+=(hT-HEI[k])*w; } }
// trees: keep the view from the balcony over the meadow to the church open (photo 1); bushes along the ditch stay
function photoTrees(){ const A=PHOTO.axis; if(!A) return; const keep=[]; const n=TREES.x.length;
  for(let i=0;i<n;i++){ const dx=TREES.x[i]-A.H[0], dz=TREES.z[i]-A.H[1]; const t=(dx*A.ux+dz*A.uz)/A.L, d=(-dx*A.uz+dz*A.ux); const near=Math.hypot(dx,dz)<16&&t>-0.02;
    const corridor=t>0.03&&t<0.93&&Math.abs(d)<38&&!(TREES.t[i]===2&&TREES.h[i]<4); if(!(near||corridor)&&!noHedge(TREES.x[i],TREES.z[i])) keep.push(i); }
  for(const k of Object.keys(TREES)) TREES[k]=keep.map(i=>TREES[k][i]); }
// the hills around Tuhelj are wooded (photos / Street View): plant broadleaf woods on slopes and hilltops that
// OpenStreetMap leaves as bare grass — not in the village, fields, meadows, yards or on roads
function photoHillWoods(){ const MW=LAND.filter(l=>l.t==='meadow').map(l=>({P:l.P,bb:polyBBox(l.P)})); const R=mulberry32(4711); const rr=(a,b)=>a+(b-a)*R(); const S=9; let n=0;
  for(let x=CENTER[0]-1100;x<CENTER[0]+1100;x+=S) for(let z=CENTER[1]-900;z<CENTER[1]+900;z+=S){ const px=x+rr(-4,4), pz=z+rr(-4,4);
    if(px<X0+20||px>X0+GW-20||pz<Z0+20||pz>Z0+GH-20) continue; const h=getHeight(px,pz); const nrm=terrainNormal(px,pz); const sl=Math.sqrt(1-nrm[1]*nrm[1])/Math.max(0.2,nrm[1]);
    const patch=fbm2(px/140,pz/140,3,21); const want=(sl>0.32)||(h>196&&sl>0.12)||(h>215); if(!want||patch<0.36) continue;
    const m=mixAt(px,pz); if(m[1]>0.08||m[2]>0.4) continue; if(inFarmland(px,pz)) continue; if(MW.some(l=>px>l.bb[0]&&px<l.bb[1]&&pz>l.bb[2]&&pz<l.bb[3]&&pointInPoly(px,pz,l.P))) continue;
    if(BHASH.hit(px,pz,14)||!roadClear(px,pz,7)) continue; if(PHOTO.axis&&Math.hypot(px-PHOTO.axis.H[0],pz-PHOTO.axis.H[1])<30) continue;
    const con=fbm2(px/90,pz/90,2,33)>0.68; const hh=(con?rr(16,26):rr(12,21))*(0.85+0.3*patch); addTree(px,pz,hh,hh*(con?0.32:rr(0.8,1.1)),con?tcol(CONIF,0.2):tcol(BROAD,0.35),con?1:0); n++;
    if(R()<0.25) addTree(px+rr(-3,3),pz+rr(-3,3),rr(2,4.5),rr(2.5,4.5),tcol(BROAD,0.3),2); }
  TREES.n=TREES.x.length; return n; }
// 2) land use + the gravel lane
function photoLand(){ const A=PHOTO.axis; if(!A) return;
  // photo 1: right below the balcony there is only a low red-tiled outbuilding, not a two-storey house
  for(let i=D.bld.length-1;i>=0;i--){ const r=D.bld[i].r[0]; if(D.bld[i].k==='house'&&Math.hypot(r[0]+437,r[1]+131)<4) D.bld.splice(i,1); } /* not there in reality: the yard is paved */ const inMeadow=(x,z)=>{ const dx=x-A.H[0], dz=z-A.H[1]; const t=(dx*A.ux+dz*A.uz)/A.L, d=Math.abs(-dx*A.uz+dz*A.ux); return t>0.05&&t<1.0&&d<85; };
  // the street from the bus stop to the family house has no houses on its meadow side (Street View "41 Tuhelj"):
  // drop OSM houses between that lane and the meadow
  { const lane=ROADS.find(r=>r.t==='unclassified'&&r.P.some(p=>Math.hypot(p[0]+434,p[1]+119)<12)); if(lane){ const laneZ=(x)=>{ let best=null,bd=1e9; for(let i=0;i<lane.P.length-1;i++){ const a=lane.P[i], b=lane.P[i+1]; if((x-a[0])*(x-b[0])<=0){ const t=(x-a[0])/((b[0]-a[0])||1e-6); return a[1]+(b[1]-a[1])*t; } const d=Math.min(Math.abs(x-a[0]),Math.abs(x-b[0])); if(d<bd){ bd=d; best=Math.abs(x-a[0])<Math.abs(x-b[0])?a[1]:b[1]; } } return best; };
      for(let i=D.bld.length-1;i>=0;i--){ const q=D.bld[i]; if(q.n) continue; const r0=q.r[0]; if(r0[0]<-445||r0[0]>-280) continue; const lz=laneZ(r0[0]); if(lz===null) continue; if(r0[1]>lz+4&&r0[1]<lz+70) D.bld.splice(i,1); } } }
  // Kafić Putniku (Mapillary 296128785453428 from the north, 924510798093512 from the bus stop, Street View "6/28/38 Tuhelj"):
  // the white two-storey house stands with its long side on the road from the north (awnings over the ground-floor windows),
  // its north gable (diamond window) toward the walled yard, its south gable toward the junction; the grey arcaded annex
  // wraps the south end and runs east along the main road to the gravel lot with the bus stop.
  { const c=D.bld.find(q=>q.k==='cafe'); if(c){ const r=c.r[0]; let cx=-241.35, cz=-54.7; const A=Math.PI/2, ca=Math.cos(A), sa=Math.sin(A);
      // keep every corner of the house and the arcade off the carriageway and its pavement
      const LOC=[[-10.5,-5.25],[-10.5,4.25],[3.6,4.25],[8.4,4.0],[10.4,2.0],[10.4,-15.6],[3.6,-15.6],[0,4.25],[10.4,-6],[10.4,-11]]; const RS=ROADS.filter(q=>q.t==='secondary'&&q.P.some(p=>Math.hypot(p[0]+245,p[1]+50)<40)).map(q=>({P:smoothCorners(q.P,8,2),w:q.w}));
      const bad=(x0,z0)=>{ let J=0; for(const [lx,lz] of LOC){ const x=x0+ca*lx-sa*lz, z=z0+sa*lx+ca*lz; for(const R of RS){ const d=nearOnPoly(R.P,x,z).d; const need=R.w/2+1.9; if(d<need) J+=(need-d)**2; } } return J; };
      let best=[cx,cz], bj=bad(cx,cz); for(let dx=0;dx<=8;dx+=0.25) for(let dz=-8;dz<=2;dz+=0.25){ const j=bad(cx+dx,cz+dz)+0.002*(dx*dx+dz*dz); if(j<bj){ bj=j; best=[cx+dx,cz+dz]; } }
      cx=best[0]; cz=best[1]; c.r=[[cx,cz,A,r[3],r[4],r[5]||15]]; if(c.dw) c.dw=[cx+11,cz+14]; PHOTO.cafeFit={fixed:true,cx,cz,J:bj}; PUBYARD.cafeShift=[cx+241.35,cz+54.7]; }
    const sh=PUBYARD.cafeShift||[0,0]; PUBYARD.apt=[-233.2+sh[0],-73.2+sh[1]]; PUBYARD.aptA=Math.PI/2; PUBYARD.gate=[-247.6,-68.2]; }
  // Street View (Oct 2026): the house beside the church does not exist — its plot is a car park
  for(let i=D.bld.length-1;i>=0;i--){ const r=D.bld[i].r[0]; if(D.bld[i].k==='house'&&Math.hypot(r[0]+309.8,r[1]+22)<3){ PHOTO.churchPark=r.slice(); D.bld.splice(i,1); } }
  // "Kod Ruže" stands inside the pub's walled yard, just behind the café (Street View "38 Tuhelj"); the gate opens to the road from Lovrečan
  { const a=D.bld.find(q=>q.k==='apt'||/Kod Ru/.test(q.n||'')||(q.k==='house'&&Math.hypot(q.r[0][0]+203.9,q.r[0][1]+76.5)<3)); if(a){ a.k='apt'; a.n='Studio apartman Kod Ruže'; const r0=a.r[0]; const dx=PUBYARD.apt[0]-r0[0], dz=PUBYARD.apt[1]-r0[1]; for(const q of a.r){ q[0]+=dx; q[1]+=dz; if(PUBYARD.aptA!==undefined) q[2]=PUBYARD.aptA; } a.dw=PUBYARD.gate.slice(); } }
  // the bus stop is on the café side of the road, in front of the gravel lot east of the arcade (Street View)
  { const p=(D.pois||[]).find(q=>q.k==='bus_stop'&&Math.hypot(q.x+213,q.z+30)<8); const rd=ROADS.find(r=>r.t==='secondary'&&r.P.some(q=>Math.hypot(q[0]+213,q[1]+30)<12)); if(p&&rd){ const n=nearOnPoly(rd.P,p.x,p.z); p.x=n.x+n.tz*4.5; p.z=n.z-n.tx*4.5; } }
  // Street View "38 Tuhelj": the salmon-red house with the white balcony stands right behind the column, facing the bend
  if(!D.bld.some(b=>b.st==='salmonPlaza')) D.bld.push({k:'house',st:'salmonPlaza',lv:2,f:2,r:[[-252.6,-21.2,Math.PI+0.25,11,9,15]]});
  try{ pristavaLand(); }catch(e){ console.warn('pristava',e); }
  NOHEDGE.push([-211,-42,10],[PUBYARD.apt[0]-1,PUBYARD.apt[1]+1,15],[-309.8,-22,11]);
  const inWide=(x,z)=>{ const dx=x-A.H[0], dz=z-A.H[1]; const t=(dx*A.ux+dz*A.uz)/A.L, d=Math.abs(-dx*A.uz+dz*A.ux); return t>0.02&&t<1.08&&d<110; };
  for(const l of LAND){ if(l.t!=='farmland') continue; const c=polyCentroid(l.P); const k=l.P.filter(p=>inWide(p[0],p[1])).length; if(inMeadow(c[0],c[1])||k>=l.P.length*0.4) l.t='meadow'; }
  for(const r of ROADS){ if(r.t!=='unclassified'&&r.t!=='track'&&r.t!=='service') continue; if(r.P.some(p=>Math.hypot(p[0]+434,p[1]+119)<12)||r.P.some(p=>Math.hypot(p[0]-A.H[0],p[1]-A.H[1])<30)){ r.gravel=true; r.w=Math.min(r.w,3.4); } } }
function photoTextures(){ const S=512, c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#a9a69c'; g.fillRect(0,0,S,S); const R=mulberry32(77);
  for(let i=0;i<26000;i++){ const x=R()*S, y=R()*S, r=0.6+R()*2.2, v=140+R()*90|0; g.fillStyle='rgb('+v+','+(v-4)+','+(v-14)+')'; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
  for(let i=0;i<1600;i++){ const x=R()*S, y=R()*S; g.fillStyle='rgba(60,56,48,0.35)'; g.fillRect(x,y,1.5,1.5); }
  TEX.gravel=mkTex(c); TEX.gravel.anisotropy=ANISO; }
// 3) the house itself (photos 4 and 6): yellow render, terracotta vertical bands, gable roofs, round balcony with dark wooden balusters, covered terrace on the right
function photoHouse(cs,scene){ const b=BLD.find(q=>/Slavi/.test(q.n||'')); if(!b) return; b.st='photo'; PHOTO.b=b;
  const [cx,cz,ang,L0,W0]=b.rect; const F=frame(cx,cz,ang); const y0=b.hmax+0.15, yb=b.hmin-0.5; b.y0=y0; PHOTO.F=F; PHOTO.ang=ang; PHOTO.y0=y0;
  const g=(k)=>cs.get(k,cx,cz); const G=g('wall'), T=g('trim'), Wd=g('wood'), Mt=g('metal'), Cl=g('cloth'), Hd=g('hedge'), St=g('stonem'), Gl=g('glow');
  const Hh={wall:G,trim:T,glass:g('glassW'),slats:g('slats')};
  const YEL=lin('#e9c979'), RED=lin('#c4523d'), SAL=lin('#d98c70'), WHT=lin('#f4f3ef'), WOOD=lin('#6a3f27'), GUT=lin('#c9ccce');
  // photo 35: [yellow low wing 0-3.6][red cross gable 3.6-6.0][yellow two storeys + round balcony 6.0-10.0][red 10.0-12.0] + covered terrace
  const hl=6, hw=5, pitch=31, TP=Math.tan(pitch*Math.PI/180); const e=y0+5.7, eL=e; /* one continuous eave and ridge over the whole house (photo 4) */ const xM=-hl+3.6; // main body x from xM to +hl, low wing from -hl to xM
  const rt=e+hw*TP, rtL=eL+hw*TP;
  const win=(m,h,o={})=>rectWindow(Hh,m,h,Object.assign({wc:YEL,rc:lin('#f1ead6'),fc:WHT,cols:1,dep:0.2,fw:0.07,sc:WHT,gv:'sheer'},o));
  const A=[-hl,hw], B=[hl,hw], Cc=[hl,-hw], Dd=[-hl,-hw];
  const mF=segMap(F,ang,A,B), mE=segMap(F,ang,B,Cc), mB=segMap(F,ang,Cc,Dd), mW=segMap(F,ang,Dd,A), mM=segMap(F,ang,[xM,-hw],[xM,hw]);
  const band=(m,s0,s1,yA,yB,C,holes)=>{ const hs=holes.filter(h=>h[0][0]>=s0-1e-3&&h[1][0]<=s1+1e-3&&h[0][1]>=yA-1e-3&&h[2][1]<=yB+1e-3); facadeSeg(G,m,[[s0,yA],[s1,yA],[s1,yB],[s0,yB]],hs,C); };
  const hFront=[holeRect(1.15,2.05,y0+0.95,y0+2.05), /*big glass door*/holeRect(3.95,5.65,y0+0.12,y0+2.45), /*flower window*/holeRect(6.45,7.15,y0+1.0,y0+2.15), /*door*/holeRect(7.75,8.6,y0+0.5,y0+2.65),
    holeRect(10.6,11.05,y0+1.25,y0+2.05), /*balcony door*/holeRect(7.7,8.6,y0+3.2,y0+5.3), holeRect(6.55,7.2,y0+3.5,y0+4.6), holeRect(10.6,11.05,y0+3.6,y0+4.5)];
  band(mF,0,3.6,yb,eL,YEL,hFront); band(mF,6.0,10.0,yb,e,YEL,hFront); band(mF,10.0,12,yb,e,RED,hFront);
  // red cross gable with the big triangular window — a shallow projecting bay, so the main eave stops at it (photo)
  { const PR=0.72, x0=xM, x1=0, gpk=e+1.9; band(mF,3.6,6.0,yb,e,RED,[]);
    const mG=segMap(F,ang,[x0,hw+PR],[x1,hw+PR]), mS1=segMap(F,ang,[x0,hw],[x0,hw+PR]), mS2=segMap(F,ang,[x1,hw+PR],[x1,hw]);
    const gd=holeRect(0.35,2.05,y0+0.12,y0+2.45), tri=[[0.32,y0+4.15],[2.08,y0+4.15],[2.08,y0+5.75],[1.2,y0+7.05],[0.32,y0+5.75]];
    facadeSeg(G,mG,[[0,yb],[2.4,yb],[2.4,e],[1.2,gpk],[0,e]],[gd,tri],RED); for(const m of [mS1,mS2]) facadeSeg(G,m,[[0,yb],[PR,yb],[PR,e],[0,e]],[],RED);
    win(mG,gd,{cols:2,sill:false,gv:'blind',wc:RED});
    reveal(G,mG,tri,0,0.18,lin('#f1ead6')); frameRing(T,mG,tri,0.08,0.16,0.05,WHT); pane(Hh.glass,mG,insetPoly(tri,0.08),0.2,WHITE,GLASSV.sheer); bar(T,mG,1.2,y0+4.2,1.2,y0+7.0,0.07,0.16,0.05,WHT);
    plinthSeg(g('plinth'),mG,yb,y0+0.32,[],SAL);
    const gc=F((x0+x1)/2,0,hw+PR-1.5); const gf=frame(gc[0],gc[2],ang+Math.PI/2); emitRoof(cs,gf,ang+Math.PI/2,1.5,1.2,e,'gable',57,0.25,0.35,lin('#cc6c3e'),lin('#7a4e30'));
    localCollider(F,ang,x0,x1,hw,hw+PR,yb-1,e+2);
    // canopy over the big glass door
    const cp=mG.P(1.2,0,0); const cf=frame(cp[0],cp[2],ang); emitRoof(cs,cf,ang,1.25,0.45,y0+2.85,'shed',22,0.12,0.12,lin('#cc6c3e'),lin('#7a4e30'),'roof',4); Wd.box(cf,-1.15,1.15,y0+2.7,y0+2.85,-0.05,0.45,lin('#6b3b22')); }
  // end walls: low wing gable (left), wall above the wing, right red gable; back
  band(mW,0,10,yb,eL,YEL,[holeRect(4.3,5.1,y0+1.0,y0+2.0)]); facadeSeg(G,mW,[[0,eL],[10,eL],[5,rtL]],[holeRect(4.55,5.45,eL+0.35,eL+1.2)],YEL);

  band(mE,0,10,yb,e,RED,[holeRect(3.0,3.8,y0+1.1,y0+2.0),holeRect(6.0,6.8,y0+1.1,y0+2.0),holeRect(3.0,3.8,y0+3.6,y0+4.5)]); facadeSeg(G,mE,[[0,e],[10,e],[5,rt]],[holeRect(4.5,5.5,e+0.4,e+1.5)],RED);
  const hBack=[holeRect(1.8,3.0,y0+1.0,y0+2.1),holeRect(5.2,6.0,y0+1.3,y0+2.0),holeRect(1.8,3.0,y0+3.4,y0+4.5),holeRect(5.4,6.4,y0+3.4,y0+4.5),holeRect(9.4,10.6,y0+1.0,y0+2.1)];
  band(mB,0,8.4,yb,e,YEL,hBack); band(mB,8.4,12,yb,eL,YEL,hBack);
  for(const i of [0,2,4,6,7]) win(mF,hFront[i],{wc:i>=4&&i!==6?RED:YEL}); win(mF,hFront[5],{cols:1,sill:false});
  for(const h of [holeRect(3.0,3.8,y0+1.1,y0+2.0),holeRect(6.0,6.8,y0+1.1,y0+2.0),holeRect(3.0,3.8,y0+3.6,y0+4.5),holeRect(4.5,5.5,e+0.4,e+1.5)]) win(mE,h,{wc:RED});
  for(const h of hBack) win(mB,h,{cols:2}); win(mW,holeRect(4.3,5.1,y0+1.0,y0+2.0)); win(mW,holeRect(4.55,5.45,eL+0.35,eL+1.2)); 
  // front door: white with four small windows; three concrete steps
  { const d=hFront[3]; reveal(G,mF,d,0,0.2,lin('#f1ead6')); T.box(mF.T,d[0][0],d[1][0],d[0][1],d[2][1],-0.2,-0.14,WHT); for(let i=0;i<4;i++) Hh.glass.box(mF.T,8.08,8.27,y0+1.15+i*0.33,y0+1.38+i*0.33,-0.14,-0.13,WHITE); Mt.box(mF.T,8.45,8.52,y0+1.4,y0+1.46,-0.14,-0.08,lin('#bdbdbd'));
    for(let k=0;k<3;k++) St.box(mF.T,7.35-k*0.12,9.05+k*0.12,yb,y0+0.5-k*0.16,0,0.35+k*0.35,lin('#c7c2b6')); addFloor(F,ang,-hl+7.2,-hl+9.2,hw,hw+1.1,y0+0.18); }
  // round balcony over the door: yellow slab, dark turned wooden balusters, handrail
  { const bc=F(-hl+8.15,0,hw); const bf=frame(bc[0],bc[2],ang,0); const R=1.45, n=30; for(let i=0;i<n;i++){ const a0=Math.PI*i/n, a1=Math.PI*(i+1)/n; const p=(a,r,y)=>bf(Math.cos(a)*r*1.2,y,Math.sin(a)*r);
      G.quad(p(a0,R,y0+2.7),p(a1,R,y0+2.7),p(a1,R,y0+3.15),p(a0,R,y0+3.15),[0,0],[1,0],[1,1],[0,1],YEL,[Math.cos(a0),0,Math.sin(a0)]); G.quad(p(a0,R,y0+2.7),p(a0,R*0.55,y0+2.92),p(a1,R*0.55,y0+2.92),p(a1,R,y0+2.7),[0,0],[1,0],[1,1],[0,1],lin('#efe2b8'),[0,-1,0]); /* thick rounded slab with a curved soffit over the door */ G.tri(bf(0,y0+3.15,0),p(a1,R,y0+3.15),p(a0,R,y0+3.15),[0,0],[1,0],[0,1],lin('#cfc9bb'),[0,1,0]); G.tri(bf(0,y0+2.98,0),p(a0,R*0.55,y0+2.92),p(a1,R*0.55,y0+2.92),[0,0],[1,0],[0,1],lin('#efe2b8'),[0,-1,0]);
      { const q=p(a0+0.05,R-0.07,0); Wd.box(frame(q[0],q[2],ang-a0,0),-0.04,0.04,y0+3.15,y0+4.1,-0.05,0.05,lin('#6e4128')); }
      beam(Wd,p(a0,R-0.07,y0+4.12),p(a1,R-0.07,y0+4.12),0.065,lin('#6a3f27')); beam(Wd,p(a0,R-0.07,y0+3.28),p(a1,R-0.07,y0+3.28),0.035,lin('#6a3f27')); }
    addFloor(bf,ang,-1.7,1.7,0,1.45,y0+3.15); }
  // downpipes and lamp
  for(const [s,top] of [[0.2,eL],[3.55,eL],[6.05,e],[9.95,e]]){ const p=mF.P(s,0,-0.12); Mt.cyl(frame(p[0],p[2],ang,0),0.05,0.05,yb+0.2,top-0.1,8,GUT,1,false); }
  { const p=mF.P(9.15,0,-0.06); const lf=frame(p[0],p[2],ang,0); Mt.box(lf,-0.07,0.07,y0+2.2,y0+2.5,-0.02,0.14,lin('#3a3a3a')); Gl.box(lf,-0.05,0.05,y0+2.24,y0+2.44,0.02,0.12,lin('#ffe3a0')); }
  // plinth band and roofs (main body + lower left wing), white gutters
  for(const m of [mF,mE,mB,mW]) plinthSeg(g('plinth'),m,yb,y0+0.32,m===mF?[[7.2,9.2]]:[],SAL);
  { emitRoof(cs,frame(cx,cz,ang),ang,hl,hw,e,'gable',pitch,0.65,0.6,lin('#cc6c3e'),lin('#7a4e30'));
    for(const sz of [-1,1]){ const ey=e-0.6*TP-0.12, eyL=eL-0.6*TP-0.12; Mt.box(F,sz>0?0:xM,hl+0.65,ey-0.12,ey,sz*(hw+0.62)-0.07,sz*(hw+0.62)+0.07,GUT); Mt.box(F,-hl-0.6,xM,eyL-0.12,eyL,sz*(hw+0.62)-0.07,sz*(hw+0.62)+0.07,GUT); } }
  // covered terrace on the right (photo 4): hipped roof on posts, lattice frieze, salmon parapet
  { const tf=frame(...(()=>{ const p=F(hl+2.3,0,1.4); return [p[0],p[2]]; })(),ang); const ty=y0+0.05, th=y0+2.7;
    St.box(tf,-2.3,2.3,yb,ty,-3.6,3.6,lin('#c8c3b8')); addFloor(tf,ang,-2.3,2.3,-3.6,3.6,ty);
    Cl.box(tf,-2.3,2.3,ty,ty+0.95,3.4,3.6,SAL); Cl.box(tf,2.1,2.3,ty,ty+0.95,-3.6,3.6,SAL); localCollider(tf,ang,-2.3,2.3,3.4,3.6,ty-1,ty+1); localCollider(tf,ang,2.1,2.3,-3.6,3.6,ty-1,ty+1);
    for(const [x,z] of [[2.2,3.5],[2.2,-3.5],[-2.2,3.5]]){ Wd.box(tf,x-0.08,x+0.08,ty,th,z-0.08,z+0.08,lin('#5b3524')); }
    for(const [a,c2,z0,z1] of [[-2.3,2.3,3.45,3.55],[2.15,2.25,-3.6,3.6]]) Hh.slats.box(tf,a,c2,th-0.65,th-0.05,z0,z1,lin('#7a4a30'));
    emitRoof(cs,tf,ang,2.6,3.9,th,'hip',24,0.35,0.35,lin('#cc6c3e'),lin('#8a5e3e'));
    }
  // wooden garage beside the house: an open timber carport with a back wall, the front open to the lane (photo from the meadow)
  { const gx0=hl+5.0, gx1=hl+10.4, gz0=-1.6, gz1=hw+0.6; const gc=F((gx0+gx1)/2,0,(gz0+gz1)/2); const gf=frame(gc[0],gc[2],ang); let gy=1e9; for(const [qx,qz] of [[gx0,gz0],[gx1,gz0],[gx0,gz1],[gx1,gz1]]){ const q=F(qx,0,qz); gy=Math.min(gy,getHeight(q[0],q[2])); } const hx=(gx1-gx0)/2, hz=(gz1-gz0)/2; const W1=lin('#b08258'), W2=lin('#a2764e'), BEAM=lin('#8a6040');
    for(let x=-hx;x<=hx-0.1;x+=0.2) Wd.box(gf,x,x+0.19,gy-1.5,gy+2.3,-hz,-hz+0.05,((x+hx)/0.2|0)%2?W1:W2,0.8);
    for(const sx of [-1,1]){ for(let z=-hz;z<=-hz+2.6;z+=0.2) Wd.box(gf,sx*hx-0.025,sx*hx+0.025,gy-1.5,gy+2.3,z,z+0.19,((z+hz)/0.2|0)%2?W1:W2,0.8); for(const z of [0,hz-0.12]) Wd.box(gf,sx*hx-0.08,sx*hx+0.08,gy-1.5,gy+2.35,z-0.08,z+0.08,BEAM); }
    for(const sx of [-1,1]) Wd.box(gf,sx*hx-0.09,sx*hx+0.09,gy+2.2,gy+2.36,-hz,hz,BEAM); Wd.box(gf,-hx,hx,gy+2.2,gy+2.36,hz-0.18,hz,BEAM);
    emitRoof(cs,gf,ang,hx+0.15,hz+0.15,gy+2.36,'gable',16,0.4,0.45,lin('#9a5a3c'),lin('#7a5536'));
    localCollider(gf,ang,-hx,hx,-hz,-hz+0.12,gy-1,gy+3); for(const sx of [-1,1]) localCollider(gf,ang,sx*hx-0.08,sx*hx+0.08,-hz,-hz+2.6,gy-1,gy+3); PHOTO.garage=gf; }
  // flowers under the window, potted plants by the steps
  for(let k=0;k<7;k++){ const q=mF.P(6.5+k*0.09,y0+1.0,-0.22); lathe(Hd,frame(q[0],q[2],ang,q[1]),[[0.06,0],[0.05,0.1],[0,0.12]],6,lin(k%2?'#d8344a':'#3f7a33')); }
  // the yard (photo 1 / 4): just a paved forecourt down to the lane — no outbuilding
  { const Pv=cs.get('floorT',cx,cz); PHOTO.forecourt=[[-hl-1.5,hw+0.2],[hl+11.4,hw+0.2],[hl+11.4,hw+4.9],[-hl-1.5,hw+4.9]].map(q=>{ const p=F(q[0],0,q[1]); return [p[0],p[2]]; }); /* paved with paveArea in photoPaving: follows the ground, never floats */
}
  PHOTO.door=(()=>{ const p=F(-hl+8.2,0,hw+1.9); return [p[0],p[2]]; })();
  photoYard(cs,scene,F,ang,y0); }
// 4) the yard and the lane (photos 1, 5, 6): bins, basketball hoop on a vine-covered lamp post, asters, lattice fence
function photoYard(cs,scene,F,ang,y0){ const g=(k)=>cs.get(k,F(0,0,0)[0],F(0,0,0)[2]); const Wd=g('wood'), Mt=g('metal'), Hd=g('hedge'), Gl=g('glow'), Cl=g('cloth');
  const lane=nearestRoad(PHOTO.door[0],PHOTO.door[1],40,s=>s.road&&s.road.gravel); const lp=lane?[lane.s.x,lane.s.z]:(()=>{ const p=F(2,0,10); return [p[0],p[2]]; })();
  const tx=lane?lane.s.tx:1, tz=lane?lane.s.tz:0; const nx=-tz, nz=tx; const side=((PHOTO.door[0]-lp[0])*nx+(PHOTO.door[1]-lp[1])*nz)>0?1:-1;
  const at=(along,off)=>[lp[0]+tx*along+nx*side*off, lp[1]+tz*along+nz*side*off];
  // lamp post with basketball hoop and vines
  { const p=at(4,(lane?lane.s.w/2:1.6)+0.9); const y=getHeight(p[0],p[1]); const pf=frame(p[0],p[1],Math.atan2(-nz*side,-nx*side),y);
    Wd.cyl(pf,0.14,0.12,0,8.6,10,lin('#7b6a55'),1,false); Mt.box(pf,-0.03,0.03,7.7,7.76,0,1.3,lin('#8a8d90')); Mt.box(pf,-0.12,0.12,7.6,7.72,1.2,1.55,lin('#9aa0a4')); Gl.box(pf,-0.1,0.1,7.58,7.6,1.22,1.52,lin('#fff1c8'));
    Wd.box(pf,-0.55,0.55,2.75,3.5,0.15,0.2,lin('#3a2f26')); { const rim=pf(0,2.85,0.45); Mt.cyl(frame(rim[0],rim[2],0,rim[1]),0.23,0.23,0,0.02,14,lin('#e0572a'),1,false); }
    { const prof=[[0.16,0.1]]; for(let k=1;k<=14;k++){ prof.push([0.26+0.09*Math.sin(k*1.7)+0.05*Math.cos(k*3.1),0.1+k*0.46]); } prof.push([0.16,6.9],[0.0,7.05]); lathe(Hd,pf,prof,10,lin('#46702d')); } /* ivy hugging the post (photo 1), one continuous column */
    addCollider(p[0],p[1],0,0.4,0.4,y-1,y+9); PHOTO.lamp=p; }
  // green + yellow wheelie bins
  for(const [k,col] of [[0,'#2f6b3a'],[1,'#f2cf1d']]){ const p=at(4.9+k*0.75,(lane?lane.s.w/2:1.6)+0.55); const y=getHeight(p[0],p[1]); const bf=frame(p[0],p[1],Math.atan2(tz,tx),y);
    Cl.box(bf,-0.3,0.3,0.05,0.98,-0.36,0.36,lin(col)); Cl.box(bf,-0.33,0.33,0.98,1.05,-0.4,0.4,lin(col)); Mt.cyl(frame(...(()=>{ const w=bf(0,0.1,-0.38); return [w[0],w[2]]; })(),Math.atan2(tz,tx)+Math.PI/2,y+0.1),0.1,0.1,-0.32,0.32,10,lin('#1a1a1a'),1,true); addCollider(p[0],p[1],Math.atan2(tz,tx),0.7,0.8,y-1,y+1.1); }
  // purple asters along the lane
  for(let i=0;i<40;i++){ const p=at(-2+i*0.12,(lane?lane.s.w/2:1.6)+0.5+((i*13)%7)*0.06); const y=getHeight(p[0],p[1]); const q=[p[0],y+0.25+((i*5)%4)*0.05,p[1]]; const gg=new THREE.IcosahedronGeometry(0.13,0); const pos=gg.attributes.position; for(let j=0;j<pos.count;j+=3){ const Q=[0,1,2].map(kk=>[q[0]+pos.getX(j+kk),q[1]+pos.getY(j+kk)*0.7,q[2]+pos.getZ(j+kk)]); Hd.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],lin(i%3?'#a77ac8':'#8d5fb5'),[0,1,0]); } }
  // brown lattice fence by the driveway
  for(let k=0;k<6;k++){ const p=at(-6-k*1.6,(lane?lane.s.w/2:1.6)+1.0); const y=getHeight(p[0],p[1]); const ff=frame(p[0],p[1],Math.atan2(tz,tx),y); Wd.box(ff,-0.04,0.04,0,1.1,-0.04,0.04,lin('#5a3a26')); for(let j=0;j<5;j++){ Wd.box(ff,-0.8+j*0.4,-0.76+j*0.4,0.1,1.0,-0.015,0.015,lin('#6b4630')); } Wd.box(ff,-0.8,0.8,0.95,1.0,-0.02,0.02,lin('#6b4630')); } }
// 5) a couple of weeping willows near the church road (photo 1) — placed on free ground
function photoWillows(scene){ const M=new THREE.MeshStandardMaterial({color:0x8fa84a,roughness:0.85,map:TEX.leaves||null}), Tm=new THREE.MeshStandardMaterial({color:0x5a4a3a,roughness:0.95});
  const spots=[[-352,-38],[-300,-62],[-395,-30]]; for(const [x0,z0] of spots){ let x=x0, z=z0; if(BHASH.hit(x,z,5)||!roadClear(x,z,5)) continue; const y=getHeight(x,z); const g=new THREE.Group(); g.position.set(x,y,z);
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.55,4.5,8),Tm); tr.position.y=2.25; tr.castShadow=true; g.add(tr);
    for(let k=0;k<26;k++){ const a=k*2.399, r=1.2+((k*37)%10)*0.33, h=4.5+((k*13)%6)*0.5; const geo=new THREE.ConeGeometry(1.1+((k*5)%4)*0.25,3.6+((k*11)%5)*0.5,7,1,true); const m=new THREE.Mesh(geo,M); m.position.set(Math.cos(a)*r,h-1.2,Math.sin(a)*r); m.rotation.x=Math.PI; m.rotation.z=(Math.random()-0.5)*0.2; m.castShadow=true; g.add(m); }
    scene.add(g); if(VEG.trunks) VEG.trunks.push([x,z,0.5]); } }
/* ---- the family house interior (GTA-style room, door on the real front door) ---- */
function buildFamilyHome(I){ const {x,z,y}=I.room; const cs=new ChunkSet(); const W=7, D=5.5, H=2.8; const f=intShell(cs,x,z,y,W,D,H,{floor:lin('#b48a5e'),wall:lin('#f3ead8'),ceil:lin('#fbf8f1'),door:lin('#f4f3ef'),skirt:lin('#8a6a4a')});
  intLights(cs,x,z,y,H,W,D); const G=cs.get('wall',x,z), Wd=cs.get('wood',x,z), Mt=cs.get('metal',x,z), Gl=cs.get('glow',x,z), Cl=cs.get('cloth',x,z), Dv=cs.get('duvet',x,z), Tw=cs.get('tileW',x,z), Ch=cs.get('chrome',x,z), Gs=cs.get('glassW',x,z), Lm=cs.get('lamin',x,z);
  const box=(Gg,x0,x1,y0,y1,z0,z1,c)=>Gg.box(f,x0,x1,y+y0,y+y1,z0,z1,lin(c)); const col=(x0,x1,z0,z1,h)=>addCollider(x+(x0+x1)/2,z+(z0+z1)/2,0,Math.abs(x1-x0),Math.abs(z1-z0),y-1,y+(h||2));
  // partition between the front (living/kitchen) and back (bedroom/bath), opening in the middle
  box(G,-W,-1.2,0,H,-0.06,0.06,'#f3ead8'); box(G,1.2,W,0,H,-0.06,0.06,'#f3ead8'); col(-W,-1.2,-0.06,0.06,3); col(1.2,W,-0.06,0.06,3);
  // bathroom walls
  box(G,-3.0,-2.88,0,H,-D,-2.6,'#f3ead8'); box(G,-W,-3.0,0,H,-1.55,-1.43,'#f3ead8'); col(-3.0,-2.88,-D,-2.6,3); col(-W,-3.6,-1.55,-1.43,3);
  // living room: L sofa, coffee table, TV on the partition, rug, window views
  box(Cl,5.6,6.9,0,0.45,0.6,4.4,'#5d6670'); box(Cl,6.6,6.95,0.45,0.9,0.6,4.4,'#5d6670'); box(Cl,3.4,6.9,0,0.45,3.9,4.6,'#5d6670'); box(Cl,3.4,6.9,0.45,0.85,4.35,4.65,'#5d6670'); for(const zz of [1.2,2.4,3.5]) box(Cl,6.35,6.6,0.45,0.82,zz-0.45,zz+0.45,'#6c7783'); col(5.6,6.95,0.6,4.65,0.9); col(3.4,6.95,3.9,4.65,0.9);
  box(Wd,3.6,5.0,0,0.42,1.6,2.8,'#6b4a30'); box(Wd,3.55,5.05,0.42,0.47,1.55,2.85,'#7a5638'); col(3.6,5.0,1.6,2.8,0.5);
  box(Wd,3.4,5.6,0,0.5,0.08,0.5,'#2a2420'); box(Mt,3.6,5.4,0.95,1.95,0.07,0.1,'#0b0c0e'); box(Gl,3.65,5.35,1.0,1.9,0.1,0.105,'#1a3a5a'); col(3.4,5.6,0.08,0.5,0.6);
  // kitchen: counters along the left wall, stove, sink, fridge, dining table with chairs
  box(Wd,-W+0.02,-W+0.65,0,0.88,0.4,4.6,'#f4f2ec'); box(Lm,-W+0.02,-W+0.68,0.88,0.92,0.4,4.6,'#7a5638'); box(Mt,-W+0.1,-W+0.6,0.92,0.94,1.2,1.8,'#141414'); box(Ch,-W+0.12,-W+0.58,0.92,0.95,2.6,3.1,'#c8ccd0'); box(Wd,-W+0.02,-W+0.4,1.5,2.2,0.4,4.6,'#f4f2ec'); col(-W,-W+0.7,0.4,4.6,1);
  box(Mt,-W+0.02,-W+0.75,0,1.95,4.62,5.4,'#e8e8e6'); col(-W,-W+0.75,4.6,5.4,2);
  box(Wd,-4.4,-2.6,0.72,0.77,1.6,3.2,'#8a6040'); for(const [px,pz] of [[-4.3,1.7],[-2.7,1.7],[-4.3,3.1],[-2.7,3.1]]) box(Wd,px-0.04,px+0.04,0,0.72,pz-0.04,pz+0.04,'#5a3a26'); col(-4.4,-2.6,1.6,3.2,0.8);
  for(const [px,pz] of [[-3.5,1.15],[-3.5,3.65],[-4.85,2.4],[-2.15,2.4]]){ box(Wd,px-0.22,px+0.22,0.44,0.48,pz-0.22,pz+0.22,'#6b4630'); box(Wd,px-0.22,px+0.22,0,0.44,pz-0.02,pz+0.02,'#5a3a26'); }
  // bedroom: double bed, wardrobe, nightstands, lamp
  box(Wd,3.6,5.6,0,0.42,-D+0.05,-D+2.25,'#6b4a30'); box(Dv,3.65,5.55,0.42,0.6,-D+0.3,-D+2.2,'#f4f2ee'); box(Cl,3.75,5.45,0.55,0.72,-D+0.12,-D+0.6,'#e9e3d6'); box(Wd,3.6,5.6,0,1.15,-D+0.02,-D+0.12,'#5a3a26'); col(3.6,5.6,-D,-D+2.25,0.8);
  for(const px of [3.2,6.0]){ box(Wd,px-0.25,px+0.25,0,0.55,-D+0.05,-D+0.5,'#7a5638'); box(Gl,px-0.08,px+0.08,0.55,0.8,-D+0.2,-D+0.36,'#ffe2a8'); }
  box(Wd,W-0.65,W-0.02,0,2.2,-3.6,-1.2,'#f1efe9'); box(Mt,W-0.67,W-0.65,1.0,1.2,-2.45,-2.42,'#a8a8a8'); box(Mt,W-0.67,W-0.65,1.0,1.2,-2.38,-2.35,'#a8a8a8'); col(W-0.65,W,-3.6,-1.2,2.3);
  // bathroom: shower with glass, toilet, sink + mirror, tiles
  box(Tw,-W+0.01,-3.01,0,2.2,-D+0.01,-D+0.03,'#ffffff'); box(Gs,-4.9,-4.88,0,2.0,-D,-3.9,'#ffffff'); box(Ch,-6.5,-6.45,1.9,2.1,-D+0.1,-D+0.15,'#c8ccd0'); col(-4.92,-4.86,-D,-3.9,2.1);
  box(G,-3.7,-3.25,0,0.42,-4.1,-3.6,'#fbfbfa'); box(G,-3.55,-3.1,0.8,0.95,-2.5,-1.7,'#fbfbfa'); box(Ch,-3.05,-3.02,1.2,1.8,-2.5,-1.7,'#d9e2e6');
  // stairs to the attic (decorative) and the hall
  for(let k=0;k<9;k++) box(Wd,-2.6,-1.4,k*0.28,k*0.28+0.06,-1.1-k*0.32,-0.82-k*0.32,'#7a5638'); col(-2.6,-1.4,-4.0,-0.8,2.6);
  // window panels: the view to the church (your photo if you have one), and daylight
  const view=intSign([''],1.6,1.1,'#9cc4e8','#fff',x+3.0,y+1.55,z-D+0.03,0); const view2=intSign([''],1.8,1.2,'#9cc4e8','#fff',x+W-0.03,y+1.5,z+2.6,-Math.PI/2);
  try{ const P=window.TUHELJ_PHOTOS||[]; if(P.length){ const ld=new THREE.TextureLoader(); ld.load(P[0],t=>{ t.colorSpace=THREE.SRGBColorSpace; view2.material.map=t; view2.material.needsUpdate=true; }); if(P[1]) ld.load(P[1],t=>{ t.colorSpace=THREE.SRGBColorSpace; view.material.map=t; view.material.needsUpdate=true; }); } }catch(e){}
  for(const [vx,vz,ry,w,h] of [[3.0,-D+0.04,0,1.7,1.2],[W-0.04,2.6,-Math.PI/2,1.9,1.3]]){ const fr=new THREE.Mesh(new THREE.PlaneGeometry(w+0.12,h+0.12),new THREE.MeshStandardMaterial({color:0xf4f3ef})); fr.position.set(x+vx+(ry?0.004:0),y+(ry?1.5:1.55),z+vz-(ry?0:0.004)); fr.rotation.y=ry; GAME.scene.add(fr); }
  intFinish(cs);
  HOME.room=I.room; HOME.slots={tepih:[4.3,2.2,0.012,0],biljka:[6.4,5.0,0,0],fotelja:[2.5,3.3,0,Math.PI*0.75],zastava:[-0.4,0.12,1.5,Math.PI],pc:[1.9,-D+0.55,0,0],akvarij:[-2.4,0.42,0,0],plakat:[1.8,0.1,1.45,0],trofej:[6.75,-0.5,0,0]};
  HOME.wardPos=[x+W-0.3,z-2.4]; buildDecor(); }
function houseDoor(){ return PHOTO.door||null; }
function homeIntInit(){ if(HOME.intDone||!INTS.length||!PHOTO.door) return; HOME.intDone=true;
  INTS.push({id:'kuca',name:'Tvoja kuća',ico:'🏡',door:()=>houseDoor(),r:2.4,room:{x:-1210,z:-1450,y:260},spawn:[0,2.6],look:[0,-3],build:buildFamilyHome,
    spots:[{x:6.0,z:-2.4,r:1.1,t:'👕 Ormar — presvuci se',fn:openWardrobe},{x:4.6,z:-2.7,r:1.2,t:'🛏️ Krevet — odspavaj (spremi igru)',fn:sleepMenu},{x:-5.8,z:-4.3,r:1.1,t:'🚿 Tuš — istuširaj se',fn:shower},
      {x:4.3,z:1.4,r:1.0,t:'📺 Televizor — Zagorje TV vijesti',fn:watchTV},{x:-1.5,z:4.4,r:1.0,t:'🛋️ Uredi kuću — namještaj',fn:decorMenu},{x:0,z:5.0,r:1.2,t:'🚪 Izađi van',fn:()=>intExit()}],
    hello(){ UI.toast('🏡 Doma si'); }}); }
/* ---- doors you just walk through (no E): step into the green ring to go in, walk into the exit to leave ---- */
const DOORW={away:true,cool:0};
function doorWalkTick(){ return; /* back to E at the door (player's wish) */ if(!GAME.started||PLAYER.driving||PLAYER.riding||PLAYER.heli||COMBAT.dead||GTA.dlg||COMBAT.menuOpen||!INTS.length) return;
  const P=PLAYER.pos, v=PLAYER.vel, sp=Math.hypot(v.x,v.z); if(GAME.time<DOORW.cool) return;
  const pts=[]; if(!INSIDE){ for(const I of INTS){ const d=I.door(); if(d) pts.push({x:d[0],z:d[1],r:1.25,go:()=>intEnter(I)}); } }
  else { const R=INSIDE.room; for(const s of INSIDE.spots) if(/Izađi/.test(s.t)) pts.push({x:R.x+s.x,z:R.z+s.z,r:1.0,go:()=>intExit()}); }
  let near=null, nd=1e9; for(const q of pts){ const d=Math.hypot(P.x-q.x,P.z-q.z); if(d<nd){ nd=d; near=q; } }
  if(!near) return; if(nd>2.2) DOORW.away=true;
  if(DOORW.away&&nd<near.r&&sp>0.4&&((near.x-P.x)*v.x+(near.z-P.z)*v.z>-0.2||nd<0.6)){ DOORW.away=false; DOORW.cool=GAME.time+1.2; near.go(); } }
/* ---- village centre from Street View: bus stops with BUS markings, outdoor gym, blue bridge railings over the Horvatska ---- */
function busTex(){ const c=cvs(512,256), g=c.getContext('2d'); g.clearRect(0,0,512,256); g.fillStyle='rgba(240,190,40,0.92)'; g.font='900 150px Manrope, Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('BUS',256,135); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function photoCentre(cs,scene){ const Mt=cs.get('metal',CENTER[0],CENTER[1]), G=cs.get('wall',CENTER[0],CENTER[1]), Wd=cs.get('wood',CENTER[0],CENTER[1]), Gs=cs.get('glassW',CENTER[0],CENTER[1]);
  const AL=lin('#c9ced2'), BLUE=lin('#2f63b8'), GRN=lin('#2e8b3a');
  const stops=(D.pois||[]).filter(p=>p.k==='bus_stop'&&Math.hypot(p.x-CENTER[0],p.z-CENTER[1])<500);
  const bt=busTex(); const busM=new THREE.MeshBasicMaterial({map:bt,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6});
  stops.forEach((p,si)=>{ const n=nearestRoad(p.x,p.z,30,s=>s.t!=='track'&&s.t!=='path'); if(!n) return; const s=n.s; const nx=-s.tz, nz=s.tx; const side=((p.x-s.x)*nx+(p.z-s.z)*nz)>=0?1:-1;
    const off=s.w/2+2.0; const x=s.x+nx*side*off, z=s.z+nz*side*off; if(BHASH.hit(x,z,1.5)) return; const y=getHeight(x,z); const a=Math.atan2(s.tz,s.tx); const f=frame(x,z,a,y);
    // slab, posts, glass back + sides, roof plate, bench, timetable
    G.box(f,-2.3,2.3,-0.1,0.12,-1.0,1.1,lin('#d8d4cb')); addFloor(f,a,-2.3,2.3,-1.0,1.1,y+0.12);
    for(const [px,pz] of [[-2.0,0.9],[2.0,0.9],[-2.0,-0.75],[2.0,-0.75]]) Mt.box(f,px-0.05,px+0.05,0.12,2.6,pz-0.05,pz+0.05,AL);
    Gs.box(f,-2.0,2.0,0.3,2.4,side*0.9-0.02,side*0.9+0.02,WHITE); Gs.box(f,-2.02,-1.98,0.3,2.4,-0.75,0.9,WHITE); Mt.box(f,-2.3,2.3,2.6,2.68,-1.0,1.15,AL);
    Wd.box(f,-1.5,1.5,0.5,0.55,side*0.55-0.2,side*0.55+0.2,lin('#6d4a2e')); Mt.box(f,1.55,1.95,0.6,1.9,side*0.85-0.03,side*0.85+0.03,lin('#f2f2ee'));
    addCollider(...(()=>{ const q=f(0,0,side*0.9); return [q[0],q[2]]; })(),a,4.2,0.2,y-1,y+2.6);
    // yellow BUS lettering + kerb line on the road
    const ry=getHeight(s.x,s.z)+0.11; const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6),busM); m.rotation.x=-Math.PI/2; m.rotation.z=-a+(side>0?-Math.PI/2:Math.PI/2); const q=[s.x+nx*side*(s.w/2-0.9),s.z+nz*side*(s.w/2-0.9)]; m.position.set(q[0],ry,q[1]); scene.add(m);
    // blue bus-stop sign on a pole
    { const q=f(-2.6,0,side*-0.6); const sf=frame(q[0],q[2],a,y); Mt.cyl(sf,0.035,0.035,0,2.6,8,AL,1,false); Mt.box(sf,-0.32,0.32,2.2,2.62,-0.02,0.02,lin('#1f4fa8')); Mt.box(sf,-0.26,0.26,2.28,2.54,-0.025,0.025,lin('#f4f4f2')); }
    if(si===0){ // Street View "41 Tuhelj": fenced gravel workout park behind the shelter, benches, green steel equipment
      const gc=[x+nx*side*9+s.tx*6, z+nz*side*9+s.tz*6]; for(let k=0;k<30&&typeof creekDist==='function'&&creekDist(gc[0],gc[1])<10.5;k++){ gc[0]-=s.tx*(side>0?1:-1)*0; gc[1]-=1; } /* keep the outdoor gym out of the creek (it is just north of it) */ const gy=getHeight(gc[0],gc[1]); const gf=frame(gc[0],gc[1],a,gy); const GW2=8, GD=5;
      G.box(gf,-GW2,GW2,-0.05,0.06,-GD,GD,lin('#d9d3c6')); addFloor(gf,a,-GW2,GW2,-GD,GD,gy+0.06);
      for(let k=-GW2;k<=GW2+0.01;k+=2){ for(const zz of [-GD,GD]) Mt.box(gf,k-0.03,k+0.03,0,0.9,zz-0.03,zz+0.03,GRN); } for(let k=-GD;k<=GD+0.01;k+=2){ for(const xx of [-GW2,GW2]) Mt.box(gf,xx-0.03,xx+0.03,0,0.9,k-0.03,k+0.03,GRN); }
      for(const zz of [-GD,GD]) Mt.box(gf,-GW2,GW2,0.85,0.9,zz-0.02,zz+0.02,GRN); for(const xx of [-GW2,GW2]) Mt.box(gf,xx-0.02,xx+0.02,0.85,0.9,-GD,GD,GRN);
      const eq=[[-5.5,-2.5,'pull'],[-2,-2.5,'bars'],[1.5,-2.5,'pull'],[5,-2.5,'step'],[-4,2.2,'bench'],[0,2.2,'bars'],[4.5,2.2,'pull']];
      for(const [ex,ez,k] of eq){ const ef=frame(...(()=>{ const p=gf(ex,0,ez); return [p[0],p[2]]; })(),a,gy+0.06);
        if(k==='pull'){ for(const px of [-0.9,0.9]) Mt.box(ef,px-0.06,px+0.06,0,2.4,-0.06,0.06,GRN); Mt.box(ef,-0.9,0.9,2.25,2.31,-0.03,0.03,lin('#c9ced2')); }
        if(k==='bars'){ for(const pz of [-0.3,0.3]){ for(const px of [-0.9,0.9]) Mt.box(ef,px-0.05,px+0.05,0,1.1,pz-0.05,pz+0.05,GRN); Mt.box(ef,-0.95,0.95,1.05,1.1,pz-0.03,pz+0.03,lin('#c9ced2')); } }
        if(k==='step'){ Mt.box(ef,-0.6,0.6,0,0.4,-0.3,0.3,GRN); Mt.box(ef,-0.05,0.05,0,1.2,-0.05,0.05,GRN); }
        if(k==='bench'){ Wd.box(ef,-0.9,0.9,0.42,0.47,-0.2,0.2,lin('#7a5032')); Wd.box(ef,-0.9,0.9,0.55,0.85,0.18,0.22,lin('#7a5032')); for(const px of [-0.75,0.75]) Mt.box(ef,px-0.03,px+0.03,0,0.45,-0.18,0.18,lin('#333')); }
        addCollider(...(()=>{ const p=gf(ex,0,ez); return [p[0],p[2]]; })(),a,1.9,0.7,gy-1,gy+2.4); }
      Wd.box(frame(...(()=>{ const p=gf(-GW2-1.4,0,0); return [p[0],p[2]]; })(),a,gy),-0.9,0.9,0.42,0.47,-0.2,0.2,lin('#6d4a2e'));
      // wire fence on wooden posts along the meadow side of the road, ~70 m south from the stop
      const r=s.road; if(r&&r.S){ const i0=s.i; for(let k=i0+8;k<Math.min(r.S.length,i0+56);k+=2){ const p=r.S[k], tg=r.T[k]; const fx=p[0]+(-tg[1])*side*(r.w/2+2.2), fz=p[1]+tg[0]*side*(r.w/2+2.2); if(BHASH.hit(fx,fz,1)||(typeof creekDist==='function'&&creekDist(fx,fz)<CREEK.Wc+0.4)) continue; const fy=getHeight(fx,fz); const ff=frame(fx,fz,Math.atan2(tg[1],tg[0]),fy);
          Wd.box(ff,-0.05,0.05,0,1.25,-0.05,0.05,lin('#8a6a4a')); for(const wy of [0.55,1.05]) Mt.box(ff,-1.5,1.5,wy,wy+0.012,-0.006,0.006,lin('#9a9a96')); } }
      // convex traffic mirror at the curve
      { const q=[s.x+(-s.tz)*-side*(s.w/2+1.2)+s.tx*-10, s.z+s.tx*-side*(s.w/2+1.2)+s.tz*-10]; const qy=getHeight(q[0],q[1]); const mf=frame(q[0],q[1],a+Math.PI/2,qy); Mt.cyl(mf,0.04,0.04,0,2.8,8,lin('#9aa0a4'),1,false);
        const mir=new THREE.Mesh(new THREE.CircleGeometry(0.42,24),new THREE.MeshStandardMaterial({color:0xd8e4ee,metalness:0.95,roughness:0.08})); mir.position.set(q[0],qy+2.85,q[1]); mir.rotation.y=-a; scene.add(mir);
        const rim=new THREE.Mesh(new THREE.RingGeometry(0.42,0.5,24),new THREE.MeshBasicMaterial({color:0xd8262e,side:THREE.DoubleSide})); rim.position.copy(mir.position); rim.rotation.y=-a; scene.add(rim); } }
    PHOTO.stops=(PHOTO.stops||[]).concat([[x,z]]); });
  // blue railings where centre roads cross the Horvatska creek
  for(const w of WATER){ if(/Pristav/.test(w.n||'')) continue; /* its bridges are built by the creek module */ for(let i=0;i<w.P.length-1;i++){ const a0=w.P[i], a1=w.P[i+1];
    for(const r of ROADS){ if(!r.S||r.t==='path'||r.t==='track') continue; for(let j=0;j<r.S.length-1;j++){ const b0=r.S[j], b1=r.S[j+1]; if(Math.hypot(b0[0]-CENTER[0],b0[1]-CENTER[1])>650) continue;
        const d1x=a1[0]-a0[0], d1z=a1[1]-a0[1], d2x=b1[0]-b0[0], d2z=b1[1]-b0[1]; const den=d1x*d2z-d1z*d2x; if(Math.abs(den)<1e-6) continue; const t=((b0[0]-a0[0])*d2z-(b0[1]-a0[1])*d2x)/den, u=((b0[0]-a0[0])*d1z-(b0[1]-a0[1])*d1x)/den; if(t<0||t>1||u<0||u>1) continue;
        for(const sd of [1,-1]){ for(let k=Math.max(0,j-5);k<Math.min(r.S.length-1,j+6);k++){ const p=r.S[k], tg=r.T[k]; const nx=-tg[1]*sd, nz=tg[0]*sd; const x=p[0]+nx*(r.w/2+0.35), z=p[1]+nz*(r.w/2+0.35); const y=getHeight(p[0],p[1])+0.08; const ff=frame(x,z,Math.atan2(tg[1],tg[0]),y);
            Mt.box(ff,-0.04,0.04,0,1.05,-0.04,0.04,BLUE); Mt.box(ff,-0.78,0.78,0.98,1.05,-0.035,0.035,BLUE); Mt.box(ff,-0.78,0.78,0.12,0.17,-0.03,0.03,BLUE); for(let q=-3;q<=3;q++) Mt.box(ff,q*0.22-0.012,q*0.22+0.012,0.15,1.0,-0.012,0.012,BLUE); addCollider(x,z,Math.atan2(tg[1],tg[0]),1.6,0.15,y-1,y+1.1); } } } } } } }
/* ---- hedges and garden fences between houses and the road (Mapillary / Street View: almost every plot has one) ---- */
function photoHedges(cs){ const R=mulberry32(99); const Hd=cs.get('hedge',CENTER[0],CENTER[1]), Mt=cs.get('metal',CENTER[0],CENTER[1]), G=cs.get('wall',CENTER[0],CENTER[1]);
  for(const b of BLD){ if(b.k!=='house'||!b.rect||b.st==='photo'||b.st==='pristava82') continue; const [cx,cz,ang,L,W]=b.rect; if(Math.hypot(cx-CENTER[0],cz-CENTER[1])>700) continue;
    const n=nearestRoad(cx,cz,22,s=>s.t!=='path'&&s.t!=='track'); if(!n) continue; const s=n.s, r=s.road; if(!r||!r.S) continue; const u=R();
    const kind=u<0.6?'hedge':u<0.85?'fence':null; if(!kind) continue;
    const nx=-s.tz, nz=s.tx; const side=((cx-s.x)*nx+(cz-s.z)*nz)>=0?1:-1; const off=r.w/2+(r.t==='secondary'||r.t==='primary'?2.4:1.0);
    const span=Math.max(L,W)/2+3; const gapAt=b.dw?((b.dw[0]-s.x)*s.tx+(b.dw[1]-s.z)*s.tz):0;
    for(let t=-span;t<span;t+=1.5){ if(Math.abs(t-gapAt)<2.0) continue; const k=Math.round(s.i+t/1.5); if(k<1||k>=r.S.length-1) continue; const p=r.S[k], tg=r.T[k]; const x=p[0]+(-tg[1])*side*off, z=p[1]+tg[0]*side*off;
      if(noHedge(x,z)||BHASH.hit(x,z,0.6)||nearestRoad(x,z,4,q=>q.rid!==r.rid)&&nearestRoad(x,z,4,q=>q.rid!==r.rid).d<1.2) continue; const y=getHeight(x,z); const f=frame(x,z,Math.atan2(tg[1],tg[0]),y);
      if(kind==='hedge'){ const h=1.25+R()*0.35; Hd.box(f,-0.8,0.8,0,h,-0.45,0.45,lin(R()<0.5?'#3f6a2c':'#4a7533')); }
      else { G.box(f,-0.76,0.76,0,0.45,-0.12,0.12,lin('#d9d4c8')); for(let q=-3;q<=3;q++) Mt.box(f,q*0.22-0.015,q*0.22+0.015,0.45,1.25,-0.015,0.015,lin('#2c2f33')); Mt.box(f,-0.76,0.76,1.2,1.25,-0.025,0.025,lin('#2c2f33')); }
      addCollider(x,z,Math.atan2(tg[1],tg[0]),1.6,kind==='hedge'?0.9:0.25,y-1,y+1.5); } } }

/* ---- Pristavčica: the creek from Pristava down the valley floor through Tuhelj (missing in the map data).
   Traced along the lowest ground (dynamic programming over the height grid), a shallow channel is cut except
   under roads — those become bridges with the blue railings from photoCentre. */
function photoStream(){ if(WATER.some(w=>/Pristav/.test(w.n||''))) return; const xs=[], X1=-1260, X2=360, SX=8, Z1=-320, Z2=320, SZ=6; const nz=Math.round((Z2-Z1)/SZ)+1;
  const BL=[].concat(...D.bld.map(b=>b.r)).concat(PHOTO.churchPark?[PHOTO.churchPark.map((v,i)=>i===3?v+7:i===4?v+6:v)]:[]); /* keep the creek out of the church car park */ const pen=(x,z)=>{ let p=0; for(const r of BL){ const dx=x-r[0], dz=z-r[1]; if(Math.abs(dx)>40||Math.abs(dz)>40) continue; const c=Math.cos(r[2]), sn=Math.sin(r[2]); const lx=Math.abs(dx*c+dz*sn)-r[3]/2, lz=Math.abs(-dx*sn+dz*c)-r[4]/2; const d=Math.hypot(Math.max(lx,0),Math.max(lz,0)); if(d<8) p+=60*(1-d/8); } return p; };
  let prev=null, back=[]; for(let x=X1;x<=X2;x+=SX){ xs.push(x); const cur=new Float32Array(nz), from=new Int16Array(nz);
    for(let j=0;j<nz;j++){ const z=Z1+j*SZ; const gi=clamp(Math.round((x-X0)/CELL),0,NX-1)+clamp(Math.round((z-Z0)/CELL),0,NZ-1)*NX; const c=getHeight(x,z)+pen(x,z)+ROADMASK[gi]*14; if(!prev){ cur[j]=c+Math.abs(z-CENTER[1])*0.01; from[j]=j; continue; } let bv=1e18,bj=j; for(let k=-3;k<=3;k++){ const jj=j+k; if(jj<0||jj>=nz) continue; const v=prev[jj]+Math.abs(k)*0.6; if(v<bv){ bv=v; bj=jj; } } cur[j]=bv+c; from[j]=bj; }
    back.push(from); prev=cur; }
  let j=0; for(let k=1;k<nz;k++) if(prev[k]<prev[j]) j=k; const zs=new Array(xs.length); for(let i=xs.length-1;i>=0;i--){ zs[i]=Z1+j*SZ; j=back[i][j]; }
  let P=xs.map((x,i)=>[x,zs[i]]); for(let pass=0;pass<3;pass++) P=P.map((p,i)=>{ let sx=0,sz=0,n=0; for(let k=-2;k<=2;k++){ const q=P[Math.max(0,Math.min(P.length-1,i+k))]; sx+=q[0]; sz+=q[1]; n++; } return [sx/n,sz/n]; });
  // cut the channel (not under roads)
  for(const p of P){ const ix0=Math.max(0,Math.floor((p[0]-6-X0)/CELL)), ix1=Math.min(NX-1,Math.ceil((p[0]+6-X0)/CELL)), iz0=Math.max(0,Math.floor((p[1]-6-Z0)/CELL)), iz1=Math.min(NZ-1,Math.ceil((p[1]+6-Z0)/CELL));
    for(let iz=iz0;iz<=iz1;iz++) for(let ix=ix0;ix<=ix1;ix++){ const d=Math.hypot(X0+ix*CELL-p[0],Z0+iz*CELL-p[1]); if(d>6) continue; const k=iz*NX+ix; const dep=1.1*(1-smooth(1.5,6,d))*(1-ROADMASK[k]); if(dep>0) HEI[k]-=dep*0.5; } }
  WATER.push({n:'Pristavčica',P}); PHOTO.stream=P; return P; }
