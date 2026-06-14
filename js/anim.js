/* ============================================================
   AMBIENT ANIMATION — the room breathes
   Reads window.NAMED / LIGHTS / SCENE built by the engine.
   ============================================================ */
window.ANIM = (()=>{
  let ready = false;
  const by = (prefix)=>NAMED.filter(m=>m.name.startsWith(prefix));
  const one = (prefix)=>NAMED.find(m=>m.name.startsWith(prefix)) || null;

  /* recenter a mesh's geometry so it can rotate about its own pivot */
  function pivot(mesh, mode){            /* mode: "xyz" full center, "xz" keep y */
    mesh.geometry.computeBoundingBox();
    const c = new THREE.Vector3(); mesh.geometry.boundingBox.getCenter(c);
    if(mode==="xz") c.y = 0;
    mesh.geometry.translate(-c.x,-c.y,-c.z);
    mesh.position.set(c.x,c.y,c.z);
    return mesh;
  }
  function ownMat(m){ m.material = m.material.clone(); return m; }

  /* state */
  let rotors=[], scanhead=null, laserfan=null, armParts=[], armPivot=null,
      droneParts=[], printHead=[], rackLeds=[], tbLeds=[], robotEyes=[], chest=null,
      vrLed=null, droneLedR=null, lampBulb=null, lampShade=null, coreGlow=null, coreChip=null,
      cityView=null, laptopScreen=null, voxels=[], rainPts=null, rainBase=null,
      ledStrip=null, instLed=null, glass=null;
  let flash = {until:0, next:8+Math.random()*10, level:0};

  function init(){
    rotors = ["anim_rotor0","anim_rotor1","anim_rotor2","anim_rotor3"].map(n=>{
      const m = one(n); return m ? pivot(m,"xyz") : null; }).filter(Boolean);
    scanhead = one("anim_scanhead"); if(scanhead) pivot(scanhead,"xz");
    const lens = one("anim_scanlens");
    laserfan = one("anim_laserfan");
    if(laserfan){
      /* pivot the fan at the scanner column (0.42,-1.98) so it sweeps the room */
      laserfan.geometry.translate(-0.42,-1.135,1.98);
      laserfan.position.set(0.42,1.135,-1.98);
      ownMat(laserfan); laserfan.material.depthWrite=false;
    }
    if(lens){ lens.geometry.translate(-0.42,-1.135,1.98); lens.position.set(0.42,1.135,-1.98); }
    window.__scanlens = lens;
    armParts = by("anim_armswing");
    if(armParts.length){
      armPivot = new THREE.Group();
      armPivot.position.set(-1.98, 0.876, 2.26);
      SCENE.add(armPivot);
      for(const m of armParts){
        SCENE.remove(m);
        m.geometry.translate(1.98, -0.876, -2.26);
        armPivot.add(m);
      }
    }
    droneParts = by("anim_drone").concat(rotors);
    printHead = ["anim_printhead","anim_printnozzle"].map(one).filter(Boolean);
    rackLeds = by("rack_led").map(ownMat);
    tbLeds = by("anim_tb_led").map(ownMat);
    robotEyes = by("anim_robot_eye").map(ownMat);
    chest = one("anim_robot_chest"); if(chest) ownMat(chest);
    vrLed = one("anim_vr_led"); if(vrLed) ownMat(vrLed);
    droneLedR = one("anim_drone_ledr"); if(droneLedR) ownMat(droneLedR);
    lampBulb = one("lamp_bulb"); if(lampBulb) ownMat(lampBulb);
    lampShade = one("lamp_shade"); if(lampShade) ownMat(lampShade);
    coreGlow = one("core_glow"); if(coreGlow) ownMat(coreGlow);
    coreChip = one("core_chip"); if(coreChip) ownMat(coreChip);
    cityView = one("city_view"); if(cityView) ownMat(cityView);
    laptopScreen = one("laptop_screen");
    if(laptopScreen && laptopScreen.material.emissiveMap) ownMat(laptopScreen);
    voxels = by("voxels").map(ownMat);
    ledStrip = one("led_strip"); if(ledStrip) ownMat(ledStrip);
    instLed = one("instrument_led"); if(instLed) ownMat(instLed);
    glass = one("win_glass");

    /* --- rain: streaks falling just behind the window glass --- */
    const N = 240, pos = new Float32Array(N*3), base = new Float32Array(N*3);
    for(let i=0;i<N;i++){
      base[i*3]   = 0.62 + (Math.random()-0.5)*1.7;   /* x across window */
      base[i*3+1] = 0.95 + Math.random()*1.47;        /* y in window */
      base[i*3+2] = -2.565 + Math.random()*0.02;
      pos.set(base.subarray(i*3,i*3+3), i*3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos,3));
    rainPts = new THREE.Points(g, new THREE.PointsMaterial({
      color:0xaecbe8, size:0.014, transparent:true, opacity:0.55, depthWrite:false}));
    rainPts.userData.spd = Array.from({length:N},()=>0.6+Math.random()*1.1);
    rainBase = base;
    SCENE.add(rainPts);

    /* --- fake bloom: additive glow sprites at the light sources --- */
    const cv = document.createElement("canvas"); cv.width=cv.height=128;
    const c2 = cv.getContext("2d");
    const rg = c2.createRadialGradient(64,64,2,64,64,64);
    rg.addColorStop(0,"rgba(255,255,255,.85)"); rg.addColorStop(0.35,"rgba(255,255,255,.25)");
    rg.addColorStop(1,"rgba(255,255,255,0)");
    c2.fillStyle = rg; c2.fillRect(0,0,128,128);
    const glowTex = new THREE.CanvasTexture(cv);
    function glow(x,y,z,color,scale){
      const m = new THREE.SpriteMaterial({map:glowTex, color, transparent:true,
        blending:THREE.AdditiveBlending, depthWrite:false, opacity:0.55});
      const sp = new THREE.Sprite(m); sp.position.set(x,y,z); sp.scale.setScalar(scale);
      SCENE.add(sp); return sp;
    }
    window.__glows = {
      core: glow(1.92,1.05,-1.40, 0x49d6ff, 1.5),
      screen: glow(1.92,1.83,-1.46, 0x6fe2ff, 0.7),
      lamp: glow(-2.42,1.16,-1.85, 0xffd9a0, 0.65),
      cab:  glow(2.62,1.12,0.52, 0xffd2a0, 0.5),
      win:  glow(0.62,1.7,-2.5, 0x8fb4e8, 1.6),
      part: glow(-2.75,1.04,2.26, 0x66d6e8, 0.28),
    };
    __glows.win.material.opacity = 0.22;

    ready = true;
  }

  const clamp01 = v=>Math.min(Math.max(v,0),1);

  function update(p, t){
    if(!ready){ if(window.NAMED && NAMED.length){ init(); } else return; }
    const glitch = window.GLITCH_OF ? GLITCH_OF(p) : 0;

    /* rain fall + wind drift */
    if(rainPts){
      const a = rainPts.geometry.attributes.position, spd = rainPts.userData.spd;
      for(let i=0;i<a.count;i++){
        let y = a.array[i*3+1] - spd[i]*0.016;
        if(y < 0.95){ y = 2.42; a.array[i*3] = rainBase[i*3] + (Math.random()-0.5)*0.05; }
        a.array[i*3+1] = y;
        a.array[i*3] += Math.sin(t*0.8+i)*0.0004;
      }
      a.needsUpdate = true;
    }

    /* lightning: schedule, flash window + room */
    if(t > flash.next){ flash.until = t + 0.28 + Math.random()*0.25; flash.next = t + 14 + Math.random()*18;
      if(window.AUDIO) AUDIO.thunder(0.6 + Math.random()*1.6); }
    const inFlash = t < flash.until;
    flash.level += ((inFlash ? (0.55+Math.random()*0.45) : 0) - flash.level) * 0.35;
    if(LIGHTS.flash) LIGHTS.flash.intensity = flash.level * 2.6;
    if(cityView) cityView.material.emissiveIntensity = 1 + flash.level*1.6;
    if(LIGHTS.win) LIGHTS.win.intensity = 0.5 + flash.level*1.2;

    /* banker's lamp flicker (old bulb) */
    const lampF = 1 + Math.sin(t*30)*0.012 + (Math.random()<0.012 ? -0.35*Math.random() : 0);
    LIGHTS.lamp.intensity = 1.1 * lampF;
    if(lampBulb) lampBulb.material.emissiveIntensity = lampF;
    if(lampShade) lampShade.material.emissiveIntensity = lampF;

    /* server heartbeat — accelerates as you approach */
    const near = clamp01((p-0.60)/0.35);
    const rate = 1.4 + near*4.2;
    const pulse = 0.78 + 0.32*Math.sin(t*rate*2) + glitch*0.4*Math.random();
    if(coreGlow) coreGlow.material.emissiveIntensity = pulse;
    if(coreChip) coreChip.material.emissiveIntensity = 0.8 + 0.5*Math.sin(t*rate*2+0.8);
    LIGHTS.core.intensity = (1.5 + glitch*5.5) * (0.8+0.3*Math.sin(t*rate*2));

    /* rack LEDs random blink */
    for(let i=0;i<rackLeds.length;i++){
      const m = rackLeds[i];
      if(Math.random()<0.04) m.userData.on = !m.userData.on;
      m.material.emissiveIntensity = (m.userData.on===false?0.12:1) * (0.8+0.2*Math.sin(t*7+i*2));
    }
    for(let i=0;i<tbLeds.length;i++)
      tbLeds[i].material.emissiveIntensity = (Math.sin(t*3+i*2.1)>0.2)?1:0.12;

    /* voxels: slow rise + shimmer (the dissolution, looping) */
    for(let i=0;i<voxels.length;i++){
      const m = voxels[i];
      m.position.y = Math.sin(t*0.35 + i*1.7)*0.045;
      m.position.x = Math.sin(t*0.22 + i)*0.02;
      m.material.emissiveIntensity = 0.75 + 0.35*Math.sin(t*1.6 + i*2.4) + glitch*0.5*Math.random();
    }

    /* laptop code slowly scrolling */
    if(laptopScreen && laptopScreen.material.emissiveMap)
      laptopScreen.material.emissiveMap.offset.y = (t*0.012)%1;

    /* LED strip breathing */
    if(ledStrip) ledStrip.material.emissiveIntensity = 0.8+0.25*Math.sin(t*1.1);
    if(instLed) instLed.material.emissiveIntensity = (Math.sin(t*2.3)>0)?1:0.15;

    /* ---- new artifacts ---- */
    /* drone: hover bob + rotor spin + nav strobes */
    const bob = Math.sin(t*1.4)*0.018, sway = Math.sin(t*0.7)*0.008;
    for(const m of droneParts){ m.position.y = bob; m.position.x = sway; }
    for(let i=0;i<rotors.length;i++){
      rotors[i].rotation.y = t*(14+i*2.4)*(i%2?1:-1);
      rotors[i].position.y = bob;          /* keep with body */
      rotors[i].position.x = sway;
    }
    if(droneLedR) droneLedR.material.emissiveIntensity = (t%1<0.12)?1.6:0.15;

    /* laser scanner: head + fan sweep */
    if(scanhead) scanhead.rotation.y = t*0.9;
    if(laserfan){
      laserfan.rotation.y = t*0.9;
      laserfan.material.opacity = 0.16 + 0.14*Math.sin(t*5);
    }
    if(window.__scanlens) __scanlens.rotation.y = t*0.9;

    /* robotic arm: slow scanning sweep about its base */
    if(armPivot) armPivot.rotation.y = Math.sin(t*0.45)*0.5;

    /* 3D printer head shuttling */
    for(const m of printHead) m.position.x = Math.sin(t*2.2)*0.085 + Math.sin(t*9)*0.006;

    /* humanoid: chest pulse + eye blink */
    if(chest) chest.material.emissiveIntensity = 0.7+0.4*Math.sin(t*2.6);
    const blink = (t%4.7) < 0.12;
    for(const e of robotEyes) e.material.emissiveIntensity = blink?0.05:1;
    if(vrLed) vrLed.material.emissiveIntensity = 0.5+0.5*Math.sin(t*1.7);

    /* glow sprites track their sources */
    if(window.__glows){
      __glows.core.material.opacity = 0.30 + 0.20*Math.sin(t*rate*2) + glitch*0.3;
      __glows.core.scale.setScalar(1.5 + glitch*1.2);
      __glows.lamp.material.opacity = 0.40*lampF;
      __glows.win.material.opacity = 0.18 + flash.level*0.5;
    }
  }

  return {update};
})();
