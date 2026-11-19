"""One move seen from every camera at a row of moments: rows = Side, Behind, Top, POV, other side; columns = times.
Use it to check by eye that nothing passes through anything, from all angles.

Usage: python tools/viewsheet.py move_index out.png t1 t2 t3 ...
Example: python tools/viewsheet.py 7 wrap.png 5 5.5 6 6.5 7 7.5 8
"""
import asyncio,sys,pathlib,io
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
from PIL import Image,ImageDraw
mv=int(sys.argv[1]);out=sys.argv[2];ts=[float(x) for x in sys.argv[3:]]
VIEWS=[('side',None),('you',None),('top',None),('pov',None),('far side','yaw=3.76;pitch=.36'),('front of her','yaw=1.9;pitch=.3')]
async def main():
    rows=[]
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':430,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        await pg.locator('.chip').nth(mv).click()
        await pg.evaluate("guides=false;document.querySelectorAll('.views,.zoom,.hint').forEach(e=>e.style.display='none')")
        for name,js in VIEWS:
            if js: await pg.locator('.views button[data-v="side"]').dispatch_event('click');await pg.evaluate(js)
            else: await pg.locator(f'.views button[data-v="{name}"]').dispatch_event('click')
            await pg.evaluate('zoom=1.3');await pg.evaluate(f'__seek({ts[0]})');await pg.wait_for_timeout(700)
            row=[]
            for t in ts:
                await pg.evaluate(f'__seek({t})');await pg.wait_for_timeout(260)
                im=Image.open(io.BytesIO(await pg.locator('#cv').screenshot())).convert('RGB');w,h=im.size
                im=im.resize((w*3//4,h*3//4));d=ImageDraw.Draw(im);d.rectangle((0,im.size[1]-15,90,im.size[1]),fill='black');d.text((3,im.size[1]-13),f'{name} {t:g}',fill='yellow');row.append(im)
            rows.append(row)
        print(errs);await b.close()
    w,h=rows[0][0].size;s=Image.new('RGB',(w*len(ts),h*len(rows)),'white')
    for r,row in enumerate(rows):
        for c,im in enumerate(row): s.paste(im,(c*w,r*h))
    s.save(out)
asyncio.run(main())
