/* ===================== Pristavčica — the creek where the player drew it =====================
   Across the meadow from the west, under the blue-railed bridge by the bus stop / workout park (Street View
   "41 Tuhelj"), on between the house and the long barn, and away east to the Horvatska.
   The terrain grid is 6 m, far too coarse for a 4-5 m creek, so the channel is its own fine mesh:
   level meadow → bank down → water → bank up → level again. getHeight() follows the channel (you walk and drive
   into it smoothly), the coarse terrain is cut away under it by a mask, and road crossings become real bridges. */
const CREEK={on:false,T:2.25,Bh:0.5,Dp:1.35,Wc:2.85,cell:8,cross:[]};
const CREEK_FIX=[[-530,-52],[-500,-67],[-465,-79],[-430,-90],[-395,-100],[-360,-107],[-330,-110],[-300,-111.5],[-275,-111.8],[-262,-111.5],[-250,-111],[-240,-110.2],[-228,-109.6],[-216,-110.6],[-205,-114],[-190,-121]]; // the bridge ~12 m past the bus stop, then between the white house with the balcony and the long barn (Street View)
function creekDP(xa,xb,za,zb,penF){ const SX=6, SZ=3; const zc=(za!==null?za:zb), Z1=zc-180, Z2=zc+180, nz=Math.round((Z2-Z1)/SZ)+1;
  const BL=[].concat(...D.bld.map(b=>b.r)); const pen=(x,z)=>{ let p=0; for(const r of BL){ const dx=x-r[0], dz=z-r[1]; if(Math.abs(dx)>30||Math.abs(dz)>30) continue; const c=Math.cos(r[2]), sn=Math.sin(r[2]); const lx=Math.abs(dx*c+dz*sn)-r[3]/2, lz=Math.abs(-dx*sn+dz*c)-r[4]/2; const d=Math.hypot(Math.max(lx,0),Math.max(lz,0)); if(d<7) p+=80*(1-d/7); } return p; };
  const FL=LAND.filter(l=>l.t==='farmland').map(l=>({P:l.P,bb:polyBBox(l.P)})); const field=(x,z)=>{ for(const f of FL){ if(x<f.bb[0]||x>f.bb[1]||z<f.bb[2]||z>f.bb[3]) continue; if(pointInPoly(x,z,f.P)) return 22; } return 0; }; /* keep the creek on meadows and field edges, not across ploughed land */
  const xs=[]; let prev=null; const back=[]; for(let x=xa;x<=xb+1e-6;x+=SX){ xs.push(x); const cur=new Float32Array(nz), from=new Int16Array(nz);
    for(let j=0;j<nz;j++){ const z=Z1+j*SZ; const gi=clamp(Math.round((x-X0)/CELL),0,NX-1)+clamp(Math.round((z-Z0)/CELL),0,NZ-1)*NX; const c=getHeight(x,z)+pen(x,z)+ROADMASK[gi]*10+field(x,z)+(penF?penF(x,z):0);
      if(!prev){ cur[j]=(za!==null&&Math.abs(z-za)>SZ*0.6)?1e12:c; from[j]=j; continue; } let bv=1e18,bj=j; for(let k=-3;k<=3;k++){ const jj=j+k; if(jj<0||jj>=nz) continue; const v=prev[jj]+Math.abs(k)*0.7; if(v<bv){ bv=v; bj=jj; } } cur[j]=bv+c; from[j]=bj; }
    back.push(from); prev=cur; }
  let j=0; if(zb!==null){ j=clamp(Math.round((zb-Z1)/SZ),0,nz-1); } else { for(let k=1;k<nz;k++) if(prev[k]<prev[j]) j=k; }
  const zs=new Array(xs.length); for(let i=xs.length-1;i>=0;i--){ zs[i]=Z1+j*SZ; j=back[i][j]; }
  let P=xs.map((x,i)=>[x,zs[i]]); for(let pass=0;pass<3;pass++) P=P.map((p,i)=>{ if(i===0||i===P.length-1) return p; let sx=0,sz=0,n=0; for(let k=-2;k<=2;k++){ const q=P[Math.max(0,Math.min(P.length-1,i+k))]; sx+=q[0]; sz+=q[1]; n++; } return [sx/n,sz/n]; }); return P; }
