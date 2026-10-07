/* ===================== bullets cost money: ammo reserve and the hunting counter =====================
   Every gun now has a reserve of bullets (saved): reloading fills the magazine from it, and when it runs out you
   have to buy more. The village shop has a "Lovački pult" (hunting counter) at the bottom of its list: guns you do
   not own yet and boxes of ammo for each gun. The weapon button shows magazine / reserve. */
const AMMO_START={4:60,0:120,1:0,5:24,2:15,3:2};
const AMMO=(()=>{ try{ const a=JSON.parse(localStorage.getItem('tuhelj_ammo')||'null'); if(a&&typeof a==='object') return a; }catch(e){} return Object.assign({},AMMO_START); })();
function ammoSave(){ try{ localStorage.setItem('tuhelj_ammo',JSON.stringify(AMMO)); }catch(e){} }
function ammoRes(i){ return AMMO[i]|0; }
function ammoTake(i,n){ const t=Math.max(0,Math.min(n,ammoRes(i))); AMMO[i]=ammoRes(i)-t; ammoSave(); return t; }
function ammoAdd(i,n){ AMMO[i]=ammoRes(i)+n; ammoSave(); try{ updateCombatHUD(); }catch(e){} }
// no reload with an empty reserve
{ const _rg=reloadGun; reloadGun=function(){ const C=COMBAT; if(C.armed&&ammoRes(C.wi)<=0&&C.reload<=0){ if(C.mags[C.wi]<=0) UI.toast('Nema metaka — kupi ih na lovačkom pultu u trgovini'); return; } return _rg(); }; }
// the story still hands out weapons with a few spare magazines
{ const _au=armUnlock; armUnlock=function(i,silent){ const had=ARMORY.has(i); _au(i,silent); if(!had) ammoAdd(i,(WEAPONS[i].mag||1)*2); }; }
const GUNSHOP=[
  {w:4,gun:250,ammo:20,box:24,lab:'Pištolj'},
  {w:0,gun:900,ammo:45,box:60,lab:'Puška'},
  {w:5,gun:600,ammo:30,box:12,lab:'Sačmarica'},
  {w:2,gun:1500,ammo:60,box:10,lab:'Snajper'},
  {w:3,gun:3000,ammo:150,box:1,lab:'Bazuka'}];
function gunRow(txt,price,fn,dim){ const b=document.createElement('button'); b.className='drink'+(dim?' dim':''); const n=document.createElement('span'); n.textContent=txt; const p=document.createElement('b'); p.textContent=price+' €'; b.append(n,p);
  b.addEventListener('click',()=>{ if(GTA.money<price){ UI.toast('Nemaš dovoljno novca'); return; } money(-price,'lovački pult'); fn(); try{ bubble(SHOPIN.cashier,'Pazi s tim, molim te.',2.5); }catch(e){} try{ openShop(); }catch(e){} }); return b; }
{ const _os=openShop; openShop=function(){ _os(); const list=document.getElementById('shoplist'); if(!list) return;
    const h=document.createElement('div'); h.className='gunhead'; h.textContent='🎯  LOVAČKI PULT'; list.appendChild(h);
    for(const G of GUNSHOP){ const W=WEAPONS[G.w]; if(!ARMORY.has(G.w)) list.appendChild(gunRow('🔫  '+G.lab+'  (+'+(W.mag*2)+' metaka)',G.gun,()=>{ armUnlock(G.w); UI.toast('Kupio si: '+G.lab); }));
      else list.appendChild(gunRow('📦  Meci — '+G.lab+'  ×'+G.box+'   (imaš '+ammoRes(G.w)+')',G.ammo,()=>{ ammoAdd(G.w,G.box); UI.toast('+'+G.box+' metaka za: '+G.lab); })); } }; }
(function(){ const st=document.createElement('style'); st.textContent='#shoplist .gunhead{margin:14px 0 6px;padding:6px 10px;font:800 13px Manrope,sans-serif;letter-spacing:.18em;color:#ffd24a;border-top:1px solid rgba(255,255,255,.18)}'; document.head.appendChild(st); })();
// the weapon button and the desktop ammo line show magazine / reserve
{ const _uc=updateCombatHUD; updateCombatHUD=function(){ _uc(); const C=COMBAT, am=document.getElementById('ammo'); if(am&&C.armed&&C.reload<=0) am.textContent=WEAPONS[C.wi].n+'  '+C.mags[C.wi]+' / '+ammoRes(C.wi); }; }
