/* ============================================================
   THE PROFESSOR'S DIGITAL TRANSCENDENCE — engine
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ---------- glb decoding (same parser as the walkthrough) ---------- */
function b64ToBuf(b64){
  const bin = atob(b64); const u8 = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i);
  return u8.buffer;
}
function parseGLB(buf){
  const dv = new DataView(buf);
  if(dv.getUint32(0,true)!==0x46546C67) throw new Error("not glb");
  let off=12, json=null, bin=null;
  while(off < buf.byteLength){
    const len=dv.getUint32(off,true), type=dv.getUint32(off+4,true);
    const chunk = buf.slice(off+8, off+8+len);
    if(type===0x4E4F534A) json = JSON.parse(new TextDecoder().decode(chunk));
    else if(type===0x004E4942) bin = chunk;
    off += 8+len;
  }
  return {json, bin};
}
function accessorArray(gltf, bin, idx){
  const acc = gltf.accessors[idx];
  const bv  = gltf.bufferViews[acc.bufferView];
  const byteOff = (bv.byteOffset||0)+(acc.byteOffset||0);
  const nComp = {SCALAR:1, VEC2:2, VEC3:3, VEC4:4}[acc.type];
  const n = acc.count*nComp;
  if(acc.componentType===5126) return new Float32Array(bin, byteOff, n);
  if(acc.componentType===5125) return new Uint32Array(bin, byteOff, n);
  if(acc.componentType===5123) return new Uint16Array(bin, byteOff, n);
  throw new Error("componentType "+acc.componentType);
}

/* ---------- renderer + office scene ---------- */
const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("c"), antialias:true});
const BASE_PR = Math.min(devicePixelRatio,2);
renderer.setPixelRatio(BASE_PR);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;               /* moody but readable */
renderer.shadowMap.enabled = true;                 /* RICH: soft shadows */
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05080b);
const camera = new THREE.PerspectiveCamera(66, 1, 0.04, 60);

/* RICH: cold teal monitor-glow environment — mysterious, with small warm counter-glow */
(function setupEnv(){
  const cv=document.createElement("canvas"); cv.width=512; cv.height=256;
  const g=cv.getContext("2d");
  const grd=g.createLinearGradient(0,0,0,256);
  grd.addColorStop(0.0,"#16323a"); grd.addColorStop(0.5,"#0c1c24"); grd.addColorStop(1.0,"#05090c");
  g.fillStyle=grd; g.fillRect(0,0,512,256);
  let rg=g.createRadialGradient(360,90,8,360,90,170);   /* cold teal monitor glow */
  rg.addColorStop(0,"rgba(90,210,225,0.55)"); rg.addColorStop(1,"rgba(90,210,225,0)");
  g.fillStyle=rg; g.fillRect(0,0,512,256);
  rg=g.createRadialGradient(140,120,6,140,120,120);     /* small warm desk-lamp counter */
  rg.addColorStop(0,"rgba(255,196,120,0.35)"); rg.addColorStop(1,"rgba(255,196,120,0)");
  g.fillStyle=rg; g.fillRect(0,0,512,256);
  const tex=new THREE.CanvasTexture(cv);
  tex.mapping=THREE.EquirectangularReflectionMapping; tex.encoding=THREE.sRGBEncoding;
  const pmrem=new THREE.PMREMGenerator(renderer); pmrem.compileEquirectangularShader();
  const rt=pmrem.fromEquirectangular(tex);
  scene.environment = rt.texture;
  tex.dispose(); pmrem.dispose();
})();

/* RICH: dim cool key + teal rim — light pools, room falls into shadow */
(function setupKey(){
  const key=new THREE.DirectionalLight(0xbfe6ec, 0.42);   /* cool, restrained */
  key.position.set(2.6, 4.4, 1.8); key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);
  const c=key.shadow.camera; c.near=0.5; c.far=24; c.left=-5; c.right=5; c.top=5; c.bottom=-5;
  key.shadow.bias=-0.0004; key.shadow.normalBias=0.02;
  scene.add(key);
  const rim=new THREE.DirectionalLight(0x2ea3b8, 0.3); rim.position.set(-3,3,-2.4); scene.add(rim);
})();

function resize(){
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  if(window.__composer) window.__composer.setSize(innerWidth, innerHeight);
  if(window.__bloom) window.__bloom.setSize(innerWidth, innerHeight);
}
addEventListener("resize", ()=>{ resize(); ScrollTrigger.refresh(); }); resize();

/* RICH: bloom post-processing (guarded — falls back to direct render if libs absent) */
let BLOOM_OK = false;
(function setupBloom(){
  try{
    if(THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass && THREE.ShaderPass && THREE.GammaCorrectionShader){
      const composer = new THREE.EffectComposer(renderer);
      composer.setPixelRatio(BASE_PR);
      composer.setSize(innerWidth, innerHeight);
      composer.addPass(new THREE.RenderPass(scene, camera));
      const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.45, 0.82);
      composer.addPass(bloom);
      /* final gamma pass keeps r128 composer colors correct (no wash-out) */
      const gamma = new THREE.ShaderPass(THREE.GammaCorrectionShader);
      composer.addPass(gamma);
      window.__composer = composer; window.__bloom = bloom; BLOOM_OK = true;
    }
  }catch(e){ BLOOM_OK = false; window.__composer = null; }
})();

scene.add(new THREE.HemisphereLight(0x6fb6c4, 0x0a1418, 0.20));
scene.add(new THREE.AmbientLight(0x16323a, 0.12));
function pt(x,y,z,color,intensity,dist,decay=2){
  const L=new THREE.PointLight(color,intensity,dist,decay); L.position.set(x,y,z); scene.add(L); return L;
}
const lampLight = pt(-2.42,1.35,-1.85, 0xffc890, 1.0, 4.0);   /* warm desk-lamp pool (accent) */
const cabLight  = pt( 2.62,1.35, 0.55, 0x86d6e0, 0.5, 3.2);   /* cooled cabinet glow */
const coreLight = pt(1.92,1.30,-1.20, 0x49d6ff, 1.7, 6.5);    /* teal server core — focal glow */
pt( 2.85,1.80, 0.20, 0x49d6ff, 0.55, 4.0);
pt(-1.30,2.55,-0.20, 0x8fb4c4, 0.4, 5.0);                     /* cooled ceiling fill */
pt( 1.30,2.55, 0.70, 0x8fb4c4, 0.4, 5.0);
const winLight  = pt( 0.62,1.70,-2.20, 0x7fa6d8, 0.45, 3.5);
const flashLight = pt(0.62, 1.8, -2.3, 0xcfe4ff, 0.0, 12.0, 1.6);   /* lightning */
window.LIGHTS = {core:coreLight, lamp:lampLight, cab:cabLight, win:winLight, flash:flashLight};

/* loading progress */
const texCache = {};
let pending = 1, totalWork = 1;
const fill = document.getElementById("fill");
const startBtn = document.getElementById("start");
function tick(){ pending--; fill.style.width = (100*(1-pending/Math.max(totalWork,1)))+"%";
  if(pending<=0){ startBtn.disabled=false; startBtn.textContent="INITIATE INVESTIGATION"; fill.style.width="100%"; } }

