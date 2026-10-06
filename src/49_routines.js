/* ===================== daily routines: the regulars walk round the village =====================
   Kenka and Jovo do not sit on their stools all day: now and then one of them gets up, walks out of the brtija
   (through the door, round the tables) and goes to the shop, the square, the terrace or the church, hangs about,
   and comes back. Lidija walks between the bar and the tables to serve. Prgac and Tuljulju stroll from spot to spot
   together and chat wherever they stop. Paths are found on a 0.5 m grid round the building colliders (A*), so
   nobody walks through walls. Mission givers keep working: missions look people up where they are right now. */
const RT={list:[],init:false};
function rtBlocked(x,z){ const y=groundAt(x,z)+0.5; for(const o of BHASH.near(x,z)){ if(y>o.y1+0.3||y<o.y0-2) continue; const dx=x-o.cx, dz=z-o.cz; const lx=dx*o.c+dz*o.s, lz=-dx*o.s+dz*o.c; if(Math.abs(lx)<o.hl+0.28&&Math.abs(lz)<o.hw+0.28) return true; } return false; }
// A* on a grid covering both points (+margin); returns a list of [x,z] or null
function rtPath(a,b,maxCells){ const S=0.5, M=14; const x0=Math.min(a[0],b[0])-M, z0=Math.min(a[1],b[1])-M; const W=Math.ceil((Math.max(a[0],b[0])+M-x0)/S), H=Math.ceil((Math.max(a[1],b[1])+M-z0)/S);
  if(W*H>(maxCells||90000)) return null; const N=W*H; const blk=new Uint8Array(N); // 0 unknown, 1 free, 2 blocked
  const isB=(i)=>{ if(!blk[i]){ const cx=i%W, cz=(i/W)|0; blk[i]=rtBlocked(x0+cx*S,z0+cz*S)?2:1; } return blk[i]===2; };
  const idx=(p)=>{ const cx=Math.round((p[0]-x0)/S), cz=Math.round((p[1]-z0)/S); return clamp(cz,0,H-1)*W+clamp(cx,0,W-1); };
  const free=(i)=>{ if(!isB(i)) return i; const cx=i%W, cz=(i/W)|0; for(let r=1;r<8;r++) for(let dz=-r;dz<=r;dz++) for(let dx=-r;dx<=r;dx++){ const x=cx+dx, z=cz+dz; if(x<0||z<0||x>=W||z>=H) continue; const j=z*W+x; if(!isB(j)) return j; } return -1; };
  const s=free(idx(a)), g=free(idx(b)); if(s<0||g<0) return null;
  const gx=g%W, gz=(g/W)|0; const G=new Float32Array(N).fill(1e9), P=new Int32Array(N).fill(-1), C=new Uint8Array(N); const heap=[]; // binary heap of [f,i]
  const push=(f,i)=>{ heap.push([f,i]); let k=heap.length-1; while(k>0){ const p=(k-1)>>1; if(heap[p][0]<=heap[k][0]) break; [heap[p],heap[k]]=[heap[k],heap[p]]; k=p; } };
  const pop=()=>{ const top=heap[0], last=heap.pop(); if(heap.length){ heap[0]=last; let k=0; for(;;){ const l=2*k+1, r=l+1; let m=k; if(l<heap.length&&heap[l][0]<heap[m][0]) m=l; if(r<heap.length&&heap[r][0]<heap[m][0]) m=r; if(m===k) break; [heap[m],heap[k]]=[heap[k],heap[m]]; k=m; } } return top; };
  const h=(i)=>{ const x=i%W, z=(i/W)|0; return Math.hypot(x-gx,z-gz); };
  G[s]=0; push(h(s),s); let it=0;
  while(heap.length&&it++<60000){ const [,i]=pop(); if(C[i]) continue; C[i]=1; if(i===g) break; const cx=i%W, cz=(i/W)|0;
    for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dz) continue; const x=cx+dx, z=cz+dz; if(x<0||z<0||x>=W||z>=H) continue; const j=z*W+x; if(C[j]||isB(j)) continue; if(dx&&dz&&(isB(cz*W+x)||isB(z*W+cx))) continue;
      const ng=G[i]+(dx&&dz?1.414:1); if(ng<G[j]){ G[j]=ng; P[j]=i; push(ng+h(j),j); } } }
  if(P[g]<0&&g!==s) return null; const pts=[]; for(let i=g;i>=0;i=P[i]){ pts.push([x0+(i%W)*S,z0+((i/W)|0)*S]); if(i===s) break; } pts.reverse();
  // string-pull: drop points while the straight line stays free
  const out=[pts[0]]; let k=0; while(k<pts.length-1){ let j=pts.length-1; for(;j>k+1;j--){ const A=pts[k], B=pts[j]; const L=Math.hypot(B[0]-A[0],B[1]-A[1]); let ok=true; for(let t=0.25;t<L;t+=0.25){ const x=A[0]+(B[0]-A[0])*t/L, z=A[1]+(B[1]-A[1])*t/L; if(rtBlocked(x,z)){ ok=false; break; } } if(ok) break; } out.push(pts[j]); k=j; }
  return out; }
