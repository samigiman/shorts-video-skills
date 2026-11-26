import sys,glob
from PIL import Image
K=sys.argv[1];fs=sorted(glob.glob(f'shots/{K}*.jpg'))
for n in range(0,len(fs),12):
    g=fs[n:n+12];im=Image.new('RGB',(6*270,2*480))
    for i,f in enumerate(g): im.paste(Image.open(f).resize((270,480)),((i%6)*270,(i//6)*480))
    im.save(f'shots/sheet{K}{n//12}.png')
print(len(fs))
