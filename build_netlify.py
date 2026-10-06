#!/usr/bin/env python3
"""Gradi Netlify verziju (dist/tuhelj-3d) i zip. Pokreni: python3 build_netlify.py"""
import subprocess, os, shutil, sys
H=os.path.dirname(os.path.abspath(__file__)); D=os.path.join(H,'dist','tuhelj-3d')
# statične datoteke (three.min.js, mqtt, peerjs, ikone, manifest, licence, PROCITAJ.txt) iz web/
os.makedirs(D,exist_ok=True)
W=os.path.join(H,'web')
if os.path.isdir(W):
    for f in os.listdir(W): shutil.copy2(os.path.join(W,f),os.path.join(D,f))
subprocess.run([sys.executable,os.path.join(H,'build.py'),os.path.join(D,'index.html'),'<link rel="manifest" href="manifest.json">\n<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">'],check=True)
p=os.path.join(D,'index.html'); src=open(p,encoding='utf-8').read()
cdn='<script src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js"></script>'
local=('<script src="three.min.js"></script>\n<script>window.THREE||document.write(\'<script src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js"><\\/script>\')</script>\n'
       '<script src="mqtt.min.js"></script>\n<script>window.mqtt||document.write(\'<script src="https://cdn.jsdelivr.net/npm/mqtt@5.16.0/dist/mqtt.min.js"><\\/script>\')</script>\n'
       '<script src="peerjs.min.js"></script>\n<script>window.Peer||document.write(\'<script src="https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js"><\\/script>\')</script>')
open(p,'w',encoding='utf-8').write(src.replace(cdn,local,1))
z=os.path.join(H,'dist','tuhelj-3d'); shutil.make_archive(os.path.join(H,'dist','tuhelj-3d'),'zip',os.path.join(H,'dist'),'tuhelj-3d'); print('gotovo: dist/tuhelj-3d.zip')
# kopija za GitHub Pages (Settings → Pages → main /docs)
docs=os.path.join(H,'docs'); shutil.rmtree(docs,ignore_errors=True); shutil.copytree(D,docs); open(os.path.join(docs,'.nojekyll'),'w').close(); print('gotovo: docs/ (GitHub Pages)')
