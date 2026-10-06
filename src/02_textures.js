/* ===================== procedural textures ===================== */
let ANISO = 8;
function cvs(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; if(window.__CVLOG) __CVLOG.push([new WeakRef(c),w,h,(new Error().stack||'').split('\n')[2]||'']); return c; }
if(/[?&]cvlog/.test(location.search)) window.__CVLOG=[];
function mkTex(c,{repeat=true,srgb=true,mip=true}={}){
  const t=new THREE.CanvasTexture(c);
  if(repeat){ t.wrapS=t.wrapT=THREE.RepeatWrapping; }
  t.colorSpace = srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;
  t.anisotropy=ANISO; t.generateMipmaps=mip;
  if(!mip) t.minFilter=THREE.LinearFilter;
  t.needsUpdate=true; return t;
}
// tileable value noise
function tnoise(x,y,P,seed){ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi; const m=(v)=>((v%P)+P)%P;
  const a=hash2(m(xi)+seed*7919,m(yi)), b=hash2(m(xi+1)+seed*7919,m(yi)), c=hash2(m(xi)+seed*7919,m(yi+1)), d=hash2(m(xi+1)+seed*7919,m(yi+1));
  const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf); return lerp(lerp(a,b,u),lerp(c,d,u),v); }
function tfbm(x,y,P,oct,seed){ let s=0,a=0.5,n=0,f=1; for(let i=0;i<oct;i++){ s+=a*tnoise(x*f,y*f,P*f,seed+i); n+=a; a*=0.5; f*=2; } return s/n; }
function pixelCanvas(w,h,fn){ const c=cvs(w,h), x=c.getContext('2d'); const id=x.createImageData(w,h), d=id.data; let i=0; const o=[0,0,0,255];
  for(let y=0;y<h;y++) for(let X=0;X<w;X++){ o[3]=255; fn(X,y,o); d[i]=o[0]; d[i+1]=o[1]; d[i+2]=o[2]; d[i+3]=o[3]; i+=4; }
  x.putImageData(id,0,0); return c; }
