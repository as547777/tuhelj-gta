/* ===================== missions with a beginning, a middle and an end =====================
   1) Every step shows WHERE to go: the yellow beam and the radar line now also point at the fire, the fire engine,
      the nearest car, the Vukovi you still have to deal with, the town hall… (before, only "go to X" steps had a target).
      A fire that starts on its own is marked the same way when you are not on a mission.
   2) The side missions are longer and tell a little story: a call in the middle, a twist, and a proper ending. */
function msNearest(list,get){ let best=null, bd=1e9; for(const o of list){ const p=get(o); if(!p) continue; const d=Math.hypot(p[0]-PLAYER.pos.x,p[1]-PLAYER.pos.z); if(d<bd){ bd=d; best=p; } } return best; }
function msCar(){ return msNearest((typeof DRIVE!=='undefined'?DRIVE:[]).filter(v=>!v.bike&&!v.truck&&!v.formula&&!v.heli&&!v.wreck),v=>[v.st.x,v.st.z]); }
function missionWhere(S){ if(S.where) return S.where(); const t=String(S.t||'');
  if(/požar|vatru/i.test(t)&&LIFE.fire) return [LIFE.fire.x,LIFE.fire.z];
  if(/vatrogasni kamion/i.test(t)){ const v=DRIVE.find(q=>q.truck); return v?[v.st.x,v.st.z]:null; }
  if(/formul/i.test(t)){ const v=DRIVE.find(q=>q.formula); return v?[v.st.x,v.st.z]:null; }
  if(/traktor/i.test(t)&&STORY.tractor) return [STORY.tractor.st.x,STORY.tractor.st.z];
  if(/bicikl/i.test(t)) return msNearest(DRIVE.filter(v=>v.bike),v=>[v.st.x,v.st.z]);
  if(/aute Crnih Vukova/i.test(t)) return msNearest((STORY.cars||[]).filter(C=>!C.wreck),C=>[C.st.x,C.st.z]);
  if(/Vukov|čuvar/i.test(t)) return msNearest(LAW.crew.filter(c=>c.kind==='thug'&&!c.A.dead),c=>[c.A.group.position.x,c.A.group.position.z]);
  if(/općin/i.test(t)&&LANDMARKS.townhall) return [LANDMARKS.townhall.x,LANDMARKS.townhall.z];
  if(/hitnu|Mirk/i.test(t)) return npcPos('Mirko');
  if(/ormar|kuću/i.test(t)&&typeof houseDoor==='function') return houseDoor()||null;
  if(/\bauto\b/i.test(t)&&!PLAYER.driving) return msCar();
  return null; }
