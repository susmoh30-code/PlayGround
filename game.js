import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c8c8');
scene.fog = new THREE.Fog('#a9c8c8', 42, 105);
const camera = new THREE.PerspectiveCamera(69, innerWidth / innerHeight, .1, 150);
camera.position.set(0, 1.72, 15);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

scene.add(new THREE.HemisphereLight('#e4f2dc', '#716a56', 2.1));
const sun = new THREE.DirectionalLight('#fff0cb', 3.1);
sun.position.set(-16, 28, 12); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -34; sun.shadow.camera.right = 34; sun.shadow.camera.top = 34; sun.shadow.camera.bottom = -34;
scene.add(sun);
const fill = new THREE.DirectionalLight('#9cbcc3', .8); fill.position.set(20, 10, -20); scene.add(fill);
const mat = (color, roughness=.85, extra={}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const grassMat=mat('#718857'), roadMat=mat('#444a47'), sidewalkMat=mat('#c4b99e'), curbMat=mat('#e2d7bd'), cream=mat('#ede0c6'), dark=mat('#283537'), leafMat=mat('#587252'), barkMat=mat('#725641');
const boxGeo=new THREE.BoxGeometry(1,1,1);
function box(parent, name, x,y,z, sx,sy,sz, material, cast=true){const m=new THREE.Mesh(boxGeo,material);m.name=name;m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,x,y,z,sx,sy,sz,material){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m;}
function cylinder(parent,x,y,z,r1,r2,h,material,segments=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function plane(x,y,z,sx,sz,material){const m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),material);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;scene.add(m);return m;}
// Bright, hand-built blocks of suburban Pleasant Valley.
plane(0,-.08,-25,92,115,grassMat);
plane(0,.01,1,10.5,100,roadMat);
plane(0,.06,1,13.3,100,sidewalkMat);
plane(0,.10,1,10.4,100,roadMat);
// road edge, center dashes and poured-concrete joints
for(const x of [-5.35,5.35]) box(scene,'curb',x,.13,1,.26,.22,100,curbMat,false);
for(let z=-44;z<33;z+=7) box(scene,'lane dash',0,.025,z,.13,.025,3.2,mat('#b9ad84'),false);
for(let z=-44;z<28;z+=5){box(scene,'walk seam',-6.15,.016,z,.018,.012,.08,mat('#a89d83'),false);box(scene,'walk seam',6.15,.016,z,.018,.012,.08,mat('#a89d83'),false);}
// distant low hills
for(let i=0;i<13;i++){const hill=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),mat(i%2?'#91b49b':'#9bbc9f'));hill.position.set(-50+i*8,-7,-61-Math.random()*12);hill.scale.set(12+Math.random()*7,11+Math.random()*8,8);scene.add(hill);}
// puffy clouds
const cloudMat=new THREE.MeshBasicMaterial({color:'#e4eee0',transparent:true,opacity:.76});
for(let i=0;i<9;i++){const g=new THREE.Group();const x=-32+i*8,z=-43-Math.random()*28,y=16+Math.random()*10;for(let j=0;j<4;j++){const c=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),cloudMat);c.scale.set(2.4+Math.random()*1.8,1+Math.random(),1.1);c.position.set(j*1.6,Math.random()*.55,Math.random()*.5);g.add(c);}g.position.set(x,y,z);scene.add(g);}
function gableRoof(parent,x,z,w,d,y,color){const g=new THREE.BufferGeometry();const v=[-w/2,0,-d/2,w/2,0,-d/2,0,w*.35,-d/2,-w/2,0,d/2,w/2,0,d/2,0,w*.35,d/2];const ids=[0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4];g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ids);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:.92,side:THREE.DoubleSide}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const houses=[];
function makeHouse(x,z,bodyColor,roofColor,trimColor,number,name){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);houses.push(g);
 box(g,'house body',0,2.1,0,8.5,4.2,6.6,mat(bodyColor));
 gableRoof(g,0,0,9.4,7.3,4.16,roofColor);
 // white fascia, porch and foundations
 box(g,'foundation',0,.22,.02,8.8,.42,6.85,mat('#b6a991'));
 box(g,'front porch',0,.30,4.3,4.5,.28,2.1,mat('#d9cdb1'));
 for(const px of [-1.9,1.9]){box(g,'porch post',px,1.35,5.08,.16,2.25,.16,mat(trimColor));}
 box(g,'porch lintel',0,2.42,5.08,4.05,.17,.18,mat(trimColor));
 // front door, transom and little brass knob
 box(g,'door',0,1.4,3.36,1.12,2.45,.12,mat('#536455'));
 box(g,'door inset',0,1.42,3.285,.74,1.84,.025,mat('#677761'));
 sphere(g,.39,1.37,3.21,.055,.055,.055,mat('#e0ba64',.3,{metalness:.5}));
 box(g,'transom',0,2.68,3.35,1.16,.33,.13,mat('#f2d48a',.28,{emissive:'#aa7133',emissiveIntensity:.3}));
 // windows with frames, sill and warm glass
 for(const wx of [-2.7,2.7]){box(g,'window frame',wx,2.15,3.34,1.48,1.48,.15,mat(trimColor));box(g,'window glass',wx,2.15,3.245,1.16,1.15,.055,mat('#91b5b1',.26,{metalness:.15,emissive:'#537675',emissiveIntensity:.22}));box(g,'window mullion',wx,2.15,3.19,.065,1.17,.04,mat(trimColor));box(g,'window mullion',wx,2.15,3.18,1.2,.06,.04,mat(trimColor));box(g,'window sill',wx,1.37,3.28,1.64,.12,.27,mat(trimColor));}
 // tiny attic window on gable
 sphere(g,0,4.73,2.13,.37,.37,.12,mat('#b4c6ad'));
 // lawn, walk path, picket fence and garden beds
 box(g,'lawn',0,.035,8.1,13,.08,7.1,mat(x===0?'#85a45f':'#78935b'),false);
 for(let k=0;k<4;k++)box(g,'path stone',0,.09,7.1+k*.78,.95,.12,.58,mat('#c9bda0'),false);
 for(const side of [-1,1]){box(g,'garden bed',side*4.2,.16,5.9,1.6,.24,1.2,mat('#584a3b'));for(let j=0;j<5;j++){const flower=sphere(g,side*(3.65+j*.25),.47,5.5+Math.sin(j)*.25,.16,.29,.16,mat(['#d87862','#e3c36f','#b87d91'][j%3]));flower.rotation.z=.12;}}
 for(const side of [-1,1]){for(let k=0;k<7;k++){const fx=side*(4.4+k*.62);box(g,'fence picket',fx,.62,9.95,.11,1.05,.12,mat('#eee4cf'));const cap=new THREE.Mesh(new THREE.ConeGeometry(.1,.22,4),mat('#eee4cf'));cap.position.set(fx,1.23,9.95);g.add(cap);}box(g,'fence rail',side*6.2,.42,9.95,4.4,.11,.12,mat('#eee4cf'));box(g,'fence rail',side*6.2,.83,9.95,4.4,.11,.12,mat('#eee4cf'));}
 // curbside mailbox with number sign
 cylinder(g,sideSignX(x),.65,11,.07,.07,1.25,mat('#293438'));
 box(g,'mailbox',sideSignX(x),1.25,11,.65,.42,.46,mat('#31494a'));
 const signTex=document.createElement('canvas');signTex.width=128;signTex.height=64;const ctx=signTex.getContext('2d');ctx.fillStyle='#eee3c5';ctx.fillRect(0,0,128,64);ctx.fillStyle='#263a37';ctx.font='bold 34px monospace';ctx.textAlign='center';ctx.fillText(String(number),64,43);const tex=new THREE.CanvasTexture(signTex);tex.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(.5,.27),new THREE.MeshBasicMaterial({map:tex}));sign.position.set(sideSignX(x),1.27,10.76);g.add(sign);
 // trees to frame the house
 for(const tx of [-6.4,6.4]){cylinder(g,tx,2.0,5.2,.26,.38,4,barkMat,8);for(let n=0;n<3;n++)sphere(g,tx+(Math.random()-.5)*1.5,4.2+n*.3,5.2+(Math.random()-.5),1.35,1.2,1.2,leafMat);}
 return g;}
