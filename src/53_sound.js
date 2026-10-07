/* ===================== sound of the village and of the car =====================
   Engine: revs come from speed and a 5-gear box (the revs drop at every shift), three layers — the firing note,
   a low rumble one octave down and intake noise — and the filter opens when you accelerate.
   Tyres squeal when you corner hard, brake hard or pull the handbrake.
   Village: church bells at 7, 12 and 19 h (louder near the church), dogs barking from yards, hens near farms,
   a tractor somewhere in the fields, crickets at night. Everything is synthesised, nothing to download. */
const SND={eng:null,last:0,rpm:800,gear:1,shiftT:0,squeal:null,amb:{dog:8,hen:12,tractor:40,bell:-1},cricket:null};
function sndOk(){ return typeof AUD!=='undefined'&&AUD.ctx&&!OW.muted; }
function sndOut(){ return AUD.master||AUD.ctx.destination; }
function sndEngInit(){ const C=AUD.ctx; const E={}; E.out=C.createGain(); E.out.gain.value=0; E.lp=C.createBiquadFilter(); E.lp.type='lowpass'; E.lp.frequency.value=600; E.lp.Q.value=2.5; E.lp.connect(E.out); E.out.connect(sndOut());
  E.o1=C.createOscillator(); E.o1.type='sawtooth'; E.g1=C.createGain(); E.g1.gain.value=0.55; E.o1.connect(E.g1); E.g1.connect(E.lp);
  E.o2=C.createOscillator(); E.o2.type='square'; E.g2=C.createGain(); E.g2.gain.value=0.35; E.o2.connect(E.g2); E.g2.connect(E.lp);
  E.o3=C.createOscillator(); E.o3.type='triangle'; E.g3=C.createGain(); E.g3.gain.value=0.25; E.o3.connect(E.g3); E.g3.connect(E.lp);
  E.n=C.createBufferSource(); E.n.buffer=AUD.noise; E.n.loop=true; E.nf=C.createBiquadFilter(); E.nf.type='bandpass'; E.nf.frequency.value=900; E.nf.Q.value=0.8; E.ng=C.createGain(); E.ng.gain.value=0; E.n.connect(E.nf); E.nf.connect(E.ng); E.ng.connect(E.out);
  for(const o of [E.o1,E.o2,E.o3]) o.start(); E.n.start(); SND.eng=E;
  const S={}; S.n=C.createBufferSource(); S.n.buffer=AUD.noise; S.n.loop=true; S.f=C.createBiquadFilter(); S.f.type='bandpass'; S.f.frequency.value=2600; S.f.Q.value=6; S.g=C.createGain(); S.g.gain.value=0; S.n.connect(S.f); S.f.connect(S.g); S.g.connect(sndOut()); S.n.start(); SND.squeal=S; }