// walk an avatar along a path; returns true when it arrived
function rtWalk(A,W,dt,sp){ const p=A.group.position; const q=W.path[W.i]; if(!q) return true; const dx=q[0]-p.x, dz=q[1]-p.z, d=Math.hypot(dx,dz); const s=sp*dt;
  if(d<=s){ p.x=q[0]; p.z=q[1]; W.i++; } else { p.x+=dx/d*s; p.z+=dz/d*s; const want=faceYaw(dx,dz); A.group.rotation.set(0,angLerp(A.group.rotation.y,want,Math.min(1,dt*8)),0); }
  p.y=groundAt(p.x,p.z); W.ph=(W.ph||0)+dt*sp*3.4; const sw=Math.sin(W.ph)*0.5; if(A.legL){ A.legL.rotation.x=sw; A.legR.rotation.x=-sw; A.armL.rotation.x=-sw*0.6; A.armR.rotation.x=sw*0.6; } A.seatT=-1; A.spdOv=sp; return W.i>=W.path.length; }
function rtStop(A){ A.spdOv=0; if(A.legL){ A.legL.rotation.x=A.legR.rotation.x=0; } }
const RT_SPOTS={ terrace:()=>LANDMARKS.terrace?[LANDMARKS.terrace.x,LANDMARKS.terrace.z]:null, shop:()=>{ const p=SHOP_POS(); return [p[0]+1.5,p[1]+2.5]; }, square:()=>LANDMARKS.column?[LANDMARKS.column.x+3,LANDMARKS.column.z+2]:null,
  church:()=>LANDMARKS.churchDoor?[LANDMARKS.churchDoor.x+5,LANDMARKS.churchDoor.z+2]:null, cafe:()=>CAFE_POS(), townhall:()=>LANDMARKS.townhall?[LANDMARKS.townhall.x+6,LANDMARKS.townhall.z+6]:null };
const RT_SAY={ shop:['Idem po cigarete.','Daj mi kruh i mlijeko.'], square:['Lepo vreme danas.','Kaj ima novoga u selu?'], church:['Dobar dan, gospon župnik!','Treba svečicu upaliti…'], terrace:['Malo friškog zraka…','Hik!'], cafe:['Ajmo nazad, runda čeka!'], townhall:['Opet ti papiri…'] };
function rtNew(A,name,home,opt){ const R=Object.assign({A,name,home,st:'home',t:20+Math.random()*90,walk:null},opt||{}); RT.list.push(R); return R; }
function rtGo(R,to,next){ const p=R.A.group.position; const path=rtPath([p.x,p.z],to); if(!path||path.length<2) return false; R.walk={path,i:1}; R.st='walk'; R.next=next; R.to=to; return true; }
function rtBusy(R){ return GTA.dlg||(GTA.mission&&(GTA.mission.giver===R.name))||R.A.dead||(STORY&&STORY.pax===R.name)||(GTA.pax===R.name); }
function routinesInit(){ RT.init=true;
  for(const nm of ['Kenka','Jovo']){ const N=npcByName(nm); if(!N) continue; rtNew(N.A,nm,[N.d.x,N.d.z],{N,kind:'regular',t:60+Math.random()*120+(nm==='Jovo'?90:0)}); }
  { const N=npcByName('Lidija'); if(N) rtNew(N.A,'Lidija',[N.d.x,N.d.z],{N,kind:'barmaid',t:25+Math.random()*30}); }
  const tj=LIFE.villagers.find(v=>v.n==='Tuljulju'), pg=LIFE.villagers.find(v=>v.n==='Prgac');
  if(tj&&pg){ const R=rtNew(tj.A,'Tuljulju',[tj.A.group.position.x,tj.A.group.position.z],{V:tj,kind:'stroller',t:40+Math.random()*60}); const Q=rtNew(pg.A,'Prgac',[pg.A.group.position.x,pg.A.group.position.z],{V:pg,kind:'buddy',lead:R}); R.buddy=Q; } }
