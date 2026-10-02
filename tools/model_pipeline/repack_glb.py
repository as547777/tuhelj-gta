import json, struct, sys, io
from PIL import Image
def read_glb(p):
    b=open(p,'rb').read(); off=12; js=None; bn=b''
    while off<len(b):
        cl,ct=struct.unpack('<II',b[off:off+8]); c=b[off+8:off+8+cl]
        if ct==0x4E4F534A: js=json.loads(c)
        elif ct==0x004E4942: bn=c
        off+=8+cl
    return js,bn
def write_glb(p,js,bn):
    j=json.dumps(js,separators=(',',':')).encode(); j+=b' '*((4-len(j)%4)%4); bn+=b'\0'*((4-len(bn)%4)%4)
    out=struct.pack('<III',0x46546C67,2,12+8+len(j)+8+len(bn))+struct.pack('<II',len(j),0x4E4F534A)+j+struct.pack('<II',len(bn),0x004E4942)+bn
    open(p,'wb').write(out)
def repack(src,dst,jpegq=80,alpha_size=256,max_size=512):
    js,bn=read_glb(src); views=js['bufferViews']
    imgview={}
    for i,im in enumerate(js.get('images',[])):
        if 'bufferView' not in im: continue
        v=views[im['bufferView']]; data=bn[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
        pic=Image.open(io.BytesIO(data)); buf=io.BytesIO()
        if pic.mode in ('RGBA','LA') or (pic.mode=='P' and 'transparency' in pic.info):
            pic=pic.convert('RGBA')
            if pic.width>alpha_size: pic=pic.resize((alpha_size,alpha_size),Image.LANCZOS)
            pic.quantize(colors=96,method=Image.Quantize.FASTOCTREE).save(buf,'PNG',optimize=True); im['mimeType']='image/png'
        else:
            pic=pic.convert('RGB')
            if pic.width>max_size: pic=pic.resize((max_size,max_size),Image.LANCZOS)
            pic.save(buf,'JPEG',quality=jpegq,optimize=True); im['mimeType']='image/jpeg'
        imgview[im['bufferView']]=buf.getvalue()
    nb=bytearray()
    for i,v in enumerate(views):
        data=imgview.get(i) or bn[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
        while len(nb)%4: nb.append(0)
        v['byteOffset']=len(nb); v['byteLength']=len(data); nb+=data
    js['buffers'][0]['byteLength']=len(nb)
    write_glb(dst,js,bytes(nb))
if __name__=='__main__':
    repack(sys.argv[1],sys.argv[2])
