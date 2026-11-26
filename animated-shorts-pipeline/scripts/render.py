import sys,base64,subprocess,time,os
from playwright.sync_api import sync_playwright
f0,f1,out=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]
FPS=30
ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p','-color_range','tv',out],stdin=subprocess.PIPE)
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('pageerror',lambda e:print('ERR',e,flush=True))
    pg.goto('file://'+os.getcwd()+'/index'+sys.argv[4]+'.html'); pg.evaluate("document.fonts.load('700 40px Poppins')"); pg.evaluate("document.fonts.load('900 40px \"Inter Display\"')"); pg.evaluate("document.fonts.load('700 40px \"DejaVu Sans\"')"); pg.wait_for_timeout(400)
    t=time.time()
    for f in range(f0,f1):
        d=pg.evaluate(f"(render({f}/{FPS}),cv.toDataURL('image/jpeg',0.93))")
        ff.stdin.write(base64.b64decode(d[23:]))
        if (f-f0)%300==0: print(f,round(time.time()-t,1),flush=True)
    b.close()
ff.stdin.close();ff.wait();print('done',out,flush=True)
