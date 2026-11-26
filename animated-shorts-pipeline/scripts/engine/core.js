// ---------- core helpers ----------
const W=1080,H=1920,PI=Math.PI,TAU=PI*2;
const cv=document.getElementById('c');const ctx=cv.getContext('2d');
const C={bg:'#0B1026',bg2:'#060814',y:'#FFD23F',c:'#3DDCFF',r:'#FF5E5B',cream:'#FFF4D6',g:'#58D68D',pink:'#FF8FA3',ape:'#5A3A22',ape2:'#3E2716',skin:'#C98B5E',skin2:'#9A643F',w:'#fff'};
const F='Poppins, "Inter", sans-serif';
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const sg=(a,t0,t1)=>cl((a-t0)/(t1-t0));
const eo=t=>1-Math.pow(1-t,3);
const eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const pop=t=>{t=cl(t);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function mix(c1,c2,t){const p=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];const a=p(c1),b=p(c2);return `rgb(${a.map((v,i)=>Math.round(lerp(v,b[i],t))).join(',')})`}
function grad(c1,c2,y0=0,y1=H){const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,c1);g.addColorStop(1,c2);return g}
function bg(c1,c2){ctx.fillStyle=grad(c1,c2);ctx.fillRect(0,0,W,H)}
function glow(x,y,r,col,a=1){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.globalAlpha*=a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore()}
function circ(x,y,r,col){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,TAU);ctx.fillStyle=col;ctx.fill()}
function line(x1,y1,x2,y2,w,col){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=w;ctx.strokeStyle=col;ctx.lineCap='round';ctx.stroke()}
function rrect(x,y,w,h,r,col,stroke,lw){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(col){ctx.fillStyle=col;ctx.fill()}if(stroke){ctx.lineWidth=lw||4;ctx.strokeStyle=stroke;ctx.stroke()}}
function txt(s,x,y,size,col=C.w,o={}){ctx.save();ctx.font=`${o.w||700} ${size}px ${o.f||F}`;ctx.textAlign=o.al||'center';ctx.textBaseline=o.bl||'middle';if(o.a!==undefined)ctx.globalAlpha*=o.a;if(o.ls)ctx.letterSpacing=o.ls+'px';if(o.sh){ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=o.sh;ctx.shadowOffsetY=4}if(o.st){ctx.lineWidth=o.sw||10;ctx.strokeStyle=o.st;ctx.lineJoin='round';ctx.strokeText(s,x,y)}ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore()}
function tw(s,size,w=700){ctx.save();ctx.font=`${w} ${size}px ${F}`;const m=ctx.measureText(s).width;ctx.restore();return m}
// pill label that pops in
function label(s,x,y,p,o={}){p=cl(p);if(p<=0)return;const size=o.size||44;const w=tw(s,size)+size*1.2,h=size*1.75;ctx.save();ctx.translate(x,y);const k=pop(p);ctx.scale(k,k);ctx.globalAlpha*=cl(p*3);rrect(-w/2,-h/2,w,h,h/2,o.bg||C.y);txt(s,0,2,size,o.col||'#111');ctx.restore()}
function arrow(x1,y1,x2,y2,p,col,w=10){p=cl(p);if(p<=0)return;const x=lerp(x1,x2,p),y=lerp(y1,y2,p);line(x1,y1,x,y,w,col);const a=Math.atan2(y2-y1,x2-x1),s=w*2.6;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*s,y+Math.sin(a)*s);ctx.lineTo(x+Math.cos(a+2.4)*s,y+Math.sin(a+2.4)*s);ctx.lineTo(x+Math.cos(a-2.4)*s,y+Math.sin(a-2.4)*s);ctx.closePath();ctx.fillStyle=col;ctx.fill()}
function cross(x,y,s,p,col=C.r,w=26){p=cl(p);if(p<=0)return;const a=cl(p*2),b=cl(p*2-1);ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=20;line(x-s,y-s,lerp(x-s,x+s,eo(a)),lerp(y-s,y+s,eo(a)),w,col);if(b>0)line(x+s,y-s,lerp(x+s,x-s,eo(b)),lerp(y-s,y+s,eo(b)),w,col);ctx.restore()}
function stars(n,seed,a,t,ymax=1100){for(let i=0;i<n;i++){const x=rnd(i+seed)*W,y=rnd(i*3+seed)*ymax,r=1+rnd(i*7+seed)*2.2;ctx.globalAlpha=a*(0.5+0.5*Math.sin(t*2+i));circ(x,y,r,'#fff')}ctx.globalAlpha=1}
function ik(ax,ay,bx,by,l1,l2,dir){let dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);const m=l1+l2-0.01;if(d>m){bx=ax+dx/d*m;by=ay+dy/d*m;d=m;dx=bx-ax;dy=by-ay}d=Math.max(d,Math.abs(l1-l2)+0.01);const a=Math.atan2(dy,dx),c=Math.acos(cl((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));return[ax+Math.cos(a+dir*c)*l1,ay+Math.sin(a+dir*c)*l1,bx,by]}
// ---------- hominin figure ----------
function fig(x,y,h,o={}){const u=o.u===undefined?1:o.u,ph=o.ph||0,st=o.st===undefined?1:o.st,col=o.col||mix(C.ape,C.skin,cl((u-0.5)*2)),col2=o.col2||mix(C.ape2,C.skin2,cl((u-0.5)*2));
 ctx.save();ctx.translate(x,y);ctx.scale((o.face||1),1);if(o.a!==undefined)ctx.globalAlpha*=o.a;ctx.lineCap='round';ctx.lineJoin='round';
 const lean=(1-u)*1.02+(o.lean||0),legL=h*(0.30+0.19*u),tor=h*(0.40-0.05*u),armL=h*(0.54-0.14*u),hr=h*0.098,lw=h*(0.085-0.02*u),tw_=h*(0.24-0.07*u)*(o.bulk||1);
 let hip=[-Math.sin(lean)*tor*0.45,-legL*(0.86+0.17*u)];if(o.sit){hip=[0,-h*0.11]}
 const sh=[hip[0]+Math.sin(lean)*tor,hip[1]-Math.cos(lean)*tor];const stride=h*0.17*st,lift=h*0.07*st;
 const legs=[0,1].map(k=>{const p=ph+k*PI;let fx=hip[0]+stride*Math.cos(p),fy=-Math.max(0,Math.sin(p))*lift;if(o.sit){fx=hip[0]+h*0.36;fy=0;return[hip[0]+h*0.2,hip[1]-h*0.17+k*h*0.03,fx,fy]}return ik(hip[0],hip[1],fx,fy,legL*0.52,legL*0.52,-1)});
 const kw=cl(1-u/0.5);
 const arms=[0,1].map(k=>{const p=ph+(1-k)*PI;let hx,hy;const sw=Math.cos(p)*0.55*st;const sx=sh[0]+Math.sin(sw)*armL*0.92,sy=sh[1]+Math.cos(sw)*armL*0.92;const gx=sh[0]+h*0.10+stride*Math.cos(p),gy=-Math.max(0,Math.sin(p))*lift*0.6-h*0.02;hx=lerp(sx,gx,kw);hy=lerp(sy,gy,kw);if(o.sit){hx=sh[0]+h*0.30;hy=sh[1]+h*0.16+k*h*0.04}if(o.hands&&o.hands[k]){hx=sh[0]+o.hands[k][0]*h;hy=sh[1]+o.hands[k][1]*h}return ik(sh[0],sh[1],hx,hy,armL*0.5,armL*0.5,1)});
 const limb=(j,a,b,c,w)=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(j[0],j[1]);ctx.lineTo(j[2],j[3]);ctx.lineWidth=w;ctx.strokeStyle=c;ctx.stroke()};
 limb(legs[1],hip,0,col2,lw);limb(arms[1],sh,0,col2,lw*0.85);
 // torso
 ctx.beginPath();ctx.moveTo(hip[0],hip[1]);ctx.lineTo(sh[0],sh[1]);ctx.lineWidth=tw_;ctx.strokeStyle=col;ctx.stroke();
 // head
 const hx=sh[0]+Math.sin(lean)*h*0.10+(1-u)*h*0.03,hy=sh[1]-Math.cos(lean*0.55)*h*0.135;
 line(sh[0],sh[1],hx,hy,lw*0.9,col);circ(hx,hy,hr,col);
 if(u<0.97){ctx.beginPath();ctx.ellipse(hx+hr*0.62,hy+hr*0.32,hr*(0.75-0.45*u),hr*(0.6-0.3*u),0,0,TAU);ctx.fillStyle=mix(col,'#D9A27A',0.35);ctx.fill();
  ctx.beginPath();ctx.ellipse(hx+hr*0.45,hy-hr*0.22,hr*0.6,hr*0.2*(1-u*0.6),-0.15,0,TAU);ctx.fillStyle=col2;ctx.fill()}
 if(u>0.9||o.hair){ctx.beginPath();ctx.arc(hx-hr*0.1,hy-hr*0.12,hr*1.02,PI*0.95,PI*1.95);ctx.lineTo(hx-hr*0.1,hy-hr*0.12);ctx.closePath();ctx.fillStyle=o.hairc||'#2b1d14';ctx.fill()}
 circ(hx+hr*0.48,hy-hr*0.02,hr*0.13,'#120b07');
 limb(legs[0],hip,0,col,lw);if(u>0.9&&!o.nocloth){ctx.beginPath();ctx.moveTo(hip[0],hip[1]+lw*0.2);ctx.lineTo(hip[0]+Math.sin(lean)*tor*0.22,hip[1]-Math.cos(lean)*tor*0.22);ctx.lineWidth=tw_*1.08;ctx.strokeStyle=o.cloth||'#6b3f24';ctx.lineCap='butt';ctx.stroke();ctx.lineCap='round'}limb(arms[0],sh,0,o.armc||mix(col,col2,0.5),lw*0.85);
 const hand=arms[0];ctx.restore();return{hx:x+(o.face||1)*hx,hy:y+hy,hr,handx:x+(o.face||1)*hand[2],handy:y+hand[3],shx:x+(o.face||1)*sh[0],shy:y+sh[1]}}
