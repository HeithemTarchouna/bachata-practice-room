"""Collision checker for the practice room.

Runs every move (good and mistake version) in steps of 1/20 count and reports
where body parts overlap: partner vs partner, own arms vs own head, own legs.
An empty {} means clean.

Setup:  pip install playwright && python -m playwright install chromium
Run:    python tools/check_collisions.py
"""
import asyncio,json,sys,pathlib
PAGE=(pathlib.Path(sys.argv[1]).resolve() if len(sys.argv)>1 else pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
JS=r'''()=>{
function segd(p1,q1,p2,q2){const d1=[q1[0]-p1[0],q1[1]-p1[1],q1[2]-p1[2]],d2=[q2[0]-p2[0],q2[1]-p2[1],q2[2]-p2[2]],r=[p1[0]-p2[0],p1[1]-p2[1],p1[2]-p2[2]];
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];const a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r);let s,tt;
 if(a<1e-9&&e<1e-9){s=0;tt=0}else if(a<1e-9){s=0;tt=Math.min(1,Math.max(0,f/e))}else{const c=dot(d1,r);if(e<1e-9){tt=0;s=Math.min(1,Math.max(0,-c/a))}else{const b=dot(d1,d2),den=a*e-b*b;s=den!==0?Math.min(1,Math.max(0,(b*f-c*e)/den)):0;tt=(b*s+f)/e;if(tt<0){tt=0;s=Math.min(1,Math.max(0,-c/a))}else if(tt>1){tt=1;s=Math.min(1,Math.max(0,(b-c)/a))}}}
 const c1=[p1[0]+d1[0]*s,p1[1]+d1[1]*s,p1[2]+d1[2]*s],c2=[p2[0]+d2[0]*tt,p2[1]+d2[1]*tt,p2[2]+d2[2]*tt];return[Math.hypot(c1[0]-c2[0],c1[1]-c2[1],c1[2]-c2[2]),s,tt]}
const out=[];
for(let m=0;m<moves.length;m++)for(const b of [false,true]){selectMove(m);setBad(b);
 const worst={};
 for(let tt=0;tt<N;tt+=0.05){t=tt;const p0=pose('f',null),Pl=pose('l',p0.c),Pf=pose('f',Pl.c),items=[];body(Pl,'#127A6A',items,true);body(Pf,'#C2416B',items,false);
  const caps=items.filter(i=>(i.t==='c'||i.t==='x')&&i.part).map(i=>({...i,ra:i.t==='x'?i.ra:i.wa,rb:i.t==='x'?i.rb:i.wb}));
  const heads=items.filter(i=>i.t==='h');
  for(const h of heads)caps.push({id:h.id,part:'head',a:h.p,b:h.p,ra:h.r,rb:h.r,side:'C'});
  for(const o of items.filter(i=>i.t==='o'&&(i.hand||(i.hand===undefined&&!i.torso&&i.r<.03))))caps.push({id:o.id,part:'hand',a:o.p,b:o.p,ra:o.r,rb:o.r,side:o.side});
  for(const id of ['l','f']){const lg=caps.filter(c=>c.id===id&&(c.part==='thigh'||c.part==='shin'));
   for(const a of lg)for(const c of lg){if(a.side!=='L'||c.side!=='R')continue;if(a.part==='thigh'&&c.part==='thigh')continue;
    const [d,s1,s2]=segd(a.a,a.b,c.a,c.b),r=(a.ra+(a.rb-a.ra)*s1)+(c.ra+(c.rb-c.ra)*s2),pen=r-d;
    if(pen>.012){const k='LEGS '+id+' '+a.part+'/'+c.part;const cnt=Math.round(tt*20)/20;if(!worst[k]||worst[k].pen<pen)worst[k]={pen:+pen.toFixed(3),t:cnt}}}}
  for(const id of ['l','f']){const hd=caps.find(c=>c.id===id&&c.part==='head');
   for(const c of caps.filter(c=>c.id===id&&(c.part==='fore'||c.part==='upper'||c.part==='hand'))){
    const [d]=segd(c.a,c.b,hd.a,hd.b),pen=(Math.max(c.ra,c.rb)+hd.ra)-d;
    if(pen>.005){const k='SELF '+id+' '+c.part+'/head';const cnt=Math.round(tt*20)/20;if(!worst[k]||worst[k].pen<pen)worst[k]={pen:+pen.toFixed(3),t:cnt}}}}
  // STRETCH: an arm drawn longer than an arm is (the hand target is out of reach). Bones are 33 cm; the palm sits up to 6 cm past the wrist.
  for(const id of ['l','f'])for(const sd of ['L','R']){const up=caps.find(c=>c.id===id&&c.part==='upper'&&c.side===sd),fo=caps.find(c=>c.id===id&&c.part==='fore'&&c.side===sd);
   const len=Math.hypot(up.b[0]-up.a[0],up.b[1]-up.a[1],up.b[2]-up.a[2])+Math.hypot(fo.b[0]-fo.a[0],fo.b[1]-fo.a[1],fo.b[2]-fo.a[2]),over=len-.66;
   if(over>.03){const k='IN '+id+' '+sd+' arm STRETCHED';const cnt=Math.round(tt*20)/20;if(!worst[k]||worst[k].pen<over)worst[k]={pen:+over.toFixed(3),t:cnt}}}
  // STRICT: any part of an arm or a hand inside the partner. Body = torso as drawn, skirt, head, neck, legs.
  // A resting hand may touch (1.5 cm give); nothing may go in further than that.
  for(const [A,B] of [['l','f'],['f','l']]){
   const arms=caps.filter(c=>c.id===A&&(c.part==='fore'||c.part==='upper'||c.part==='hnd'));
   const bodyB=[...items.filter(i=>i.t==='c'&&i.tg&&i.id===B).map(i=>({a:i.a,b:i.b,ra:i.wa,rb:i.wb,nm:'body'})),
     ...caps.filter(c=>c.id===B&&(c.part==='thigh'||c.part==='shin'||c.part==='neck'||c.part==='head'||c.part==='skirt')).map(c=>({a:c.a,b:c.b,ra:c.ra,rb:c.rb,nm:c.part==='thigh'||c.part==='shin'?'leg':c.part}))];
   for(const a of arms)for(const c of bodyB){const [d,s1,s2]=segd(a.a,a.b,c.a,c.b),pen=(a.ra+(a.rb-a.ra)*s1)+(c.ra+(c.rb-c.ra)*s2)-d;
    if(pen>.015){const k='IN '+A+' '+a.side+' '+(a.part==='hnd'?'hand':a.part==='fore'?'forearm':'upper arm')+' in '+B+' '+c.nm;const cnt=Math.round(tt*20)/20;if(!worst[k]||worst[k].pen<pen)worst[k]={pen:+pen.toFixed(3),t:cnt}}}}
  const L=caps.filter(c=>c.id==='l'),F=caps.filter(c=>c.id==='f');
  for(const a of L)for(const c of F){
   if(a.part==='hnd'||c.part==='hnd')continue;
   const armA=a.part==='fore'||a.part==='upper',armC=c.part==='fore'||c.part==='upper';
   if(armA&&armC)continue;
   if((a.part==='hand'&&(c.part==='fore'||c.part==='upper'||c.part==='hand'||c.part==='torso'||c.part==='skirt'))||(c.part==='hand'&&(a.part==='fore'||a.part==='upper'||a.part==='hand'||a.part==='torso')))continue;
   if(a.part==='fore'&&(c.part==='torso'||c.part==='skirt'))continue;
   if(c.part==='fore'&&(a.part==='torso'))continue;
   const [d,s1,s2]=segd(a.a,a.b,c.a,c.b),r=(a.ra+(a.rb-a.ra)*s1)+(c.ra+(c.rb-c.ra)*s2),pen=r-d;
   if(pen>.02){const k=a.part+'/'+c.part;const cnt=Math.round(tt*20)/20;if(!worst[k]||worst[k].pen<pen)worst[k]={pen:+pen.toFixed(3),t:cnt};}
  }}
 out.push({move:moves[m].name,bad:b,worst});}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        r=await pg.evaluate(JS)
        for x in r:
            print(x['move'],'BAD' if x['bad'] else 'good',json.dumps(x['worst']))
        print(errs);await b.close()
asyncio.run(main())