/* --- pre-buffer the cinematic intro while textures load --- */
const vid = document.getElementById("cvid");
let vidReady = false, vidURL = null;
(()=>{
  pending++; totalWork++;
  vidURL = window.VID_URL || null;
  if(!vidURL){            /* video asset missing — don't block loading; intro will be skipped */
    vidReady = true; window.__noVideo = true; tick(); return;
  }
  vid.preload = "auto";
  vid.src = vidURL;
  vid.addEventListener("canplaythrough", function onReady(){
    vid.removeEventListener("canplaythrough", onReady);
    vidReady = true; tick();
  }, {once:true});
  /* safety: if canplaythrough never fires (rare), tick after 6s so the button still activates */
  setTimeout(()=>{ if(!vidReady){ vidReady = true; tick(); } }, 6000);
})();

function loadTexture(gltf, bin, texIdx, srgb){
  const key = texIdx+(srgb?"s":"l");
  if(texCache[key]) return texCache[key];
  const img = gltf.images[gltf.textures[texIdx].source];
  const bv = gltf.bufferViews[img.bufferView];
  const bytes = new Uint8Array(bin, bv.byteOffset||0, bv.byteLength);
  const blob = new Blob([bytes], {type: img.mimeType});
  const tex = new THREE.Texture();
  tex.flipY = false; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if(srgb) tex.encoding = THREE.sRGBEncoding;
  pending++; totalWork++;
  const url = URL.createObjectURL(blob);
  const el = new Image();
  el.onload = ()=>{ tex.image = el; tex.needsUpdate = true; URL.revokeObjectURL(url); tick(); };
  el.src = url;
  texCache[key] = tex;
  return tex;
}
function buildMaterial(gltf, bin, mIdx){
  const m = gltf.materials[mIdx] || {};
  const pbr = m.pbrMetallicRoughness || {};
  const bc = pbr.baseColorFactor || [1,1,1,1];
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bc[0], bc[1], bc[2]),
    metalness: pbr.metallicFactor!==undefined ? pbr.metallicFactor : 1,
    roughness: pbr.roughnessFactor!==undefined ? pbr.roughnessFactor : 1,
    flatShading: false,                 /* RICH: smooth shading (we now read NORMAL) */
    side: m.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  });
  mat.envMapIntensity = 1.0;            /* RICH: reflect the IBL environment */
  if(m.emissiveFactor) mat.emissive = new THREE.Color(...m.emissiveFactor);
  if(pbr.baseColorTexture) mat.map = loadTexture(gltf, bin, pbr.baseColorTexture.index, true);
  if(m.emissiveTexture){ mat.emissiveMap = loadTexture(gltf, bin, m.emissiveTexture.index, true);
                         if(!m.emissiveFactor) mat.emissive = new THREE.Color(1,1,1); }
  /* RICH: r128 can't read KHR_materials_emissive_strength — apply it manually so screens/LEDs glow */
  const es = m.extensions && m.extensions.KHR_materials_emissive_strength;
  if(es && es.emissiveStrength!==undefined) mat.emissiveIntensity = es.emissiveStrength;
  if(m.alphaMode==="BLEND"){ mat.transparent = true; mat.opacity = bc[3]; mat.depthWrite = false; }
  return mat;
}
const {json:gltf, bin} = parseGLB(window.GLB_BUF);
const NAMED = [];      /* meshes addressable by node name, for ambient animation */
window.NAMED = NAMED;
const matCache = {};
for(const node of gltf.nodes){
  if(node.mesh===undefined) continue;
  for(const prim of gltf.meshes[node.mesh].primitives){
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(accessorArray(gltf,bin,prim.attributes.POSITION),3));
    if(prim.attributes.NORMAL!==undefined)
      geo.setAttribute("normal", new THREE.BufferAttribute(accessorArray(gltf,bin,prim.attributes.NORMAL),3));
    if(prim.attributes.TEXCOORD_0!==undefined)
      geo.setAttribute("uv", new THREE.BufferAttribute(accessorArray(gltf,bin,prim.attributes.TEXCOORD_0),2));
    if(prim.indices!==undefined) geo.setIndex(new THREE.BufferAttribute(accessorArray(gltf,bin,prim.indices),1));
    if(prim.attributes.NORMAL===undefined) geo.computeVertexNormals();   /* RICH: ensure normals */
    const mk = prim.material??-1;
    if(!matCache[mk]) matCache[mk] = buildMaterial(gltf,bin,mk);
    const mesh = new THREE.Mesh(geo, matCache[mk]);
    mesh.name = node.name || "";
    mesh.castShadow = true; mesh.receiveShadow = true;     /* RICH: shadows */
    if(node.matrix){ mesh.applyMatrix4(new THREE.Matrix4().fromArray(node.matrix)); }
    NAMED.push(mesh);
    scene.add(mesh);
  }
}
tick();

/* dust motes near the machine */
let motes;
(()=>{
  const g = new THREE.BufferGeometry();
  const N = 90, pos = new Float32Array(N*3);
  for(let i=0;i<N;i++){ pos[i*3]=2.0+Math.random(); pos[i*3+1]=0.5+Math.random()*2.1; pos[i*3+2]=-2.2+Math.random()*3.0; }
  g.setAttribute("position", new THREE.BufferAttribute(pos,3));
  motes = new THREE.Points(g, new THREE.PointsMaterial({color:0x9fe9ff,size:0.018,transparent:true,opacity:0.8}));
  motes.userData.base = pos.slice();
  scene.add(motes);
})();

/* ---------- hologram scene (the white beyond) ---------- */
const scene2 = new THREE.Scene();
scene2.background = new THREE.Color(0xfff0e2);   /* warm cream (Dawn Bloom) */
scene2.fog = new THREE.Fog(0xffe6cf, 22, 50);
const cam2 = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
cam2.position.set(0, 1.5, 1.1);
cam2.lookAt(0, 1.25, -2.2);
addEventListener("resize", ()=>{ cam2.aspect = innerWidth/innerHeight; cam2.updateProjectionMatrix(); });
cam2.aspect = innerWidth/innerHeight; cam2.updateProjectionMatrix();
window.cam2_ref = cam2;
scene2.add(new THREE.HemisphereLight(0xffffff, 0xffe6d2, 1.0));

