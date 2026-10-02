/* ===================== car radio =====================
   Stations are synthesised live with WebAudio (no copyrighted music, nothing to download):
   Radio Kaj (zagorski valcer), Hit FM Tuhelj (pop), Noćna vožnja (synthwave), Lounge Krapina (jazz), radio off.
   In a car: R or the mouse wheel changes station (GTA style), the name flashes at the top of the screen. */
const RADIO={st:1,on:false,next:0,step:0,gain:null,ctx:null,noise:null,tagT:0,bar:0};
const NOTE=(n)=>440*Math.pow(2,(n-69)/12); // MIDI note -> Hz
function rdInit(){ if(RADIO.ctx) return true; try{ if(typeof audInit==='function') audInit(); }catch(e){} const C=(typeof AUD!=='undefined'&&AUD.ctx)||new (window.AudioContext||window.webkitAudioContext)(); RADIO.ctx=C;
  const lp=C.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=6500; const hp=C.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=70; const comp=C.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=4;
  const g=C.createGain(); g.gain.value=0; g.connect(hp); hp.connect(lp); lp.connect(comp); comp.connect(C.destination); RADIO.gain=g;
  const dl=C.createDelay(1.0); dl.delayTime.value=0.33; const fb=C.createGain(); fb.gain.value=0.28; const wet=C.createGain(); wet.gain.value=0.22; dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(g); RADIO.fx=dl;
  const nb=C.createBuffer(1,C.sampleRate,C.sampleRate), d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; RADIO.noise=nb; return true; }
function rdEnv(t,a,dec,peak,node){ const g=RADIO.ctx.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(peak,t+a); g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec); g.connect(node||RADIO.gain); return g; }
function rdOsc(type,f,t,dur,out,det=0){ const o=RADIO.ctx.createOscillator(); o.type=type; o.frequency.setValueAtTime(f,t); o.detune.value=det; o.connect(out); o.start(t); o.stop(t+dur+0.05); return o; }
const RI={
  pluck(t,n,v=0.16,dec=0.55){ const C=RADIO.ctx; const f=C.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(5200,t); f.frequency.exponentialRampToValueAtTime(900,t+dec); const e=rdEnv(t,0.004,dec,v); f.connect(e); rdOsc('triangle',NOTE(n),t,dec,f); rdOsc('square',NOTE(n),t,dec,f,6).frequency.value=NOTE(n); },
  bass(t,n,dur=0.3,v=0.3){ const e=rdEnv(t,0.01,dur,v); rdOsc('sine',NOTE(n),t,dur,e); const e2=rdEnv(t,0.01,dur*0.6,v*0.35); rdOsc('triangle',NOTE(n+12),t,dur,e2); },
  pad(t,ns,dur,v=0.05,type='sawtooth',cut=1400){ const C=RADIO.ctx; const f=C.createBiquadFilter(); f.type='lowpass'; f.frequency.value=cut; const g=C.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.25); g.gain.setValueAtTime(v,t+dur-0.2); g.gain.exponentialRampToValueAtTime(0.0001,t+dur+0.3); f.connect(g); g.connect(RADIO.gain); for(const n of ns){ rdOsc(type,NOTE(n),t,dur+0.3,f,-7); rdOsc(type,NOTE(n),t,dur+0.3,f,7); } },
  kick(t,v=0.7){ const C=RADIO.ctx; const o=C.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(42,t+0.16); const e=rdEnv(t,0.003,0.28,v); o.connect(e); o.start(t); o.stop(t+0.35); },
  noise(t,dur,v,ftype,fq,q=1,out){ const C=RADIO.ctx; const s=C.createBufferSource(); s.buffer=RADIO.noise; const f=C.createBiquadFilter(); f.type=ftype; f.frequency.value=fq; f.Q.value=q; const e=rdEnv(t,0.002,dur,v,out); s.connect(f); f.connect(e); s.start(t,Math.random()*0.5); s.stop(t+dur+0.05); },
  snare(t,v=0.32){ RI.noise(t,0.18,v,'bandpass',1800,0.8); const e=rdEnv(t,0.002,0.09,v*0.6); rdOsc('triangle',190,t,0.12,e); },
  hat(t,v=0.08,open=false){ RI.noise(t,open?0.22:0.05,v,'highpass',8000,0.7); },
  ride(t,v=0.06){ RI.noise(t,0.35,v,'bandpass',6500,3); },
  ep(t,n,dur=0.9,v=0.09){ const e=rdEnv(t,0.006,dur,v); rdOsc('sine',NOTE(n),t,dur,e); const e2=rdEnv(t,0.004,dur*0.35,v*0.45); rdOsc('sine',NOTE(n+12),t,dur,e2); },
  lead(t,n,dur,v=0.07,type='square'){ const C=RADIO.ctx; const f=C.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2600; const g=C.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.02); g.gain.setValueAtTime(v,t+dur*0.7); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); f.connect(g); g.connect(RADIO.gain); g.connect(RADIO.fx); const o=rdOsc(type,NOTE(n),t,dur,f); const lfo=C.createOscillator(); lfo.frequency.value=5.5; const lg=C.createGain(); lg.gain.value=4; lfo.connect(lg); lg.connect(o.detune); lfo.start(t); lfo.stop(t+dur+0.05); } };
