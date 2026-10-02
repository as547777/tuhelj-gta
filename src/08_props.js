/* ===================== props ===================== */
const WIRES=[]; // flat list of segment endpoints
function catenary(a,b,sag,n=10){ const pts=[]; for(let i=0;i<=n;i++){ const t=i/n; pts.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)-sag*4*t*(1-t),lerp(a[2],b[2],t)]); } for(let i=0;i<n;i++){ WIRES.push(...pts[i],...pts[i+1]); } }
function fenceTex(kind){ const W=256,H=128; const c=cvs(W,H), g=c.getContext('2d'); g.clearRect(0,0,W,H);
  if(kind==='bars'){ g.fillStyle='#3a3d40'; g.fillRect(0,4,W,6); g.fillRect(0,H-14,W,6); for(let x=6;x<W;x+=16) g.fillRect(x,0,4,H); }
  else if(kind==='picket'){ g.fillStyle='#8b6a48'; g.fillRect(0,26,W,8); g.fillRect(0,H-30,W,8); for(let x=4;x<W;x+=20){ g.fillStyle=pick(['#8b6a48','#80603f','#94714c']); g.beginPath(); g.moveTo(x,H); g.lineTo(x,10); g.lineTo(x+6,2); g.lineTo(x+12,10); g.lineTo(x+12,H); g.fill(); } }
  else if(kind==='mesh'){ g.strokeStyle='#3f6b45'; g.lineWidth=2; for(let x=-H;x<W+H;x+=12){ g.beginPath(); g.moveTo(x,0); g.lineTo(x+H,H); g.stroke(); g.beginPath(); g.moveTo(x+H,0); g.lineTo(x,H); g.stroke(); } g.fillStyle='#3f6b45'; g.fillRect(0,0,W,4); }
  const t=mkTex(c); return t; }