// ---------- props ----------
function tree(x,y,s,o={}){ctx.save();ctx.translate(x,y);ctx.scale(s,s);if(o.a!==undefined)ctx.globalAlpha*=o.a;const sw=(o.sw||0);
 ctx.fillStyle=o.trunk||'#4a2f1b';ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-13,-330);ctx.lineTo(13,-330);ctx.lineTo(22,0);ctx.closePath();ctx.fill();
 const g=o.leaf||'#1f7a4d',g2=o.leaf2||'#2c9a61';[[ -90,-340,110],[80,-350,120],[0,-440,135],[-40,-380,100],[50,-420,95]].forEach(([a,b,r],i)=>circ(a+sw*(1+i*0.2),b,r,i%2?g2:g));ctx.restore()}
function acacia(x,y,s,a=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;ctx.strokeStyle='#3b2616';ctx.lineWidth=22;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(10,-150,-10,-260);ctx.moveTo(0,-170);ctx.quadraticCurveTo(60,-220,110,-270);ctx.moveTo(-4,-190);ctx.quadraticCurveTo(-60,-230,-110,-268);ctx.stroke();ctx.fillStyle='#3d6b2f';ctx.beginPath();ctx.ellipse(0,-290,230,48,0,0,TAU);ctx.fill();ctx.fillStyle='#4f8a3c';ctx.beginPath();ctx.ellipse(-20,-305,170,30,0,0,TAU);ctx.fill();ctx.restore()}
function brain(x,y,r,o={}){ctx.save();ctx.translate(x,y);ctx.scale(r/100,r/100);if(o.a!==undefined)ctx.globalAlpha*=o.a;const c=o.col||C.pink;
 ctx.beginPath();ctx.moveTo(-98,10);ctx.bezierCurveTo(-110,-60,-50,-98,10,-92);ctx.bezierCurveTo(70,-96,112,-50,104,6);ctx.bezierCurveTo(108,40,80,62,50,58);ctx.bezierCurveTo(40,80,10,84,4,60);ctx.bezierCurveTo(-30,74,-92,60,-98,10);ctx.closePath();ctx.fillStyle=c;ctx.fill();
 ctx.strokeStyle=o.line||'#c9506b';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();
 ctx.moveTo(-60,-30);ctx.quadraticCurveTo(-40,-60,-10,-40);ctx.quadraticCurveTo(10,-25,-5,-5);
 ctx.moveTo(20,-70);ctx.quadraticCurveTo(50,-50,35,-25);ctx.quadraticCurveTo(25,-5,55,5);
 ctx.moveTo(-70,20);ctx.quadraticCurveTo(-40,5,-25,30);ctx.moveTo(70,-30);ctx.quadraticCurveTo(90,-10,75,15);ctx.moveTo(0,20);ctx.quadraticCurveTo(25,25,30,45);ctx.stroke();ctx.restore()}
