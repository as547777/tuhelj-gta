/* ===================== story, part two: chapters 8–10 and cinematic intros =====================
   8 · Gost iz Stuttgarta — a black car with Stuttgart plates asks around for you: tail it without being seen.
   9 · Dug iz Njemačke — Dragan, the man you owed money to in Germany, wants 5 000 €; his men wait at the chapel.
  10 · Pravi šef — the papers from chapter 5 and Dragan's phone point to policajac Horvat: he runs from you.
   Before every story chapter the intro plays like a cut-scene: letterbox bars and a slow camera move round the
   two people talking. */
STORY_SMS[8]='Ej, neki tip u crnom autu sa stuttgartskim tablicama pita za tebe po selu. Dođi u brtiju. — Kenka';
STORY_SMS[9]='Onaj Švabo ti je ostavil poruku za šankom. Nije dobro, sine. Dođi. — Jovo';
STORY_SMS[10]='Bratić, pogledala sam Draganov mobitel. Znam tko je pravi šef. Nađimo se. — Kiki';
const S2={tail:null,tailT:0,lost:0};
function s2Road(x,z,r){ const n=nearestRoad(x,z,r||160); return n?[n.s.x,n.s.z]:[x,z]; }
// a car that drives to a point on its own (not a chaser): used for the car you have to tail
function s2Car(kind,x,z,to){ const C=makeAI(kind); C.st.x=x; C.st.z=z; C.st.yaw=faceYaw(to[0]-x,to[1]-z); C.to=to; C.v.st=C.st; poseVehicle(C.v); return C; }
function s2Tick(dt){ const C=S2.tail; if(!C) return; const w=routeTo(C,C.to[0],C.to[1],dt); const d=Math.hypot(C.to[0]-C.st.x,C.to[1]-C.st.z); const pd=Math.hypot(C.st.x-PLAYER.pos.x,C.st.z-PLAYER.pos.z);
  // it waits for you if you fall far behind, speeds up if you sit right on its bumper
  const sp=d<10?0:pd>110?4:pd<14?20:13; driveAI(C,w[0],w[1],sp,dt); C.arrived=d<12; }