function buildProps(scene,quality){
  RNG=mulberry32(4711);
  const cs=new ChunkSet(500); const T=(k,x,z)=>cs.get(k,x,z);
  const concreteC=lin('#a9a8a2'), woodPoleC=lin('#6b5540'), darkC=lin('#2b2c2e'), insC=lin('#dcdcd8');
  /* ---- local power poles along roads ---- */
  const poleTops=[]; const poleList=[];
  for(const r of ROADS){ if(!r.S || !['secondary','tertiary','unclassified','residential'].includes(r.t)) continue; const total=r.S[r.S.length-1][2]; if(total<70) continue;
    const side=(r.rid%2)?1:-1; let prev=null; let s=rnd(5,20);
    while(s<total){ const i=Math.min(r.S.length-1,Math.round(s/1.5)); const p=r.S[i], t=r.T[i]; const nx=-t[1]*side, nz=t[0]*side; const x=p[0]+nx*(r.w/2+1.7), z=p[1]+nz*(r.w/2+1.7);
      const ok=!BHASH.hit(x,z,1.2) && !(nearestRoad(x,z,8,q=>q.rid!==r.rid)?.d<1.2) && x>M.XMIN && x<M.XMAX && z>M.ZMIN && z<M.ZMAX;
      if(ok){ const y=getHeight(x,z); const conc=Math.hypot(x-CENTER[0],z-CENTER[1])<700; const H=conc?9.2:8.4; const f=frame(x,z,Math.atan2(t[1],t[0]),y);
        const G=T(conc?'curb':'wood',x,z);
        if(conc) G.box(f,-0.14,0.14,-0.5,H,-0.11,0.11,concreteC,0.4); else G.cyl(f,0.13,0.1,-0.5,H,6,woodPoleC,0.5,false);
        const Tm=T('metal',x,z); Tm.box(f,-0.05,0.05,H-0.55,H-0.45,-0.85,0.85,darkC);
        for(const zz of [-0.7,0,0.7]) Tm.cyl(frame(...(()=>{ const q=f(0,0,zz); return [q[0],q[2]]; })(),0,y),0.05,0.04,H-0.45,H-0.25,6,insC);
        const top=[x,y+H-0.25,z]; poleTops.push({p:top,f,side,t}); poleList.push({x,z,y,H});
        if(prev && Math.hypot(prev.p[0]-x,prev.p[2]-z)<60){ for(const zz of [-0.7,0,0.7]){ const a=prev.f(0,0,zz), b=f(0,0,zz); catenary([a[0],prev.p[1],a[2]],[b[0],top[1],b[2]],rnd(0.45,0.8),8); } }
        prev={p:top,f}; addCollider(x,z,0,0.35,0.35,y-1,y+H); }
      else prev=null;
      s+=rnd(34,42); } }
  // service drops to nearby houses
  for(const b of BLD){ if(b.k!=='house'||!b.top) continue; const [cx,cz]=b.rect; let best=null, bd=28; for(const pt of poleTops){ const d=Math.hypot(pt.p[0]-cx,pt.p[2]-cz); if(d<bd){ bd=d; best=pt; } } if(!best) continue; const fr=frame(b.rect[0],b.rect[1],b.rect[2]); const si=sideInfo(b.f,b.rect[3]/2,b.rect[4]/2); const hp=wallPoint(fr,si,si.e*0.6,0.1); catenary([best.p[0],best.p[1]-0.3,best.p[2]],[hp[0],b.top-0.3,hp[2]],0.35,6); }
  /* ---- 35 kV pylons ---- */
  { const tg=new GB(); const mC=lin('#8e9296'); const I=(x,y,z)=>[x,y,z];
    const Hh=15.5; const leg=(t)=>lerp(1.7,0.45,t);
    for(const [sx,sz] of [[1,1],[-1,1],[-1,-1],[1,-1]]){ for(let k=0;k<6;k++){ const y0=k/6*Hh*0.9, y1=(k+1)/6*Hh*0.9; const a=I(sx*leg(y0/Hh),y0,sz*leg(y0/Hh)), b=I(sx*leg(y1/Hh),y1,sz*leg(y1/Hh)); beam(tg,a,b,0.06,mC); } }
    for(let k=0;k<6;k++){ const y0=k/6*Hh*0.9, y1=(k+1)/6*Hh*0.9; const l0=leg(y0/Hh), l1=leg(y1/Hh); for(const [ax,az,bx,bz] of [[1,1,-1,1],[-1,1,-1,-1],[-1,-1,1,-1],[1,-1,1,1]]){ beam(tg,I(ax*l0,y0,az*l0),I(bx*l1,y1,bz*l1),0.03,mC); beam(tg,I(bx*l0,y0,bz*l0),I(ax*l1,y1,az*l1),0.03,mC); } }
    const yt=Hh*0.9; beam(tg,I(0,yt,-3.2),I(0,yt,3.2),0.08,mC); beam(tg,I(0.45,yt-1.2,0.45),I(0,yt,-3.2),0.04,mC); beam(tg,I(-0.45,yt-1.2,-0.45),I(0,yt,3.2),0.04,mC); beam(tg,I(0,yt,0),I(0,Hh+1.3,0),0.07,mC);
    for(const zz of [-3.0,3.0]) beam(tg,I(0,yt,zz),I(0,yt-0.9,zz),0.05,insC); beam(tg,I(0,Hh+1.0,0),I(0,Hh+0.2,0.1),0.05,insC);
    const geo=tg.geometry(); const towers=[];
    for(const pl of D.power){ const P=unflat(pl.p); for(let i=0;i<P.length;i++){ const [x,z]=P[i]; if(x<X0+20||x>X0+GW-20||z<Z0+20||z>Z0+GH-20) continue; const a=P[Math.max(0,i-1)], c=P[Math.min(P.length-1,i+1)]; const ang=Math.atan2(c[1]-a[1],c[0]-a[0]); towers.push({x,z,y:getHeight(x,z),ang,line:pl}); } }
    const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.6,roughness:0.5}),towers.length); const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0);
    towers.forEach((t,i)=>{ q.setFromAxisAngle(up,-t.ang); m4.compose(new THREE.Vector3(t.x,t.y-0.3,t.z),q,new THREE.Vector3(1,1,1)); im.setMatrixAt(i,m4); addCollider(t.x,t.z,t.ang,3.6,3.6,t.y-1,t.y+18); });
    im.castShadow=true; im.receiveShadow=true; scene.add(im);
    for(let i=0;i<towers.length-1;i++){ const a=towers[i], b=towers[i+1]; if(a.line!==b.line) continue; if(Math.hypot(a.x-b.x,a.z-b.z)>400) continue;
      const tip=(t,zz,yy)=>[t.x-Math.sin(t.ang)*zz, t.y-0.3+yy, t.z+Math.cos(t.ang)*zz];
      for(const [zz,yy] of [[-3.0,Hh*0.9-0.9],[3.0,Hh*0.9-0.9],[0.1,Hh+0.2]]) catenary(tip(a,zz,yy),tip(b,zz,yy),rnd(2.2,3.2),14); }
  }
  /* ---- bus shelters & stop signs ---- */
  const shelters=[[-212.6,-29.6,'glass',1],[-260.7,-125.3,'glass',-1],[-578,86,'wood',1],[-1205,40,'wood',1]];
  for(const [x,z,kind,pref] of shelters){ const n=nearestRoad(x,z,40,s=>s.t==='secondary'||s.t==='primary'||s.t==='tertiary'); if(!n) continue; const s=n.s; let side=pref; const nx=-s.tz*side, nz=s.tx*side; const px=s.x+nx*(s.w/2+2.0), pz=s.z+nz*(s.w/2+2.0);
    if(BHASH.hit(px,pz,1.5)) continue; const y=getHeight(px,pz); const ang=Math.atan2(s.tz,s.tx); const f=frame(px,pz,ang,y); const back=side>0?1:-1; // local z toward road = -back*? compute sign
    const zRoad=(()=>{ const q=f(0,0,1); const d1=Math.hypot(q[0]-s.x,q[2]-s.z); const q2=f(0,0,-1); const d2=Math.hypot(q2[0]-s.x,q2[2]-s.z); return d1<d2?1:-1; })();
    const zb=-zRoad*0.8; // back wall position
    if(kind==='glass'){ const Gm=T('metal',px,pz), Gg=T('glass',px,pz); const mc=lin('#5a6068');
      for(const xx of [-1.9,1.9]) for(const zz of [zb,-zb*0.9]) Gm.box(f,xx-0.05,xx+0.05,0,2.35,zz-0.05,zz+0.05,mc);
      Gm.box(f,-2.1,2.1,2.35,2.45,Math.min(zb,-zb)-0.2,Math.max(zb,-zb)+0.2,lin('#8d949b'));
      Gg.box(f,-1.85,1.85,0.15,2.3,zb-0.01,zb+0.01,WHITE); for(const xx of [-1.9,1.9]) Gg.box(f,xx-0.01,xx+0.01,0.15,2.3,Math.min(zb,0),Math.max(zb,0),WHITE);
      T('wood',px,pz).box(f,-1.5,1.5,0.45,0.5,zb*0.75-0.2,zb*0.75+0.2,lin('#8a6a4a'));
      T('trim',px,pz).box(f,-1.2,-0.5,0.3,2.1,zb+zRoad*0.03-0.02,zb+zRoad*0.03+0.02,lin('#e8e6de'));
    } else { const W=T('wood',px,pz); const wc=lin('#9a7a58'); W.box(f,-1.8,1.8,0,2.1,zb-0.06,zb+0.06,wc,0.5); for(const xx of [-1.8,1.8]) W.box(f,xx-0.06,xx+0.06,0,2.1,Math.min(zb,-zb*0.4),Math.max(zb,-zb*0.4),wc,0.5);
      emitRoof(cs,frame(px,pz,ang),ang,2.0,1.1,y+2.1,'gable',25,0.2,0.15,lin('#6b3f2c'),lin('#5a3a26')); W.box(f,-1.5,1.5,0.45,0.5,zb*0.6-0.18,zb*0.6+0.18,wc); }
    addCollider(px,pz,ang,4.2,1.8,y-1,y+3);
    // stop sign
    const sp=f(2.6,0,-zb*0.9); SIGNPOSTS.push({x:sp[0],z:sp[2],y:getHeight(sp[0],sp[2]),face:Math.atan2(s.tx,s.tz),tex:'bus'});
  }
  /* ---- crossings: signs ---- */
  for(const [x,z,tx,tz,w] of CROSSINGS){ for(const side of [1,-1]){ const nx=-tz*side, nz=tx*side; const px=x+nx*(w/2+1.3)+tx*2.2*side, pz=z+nz*(w/2+1.3)+tz*2.2*side; if(BHASH.hit(px,pz,0.8)) continue; SIGNPOSTS.push({x:px,z:pz,y:getHeight(px,pz),face:Math.atan2(tx,tz)+(side>0?Math.PI:0),tex:'cross'}); } }
  /* ---- place-name signs & direction signs ---- */
  const nameSigns=[[-468,47,'2153'],[70,-16,'2248'],[-251,-330,'2248']];
  for(const [x,z] of nameSigns){ const n=nearestRoad(x,z,30,s=>s.t==='secondary'); if(!n) continue; const s=n.s; const px=s.x-s.tz*(s.w/2+1.4), pz=s.z+s.tx*(s.w/2+1.4); const toC=Math.atan2(CENTER[0]-px,CENTER[1]-pz); const face=Math.atan2(s.tx,s.tz); const f1=Math.cos(face-toC)>0?face+Math.PI:face; SIGNPOSTS.push({x:px,z:pz,y:getHeight(px,pz),face:f1,tex:'name',h:2.1,w:1.8}); }
  SIGNPOSTS.push({x:-236,z:-60.5,y:getHeight(-236,-60.5),face:Math.atan2(-0.9,0.4),tex:'dir',h:2.4,w:1.9});
  buildSignposts(scene,cs);
  /* ---- street lamps in the centre ---- */
  for(const pts of SIDEWALKS){ for(let k=6;k<pts.length;k+=20){ const p=pts[k]; const x=p.ot[0]-p.n[0]*0.3, z=p.ot[2]-p.n[1]*0.3; if(BHASH.hit(x,z,1)) continue; const y=p.ot[1]; const ang=Math.atan2(-p.n[0],p.n[1]); const f=frame(x,z,Math.atan2(p.n[1],p.n[0]),y);
      const G=T('metal',x,z); const lc=lin('#6c7176'); G.cyl(f,0.08,0.06,0,7.2,6,lc,1,false); G.box(f,-1.4,0.05,7.1,7.2,-0.04,0.04,lc); G.box(f,-1.9,-1.2,6.98,7.14,-0.16,0.16,lin('#4a4e52')); addCollider(x,z,0,0.3,0.3,y-1,y+7); { const hp=f(-1.55,6.95,0); LAMPS.push({x:hp[0],y:hp[1],z:hp[2],a:Math.atan2(p.n[1],p.n[0])}); } } }
  /* ---- fences & hedges along house lots ---- */
  const fenceMats={bars:fenceTex('bars'),picket:fenceTex('picket'),mesh:fenceTex('mesh')};
  const fg={bars:new GB(),picket:new GB(),mesh:new GB()};
  for(const b of BLD){ if(b.k!=='house' || !b.dw || b.st==='photo' || RNG()>0.5) continue; const n=nearestRoad(b.dw[0],b.dw[1],6); if(!n) continue; const s=n.s; const [cx,cz]=b.rect; const toH=[cx-s.x,cz-s.z]; const nx=-s.tz, nz=s.tx; const side=(toH[0]*nx+toH[1]*nz)>0?1:-1;
    const off=s.w/2+(s.t==='residential'||s.t==='service'?0.9:1.6); const len=Math.max(b.rect[3],b.rect[4])+rnd(4,10); const kind=wpick([['hedge',30],['bars',30],['picket',18],['mesh',22]]);
    const gap0=-1.6+rnd(-2,2), gap1=gap0+3.2;
    const ox=s.x+nx*side*off, oz=s.z+nz*side*off; // projected base
    // centre along tangent aligned to the house
    const along=(cx-s.x)*s.tx+(cz-s.z)*s.tz; const c0=[ox+s.tx*along, oz+s.tz*along];
    for(let a=-len/2;a<len/2;a+=2){ const a1=Math.min(len/2,a+2); if(a1>gap0 && a<gap1) continue; const p0=[c0[0]+s.tx*a,c0[1]+s.tz*a], p1=[c0[0]+s.tx*a1,c0[1]+s.tz*a1];
      if(noHedge(p0[0],p0[1])||noHedge(p1[0],p1[1])||!roadClear(p0[0],p0[1],0.5)||!roadClear(p1[0],p1[1],0.5)||BHASH.hit(p0[0],p0[1],0.4)||BHASH.hit(p1[0],p1[1],0.4)) continue;
      const y0=getHeight(...p0), y1=getHeight(...p1);
      if(kind==='hedge'){ const G=T('hedge',p0[0],p0[1]); const hh=rnd(1.3,1.8); const f=frame((p0[0]+p1[0])/2,(p0[1]+p1[1])/2,Math.atan2(s.tz,s.tx),Math.min(y0,y1)-0.2); G.box(f,-(a1-a)/2-0.05,(a1-a)/2+0.05,0,hh+0.2,-0.4,0.4,colJ(lin('#3e6a2e'),0.2),0.8,0x3f^8); }
      else { const H=kind==='bars'?1.25:kind==='picket'?1.05:1.3; const g=fg[kind]; const base=kind==='bars'?0.45:0;
        if(base>0){ const f=frame((p0[0]+p1[0])/2,(p0[1]+p1[1])/2,Math.atan2(s.tz,s.tx),Math.min(y0,y1)-0.25); T('wall',p0[0],p0[1]).box(f,-(a1-a)/2,(a1-a)/2,0,base+0.25,-0.1,0.1,lin('#e9e6de'),0.5); }
        g.quad([p0[0],y0+base,p0[1]],[p1[0],y1+base,p1[1]],[p1[0],y1+base+H-base,p1[1]],[p0[0],y0+base+H-base,p0[1]],[0,0],[1,0],[1,1],[0,1],WHITE,[nx,0,nz]); } } }
  for(const k of ['bars','picket','mesh']){ if(!fg[k].count) continue; const m=new THREE.Mesh(fg[k].geometry(),new THREE.MeshStandardMaterial({map:fenceMats[k],alphaTest:0.5,side:THREE.DoubleSide,roughness:0.7,metalness:k==='bars'?0.4:0})); m.castShadow=true; m.receiveShadow=true; scene.add(m); }
  /* ---- cemetery ---- */
  for(const l of LAND){ if(l.t!=='cemetery') continue; cemetery(cs,l.P); }
  /* ---- hay bales ---- */
  for(const fl of FIELDS){ if(!(fl.crop==='stubble'||(fl.crop==='hay'&&RNG()<0.25))) continue; const nb=rndi(2,9); for(let i=0;i<nb;i++){ const t=rnd(fl.umin,fl.umax), s2=rnd(fl.s0+3,fl.s1-3); const x=fl.u[0]*t+fl.v[0]*s2, z=fl.u[1]*t+fl.v[1]*s2; if(!pointInPoly(x,z,fl.P)||!roadClear(x,z,3)) continue; const y=getHeight(x,z); const f=frame(x,z,rnd(0,TAU),y);
      const G=T('straw',x,z); G.cyl(frame(x,z,0,y+0.62),0.62,0.62,-0.6,0.6,12,colJ(lin('#d6c07a'),0.2),1,true); } }
  /* ---- misc extras (tables, hydrant, benches) ---- */
  for(const e of PROPS_EXTRA){ if(e.t==='table'||e.t==='hydrant'||e.t==='pot'){ const q=offRoad(e.x,e.z,0.9); e.x=q[0]; e.z=q[1]; } const y=getHeight(e.x,e.z);
    if(e.t==='table'){ const f=frame(e.x,e.z,e.ang||0,y); const G=T('metal',e.x,e.z); G.cyl(f,0.04,0.04,0,0.74,6,lin('#444')); G.cyl(frame(e.x,e.z,0,y+0.74),0.45,0.45,0,0.03,12,lin('#e8e4dc')); for(const a of [0,Math.PI]){ const cx=e.x+Math.cos((e.ang||0)+a)*0.75, cz=e.z+Math.sin((e.ang||0)+a)*0.75; const cf=frame(cx,cz,(e.ang||0)+a,y); G.box(cf,-0.22,0.22,0.44,0.48,-0.22,0.22,lin('#6a4a32')); G.box(cf,0.2,0.24,0.48,0.9,-0.22,0.22,lin('#6a4a32')); for(const [lx,lz] of [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]]) G.box(cf,lx-0.02,lx+0.02,0,0.44,lz-0.02,lz+0.02,lin('#333')); }
      const U=T('cloth',e.x,e.z); G.cyl(f,0.025,0.025,0.74,2.3,5,lin('#ddd')); lathe(U,frame(e.x,e.z,0,y),[[1.4,1.95],[0.9,2.2],[0.05,2.42],[0,2.43]],8,lin(pick(['#c62828','#f1efe8','#2e6b3a']))); addCollider(e.x,e.z,0,1.2,1.2,y-1,y+2); }
    if(e.t==='hydrant'){ const G=T('metal',e.x,e.z); G.cyl(frame(e.x,e.z,0,y),0.11,0.1,0,0.8,8,lin('#b3261e')); G.cyl(frame(e.x,e.z,0,y+0.8),0.13,0.02,0,0.12,8,lin('#b3261e')); }
  }
  for(const [x0,z0,a] of [[-262,-33,0.3],[-328,-12,1.8],[-208,-26,0.3]]){ const [x,z]=offRoad(x0,z0,1.3); const y=getHeight(x,z); const f=frame(x,z,a,y); const G=T('wood',x,z); G.box(f,-0.9,0.9,0.42,0.47,-0.22,0.22,lin('#8a6a4a')); G.box(f,-0.9,0.9,0.55,0.85,0.2,0.24,lin('#8a6a4a')); const Mt=T('metal',x,z); for(const xx of [-0.75,0.75]) Mt.box(f,xx-0.03,xx+0.03,0,0.45,-0.2,0.2,lin('#333')); addCollider(x,z,a,1.9,0.6,y-1,y+1); }
  /* wayside cross (raspelo) */
  for(const p of D.pois){ if(p.k!=='wayside_cross') continue; const y=getHeight(p.x,p.z); const f=frame(p.x,p.z,0.4,y); const G=T('wood',p.x,p.z); const wc=lin('#5a4030'); G.box(f,-0.1,0.1,0,4.2,-0.1,0.1,wc); G.box(f,-0.1,0.1,3.0,3.2,-0.85,0.85,wc); emitRoof(cs,frame(p.x,p.z,0.4+Math.PI/2),0.4+Math.PI/2,0.3,0.95,y+4.2,'gable',30,0.1,0.1,lin('#6d6f71'),lin('#4a3223'),'roofMetal'); T('stonem',p.x,p.z).box(f,-0.4,0.4,-0.3,0.35,-0.4,0.4,lin('#b9b3a6'),0.5); addCollider(p.x,p.z,0.4,0.8,0.8,y-1,y+4); }
  // materials
  const mats=propMats();
  const meshes=cs.meshes(mats); for(const m of meshes) scene.add(m);
  // wires
  const wg=new THREE.BufferGeometry(); wg.setAttribute('position',new THREE.Float32BufferAttribute(WIRES,3)); const wmat=new THREE.LineBasicMaterial({color:0x1d1e20,transparent:true,opacity:0.85});
  wmat.onBeforeCompile=(sh)=>{ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vWD;').replace('#include <fog_vertex>','#include <fog_vertex>\nvWD=-mvPosition.z;'); sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vWD;').replace('#include <opaque_fragment>','diffuseColor.a*=clamp(1.15-vWD/260.0,0.0,1.0);\n#include <opaque_fragment>'); };
  const wires=new THREE.LineSegments(wg,wmat); wires.frustumCulled=false; scene.add(wires);
  PROPS.poles=poleList;
}
const PROPS={};
const SIGNPOSTS=[];
function beam(G,a,b,r,C){ const dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2]; const L=Math.hypot(dx,dy,dz); const d=[dx/L,dy/L,dz/L]; let up=Math.abs(d[1])<0.9?[0,1,0]:[1,0,0]; const s=[d[1]*up[2]-d[2]*up[1], d[2]*up[0]-d[0]*up[2], d[0]*up[1]-d[1]*up[0]]; const sl=Math.hypot(...s); s[0]/=sl; s[1]/=sl; s[2]/=sl; const t=[d[1]*s[2]-d[2]*s[1], d[2]*s[0]-d[0]*s[2], d[0]*s[1]-d[1]*s[0]];
  const P=(p,i,j)=>[p[0]+s[0]*i*r+t[0]*j*r, p[1]+s[1]*i*r+t[1]*j*r, p[2]+s[2]*i*r+t[2]*j*r]; const cs=[[1,1],[-1,1],[-1,-1],[1,-1]];
  for(let k=0;k<4;k++){ const [i0,j0]=cs[k], [i1,j1]=cs[(k+1)%4]; const out=[s[0]*(i0+i1)+t[0]*(j0+j1), s[1]*(i0+i1)+t[1]*(j0+j1), s[2]*(i0+i1)+t[2]*(j0+j1)]; G.quad(P(a,i0,j0),P(a,i1,j1),P(b,i1,j1),P(b,i0,j0),[0,0],[1,0],[1,1],[0,1],C,out); } }
