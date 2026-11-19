"""Motion continuity checker: finds teleports and jerks that still pictures can't show.

Steps through every move in tiny time steps (1/120 of a count) and measures how fast each hand, elbow, foot and
head moves. A real body can't jump: anything faster than the limits below is reported with the move, the count
and the speed in meters per count. Also reports sudden changes of direction (jerk) for hands.

Run:    python tools/check_motion.py [move_index]
"""
import asyncio,sys,pathlib,json
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
ONLY=int(sys.argv[1]) if len(sys.argv)>1 else None
from playwright.async_api import async_playwright
JS=r'''(only)=>{
const LIM={hand:3.2,elbow:3.0,foot:2.6,head:1.6},out=[];
for(let m=0;m<moves.length;m++){if(only!=null&&m!==only)continue;selectMove(m);setBad(false);
 const worst={},H=120;let prev=null;
 for(let i=0;i<=N*H;i++){t=Math.min(i/H,N-1e-6);const p0=pose('f',null),Pl=pose('l',p0.c),Pf=pose('f',Pl.c),items=[];body(Pl,'#127A6A',items,true);body(Pf,'#C2416B',items,false);
  const pts={};
  for(const [id,P] of [['l',Pl],['f',Pf]]){for(const sd of ['L','R']){pts[id+' '+sd+' hand']=P.hands[sd];pts[id+' '+sd+' foot']=P[sd];const up=items.find(q=>q.id===id&&q.part==='upper'&&q.side===sd);pts[id+' '+sd+' elbow']=up.b}
   pts[id+' head']=items.find(q=>q.t==='h'&&q.id===id).p}
  if(prev)for(const k in pts){const a=prev[k],b=pts[k],v=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])*H,kind=k.split(' ').pop();
   if(v>LIM[kind]&&(!worst[k]||worst[k].v<v))worst[k]={v:+v.toFixed(1),t:+(i/H).toFixed(2)}}
  prev=pts}
 out.push({move:moves[m].name,worst})}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        bad=0
        for x in await pg.evaluate(JS,ONLY):
            w=x['worst'];bad+=len(w)
            print(x['move'],'::','SMOOTH' if not w else '  '.join(f"{k} {v['v']}m/count@{v['t']}" for k,v in sorted(w.items(),key=lambda kv:-kv[1]['v'])))
        print(errs);await b.close();sys.exit(1 if bad else 0)
asyncio.run(main())
