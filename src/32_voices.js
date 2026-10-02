/* ===================== voices: subtitles that play by themselves, people who talk, drivers in cars =====================
   Dialogue runs like GTA subtitles (E / click only skips). Villagers greet you and react to guns and police,
   officers shout, you say a word now and then. If the browser has a Croatian voice (e.g. Microsoft Matej), lines are spoken too.
   Every traffic car has a driver (sometimes a passenger); gang cars are driven by Crni Vukovi. */
const VOX={t:0,lastSay:new WeakMap(),meT:0,tts:null,ttsOn:true,drv:[]};
try{ if(localStorage.getItem('tuhelj_tts')==='0') VOX.ttsOn=false; }catch(e){}
function ttsVoice(){ if(VOX.tts!==null) return VOX.tts; try{ const vs=speechSynthesis.getVoices(); if(!vs.length) return null; VOX.tts=vs.find(v=>/^hr/i.test(v.lang))||vs.find(v=>/^(sr|bs|sl)/i.test(v.lang))||false; }catch(e){ VOX.tts=false; } return VOX.tts; }
function speak(text,who){ if(!VOX.ttsOn||OW.muted) return; const v=ttsVoice(); if(!v) return; try{ const u=new SpeechSynthesisUtterance(String(text).replace(/[*★…]/g,'')); u.voice=v; u.lang=v.lang; u.rate=1.06; const h=hashN(who||'x'); u.pitch=/a$/i.test(String(who||'').split(' ')[0])&&!MALE_W.has(String(who).split(' ')[0])?1.25:0.8+(h%5)*0.06; u.volume=0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){} }
/* ---- dialogue as subtitles ---- */
{ const st=document.createElement('style'); st.textContent='#dlg{background:transparent!important;border:0!important;text-align:center;bottom:calc(9vh + 14px)!important;cursor:default;pointer-events:auto}#dlg .who{display:inline;color:#ffd24a;font-size:19px;text-shadow:0 2px 3px #000,0 0 8px rgba(0,0,0,.8)}#dlg .who::after{content:": "}#dlg .txt{display:inline;font-size:21px;line-height:1.4;text-shadow:0 2px 3px #000,0 0 10px rgba(0,0,0,.85)}#dlg .nx{opacity:.55;text-shadow:0 1px 2px #000}#deadscr{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 30%,rgba(0,0,0,.55))!important}#deadscr::before{content:"UMRO SI";font-family:Anton,Impact,sans-serif;font-size:clamp(72px,12vw,150px);line-height:1;color:#b3121c;-webkit-text-stroke:3px #0a0a0a;paint-order:stroke fill;letter-spacing:.03em;text-shadow:0 6px 0 rgba(0,0,0,.5);animation:wasted 1.2s ease-out}@keyframes wasted{from{transform:scale(1.6);opacity:0}to{transform:none;opacity:1}}#deadscr .who{font-size:26px!important;margin-top:8px}'; document.head.appendChild(st); }
{ const _show=showDlg; showDlg=function(){ _show(); const D=GTA.dlg; if(!D) return; const [who,txt]=D.lines[D.i]; D.t=0; D.dur=1.8+String(txt).length*0.058; const nx=document.querySelector('#dlg .nx'); if(nx) nx.textContent=GAME.touch?'dodir — preskoči':'E — preskoči'; if(who!=='Tuhelj') speak(txt,who); }; }
function dlgTick(dt){ const D=GTA.dlg; if(!D) return; D.t=(D.t||0)+dt; if(D.t>=(D.dur||4)) nextDlg(); const bar=document.getElementById('dlgbar'); if(bar) bar.style.width=Math.min(100,D.t/(D.dur||4)*100)+'%'; }
/* ---- ambient lines ---- */
const SAY={hi:['Bog!','Dobar dan!','Kaj ima?','Bok, susede!','Kak si?','Pozdrav!','Dobro jutro!'],eve:['Dobra večer!','Laku noć!','Ideš u brtiju?'],back:['Vidiš ga, Nijemac se vratil!','Jesi se navikel na domaće?','Pozdravi starog!','Dugo te nije bilo!'],
  gun:['Spremi tu pušku!','Joj, nemoj pucati!','Ti si lud!','Kaj delaš s tim?!','Pomoć!'],wanted:['Eno ga, policija ga traži!','Bježi, murja dolazi!','Ja ništ nisam vidil…'],drunk:['Opet si pil, a?','Polako, polako…'],
  cop:['Stoj! Policija!','Ruke gore!','Baci oružje!','Na pod!','Ne miči se!'],copLost:['Gdje je nestal?','Pretražite okolicu!'],
  me:{car:['Ajmo!','Idemo.','Kam sad?'],wanted:['Joj, murja!','Moram se skriti.','Ajme meni…'],lost:['Izgubio sam ih.','Uf, za dlaku.'],shoot:['Ajde!','Na!','Evo vam!'],hurt:['Au!','Joj!'],home:['Doma je najlepše.']}};
