/* ===================== death and arrest screens =====================
   One big word (UBIJEN / UHIĆEN) in the style of the big open-world games, a plain sentence saying what happened
   (Upucala te policija, Sredili su te Crni Vukovi, Pao si s visine…), the failed mission on its own line underneath
   instead of a second banner on top, and the countdown. An arrest now plays out too: screen, fine, then the police station. */
(function(){ const st=document.createElement('style'); st.textContent=`
#deadscr::before{content:none!important}
#deadscr{background:radial-gradient(ellipse at center,rgba(0,0,0,.15) 20%,rgba(0,0,0,.7))!important;gap:0}
#deadscr .big{font:400 clamp(70px,13vw,170px)/1 Anton,Impact,sans-serif;color:#c3141f;-webkit-text-stroke:3px #0a0a0a;paint-order:stroke fill;letter-spacing:.04em;text-shadow:0 7px 0 rgba(0,0,0,.55);animation:wasted 1.1s ease-out}
#deadscr.busted .big{color:#2f6cf0}
#deadscr .who{font:700 clamp(18px,2.6vw,28px) Manrope,sans-serif!important;color:#fff!important;margin-top:14px!important;text-shadow:0 2px 6px #000}
#deadscr .mis{display:none;margin-top:16px;padding:6px 18px;background:rgba(0,0,0,.65);border-left:4px solid #ffd24a;font:800 13px Manrope,sans-serif;letter-spacing:.22em;color:#ffd24a}
#deadscr .mis.on{display:block}
#deadscr .t{margin-top:18px!important;font:600 14px Manrope,sans-serif!important;color:rgba(255,255,255,.75)!important;letter-spacing:.08em}
body:has(#deadscr.on) #banner{display:none}`; document.head.appendChild(st); })();
function wsEls(){ const el=document.getElementById('deadscr'); if(!el) return null; if(!el.querySelector('.big')){ const b=document.createElement('div'); b.className='big'; el.prepend(b); const m=document.createElement('div'); m.className='mis'; el.querySelector('.t').before(m); } return el; }
function wsCause(id){ if(id==='policija') return 'Upucala te policija'; if(id==='Crni Vukovi'||id==='banda') return 'Sredili su te Crni Vukovi'; if(id==='eksplozija') return 'Raznijela te eksplozija'; if(id==='pad') return 'Pao si s visine';
  const R=(typeof NET!=='undefined')&&NET.remotes&&NET.remotes.get(id); if(R&&R.name) return 'Ubio te '+R.name; return 'Podlegao si ozljedama'; }
function wsShow(kind,cause){ const el=wsEls(); if(!el) return; el.classList.toggle('busted',kind==='busted'); el.querySelector('.big').textContent=kind==='busted'?'UHIĆEN':'UBIJEN'; el.querySelector('.who').textContent=cause; el.querySelector('.mis').classList.remove('on'); el.classList.add('on'); }
// death: replace the "Srušio te netko" line with the real cause
{ const _td=takeDamage; takeDamage=function(d,fromId){ const was=COMBAT.dead; _td(d,fromId); if(!was&&COMBAT.dead){ wsShow('dead',wsCause(fromId)); if(WS.mis){ const m=document.querySelector('#deadscr .mis'); m.textContent='MISIJA NIJE USPJELA'; m.classList.add('on'); WS.mis=false; } } }; }
const WS={mis:false,busy:false};
// a mission that fails because you died or were arrested goes on the same screen, not as a banner over it
{ const _fm=failMission; failMission=function(why){ const dying=COMBAT.hp<=0||WS.busy; _fm(why); if(dying){ WS.mis=true; const m=document.querySelector('#deadscr .mis'); if(m&&document.getElementById('deadscr').classList.contains('on')){ m.textContent='MISIJA NIJE USPJELA'; m.classList.add('on'); WS.mis=false; } } }; }
// arrest: freeze, show UHIĆEN, then wake up outside the station
{ const _b=busted; busted=function(){ if(WS.busy) return; WS.busy=true; PLAYER.enabled=false; if(PLAYER.driving) try{ exitCar(); }catch(e){}
    wsShow('busted','Policija te odvela na postaju · kazna 100 €'); let n=4; const el=document.getElementById('deadscr'); const t=el.querySelector('.t'); t.textContent='Puštaju te za '+n+' s';
    if(GTA.mission){ try{ failMission('uhitila te policija'); }catch(e){} const m=el.querySelector('.mis'); m.textContent='MISIJA NIJE USPJELA'; m.classList.add('on'); WS.mis=false; }
    const iv=setInterval(()=>{ n--; t.textContent='Puštaju te za '+Math.max(0,n)+' s'; if(n===1&&typeof fadeBlack==='function') try{ fadeBlack(); }catch(e){} if(n<=0){ clearInterval(iv); _b(); el.classList.remove('on','busted'); PLAYER.enabled=!GAME.paused; WS.busy=false; } },1000); }; }
