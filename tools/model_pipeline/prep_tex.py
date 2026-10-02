import glob, os
from PIL import Image
import concurrent.futures as cf
def do(f):
    b=os.path.basename(f); d=os.path.dirname(f)
    try: im=Image.open(f)
    except Exception as e: return (f,'ERR',str(e))
    info=(b,im.size,im.mode)
    if '_specular' in b or 'wrinkle' in b: 
        os.remove(f); return info
    if '_normal' in b: sz=256; im=im.convert('RGB')
    elif 'opacity' in b: sz=512
    else: sz=512
    im=im.resize((sz,sz),Image.LANCZOS)
    im.save(os.path.join(d,b[:-4]+'.png'))
    os.remove(f); return info
fs=glob.glob('rb/*/*.tga')
with cf.ProcessPoolExecutor(2) as ex: res=list(ex.map(do,fs))
import collections
print(collections.Counter((r[1],r[2]) for r in res if len(r)==3 and r[1]!='ERR'))
for r in res:
    if 'opacity' in r[0] or 'equipment' in r[0] or 'pistol' in r[0]: print(r)