// melodies are generated per song from a seed, so each station has a recognisable tune that repeats
function rdMotif(seed,len,scale,span){ const R=mulberry32(seed); const m=[]; let p=Math.floor(span/2); for(let i=0;i<len;i++){ p=clamp(p+Math.floor(R()*5)-2,0,span-1); m.push(R()<0.18?null:scale[p%scale.length]+12*Math.floor(p/scale.length)); } return m; }
const STATIONS=[
  {n:'RADIO ISKLJUČEN'},
  {n:'RADIO KAJ', sub:'zagorski valcer', bpm:168, per:3, // 3/4: bass on 1, tamburica chords on 2-3, melody on top
   prog:[[55,59,62],[55,59,62],[50,54,57,60],[50,54,57,60],[50,54,57,60],[50,54,57,60],[55,59,62],[55,59,62],[48,52,55],[48,52,55],[55,59,62],[55,59,62],[50,54,57],[50,54,57],[55,59,62],[55,59,62]],
   mel:rdMotif(31,48,[67,69,71,72,74,76,78],10),
   play(s,t,sd){ const bar=Math.floor(s/3)%16, b=s%3; const ch=this.prog[bar]; if(b===0){ RI.bass(t,ch[0]-12,sd*0.9,0.32); if(bar%2===0) RI.pad(t,ch.map(n=>n+12),sd*6,0.018,'square',900); } else { for(const n of ch) RI.pluck(t+Math.random()*0.012,n+12,0.07,0.32); }
     const m=this.mel[s%48]; if(m!==null&&m!==undefined&&(s%3!==2||Math.random()<0.5)) RI.pluck(t,m,0.13,0.5); } },
  {n:'HIT FM TUHELJ', sub:'pop', bpm:116*4, per:16,
   prog:[[48,52,55],[43,47,50],[45,48,52],[41,45,48]], mel:rdMotif(77,32,[72,74,76,79,81],8),
   play(s,t,sd){ const st=s%16, bar=Math.floor(s/16)%4; const ch=this.prog[bar];
     if(st%8===0||st===10) RI.kick(t,0.6); if(st===4||st===12) RI.snare(t,0.26); if(st%2===0) RI.hat(t,st%4===2?0.07:0.04);
     if(st%2===0) RI.bass(t,ch[0]-12+(st%4===2?12:0),sd*1.6,0.24); if(st===0) RI.pad(t,ch.map(n=>n+12),sd*15.5,0.032,'sawtooth',1600);
     if(Math.floor(s/64)%2===1&&st%2===0){ const m=this.mel[(s/2|0)%32]; if(m) RI.lead(t,m,sd*1.8,0.05); } } },
  {n:'NOĆNA VOŽNJA', sub:'synthwave', bpm:96*4, per:16,
   prog:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],
   play(s,t,sd){ const st=s%16, bar=Math.floor(s/16)%4; const ch=this.prog[bar]; if(st%4===0) RI.kick(t,0.55); if(st===4||st===12) RI.snare(t,0.22); if(st%4===2) RI.hat(t,0.05,true);
     const ar=[ch[0],ch[1],ch[2],ch[1]+12][st%4]+12; RI.pluck(t,ar,0.05,0.22); if(st%8===0) RI.bass(t,ch[0]-12,sd*7,0.2); if(st===0) RI.pad(t,ch.map(n=>n+12),sd*15.5,0.04,'sawtooth',1100); } },
  {n:'LOUNGE KRAPINA', sub:'jazz', bpm:92*3, per:12, // swung 8ths as triplets: 12 steps per bar
   prog:[[50,53,57,60],[43,47,50,53],[48,52,55,59],[45,49,52,55]], walk:[[38,41,43,45],[31,35,38,40],[36,40,43,47],[33,37,40,43]],
   play(s,t,sd){ const st=s%12, bar=Math.floor(s/12)%4; if(st%3===0){ RI.bass(t,this.walk[bar][st/3]-0,sd*2.6,0.26); RI.ride(t,0.05); } if(st===5||st===11) RI.ride(t,0.035); if(st===3||st===9) RI.hat(t,0.04);
     if(st===2||st===8){ for(const n of this.prog[bar]) RI.ep(t+Math.random()*0.01,n+12,sd*3,0.05); } if(Math.floor(s/48)%2===1&&(st===0||st===5||st===6)){ const sc=[62,65,67,69,72,74]; RI.ep(t,sc[(s*7+bar)%sc.length],sd*2,0.07); } } }];