function chaikin(P,it){ for(let k=0;k<it;k++){ const Q=[P[0]]; for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1]; Q.push([a[0]*0.75+b[0]*0.25,a[1]*0.75+b[1]*0.25],[a[0]*0.25+b[0]*0.75,a[1]*0.25+b[1]*0.75]); } Q.push(P[P.length-1]); P=Q; } return P; }
function creekBuild(){ if(CREEK.on) return; for(let i=WATER.length-1;i>=0;i--) if(/Pristav/.test(WATER[i].n||'')) WATER.splice(i,1);
  const west=creekDP(-1260,-530,null,CREEK_FIX[0][1]);
  const hv=WATER.find(w=>w.n==='Horvatska'); let zJ=-250; if(hv){ const n=nearOnPoly(hv.P,60,-250); zJ=n.z; }
  const east=creekDP(-190,60,CREEK_FIX[CREEK_FIX.length-1][1],zJ,(x,z)=>(x<-40&&z>-112?60:0)+(x>-255&&x<-60&&z>-290&&z<-120?90:0));
  let P=west.slice(0,-1).concat(CREEK_FIX,east.slice(1)); P=chaikin(P,2); const S=resample(P,1.0).map(p=>[p[0],p[1]]);
  const N=S.length, h0=new Float32Array(N); for(let i=0;i<N;i++) h0[i]=getHeight(S[i][0],S[i][1]);
  // flow from the higher end; the bed only ever goes down the way the water runs
  const up0=h0[0]>=h0[N-1]; const bed=new Float32Array(N); { let prevB=1e9; for(let k=0;k<N;k++){ const i=up0?k:N-1-k; let b=Math.min(prevB,h0[i]-CREEK.Dp); b=Math.max(b,h0[i]-3.0); bed[i]=b; prevB=Math.min(prevB,b); } }
  const lev=new Float32Array(N); for(let i=0;i<N;i++) lev[i]=bed[i]+0.32;
  Object.assign(CREEK,{S,N,h0,bed,lev,up0}); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const p of S){ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); z0=Math.min(z0,p[1]); z1=Math.max(z1,p[1]); } const M=CREEK.Wc+2; CREEK.bb=[x0-M,x1+M,z0-M,z1+M];
  // segment hash
  const H=new Map(), C=CREEK.cell, R=CREEK.Wc+1.5; for(let i=0;i<N-1;i++){ const a=S[i], b=S[i+1]; const cx0=Math.floor((Math.min(a[0],b[0])-R)/C), cx1=Math.floor((Math.max(a[0],b[0])+R)/C), cz0=Math.floor((Math.min(a[1],b[1])-R)/C), cz1=Math.floor((Math.max(a[1],b[1])+R)/C);
    for(let u=cx0;u<=cx1;u++) for(let v=cz0;v<=cz1;v++){ const k=u+'|'+v; let L=H.get(k); if(!L){ L=[]; H.set(k,L); } L.push(i); } } CREEK.H=H;
  // where roads cross: decks (bridges) — same smoothing as the road mesh
  for(const r of ROADS){ if(r.t==='path') continue; const RP=smoothCorners(r.P,8,2); const big=r.t==='secondary'||r.t==='primary'||r.t==='tertiary'; const m=big?2.3:0.7;
    for(let j=0;j<RP.length-1;j++){ const A=RP[j], B=RP[j+1]; if(Math.max(A[0],B[0])<x0-10||Math.min(A[0],B[0])>x1+10||Math.max(A[1],B[1])<z0-10||Math.min(A[1],B[1])>z1+10) continue;
      for(let i=0;i<N-1;i+=1){ const a=S[i], b=S[i+1]; const d1x=b[0]-a[0], d1z=b[1]-a[1], d2x=B[0]-A[0], d2z=B[1]-A[1]; const den=d1x*d2z-d1z*d2x; if(Math.abs(den)<1e-9) continue; const t=((A[0]-a[0])*d2z-(A[1]-a[1])*d2x)/den, u=((A[0]-a[0])*d1z-(A[1]-a[1])*d1x)/den; if(t<0||t>1||u<0||u>1) continue;
        const L=Math.hypot(d2x,d2z); CREEK.cross.push({x:a[0]+d1x*t, z:a[1]+d1z*t, i, rx:d2x/L, rz:d2z/L, w:r.w, m, big, road:r, A:[A[0]-d2x/L*40,A[1]-d2z/L*40], B:[B[0]+d2x/L*40,B[1]+d2z/L*40]}); } } }
  CREEK.on=true; WATER.push({n:'Pristavčica',P:S.filter((p,i)=>i%4===0)}); PHOTO.stream=S;
  creekMask(); return S; }
