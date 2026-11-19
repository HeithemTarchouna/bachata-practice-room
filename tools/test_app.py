"""Click-through test of the app (index.html). Run after every build.

Checks every move, every control, the keyboard, themes, the help dialog, real-motion mode, that the 3D stage
really draws something, and that nothing overflows sideways at common screen sizes.

Run:    python tools/test_app.py [motion.poses.json]
"""
import asyncio,sys,pathlib,io
ROOT=pathlib.Path(__file__).resolve().parent.parent
PAGE=(ROOT/'index.html').as_uri()
MOTION=sys.argv[1] if len(sys.argv)>1 else None
from playwright.async_api import async_playwright
from PIL import Image
fails=[];n=0
def ok(name,cond,info=''):
    global n;n+=1
    if not cond:fails.append(name);print('FAIL',name,info)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':1440,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto(PAGE);await pg.wait_for_function('window.__app!==undefined',timeout=20000)
        ev=pg.evaluate;st=lambda k:ev(f'__app.state.{k}')
        names=await ev('__engine.moves.map(m=>m.name)');chips=pg.locator('.chip:not(.file)')
        ok('one list entry per move',await chips.count()==len(names))
        for i,nm in enumerate(names):
            await chips.nth(i).click();N=await st('counts');nl=await st('noLoop')
            ok(f'{nm}: title',(await pg.locator('#mname').inner_text())==nm.replace(' (course)',''))
            ok(f'{nm}: selected',await chips.nth(i).get_attribute('aria-pressed')=='true')
            ok(f'{nm}: timeline',await pg.locator('#beats .beat').count()==N)
            ok(f'{nm}: badge',(await chips.nth(i).locator('.ct').inner_text())==str(N))
            ok(f'{nm}: tips',await pg.locator('#dlist li').count()>0 and await pg.locator('#elist li').count()>0)
            cues=await ev('__engine.moves[__app.state.move].keys.map(k=>k.cue)')
            for c in sorted(set([1,2,N//2,N])):
                await pg.locator('#beats .beat').nth(c-1).click()
                try: await pg.wait_for_function(f"document.getElementById('count').firstChild.nodeValue==='{c}'",timeout=5000)
                except Exception: pass
                ok(f'{nm}: count {c} shown',(await ev("document.getElementById('count').firstChild.nodeValue"))==str(c))
                ok(f'{nm}: cue {c}',(await pg.locator('#cue').inner_text())==cues[c-1])
                ok(f'{nm}: next cue {c}',('starts again' if (nl and c==N) else cues[c%N]) in await pg.locator('#nextCue').inner_text())
            if nl:
                await ev('__app.seek(0)');await pg.wait_for_timeout(120)
                ok(f'{nm}: starting position shown',(await pg.locator('#cueEyebrow').inner_text()).lower()=='starting position')
                await pg.locator('#prev').click();ok(f'{nm}: back from start = end',await st('t')==N)
                await pg.locator('#next').click();ok(f'{nm}: forward from end = start',await st('t')==0)
            has=await ev('!!__engine.moves[__app.state.move].mistake')
            ok(f'{nm}: mistake button',(await pg.locator('#mBad').is_disabled())==(not has))
            if has:
                await pg.locator('#mBad').click();await pg.wait_for_timeout(100)
                ok(f'{nm}: mistake on',await st('mistake') and await ev("document.getElementById('stage').classList.contains('bad')&&!document.getElementById('fix').hidden"))
                await pg.locator('#mGood').click();await pg.wait_for_timeout(100);ok(f'{nm}: mistake off',not await st('mistake'))
        # the motion gets smoothed in the background
        await chips.nth(3).click();await pg.wait_for_function('__app.state.baked',timeout=60000);ok('motion smoothing finishes',await st('baked'))
        ok('smoothing notice hidden when done',await ev("document.getElementById('baking').hidden"))
        # the 3D stage really draws the dancers
        im=Image.open(io.BytesIO(await pg.locator('#gl').screenshot())).convert('RGB');colors=im.getcolors(1<<24) or []
        ok('3D stage draws figures',len(colors)>300,str(len(colors)))
        # transport
        await ev('__app.seek(0)');await pg.locator('#next').click();ok('next',await st('t')==1)
        await pg.locator('#prev').click();await pg.locator('#prev').click();ok('prev wraps',await st('t')==7)
        await pg.locator('#play').click();await pg.wait_for_timeout(700);ok('play',await st('playing') and (await pg.locator('#play .lb').inner_text())=='Pause')
        t1=await st('t');await pg.wait_for_timeout(400);ok('time advances',await st('t')!=t1)
        await pg.locator('#play').click();ok('pause',not await st('playing'))
        await pg.locator('.presets button[data-bpm="120"]').click();ok('tempo preset',await st('bpm')==120 and '120' in await pg.locator('#bpmo').inner_text())
        await pg.locator('#bpm').fill('80');ok('tempo slider',await st('bpm')==80);await pg.locator('.presets button[data-bpm="60"]').click()
        await pg.locator('#snd').click();ok('click off',await st('sound')==False);await pg.locator('#snd').click()
        await pg.locator('#gd').click();ok('guides off',await st('guides')==False and await pg.locator('#gd').get_attribute('aria-pressed')=='false');await pg.locator('#gd').click()
        for v in ['you','top','pov','side']:
            await pg.locator(f'.views button[data-v="{v}"]').click();ok(f'view {v}',await st('view')==v and await pg.locator(f'.views button[data-v="{v}"]').get_attribute('aria-pressed')=='true')
        z0=await st('zoom');await pg.locator('#zin').click();z1=await st('zoom');await pg.locator('#zout').click();await pg.locator('#zout').click();ok('zoom',z1>z0 and await st('zoom')<z0);await pg.locator('#zin').click()
        box=await pg.locator('#over').bounding_box();y0=await st('yaw')
        await pg.mouse.move(box['x']+200,box['y']+200);await pg.mouse.down();await pg.mouse.move(box['x']+300,box['y']+220);await pg.mouse.up()
        ok('drag rotates',await st('yaw')!=y0 and await st('view')=='free');await pg.locator('.views button[data-v="side"]').click()
        # keyboard
        await pg.locator('body').click(position={'x':5,'y':400});await ev('__app.seek(0)')
        await pg.keyboard.press('ArrowRight');ok('key right',await st('t')==1);await pg.keyboard.press('ArrowLeft');ok('key left',await st('t')==0)
        await pg.keyboard.press('Space');ok('space plays',await st('playing'));await pg.keyboard.press('Space');ok('space pauses',not await st('playing'))
        await pg.keyboard.press('3');ok('key 3 = top',await st('view')=='top');await pg.keyboard.press('1')
        await pg.keyboard.press('m');ok('key m',await st('mistake'));await pg.keyboard.press('m')
        await pg.keyboard.press('g');ok('key g',await st('guides')==False);await pg.keyboard.press('g')
        b0=await st('bpm');await pg.keyboard.press('ArrowUp');ok('key up',await st('bpm')>b0);await pg.keyboard.press('ArrowDown')
        # theme, help, legend
        th=await ev("document.documentElement.getAttribute('data-theme')");await pg.locator('#themeBtn').click()
        ok('theme switches and is saved',await ev("document.documentElement.getAttribute('data-theme')")!=th and await ev("localStorage.getItem('bpr-theme')===document.documentElement.getAttribute('data-theme')"));await pg.locator('#themeBtn').click()
        await pg.locator('#helpBtn').click();ok('help opens',await ev("document.getElementById('help').open"))
        t0=await st('t');await pg.keyboard.press('ArrowRight');ok('keys ignored in help',await st('t')==t0)
        await pg.locator('#helpClose').click();ok('help closes',not await ev("document.getElementById('help').open"))
        await pg.locator('.legend summary').click();ok('legend opens',await ev("document.querySelector('.legend').open"))
        if MOTION:
            await pg.locator('.chip.file input').set_input_files(MOTION);await pg.wait_for_timeout(600)
            ok('real motion loads',await st('realMotion') and not await ev("document.getElementById('mbar').hidden"))
            ok('real motion hides simulator controls',await ev("getComputedStyle(document.getElementById('beats')).display==='none'"))
            await pg.locator('#play').click();await pg.wait_for_timeout(500);ok('real motion plays',await st('motionTime')>0);await pg.locator('#play').click()
            for _ in range(4):
                await pg.locator('#mtap').click();await pg.locator('#next').click();await pg.locator('#next').click();await pg.locator('#next').click()
            ok('tap tempo',await st('motionBpm')>0);await pg.locator('#mone').click();await pg.locator('#mmir').click()
            await chips.nth(0).click();await pg.wait_for_timeout(150)
            ok('leaving real motion',not await st('realMotion') and await ev("document.getElementById('mbar').hidden&&getComputedStyle(document.getElementById('beats')).display!=='none'"))
        for w,h in [(360,740),(390,844),(768,1024),(1024,768),(1280,800),(1440,900),(1920,1080)]:
            await pg.set_viewport_size({'width':w,'height':h});await pg.wait_for_timeout(300)
            for i in [0,len(names)-1]:
                await chips.nth(i).click();await pg.wait_for_timeout(100);sw=await ev('document.documentElement.scrollWidth');ok(f'no sideways scroll at {w}px (move {i})',sw<=w,str(sw))
            s=await pg.locator('#stage').bounding_box();g=await pg.locator('#gl').bounding_box()
            ok(f'stage fits at {w}px',s['width']<=w and s['height']>=300,str(s));ok(f'3D layer fills the stage at {w}px',abs(g['width']-s['width'])<3 and abs(g['height']-s['height'])<3,str(g))
        ok('no page errors',not errs,str(errs[:3]))
        await b.close()
    print(f'{n-len(fails)} of {n} checks passed');sys.exit(1 if fails else 0)
asyncio.run(main())
