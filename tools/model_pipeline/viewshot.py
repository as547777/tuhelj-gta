import asyncio, sys, json, base64, os, mimetypes
from urllib.parse import unquote
from playwright.async_api import async_playwright
async def main():
    args=json.loads(sys.argv[1]); out=sys.argv[2]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':1400,'height':620})
        pg.on('pageerror',lambda e: print('PAGEERROR',e)); pg.on('console',lambda m: print('JS:',m.text[:200]) if m.type in ('error','warning') else None)
        async def route(r):
            u=r.request.url
            if u.startswith('http://local/'):
                pth=unquote('/home/claude/pipe/'+u[13:].split('?')[0])
                if os.path.exists(pth): await r.fulfill(body=open(pth,'rb').read(),content_type='application/javascript' if pth.endswith('.js') else (mimetypes.guess_type(pth)[0] or 'application/octet-stream'))
                else: await r.fulfill(status=404,body='nf')
            else: await r.abort()
        await pg.route('**/*',route); await pg.goto('http://local/'+(sys.argv[3] if len(sys.argv)>3 else 'view.html')); await pg.wait_for_function('window.READY===true',timeout=60000)
        url,info,cm,cf=await pg.evaluate('(a)=>run(a[0],a[1],a[2])',args)
        open(out,'wb').write(base64.b64decode(url.split(',')[1])); print(info); print('M',cm); print('F',cf)
        await b.close()
asyncio.run(main())