/* Dawn Bloom gradient sky dome — toneMapped off so it stays bright */
(function skyDome(){
  const geo = new THREE.SphereGeometry(80, 32, 18);
  const mat = new THREE.ShaderMaterial({
    side:THREE.BackSide, depthWrite:false, fog:false, toneMapped:false,
    uniforms:{
      uTop:{value:new THREE.Color(0xc4d4ff)},   /* soft morning blue */
      uMid:{value:new THREE.Color(0xffc6a0)},   /* warm peach/coral */
      uBot:{value:new THREE.Color(0xfff0e2)},   /* warm cream near horizon */
    },
    vertexShader:`varying float vY; void main(){ vY=normalize(position).y;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader:`varying float vY; uniform vec3 uTop,uMid,uBot;
      void main(){ float h=clamp(vY*0.5+0.5,0.0,1.0);
        vec3 c = h<0.5 ? mix(uBot,uMid,h*2.0) : mix(uMid,uTop,(h-0.5)*2.0);
        gl_FragColor=vec4(c,1.0);} `,
  });
  scene2.add(new THREE.Mesh(geo,mat));
})();

/* soft floor disc */
(()=>{
  const cv = document.createElement("canvas"); cv.width=cv.height=256;
  const g = cv.getContext("2d");
  const rg = g.createRadialGradient(128,128,10,128,128,128);
  rg.addColorStop(0,"rgba(150,175,195,.14)"); rg.addColorStop(1,"rgba(150,175,195,0)");
  g.fillStyle=rg; g.fillRect(0,0,256,256);
  const tx = new THREE.CanvasTexture(cv);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(5,5),
    new THREE.MeshBasicMaterial({map:tx, transparent:true, depthWrite:false}));
  m.rotation.x = -Math.PI/2; m.position.set(0,0.001,-2.2);
  m.visible = false;
  scene2.add(m);
})();

/* the digital twin */
const holo = new THREE.Group();
const HOLO_C = 0x18b6dc;
function wire(geo){
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color:HOLO_C, wireframe:true, transparent:true, opacity:0.34}));
}
const head = wire(new THREE.SphereGeometry(0.165, 18, 14)); head.position.y = 1.62;
const neck = wire(new THREE.CylinderGeometry(0.05,0.06,0.1,10,2,true)); neck.position.y = 1.46;
const torso = wire(new THREE.CylinderGeometry(0.21,0.295,0.66,16,7,true)); torso.position.y = 1.06;
const shoulderL = wire(new THREE.SphereGeometry(0.07,10,8)); shoulderL.position.set(-0.255,1.36,0);
const shoulderR = wire(new THREE.SphereGeometry(0.07,10,8)); shoulderR.position.set( 0.255,1.36,0);
holo.add(head, neck, torso, shoulderL, shoulderR);

/* particle shell sampled over head+torso */
(()=>{
  const N = 1500, pos = new Float32Array(N*3);
  for(let i=0;i<N;i++){
    let x,y,z;
    if(Math.random()<0.38){ /* head */
      const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), r=0.165+Math.random()*0.012;
      x=r*Math.sin(ph)*Math.cos(th); y=1.62+r*Math.cos(ph); z=r*Math.sin(ph)*Math.sin(th);
    }else{ /* torso */
      const th=Math.random()*Math.PI*2, t=Math.random();
      const r=(0.21+(0.295-0.21)*t)+Math.random()*0.012;
      x=r*Math.cos(th); y=1.39-0.66*t; z=r*Math.sin(th);
    }
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos,3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({
    color:HOLO_C, size:0.011, transparent:true, opacity:0.75, depthWrite:false}));
  holo.add(p);
})();
/* base rings + rising scan plane */
const baseRing = wire(new THREE.TorusGeometry(0.45, 0.008, 8, 60));
baseRing.rotation.x = Math.PI/2; baseRing.position.y = 0.02; baseRing.material.opacity = 0.6;
const pulseRing = wire(new THREE.TorusGeometry(0.45, 0.005, 8, 60));
pulseRing.rotation.x = Math.PI/2; pulseRing.position.y = 0.02;
const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.016),
  new THREE.MeshBasicMaterial({color:HOLO_C, transparent:true, opacity:0.5, depthWrite:false, side:THREE.DoubleSide}));
holo.add(baseRing, pulseRing, scanPlane);
holo.position.set(0, 0, -2.2);
scene2.add(holo);

/* --- abstract digital dust face — looming behind the hologram --- */
const dustFace = new THREE.Group();
(()=>{
  const N = 3200;
  const pos = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const alphas = new Float32Array(N);
  let idx = 0;

  function addPt(x, y, z, s, a){
    if(idx >= N) return;
    pos[idx*3] = x; pos[idx*3+1] = y; pos[idx*3+2] = z;
    sizes[idx] = s; alphas[idx] = a; idx++;
  }

  /* head sphere — main mass */
  for(let i = 0; i < 1800; i++){
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    /* elongated vertically (1.0 x, 1.25 y, 0.9 z) for a face shape */
    const r = 1.0 + (Math.random() - 0.5) * 0.15;
    const x = r * Math.sin(ph) * Math.cos(th) * 1.0;
    const y = r * Math.cos(ph) * 1.25 + 0.1;
    const z = r * Math.sin(ph) * Math.sin(th) * 0.9;
    /* concentrate more particles on the front face (z > 0) */
    if(z < -0.3 && Math.random() < 0.5) continue;
    addPt(x, y, z, 0.022 + Math.random() * 0.026, 0.5 + Math.random() * 0.35);
  }

  /* eye sockets — two denser clusters */
  for(const sx of [-0.35, 0.35]){
    for(let i = 0; i < 120; i++){
      const a = Math.random() * Math.PI * 2, r = Math.random() * 0.18;
      addPt(sx + Math.cos(a) * r, 0.28 + Math.sin(a) * r * 0.7, 0.82 + Math.random() * 0.1,
            0.018 + Math.random() * 0.016, 0.75 + Math.random() * 0.25);
    }
  }

  /* nose ridge */
  for(let i = 0; i < 80; i++){
    const t = Math.random();
    addPt((Math.random() - 0.5) * 0.08, -0.05 + t * 0.45, 0.92 + Math.sin(t * Math.PI) * 0.12,
          0.02 + Math.random() * 0.014, 0.6 + Math.random() * 0.3);
  }

  /* mouth line */
  for(let i = 0; i < 70; i++){
    const t = (Math.random() - 0.5) * 0.4;
    addPt(t, -0.35 + Math.sin(Math.abs(t) * 5) * 0.03, 0.85 + Math.random() * 0.06,
          0.017 + Math.random() * 0.012, 0.6 + Math.random() * 0.3);
  }

  /* jawline */
  for(let i = 0; i < 100; i++){
    const a = (Math.random() - 0.5) * Math.PI * 0.8;
    const r = 0.85 + Math.random() * 0.1;
    addPt(Math.sin(a) * r, -0.65 - Math.cos(a) * 0.25, Math.cos(a) * r * 0.5 + 0.3,
          0.022 + Math.random() * 0.016, 0.42 + Math.random() * 0.3);
  }

  /* dissolving particles drifting outward */
  for(let i = 0; i < 250; i++){
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = 1.3 + Math.random() * 1.2;
    addPt(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 1.1 + 0.1, r * Math.sin(ph) * Math.sin(th) * 0.8,
          0.012 + Math.random() * 0.022, 0.14 + Math.random() * 0.2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos.slice(0, idx * 3), 3));

  /* custom shader — iridescent cool hues, normal blending for the bright sky */
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    uniforms: {
      uTime: {value: 0},
    },
    vertexShader: `
      attribute float aSize;
      attribute float aAlpha;
      varying float vAlpha;
      varying float vHue;
      uniform float uTime;
      void main(){
        vec3 p = position;
        /* gentle drift animation */
        p.x += sin(uTime * 0.3 + position.y * 2.0) * 0.05;
        p.y += sin(uTime * 0.2 + position.x * 3.0) * 0.04;
        p.z += cos(uTime * 0.25 + position.y * 1.5) * 0.04;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * 1150.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
        vAlpha = aAlpha;
        /* hue varies across the face + slowly cycles */
        vHue = position.y * 0.10 + length(position.xz) * 0.06;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying float vAlpha;
      varying float vHue;
      vec3 hsv2rgb(vec3 c){
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if(d > 1.0) discard;
        float a = (1.0 - d * d) * vAlpha;
        /* warm band: pink -> red -> orange -> gold */
        float hue = fract(0.97 + 0.17 * fract(vHue + uTime * 0.04));
        vec3 c = hsv2rgb(vec3(hue, 0.55, 0.98));
        gl_FragColor = vec4(c, a);
      }
    `,
  });

  /* attach per-particle attributes */
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes.slice(0, idx), 1));
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(alphas.slice(0, idx), 1));

  const points = new THREE.Points(geo, mat);
  dustFace.add(points);
  dustFace.userData.mat = mat;
})();
dustFace.position.set(0, 1.55, -3.05);
dustFace.scale.setScalar(1.05);
scene2.add(dustFace);
window.__dustFace = dustFace;

/* ============================================================
   AURORA DATASTREAM — bright, cheerful digital world for the
   final reveal: flowing aurora ribbons, a color-pulsing grid
   floor, and floating luminous orbs rising upward.
   ============================================================ */
(function buildAurora(){
  const updaters = [];

  /* ---- aurora ribbons (flowing curtains of light) ---- */
  function makeRibbon(colA, colB, y, z, rotZ, speed, amp, alpha){
    const geo = new THREE.PlaneGeometry(18, 5.5, 90, 1);
    const mat = new THREE.ShaderMaterial({
      transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.NormalBlending,
      uniforms:{ uTime:{value:0}, uA:{value:new THREE.Color(colA)}, uB:{value:new THREE.Color(colB)},
                 uSpeed:{value:speed}, uAmp:{value:amp}, uAlpha:{value:alpha} },
      vertexShader:`
        uniform float uTime, uSpeed, uAmp;
        varying vec2 vUv; varying float vW;
        void main(){
          vUv = uv;
          vec3 p = position;
          float w = sin(p.x*0.55 + uTime*uSpeed)*0.6
                  + sin(p.x*1.20 - uTime*uSpeed*0.7)*0.3
                  + sin(p.x*0.22 + uTime*uSpeed*0.4)*0.9;
          p.z += w*uAmp;
          p.y += sin(p.x*0.5 + uTime*uSpeed*0.5)*0.25;
          vW = w;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        }`,
      fragmentShader:`
        uniform vec3 uA, uB; uniform float uTime, uAlpha;
        varying vec2 vUv; varying float vW;
        void main(){
          float vfade = smoothstep(0.0,0.4,vUv.y) * (1.0 - smoothstep(0.55,1.0,vUv.y));
          float shimmer = 0.6 + 0.4*sin(vUv.x*14.0 + uTime*1.6 + vW*3.0);
          vec3 c = mix(uA, uB, clamp(vUv.y + 0.2*sin(uTime*0.3), 0.0, 1.0));
          gl_FragColor = vec4(c, vfade*shimmer*uAlpha);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, y, z); mesh.rotation.z = rotZ;
    scene2.add(mesh);
    updaters.push(tt => mat.uniforms.uTime.value = tt);
  }
  makeRibbon(0xffd36e, 0xffac4d, 3.6, -10.5,  0.06, 0.55, 1.1, 0.42); /* gold→amber */
  makeRibbon(0xff9e7d, 0xff7eb0, 4.3, -12.0, -0.05, 0.42, 1.4, 0.38); /* coral→pink */
  makeRibbon(0xc9a8ff, 0x9db8ff, 5.0, -13.5,  0.03, 0.34, 1.2, 0.34); /* lilac→soft blue */

  /* ---- color-pulsing grid floor (data horizon) ---- */
  (function(){
    const geo = new THREE.PlaneGeometry(46, 46, 1, 1);
    const mat = new THREE.ShaderMaterial({
      transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.NormalBlending,
      uniforms:{ uTime:{value:0} },
      vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`
        varying vec2 vUv; uniform float uTime;
        vec3 hsv2rgb(vec3 c){
          vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        void main(){
          vec2 uv = vUv*2.0 - 1.0;
          vec2 g = vUv * 22.0;
          g.y += uTime * 0.7;                 /* flow toward viewer */
          vec2 f = abs(fract(g) - 0.5);
          float line = min(f.x, f.y);
          float grid = 1.0 - smoothstep(0.0, 0.045, line);
          float dist = length(uv);
          float fade = smoothstep(1.15, 0.15, dist);
          vec3 col = hsv2rgb(vec3(0.04 + 0.12*fract(uTime*0.05 + vUv.y*0.7 + vUv.x*0.2), 0.6, 1.0));
          gl_FragColor = vec4(col, grid*fade*0.6);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI/2; mesh.position.set(0, 0.0, -8);
    scene2.add(mesh);
    updaters.push(tt => mat.uniforms.uTime.value = tt);
  })();

  /* ---- floating luminous orbs rising upward ---- */
  (function(){
    const N = 220;
    const pos = new Float32Array(N*3), hue = new Float32Array(N),
          siz = new Float32Array(N), spd = new Float32Array(N);
    for(let i=0;i<N;i++){
      pos[i*3]   = (Math.random()-0.5)*13;
      pos[i*3+1] = Math.random()*7.5;
      pos[i*3+2] = -1 - Math.random()*11;
      hue[i] = (0.95 + Math.random()*0.2) % 1;   /* warm band: pink→red→orange→gold */
      siz[i] = 0.04 + Math.random()*0.09;
      spd[i] = 0.18 + Math.random()*0.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos,3));
    geo.setAttribute("aHue", new THREE.BufferAttribute(hue,1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(siz,1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(spd,1));
    const mat = new THREE.ShaderMaterial({
      transparent:true, depthWrite:false, blending:THREE.NormalBlending,
      uniforms:{ uTime:{value:0} },
      vertexShader:`
        attribute float aHue; attribute float aSize; attribute float aSpeed;
        varying float vHue;
        uniform float uTime;
        void main(){
          vHue = aHue;
          vec3 p = position;
          p.y = mod(position.y + uTime*aSpeed, 7.6);   /* rise + wrap */
          p.x += sin(uTime*0.4 + position.z*1.5)*0.15; /* gentle sway */
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          gl_PointSize = aSize * 620.0 / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader:`
        varying float vHue; uniform float uTime;
        vec3 hsv2rgb(vec3 c){
          vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        void main(){
          float d = length(gl_PointCoord - 0.5)*2.0;
          if(d > 1.0) discard;
          float a = pow(1.0 - d, 1.6);
          vec3 col = hsv2rgb(vec3(vHue, 0.5, 1.0));
          /* bright core */
          col = mix(col, vec3(1.0), (1.0-d)*0.4);
          gl_FragColor = vec4(col, a*0.85);
        }`,
    });
    const pts = new THREE.Points(geo, mat);
    scene2.add(pts);
    updaters.push(tt => mat.uniforms.uTime.value = tt);
  })();

  window.__AURORA = { update(tt){ for(const u of updaters) u(tt); } };
})();

/* ---------- camera path (office) ---------- */
const V = (x,y,z)=>new THREE.Vector3(x,y,z);
const KEYS = [
  {p:0.00, pos:V( 1.45,1.62, 2.05), look:V(-1.2,1.10,-1.4)},
  {p:0.06, pos:V( 0.55,1.55, 1.10), look:V(-1.5,1.00,-1.6)},
  {p:0.115,pos:V(-0.72,1.42,-0.30), look:V(-1.6,0.85,-1.75)},
  {p:0.215,pos:V(-0.72,1.42,-0.30), look:V(-1.6,0.85,-1.75)},   /* hold: desk */
  {p:0.265,pos:V(-0.60,1.90,-1.55), look:V(-3.2,1.95,-1.55)},
  {p:0.355,pos:V(-0.60,1.90,-1.55), look:V(-3.2,1.95,-1.55)},   /* hold: evidence wall */
  {p:0.415,pos:V(-1.40,1.42, 0.80), look:V(-2.45,0.98, 2.30)},
  {p:0.515,pos:V(-1.52,1.40, 1.05), look:V(-2.45,1.02, 2.30)},  /* hold: fabrication bay */
  {p:0.575,pos:V( 0.55,1.50, 0.85), look:V( 3.05,1.30, 1.75)},
  {p:0.645,pos:V( 1.60,1.45, 1.70), look:V( 3.05,1.30, 1.75)},  /* slow dolly: shelf */
  {p:0.70, pos:V( 0.25,1.50, 0.10), look:V( 1.92,1.25,-1.85)},
  {p:0.785,pos:V( 0.95,1.40,-0.70), look:V( 1.92,1.20,-1.85)},  /* hold: server */
  {p:0.875,pos:V( 1.55,1.28,-1.35), look:V( 1.92,1.15,-1.85)},
  {p:0.965,pos:V( 1.82,1.20,-1.64), look:V( 1.92,1.15,-1.85)},
  {p:1.00, pos:V( 1.88,1.18,-1.74), look:V( 1.92,1.15,-1.85)},
];
const ss = t => t*t*(3-2*t); /* smoothstep */
const tmpPos = new THREE.Vector3(), tmpLook = new THREE.Vector3();
const _UP = new THREE.Vector3(0,1,0);
let peekYaw = 0, peekTarget = 0;            /* horizontal "look around" offset (radians) */
const PEEK_MAX = 0.40;                       /* ~23° each way */
function camAt(p){
  p = Math.min(Math.max(p,0),1);
  let i=0; while(i<KEYS.length-2 && p>KEYS[i+1].p) i++;
  const a=KEYS[i], b=KEYS[i+1];
  const t = b.p===a.p ? 0 : ss((p-a.p)/(b.p-a.p));
  tmpPos.lerpVectors(a.pos, b.pos, t);
  tmpLook.lerpVectors(a.look, b.look, t);
  camera.position.copy(tmpPos);
  camera.lookAt(tmpLook);
  if(peekYaw) camera.rotateOnWorldAxis(_UP, peekYaw);
}

/* ---------- peek controls (mobile): swipe or tap chevrons to look L/R ---------- */
(function setupPeek(){
  const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if(!IS_TOUCH) return;
  const stageEl = document.getElementById("stage") || document.body;

  /* chevrons */
  const mkChevron = (side)=>{
    const c = document.createElement("button");
    c.className = "peek-chevron";
    c.textContent = side === "left" ? "‹" : "›";
    c.style.cssText =
      "position:fixed;top:50%;"+(side==="left"?"left:6px;":"right:6px;")+
      "transform:translateY(-50%);z-index:40;width:46px;height:74px;"+
      "background:rgba(8,12,18,.34);border:1px solid rgba(70,226,255,.45);"+
      "color:rgba(180,230,245,.85);font:300 34px/1 'Courier New',monospace;"+
      "border-radius:10px;display:none;align-items:center;justify-content:center;"+
      "backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);"+
      "touch-action:none;user-select:none;-webkit-user-select:none;padding:0;";
    let held = 0;
    const press = (dir)=>{ held = dir; };
    const release = ()=>{ held = 0; };
    c.addEventListener("touchstart",(e)=>{ e.preventDefault(); press(side==="left"?1:-1); },{passive:false});
    c.addEventListener("touchend",(e)=>{ e.preventDefault(); release(); },{passive:false});
    c.addEventListener("touchcancel",release);
    c._tick = ()=>{ if(held) peekTarget = Math.max(-PEEK_MAX, Math.min(PEEK_MAX, peekTarget + held*0.012)); };
    document.body.appendChild(c);
    return c;
  };
  const chevL = mkChevron("left"), chevR = mkChevron("right");

  /* horizontal swipe on the scene */
  let tx=0, ty=0, tracking=false, horiz=false, startPeek=0;
  stageEl.addEventListener("touchstart",(e)=>{
    if(window.WALK && WALK.active) return;
    if(e.touches.length!==1) return;
    tx=e.touches[0].clientX; ty=e.touches[0].clientY;
    tracking=true; horiz=false; startPeek=peekTarget;
  },{passive:true});
  stageEl.addEventListener("touchmove",(e)=>{
    if(!tracking || (window.WALK && WALK.active)) return;
    const dx=e.touches[0].clientX-tx, dy=e.touches[0].clientY-ty;
    if(!horiz && Math.abs(dx) > Math.abs(dy)+6) horiz=true;   /* lock to horizontal intent */
    if(horiz){
      e.preventDefault();   /* stop vertical scroll hijack */
      peekTarget = Math.max(-PEEK_MAX, Math.min(PEEK_MAX, startPeek + dx*0.0016));
    }
  },{passive:false});
  const endTouch = ()=>{ tracking=false; };
  stageEl.addEventListener("touchend", endTouch);
  stageEl.addEventListener("touchcancel", endTouch);

  /* expose hooks for the frame loop */
  window.__PEEK = {
    tick(p, prevP){
      chevL._tick(); chevR._tick();
      /* recenter while actively scrolling between chapters */
      if(Math.abs(p - prevP) > 0.0015) peekTarget *= 0.86;
      peekYaw += (peekTarget - peekYaw) * 0.15;
      const show = !(window.WALK && WALK.active) && p <= 0.93;
      const disp = show ? "flex" : "none";
      if(chevL.style.display!==disp){ chevL.style.display=disp; chevR.style.display=disp; }
      if(!show){ peekTarget = 0; peekYaw = 0; }
    }
  };
})();

/* ---------- hotspots ---------- */
const HOTS = [
  {id:"laptop",  at:V(-1.02,0.95,-1.52), r:[0.095,0.225], tag:"THE TERMINAL"},
  {id:"lifi",    at:V(-1.95,0.88,-1.42), r:[0.095,0.225], tag:"THE PROTOTYPE"},
  {id:"bench",   at:V(-2.45,1.05,-1.95), r:[0.095,0.225], tag:"FIELD HARDWARE"},
  {id:"notes",   at:V(-0.50,0.82,-1.40), r:[0.095,0.225], tag:"LECTURE NOTES"},
  {id:"vr",      at:V(-0.62,0.90,-1.72), r:[0.095,0.225], tag:"VR HEADSET"},
  {id:"patents", at:V(-3.13,1.68,-2.30), r:[0.245,0.37], tag:"PATENTS ×6"},
  {id:"awards",  at:V(-3.13,1.77,-1.50), r:[0.245,0.37], tag:"COMMENDATIONS"},
  {id:"creds",   at:V(-3.13,2.30,-1.55), r:[0.245,0.37], tag:"CREDENTIALS"},
  {id:"printer3d",at:V(-2.78,1.30, 2.28), r:[0.395,0.535], tag:"3D PRINTER"},
  {id:"humanoid",at:V(-2.33,1.22, 2.30), r:[0.395,0.535], tag:"HUMANOID UNIT"},
  {id:"arm",     at:V(-1.98,1.30, 2.26), r:[0.395,0.535], tag:"ROBOTIC ARM"},
  {id:"testbed", at:V(-1.70,1.32, 2.30), r:[0.395,0.535], tag:"IoT TESTBED"},
  {id:"drone",   at:V(-2.25,2.02, 1.42), r:[0.395,0.535], tag:"THE DRONE"},
  {id:"hobbies", at:V(-2.95,1.10, 1.55), r:[0.375,0.535], tag:"AFTER HOURS"},
  {id:"journals",at:V(2.92,1.62, 1.45), r:[0.555,0.66], tag:"JOURNALS ×7"},
  {id:"chapters",at:V(2.92,1.22, 1.78), r:[0.555,0.66], tag:"CHAPTERS ×8"},
  {id:"confs",   at:V(2.92,0.82, 2.05), r:[0.555,0.66], tag:"CONFERENCES ×32"},
  {id:"scanner", at:V(0.42,1.20,-1.98), r:[0.665,0.78], tag:"LASER SCANNER"},
  {id:"server",  at:V(1.92,1.45,-1.50), r:[0.675,0.80], tag:"THE MACHINE"},
];
const markEls = {};
for(const h of HOTS){
  const d = document.createElement("div");
  d.className = "mark";
  d.innerHTML = `<span class="halo"></span><span class="ring"></span><span class="core"></span><span class="tag">${h.tag}</span>`;
  d.addEventListener("click", ()=>openDossier(h.id));
  document.body.appendChild(d);
  markEls[h.id] = d;
}
const proj = new THREE.Vector3();
let hintedEl = null;
function placeMarks(p){
  const walking = window.WALK && WALK.active;
  const inReveal = !walking && p > 0.93;
  let best=null, bestD=1e9;
  for(const h of HOTS){
    const el = markEls[h.id];
    if(inReveal || (!walking && (p < h.r[0] || p > h.r[1]))){ el.style.display="none"; continue; }
    proj.copy(h.at).project(camera);
    if(proj.z > 1){ el.style.display="none"; continue; }
    el.style.display="block";
    const lx = (proj.x*0.5+0.5)*innerWidth, ly = (-proj.y*0.5+0.5)*innerHeight;
    el.style.left = lx+"px";
    el.style.top  = ly+"px";
    if(!window.__firstClickDone){
      const dx=lx-innerWidth/2, dy=ly-innerHeight/2, dd=dx*dx+dy*dy;
      if(dd<bestD){ bestD=dd; best=el; }
    }
  }
  /* emphasize the most central marker as the obvious first tap, until they click one */
  if(best !== hintedEl){
    if(hintedEl) hintedEl.classList.remove("hintme");
    if(best && !window.__firstClickDone) best.classList.add("hintme");
    hintedEl = best;
  }
  if(window.__firstClickDone && hintedEl){ hintedEl.classList.remove("hintme"); hintedEl=null; }
}

/* ---------- onboarding: one-time coach + persistent hint ---------- */
(function onboarding(){
  let coachShown = false;
  const coach = document.getElementById("coach");
  const hintEl = document.getElementById("hint");
  function dismissCoach(){ if(coach) coach.classList.remove("on"); }
  window.armOnboarding = function(){
    if(hintEl) gsap.to(hintEl, {opacity:1, duration:.6, delay:.5});   /* hint persists */
    if(!coachShown){
      coachShown = true;
      setTimeout(()=>{ if(!window.__firstClickDone) coach && coach.classList.add("on"); }, 1000);
    }
  };
  window.retireOnboarding = function(){
    window.__firstClickDone = true;
    dismissCoach();
    if(hintEl) gsap.to(hintEl, {opacity:0, duration:.4});
  };
  const go = document.getElementById("coach-go");
  const skip = document.getElementById("coach-skip");
  if(go) go.addEventListener("click", dismissCoach);
  if(skip) skip.addEventListener("click", ()=>{
    dismissCoach();
    const r = document.getElementById("resume-top") || document.getElementById("resume-open");
    if(r) r.click();
  });
  addEventListener("scroll", dismissCoach, {once:true});   /* scrolling shows they've understood "scroll" */
})();
const shade = document.getElementById("shade"), modal = document.getElementById("modal");
const mtitle = document.getElementById("mtitle"), mbody = document.getElementById("mbody");
const mkEl = document.querySelector("#mhead .mk");
function openDossier(id){
  const d = DATA[id]; if(!d) return;
  if(window.retireOnboarding) window.retireOnboarding();   /* first interaction: dismiss coach + hint */
  mkEl.textContent = d.k; mtitle.textContent = d.t; mbody.innerHTML = d.h;
  mbody.scrollTop = 0;
  shade.style.display="block"; modal.style.display="block";
  if(window.AUDIO) AUDIO.ui();
  gsap.fromTo(modal,{opacity:0,scale:.94},{opacity:1,scale:1,duration:.28,ease:"power2.out"});
  gsap.fromTo(shade,{opacity:0},{opacity:1,duration:.25});
}
function closeDossier(){
  gsap.to(modal,{opacity:0,scale:.96,duration:.18,onComplete:()=>modal.style.display="none"});
  gsap.to(shade,{opacity:0,duration:.18,onComplete:()=>shade.style.display="none"});
}
document.getElementById("mx").addEventListener("click", closeDossier);
shade.addEventListener("click", closeDossier);
addEventListener("keydown", e=>{ if(e.key==="Escape") closeDossier(); });

/* ---------- captions per chapter ---------- */
const cap = document.getElementById("cap");
const capK = cap.querySelector(".k"), capT = cap.querySelector(".t"), capS = cap.querySelector(".s");
const CHAPTERS = [
  {r:[0.005,0.10], k:"SCENE 01", t:"THE OFFICE",
   s:"Door unlocked. Lamp on. Rain on the glass. He left in a hurry — or he didn't leave at all."},
  {r:[0.11,0.235], k:"SCENE 02 · EVIDENCE A", t:"THE WORKBENCH",
   s:"Hardware still warm. Examine the laptop, the Li-Fi rig, the field prototypes, the VR headset."},
  {r:[0.245,0.375], k:"SCENE 03 · EVIDENCE B", t:"THE EVIDENCE WALL",
   s:"Six patents. Best-paper commendations. Three degrees. The wall remembers what he built."},
  {r:[0.39,0.545], k:"SCENE 04 · EVIDENCE C", t:"THE FABRICATION BAY",
   s:"A printer mid-job. A drone holding position. Machines he built — still waiting for orders."},
  {r:[0.555,0.665], k:"SCENE 05 · EVIDENCE D", t:"THE ARCHIVE",
   s:"47 publications shelved like case files — pull a book to open the record."},
  {r:[0.675,0.80],  k:"SCENE 06 · EVIDENCE E", t:"THE MACHINE",
   s:"PROJECT TRANSCENDENCE. Fans accelerating. The logs end here. The data doesn't."},
  {r:[0.81,0.93],   k:"FINAL SCENE", t:"SIGNAL DEGRADING",
   s:"The room can't hold him. Keep going."},
];
let curChap = -1;
function updateCaption(p){
  let idx = -1;
  for(let i=0;i<CHAPTERS.length;i++) if(p>=CHAPTERS[i].r[0] && p<=CHAPTERS[i].r[1]) idx=i;
  if(idx===curChap) return;
  curChap = idx;
  if(idx<0){ gsap.to(cap,{opacity:0,duration:.3}); return; }
  const c = CHAPTERS[idx];
  gsap.timeline()
    .to(cap,{opacity:0,duration:.16})
    .add(()=>{ capK.textContent=c.k; capT.textContent=c.t; capS.textContent=c.s; })
    .to(cap,{opacity:1,y:0,duration:.4,ease:"power2.out"});
}

/* ---------- glitch + transition ---------- */
const scan = document.getElementById("scan"), tear = document.getElementById("tear");
const white = document.getElementById("white"), siglost = document.getElementById("siglost");
const stage = document.getElementById("stage"), canvasEl = renderer.domElement;
const reveal = document.getElementById("reveal");
const vignetteEl = document.getElementById("vignette"), grainEl = document.getElementById("grain");
let lastPR = BASE_PR, revealOn = false, typeStarted = false;

const clampN = (v,a,b)=>Math.min(Math.max(v,a),b);
const sstep = (a,b,v)=>ss(clampN((v-a)/(b-a),0,1));

function applyFx(p, t){
  const past = p > 0.955;                 /* in the bright beyond — no glitch, no tint */
  const glitch = past ? 0 : sstep(0.78, 0.945, p);
  /* pixelation = the world voxelising */
  const targetPR = BASE_PR*(1-0.88*glitch)+0.02;
  if(Math.abs(targetPR-lastPR) > 0.06){ renderer.setPixelRatio(targetPR); lastPR = targetPR; }
  canvasEl.style.imageRendering = glitch>0.25 ? "pixelated" : "auto";
  /* scanlines + chroma jitter */
  scan.style.opacity = glitch*0.85;
  if(glitch>0.04){
    const j = glitch*glitch;
    const jx = (Math.random()-0.5)*22*j, jy=(Math.random()-0.5)*8*j;
    stage.style.transform = `translate(${jx}px,${jy}px)`;
    canvasEl.style.filter = `saturate(${1+1.6*j}) hue-rotate(${(Math.random()-0.5)*40*j}deg) contrast(${1+0.35*j})`;
    tear.style.opacity = (Math.random()<0.10*j) ? 0.18 : 0;
    const sl = Math.random()*100;
    tear.style.clipPath = `polygon(0 ${sl}%,100% ${sl}%,100% ${sl+2+8*j}%,0 ${sl+2+8*j}%)`;
  }else{
    stage.style.transform=""; canvasEl.style.filter=""; tear.style.opacity=0;
  }
  /* server light surges */
  coreLight.intensity = 1.5 + glitch*5.5 + Math.sin(t*14)*glitch*1.6;
  renderer.toneMappingExposure = 1.12 + glitch*0.55;
  /* lift the dark vignette + grain once we cross into the bright beyond */
  const tint = clampN(1 - sstep(0.93, 0.965, p), 0, 1);
  if(vignetteEl) vignetteEl.style.opacity = tint;
  if(grainEl) grainEl.style.opacity = tint*0.5;
  /* white crossfade: rises into the cut at p=0.955, falls after */
  const wUp = sstep(0.90, 0.955, p), wDn = 1 - sstep(0.958, 0.992, p);
  white.style.opacity = Math.min(wUp, wDn);
  siglost.style.opacity = clampN(Math.min(wUp,wDn)*1.2-0.15,0,1);
  /* reveal overlay */
  const want = p > 0.975;
  if(want!==revealOn){
    revealOn = want;
    if(want){
      reveal.style.display="flex"; reveal.classList.add("on");
      gsap.fromTo(reveal,{opacity:0},{opacity:1,duration:.7,ease:"power2.out"});
      document.getElementById("rec").style.opacity=0;
      if(!typeStarted){ typeStarted=true; typeLine(); }
    }else{
      reveal.classList.remove("on");
      gsap.to(reveal,{opacity:0,duration:.3,onComplete:()=>{ if(!revealOn) reveal.style.display="none"; }});
      document.getElementById("rec").style.opacity=0.9;
    }
  }
}

/* hologram greeting, typed */
const LINE = "I have transcended the physical, but my data remains. How can I assist your team?";
const rvText = document.getElementById("rv-text");
function typeLine(){
  let i=0; rvText.textContent="";
  const iv = setInterval(()=>{
    rvText.textContent = LINE.slice(0,++i);
    if(window.AUDIO && i%3===0) AUDIO.blip();
    if(i>=LINE.length) clearInterval(iv);
  }, 26);
}

/* ---------- final menu actions ---------- */
document.getElementById("b-cv").addEventListener("click", ()=>{
  const bytes = new Uint8Array(window.PDF_BUF);
  const url = URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
  const a = document.createElement("a");
  a.href = url; a.download = "Dr_Sanket_Salvi_CV.pdf"; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
});
document.getElementById("b-meet").addEventListener("click", ()=>{
  location.href = "mailto:sanketsalvi.salvi@gmail.com?subject=Consultation%20Request%20%E2%80%94%20via%20The%20Professor%27s%20Digital%20Transcendence&body=Hello%20Dr.%20Salvi%2C%0A%0AWe%20reviewed%20your%20case%20file%20and%20would%20like%20to%20schedule%20a%20consultation.%0A%0A";
});
document.getElementById("b-proj").addEventListener("click", ()=>{
  const el = document.getElementById("rv-links");
  el.style.display = el.style.display==="flex" ? "none" : "flex";
});
document.getElementById("rv-back").addEventListener("click", ()=>{
  gsap.to(window, {scrollTo:0, duration:0}); /* fallback below if plugin absent */
  window.scrollTo({top:0, behavior:"smooth"});
});

/* ---------- scroll drive ---------- */
const drive = {p:0};
function startScroll(){
  gsap.to(drive, {
    p:1, ease:"none",
    scrollTrigger:{ trigger:"#spacer", start:"top top", end:"bottom bottom", scrub:0.85 }
  });
  ScrollTrigger.refresh();
}

/* ---------- landing ---------- */
const intro = document.getElementById("intro");
startBtn.addEventListener("click", ()=>{
  const cinema  = document.getElementById("cinema");
  const barTop  = document.getElementById("cbar-top");
  const barBot  = document.getElementById("cbar-bot");

  /* --- phase 0: hide landing, show cinema layer --- */
  gsap.to(intro,{opacity:0,duration:.5,ease:"power2.inOut",onComplete:()=>intro.style.display="none"});

  /* compute letterbox bar height so video sits at 16:9 in the viewport */
  const vidAR = 16/9;
  function barH(){
    const vpAR = innerWidth/innerHeight;
    if(vpAR <= vidAR) return Math.max(0, (innerHeight - innerWidth/vidAR)/2);
    return 0;
  }
  const bh = barH();
  barTop.style.height = bh+"px";
  barBot.style.height = bh+"px";

  /* --- phase 1: play the pre-buffered cinematic --- */
  if(window.__noVideo){                 /* no video asset → go straight to the live scene */
    renderPaused = false;
    if(window.AUDIO) AUDIO.start();
    skipCinema();
    return;
  }
  renderPaused = true;                  /* free GPU for smooth video decode */
  cinema.classList.add("on");
  const skipBtn = document.getElementById("skipintro");
  if(skipBtn){ skipBtn.classList.add("on"); skipBtn.onclick = skipCinema; }   /* skipCinema is hoisted */
  vid.currentTime = 0;
  vid.volume = 1;
  vid.play().catch(()=>{});

  /* fade video audio out near the end, crossfade into ambient */
  vid.addEventListener("timeupdate", function onTU(){
    if(vid.duration && vid.currentTime > vid.duration - 1.8){
      gsap.to(vid, {volume:0, duration:1.6, ease:"power2.in"});
      vid.removeEventListener("timeupdate", onTU);
    }
  });

  /* --- phase 2: video ends → bars collapse → reveal 3D --- */
  vid.addEventListener("ended", ()=>{
    /* resume 3D rendering and start audio */
    const sb = document.getElementById("skipintro"); if(sb) sb.classList.remove("on");
    renderPaused = false;
    if(window.AUDIO) AUDIO.start();

    /* animate letterbox bars to 0 over 1.4s — the aspect ratio "opens up" */
    gsap.to([barTop, barBot], {height:0, duration:1.4, ease:"power2.inOut"});
    /* simultaneously fade the cinema layer out to reveal the 3D canvas beneath */
    gsap.to(cinema, {opacity:0, duration:1.6, delay:0.3, ease:"power2.inOut", onComplete:()=>{
      cinema.classList.remove("on"); cinema.style.display="none";
      vid.src = ""; if(vidURL) URL.revokeObjectURL(vidURL);      /* free memory */
    }});

    /* bring in the UI and start the scroll experience */
    document.body.classList.add("live");
    startScroll();
    gsap.timeline({delay:0.5})
      .to("#brand",{opacity:.9,duration:.5})
      .to("#rec",{opacity:.9,duration:.5},"<");
    if(window.armOnboarding) armOnboarding();
  });

  /* safety: if video fails to load or stalls, skip to the 3D experience after 3s */
  vid.addEventListener("error", skipCinema);
  let stuckTimer = setTimeout(skipCinema, 18000);     /* 18s max (video is ~14s) */
  vid.addEventListener("playing", ()=>clearTimeout(stuckTimer));
  function skipCinema(){
    clearTimeout(stuckTimer);
    if(cinema.style.display==="none") return;          /* already transitioned */
    const sb = document.getElementById("skipintro"); if(sb) sb.classList.remove("on");
    vid.pause();
    renderPaused = false;
    cinema.classList.remove("on"); cinema.style.display="none";
    document.body.classList.add("live");
    if(window.AUDIO) AUDIO.start();
    startScroll();
    gsap.timeline()
      .to("#brand",{opacity:.9,duration:.5})
      .to("#rec",{opacity:.9,duration:.5},"<");
    if(window.armOnboarding) armOnboarding();
  }
});

/* ---------- frame loop ---------- */
const clock = new THREE.Clock();
let renderPaused = false;
function frame(){
  requestAnimationFrame(frame);
  if(renderPaused) return;
  const t = performance.now()/1000;
  const p = drive.p;
  const walking = window.WALK && WALK.active;
  if(window.__PEEK) __PEEK.tick(p, frame._prevP || p);
  frame._prevP = p;
  if(!walking) document.getElementById("rail").style.width = (p*100)+"%";

  /* walk mode: always render office, ignore scroll position */
  const inOffice = walking || p <= 0.958;

  if(inOffice){
    if(walking){
      WALK.update(t);
    }else{
      camAt(p);
      if(p===0){
        camera.position.x += Math.sin(t*0.5)*0.012;
        camera.position.y += Math.sin(t*0.8)*0.008;
      }
    }
    if(motes){
      const a = motes.geometry.attributes.position, b = motes.userData.base;
      for(let i=0;i<a.count;i++){
        a.array[i*3+1] = b[i*3+1] + Math.sin(t*0.7+i)*0.05;
        a.array[i*3]   = b[i*3]   + Math.sin(t*0.4+i*2.1)*0.03;
      }
      a.needsUpdate = true;
    }
    if(window.ANIM) ANIM.update(p, t);
    if(window.OFFAXIS) OFFAXIS.apply(camera, 1.0);
    if(renderer.toneMapping !== THREE.ACESFilmicToneMapping) renderer.toneMapping = THREE.ACESFilmicToneMapping;
    if(BLOOM_OK && window.__composer){ window.__composer.render(); } else { renderer.render(scene, camera); }
  }else{
    /* the white beyond */
    if(lastPR!==BASE_PR){ renderer.setPixelRatio(BASE_PR); lastPR=BASE_PR; }
    canvasEl.style.imageRendering="auto"; canvasEl.style.filter=""; stage.style.transform="";
    holo.rotation.y = t*0.35;
    /* aurora datastream environment */
    if(window.__AURORA) __AURORA.update(t);
    /* animate dust face */
    if(window.__dustFace){
      __dustFace.rotation.y = Math.sin(t*0.12)*0.15;
      __dustFace.rotation.x = Math.sin(t*0.09)*0.05;
      if(__dustFace.userData.mat) __dustFace.userData.mat.uniforms.uTime.value = t;
    }
    holo.position.y = Math.sin(t*1.3)*0.03;
    scanPlane.position.y = 0.1 + ((t*0.55)%1)*1.75;
    scanPlane.material.opacity = 0.5*(1-((t*0.55)%1));
    const pr = ((t*0.8)%1);
    pulseRing.scale.setScalar(1+pr*1.6);
    pulseRing.material.opacity = 0.5*(1-pr);
    /* cheerful warm hue cycle for the digital twin */
    const hh = (0.06 + 0.05*Math.sin(t*0.25) + 1) % 1;
    holo.traverse(o=>{ if(o.material && o.material.color) o.material.color.setHSL(hh, 0.75, 0.62); });
    if(window.OFFAXIS){ cam2.position.set(0,1.5,1.1); cam2.lookAt(0,1.25,-2.2); OFFAXIS.apply(cam2, 1.4); }
    if(renderer.toneMapping !== THREE.NoToneMapping) renderer.toneMapping = THREE.NoToneMapping;
    renderer.render(scene2, cam2);
  }
  if(!walking) applyFx(p, t);
  if(window.AUDIO) AUDIO.update(walking ? 0.3 : p, t);
  placeMarks(p);
  if(!walking) updateCaption(p);
}
window.SCENE = scene; window.CAMERA = camera; window.RENDERER = renderer;
window.GLITCH_OF = (p)=>sstep(0.78,0.945,p);
frame();
