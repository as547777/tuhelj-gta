/* ===================== OŠ Lijepa naša Tuhelj — from the Street View shots =====================
   On the main road the old two-storey school (cream, pink plinth, flag); behind it the white modern wings with red
   roofs, the big sports hall with the white-panelled gable, the fenced court (red-orange posts, nets, concrete
   tribune). The access road runs DOWN to the car park and the kindergarten (white, flat roof, green fence), which sit
   on a lower level than the school, not up the hill. */
const SCH={old:[-233.5,-235,0,13,21],wing:[-201,-257,0,54,12],wing2:[-208,-246.5,0,26,7],hall:[-163,-240,Math.PI/2,32,22],court:[-199.5,-230,38,20],kinder:[-116,-146,0.05,30,11]};
const SCH_LV={top:173.9,court:173.7,low:170.8};
function schoolTerrain(){ const sb=D.bld.find(b=>b.k==='school'); if(sb){ sb.r=[SCH.old,SCH.wing,SCH.wing2,SCH.hall].map(r=>[r[0],r[1],r[2],Math.max(r[3],r[4]),Math.min(r[3],r[4]),15].map((v,i)=>i===2&&r[4]>r[3]?r[2]+Math.PI/2:v)); sb.st='school2'; }
  if(!D.bld.some(b=>b.st==='kinder')) D.bld.push({k:'house',st:'kinder',n:'Dječji vrtić',lv:1,f:2,r:[[SCH.kinder[0],SCH.kinder[1],SCH.kinder[2],SCH.kinder[3],SCH.kinder[4],15]]});
  NOHEDGE.push([-120,-165,48],[-200,-240,40],[-232,-275,14],[-200,-242,60]);
  for(const l of LAND){ if(l.t==='pitch'){ const c=polyCentroid(l.P); if(Math.hypot(c[0]+195,c[1]+225)<30) l.t='schoolpitch'; } }
  const Z=[{x0:-243,x1:-148,z0:-282,z1:-238,h:SCH_LV.top,bl:16},{x0:-178,x1:-148,z0:-260,z1:-218,h:SCH_LV.top,bl:12},{x0:-221,x1:-174,z0:-242,z1:-214,h:SCH_LV.court,bl:10},{x0:-243,x1:-219,z0:-250,z1:-221,h:SCH_LV.top,bl:10},{x0:-243,x1:-150,z0:-268,z1:-214,h:SCH_LV.top,bl:8},{x0:-160,x1:-72,z0:-206,z1:-126,h:SCH_LV.low,bl:46}];
  for(let iz=0;iz<NZ;iz++) for(let ix=0;ix<NX;ix++){ const x=X0+ix*CELL, z=Z0+iz*CELL; if(x<-300||x>0||z<-340||z>-70) continue; const k=iz*NX+ix; let h=HEI[k];
    for(const q of Z){ const dx=Math.max(q.x0-x,0,x-q.x1), dz=Math.max(q.z0-z,0,z-q.z1); const d=Math.hypot(dx,dz); const w=1-smooth(0,q.bl,d); if(w>0) h+=(q.h-h)*w; } HEI[k]=h; } }
function schoolFacade(cs,b,r,o){ const [cx,cz,ang,L,W]=r; const f=frame(cx,cz,ang); const hl=L/2, hw=W/2; const y0=o.y0, yb=SCH_LV.low-2; const e=y0+o.h;
  emitWalls(cs,f,ang,hl,hw,yb,e,o.roof==='gable'?'gable':'none',o.pitch,o.wall,'wall'); emitPlinth(cs,f,ang,hl,hw,yb,y0+(o.plH||0.5),o.plinth||lin('#9a958a')); emitRoof(cs,f,ang,hl,hw,e,o.roof,o.pitch,o.ov||0.6,o.ov||0.6,o.roofC,o.sof||lin('#e9e4da'),'roof',15);
  const Wn=cs.get('win',cx,cz); for(let sk=0;sk<4;sk++){ const si=sideInfo(sk,hl,hw); const n=Math.max(1,Math.floor(si.len/(o.step||3.2))); for(let k=0;k<n;k++){ const t=-si.e+si.len*(k+0.5)/n; for(const yy of o.rows) decal(Wn,f,ang,si,t,y0+yy,o.win,0.05,o.ws||1); } }
  localCollider(f,ang,-hl,hl,-hw,hw,yb-1,e+4); return {f,hl,hw,e}; }
