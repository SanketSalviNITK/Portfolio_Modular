"""Builds the research story video for research.html: assets/research-story.mp4 (75 s, 1920 x 1080, captions and
music only) and its poster assets/research-story.jpg. Content comes from data/research.json and
data/publications.json, so rebuild after those change.

    python -m pip install playwright numpy
    python tools/research_video/make_video.py            # the video
    python tools/research_video/make_video.py --stills   # one PNG every 2.5 s in tools/research_video/stills/, for checking
Needs ffmpeg on PATH. THREE_JS=/path/to/three.min.js serves three.js from a local file instead of the CDN.
"""
import functools
import http.server
import os
import subprocess
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import music  # noqa: E402

FPS = 30
OUT_MP4 = ROOT / "assets" / "research-story.mp4"
OUT_POSTER = ROOT / "assets" / "research-story.jpg"
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")


def serve():
    """The page fetches the site's data files, so it is served over http from the repository root."""
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def open_page(pw, port):
    try:
        browser = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
    except Exception:
        browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    local = os.environ.get("THREE_JS")
    if local:
        body = Path(local).read_bytes()
        page.route("**/three.min.js", lambda r: r.fulfill(status=200, content_type="application/javascript", body=body))
    page.goto(f"http://127.0.0.1:{port}/tools/research_video/video.html")
    page.wait_for_function("window.READY === true", timeout=60000)
    if page.evaluate("window.MISSING || []"):
        raise SystemExit(f"images missing: {page.evaluate('window.MISSING')}")
    return page


def main():
    stills = "--stills" in sys.argv
    srv = serve()
    port = srv.server_address[1]
    with sync_playwright() as pw:
        page = open_page(pw, port)
        total = page.evaluate("window.TOTAL")
        if stills:
            d = HERE / "stills"
            d.mkdir(exist_ok=True)
            for f in d.glob("*.png"):
                f.unlink()
            t = 0.4
            while t < total:
                page.evaluate(f"renderAt({t})")
                page.screenshot(path=str(d / f"{t:05.1f}.png"))
                t += 2.5
            print("stills in", d)
            return
        wav = HERE / "music.wav"
        music.synth(wav)
        frames = int(total * FPS)
        enc = subprocess.Popen([FFMPEG, "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                                "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5:LRA=9",
                                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "24", "-tune", "animation",
                                "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(OUT_MP4)], stdin=subprocess.PIPE)
        for f in range(frames):
            page.evaluate(f"renderAt({f / FPS})")
            enc.stdin.write(page.screenshot(type="jpeg", quality=92))
            if f % 300 == 0:
                print(f"  frame {f}/{frames}", flush=True)
        enc.stdin.close()
        enc.wait()
        page.evaluate("renderAt(9.5)")                             # the poster: the title card
        page.screenshot(path=str(OUT_POSTER), type="jpeg", quality=85)
        wav.unlink()
    srv.shutdown()
    print("wrote", OUT_MP4.relative_to(ROOT), f"({OUT_MP4.stat().st_size / 1e6:.1f} MB) and", OUT_POSTER.relative_to(ROOT))


if __name__ == "__main__":
    main()
