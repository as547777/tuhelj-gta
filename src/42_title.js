/* ===================== title screen in the style of the big open-world games =====================
   Loading: your photos of Tuhelj redrawn as comic-style poster panels (posterised colour + ink edges), tilted collage,
   huge logo, spinner and "UČITAVANJE" bottom-right. Ready: "PRITISNI BILO KOJU TIPKU" then a left-hand menu over the
   cinematic fly-through, letterboxed. The old card stays in the DOM (hidden) because the loader writes progress into it. */
(function(){ const st=document.createElement('style'); st.textContent=`
#start .card{position:absolute!important;left:-9999px!important;top:0!important;opacity:0!important;pointer-events:none!important}
#start #tip{display:none!important} #start::before{background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 40%,rgba(0,0,0,.65) 100%)!important}
#tt{position:absolute;inset:0;z-index:3;overflow:hidden;font-family:Anton,Impact,"Arial Narrow",sans-serif;color:#fff;user-select:none;-webkit-user-select:none}
#tt .art{position:absolute;inset:0;background:#0b0b0b;transition:opacity 1.2s}
#tt.ready .art{opacity:0;pointer-events:none}
#tt .pan{position:absolute;border:7px solid #f4f1ea;box-shadow:0 18px 50px rgba(0,0,0,.7);background-size:cover;background-position:center;opacity:0;transform:scale(1.06) rotate(var(--r));transition:opacity 1.4s,transform 9s linear}
#tt .pan.on{opacity:1;transform:scale(1) rotate(var(--r))}
#tt .bars:before,#tt .bars:after{content:"";position:absolute;left:0;right:0;height:9vh;background:#000;z-index:2}
#tt .bars:before{top:0} #tt .bars:after{bottom:0}
#tt .logo{position:absolute;left:5vw;bottom:13vh;z-index:4;line-height:.82;transform:rotate(-3deg);transform-origin:left bottom}
#tt .logo b{display:block;font-size:min(19vw,190px);letter-spacing:.01em;color:#fff;-webkit-text-stroke:5px #0a0a0a;paint-order:stroke fill;text-shadow:7px 7px 0 #0a0a0a}
#tt .logo i{display:inline-block;font-style:normal;margin-top:10px;background:#0a0a0a;color:#ffd24a;font-size:min(5vw,40px);padding:6px 16px 4px;letter-spacing:.12em}
#tt .load{position:absolute;right:4vw;bottom:calc(9vh + 18px);z-index:4;display:flex;align-items:center;gap:12px;font:800 15px Manrope,sans-serif;letter-spacing:.16em;text-shadow:0 2px 6px #000}
#tt .load s{width:22px;height:22px;border-radius:50%;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;animation:ttsp 1s linear infinite;text-decoration:none}
@keyframes ttsp{to{transform:rotate(360deg)}}
#tt .pct{position:absolute;left:0;bottom:9vh;height:4px;background:#ffd24a;z-index:4;transition:width .4s}
#tt .press{position:absolute;left:0;right:0;bottom:calc(9vh + 24px);text-align:center;z-index:4;font:800 16px Manrope,sans-serif;letter-spacing:.3em;display:none;animation:ttbl 1.4s ease-in-out infinite;text-shadow:0 2px 8px #000}
@keyframes ttbl{50%{opacity:.35}}
#tt.ready .press{display:block} #tt.menu .press{display:none}
#tt .menu{position:absolute;left:5vw;top:15vh;z-index:5;display:none;flex-direction:column;gap:6px;min-width:min(360px,80vw)}
#tt.menu .menu{display:flex} #tt.menu .logo{bottom:auto;top:calc(9vh + 12px);transform:rotate(-3deg) scale(.42);transform-origin:left top}
#start ~ .attr,body:not(.ingame) .attr{display:none!important}
#tt.menu .menu{top:calc(9vh + 150px)}
#tt .menu button{all:unset;cursor:pointer;font-family:Anton,Impact,sans-serif;font-size:min(7vw,36px);letter-spacing:.03em;padding:4px 18px;color:#fff;background:linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,0));text-shadow:2px 2px 0 #000}
#tt .menu button small{display:block;font:600 12px Manrope,sans-serif;letter-spacing:.08em;color:rgba(255,255,255,.75);text-shadow:none;margin-top:-2px}
#tt .menu button.sel,#tt .menu button:hover{background:#f4f1ea;color:#111;text-shadow:none} #tt .menu button.sel small,#tt .menu button:hover small{color:#444}
#tt .menu .q{display:flex;gap:6px;padding:4px 18px} #tt .menu .q span{font:800 12px Manrope,sans-serif;padding:6px 10px;background:rgba(0,0,0,.6);cursor:pointer;letter-spacing:.1em} #tt .menu .q span.on{background:#ffd24a;color:#111}
#tt .menu input{all:unset;font:700 15px Manrope,sans-serif;padding:8px 18px;background:rgba(0,0,0,.6);border-left:4px solid #ffd24a;color:#fff}
#tt .help{position:absolute;right:4vw;top:calc(9vh + 20px);z-index:5;max-width:min(420px,44vw);font:600 13px/1.6 Manrope,sans-serif;background:rgba(0,0,0,.6);padding:14px 18px;display:none}
#tt.menu .help.on{display:block}
#tt .cr{position:absolute;right:2vw;bottom:2vh;z-index:6;font:500 10px Manrope,sans-serif;color:rgba(255,255,255,.55)}
@media (max-width:760px),(max-height:520px){ #tt .logo b{font-size:min(16vw,120px);-webkit-text-stroke:3px #0a0a0a;text-shadow:4px 4px 0 #0a0a0a} #tt.menu .menu{top:calc(9vh + 110px);gap:2px} #tt .menu button{font-size:24px;padding:2px 14px} #tt .help{max-width:52vw;font-size:11px} }
`; document.head.appendChild(st); })();
const TT={el:null,i:0,t:0,arts:[],ready:false};
// photo → comic poster (posterise + saturation + ink edges)
function comicArt(img,W){ const H=Math.round(W*img.height/img.width); const c=cvs(W,H), g=c.getContext('2d'); g.drawImage(img,0,0,W,H); const id=g.getImageData(0,0,W,H), d=id.data; const L=new Float32Array(W*H);
  for(let i=0;i<W*H;i++){ let r=d[i*4],gg=d[i*4+1],b=d[i*4+2]; const l=(r*0.3+gg*0.59+b*0.11); L[i]=l; const s=1.45; r=l+(r-l)*s; gg=l+(gg-l)*s; b=l+(b-l)*s; const q=(v)=>Math.max(0,Math.min(255,Math.round(((v-128)*1.18+128)/42)*42)); d[i*4]=q(r); d[i*4+1]=q(gg); d[i*4+2]=q(b); }
  for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){ const i=y*W+x; const gx=L[i+1]-L[i-1]+(L[i+1-W]-L[i-1-W]+L[i+1+W]-L[i-1+W])*0.5, gy=L[i+W]-L[i-W]+(L[i+W+1]-L[i-W+1]+L[i+W-1]-L[i-W-1])*0.5; const e=Math.hypot(gx,gy); if(e>70){ const k=Math.min(1,(e-70)/80); for(let j=0;j<3;j++) d[i*4+j]=d[i*4+j]*(1-k)+12*k; } }
  g.putImageData(id,0,0); const v=g.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,0.45)'); g.fillStyle=v; g.fillRect(0,0,W,H); return c.toDataURL('image/jpeg',0.85); }
