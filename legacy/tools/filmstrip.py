"""Filmstrip of one move: many small frames close together in time.
Use it to judge footwork, which single screenshots can't show.

Usage: python tools/filmstrip.py move_index start end step view zoom out.png [feet]
Example: python tools/filmstrip.py 3 4 8 0.2 top 2 strip.png
         python tools/filmstrip.py 3 0 8 0.125 side 1.7 strip.png feet
  view is one of: side, you, top, pov.
  feet: aim the camera at the floor, hide the guides, and crop to the legs.
"""
import asyncio,sys,pathlib,io
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
from PIL import Image,ImageDraw
mv=int(sys.argv[1]);a=float(sys.argv[2]);b=float(sys.argv[3]);st=float(sys.argv[4]);view=sys.argv[5];zm=float(sys.argv[6]);out=sys.argv[7]
feet=len(sys.argv)>8 and sys.argv[8]=='feet'
async def main():
    shots=[]
    async with async_playwright() as p:
        br=await p.chromium.launch();pg=await br.new_page(viewport={'width':390,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        await pg.locator('.chip').nth(mv).click()
        await pg.locator(f'.views button[data-v="{view}"]').click()
        await pg.evaluate(f'zoom={zm}')
        if feet: await pg.evaluate('camY=.42;guides=false')
        # let the camera settle on the couple before the first frame
        await pg.evaluate(f'__seek({a})');await pg.wait_for_timeout(900)
        t=a
        while t<=b+1e-6:
            await pg.evaluate(f'__seek({t})');await pg.wait_for_timeout(70)
            im=Image.open(io.BytesIO(await pg.locator('#cv').screenshot())).convert('RGB')
            if feet:
                w,h=im.size;im=im.crop((0,int(h*.28),w,h)).resize((w*2//3,int(h*.72)*2//3))
            shots.append((t,im));t+=st
        print(errs);await br.close()
    w,h=shots[0][1].size;cols=8 if feet else 6;rows=(len(shots)+cols-1)//cols
    s=Image.new('RGB',(w*cols,h*rows),'white');d=ImageDraw.Draw(s)
    for i,(t,im) in enumerate(shots):
        x,y=w*(i%cols),h*(i//cols);s.paste(im,(x,y));d.rectangle((x,y,x+40,y+14),fill='black');d.text((x+3,y+1),f'{t+1:.2f}' if False else f'{t:.2f}',fill='yellow')
    s.save(out)
asyncio.run(main())
