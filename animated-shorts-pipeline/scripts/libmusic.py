# usage: python3 libmusic.py K mood [start_sec] [tail] -> mK.wav
# Loops lib/<mood>.wav (your own royalty-free track) to video length, levels it, fades, and ducks it under speech.
import os
import sys,json,wave,numpy as np
K,mood=sys.argv[1],sys.argv[2];st=float(sys.argv[3]) if len(sys.argv)>3 else 0;tail=float(sys.argv[4]) if len(sys.argv)>4 else 4.2
def rd(f):
    w=wave.open(f);return np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
T=json.load(open(f't{K}.json'));W=json.load(open(f'w{K}.json'));SR=44100
D=T[-1]['e']+tail;n=int(D*SR)
rr=0.103  # target music RMS before the 0.22 mix gain in build.sh
m=rd(os.path.join(os.environ.get('MUSIC_LIB','lib'),f'{mood}.wav'))[int(st*SR):]
while len(m)<n: m=np.concatenate([m,m])
m=m[:n]*rr/float(np.sqrt((m[:n]**2).mean()))*1.15
f=int(2.5*SR);m[-f:]*=np.linspace(1,0,f);g=int(0.4*SR);m[:g]*=np.linspace(0,1,g)
env=np.zeros(n)
for _,s,e in W: env[int(s*SR):min(n,int(e*SR))]=1
k=int(0.25*SR);env=np.convolve(env,np.ones(k)/k,'same');m*=1-0.3*env
w=wave.open(f'm{K}.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(m,-1,1)*32767).astype(np.int16).tobytes());w.close()
print('ok',K,mood,round(D,1))