function ttInit(){ const s=document.getElementById('start'); if(!s||TT.el) return; const el=document.createElement('div'); el.id='tt';
  el.innerHTML='<div class="art"></div><div class="bars"></div><div class="logo"><b>TUHELJ</b><i>POVRATAK U ZAGORJE</i></div><div class="pct" style="width:0"></div><div class="load"><s></s><span>UČITAVANJE</span></div><div class="press">'+(GAME.touch?'DODIRNI ZASLON':'PRITISNI BILO KOJU TIPKU')+'</div><div class="menu"></div><div class="help"></div><div class="cr">© OpenStreetMap · Mapillary CC BY-SA · Rocketbox MIT · Quaternius/Kenney CC0</div>';
  s.appendChild(el); TT.el=el; s.classList.add('ttready');
  // art panels from your photos (falls back to plain dark if there are none)
  const P=Array.isArray(window.TUHELJ_PHOTOS)?window.TUHELJ_PHOTOS:[]; const art=el.querySelector('.art'); const W=GAME.touch?720:1100;
  const lay=[{l:'4%',t:'10%',w:'62%',h:'62%',r:'-2.5deg'},{l:'52%',t:'16%',w:'44%',h:'46%',r:'3deg'},{l:'30%',t:'40%',w:'48%',h:'50%',r:'-1deg'}];
  P.forEach((u,k)=>{ const im=new Image(); im.onload=()=>{ setTimeout(()=>{ try{ const url=comicArt(im,W); const d=document.createElement('div'); d.className='pan'; const L=lay[TT.arts.length%3]; Object.assign(d.style,{left:L.l,top:L.t,width:L.w,height:L.h,backgroundImage:'url('+url+')'}); d.style.setProperty('--r',L.r); art.appendChild(d); TT.arts.push(d); if(TT.arts.length===1) d.classList.add('on'); }catch(e){} },120*k); }; im.src=u; });
  const anyKey=(e)=>{ if(TT.ready&&!GAME.started){ if(e&&e.type==='keydown'&&/Arrow|Key[WS]/.test(e.code)) return; const go=document.getElementById('go'); if(go&&!go.disabled) go.click(); } }; addEventListener('keydown',anyKey); el.addEventListener('pointerup',anyKey);
  const unlock=()=>{ try{ ttMusicStart(); if(RADIO.ctx&&RADIO.ctx.state!=='running') RADIO.ctx.resume(); }catch(e){} }; addEventListener('pointerdown',unlock,{once:true}); addEventListener('keydown',unlock,{once:true});
  setTimeout(()=>ttMenu(),0); }