function signTexCanvas(kind){
  if(kind==='bus'){ const c=cvs(256,256), g=c.getContext('2d'); g.fillStyle='#1f5aa6'; g.fillRect(0,0,256,256); g.strokeStyle='#fff'; g.lineWidth=10; g.strokeRect(12,12,232,232); g.fillStyle='#fff'; g.fillRect(58,70,140,96); g.fillStyle='#1f5aa6'; g.fillRect(70,82,50,34); g.fillRect(132,82,52,34); g.fillStyle='#fff'; g.beginPath(); g.arc(88,176,15,0,TAU); g.arc(168,176,15,0,TAU); g.fill(); return c; }
  if(kind==='cross'){ const c=cvs(256,256), g=c.getContext('2d'); g.fillStyle='#1f5aa6'; g.fillRect(0,0,256,256); g.fillStyle='#fff'; g.beginPath(); g.moveTo(128,28); g.lineTo(234,220); g.lineTo(22,220); g.closePath(); g.fill(); g.fillStyle='#111'; for(let i=0;i<5;i++) g.fillRect(52+i*32,196,18,14); g.beginPath(); g.arc(132,92,11,0,TAU); g.fill(); g.lineWidth=10; g.strokeStyle='#111'; g.lineCap='round'; g.beginPath(); g.moveTo(130,106); g.lineTo(122,146); g.lineTo(104,178); g.moveTo(122,146); g.lineTo(144,176); g.moveTo(128,118); g.lineTo(150,134); g.moveTo(128,118); g.lineTo(108,132); g.stroke(); return c; }
  if(kind==='name'){ const c=cvs(512,256), g=c.getContext('2d'); g.fillStyle='#f7f7f2'; g.fillRect(0,0,512,256); g.strokeStyle='#111'; g.lineWidth=14; g.strokeRect(16,16,480,224); g.fillStyle='#111'; g.font='800 112px Manrope, Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('Tuhelj',256,112); g.font='600 34px Manrope, Arial'; g.fillText('Krapinsko-zagorska',256,196); return c; }
  if(kind==='dir'){ const c=cvs(512,384), g=c.getContext('2d'); g.fillStyle='#1f5aa6'; g.fillRect(0,0,512,384); g.fillStyle='#fff'; g.font='700 44px Manrope, Arial'; g.textBaseline='middle'; const rows=[['← Kumrovec','8'],['↑ Krapinske Toplice','11'],['→ Tuheljske Toplice','3']]; rows.forEach(([t,k],i)=>{ g.fillText(t,24,70+i*120); g.fillText(k,452,70+i*120); g.fillRect(16,128+i*120,480,4); }); return c; }
}
function buildSignposts(scene,cs){ const texes={}; const groups={};
  for(const s of SIGNPOSTS){ const h=s.h||2.2; const pc=lin('#9aa0a6'); const G=cs.get('metal',s.x,s.z);
    const k=s.tex; if(!groups[k]) groups[k]=new GB(); const g=groups[k]; const fx=Math.sin(s.face), fz=Math.cos(s.face); const rx=fz, rz=-fx; const sw=s.tex==='name'?1.8:s.tex==='dir'?1.9:0.62, sh=s.tex==='name'?0.9:s.tex==='dir'?1.42:0.62; const cy=s.y+h+(s.tex==='name'?-0.35:0); const cx=s.x+fx*0.05, cz=s.z+fz*0.05;
    if(k==='name'||k==='dir'){ for(const o of [-sw/2+0.18,sw/2-0.18]) G.cyl(frame(s.x+rx*o,s.z+rz*o,0,s.y-0.3),0.04,0.04,0,h+0.3+sh/2-0.05,6,pc,1,false); }
    else G.cyl(frame(s.x,s.z,0,s.y-0.3),0.035,0.035,0,h+0.3+sh/2,6,pc,1,false);
    const A=[cx-rx*sw/2,cy-sh/2,cz-rz*sw/2], B=[cx+rx*sw/2,cy-sh/2,cz+rz*sw/2], C=[cx+rx*sw/2,cy+sh/2,cz+rz*sw/2], Dd=[cx-rx*sw/2,cy+sh/2,cz-rz*sw/2];
    g.quad(A,B,C,Dd,[0,0],[1,0],[1,1],[0,1],WHITE,[fx,0,fz]); const bk=lin('#8a8f94'); cs.get('metal',s.x,s.z).quad(B,A,Dd,C,[0,0],[1,0],[1,1],[0,1],bk,[-fx,0,-fz]); addCollider(s.x,s.z,0,0.2,0.2,s.y-1,s.y+2.5); }
  for(const k in groups){ const m=new THREE.Mesh(groups[k].geometry(),new THREE.MeshStandardMaterial({map:mkTex(signTexCanvas(k),{repeat:false}),roughness:0.5,metalness:0.1})); m.receiveShadow=true; m.castShadow=true; scene.add(m); } }
function cemetery(cs,P){ const bb=polyBBox(P); const ang=longestEdgeAngle(P); const u=[Math.cos(ang),Math.sin(ang)], v=[-u[1],u[0]]; const cx=(bb[0]+bb[1])/2, cz=(bb[2]+bb[3])/2;
  const stoneCs=['#3b3b3e','#e7e5df','#b8b2a6','#5b5048','#d2cdc2']; const G=cs.get('stonem',cx,cz), R=cs.get('metal',cx,cz);
  for(let a=-60;a<60;a+=2.5) for(let b=-60;b<60;b+=3.4){ if(Math.abs(a)%12<2.4) continue; const x=cx+u[0]*a+v[0]*b, z=cz+u[1]*a+v[1]*b; if(!pointInPoly(x,z,P)) continue; let edge=false; for(let i=0;i<P.length;i++){ const p=P[i], q=P[(i+1)%P.length]; if(segDist(x,z,p[0],p[1],q[0],q[1])<2.2){ edge=true; break; } } if(edge||RNG()<0.12) continue;
    const y=getHeight(x,z); const f=frame(x,z,ang,y); const c=lin(pick(stoneCs)); G.box(f,-0.5,0.5,-0.1,0.22,-1.0,1.0,c,0.6); G.box(f,-0.45,0.45,0.22,0.26,-0.95,0.95,colJ(c,0.3),0.6); G.box(f,-0.45,0.45,0.2,rnd(0.8,1.2),-1.12,-0.98,c,0.6);
    for(let k=0;k<rndi(1,3);k++) R.box(f,-0.32+k*0.22,-0.22+k*0.22,0.26,0.44,-0.6,-0.5,lin('#b3261e')); addCollider(x,z,ang,1.0,2.2,y-1,y+1.2); }
  // wall
  const W=cs.get('wall',cx,cz); for(let i=0;i<P.length;i++){ const p=P[i], q=P[(i+1)%P.length]; const L=Math.hypot(q[0]-p[0],q[1]-p[1]); const a=Math.atan2(q[1]-p[1],q[0]-p[0]); for(let s=0;s<L;s+=3){ const s1=Math.min(L,s+3); if(i===0 && s>L*0.45 && s<L*0.55) continue; const mx=p[0]+(q[0]-p[0])*(s+s1)/2/L, mz=p[1]+(q[1]-p[1])*(s+s1)/2/L; const y=getHeight(mx,mz); W.box(frame(mx,mz,a,y),-(s1-s)/2-0.1,(s1-s)/2+0.1,-0.3,1.0,-0.14,0.14,lin('#e9e6de'),0.5); addCollider(mx,mz,a,s1-s+0.2,0.3,y-1,y+1); } }
  // central cross
  const y=getHeight(cx,cz); const f=frame(cx,cz,ang,y); const Wd=cs.get('wood',cx,cz); Wd.box(f,-0.12,0.12,0,5,-0.12,0.12,lin('#4a3426')); Wd.box(f,-0.12,0.12,3.5,3.75,-1.1,1.1,lin('#4a3426')); G.box(f,-0.8,0.8,-0.2,0.4,-0.8,0.8,lin('#bdb7aa'),0.5);
  for(let i=0;i<P.length;i++){ const p=P[i], q=P[(i+1)%P.length]; const L=Math.hypot(q[0]-p[0],q[1]-p[1]); for(let s=4;s<L-2;s+=rnd(7,12)){ const x=p[0]+(q[0]-p[0])*s/L, z=p[1]+(q[1]-p[1])*s/L; const cxx=x+(cx-x)*0.05, czz=z+(cz-z)*0.05; addTree(cxx,czz,rnd(6,10),rnd(1.3,2.0),colJ(lin('#2f4a2c'),0.2),1); } }
}
function propMats(){
  return {
    wall:new THREE.MeshStandardMaterial({map:TEX.plaster,vertexColors:true,roughness:0.92}),
    wood:new THREE.MeshStandardMaterial({map:TEX.wood,vertexColors:true,roughness:0.9}),
    curb:new THREE.MeshStandardMaterial({map:TEX.concrete,vertexColors:true,roughness:0.9}),
    metal:new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.55,roughness:0.45}),
    trim:new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.8}),
    glass:new THREE.MeshStandardMaterial({color:0x9fb4c0,transparent:true,opacity:0.28,roughness:0.05,metalness:0.1,depthWrite:false}),
    hedge:new THREE.MeshStandardMaterial({map:TEX.hedge,vertexColors:true,roughness:0.95}),
    stonem:new THREE.MeshStandardMaterial({map:TEX.stone,vertexColors:true,roughness:0.8}),
    straw:new THREE.MeshStandardMaterial({map:TEX.dirt,vertexColors:true,roughness:1}),
    cloth:new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.9,side:THREE.DoubleSide}),
    roof:new THREE.MeshStandardMaterial({map:TEX.tiles,vertexColors:true,roughness:0.75}),
    roofMetal:new THREE.MeshStandardMaterial({map:TEX.metal,vertexColors:true,roughness:0.45,metalness:0.5}),
    soffit:new THREE.MeshStandardMaterial({map:TEX.wood,vertexColors:true,roughness:0.9}),
    win:new THREE.MeshStandardMaterial({map:TEX.win,roughness:0.3,metalness:0.05,alphaTest:0.5,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
    glow:new THREE.MeshBasicMaterial({color:0xfff0c8,vertexColors:true}),
    stain:new THREE.MeshBasicMaterial({map:TEX.stain||null,vertexColors:true,side:THREE.DoubleSide,alphaTest:0.5}),
  };
}
