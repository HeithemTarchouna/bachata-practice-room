"""Screenshot the whole page (not just the stage) at a given window size.
Use it to review the interface.

Usage: python tools/pageshot.py out.png [width height] [move_index] [theme] [count] [extra_js]
Example: python tools/pageshot.py ui.png 1440 900 3 dark 5
"""
import asyncio,sys,pathlib
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
out=sys.argv[1];w=int(sys.argv[2]) if len(sys.argv)>2 else 1440;h=int(sys.argv[3]) if len(sys.argv)>3 else 900
mv=int(sys.argv[4]) if len(sys.argv)>4 else 3;theme=sys.argv[5] if len(sys.argv)>5 else 'light'
cnt=float(sys.argv[6]) if len(sys.argv)>6 else 5;extra=sys.argv[7] if len(sys.argv)>7 else ''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':w,'height':h},color_scheme='dark' if theme=='dark' else 'light')
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto(PAGE);await pg.wait_for_timeout(700)
        await pg.evaluate(f"document.documentElement.setAttribute('data-theme','{theme}')")
        await pg.locator('.chip').nth(mv).click()
        await pg.evaluate(f'__seek({cnt})')
        if extra: await pg.evaluate(extra)
        await pg.wait_for_timeout(900)
        await pg.screenshot(path=out,full_page=True)
        print(errs);await b.close()
asyncio.run(main())
