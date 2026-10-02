# Kenka: Gardener_Male_01 s plavom radnom odjećom ("plava mandura"): smeđa odjeća -> plava, čizme i rukavice ostaju
from PIL import Image
import numpy as np, sys
p=sys.argv[1] if len(sys.argv)>1 else 'rb/Kenka_Mandura/m106_body_color.png'
im=np.asarray(Image.open(p).convert('RGB')).astype(np.float32)/255; r,g,b=im[...,0],im[...,1],im[...,2]
mx=im.max(-1); mn=im.min(-1); s=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0); d=np.maximum(mx-mn,1e-6)
h=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
brown=(h>=8)&(h<=42)&(s>0.18)&(mx<0.62); lum=0.30*r+0.59*g+0.11*b; L=np.clip(lum*1.55+0.02,0,1)
blue=np.clip(np.array([0.16,0.29,0.58])[None,None,:]*(L/0.33)[...,None],0,1); out=im.copy(); out[brown]=blue[brown]
Image.fromarray((out*255).astype(np.uint8)).save(p)