function creekNear(x,z){ const L=CREEK.H.get(Math.floor(x/CREEK.cell)+'|'+Math.floor(z/CREEK.cell)); if(!L) return null; let bd=1e9, bi=-1, bt=0; const S=CREEK.S;
  for(const i of L){ const a=S[i], b=S[i+1]; const dx=b[0]-a[0], dz=b[1]-a[1]; const l2=dx*dx+dz*dz||1e-9; const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1); const d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t); if(d<bd){ bd=d; bi=i; bt=t; } } return bi<0?null:{d:bd,i:bi,t:bt}; }
function creekDist(x,z){ if(!CREEK.on||x<CREEK.bb[0]||x>CREEK.bb[1]||z<CREEK.bb[2]||z>CREEK.bb[3]) return 1e9; const q=creekNear(x,z); return q?q.d:1e9; }
function creekOnDeck(x,z){ for(const c of CREEK.cross){ if(Math.abs(c.x-x)>30||Math.abs(c.z-z)>30) continue; const dx=x-c.x, dz=z-c.z; const across=Math.abs(-dx*c.rz+dz*c.rx); if(across<c.w/2+c.m) return true; } return false; }
const _gh0=getHeight;
function creekChannelH(x,z,h){ const q=creekNear(x,z); if(!q||q.d>=CREEK.Wc) return h; const i=q.i; const hb=CREEK.bed[i]+(CREEK.bed[Math.min(CREEK.N-1,i+1)]-CREEK.bed[i])*q.t; const dep=Math.max(0,h-hb); const f=1-smooth(CREEK.Bh,CREEK.T+0.5,q.d); return h-dep*f; }
getHeight=function(x,z){ const h=_gh0(x,z); if(!CREEK.on||x<CREEK.bb[0]||x>CREEK.bb[1]||z<CREEK.bb[2]||z>CREEK.bb[3]) return h; const q=creekNear(x,z); if(!q||q.d>=CREEK.Wc) return h; if(creekOnDeck(x,z)) return h; return creekChannelH(x,z,h); };
// mask: G = cut the coarse terrain away, R = no grass (bed and water)
function creekMask(){ const [x0,x1,z0,z1]=CREEK.bb, PX=0.5; const W=Math.ceil((x1-x0)/PX), Hh=Math.ceil((z1-z0)/PX); const c=cvs(W,Hh), g=c.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,W,Hh); g.lineCap='round'; g.lineJoin='round';
  const path=()=>{ g.beginPath(); CREEK.S.forEach((p,i)=>{ const u=(p[0]-x0)/PX, v=(p[1]-z0)/PX; i?g.lineTo(u,v):g.moveTo(u,v); }); };
  g.strokeStyle='rgb(255,0,0)'; g.lineWidth=2*1.75/PX; path(); g.stroke(); g.globalCompositeOperation='lighter'; g.strokeStyle='rgb(0,255,0)'; g.lineWidth=2*(CREEK.Wc-0.3)/PX; path(); g.stroke(); g.globalCompositeOperation='source-over';
  const t=new THREE.CanvasTexture(c); t.flipY=false; t.minFilter=THREE.LinearFilter; t.magFilter=THREE.LinearFilter; t.generateMipmaps=false; t.colorSpace=THREE.NoColorSpace; CREEK.tex=t; CREEK.texB=new THREE.Vector4(x0,z0,x1-x0,z1-z0); }
