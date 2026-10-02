/* ===================== post-processing: SSAO + filmic grade + FXAA ===================== */
const POST={enabled:false};
function postSupported(r){ const gl=r.getContext(); return !!(r.capabilities.isWebGL2 && (r.extensions.has('EXT_color_buffer_float')||r.extensions.has('EXT_color_buffer_half_float'))); }
function disposePost(){ for(const k of ['rt','aoRT','blurRT','ldrRT']) if(POST[k]){ if(POST[k].depthTexture) POST[k].depthTexture.dispose(); POST[k].dispose(); POST[k]=null; } }
function setupPost(renderer){
  disposePost(); if(!postSupported(renderer)){ POST.enabled=false; return; }
  const size=new THREE.Vector2(); renderer.getDrawingBufferSize(size); const w=Math.max(2,size.x|0), h=Math.max(2,size.y|0);
  const dt=new THREE.DepthTexture(w,h); dt.type=THREE.UnsignedIntType;
  POST.rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,depthTexture:dt,depthBuffer:true});
  const hw=Math.ceil(w/2), hh=Math.ceil(h/2);
  POST.aoRT=new THREE.WebGLRenderTarget(hw,hh,{type:THREE.UnsignedByteType,depthBuffer:false}); POST.blurRT=new THREE.WebGLRenderTarget(hw,hh,{type:THREE.UnsignedByteType,depthBuffer:false});
  POST.ldrRT=new THREE.WebGLRenderTarget(w,h,{type:THREE.UnsignedByteType,depthBuffer:false});
  if(!POST.scene){ POST.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2)); POST.quad.frustumCulled=false; POST.scene=new THREE.Scene(); POST.scene.add(POST.quad); POST.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const vs='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';
    const K=[]; const rr=mulberry32(5); for(let i=0;i<16;i++){ const v=new THREE.Vector3(rr()*2-1,rr()*2-1,rr()*0.85+0.15).normalize(); let sc=i/16; sc=0.12+0.88*sc*sc; v.multiplyScalar(sc*(0.55+0.45*rr())); K.push(v); }
    POST.ao=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tDepth:{value:null},projInv:{value:new THREE.Matrix4()},proj:{value:new THREE.Matrix4()},res:{value:new THREE.Vector2()},radius:{value:0.85},bias:{value:0.025},kernel:{value:K},nS:{value:16}},vertexShader:vs,fragmentShader:`
      uniform sampler2D tDepth; uniform mat4 projInv, proj; uniform vec2 res; uniform float radius, bias; uniform vec3 kernel[16]; uniform int nS; varying vec2 vUv;
      vec3 vp(vec2 uv){ float d=texture2D(tDepth,uv).x; vec4 p=projInv*vec4(uv*2.0-1.0,d*2.0-1.0,1.0); return p.xyz/p.w; }
      float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ float d=texture2D(tDepth,vUv).x; if(d>0.99999){ gl_FragColor=vec4(1.0); return; }
        vec3 P=vp(vUv); float dist=-P.z; if(dist>170.0){ gl_FragColor=vec4(1.0); return; }
        vec2 px=1.0/res; vec3 Pr=vp(vUv+vec2(px.x,0.0)), Pl=vp(vUv-vec2(px.x,0.0)), Pu=vp(vUv+vec2(0.0,px.y)), Pd=vp(vUv-vec2(0.0,px.y));
        vec3 dx=(abs(Pr.z-P.z)<abs(Pl.z-P.z))?(Pr-P):(P-Pl); vec3 dy=(abs(Pu.z-P.z)<abs(Pd.z-P.z))?(Pu-P):(P-Pd); vec3 N=normalize(cross(dx,dy));
        float a=hash(floor(vUv*res))*6.2831; vec3 rv=vec3(cos(a),sin(a),0.0); vec3 T=normalize(rv-N*dot(rv,N)); vec3 B=cross(N,T); mat3 TBN=mat3(T,B,N);
        float rad=radius*clamp(dist/10.0,0.7,2.2); float occ=0.0;
        for(int i=0;i<16;i++){ if(i>=nS) break; vec3 S=P+TBN*kernel[i]*rad; vec4 o=proj*vec4(S,1.0); vec2 suv=o.xy/o.w*0.5+0.5; if(suv.x<0.0||suv.x>1.0||suv.y<0.0||suv.y>1.0) continue; float sz=vp(suv).z; float rc=smoothstep(0.0,1.0,rad/abs(P.z-sz)); occ+=(sz>=S.z+bias*dist*0.05+0.01?1.0:0.0)*rc; }
        float ao=1.0-occ/float(nS); ao=mix(1.0,ao,1.0-smoothstep(110.0,170.0,dist)); gl_FragColor=vec4(vec3(ao),1.0); }`});
    POST.blur=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tAO:{value:null},res:{value:new THREE.Vector2()}},vertexShader:vs,fragmentShader:`
      uniform sampler2D tAO; uniform vec2 res; varying vec2 vUv; void main(){ vec2 px=1.0/res; float s=0.0; for(int x=-2;x<2;x++) for(int y=-2;y<2;y++) s+=texture2D(tAO,vUv+(vec2(float(x),float(y))+0.5)*px).r; gl_FragColor=vec4(vec3(s/16.0),1.0); }`});
    POST.comp=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tColor:{value:null},tAO:{value:null},exposure:{value:0.92},aoK:{value:0.85}},vertexShader:vs,fragmentShader:`
      uniform sampler2D tColor, tAO; uniform float exposure, aoK; varying vec2 vUv;
      vec3 RRTAndODTFit(vec3 v){ vec3 a=v*(v+0.0245786)-0.000090537; vec3 b=v*(0.983729*v+0.4329510)+0.238081; return a/b; }
      vec3 aces(vec3 c){ const mat3 I=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777)); const mat3 O=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602)); c*=exposure/0.6; c=I*c; c=RRTAndODTFit(c); c=O*c; return clamp(c,0.0,1.0); }
      vec3 toSRGB(vec3 c){ return mix(pow(c,vec3(0.41666))*1.055-0.055,c*12.92,vec3(lessThanEqual(c,vec3(0.0031308)))); }
      void main(){ vec3 c=texture2D(tColor,vUv).rgb; float ao=texture2D(tAO,vUv).r; c*=mix(1.0,ao,aoK); vec3 t=aces(c);
        float l=dot(t,vec3(0.2126,0.7152,0.0722)); t=mix(vec3(l),t,1.07); t=mix(t,t*vec3(1.025,1.0,0.965),smoothstep(0.35,1.0,l)); t=mix(t,t*vec3(0.97,1.0,1.04),1.0-smoothstep(0.0,0.35,l));
        vec2 q=vUv-0.5; t*=1.0-dot(q,q)*0.42; gl_FragColor=vec4(toSRGB(t),1.0); }`});
    POST.fxaa=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tDiffuse:{value:null},res:{value:new THREE.Vector2()}},vertexShader:vs,fragmentShader:`
      uniform sampler2D tDiffuse; uniform vec2 res; varying vec2 vUv;
      void main(){ vec2 rcp=1.0/res; vec3 nw=texture2D(tDiffuse,vUv+vec2(-1.0,-1.0)*rcp).rgb, ne=texture2D(tDiffuse,vUv+vec2(1.0,-1.0)*rcp).rgb, sw=texture2D(tDiffuse,vUv+vec2(-1.0,1.0)*rcp).rgb, se=texture2D(tDiffuse,vUv+vec2(1.0,1.0)*rcp).rgb, m=texture2D(tDiffuse,vUv).rgb;
        vec3 L=vec3(0.299,0.587,0.114); float lnw=dot(nw,L), lne=dot(ne,L), lsw=dot(sw,L), lse=dot(se,L), lm=dot(m,L); float lmin=min(lm,min(min(lnw,lne),min(lsw,lse))), lmax=max(lm,max(max(lnw,lne),max(lsw,lse)));
        vec2 dir=vec2(-((lnw+lne)-(lsw+lse)),((lnw+lsw)-(lne+lse))); float red=max((lnw+lne+lsw+lse)*(0.25*0.125),1.0/128.0); float rmin=1.0/(min(abs(dir.x),abs(dir.y))+red); dir=min(vec2(8.0),max(vec2(-8.0),dir*rmin))*rcp;
        vec3 A=0.5*(texture2D(tDiffuse,vUv+dir*(1.0/3.0-0.5)).rgb+texture2D(tDiffuse,vUv+dir*(2.0/3.0-0.5)).rgb); vec3 Bc=A*0.5+0.25*(texture2D(tDiffuse,vUv+dir*-0.5).rgb+texture2D(tDiffuse,vUv+dir*0.5).rgb);
        float lb=dot(Bc,L); gl_FragColor=vec4((lb<lmin||lb>lmax)?A:Bc,1.0); }`});
  }
  POST.ao.uniforms.tDepth.value=dt; POST.ao.uniforms.res.value.set(w,h); POST.blur.uniforms.res.value.set(hw,hh); POST.blur.uniforms.tAO.value=POST.aoRT.texture;
  POST.comp.uniforms.tColor.value=POST.rt.texture; POST.comp.uniforms.tAO.value=POST.blurRT.texture; POST.comp.uniforms.exposure.value=renderer.toneMappingExposure;
  POST.fxaa.uniforms.tDiffuse.value=POST.ldrRT.texture; POST.fxaa.uniforms.res.value.set(w,h);
  POST.noAO=false; POST.ao.uniforms.nS.value=GAME.touch?8:16; POST.comp.uniforms.aoK.value=0.85; POST.enabled=true;
}
function renderFrame(renderer,scene,camera){
  if(!POST.enabled){ renderer.setRenderTarget(null); renderer.render(scene,camera); return; }
  renderer.setRenderTarget(POST.rt); renderer.render(scene,camera);
  POST.ao.uniforms.proj.value.copy(camera.projectionMatrix); POST.ao.uniforms.projInv.value.copy(camera.projectionMatrixInverse);
  if(!POST.noAO){ POST.quad.material=POST.ao; renderer.setRenderTarget(POST.aoRT); renderer.render(POST.scene,POST.cam);
  POST.quad.material=POST.blur; renderer.setRenderTarget(POST.blurRT); renderer.render(POST.scene,POST.cam); }
  POST.quad.material=POST.comp; renderer.setRenderTarget(POST.ldrRT); renderer.render(POST.scene,POST.cam);
  POST.quad.material=POST.fxaa; renderer.setRenderTarget(null); renderer.render(POST.scene,POST.cam);
}
