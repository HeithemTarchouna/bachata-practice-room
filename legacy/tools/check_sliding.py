"""Foot sliding checker for the practice room.

For every move, steps through time and adds up how far each foot travels
along the floor while it is NOT lifted (a planted foot should stay put; it may
pivot on the spot). Reports the total slide per dancer in cm, and the worst
single slide between two neighbouring counts. Small numbers are good.

Run:    python tools/check_sliding.py
"""
import asyncio,json,pathlib,sys
PAGE=(pathlib.Path(sys.argv[1]).resolve() if len(sys.argv)>1 else pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
JS=r'''()=>{
const out=[];
for(let m=0;m<moves.length;m++){selectMove(m);setBad(false);
 const res={};
 for(const w of ['l','f']){let tot=0,worst=0,worstT=0,prev=null,seg={};
  for(let i=0;i<=N*40;i++){t=Math.min(i/40,N-1e-6);const p0=pose('f',null),Pl=pose('l',p0.c),P=w==='l'?Pl:pose('f',Pl.c);
   if(prev)for(const sd of ['L','R']){const a=prev[sd],b=P[sd];
    if(a[1]<.004&&b[1]<.004){const d=Math.hypot(a[0]-b[0],a[2]-b[2]);tot+=d;const k=Math.floor(t);seg[k]=(seg[k]||0)+d;if(seg[k]>worst){worst=seg[k];worstT=k}}}
   prev={L:P.L,R:P.R}}
  res[w]={total_cm:+(tot*100).toFixed(1),worst_cm:+(worst*100).toFixed(1),after_count:worstT};}
 out.push({move:moves[m].name,...res});}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        for x in await pg.evaluate(JS):
            print(x['move'],'| leader',json.dumps(x['l']),'| follower',json.dumps(x['f']))
        print(errs);await b.close()
asyncio.run(main())