// draw with wrap-around for tileable strokes
function wrapDraw(ctx,W,H,x,y,r,fn){ for(const ox of [0,-W,W]) for(const oy of [0,-H,H]){ if(x+ox+r<0||x+ox-r>W||y+oy+r<0||y+oy-r>H) continue; fn(x+ox,y+oy); } }
const TEX={};
function buildTextures(){
  RNG = mulberry32(777);
  // ---------- ground detail (neutral ~128 multiplier) ----------
  { const S=512; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/64,y/64,8,4,11); const m=tfbm(x/16,y/16,32,2,12); const v=100+n*46+m*24; o[0]=v*0.96; o[1]=v*1.04; o[2]=v*0.88; });
    const g=c.getContext('2d'); g.lineCap='round';
    for(let i=0;i<9000;i++){ const x=rnd(0,S), y=rnd(0,S), L=rnd(3,11), a=rnd(-2.2,-0.9)+ (RNG()<0.5?0:Math.PI*0.0); const l=rnd(0.5,1.5);
      const v=RNG(); const col = v<0.5? `rgba(${70+rnd(0,30)|0},${86+rnd(0,30)|0},${52+rnd(0,20)|0},0.55)` : `rgba(${165+rnd(0,40)|0},${170+rnd(0,40)|0},${120+rnd(0,40)|0},0.45)`;
      g.strokeStyle=col; g.lineWidth=l;
      wrapDraw(g,S,S,x,y,L,(px,py)=>{ g.beginPath(); g.moveTo(px,py); g.lineTo(px+Math.cos(a)*L,py+Math.sin(a)*L); g.stroke(); }); }
    for(let i=0;i<260;i++){ const x=rnd(0,S),y=rnd(0,S); g.fillStyle=RNG()<0.5?'rgba(190,180,90,0.5)':'rgba(230,230,210,0.55)'; wrapDraw(g,S,S,x,y,3,(px,py)=>{ g.beginPath(); g.arc(px,py,rnd(0.8,1.8),0,TAU); g.fill(); }); }
    TEX.grass=mkTex(c,{srgb:false}); }
  { const S=512; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/48,y/48,S/48,4,21); const v=96+n*64; o[0]=v*1.06; o[1]=v*1.0; o[2]=v*0.9; });
    const g=c.getContext('2d');
    for(let i=0;i<5200;i++){ const x=rnd(0,S),y=rnd(0,S),r=rnd(0.8,3.2); const v=rnd(60,200)|0; g.fillStyle=`rgba(${v+10},${v+4},${v-8},0.8)`; wrapDraw(g,S,S,x,y,r,(px,py)=>{ g.beginPath(); g.ellipse(px,py,r,r*rnd(0.6,1),rnd(0,3),0,TAU); g.fill(); }); }
    TEX.dirt=mkTex(c,{srgb:false}); }
  { const S=512; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/40,y/40,S/40,4,31); const v=80+n*70; o[0]=v*1.08; o[1]=v*0.98; o[2]=v*0.84; });
    const g=c.getContext('2d');
    for(let i=0;i<3800;i++){ const x=rnd(0,S),y=rnd(0,S),r=rnd(2,6); const t=RNG(); const cc= t<0.35?[150,105,55]:t<0.6?[120,80,45]:t<0.8?[165,140,80]:[95,110,60]; g.fillStyle=`rgba(${cc[0]},${cc[1]},${cc[2]},0.75)`;
      wrapDraw(g,S,S,x,y,r,(px,py)=>{ g.beginPath(); g.ellipse(px,py,r,r*0.45,rnd(0,3.14),0,TAU); g.fill(); }); }
    g.strokeStyle='rgba(60,45,30,0.6)'; g.lineWidth=1.2;
    for(let i=0;i<220;i++){ const x=rnd(0,S),y=rnd(0,S),L=rnd(8,26),a=rnd(0,3.14); wrapDraw(g,S,S,x,y,L,(px,py)=>{ g.beginPath(); g.moveTo(px,py); g.lineTo(px+Math.cos(a)*L,py+Math.sin(a)*L); g.stroke(); }); }
    TEX.litter=mkTex(c,{srgb:false}); }
  // ---------- asphalt (colour) ----------
  const asph=(base,S=512,seed=41,patch=0)=>{ const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/90,y/90,S/90,4,seed); const m=hash2(x*3+seed,y*7); let v=base+(n-0.5)*26+(m-0.5)*22; if(m>0.985) v+=38; if(m<0.012) v-=30; o[0]=v; o[1]=v; o[2]=v*1.02; });
    const g=c.getContext('2d');
    for(let i=0;i<patch;i++){ const x=rnd(0,S),y=rnd(0,S),w=rnd(30,120),h=rnd(20,90); g.fillStyle=`rgba(${base-14},${base-14},${base-12},0.35)`; wrapDraw(g,S,S,x,y,Math.max(w,h),(px,py)=>{ g.fillRect(px,py,w,h); }); }
    g.strokeStyle=`rgba(${base-30},${base-30},${base-30},0.55)`; g.lineWidth=1;
    for(let i=0;i<14;i++){ let x=rnd(0,S), y=rnd(0,S); g.beginPath(); g.moveTo(x,y); for(let k=0;k<12;k++){ x+=rnd(-9,9); y+=rnd(-9,9); g.lineTo(x,y);} g.stroke(); }
    return c; };
  TEX.asphalt=mkTex(asph(92,512,41,6));
  TEX.asphaltOld=mkTex(asph(112,512,43,18));
  // track: ruts + grass centre (u across)
  { const W=256,H=512; const c=pixelCanvas(W,H,(x,y,o)=>{ const u=x/W; const n=tfbm(x/32,y/32,8,3,51); const pebble=hash2(x*5,y*3); const rut=Math.exp(-((u-0.25)**2)/0.006)+Math.exp(-((u-0.75)**2)/0.006); const grassC=smooth(0.34,0.44,u)*(1-smooth(0.56,0.66,u)) + smooth(0.08,0.0,u)+smooth(0.92,1.0,u);
      let r=150+n*40-rut*18, gg=138+n*36-rut*18, b=112+n*30-rut*16; if(pebble>0.96){ r+=30; gg+=30; b+=30; }
      const gr=clamp(grassC*(0.7+0.6*tfbm(x/10,y/10,W/10,2,52)),0,1); r=lerp(r,84+n*30,gr); gg=lerp(gg,110+n*30,gr); b=lerp(b,52+n*20,gr);
      o[0]=r; o[1]=gg; o[2]=b; }); TEX.track=mkTex(c); }
  // concrete / curb
  { const S=256; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/40,y/40,S/40,4,61); const m=hash2(x,y*3); const v=168+(n-0.5)*30+(m-0.5)*14; o[0]=v; o[1]=v*0.99; o[2]=v*0.96; });
    const g=c.getContext('2d'); g.strokeStyle='rgba(90,90,90,0.5)'; g.lineWidth=2; g.beginPath(); g.moveTo(0,1); g.lineTo(S,1); g.stroke(); TEX.concrete=mkTex(c); }
  // plaster (near white, tinted by vertex colour)
  { const S=512; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/70,y/70,S/70,5,71); const m=hash2(x*13,y*7); const streak=tfbm(x/6,y/120,S/6,2,72); let v=226+(n-0.5)*30+(m-0.5)*10-(streak>0.62?8:0); o[0]=v; o[1]=v; o[2]=v; }); TEX.plaster=mkTex(c); }
  // brick (blok opeka) coloured
  { const S=512; const c=cvs(S,S), g=c.getContext('2d'); g.fillStyle='#8f8a80'; g.fillRect(0,0,S,S); const bw=64, bh=48;
    for(let row=0; row<Math.ceil(S/bh); row++){ const off=(row%2)*bw/2; for(let i=-1;i<S/bw+1;i++){ const x=i*bw+off, y=row*bh; const t=RNG(); const r=176+rnd(-18,18), gg=86+rnd(-14,14), b=58+rnd(-10,10); g.fillStyle=`rgb(${r|0},${gg|0},${b|0})`; g.fillRect(x+3,y+3,bw-5,bh-5); g.fillStyle='rgba(0,0,0,0.12)'; g.fillRect(x+3,y+bh-7,bw-5,3); g.fillStyle='rgba(255,220,190,0.10)'; g.fillRect(x+3,y+3,bw-5,3); for(let k=0;k<4;k++){ g.fillStyle='rgba(60,30,20,0.18)'; g.fillRect(x+8+k*13,y+12,4,bh-24); } } }
    TEX.brick=mkTex(c); }
  // wood planks (vertical)
  { const S=512; const c=pixelCanvas(S,S,(x,y,o)=>{ const pw=S/10; const pi=Math.floor(x/pw); const px=(x%pw)/pw; const tone=0.75+0.35*hash2(pi,3); const grain=tfbm(x/3+pi*17,y/60,S/3,3,81); const edge=px<0.06||px>0.96?0.45:1; let v=(78+grain*50)*tone*edge; o[0]=v*1.18; o[1]=v*0.86; o[2]=v*0.6; }); TEX.wood=mkTex(c); }
  // roof tiles (near white, tinted)
  { const S=512; const rows=5, cols=6; const c=pixelCanvas(S,S,(x,y,o)=>{ const rh=S/rows, cw=S/cols; const r=Math.floor(y/rh); const off=(r%2)*cw*0.5; const ci=Math.floor((x+off)/cw); const fx=((x+off)%cw)/cw, fy=(y%rh)/rh;
      const t=hash2(ci+r*31,r*7); let v=205+t*40; v*= 0.78+0.3*fy; // lighter toward bottom (overlap)
      if(fy>0.9) v*=0.55; // shadow under overlap
      v*= 0.9+0.1*Math.sin(fx*Math.PI); if(fx<0.04||fx>0.97) v*=0.75; // grooves
      const moss=tfbm(x/40,y/40,S/40,3,91); if(moss>0.68){ o[0]=v*0.62; o[1]=v*0.66; o[2]=v*0.45; return; }
      const dirt=hash2(x*7,y*11)*12; o[0]=clamp(v-dirt,0,255); o[1]=clamp(v-dirt,0,255); o[2]=clamp(v-dirt*1.1,0,255); }); TEX.tiles=mkTex(c); }
  // corrugated metal
  { const S=256; const c=pixelCanvas(S,S,(x,y,o)=>{ const v=150+60*Math.sin(x/S*TAU*12)+tfbm(x/30,y/30,S/30,3,95)*30; o[0]=v; o[1]=v*1.02; o[2]=v*1.05; }); TEX.metal=mkTex(c); }
  // stone (plinths, monuments)
  { const S=256; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/30,y/30,S/30,5,97); const m=hash2(x*3,y*5); const v=150+(n-0.5)*70+(m-0.5)*20; o[0]=v; o[1]=v*0.97; o[2]=v*0.9; }); TEX.stone=mkTex(c); }
  // hedge / thuja
  { const S=256; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/12,y/12,S/12,4,99); const m=hash2(x,y); const v=n*0.8+m*0.2; const l=Math.max(0,Math.min(1,v*1.25-0.05)); o[0]=(95+l*150)*0.92; o[1]=95+l*160; o[2]=(95+l*150)*0.85; }); TEX.hedge=mkTex(c,{srgb:false}); } // luminance only: the vertex colour carries the green
  // leaves alpha
  { const S=256; const c=cvs(S,S), g=c.getContext('2d'); g.clearRect(0,0,S,S);
    for(let i=0;i<2600;i++){ const x=rnd(0,S),y=rnd(0,S),r=rnd(3,7.5); const l=rnd(0.55,1.15); g.fillStyle=`rgb(${(150*l)|0},${(190*l)|0},${(120*l)|0})`; wrapDraw(g,S,S,x,y,r*2,(px,py)=>{ g.beginPath(); g.ellipse(px,py,r,r*0.5,rnd(0,3.14),0,TAU); g.fill(); }); }
    TEX.leaves=mkTex(c); }
  { const S=256; const c=cvs(S,S), g=c.getContext('2d'); g.clearRect(0,0,S,S); g.lineCap='round';
    for(let i=0;i<3200;i++){ const x=rnd(0,S),y=rnd(0,S),L=rnd(4,10),a=rnd(0.6,2.5); const l=rnd(0.6,1.1); g.strokeStyle=`rgb(${(120*l)|0},${(165*l)|0},${(125*l)|0})`; g.lineWidth=rnd(1.2,2.6); wrapDraw(g,S,S,x,y,L,(px,py)=>{ g.beginPath(); g.moveTo(px,py); g.lineTo(px+Math.cos(a)*L,py+Math.sin(a)*L); g.stroke(); }); }
    TEX.needles=mkTex(c); }
  // water normal-ish noise (used as bump colour variation)
  { const S=256; const c=pixelCanvas(S,S,(x,y,o)=>{ const n=tfbm(x/20,y/20,S/20,4,101); const m=tfbm(x/7,y/7,S/7,2,102); o[0]=128+(n-0.5)*120; o[1]=128+(m-0.5)*120; o[2]=255; }); TEX.waterN=mkTex(c,{srgb:false}); }
  buildWindowAtlas();
}
/* ---------------- window / door atlas ---------------- */
const WIN={}; // name -> {u0,v0,u1,v1,w,h}
function buildWindowAtlas(){
  const W=2048,H=2048; const c=cvs(W,H), g=c.getContext('2d');
  g.fillStyle='#777'; g.fillRect(0,0,W,H);
  let cx=0, cy=0, rowH=0; const PPM=110; // pixels per metre
  const slot=(name,wm,hm,draw)=>{ const w=Math.round(wm*PPM), h=Math.round(hm*PPM); if(cx+w>W){ cx=0; cy+=rowH+4; rowH=0; } g.save(); g.translate(cx,cy); g.beginPath(); g.rect(0,0,w,h); g.clip(); draw(g,w,h); g.restore(); WIN[name]={u0:cx/W, v0:1-(cy+h)/H, u1:(cx+w)/W, v1:1-cy/H, w:wm, h:hm}; cx+=w+4; rowH=Math.max(rowH,h); };
  const glass=(g,x,y,w,h,curtain=true)=>{ const gr=g.createLinearGradient(x,y,x+w*0.4,y+h); gr.addColorStop(0,'#8ea5b8'); gr.addColorStop(0.45,'#3d4c5a'); gr.addColorStop(1,'#1d252e'); g.fillStyle=gr; g.fillRect(x,y,w,h);
    g.fillStyle='rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(x+w*0.15,y); g.lineTo(x+w*0.45,y); g.lineTo(x+w*0.05,y+h); g.lineTo(x-w*0.25,y+h); g.fill();
    if(curtain){ const ch=h*rnd(0.35,0.7); g.fillStyle='rgba(235,232,222,0.78)'; g.fillRect(x,y,w,ch); g.fillStyle='rgba(210,205,195,0.6)'; for(let i=0;i<w;i+=5){ g.fillRect(x+i,y,2,ch); } g.fillStyle='rgba(235,232,222,0.5)'; for(let i=0;i<w;i+=10){ g.beginPath(); g.arc(x+i+5,y+ch,5,0,Math.PI); g.fill(); } } };
  const reveal=(g,w,h,f)=>{ g.fillStyle='rgba(0,0,0,0.35)'; g.fillRect(0,0,w,f); g.fillRect(0,0,f*0.7,h); g.fillStyle='rgba(0,0,0,0.12)'; g.fillRect(w-f*0.5,0,f*0.5,h); };
  const frameWin=(g,x,y,w,h,fc,panes=2,curtain=true,fw=7)=>{ g.fillStyle=fc; g.fillRect(x,y,w,h); const pw=(w-fw*(panes+1))/panes; for(let i=0;i<panes;i++){ glass(g,x+fw+i*(pw+fw),y+fw,pw,h-2*fw,curtain); } };
  const roller=(g,w,h,boxH,down,col)=>{ g.fillStyle=col; g.fillRect(0,0,w,boxH); g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(0,boxH-3,w,3); if(down>0){ const dh=(h-boxH)*down; for(let y=boxH;y<boxH+dh;y+=6){ g.fillStyle=col; g.fillRect(4,y,w-8,5); g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(4,y+5,w-8,1);} } };
  const variants=[
    ['roller_brown','#5b3a24',0.35],['roller_red','#b0452a',0.55],['roller_white','#e8e6e0',0.25],['roller_dark','#3b3b3d',0.2]
  ];
  for(const [nm,colr,down] of variants){ for(let k=0;k<2;k++) slot(nm+k,1.25,1.55,(g,w,h)=>{ reveal(g,w,h,10); const bh=h*0.17; frameWin(g,6,bh,w-12,h-bh-4,'#f1f0ea',2,true,8); roller(g,w,h,bh,down*(k?1.6:0.7),colr); }); }
  for(const sc of ['#3f5b3a','#6a3f22','#7a7a72']) slot('shut_'+sc,2.3,1.45,(g,w,h)=>{ const sw=w*0.24; g.fillStyle='rgba(0,0,0,0)'; const x0=sw; reveal(g,w,h,0); g.save(); g.translate(x0,0); reveal(g,w-2*sw,h,9); frameWin(g,5,6,w-2*sw-10,h-10,'#efece4',2,true,8); g.restore();
      for(const sx of [0,w-sw]){ g.fillStyle=sc; g.fillRect(sx+2,2,sw-4,h-4); g.fillStyle='rgba(0,0,0,0.3)'; for(let y=8;y<h-6;y+=7) g.fillRect(sx+6,y,sw-12,2); } });
  slot('old4',0.95,1.15,(g,w,h)=>{ reveal(g,w,h,9); g.fillStyle='#e9e6dc'; g.fillRect(4,4,w-8,h-8); const pw=(w-8-15)/2, ph=(h-8-15)/2; for(let i=0;i<2;i++)for(let j=0;j<2;j++) glass(g,9+i*(pw+5),9+j*(ph+5),pw,ph,j==0); });
  slot('flowers',1.25,1.7,(g,w,h)=>{ reveal(g,w,h,10); const bh=h*0.14; frameWin(g,6,bh,w-12,h-bh-30,'#f1f0ea',2,true,8); roller(g,w,h-30,bh,0.5,'#b0452a'); g.fillStyle='#6b4a2e'; g.fillRect(2,h-30,w-4,26); for(let i=0;i<34;i++){ const x=rnd(6,w-6), y=h-30-rnd(-2,16); g.fillStyle=RNG()<0.35?'#2f5e2a':'#3f7a33'; g.beginPath(); g.arc(x,y+6,rnd(4,7),0,TAU); g.fill(); } for(let i=0;i<22;i++){ const x=rnd(6,w-6), y=h-34-rnd(0,14); g.fillStyle=pick(['#d8232a','#e0343a','#c21d3a','#f05060']); g.beginPath(); g.arc(x,y,rnd(3,5.5),0,TAU); g.fill(); } });
  slot('modern',1.7,1.55,(g,w,h)=>{ reveal(g,w,h,10); frameWin(g,4,4,w-8,h-8,'#3a3c3f',3,RNG()<0.5,7); });
  slot('arched',1.15,2.1,(g,w,h)=>{ g.fillStyle='rgba(0,0,0,0.0)'; const r=w/2; g.save(); g.beginPath(); g.moveTo(0,h); g.lineTo(0,r); g.arc(r,r,r,Math.PI,0); g.lineTo(w,h); g.closePath(); g.clip(); g.fillStyle='#e9e5da'; g.fillRect(0,0,w,h); glass(g,8,8,w-16,h-16,false); g.fillStyle='#e9e5da'; g.fillRect(w/2-3,8,6,h); g.fillRect(8,r+6,w-16,6); g.restore(); });
  slot('church',1.3,3.6,(g,w,h)=>{ const r=w/2; g.save(); g.beginPath(); g.moveTo(0,h); g.lineTo(0,r); g.arc(r,r,r,Math.PI,0); g.lineTo(w,h); g.closePath(); g.clip(); g.fillStyle='#d9d3c3'; g.fillRect(0,0,w,h);
      const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#6d7f8c'); gr.addColorStop(1,'#2a333b'); g.fillStyle=gr; g.fillRect(9,9,w-18,h-18); g.strokeStyle='rgba(30,30,30,0.7)'; g.lineWidth=2; for(let y=20;y<h;y+=18){ g.beginPath(); g.moveTo(9,y); g.lineTo(w-9,y); g.stroke(); } for(let x=20;x<w;x+=18){ g.beginPath(); g.moveTo(x,9); g.lineTo(x,h); g.stroke(); }
      g.fillStyle='rgba(180,140,60,0.25)'; g.fillRect(9,h*0.35,w-18,h*0.2); g.restore(); });
  slot('round',1.3,1.3,(g,w,h)=>{ g.save(); g.beginPath(); g.arc(w/2,h/2,w/2-2,0,TAU); g.clip(); g.fillStyle='#d9d3c3'; g.fillRect(0,0,w,h); const gr=g.createRadialGradient(w/2,h/2,5,w/2,h/2,w/2); gr.addColorStop(0,'#5d6f7c'); gr.addColorStop(1,'#232a31'); g.fillStyle=gr; g.beginPath(); g.arc(w/2,h/2,w/2-10,0,TAU); g.fill(); g.strokeStyle='#bdb5a2'; g.lineWidth=4; for(let i=0;i<8;i++){ const a=i/8*TAU; g.beginPath(); g.moveTo(w/2,h/2); g.lineTo(w/2+Math.cos(a)*w/2,h/2+Math.sin(a)*w/2); g.stroke(); } g.restore(); });
  slot('door_wood',1.1,2.25,(g,w,h)=>{ reveal(g,w,h,8); g.fillStyle='#5a3620'; g.fillRect(4,4,w-8,h-4); g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(14,h*0.5,w-28,h*0.42); g.fillRect(14,20,w-28,h*0.1); glass(g,16,h*0.17,w-32,h*0.26,false); g.fillStyle='#c9a44c'; g.fillRect(w-26,h*0.52,12,4); });
  slot('door_wood2',1.5,2.3,(g,w,h)=>{ reveal(g,w,h,8); g.fillStyle='#6b4428'; g.fillRect(4,4,w-8,h-4); g.fillStyle='#4a2d19'; g.fillRect(w/2-2,4,4,h); for(const x0 of [14,w/2+10]){ g.fillStyle='rgba(0,0,0,0.2)'; g.fillRect(x0,24,w/2-24,h*0.35); g.fillRect(x0,h*0.5,w/2-24,h*0.42); } });
  slot('door_glass',1.25,2.35,(g,w,h)=>{ reveal(g,w,h,8); g.fillStyle='#b9bcbf'; g.fillRect(4,4,w-8,h-4); glass(g,12,12,w-24,h-24,false); g.fillStyle='#8c9094'; g.fillRect(w/2-2,4,4,h); g.fillStyle='#444'; g.fillRect(w/2-14,h*0.5,10,26); });
  slot('garage_white',2.6,2.2,(g,w,h)=>{ reveal(g,w,h,10); g.fillStyle='#e8e8e4'; g.fillRect(6,6,w-12,h-6); for(let y=6;y<h;y+=h/5){ g.fillStyle='rgba(0,0,0,0.22)'; g.fillRect(6,y,w-12,2); } });
  slot('garage_brown',2.6,2.2,(g,w,h)=>{ reveal(g,w,h,10); g.fillStyle='#6d4a30'; g.fillRect(6,6,w-12,h-6); for(let x=6;x<w;x+=14){ g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(x,6,2,h); } });
  slot('garage_red',2.7,2.3,(g,w,h)=>{ reveal(g,w,h,10); g.fillStyle='#7a2a26'; g.fillRect(6,6,w-12,h-6); for(let y=6;y<h;y+=h/5){ g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(6,y,w-12,2); } });
  slot('garage_fire',3.4,3.6,(g,w,h)=>{ reveal(g,w,h,12); g.fillStyle='#55585c'; g.fillRect(8,8,w-16,h-8); for(let y=8;y<h;y+=h/7){ g.fillStyle='rgba(0,0,0,0.3)'; g.fillRect(8,y,w-16,3); g.fillStyle='rgba(255,255,255,0.08)'; g.fillRect(8,y+3,w-16,2);} g.fillStyle='#c0282c'; g.beginPath(); g.arc(w*0.45,h*0.45,9,0,TAU); g.fill(); });
  slot('shop',3.0,2.3,(g,w,h)=>{ g.fillStyle='#9ea3a6'; g.fillRect(0,0,w,h); glass(g,8,8,w/2-12,h-16,false); glass(g,w/2+4,8,w/2-12,h-16,false); g.fillStyle='rgba(250,240,200,0.55)'; g.fillRect(14,h*0.55,w/2-24,h*0.3); g.fillStyle='rgba(220,40,40,0.6)'; g.fillRect(w/2+14,h*0.2,w/2-30,h*0.22); g.fillStyle='rgba(255,255,255,0.8)'; g.font='bold 22px sans-serif'; g.fillText('AKCIJA',w/2+24,h*0.2+32); });
  slot('attic',0.8,0.9,(g,w,h)=>{ reveal(g,w,h,8); frameWin(g,4,4,w-8,h-8,'#f0efe8',1,true,7); });
  slot('vent',0.6,0.6,(g,w,h)=>{ g.fillStyle='#6a5a4a'; g.fillRect(0,0,w,h); for(let y=6;y<h;y+=8){ g.fillStyle='#3a2e24'; g.fillRect(4,y,w-8,4);} });
  slot('barn_door',2.6,2.6,(g,w,h)=>{ g.fillStyle='#4a3020'; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=18){ g.fillStyle='rgba(0,0,0,0.3)'; g.fillRect(x,0,2,h);} g.strokeStyle='#2d1c10'; g.lineWidth=10; g.beginPath(); g.moveTo(10,10); g.lineTo(w/2,h-10); g.moveTo(w/2,10); g.lineTo(w-10,h-10); g.stroke(); g.fillStyle='#2d1c10'; g.fillRect(w/2-3,0,6,h); });
  slot('louver',1.1,2.2,(g,w,h)=>{ const r=w/2; g.save(); g.beginPath(); g.moveTo(0,h); g.lineTo(0,r); g.arc(r,r,r,Math.PI,0); g.lineTo(w,h); g.closePath(); g.clip(); g.fillStyle='#2a2522'; g.fillRect(0,0,w,h); for(let y=r*0.6;y<h;y+=12){ g.fillStyle='#6a5646'; g.fillRect(0,y,w,6);} g.restore(); });
  slot('clock',1.6,1.6,(g,w,h)=>{ g.fillStyle='rgba(0,0,0,0)'; g.clearRect(0,0,w,h); g.fillStyle='#1d1f22'; g.beginPath(); g.arc(w/2,h/2,w/2-1,0,TAU); g.fill(); g.fillStyle='#e9e4d4'; g.beginPath(); g.arc(w/2,h/2,w/2-9,0,TAU); g.fill(); g.fillStyle='#1d1f22'; for(let i=0;i<12;i++){ const a=i/12*TAU; g.fillRect(w/2+Math.cos(a)*(w/2-22)-3,h/2+Math.sin(a)*(w/2-22)-3,6,6);} g.strokeStyle='#1d1f22'; g.lineWidth=6; g.beginPath(); g.moveTo(w/2,h/2); g.lineTo(w/2+30,h/2-38); g.stroke(); g.lineWidth=4; g.beginPath(); g.moveTo(w/2,h/2); g.lineTo(w/2-10,h/2+58); g.stroke(); });
  slot('school',2.2,1.7,(g,w,h)=>{ reveal(g,w,h,10); frameWin(g,4,4,w-8,h-8,'#ecebe6',3,false,8); g.fillStyle='rgba(255,255,255,0.35)'; g.fillRect(12,12,20,h-24); });
  slot('balcony_door',1.0,2.3,(g,w,h)=>{ reveal(g,w,h,8); frameWin(g,4,4,w-8,h-4,'#f1f0ea',1,true,8); });
  // ---- gothic / church / fire station / cafe additions ----
  const pointed=(g,x,y,w,h)=>{ const ys=y+w*0.866; g.beginPath(); g.moveTo(x,y+h); g.lineTo(x,ys); g.arc(x+w,ys,w,Math.PI,Math.PI*4/3); g.arc(x,ys,w,Math.PI*5/3,Math.PI*2); g.lineTo(x+w,y+h); g.closePath(); };
  const leaded=(g,x,y,w,h,tint)=>{ const gr=g.createLinearGradient(x,y,x+w,y+h); gr.addColorStop(0,tint||'#4d5a5c'); gr.addColorStop(1,'#1c2426'); g.fillStyle=gr; g.fillRect(x,y,w,h); g.strokeStyle='rgba(190,190,180,0.55)'; g.lineWidth=1.5; for(let k=-h;k<w+h;k+=11){ g.beginPath(); g.moveTo(x+k,y); g.lineTo(x+k+h*0.6,y+h); g.stroke(); g.beginPath(); g.moveTo(x+k,y); g.lineTo(x+k-h*0.6,y+h); g.stroke(); } for(let i=0;i<14;i++){ g.fillStyle=pick(['rgba(160,40,40,0.35)','rgba(40,70,150,0.35)','rgba(190,160,50,0.3)','rgba(60,120,70,0.3)']); g.fillRect(x+rnd(0,w-8),y+rnd(0,h-8),8,8); } };
  slot('gothic',1.2,4.0,(g,w,h)=>{ g.fillStyle='#777'; g.fillRect(0,0,w,h); g.save(); pointed(g,0,0,w,h); g.clip(); g.fillStyle='#d6d0c2'; g.fillRect(0,0,w,h); g.save(); pointed(g,9,9,w-18,h-9); g.clip(); leaded(g,9,9,w-18,h-9); g.fillStyle='#8a857a'; g.fillRect(9,h*0.55,w-18,4); g.restore(); g.restore(); });
  slot('gothic_big',1.6,5.2,(g,w,h)=>{ g.fillStyle='#777'; g.fillRect(0,0,w,h); g.save(); pointed(g,0,0,w,h); g.clip(); g.fillStyle='#d6d0c2'; g.fillRect(0,0,w,h); g.save(); pointed(g,10,10,w-20,h-10); g.clip(); leaded(g,10,10,w-20,h-10,'#56605f'); g.restore();
    g.fillStyle='#d6d0c2'; g.fillRect(w/2-4,w*0.62,8,h); const lw=(w-20)/2-6; g.lineWidth=7; g.strokeStyle='#d6d0c2'; g.save(); g.beginPath(); g.arc(w/2,w*0.55,w*0.22,0,TAU); g.stroke(); g.restore(); g.fillStyle='#8a857a'; g.fillRect(10,h*0.58,w-20,4); g.restore(); });
  slot('twin',1.7,2.4,(g,w,h)=>{ g.fillStyle='#ecebe5'; g.fillRect(0,0,w,h); g.fillStyle='rgba(0,0,0,0.12)'; g.fillRect(0,h-8,w,8); const ow=w*0.32, r=ow/2; for(const x0 of [w*0.13,w*0.55]){ g.save(); g.beginPath(); g.moveTo(x0,h-14); g.lineTo(x0,14+r); g.arc(x0+r,14+r,r,Math.PI,0); g.lineTo(x0+ow,h-14); g.closePath(); g.clip(); g.fillStyle='#211d1a'; g.fillRect(0,0,w,h); for(let y=14+r*0.7;y<h;y+=13){ g.fillStyle='#5e4d3f'; g.fillRect(x0,y,ow,6); } g.restore(); } });
  slot('sq_small',0.75,0.75,(g,w,h)=>{ g.fillStyle='#efeee8'; g.fillRect(0,0,w,h); g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(12,12,w-24,5); glass(g,14,16,w-28,h-30,false); });
  const darkWin=(g,w,h,cols,rows,arched)=>{ g.fillStyle='#e9c3a6'; g.fillRect(0,0,w,h); g.save(); if(arched){ const r=w/2; g.beginPath(); g.moveTo(0,h); g.lineTo(0,r); g.arc(r,r,r,Math.PI,0); g.lineTo(w,h); g.closePath(); g.clip(); } g.fillStyle='#2f3337'; g.fillRect(0,0,w,h); glass(g,9,9,w-18,h-18,false); g.fillStyle='#2f3337'; for(let i=1;i<cols;i++) g.fillRect(9+(w-18)*i/cols-3,0,6,h); for(let j=1;j<rows;j++) g.fillRect(0,9+(h-18)*j/rows-3,w,6); g.restore(); };
  slot('fire_grid',1.3,1.45,(g,w,h)=>darkWin(g,w,h,2,3,false));
  slot('fire_grid_t',1.3,2.1,(g,w,h)=>darkWin(g,w,h,2,4,false));
  slot('fire_arch',1.4,2.6,(g,w,h)=>darkWin(g,w,h,2,4,true));
  slot('fire_curtain',1.8,3.4,(g,w,h)=>darkWin(g,w,h,2,5,false));
  slot('niche',0.8,1.3,(g,w,h)=>{ g.fillStyle='#efeee8'; g.fillRect(0,0,w,h); const r=w/2-8; g.save(); g.beginPath(); g.moveTo(8,h-10); g.lineTo(8,8+r); g.arc(w/2,8+r,r,Math.PI,0); g.lineTo(w-8,h-10); g.closePath(); g.clip(); g.fillStyle='#6c7a86'; g.fillRect(0,0,w,h); g.fillStyle='#f3efe2'; g.beginPath(); g.ellipse(w/2,h*0.62,r*0.42,h*0.3,0,0,TAU); g.fill(); g.beginPath(); g.arc(w/2,h*0.3,r*0.26,0,TAU); g.fill(); g.fillStyle='#c9a55a'; g.beginPath(); g.arc(w/2,h*0.27,r*0.42,Math.PI,0); g.lineWidth=3; g.strokeStyle='#c9a55a'; g.stroke(); g.restore(); });
  slot('portal',2.5,4.1,(g,w,h)=>{ g.fillStyle='#777'; g.fillRect(0,0,w,h); const cols=['#e9e4d8','#cfc8b8','#ebe6da','#c5beae']; const bands=4; for(let i=0;i<bands;i++){ const inset=i*(w-187)/2/bands; g.fillStyle=cols[i]; g.save(); pointed(g,inset,inset*1.05,w-2*inset,h-inset*1.05); g.fill(); g.restore(); } const iw=187, ix=(w-iw)/2; g.save(); pointed(g,ix,44,iw,h-44); g.clip(); g.clearRect(0,0,w,h); g.restore(); });
  slot('fire_door',1.6,2.6,(g,w,h)=>darkWin(g,w,h,2,4,true));
  slot('cafe_up',1.3,1.5,(g,w,h)=>{ g.fillStyle='#f5f5f1'; g.fillRect(0,0,w,h); const bh=h*0.16; frameWin(g,12,bh,w-24,h-bh-12,'#f1f0ea',2,true,8); roller(g,w-16,h-12,bh,0.75,'#7a3b27'); g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(8,8,w-16,5); });
  slot('cafe_dn',1.7,1.45,(g,w,h)=>{ g.fillStyle='#f5f5f1'; g.fillRect(0,0,w,h); const bh=h*0.14; frameWin(g,10,bh,w-20,h-bh-10,'#f1f0ea',2,false,8); roller(g,w-12,h-10,bh,0.35,'#7a3b27'); });
  TEX.winH=cy+rowH; if(cy+rowH>H) console.warn('window atlas overflow',cy+rowH);
  TEX.stain=stainTex();
  TEX.win=mkTex(c,{repeat:false});
  TEX.win.minFilter=THREE.LinearMipmapLinearFilter;
}
// small text sign textures
function signTex(lines,{w=512,h=128,bg='#fff',fg='#111',border='#111',font='Manrope, Arial, sans-serif',bw=10,size=64,weight=800}={}){
  const c=cvs(w,h), g=c.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,w,h); if(border){ g.strokeStyle=border; g.lineWidth=bw; g.strokeRect(bw,bw,w-2*bw,h-2*bw); }
  g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; const L=Array.isArray(lines)?lines:[lines];
  L.forEach((t,i)=>{ const s=typeof size==='number'?size:size[i]; g.font=`${weight} ${s}px ${font}`; g.fillText(t,w/2,h*(i+0.5)/L.length+2); });
  return mkTex(c,{repeat:false});
}
