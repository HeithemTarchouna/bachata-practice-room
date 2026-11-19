"""Screenshot the stage at chosen moments, tiled into one image.

Usage: python tools/screenshot.py "[(move_index, count_time, view, mistake), ...]" out.png
  view is one of: side, you, top, pov.   mistake is 0 or 1.
Example: python tools/screenshot.py "[(3,5.5,'side',0),(3,5.5,'top',0)]" turn.png
"""
import asyncio,sys,pathlib
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
cases=eval(sys.argv[1]);out=sys.argv[2]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        for i,(mv,tt,view,badm) in enumerate(cases):
            await pg.locator('.chip').nth(mv).click()
            await pg.locator('#mBad' if badm else '#mGood').click()
            await pg.locator(f'.views button[data-v="{view}"]').click()
            await pg.evaluate(f'__seek({tt})');await pg.wait_for_timeout(80)
            await pg.locator('#stage').screenshot(path=f'c{i}.png')
        print(errs);await b.close()
asyncio.run(main())
from PIL import Image
n=len(cases);cols=4;rows=(n+cols-1)//cols;tw,th=Image.open('c0.png').size
s=Image.new('RGB',(tw*cols,th*rows),'white')
for i in range(n): s.paste(Image.open(f'c{i}.png'),(tw*(i%cols),th*(i//cols)))
s.save(out)