function bolt(x,y,s,col=C.y,a=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;ctx.beginPath();ctx.moveTo(12,-50);ctx.lineTo(-26,6);ctx.lineTo(-2,6);ctx.lineTo(-14,50);ctx.lineTo(28,-10);ctx.lineTo(4,-10);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.restore()}
function meat(x,y,s,a=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;ctx.rotate(-0.4);rrect(40,-10,80,20,10,'#f3ead8');circ(122,-12,15,'#f3ead8');circ(122,12,15,'#f3ead8');ctx.beginPath();ctx.ellipse(0,0,70,52,0,0,TAU);ctx.fillStyle='#c0392b';ctx.fill();ctx.beginPath();ctx.ellipse(-8,-6,46,32,0,0,TAU);ctx.fillStyle='#e05a4a';ctx.fill();ctx.restore()}
function stone(x,y,s,rot,col='#8d99a6'){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-50,-20);ctx.lineTo(-10,-48);ctx.lineTo(44,-30);ctx.lineTo(56,14);ctx.lineTo(14,46);ctx.lineTo(-40,34);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.beginPath();ctx.moveTo(-10,-48);ctx.lineTo(4,-4);ctx.lineTo(56,14);ctx.lineTo(44,-30);ctx.closePath();ctx.fillStyle='rgba(255,255,255,.22)';ctx.fill();ctx.beginPath();ctx.moveTo(4,-4);ctx.lineTo(14,46);ctx.lineTo(-40,34);ctx.lineTo(-50,-20);ctx.closePath();ctx.fillStyle='rgba(0,0,0,.18)';ctx.fill();ctx.restore()}
function fire(x,y,s,t){glow(x,y-60*s,520*s,'rgba(255,150,40,.55)');ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 line(-90,6,90,-18,26,'#5b3a1f');line(-90,-18,90,6,26,'#6d4726');
 const fl=(w,h,c,ph)=>{const k=1+0.12*Math.sin(t*9+ph)+0.08*Math.sin(t*17+ph*2),sx=14*Math.sin(t*6+ph);ctx.beginPath();ctx.moveTo(-w,-10);ctx.bezierCurveTo(-w*1.2,-h*0.5*k,-w*0.3+sx,-h*0.7*k,sx*1.6,-h*k);ctx.bezierCurveTo(w*0.3+sx,-h*0.7*k,w*1.2,-h*0.5*k,w,-10);ctx.closePath();ctx.fillStyle=c;ctx.fill()};
 fl(95,260,'#ff5a1f',0);fl(68,200,'#ff9a1f',1.7);fl(42,135,'#ffd23f',3.1);fl(20,70,'#fff4c2',4.4);
 for(let i=0;i<14;i++){const p=(t*0.5+rnd(i))%1;ctx.globalAlpha=1-p;circ((rnd(i*5)-0.5)*150+Math.sin(t*3+i)*20,-120-p*420,5*(1-p)+1,'#ffb347')}ctx.restore();ctx.globalAlpha=1}