function s2Remove(){ if(S2.tail){ GAME.scene.remove(S2.tail.v.group); S2.tail=null; } }
const STORY2=[
 {id:'s8',story:8,giver:'Kenka',title:'8 · Gost iz Stuttgarta',reward:800,
  intro:[['Kenka','Slušaj… neki tip u crnom autu sa stuttgartskim tablicama pital je za tebe. Rekal je da mu duguješ.'],['Kenka','Sad je parkiran pred općinom. Prati ga, al ne preblizu — da vidimo kam ide.'],['Kenka','I nemoj mu pucati u gume, dečko. Prvo saznaj tko je.']],
  steps:[{t:'Sjedni u auto',ok:()=>!!PLAYER.driving&&!PLAYER.driving.bike},
    {t:'Dođi do općine',at:()=>LANDMARKS.townhall?[LANDMARKS.townhall.x,LANDMARKS.townhall.z]:[-294,-55],r:45,car:true,onStart:()=>{ const a=s2Road(-286,-48,40), to=s2Road(330,-60,260); S2.tail=s2Car('banda',a[0],a[1],to); S2.tail.v.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.color&&o.material===S2.tail.v.paint) o.material.color.set('#0e0f12'); }); }},
    {t:'Prati crni auto (ne bliže od 15 m, ne dalje od 120 m)',where:()=>S2.tail?[S2.tail.st.x,S2.tail.st.z]:null,onStart:()=>{ S2.tailT=0; S2.lost=0; },
     ok:()=>{ const C=S2.tail; if(!C) return true; const d=Math.hypot(C.st.x-PLAYER.pos.x,C.st.z-PLAYER.pos.z); if(d>120||d<15) S2.lost+=1/60; else S2.lost=Math.max(0,S2.lost-1/120); if(S2.lost>6){ failMission(d<15?'primijetio te':'izgubio si ga'); s2Remove(); return false; } return C.arrived; },
     show:()=>{ const C=S2.tail; const d=C?Math.round(Math.hypot(C.st.x-PLAYER.pos.x,C.st.z-PLAYER.pos.z)):0; return 'Prati crni auto · '+d+' m'+(S2.lost>1?(d<15?' · PREBLIZU!':' · PREDALEKO!'):''); },
     onDone:()=>{ sayDialog([['Ti','Stao je kod Terma… i telefonira.'],['Nepoznati','(na telefonu) Ja, ja… našao sam ga. Dragan je rekao: pet tisuća, ili ide u jamu.'],['Ti','Dragan. Iz Stuttgarta. Mislio sam da je to gotovo.']]); }},
    {t:'Vrati se Kenki u brtiju',at:()=>npcPos('Kenka'),r:3.4,onStart:()=>{ setTimeout(s2Remove,8000); }}],
  outro:[['Kenka','Dragan? Onaj kojem si radil na bauštelama? Kaj ti on hoće?'],['Ti','Posudil sam od njega kad sam ostal bez posla. Vratil sam mu sve… al on misli da nisam.'],['Kenka','E pa, ovdje si doma. Nismo sami.']],
  done:()=>storyDone(8)},
 {id:'s9',story:9,giver:'Jovo',title:'9 · Dug iz Njemačke',reward:1200,
  intro:[['Jovo','Ostavil ti je ceduljicu: „Kapelica, ponoć. Donesi pet tisuća. — D."'],['Jovo','Ja ti velim: ne nosi novce. Nosi pušku. Ja ću biti u blizini.']],
  steps:[{t:'Dođi do kapelice na brijegu',at:()=>LANDMARKS.chapel?[LANDMARKS.chapel.x,LANDMARKS.chapel.z]:[56,127],r:40,onStart:()=>{ STORY.cars=[]; const c=LANDMARKS.chapel||{x:56,z:127}; for(const [dx,dz] of [[9,6],[-8,8],[3,-11]]) spawnThug(c.x+dx,c.z+dz,{tag:'s9',hp:90}); STORY.cars.push(storyGangCar(c.x+14,c.z-4)); }},
    {t:'Sredi Draganove ljude',ok:()=>thugsLeft('s9')===0,show:()=>'Sredi Draganove ljude ('+thugsLeft('s9')+' preostalo)'},
    {t:'Dragan bježi — uništi njegov auto',ok:()=>(STORY.cars||[]).every(C=>C.wreck),onStart:()=>{ for(const C of STORY.cars||[]){ C.wait=false; } sayDialog([['Dragan','Ti si lud! Ovo nije gotovo!']]); },where:()=>{ const C=(STORY.cars||[]).find(c=>!c.wreck); return C?[C.st.x,C.st.z]:null; }},
    {t:'Uzmi Draganov mobitel iz olupine',at:()=>{ const C=(STORY.cars||[])[0]; return C?[C.st.x,C.st.z]:null; },r:4,onDone:()=>{ UI.toast('📱 Imaš Draganov mobitel'); }},
    {t:'Odnesi mobitel Kikiju',at:()=>npcPos('Kiki Poljanec'),r:3.4}],
  outro:[['Kiki Poljanec','Daj da vidim… Poruke… „H." … Uplate… Ovo je isti broj s onih papira iz općine!'],['Jovo','Znači netko odavde je zval Švabu na tebe. Netko kome si smetal.'],['Kiki Poljanec','Daj mi dan-dva. Saznat ću tko je „H.".']],
  done:()=>{ storyDone(9); clearThugs('s9'); }},
 {id:'s10',story:10,giver:'Kiki Poljanec',title:'10 · Pravi šef',reward:3000,
  intro:[['Kiki Poljanec','„H." je Horvat. Policajac. On je potpisal zemljište Vukovima, on je zval Dragana.'],['Kiki Poljanec','Sad zna da znamo. Upravo je sjel u službeni auto i bježi prema Klanjcu!'],['Kiki Poljanec','Zaustavi ga. Ja zovem novinare i županijsku policiju.']],
  steps:[{t:'Sjedni u auto',ok:()=>!!PLAYER.driving&&!PLAYER.driving.bike,onStart:()=>{ const p=s2Road(PLAYER.pos.x+90,PLAYER.pos.z+40,120); const C=makeAI('policija'); C.kind='banda'; C.story=true; C.st.x=p[0]; C.st.z=p[1]; C.st.yaw=0; C.v.st=C.st; poseVehicle(C.v); C.hp=180; GTA.chasers.push(C); STORY.cars=[C]; }},
    {t:'Uništi Horvatov auto',ok:()=>(STORY.cars||[]).every(C=>C.wreck),where:()=>{ const C=(STORY.cars||[]).find(c=>!c.wreck); return C?[C.st.x,C.st.z]:null; },onStart:()=>{ crimeEvent(PLAYER.pos.x,PLAYER.pos.z,2); }},
    {t:'Horvat bježi pješke — sredi njegove ljude',ok:()=>thugsLeft('s10')===0,onStart:()=>{ const C=(STORY.cars||[])[0]; const q=C?[C.st.x,C.st.z]:[PLAYER.pos.x,PLAYER.pos.z]; for(const [dx,dz] of [[8,5],[-7,6],[5,-9],[-9,-5]]) spawnThug(q[0]+dx,q[1]+dz,{tag:'s10',hp:100}); },show:()=>'Sredi Horvatove ljude ('+thugsLeft('s10')+' preostalo)'},
    {t:'Izgubi policiju',ok:()=>GTA.wanted===0&&GTA.stepT>3,time:300},
    {t:'Slavlje u brtiji',at:CAFE_POS,r:7}],
  outro:[['Kiki Poljanec','Gotovo je! Županijska je uhitila Horvata na izlazu iz sela. Sve je u novinama!'],['Kenka','Naš Nijemac! Pa ti si heroj, dečko!'],['Lidija','Ovo piće je od kuće. I sljedeće. I ono iza.'],['Jovo','Sad si stvarno doma.']],
  done:()=>{ storyDone(10); clearThugs('s10'); setTimeout(()=>banner('KRAJ PRIČE','HVALA ŠTO SI IGRAO · TUHELJ JE TVOJ','#6fe08a'),3400); }}];