const GEARS=[0,9,17,26,36,1e9]; // shift-up speeds in m/s
function engineTick(dt){ if(!sndOk()){ if(SND.eng){ SND.eng.out.gain.value=0; SND.squeal.g.gain.value=0; } return; } if(!SND.eng) sndEngInit(); const E=SND.eng, S=SND.squeal, C=AUD.ctx, t=C.currentTime;
  const v=PLAYER.driving; const car=v&&!v.bike&&!PLAYER.heli; AUD.engG.gain.value=0; // the old single-tone engine stays silent
  if(!car){ E.out.gain.setTargetAtTime(0,t,0.15); S.g.gain.setTargetAtTime(0,t,0.08); return; }
  const sp=Math.abs(v.st.v), acc=(sp-SND.last)/Math.max(dt,1e-3); SND.last=sp;
  let g=1; while(g<5&&sp>GEARS[g]) g++; if(g!==SND.gear){ SND.shiftT=0.18; SND.gear=g; } SND.shiftT=Math.max(0,SND.shiftT-dt);
  const lo=GEARS[g-1], hi=Math.min(GEARS[g],lo+14); const k=clamp((sp-lo)/(hi-lo),0,1); const tractor=v.tractor; const formula=v.formula;
  let rpm=(sp<0.4?850:1100+k*(formula?7500:4200))*(SND.shiftT>0?0.82:1); if(tractor) rpm=700+sp*120; SND.rpm+=(rpm-SND.rpm)*Math.min(1,dt*9);
  const thr=clamp(acc/3,0,1); const cyl=tractor?3:4; const f=SND.rpm/60*cyl/2;
  E.o1.frequency.setTargetAtTime(f,t,0.03); E.o2.frequency.setTargetAtTime(f*0.5,t,0.03); E.o3.frequency.setTargetAtTime(f*2.01,t,0.03);
  E.lp.frequency.setTargetAtTime(380+f*3.5+thr*1400,t,0.05); E.ng.gain.setTargetAtTime(0.04+thr*0.12,t,0.05); E.nf.frequency.setTargetAtTime(500+f*4,t,0.05);
  E.out.gain.setTargetAtTime((tractor?0.1:0.075)+thr*0.05+Math.min(0.04,sp*0.0015),t,0.08);
  // tyres: sideways grip used (speed × turn rate) and hard braking
  const yr=Math.abs(angDiffS(v.st.yaw,SND.yaw0===undefined?v.st.yaw:SND.yaw0))/Math.max(dt,1e-3); SND.yaw0=v.st.yaw; const lat=sp*yr; const brake=-acc;
  let sq=0; if(sp>6){ if(lat>8) sq=Math.min(1,(lat-8)/10); if(brake>9) sq=Math.max(sq,Math.min(1,(brake-9)/8)); if(v.hand||(typeof KEYS!=='undefined'&&KEYS&&KEYS.Space)) sq=Math.max(sq,0.6); }
  if(tractor) sq=0;S.f.frequency.setTargetAtTime(2300+Math.sin(GAME.time*31)*250,t,0.02); S.g.gain.setTargetAtTime(sq*0.09,t,0.05); }
function angDiffS(a,b){ let d=(a-b)%TAU; if(d>Math.PI) d-=TAU; if(d<-Math.PI) d+=TAU; return d; }
/* ---- village ---- */
function sndAt(x,z,maxD){ const d=Math.hypot(x-PLAYER.pos.x,z-PLAYER.pos.z); return d>maxD?0:Math.pow(1-d/maxD,1.6); }
function bellToll(vol){ const C=AUD.ctx; let t=C.currentTime+0.05; const n=GAME.hour<9?6:GAME.hour<15?12:8;
  for(let i=0;i<n;i++){ const base=i%2?392:330; for(const [m,a,dec] of [[0.5,0.5,4.5],[1,1,3.2],[1.19,0.45,2.2],[1.5,0.35,2.0],[2.0,0.4,1.6],[2.51,0.2,1.1],[2.66,0.18,1.0]]){ const o=C.createOscillator(), g=C.createGain(); o.type='sine'; o.frequency.value=base*m; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.06*a*vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dec); o.connect(g); g.connect(sndOut()); o.start(t); o.stop(t+dec+0.1); } t+=1.6; } }
function dogBark(vol){ const C=AUD.ctx; let t=C.currentTime+0.02; const n=1+Math.floor(Math.random()*3), f0=220+Math.random()*180;
  for(let i=0;i<n;i++){ const o=C.createOscillator(), g=C.createGain(), f=C.createBiquadFilter(); o.type='sawtooth'; o.frequency.setValueAtTime(f0*1.3,t); o.frequency.exponentialRampToValueAtTime(f0*0.7,t+0.12); f.type='bandpass'; f.frequency.value=900; f.Q.value=1.2;
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.22*vol,t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+0.16); o.connect(f); f.connect(g); g.connect(sndOut()); o.start(t); o.stop(t+0.2);
    const s=C.createBufferSource(); s.buffer=AUD.noise; const sf=C.createBiquadFilter(); sf.type='bandpass'; sf.frequency.value=1500; const sg=C.createGain(); sg.gain.setValueAtTime(0.08*vol,t); sg.gain.exponentialRampToValueAtTime(0.0001,t+0.1); s.connect(sf); sf.connect(sg); sg.connect(sndOut()); s.start(t,Math.random()); s.stop(t+0.12); t+=0.28+Math.random()*0.15; } }
