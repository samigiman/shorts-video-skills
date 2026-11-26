import sys,base64,os
os.makedirs('shots',exist_ok=True)
from playwright.sync_api import sync_playwright
K=sys.argv[1];ts=[float(x) for x in sys.argv[2:]]
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('console',lambda m:print('CONSOLE',m.text)); pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto('file://'+os.getcwd()+'/index'+K+'.html'); pg.evaluate("document.fonts.load('700 40px Poppins')"); pg.evaluate("document.fonts.load('900 40px \"Inter Display\"')"); pg.wait_for_timeout(300)
    for a in ts:
        try:
            pg.evaluate(f"render({a})")
            d=pg.evaluate("cv.toDataURL('image/jpeg',0.8)")
            open(f'shots/{K}{a:07.2f}.jpg','wb').write(base64.b64decode(d.split(',')[1]))
        except Exception as e: print('FAIL',a,str(e)[:300])
    b.close()
