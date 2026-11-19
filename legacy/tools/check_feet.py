"""Footwork checker for the practice room.

Part 1, turns only (counts 5 to 8 of the turning dancer): how often both feet
travel or rotate at the same moment, and the largest angle between the feet.
Part 2, every move and both dancers: the longest reach of a foot away from
the body (a leg starts to look stretched above about 27 cm) and the widest
gap between the two feet.

Run:    python tools/check_feet.py [path/to/index.html]
"""
import asyncio,json,pathlib,sys
PAGE=(pathlib.Path(sys.argv[1]).resolve() if len(sys.argv)>1 else pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
JS=r'''()=>{
const P=(w)=>{const p0=pose('f',null),Pl=pose('l',p0.c);return w==='l'?Pl:pose('f',Pl.c)};
const turns=[],reach=[];
for(const [m,w] of [[3,'f'],[4,'f'],[5,'l'],[7,'f'],[8,'f']]){selectMove(m);setBad(false);
 let prev=null,n=0,bothMove=0,bothTurn=0,maxDiff=0,oneMove=0;
 for(let i=160;i<=320;i++){t=i/40;const p=P(w),h=p.fth||{L:p.th,R:p.th};
  if(prev){n++;const mv=sd=>Math.hypot(p[sd][0]-prev.P[sd][0],p[sd][2]-prev.P[sd][2])>.003,tr=sd=>Math.abs(h[sd]-prev.h[sd])>1;
   if(mv('L')&&mv('R'))bothMove++;else if(mv('L')||mv('R'))oneMove++;
   if(tr('L')&&tr('R'))bothTurn++;
   maxDiff=Math.max(maxDiff,Math.abs(h.L-h.R))}
  prev={P:{L:p.L,R:p.R},h:{L:h.L,R:h.R}}}
 turns.push({move:moves[m].name,who:w,pct_both_feet_travelling:Math.round(100*bothMove/n),pct_one_foot_travelling:Math.round(100*oneMove/n),pct_both_feet_rotating:Math.round(100*bothTurn/n),max_angle_between_feet:Math.round(maxDiff)});}
for(let m=0;m<moves.length;m++){if(moves[m].combo)continue;selectMove(m);setBad(false);const r={move:moves[m].name};
 for(const w of ['l','f']){let mr=0,mt=0,ms=0,st=0;
  for(let i=0;i<N*40;i++){t=i/40;const p=P(w);
   for(const sd of ['L','R']){const d=Math.hypot(p[sd][0]-p.c[0],p[sd][2]-p.c[1]);if(d>mr){mr=d;mt=t}}
   const s=Math.hypot(p.L[0]-p.R[0],p.L[2]-p.R[2]);if(s>ms){ms=s;st=t}}
  r[w]={reach_cm:Math.round(mr*100),at:+mt.toFixed(2),feet_gap_cm:Math.round(ms*100),gap_at:+st.toFixed(2)}}
 reach.push(r)}
return {turns,reach}}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        r=await pg.evaluate(JS)
        for x in r['turns']:print(json.dumps(x))
        for x in r['reach']:print(x['move'],'| leader',json.dumps(x['l']),'| follower',json.dumps(x['f']))
        print(errs);await b.close()
asyncio.run(main())
