import json,sys
K=sys.argv[1];T=json.load(open(f't{K}.json'));W=json.load(open(f'w{K}.json'))
# word index ranges per unit
idx=[];n=0
for u in T:
    c=len(u['text'].split());idx.append((n,n+c));n+=c
assert n==len(W),(n,len(W))
for spec in sys.argv[2:]:
    a,b,t0,t1=spec.split(':');a,b=int(a),int(b);t0,t1=float(t0),float(t1)
    ws=W[idx[a][0]:idx[b][1]];L=[len(w[0])+2 for w in ws];tot=sum(L);t=t0
    for w,l in zip(ws,L):d=(t1-t0)*l/tot;w[1]=round(t,3);w[2]=round(t+d*0.92,3);t+=d
    for i in range(a,b+1):T[i]['s']=W[idx[i][0]][1];T[i]['e']=W[idx[i][1]-1][2]
json.dump(T,open(f't{K}.json','w'),ensure_ascii=False);json.dump(W,open(f'w{K}.json','w'),ensure_ascii=False)
print([round(u['s'],1) for u in T])