function quad(x,y,s,col,face=1){ctx.save();ctx.translate(x,y);ctx.scale(s*face,s);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,-60,80,32,0,0,TAU);ctx.fill();circ(84,-84,30,col);ctx.beginPath();ctx.moveTo(100,-108);ctx.lineTo(112,-128);ctx.lineTo(90,-112);ctx.fill();[[-60,0],[-36,0],[44,0],[66,0]].forEach(([a])=>rrect(a-8,-50,16,52,6,col));ctx.strokeStyle=col;ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-76,-66);ctx.quadraticCurveTo(-120,-90,-112,-40);ctx.stroke();ctx.restore()}
// ---------- map ----------
function proj(lo,la,b){return[b.x+(lo-b.lo0)/(b.lo1-b.lo0)*b.w,b.y+(b.la1-la)/(b.la1-b.la0)*b.h]}
function landFade(b,col,sides='rt'){const w=90;const f=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,col+'00');g.addColorStop(1,col+'ff');ctx.fillStyle=g;ctx.fillRect(rx,ry,rw,rh)};if(sides.includes('r'))f(b.x+b.w-w,0,b.x+b.w,0,b.x+b.w-w,b.y-4,w+4,b.h+8);if(sides.includes('t'))f(0,b.y+w,0,b.y,b.x-4,b.y-4,b.w+8,w+4);if(sides.includes('l'))f(b.x+w,0,b.x,0,b.x-4,b.y-4,w+4,b.h+8);if(sides.includes('b'))f(0,b.y+b.h-w,0,b.y+b.h,b.x-4,b.y+b.h-w,b.w+8,w+4)}
function land(b,fill,stroke,a=1){ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();ctx.globalAlpha*=a;ctx.beginPath();for(const r of LAND){r.forEach(([lo,la],i)=>{const [x,y]=proj(lo,la,b);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath()}ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=3;ctx.strokeStyle=stroke;ctx.lineJoin='round';ctx.stroke()}ctx.restore()}
// ---------- logo ----------
function logo(cx,cy,s,t=0,o={}){ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);
 if(!o.nobg){const g=ctx.createRadialGradient(0,-60,40,0,0,560);g.addColorStop(0,'#1a2350');g.addColorStop(1,'#070a1c');ctx.beginPath();if(o.square)ctx.rect(-540,-540,1080,1080);else ctx.arc(0,0,540,0,TAU);ctx.fillStyle=g;ctx.fill()}
 const ring=(front)=>{ctx.save();ctx.translate(0,-40);ctx.rotate(-0.42);ctx.beginPath();ctx.ellipse(0,0,400,120,0,front?0:PI,front?PI:TAU);ctx.lineWidth=22;ctx.strokeStyle=C.c;ctx.lineCap='round';ctx.stroke();if(front){const a=0.9+t*1.5;const ex=Math.cos(a)*400,ey=Math.sin(a)*120;if(Math.sin(a)>0){circ(ex,ey,34,C.c);circ(ex-8,ey-8,10,'#d8f7ff')}}else{const a=0.9+t*1.5;if(Math.sin(a)<=0){circ(Math.cos(a)*400,Math.sin(a)*120,34,C.c)}}ctx.restore()};
 ring(false);
 ctx.font='900 640px "Inter Display","Inter",Poppins';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineJoin='round';ctx.lineWidth=46;ctx.strokeStyle='#070a1c';ctx.strokeText('?',0,165);ctx.fillStyle=C.y;ctx.fillText('?',0,165);
 ring(true);
 if(!o.notext){txt(BRAND.name,0,330,88,'#fff',{ls:10})}
 ctx.restore()}
