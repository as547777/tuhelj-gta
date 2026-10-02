import asyncio, sys, time, json, base64
from playwright.async_api import async_playwright
THREE=open('/home/claude/tuhelj/three.min.js','rb').read()
def log(*a): print(*a, flush=True)
async def main():
    shots=json.load(open(sys.argv[1])); W=int(sys.argv[2]); H=int(sys.argv[3]); q=int(sys.argv[4]) if len(sys.argv)>4 else 0
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':W,'height':H})
        pg.on('console',lambda m: log('JS:',m.text) if ('deprecated' not in m.text and 'ERR_FAILED' not in m.text) else None)
        pg.on('pageerror',lambda e: log('PAGEERROR',e))
        async def route(r):
            u=r.request.url
            if 'three' in u and u.endswith('.js'): await r.fulfill(body=THREE,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.abort()
        await pg.route('**/*',route)
        await pg.add_init_script('window.__NOLOOP=1;')
        t0=time.time()
        await pg.goto('file:///home/claude/tuhelj/test.html')
        await pg.wait_for_function("document.getElementById('go') && !document.getElementById('go').disabled || /Greška/.test(document.getElementById('ltxt').textContent)",timeout=400000,polling=1000)
        log('loaded',round(time.time()-t0,1), await pg.evaluate("document.getElementById('ltxt').textContent"))
        await pg.evaluate(f"()=>{{ setQuality({q}); GAME.renderer.setPixelRatio(1); GAME.renderer.setSize({W},{H}); GAME.camera.aspect={W}/{H}; GAME.camera.updateProjectionMatrix(); GAME.started=true; PLAYER.enabled=false; }}")
        for i,s in enumerate(shots):
            name=s.get('name',f's{i}')
            js="""(s)=>{ if(s.hour) setTimeOfDay(GAME.renderer,GAME.scene,s.hour); teleport(s.x,s.z,s.lx,s.lz); PLAYER.pitch=s.pitch||0.0; PLAYER.fly=!!s.up; if(s.up) PLAYER.pos.y+=s.up; if(s.js) eval(s.js);
                GAME.frame(performance.now()); const r=GAME.renderer; const info=r.info.render.calls+' calls '+r.info.render.triangles+' tris'; return [r.domElement.toDataURL('image/jpeg',0.9),info]; }"""
            t1=time.time(); url,info=await pg.evaluate(js,s)
            open(f'/home/claude/tuhelj/shots/{name}.jpg','wb').write(base64.b64decode(url.split(',')[1]))
            log('shot',name,round(time.time()-t1,1),'s',info)
        await b.close()
asyncio.run(main())
