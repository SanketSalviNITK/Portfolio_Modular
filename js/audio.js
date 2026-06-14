/* ============================================================
   SPATIAL AUDIO — procedural, no samples. Three acts:
   noir rain → machine tension → transcendent calm.
   ============================================================ */
window.AUDIO = (()=>{
  let ctx=null, master=null, started=false, muted=false;
  let rainG, humG, humOsc=[], fanSrc, lampG, musicG, padOscs=[], arpG, arpT=null,
      revealG, revealOscs=[], stutterG, noiseBuf=null;
  /* RICH: extra musical layers */
  let motifG, motifT=null, subOsc=null, subG, bellG, bellT=null, warmG, warmOscs=[];
  const panners = {};

  function noise(seconds=2){
    if(noiseBuf) return noiseBuf;
    const b = ctx.createBuffer(1, ctx.sampleRate*seconds, ctx.sampleRate);
    const d = b.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
    noiseBuf = b; return b;
  }
  function panner(x,y,z, dist=4){
    const p = ctx.createPanner();
    p.panningModel = "HRTF"; p.distanceModel = "exponential";
    p.refDistance = 0.8; p.rolloffFactor = 1.4; p.maxDistance = 30;
    p.positionX.value=x; p.positionY.value=y; p.positionZ.value=z;
    return p;
  }
  function g(v){ const n = ctx.createGain(); n.gain.value=v; return n; }

  function start(){
    if(started) return; started = true;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = g(0.0); master.connect(ctx.destination);
    /* gentle master ramp-in */
    master.gain.linearRampToValueAtTime(muted?0:0.9, ctx.currentTime+2.5);

    stutterG = g(1); stutterG.connect(master);

    /* ---- RAIN at the window (0.62, 1.7, -2.6) ---- */
    const rainSrc = ctx.createBufferSource(); rainSrc.buffer = noise(); rainSrc.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=2400; bp.Q.value=0.35;
    const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=5200;
    rainG = g(0.16);
    const rp = panners.rain = panner(0.62,1.7,-2.6);
    rainSrc.connect(bp); bp.connect(lp); lp.connect(rainG); rainG.connect(rp); rp.connect(stutterG);
    rainSrc.start();
    /* city rumble, non-spatial bed */
    const rum = ctx.createBufferSource(); rum.buffer = noise(); rum.loop = true;
    const rlp = ctx.createBiquadFilter(); rlp.type="lowpass"; rlp.frequency.value=110;
    const rumG = g(0.05);
    rum.connect(rlp); rlp.connect(rumG); rumG.connect(stutterG); rum.start();

    /* ---- SERVER HUM at the rack (1.92, 1.2, -1.85) ---- */
    humG = g(0.0);
    const hp = panners.hum = panner(1.92,1.2,-1.85);
    humG.connect(hp); hp.connect(stutterG);
    for(const [f,v] of [[58,0.5],[116,0.22],[174,0.08]]){
      const o = ctx.createOscillator(); o.type="sawtooth"; o.frequency.value=f;
      const og = g(v); const olp = ctx.createBiquadFilter(); olp.type="lowpass"; olp.frequency.value=420;
      o.connect(olp); olp.connect(og); og.connect(humG); o.start(); humOsc.push(o);
    }
    fanSrc = ctx.createBufferSource(); fanSrc.buffer = noise(); fanSrc.loop = true;
    const fbp = ctx.createBiquadFilter(); fbp.type="bandpass"; fbp.frequency.value=900; fbp.Q.value=1.1;
    const fg = g(0.30);
    fanSrc.connect(fbp); fbp.connect(fg); fg.connect(humG); fanSrc.start();
    humG.gain.value = 0.22;

    /* ---- LAMP BUZZ at the desk lamp ---- */
    const lb = ctx.createOscillator(); lb.type="square"; lb.frequency.value=120;
    lampG = g(0.006);
    const lbp = panners.lamp = panner(-2.42,1.1,-1.85);
    const llp = ctx.createBiquadFilter(); llp.type="lowpass"; llp.frequency.value=900;
    lb.connect(llp); llp.connect(lampG); lampG.connect(lbp); lbp.connect(stutterG); lb.start();

    /* ---- MUSIC BED: slow minor pads (A2 C3 E3), felt not heard ---- */
    musicG = g(0.05); musicG.connect(stutterG);
    const mlp = ctx.createBiquadFilter(); mlp.type="lowpass"; mlp.frequency.value=600;
    mlp.connect(musicG);
    for(const f of [110, 130.81, 164.81]){
      const o = ctx.createOscillator(); o.type="triangle"; o.frequency.value=f;
      const o2 = ctx.createOscillator(); o2.type="sawtooth"; o2.frequency.value=f*1.003;
      const og = g(0.16), og2 = g(0.05);
      o.connect(og); o2.connect(og2); og.connect(mlp); og2.connect(mlp);
      o.start(); o2.start(); padOscs.push(o,o2);
    }
    /* slow swell LFO on the bed */
    const lfo = ctx.createOscillator(); lfo.frequency.value=0.05;
    const lfoG = g(0.018); lfo.connect(lfoG); lfoG.connect(musicG.gain); lfo.start();

    /* ---- discovery arpeggio (enters at the archive) ---- */
    arpG = g(0.0); arpG.connect(stutterG);
    const seq = [220, 261.63, 329.63, 392, 329.63, 261.63];
    let step = 0;
    arpT = setInterval(()=>{
      if(!ctx || ctx.state!=="running") return;
      const o = ctx.createOscillator(); o.type="sine"; o.frequency.value=seq[step++%seq.length];
      const e = g(0); o.connect(e); e.connect(arpG);
      const now = ctx.currentTime;
      e.gain.linearRampToValueAtTime(0.5, now+0.02);
      e.gain.exponentialRampToValueAtTime(0.001, now+0.9);
      o.start(now); o.stop(now+1.0);
    }, 460);

    /* ---- the white beyond: bright open pad (C major add9), off until reveal ---- */
    revealG = g(0.0); revealG.connect(master);   /* bypasses glitch stutter */
    const rlp2 = ctx.createBiquadFilter(); rlp2.type="lowpass"; rlp2.frequency.value=1800;
    rlp2.connect(revealG);
    for(const f of [261.63, 329.63, 392, 587.33]){
      const o = ctx.createOscillator(); o.type="sine"; o.frequency.value=f;
      const og = g(f>500?0.05:0.10);
      o.connect(og); og.connect(rlp2); o.start(); revealOscs.push(o);
    }
    const shimmer = ctx.createOscillator(); shimmer.frequency.value=0.13;
    const shg = g(0.03); shimmer.connect(shg); shg.connect(revealG.gain); shimmer.start();

    /* ============ RICH LAYERS ============ */

    /* ---- SUB-BASS PULSE: slow heartbeat under the investigation (felt, not heard) ---- */
    subG = g(0.0); subG.connect(master);          /* bypasses stutter so the floor stays steady */
    subOsc = ctx.createOscillator(); subOsc.type="sine"; subOsc.frequency.value=55;  /* A1 */
    const subShape = g(0.0); subOsc.connect(subShape); subShape.connect(subG); subOsc.start();
    /* breathing pulse ~ every 3.3s */
    const pulse = ctx.createOscillator(); pulse.type="sine"; pulse.frequency.value=0.30;
    const pulseG = g(0.5); const pulseOff = ctx.createConstantSource(); pulseOff.offset.value=0.5;
    pulse.connect(pulseG); pulseG.connect(subShape.gain); pulseOff.connect(subShape.gain);
    pulse.start(); pulseOff.start();

    /* ---- MELODIC MOTIF: sparse minor-key phrase, the "professor's theme" ---- */
    motifG = g(0.0); motifG.connect(stutterG);
    const mlp2 = ctx.createBiquadFilter(); mlp2.type="lowpass"; mlp2.frequency.value=2200; mlp2.connect(motifG);
    /* A minor pentatonic-ish, long contemplative phrase (Hz), with rests as 0 */
    const motif = [220, 0, 261.63, 329.63, 0, 293.66, 261.63, 0, 220, 196, 0, 0];
    let mStep = 0;
    motifT = setInterval(()=>{
      if(!ctx || ctx.state!=="running") return;
      const f = motif[mStep++ % motif.length];
      if(!f) return;                                  /* rest */
      const now = ctx.currentTime;
      /* two detuned voices + soft octave for warmth */
      [[f,0.5,"triangle"],[f*1.004,0.32,"triangle"],[f*2,0.12,"sine"]].forEach(([fr,vol,ty])=>{
        const o=ctx.createOscillator(); o.type=ty; o.frequency.value=fr;
        const e=g(0); o.connect(e); e.connect(mlp2);
        e.gain.linearRampToValueAtTime(vol, now+0.18);
        e.gain.exponentialRampToValueAtTime(0.001, now+2.4);
        o.start(now); o.stop(now+2.5);
      });
    }, 1500);

    /* ---- SHIMMER BELLS: occasional high harmonic sparkles ---- */
    bellG = g(0.0); bellG.connect(master);
    const bells = [1046.5, 1318.5, 1568, 2093];
    bellT = setInterval(()=>{
      if(!ctx || ctx.state!=="running" || muted) return;
      if(Math.random() > 0.45) return;
      const now = ctx.currentTime;
      const f = bells[(Math.random()*bells.length)|0];
      const o=ctx.createOscillator(); o.type="sine"; o.frequency.value=f;
      const o2=ctx.createOscillator(); o2.type="sine"; o2.frequency.value=f*2.01;
      const e=g(0), e2=g(0); o.connect(e); o2.connect(e2); e.connect(bellG); e2.connect(bellG);
      e.gain.linearRampToValueAtTime(0.06, now+0.01);
      e.gain.exponentialRampToValueAtTime(0.0008, now+3.2);
      e2.gain.linearRampToValueAtTime(0.02, now+0.01);
      e2.gain.exponentialRampToValueAtTime(0.0008, now+2.0);
      o.start(now); o.stop(now+3.3); o2.start(now); o2.stop(now+2.1);
    }, 2600);

    /* ---- WARM REVEAL LAYER: low cello-like octave under the bright pad (adds body to the ending) ---- */
    warmG = g(0.0); warmG.connect(master);
    const wlp = ctx.createBiquadFilter(); wlp.type="lowpass"; wlp.frequency.value=900; wlp.connect(warmG);
    for(const f of [130.81, 196, 261.63]){          /* C3 G3 C4 — open warm fifth/octave */
      const o=ctx.createOscillator(); o.type="triangle"; o.frequency.value=f;
      const o2=ctx.createOscillator(); o2.type="sawtooth"; o2.frequency.value=f*1.005;
      const og=g(0.12), og2=g(0.04); o.connect(og); o2.connect(og2); og.connect(wlp); og2.connect(wlp);
      o.start(); o2.start(); warmOscs.push(o,o2);
    }

    updateListener();
  }

  /* listener follows whichever camera is live */
  function updateListener(){
    if(!ctx) return;
    const cam = (window.__drive_p||0) > 0.958 ? window.cam2_ref : CAMERA;
    const c = cam || CAMERA;
    const L = ctx.listener, pos = c.position;
    const fwd = new THREE.Vector3(0,0,-1).applyQuaternion(c.quaternion);
    const up = new THREE.Vector3(0,1,0).applyQuaternion(c.quaternion);
    if(L.positionX){
      L.positionX.value=pos.x; L.positionY.value=pos.y; L.positionZ.value=pos.z;
      L.forwardX.value=fwd.x; L.forwardY.value=fwd.y; L.forwardZ.value=fwd.z;
      L.upX.value=up.x; L.upY.value=up.y; L.upZ.value=up.z;
    }else if(L.setPosition){
      L.setPosition(pos.x,pos.y,pos.z);
      L.setOrientation(fwd.x,fwd.y,fwd.z,up.x,up.y,up.z);
    }
  }

  const clamp01 = v=>Math.min(Math.max(v,0),1);
  const ss2 = (a,b,v)=>{ v=clamp01((v-a)/(b-a)); return v*v*(3-2*v); };
  let lastStut = 0;

  function update(p, t){
    if(!ctx || ctx.state!=="running") return;
    window.__drive_p = p;
    updateListener();
    const glitch = window.GLITCH_OF ? GLITCH_OF(p) : 0;
    const inWhite = p > 0.958;
    const now = ctx.currentTime;

    /* act balance */
    const officeMix = 1 - ss2(0.90, 0.958, p);
    rainG.gain.setTargetAtTime(0.16*officeMix, now, 0.2);
    humG.gain.setTargetAtTime((0.22 + glitch*0.85)*officeMix, now, 0.15);
    lampG.gain.setTargetAtTime(0.006*officeMix, now, 0.3);
    /* RICH: keep a thread of the pad bed alive even past the cut so music never drops out */
    musicG.gain.setTargetAtTime((0.05*officeMix*(1-glitch*0.5)) + 0.012*(1-officeMix), now, 0.4);
    arpG.gain.setTargetAtTime((p>0.44 && p<0.90 ? 0.05 : 0.0)*officeMix, now, 0.8);
    revealG.gain.setTargetAtTime(inWhite ? 0.16 : 0.0, now, inWhite?1.2:0.25);

    /* RICH: sub-bass heartbeat — present through the whole investigation, eases off into the calm reveal */
    subG.gain.setTargetAtTime(0.10*officeMix + 0.03*(1-officeMix), now, 0.6);
    /* RICH: melodic motif — fades in once you start exploring, carries across the whole arc, softens (not silences) at the end */
    const motifMix = ss2(0.06, 0.20, p);                 /* in after the opening */
    motifG.gain.setTargetAtTime(motifMix * (0.07*officeMix*(1-glitch*0.6) + 0.035*(1-officeMix)), now, 0.7);
    /* RICH: shimmer bells — light during exploration, blossom in the reveal */
    bellG.gain.setTargetAtTime((0.5 + 0.5*(1-officeMix)) * (p>0.12 ? 0.9 : 0.0), now, 0.8);
    /* RICH: warm low body — joins the bright reveal pad so the ending has weight, and HOLDS to the very end */
    warmG.gain.setTargetAtTime(inWhite ? 0.14 : 0.0, now, inWhite?1.4:0.3);

    /* hum pitch creeps up with the glitch */
    humOsc.forEach((o,i)=>o.frequency.setTargetAtTime([58,116,174][i]*(1+glitch*0.5), now, 0.2));

    /* glitch stutter: random hard gain chops */
    if(glitch>0.1 && !inWhite){
      if(t-lastStut > 0.05 && Math.random() < glitch*0.5){
        lastStut = t;
        const gv = Math.random()<0.5 ? 0.05 : 1;
        stutterG.gain.cancelScheduledValues(now);
        stutterG.gain.setValueAtTime(gv, now);
        stutterG.gain.linearRampToValueAtTime(1, now+0.06+Math.random()*0.08);
      }
    }else if(stutterG.gain.value!==1){
      stutterG.gain.setTargetAtTime(1, now, 0.1);
    }
  }

  function thunder(delay=0.8){
    if(!ctx || ctx.state!=="running" || muted) return;
    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource(); src.buffer = noise(); src.loop = false;
    const lp = ctx.createBiquadFilter(); lp.type="lowpass";
    lp.frequency.setValueAtTime(420, now);
    lp.frequency.exponentialRampToValueAtTime(60, now+2.6);
    const e = g(0);
    const tp = panner(0.62,2.0,-4.5);
    src.connect(lp); lp.connect(e); e.connect(tp); tp.connect(master);
    e.gain.setValueAtTime(0, now);
    e.gain.linearRampToValueAtTime(0.5, now+0.07);
    e.gain.exponentialRampToValueAtTime(0.001, now+3.0);
    src.start(now); src.stop(now+3.2);
  }

  function ui(){   /* dossier open: paper tick */
    if(!ctx || ctx.state!=="running" || muted) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator(); o.type="triangle"; o.frequency.value=1400;
    const e = g(0); o.connect(e); e.connect(master);
    e.gain.linearRampToValueAtTime(0.12, now+0.005);
    e.gain.exponentialRampToValueAtTime(0.001, now+0.09);
    o.start(now); o.stop(now+0.1);
    const n2 = ctx.createBufferSource(); n2.buffer = noise();
    const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=3000; bp.Q.value=2;
    const e2 = g(0); n2.connect(bp); bp.connect(e2); e2.connect(master);
    e2.gain.linearRampToValueAtTime(0.05, now+0.01);
    e2.gain.exponentialRampToValueAtTime(0.001, now+0.12);
    n2.start(now); n2.stop(now+0.15);
  }

  function blip(){  /* hologram typing */
    if(!ctx || ctx.state!=="running" || muted) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator(); o.type="sine";
    o.frequency.value = 1700 + Math.random()*500;
    const e = g(0); o.connect(e); e.connect(master);
    e.gain.linearRampToValueAtTime(0.05, now+0.004);
    e.gain.exponentialRampToValueAtTime(0.001, now+0.05);
    o.start(now); o.stop(now+0.06);
  }

  function toggleMute(){
    muted = !muted;
    if(ctx && master) master.gain.setTargetAtTime(muted?0:0.9, ctx.currentTime, 0.15);
    return muted;
  }

  return {start, update, thunder, ui, blip, toggleMute, get muted(){return muted;}};
})();

/* mute toggle button */
(()=>{
  const b = document.getElementById("mute");
  if(!b) return;
  b.addEventListener("click", ()=>{
    const m = AUDIO.toggleMute();
    b.textContent = m ? "SOUND OFF" : "SOUND ON";
    b.classList.toggle("off", m);
  });
})();