function radioTag(){ let el=document.getElementById('radiotag'); if(!el){ el=document.createElement('div'); el.id='radiotag'; document.body.appendChild(el); const st=document.createElement('style'); st.textContent='#radiotag{position:fixed;left:50%;top:calc(26px + env(safe-area-inset-top,0px));transform:translateX(-50%);font:400 30px Anton,Impact,sans-serif;color:#fff;-webkit-text-stroke:1.2px #000;text-shadow:2px 2px 0 #000;letter-spacing:.04em;pointer-events:none;opacity:0;transition:opacity .35s;z-index:30;text-align:center}#radiotag.on{opacity:1}#radiotag small{display:block;font:700 13px Manrope,sans-serif;letter-spacing:.2em;-webkit-text-stroke:0;color:#e9e3c8}'; document.head.appendChild(st); }
  const S=STATIONS[RADIO.st]; el.innerHTML=S.n+(S.sub?'<small>'+S.sub.toUpperCase()+'</small>':''); el.classList.add('on'); RADIO.tagT=GAME.time+2.6; }
function radioStep(d){ if(!PLAYER.driving&&!PLAYER.riding) return; rdInit(); RADIO.st=(RADIO.st+d+STATIONS.length)%STATIONS.length; RADIO.step=0; RADIO.next=RADIO.ctx.currentTime+0.12; radioTag(); try{ if(typeof blip==='function') blip('click'); }catch(e){} }
function radioTick(dt){ const inCar=!!(PLAYER.driving||PLAYER.riding)&&GAME.started&&!GAME.paused&&!(PLAYER.driving&&PLAYER.driving.bike);
  if(RADIO.tagT&&GAME.time>RADIO.tagT){ const el=document.getElementById('radiotag'); if(el) el.classList.remove('on'); RADIO.tagT=0; }
  if(inCar&&!RADIO.on){ if(!rdInit()) return; RADIO.on=true; RADIO.next=RADIO.ctx.currentTime+0.15; RADIO.step=0; radioTag(); }
  if(!RADIO.ctx) return; const C=RADIO.ctx, g=RADIO.gain.gain; const want=inCar&&RADIO.st>0?0.34:0; g.setTargetAtTime(want,C.currentTime,inCar?0.25:0.12); if(!inCar){ RADIO.on=false; return; }
  const S=STATIONS[RADIO.st]; if(!S.play) return; const sd=60/S.bpm; if(RADIO.next<C.currentTime-0.5) RADIO.next=C.currentTime+0.05;
  while(RADIO.next<C.currentTime+0.3){ try{ S.play(RADIO.step,RADIO.next,sd); }catch(e){} RADIO.step++; RADIO.next+=sd; } }
addEventListener('keydown',e=>{ if(e.code==='KeyR'&&(PLAYER.driving||PLAYER.riding)&&GAME.started&&!GAME.paused){ radioStep(1); } });