/* NOVA PRIČA: hide the menu and build the whole world now; when everything is in, one tap starts */
function ttPlay(){ const el=TT.el; if(el.classList.contains('loading')) return; el.classList.remove('menu'); el.classList.add('loading'); try{ TTM.stop=true; if(TTM.g) TTM.g.gain.setTargetAtTime(0,RADIO.ctx.currentTime,0.35); }catch(e){} /* the lounge theme fades out while the village loads */ setTimeout(()=>{ try{ mainGo(); }catch(e){ console.error(e); } },60); }
function ttNewGame(){ if(!confirm('Započeti priču ispočetka? Novac, stan, oružje i namještaj se brišu.')) return; try{ for(const k of ['tuhelj_story','tuhelj_money','tuhelj_home','tuhelj_done','tuhelj_arms','tuhelj_decor','tuhelj_save']) localStorage.removeItem(k); }catch(e){} location.reload(); }
function ttMenu(){ const el=TT.el; el.classList.add('menu'); const m=el.querySelector('.menu'); const n=(typeof STORY!=='undefined')?STORY.ch:0; const go=document.getElementById('go');
  const items=[[(n>=STORY_LAST?'SLOBODNA IGRA':n?'NASTAVI PRIČU':'NOVA PRIČA')+' ▶',(n?('Poglavlje '+Math.min(STORY_LAST,n+1)+' od '+STORY_LAST+' · '):'')+(GAME.touch?'Dodirni za početak':'Klikni ili Enter za početak'),()=>ttPlay()],
    ['KONTROLE',GAME.touch?'Dodirne kontrole':'Tipkovnica i miš',()=>{ const h=el.querySelector('.help'); h.classList.toggle('on'); h.innerHTML=GAME.touch?'Lijevi krug — hodanje · prst po ekranu — pogled · gumbi desno — skok, trčanje, pucanje · Vozi — uđi u auto · 📻 — radio':'W A S D hodanje · Shift trčanje · Space skok · C čučanj<br>E vrata, auto, razgovor · V pogled iz auta · R radio u autu<br>Kotačić / Tab oružje · lijevi klik puca · desni nišani<br>M karta · P mobitel · Esc izbornik'; }]];
  if((typeof STORY!=='undefined'&&STORY.ch>0)||GTA.home) items.push(['NOVA IGRA','Briše napredak',()=>ttNewGame()]);
  m.innerHTML=''; items.forEach((it,i)=>{ const b=document.createElement('button'); b.innerHTML=it[0]+'<small>'+it[1]+'</small>'; if(!i) b.classList.add('sel'); b.addEventListener('click',e=>{ e.stopPropagation(); it[2](); }); b.addEventListener('pointerenter',()=>{ m.querySelectorAll('button').forEach(x=>x.classList.toggle('sel',x===b)); }); m.appendChild(b); });
  const q=document.createElement('div'); q.className='q'; ['NISKA','SREDNJA','VISOKA'].forEach((t,i)=>{ const s=document.createElement('span'); s.textContent=t; if((GAME.qPref!==undefined?GAME.qPref:detectQuality())===i) s.className='on'; s.addEventListener('click',e=>{ e.stopPropagation(); GAME.qPref=i; if(GAME.renderer) setQuality(i); q.querySelectorAll('span').forEach((x,j)=>x.classList.toggle('on',j===i)); }); q.appendChild(s); }); m.appendChild(q);
  const pn=document.getElementById('pname'); if(pn){ const inp=document.createElement('input'); inp.placeholder='Tvoje ime'; inp.maxLength=16; inp.value=pn.value; inp.addEventListener('input',()=>{ pn.value=inp.value; pn.dispatchEvent(new Event('input')); }); inp.addEventListener('pointerup',e=>e.stopPropagation()); m.appendChild(inp); }
  let sel=0; addEventListener('keydown',e=>{ if(GAME.started||!el.classList.contains('menu')) return; const bs=[...m.querySelectorAll('button')]; if(e.code==='ArrowDown'||e.code==='KeyS'){ sel=(sel+1)%bs.length; } else if(e.code==='ArrowUp'||e.code==='KeyW'){ sel=(sel+bs.length-1)%bs.length; } else if(e.code==='Enter'||e.code==='Space'){ bs[sel].click(); return; } else return; bs.forEach((x,j)=>x.classList.toggle('sel',j===sel)); }); }