school=function(cs,scene,b){ const y0=SCH_LV.top+0.15; b.y0=y0; const T=cs.get('trim',-210,-250), Mt=cs.get('metal',-210,-250), G=cs.get('wall',-210,-250);
  // old school on the road: cream, pink plinth, hip roof, cornices
  { const r=SCH.old; const o=schoolFacade(cs,b,[r[0],r[1],r[2]+Math.PI/2,r[4],r[3]],{y0,h:8.6,roof:'hip',pitch:33,wall:lin('#ece4cf'),plinth:lin('#c9a39a'),plH:1.25,roofC:lin('#8f5a42'),win:'old4',rows:[1.45,5.0],step:3.4,ws:1.05});
    const {f,hl,hw}=o; T.box(f,-hl-0.08,hl+0.08,y0+4.2,y0+4.45,-hw-0.08,hw+0.08,lin('#f4efe2')); T.box(f,-hl-0.12,hl+0.12,y0+8.35,y0+8.6,-hw-0.12,hw+0.12,lin('#f4efe2'));
    const side=sideInfo(2,hl,hw); const dp=wallPoint(f,side,0,0.06); decal(cs.get('win',r[0],r[1]),f,r[2]+Math.PI/2,side,0,y0-0.02,'door_glass',0.08,1.1);
    // flags on the corner and two wall lanterns
    { const fp=wallPoint(f,side,side.e-0.6,0.5); const pf=frame(fp[0],fp[2],0,y0+5.6); const fl=[flagTex(),countyFlagTex()]; for(let i=0;i<2;i++){ const a=-0.6-i*0.35; beam(Mt,pf(0,0,0),pf(Math.cos(a)*2.2,1.2,Math.sin(a)*0.3),0.025,lin('#d8d8d4')); const m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.8),new THREE.MeshStandardMaterial({map:fl[i],side:THREE.DoubleSide,roughness:0.8})); const q=pf(Math.cos(a)*2.0,0.95-i*0.1,Math.sin(a)*0.3); m.position.set(q[0],q[1]-0.4,q[2]); m.rotation.y=Math.PI/2+0.3; scene.add(m); } }
    for(const t of [-side.e*0.55,side.e*0.55]){ const lp=wallPoint(f,side,t,0.3); const lf=frame(lp[0],lp[2],0,y0+3.2); Mt.box(lf,-0.12,0.12,0,0.4,-0.12,0.12,lin('#2b2b2b')); cs.get('glow',lp[0],lp[2]).box(lf,-0.09,0.09,0.05,0.35,-0.09,0.09,lin('#ffe3a0')); }
    const sp=wallPoint(f,side,0,0.12); signMesh(scene,signTex(['Osnovna škola Lijepa naša'],{w:1024,h:128,bg:'#f6f1ea',fg:'#2a4a7a',border:null,size:56}),5.6,0.7,sp[0],y0+3.55,sp[2],sideAngle(r[2]+Math.PI/2,side));
    LANDMARKS.school={x:dp[0]-14,z:dp[2],look:[r[0],r[1]]}; }
  // white modern wings with low red roofs and long window bands
  for(const key of ['wing','wing2']){ const r=SCH[key]; const two=key==='wing'; schoolFacade(cs,b,r,{y0,h:two?7.4:3.8,roof:'gable',pitch:14,wall:lin('#f1f0eb'),plinth:lin('#d6d3cc'),roofC:lin('#b2463b'),sof:lin('#f1f0eb'),win:'school',rows:two?[0.9,4.4]:[0.9],step:2.6,ov:0.9}); }
  // salmon-orange stair block at the east end of the main wing, ribbon of orange window frames (photo C)
  { const r=SCH.wing; const f=frame(r[0],r[1],r[2]); const hl=r[3]/2; G.box(f,hl-4.2,hl+0.6,SCH_LV.low-2,y0+8.3,-r[4]/2-0.6,r[4]/2+0.2,lin('#e5a07c'),1.2); localCollider(f,r[2],hl-4.2,hl+0.6,-r[4]/2-0.6,r[4]/2+0.2,y0-2,y0+9);
    for(const yy of [1.0,4.5]) T.box(f,-hl+1,hl-4.5,y0+yy-0.12,y0+yy-0.02,r[4]/2+0.01,r[4]/2+0.06,lin('#e08a5a')); }
  // sports hall: salmon walls, grey band with clerestory windows, white panels on the west gable
  { const r=SCH.hall; const o=schoolFacade(cs,b,r,{y0,h:9.2,roof:'gable',pitch:9,wall:lin('#ebc6ab'),plinth:lin('#d6d3cc'),roofC:lin('#8f4337'),win:'school',rows:[6.6],step:3.0,ov:0.7}); const {f,hl,hw,e}=o;
    for(const sz of [-1,1]) T.box(f,-hl-0.05,hl+0.05,e-1.9,e,sz*hw-0.06,sz*hw+0.06,lin('#9ea4a7'));
    for(let k=0;k<5;k++) T.box(f,hl+0.02,hl+0.07,y0+0.6+k*1.55,y0+2.0+k*1.55,-hw*0.6,hw*0.6,lin('#f5f5f2')); for(let k=0;k<4;k++) T.box(f,hl+0.02,hl+0.08,y0+0.6+k*1.55+1.4,y0+0.6+k*1.55+1.55,-hw*0.6,hw*0.6,lin('#d8d9d6')); }
  // the court: grey asphalt, white lines, handball goals, basketball hoops, red-orange posts with nets, concrete tribune
  { const [cx,cz,L,W]=SCH.court; const P=[[cx-L/2,cz-W/2],[cx+L/2,cz-W/2],[cx+L/2,cz+W/2],[cx-L/2,cz+W/2]]; paveArea(scene,P,'concrete',{tile:9,roads:true});
    const LM=new THREE.MeshStandardMaterial({color:0xeeeeea,roughness:0.7,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}); const hx=L/2-1, hz=W/2-1;
    for(const [a,b2] of [[[cx-hx,cz-hz],[cx+hx,cz-hz]],[[cx+hx,cz-hz],[cx+hx,cz+hz]],[[cx+hx,cz+hz],[cx-hx,cz+hz]],[[cx-hx,cz+hz],[cx-hx,cz-hz]],[[cx,cz-hz],[cx,cz+hz]]]) groundLine(scene,LM,a[0],a[1],b2[0],b2[1],0.08);
    for(const sd of [-1,1]){ let prev=null; for(let k=0;k<=16;k++){ const a=-Math.PI/2+k/16*Math.PI; const p=[cx+sd*(hx-Math.cos(a)*6),cz+Math.sin(a)*6]; if(prev) groundLine(scene,LM,prev[0],prev[1],p[0],p[1],0.08); prev=p; } }
    { let prev=null; for(let k=0;k<=24;k++){ const a=k/24*TAU; const p=[cx+Math.cos(a)*2.2,cz+Math.sin(a)*2.2]; if(prev) groundLine(scene,LM,prev[0],prev[1],p[0],p[1],0.08); prev=p; } }
    const y=getHeight(cx,cz); const BL=lin('#2c55a8'), WH=lin('#f2f2ee'), OR=lin('#d4623c');
    for(const sd of [-1,1]){ const gx=cx+sd*hx; const gf=frame(gx,cz,0,y); for(const zz of [-1.5,1.5]) Mt.box(gf,-0.04,0.04,0,2.0,zz-0.04,zz+0.04,zz>0?BL:WH); Mt.box(gf,-0.04,0.04,1.96,2.04,-1.5,1.5,BL); for(const zz of [-1.5,1.5]) beam(Mt,gf(0,2.0,zz),gf(sd*0.9,0,zz),0.02,WH); addCollider(gx,cz,0,0.4,3.2,y-1,y+2.1);
      const bf=frame(cx,cz+sd*(hz+0.6),0,y); Mt.box(bf,-0.06,0.06,0,3.3,-0.06,0.06,WH); Mt.box(bf,-0.9,0.9,2.9,3.95,sd*-0.32-0.02,sd*-0.32+0.02,WH); Mt.cyl(frame(cx,cz+sd*(hz+0.2),0,y),0.23,0.23,3.05,3.07,12,OR,1,false); }
    const netM=new THREE.MeshStandardMaterial({map:netTex(),transparent:true,alphaTest:0.3,side:THREE.DoubleSide,roughness:0.9}); netM.map.wrapS=netM.map.wrapT=THREE.RepeatWrapping;
    const ex=L/2+0.4, ez=W/2+0.4, H=5.2; const sides=[[[cx-ex,cz-ez],[cx+ex,cz-ez]],[[cx+ex,cz-ez],[cx+ex,cz+ez]],[[cx+ex,cz+ez],[cx-ex,cz+ez]],[[cx-ex,cz+ez],[cx-ex,cz-ez]]];
    for(const [a,b2] of sides){ const dl=Math.hypot(b2[0]-a[0],b2[1]-a[1]); const an=Math.atan2(b2[1]-a[1],b2[0]-a[0]); const n=Math.ceil(dl/4);
      for(let k=0;k<=n;k++){ const x=a[0]+(b2[0]-a[0])*k/n, z=a[1]+(b2[1]-a[1])*k/n; Mt.cyl(frame(x,z,0,getHeight(x,z)),0.05,0.05,0,H,8,OR,1,false); }
      const m=new THREE.Mesh(new THREE.PlaneGeometry(dl,H-0.2),netM.clone()); m.material.map=netM.map.clone(); m.material.map.repeat.set(dl/1.2,(H-0.2)/1.2); m.material.map.needsUpdate=true; m.position.set((a[0]+b2[0])/2,getHeight((a[0]+b2[0])/2,(a[1]+b2[1])/2)+H/2,(a[1]+b2[1])/2); m.rotation.y=-an; scene.add(m);
      const mid=[(a[0]+b2[0])/2,(a[1]+b2[1])/2]; addCollider(mid[0],mid[1],an,dl,0.15,y-1,y+H); }
    // tribune: concrete steps along the north side, toward the school
    // tribune: concrete steps on the west side of the court, toward the old school (photo)
    { const St=cs.get('curb',cx,cz); for(let k=0;k<4;k++){ const x1=cx-ex-1.0-k*0.8; St.box(frame(0,cz,0,0),x1-0.8,x1,y-0.3,y+0.42*(k+1),-W*0.4,W*0.4,lin('#c9c6be'),0.8); localCollider(frame(0,cz,0,0),0,x1-0.8,x1,-W*0.4,W*0.4,y-1,y+0.42*(k+1)-0.45); addFloor(frame(0,cz,0,0),0,x1-0.8,x1,-W*0.4,W*0.4,y+0.42*(k+1)); } } }
  // the access road down to the car park: car park on the lower level with grass islands, trees and P signs
  { const P=[[-156,-197],[-88,-192],[-86,-152],[-154,-156]]; paveArea(scene,P,'asphalt',{tile:4,roads:true}); const K=cs.get('curb',-120,-175), Hd=cs.get('hedge',-120,-175), Wd=cs.get('wood',-120,-175);
    for(const [ix,iz,il] of [[-138,-176,22],[-108,-174,20]]){ const y=getHeight(ix,iz); const f=frame(ix,iz,0.05,y); K.box(f,-il/2,il/2,-0.2,0.16,-1.4,1.4,lin('#cfccc4'),0.7); Hd.box(f,-il/2+0.15,il/2-0.15,0.1,0.18,-1.25,1.25,lin('#6d8f45'),0.7); localCollider(f,0.05,-il/2,il/2,-1.4,1.4,y-1,y+0.3);
      for(let t=-il/2+2;t<=il/2-2;t+=6){ const q=f(t,0,0); Wd.cyl(frame(q[0],q[2],0,y),0.1,0.08,0.1,2.2,6,lin('#5a4634'),1,false); const crown=new THREE.IcosahedronGeometry(1.5,1); const pos=crown.attributes.position; for(let i=0;i<pos.count;i+=3){ const Q=[0,1,2].map(k=>[q[0]+pos.getX(i+k),y+3.0+pos.getY(i+k)*0.85,q[2]+pos.getZ(i+k)]); Hd.tri(Q[0],Q[1],Q[2],[0,0],[1,0],[0,1],lin('#4f7d34'),[Q[0][0]-q[0],Q[0][1]-y-3,Q[0][2]-q[2]]); } addCollider(q[0],q[2],0,0.4,0.4,y-1,y+3); } }
    for(let k=0;k<8;k++){ const x=-150+k*8.2; for(const z of [-190.5,-157.5]){ if((k+(z>-170?1:0))%3===0) continue; EXTRA_PARK.push([x,z,Math.PI/2,'']); } }
    const ps=signTex(['P'],{w:256,h:256,bg:'#1f5fbf',fg:'#ffffff',border:'#ffffff',bw:14,size:190}); for(const [x,z] of [[-154,-158],[-118,-195],[-160,-188]]){ const y=getHeight(x,z); Mt.cyl(frame(x,z,0,y),0.04,0.04,0,2.6,8,lin('#a8adb0'),1,false); signMesh(scene,ps,0.6,0.6,x,y+2.45,z+0.05,0); signMesh(scene,ps,0.6,0.6,x,y+2.45,z-0.05,Math.PI); }
    LANDMARKS.heliPad={x:-100,z:-182}; }
  try{ schoolExtras(cs,scene,y0); }catch(e){ console.warn('škola+',e); }
  // kindergarten: white, flat roof with a parapet, wooden window frames, pergola entrance, green mesh fence
  { const r=SCH.kinder; const [kx,kz,ka,kl,kw]=r; const f=frame(kx,kz,ka); const y=getHeight(kx,kz)+0.12; const hl=kl/2, hw=kw/2; const WH=lin('#f6f6f3');
    G.box(f,-hl,hl,y-1.2,y+3.6,-hw,hw,WH,1.2); T.box(f,-hl-0.05,hl+0.05,y+3.6,y+3.95,-hw-0.05,hw+0.05,lin('#e9e9e4')); localCollider(f,ka,-hl,hl,-hw,hw,y-1,y+4);
    const Wn=cs.get('win',kx,kz); for(let sk=0;sk<4;sk++){ const si=sideInfo(sk,hl,hw); const n=Math.max(1,Math.floor(si.len/2.4)); for(let k=0;k<n;k++){ const t=-si.e+si.len*(k+0.5)/n; decal(Wn,f,ka,si,t,y+0.9,'modern',0.05,0.9); } }
    const Wd=cs.get('wood',kx,kz); for(let t=-3;t<=3;t+=2){ const q=f(hl*0.55+t,0,hw+2.4); Wd.box(frame(q[0],q[2],ka,y),-0.07,0.07,0,2.6,-0.07,0.07,lin('#b98a55')); } Wd.box(f,hl*0.55-3.2,hl*0.55+3.2,y+2.5,y+2.65,hw,hw+2.5,lin('#b98a55'));
    const fM=lin('#2f6b45'); const fp=[[-hl-3,-hw-3],[hl+3,-hw-3],[hl+3,hw+7],[-hl-3,hw+7]]; for(let i=0;i<4;i++){ const a=f(fp[i][0],0,fp[i][1]), b2=f(fp[(i+1)%4][0],0,fp[(i+1)%4][1]); const dl=Math.hypot(b2[0]-a[0],b2[2]-a[2]); const an=Math.atan2(b2[2]-a[2],b2[0]-a[0]); for(let t=0;t<dl;t+=2.5){ const x=a[0]+(b2[0]-a[0])*t/dl, z=a[2]+(b2[2]-a[2])*t/dl; if(i===2&&Math.abs(t-dl*0.3)<2) continue; const yy=getHeight(x,z); const ff=frame(x,z,an,yy); Mt.box(ff,0,Math.min(2.5,dl-t),0,1.5,-0.02,0.02,fM); addCollider(...(()=>{ const q=ff(Math.min(1.25,(dl-t)/2),0,0); return [q[0],q[2]]; })(),an,Math.min(2.5,dl-t),0.1,yy-1,yy+1.5); } } } };

