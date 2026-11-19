"""Side-by-side check of the course combination against the course video.

For each count of a section it puts the video frame (left) next to the app at
the same count (right), seen from the same side as the video camera.

Usage: python tools/compare_course.py SECTION out.png [half]
  SECTION is one of: basic cbl lturn hturn back loopturn hisloop closed
  half: add the half counts too (two sheets worth of frames)
Needs the course video in the project folder.
"""
import asyncio,sys,pathlib,io,glob
import cv2
from PIL import Image,ImageDraw
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
PAGE=(ROOT/'index.html').as_uri()
VIDEO=[f for f in glob.glob(str(ROOT/'*.mp4')) if 'Tutorial' in f][0]
# video time (seconds) of each count, from the slowest run-through (38:53) and the last-part walkthrough (42:40)
TIMES={
 'basic':[2343.2,2344.3,2345.4,2346.6,2348.1,2349.2,2350.2,2351.3],
 'cbl':[2352.7,2353.7,2354.8,2356.1,2357.6,2358.8,2360.0,2361.3],
 'lturn':[2362.8,2363.6,2364.5,2365.6,2366.7,2367.8,2368.9,2369.9],
 'hturn':[2371.1,2372.3,2373.3,2374.4,2375.9,2376.8,2377.8,2379.0],
 'back':[2380.4,2381.4,2382.3,2383.2,2384.3,2385.2,2386.2,2387.2],
 'loopturn':[2388.4,2389.5,2390.4,2391.6,2392.9,2394.1,2395.7,2397.6],
 'hisloop':[2399.6,2400.9,2401.7,2402.9,2580.9,2582.0,2583.2,2584.4],
 'closed':[2585.8,2586.6,2587.4,2588.3,2588.3,2588.3,2588.3,2588.3]}
ORDER=['basic','cbl','lturn','hturn','back','loopturn','hisloop','closed']
sec=sys.argv[1];out=sys.argv[2];half=len(sys.argv)>3
base=ORDER.index(sec)*8;ts=TIMES[sec]
frames=[]  # (label, video time, app t)
for i in range(8):
    if half and i>0: frames.append((f'{i+.5:.1f}',(ts[i-1]+ts[i])/2,base+i+.5-1+1-1+0))
    frames.append((str(i+1),ts[i],base+i+1))
if half:
    frames=[]
    prev=ts[0]-(ts[1]-ts[0])
    for i in range(8):
        frames.append((f'{i+.5:.1f}',(prev+ts[i])/2,base+i+.5));frames.append((str(i+1),ts[i],base+i+1));prev=ts[i]
TW,TH=330,283
def vframe(cap,t):
    cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,f=cap.read()
    h,w=f.shape[:2];f=f[int(.08*h):int(.95*h),int(.25*w):int(.80*w)]
    f=cv2.resize(f,(TW,TH),interpolation=cv2.INTER_AREA)
    return Image.fromarray(cv2.cvtColor(f,cv2.COLOR_BGR2RGB))
async def main():
    cap=cv2.VideoCapture(VIDEO);cells=[]
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':430,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(500)
        idx=await pg.evaluate("moves.findIndex(m=>m.name==='Course combination')")
        await pg.locator('.chip').nth(idx).click()
        await pg.evaluate("yaw=Math.PI;pitch=.16;zoom=.98;camY=.78;guides=false;document.querySelectorAll('.count,.views,.zoom,.hint').forEach(e=>e.style.display='none')")
        await pg.evaluate(f'__seek({frames[0][2]})');await pg.wait_for_timeout(900)
        for lab,vt,at in frames:
            await pg.evaluate(f'__seek({at})');await pg.wait_for_timeout(350)
            im=Image.open(io.BytesIO(await pg.locator('#cv').screenshot())).convert('RGB')
            w,h=im.size;k=TH/h;im=im.resize((int(w*k),TH))
            cell=Image.new('RGB',(TW*2+6,TH),'white');cell.paste(vframe(cap,vt),(0,0));cell.paste(im,(TW+6+(TW-im.size[0])//2,0))
            d=ImageDraw.Draw(cell);d.rectangle((0,0,54,16),fill='black');d.text((4,2),f'count {lab}',fill='yellow')
            cells.append(cell)
        print(errs);await b.close()
    cols=2 if not half else 3;rows=(len(cells)+cols-1)//cols
    s=Image.new('RGB',((TW*2+6)*cols+8*(cols-1),(TH+6)*rows),'#888')
    for i,c in enumerate(cells): s.paste(c,(((TW*2+6)+8)*(i%cols),(TH+6)*(i//cols)))
    s.save(out)
asyncio.run(main())
