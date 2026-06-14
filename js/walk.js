/* ============================================================
   WALKTHROUGH MODE — free-roam WASD + pointer-lock mouse look.
   Toggled via the ⌘ WALKTHROUGH button. Completely additive:
   when off, the scroll camera drives as normal.
   ============================================================ */
window.WALK = (()=>{
  let active = false, locked = false;
  const btn = document.getElementById("walkmode");
  const EYE = 1.62, SPEED = 2.8, FAST = 5.5, RAD = 0.26;
  let yaw = Math.PI*0.78, pitch = 0;
  const pos = new THREE.Vector3(-0.2, EYE, 1.55);
  const keys = {};
  const ROOM = {x0:-3.05, x1:3.05, z0:-2.45, z1:2.45};
  let colliders = [];
  const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  /* joystick state: vectors in [-1,1] */
  const moveVec = {x:0, y:0};   /* x = strafe, y = forward(+)/back(-) */
  const lookVec = {x:0, y:0};   /* x = yaw, y = pitch */
  let runBtnHeld = false;
  let joyEls = null;

  /* load colliders from the embedded JSON */
  try{
    const cj = document.getElementById("collider-data");
    if(cj) colliders = JSON.parse(cj.textContent);
  }catch(e){}

  function clamp(v,a,b){ return Math.min(Math.max(v,a),b); }

  function pushOut(px, pz){
    let x=px, z=pz;
    x = clamp(x, ROOM.x0+RAD, ROOM.x1-RAD);
    z = clamp(z, ROOM.z0+RAD, ROOM.z1-RAD);
    for(const c of colliders){
      const lx=c.cx-c.hx-RAD, rx=c.cx+c.hx+RAD, lz=c.cz-c.hz-RAD, rz=c.cz+c.hz+RAD;
      if(x>lx && x<rx && z>lz && z<rz){
        const pen = [rx-x, x-lx, rz-z, z-lz];
        const mi = pen.indexOf(Math.min(...pen));
        if(mi===0) x=rx; else if(mi===1) x=lx; else if(mi===2) z=rz; else z=lz;
      }
    }
    return {x, z};
  }

  function onMouseMove(e){
    if(!locked) return;
    yaw   -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch  = clamp(pitch, -1.2, 1.2);
  }

  function onKey(e, down){
    keys[e.code] = down;
    if(e.code==="Escape" && active) deactivate();
  }

  function onLockChange(){
    locked = document.pointerLockElement === RENDERER.domElement;
    if(!locked && active){
      /* show a re-click hint */
      toast("Click on the scene to re-engage mouse look, or press Escape to exit walkthrough.");
    }
  }

  let lastT = 0;
  function update(t){
    if(!active) return false;
    const dt = Math.min(t - lastT, 0.05); lastT = t;

    /* touch look: apply joystick yaw/pitch deltas */
    if(IS_TOUCH && (lookVec.x || lookVec.y)){
      yaw   -= lookVec.x * 2.4 * dt;
      pitch -= lookVec.y * 1.8 * dt;
      pitch  = clamp(pitch, -1.2, 1.2);
    }

    const running = (keys["ShiftLeft"]||keys["ShiftRight"]||runBtnHeld);
    const spd = running ? FAST : SPEED;
    const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    let mx=0, mz=0;
    if(keys["KeyW"]||keys["ArrowUp"])    { mx+=fwd.x; mz+=fwd.z; }
    if(keys["KeyS"]||keys["ArrowDown"])  { mx-=fwd.x; mz-=fwd.z; }
    if(keys["KeyA"]||keys["ArrowLeft"])  { mx-=right.x; mz-=right.z; }
    if(keys["KeyD"]||keys["ArrowRight"]) { mx+=right.x; mz+=right.z; }
    /* touch move: left joystick */
    if(IS_TOUCH && (moveVec.x || moveVec.y)){
      mx += fwd.x*moveVec.y + right.x*moveVec.x;
      mz += fwd.z*moveVec.y + right.z*moveVec.x;
    }
    const len = Math.sqrt(mx*mx+mz*mz);
    if(len>0.001){ mx/=len; mz/=len; }
    const nx = pos.x + mx*spd*dt, nz = pos.z + mz*spd*dt;
    const pushed = pushOut(nx, nz);
    pos.x = pushed.x; pos.z = pushed.z;

    CAMERA.position.set(pos.x, EYE, pos.z);
    CAMERA.rotation.order = "YXZ";
    CAMERA.rotation.set(pitch, yaw, 0);
    return true;   /* signals engine to skip scroll camera */
  }

  const toast = (msg)=>{
    let t = document.getElementById("walk-toast");
    if(!t){
      t = document.createElement("div"); t.id = "walk-toast";
      t.style.cssText = "position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:45;"+
        "max-width:440px;text-align:center;background:rgba(8,12,18,.88);border:1px solid rgba(70,226,255,.5);"+
        "color:#9aa7b4;font:11px 'Courier New',monospace;letter-spacing:.14em;padding:10px 16px;"+
        "opacity:0;transition:opacity .3s;pointer-events:none;";
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = 1;
    clearTimeout(t._h); t._h = setTimeout(()=>t.style.opacity=0, 5000);
  };

  /* ---------- on-screen joysticks (touch only) ---------- */
  function buildJoysticks(){
    if(joyEls) return joyEls;
    const wrap = document.createElement("div");
    wrap.id = "walk-joys";
    wrap.style.cssText = "position:fixed;inset:0;z-index:46;pointer-events:none;display:none;";

    const mkStick = (side, label)=>{
      const base = document.createElement("div");
      base.style.cssText =
        "position:absolute;bottom:max(26px,env(safe-area-inset-bottom));"+
        (side==="left"?"left:24px;":"right:24px;")+
        "width:118px;height:118px;border-radius:50%;pointer-events:auto;touch-action:none;"+
        "background:rgba(8,12,18,.30);border:1px solid rgba(70,226,255,.40);"+
        "backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);";
      const knob = document.createElement("div");
      knob.style.cssText =
        "position:absolute;left:50%;top:50%;width:50px;height:50px;border-radius:50%;"+
        "transform:translate(-50%,-50%);background:rgba(70,226,255,.32);"+
        "border:1px solid rgba(130,225,245,.7);transition:background .12s;";
      const cap = document.createElement("div");
      cap.textContent = label;
      cap.style.cssText =
        "position:absolute;left:0;right:0;bottom:-20px;text-align:center;"+
        "font:9px 'Courier New',monospace;letter-spacing:.22em;color:rgba(150,200,215,.75);";
      base.appendChild(knob); base.appendChild(cap);
      return {base, knob};
    };

    const left = mkStick("left", "MOVE");
    const right = mkStick("right", "LOOK");
    wrap.appendChild(left.base); wrap.appendChild(right.base);

    /* run toggle */
    const runBtn = document.createElement("button");
    runBtn.textContent = "RUN";
    runBtn.style.cssText =
      "position:absolute;bottom:calc(max(26px,env(safe-area-inset-bottom)) + 130px);right:34px;"+
      "pointer-events:auto;touch-action:none;width:58px;height:40px;border-radius:8px;"+
      "background:rgba(8,12,18,.34);border:1px solid rgba(70,226,255,.45);"+
      "color:rgba(180,230,245,.85);font:700 11px 'Courier New',monospace;letter-spacing:.16em;";
    runBtn.addEventListener("touchstart",(e)=>{ e.preventDefault(); runBtnHeld=true; runBtn.style.background="rgba(70,226,255,.35)"; },{passive:false});
    const runOff=(e)=>{ if(e)e.preventDefault(); runBtnHeld=false; runBtn.style.background="rgba(8,12,18,.34)"; };
    runBtn.addEventListener("touchend",runOff); runBtn.addEventListener("touchcancel",runOff);
    wrap.appendChild(runBtn);

    /* exit button */
    const exitBtn = document.createElement("button");
    exitBtn.textContent = "✕ EXIT";
    exitBtn.style.cssText =
      "position:absolute;top:max(14px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);"+
      "pointer-events:auto;touch-action:none;padding:9px 16px;border-radius:8px;"+
      "background:rgba(8,12,18,.5);border:1px solid rgba(70,226,255,.45);"+
      "color:rgba(200,235,245,.9);font:700 11px 'Courier New',monospace;letter-spacing:.18em;";
    exitBtn.addEventListener("touchstart",(e)=>{ e.preventDefault(); deactivate(); },{passive:false});
    wrap.appendChild(exitBtn);

    document.body.appendChild(wrap);

    /* drag handling, multi-touch aware */
    const bind = (stick, vec, ret)=>{
      let id = null;
      const R = 44;   /* max knob travel */
      const place = (cx, cy)=>{
        const r = stick.base.getBoundingClientRect();
        let dx = cx - (r.left + r.width/2);
        let dy = cy - (r.top + r.height/2);
        const d = Math.hypot(dx, dy);
        if(d > R){ dx = dx/d*R; dy = dy/d*R; }
        stick.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        vec.x = dx/R;
        vec.y = ret==="invY" ? -(dy/R) : (dy/R);
      };
      const reset = ()=>{ vec.x=0; vec.y=0; stick.knob.style.transform="translate(-50%,-50%)"; };
      stick.base.addEventListener("touchstart",(e)=>{
        e.preventDefault();
        const tch = e.changedTouches[0]; id = tch.identifier; place(tch.clientX, tch.clientY);
      },{passive:false});
      stick.base.addEventListener("touchmove",(e)=>{
        e.preventDefault();
        for(const tch of e.changedTouches){ if(tch.identifier===id){ place(tch.clientX, tch.clientY); } }
      },{passive:false});
      const end=(e)=>{ for(const tch of e.changedTouches){ if(tch.identifier===id){ id=null; reset(); } } };
      stick.base.addEventListener("touchend",end);
      stick.base.addEventListener("touchcancel",end);
    };
    bind(left, moveVec, "invY");    /* up on stick = forward */
    bind(right, lookVec, "norm");

    joyEls = {wrap};
    return joyEls;
  }

  function activate(){
    active = true;
    /* start at current scroll camera position */
    pos.copy(CAMERA.position);
    const dir = new THREE.Vector3(0,0,-1).applyQuaternion(CAMERA.quaternion);
    yaw = Math.atan2(-dir.x, -dir.z);
    pitch = Math.asin(clamp(dir.y, -1, 1));
    lastT = performance.now()/1000;

    if(btn){ btn.classList.add("on"); btn.textContent = "⌘ WALKTHROUGH: ON"; }
    document.addEventListener("keydown", e=>onKey(e,true));
    document.addEventListener("keyup", e=>onKey(e,false));
    /* disable scroll so the page doesn't move while walking */
    document.body.style.overflow = "hidden";

    if(IS_TOUCH){
      const j = buildJoysticks();
      j.wrap.style.display = "block";
      toast("Left stick = move · Right stick = look · RUN to sprint · ✕ to exit");
    }else{
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("pointerlockchange", onLockChange);
      RENDERER.domElement.addEventListener("click", requestLock);
      toast("WASD to move · Shift = run · Mouse = look · Click to engage · Escape to exit");
      requestLock();
    }
  }

  function requestLock(){
    if(active && !locked) RENDERER.domElement.requestPointerLock();
  }

  function deactivate(){
    active = false; locked = false;
    if(document.pointerLockElement) document.exitPointerLock();
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("pointerlockchange", onLockChange);
    RENDERER.domElement.removeEventListener("click", requestLock);
    document.body.style.overflow = "";
    if(joyEls){ joyEls.wrap.style.display = "none"; }
    moveVec.x=moveVec.y=lookVec.x=lookVec.y=0; runBtnHeld=false;
    /* restore the scroll-driven camera */
    CAMERA.rotation.order = "XYZ";
    if(btn){ btn.classList.remove("on"); btn.textContent = "⌘ WALKTHROUGH: OFF"; }
    toast("Walkthrough off — scroll to continue.");
    Object.keys(keys).forEach(k=>keys[k]=false);
  }

  if(btn) btn.addEventListener("click", ()=> active ? deactivate() : activate());

  return {update, get active(){ return active; }};
})();
