"""Time-by-time diagnosis of arms and hands against the partner's body for one move.

Usage: python tools/diag_arms.py move_index t0 t1 step
Prints, per moment: every arm or hand part that is inside the partner (cm), and where each of the leader's
hands is in the follower's own frame (angle around her: 0 = in front of her, 90 = her right, 180 = behind,
-90 = her left; distance from her axis in cm; height in cm).
"""
import asyncio,sys,pathlib,json
PAGE=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
mv=int(sys.argv[1]);t0=float(sys.argv[2]);t1=float(sys.argv[3]);st=float(sys.argv[4])
JS=r'''([mv,t0,t1,st])=>{
function segd(p1,q1,p2,q2){const d1=[q1[0]-p1[0],q1[1]-p1[1],q1[2]-p1[2]],d2=[q2[0]-p2[0],q2[1]-p2[1],q2[2]-p2[2]],r=[p1[0]-p2[0],p1[1]-p2[1],p1[2]-p2[2]];
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];const a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r);let s,tt;
 if(a<1e-9&&e<1e-9){s=0;tt=0}else if(a<1e-9){s=0;tt=Math.min(1,Math.max(0,f/e))}else{const c=dot(d1,r);if(e<1e-9){tt=0;s=Math.min(1,Math.max(0,-c/a))}else{const b=dot(d1,d2),den=a*e-b*b;s=den!==0?Math.min(1,Math.max(0,(b*f-c*e)/den)):0;tt=(b*s+f)/e;if(tt<0){tt=0;s=Math.min(1,Math.max(0,-c/a))}else if(tt>1){tt=1;s=Math.min(1,Math.max(0,(b-c)/a))}}}
 const c1=[p1[0]+d1[0]*s,p1[1]+d1[1]*s,p1[2]+d1[2]*s],c2=[p2[0]+d2[0]*tt,p2[1]+d2[1]*tt,p2[2]+d2[2]*tt];return[Math.hypot(c1[0]-c2[0],c1[1]-c2[1],c1[2]-c2[2]),s,tt]}
selectMove(mv);setBad(false);const out=[];
for(let x=t0;x<=t1+1e-6;x+=st){t=Math.min(x,N-1e-6);const p0=pose('f',null),Pl=pose('l',p0.c),Pf=pose('f',Pl.c),items=[];body(Pl,'#127A6A',items,true);body(Pf,'#C2416B',items,false);
 const caps=items.filter(i=>(i.t==='c'||i.t==='x')&&i.part).map(i=>({...i,ra:i.t==='x'?i.ra:i.wa,rb:i.t==='x'?i.rb:i.wb}));
 for(const h of items.filter(i=>i.t==='h'))caps.push({id:h.id,part:'head',a:h.p,b:h.p,ra:h.r,rb:h.r,side:'C'});
 const hits=[];
 for(const [A,B] of [['l','f'],['f','l']]){const arms=caps.filter(c=>c.id===A&&(c.part==='fore'||c.part==='upper'||c.part==='hnd'));
  const bodyB=[...items.filter(i=>i.t==='c'&&i.tg&&i.id===B).map(i=>({a:i.a,b:i.b,ra:i.wa,rb:i.wb,nm:'body'})),...caps.filter(c=>c.id===B&&['thigh','shin','neck','head','skirt'].includes(c.part)).map(c=>({a:c.a,b:c.b,ra:c.ra,rb:c.rb,nm:c.part}))];
  const w={};for(const a of arms)for(const c of bodyB){const [d,s1,s2]=segd(a.a,a.b,c.a,c.b),pen=(a.ra+(a.rb-a.ra)*s1)+(c.ra+(c.rb-c.ra)*s2)-d;const k=A+a.side+' '+a.part+'>'+c.nm;if(pen>.015&&(!w[k]||w[k]<pen))w[k]=pen}
  for(const k in w)hits.push(k+' '+(w[k]*100).toFixed(1))}
 const q=vec(Pf.th),loc=h=>{const dx=h[0]-Pf.c[0],dz=h[2]-Pf.c[1],la=dx*q.r[0]+dz*q.r[1],fw=dx*q.f[0]+dz*q.f[1];return Math.round(Math.atan2(la,fw)*57.3)+'deg '+Math.round(Math.hypot(la,fw)*100)+'cm y'+Math.round(h[1]*100)};
 out.push(x.toFixed(2)+' | her th '+Math.round(Pf.th)+' dist '+Math.round(Math.hypot(Pl.c[0]-Pf.c[0],Pl.c[1]-Pf.c[1])*100)+' | his L '+loc(Pl.hands.L)+' | his R '+loc(Pl.hands.R)+' | '+(hits.join(', ')||'clean'))}
return out}'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':900})
        await pg.goto(PAGE);await pg.wait_for_timeout(400)
        for l in await pg.evaluate(JS,[mv,t0,t1,st]):print(l)
        await b.close()
asyncio.run(main())
