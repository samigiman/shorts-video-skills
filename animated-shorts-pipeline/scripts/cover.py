import sys,base64,os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1080,'height':1920}); pg.on('pageerror',lambda e:print('ERR',e))
    for K,N in [a.split(':') for a in sys.argv[1:]]:
        pg.goto('file://'+os.getcwd()+f'/index{K}C.html'); pg.evaluate("document.fonts.load('900 40px Poppins')"); pg.wait_for_timeout(400)
        pg.evaluate("render(0)"); d=pg.evaluate("cv.toDataURL('image/png')")
        open(os.path.join(os.environ.get('OUT','out'),f'{N}.png'),'wb').write(base64.b64decode(d.split(',')[1])); print('ok',N)
    b.close()
