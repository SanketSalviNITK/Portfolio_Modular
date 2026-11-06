"""Subtle background music for Research Bytes, synthesised with numpy (no samples, nothing to license).

Calm electronic at 90 BPM in D minor (Dm - Bb - F - C): soft pads and plucks, a light beat after the intro, a gentle
sting when the logo appears, a soft swell at each scene change and a ringing chord at the end. It is mixed far under
Neerja's voice (make_paper_video.py), so it stays in the background.
    synth(total, cuts, path)   # total seconds, scene-change times; writes a 44.1 kHz stereo WAV
"""
import wave

import numpy as np

SR = 44100
BEAT = 60 / 90
BAR = 4 * BEAT
LOGO = 2.3                                   # the intro's logo reveal (engine.js V.intro)
INTRO = 9.2
RNG = np.random.default_rng(5)
CHORDS = [(38, [62, 65, 69, 74]), (34, [62, 65, 70, 74]), (41, [60, 65, 69, 72]), (36, [60, 64, 67, 72])]


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


def pad(notes, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for note in notes:
        for det in (-0.08, 0.0, 0.09):
            f = hz(note) * 2 ** (det / 12)
            for h in range(1, 7):
                out += np.sin(2 * np.pi * f * h * t + RNG.random() * 6.28) / h ** 1.8
    return lowpass(out * env(n, 1.0, 1.4) / (len(notes) * 6), 2200)


def pluck(note, dur=1.2, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * hz(note) * h * t) * np.exp(-t * (3 + 2.5 * h)) / h for h in range(1, 5))
    return s * env(n, 0.004, 0.1) * vel * 0.3


def kick(vel=1.0):
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(46 + 80 * np.exp(-t * 28)) / SR) * np.exp(-t * 8) * vel * 0.7


def hat(vel=1.0):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    noise = RNG.standard_normal(n)
    return (noise - lowpass(noise, 7000)) * np.exp(-t * 100) * 0.1 * vel


def swell(dur=0.8, gain=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = RNG.standard_normal(n)
    return (noise - lowpass(noise, 2000)) * (t / dur) ** 2 * gain


def sting():
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * hz(note) * t) * np.exp(-t * 1.2) for note in (62, 69, 74, 77, 81))
    sub = np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t * 1.5) + 30) / SR) * np.exp(-t * 2)
    return (s * 0.12 + sub * 0.5) * env(n, 0.01, 0.5)


def reverb(buf, secs=2.6, wet=0.3):
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = np.empty_like(buf)
    size = 1 << (buf.shape[1] + n - 1).bit_length()
    for c in range(2):
        ir = lowpass(RNG.standard_normal(n) * np.exp(-t * 6.9 / secs), 4500)
        ir[: int(0.02 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        y = np.fft.irfft(np.fft.rfft(buf[c], size) * np.fft.rfft(ir, size), size)[: buf.shape[1]]
        out[c] = buf[c] * (1 - wet) + y * wet * 1.5
    return out


def synth(total, cuts, path):
    buf = np.zeros((2, int((total + 1) * SR)))
    add(buf, 0, pad([38, 50, 57], LOGO + 1.5), gain=0.7)            # the intro: a drone, a swell into the logo, a sting
    add(buf, LOGO - 1.6, swell(1.6, 0.35))
    add(buf, LOGO, sting())
    t, k = LOGO + 1.0, 0
    end = total - 3.0
    while t < end:
        root, voicing = CHORDS[k % 4]
        add(buf, t, pad(voicing, BAR + 0.8), gain=0.75)
        add(buf, t, pad([root + 12], BAR + 0.6), gain=0.4)
        for b in range(4):
            bt = t + b * BEAT
            if bt >= end:
                break
            if bt > INTRO:                                         # a light beat once the episode starts
                add(buf, bt, kick(0.8 if b % 2 == 0 else 0.5))
                add(buf, bt + BEAT / 2, hat(0.8), pan=-0.3)
            arp = [voicing[0] + 12, voicing[2] + 12, voicing[1] + 12, voicing[3] + 12]
            add(buf, bt, pluck(arp[b % 4], 1.4, 0.32), pan=0.3 * (1 if b % 2 else -1))
        t += BAR
        k += 1
    for c in cuts:
        if c > INTRO:
            add(buf, c - 0.7, swell(0.7, 0.15), pan=0.2)
    add(buf, end, pad([50, 57, 62, 65, 69, 74], 4.0), gain=0.9)     # the closing chord rings out
    for i, note in enumerate((74, 69, 77, 81)):
        add(buf, end + 0.3 + i * BEAT, pluck(note, 2.5, 0.5), pan=(-0.3, 0.3)[i % 2])
    out = reverb(buf)
    i_end, n_end = int(total * SR), int(1.2 * SR)
    out[:, i_end - n_end:i_end] *= np.linspace(1, 0, n_end)
    out[:, i_end:] = 0
    out = np.tanh(out / (np.max(np.abs(out)) + 1e-9) * 1.2) * 0.85
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out.T * 32767).astype(np.int16).tobytes())
