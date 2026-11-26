// Motion helpers: dark backgrounds, yellow/red stamps, flat icons.
function spring(t,k=7,d=4){if(t<=0)return 0;if(t>=1.6)return 1;return 1-Math.exp(-d*t)*Math.cos(k*t)}
function sq(p){const s=spring(p*1.4);return [s*(1+0.18*Math.sin(cl(p*2.5)*PI)),s*(1-0.14*Math.sin(cl(p*2.5)*PI))]}
// 1. Elastik stamp: yay effekti + kölgə + parıltı zolağı
function stampX(s,x,y,t,o={}){if(t<=0)return;const sz=o.size||90,w=tw(s,sz)+90,h=sz*1.56,[kx,ky]=sq(t);ctx.save();ctx.translate(x,y);ctx.rotate((o.rot||-0.06)*spring(t*1.2));ctx.scale(kx,ky);
 ctx.globalAlpha=0.45;rrect(-w/2+10,-sz*0.78+14,w,h,sz*0.4,'#000');ctx.globalAlpha=1;rrect(-w/2,-sz*0.78,w,h,sz*0.4,o.bg||C.y);txt(s,0,sz*0.06,sz,o.col||'#111');
 const sh=cl((t-0.35)/0.5);if(sh>0&&sh<1){ctx.save();ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-w/2,-sz*0.78,w,h,sz*0.4);else ctx.rect(-w/2,-sz*0.78,w,h);ctx.clip();const sx=-w/2-80+(w+160)*eo(sh);ctx.globalAlpha=0.55;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(sx,-h);ctx.lineTo(sx+50,-h);ctx.lineTo(sx-30,h);ctx.lineTo(sx-80,h);ctx.fill();ctx.restore()}ctx.restore()}
// 2. Rəqəm sayğacı (nəfəs alan son)
function countUp(v0,v1,x,y,t,size,col,fmt=v=>Math.round(v)){if(t<=0)return;const e=eo(cl(t/1.1)),v=lerp(v0,v1,e),k=1+0.12*Math.sin(cl((t-1.1)/0.3)*PI);ctx.save();ctx.translate(x,y);ctx.scale(k,k);txt(fmt(v),0,0,size,col,{sh:14});ctx.restore()}
// 3. Zərbə: ağ flaş + şok dalğası + qığılcımlar
function impact(a,t0,x,y,col=C.y){const t=a-t0;if(t<0||t>1.2)return;const f=cl(1-t/0.18);if(f>0){ctx.globalAlpha=f*0.7;ctx.fillStyle='#fff';ctx.fillRect(0,0,1080,1920);ctx.globalAlpha=1}
 for(let r=0;r<2;r++){const q=cl((t-r*0.12)/0.7);if(q<=0||q>=1)continue;ctx.globalAlpha=1-q;ctx.lineWidth=26*(1-q)+2;ctx.strokeStyle=r?'#fff':col;ctx.beginPath();ctx.arc(x,y,60+eo(q)*520,0,TAU);ctx.stroke()}
 for(let j=0;j<18;j++){const an=j*TAU/18+rnd(j)*0.3,q=eo(cl(t/0.6)),R=80+q*(260+rnd(j+9)*200);ctx.globalAlpha=1-cl(t/0.8);line(x+Math.cos(an)*R*0.75,y+Math.sin(an)*R*0.75,x+Math.cos(an)*R,y+Math.sin(an)*R,8,j%2?col:'#fff')}ctx.globalAlpha=1}
// 4. Kamera silkələnməsi (SHAKE=[vaxtlar])
function shakeOff(a){let dx=0,dy=0;(window.SHAKE||[]).forEach(t0=>{const t=a-t0;if(t>0&&t<0.5){const k=(1-t/0.5)*22;dx+=Math.sin(t*90)*k;dy+=Math.cos(t*70)*k*0.7}});return [dx,dy]}
// 5. Xətt çəkilməsi: parlaq baş + iz
function drawOn(pts,t,w,col){if(t<=0)return;let L=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);L+=d}let rem=L*eio(cl(t)),hx=pts[0][0],hy=pts[0][1];
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(hx,hy);for(let i=1;i<pts.length&&rem>0;i++){const f=Math.min(1,rem/seg[i-1]);hx=lerp(pts[i-1][0],pts[i][0],f);hy=lerp(pts[i-1][1],pts[i][1],f);ctx.lineTo(hx,hy);rem-=seg[i-1]}ctx.stroke();
 if(t<1){glow(hx,hy,70,'rgba(255,255,255,.7)');circ(hx,hy,w*0.8,'#fff')}}
