import json,re,sys
K=sys.argv[1]
import os
# Optional rep<K>.json: [["spoken words","digits shown in captions"], ...], longest phrases first.
REP=json.load(open(f'rep{K}.json',encoding='utf-8')) if os.path.exists(f'rep{K}.json') else []
W=json.load(open(f'w{K}.json'));T=json.load(open(f't{K}.json'))
st=lambda s:s.rstrip(',.?!:')
# unit boundaries by word index
ub=[];k=0
for t in T:
    m=len(t['text'].split());ub.append((k,k+m));k+=m
toks=[]  # [text,s,e,unit]
for ui,(a,b) in enumerate(ub):
    for i in range(a,b): toks.append([W[i][0],W[i][1],W[i][2],ui])
for src,dst in REP:
    sw=src.split();i=0
    while i<=len(toks)-len(sw):
        if all(st(toks[i+j][0])==sw[j] if j==len(sw)-1 else toks[i+j][0]==sw[j] for j in range(len(sw))):
            tail=toks[i+len(sw)-1][0][len(st(toks[i+len(sw)-1][0])):]
            dw=dst.split();span=toks[i:i+len(sw)];new=[]
            for j,d in enumerate(dw):
                q0=span[min(j,len(span)-1)];q1=span[-1] if j==len(dw)-1 else span[min(j,len(span)-1)]
                new.append([d+(tail if j==len(dw)-1 else ''),q0[1],q1[2],q0[3]])
            toks[i:i+len(sw)]=new;i+=len(dw)
        else:i+=1
# group into units, merge single-word ,: units forward
groups=[];cur=[]
for ui in range(len(T)):
    u=[t for t in toks if t[3]==ui]
    cur+=u
    if len(u)==1 and u[0][0].endswith((',',':')): continue
    groups.append(cur);cur=[]
if cur: groups.append(cur)
caps=[]
for g in groups:
    if len(g)<=7: chunks=[g]
    else:
        n=-(-len(g)//6);per=-(-len(g)//n);chunks=[g[i:i+per] for i in range(0,len(g),per)]
        if len(chunks[-1])==1 and len(chunks)>1: chunks[-2]+=chunks[-1];chunks.pop()
    for c in chunks: caps.append([round(c[0][1]-0.05,2),round(c[-1][2]+0.05,2),' '.join(x[0] for x in c)])
for i in range(len(caps)-1):
    if caps[i][1]>caps[i+1][0]: caps[i][1]=caps[i+1][0]
    elif caps[i+1][0]-caps[i][1]<0.35: caps[i][1]=caps[i+1][0]
US=[t['s'] for t in T];UE=[t['e'] for t in T]
open(f'caps{K}.js','w',encoding='utf-8').write('const CAPS='+json.dumps(caps,ensure_ascii=False)+';const US='+json.dumps(US)+';const UE='+json.dumps(UE)+';')
print(K,len(caps),max(len(c[2]) for c in caps))
