"""Builds one Research Bytes episode: a short explainer of one paper, narrated by Neerja, with captions and subtle music.

    python -m pip install edge-tts playwright numpy
    python tools/paper_videos/make_paper_video.py iotaas            # -> tools/paper_videos/out/iotaas/
    python tools/paper_videos/make_paper_video.py iotaas --stills   # one PNG per scene (start, middle, end), for checking
    python tools/paper_videos/make_paper_video.py iotaas --remix    # only rebuild the soundtrack on the rendered frames
    python tools/paper_videos/make_paper_video.py iotaas --text     # only rebuild youtube.md
    python tools/paper_videos/make_paper_video.py iotaas --thumb    # only rebuild thumbnail.jpg

An episode is papers/<id>.json (meta + what Neerja says in each scene) and papers/<id>.js (that paper's visuals).
The intro, title card, outro, captions and thumbnail design are shared (engine.js), so every episode looks alike.
Output: <slug>.mp4 (1920x1080), <slug>.srt (captions), thumbnail.jpg (1280x720) and youtube.md (title, description,
chapters, tags). Neerja's voice is Microsoft's en-IN-NeerjaNeural via edge-tts (needs speech.platform.bing.com).
Needs ffmpeg on PATH.
"""
import asyncio
import hashlib
import json
import math
import os
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import music  # noqa: E402

FPS, RATE = 30, 24000
VOICE, SPEED = "en-IN-NeerjaNeural", "+10%"
VO_IN = 0.55            # the voice starts this long after a scene's cut
GAP = 0.22              # pause between sentences
INTRO_LEN, INTRO_VO = music.INTRO, 4.2      # the shared intro: its length, and when Neerja says hello
INTRO_SAY = "Hi, I'm Neerja! One paper, two minutes. Let's go."
MUSIC_GAIN = 0.12       # the music sits far under the voice (subtle), and ducks further while she speaks
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
CACHE = HERE / ".cache"
CHAPTERS = {"intro": "Intro", "title": "Intro", "hook": "The problem", "idea": "The idea", "arch": "How it works",
            "demo": "The experiment", "study": "The study", "results": "Results", "access": "Access & cost",
            "honest": "Physical vs virtual", "credits": "Credits", "outro": "Credits"}


def sentences(text):
    return [p.strip() for p in re.split(r"(?<=[.!?])\s+", text) if p.strip()]


def tts(texts):
    """Neerja, one clip per sentence, cached by text. Returns float32 arrays at RATE."""
    import edge_tts
    CACHE.mkdir(exist_ok=True)
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")

    async def one(text):
        p = CACHE / (hashlib.sha1(f"{VOICE}|{SPEED}|{text}".encode()).hexdigest()[:14] + ".mp3")
        if not p.exists():
            await edge_tts.Communicate(text, VOICE, rate=SPEED, proxy=proxy).save(str(p))
        return p

    async def run():
        return await asyncio.gather(*(one(t) for t in texts))
    out = []
    for p in asyncio.run(run()):
        raw = subprocess.run([FFMPEG, "-v", "error", "-i", str(p), "-f", "s16le", "-ac", "1", "-ar", str(RATE), "-"], capture_output=True, check=True).stdout
        a = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32767
        idx = np.nonzero(np.abs(a) > 0.01)[0]                    # trim the silence edge-tts leaves around a clip
        out.append(a[max(0, idx[0] - int(0.03 * RATE)):idx[-1] + int(0.1 * RATE)] if len(idx) else a)
    return out


