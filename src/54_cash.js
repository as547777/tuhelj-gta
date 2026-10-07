/* ===================== cash on the ground =====================
   Whoever goes down drops their money, like in GTA: a little green stack of notes that spins and glows on the
   ground for a minute. Walk (or drive) over it to pick it up. Villagers carry a few euros, policemen more, and the
   Crni Vukovi carry the most. */
const CASH={list:[],geo:null,mat:null,glow:null};
function cashAmount(A){ const n=String(A.name||''); if(A.noCrime&&/Vuk/.test(n)) return 40+Math.floor(Math.random()*110); if(/Policajac|policija/i.test(n)) return 25+Math.floor(Math.random()*60); return 5+Math.floor(Math.random()*45); }
function cashDrop(x,y,z,amt){ if(!CASH.geo){ CASH.geo=new THREE.BoxGeometry(0.34,0.07,0.16); CASH.mat=new THREE.MeshStandardMaterial({color:0x3f9a4a,emissive:0x1f6a2a,emissiveIntensity:0.6,roughness:0.6});
    const c=cvs(64,64), g=c.getContext('2d'); const gr=g.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(140,255,150,.9)'); gr.addColorStop(1,'rgba(140,255,150,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); const t=new THREE.CanvasTexture(c); CASH.glow=new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}); }
  const grp=new THREE.Group(); for(let i=0;i<3;i++){ const m=new THREE.Mesh(CASH.geo,CASH.mat); m.position.y=i*0.07; m.rotation.y=(Math.random()-0.5)*0.4; grp.add(m); } const sp=new THREE.Sprite(CASH.glow); sp.scale.set(1.1,1.1,1); sp.position.y=0.1; grp.add(sp);
  const gy=groundAt(x,z); grp.position.set(x,Math.max(gy,y)+0.08,z); GAME.scene.add(grp); CASH.list.push({grp,amt,t:60,x,z}); }
function cashTick(dt){ for(let i=CASH.list.length-1;i>=0;i--){ const c=CASH.list[i]; c.t-=dt; c.grp.rotation.y+=dt*2.2; c.grp.position.y+=Math.sin(GAME.time*3+i)*0.0015;
    const p=PLAYER.pos; const d=Math.hypot(p.x-c.x,p.z-c.z); if(d<(PLAYER.driving?2.4:1.3)&&!COMBAT.dead){ money(c.amt,'pokupio novac'); UI.toast('💶 +'+c.amt+' €'); GAME.scene.remove(c.grp); CASH.list.splice(i,1); continue; }
    if(c.t<=0){ GAME.scene.remove(c.grp); CASH.list.splice(i,1); } } }
{ const _hp=hurtPerson; hurtPerson=function(P,dmg,byMe){ const A=P&&P.A; const was=A&&A.dead; if(A&&!was) A.cashDropped=false; _hp(P,dmg,byMe); if(A&&!was&&A.dead&&!A.cashDropped){ A.cashDropped=true; const q=A.deadPos||A.group.position; const a=Math.random()*TAU; cashDrop(q.x+Math.cos(a)*0.6,q.y,q.z+Math.sin(a)*0.6,cashAmount(A)); } }; }
{ const _ct=combatTick; combatTick=function(dt){ _ct(dt); try{ cashTick(dt); }catch(e){} }; }
