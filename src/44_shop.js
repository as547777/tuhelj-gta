/* ===================== shops with real-looking goods you can buy =====================
   Shelf goods are drawn from a packaging atlas (milk, bread, coffee, flour, pasta, crisps, chocolate, juice, beer, water,
   cola, biscuits, oil, sugar, eggs, washing powder). Every shelf is a spot: walk up and press E to buy from that section. */
const PROD=[ // [name, bg, fg, kind]
  ['MLIJEKO','#f4f6f8','#1f5fbf','carton'],['KRUH','#c98a3c','#fff4dc','bag'],['KAVA','#4a2a18','#f0d9a0','pack'],['BRAŠNO','#f2ead6','#b8352a','bag'],
  ['TJESTENINA','#1f4fb3','#ffd23a','pack'],['ČIPS','#e23a2a','#ffe14a','bag'],['ČOKOLADA','#5b2b8a','#ffffff','bar'],['SOK','#f28c1b','#ffffff','carton'],
  ['PIVO','#2e7d32','#ffe08a','bottle'],['VODA','#9fd6ff','#1f4fb3','bottle'],['COLA','#c8102e','#ffffff','can'],['KEKSI','#d9a45a','#5a2a10','pack'],
  ['ULJE','#e8c23a','#2a6a2a','bottle'],['ŠEĆER','#ffffff','#2a4f86','bag'],['JAJA','#e8dcc4','#6a4a2a','pack'],['PRAŠAK','#2a8ac8','#ffffff','pack']];
let PROD_MAT=null;
function prodAtlas(){ if(PROD_MAT) return PROD_MAT; const S=1024, c=cvs(S,S), g=c.getContext('2d'); const n=4, w=S/n;
  PROD.forEach(([nm,bg,fg,k],i)=>{ const x=(i%n)*w, y=Math.floor(i/n)*w; g.fillStyle=bg; g.fillRect(x,y,w,w); const gr=g.createLinearGradient(x,y,x+w,y); gr.addColorStop(0,'rgba(0,0,0,0.18)'); gr.addColorStop(0.3,'rgba(255,255,255,0.12)'); gr.addColorStop(1,'rgba(0,0,0,0.2)'); g.fillStyle=gr; g.fillRect(x,y,w,w);
    g.fillStyle=fg; g.beginPath(); g.ellipse(x+w/2,y+w*0.42,w*0.36,w*0.2,0,0,TAU); g.globalAlpha=0.25; g.fill(); g.globalAlpha=1; g.font='900 '+Math.round(w*(nm.length>8?0.13:0.17))+'px Manrope, Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(nm,x+w/2,y+w*0.42);
    g.fillStyle=fg; g.fillRect(x+w*0.12,y+w*0.66,w*0.76,w*0.05); g.font='700 '+Math.round(w*0.08)+'px Manrope, Arial'; g.fillText(['1 L','500 g','250 g','1 kg','400 g','150 g','100 g','1 L','0,5 L','1,5 L','0,33 L','300 g','1 L','1 kg','10 kom','2 kg'][i],x+w/2,y+w*0.82);
    g.fillStyle='rgba(255,255,255,0.85)'; g.fillRect(x+w*0.7,y+w*0.06,w*0.24,w*0.12); g.fillStyle='#d32f2f'; g.font='800 '+Math.round(w*0.07)+'px Manrope'; g.fillText((1+i%5)+',99',x+w*0.82,y+w*0.125); });
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=ANISO; PROD_MAT=new THREE.MeshStandardMaterial({map:t,roughness:0.55,metalness:0.02}); return PROD_MAT; }
// shelf with packaged goods (replaces the coloured blocks)
intShelf=function(cs,x,z,y,sx,sz,len,rot,seed){ const Mt=cs.get('metal',x,z); const sf=frame(x+sx,z+sz,rot,0);
  Mt.box(sf,-len/2,len/2,y,y+1.9,-0.025,0.025,lin('#8fa3b3')); for(const ex of [-1,1]) Mt.box(sf,ex*len/2-0.03,ex*len/2+0.03,y,y+1.95,-0.32,0.32,lin('#2a4f86')); Mt.box(sf,-len/2,len/2,y,y+0.12,-0.32,0.32,lin('#2a4f86'));
  const gb=new GB(); const W=WHITE; const n=4;
  for(let lv=0;lv<4;lv++){ const yy=y+0.25+lv*0.45; Mt.box(sf,-len/2,len/2,yy,yy+0.03,-0.32,0.32,lin('#c9cfd4'));
    for(const side of [-1,1]){ const pid=(seed*5+lv*3+(side>0?7:0))%PROD.length; const kind=PROD[pid][3]; const u0=(pid%n)/n, v0=1-(Math.floor(pid/n)+1)/n, du=1/n;
      const dims=kind==='bottle'?[0.09,0.3]:kind==='can'?[0.07,0.13]:kind==='carton'?[0.09,0.24]:kind==='bar'?[0.16,0.04]:kind==='bag'?[0.18,0.22]:[0.15,0.2]; const pw=dims[0], ph=dims[1];
      for(let px=-len/2+0.06;px+pw<len/2-0.04;px+=pw+0.015){ const zf=side>0?0.29:-0.29, zb=side>0?0.06:-0.06; const y0=yy+0.03, y1=y0+ph;
        const P=(xx,yv,zz)=>sf(xx,yv,zz); const a=P(px,y0,zf), b=P(px+pw,y0,zf), c=P(px+pw,y1,zf), d=P(px,y1,zf);
        const N=(()=>{ const q=sf(0,0,side), o=sf(0,0,0); return [q[0]-o[0],0,q[2]-o[2]]; })();
        if(side>0) gb.quad(a,b,c,d,[u0,v0],[u0+du,v0],[u0+du,v0+du],[u0,v0+du],W,N); else gb.quad(b,a,d,c,[u0,v0],[u0+du,v0],[u0+du,v0+du],[u0,v0+du],W,N);
        // sides and top in the pack colour
        const G=cs.get('wall',x,z), col=lin(PROD[pid][1]); G.box(sf,px,px+pw,y0,y1,Math.min(zf,zb),Math.max(zf,zb),col,1,0x3f^(side>0?16:32)); } } }
  const m=new THREE.Mesh(gb.geometry(),prodAtlas()); m.matrixAutoUpdate=false; GAME.scene.add(m);
  addCollider(x+sx,z+sz,rot,len+0.1,0.7,y-1,y+2); };
