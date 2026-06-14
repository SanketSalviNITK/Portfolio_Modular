/* ============================================================
   OBSERVER MODE — off-axis head-tracked parallax.
   MediaPipe FaceDetection on setInterval (separated from render).
   Tuned values from the sandbox test.
   ============================================================ */
window.OFFAXIS = (()=>{
  let active=false, loading=false, video=null, detector=null,
      stream=null, detecting=false, detectorInterval=null;
  const eye={x:0,y:0,z:0};
  const raw={x:0,y:0,z:0,seen:false};
  let baseW=0, frameCount=0, faceCount=0, lastBox=null;
  const STRENGTH=0.65, SCREEN_D=0.50;

  const btn=document.getElementById("observer");

  /* --- debug feed --- */
  let dbgWrap=null, dbgCanvas=null, dbgCtx=null, dbgStatus=null;
  function createDebugFeed(){
    if(dbgWrap) return;
    dbgWrap=document.createElement("div"); dbgWrap.id="oa-debug";
    dbgWrap.style.cssText="position:fixed;bottom:14px;right:14px;z-index:90;width:220px;"+
      "background:rgba(6,9,14,.92);border:1px solid rgba(70,226,255,.6);"+
      "box-shadow:0 4px 20px rgba(0,0,0,.6);overflow:hidden;";
    const hdr=document.createElement("div");
    hdr.style.cssText="padding:5px 8px;font:10px 'Courier New',monospace;letter-spacing:.2em;"+
      "color:#46e2ff;border-bottom:1px solid rgba(70,226,255,.3);display:flex;justify-content:space-between;";
    hdr.innerHTML='<span>OBSERVER FEED</span>';
    dbgStatus=document.createElement("span"); dbgStatus.textContent="INIT…";
    dbgStatus.style.color="#ffb35c"; hdr.appendChild(dbgStatus);
    dbgWrap.appendChild(hdr);
    dbgCanvas=document.createElement("canvas"); dbgCanvas.width=220; dbgCanvas.height=165;
    dbgCanvas.style.cssText="display:block;width:220px;height:165px;";
    dbgCtx=dbgCanvas.getContext("2d"); dbgWrap.appendChild(dbgCanvas);
    const vals=document.createElement("div"); vals.id="oa-vals";
    vals.style.cssText="padding:4px 8px;font:9px 'Courier New',monospace;color:#9aa7b4;"+
      "letter-spacing:.1em;line-height:1.7;";
    dbgWrap.appendChild(vals);
    document.body.appendChild(dbgWrap);
  }
  function removeDebugFeed(){
    if(dbgWrap){dbgWrap.remove();dbgWrap=null;dbgCanvas=null;dbgCtx=null;dbgStatus=null;}
  }
  function drawDebug(){
    if(!dbgCtx||!video||video.readyState<2) return;
    const cw=220,ch=165;
    dbgCtx.save(); dbgCtx.translate(cw,0); dbgCtx.scale(-1,1);
    dbgCtx.drawImage(video,0,0,cw,ch); dbgCtx.restore();
    if(lastBox){
      const dx=(1-lastBox.cx)*cw, dy=lastBox.cy*ch;
      const bw=lastBox.fw*cw, bh=lastBox.fw*ch*1.3;
      dbgCtx.strokeStyle="#46e2ff"; dbgCtx.lineWidth=2;
      dbgCtx.strokeRect(dx-bw/2,dy-bh/2,bw,bh);
      dbgCtx.beginPath();
      dbgCtx.moveTo(dx-10,dy); dbgCtx.lineTo(dx+10,dy);
      dbgCtx.moveTo(dx,dy-10); dbgCtx.lineTo(dx,dy+10);
      dbgCtx.strokeStyle="rgba(70,226,255,.8)"; dbgCtx.lineWidth=1; dbgCtx.stroke();
      dbgCtx.fillStyle="#ff5d5d"; dbgCtx.beginPath();
      dbgCtx.arc(dx,dy,3,0,Math.PI*2); dbgCtx.fill();
    }
    if(dbgStatus){
      dbgStatus.textContent=raw.seen?"TRACKING":"NO FACE";
      dbgStatus.style.color=raw.seen?"#46e2ff":"#ff5d5d";
    }
    const v=document.getElementById("oa-vals");
    if(v) v.innerHTML=
      `X:<b>${eye.x.toFixed(3)}</b> Y:<b>${eye.y.toFixed(3)}</b> Z:<b>${eye.z.toFixed(3)}</b><br>`+
      `Shift: <b>${(eye.x*STRENGTH).toFixed(3)}m</b> <b>${(eye.y*STRENGTH).toFixed(3)}m</b><br>`+
      `Sent:<b>${frameCount}</b> Faces:<b>${faceCount}</b>`;
  }

  const toast=(msg)=>{
    let t=document.getElementById("oa-toast");
    if(!t){
      t=document.createElement("div"); t.id="oa-toast";
      t.style.cssText="position:fixed;top:94px;right:16px;z-index:45;max-width:280px;"+
        "background:rgba(8,12,18,.92);border:1px solid rgba(70,226,255,.5);color:#9aa7b4;"+
        "font:10.5px 'Courier New',monospace;letter-spacing:.12em;padding:9px 12px;opacity:0;"+
        "transition:opacity .3s;pointer-events:none;";
      document.body.appendChild(t);
    }
    t.textContent=msg; t.style.opacity=1;
    clearTimeout(t._h); t._h=setTimeout(()=>t.style.opacity=0,7000);
  };

  function setBtn(state){
    if(!btn) return;
    btn.classList.toggle("on",state==="on");
    btn.classList.toggle("busy",state==="loading");
    btn.textContent=state==="on"?"◎ OBSERVER: ON"
      :state==="loading"?"◎ OBSERVER: …":"◎ OBSERVER: OFF";
  }

  function loadScript(src){
    return new Promise((res,rej)=>{
      const s=document.createElement("script"); s.src=src;
      s.onload=res; s.onerror=()=>rej(new Error("load failed "+src));
      document.head.appendChild(s);
    });
  }

  async function enable(){
    if(loading) return;
    loading=true; setBtn("loading");
    try{
      if(!window.isSecureContext)
        throw {oa:"Not a secure context — download this HTML and open directly in Chrome."};
      if(window.self!==window.top)
        throw {oa:"Running inside a preview frame — camera blocked. Download the HTML and open directly."};
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)
        throw {oa:"No camera API in this browser."};

      stream=await navigator.mediaDevices.getUserMedia({
        video:{width:{ideal:320},height:{ideal:240},facingMode:"user"},audio:false});
      video=document.createElement("video");
      video.setAttribute("playsinline",""); video.muted=true;
      video.srcObject=stream; await video.play();

      if(!window.FaceDetection){
        try{await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js");}
        catch(e){await loadScript("https://unpkg.com/@mediapipe/face_detection/face_detection.js");}
      }
      if(!window.FaceDetection)
        throw {oa:"Could not load face-tracking library."};

      detector=new FaceDetection({
        locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${f}`});
      detector.setOptions({model:"short",minDetectionConfidence:0.5});
      detector.onResults(onResults);

      baseW=0; frameCount=0; faceCount=0;
      active=true; loading=false; setBtn("on");
      createDebugFeed();
      toast("OBSERVER MODE active — lean to look around. Debug feed in bottom-right.");

      /* detection on its own timer, separated from the render loop */
      detectorInterval=setInterval(sendFrame,100);
    }catch(err){
      loading=false; active=false; setBtn("off"); cleanup();
      console.error("[OBSERVER]",err);
      let m=(err&&err.oa)?err.oa
        :(err&&err.name==="NotAllowedError")?"Camera permission declined."
        :(err&&err.name==="NotFoundError")?"No camera found."
        :"Head tracking unavailable: "+(err&&err.message||err);
      toast(m);
    }
  }

  async function sendFrame(){
    if(!active||!video||video.readyState<2||detecting) return;
    detecting=true; frameCount++;
    try{await detector.send({image:video});}catch(e){}
    detecting=false;
  }

  function onResults(results){
    const dets=results.detections||results.multiFaceDetections||[];
    if(dets.length>0){
      faceCount++;
      const d=dets[0];
      let cx=0.5,cy=0.5,fw=0.2;
      const bb=d.boundingBox;
      if(bb){
        if(bb.xCenter!==undefined){cx=bb.xCenter;cy=bb.yCenter;fw=bb.width;}
        else if(bb.x!==undefined&&bb.width!==undefined){
          cx=bb.x+bb.width/2;cy=bb.y+bb.height/2;fw=bb.width;
          if(bb.x>1||bb.y>1||bb.width>1){
            const vw=video.videoWidth||320,vh=video.videoHeight||240;
            cx/=vw;cy/=vh;fw/=vw;
          }
        }else if(bb.originX!==undefined){
          cx=bb.originX+(bb.width||0)/2;cy=bb.originY+(bb.height||0)/2;fw=bb.width||0.2;
        }else if(bb.xMin!==undefined){
          cx=(bb.xMin+bb.xMax)/2;cy=(bb.yMin+bb.yMax)/2;fw=bb.xMax-bb.xMin;
        }
      }
      if(d.locationData&&d.locationData.relativeBoundingBox){
        const rbb=d.locationData.relativeBoundingBox;
        if(rbb.xCenter!==undefined){cx=rbb.xCenter;cy=rbb.yCenter;fw=rbb.width||fw;}
        else if(rbb.xMin!==undefined){cx=rbb.xMin+(rbb.width||0)/2;cy=rbb.yMin+(rbb.height||0)/2;fw=rbb.width||fw;}
      }
      if(!baseW) baseW=fw;
      lastBox={cx,cy,fw};
      let rx=(0.5-cx)*2.5, ry=(0.5-cy)*2.0;
      let rz=Math.min(Math.max((fw/baseW-1)*1.5,-1),1);
      if(Math.abs(rx)<0.04) rx=0;
      if(Math.abs(ry)<0.04) ry=0;
      if(Math.abs(rz)<0.03) rz=0;
      raw.x=rx; raw.y=ry; raw.z=rz;
      raw.seen=true;
    }else{
      raw.seen=false; lastBox=null;
    }
  }

  function cleanup(){
    if(detectorInterval){clearInterval(detectorInterval);detectorInterval=null;}
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
    if(video){video.srcObject=null;video=null;}
    eye.x=eye.y=eye.z=0; raw.seen=false; lastBox=null;
    detecting=false;
    removeDebugFeed();
  }

  function disable(){
    active=false; setBtn("off"); cleanup();
    if(window.CAMERA) CAMERA.updateProjectionMatrix();
    if(window.cam2_ref) cam2_ref.updateProjectionMatrix();
    toast("OBSERVER MODE off.");
  }

  /* called every frame by the render loop — only smooths + draws debug */
  function smooth(){
    if(!active) return;
    const k=raw.seen?0.07:0.03;
    eye.x+=((raw.seen?raw.x:0)-eye.x)*k;
    eye.y+=((raw.seen?raw.y:0)-eye.y)*k;
    eye.z+=((raw.seen?raw.z:0)-eye.z)*k;
    drawDebug();
  }

  /* applies the off-axis projection to the given camera */
  const _right=new THREE.Vector3(), _up=new THREE.Vector3();
  function apply(cam,depthScale){
    if(!active) return;
    smooth();
    const ex=eye.x*STRENGTH*(depthScale||1);
    const ey=eye.y*STRENGTH*(depthScale||1);
    const ez=eye.z*STRENGTH;
    _right.set(1,0,0).applyQuaternion(cam.quaternion);
    _up.set(0,1,0).applyQuaternion(cam.quaternion);
    cam.position.addScaledVector(_right,ex);
    cam.position.addScaledVector(_up,ey);
    cam.translateZ(-ez*0.9);
    const n=cam.near,f=cam.far;
    const halfH=n*Math.tan(THREE.MathUtils.degToRad(cam.fov*0.5));
    const halfW=halfH*cam.aspect;
    const sx=ex*n/SCREEN_D, sy=ey*n/SCREEN_D;
    cam.projectionMatrix.makePerspective(-halfW-sx,halfW-sx,halfH-sy,-halfH-sy,n,f);
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  }

  if(btn) btn.addEventListener("click",()=>active?disable():enable());
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&active)disable();});

  return {apply, smooth, get active(){return active;}};
})();