function ttTick(dt){ if(!TT.el){ try{ ttInit(); }catch(e){ return; } } if(GAME.started){ TT.el.style.display='none'; return; } TT.el.style.display='';
  const bar=document.getElementById('bar'); const p=TT.el.querySelector('.pct'); if(bar&&p) p.style.width=(0.85*(parseFloat(bar.style.width)||0))+'%';
  const go=document.getElementById('go'); if(go&&!go.disabled&&!TT.ready&&ttAllLoaded(p)){ TT.ready=true; TT.el.classList.add('ready'); TT.el.querySelector('.load span').textContent='SPREMNO'; TT.el.querySelector('.press').textContent=GAME.touch?'▶  DODIRNI ZA POČETAK':'▶  PRITISNI BILO KOJU TIPKU'; TT.el.querySelector('.load s').style.display='none'; }
  TT.t-=dt; if(TT.t<=0&&TT.arts.length>1){ TT.t=6; TT.arts.forEach(a=>a.classList.remove('on')); TT.arts[++TT.i%TT.arts.length].classList.add('on'); } }
// runs while loading too (the game loop has not started yet)
(function loop(){ let last=performance.now(); const f=()=>{ const n=performance.now(); try{ ttTick((n-last)/1000); }catch(e){} last=n; if(!GAME.started) setTimeout(f,100); else ttTick(0); }; if(document.readyState==='loading') addEventListener('DOMContentLoaded',f); else setTimeout(f,0); })();
// title music (the Lounge Krapina jazz theme, starts with your first key/tap — browsers block sound before that)
// and menu sounds when you move over / pick an item
const TTM={on:false,next:0,step:0,g:null};
function ttMusicStart(){ if(TTM.on||TTM.stop) return; try{ if(!rdInit()) return; const C=RADIO.ctx; if(C.state!=='running') C.resume(); TTM.g=C.createGain(); TTM.g.gain.value=0; TTM.g.connect(C.destination); TTM.on=true; TTM.next=C.currentTime+0.2; TTM.step=0; TTM.g.gain.setTargetAtTime(0.32,C.currentTime,1.2); }catch(e){} }
function ttMusicTick(){ if(!TTM.on) return; const C=RADIO.ctx; if(GAME.started){ TTM.g.gain.setTargetAtTime(0,C.currentTime,0.5); if(C.currentTime>TTM.next+2){ TTM.on=false; } return; }
  if(TTM.stop) return; const S=STATIONS.find(x=>x.n==='LOUNGE KRAPINA')||STATIONS[3]; const sd=60/S.bpm; const keep=RADIO.gain; RADIO.gain=TTM.g; try{ while(TTM.next<C.currentTime+0.3){ S.play(TTM.step,TTM.next,sd); TTM.step++; TTM.next+=sd; } }catch(e){} RADIO.gain=keep; }