function henCluck(vol){ const C=AUD.ctx; let t=C.currentTime+0.02; const n=3+Math.floor(Math.random()*5);
  for(let i=0;i<n;i++){ const o=C.createOscillator(), g=C.createGain(); o.type='square'; const f=600+Math.random()*250+(i===n-1?400:0); o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*(i===n-1?1.6:0.8),t+(i===n-1?0.25:0.06));
    const bf=C.createBiquadFilter(); bf.type='bandpass'; bf.frequency.value=1200; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.07*vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+(i===n-1?0.3:0.07)); o.connect(bf); bf.connect(g); g.connect(sndOut()); o.start(t); o.stop(t+0.35); t+=0.11+Math.random()*0.08; } }
function tractorFar(vol){ const C=AUD.ctx, t=C.currentTime; const dur=14+Math.random()*10; const o=C.createOscillator(), o2=C.createOscillator(), g=C.createGain(), f=C.createBiquadFilter(); o.type='sawtooth'; o2.type='square'; o.frequency.value=38+Math.random()*6; o2.frequency.value=o.frequency.value*0.5; f.type='lowpass'; f.frequency.value=260;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.035*vol,t+dur*0.4); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(f); o2.connect(f); f.connect(g); g.connect(sndOut()); o.start(t); o2.start(t); o.stop(t+dur+0.1); o2.stop(t+dur+0.1); }
function cricketsInit(){ const C=AUD.ctx; const K={}; K.o=C.createOscillator(); K.o.type='sine'; K.o.frequency.value=4600; K.am=C.createGain(); K.am.gain.value=0; K.lfo=C.createOscillator(); K.lfo.type='square'; K.lfo.frequency.value=28; K.lg=C.createGain(); K.lg.gain.value=0.5;
  K.lfo.connect(K.lg); K.lg.connect(K.am.gain); K.out=C.createGain(); K.out.gain.value=0; K.o.connect(K.am); K.am.connect(K.out); K.out.connect(sndOut()); K.o.start(); K.lfo.start(); SND.cricket=K; }
function ambientTick(dt){ if(!sndOk()||!GAME.started) return; const C=AUD.ctx, A=SND.amb, h=GAME.hour; const out=!INSIDE&&!PLAYER.driving; const quiet=INSIDE?0.25:PLAYER.driving?0.35:1;
  // bells: on the hour at 7, 12, 19
  const slot=[7,12,19].find(H=>h>=H&&h<H+0.05); if(slot!==undefined&&A.bell!==slot){ A.bell=slot; const ch=LANDMARKS.church; const vol=ch?Math.max(0.12,sndAt(ch.x,ch.z,900)):0.2; bellToll(vol*quiet); } if(slot===undefined&&A.bell!==-1&&![7,12,19].some(H=>h>=H&&h<H+0.05)) A.bell=-1;
  const day=h>6&&h<21;
  A.dog-=dt; if(A.dog<=0){ A.dog=12+Math.random()*30; const b=BLD[Math.floor(Math.random()*BLD.length)]; if(b&&b.rect){ const vol=sndAt(b.rect[0],b.rect[1],140); if(vol>0.03) dogBark(vol*quiet); } }
  A.hen-=dt; if(A.hen<=0){ A.hen=15+Math.random()*35; if(day){ const b=BLD.filter(q=>q.rect&&(q.k==='barn'||q.k==='shed'))[Math.floor(Math.random()*40)]; const p=b?b.rect:null; if(p){ const vol=sndAt(p[0],p[1],90); if(vol>0.03) henCluck(vol*quiet); } } }
  A.tractor-=dt; if(A.tractor<=0){ A.tractor=60+Math.random()*90; if(day&&out) tractorFar(0.6+Math.random()*0.4); }
  if(!SND.cricket) cricketsInit(); const night=h>20.5||h<5; const K=SND.cricket; K.out.gain.setTargetAtTime(night&&!INSIDE?(PLAYER.driving?0.004:0.012):0,C.currentTime,1.5); K.o.frequency.setTargetAtTime(4400+Math.sin(GAME.time*0.3)*300,C.currentTime,0.5); }
{ const _at=audioTick; audioTick=function(dt){ _at(dt); try{ engineTick(dt); ambientTick(dt); }catch(e){ if(!SND.err){ SND.err=1; console.warn('zvuk',e); } } }; }
