"""Original music for the research story video, synthesised with numpy (no samples, nothing to license).

Electronic, 120 BPM in D minor (Dm - Bb - F - C). The scene changes in video.js sit on the beat, so this follows
the same timeline: a quiet build under the cold open, a hit on the title, a groove under the numbers, an airy
section under the constellation, a riser into the montage (a whoosh on each card), impacts on the award stamps
and a final chord.
    synth(path)   # writes a 44.1 kHz stereo WAV, 75 s
"""
import wave

import numpy as np

SR = 44100
BEAT = 0.5
BAR = 4 * BEAT
TOTAL = 75.0
RNG = np.random.default_rng(11)
CHORDS = [(38, [62, 65, 69, 74]), (34, [62, 65, 70, 74]), (41, [60, 65, 69, 72]), (36, [60, 64, 67, 72])]
STAMPS = [62.5, 63.0, 63.5, 65.6]                  # the award stamps and the patent line in video.js
CARDS = [41 + 3 * i for i in range(7)]             # the montage cards


def hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / fc) ** 4), len(x))


def env(n, a, r):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def add(buf, t, sig, pan=0.0, gain=1.0):
    i0 = int(t * SR)
    if i0 >= buf.shape[1]:
        return
    s = sig[: buf.shape[1] - i0] * gain
    buf[0, i0:i0 + len(s)] += s * np.sqrt(0.5 * (1 - pan))
    buf[1, i0:i0 + len(s)] += s * np.sqrt(0.5 * (1 + pan))


def pad(notes, dur, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for note in notes:
        for det in (-0.09, 0.0, 0.1):
            f = hz(note) * 2 ** (det / 12)
            for h in range(1, 8):
                out += np.sin(2 * np.pi * f * h * t + RNG.random() * 6.28) * bright / h ** 1.6
    return out * env(n, 0.8, 1.2) * (1 + 0.1 * np.sin(2 * np.pi * 0.3 * t)) / (len(notes) * 6)


def pluck(note, dur=0.5, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    s = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (6 + 3 * h)) / h for h in range(1, 6))
    return s * env(n, 0.003, 0.05) * vel * 0.3


def kick(vel=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-t * 32)) / SR) * np.exp(-t * 7) + RNG.standard_normal(n) * np.exp(-t * 400) * 0.15) * vel * 0.8


def clap(vel=1.0):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = RNG.standard_normal(n)
    band = lowpass(noise, 2600) - lowpass(noise, 900)
    bursts = sum(np.exp(-np.clip(t - d, 0, None) * 60) * (t >= d) for d in (0, 0.011, 0.022))
    return band * bursts * 0.5 * vel


def hat(vel=1.0):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    noise = RNG.standard_normal(n)
    return (noise - lowpass(noise, 6000)) * np.exp(-t * 90) * 0.16 * vel


def bass(note, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 2.5) * env(n, 0.01, 0.06) * 0.45


def noise_swell(dur, up=True, gain=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = RNG.standard_normal(n)
    hp = noise - lowpass(noise, 1500)
    shape = (t / dur) ** 2.4 if up else np.exp(-t * 5)
    return hp * shape * gain


def impact(gain=1.0):
    n = int(2.5 * SR)
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 2) + 32) / SR) * np.exp(-t * 2.2)
    crack = lowpass(RNG.standard_normal(n), 3000) * np.exp(-t * 18) * 0.5
    return (sub + crack) * gain * 0.8


def shimmer(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * hz(note) * t + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.2 + 0.07 * i) * t)) for i, note in enumerate((86, 93, 98)))
    return s * env(n, 2.0, 1.5) * 0.04


def reverb(buf, secs=2.4, wet=0.25):
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = np.empty_like(buf)
    size = 1 << (buf.shape[1] + n - 1).bit_length()
    for c in range(2):
        ir = lowpass(RNG.standard_normal(n) * np.exp(-t * 6.9 / secs), 5000)
        ir[: int(0.015 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        y = np.fft.irfft(np.fft.rfft(buf[c], size) * np.fft.rfft(ir, size), size)[: buf.shape[1]]
        out[c] = buf[c] * (1 - wet) + y * wet * 1.5
    return out


def section(t):
    return ("open" if t < 6 else "title" if t < 14 else "record" if t < 26 else "domains" if t < 40
            else "work" if t < 62 else "recog" if t < 70 else "close")


def synth(path):
    buf = np.zeros((2, int((TOTAL + 0.5) * SR)))
    # the cold open: a drone, a shimmer and a riser into the title
    add(buf, 0, pad([38, 50, 57], 6.6, bright=0.5), gain=0.8)
    add(buf, 0.5, shimmer(5.8))
    add(buf, 3.6, noise_swell(2.4), gain=0.8)
    add(buf, 6.0, impact(0.9))
    t, k = 6.0, 0
    while t < 70 - 1e-6:
        sec = section(t + 0.01)
        root, voicing = CHORDS[k % 4]
        add(buf, t, pad(voicing, BAR + 0.5, bright=1.1 if sec in ("work", "record") else 0.8), gain=0.5 if sec != "domains" else 0.65)
        for b in range(4):
            bt = t + b * BEAT
            if bt >= 70:
                break
            drums = sec in ("record", "work") or (sec == "title" and bt >= 10) or sec == "recog"
            if drums or (sec == "domains" and b % 2 == 0):
                add(buf, bt, kick(1.0 if b % 2 == 0 else 0.85), gain=0.9 if sec != "domains" else 0.6)
            if drums and b % 2:
                add(buf, bt, clap(0.8), pan=0.1)
            if sec != "title" or bt >= 10:
                for e in range(2):
                    add(buf, bt + e * BEAT / 2 + BEAT / 4, hat(1.0 if drums else 0.6), pan=-0.35)
            if drums:
                for e in range(2):
                    add(buf, bt + e * BEAT / 2, bass(root, BEAT / 2 + 0.05), gain=0.9)
            arp = [voicing[0] + 12, voicing[2] + 12, voicing[1] + 12, voicing[3] + 12]
            steps = 4 if sec in ("work", "record") else 2
            for q in range(steps):
                add(buf, bt + q * BEAT / steps, pluck(arp[(b * steps + q) % 4], 0.5, 0.3 if sec != "domains" else 0.38), pan=0.3 * (1 if q % 2 else -1))
        t += BAR
        k += 1
    add(buf, 38.0, noise_swell(2.0, gain=0.5))                  # riser into the montage
    add(buf, 40.0, impact(0.8))
    for c in CARDS[1:]:
        add(buf, c - 0.4, noise_swell(0.4, gain=0.25), pan=0.2)
    for s in STAMPS:
        add(buf, s, impact(0.7))
    # the close: one hit and a ringing chord
    add(buf, 70.0, impact(0.8))
    add(buf, 70.0, pad([50, 57, 62, 65, 69, 74], 5.2, bright=1.0), gain=0.9)
    for i, note in enumerate((74, 69, 77, 81)):
        add(buf, 70.5 + i * BEAT, pluck(note, 2.5, 0.6), pan=(-0.3, 0.3)[i % 2])
    out = reverb(buf)
    n_end, i_end = int(1.5 * SR), int(TOTAL * SR)
    out[:, i_end - n_end:i_end] *= np.linspace(1, 0, n_end)
    out[:, i_end:] = 0
    out = np.tanh(out / (np.max(np.abs(out)) + 1e-9) * 1.3) * 0.85
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out.T * 32767).astype(np.int16).tobytes())
