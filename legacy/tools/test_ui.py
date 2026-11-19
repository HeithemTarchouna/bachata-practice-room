"""Click-through test of the interface. Run after any change to the page.

Checks every control, every move, keyboard shortcuts, themes, the help dialog,
the real-motion mode and that nothing overflows sideways at common widths.
Prints PASS/FAIL per check and exits with code 1 if anything failed.

Run:    python tools/test_ui.py [motion.poses.json]
"""
import asyncio,sys,pathlib,json
ROOT=pathlib.Path(__file__).resolve().parent.parent
PAGE=(ROOT/'index.html').as_uri()
MOTION=sys.argv[1] if len(sys.argv)>1 else None
from playwright.async_api import async_playwright
fails=[];n=0
def ok(name,cond,info=''):
    global n;n+=1
    if not cond:fails.append(name);print('FAIL',name,info)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':1440,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto(PAGE);await pg.wait_for_timeout(600)
        ev=pg.evaluate
        names=await ev('moves.map(m=>m.name)');cnt=await pg.locator('.chip:not(.file)').count()
        ok('one library entry per move',cnt==len(names),f'{cnt} vs {len(names)}')
        # every move: title, count badge, timeline, cue text, tips
        for i,nm in enumerate(names):
            await pg.locator('.chip').nth(i).click()
            N=await ev('N');title=await pg.locator('#mname').inner_text()
            ok(f'{nm}: title',title==nm.replace(' (course)',''),title)
            ok(f'{nm}: selected in library',await pg.locator('.chip').nth(i).get_attribute('aria-pressed')=='true')
            ok(f'{nm}: timeline has {N} counts',await pg.locator('#beats .beat').count()==N)
            ok(f'{nm}: badge',(await pg.locator('.chip').nth(i).locator('.ct').inner_text())==str(N))
            ok(f'{nm}: tips listed',await pg.locator('#dlist li').count()>0 and await pg.locator('#elist li').count()>0)
            ok(f'{nm}: about',len(await pg.locator('#about').inner_text())>10)
            cues=await ev('moves[mi].keys.map(k=>k.cue)')
            for c in sorted(set([1,2,N//2,N])):
                await pg.locator('#beats .beat').nth(c-1).click();await pg.wait_for_timeout(120)
                ok(f'{nm}: count {c} shown',(await ev("document.getElementById('count').firstChild.nodeValue"))==str(c))
                ok(f'{nm}: cue {c}',(await pg.locator('#cue').inner_text())==cues[c-1])
                nl=await ev('NL')
                ok(f'{nm}: next cue {c}',('starts again' if (nl and c==N) else cues[c%N]) in await pg.locator('#nextCue').inner_text())
            if await ev('NL'):
                await ev('__seek(0)');await pg.wait_for_timeout(40)
                ok(f'{nm}: shows a starting position',(await pg.locator('#cueEyebrow').inner_text()).lower()=='starting position' and (await pg.locator('#cue').inner_text())==await ev('moves[mi].start.cue'))
                await pg.locator('#prev').click();ok(f'{nm}: back from start goes to the end',await ev('t')==N)
                await pg.locator('#next').click();ok(f'{nm}: forward from the end goes to start',await ev('t')==0)
            has=await ev('!!moves[mi].mistake')
            ok(f'{nm}: mistake button state',(await pg.locator('#mBad').is_disabled())==(not has))
            if has:
                await pg.locator('#mBad').click();await pg.wait_for_timeout(40)
                ok(f'{nm}: mistake mode on',await ev("bad&&document.getElementById('stage').classList.contains('bad')&&document.getElementById('cue').classList.contains('bad')&&!document.getElementById('fix').hidden"))
                ok(f'{nm}: mistake text',(await pg.locator('#cue').inner_text())==await ev('moves[mi].mistake.what'))
                await pg.locator('#mGood').click();await pg.wait_for_timeout(40)
                ok(f'{nm}: mistake mode off',await ev("!bad&&!document.getElementById('stage').classList.contains('bad')&&document.getElementById('fix').hidden"))
        # transport
        await pg.locator('.chip').nth(3).click();await ev('__seek(0)')
        await pg.locator('#next').click();ok('next',await ev('t')==1)
        await pg.locator('#prev').click();await pg.locator('#prev').click();ok('prev wraps',await ev('t')==7)
        await pg.locator('#play').click();await pg.wait_for_timeout(700)
        ok('play runs',await ev('playing')and (await pg.locator('#play .lb').inner_text())=='Pause')
        t1=await ev('t');await pg.wait_for_timeout(400);t2=await ev('t');ok('time advances',t1!=t2)
        await pg.locator('#play').click();ok('pause',not await ev('playing')and (await pg.locator('#play .lb').inner_text())=='Play')
        await pg.locator('.presets button[data-bpm="120"]').click()
        ok('tempo preset',await ev('bpm')==120 and '120' in await pg.locator('#bpmo').inner_text() and await pg.locator('.presets button[data-bpm="120"]').get_attribute('aria-pressed')=='true')
        await pg.locator('#bpm').fill('80');ok('tempo slider',await ev('bpm')==80 and '80' in await pg.locator('#bpmo').inner_text())
        await pg.locator('.presets button[data-bpm="60"]').click()
        await pg.locator('#snd').click();ok('click off',await ev('sound')==False and await pg.locator('#snd').get_attribute('aria-pressed')=='false')
        await pg.locator('#snd').click();ok('click on',await ev('sound')==True)
        await pg.locator('#gd').click();ok('guides off',await ev('guides')==False and await pg.locator('#gd').get_attribute('aria-pressed')=='false')
        await pg.locator('#gd').click();ok('guides on',await ev('guides')==True)
        # camera and zoom
        for v in ['you','top','pov','side']:
            await pg.locator(f'.views button[data-v="{v}"]').click()
            ok(f'view {v}',await pg.locator(f'.views button[data-v="{v}"]').get_attribute('aria-pressed')=='true' and (await ev('pov'))==(v=='pov'))
        z0=await ev('zoom');await pg.locator('#zin').click();z1=await ev('zoom');await pg.locator('#zout').click();await pg.locator('#zout').click();z2=await ev('zoom')
        ok('zoom buttons',z1>z0 and z2<z0);await pg.locator('#zin').click()
        box=await pg.locator('#cv').bounding_box();y0=await ev('yaw')
        await pg.mouse.move(box['x']+200,box['y']+200);await pg.mouse.down();await pg.mouse.move(box['x']+300,box['y']+220);await pg.mouse.up()
        ok('drag rotates',await ev('yaw')!=y0);await pg.locator('.views button[data-v="side"]').click()
        # keyboard
        await pg.locator('body').click(position={'x':5,'y':400});await ev('__seek(0)')
        await pg.keyboard.press('ArrowRight');ok('key right',await ev('t')==1)
        await pg.keyboard.press('ArrowLeft');ok('key left',await ev('t')==0)
        await pg.keyboard.press('Space');ok('key space plays',await ev('playing'));await pg.keyboard.press('Space');ok('key space pauses',not await ev('playing'))
        await pg.keyboard.press('3');ok('key 3 top view',await pg.locator('.views button[data-v="top"]').get_attribute('aria-pressed')=='true');await pg.keyboard.press('1')
        await pg.keyboard.press('m');ok('key m mistake',await ev('bad'));await pg.keyboard.press('m');ok('key m back',not await ev('bad'))
        await pg.keyboard.press('g');ok('key g guides',await ev('guides')==False);await pg.keyboard.press('g')
        b0=await ev('bpm');await pg.keyboard.press('ArrowUp');ok('key up tempo',await ev('bpm')>b0);await pg.keyboard.press('ArrowDown')
        # theme
        th0=await ev("document.documentElement.getAttribute('data-theme')");ink0=await ev('colors.ink')
        await pg.locator('#themeBtn').click();await pg.wait_for_timeout(80)
        ok('theme switches',await ev("document.documentElement.getAttribute('data-theme')")!=th0 and await ev('colors.ink')!=ink0)
        ok('theme saved',await ev("localStorage.getItem('bpr-theme')")==await ev("document.documentElement.getAttribute('data-theme')"))
        await pg.locator('#themeBtn').click()
        # help dialog
        await pg.locator('#helpBtn').click();ok('help opens',await ev("document.getElementById('help').open"))
        th=await ev('t');await pg.keyboard.press('ArrowRight');ok('keys ignored while help is open',await ev('t')==th)
        await pg.locator('#helpClose').click();ok('help closes',not await ev("document.getElementById('help').open"))
        # legend
        await pg.locator('.legend summary').click();ok('legend opens',await ev("document.querySelector('.legend').open"))
        # real motion
        if MOTION:
            await pg.locator('.chip.file input').set_input_files(MOTION);await pg.wait_for_timeout(500)
            ok('motion loads',await ev("!!motion&&document.body.classList.contains('motion')&&!document.getElementById('mbar').hidden"))
            ok('motion hides simulator controls',await ev("getComputedStyle(document.getElementById('beats')).display==='none'&&getComputedStyle(document.querySelector('.views')).display==='none'"))
            ok('motion title',(await pg.locator('#mname').inner_text())=='Real motion')
            await pg.locator('#play').click();await pg.wait_for_timeout(500);ok('motion plays',await ev('mt')>0);await pg.locator('#play').click()
            await pg.locator('#mmir').click();ok('motion mirror',await ev('mmir'))
            for _ in range(4):
                await pg.locator('#mtap').click();await ev('mt+=0.5')
            ok('motion tap tempo',await ev('mbpm')>0);await pg.locator('#mone').click()
            await pg.locator('#mA').click();await ev('mt+=2');await pg.locator('#mB').click();ok('motion loop',await ev('mA!=null&&mB!=null'));await pg.locator('#mclr').click()
            await pg.locator('.chip').nth(0).click();await pg.wait_for_timeout(100)
            ok('leaving motion restores simulator',await ev("!motion&&!document.body.classList.contains('motion')&&document.getElementById('mbar').hidden&&getComputedStyle(document.getElementById('beats')).display!=='none'"))
            ok('title back',(await pg.locator('#mname').inner_text())==names[0])
        # no sideways overflow, stage visible, at common sizes
        for w,h in [(360,740),(390,844),(768,1024),(1024,768),(1280,800),(1440,900),(1920,1080)]:
            await pg.set_viewport_size({'width':w,'height':h});await pg.wait_for_timeout(250)
            for i in [0,len(names)-1]:
                await pg.locator('.chip').nth(i).click();await pg.wait_for_timeout(80)
                sw=await ev('document.documentElement.scrollWidth');ok(f'no sideways scroll at {w}px (move {i})',sw<=w,f'{sw}')
            st=await pg.locator('#stage').bounding_box();cvh=await ev('H')
            ok(f'stage fits at {w}px',st['width']<=w and st['width']>=min(w,300)-40 and cvh>=300,str(st))
            ok(f'canvas matches stage at {w}px',abs((await ev('W'))-st['width'])<2)
        ok('no page errors',not errs,str(errs[:3]))
        await b.close()
    print(f'{n-len(fails)} of {n} checks passed');sys.exit(1 if fails else 0)
asyncio.run(main())
