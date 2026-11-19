"""Record a move of the app as a real video file (mp4), so the motion itself can be watched.

Frames are rendered one by one at exact times, so the video is perfectly smooth even on a slow machine.
Needs ffmpeg on the PATH.

Usage: python tools/film.py move_index out.mp4 [--view side|you|top|pov] [--bpm 60] [--fps 30] [--zoom 1.2] [--loops 1]
"""
import asyncio,sys,pathlib,subprocess,tempfile,shutil
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
def opt(name,default):
    return type(default)(sys.argv[sys.argv.index(name)+1]) if name in sys.argv else default
mv=int(sys.argv[1]);out=sys.argv[2];view=opt('--view','side');bpm=opt('--bpm',60.0);fps=opt('--fps',30);zoom=opt('--zoom',1.2);loops=opt('--loops',1)
async def main():
    tmp=pathlib.Path(tempfile.mkdtemp())
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=await b.new_page(viewport={'width':760,'height':900})
        await pg.goto(PAGE);await pg.wait_for_function('window.__app!==undefined',timeout=20000)
        await pg.evaluate(f"__app.select({mv});__app.setView('{view}');__app.camera.zoom={zoom};document.querySelectorAll('.zoom,.hint').forEach(e=>e.style.display='none')")
        await pg.wait_for_function('__app.state.baked',timeout=120000)
        n=await pg.evaluate('__app.state.counts');total=int(n*loops*60/bpm*fps)
        await pg.evaluate('__app.seek(0)');await pg.wait_for_timeout(800)
        for i in range(total):
            t=(i/fps*bpm/60)%n
            await pg.evaluate(f'__app.seek({t})');await pg.wait_for_timeout(45)
            await pg.locator('#stage').screenshot(path=str(tmp/f'f{i:05d}.png'))
        await b.close()
    subprocess.run(['ffmpeg','-v','error','-y','-framerate',str(fps),'-i',str(tmp/'f%05d.png'),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-pix_fmt','yuv420p','-crf','20',out],check=True)
    shutil.rmtree(tmp);print('saved',out,total,'frames')
asyncio.run(main())
