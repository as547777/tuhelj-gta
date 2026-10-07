/* ===================== priča: "Povratak u Tuhelj" (7 poglavlja) =====================
   Nakon deset godina u Njemačkoj vraćaš se u Tuhelj. Baka Ruža ti je ostavila stan, Kenka je dužan Crnim
   Vukovima, a netko u općini im drži leđa. Poglavlja se otključavaju redom (★ na karti), sporedne misije (!) uvijek. */
const STORY_LAST=10; // chapters 8–10 live in 58_story2.js
const STORY={ch:0,ward:false,pax:null,deskT:0,tags:new Set()};
try{ const s=+localStorage.getItem('tuhelj_story'); if(Number.isFinite(s)&&s>=0) STORY.ch=Math.min(10,s); }catch(e){}
function storySave(){ try{ localStorage.setItem('tuhelj_story',String(STORY.ch)); }catch(e){} }
function storyDone(n){ if(STORY.ch<n){ STORY.ch=n; storySave(); } }
const HIDE=[118,-26]; // Vukova jazbina — stari štagalj istočno iza sela
function hidePos(dx,dz){ return [HIDE[0]+dx,HIDE[1]+dz]; }
function npcA(n){ const N=npcByName(n); if(N) return N.A; const V=LIFE.villagers.find(v=>v.n===n); if(V) return V.A; const Q=GTA.peds.find(q=>q.A.name===n); return Q?Q.A:null; }
function storyGangCar(x,z){ const C=spawnChaser('banda'); C.st.x=x; C.st.z=z; C.st.yaw=Math.random()*TAU; C.wait=true; C.story=true; C.v.st=C.st; poseVehicle(C.v); return C; }
const STORY_M=[
 {id:'s1',story:1,giver:'Poljanec Martin',title:'1 · Povratak u Tuhelj',reward:150,
  intro:[['Poljanec Martin','Joj, pa to si ti! Deset let te nije bilo, a sad si došel iz Njemačke kak pravi gospon.'],['Poljanec Martin','Tvoja kuća nasuprot crkve te čeka — žuta, s balkonom. Sve sam ti pospremil dok te nije bilo.'],['Poljanec Martin','Presvuci se, odmori, a navečer svrati u brtiju. Kenka te traži, nekaj je zabrljal.']],
  steps:[{t:'Dođi do svoje kuće nasuprot crkve',at:()=>houseDoor()||HOME_POS(),r:3.5,onDone:()=>{ UI.toast('🏡 Doma si — ormar, krevet, tuš, TV'); }},
    {t:'Uđi u kuću i presvuci se u ormaru',ok:()=>STORY.ward},
    {t:'Idi u brtiju (Kafić Putniku) do Kenke',at:()=>npcPos('Kenka'),r:3.4}],
  outro:[['Kenka','E, pa evo našeg Nijemca! Sjedi, sjedi… Lidija, daj mu gemišt!'],['Kenka','Slušaj… dužan sam pet stotina eura Crnim Vukovima. Rekli su da mi zapale kuću ak ne platim do petka.'],['Kenka','Imam skrivene novce kod kapelice, al ja ne smijem voziti. Dođi sutra, molim te.']],
  done:()=>storyDone(1)},
 {id:'s2',story:2,giver:'Kenka',title:'2 · Kenkin dug',reward:300,
  intro:[['Kenka','Ajmo, dok nas Vukovi ne vide. Uzmi neki auto i pokupi me pred brtijom.'],['Kenka','Novce sam zakopal kod kapelice na brijegu. Samo brzo!']],
  steps:[{t:'Uđi u bilo koji auto',ok:()=>!!PLAYER.driving&&!PLAYER.driving.bike},
    {t:'Pokupi Kenku pred brtijom',at:CAFE_POS,r:8,car:true,onDone:()=>{ STORY.pax='Kenka'; UI.toast('Kenka je sjeo u auto'); }},
    {t:'Odvezi Kenku do kapelice',at:()=>LANDMARKS.chapel?[LANDMARKS.chapel.x,LANDMARKS.chapel.z]:[56,127],r:12,car:true,onDone:()=>{ sayDialog([['Kenka','Evo ih, sve je tu! Petsto eura…'],['Kenka','Joooj, eno crnog auta! Vukovi! Bježi, bježi!']]); }},
    {t:'Pobjegni Crnim Vukovima',escape:true,time:180,onStart:()=>{ spawnChaser('banda'); spawnChaser('banda'); }},
    {t:'Vrati Kenku u brtiju',at:CAFE_POS,r:8,car:true,onDone:()=>{ STORY.pax=null; }}],
  outro:[['Kenka','Uf… živ sam. Hvala ti, dečko. Ovo ti je od mene.'],['Jovo','A ovo od mene — moja stara sačmarica. S Vukovima ti bu trebala.']],
  done:()=>{ storyDone(2); armUnlock(5); }},
 {id:'s3',story:3,giver:'Lidija',title:'3 · Vukovi kod Strahinjčice',reward:350,
  intro:[['Lidija','Brzo! Zvala me kuma — Vukovi su prebili Mirka pred Strahinjčicom!'],['Lidija','Saznali su da si pomogao Kenki. Otjeraj ih prije nego ga ubiju!']],
  steps:[{t:'Brzo do Strahinjčice',at:()=>[-171,-5],r:30,onStart:()=>{ storyMirkoDown(); for(const [x,z] of [[-163,-13],[-178,1],[-158,3]]) spawnThug(x,z,{tag:'s3'}); }},
    {t:'Sredi Crne Vukove',ok:()=>thugsLeft('s3')===0,show:()=>'Sredi Crne Vukove ('+thugsLeft('s3')+' preostalo)'},
    {t:'Pričekaj hitnu pomoć kod Mirka',ok:()=>{ const A=npcA('Mirko'); return !A||!A.dead; },onStart:()=>{ const A=npcA('Mirko'); if(A&&A.deadPos) spawnAmbulance(A.deadPos.x,A.deadPos.z); }}],
  outro:[['Mirko','Joj… hvala ti. Rekli su da im šef ima prijatelje u općini…'],['Lidija','Bravo! Evo ti 350 eura — skupili smo u brtiji.']],
  done:()=>{ storyDone(3); clearThugs('s3'); }},
 {id:'s4',story:4,giver:'Vatrogasac Krtek',title:'4 · Vatra u selu',reward:400,
  intro:[['Vatrogasac Krtek','Uzbuna! Vukovi su zapalili štagalj — osveta za Strahinjčicu!'],['Vatrogasac Krtek','Fale mi ljudi. Sjedaj u kamion, ugasi vatru i vrati kamion pred DVD.']],
  steps:[{t:'Sjedni u vatrogasni kamion',ok:()=>PLAYER.driving&&PLAYER.driving.truck,onStart:()=>{ if(!LIFE.fire) startFire(); }},
    {t:'Ugasi požar (drži G / 💧)',ok:()=>!LIFE.fire},
    {t:'Vrati kamion pred DVD',at:()=>LANDMARKS.fire?[LANDMARKS.fire.x,LANDMARKS.fire.z]:null,r:12,car:true}],
  outro:[['Vatrogasac Krtek','Pravi si vatrogasac! Evo ti oprema — sad si naš, DVD Tuhelj.'],['Vatrogasac Krtek','I još nekaj… vidio sam crni auto kak stoji iza općine. Netko unutra im pomaže.']],
  done:()=>storyDone(4)},
 {id:'s5',story:5,giver:'Kiki Poljanec',title:'5 · Papiri iz općine',reward:450,
  intro:[['Kiki Poljanec','Bratić! Pišem članak o Vukovima, al mi fale dokazi.'],['Kiki Poljanec','U općini, na šalteru, stoje papiri o zemljištu iza sela. Uđi i uzmi ih — tiho.'],['Kiki Poljanec','Ak te vide, bježi. Policija ne smije znati da si to bil ti.']],
  steps:[{t:'Uđi u Općinu Tuhelj',ok:()=>INSIDE&&INSIDE.id==='opcina'},
    {t:'Uzmi papire sa šaltera (stani kraj šaltera)',ok:()=>{ if(INSIDE&&INSIDE.id==='opcina'){ const R=INSIDE.room; if(Math.hypot(PLAYER.pos.x-(R.x-1.2),PLAYER.pos.z-(R.z+0.6))<2.0) STORY.deskT+=1/60; } return STORY.deskT>2; },onStart:()=>{ STORY.deskT=0; }},
    {t:'Izađi iz općine',ok:()=>!INSIDE,onDone:()=>{ crimeEvent(PLAYER.pos.x,PLAYER.pos.z,3); UI.toast('🚨 Netko je pozvao policiju!'); }},
    {t:'Izgubi policiju',ok:()=>GTA.wanted===0&&GTA.stepT>3,time:300},
    {t:'Donesi papire Kikiju',at:()=>npcPos('Kiki Poljanec'),r:3.2}],
  outro:[['Kiki Poljanec','Ovo je to! Zemljište iza sela prepisano je na Vukova šefa — a potpisal je policajac Horvat!'],['Kiki Poljanec','Uzmi djedov snajper. I pazi se — sad znaju tko si.']],
  done:()=>{ storyDone(5); armUnlock(2); }},
 {id:'s6',story:6,giver:'Šemso',title:'6 · Ukradeni traktor',reward:500,
  intro:[['Šemso','Brate, Vukovi su mi ukrali traktor! Bez njega nema kukuruza, nema ničeg.'],['Šemso','Drže ga u starom štaglju iza sela, u svojoj jazbini. Čuva ga četvorica.']],
  steps:[{t:'Dođi do Vukove jazbine',at:()=>HIDE,r:45,onStart:()=>{ storyHideTractor(); for(const [dx,dz] of [[8,6],[-8,-6],[4,-12],[13,-4]]){ const p=hidePos(dx,dz); spawnThug(p[0],p[1],{tag:'s6'}); } }},
    {t:'Sredi čuvare',ok:()=>thugsLeft('s6')===0,show:()=>'Sredi čuvare ('+thugsLeft('s6')+' preostalo)'},
    {t:'Sjedni u Šemsin traktor',ok:()=>PLAYER.driving&&PLAYER.driving===STORY.tractor},
    {t:'Odvezi traktor Šemsi',at:()=>npcPos('Šemso'),r:12,car:true,onStart:()=>{ spawnChaser('banda'); }}],
  outro:[['Šemso','Moj traktor! Brate, nikad ti ovo neću zaboraviti.'],['Šemso','Uzmi ovo — djed je to čuval u štaglju još od rata. Bazuka. Za Vukove.']],
  done:()=>{ storyDone(6); armUnlock(3); clearThugs('s6'); }},
 {id:'s7',story:7,giver:'Jovo',title:'7 · Pad Crnih Vukova',reward:1000,
  intro:[['Jovo','Danas se Vukovi skupljaju u jazbini. Svi njihovi crni auti.'],['Jovo','Ja sam bil u ratu, sine. Znaš kaj treba. Bazuka, i gotovo.'],['Kenka','A onda slavlje u brtiji! Ja častim! …Ti plaćaš.']],
  steps:[{t:'Vozi do jazbine',at:()=>HIDE,r:110,onStart:()=>{ STORY.cars=[]; for(const [dx,dz] of [[10,8],[-10,6],[0,-14]]){ const p=hidePos(dx,dz); STORY.cars.push(storyGangCar(p[0],p[1])); } for(const [dx,dz] of [[16,0],[-14,-8]]){ const p=hidePos(dx,dz); spawnThug(p[0],p[1],{tag:'s7',wi:1}); } }},
    {t:'Uništi aute Crnih Vukova',ok:()=>(STORY.cars||[]).every(C=>C.wreck),show:()=>'Uništi aute Crnih Vukova ('+(STORY.cars||[]).filter(C=>!C.wreck).length+' preostalo)'},
    {t:'Slavlje u brtiji!',at:CAFE_POS,r:7}],
  outro:[['Kenka','Živio! Živio naš junak! Lidija, gemišt za sve!'],['Lidija','Tuhelj je opet naš. Hvala ti.'],['Jovo','Vukova više nema. Sad si pravi Tuheljčan.']],
  done:()=>{ storyDone(7); clearThugs('s7'); setTimeout(()=>banner('TUHELJ JE SLOBODAN','…ZASAD','#6fe08a'),3400); }}];