// any mission step can show a live label (story steps already could)
{ const _mt=missionTick; missionTick=function(dt){ _mt(dt); const M=GTA.mission; if(!M||M.story) return; const S=M.steps[GTA.step]; if(S&&S.show){ const od=document.querySelector('#objective div'); if(od){ const base=od.textContent; const lab='CILJ: '+S.show(); if(!base.startsWith(lab)) od.textContent=lab+base.replace(/^CILJ: [^·]*/,' '); } } }; }
// a fire with no mission running: mark it too
const MS={fireWay:false};
function msTick(){ if(!GAME.started) return; if(GTA.mission){ MS.fireWay=false; return; } if(LIFE.fire){ setWay([LIFE.fire.x,LIFE.fire.z]); MS.fireWay=true; } else if(MS.fireWay){ setWay(null); MS.fireWay=false; } }
setInterval(()=>{ try{ msTick(); }catch(e){} },500);
const onFoot=()=>!PLAYER.driving&&!PLAYER.riding;
const DVD_POS=()=>LANDMARKS.fire?[LANDMARKS.fire.x,LANDMARKS.fire.z]:[-131,-19];
const MS_MISSIONS={
 pozar:{id:'pozar',giver:'Vatrogasac Krtek',title:'Gori u selu!',reward:450,
  intro:[['Vatrogasac Krtek','Uzbuna! Zvala je susjeda — dimi se iz krova, a dečki iz DVD-a su na poljima.'],['Vatrogasac Krtek','Sjedaj u kamion, ja ti javljam preko radija. Na karti ti je označeno gdje gori.']],
  steps:[{t:'Sjedni u vatrogasni kamion',ok:()=>PLAYER.driving&&PLAYER.driving.truck,onStart:()=>{ if(!LIFE.fire) startFire(); }},
    {t:'Vozi do požara',at:()=>LIFE.fire?[LIFE.fire.x,LIFE.fire.z]:null,r:30,car:true,onStart:()=>{ setTimeout(()=>{ try{ if(GTA.mission&&GTA.mission.id==='pozar') sayDialog([['Vatrogasac Krtek','(radio) Gori kuća kod '+(LIFE.fire?placeName(LIFE.fire.x,LIFE.fire.z):'sela')+'. Pazi na ljude na cesti!']]); }catch(e){} },2500); }},
    {t:'Ugasi požar (drži G / 💧)',ok:()=>!LIFE.fire,show:()=>'Ugasi požar ('+Math.round(LIFE.fire?LIFE.fire.hp:0)+' %)',onStart:()=>{ MS.fx=LIFE.fire?[LIFE.fire.x,LIFE.fire.z]:null; }},
    {t:'Izađi iz kamiona i provjeri kuću',ok:()=>onFoot()&&MS.fx&&Math.hypot(PLAYER.pos.x-MS.fx[0],PLAYER.pos.z-MS.fx[1])<14,where:()=>MS.fx,onDone:()=>{ sayDialog([['Baka Štefica','Joj, sinko, hvala Bogu! Mislila sam da bu sve izgorelo…'],['Baka Štefica','Mačka je još gore na tavanu… a ne, evo je, skočila je kroz prozor!'],['Vatrogasac Krtek','(radio) Bravo! Sad vrati kamion pred DVD, da bude spreman za drugi put.']]); }},
    {t:'Vrati kamion pred DVD',at:DVD_POS,r:12,car:true}],
  outro:[['Vatrogasac Krtek','E, to je to! Brzo, pametno, bez štete. Evo 450 eura od DVD-a Tuhelj.'],['Vatrogasac Krtek','Ak opet zagori, znaš gdje je kamion.']]},
 dostava:{id:'dostava',giver:'Lidija',title:'Dostava za Putnika',reward:320,
  intro:[['Lidija','Joj, nestalo nam je vina za gemišt, a dečki su žedni!'],['Lidija','Uzmi auto, pokupi kutiju vina kod trgovine i brzo je dovezi ovamo.']],
  steps:[{t:'Uđi u bilo koji auto',ok:()=>!!PLAYER.driving&&!PLAYER.driving.bike},
    {t:'Pokupi kutiju vina kod trgovine',at:SHOP_POS,r:7,car:true,onDone:()=>{ UI.toast('📦 Vino je u prtljažniku'); sayDialog([['Lidija','(mobitel) Čuj… a bi skoknul i do Pristave? Jožek ima domaći sir, Kenka ga stalno traži.'],['Lidija','Samo pazi kak voziš, vino je u staklu!']]); }},
    {t:'Pokupi sir na Pristavi',at:()=>[PRIST.H[0]+10,PRIST.H[1]-8],r:12,car:true,onDone:()=>{ UI.toast('🧀 Sir je u autu'); MS.t0=GAME.time; }},
    {t:'Dovezi sve pred kafić (3 min)',at:CAFE_POS,r:9,car:true,time:180},
    {t:'Odnesi vino i sir Lidiji',at:()=>npcPos('Lidija'),r:3,onStart:()=>UI.toast('Izađi iz auta i odnesi stvari unutra')}],
  outro:[['Lidija','Ti si zlato! I sir si se sjetil. Evo ti 320 eura.'],['Kenka','Sir! Živio! Lidija, daj rundu za našeg dostavljača!']]},
 taksi:{id:'taksi',giver:'Poljanec Martin',title:'Taksi za Martina',reward:220,
  intro:[['Poljanec Martin','Ajoj, noga me opet boli, a moram do crkve na misu.'],['Poljanec Martin','Bi me povezel? Pa me pričekaj, misa ne traje dugo — i onda doma.']],
  steps:[{t:'Dovezi auto do Martina',at:()=>npcPos('Poljanec Martin'),r:6,car:true,onDone:()=>{ GTA.pax='Poljanec Martin'; UI.toast('Martin je sjeo u auto'); }},
    {t:'Odvezi Martina do crkve',at:()=>LANDMARKS.churchDoor?[LANDMARKS.churchDoor.x,LANDMARKS.churchDoor.z]:null,r:10,car:true,onDone:()=>{ GTA.pax=null; sayDialog([['Poljanec Martin','Hvala, sinko. Čekaj me tu, bum brzo — kratka misa danas.']]); }},
    {t:'Pričekaj Martina',ok:()=>GTA.stepT>30,show:()=>'Pričekaj Martina (još '+Math.max(0,Math.ceil(30-GTA.stepT))+' s)',where:()=>LANDMARKS.churchDoor?[LANDMARKS.churchDoor.x,LANDMARKS.churchDoor.z]:null,onDone:()=>{ GTA.pax='Poljanec Martin'; sayDialog([['Poljanec Martin','Evo me! Župnik je danas pričal o dečkima koji se vraćaju iz Njemačke… mislim da je mislil na tebe!'],['Poljanec Martin','Ajmo doma, kraj ceste kod mene.']]); }},
    {t:'Odvezi Martina doma',at:()=>[-300,-20],r:9,car:true,onDone:()=>{ GTA.pax=null; }}],
  outro:[['Poljanec Martin','Hvala ti, sinko! Evo ti 220 eura za benzin. Bog te blagoslovil!']]},
 banda:{id:'banda',giver:'Šemso',title:'Banda Crni Vukovi',reward:420,
  intro:[['Šemso','Bježi! Crni Vukovi su me jurili po cijelom selu — vidjeli su da pričam s tobom!'],['Šemso','Sad su krenuli na tebe. Uzmi auto i odvuci ih od sela.']],
  steps:[{t:'Uđi u auto',ok:()=>!!PLAYER.driving&&!PLAYER.driving.bike},
    {t:'Pobjegni bandi (budi 150 m daleko 8 s)',escape:true,time:150,onStart:()=>spawnChaser('banda')},
    {t:'Vrati se Šemsi',at:()=>npcPos('Šemso'),r:8,onDone:()=>{ sayDialog([['Šemso','Uf, izgubili su te! Ali vidio sam kam su otišli — prema starom štaglju iza sela.']]); }}],
  outro:[['Šemso','Evo ti 420 eura. I pazi se, brate, Vukovi ne zaboravljaju.']]}};
// swap the old short versions for the longer ones (same giver, same id, so progress and markers stay)
for(const id in MS_MISSIONS){ const i=MISSIONS.findIndex(M=>M.id===id); if(i>=0) MISSIONS[i]=MS_MISSIONS[id]; }