function uiSnd(kind){ try{ if(!RADIO.ctx) return; const C=RADIO.ctx, t=C.currentTime; const o=C.createOscillator(), g=C.createGain(); o.type=kind==='pick'?'triangle':'sine'; o.frequency.setValueAtTime(kind==='pick'?660:880,t); if(kind==='pick') o.frequency.exponentialRampToValueAtTime(1320,t+0.08);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(kind==='pick'?0.16:0.07,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+(kind==='pick'?0.22:0.08)); o.connect(g); g.connect(C.destination); o.start(t); o.stop(t+0.25); }catch(e){} }
{ const _menu=ttMenu; ttMenu=function(){ ttMusicStart(); uiSnd('pick'); _menu(); const m=TT.el.querySelector('.menu'); m.querySelectorAll('button,.q span').forEach(b=>{ b.addEventListener('pointerenter',()=>uiSnd('hover')); b.addEventListener('click',()=>uiSnd('pick')); }); };
  addEventListener('keydown',e=>{ if(!GAME.started&&TT.el&&TT.el.classList.contains('menu')&&/Arrow|Key[WS]/.test(e.code)) uiSnd('hover'); });
  const _tick=ttTick; ttTick=function(dt){ _tick(dt); ttMusicTick(); }; }

/* wait for everything (people, animations, cars, guns, first shader compile) before showing the menu,
   so the game is ready the moment the story starts instead of popping in for another ~10 s */
function ttAllLoaded(pct){ if(!TT.wt0) TT.wt0=performance.now(); try{ rbInit(); }catch(e){}
  const ok=n=>!!(MODELS.gltf[n]||MODELS.failed[n]); const parts=[ok('vehicles'),ok('weapons'),ok('anims'),ok(peoplePack()),!!REAL.rbReady||!waitingPeople()];
  const done=parts.filter(Boolean).length, all=done===parts.length, late=performance.now()-TT.wt0>45000;
  if(pct) pct.style.width=(85+15*done/parts.length)+'%';
  const ls=TT.el&&TT.el.querySelector('.load span'); if(ls&&!all) ls.textContent='UČITAVAM LJUDE I AUTE…';
  if(!all&&!late) return false;
  if(!TT.warm){ TT.warm=true; try{ ttWarm(); }catch(e){ console.warn('warm',e); } }
  return true; }
function ttWarm(){ const sc=GAME.scene, cam=GAME.camera, tmp=[]; const put=o=>{ const d=new THREE.Vector3(); cam.getWorldDirection(d); o.position.copy(cam.position).addScaledVector(d,6); sc.add(o); tmp.push(o); };
  try{ if(typeof modelsTick==='function') modelsTick(); }catch(e){}
  const keys=Object.keys(REAL.rb||{}).slice(0,2); for(const k of keys){ const m=THREE.SkeletonUtils.clone(REAL.rb[k].scene); put(m); }
  try{ GAME.renderer.compile(sc,cam); GAME.renderer.render(sc,cam); }catch(e){}
  for(const o of tmp) sc.remove(o); }
(function(){ const st=document.createElement('style'); st.textContent=`
#tt .menu button:first-of-type{background:#ffd24a;color:#111;text-shadow:none;animation:ttgo 1.6s ease-in-out infinite}
#tt .menu button:first-of-type small{color:#3a2c00}
@keyframes ttgo{50%{box-shadow:0 0 0 6px rgba(255,210,74,.35)}}`; document.head.appendChild(st); })();

(function(){ const st=document.createElement('style'); st.textContent=`
#tt .load,#tt .pct{display:none} #tt.loading .load,#tt.loading .pct{display:flex} #tt.loading .pct{display:block}
#tt.loading .menu,#tt.loading .help{display:none!important}
#tt.ready .press{font:400 min(5vw,40px) Anton,Impact,sans-serif;letter-spacing:.06em;color:#ffd24a;left:auto;right:4vw;top:calc(9vh + 22px);bottom:auto;text-align:right;-webkit-text-stroke:1px #000}`; document.head.appendChild(st); })();