function routinesTick(dt){ if(!GAME.started) return; if(!RT.init){ if(NPCS.length&&LIFE.villagers.length) routinesInit(); else return; }
  for(const R of RT.list){ const A=R.A; if(!A||!A.group) continue; if(R.kind==='buddy') continue;
    if(rtBusy(R)&&R.st==='walk'){ rtStop(A); R.st='wait'; }
    if(R.st==='wait'){ if(!rtBusy(R)){ R.st=R.walk?'walk':'away'; } else continue; }
    if(R.st==='home'){ R.t-=dt; if(R.N) A.spdOv=undefined; if(R.t>0||rtBusy(R)) continue;
      if(R.kind==='regular'){ const keys=['terrace','shop','square','church','townhall','terrace']; const k=keys[Math.floor(Math.random()*keys.length)]; const to=RT_SPOTS[k](); R.spot=k; if(!to||!rtGo(R,to,'away')){ R.t=60; continue; } R.N.nextWalk=1e9; bubble(A,['Idem malo van…','Vraćam se odmah!','Lidija, čuvaj mi mjesto!'][Math.floor(Math.random()*3)],3); }
      else if(R.kind==='barmaid'){ const others=['Kenka','Jovo'].map(n=>npcByName(n)).filter(N=>N&&!(RT.list.find(r=>r.name===N.d.n)||{}).walk); const tgt=others.length?others[Math.floor(Math.random()*others.length)]:null; const base=R.home; let to=tgt?[tgt.A.group.position.x+(base[0]-tgt.A.group.position.x)*0.35,tgt.A.group.position.z+(base[1]-tgt.A.group.position.z)*0.35]:[base[0]+(Math.random()-0.5)*4,base[1]+(Math.random()-0.5)*4];
        R.spot='serve'; if(!rtGo(R,to,'away')){ R.t=30; continue; } }
      else if(R.kind==='stroller'){ const keys=['shop','square','terrace','church','cafe']; const k=keys[Math.floor(Math.random()*keys.length)]; const to=RT_SPOTS[k](); R.spot=k; if(!to||!rtGo(R,to,'away')){ R.t=60; continue; } const Q=R.buddy; if(Q){ const p=Q.A.group.position; const pt=rtPath([p.x,p.z],[to[0]+1.2,to[1]+0.6]); if(pt) Q.walk={path:pt,i:1}; Q.st='walk'; } }
      continue; }
    if(R.st==='walk'){ const done=rtWalk(A,R.walk,dt,R.kind==='barmaid'?1.15:1.25); if(R.kind==='stroller'&&R.buddy&&R.buddy.walk){ const Qd=rtWalk(R.buddy.A,R.buddy.walk,dt,1.3); if(Qd){ rtStop(R.buddy.A); R.buddy.walk=null; R.buddy.st='home'; } }
      if(done){ rtStop(A); R.walk=null; if(R.next==='away'){ R.st='away'; R.t=R.kind==='barmaid'?6+Math.random()*6:45+Math.random()*75; const L=RT_SAY[R.spot]; if(L&&Math.random()<0.7) bubble(A,L[Math.floor(Math.random()*L.length)],3); }
        else { R.st='home'; R.t=R.kind==='barmaid'?30+Math.random()*40:150+Math.random()*180; if(R.N){ A.group.position.set(R.N.d.x,R.N.d.y,R.N.d.z); A.group.rotation.set(0,R.N.d.face,0); R.N.nextWalk=60+Math.random()*80; if(R.kind==='regular'&&A.legL) A.legL.rotation.x=A.legR.rotation.x=-1.2; } } }
      continue; }
    if(R.st==='away'){ R.t-=dt; A.spdOv=0; if(R.kind==='stroller'&&R.buddy){ const a=A.group.position, b=R.buddy.A.group.position; if(!R.buddy.walk){ A.group.rotation.y=angLerp(A.group.rotation.y,faceYaw(b.x-a.x,b.z-a.z),Math.min(1,dt*3)); R.buddy.A.group.rotation.y=angLerp(R.buddy.A.group.rotation.y,faceYaw(a.x-b.x,a.z-b.z),Math.min(1,dt*3)); } }
      if(R.t>0||rtBusy(R)) continue; // go home (strollers: on to the next spot, sometimes back to their old corner)
      if(R.kind==='stroller'){ R.st='home'; R.t=Math.random()<0.3?5:2; if(Math.random()<0.35){ rtGo(R,R.home,'home'); const Q=R.buddy; if(Q){ const p=Q.A.group.position; const pt=rtPath([p.x,p.z],Q.home); if(pt){ Q.walk={path:pt,i:1}; Q.st='walk'; } } } continue; }
      const back=R.kind==='regular'||R.kind==='barmaid'?[R.N.d.x,R.N.d.z]:R.home; if(!rtGo(R,back,'home')){ A.group.position.set(R.N.d.x,R.N.d.y,R.N.d.z); R.st='home'; R.t=120; } } } }
// Kenka and Jovo's own tipsy little walk and the strollers' arm animation must not fight the routine
{ const _br=barRegulars; barRegulars=function(dt){ for(const R of RT.list) if(R.N&&R.st!=='home'){ R.N.walk=null; R.N.nextWalk=1e9; R.N.nextSay=1e9; } _br(dt); for(const R of RT.list) if(R.N&&R.st!=='home'&&R.N.nextSay>1e8){ R.N.nextSay=20+Math.random()*20; } try{ routinesTick(dt); }catch(e){ console.warn('rutine',e); } }; }