function sideSignX(x){return x<0?-5.7:5.7;}
makeHouse(-14,-18,'#d58d70','#765750','#f2d7b1','18','THE HENDERSONS');
makeHouse(0,-18,'#d8c28e','#5c6e67','#f4e4c4','20','YOUR NEW HOME');
makeHouse(14,-18,'#9bb2a0','#a85742','#f1e4cc','22','THE MILLERS');
// street lamps and fire hydrants, backyard silhouettes
for(const x of [-7.3,7.3])for(const z of [-29,-7,14]){cylinder(scene,x,2.4,z,.075,.1,4.8,mat('#344644'));cylinder(scene,x,4.85,z,.12,.2,.3,mat('#344644'));const bulb=sphere(scene,x,4.56,z,.24,.2,.24,mat('#f1d78f',.25,{emissive:'#dbb354',emissiveIntensity:.65}));}
for(const x of [-5.85,5.85]){const h=cylinder(scene,x,.42,-5,.24,.3,.78,mat('#be5944'));cylinder(scene,x,.83,-5,.34,.34,.12,mat('#be5944'));cylinder(scene,x,.99,-5,.09,.09,.27,mat('#be5944'));}
// neighborhood sign
box(scene,'sign post',-7.7,1.35,-14,.16,2.7,.16,barkMat);
box(scene,'sign board',-7.7,2.45,-14,2.3,.85,.18,mat('#334c43'));
const signC=document.createElement('canvas');signC.width=512;signC.height=192;const sc=signC.getContext('2d');sc.fillStyle='#29443a';sc.fillRect(0,0,512,192);sc.strokeStyle='#e3cb87';sc.lineWidth=7;sc.strokeRect(12,12,488,168);sc.fillStyle='#f0dfb0';sc.textAlign='center';sc.font='bold 39px Georgia';sc.fillText('PLEASANT VALLEY',256,86);sc.font='22px monospace';sc.fillText('POP. 1,408  ·  KEEP IT NICE',256,132);const sTex=new THREE.CanvasTexture(signC);sTex.colorSpace=THREE.SRGBColorSpace;const signFace=new THREE.Mesh(new THREE.PlaneGeometry(2.18,.73),new THREE.MeshBasicMaterial({map:sTex}));signFace.position.set(-7.7,2.45,-13.895);scene.add(signFace);
// Simple white cloud shapes are distant; flowers and small tufts add a storybook curb.
for(let i=0;i<36;i++){const x=(Math.random()<.5?-1:1)*(7+Math.random()*14),z=-34+Math.random()*29;const shrub=sphere(scene,x,.37,z,.55,.42,.55,mat(i%3?'#718a58':'#879b61'));}