// a proper grocery list: what you buy goes to the phone inventory and heals / sobers / fixes
Object.assign(ITEMS,{kruh:{n:'Kruh',ic:'🍞',hp:20},mlijeko:{n:'Mlijeko',ic:'🥛',hp:12},burek:{n:'Burek',ic:'🥐',hp:30},jabuke:{n:'Jabuke',ic:'🍎',hp:10},cokolada:{n:'Čokolada',ic:'🍫',hp:8},
  kava:{n:'Kava',ic:'☕',hp:6},cips:{n:'Čips',ic:'🥔',hp:6},pivo:{n:'Pivo',ic:'🍺',hp:4,beer:true},cola:{n:'Cola',ic:'🥤',hp:8},cvijece:{n:'Cvijeće',ic:'💐'},cigare:{n:'Žvakaće',ic:'🍬',hp:2}});
SHOP2.length=0; SHOP2.push({k:'kruh',p:2},{k:'mlijeko',p:1},{k:'burek',p:3},{k:'hrana',p:3},{k:'jabuke',p:2},{k:'cokolada',p:2},{k:'kava',p:4},{k:'cips',p:2},{k:'sok',p:2},{k:'voda',p:1},{k:'cola',p:2},{k:'pivo',p:2},{k:'lijek',p:12},{k:'alat',p:15},{k:'cvijece',p:6});
{ const _use=invUse; invUse=function(k){ const it=ITEMS[k]; if(it&&it.beer&&OW.inv[k]){ OW.inv[k]--; COMBAT.bac=Math.min(2,(COMBAT.bac||0)+0.25); COMBAT.hp=Math.min(100,COMBAT.hp+(it.hp||0)); UI.toast('🍺 Živjeli!'); try{ updateCombatHUD(); }catch(e){} return; } if(it&&!it.hp&&k!=='alat'){ UI.toast(it.ic+' '+it.n+' — čuvaš za nekog posebnog'); return; } _use(k); }; }
// every shelf is a buy spot (E near a shelf)
{ const add=(id,pts)=>{ const I=INTS&&INTS.find(q=>q.id===id); if(!I) return false; for(const [x,z,t] of pts) if(!I.spots.some(s=>s.t===t)) I.spots.push({x,z,r:1.4,t,fn:()=>openShop()}); return true; };
  const tryAdd=()=>{ if(!INTS||!INTS.length) return false; const a=add('strah',[[-2.4,0.5,'🛒 Uzmi s police'],[-2.4,2.9,'🛒 Uzmi s police'],[1.9,-0.5,'🛒 Uzmi s police'],[4.9,-2.8,'🥛 Hladnjaci — uzmi']]); const b=add('pz',[[-1.5,0.8,'🛒 Uzmi s police'],[1.5,0.8,'🛒 Uzmi s police']]); return a||b; };
  const iv=setInterval(()=>{ try{ if(typeof intInit==='function') intInit(); if(tryAdd()) clearInterval(iv); }catch(e){} },2000); }