function creekTreeFilter(){ if(!CREEK.on) return; creekRiparian(); const keep=[]; const n=TREES.x.length; for(let i=0;i<n;i++){ const x=TREES.x[i], z=TREES.z[i]; if(creekDist(x,z)<=CREEK.Wc+0.9) continue; if(bigHit(x,z,Math.min(4,(TREES.w[i]||3)*0.42))) continue; /* no crown through a house, garage or wall */ keep.push(i); } for(const k of Object.keys(TREES)){ if(Array.isArray(TREES[k])||ArrayBuffer.isView(TREES[k])) TREES[k]=keep.map(i=>TREES[k][i]); } TREES.n=keep.length; }
// meshes: fine channel ground, flowing water, bridges with the blue railings
function creekMeshes(scene){ if(!CREEK.on) return; const S=CREEK.S, N=CREEK.N, T=CREEK.T, Wc=CREEK.Wc;
  const ks=[-3.5,-3.1,-2.75,-2.45,-2.15,-1.85,-1.55,-1.25,-0.95,-0.7,-0.45,-0.2,0,0.2,0.45,0.7,0.95,1.25,1.55,1.85,2.15,2.45,2.75,3.1,3.5]; const nk=ks.length;
  const tang=(i)=>{ const a=S[Math.max(0,i-1)], b=S[Math.min(N-1,i+1)]; const dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; return [dx/l,dz/l]; };
  const pos=new Float32Array(N*nk*3); for(let i=0;i<N;i++){ const [tx,tz]=tang(i); const nx=-tz, nz=tx; for(let k=0;k<nk;k++){ const x=S[i][0]+nx*ks[k], z=S[i][1]+nz*ks[k]; const o=(i*nk+k)*3; pos[o]=x; pos[o+1]=creekChannelH(x,z,_gh0(x,z))+(Math.abs(ks[k])>Wc?0.015:0.0); pos[o+2]=z; } }
  const idx=[]; for(let i=0;i<N-1;i++) for(let k=0;k<nk-1;k++){ const a=i*nk+k, b=a+1, c=a+nk, d=c+1; idx.push(a,b,c,b,d,c); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  { const nr=g.attributes.normal; for(let i=0;i<N;i++) for(const k of [0,nk-1]){ const o=i*nk+k; const tn=terrainNormal(pos[o*3],pos[o*3+2]); nr.setXYZ(o,tn[0],tn[1],tn[2]); } }
  const gm=makeTerrainMaterial(); gm.polygonOffset=true; gm.polygonOffsetFactor=-1; gm.polygonOffsetUnits=-2; const ground=new THREE.Mesh(g,gm); ground.receiveShadow=true; ground.matrixAutoUpdate=false; scene.add(ground);
  // water: the width at the water line found on the profile
  const wpos=[], wuv=[], widx=[]; let sAcc=0; for(let i=0;i<N;i++){ if(i) sAcc+=Math.hypot(S[i][0]-S[i-1][0],S[i][1]-S[i-1][1]); const [tx,tz]=tang(i); const nx=-tz, nz=tx; const hc=_gh0(S[i][0],S[i][1]); const dep=Math.max(0,hc-CREEK.bed[i]); const wl=CREEK.lev[i];
    let hw=0.35; if(dep>0.4){ const target=1-(wl-CREEK.bed[i])/dep; let lo=CREEK.Bh*0.5, hi=T+0.5; for(let it=0;it<18;it++){ const mid=(lo+hi)/2; const f=1-smooth(CREEK.Bh,T+0.5,mid); if(f>1-target) lo=mid; else hi=mid; } hw=Math.max(0.35,lo+0.08); }
    for(const sd of [-1,1]){ wpos.push(S[i][0]+nx*hw*sd, wl, S[i][1]+nz*hw*sd); wuv.push(sd<0?0:1, (CREEK.up0?sAcc:-sAcc)/3.2); } if(i){ const b=(i-1)*2; widx.push(b,b+1,b+2,b+1,b+3,b+2); } }
  const wg=new THREE.BufferGeometry(); wg.setAttribute('position',new THREE.Float32BufferAttribute(wpos,3)); wg.setAttribute('uv',new THREE.Float32BufferAttribute(wuv,2)); wg.setIndex(widx); wg.computeVertexNormals();
  const nt=TEX.waterN?TEX.waterN.clone():null; if(nt){ nt.wrapS=nt.wrapT=THREE.RepeatWrapping; nt.needsUpdate=true; }
  const wm=new THREE.MeshStandardMaterial({color:0x5b6a52,roughness:0.05,metalness:0.15,normalMap:nt,normalScale:new THREE.Vector2(0.55,0.55),transparent:true,opacity:0.86,envMapIntensity:1.3,depthWrite:false,side:THREE.DoubleSide});
  const water=new THREE.Mesh(wg,wm); water.renderOrder=2; scene.add(water); CREEK.wmat=wm; CREEK.wtex=nt;
  // stones on the bed and tufts of grass on the banks
  { const R=mulberry32(808); const cs=new ChunkSet(); for(let i=2;i<N-2;i+=2){ if(R()<0.55) continue; const [tx,tz]=tang(i); const nx=-tz, nz=tx; const o=(R()-0.5)*0.7; const x=S[i][0]+nx*o, z=S[i][1]+nz*o; if(creekOnDeck(x,z)) continue; const y=creekChannelH(x,z,_gh0(x,z)); const G=cs.get('stonem',x,z); const r=0.08+R()*0.16; G.box(frame(x,z,R()*3,y-0.05),-r,r,0,r*0.9,-r*0.8,r*0.8,lin(R()<0.5?'#8b8578':'#6f6a60'),0.6);
      if(R()<0.6){ for(const sd of [-1,1]){ const o2=(T-0.2+R()*0.5)*sd; const bx=S[i][0]+nx*o2, bz=S[i][1]+nz*o2; if(creekOnDeck(bx,bz)) continue; const by=creekChannelH(bx,bz,_gh0(bx,bz)); const H2=cs.get('hedge',bx,bz); lathe(H2,frame(bx,bz,R()*3,by-0.05),[[0.32,0],[0.26,0.35],[0.12,0.62],[0,0.7]],7,lin(R()<0.5?'#5e7f3a':'#6f8a40')); } } }
    for(const m of cs.meshes(GAME.bm)) scene.add(m); }
  // bridges: concrete deck under the road, wing walls in the channel, blue railings on both sides (Street View)
  { const cs=new ChunkSet(); const BLUE=lin('#2f63b8'), CON=lin('#b9b6ae');
    for(const c of CREEK.cross){ const [ctx,ctz]=tang(c.i); const sinT=Math.abs(ctx*c.rz-ctz*c.rx); const span=(T+0.9)/Math.max(0.45,sinT); const half=c.w/2+c.m; const a=Math.atan2(c.rz,c.rx); const ry=_gh0(c.x,c.z); const f=frame(c.x,c.z,a,0);
      const G=cs.get('curb',c.x,c.z), Mt=cs.get('metal',c.x,c.z); G.box(f,-span,span,ry-0.62,ry-0.04,-half,half,CON,0.8);
      for(const sd of [-1,1]){ const zz=sd*(half-0.08); G.box(f,-span-0.2,span+0.2,ry-0.65,ry+0.12,zz-0.12,zz+0.12,CON,0.8);
        for(let x=-span-0.6;x<=span+0.61;x+=0.25){ Mt.box(f,x-0.014,x+0.014,ry+0.12,ry+1.08,zz-0.014,zz+0.014,BLUE); }
        for(let x=-span-0.6;x<=span+0.61;x+=1.6) Mt.box(f,x-0.045,x+0.045,ry+0.12,ry+1.12,zz-0.045,zz+0.045,BLUE); Mt.box(f,-span-0.65,span+0.65,ry+1.04,ry+1.12,zz-0.04,zz+0.04,BLUE); Mt.box(f,-span-0.65,span+0.65,ry+0.2,ry+0.25,zz-0.03,zz+0.03,BLUE);
        const q=f(0,0,zz); addCollider(q[0],q[2],a,2*span+1.3,0.2,ry-1,ry+1.2); }
      // wing walls along the banks under the deck
      for(const sd of [-1,1]){ const wx=c.x+(-ctz)*sd*(T-0.15), wz=c.z+ctx*sd*(T-0.15); const wf=frame(wx,wz,Math.atan2(ctz,ctx),0); const by=CREEK.bed[c.i]; const L2=half/Math.max(0.45,sinT)+0.6; G.box(wf,-L2,L2,by-0.2,ry-0.5,-0.18,0.18,CON,0.8); } }
    for(const m of cs.meshes(GAME.bm)) scene.add(m); } }
function creekTick(dt){ if(CREEK.wtex){ CREEK.wtex.offset.y-=dt*0.32; } }

// a line of alders and willows along the creek where it runs through open fields (as along every Zagorje brook)
function creekRiparian(){ const S=CREEK.S, R=mulberry32(4242); const col=[0x5f8a3c,0x6f9646,0x557f38,0x7a9a4a];
  for(let i=6;i<CREEK.N-6;i+=7){ const p=S[i]; if(p[0]>-560&&p[0]<-180) continue; /* the village stretch stays open (photos) */ const a=S[i-2], b=S[i+2]; const tx=b[0]-a[0], tz=b[1]-a[1], l=Math.hypot(tx,tz)||1; const nx=-tz/l, nz=tx/l;
    for(const sd of [-1,1]){ if(R()<0.35) continue; const o=CREEK.Wc+1.2+R()*2.5; const x=p[0]+nx*sd*o+(R()-0.5)*3, z=p[1]+nz*sd*o+(R()-0.5)*3; if(BHASH.hit(x,z,2)||!roadClear(x,z,2)) continue; const h=7+R()*7; addTree(x,z,h,h*(0.5+R()*0.25),colJ(new THREE.Color(col[(R()*4)|0]),0.2),R()<0.25?2:0); } } TREES.n=TREES.x.length; }

function bigHit(x,z,r){ for(const o of BHASH.near(x,z)){ if(Math.max(o.hl,o.hw)<1.6) continue; const dx=x-o.cx, dz=z-o.cz; const lx=dx*o.c+dz*o.s, lz=-dx*o.s+dz*o.c; if(Math.abs(lx)<o.hl+r&&Math.abs(lz)<o.hw+r) return true; } return false; }
