/* ===================== pause menu in the style of the big open-world games =====================
   Full-screen dark overlay, TUHELJ header with the clock and cash, tab bar (IGRA · KARTA · POSTAVKE · KONTROLE),
   big list of actions on the left and an info / settings panel on the right. The original buttons are re-used by id. */
(function(){ const st=document.createElement('style'); st.textContent=`
#pause{z-index:90!important;background:linear-gradient(180deg,rgba(6,8,10,.94),rgba(6,8,10,.82))!important;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
#pause .sheet{all:unset;position:absolute;inset:0;display:flex;flex-direction:column;padding:calc(26px + env(safe-area-inset-top,0px)) 5vw 26px;color:#fff;font-family:Manrope,sans-serif;box-sizing:border-box}
#pause .sheet>*:not(.pm){display:none!important}
.pm{display:flex;flex-direction:column;height:100%}
.pm .hd{display:flex;align-items:flex-end;gap:24px;border-bottom:2px solid rgba(255,255,255,.18);padding-bottom:12px}
.pm .hd b{font:400 54px Anton,Impact,sans-serif;letter-spacing:.02em;line-height:.9} .pm .hd i{font-style:normal;margin-left:auto;font:400 30px Anton,Impact,sans-serif;color:#8fe07a} .pm .hd em{font-style:normal;font:700 14px Manrope,sans-serif;color:rgba(255,255,255,.65);letter-spacing:.15em}
.pm .tabs{display:flex;gap:4px;margin:14px 0 22px;flex-wrap:wrap} .pm .tabs span{cursor:pointer;font:400 22px Anton,Impact,sans-serif;letter-spacing:.06em;padding:8px 22px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.7)} .pm .tabs span.on{background:#f4f1ea;color:#111}
.pm .body{flex:1;display:flex;gap:4vw;min-height:0} .pm .list{display:flex;flex-direction:column;gap:6px;min-width:min(360px,46vw)}
.pm .list button{all:unset;cursor:pointer;font:400 30px Anton,Impact,sans-serif;letter-spacing:.03em;padding:8px 20px;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,0));color:#fff}
.pm .list button:hover,.pm .list button.sel{background:#f4f1ea;color:#111}
.pm .panel{flex:1;background:rgba(255,255,255,.05);padding:22px 26px;overflow:auto;font-size:15px;line-height:1.9;color:rgba(255,255,255,.85)}
.pm .panel h4{margin:0 0 10px;font:400 26px Anton,Impact,sans-serif;letter-spacing:.04em;color:#fff} .pm .panel kbd{background:#f4f1ea;color:#111;border-radius:3px;padding:1px 7px;font:800 12px Manrope,sans-serif}
.pm .row{display:flex;align-items:center;gap:14px;margin:12px 0} .pm .row label{min-width:150px;font:800 12px Manrope,sans-serif;letter-spacing:.14em;color:rgba(255,255,255,.65)} .pm input[type=range]{flex:1;accent-color:#ffd24a}
.pm .q span{cursor:pointer;font:800 12px Manrope,sans-serif;padding:8px 14px;background:rgba(255,255,255,.08);letter-spacing:.1em;margin-right:6px;display:inline-block} .pm .q span.on{background:#ffd24a;color:#111}
.pm .ft{margin-top:16px;font:600 11px Manrope,sans-serif;color:rgba(255,255,255,.45)}
@media (max-width:760px),(max-height:520px){ .pm .hd b{font-size:34px} .pm .tabs{margin:8px 0 10px} .pm .tabs span{font-size:15px;padding:6px 12px} .pm .list{min-width:40vw} .pm .list button{font-size:20px;padding:5px 12px} .pm .panel{font-size:12px;line-height:1.6;padding:12px} .pm .row label{min-width:90px} }`; document.head.appendChild(st); })();
function pmSnd(k){ try{ uiSnd(k); }catch(e){} }
function pmBuild(){ const sh=document.querySelector('#pause .sheet'); if(!sh||sh.querySelector('.pm')) return; const pm=document.createElement('div'); pm.className='pm';
  pm.innerHTML='<div class="hd"><b>TUHELJ</b><em class="clk"></em><i class="cash"></i></div><div class="tabs"><span data-t="igra" class="on">IGRA</span><span data-t="karta">KARTA</span><span data-t="post">POSTAVKE</span><span data-t="kont">KONTROLE</span></div><div class="body"><div class="list"></div><div class="panel"></div></div><div class="ft">Ceste, zgrade, šume i polja prema OpenStreetMapu · Mapillary CC BY-SA · Rocketbox MIT · Quaternius / Kenney CC0</div>';
  sh.appendChild(pm); const list=pm.querySelector('.list'), panel=pm.querySelector('.panel');
  const click=(id)=>{ const b=document.getElementById(id); if(b) b.click(); };
  const show=(t)=>{ pm.querySelectorAll('.tabs span').forEach(s=>s.classList.toggle('on',s.dataset.t===t)); list.innerHTML=''; panel.innerHTML='';
    const item=(txt,fn)=>{ const b=document.createElement('button'); b.textContent=txt; b.addEventListener('click',()=>{ pmSnd('pick'); fn(); }); b.addEventListener('pointerenter',()=>pmSnd('hover')); list.appendChild(b); return b; };
    if(t==='igra'){ item('NASTAVI',()=>click('resume')).classList.add('sel'); item('KARTA',()=>click('openmap')); item('MOBITEL',()=>{ click('resume'); setTimeout(()=>{ try{ togglePhone(true); }catch(e){} },80); }); item('CIJELI ZASLON',()=>click('fsbtn'));
      const n=(typeof STORY!=='undefined')?STORY.ch:0; const M=GTA.mission;
      panel.innerHTML='<h4>PRIČA</h4>Poglavlje '+Math.min(STORY_LAST,n+1)+' od '+STORY_LAST+'<br>'+(M?'Misija: <b>'+M.title+'</b>':'Nema aktivne misije — potraži žuti uskličnik na karti.')+'<h4 style="margin-top:18px">STANJE</h4>Zdravlje '+Math.round(COMBAT.hp)+' · novac €'+(GTA.money|0)+' · traženost '+('★'.repeat(GTA.wanted|0)||'—'); }
    if(t==='karta'){ item('OTVORI KARTU',()=>click('openmap')); panel.innerHTML='<h4>KARTA</h4>Kotačić miša zumira, povuci za pomicanje.<br>Klik na kartu postavlja točku puta (ljubičasta linija na radaru).'; }
    if(t==='post'){ item('NAZAD',()=>show('igra')); const h=document.createElement('h4'); h.textContent='POSTAVKE'; panel.appendChild(h);
      const row=(lab,el)=>{ const r=document.createElement('div'); r.className='row'; const l=document.createElement('label'); l.textContent=lab; r.append(l,el); panel.appendChild(r); };
      const sl=document.createElement('input'); sl.type='range'; sl.min='0'; sl.max='23.9'; sl.step='0.1'; sl.value=GAME.hour; sl.addEventListener('input',()=>{ try{ GAME.hour=+sl.value; setTimeOfDay(GAME.renderer,GAME.scene,GAME.hour); nightLights(); }catch(e){} }); row('DOBA DANA',sl);
      const q=document.createElement('div'); q.className='q'; ['NISKA','SREDNJA','VISOKA'].forEach((x,i)=>{ const s=document.createElement('span'); s.textContent=x; if(GAME.q===i) s.className='on'; s.addEventListener('click',()=>{ pmSnd('pick'); setQuality(i); q.querySelectorAll('span').forEach((y,j)=>y.classList.toggle('on',j===i)); }); q.appendChild(s); }); row('GRAFIKA',q);
      const vol=document.createElement('input'); vol.type='range'; vol.min='0'; vol.max='1'; vol.step='0.05'; vol.value=(typeof AUD!=='undefined'&&AUD.master)?Math.min(1,AUD.master.gain.value/0.6):1; vol.addEventListener('input',()=>{ try{ AUD.master.gain.value=0.6*vol.value; }catch(e){} }); row('GLASNOĆA',vol);
      const fl=document.createElement('div'); fl.className='q'; const fs=document.createElement('span'); const ft=document.getElementById('flytg'); fs.textContent=ft?ft.textContent.toUpperCase():'LETENJE'; fs.addEventListener('click',()=>{ pmSnd('pick'); click('flytg'); fs.textContent=document.getElementById('flytg').textContent.toUpperCase(); }); fl.appendChild(fs); row('LETENJE',fl); }
    if(t==='kont'){ item('NAZAD',()=>show('igra')); panel.innerHTML=GAME.touch?'<h4>DODIR</h4>Lijevi krug — hodanje · povuci prstom — pogled · gumbi desno — skok, trčanje, pucanje · Vozi — uđi u auto · 📻 — radio':
      '<h4>PJEŠICE</h4><kbd>W A S D</kbd> hodanje · <kbd>Shift</kbd> trčanje · <kbd>Space</kbd> skok · <kbd>C</kbd> čučanj<br><kbd>E</kbd> vrata, razgovor, auto, šank · <kbd>P</kbd> mobitel · <kbd>M</kbd> karta<h4 style="margin-top:14px">ORUŽJE</h4><kbd>Kotačić</kbd> / <kbd>Tab</kbd> izbor · <kbd>Q</kbd> spremi · lijevi klik puca · desni nišani · <kbd>R</kbd> punjenje<h4 style="margin-top:14px">VOŽNJA</h4><kbd>W S</kbd> gas i kočnica · <kbd>A D</kbd> volan · <kbd>Space</kbd> ručna · <kbd>V</kbd> pogled iznutra · <kbd>R</kbd> / kotačić radio'; }
    pmSnd('pick'); };
  pm.querySelectorAll('.tabs span').forEach(s=>s.addEventListener('click',()=>show(s.dataset.t))); pm.show=show; show('igra'); }
function pmTick(){ const p=document.getElementById('pause'); if(!p) return; pmBuild(); const pm=p.querySelector('.pm'); if(!pm) return; const on=getComputedStyle(p).display!=='none'&&getComputedStyle(p).visibility!=='hidden'&&getComputedStyle(p).opacity!=='0';
  if(on&&!pm._on) pm.show('igra'); pm._on=on; const h=Math.floor(GAME.hour), m=Math.floor((GAME.hour-h)*60); pm.querySelector('.clk').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'); pm.querySelector('.cash').textContent='€'+(GTA.money|0).toLocaleString('hr-HR'); }
setInterval(()=>{ try{ pmTick(); }catch(e){} },250);