// Soft cartoon imps. Aiming is deliberate: center the little glowing eyes.
const enemies=[];
const demonSkin=mat('#8e4735'), demonDark=mat('#502e2d'), demonGlow=mat('#ffb15e',.25,{emissive:'#ff4d1f',emissiveIntensity:2.4}), hornMat=mat('#d6b66e',.44), clawMat=mat('#392928');
function makeDemon(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 sphere(g,0,1.06,0,.57,.72,.48,demonSkin);
 sphere(g,0,1.67,-.02,.52,.45,.44,demonSkin);
 sphere(g,-.2,1.69,-.42,.09,.095,.07,demonGlow);sphere(g,.2,1.69,-.42,.09,.095,.07,demonGlow);
 for(const s of [-1,1]){const horn=new THREE.Mesh(new THREE.ConeGeometry(.15,.55,7),hornMat);horn.position.set(s*.34,2.08,-.02);horn.rotation.z=s*.33;g.add(horn);sphere(g,s*.28,.83,-.4,.12,.1,.07,clawMat);}
 box(g,'demon mouth',0,1.48,-.423,.29,.06,.05,clawMat);
 for(const s of [-1,1]){const arm=sphere(g,s*.63,1.12,0,.19,.52,.21,demonSkin);arm.rotation.z=s*.32;const leg=sphere(g,s*.28,.35,0,.21,.4,.24,demonDark);leg.name='leg';}
 g.userData={hp:2,phase:Math.random()*6,lastAttack:0,homeX:x,hit:0};enemies.push(g);return g;}
