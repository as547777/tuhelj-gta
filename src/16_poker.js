/* ===================== Poker: Texas Hold'em za pravi stol (multiplayer + botovi) ===================== */
const PK_ANG=(k)=>Math.PI/2+(k+1)*TAU/7; const PK_H=0.7; const PK_RX=1.9, PK_RZ=1.12; const RC='23456789TJQKA', SC='shdc';
const cc=(c)=>RC[c.r-2]+SC[c.s], cd=(t)=>({r:RC.indexOf(t[0])+2,s:SC.indexOf(t[1])});
function rnd01(){ const a=new Uint32Array(1); crypto.getRandomValues(a); return a[0]/4294967296; }
function newDeck(){ const d=[]; for(let s=0;s<4;s++) for(let r=2;r<=14;r++) d.push({r,s}); for(let i=d.length-1;i>0;i--){ const j=Math.floor(rnd01()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; }
function rank5(c){ const rs=c.map(x=>x.r).sort((a,b)=>b-a); const flush=c.every(x=>x.s===c[0].s); const uniq=[...new Set(rs)]; let straight=false, top=0;
  if(uniq.length===5){ if(rs[0]-rs[4]===4){ straight=true; top=rs[0]; } else if(rs[0]===14&&rs[1]===5&&rs[4]===2){ straight=true; top=5; } }
  const cnt={}; for(const r of rs) cnt[r]=(cnt[r]||0)+1; const gr=Object.entries(cnt).map(([r,n])=>[n,+r]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
  let cat,k; if(straight&&flush){cat=8;k=[top];} else if(gr[0][0]===4){cat=7;k=[gr[0][1],gr[1][1]];} else if(gr[0][0]===3&&gr[1][0]===2){cat=6;k=[gr[0][1],gr[1][1]];} else if(flush){cat=5;k=rs;} else if(straight){cat=4;k=[top];} else if(gr[0][0]===3){cat=3;k=gr.map(g=>g[1]);} else if(gr[0][0]===2&&gr[1][0]===2){cat=2;k=gr.map(g=>g[1]);} else if(gr[0][0]===2){cat=1;k=gr.map(g=>g[1]);} else {cat=0;k=rs;}
  let sc=cat; for(let i=0;i<5;i++) sc=sc*15+(k[i]||0); return {sc,cat}; }
function best7(cs){ const n=cs.length; if(n<5) return {sc:-1,cat:0}; if(n===5) return rank5(cs); let best={sc:-1,cat:0}; const co=[]; const rec=(st)=>{ if(co.length===5){ const r=rank5(co.map(i=>cs[i])); if(r.sc>best.sc) best=r; return; } for(let i=st;i<n;i++){ co.push(i); rec(i+1); co.pop(); } }; rec(0); return best; }
const CATN=['visoka karta','par','dva para','tris','skala','boja','ful','poker','skala u boji'];
const PK_BOTS=['Štef','Joža','Bara','Dragec','Kata'];
/* ---- keys for private hole cards (ECDH + AES-GCM) ---- */
const PKC={sit:false,seat:-1,seq:0,act:null,view:null,hostId:null,my:[],myHand:-1,pub:'',priv:null,keys:new Map(),raiseTo:0};
const b64=(u)=>btoa(String.fromCharCode(...new Uint8Array(u))), ub64=(s)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function pkKeys(){ try{ if(!crypto.subtle) return; const kp=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveKey']); PKC.priv=kp.privateKey; PKC.pub=b64(await crypto.subtle.exportKey('raw',kp.publicKey)); }catch(e){} }
async function pkShared(pubB64){ if(!PKC.priv||!pubB64) return null; if(PKC.keys.has(pubB64)) return PKC.keys.get(pubB64); try{ const pk=await crypto.subtle.importKey('raw',ub64(pubB64),{name:'ECDH',namedCurve:'P-256'},false,[]); const k=await crypto.subtle.deriveKey({name:'ECDH',public:pk},PKC.priv,{name:'AES-GCM',length:128},false,['encrypt','decrypt']); PKC.keys.set(pubB64,k); return k; }catch(e){ return null; } }
async function pkEnc(pubB64,text){ const k=await pkShared(pubB64); if(!k) return 'p:'+text; const iv=crypto.getRandomValues(new Uint8Array(12)); const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(text)); const all=new Uint8Array(12+ct.byteLength); all.set(iv); all.set(new Uint8Array(ct),12); return b64(all); }
async function pkDec(pubB64,data){ if(!data) return null; if(data.startsWith('p:')) return data.slice(2); const k=await pkShared(pubB64); if(!k) return null; try{ const all=ub64(data); const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:all.slice(0,12)},k,all.slice(12)); return new TextDecoder().decode(pt); }catch(e){ return null; } }
/* ---- host engine ---- */
const PKH={botsAuto:true,seats:[null,null,null,null,null,null],deck:[],board:[],dealer:-1,stage:'idle',curBet:0,minRaise:20,sb:10,bb:20,toAct:-1,hand:0,msg:'',wait:0,lastSeq:{},turnT:0,bots:true,pub:null,enc:{},dirty:true,sbS:-1,bbS:-1};
const myPid=()=>NET.myId||'me';
function hSeats(){ return PKH.seats.map((p,i)=>p?i:-1).filter(i=>i>=0); }
function hCanAct(p){ return p&&!p.folded&&!p.out&&!p.allin; }
function hLive(){ return PKH.seats.filter(p=>p&&!p.folded&&!p.out); }
function hNext(i){ for(let k=1;k<=6;k++){ const j=(i+k)%6; if(hCanAct(PKH.seats[j])) return j; } return -1; }
function hNextIn(i){ for(let k=1;k<=6;k++){ const j=(i+k)%6; const p=PKH.seats[j]; if(p&&!p.out) return j; } return -1; }
function hPay(p,a){ a=Math.max(0,Math.min(a,p.chips)); p.chips-=a; p.bet+=a; p.total+=a; if(p.chips===0) p.allin=true; return a; }
function hHumans(){ const list=[]; if(PKC.sit) list.push({id:myPid(),name:NET.name||'Ti',ch:pkMyChips(),k:PKC.pub}); for(const R of NET.remotes.values()) if(R.pq&&R.pq.sit) list.push({id:R.id,name:R.name,ch:+R.pq.ch||1000,k:R.pq.k||''}); return list; }
function pkMyChips(){ try{ const v=+localStorage.getItem('tuhelj_chips'); return Number.isFinite(v)&&v>0?v:1000; }catch(e){ return 1000; } }
function hSeatPlayers(){ const H=hHumans(); const ids=new Set(H.map(h=>h.id)); const S=PKH.seats; const inHand=PKH.stage!=='idle'&&PKH.stage!=='showdown';
  for(let i=0;i<6;i++){ const p=S[i]; if(!p) continue; if(!p.bot && !ids.has(p.id)){ if(inHand&&!p.folded){ p.folded=true; p.label='otišao'; if(PKH.toAct===i) hAfterAct(i); } if(!inHand) S[i]=null; } }
  for(const h of H){ if(S.some(p=>p&&p.id===h.id)) { const p=S.find(q=>q&&q.id===h.id); p.k=h.k; p.name=h.name; const R=NET.remotes.get(h.id); const rb=R&&R.pq?+R.pq.rb||0:0; if(rb>(p.rbSeen||0)){ p.rbSeen=rb; if(p.chips<PKH.bb&&!inHand){ p.chips=1000; p.out=false; PKH.dirty=true; } } continue; } let free=S.findIndex(p=>!p); if(free<0){ const bi=S.findIndex(p=>p&&p.bot&&(!inHand||p.folded||p.out)); if(bi>=0){ S[bi]=null; free=bi; } } if(free<0) continue;
    S[free]={id:h.id,name:h.name,chips:Math.max(PKH.bb*2,h.ch),k:h.k,cards:[],bet:0,total:0,folded:true,out:inHand,allin:false,label:inHand?'čeka':'',win:0}; PKH.dirty=true; }
  const humans=S.filter(p=>p&&!p.bot).length;
  if(!inHand){ if(humans>=2||!PKH.bots){ for(let i=0;i<6;i++) if(S[i]&&S[i].bot) S[i]=null; } else { let nb=S.filter(p=>p&&p.bot).length; for(let i=0;i<6&&humans+nb<4;i++) if(!S[i]){ const used=new Set(S.filter(Boolean).map(p=>p.name)); const nm=PK_BOTS.find(n=>!used.has(n))||'Bot'; S[i]={id:'bot'+i,name:nm,bot:true,chips:1000,cards:[],bet:0,total:0,folded:true,out:false,label:'',win:0,style:0.4+rnd01()*0.4}; nb++; } } } }
function hNewHand(){ const S=PKH.seats; for(const p of S){ if(!p) continue; if(p.bot&&p.chips<PKH.bb*5) p.chips=1000; p.cards=[]; p.bet=0; p.total=0; p.folded=false; p.allin=false; p.acted=false; p.out=p.chips<=0; p.label=p.out?'bez žetona':''; p.win=0; p.show=false; }
  const act=hSeats().filter(i=>!S[i].out); if(act.length<2){ PKH.stage='idle'; PKH.msg='Čekamo igrače… (treba barem 2)'; PKH.dirty=true; return; }
  PKH.hand++; PKH.deck=newDeck(); PKH.board=[]; PKH.stage='preflop'; PKH.dealer=hNextIn(PKH.dealer<0?5:PKH.dealer);
  const heads=act.length===2; const sbI=heads?PKH.dealer:hNextIn(PKH.dealer), bbI=hNextIn(sbI); hPay(S[sbI],PKH.sb); hPay(S[bbI],PKH.bb); S[sbI].label='SB'; S[bbI].label='BB'; PKH.sbS=sbI; PKH.bbS=bbI;
  for(let r=0;r<2;r++) for(const i of act) S[i].cards.push(PKH.deck.pop());
  PKH.curBet=PKH.bb; PKH.minRaise=PKH.bb; PKH.toAct=hNext(bbI); PKH.turnT=0; PKH.msg='Ruka #'+PKH.hand+' — dealer: '+(S[PKH.dealer]?S[PKH.dealer].name:''); PKH.enc={}; hEncrypt(); PKH.dirty=true; }
async function hEncrypt(){ const hand=PKH.hand; for(const p of PKH.seats){ if(!p||p.bot||!p.cards.length) continue; if(p.id===myPid()) continue; const e=await pkEnc(p.k,p.cards.map(cc).join('')); if(PKH.hand===hand){ PKH.enc[p.id]=e; PKH.dirty=true; } } }
function hRoundDone(){ const act=PKH.seats.filter(hCanAct); if(hLive().length<=1) return true; return act.length===0||act.every(p=>p.acted&&p.bet===PKH.curBet); }
function hAdvance(){ const S=PKH.seats; for(const p of S) if(p){ p.bet=0; p.acted=false; } PKH.curBet=0; PKH.minRaise=PKH.bb;
  if(hLive().length<=1){ hShowdown(); return; }
  if(PKH.stage==='preflop'){ PKH.board.push(PKH.deck.pop(),PKH.deck.pop(),PKH.deck.pop()); PKH.stage='flop'; PKH.msg='Flop'; }
  else if(PKH.stage==='flop'){ PKH.board.push(PKH.deck.pop()); PKH.stage='turn'; PKH.msg='Turn'; }
  else if(PKH.stage==='turn'){ PKH.board.push(PKH.deck.pop()); PKH.stage='river'; PKH.msg='River'; }
  else { hShowdown(); return; }
  PKH.toAct=hNext(PKH.dealer); PKH.turnT=0; PKH.dirty=true; if(PKH.seats.filter(hCanAct).length<=1){ PKH.toAct=-1; PKH.wait=1.2; PKH.pending='advance'; } }
function hShowdown(){ const S=PKH.seats; PKH.stage='showdown'; PKH.toAct=-1; const liveN=hLive().length; while(PKH.board.length<5&&liveN>1) PKH.board.push(PKH.deck.pop());
  const sc=S.map(p=>p&&!p.folded&&!p.out&&p.cards.length?best7(p.cards.concat(PKH.board)):null);
  const levels=[...new Set(S.filter(Boolean).map(p=>p.total).filter(t=>t>0))].sort((a,b)=>a-b); let prev=0; const notes=[];
  for(const L of levels){ let amt=0; const el=[]; S.forEach((p,i)=>{ if(!p) return; amt+=Math.min(p.total,L)-Math.min(p.total,prev); if(sc[i]&&p.total>=L) el.push(i); }); prev=L; if(!amt) continue;
    let win=el.length?el:S.map((p,i)=>i).filter(i=>sc[i]); if(win.length>1){ const top=Math.max(...win.map(i=>sc[i].sc)); win=win.filter(i=>sc[i].sc===top); } if(!win.length) continue;
    const share=Math.floor(amt/win.length); win.forEach((i,k)=>{ const g=share+(k===0?amt-share*win.length:0); S[i].chips+=g; S[i].win+=g; }); }
  S.forEach((p,i)=>{ if(!p) return; if(sc[i]&&liveN>1) p.show=true; if(p.win>0) notes.push(p.name+' +'+p.win+(sc[i]&&liveN>1?' ('+CATN[sc[i].cat]+')':'')); });
  PKH.msg=notes.join(' · '); PKH.wait=5; PKH.pending='new'; PKH.dirty=true; }
function hApply(i,a,to){ const S=PKH.seats, p=S[i]; if(!p||PKH.toAct!==i) return; const need=PKH.curBet-p.bet;
  if(a==='fold'){ p.folded=true; p.label='odustao'; }
  else if(a==='check'||a==='call'){ if(need>0){ hPay(p,need); p.label=p.allin?'all-in':'prati '+PKH.curBet; } else p.label='provjera'; }
  else if(a==='raise'||a==='allin'){ const target=a==='allin'?p.bet+p.chips:Math.max(+to||0,PKH.curBet+PKH.minRaise); hPay(p,Math.min(target-p.bet,p.chips)); if(p.bet>PKH.curBet){ const r=p.bet-PKH.curBet; if(r>=PKH.minRaise) PKH.minRaise=r; PKH.curBet=p.bet; for(const q of S) if(q&&q!==p&&hCanAct(q)) q.acted=false; p.label=p.allin?'all-in '+p.bet:'povisuje na '+p.bet; } else p.label=p.allin?'all-in':'prati'; }
  p.acted=true; PKH.msg=p.name+': '+p.label; hAfterAct(i); }
function hAfterAct(i){ PKH.dirty=true; if(hLive().length<=1){ PKH.toAct=-1; PKH.wait=0.8; PKH.pending='showdown'; return; } if(hRoundDone()){ PKH.toAct=-1; PKH.wait=0.9; PKH.pending='advance'; return; } PKH.toAct=hNext(i); PKH.turnT=0; }
function hBot(i){ const p=PKH.seats[i]; const need=PKH.curBet-p.bet; let s; const b=PKH.board;
  if(!b.length){ const [a,c]=p.cards; const hi=Math.max(a.r,c.r), lo=Math.min(a.r,c.r); s=(hi+lo)/28+(a.r===c.r?0.35+a.r/40:0)+(a.s===c.s?0.06:0)+(hi-lo===1?0.04:0); } else { const r=best7(p.cards.concat(b)); s=[0.12,0.42,0.62,0.74,0.82,0.86,0.93,0.98,1][r.cat]; if(b.length>=5&&best7(b).cat===r.cat) s-=0.2; }
  s+=(rnd01()-0.5)*0.18; const pot=PKH.seats.reduce((a,q)=>a+(q?q.total:0),0);
  const raisesSoFar=PKH.seats.filter(q=>q&&/povisuje|all-in/.test(q.label||'')).length; if((s>0.9||(rnd01()<0.02&&s>0.45))&&raisesSoFar<2&&(need<=pot*0.6||s>0.95)){ const to=PKH.curBet+Math.max(PKH.minRaise,Math.round(pot*(0.35+rnd01()*0.25)/PKH.bb)*PKH.bb); if(p.chips+p.bet<=to){ if(s>0.95) hApply(i,'allin'); else hApply(i,need>0?'call':'check'); } else hApply(i,'raise',to); return; }
  if(s>0.5||need===0||(need<=PKH.bb&&s>0.3)||(need<p.chips*0.08&&s>0.25)){ hApply(i,need>0?'call':'check'); return; } hApply(i,'fold'); }
function hTick(dt){ if(PKH.botsAuto) PKH.bots=!(NET.mode==='mqtt'||NET.mode==='room'||NET.mode==='host'||NET.mode==='client'); hSeatPlayers(); const S=PKH.seats;
  if(PKH.wait>0){ PKH.wait-=dt; if(PKH.wait<=0){ const pd=PKH.pending; PKH.pending=null; if(pd==='advance') hAdvance(); else if(pd==='showdown') hShowdown(); else if(pd==='new') hNewHand(); } }
  else if(PKH.stage==='idle'){ hNewHand(); }
  else if(PKH.toAct>=0){ const p=S[PKH.toAct]; PKH.turnT+=dt;
    if(!p){ PKH.toAct=hNext(PKH.toAct); }
    else if(p.bot){ if(PKH.turnT>0.8+(p.style||0.5)) hBot(PKH.toAct); }
    else if(p.id===myPid()){ if(PKC.act){ const A=PKC.act; PKC.act=null; hApply(PKH.toAct,A.a,A.v); } }
    else { const R=NET.remotes.get(p.id); const q=R&&R.pq; if(q&&Number.isFinite(+q.seq)&&+q.seq>(PKH.lastSeq[p.id]||0)){ PKH.lastSeq[p.id]=+q.seq; if(q.a) hApply(PKH.toAct,String(q.a),+q.v); } }
    if(PKH.toAct>=0&&PKH.turnT>30){ const pp=S[PKH.toAct]; if(pp){ hApply(PKH.toAct,PKH.curBet-pp.bet>0?'fold':'check'); } } }
  if(PKH.dirty){ PKH.dirty=false; const pot=S.reduce((a,p)=>a+(p?p.total:0),0);
    PKH.pub={h:myPid(),n:PKH.hand,st:PKH.stage,b:PKH.board.map(cc),d:PKH.dealer,sbS:PKH.sbS,bbS:PKH.bbS,sb:PKH.sb,bb:PKH.bb,ta:PKH.toAct,cb:PKH.curBet,mr:PKH.minRaise,pot,msg:PKH.msg.slice(0,120),ek:PKC.pub,
      s:S.map(p=>p?{i:p.id,n:p.name.slice(0,16),c:p.chips,bt:p.bet,f:p.folded?1:0,o:p.out?1:0,a:p.allin?1:0,bo:p.bot?1:0,l:(p.label||'').slice(0,24),w:p.win||0,hc:p.cards.length?1:0,sh:p.show?p.cards.map(cc).join(''):''}:null),e:PKH.enc};
    if(PKC.sit){ const me=S.find(p=>p&&p.id===myPid()); PKC.my=me?me.cards.slice():[]; PKC.myHand=PKH.hand; try{ if(me) localStorage.setItem('tuhelj_chips',String(me.chips)); }catch(e){} } } }
/* ---- client ---- */
function pkHostId(){ const c=[]; if(PKC.sit) c.push(myPid()); for(const R of NET.remotes.values()) if(R.pq&&R.pq.sit) c.push(R.id); c.sort(); return c[0]||null; }
function pkIsHost(){ return PKC.sit&&pkHostId()===myPid(); }
function pkView(){ if(pkIsHost()) return PKH.pub; const h=pkHostId(); if(!h) return null; const R=NET.remotes.get(h); return R&&R.pt&&typeof R.pt==='object'?R.pt:null; }
function pkPQ(){ return {sit:PKC.sit?1:0,seq:PKC.seq,a:PKC.lastA||'',v:PKC.lastV||0,k:PKC.pub,ch:pkMyChips(),rb:PKC.rebuy||0}; }
function pkDo(a,v){ const V=PKC.view; if(!V||V.ta!==PKC.seat) return; if(pkIsHost()){ PKC.act={a,v}; } else { PKC.seq++; PKC.lastA=a; PKC.lastV=v||0; } }
function nearPoker(){ const P=LANDMARKS.poker; if(!P||PLAYER.driving||PLAYER.riding||PKC.sit) return false; return Math.hypot(PLAYER.pos.x-P.x,PLAYER.pos.z-P.z)<3.2 && Math.abs(PLAYER.pos.y-P.y)<1.5; }
function pkOpen(){ if(PKC.sit) return; if(document.pointerLockElement) document.exitPointerLock(); PKC.sit=true; PKC.lookY=0; PKC.lookP=0; PKC.seat=-1; COMBAT.armed=false; document.body.classList.remove('armed'); COMBAT.menuOpen=true; PLAYER.enabled=false; document.getElementById('pkhud').classList.add('on'); document.body.classList.add('poker'); UI.toast('Sjeo si za poker stol — čekaj dijeljenje'); if(!PKC.pub) pkKeys(); }
function pkClose(){ if(GAME.camera.fov!==72){ GAME.camera.fov=72; GAME.camera.updateProjectionMatrix(); } const bdg=document.getElementById('pkbadges'); if(bdg) bdg.replaceChildren(); PKC.sit=false; PKC.seat=-1; PKC.my=[]; COMBAT.menuOpen=false; PLAYER.enabled=true; document.getElementById('pkhud').classList.remove('on'); document.body.classList.remove('poker'); const P=LANDMARKS.poker; if(P){ const p=P.f(P.cx+0.2,0,P.cz+PK_RZ*1.6); teleport(p[0],p[2],P.x,P.z); } if(!GAME.touch&&!GAME.dragLook){ try{ GAME.renderer.domElement.requestPointerLock(); }catch(e){} } }
function pkSetup(){ const $$=(id)=>document.getElementById(id); if(!$$('pkhud')) return; pkKeys(); const PD=(el,fn)=>el&&el.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); fn(); });
  PD($$('pkfold'),()=>pkDo('fold')); PD($$('pkcall'),()=>{ const V=PKC.view, me=V&&V.s[PKC.seat]; pkDo(me&&V.cb-me.bt>0?'call':'check'); }); PD($$('pkraise'),()=>pkDo('raise',PKC.raiseTo)); PD($$('pkallin'),()=>pkDo('allin'));
  PD($$('pkminus'),()=>{ const V=PKC.view; if(V) PKC.raiseTo=Math.max(V.cb+V.mr,PKC.raiseTo-V.bb); pkHud(); }); PD($$('pkplus'),()=>{ const V=PKC.view; const me=V&&V.s[PKC.seat]; if(V&&me) PKC.raiseTo=Math.min(me.c+me.bt,PKC.raiseTo+V.bb*2); pkHud(); });
  PD($$('pkleave'),()=>pkClose()); PD($$('pkbots'),()=>{ PKH.botsAuto=false; PKH.bots=!PKH.bots; PKH.dirty=true; pkHud(); }); PD($$('pkrebuy2'),()=>{ if(pkIsHost()){ const me=PKH.seats.find(p=>p&&p.id===myPid()); if(me&&me.chips<PKH.bb){ me.chips=1000; me.out=false; PKH.dirty=true; } } else PKC.rebuy=(PKC.rebuy||0)+1; try{ localStorage.setItem('tuhelj_chips','1000'); }catch(e){} }); }