for(const M of STORY2){ const last=M.steps[M.steps.length-1]; const od=last.onDone; last.onDone=()=>{ if(od) od(); try{ M.done(); }catch(e){ console.warn(e); } }; STORY_M.push(M); MISSIONS.push(M); }
{ const _fm=failMission; failMission=function(why){ const M=GTA.mission; _fm(why); if(M&&M.id==='s8') s2Remove(); if(M&&(M.id==='s9'||M.id==='s10')) clearThugs(M.id); }; }
/* ---- cut-scene intros ---- */
const CINE={on:false,t:0,a:0};
{ const _sm=startMission; startMission=function(M){ if(M&&M.story){ CINE.on=true; CINE.t=0; CINE.who=M.giver; CINE.a=PLAYER.yaw+Math.PI*0.6; } _sm(M); }; }
{ const _ac=applyCamera; applyCamera=function(cam){ if(CINE.on&&(!GTA.dlg||(typeof talkMoving==='function'&&talkMoving()))) CINE.on=false; if(!CINE.on||window.CAMO||PLAYER.driving) return _ac(cam);
    const q=npcPos(CINE.who)||[PLAYER.pos.x+1,PLAYER.pos.z]; const mx=(q[0]+PLAYER.pos.x)/2, mz=(q[1]+PLAYER.pos.z)/2; const y=PLAYER.pos.y+1.55; const a=CINE.a+CINE.t*0.06; const r=3.6+Math.hypot(q[0]-PLAYER.pos.x,q[1]-PLAYER.pos.z)*0.5;
    const cx=mx+Math.sin(a)*r, cz=mz+Math.cos(a)*r; const p=new THREE.Vector3(cx,y+0.25,cz); if(typeof tpsFree==='function'){ const piv=new THREE.Vector3(mx,y,mz); const f=tpsFree(piv,p); p.lerpVectors(piv,p,Math.max(0.35,f)); }
    cam.position.copy(p); cam.lookAt(mx,y-0.05,mz); }; }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); if(CINE.on) CINE.t+=dt; try{ s2Tick(dt); }catch(e){} }; }