// everything that makes the school one complex (Street View): a white link with a chimney between the old school and the wing,
// the drive past the old school with orange railings, the tiled pavement down beside the hall, and the playground by the main road
function schoolExtras(cs,scene,y0){ const G=cs.get('wall',-210,-240), T=cs.get('trim',-210,-240), Mt=cs.get('metal',-210,-240), Wd=cs.get('wood',-210,-240), Cl=cs.get('cloth',-210,-240), Hd=cs.get('hedge',-210,-240), K=cs.get('curb',-210,-240);
  const ORG=lin('#e0603a'), WHT=lin('#f2f1ec');
  // link block old school ↔ wing (white, three storeys, chimney)
  { const f=frame(-226.5,-250,0,0); G.box(f,-2.5,2.5,SCH_LV.low-2,y0+9.4,-6,6,WHT,1.2); emitRoof(cs,frame(-226.5,-250,0),0,2.6,6.1,y0+9.4,'gable',30,0.3,0.3,lin('#8f5a42'),lin('#e9e4da')); G.box(f,-0.5,0.5,y0+9,y0+12.2,2.5,3.5,lin('#d9d6cf')); localCollider(f,0,-2.5,2.5,-6,6,y0-2,y0+10);
    const Wn=cs.get('win',-226.5,-250); for(const yy of [1.2,4.6,7.6]) for(const zz of [-3,0,3]) decal(Wn,f,0,{n:[1,0],r:[0,-1],d:2.5,e:6,len:12},zz,y0+yy,'school',0.05,0.8); }
  // asphalt all round the school where the children walk: one apron around the old school, the link, the wings and the hall
  paveArea(scene,[[-244,-217],[-150,-217],[-150,-266.5],[-244,-266.5]],'asphalt',{tile:4,roads:true,skip:(x,z)=>(x>-219.2&&x<-179.8&&z>-240.6&&z<-219.4)||(x>-180.2&&x<-174.4&&z>-257&&z<-205)});
  // orange railing between the school drive and the playground (Street View "55 Tuhelj")
  for(let x=-243;x<-229;x+=1.6){ const z=-266.9, y=getHeight(x,z); const ff=frame(x+0.8,z,0,y); Mt.box(ff,-0.8,0.8,0.95,1.0,-0.02,0.02,ORG); Mt.box(ff,-0.8,0.8,0.12,0.16,-0.02,0.02,ORG); for(let k=-0.7;k<=0.71;k+=0.14) Mt.box(ff,k-0.012,k+0.012,0.12,0.97,-0.012,0.012,ORG); addCollider(x+0.8,z,0,1.6,0.1,y-1,y+1); }
  { const y=getHeight(-228.6,-266.9); const gf=frame(-228.6,-266.9,0,y); for(let k=0;k<6;k++) Mt.box(gf,k*0.2,k*0.2+0.03,0,1.1,-0.02,0.02,ORG); Mt.box(gf,0,1.1,1.05,1.1,-0.02,0.02,ORG); }
  // tiled pavement between the court and the hall, running down toward the parking
  paveArea(scene,[[-180,-257],[-174.6,-257],[-174.6,-205],[-180,-205]],'setts',{tile:2.4,roads:true,lift:0.06});
  for(let z=-256;z<-206;z+=1.6){ const y=getHeight(-180.1,z); K.box(frame(-180.1,z+0.8,0,y),-0.1,0.1,-0.2,0.15,-0.8,0.8,lin('#d6d3cc'),0.8); }
  { const p=[-176.5,-210]; lathe(Hd,frame(p[0],p[1],0,getHeight(p[0],p[1])),[[0.6,0],[0.75,1.2],[0.55,2.6],[0.2,3.4],[0,3.6]],10,lin('#3f6e2e')); addCollider(p[0],p[1],0,1.2,1.2,-1e4,1e4); }
  // playground by the main road on the far side of the school, toward the fields (Street View "57 Tuhelj")
  { const cx=-232, cz=-275; const P=[]; for(let k=0;k<20;k++){ const a=k/20*TAU; P.push([cx+Math.cos(a)*8.5,cz+Math.sin(a)*4.6]); } paveArea(scene,P,'gravel',{tile:3,roads:false,lift:0.03});
    const y=(x,z)=>getHeight(x,z); const RED=lin('#c8442c'), YEL=lin('#e9c21a'), BRN=lin('#7a5636');
    // slide on a ladder tower
    { const f=frame(cx-5,cz,0.4,y(cx-5,cz)); for(const [x,z] of [[-0.5,-0.5],[0.5,-0.5],[-0.5,0.5],[0.5,0.5]]) Wd.box(f,x-0.05,x+0.05,0,1.6,z-0.05,z+0.05,BRN); Wd.box(f,-0.6,0.6,1.5,1.6,-0.6,0.6,BRN); for(let k=0;k<6;k++) Wd.box(f,-0.55-k*0.12,-0.45-k*0.12,0.2+k*0.25,0.25+k*0.25,-0.35,0.35,BRN);
      Cl.quad(f(0.6,1.55,-0.3),f(0.6,1.55,0.3),f(2.6,0.2,0.3),f(2.6,0.2,-0.3),[0,0],[1,0],[1,1],[0,1],RED,[0.5,1,0]); for(const sz of [-0.32,0.32]) beam(Mt,f(0.6,1.7,sz),f(2.6,0.35,sz),0.03,RED); addCollider(...(()=>{ const q=f(0.8,0,0); return [q[0],q[2]]; })(),0.4,3.2,1.3,y(cx-5,cz)-1,y(cx-5,cz)+1.7); }
    // swing frame with two seats
    { const f=frame(cx+1,cz-1,0.4,y(cx+1,cz-1)); for(const x of [-1.4,1.4]) for(const z of [-0.6,0.6]) beam(Wd,f(x,0,z),f(x,2.3,0),0.07,BRN); beam(Wd,f(-1.5,2.3,0),f(1.5,2.3,0),0.08,BRN); for(const x of [-0.6,0.6]){ for(const z of [-0.18,0.18]) beam(Mt,f(x,2.28,z),f(x,0.5,z),0.012,lin('#666')); Cl.box(f,x-0.25,x+0.25,0.46,0.52,-0.2,0.2,lin('#2a2a2a')); } addCollider(...(()=>{ const q=f(0,0,0); return [q[0],q[2]]; })(),0.4,3.1,1.4,y(cx+1,cz-1)-1,y(cx+1,cz-1)+2.4); }
    // see-saw and a little play house with a yellow slide
    { const f=frame(cx+5.5,cz+2,0.4,y(cx+5.5,cz+2)); Wd.box(f,-0.15,0.15,0,0.5,-0.15,0.15,BRN); Wd.box(f,-1.8,1.8,0.48,0.56,-0.15,0.15,lin('#d06a3a')); for(const x of [-1.6,1.6]) Mt.box(f,x-0.03,x+0.03,0.56,0.85,-0.2,0.2,lin('#444')); }
    { const f=frame(cx+3,cz-3.8,0.4,y(cx+3,cz-3.8)); for(const [x,z] of [[-0.8,-0.8],[0.8,-0.8],[-0.8,0.8],[0.8,0.8]]) Wd.box(f,x-0.06,x+0.06,0,2.2,z-0.06,z+0.06,BRN); Wd.box(f,-0.9,0.9,1.0,1.08,-0.9,0.9,BRN); emitRoof(cs,f,0.4,0.95,0.95,2.2,'gable',38,0.15,0.15,lin('#5a3b2a'),BRN); Cl.quad(f(0.9,1.05,-0.3),f(0.9,1.05,0.3),f(2.6,0.15,0.3),f(2.6,0.15,-0.3),[0,0],[1,0],[1,1],[0,1],YEL,[0.5,1,0]); addCollider(...(()=>{ const q=f(0,0,0); return [q[0],q[2]]; })(),0.4,1.8,1.8,y(cx+3,cz-3.8)-1,y(cx+3,cz-3.8)+2.3); }
    // hedge along the main road and the brown tourist sign
    for(let z=-283;z<-268;z+=1.6){ const n=nearestRoad(-236,z,20,q=>q.t==='secondary'); if(!n) continue; const s2=n.s; let nx=-s2.tz, nz=s2.tx; if((-236-s2.x)*nx+(z-s2.z)*nz<0){ nx=-nx; nz=-nz; } const x=s2.x+nx*(s2.w/2+2.2), zz=s2.z+nz*(s2.w/2+2.2); const yy=y(x,zz); const a=Math.atan2(s2.tz,s2.tx); Hd.box(frame(x,zz,a,yy-0.1),-0.82,0.82,0,1.1,-0.45,0.45,lin('#4a7533'),0.8); addCollider(x,zz,a,1.6,0.9,yy-1,yy+1.1); }
    { const n=nearestRoad(-236,-268.6,20,q=>q.t==='secondary'); const x=n?Math.max(-240.5,n.s.x+n.s.w/2+1.8):-240.5, z=-268.6, yy=y(x,z); for(const o of [-0.8,0.8]) Mt.cyl(frame(x,z+o,0,yy),0.045,0.045,0,2.6,8,lin('#9aa0a4'),1,false); const tx=signTex(['Muzej "Staro selo" Kumrovec','Terme Tuhelj · Krapinske Toplice','Galerija A. Augustinčića','200 m'],{w:512,h:384,bg:'#6e3a1e',fg:'#ffffff',border:'#ffffff',bw:8,size:34}); signMesh(scene,tx,1.9,1.4,x+0.06,yy+1.9,z,Math.PI/2); addCollider(x,z,0,0.2,1.8,yy-1,yy+2.6); } } }
