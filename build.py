import os
import json, glob, os, sys
ROOT=os.path.dirname(os.path.abspath(__file__))
DEV='--dev' in sys.argv; sys.argv=[a for a in sys.argv if a!='--dev']
js='\n'.join(open(f,encoding='utf-8').read() for f in sorted(glob.glob(ROOT+'/src/*.js')) if DEV or not f.endswith('99_dev.js'))
data=json.load(open(ROOT+'/data.json',encoding='utf-8'))
djs=json.dumps(data,separators=(',',':')).replace('</','<\\/')
THREE_URL='https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js'
HTML='''<!DOCTYPE html>
<html lang="hr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#0f1311">
%%MANIFEST%%
<title>Tuhelj — Povratak u Zagorje</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);
 --bg:#0f1311;--panel:rgba(22,24,21,.58);--panel-strong:rgba(20,22,19,.82);--line:rgba(255,255,255,.14);--ink:#f5f1e8;--muted:rgba(245,241,232,.66);--accent:#d8653a;--accent-ink:#fff8f2;--chip:rgba(255,255,255,.1);
 --serif:"Instrument Serif",Georgia,"Times New Roman",serif;--sans:Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--panel:rgba(14,16,14,.62);--panel-strong:rgba(12,14,12,.86)}}
:root[data-theme="dark"]{--panel:rgba(14,16,14,.62);--panel-strong:rgba(12,14,12,.86)}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
html,body{height:100%;height:100dvh;margin:0;overflow:hidden;background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;overscroll-behavior:none;touch-action:none}
*{box-sizing:border-box}
#view{position:fixed;inset:0}
#view canvas{display:block;width:100%;height:100%;outline:none}
button{font-family:var(--sans)}
/* start */
#start{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:flex-start;padding:calc(28px + env(safe-area-inset-top,0px)) 28px calc(28px + env(safe-area-inset-bottom,0px));background:linear-gradient(90deg,rgba(8,10,8,.78) 0%,rgba(8,10,8,.42) 38%,rgba(8,10,8,0) 64%),linear-gradient(0deg,rgba(8,10,8,.55),rgba(8,10,8,0) 45%);transition:opacity .6s ease;z-index:20}
#start.gone{opacity:0;pointer-events:none}
#start .card{opacity:0!important;pointer-events:none!important} #start{background:#0b0b0b!important}
#start:after{content:"TUHELJ";position:absolute;left:5vw;bottom:13vh;font:400 min(19vw,190px) Anton,Impact,sans-serif;color:#fff;-webkit-text-stroke:5px #0a0a0a;text-shadow:7px 7px 0 #0a0a0a;transform:rotate(-3deg);z-index:1;pointer-events:none}
#start.ttready:after{display:none}
.card{max-width:470px;width:100%}
.eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:700}
h1{font-family:var(--serif);font-weight:400;font-size:clamp(64px,11vw,124px);line-height:.9;margin:.12em 0 .08em;letter-spacing:-.01em}
h1 em{font-style:italic;color:#f2c9a8}
.lede{font-size:16px;line-height:1.55;color:var(--muted);margin:0 0 22px;max-width:40ch}
.prog{height:4px;background:var(--chip);border-radius:4px;overflow:hidden;margin:0 0 8px}
#bar{height:100%;width:0;background:linear-gradient(90deg,#f2c9a8,var(--accent));transition:width .25s ease}
#ltxt{font-size:12.5px;color:var(--muted);min-height:18px;margin-bottom:16px}
#go{appearance:none;border:0;background:var(--accent);color:var(--accent-ink);font-weight:800;font-size:16px;padding:15px 26px;border-radius:999px;cursor:pointer;box-shadow:0 10px 30px rgba(216,101,58,.35);transition:transform .15s ease,filter .15s}
#go:disabled{background:var(--chip);color:var(--muted);box-shadow:none;cursor:default}
#go:not(:disabled):hover{transform:translateY(-1px);filter:brightness(1.07)}
.keys{display:grid;grid-template-columns:auto 1fr;gap:7px 14px;margin:24px 0 0;font-size:13.5px;color:var(--muted);align-items:center}
kbd{font-family:var(--sans);font-weight:700;font-size:11.5px;background:var(--chip);border:1px solid var(--line);border-bottom-width:2px;border-radius:6px;padding:3px 7px;color:var(--ink);white-space:nowrap}
.seg{display:inline-flex;background:var(--chip);border-radius:999px;padding:3px;gap:2px;border:1px solid var(--line)}
.seg button{appearance:none;border:0;background:transparent;color:var(--muted);font-weight:700;font-size:12.5px;padding:7px 13px;border-radius:999px;cursor:pointer}
.seg button.sel{background:var(--ink);color:#1a1a18}
.row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:18px;font-size:13px;color:var(--muted)}
.attr{position:fixed;right:10px;bottom:calc(6px + env(safe-area-inset-bottom,0px));font-size:11px;color:rgba(255,255,255,.78);text-shadow:0 1px 2px rgba(0,0,0,.6);z-index:30;pointer-events:none}
/* hud */
#hud{position:fixed;inset:0;pointer-events:none;opacity:0;transition:opacity .5s;z-index:10}
#hud.on{opacity:1}
#loc{position:fixed;left:0;top:0;padding:calc(16px + env(safe-area-inset-top,0px)) 20px 0;text-shadow:0 2px 12px rgba(0,0,0,.55)}
#place{font-family:var(--serif);font-size:38px;line-height:1}
#road{font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-top:6px;color:rgba(255,255,255,.88)}
#alt{font-size:12px;color:rgba(255,255,255,.72);margin-top:3px}
#mini{position:fixed;right:16px;top:calc(16px + env(safe-area-inset-top,0px));width:168px;height:168px;border-radius:50%;box-shadow:0 8px 30px rgba(0,0,0,.35)}
#hint{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:12px;color:rgba(255,255,255,.9)}
#hint span{background:var(--panel);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:6px 10px;border-radius:999px;border:1px solid var(--line)}
#dot{position:fixed;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:rgba(255,255,255,.75);box-shadow:0 0 3px rgba(0,0,0,.6)}
#toast{position:fixed;left:50%;top:calc(22px + env(safe-area-inset-top,0px));transform:translate(-50%,-10px);background:var(--panel-strong);padding:9px 16px;border-radius:999px;font-size:13.5px;font-weight:600;opacity:0;transition:.25s;pointer-events:none;z-index:40;border:1px solid var(--line)}
#toast.on{opacity:1;transform:translate(-50%,0)}
/* pause */
.modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,8,6,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:25;padding:20px}
.modal.on{display:flex}
.sheet{background:var(--panel-strong);border:1px solid var(--line);border-radius:22px;padding:26px;max-width:440px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.45);max-height:100%;overflow:auto}
.sheet h2{font-family:var(--serif);font-weight:400;font-size:44px;margin:0 0 14px;line-height:1}
.btns{display:flex;gap:10px;flex-wrap:wrap}
.btn{appearance:none;border:1px solid var(--line);background:var(--chip);color:var(--ink);font-weight:700;font-size:14px;padding:11px 16px;border-radius:12px;cursor:pointer}
.btn.pri{background:var(--accent);border-color:transparent;color:var(--accent-ink)}
.lbl{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:20px 0 8px}
input[type=range]{width:100%;accent-color:var(--accent)}
/* map */
#map{position:fixed;inset:0;display:none;z-index:26;background:rgba(8,10,8,.72);padding:calc(18px + env(safe-area-inset-top,0px)) 18px calc(18px + env(safe-area-inset-bottom,0px));gap:16px}
#map.on{display:flex}
#mapc{flex:1;min-width:0;height:100%;border-radius:18px;background:#d9d4c2;cursor:crosshair;touch-action:none;box-shadow:0 20px 60px rgba(0,0,0,.4)}
#mapside{width:230px;display:flex;flex-direction:column;gap:8px;overflow:auto}
#mapside h3{font-family:var(--serif);font-weight:400;font-size:34px;margin:4px 0 2px}
#mapside p{font-size:12.5px;color:var(--muted);margin:0 0 8px;line-height:1.5}
#tplist{display:flex;flex-direction:column;gap:6px}
#tplist button{appearance:none;text-align:left;border:1px solid var(--line);background:var(--chip);color:var(--ink);font-weight:600;font-size:14px;padding:10px 12px;border-radius:11px;cursor:pointer}
#tplist button:hover{background:rgba(255,255,255,.18)}
#mapclose{margin-top:auto}
/* touch */
#touchui{display:none}
#touchui.on{display:block}
#joyzone{position:fixed;left:0;bottom:0;width:46vw;height:58vh;pointer-events:auto;touch-action:none;z-index:15}
#joy{position:absolute;left:calc(26px + env(safe-area-inset-left,0px));bottom:calc(26px + env(safe-area-inset-bottom,0px));width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(20,22,20,.18) 0%,rgba(20,22,20,.42) 72%);border:3px solid rgba(255,255,255,.38);box-shadow:0 8px 26px rgba(0,0,0,.28),inset 0 0 18px rgba(0,0,0,.25);transition:border-color .15s}
#joy.act{border-color:rgba(255,255,255,.7)}
#joy .knob{position:absolute;left:50%;top:50%;width:66px;height:66px;margin:-33px 0 0 -33px;border-radius:50%;background:radial-gradient(circle at 42% 36%,#f7f7f5,#c4c4c0 70%,#a9a9a5);box-shadow:0 4px 12px rgba(0,0,0,.4),inset 0 0 0 5px rgba(0,0,0,.1);will-change:transform}
#runbtn{position:fixed;right:calc(28px + env(safe-area-inset-right,0px));bottom:calc(40px + env(safe-area-inset-bottom,0px));width:92px;height:92px;border-radius:50%;background:rgba(18,20,18,.46);border:3px solid rgba(255,255,255,.42);display:flex;align-items:center;justify-content:center;pointer-events:auto;touch-action:none;z-index:16;box-shadow:0 8px 26px rgba(0,0,0,.28);-webkit-tap-highlight-color:transparent;padding:0}
#runbtn svg{width:50px;height:50px}
#runbtn.on{background:rgba(216,101,58,.92);border-color:#fff;transform:scale(1.04)}
#tbtns{position:fixed;right:calc(16px + env(safe-area-inset-right,0px));top:calc(196px + env(safe-area-inset-top,0px));display:flex;flex-direction:column;gap:10px;pointer-events:auto;z-index:16}
#rotate{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,12,10,.88);z-index:60;text-align:center;padding:24px}
#rotate.on{display:flex}
#rotate .rbox{max-width:320px}
#rotate svg{animation:rot 2.2s ease-in-out infinite;transform-origin:50% 50%}
@keyframes rot{0%,20%{transform:rotate(0)}55%,80%{transform:rotate(-90deg)}100%{transform:rotate(-90deg)}}
#rotate .rt{font-family:var(--serif);font-size:34px;margin:14px 0 6px;line-height:1.05}
#rotate .rs{font-size:14px;color:var(--muted);margin-bottom:18px}
#tbtns .tbtn svg{display:block;margin:0 auto}
.namerow{margin:0 0 12px}
#pname{width:100%;max-width:340px;font-family:var(--sans);font-size:16px;font-weight:700;color:var(--ink);background:rgba(255,255,255,.1);border:1px solid var(--line);border-radius:12px;padding:12px 14px;outline:none}
#pname:focus{border-color:#f2c9a8;background:rgba(255,255,255,.16)}
#online{font-size:12.5px;font-weight:700;color:rgba(255,255,255,.92);margin-top:8px;max-width:60vw;display:none;text-shadow:0 1px 6px rgba(0,0,0,.6)}
#speedo{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(64px + env(safe-area-inset-bottom,0px));font-family:var(--serif);font-size:44px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6);display:none;pointer-events:none}
body.driving #speedo{display:block}
#prompt{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(122px + env(safe-area-inset-bottom,0px));background:rgba(14,16,14,.74);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 30px rgba(0,0,0,.35);padding:8px 18px 8px 9px;border-radius:999px;font-size:14.5px;font-weight:700;letter-spacing:.01em;display:none;pointer-events:none;white-space:nowrap;animation:prIn .25s ease-out}
#prompt kbd{display:inline-grid;place-items:center;min-width:30px;height:30px;padding:0 7px;margin:0 9px 0 0;border-radius:9px;background:#f5f1e8;color:#1a1a18;font:900 14px var(--sans);border:0;border-bottom:3px solid #b9b1a2;vertical-align:middle}
#prompt kbd:not(:first-child){margin-left:12px}
@keyframes prIn{from{opacity:0;transform:translate(-50%,6px)}to{opacity:1;transform:translate(-50%,0)}}
#prompt.on{display:block}
body.touch #prompt{display:none!important}
#carbtn,#exitbtn{position:fixed;right:calc(28px + env(safe-area-inset-right,0px));pointer-events:auto;touch-action:none;z-index:16;border-radius:999px;border:3px solid rgba(255,255,255,.45);background:rgba(18,20,18,.5);color:#fff;font-family:var(--sans);font-weight:800;font-size:13px;display:none;align-items:center;justify-content:center;gap:6px;box-shadow:0 8px 26px rgba(0,0,0,.28);-webkit-tap-highlight-color:transparent}
#carbtn{right:calc(136px + env(safe-area-inset-right,0px))!important;bottom:calc(124px + env(safe-area-inset-bottom,0px));height:62px;padding:0 16px 0 10px}
#carbtn.on{display:flex;background:rgba(216,101,58,.92);border-color:#fff}
#exitbtn{bottom:calc(40px + env(safe-area-inset-bottom,0px));width:92px;height:92px}
body.driving #exitbtn{display:flex} body.driving #runbtn{display:none} body.driving #carbtn{display:none!important}
#mapzoom{position:absolute;left:calc(30px + env(safe-area-inset-left,0px));top:calc(30px + env(safe-area-inset-top,0px));display:flex;flex-direction:column;gap:8px;z-index:2}
#mapzoom button{width:46px;height:46px;border-radius:12px;border:1px solid var(--line);background:var(--panel-strong);color:var(--ink);font-size:24px;font-weight:800;line-height:1}
#map{position:fixed}
@media (max-height:520px){#mapside{width:190px} #mapside h3{font-size:26px} #mapside p{display:none} #tplist button{padding:7px 10px;font-size:13px}}
#hp{position:fixed;left:50%;transform:translateX(-50%);top:calc(14px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:8px;pointer-events:none;z-index:14}
#hp .hi{color:#ff5a4f;font-size:17px;text-shadow:0 1px 4px rgba(0,0,0,.6)}
#hpbar{width:190px;height:11px;border-radius:8px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.35);overflow:hidden}
#hpfill{height:100%;width:100%;background:#5fc46a;transition:width .15s}
#bac{position:fixed;left:50%;transform:translateX(-50%);top:calc(36px + env(safe-area-inset-top,0px));font-size:13px;font-weight:800;color:#ffd98a;display:none;pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,.7)}
#ammo{position:fixed;right:calc(24px + env(safe-area-inset-right,0px));bottom:calc(24px + env(safe-area-inset-bottom,0px));font-family:var(--serif);font-size:30px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6);display:none;pointer-events:none}
body.armed #ammo{display:block} body.touch #ammo{bottom:calc(248px + env(safe-area-inset-bottom,0px));right:calc(34px + env(safe-area-inset-right,0px));font-size:20px} body.driving #ammo{display:none}
#hitmark{position:fixed;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;pointer-events:none;opacity:0;background:linear-gradient(45deg,transparent 44%,#fff 44%,#fff 56%,transparent 56%),linear-gradient(-45deg,transparent 44%,#fff 44%,#fff 56%,transparent 56%);z-index:15}
#hitmark.head{background:linear-gradient(45deg,transparent 44%,#ff4a3a 44%,#ff4a3a 56%,transparent 56%),linear-gradient(-45deg,transparent 44%,#ff4a3a 44%,#ff4a3a 56%,transparent 56%)}
#hitmark.on{animation:hm .28s ease-out} @keyframes hm{0%{opacity:1;transform:scale(1.35)}100%{opacity:0;transform:scale(1)}}
#killfeed{position:fixed;left:calc(20px + env(safe-area-inset-left,0px));top:calc(132px + env(safe-area-inset-top,0px));display:flex;flex-direction:column;gap:4px;pointer-events:none;z-index:14}
#killfeed div{background:rgba(15,17,15,.62);color:#fff;font-size:13px;font-weight:700;padding:4px 10px;border-radius:8px;width:max-content}
#dmgv{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,rgba(200,20,20,.6));opacity:0;z-index:30}
#dmgv.on{animation:dv .5s ease-out} @keyframes dv{0%{opacity:1}100%{opacity:0}}
#deadscr{position:fixed;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(60,0,0,.45);z-index:31;pointer-events:none;text-align:center}
#deadscr.on{display:flex} #deadscr .who{font-family:var(--serif);font-size:44px;color:#fff} #deadscr .t{font-size:16px;color:#f2d0c8;margin-top:6px}
#drinkmenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,12,10,.55);z-index:40}
#drinkmenu.on{display:flex}
#drinkmenu .dm{background:var(--panel-strong);border:1px solid var(--line);border-radius:18px;padding:18px 18px 14px;width:min(420px,92vw);max-height:86vh;overflow:auto}
#drinkmenu h3{font-family:var(--serif);font-size:30px;margin:0 0 2px} #drinkmenu p{margin:0 0 12px;color:var(--muted);font-size:13px}
#drinklist{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.drink{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);font-size:15px;font-weight:700;font-family:var(--sans)}
.drink b{color:#f2c9a8}
#jumpbtn,#downbtn,#firebtn{position:fixed;pointer-events:auto;touch-action:none;z-index:16;border-radius:50%;border:3px solid rgba(255,255,255,.42);background:rgba(18,20,18,.46);color:#fff;font-size:24px;font-weight:800;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent;padding:0;box-shadow:0 8px 26px rgba(0,0,0,.28)}
#jumpbtn{right:calc(136px + env(safe-area-inset-right,0px));bottom:calc(38px + env(safe-area-inset-bottom,0px));width:72px;height:72px}
#downbtn{right:calc(222px + env(safe-area-inset-right,0px));bottom:calc(38px + env(safe-area-inset-bottom,0px));width:72px;height:72px;display:none}
body.flying #downbtn{display:flex}
#firebtn{right:calc(28px + env(safe-area-inset-right,0px));bottom:calc(150px + env(safe-area-inset-bottom,0px));width:88px;height:88px;display:none;background:rgba(190,40,30,.55)}
body.armed #firebtn{display:flex}
body.driving #jumpbtn,body.driving #downbtn,body.driving #firebtn,body.driving #tgun,body.driving #tfly{display:none!important}
#tcam{display:none} body.driving #tcam{display:block}
#barbtn{position:fixed;right:calc(136px + env(safe-area-inset-right,0px));bottom:calc(124px + env(safe-area-inset-bottom,0px));height:58px;padding:0 16px;pointer-events:auto;touch-action:none;z-index:16;border-radius:999px;border:3px solid #fff;background:rgba(216,101,58,.92);color:#fff;font-family:var(--sans);font-weight:800;font-size:14px;display:none;align-items:center}
#barbtn.on{display:flex}
:root{--js:clamp(92px,27vh,150px);--rb:clamp(56px,16vh,92px);--jb:clamp(48px,13.5vh,72px);--fb:clamp(56px,16vh,88px);--gp:clamp(8px,2.2vh,14px);--mg:clamp(12px,3.5vh,26px)}
body.touch #joy{width:var(--js);height:var(--js);left:calc(var(--mg) + env(safe-area-inset-left,0px));bottom:calc(var(--mg) + env(safe-area-inset-bottom,0px))}
body.touch #joy .knob{width:44%;height:44%;margin:-22% 0 0 -22%}
body.touch #runbtn,body.touch #exitbtn{width:var(--rb);height:var(--rb);right:calc(var(--mg) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + env(safe-area-inset-bottom,0px))}
body.touch #runbtn svg{width:55%;height:55%}
body.touch #jumpbtn{width:var(--jb);height:var(--jb);font-size:calc(var(--jb)*0.34);right:calc(var(--mg) + var(--rb) + var(--gp) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + env(safe-area-inset-bottom,0px))}
body.touch #downbtn{width:var(--jb);height:var(--jb);font-size:calc(var(--jb)*0.34);right:calc(var(--mg) + var(--rb) + var(--jb) + 2*var(--gp) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + env(safe-area-inset-bottom,0px))}
body.touch #firebtn{width:var(--fb);height:var(--fb);right:calc(var(--mg) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + var(--rb) + var(--gp) + env(safe-area-inset-bottom,0px))}
body.touch #firebtn svg{width:52%;height:52%}
body.touch #carbtn,body.touch #barbtn{height:clamp(40px,11vh,58px);font-size:13px;right:calc(var(--mg) + var(--rb) + var(--gp) + env(safe-area-inset-right,0px))!important;bottom:calc(var(--mg) + var(--jb) + var(--gp) + env(safe-area-inset-bottom,0px))}
body.touch #carbtn svg{width:clamp(24px,7vh,40px);height:clamp(24px,7vh,40px)}
body.touch #ammo{bottom:calc(var(--mg) + var(--rb) + var(--fb) + 2*var(--gp) + env(safe-area-inset-bottom,0px))}
body.touch .tbtn{height:34px;min-width:0;padding:0 12px;font-size:12px}
body.touch #hpbar{width:clamp(110px,20vw,190px)}
@media (max-height:520px){ body.touch #tbtns{flex-direction:row;gap:6px;top:calc(12px + env(safe-area-inset-top,0px))!important;right:calc(16px + 112px + 10px + env(safe-area-inset-right,0px))!important} body.touch #mini{width:112px;height:112px} body.touch #place{font-size:24px} body.touch #road{font-size:11px} body.touch #hp{top:calc(52px + env(safe-area-inset-top,0px))} body.touch #bac{top:calc(70px + env(safe-area-inset-top,0px))} body.touch #speedo{font-size:32px;bottom:calc(10px + env(safe-area-inset-bottom,0px))} body.touch #killfeed{top:calc(118px + env(safe-area-inset-top,0px))} }
#poker{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,8,6,.72);z-index:42}
#poker.on{display:flex}
#poker .pk{width:min(980px,97vw);height:min(640px,96vh);display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:18px;background:linear-gradient(#2a1a10,#1a100a);border:1px solid #6b4a2f}
.pkhead{display:flex;align-items:center;gap:12px;color:#f3e2c0} .pkhead b{font-family:var(--serif);font-size:26px;font-weight:400} .pkhead span{flex:1;font-size:12px;color:#c9b08a} .pkhead .btn{padding:8px 14px;font-size:13px}
#pkrebuy{display:none}
.pktable{position:relative;flex:1;border-radius:50%/42%;background:radial-gradient(ellipse at center,#2a8a4c 0%,#1d6a3a 55%,#134a28 100%);border:14px solid #2a1a10;box-shadow:inset 0 0 40px rgba(0,0,0,.5),0 10px 30px rgba(0,0,0,.5)}
.pkcenter{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px}
#pkboard{display:flex;gap:6px} #pkpot{color:#fff;font-weight:800;font-size:15px;text-shadow:0 1px 3px #000} #pkmsg{color:#ffe7a8;font-weight:700;font-size:13px;text-align:center;max-width:60vw;min-height:18px}
.pks{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 10px;border-radius:12px;background:rgba(10,14,10,.62);border:2px solid transparent;min-width:92px}
.pks.turn{border-color:#ffd24a;box-shadow:0 0 14px rgba(255,210,74,.6)} .pks.fold{opacity:.45} .pks.win{border-color:#6fe08a}
.pkn{color:#fff;font-weight:800;font-size:13px} .pkc{color:#ffe7a8;font-size:12px;font-weight:700} .pkb{color:#cfe8d4;font-size:11px;min-height:14px} .pkcards{display:flex;gap:3px}
.pc{width:44px;height:62px;border-radius:6px;background:#fbfaf6;color:#161616;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.4);font-family:Georgia,serif}
.pc span{font-size:18px;line-height:1} .pc i{font-style:normal;font-size:20px;line-height:1} .pc.red{color:#c3202a}
.pc.back{background:repeating-linear-gradient(45deg,#8c1d23 0 6px,#a8262d 6px 12px);border:3px solid #fbfaf6} .pc.empty{background:rgba(255,255,255,.08);box-shadow:none;border:1px dashed rgba(255,255,255,.25)}
.pks .pc{width:30px;height:42px} .pks .pc span{font-size:12px} .pks .pc i{font-size:13px}
.pkme{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap} #pkhand{display:flex;gap:6px;align-items:center} #pkhand .pc{width:58px;height:82px} #pkhand .pc span{font-size:24px} #pkhand .pc i{font-size:26px}
.pkcat{color:#ffe7a8;font-weight:800;font-size:14px;margin-left:8px}
#pkact{display:flex;gap:8px;flex-wrap:wrap} #pkact button{padding:12px 16px;border-radius:12px;border:1px solid #6b4a2f;background:#3b2616;color:#fff;font-weight:800;font-size:14px;font-family:var(--sans)} #pkact button:disabled{opacity:.35}
#pkallin{background:#8c1d23!important} #pkraise{background:#7a5a1c!important}
.pknote{color:#a58f6c;font-size:11px;text-align:center}
@media (max-height:520px){ .pc{width:34px;height:48px} .pc span{font-size:14px} .pc i{font-size:15px} #pkhand .pc{width:44px;height:62px} #pkact button{padding:9px 12px;font-size:13px} .pkhead b{font-size:20px} .pks{min-width:74px;padding:4px 8px} }
#pokerbtn{position:fixed;right:calc(136px + env(safe-area-inset-right,0px));bottom:calc(124px + env(safe-area-inset-bottom,0px));height:58px;padding:0 16px;pointer-events:auto;touch-action:none;z-index:16;border-radius:999px;border:3px solid #fff;background:rgba(29,106,58,.95);color:#fff;font-family:var(--sans);font-weight:800;font-size:14px;display:none;align-items:center}
#pokerbtn.on{display:flex}
body.touch #pokerbtn{height:clamp(40px,11vh,58px);font-size:13px;right:calc(var(--mg) + var(--rb) + var(--gp) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + var(--jb) + var(--gp) + env(safe-area-inset-bottom,0px))}
#pkhud{position:fixed;inset:0;display:none;pointer-events:none;z-index:41}
#pkhud.on{display:block}
#pkhud .pktop{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;background:rgba(15,17,15,.7);border:1px solid var(--line);border-radius:999px;padding:6px 8px 6px 16px;pointer-events:auto;white-space:nowrap}
#pkhud .pktop b{font-family:var(--serif);font-size:20px;font-weight:400;color:#f3e2c0} #pkpot2{color:#ffe7a8;font-weight:800;font-size:13px} #pkhud .btn{padding:7px 12px;font-size:12px}
#pkwho{position:absolute;top:calc(60px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);color:#fff;font-size:14px;font-weight:700;background:rgba(15,17,15,.5);padding:4px 12px;border-radius:10px;max-width:94vw;text-align:center}
#pkmsg2{position:absolute;top:calc(128px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);color:#ffe7a8;font-size:22px;font-weight:800;background:rgba(12,14,12,.6);padding:4px 16px;border-radius:12px;text-shadow:0 2px 6px #000;text-align:center;max-width:90vw}
#pkhud .pkbot{position:absolute;left:0;right:0;bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:auto}
#pkme{color:#fff;font-weight:800;font-size:15px;background:rgba(15,17,15,.62);padding:5px 14px;border-radius:999px}
#pkhud .pkacts{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
#pkhud .pkacts button{padding:11px 15px;border-radius:12px;border:1px solid #6b4a2f;background:rgba(59,38,22,.92);color:#fff;font-weight:800;font-size:14px;font-family:var(--sans)} #pkhud .pkacts button:disabled{opacity:.35}
#pkminus,#pkplus{min-width:44px} #pkallin{background:rgba(140,29,35,.95)!important} #pkraise{background:rgba(122,90,28,.95)!important}
#pkhud.myturn #pkme{background:rgba(216,160,40,.9);color:#161616}
#pkhud .pknote{position:absolute;right:12px;bottom:calc(6px + env(safe-area-inset-bottom,0px));font-size:10px;color:rgba(255,255,255,.55)}
body.poker #touchui,body.poker #hp,body.poker #ammo,body.poker #killfeed,body.poker #prompt,body.poker #hint,body.poker #speedo{display:none!important}
@media (max-height:520px){ #pkhud .pktop b{font-size:16px} #pkhud .pkacts button{padding:8px 11px;font-size:12px} #pkwho{top:calc(50px + env(safe-area-inset-top,0px));font-size:11px} #pkmsg2{top:calc(76px + env(safe-area-inset-top,0px));font-size:13px} }
#pkwho{display:none!important}
#pkbadges{position:absolute;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:flex;gap:8px;pointer-events:none;max-width:98vw;justify-content:center;flex-wrap:nowrap}
.pkbg{position:relative;min-width:104px;padding:6px 12px 7px;border-radius:14px;background:rgba(10,12,10,.82);border:2px solid rgba(255,255,255,.18);text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.pkbg .n{color:#fff;font-weight:900;font-size:15px;letter-spacing:.02em} .pkbg .a{font-weight:900;font-size:14px;color:#9fe3a4;min-height:17px} .pkbg .a.r{color:#ffd24a} .pkbg .a.f{color:#ff8a80} .pkbg .c{color:#ffe7a8;font-weight:800;font-size:13px}
.pkbg.turn{border-color:#ffd24a;background:rgba(80,58,10,.9);box-shadow:0 0 18px rgba(255,210,74,.6)} .pkbg.fold{opacity:.55} .pkbg.win{border-color:#6fe08a;background:rgba(14,60,30,.9)}
.pkbg .cs{display:flex;gap:4px;justify-content:center;margin-top:4px}
#pkboardui{position:absolute;left:50%;top:calc(168px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:flex;gap:8px;padding:8px 10px;border-radius:14px;background:rgba(10,12,10,.55)}
#pkmycards{position:absolute;left:calc(16px + env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;gap:8px}
#pkhud .pkbot{padding-left:190px;box-sizing:border-box} @media (max-width:700px){ #pkhud .pkbot{padding-left:0} #pkmycards{bottom:calc(112px + env(safe-area-inset-bottom,0px))} }
.dc{background:#fbfaf6;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Georgia,serif;color:#141414;box-shadow:0 4px 12px rgba(0,0,0,.5);line-height:1}
.dc.red{color:#c3202a} .dc b{font-weight:900} .dc i{font-style:normal}
.dc.sm{width:30px;height:42px} .dc.sm b{font-size:14px} .dc.sm i{font-size:15px}
.dc.md{width:54px;height:76px} .dc.md b{font-size:24px} .dc.md i{font-size:26px}
.dc.lg{width:78px;height:110px;border:3px solid #ffd24a} .dc.lg b{font-size:36px} .dc.lg i{font-size:38px}
.dc.back{background:repeating-linear-gradient(45deg,#8c1d23 0 6px,#a8262d 6px 12px);border:3px solid #fbfaf6} .dc.empty{background:rgba(255,255,255,.08);box-shadow:none;border:1px dashed rgba(255,255,255,.3)}
body.poker #loc,body.poker #mini,body.poker #online,body.poker #tbtns,body.poker .attr,body.poker #bac{display:none!important}
#pkhud.myturn .pkacts button:not(:disabled){box-shadow:0 0 0 2px #ffd24a;background:rgba(90,62,20,.98)}
#pkhud .pkacts button{font-size:15px;padding:12px 16px}
#pkme{font-size:16px}
@media (max-height:520px){ .dc.lg{width:58px;height:82px} .dc.lg b{font-size:26px} .dc.lg i{font-size:28px} .dc.md{width:40px;height:56px} .dc.md b{font-size:18px} .dc.md i{font-size:20px} #pkboardui{top:calc(118px + env(safe-area-inset-top,0px));gap:5px;padding:5px 7px} #pkbadges{top:calc(46px + env(safe-area-inset-top,0px));gap:5px} #pkmsg2{top:calc(92px + env(safe-area-inset-top,0px))!important;font-size:15px!important} #pkhud .pkbot{padding-left:150px} .pkbg{min-width:96px;padding:4px 8px} .pkbg .n{font-size:12px} .pkbg .a,.pkbg .c{font-size:11px} #pkhud .pkacts button{font-size:12px;padding:8px 10px} }
#aimbtn{position:fixed;pointer-events:auto;touch-action:none;z-index:16;border-radius:50%;border:3px solid rgba(255,255,255,.42);background:rgba(18,20,18,.46);display:none;align-items:center;justify-content:center;padding:0;-webkit-tap-highlight-color:transparent}
body.armed #aimbtn{display:flex} body.driving #aimbtn{display:none!important} body.touch #aimbtn{width:var(--jb);height:var(--jb);right:calc(var(--mg) + var(--fb) + var(--gp) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + var(--rb) + var(--gp) + env(safe-area-inset-bottom,0px))} body:not(.touch) #aimbtn{display:none!important}
#aimbtn.on{background:rgba(216,160,40,.85);border-color:#fff}
body.scoped #firebtn,body.scoped #aimbtn,body.scoped #runbtn,body.scoped #jumpbtn,body.scoped #joy{z-index:40!important}
body.scoped #aimbtn::after{content:'✕';position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:#e5483b;color:#fff;font:800 13px/22px Manrope,Arial;text-align:center}
body.scoped #ammo{z-index:40;color:#fff}
#scope{position:fixed;inset:0;pointer-events:none;z-index:9;display:none;background:radial-gradient(circle at center,transparent 0,transparent 34vmin,#000 34.4vmin)}
#scope.on{display:block} #scope .ring{position:absolute;left:50%;top:50%;width:68vmin;height:68vmin;transform:translate(-50%,-50%);border-radius:50%;border:3px solid #111;background:linear-gradient(#111,#111) center/2px 100% no-repeat,linear-gradient(#111,#111) center/100% 2px no-repeat}
#fireind{position:fixed;left:50%;transform:translateX(-50%);top:calc(56px + env(safe-area-inset-top,0px));display:none;pointer-events:none;z-index:14;background:rgba(160,30,20,.85);color:#fff;font-weight:800;font-size:14px;padding:5px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.35)}
#waterbtn{position:fixed;pointer-events:auto;touch-action:none;z-index:16;border-radius:50%;border:3px solid #fff;background:rgba(30,110,200,.85);color:#fff;font-size:30px;display:none;align-items:center;justify-content:center;padding:0;right:calc(28px + env(safe-area-inset-right,0px));bottom:calc(150px + env(safe-area-inset-bottom,0px));width:84px;height:84px}
body.driving #waterbtn.on{display:flex} body.touch #waterbtn{width:var(--fb);height:var(--fb);right:calc(var(--mg) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + var(--rb) + var(--gp) + env(safe-area-inset-bottom,0px))} body:not(.touch) #waterbtn{display:none!important}
#money{position:fixed;right:calc(20px + env(safe-area-inset-right,0px));top:calc(206px + env(safe-area-inset-top,0px));font-family:var(--serif);font-size:30px;color:#9fe38a;text-shadow:0 2px 6px #000,0 0 2px #000;pointer-events:none;z-index:14;letter-spacing:.02em}
#money.up{animation:mu .6s} #money.down{animation:md .6s} @keyframes mu{0%{transform:scale(1.25);color:#d9ffcf}100%{transform:none}} @keyframes md{0%{transform:scale(1.2);color:#ff9a8a}100%{transform:none}}
#wanted{position:fixed;right:calc(20px + env(safe-area-inset-right,0px));top:calc(244px + env(safe-area-inset-top,0px));font-size:24px;color:#ffd24a;text-shadow:0 2px 6px #000;display:none;pointer-events:none;z-index:14;letter-spacing:.08em}
#objective{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom,0px));display:none;background:rgba(10,12,10,.72);border:1px solid rgba(255,210,74,.5);color:#fff;padding:7px 16px;border-radius:12px;text-align:center;pointer-events:none;z-index:14;max-width:80vw}
#objective b{color:#ffd24a;font-size:13px;letter-spacing:.06em;text-transform:uppercase} #objective div{font-size:15px;font-weight:700}
body.touch #objective{bottom:auto;top:calc(84px + env(safe-area-inset-top,0px))}
#dlg{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(24px + env(safe-area-inset-bottom,0px));width:min(720px,92vw);display:none;background:rgba(8,10,8,.88);border:2px solid #ffd24a;border-radius:16px;padding:12px 18px 10px;z-index:45;cursor:pointer}
#dlg.on{display:block} #dlg .who{color:#ffd24a;font-weight:900;font-size:15px;margin-bottom:4px} #dlg .txt{color:#fff;font-size:18px;font-weight:600;line-height:1.35} #dlg .nx{color:#c9c2a8;font-size:12px;text-align:right;margin-top:4px}
#shopmenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,12,10,.55);z-index:40} #shopmenu.on{display:flex}
#shopmenu .dm{background:var(--panel-strong);border:1px solid var(--line);border-radius:18px;padding:18px 18px 14px;width:min(420px,92vw)} #shopmenu h3{font-family:var(--serif);font-size:30px;margin:0 0 2px} #shopmenu p{margin:0 0 12px;color:var(--muted);font-size:13px} #shoplist{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
#gtabtn{position:fixed;right:calc(136px + env(safe-area-inset-right,0px));bottom:calc(196px + env(safe-area-inset-bottom,0px));height:52px;padding:0 16px;pointer-events:auto;touch-action:none;z-index:16;border-radius:999px;border:3px solid #fff;background:rgba(216,160,40,.95);color:#161616;font-family:var(--sans);font-weight:900;font-size:13px;display:none;align-items:center}
#gtabtn.on{display:flex} body:not(.touch) #gtabtn{display:none!important} body.touch #gtabtn{right:calc(var(--mg) + var(--rb) + var(--gp) + env(safe-area-inset-right,0px));bottom:calc(var(--mg) + var(--jb) + var(--gp)*2 + clamp(40px,11vh,58px) + env(safe-area-inset-bottom,0px))}
@media (max-height:520px){ #money{font-size:22px;top:calc(130px + env(safe-area-inset-top,0px))} #wanted{top:calc(158px + env(safe-area-inset-top,0px));font-size:18px} #dlg .txt{font-size:15px} }
body.poker #money,body.poker #wanted,body.poker #objective{display:none!important}
#banner{position:fixed;left:0;right:0;top:32%;text-align:center;pointer-events:none;z-index:44;opacity:0}
#banner.on{animation:bn 3.2s ease-out forwards} @keyframes bn{0%{opacity:0;transform:scale(1.15)}10%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0}}
#banner .b{font-family:var(--serif);font-size:clamp(34px,7vw,72px);color:var(--bc,#ffd24a);text-shadow:0 3px 0 #000,0 0 18px rgba(0,0,0,.6);letter-spacing:.02em}
#banner .s{font-size:16px;font-weight:900;color:#fff;letter-spacing:.3em;text-shadow:0 2px 4px #000}
#hp,#money,#wanted,#objective{display:none!important}
#hudpanel{position:fixed;left:calc(16px + env(safe-area-inset-left,0px));top:calc(12px + env(safe-area-inset-top,0px));display:flex;gap:10px;align-items:center;background:linear-gradient(90deg,rgba(10,12,10,.78),rgba(10,12,10,.35));border-radius:40px 14px 14px 40px;padding:6px 14px 6px 6px;pointer-events:none;z-index:15}
#hudpanel .av{width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#6a7a8a,#2a3440);display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid rgba(255,255,255,.6)}
#hudpanel .bars{width:200px} #hudpanel .lbl{display:flex;justify-content:space-between;color:#fff;font-size:11px;font-weight:900;letter-spacing:.08em} #hudpanel .lbl.s{margin-top:3px;color:#cfe8ff}
#hudpanel .bar{height:9px;background:rgba(255,255,255,.18);border-radius:5px;overflow:hidden} #hudpanel .bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#c62828,#ef5350);transition:width .2s} #hudpanel .bar.s{height:6px} #hudpanel .bar.s i{background:linear-gradient(90deg,#2a7fd6,#6fc0ff)}
#hudpanel .cash{margin-top:5px;color:#b8f5a0;font-size:12px;font-weight:900;letter-spacing:.06em;display:flex;justify-content:space-between} #hudpanel .cash b{color:#fff;font-size:15px}
#loc{top:calc(94px + env(safe-area-inset-top,0px))!important}
#wbox{position:fixed;right:calc(20px + env(safe-area-inset-right,0px));top:calc(196px + env(safe-area-inset-top,0px));display:flex;gap:8px;align-items:center;background:rgba(10,12,10,.72);border-radius:10px;padding:6px 12px;pointer-events:none;z-index:15;color:#fff;font-weight:900;font-size:12px;letter-spacing:.1em}
#wbox b{color:rgba(255,255,255,.35);font-size:17px;letter-spacing:.06em} #wbox.hot b{color:#ffd24a;text-shadow:0 0 8px rgba(255,210,74,.6)} #wbox.hot{animation:wb 1s infinite} @keyframes wb{50%{background:rgba(40,60,160,.75)}} #wbox em{font-style:normal;color:#ff8a80;font-size:10px}
#objcard{position:fixed;right:calc(20px + env(safe-area-inset-right,0px));top:calc(238px + env(safe-area-inset-top,0px));display:none;gap:10px;align-items:center;background:rgba(10,12,10,.78);border-left:4px solid #ffd24a;border-radius:10px;padding:8px 14px 8px 10px;pointer-events:none;z-index:15;max-width:300px}
#objcard .ex{width:30px;height:30px;border-radius:50%;background:#ffd24a;color:#161616;font-weight:900;font-size:20px;display:flex;align-items:center;justify-content:center;flex:none} #objcard .t{color:#fff;font-weight:900;font-size:15px} #objcard .d{color:#dfe6d8;font-size:12px}
#phone{position:fixed;inset:0;display:none;align-items:flex-end;justify-content:flex-end;padding:0 24px 24px 0;z-index:46;background:rgba(0,0,0,.25)} #phone.on{display:flex}
#phone .ph{width:260px;height:min(520px,86vh);background:#0d0f12;border:6px solid #1b1d22;border-radius:34px;box-shadow:0 20px 60px rgba(0,0,0,.6);display:flex;flex-direction:column;padding:10px 12px;color:#fff;overflow:hidden}
.phtop{display:flex;justify-content:space-between;font-size:12px;color:#cfd3d8;padding:2px 6px} .phtitle{font-family:var(--serif);font-size:24px;margin:6px 6px 8px} #phonebody{flex:1;overflow:auto;display:flex;flex-direction:column;gap:6px}
.papp{display:flex;align-items:center;gap:10px;background:#1a1d22;border:0;border-radius:12px;color:#fff;font:700 14px var(--sans);padding:9px 10px;text-align:left;position:relative} .papp .pi{width:30px;height:30px;border-radius:9px;background:#2a2f36;display:flex;align-items:center;justify-content:center;font-size:17px} .papp .pb{position:absolute;right:10px;background:#e5483b;border-radius:10px;padding:1px 7px;font-style:normal;font-size:11px}
.pmsg{background:#1a1d22;border-radius:12px;padding:8px 10px;font-size:13px} .pmsg b{color:#ffd24a;display:block;margin-bottom:2px} .pbtn{margin:6px 6px 0 0;border:0;border-radius:8px;padding:6px 10px;font:800 12px var(--sans);color:#fff} .pbtn.ok{background:#2e8b3a} .pbtn.no{background:#8c1d23}
#phonebody p{color:#aab0b8;font-size:13px;margin:4px 6px} .phclose{margin-top:8px;border:0;border-radius:12px;background:#2a2f36;color:#fff;font:700 13px var(--sans);padding:9px}
#tphone{position:relative} #phonebadge{display:none;position:absolute;top:-3px;right:-3px;width:11px;height:11px;border-radius:50%;background:#e5483b;font-style:normal}
#dbg{position:fixed;left:8px;bottom:8px;display:none;white-space:pre;font:12px/1.35 ui-monospace,Menlo,monospace;color:#9fe38a;background:rgba(0,0,0,.72);padding:6px 10px;border-radius:8px;z-index:50;pointer-events:none}
@media (max-height:520px){ #hudpanel{transform:scale(.8);transform-origin:left top} #loc{top:calc(66px + env(safe-area-inset-top,0px))!important} #wbox{top:calc(132px + env(safe-area-inset-top,0px))} #objcard{top:calc(170px + env(safe-area-inset-top,0px));max-width:230px} #phone{padding:0 12px 10px 0} #phone .ph{height:94vh;width:230px} }
body.poker #hudpanel,body.poker #wbox,body.poker #objcard{display:none!important}

.tbtn{pointer-events:auto;min-width:74px;height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font-weight:800;font-size:13px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.touchhelp{display:none;margin-top:16px;font-size:13.5px;color:var(--muted);line-height:1.6}
body.touch .keys{display:none} body.touch .touchhelp{display:block} body.touch #hint{display:none} body.touch .kbonly{display:none} .tonly{display:none} body.touch .tonly{display:block}
@media (max-width:760px){#start{align-items:flex-end;padding:calc(20px + env(safe-area-inset-top,0px)) 18px calc(22px + env(safe-area-inset-bottom,0px));background:linear-gradient(0deg,rgba(8,10,8,.85) 0%,rgba(8,10,8,.55) 55%,rgba(8,10,8,.1) 100%)} .keys{display:none} #mini{width:118px;height:118px} #place{font-size:30px} #tbtns{top:calc(146px + env(safe-area-inset-top,0px))} #map{flex-direction:column} #mapside{width:100%;max-height:34%} #hint{display:none}}
@media (max-height:520px){#tbtns{top:calc(16px + env(safe-area-inset-top,0px))!important;right:calc(196px + env(safe-area-inset-right,0px))}}
@media (max-height:520px) and (max-width:760px){#tbtns{right:calc(146px + env(safe-area-inset-right,0px))}}
/* start screen: GTA-style title over a cinematic fly-through (or your photos from photos/) */
#start{background:none}
#start::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,rgba(6,7,6,.86) 0%,rgba(6,7,6,.55) 34%,rgba(6,7,6,0) 62%),linear-gradient(0deg,rgba(6,7,6,.7),rgba(6,7,6,0) 40%)}
@media (max-width:760px){#start::before{background:linear-gradient(0deg,rgba(6,7,6,.9) 0%,rgba(6,7,6,.6) 55%,rgba(6,7,6,.1) 100%)}}
#slides{position:absolute;inset:0;z-index:-2;overflow:hidden;background:#0b0d0b;display:none}#slides.on{display:block}
#slides img{position:absolute;inset:-4%;width:108%;height:108%;object-fit:cover;opacity:0;transition:opacity 1.6s ease;animation:kb 14s ease-in-out infinite alternate}#slides img.on{opacity:1}
@keyframes kb{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(-2%,-1%)}}
#shotfade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .5s;z-index:-1}#shotfade.on{opacity:1}
.logo{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;margin:.1em 0 .12em;line-height:.86}
.logo span{display:block;font-size:clamp(78px,13vw,150px);letter-spacing:.01em;color:#fff;-webkit-text-stroke:3px #0a0a0a;paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.55),0 0 40px rgba(0,0,0,.35)}
.logo small{display:inline-block;font-family:var(--sans);font-weight:800;font-size:13px;letter-spacing:.32em;text-transform:uppercase;background:#d8653a;color:#fff;padding:7px 12px 6px;margin-top:10px;transform:skew(-8deg)}
#chap{display:flex;gap:5px;margin:0 0 16px;align-items:center;font-size:12px;color:var(--muted);font-weight:700;letter-spacing:.08em;text-transform:uppercase}#chap i{width:22px;height:6px;border-radius:3px;background:var(--chip);display:block}#chap i.d{background:#ff8a2a}#chap b{margin-left:8px;color:var(--ink)}
.gorow{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.ghost{appearance:none;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);font-weight:700;font-size:14px;padding:14px 20px;border-radius:999px;cursor:pointer}
#tip{position:absolute;right:28px;bottom:calc(30px + env(safe-area-inset-bottom,0px));max-width:min(360px,40vw);font-size:13px;line-height:1.5;color:rgba(255,255,255,.85);text-shadow:0 1px 3px #000;border-left:3px solid #d8653a;padding:2px 0 2px 12px;transition:opacity .4s}
#tip b{display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#f2c9a8;margin-bottom:2px}
@media (max-height:860px){.logo span{font-size:clamp(60px,9vw,96px)}.lede{font-size:14px;margin-bottom:14px}#start .keys{display:none}#chap{margin-bottom:10px}}
@media (max-height:620px){.lede{display:none}.logo small{margin-top:4px}}
#start{overflow-y:auto}
/* GTA layout on a computer: radar bottom-left */
body:not(.touch) #mini{top:auto!important;right:auto!important;left:22px;bottom:calc(22px + env(safe-area-inset-bottom,0px));width:200px;height:200px;border:3px solid rgba(10,12,10,.65)}
body:not(.touch) #hint{left:auto;right:22px;transform:none}
@media (max-width:760px){#tip{display:none}.logo span{font-size:64px;-webkit-text-stroke:2px #0a0a0a}.lede{font-size:14px}}
</style>
</head>
<body>
<div id="view"></div>
<div id="start"><div id="slides"></div><div id="shotfade"></div><div class="card">
 <div class="eyebrow">Hrvatsko zagorje · Krapinsko-zagorska županija</div>
 <h1 class="logo"><span>TUHELJ</span><small>Povratak u Zagorje</small></h1>
 <p class="lede">Deset godina u Njemačkoj, a sad si opet doma — u obiteljskoj kući nasuprot crkve. Kenka je dužan Crnim Vukovima, a netko u općini im drži leđa. Sedam poglavlja, cijelo selo, policija za petama — i brtija koja nikad ne spava.</p>
 <div id="chap"></div>
 <div class="prog"><div id="bar"></div></div><div id="ltxt">Pripremam…</div>
 <div class="namerow"><input id="pname" maxlength="16" placeholder="Tvoje ime (vide ga drugi igrači)" autocomplete="off" spellcheck="false"></div>
 <div class="gorow"><button id="go" disabled>Učitavam…</button><button id="newgame" class="ghost" type="button">Nova igra</button></div>
 <div class="touchhelp">Okreni mobitel vodoravno — igra se otvara preko cijelog zaslona. Lijevi krug dolje — hodanje · povuci prstom po ekranu — pogled · čovječuljak desno — trčanje · gumb Oružje — mijenja oružje · gumb Karta — premještanje po selu</div>
 <div class="keys">
  <span><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></span><span>hodanje · <kbd>Shift</kbd> trčanje · <kbd>Space</kbd> skok</span>
  <span><kbd>Miš</kbd></span><span>pogled · <kbd>V</kbd> treće / prvo lice (u autu: kamera)</span>
  <span><kbd>E</kbd></span><span>razgovor, misija, auto, vrata, ormar, šank</span>
  <span><kbd>Kotačić</kbd></span><span>mijenja oružje (ili <kbd>1</kbd>–<kbd>6</kbd>) · <kbd>Q</kbd> spremi · <kbd>R</kbd> punjenje</span>
  <span><kbd>Klik</kbd></span><span>lijevi puca · desni nišani</span>
  <span><kbd>M</kbd></span><span>karta · <kbd>P</kbd> mobitel · <kbd>Esc</kbd> izbornik</span>
 </div>
</div><div id="tip"></div></div>
<div id="hud"><div id="loc"><div id="place">Tuhelj</div><div id="road"></div><div id="alt"></div><div id="online"></div></div><div id="speedo">0 km/h</div><div id="hudpanel"><div class="av">🙂</div><div class="bars"><div class="lbl">HEALTH <b id="hpval">100</b></div><div class="bar"><i id="hphud"></i></div><div class="lbl s">STAMINA</div><div class="bar s"><i id="sthud"></i></div><div class="cash">💶 CASH <b id="cashval">€0</b></div></div></div>
<div id="wbox"><span>WANTED</span><b id="wstars">☆☆☆☆☆</b><em id="copstate"></em></div>
<div id="objcard"><div class="ex">!</div><div><div class="t"></div><div class="d"></div></div></div>
<div id="dbg"></div><div id="prompt"></div><div id="hp"><span class="hi">❤</span><div id="hpbar"><div id="hpfill"></div></div></div><div id="bac"></div><div id="fireind"></div><div id="money">€ 500</div><div id="wanted"></div><div id="objective"></div><div id="ammo">30 / 30</div><div id="hitmark"></div><div id="killfeed"></div><canvas id="mini" width="336" height="336"></canvas><div id="dot"></div>
 <div id="hint"><span>M · karta</span><span>Shift · trčanje</span><span>F · letenje</span><span>Esc · izbornik</span></div>
 <div id="touchui"><div id="joyzone"><div id="joy"><div class="knob"></div></div></div><button id="carbtn" aria-label="Vozi"><svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="4.5" fill="#fff"/><path d="M8 21 Q24 16 40 21"/><path d="M24 28.5 L24 42"/></svg><span>Vozi</span></button><button id="exitbtn" aria-label="Izađi iz auta"><span>Izađi</span></button><button id="jumpbtn" aria-label="Skok">▲</button><button id="downbtn" aria-label="Dolje">▼</button><button id="waterbtn" aria-label="Voda">💧</button><button id="aimbtn" aria-label="Nišani"><svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"><path d="M4 24c5-8 12-12 20-12s15 4 20 12c-5 8-12 12-20 12S9 32 4 24z"/><circle cx="24" cy="24" r="6"/></svg></button><button id="firebtn" aria-label="Pucaj"><svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"><circle cx="24" cy="24" r="13"/><path d="M24 4v10M24 34v10M4 24h10M34 24h10"/><circle cx="24" cy="24" r="2.5" fill="#fff"/></svg></button><button id="barbtn" aria-label="Šank"><span>🍺 Šank</span></button><button id="gtabtn" aria-label="Radnja"><span></span></button><button id="pokerbtn" aria-label="Poker"><span>🃏 Poker</span></button><button id="runbtn" aria-label="Trčanje"><svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="30.5" cy="7.5" r="4.6" fill="#fff" stroke="none"/><path d="M28.5 15.5 L22.5 27"/><path d="M27.5 17.5 L34.5 21.5 L40 17.5"/><path d="M26.5 17 L18.5 18.5 L13.5 14"/><path d="M22.5 27 L29.5 32.5 L27 43"/><path d="M22.5 27 L16 33.5 L8.5 33"/></svg></button><div id="tbtns"><button class="tbtn" id="tfs" aria-label="Cijeli zaslon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button><button class="tbtn" id="tgun">Oružje</button><button class="tbtn" id="tfly">Let</button><button class="tbtn" id="tcam">Kamera</button><button class="tbtn" id="tphone">📱<i id="phonebadge"></i></button><button class="tbtn" id="tmap">Karta</button><button class="tbtn" id="tmenu">Izbor</button></div></div>
</div>
<div id="toast"></div>
<div class="modal" id="pause"><div class="sheet">
 <h2>Pauza</h2>
 <div class="btns"><button class="btn pri" id="resume">Nastavi šetnju</button><button class="btn" id="openmap">Karta</button><button class="btn" id="flytg">Letenje: isključeno</button><button class="btn" id="fsbtn">Cijeli zaslon</button></div>
 <div class="lbl">Doba dana · <span id="todv"></span></div><input type="range" id="tod" min="6.5" max="19.8" step="0.1" value="16.5">
 <div class="lbl">Upravljanje</div>
 <div class="tonly" style="font-size:13.5px;color:var(--muted);line-height:1.8">Krug dolje lijevo — hodanje · povlačenje prstom — pogled · čovječuljak dolje desno — trčanje · kraj auta se pojavi gumb Vozi</div>
 <div class="kbonly" style="font-size:13.5px;color:var(--muted);line-height:1.8"><kbd>W A S D</kbd> hodanje · <kbd>Shift</kbd> trčanje · <kbd>Space</kbd> skok<br><kbd>F</kbd> letenje (<kbd>Space</kbd> gore, <kbd>C</kbd> dolje) · <kbd>M</kbd> karta<br><kbd>Q</kbd> puška, lijevi klik puca, <kbd>R</kbd> punjenje · <kbd>E</kbd> šank (naruči piće)<br><kbd>E</kbd> uđi u auto / izađi · u autu <kbd>W S</kbd> gas i kočnica, <kbd>A D</kbd> volan, <kbd>Space</kbd> ručna, <kbd>V</kbd> pogled</div>
 <p style="font-size:12px;color:var(--muted);margin:18px 0 0;line-height:1.5">Ceste, zgrade, šume, polja i potoci prema podacima OpenStreetMapa; teren i dio kuća procijenjeni su i generirani.</p>
</div></div>
<div id="map"><canvas id="mapc"></canvas><div id="mapzoom"><button id="zin" aria-label="Povećaj">+</button><button id="zout" aria-label="Smanji">−</button></div><div id="mapside"><h3>Karta</h3><p>Kotačić miša za zumiranje, povuci za pomicanje. Klikni na kartu da se premjestiš onamo.</p><div id="tplist"></div><button class="btn" id="mapclose">Zatvori (M)</button></div></div>
<div id="dmgv"></div><div id="phone"><div class="ph"><div class="phtop"><span id="phoneclock">10:00</span><span>📶 🔋</span></div><div class="phtitle">Tuhelj</div><div id="phonebody"></div><button class="phclose" id="phoneclose">Zatvori (P)</button></div></div><div id="banner"><div class="s"></div><div class="b"></div></div><div id="dlg"><div class="who"></div><div class="txt"></div><div class="nx">Dalje ▸</div></div>
<div id="shopmenu"><div class="dm"><h3>Trgovina · Tuhelj</h3><p>Hrana i prva pomoć vraćaju zdravlje</p><div id="shoplist"></div><button class="btn" id="shopclose">Izađi</button></div></div><div id="scope"><div class="ring"></div></div><div id="deadscr"><div class="who"></div><div class="t"></div></div>
<div id="drinkmenu"><div class="dm"><h3>Šank · Kafić Putniku</h3><p>Što ćeš popiti? Živjeli!</p><div id="drinklist"></div><button class="btn" id="drinkclose">Zatvori</button></div></div>
<div id="pkhud"><div class="pktop"><b>Poker · Kafić Putniku</b><span id="pkpot2"></span><button class="btn" id="pkrebuy2">Novih 1000</button><button class="btn" id="pkbots">Botovi: da</button><button class="btn" id="pkleave">Ustani</button></div>
<div id="pkwho"></div><div id="pkmsg2"></div><div id="pkboardui"></div><div id="pkbadges"></div><div id="pkmycards"></div>
<div class="pkbot"><div id="pkme"></div><div class="pkacts"><button id="pkfold">FOLD</button><button id="pkcall">CHECK</button><button id="pkminus">−</button><button id="pkraise">RAISE</button><button id="pkplus">+</button><button id="pkallin">ALL-IN</button></div></div>
<div class="pknote">Žetoni za zabavu — nema pravog novca</div></div>
<div id="rotate"><div class="rbox"><svg viewBox="0 0 64 64" width="84" height="84" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="8" width="24" height="42" rx="4"/><path d="M29 44h6"/><path d="M10 40a24 24 0 0 0 16 16" /><path d="M22 58l4-2-2-4"/></svg><div class="rt">Okreni mobitel vodoravno</div><div class="rs">Tuhelj se najbolje vidi u širini.</div><button class="btn" id="rotok">Ipak igraj uspravno</button></div></div>
<div class="attr">Podaci karte © OpenStreetMap contributors · referentne slike: Mapillary (CC BY-SA) · likovi i animacije: Microsoft Rocketbox (MIT) · auti i puške: Quaternius (CC0) · traktor: Kenney (CC0)</div>
<script src="%%THREE%%"></script>
<script id="gltfx">%%GLTFX%%</script>
<script id="tuhelj-data" type="application/json">%%DATA%%</script>
<script>window.TUHELJ_PHOTOS=%%PHOTOS%%;window.TUHELJ_VOICES=%%VOICES%%;</script>
<script>
%%JS%%
</script>
</body>
</html>
'''
MAN=sys.argv[2] if len(sys.argv)>2 else ''
import hashlib, base64
PACKS={'people':'assets/people','people_m':'assets/people_m','anims':'assets/anims','vehicles':'assets/vehicles','weapons':'assets/weapons'}
_h=hashlib.md5()
for _d in PACKS.values():
    for _f in sorted(glob.glob(os.path.join(ROOT,_d,'*.glb'))): _h.update(open(_f,'rb').read())