const demonStarts=[[-4,-3],[4,-7],[-12,-11],[12,-12],[-3,-17],[5,-20],[-8,-24],[10,-28]];
for(const [x,z] of demonStarts)makeDemon(x,z);

const keys=new Set();const coarsePointer=matchMedia('(hover:none) and (pointer:coarse)').matches;let started=false,locked=false,health=100,ammo=24,reserve=96,kills=0,soundOn=true,fireCooldown=0,reloading=false,gameWon=false;
let yaw=0,pitch=0;camera.rotation.order='YXZ';
const raycaster=new THREE.Raycaster();raycaster.far=38;
const clock=new THREE.Clock();
const soundCtx=()=>{if(!soundOn)return null;try{return window.audioCtx||(window.audioCtx=new AudioContext());}catch{return null;}};
function tone(freq,duration,type='square',volume=.035,slide=0){const c=soundCtx();if(!c)return;const o=c.createOscillator(),gain=c.createGain();o.type=type;o.frequency.value=freq;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),c.currentTime+duration);gain.gain.setValueAtTime(volume,c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(gain);gain.connect(c.destination);o.start();o.stop(c.currentTime+duration);}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1900);}
function updateHud(){document.querySelector('#kill-count').innerHTML=`${kills} <small>/ 8</small>`;document.querySelector('#progress-fill').style.width=`${kills/8*100}%`;document.querySelector('#health-value').textContent=health;document.querySelector('#health-bar').style.width=health+'%';document.querySelector('#ammo-value').innerHTML=`${ammo} <small>/ ${reserve}</small>`;document.querySelector('#ammo-bar').style.width=(ammo/24*100)+'%';if(kills===8&&!gameWon){gameWon=true;resumeHint.classList.add('hidden');document.exitPointerLock?.();setTimeout(()=>document.querySelector('#win-overlay').classList.remove('hidden'),700);}}
function startGame(){if(started)return;started=true;document.querySelector('#game-shell').classList.add('playing');document.querySelector('#intro').classList.add('hidden');if(!coarsePointer)try{canvas.requestPointerLock?.();}catch{}syncResumeHint();toast('SHIFT STARTED · KEEP THE LAWN TIDY');soundCtx()?.resume();}
document.querySelector('#start-button').addEventListener('click',startGame);
document.querySelector('#again-button').addEventListener('click',()=>location.reload());
const resumeHint=document.querySelector('#resume-hint');let hadLock=false;
function syncResumeHint(){resumeHint.classList.toggle('hidden',!started||gameWon||locked||!hadLock||coarsePointer);}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(locked)hadLock=true;syncResumeHint();});
canvas.addEventListener('click',()=>{if(started&&!coarsePointer&&!locked){try{canvas.requestPointerLock?.();}catch{}}else if(started)fire();});
document.addEventListener('mousemove',e=>{if(locked){yaw-=e.movementX*.0022;pitch-=e.movementY*.0019;pitch=THREE.MathUtils.clamp(pitch,-1.15,1.15);}});
document.addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyR')reload();if(e.code==='Digit1')toast('PLASMA MOWER MK. II · READY');});
document.addEventListener('keyup',e=>keys.delete(e.code));
document.querySelector('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;document.querySelector('#sound-toggle span').textContent=soundOn?'SOUND ON':'SOUND OFF';});
function reload(){if(reloading||ammo===24||reserve<=0)return;reloading=true;toast('RELOADING · MIND THE FLOWERS');tone(160,.11,'square',.025,-60);setTimeout(()=>{const n=Math.min(24-ammo,reserve);ammo+=n;reserve-=n;reloading=false;updateHud();tone(420,.09,'square',.018,140);},950);}
function fire(){if(!started||gameWon||fireCooldown>0)return;if(ammo<=0){tone(110,.08,'square',.025,-30);toast('OUT OF JUICE · PRESS R');return;}ammo--;fireCooldown=.22;updateHud();const weapon=document.querySelector('.weapon');weapon.classList.add('firing');setTimeout(()=>weapon.classList.remove('firing'),75);tone(105,.12,'sawtooth',.045,620);tone(58,.08,'triangle',.04,-18);
 camera.updateMatrixWorld();raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const candidates=[];for(const e of enemies)if(e.parent)candidates.push(...e.children.filter(c=>c.isMesh));const hit=raycaster.intersectObjects(candidates,false)[0];if(hit){let e=hit.object;while(e.parent&&!enemies.includes(e))e=e.parent;if(enemies.includes(e)){e.userData.hp--;e.userData.hit=.18;e.position.add(new THREE.Vector3(0,0,.2));tone(260,.08,'triangle',.025,-95);if(e.userData.hp<=0){scene.remove(e);kills++;toast(['NICE SHRUBBERY.','NOT ON THE HOA LIST.','PEST CONTROL!','NEIGHBOR APPROVED.'][kills%4]);tone(520,.16,'square',.035,360);if(kills===3||kills===6){reserve+=24;toast('MAILBOX DELIVERY · +24 CELLS');}updateHud();}}}
}
// Desktop and touch-fire input
canvas.addEventListener('contextmenu',e=>e.preventDefault());
const mobileFire=document.querySelector('#mobile-fire');mobileFire.addEventListener('pointerdown',e=>{e.preventDefault();fire();try{mobileFire.setPointerCapture(e.pointerId);}catch{}});mobileFire.addEventListener('pointerup',()=>{});
document.querySelector('#mobile-reload').addEventListener('pointerdown',e=>{e.preventDefault();reload();});
for(const b of document.querySelectorAll('[data-move]')){const code={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'}[b.dataset.move];b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(code);try{b.setPointerCapture(e.pointerId);}catch{}});const stop=()=>keys.delete(code);b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',stop);}
let touchX=null,touchY=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&started&&!e.target.closest('button')){touchX=e.clientX;touchY=e.clientY;}});canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&touchX!==null){yaw-=(e.clientX-touchX)*.006;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-touchY)*.005,-1.1,1.1);touchX=e.clientX;touchY=e.clientY;}});canvas.addEventListener('pointerup',()=>{touchX=null;touchY=null;});