/* ---- 3D: cards, chips, markers, dealer, seated people ---- */
let PK3=null;
function cardAtlas(){ const W=128,H=180, c=cvs(W*14,H*4), g=c.getContext('2d'); const sym=['♠','♥','♦','♣'];
  for(let s=0;s<4;s++) for(let r=0;r<13;r++){ const x=r*W, y=s*H; g.fillStyle='#fbfaf6'; g.fillRect(x+2,y+2,W-4,H-4); g.strokeStyle='#c9c6bd'; g.lineWidth=3; g.strokeRect(x+3,y+3,W-6,H-6); const red=s===1||s===2; g.fillStyle=red?'#c3202a':'#161616';
    const lab=RC[r]==='T'?'10':RC[r]; g.font='800 40px Georgia, serif'; g.textAlign='left'; g.fillText(lab,x+10,y+44); g.font='700 34px Georgia, serif'; g.fillText(sym[s],x+12,y+80); g.font='700 86px Georgia, serif'; g.textAlign='center'; g.fillText(sym[s],x+W/2,y+H/2+32); }
  for(let s=0;s<4;s++){ const x=13*W, y=s*H; g.fillStyle='#8c1d23'; g.fillRect(x+2,y+2,W-4,H-4); g.strokeStyle='#fbfaf6'; g.lineWidth=8; g.strokeRect(x+8,y+8,W-16,H-16); for(let k=0;k<14;k++){ g.strokeStyle='rgba(255,255,255,0.18)'; g.lineWidth=3; g.beginPath(); g.moveTo(x+10,y+10+k*12); g.lineTo(x+W-10,y+H-10-(13-k)*12); g.stroke(); } }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function makeCard(){ const M=PK3.cardMat; const g=new THREE.Group(); const mk=(u0,v0)=>{ const geo=new THREE.PlaneGeometry(0.064,0.09); const uv=geo.attributes.uv; const du=1/14, dv=1/4; for(let i=0;i<uv.count;i++){ uv.setXY(i,u0+uv.getX(i)*du,1-(v0+1)*dv+uv.getY(i)*dv); } return new THREE.Mesh(geo,M); };
  const front=mk(0,0), back=mk(13/14,0); back.rotation.y=Math.PI; front.position.z=0.0006; back.position.z=-0.0006; g.add(front,back); g.userData={front,set:(code)=>{ const c=code?cd(code):null; const u0=c?(c.r-2)/14:13/14, row=c?c.s:0; const uv=front.geometry.attributes.uv; const base=[[0,1],[1,1],[0,0],[1,0]]; for(let i=0;i<4;i++){ uv.setXY(i,u0+base[i][0]/14,1-(row+1)/4+base[i][1]/4); } uv.needsUpdate=true; g.userData.code=code; }}; g.userData.set(null); g.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } }); GAME.scene.add(g); return g; }