PACK_V=_h.hexdigest()[:10]
GLTFX='window.TUHELJ_PACK_V="'+PACK_V+'";\n'+open(os.path.join(ROOT,'gltf_classic.js'),encoding='utf-8').read()+'\n'+open(os.path.join(ROOT,'meshopt_classic.js'),encoding='utf-8').read()+'\n'+'\nconst SOLDIER_B64="'+open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'soldier.b64'),encoding='utf-8').read().strip()+'";\n'
# your own photos of Tuhelj: drop .jpg/.png/.webp files into photos/ — they play on the start screen and hang on the wall at home
PHOTO_SRC=sorted(f for f in glob.glob(os.path.join(ROOT,'photos','*')) if f.lower().endswith(('.jpg','.jpeg','.png','.webp')))
PHOTOS=['photos/'+os.path.basename(f) for f in PHOTO_SRC]
# recorded voice lines: voices/dobar-dan.mp3 etc. (see voices/PROCITAJ.txt)
VOICE_SRC=sorted(f for f in glob.glob(os.path.join(ROOT,'voices','*')) if f.lower().endswith(('.mp3','.ogg','.m4a')))
html=HTML.replace('%%THREE%%',THREE_URL).replace('%%GLTFX%%',GLTFX,1).replace('%%DATA%%',djs,1).replace('%%MANIFEST%%',MAN,1).replace('%%PHOTOS%%',json.dumps(PHOTOS),1).replace('%%VOICES%%',json.dumps([os.path.basename(f) for f in VOICE_SRC]),1)
# touch buttons wiring appended
extra='''
document.addEventListener('DOMContentLoaded',()=>{});
(function(){ const tm=document.getElementById('tmap'), tu=document.getElementById('tmenu'); if(tm) tm.addEventListener('pointerdown',(e)=>{ e.preventDefault(); if(!GAME.started) return; openMap(!UI.mapOpen); if(!UI.mapOpen) resumeGame(); }); if(tu) tu.addEventListener('pointerdown',(e)=>{ e.preventDefault(); if(!GAME.started) return; togglePause(!GAME.paused); }); const tf=document.getElementById('tfs'); if(tf) tf.addEventListener('pointerdown',(e)=>{ e.preventDefault(); toggleFullscreen(); }); const fb=document.getElementById('fsbtn'); if(fb) fb.addEventListener('click',()=>toggleFullscreen()); const cb=document.getElementById('carbtn'); if(cb) cb.addEventListener('touchstart',e=>{ e.preventDefault(); useCarKey(); },{passive:false}); const eb=document.getElementById('exitbtn'); if(eb) eb.addEventListener('touchstart',e=>{ e.preventDefault(); if(PLAYER.heli) exitHeli(); else if(PLAYER.riding) exitRide(); else exitCar(); },{passive:false}); const pn=document.getElementById('pname'); if(pn){ try{ pn.value=localStorage.getItem('tuhelj_name')||''; }catch(e){} pn.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter'&&!document.getElementById('go').disabled) startGame(); }); } const $$=(id)=>document.getElementById(id);
  const jb=$$('jumpbtn'); if(jb){ jb.addEventListener('touchstart',e=>{ e.preventDefault(); if(PLAYER.fly) TOUCH.up=true; else TOUCH.jump=true; },{passive:false}); const ju=()=>{ TOUCH.up=false; }; jb.addEventListener('touchend',ju); jb.addEventListener('touchcancel',ju); }
  const dn=$$('downbtn'); if(dn){ dn.addEventListener('touchstart',e=>{ e.preventDefault(); TOUCH.down=true; },{passive:false}); const du=()=>{ TOUCH.down=false; }; dn.addEventListener('touchend',du); dn.addEventListener('touchcancel',du); }
  const fbn=$$('firebtn'); if(fbn){ fbn.addEventListener('touchstart',e=>{ e.preventDefault(); e.stopPropagation(); COMBAT.fired=false; COMBAT.hold=true; fireGun(); },{passive:false}); const fu=()=>{ COMBAT.hold=false; COMBAT.fired=false; }; fbn.addEventListener('touchend',fu); fbn.addEventListener('touchcancel',fu); }
  const wtb=$$('waterbtn'); if(wtb){ wtb.addEventListener('touchstart',e=>{ e.preventDefault(); e.stopPropagation(); LIFE.spray=true; },{passive:false}); const wu=()=>{ LIFE.spray=false; }; wtb.addEventListener('touchend',wu); wtb.addEventListener('touchcancel',wu); }
  const tph=$$('tphone'); if(tph) tph.addEventListener('pointerdown',e=>{ e.preventDefault(); togglePhone(); }); const phc=$$('phoneclose'); if(phc) phc.addEventListener('click',()=>togglePhone(false));
  const gbt=$$('gtabtn'); if(gbt) gbt.addEventListener('pointerdown',e=>{ e.preventDefault(); gtaUse(); }); const dlg=$$('dlg'); if(dlg) dlg.addEventListener('pointerdown',e=>{ e.preventDefault(); nextDlg(); }); const shc=$$('shopclose'); if(shc) shc.addEventListener('click',()=>closeShop());
  const bb=$$('barbtn'); if(bb){ bb.addEventListener('pointerdown',e=>{ e.preventDefault(); if(nearValentina()) openDrinks('valentina'); else openDrinks(); }); } const pkb=$$('pokerbtn'); if(pkb){ pkb.addEventListener('pointerdown',e=>{ e.preventDefault(); pkOpen(); }); }
  const PD=(el,fn)=>{ if(el) el.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); fn(); }); }; PD($$('tgun'),()=>cycleGun()); PD($$('aimbtn'),()=>{ COMBAT.ads=!COMBAT.ads; $$('aimbtn').classList.toggle('on',COMBAT.ads); }); PD($$('tfly'),()=>toggleFly()); PD($$('tcam'),()=>{ if(PLAYER.driving||PLAYER.riding){ CARCAM.first=!CARCAM.first; CARCAM.init=false; } });
  const ro=document.getElementById('rotok'); if(ro) ro.addEventListener('click',()=>{ GAME.allowPortrait=true; updateRotate(); }); })();
'''
html=html.replace('%%JS%%',js+extra,1)
out=sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/outputs/tuhelj.html'
os.makedirs(os.path.dirname(out) or '.',exist_ok=True)
open(out,'w',encoding='utf-8').write(html)
import shutil
if PHOTO_SRC:
    PD=os.path.join(os.path.dirname(out),'photos'); os.makedirs(PD,exist_ok=True)
    for f in PHOTO_SRC: shutil.copy2(f,os.path.join(PD,os.path.basename(f)))
    print('photos/',len(PHOTO_SRC),'slika')
