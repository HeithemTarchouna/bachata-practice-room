"""Full-page or stage screenshot of the built app. Usage: python tools/shot.py out.png [width height] [move] [count] [view] [theme] [stage]"""
import asyncio,sys,pathlib
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
a=sys.argv;out=a[1];w=int(a[2]) if len(a)>2 else 1440;h=int(a[3]) if len(a)>3 else 900;mv=int(a[4]) if len(a)>4 else 0;cnt=float(a[5]) if len(a)>5 else 1
view=a[6] if len(a)>6 else 'side';theme=a[7] if len(a)>7 else 'light';stage=len(a)>8
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=await b.new_page(viewport={'width':w,'height':h})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto(PAGE);await pg.wait_for_function('window.__app!==undefined',timeout=20000)
        await pg.evaluate(f"document.documentElement.setAttribute('data-theme','{theme}');__app.select({mv});__app.setView('{view}');__app.seek({cnt})")
        await pg.wait_for_function('__app.state.baked',timeout=60000);await pg.wait_for_timeout(900)
        if stage: await pg.locator('#stage').screenshot(path=out)
        else: await pg.screenshot(path=out,full_page=True)
        print(errs);await b.close()
asyncio.run(main())
