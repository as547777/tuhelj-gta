/* ===================== sky, light, water ===================== */
const SKY={};
function sunDirFor(hour){ // simple late-August sun path for 46°N
  const t=(hour-13.2)/7.2; // -1..1 from ~6h to ~20.4h
  const el=Math.max(-0.08,Math.cos(t*Math.PI/2)*0.95-0.02)*0.98; // radians up to ~0.93 (~53°)
  const az=Math.PI+t*1.95; // radians from north, clockwise (south at noon)
  const ce=Math.cos(el); return new THREE.Vector3(Math.sin(az)*ce, Math.sin(el), -Math.cos(az)*ce).normalize(); }
function buildSky(scene){
  const uni={uSun:{value:new THREE.Vector3(0,1,0)},uTime:{value:0},uZen:{value:new THREE.Color('#3f74c0')},uHor:{value:new THREE.Color('#c9dbe6')},uSunC:{value:new THREE.Color('#fff2d8')},uCloud:{value:0.32},uGlow:{value:new THREE.Color('#ffe2b8')}};
  const mat=new THREE.ShaderMaterial({uniforms:uni,side:THREE.BackSide,depthWrite:false,fog:false,
    vertexShader:`varying vec3 vD; void main(){ vD=normalize(position); vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position=p.xyww; }`,
    fragmentShader:`uniform vec3 uSun,uZen,uHor,uSunC,uGlow; uniform float uTime,uCloud; varying vec3 vD;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return s; }
      void main(){ vec3 d=normalize(vD); float y=max(d.y,0.0);
        vec3 col=mix(uHor,uZen,pow(y,0.55));
        float sd=max(dot(d,normalize(uSun)),0.0);
        col+=uGlow*pow(sd,8.0)*0.35+uGlow*pow(sd,64.0)*0.5;
        col+=uSunC*smoothstep(0.9994,0.99975,sd)*8.0;
        // clouds on a virtual plane
        if(d.y>0.01){ vec2 cp=d.xz/(d.y+0.08)*1.6+vec2(uTime*0.004,uTime*0.0015); float c=fbm(cp*1.3); c=smoothstep(1.0-uCloud*0.62,1.0-uCloud*0.62+0.28,c); float fade=smoothstep(0.02,0.25,d.y);
          vec3 cc=mix(vec3(0.82,0.84,0.88),vec3(1.0,0.99,0.97),smoothstep(0.3,0.9,fbm(cp*2.1+3.0)))*(0.85+0.3*pow(sd,4.0)); col=mix(col,cc,c*fade*0.92); }
        // cirrus streaks and a couple of contrails (photos: high, wispy, criss-crossed by planes)
        if(d.y>0.015){ vec2 q=d.xz/(d.y+0.1); vec2 r=vec2(q.x*0.8+q.y*0.6,-q.x*0.6+q.y*0.8); float fd=smoothstep(0.015,0.3,d.y)*(1.0-smoothstep(0.45,0.85,d.y));
          float ci=fbm(vec2(r.x*0.45+uTime*0.0015,r.y*5.0)); ci=smoothstep(0.5,0.86,ci)*fbm(r*0.8+7.0); col=mix(col,vec3(0.96,0.97,1.0),clamp(ci*0.9,0.0,0.6)*fd);
          float c1=abs(dot(q-vec2(0.6,-0.2),normalize(vec2(1.0,0.32)))), c2=abs(dot(q-vec2(-0.4,0.5),normalize(vec2(0.45,-1.0))));
          float tr=smoothstep(0.03,0.004,c1)*smoothstep(4.0,1.0,length(q))+smoothstep(0.022,0.003,c2)*smoothstep(3.0,0.5,length(q))*0.8; col=mix(col,vec3(1.0),tr*0.55*fd*(1.0-uCloud*0.5)); }
        // below horizon: haze colour
        if(d.y<0.0) col=mix(uHor,uHor*0.92,clamp(-d.y*4.0,0.0,1.0));
        gl_FragColor=vec4(col,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const m=new THREE.Mesh(new THREE.SphereGeometry(9000,32,16),mat); m.frustumCulled=false; m.renderOrder=-1; scene.add(m);
  SKY.mesh=m; SKY.uni=uni;
  scene.fog=new THREE.FogExp2(0xc6d6e0,0.00046);
  const hemi=new THREE.HemisphereLight(0xcfe0ff,0x5c5a3e,0.55); scene.add(hemi); SKY.hemi=hemi;
  const sun=new THREE.DirectionalLight(0xfff0d8,2.9); sun.castShadow=true; scene.add(sun); scene.add(sun.target); SKY.sun=sun;
  SKY.setShadowQuality=(q)=>{ const s=q>=2?4096:q>=1?2048:1024; if(sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map=null; } sun.shadow.mapSize.set(s,s); const r=q>=2?95:q>=1?75:55; const c=sun.shadow.camera; c.left=-r; c.right=r; c.top=r; c.bottom=-r; c.near=1; c.far=900; c.updateProjectionMatrix(); sun.shadow.bias=-0.0004; sun.shadow.normalBias=q>=2?0.035:0.05; SKY.shadowR=r; SKY.shadowRes=s; };
}
function setTimeOfDay(renderer,scene,hour){
  const d=sunDirFor(hour); SKY.dir=d; SKY.uni.uSun.value.copy(d);
  const el=Math.asin(d.y); const warm=clamp(1-el/0.5,0,1); // low sun -> warmer
  SKY.sun.color.setRGB(1,lerp(0.95,0.72,warm),lerp(0.86,0.52,warm)); SKY.sun.intensity=lerp(2.6,1.5,warm)*smooth(-0.05,0.08,el);
  SKY.uni.uHor.value.setRGB(lerp(0.66,0.93,warm*0.8),lerp(0.79,0.8,warm*0.8),lerp(0.93,0.72,warm*0.8));
  SKY.uni.uZen.value.setRGB(lerp(0.05,0.12,warm),lerp(0.17,0.22,warm),lerp(0.62,0.48,warm));
  SKY.uni.uGlow.value.setRGB(1,lerp(0.88,0.62,warm),lerp(0.72,0.4,warm));
  const night=smooth(0.07,-0.14,el); SKY.night=night; for(const u of [SKY.uni.uHor.value,SKY.uni.uZen.value]) u.lerp(new THREE.Color(0.02,0.03,0.07),night*0.93); SKY.uni.uGlow.value.lerp(new THREE.Color(0.2,0.22,0.35),night);
  // golden hour: when the sun is within ~12° of the horizon the horizon turns peach-pink, the sky above violet-blue,
  // the sun glow and sunlight deep orange (then night takes over)
  { const gold=smooth(0.22,0.03,el)*smooth(-0.1,0.02,el)*(1-night); if(gold>0){ SKY.uni.uHor.value.lerp(new THREE.Color(1.0,0.46,0.24),gold*0.88); SKY.uni.uZen.value.lerp(new THREE.Color(0.1,0.1,0.34),gold*0.7); SKY.uni.uGlow.value.lerp(new THREE.Color(1.0,0.38,0.1),gold*0.92); SKY.sun.color.lerp(new THREE.Color(1.0,0.5,0.24),gold*0.75); } SKY.gold=gold; }
  scene.fog.color.copy(SKY.uni.uHor.value).multiplyScalar(0.98);
  SKY.hemi.intensity=lerp(1.1,0.75,warm)*smooth(-0.1,0.1,el)+0.1+night*0.06; SKY.hemi.color.setRGB(lerp(0.81,0.35,night),lerp(0.88,0.42,night),lerp(1,0.7,night));
  // environment from sky
  if(!SKY.pmrem) SKY.pmrem=new THREE.PMREMGenerator(renderer);
  const es=new THREE.Scene(); const sm=SKY.mesh.clone(); es.add(sm); sm.material=SKY.mesh.material; sm.scale.setScalar(0.01);
  if(SKY.envRT) SKY.envRT.dispose(); SKY.envRT=SKY.pmrem.fromScene(es,0,0.1,200); scene.environment=SKY.envRT.texture;
}
const _sv=new THREE.Vector3(), _sr=new THREE.Vector3(), _su=new THREE.Vector3();
function updateSun(p){ const d=SKY.dir; const sun=SKY.sun; // snap to shadow texel grid
  const fwd=_sv.copy(d).negate(); _sr.set(0,1,0).cross(fwd).normalize(); _su.copy(fwd).cross(_sr).normalize();
  const tex=2*SKY.shadowR/SKY.shadowRes; const a=Math.round(p.dot(_sr)/tex)*tex, b=Math.round(p.dot(_su)/tex)*tex, c=p.dot(fwd);
  const base=new THREE.Vector3().addScaledVector(_sr,a).addScaledVector(_su,b).addScaledVector(fwd,c);
  sun.target.position.copy(base); sun.position.copy(base).addScaledVector(d,400); sun.target.updateMatrixWorld(); }
function buildWater(scene){
  const gb=new GB(); const C=new THREE.Color(1,1,1);
  for(const w of WATER){ if(/Pristav/.test(w.n||'')) continue; const P=smoothCorners(w.P,4,2); const S=resample(P,2); if(S.length<2) continue; const T=tangents(S); const wd=w.n&&/Horvatska/.test(w.n)?2.4:1.5;
    let prevY=null; const rows=S.map((p,i)=>{ let y=Math.min(getHeight(p[0],p[1]),getHeight(p[0]-T[i][1]*wd/2,p[1]+T[i][0]*wd/2),getHeight(p[0]+T[i][1]*wd/2,p[1]-T[i][0]*wd/2))+0.12; if(prevY!==null) y=Math.min(y,prevY+0.05); prevY=y; return [[p[0]-T[i][1]*wd/2,y,p[1]+T[i][0]*wd/2],[p[0]+T[i][1]*wd/2,y,p[1]-T[i][0]*wd/2],p[2]]; });
    for(let i=0;i<rows.length-1;i++){ const a=rows[i], b=rows[i+1]; gb.quad(a[0],a[1],b[1],b[0],[0,a[2]/6],[1,a[2]/6],[1,b[2]/6],[0,b[2]/6],C,[0,1,0]); } }
  const mat=new THREE.MeshStandardMaterial({color:0x3d4a38,roughness:0.08,metalness:0.0,normalMap:TEX.waterN,normalScale:new THREE.Vector2(0.35,0.35),transparent:true,opacity:0.92});
  const m=new THREE.Mesh(gb.geometry(),mat); m.receiveShadow=true; scene.add(m); SKY.water=mat;
}
