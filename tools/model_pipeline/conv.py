import asyncio, sys, json, base64, time, os
from playwright.async_api import async_playwright
AV=[x for x in sys.argv[1].split(',') if x] if len(sys.argv)>1 else []
ANIMS=json.loads(open(sys.argv[2]).read()) if len(sys.argv)>2 else {}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page()
        pg.on('console',lambda m: print('JS:',m.text[:200]) if ('warn' in m.type or 'error' in m.type) and 'deprecated' not in m.text else None)
        pg.on('pageerror',lambda e: print('PAGEERROR',e))
        import mimetypes, os
        async def route(r):
            u=r.request.url
            if u.startswith('http://local/'):
                pth='/home/claude/pipe/'+u[len('http://local/'):].split('?')[0]
                from urllib.parse import unquote
                pth=unquote(pth)
                if os.path.exists(pth):
                    ct='application/javascript' if pth.endswith('.js') else (mimetypes.guess_type(pth)[0] or 'application/octet-stream')
                    await r.fulfill(body=open(pth,'rb').read(),content_type=ct,headers={'Access-Control-Allow-Origin':'*'})
                else: await r.fulfill(status=404,body='nf')
            else: await r.abort()
        await pg.route('**/*',route)
        await pg.goto('http://local/convert.html'); await pg.wait_for_function('window.READY===true',timeout=60000)
        for n in AV:
            t=time.time(); r=await pg.evaluate('(n)=>convertAvatar(n)',n)
            open(f'out/raw/{n}.glb','wb').write(base64.b64decode(r['glb']))
            i=r['info']; print('##',n,round(time.time()-t,1),'s bytes',i['bytes'],'bones',i['bones'],'root',i['rootBone'],'bbox',i['bbox'],'scale',i['scale'])
            for m in i['meshes']: print('   ',m['mesh'],m['skinned'],m['tris'],m['mat'],m['type'],(m['map'] or '').split('/')[-1],(m['alphaMap'] or '').split('/')[-1],'N' if m['normal'] else '-','T' if m['transparent'] else '-',m['opacity'],'ALPHA' if m['alpha'] else '')
        import glob
        for f in [x for x in (sys.argv[3].split(',') if len(sys.argv)>3 else []) if x]:
            r=await pg.evaluate('(u)=>convertModel(u)',f)
            nm=f.split('/')[-1].rsplit('.',1)[0]; sub=f.split('/')[-2]
            os.makedirs('out/raw_'+sub,exist_ok=True); open(f'out/raw_{sub}/{nm}.glb','wb').write(base64.b64decode(r['glb']))
            i=r['info']; print('##',nm,'bytes',i['bytes'],'bbox',i['bbox'],'anims',i['anims'])
            for e in i['nodes']: print('   ',e)
        for spec in [x for x in (sys.argv[4].split(',') if len(sys.argv)>4 else []) if x]:
            f,L=spec.split(':'); r=await pg.evaluate('(a)=>bakeGun(a[0],a[1])',[f,float(L)])
            nm=f.split('/')[-1].rsplit('.',1)[0]; os.makedirs('out/guns',exist_ok=True); open(f'out/guns/{nm}.glb','wb').write(base64.b64decode(r['glb']))
            print('## gun',nm,r['info'])
        for label,lst in ANIMS.items():
            t=time.time(); r=await pg.evaluate('([l,s])=>convertAnims(l,s)',[label,lst])
            open(f'out/raw/anim_{label}.glb','wb').write(base64.b64decode(r['glb']))
            print('## anims',label,round(time.time()-t,1),'s bytes',r['info']['bytes'])
            for c in r['info']['clips']: print('   ',c)
        await b.close()
asyncio.run(main())