def write_wav(p, a, rate, ch):
    with wave.open(str(p), "wb") as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(rate)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def timeline(ep):
    scenes = ep["scenes"]
    says = [sentences(INTRO_SAY if s["view"] == "intro" else s.get("say", "")) for s in scenes]
    clips = iter(tts([x for ss in says for x in ss]))
    voice = np.zeros(int(600 * RATE), dtype=np.float32)
    out, t = [], 0.0
    for s, ss in zip(scenes, says):
        caps = sentences(s["cap"]) if s.get("cap") else ss
        if len(caps) != len(ss):
            raise SystemExit(f"scene {s['view']}: the caption has {len(caps)} sentences, the narration {len(ss)}")
        at = t + (INTRO_VO if s["view"] == "intro" else VO_IN)
        sc = {"view": s["view"], "chapter": s.get("chapter"), "captions": [], "start": round(t, 3)}
        for text, c in zip(ss, caps):
            a = next(clips)
            voice[int(at * RATE):int(at * RATE) + len(a)] += a
            sc["captions"].append({"start": round(at, 3), "end": round(at + len(a) / RATE, 3), "text": c})
            at += len(a) / RATE + GAP
        length = INTRO_LEN if s["view"] == "intro" else (at - GAP - t) + s.get("hold", 0.5)
        if s["view"] == "intro" and at - GAP > t + INTRO_LEN:
            raise SystemExit("the intro greeting is longer than the intro")
        sc["end"] = round(t + length, 3)
        out.append(sc)
        t += length
    total = round(t, 3)
    voice = voice[:int(total * RATE) + RATE]
    per = RATE // FPS
    n = len(voice) // per
    amp = np.sqrt(np.mean(voice[:n * per].reshape(n, per) ** 2, axis=1))
    amp = np.round(np.clip(amp / (np.percentile(amp, 95) or 1), 0, 1), 3).tolist()
    return {"id": ep["id"], "episode": ep["episode"], "meta": ep["meta"], "fps": FPS, "total": total, "scenes": out, "amp": amp}, voice


def open_page(pw, tl, size=(1920, 1080)):
    try:
        browser = pw.chromium.launch()
    except Exception:
        browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=size[0] / 1920)
    page.add_init_script(f"window.TIMELINE = {json.dumps(tl)};")
    page.goto((HERE / "engine.html").as_uri())
    page.wait_for_function("window.READY === true", timeout=60000)
    return page


def yt_title(M, ep):
    """YouTube allows 100 characters: the short title, the paper's name (before a colon) when it fits, the episode."""
    full = f"{M['short']} | {M['title'].split(':')[0]} | Research Bytes #{ep:02}"
    return full if len(full) <= 100 else f"{M['short']} | Research Bytes #{ep:02}"