// 6. Söz zərbəsi: hərəkət izi ilə düşən sözlər
function slam(words,x,y,size,col,a,t0,step=0.18){words.forEach((w,i)=>{const t=a-t0-i*step;if(t<=0)return;const p=cl(t/0.28),yy=y+i*size*1.15;for(let g=3;g>=0;g--){const pp=cl(p-g*0.07);const off=(1-eo(pp))*-420;ctx.globalAlpha=g?0.18*(1-p):1;txt(w,x,yy+off,size*(g?1.05:1),col,{sh:g?0:16})}ctx.globalAlpha=1;if(p>=1&&t<0.45){const q=(t-0.28)/0.17;ctx.globalAlpha=1-q;line(x-tw(w,size)/2-20,yy+size*0.55,x+tw(w,size)/2+20,yy+size*0.55,8,C.y);ctx.globalAlpha=1}})}
// 7. Paralaks ulduzlar (3 dərinlik)
function starsP(a,dx=0,dy=0){[[60,1.5,0.15],[35,2.6,0.45],[14,4,1]].forEach(([n,r,d],L)=>{for(let j=0;j<n;j++){const x=((rnd(j+L*100)*1080+dx*d*40+a*12*d)%1080+1080)%1080,y=((rnd(j+L*100+50)*1920+dy*d*40)%1920+1920)%1920;ctx.globalAlpha=0.35+0.6*Math.abs(Math.sin(a*(0.7+d)+j));circ(x,y,r,'#fff')}});ctx.globalAlpha=1}
// 8. Keçidlər: whip / zoom-through / glitch / iris — növbə ilə
function camWrapM(L,kinds){return L.map(([t0,fn],i)=>[t0,(a)=>{const [sx,sy]=shakeOff(a);const dur=0.5,q=cl((a-t0)/dur);const drift=cl((a-t0)/8);
 const draw=(f,tx,ty,k,rot)=>{ctx.save();ctx.translate(540+tx+sx,960+ty+sy);ctx.rotate(rot||0);ctx.scale(k,k);ctx.translate(-540,-960);f(a);ctx.restore()};
 if(i===0||q>=1){draw(fn,0,0,1+0.035*drift);return}
 const prev=L[i-1][1],e=eio(q),kind=(kinds&&kinds[i])||['whip','zoom','glitch','iris'][i%4];
 if(kind==='whip'){const d=i%2?1:-1;for(let g=4;g>=0;g--){ctx.globalAlpha=g?0.16:1;draw(prev,-d*1080*e-g*d*40*Math.sin(e*PI),0,1);draw(fn,d*1080*(1-e)-g*d*40*Math.sin(e*PI),0,1)}ctx.globalAlpha=1}
 else if(kind==='zoom'){if(e<0.5){const k=1+e*e*12;ctx.globalAlpha=1;draw(prev,0,0,k,0)}else{draw(fn,0,0,0.75+0.25*eo((e-0.5)*2),0)}const f=1-Math.abs(e-0.5)*2;ctx.globalAlpha=f*0.85;ctx.fillStyle='#fff';ctx.fillRect(0,0,1080,1920);ctx.globalAlpha=1}
 else if(kind==='glitch'){const src=e<0.5?prev:fn;for(let s=0;s<12;s++){const y0=s*160,off=(rnd(s+Math.floor(a*30))-0.5)*260*Math.sin(e*PI);ctx.save();ctx.beginPath();ctx.rect(0,y0,1080,160);ctx.clip();draw(src,off,0,1);ctx.restore()}ctx.globalAlpha=0.35*Math.sin(e*PI);ctx.fillStyle=C.r;ctx.fillRect(0,(a*2400)%1920,1080,40);ctx.fillStyle=C.c;ctx.fillRect(0,(a*1700+600)%1920,1080,24);ctx.globalAlpha=1}
 else{draw(prev,0,0,1+0.1*e);ctx.save();ctx.beginPath();ctx.arc(540,900,30+1400*e,0,TAU);ctx.clip();draw(fn,0,0,1.15-0.15*e,(1-e)*0.08);ctx.restore();ctx.globalAlpha=1-e;ctx.lineWidth=16;ctx.strokeStyle=C.y;ctx.beginPath();ctx.arc(540,900,30+1400*e,0,TAU);ctx.stroke();ctx.globalAlpha=1}}])}
