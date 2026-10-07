/* ===================== voices =====================
   Recorded lines in voices/ always win. Without a recording the line is spoken by the device's own Croatian voice
   (Edge on Windows has natural Microsoft voices, iPhone has "Lana", Android has Google's Croatian voice): the best
   one available is picked, and every character gets their own pitch and pace (women higher, old men lower and
   slower). The dialogue waits for the sentence to be finished. Off in POSTAVKE → GLASOVI if you prefer silence. */
const TTS={v:null,on:true,ready:false,cur:null};
try{ if(localStorage.getItem('tuhelj_tts2')==='0') TTS.on=false; }catch(e){}
function ttsPick(){ const S=window.speechSynthesis; if(!S) return null; const L=S.getVoices().filter(v=>/^hr/i.test(v.lang)||/croat|hrvat/i.test(v.name)); if(!L.length) return null;
  const score=v=>(/natural|neural|online|premium|enhanced|poboljšan/i.test(v.name)?10:0)+(/microsoft/i.test(v.name)?2:0)+(v.localService?0:1); return L.sort((a,b)=>score(b)-score(a))[0]; }
function ttsInit(){ const S=window.speechSynthesis; if(!S) return; const f=()=>{ TTS.v=ttsPick(); TTS.ready=true; }; f(); S.onvoiceschanged=f; }
const OLD=new Set(['Poljanec Martin','Jovo','Joža st.','Baka Štefica','Vatrogasac Krtek']);
function ttsVoiceFor(who){ const fem=(typeof rbFemale==='function')?rbFemale({},who):/a$/.test(String(who).split(' ')[0]); let h=0; for(const c of String(who)) h=(h*31+c.charCodeAt(0))>>>0; const j=((h%9)-4)*0.025;
  if(fem) return {pitch:1.18+j,rate:1.02}; if(OLD.has(who)) return {pitch:0.72+j,rate:0.9}; if(who==='Ti'||who===NET.name) return {pitch:0.95,rate:1.04}; return {pitch:0.86+j,rate:1.0}; }
function ttsSay(text,who,dist){ const S=window.speechSynthesis; if(!S||!TTS.on||OW.muted||!TTS.v) return false; try{ S.cancel(); const u=new SpeechSynthesisUtterance(String(text).replace(/\(.*?\)\s*/g,'')); u.voice=TTS.v; u.lang=TTS.v.lang; const P=ttsVoiceFor(who); u.pitch=P.pitch; u.rate=P.rate; u.volume=clamp(1-(dist||0)/20,0.2,1);
    const D=GTA.dlg, i=D?D.i:-1; u.onend=()=>{ if(GTA.dlg&&GTA.dlg===D&&D.i===i){ D.dur=Math.min(D.dur||4,(D.t||0)+0.45); } }; if(D){ D.dur=Math.max(D.dur||4,1.2+String(text).length*0.085); } S.speak(u); TTS.cur=u; return true; }catch(e){ return false; } }
{ const _sp=speak; speak=function(text,who,dist){ const sl=voiceSlug(text); const rec=VOICE_SET.size&&[sl+'.mp3',sl+'.ogg',sl+'.m4a'].some(x=>VOICE_SET.has(x)); if(rec) return _sp(text,who,dist); ttsSay(text,who,dist); }; }
// the player's own lines ('Ti') and the narrator are spoken too
{ const _sd=showDlg; showDlg=function(){ _sd(); const D=GTA.dlg; if(!D){ try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} return; } const [who,txt]=D.lines[D.i]; if(who==='Tuhelj') ttsSay(txt,'Pripovjedač',0); }; }
// browsers (iPhone especially) only allow speech after the first tap: unlock it then
addEventListener('pointerdown',()=>{ if(TTS.unlocked||!window.speechSynthesis) return; TTS.unlocked=true; ttsInit(); try{ const u=new SpeechSynthesisUtterance(' '); u.volume=0; speechSynthesis.speak(u); }catch(e){} },{capture:true});
addEventListener('keydown',()=>{ if(!TTS.ready) ttsInit(); },{once:true});
ttsInit();
// switch in the pause menu settings
setInterval(()=>{ const pn=document.querySelector('#pause .pm .panel'); if(!pn||!/POSTAVKE/.test(pn.textContent)||pn.querySelector('.ttsrow')) return; const r=document.createElement('div'); r.className='row ttsrow'; const l=document.createElement('label'); l.textContent='GLASOVI'; const q=document.createElement('div'); q.className='q'; const s=document.createElement('span');
  const lab=()=>{ s.textContent=TTS.on?(TTS.v?'UKLJUČENI · '+TTS.v.name.replace(/Microsoft |Google |Online|\(Natural\)| - .*$/g,'').trim():'UKLJUČENI · nema hrvatskog glasa na uređaju'):'ISKLJUČENI'; s.className=TTS.on?'on':''; }; lab();
  s.addEventListener('click',()=>{ TTS.on=!TTS.on; try{ localStorage.setItem('tuhelj_tts2',TTS.on?'1':'0'); }catch(e){} if(!TTS.on) try{ speechSynthesis.cancel(); }catch(e){} lab(); }); q.appendChild(s); r.append(l,q); pn.appendChild(r); },400);