function pk3Init(){ if(PK3||!LANDMARKS.poker) return; PK3={cardMat:new THREE.MeshStandardMaterial({map:cardAtlas(),roughness:0.55,side:THREE.FrontSide}),board:[],hole:[],mine:[],npc:new Map(),dealer:null,lastN:-1};
  for(let i=0;i<5;i++){ const c=makeCard(); c.scale.setScalar(2.3); PK3.board.push(c); } for(let k=0;k<6;k++){ const a=makeCard(), b2=makeCard(); a.scale.setScalar(1.35); b2.scale.setScalar(1.35); PK3.hole.push([a,b2]); }
  const cam=GAME.camera; for(let i=0;i<2;i++){ const c=makeCard(); GAME.scene.remove(c); cam.add(c); c.position.set(0.075+i*0.068,-0.115,-0.33); c.rotation.set(-0.3,0,(i?-1:1)*0.1); c.visible=false; c.traverse(o=>{ if(o.isMesh){ o.renderOrder=10; o.frustumCulled=false; } }); PK3.mine.push(c); }
  const chipG=new THREE.CylinderGeometry(0.02,0.02,0.0045,14); PK3.chips=new THREE.InstancedMesh(chipG,new THREE.MeshStandardMaterial({roughness:0.5,metalness:0.1}),700); PK3.chips.count=0; PK3.chips.frustumCulled=false; GAME.scene.add(PK3.chips);
  const disc=(txt,bg,fg)=>{ const c=cvs(128,128), g=c.getContext('2d'); g.fillStyle=bg; g.beginPath(); g.arc(64,64,62,0,TAU); g.fill(); g.strokeStyle=fg; g.lineWidth=6; g.beginPath(); g.arc(64,64,52,0,TAU); g.stroke(); g.fillStyle=fg; g.font='800 46px Manrope, Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,64,66); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; const m=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.008,20),[new THREE.MeshStandardMaterial({color:bg}),new THREE.MeshStandardMaterial({map:t}),new THREE.MeshStandardMaterial({color:bg})]); GAME.scene.add(m); m.visible=false; return m; };
  PK3.btnD=disc('D','#f4f2ea','#161616'); PK3.btnS=disc('SB','#2a6fd6','#ffffff'); PK3.btnB=disc('BB','#f2c318','#161616');
  PK3.anim={}; PK3.prevBet={}; PK3.labels=[]; PK3.labTxt=[];
  { const c=cvs(1024,256), g=c.getContext('2d'); g.clearRect(0,0,1024,256); g.textAlign='center'; g.textBaseline='middle'; g.font='italic 700 96px Georgia, serif'; g.fillStyle='rgba(240,205,120,0.55)'; g.fillText('Poker kod Putnika',512,120); g.strokeStyle='rgba(240,205,120,0.35)'; g.lineWidth=5; g.beginPath(); g.ellipse(512,128,470,108,0,0,TAU); g.stroke();
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; const L=LANDMARKS.poker; const m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,0.65),new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:0.9})); const c0=L.f(L.cx,0,L.cz+0.08); m.position.set(c0[0],L.y+PK_H+0.0015,c0[2]); m.rotation.set(-Math.PI/2,0,-L.ang); m.renderOrder=1; GAME.scene.add(m); }
  for(let k=0;k<6;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:true})); sp.scale.set(0.95,0.28,1); sp.visible=false; sp.renderOrder=20; GAME.scene.add(sp); PK3.labels.push(sp); PK3.labTxt.push(''); }
  { const hand=new THREE.Group(); const skin=new THREE.MeshStandardMaterial({color:0xd9a88a,roughness:0.75}); const h=new THREE.Mesh(new THREE.SphereGeometry(0.035,12,10),skin); h.scale.set(1.2,0.7,1.5); hand.add(h); const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.03,0.3,10),new THREE.MeshStandardMaterial({color:0x24324a,roughness:0.9})); arm.rotation.x=Math.PI/2; arm.position.z=0.16; hand.add(arm);
    for(let j=0;j<4;j++){ const ch=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.0045,14),new THREE.MeshStandardMaterial({color:[0xc62828,0x1e4fb3,0xf2f2f2,0x1b1b1b][j]})); ch.position.set(0,-0.03-j*0.005,-0.03); hand.add(ch); } hand.visible=false; hand.traverse(o=>{ if(o.isMesh){ o.renderOrder=10; o.frustumCulled=false; } }); GAME.camera.add(hand); PK3.myHand=hand; }
  const P=LANDMARKS.poker; const da=Math.PI/2; const dp=P.f(P.cx+Math.cos(da)*PK_RX*1.18,0,P.cz+Math.sin(da)*PK_RZ*1.22); const D=makeAvatar('Dealer','#1f2a3a'); D.group.position.set(dp[0],P.y,dp[2]); D.group.rotation.y=Math.atan2(dp[0]-P.x,dp[2]-P.z); GAME.scene.add(D.group); PK3.dealer=D; }