function pickL(a){ return a[Math.floor(Math.random()*a.length)]; }
function personSay(A,text,dur,who){ try{ bubble(A,text,dur||2.6); }catch(e){} if(who&&Math.hypot(A.group.position.x-PLAYER.pos.x,A.group.position.z-PLAYER.pos.z)<14) speak(text,who); VOX.lastSay.set(A,GAME.time); }
function meSay(text){ if(!ME_AV||GAME.time-VOX.meT<5) return; VOX.meT=GAME.time; try{ bubble(ME_AV,text,2.2); if(ME_AV.bub) ME_AV.bub.visible=true; }catch(e){} }
function voicesTick(dt){ if(!GAME.started) return; dlgTick(dt); VOX.t-=dt;
  // villagers near you
  if(VOX.t<=0&&!GTA.dlg){ VOX.t=1.2; let best=null, bd=7; for(const P of allPeople()){ const A=P.A; if(A.dead||!A.group.visible||P.crew) continue; const d=Math.hypot(A.group.position.x-PLAYER.pos.x,A.group.position.z-PLAYER.pos.z); if(d<bd&&GAME.time-(VOX.lastSay.get(A)||-99)>40){ bd=d; best=P; } }
    if(best&&!PLAYER.driving){ const ctx=COMBAT.armed?SAY.gun:GTA.wanted?SAY.wanted:COMBAT.bac>0.4?SAY.drunk:(SKY.night>0.5?SAY.eve:(Math.random()<0.3&&STORY.ch<3?SAY.back:SAY.hi)); personSay(best.A,pickL(ctx),2.8,best.n); if(ctx===SAY.hi&&Math.random()<0.5) setTimeout(()=>meSay(pickL(['Bog!','Pozdrav!','Dobar dan!'])),900); } }
  // officers shout when they get out / while they chase
  for(const c of LAW.crew){ if(c.kind!=='cop'||!c.out||c.A.dead) continue; if(!c.shout||GAME.time-c.shout>7+Math.random()*4){ c.shout=GAME.time; personSay(c.A,pickL(COP.state==='SEARCH'?SAY.copLost:SAY.cop),2.2,'Policajac'); } }
  // your own lines
  if(GTA.wanted>0&&!VOX.w){ VOX.w=true; meSay(pickL(SAY.me.wanted)); } if(GTA.wanted===0&&VOX.w){ VOX.w=false; if(!COMBAT.dead) meSay(pickL(SAY.me.lost)); }
  if(PLAYER.driving&&!VOX.car){ VOX.car=true; if(Math.random()<0.4) meSay(pickL(SAY.me.car)); } if(!PLAYER.driving) VOX.car=false;
  if(COMBAT.hp<VOX.hp-15&&!COMBAT.dead) meSay(pickL(SAY.me.hurt)); VOX.hp=COMBAT.hp;
  driversTick(); storyAutoStart(); }
/* ---- story missions start when you walk up to the ★ (no key needed) ---- */
function storyAutoStart(){ if(GTA.mission||GTA.dlg||PLAYER.driving||COMBAT.dead||COMBAT.menuOpen) return; const M=storyNext(); if(!M) return; const p=npcPos(M.giver); if(!p) return; const d=Math.hypot(p[0]-PLAYER.pos.x,p[1]-PLAYER.pos.z);
  if(d<2.6&&!VOX.autoBlock){ VOX.autoBlock=true; startMission(M); } if(d>6) VOX.autoBlock=false; }
/* ---- drivers and passengers ---- */
const DRV_KEYS=['Male_Adult_02','Female_Adult_01','Male_Adult_08','Female_Adult_04','Male_Adult_16','Male_Adult_05','Female_Adult_13','Male_Adult_06'];
function seatPerson(name,key){ const A=makePerson(name,'#555'); A.rbKey=key; A.female=/Female/.test(key); if(A.sprite) A.sprite.visible=false; GAME.scene.add(A.group); EXTRA_PEOPLE.push(A); return A; }
function driversTick(){ let i=0;
  const place=(A,v,k)=>{ const S=[[-0.28,-0.38],[-0.28,0.38]]; const p=new THREE.Vector3(S[k][0],v.seatY!==undefined?v.seatY:-0.33,S[k][1]); v.group.updateMatrixWorld(); v.group.localToWorld(p); A.group.position.copy(p); A.group.rotation.set(0,v.st.yaw,0); A.seatT=GAME.time; A.legL.rotation.x=A.legR.rotation.x=-1.45; A.armL.rotation.x=A.armR.rotation.x=k?-0.6:-1.25; };
  for(const T of GTA.traffic){ if(!T.drv){ T.drv=seatPerson('Vozač',DRV_KEYS[(i*3)%DRV_KEYS.length]); if(i%3===1) T.pas=seatPerson('Suvozač',DRV_KEYS[(i*5+1)%DRV_KEYS.length]); } i++;
    const dead=T.wreck||T.burnT>0; T.drv.group.visible=!dead; if(T.pas) T.pas.group.visible=!dead; if(dead) continue; place(T.drv,T.v,0); if(T.pas) place(T.pas,T.v,1); }
  for(const C of GTA.chasers){ if(C.kind!=='banda') continue; if(!C.drv){ C.drv=seatPerson('Vuk','Male_Adult_05'); C.drv.noCrime=true; } const dead=C.wreck||C.burnT>0; C.drv.group.visible=!dead; if(!dead) place(C.drv,C.v,0); }
  // drivers of removed gang cars
  for(let k=EXTRA_PEOPLE.length-1;k>=0;k--){ const A=EXTRA_PEOPLE[k]; if(A.name!=='Vuk'||A.noRevive) continue; if(!GTA.chasers.some(C=>C.drv===A)){ GAME.scene.remove(A.group); if(A.real) detachReal(A); EXTRA_PEOPLE.splice(k,1); } } }
