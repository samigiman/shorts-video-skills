import sys,json,re,subprocess,numpy as np
MINP=0.05  # min pause (s) treated as a boundary; try 0.09 for slow voices
def align(K,wav,tempo=1.0):
    sr=16000
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',wav,'-ac','1','-ar',str(sr),'-f','s16le','-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(np.float32)/32768
    hop=160;n=len(x)//hop;r=np.sqrt(np.array([np.mean(x[i*hop:(i+1)*hop]**2) for i in range(n)])+1e-12)
    db=20*np.log10(r);thr=max(db.max()-38,-50);sp=db>thr
    idx=np.where(sp)[0];t0=idx[0]*0.01;t1=(idx[-1]+1)*0.01
    pauses=[];i=idx[0]
    while i<idx[-1]:
        if not sp[i]:
            j=i
            while j<len(sp) and not sp[j]:j+=1
            if (j-i)*0.01>=MINP:pauses.append((i*0.01,j*0.01))
            i=j
        else:i+=1
    t=open(K+'.txt',encoding='utf-8').read().strip()
    U=[u.strip() for u in re.findall(r'[^,.?!:]+[,.?!:]+"?|[^,.?!:]+$',t) if u.strip()]
    w=[len(u)+6 for u in U];C=np.cumsum(w);tot=C[-1]
    # pause total
    pt=sum(b-a for a,b in pauses);speech=(t1-t0)-pt
    nb=len(U)-1;P=len(pauses)
    E=[t0+(t1-t0)*C[k]/tot for k in range(nb)]
    strong=[U[k].rstrip('"')[-1] in '.?!' for k in range(nb)]
    INF=1e18
    # dp[k][j]: best cost assigning boundaries 0..k-1, last used pause index j-1 (j=0 none)
    dp=np.full((nb+1,P+1),INF);arg={}
    dp[0][0]=0
    for k in range(nb):
        for j in range(P+1):
            if dp[k][j]>=INF:continue
            # skip (no pause)
            c=dp[k][j]+(4.0 if strong[k] else 0.8)
            if c<dp[k+1][j]:dp[k+1][j]=c;arg[(k+1,j)]=(j,None)
            for q in range(j,P):
                a,b=pauses[q];m=(a+b)/2
                d=m-E[k]
                if d>6:break
                c=dp[k][j]+d*d*0.25-(1.5*(b-a) if strong[k] else 0.5*(b-a))
                if c<dp[k+1][q+1]:dp[k+1][q+1]=c;arg[(k+1,q+1)]=(j,q)
    j=int(np.argmin(dp[nb]));bnd=[None]*nb
    for k in range(nb,0,-1):
        pj,q=arg[(k,j)];bnd[k-1]=q;j=pj
    # boundary times
    S=[t0];Eu=[]
    for k in range(nb):
        if bnd[k] is not None:a,b=pauses[bnd[k]];Eu.append(a);S.append(b)
        else:Eu.append(None);S.append(None)
    Eu.append(t1)
    # fill None by interpolation by chars
    for k in range(len(U)):
        if S[k] is None:
            # find prev end
            pass
    # resolve: walk segments between known anchors
    anchors=[(0,t0)]
    for k in range(nb):
        if bnd[k] is not None:anchors.append((k+1,S[k+1]))
    res=[]
    for ai,(ks,ts) in enumerate(anchors):
        ke=anchors[ai+1][0] if ai+1<len(anchors) else len(U)
        te=Eu[ke-1] if ke-1<len(Eu) and Eu[ke-1] is not None else t1
        cw=[w[k] for k in range(ks,ke)];cs=np.cumsum([0]+cw);T=te-ts
        for k in range(ks,ke):
            res.append([ts+T*cs[k-ks]/cs[-1],ts+T*cs[k-ks+1]/cs[-1]])
    Tj=[];W=[]
    for k,u in enumerate(U):
        s,e=res[k];s/=tempo;e/=tempo
        ws=u.split();lw=[len(z)+2 for z in ws];cs=np.cumsum([0]+lw)
        for i,z in enumerate(ws):W.append([z,round(s+(e-s)*cs[i]/cs[-1],3),round(s+(e-s)*cs[i+1]/cs[-1]-0.03,3)])
        Tj.append({'text':u,'s':round(s,3),'e':round(e,3)})
    json.dump(W,open('w'+K+'.json','w'),ensure_ascii=False);json.dump(Tj,open('t'+K+'.json','w'),ensure_ascii=False)
    used=sum(1 for b in bnd if b is not None)
    return len(U),used,round(t1/tempo,1)
if __name__=='__main__':
    print(align(sys.argv[1],sys.argv[2],float(sys.argv[3]) if len(sys.argv)>3 else 1.0))
