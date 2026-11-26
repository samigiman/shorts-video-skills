const buf=document.createElement('canvas');buf.width=W;buf.height=H;const bctx=buf.getContext('2d');
function overlay(a){
 const p=sg(a,OV0,OV0+0.4)*(1-sg(a,OV1-0.3,OV1));if(p>0){ctx.save();ctx.globalAlpha=p;
  // brand
  logo(86,150,0.085,a,{notext:1});txt(BRAND.name,140,152,40,'#fff',{al:'left',sh:10});
  // ruler
  const x0=90,x1=990,y=250;line(x0,y,x1,y,8,'rgba(255,255,255,.28)');let idx=0;for(let i=0;i<MS.length;i++)if(a>=MS[i][0])idx=i;
  const xi=i=>x0+(x1-x0)*i/(MS.length-1);const mv=eio(sg(a,MS[idx][0],MS[idx][0]+1.0));const mx=idx===0?xi(0):lerp(xi(idx-1),xi(idx),mv);
  line(x0,y,mx,y,8,C.y);MS.forEach((m,i)=>circ(xi(i),y,i<=idx&&(i<idx||mv>=1)?12:9,i<idx||(i===idx&&mv>=1)?C.y:'#8b93a8'));
  glow(mx,y,60,'rgba(255,210,63,.8)');circ(mx,y,18,C.y);circ(mx,y,8,'#111');
  const lbl=MS[idx][1];const lw=tw(lbl,34)+40;const lx=cl(mx,x0+lw/2-40,x1-lw/2+40);rrect(lx-lw/2,y+30,lw,52,26,'rgba(7,10,28,.8)');txt(lbl,lx,y+58,34,C.y);
  ctx.restore()}
 // captions
 for(const c of CAPS){if(a>=c[0]-0.05&&a<c[1]+0.12){const p=sg(a,c[0]-0.05,c[0]+0.12);const words=c[2].split(' ');const size=56;const lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(tw(t,size)>900&&cur){lines.push(cur);cur=w}else cur=t}lines.push(cur);
   const lh=size*1.3,bh=lines.length*lh+44,bw=Math.max(...lines.map(l=>tw(l,size)))+80,cy=1440;ctx.save();ctx.translate(540,cy);const k=lerp(0.92,1,eo(p));ctx.scale(k,k);ctx.globalAlpha=cl(p*2);
   rrect(-bw/2,-bh/2,bw,bh,28,'rgba(5,7,20,.78)');lines.forEach((l,i)=>txt(l,0,(i-(lines.length-1)/2)*lh+3,size,'#fff'));ctx.restore();break}}
}
function scene(a){let i=0;for(let k=0;k<SC.length;k++)if(a>=SC[k][0])i=k;return i}
function render(t){const a=t;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);
 const i=scene(a);const X=0.22;
 if(i>0&&a-SC[i][0]<X){ctx.save();SC[i-1][1](a);ctx.restore();bctx.clearRect(0,0,W,H);bctx.drawImage(cv,0,0);ctx.globalAlpha=1;ctx.save();SC[i][1](a);ctx.restore();const p=(a-SC[i][0])/X;ctx.globalAlpha=1-eio(p);ctx.drawImage(buf,0,0);ctx.globalAlpha=1}
 else{ctx.save();SC[i][1](a);ctx.restore()}
 ctx.globalAlpha=1;ctx.setLineDash([]);
 // vignette
 const g=ctx.createRadialGradient(540,900,500,540,960,1250);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.35)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 overlay(a);
 if(a>END-0.5){ctx.globalAlpha=sg(a,END-0.5,END);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
}
function renderLogo(square){cv.width=1080;cv.height=1080;ctx.clearRect(0,0,1080,1080);logo(540,540,1,0.55,{square});}