for(const M of STORY_M){ const last=M.steps[M.steps.length-1]; const od=last.onDone; last.onDone=()=>{ if(od) od(); try{ M.done(); }catch(e){ console.warn(e); } }; MISSIONS.push(M); }
function missionOpen(M){ if(!M.story) return true; return M.story===STORY.ch+1; }
function storyNext(){ return STORY_M.find(M=>M.story===STORY.ch+1)||null; }
/* ---- helpers for the chapters ---- */
function storyMirkoDown(){ const A=npcA('Mirko'); if(!A) return; const p=offRoad(-166,-9,1.5); A.dead=true; A.deadT=1e9; A.hp=0; A.deadPos=new THREE.Vector3(p[0],groundAt(p[0],p[1]),p[1]); A.deadYaw=0.6; }
function storyHideTractor(){ const v=DRIVE.filter(q=>q.tractor&&q!==PLAYER.driving).sort((a,b)=>Math.hypot(b.st.x-START.x,b.st.z-START.z)-Math.hypot(a.st.x-START.x,a.st.z-START.z))[0]; if(!v) return; const p=offRoad(...hidePos(-4,3),2); v.st.x=p[0]; v.st.z=p[1]; v.st.yaw=0.4; v.st.v=0; poseVehicle(v); STORY.tractor=v; }
/* ---- wire into the mission system ---- */
{ const _gn=giverNear; giverNear=function(){ if(GTA.mission||GTA.dlg||PLAYER.driving||PKC.sit) return null; const L=STORY_M.concat(MISSIONS.filter(M=>!M.story)); for(const M of L){ if(!missionOpen(M)) continue; const p=npcPos(M.giver); if(p&&nearPt(p,3.2)) return M; } return null; };
  const _gm=giverMarks; giverMarks=function(){ _gm(); for(const M of MISSIONS){ const mk=GTA.marks&&GTA.marks.get(M.id); if(!mk) continue; if(M.story&&!mk.userData.star){ mk.userData.star=true; const c=cvs(128,128), g=c.getContext('2d'); g.fillStyle='#ff8a2a'; g.beginPath(); g.arc(64,64,58,0,TAU); g.fill(); g.strokeStyle='#161616'; g.lineWidth=6; g.stroke(); g.fillStyle='#161616'; g.font='900 78px Manrope, Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('★',64,68); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; mk.material.map=t; mk.material.needsUpdate=true; mk.scale.set(0.75,0.75,1); }
      if(!missionOpen(M)||(!M.story&&STORY_M.some(S=>S.giver===M.giver&&missionOpen(S)))) mk.visible=false; else if(M.story&&mk.visible) mk.position.y+=Math.sin(GAME.time*3)*0.004; } };
  const _fm=failMission; failMission=function(why){ const M=GTA.mission; _fm(why); STORY.pax=null; if(M&&M.story){ clearThugs(M.id); if(M.id==='s3'){ const A=npcA('Mirko'); if(A&&A.dead){ A.deadT=0.0001; } } for(const C of GTA.chasers) if(C.story){ C.leave=true; C.wait=false; if(C.wreck) C.gone=true; } } };
  offersTick=function(dt){ OW.offerT=(OW.offerT||40)-dt; if(OW.offerT>0) return; OW.offerT=110+Math.random()*90; if(GTA.mission) return; const nx=storyNext(); if(nx&&Math.random()<0.6){ sendMsg(nx.giver,'Trebam te. Dođi čim možeš — '+nx.title.replace(/^\d · /,''),nx.id); return; } const pool=MISSIONS.filter(M=>!M.story); const avail=pool.filter(M=>!GTA.done[M.id]); const L=avail.length?avail:pool; const M=L[Math.floor(Math.random()*L.length)]; sendMsg(M.giver,'Ej, možeš mi pomoći? — '+M.title,M.id); };
  const _ow=openWardrobe; openWardrobe=function(){ STORY.ward=true; _ow(); }; }
/* ---- passenger visible in the car, speaker framing, cinematic bars, story hint ---- */
function storyTick(dt){ if(!GAME.started) return;
  if(!STORY.prolog&&STORY.ch===0&&GAME.time>2.5&&!GTA.mission&&!GTA.dlg){ STORY.prolog=true; sayDialog([['Tuhelj','Deset godina u Njemačkoj. Sad si opet doma, u Hrvatskom zagorju.'],['Tuhelj','Stric Martin te čeka kraj ceste. Potraži narančastu zvjezdicu ★ na karti.']]); }
  // Kenka rides along
  const N=STORY.pax?npcByName(STORY.pax):null; if(STORY.paxN&&STORY.paxN!==N){ const d=STORY.paxN.d; STORY.paxN.A.group.position.set(d.x,d.y,d.z); STORY.paxN.A.group.rotation.set(0,d.face,0); STORY.paxN=null; }
  if(N){ const v=PLAYER.driving; if(v&&!v.bike){ const p=new THREE.Vector3(-0.28,v.seatY!==undefined?v.seatY:-0.33,0.38); v.group.updateMatrixWorld(); v.group.localToWorld(p); N.A.group.position.copy(p); N.A.group.rotation.set(0,v.st.yaw,0); N.A.seatT=GAME.time; N.A.group.visible=true; STORY.paxN=N; } }
  // dialogue: bars + face the speaker
  const cine=!!GTA.dlg; if(document.body.classList.contains('cine')!==cine) document.body.classList.toggle('cine',cine);
  if(cine&&!PLAYER.driving){ const who=GTA.dlg.lines[GTA.dlg.i]&&GTA.dlg.lines[GTA.dlg.i][0]; const q=who&&npcPos(who); if(q){ const want=faceYaw(q[0]-PLAYER.pos.x,q[1]-PLAYER.pos.z); TPS.face=angLerp(TPS.face,want,Math.min(1,dt*5)); PLAYER.yaw=angLerp(PLAYER.yaw,want-0.45,Math.min(1,dt*2)); PLAYER.pitch+=(-0.12-PLAYER.pitch)*Math.min(1,dt*2); } }
  // HUD hint: what the story wants next
  let el=document.getElementById('storyhint'); if(!el){ el=document.createElement('div'); el.id='storyhint'; document.body.appendChild(el); const st=document.createElement('style'); st.textContent='#storyhint{position:fixed;right:calc(20px + env(safe-area-inset-right,0px));top:calc(270px + env(safe-area-inset-top,0px));max-width:280px;background:rgba(10,12,10,.62);border-left:4px solid #ff8a2a;border-radius:10px;padding:7px 12px;color:#f5f1e8;font:600 12.5px Manrope,system-ui,sans-serif;z-index:14;pointer-events:none;display:none}#storyhint b{display:block;color:#ff8a2a;font-weight:900;font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:2px}body.cine::before,body.cine::after{content:"";position:fixed;left:0;right:0;height:9vh;background:#000;z-index:44;pointer-events:none;animation:cinebar .4s ease-out}body.cine::before{top:0}body.cine::after{bottom:0}@keyframes cinebar{from{height:0}}body.cine #hudpanel,body.cine #wbox,body.cine #mini,body.cine #storyhint,body.cine #objcard{opacity:0;transition:opacity .3s}@media (max-height:520px){#storyhint{top:calc(200px + env(safe-area-inset-top,0px));max-width:220px}}'; document.head.appendChild(st); }
  // the next chapter arrives as an SMS on the phone (P), not as a card on screen
  el.style.display='none'; const nx=storyNext();
  if(nx&&STORY.msgCh!==nx.story&&GAME.time>7&&!OW.msgs.some(m=>m.mid===nx.id)&&!GTA.mission&&!GTA.dlg){ STORY.msgCh=nx.story; const q=npcPos(nx.giver); const where=q?(' — '+placeName(q[0],q[1])):''; sendMsg(nx.giver,(STORY_SMS[nx.story]||'Trebam te, dođi.')+where,nx.id); } }
const STORY_SMS={1:'Dečko, dobro došel doma! Čekam te kraj ceste kod Pristave, dođi do mene.',2:'Ej, Kenka tu. Dođi u brtiju, trebam pomoć oko onog duga.',3:'Hitno! Vukovi napadaju Mirka kod Strahinjčice! Dođi u kafić.',4:'Gori! Trebam te u vatrogasnom domu, odmah!',5:'Bratić, imam nešto za tebe. Nađimo se kod kafića.',6:'Brate, ukrali su mi traktor! Dođi do mene.',7:'Večeras ih sredimo. Čekam te u brtiji. — Jovo'};
// mission steps may supply a live label
{ const _mt=missionTick; missionTick=function(dt){ _mt(dt); const M=GTA.mission; if(!M||!M.story) return; const S=M.steps[GTA.step]; if(S&&S.show){ const od=document.querySelector('#objective div'); if(od){ const base=od.textContent; const lab='CILJ: '+S.show(); if(!base.startsWith(lab)) od.textContent=lab+base.replace(/^CILJ: [^·]*/,' '); } } }; }
