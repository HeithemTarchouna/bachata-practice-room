"""One move of the app seen from every camera at a row of moments.
Rows: side, behind, top, POV, far side, in front of her. Columns: the times you give (in counts).

Usage: python tools/views.py move_index out.png t1 t2 t3 ...  [--zoom 1.3] [--mistake] [--follower]
Example: python tools/views.py 8 hammerlock.png 4 5 5.5 6 6.5 7 8
"""
import asyncio,sys,pathlib,io
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
from PIL import Image,ImageDraw
args=[a for a in sys.argv[1:] if not a.startswith('--')];zoom=float(sys.argv[sys.argv.index('--zoom')+1]) if '--zoom' in sys.argv else 1.3
if '--zoom' in sys.argv: args.remove(sys.argv[sys.argv.index('--zoom')+1])
mv=int(args[0]);out=args[1];ts=[float(x) for x in args[2:]];mistake='--mistake' in sys.argv;role='f' if '--follower' in sys.argv else 'l'
VIEWS=[('side',"__app.setView('side')"),('behind',"__app.setView('you')"),('top',"__app.setView('top')"),('pov',"__app.setView('pov')"),
       ('far side',"__app.setView('side');__app.camera.yaw=3.76;__app.camera.pitch=.36"),('front of her',"__app.setView('side');__app.camera.yaw=1.9;__app.camera.pitch=.3")]
async def main():
    rows=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=await b.new_page(viewport={'width':430,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_function('window.__app!==undefined',timeout=20000)
        await pg.evaluate(f"__app.setRole('{role}');__app.select({mv});{'__app.setMistake(true);' if mistake else ''}document.querySelectorAll('.views,.zoom,.hint').forEach(e=>e.style.display='none');document.getElementById('gd').click()")
        await pg.wait_for_function('__app.state.baked',timeout=120000)
        for name,js in VIEWS:
            await pg.evaluate(js+f";__app.camera.zoom={zoom};__app.seek({ts[0]})");await pg.wait_for_timeout(900)
            row=[]
            for t in ts:
                await pg.evaluate(f'__app.seek({t})');await pg.wait_for_timeout(300)
                im=Image.open(io.BytesIO(await pg.locator('#stage').screenshot())).convert('RGB');w,h=im.size
                im=im.resize((w*3//4,h*3//4));d=ImageDraw.Draw(im);d.rectangle((0,im.size[1]-15,100,im.size[1]),fill='black');d.text((3,im.size[1]-13),f'{name} {t:g}',fill='yellow');row.append(im)
            rows.append(row)
        print(errs);await b.close()
    w,h=rows[0][0].size;s=Image.new('RGB',(w*len(ts),h*len(rows)),'white')
    for r,row in enumerate(rows):
        for c,im in enumerate(row): s.paste(im,(c*w,r*h))
    s.save(out)
asyncio.run(main())