function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.045);fireCooldown=Math.max(0,fireCooldown-dt);if(started){camera.rotation.set(pitch,yaw,0,'YXZ');const move=new THREE.Vector3();if(keys.has('KeyW')||keys.has('ArrowUp'))move.z-=1;if(keys.has('KeyS')||keys.has('ArrowDown'))move.z+=1;if(keys.has('KeyA')||keys.has('ArrowLeft'))move.x-=1;if(keys.has('KeyD')||keys.has('ArrowRight'))move.x+=1;if(move.lengthSq()){move.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?8.2:5.2;camera.position.addScaledVector(move,speed*dt);camera.position.x=THREE.MathUtils.clamp(camera.position.x,-5.0,5.0);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-34,19);}
 for(const e of enemies){if(!e.parent)continue;const d=Math.hypot(camera.position.x-e.position.x,camera.position.z-e.position.z);e.userData.phase+=dt*5.2;e.position.y=Math.sin(e.userData.phase)*.055;e.rotation.z=Math.sin(e.userData.phase*.5)*.045;if(e.userData.hit>0){e.userData.hit-=dt;e.scale.setScalar(1+Math.sin(e.userData.hit*35)*.045);}else e.scale.setScalar(1);if(d>1.45){const dir=new THREE.Vector3(camera.position.x-e.position.x,0,camera.position.z-e.position.z).normalize();const sp=d<5?.8:1.05;e.position.x+=dir.x*sp*dt;e.position.z+=dir.z*sp*dt;e.rotation.y=Math.atan2(dir.x,dir.z)+Math.PI;}else if(performance.now()-e.userData.lastAttack>1400){e.userData.lastAttack=performance.now();health=Math.max(0,health-9);updateHud();document.querySelector('#hurt-flash').classList.add('hit');setTimeout(()=>document.querySelector('#hurt-flash').classList.remove('hit'),180);tone(78,.2,'sawtooth',.04,-38);if(health===0){health=100;camera.position.set(0,1.72,15);toast('TAKE A BREATHER · HEALTH RESTORED');updateHud();}}}
 }
 renderer.render(scene,camera);}
animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));syncResumeHint();});