function pkSeatPos(k,r,h){ const P=LANDMARKS.poker; const a=PK_ANG(k); const p=P.f(P.cx+Math.cos(a)*PK_RX*r,0,P.cz+Math.sin(a)*PK_RZ*r); return new THREE.Vector3(p[0],P.y+h,p[2]); }
function pkDealerHand(){ const P=LANDMARKS.poker; const a=Math.PI/2; const p=P.f(P.cx+Math.cos(a)*PK_RX*0.8,0,P.cz+Math.sin(a)*PK_RZ*0.8); return new THREE.Vector3(p[0],P.y+1.0,p[2]); }
function pkPlace(card,pos,yaw,pitch,code,show){ const ud=card.userData; if(ud.code!==code) ud.set(code); if(!card.visible){ card.visible=true; card.position.copy(pkDealerHand()); if(PK3.dealer){ PK3.dealer.armR.rotation.x=-1.2; PK3.dealer.t=0.35; } } card.position.lerp(pos,0.22); const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ')); card.quaternion.slerp(q,0.25); }
function pkCamera(cam){ const P=LANDMARKS.poker; const k=PKC.seat<0?0:PKC.seat; const a=PK_ANG(k); const p=P.f(P.cx+Math.cos(a)*PK_RX*1.16,0,P.cz+Math.sin(a)*PK_RZ*1.16); const dx=P.x-p[0], dz=P.z-p[2]; const yaw=Math.atan2(-dx,-dz)+(PKC.lookY||0); const dist=Math.hypot(dx,dz); cam.position.set(p[0],P.y+1.66,p[2]); cam.rotation.set(-Math.atan2(1.66-PK_H,dist*0.62)+(PKC.lookP||0),yaw,0,'YXZ'); if(cam.fov!==66){ cam.fov=66; cam.updateProjectionMatrix(); } PLAYER.pos.set(p[0],P.y,p[2]); PLAYER.yaw=yaw; }
function pokerTick(dt){ if(!LANDMARKS.poker) return; if(!PK3) pk3Init(); if(!PK3) return;
  if(pkIsHost()) hTick(dt); else if(!PKC.sit){ /* nobody hosting from here */ }
  const V=pkView(); PKC.view=V; const P=LANDMARKS.poker; const near=Math.hypot(GAME.camera.position.x-P.x,GAME.camera.position.z-P.z)<30;
  if(PK3.dealer&&PK3.dealer.t>0){ PK3.dealer.t-=dt; if(PK3.dealer.t<=0) PK3.dealer.armR.rotation.x=-0.3; }
  if(PKC.sit&&V){ PKC.seat=V.s.findIndex(s=>s&&s.i===myPid()); }
  // my private cards (decrypt when a new hand starts)
  if(PKC.sit&&V&&!pkIsHost()&&V.n!==PKC.myHand&&V.e&&V.e[myPid()]){ const n=V.n; PKC.myHand=n; pkDec(V.ek,V.e[myPid()]).then(t=>{ if(t&&PKC.myHand===n) PKC.my=[cd(t.slice(0,2)),cd(t.slice(2,4))]; }); }
  const show=near&&V; const S=V?V.s:[]; const active=V&&V.st!=='idle';
  for(let i=0;i<5;i++){ const c=PK3.board[i]; const code=show&&V.b[i]; if(!code){ c.visible=false; continue; } const pos=pkSeatPos(0,0,PK_H+0.01); const P2=P.f(P.cx-0.5+i*0.25,0,P.cz-0.05); pos.set(P2[0],P.y+PK_H+0.003,P2[2]); pkPlace(c,pos,-P.ang,-Math.PI/2,code,true); }
  for(let k=0;k<6;k++){ const s=S[k]; const pair=PK3.hole[k]; const has=show&&active&&s&&s.hc&&!s.f&&!(PKC.sit&&k===PKC.seat);
    for(let j=0;j<2;j++){ const c=pair[j]; if(!has){ c.visible=false; continue; } const a=PK_ANG(k); const faceUp=!!(s.sh); const pos=pkSeatPos(k,faceUp?0.74:1.0,faceUp?PK_H+0.003:PK_H+0.22); const side=new THREE.Vector3(-Math.sin(a),0,Math.cos(a)).multiplyScalar((j?1:-1)*0.035); pos.add(side); const yaw=Math.atan2(Math.cos(a),Math.sin(a))*0-(a)+Math.PI/2-P.ang;
      pkPlace(c,pos,yaw,faceUp?-Math.PI/2:-0.35,faceUp?s.sh.slice(j*2,j*2+2):null,faceUp); } }
  for(let j=0;j<2;j++){ PK3.mine[j].visible=false; }
  // chips: stacks, bets, pot
  let n=0; const M=new THREE.Matrix4(), col=new THREE.Color(); const cols=[0xc62828,0x1e4fb3,0xf2f2f2,0x1b1b1b,0x2e8b3a,0x7b2cbf];
  const stack=(pos,count,ci)=>{ for(let c=0;c<Math.min(count,14)&&n<700;c++){ M.makeTranslation(pos.x,pos.y+0.0025+c*0.0047,pos.z); PK3.chips.setMatrixAt(n,M); PK3.chips.setColorAt(n,col.setHex(cols[(ci+Math.floor(c/5))%cols.length])); n++; } };
  if(show){ for(let k=0;k<6;k++){ const s=S[k]; if(!s) continue; const base=pkSeatPos(k,0.86,PK_H+0.002); const cnt=Math.ceil(s.c/100); for(let col2=0;col2<Math.min(4,Math.ceil(cnt/12));col2++){ const q=base.clone(); q.x+=(col2-1)*0.045; stack(q,Math.min(12,cnt-col2*12),k+col2); } if(s.bt>0){ const an=PK3.anim[k]; const tt=an?Math.min(1,an.t/0.45):1; const e=tt*tt*(3-2*tt); const pos=base.clone().lerp(pkSeatPos(k,0.6,PK_H+0.002),e); stack(pos,Math.ceil(s.bt/20),k+2); } }
    if(V.pot>0){ const pc=Math.ceil((V.pot-S.reduce((a,s)=>a+(s?s.bt:0),0))/40); const pz=P.f(P.cx,0,P.cz+0.32); let pc3=new THREE.Vector3(pz[0],P.y+PK_H+0.002,pz[2]); const wk=V.st==='showdown'?S.findIndex(s=>s&&s.w>0):-1; if(wk>=0){ PK3.potT=Math.min(1,(PK3.potT||0)+0.02); pc3.lerp(pkSeatPos(wk,0.86,PK_H+0.002),PK3.potT); if(PK3.dealer&&PK3.potT<0.9){ PK3.dealer.armR.rotation.x=-1.3; PK3.dealer.t=0.2; } } else PK3.potT=0; if(!(wk>=0&&PK3.potT>=1)) for(let t=0;t<Math.min(6,Math.ceil(pc/12));t++) stack(new THREE.Vector3(pc3.x+(t-2.5)*0.045,pc3.y,pc3.z),Math.min(12,pc-t*12),t); } }
  PK3.chips.count=n; PK3.chips.instanceMatrix.needsUpdate=true;
  for(let k=0;k<6;k++){ const s=S[k]; const b=s?s.bt:0; const pb=PK3.prevBet[k]||0; if(s&&b>pb){ PK3.anim[k]={t:0}; } PK3.prevBet[k]=b; const an=PK3.anim[k]; if(an){ an.t+=dt; if(an.t>0.6) delete PK3.anim[k]; } }
  { const an=PKC.sit&&PKC.seat>=0?PK3.anim[PKC.seat]:null; const hnd=PK3.myHand; if(an){ const t=Math.min(1,an.t/0.45); hnd.visible=true; hnd.position.set(0.1-0.08*t,-0.2-0.04*t,-0.32-0.3*t); } else hnd.visible=false; }
  for(let k=0;k<6;k++){ const s=S[k]; const sp=PK3.labels[k]; if(!s||!show||(PKC.sit&&k===PKC.seat)){ sp.visible=false; continue; }
    const act=pkEn(s.l||''); const turn=V.ta===k; const role=(k===V.d?' · D':'')+(active&&k===V.sbS?' · SB':'')+(active&&k===V.bbS?' · BB':''); const txt=s.n+role+'|'+(act||(turn?'IGRA…':''))+'|'+s.c+(turn?'|T':'');
    if(PK3.labTxt[k]!==txt){ PK3.labTxt[k]=txt; const c=cvs(512,150), g=c.getContext('2d'); g.clearRect(0,0,512,150); g.fillStyle=turn?'rgba(216,160,40,0.92)':'rgba(12,14,12,0.78)'; g.beginPath(); g.roundRect?g.roundRect(6,6,500,138,26):g.rect(6,6,500,138); g.fill();
      g.textAlign='center'; g.font='900 46px Manrope, Arial'; g.fillStyle=turn?'#161616':(/FOLD/.test(act)?'#ff8a80':/RAISE|ALL-IN/.test(act)?'#ffd24a':'#9fe3a4'); g.fillText(act||(turn?'IGRA…':'·'),256,56); g.font='800 34px Manrope, Arial'; g.fillStyle=turn?'#2a1a00':'#ffffff'; g.fillText(s.n+role+'  🪙'+s.c,256,112);
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; if(sp.material.map) sp.material.map.dispose(); sp.material.map=t; sp.material.needsUpdate=true; }
    const a=PK_ANG(k); const cp=P.f(P.cx+Math.cos(a)*PK_RX*1.25,0,P.cz+Math.sin(a)*PK_RZ*1.3); sp.position.set(cp[0],P.y+1.62,cp[2]); sp.visible=true; } if(PK3.chips.instanceColor) PK3.chips.instanceColor.needsUpdate=true;
  const mark=(m,k,r)=>{ if(!show||k<0||!S[k]){ m.visible=false; return; } m.visible=true; const p=pkSeatPos(k,r,PK_H+0.006); p.x+=0.06; m.position.copy(p); };
  mark(PK3.btnD,V?V.d:-1,0.7); mark(PK3.btnS,active&&V?V.sbS:-1,0.7); mark(PK3.btnB,active&&V?V.bbS:-1,0.7);
  // seated people: remote humans + bots (NPC avatars) in the chairs
  const seatedIds=new Set(); for(let k=0;k<6;k++){ const s=S[k]; if(!s||!show) continue; const a=PK_ANG(k); const cp=P.f(P.cx+Math.cos(a)*PK_RX*1.25,0,P.cz+Math.sin(a)*PK_RZ*1.3); const face=Math.atan2(cp[0]-P.x,cp[2]-P.z);
    let av=null; if(s.bo){ let npc=PK3.npc.get(s.n); if(!npc){ npc=makeAvatar(s.n,nameColor(s.n)); GAME.scene.add(npc.group); PK3.npc.set(s.n,npc); } av=npc; seatedIds.add('npc:'+s.n); } else if(s.i!==myPid()){ const R=NET.remotes.get(s.i); if(R) av=R.av; }
    if(av){ av.group.visible=true; av.seatT=GAME.time; av.group.position.set(cp[0],P.y-0.4,cp[2]); av.group.rotation.set(0,face,0); av.legL.rotation.x=av.legR.rotation.x=-1.45; av.armL.rotation.x=-0.9; av.armR.rotation.x=PK3.anim[k]?-1.55:-0.9; if(av.sprite) av.sprite.visible=false; for(const bp of av.body) bp.visible=true; } }
  for(const [nm,npc] of PK3.npc){ if(!seatedIds.has('npc:'+nm)) npc.group.visible=false; }
  pkHud(); }
function pkEn(l){ l=String(l||''); if(/odustao|otišao/.test(l)) return 'FOLD'; if(/all-in/.test(l)) return 'ALL-IN'+(l.match(/\d+/)?' '+l.match(/\d+/)[0]:''); if(/povisuje/.test(l)) return 'RAISE '+(l.match(/\d+/)||[''])[0]; if(/prati/.test(l)) return 'CALL'+(l.match(/\d+/)?' '+l.match(/\d+/)[0]:''); if(/provjer/.test(l)) return 'CHECK'; if(/čeka/.test(l)) return 'ČEKA'; return l.toUpperCase(); }
function domCard(code,cls){ const d=document.createElement('div'); d.className='dc '+(cls||''); if(!code){ d.classList.add('back'); return d; } const SY={s:'♠',h:'♥',d:'♦',c:'♣'}; if(code[1]==='h'||code[1]==='d') d.classList.add('red'); const r=document.createElement('b'); r.textContent=code[0]==='T'?'10':code[0]; const u=document.createElement('i'); u.textContent=SY[code[1]]; d.append(r,u); return d; }
function pkBadges(){ const V=PKC.view; const box=document.getElementById('pkbadges'); if(!box) return; if(!PKC.sit||!V){ box.replaceChildren(); return; } const cam=GAME.camera; const W=innerWidth, H=innerHeight; const P=LANDMARKS.poker; const active=V.st!=='idle';
  box.style.display='none'; while(box.children.length<6){ const d=document.createElement('div'); d.className='pkbg'; box.appendChild(d); }
  for(let k=0;k<6;k++){ const el=box.children[k]; const s=V.s[k]; if(!s||k===PKC.seat){ el.style.display='none'; continue; }
    el.style.display='block'; el.style.order=String((k-PKC.seat+6)%6);
    const role=[k===V.d?'D':'',active&&k===V.sbS?'SB':'',active&&k===V.bbS?'BB':''].filter(Boolean).join(' '); const act=(s.l||'').toUpperCase()||(V.ta===k?'RAZMIŠLJA…':''); const key=[s.n,role,act,s.c,V.ta===k,s.sh,s.f].join('|');
    if(el.dataset.k!==key){ el.dataset.k=key; el.className='pkbg'+(V.ta===k?' turn':'')+(s.f?' fold':'')+(s.w>0?' win':''); el.replaceChildren(); const n=document.createElement('div'); n.className='n'; n.textContent=s.n+(role?'  '+role:''); const a2=document.createElement('div'); a2.className='a'+(/ODUSTAO/.test(act)?' f':/POVISUJE|ALL-IN/.test(act)?' r':''); a2.textContent=act||' '; const c=document.createElement('div'); c.className='c'; c.textContent='🪙 '+s.c+(s.bt>0?'  ·  ulog '+s.bt:''); el.append(n,a2,c);
      if(s.sh){ const cs=document.createElement('div'); cs.className='cs'; cs.append(domCard(s.sh.slice(0,2),'sm'),domCard(s.sh.slice(2,4),'sm')); el.append(cs); } } }
  const bd=document.getElementById('pkboardui'); if(bd){ const key=(V.b||[]).join(''); if(bd.dataset.k!==key){ bd.dataset.k=key; bd.replaceChildren(...[0,1,2,3,4].map(i=>V.b[i]?domCard(V.b[i],'md'):(()=>{ const e=document.createElement('div'); e.className='dc md empty'; return e; })())); } }
  const mc=document.getElementById('pkmycards'); if(mc){ const me=PKC.seat>=0?V.s[PKC.seat]:null; const key=(PKC.my||[]).map(cc).join('')+(me&&me.f?'f':''); if(mc.dataset.k!==key){ mc.dataset.k=key; mc.replaceChildren(...(PKC.my.length===2&&me&&!me.f&&active?PKC.my.map(c=>domCard(cc(c),'lg')):[])); } } }
function pkHud(){ pkBadges(); const V=PKC.view; const el=document.getElementById('pkhud'); if(!el||!PKC.sit) return; const $$=(id)=>document.getElementById(id);
  const me=V&&PKC.seat>=0?V.s[PKC.seat]:null; const my=V&&me&&V.ta===PKC.seat&&V.st!=='showdown'&&V.st!=='idle';
  const SY={s:'♠',h:'♥',d:'♦',c:'♣'}; const bs=V&&V.b.length?' · stol: '+V.b.map(t=>(t[0]==='T'?'10':t[0])+SY[t[1]]).join(' '):''; $$('pkmsg2').textContent=V?(V.msg||''):'Spajam se sa stolom…'; $$('pkpot2').textContent=V?('Pot '+V.pot+' · blind '+V.sb+'/'+V.bb):'';
  $$('pkme').textContent=me?('🪙 '+me.c+(PKC.my.length===2&&V.b.length?' · '+CATN[best7(PKC.my.concat(V.b.map(cd))).cat]:'')):'Čekaš mjesto…';
  const need=me?V.cb-me.bt:0; if(my&&(PKC.raiseTo<V.cb+V.mr||PKC.raiseTo>me.c+me.bt)) PKC.raiseTo=Math.min(me.c+me.bt,V.cb+Math.max(V.mr,V.bb*2));
  $$('pkcall').textContent=need>0?('CALL '+Math.min(need,me?me.c:0)):'CHECK'; $$('pkraise').textContent='RAISE '+(PKC.raiseTo||0);
  for(const id of ['pkfold','pkcall','pkraise','pkallin','pkminus','pkplus']) $$(id).disabled=!my; el.classList.toggle('myturn',!!my);
  const rb=$$('pkrebuy2'); if(rb) rb.style.display=(me&&me.c<(V?V.bb:20))?'inline-block':'none';
  const bb=$$('pkbots'); if(bb){ bb.style.display=pkIsHost()?'inline-block':'none'; bb.textContent='Botovi: '+(PKH.bots?'da':'ne'); }
  const who=$$('pkwho'); if(who&&V){ who.textContent=V.s.map((s,k)=>s?(s.n+(k===V.d?' (D)':'')+(k===V.sbS&&V.st!=='idle'?' SB':'')+(k===V.bbS&&V.st!=='idle'?' BB':'')+' '+s.c+(V.ta===k?' ◀':'')):null).filter(Boolean).join(' · '); } }
function pokerTable(cs,f,ang,y0,cx0,cz0,x,z){ const g=(k)=>cs.get(k,cx0,cz0); const Cl=g('cloth'), Wd=g('wood'), Mt=g('metal'), BG=g('blackGlass'), T=g('trim');
  const p=f(x,0,z); const tf=frame(p[0],p[2],ang,y0); const felt=lin('#1d6a3a');
  const oval=(G,rx,rz,y,C,up)=>{ const n=36; for(let k=0;k<n;k++){ const a0=k/n*TAU, a1=(k+1)/n*TAU; G.tri(tf(0,y,0),tf(Math.cos(a0)*rx,y,Math.sin(a0)*rz),tf(Math.cos(a1)*rx,y,Math.sin(a1)*rz),[0.5,0.5],[0.5+Math.cos(a0)*0.5,0.5+Math.sin(a0)*0.5],[0.5+Math.cos(a1)*0.5,0.5+Math.sin(a1)*0.5],C,up?[0,1,0]:[0,-1,0]); } };
  oval(Cl,PK_RX,PK_RZ,PK_H,felt,true); oval(Cl,PK_RX+0.13,PK_RZ+0.12,PK_H-0.08,lin('#1a1a1a'),false);
  { const n=36; for(let k=0;k<n;k++){ const a0=k/n*TAU, a1=(k+1)/n*TAU; const P=(a,r,y)=>tf(Math.cos(a)*PK_RX*r,y,Math.sin(a)*PK_RZ*r); Cl.quad(P(a0,1,PK_H),P(a1,1,PK_H),P(a1,1.07,PK_H+0.04),P(a0,1.07,PK_H+0.04),[0,0],[1,0],[1,1],[0,1],lin('#24160f'),[0,1,0]); Cl.quad(P(a0,1.07,PK_H+0.04),P(a1,1.07,PK_H+0.04),P(a1,1.07,PK_H-0.08),P(a0,1.07,PK_H-0.08),[0,0],[1,0],[1,1],[0,1],lin('#24160f'),[Math.cos(a0),0,Math.sin(a0)]); } }
  for(const sx of [-0.9,0.9]){ const q=tf(sx,0,0); const lf=frame(q[0],q[2],ang,y0); Wd.cyl(lf,0.16,0.1,0.02,PK_H-0.08,12,lin('#2a1a10'),1,false); Wd.cyl(lf,0.45,0.45,0,0.03,16,lin('#2a1a10'),1,true); }
  const CH=[lin('#c62828'),lin('#1e4fb3'),lin('#f2f2f2'),lin('#1b1b1b'),lin('#2e8b3a')];
  for(let k=0;k<6;k++){ const a=PK_ANG(k); const q=f(x+Math.cos(a)*PK_RX*1.25,0,z+Math.sin(a)*PK_RZ*1.3); const chf=frame(q[0],q[2],ang+Math.atan2(-Math.cos(a),Math.sin(a)),y0); Wd.box(chf,-0.22,0.22,0.44,0.5,-0.22,0.22,lin('#3a2418')); Cl.box(chf,-0.2,0.2,0.5,0.56,-0.2,0.2,lin('#6b1d1d')); Wd.box(chf,-0.22,0.22,0.5,1.05,0.18,0.23,lin('#3a2418')); for(const [lx,lz] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]]) Wd.box(chf,lx-0.02,lx+0.02,0,0.44,lz-0.02,lz+0.02,lin('#2a1a10')); }
  addCollider(p[0],p[2],ang,PK_RX*2.1,PK_RZ*2.1,y0-1,y0+0.9); LANDMARKS.poker={x:p[0],z:p[2],y:y0,f,ang,cx:x,cz:z}; }