def youtube_text(tl, out_dir, slug):
    M = tl["meta"]
    chapters = []                                                 # [start, end, name], one per named part
    for sc in tl["scenes"]:
        name = sc.get("chapter") or CHAPTERS.get(sc["view"], sc["view"].title())
        if chapters and chapters[-1][2] == name:
            chapters[-1][1] = sc["end"]
        else:
            chapters.append([sc["start"], sc["end"], name])
    i = 0                                                         # YouTube needs 10 s per chapter: join a short one with the next
    while i < len(chapters):
        if chapters[i][1] - chapters[i][0] < 10 and len(chapters) > 1:
            j = i + 1 if i + 1 < len(chapters) else i - 1
            a, b = sorted((i, j))
            chapters[a:b + 1] = [[chapters[a][0], chapters[b][1], f"{chapters[a][2]} · {chapters[b][2]}"]]
            i = 0
            continue
        i += 1
    chapters = [(0 if k == 0 else c[0], c[2]) for k, c in enumerate(chapters)]
    stamp = lambda s: f"{int(s) // 60}:{int(s) % 60:02}"
    narration = " ".join(c["text"] for sc in tl["scenes"] if sc["view"] not in ("intro", "title", "credits", "outro") for c in sc["captions"])
    lines = [
        f"# YouTube: Research Bytes #{tl['episode']:02}", "",
        "## Title", yt_title(M, tl["episode"]), "",
        "## Description",
        f"{M['title']}", f"{M['venue']} · {M['publisher']}" + (f" · https://doi.org/{M['doi']}" if M.get("doi") else ""),
        "Authors: " + ", ".join(M["authors"]), "",
        narration, "",
        "Chapters:", *[f"{stamp(s)} {n}" for s, n in chapters], "",
        f"More research: {M['link']}",
        "Research Bytes: one paper, two minutes, with Dr. Sanket Salvi. Narrated by Neerja (synthetic voice).", "",
        "## Tags", ", ".join(["Research Bytes", "Sanket Salvi", M["domain"], *M.get("tags", []), "research explained", "paper summary"]), "",
        f"## Files", f"- Video: {slug}.mp4", f"- Captions (upload as English subtitles): {slug}.srt", "- Thumbnail: thumbnail.jpg",
    ]
    (out_dir / "youtube.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    pid = sys.argv[1]
    stills, remix, text_only, thumb_only = ("--stills" in sys.argv, "--remix" in sys.argv, "--text" in sys.argv, "--thumb" in sys.argv)
    ep = json.loads((HERE / "papers" / f"{pid}.json").read_text(encoding="utf-8"))
    out_dir = HERE / "out" / pid
    out_dir.mkdir(parents=True, exist_ok=True)
    slug = f"research-bytes-{ep['episode']:02}-{pid}"
    tl, voice = timeline(ep)
    frames = int(tl["total"] * FPS)
    print(f"{len(tl['scenes'])} scenes, {tl['total']:.1f} s")
    for sc in tl["scenes"]:
        print(f"  {sc['view']:8} {sc['start']:6.2f} - {sc['end']:6.2f}")

    if thumb_only:                                                # only rebuild thumbnail.jpg
        with sync_playwright() as pw:
            page = open_page(pw, tl, size=(1280, 720))
            page.evaluate("renderThumb()")
            page.screenshot(path=str(out_dir / "thumbnail.jpg"), type="jpeg", quality=90)
        print("wrote", (out_dir / "thumbnail.jpg").relative_to(HERE.parents[1]))
        return
    if text_only:                                                 # only rebuild youtube.md
        youtube_text(tl, out_dir, slug)
        print("wrote", (out_dir / "youtube.md").relative_to(HERE.parents[1]))
        return
    if stills:
        d = out_dir / "stills"
        d.mkdir(exist_ok=True)
        for f in d.glob("*.png"):
            f.unlink()
        with sync_playwright() as pw:
            page = open_page(pw, tl)
            for i, sc in enumerate(tl["scenes"]):
                for tag, at in (("a", sc["start"] + 0.6), ("b", (sc["start"] + sc["end"]) / 2), ("c", sc["end"] - 0.15)):
                    page.evaluate(f"renderAt({at})")
                    page.screenshot(path=str(d / f"{i:02}{tag}_{sc['view']}.png"))
        print("stills in", d)
        return

    voice_wav, music_wav, mix_wav = out_dir / "voice.wav", out_dir / "music.wav", out_dir / "mix.wav"
    write_wav(voice_wav, voice, RATE, 1)
    music.synth(tl["total"], [sc["start"] for sc in tl["scenes"][1:]], music_wav)
    subprocess.run([FFMPEG, "-y", "-v", "error", "-i", str(music_wav), "-i", str(voice_wav), "-filter_complex",
                    "[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,highpass=f=80,acompressor=threshold=0.12:ratio=2.5:attack=5:release=120,asplit=2[sc][v];"
                    "[0:a][sc]sidechaincompress=threshold=0.05:ratio=2.5:attack=30:release=700:makeup=1[m];"
                    f"[m]volume={MUSIC_GAIN}[mm];[v]volume=1.3[vv];[mm][vv]amix=inputs=2:normalize=0:duration=first,"
                    "loudnorm=I=-15:TP=-1.5:LRA=9", "-ar", "44100", "-c:a", "pcm_s16le", str(mix_wav)], check=True)
    mp4 = out_dir / f"{slug}.mp4"
    if remix:
        tmp = out_dir / "remix.mp4"
        subprocess.run([FFMPEG, "-y", "-v", "error", "-i", str(mp4), "-i", str(mix_wav), "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(tmp)], check=True)
        tmp.replace(mp4)
    else:
        enc = subprocess.Popen([FFMPEG, "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                                "-i", str(mix_wav), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "20",
                                "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(mp4)], stdin=subprocess.PIPE)
        with sync_playwright() as pw:
            page = open_page(pw, tl)
            for f in range(frames):
                page.evaluate(f"renderAt({f / FPS})")
                enc.stdin.write(page.screenshot(type="jpeg", quality=92))
                if f % 600 == 0:
                    print(f"  frame {f}/{frames}", flush=True)
            enc.stdin.close()
            enc.wait()
            thumb = open_page(pw, tl, size=(1280, 720))
            thumb.evaluate("renderThumb()")
            thumb.screenshot(path=str(out_dir / "thumbnail.jpg"), type="jpeg", quality=90)
    for p in (voice_wav, music_wav, mix_wav):
        p.unlink()
    with open(out_dir / f"{slug}.srt", "w", encoding="utf-8") as fh:
        n = 0
        for sc in tl["scenes"]:
            for c in sc["captions"]:
                n += 1
                fh.write(f"{n}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n\n")
    youtube_text(tl, out_dir, slug)
    print("wrote", mp4.relative_to(HERE.parents[1]), f"({mp4.stat().st_size / 1e6:.1f} MB), {slug}.srt, thumbnail.jpg, youtube.md")


if __name__ == "__main__":
    main()