if VOICE_SRC:
    VD=os.path.join(os.path.dirname(out),'voices'); os.makedirs(VD,exist_ok=True)
    for f in VOICE_SRC: shutil.copy2(f,os.path.join(VD,os.path.basename(f)))
    print('voices/',len(VOICE_SRC),'snimki')
# 3D model packs (people/anims/vehicles/weapons) as plain scripts in models/ next to the html (works on Netlify and via file://)
MD=os.path.join(os.path.dirname(out),'models'); os.makedirs(MD,exist_ok=True); tot=0
for name,d in PACKS.items():
    files={os.path.basename(f)[:-4]:base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob(os.path.join(ROOT,d,'*.glb')))}
    if not files: continue
    js='TUHELJ_PACK('+json.dumps(name)+',{"files":'+json.dumps(files,separators=(',',':'))+'});\n'
    open(os.path.join(MD,name+'.js'),'w',encoding='utf-8').write(js); tot+=len(js)
if os.path.isdir(os.path.join(ROOT,'assets','LICENSES')): shutil.copytree(os.path.join(ROOT,'assets','LICENSES'),os.path.join(MD,'LICENSES'),dirs_exist_ok=True)
print('models/', len(PACKS),'paketa', round(tot/1e6,2),'MB (v='+PACK_V+')')
print(out, round(len(html.encode())/1e6,2),'MB')
