import json, sys, os, glob, subprocess
sys.path.insert(0,'/home/claude/pipe')
from repack_glb import read_glb, write_glb, repack
os.makedirs('out/rpm',exist_ok=True); os.makedirs('out/mob',exist_ok=True)
for f in sorted(glob.glob('out/raw/*.glb')):
    n=os.path.basename(f)
    if n.startswith('anim_') or n.startswith('Chef'): continue
    js,bn=read_glb(f)
    for m in js.get('materials',[]): m.pop('normalTexture',None)
    tmp='out/rpm/_'+n; write_glb(tmp,js,bn)
    repack(tmp,'out/rpm/'+n,jpegq=78,alpha_size=128,max_size=256); os.remove(tmp)
    subprocess.run(['npx','gltf-transform','optimize','out/rpm/'+n,'out/mob/'+n,'--compress','meshopt','--texture-compress','false','--simplify','true','--simplify-ratio','0.55','--simplify-error','0.002','--instance','false','--flatten','false'],check=True,capture_output=True)
tot=sum(os.path.getsize(x) for x in glob.glob('out/mob/*.glb')); print('mobile people',len(glob.glob('out/mob/*.glb')),round(tot/1e6,2),'MB')
