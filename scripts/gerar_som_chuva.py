"""Gera os 4 sons de chuva do site (assets/sons/):
  garoa.mp3, chuva-fraca.mp3, chuva-forte.mp3, tempestade.mp3

Tudo é feito no domínio da frequência e com gotas/trovões que "dão a volta" no fim,
então cada arquivo emenda sem estalo quando toca em loop.

Uso: python scripts/gerar_som_chuva.py
"""
import subprocess, wave, pathlib, tempfile
import numpy as np

SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "sons"

# hiss: volume do chiado, faixa (Hz) e inclinação; ticks: gotas por segundo; plinks: gotas em poça por segundo
PERFIS = {
    "garoa":       dict(seconds=24, hiss=.22, band=(900, 7500), tilt=-2, ticks=7, tick_amp=(.08, .35), plinks=.5, rumble=0, thunders=0, seed=11),
    "chuva-fraca": dict(seconds=24, hiss=.32, band=(500, 7000), tilt=-2.5, ticks=16, tick_amp=(.12, .55), plinks=1.5, rumble=0, thunders=0, seed=26),
    "chuva-forte": dict(seconds=24, hiss=.55, band=(250, 8000), tilt=-3, ticks=70, tick_amp=(.15, .6), plinks=4, rumble=.18, thunders=0, seed=42),
    "tempestade":  dict(seconds=32, hiss=.6, band=(200, 8000), tilt=-3.2, ticks=90, tick_amp=(.15, .6), plinks=4, rumble=.25, thunders=2, seed=77),
}


def gerar(nome, seconds, hiss, band, tilt, ticks, tick_amp, plinks, rumble, thunders, seed):
    N = SR * seconds
    rng = np.random.default_rng(seed)
    t = np.arange(N) / SR

    def noise(lo, hi, tl):
        spec = rng.normal(size=N // 2 + 1) + 1j * rng.normal(size=N // 2 + 1)
        f = np.fft.rfftfreq(N, 1 / SR)
        f[0] = 1
        g = (f / 1000) ** (tl / 6.02) / (1 + (lo / f) ** 4) / (1 + (f / hi) ** 4)
        g[0] = 0
        x = np.fft.irfft(spec * g, n=N)
        return x / np.abs(x).max()

    def wrap_add(buf, start, piece):
        idx = (start + np.arange(len(piece))) % N
        buf[idx] += piece

    # chiado de fundo com variação lenta (frequências inteiras por loop = emenda perfeita)
    swell = 0.82 + 0.1 * np.sin(2 * np.pi * 2 / seconds * t) + 0.08 * np.sin(2 * np.pi * 5 / seconds * t + 1.3)
    mix = hiss * noise(*band, tilt) * swell

    # ronco grave da chuva pesada no chão
    if rumble:
        mix += rumble * noise(40, 300, -6) * swell

    # tamborilar de gotas
    src = noise(1500, 9000, -1)
    drops = np.zeros(N)
    for start in rng.integers(0, N, size=int(seconds * ticks)):
        L = int(SR * rng.uniform(0.002, 0.009))
        s = rng.integers(0, N)
        piece = src[(s + np.arange(L)) % N] * np.exp(-np.linspace(0, 6, L)) * rng.uniform(*tick_amp)
        wrap_add(drops, start, piece)
    for start in rng.integers(0, N, size=int(seconds * plinks)):
        L = int(SR * 0.05)
        tt = np.arange(L) / SR
        f0 = rng.uniform(1400, 3200)
        wrap_add(drops, start, np.sin(2 * np.pi * (f0 + 900 * tt / tt[-1]) * tt) * np.exp(-tt / 0.012) * rng.uniform(.05, .16))
    mix += 0.55 * drops

    # trovões: estalo curto + ronco longo que vai sumindo
    if thunders:
        boom = noise(25, 180, -6)
        crack = noise(300, 3000, -3)
        for k in range(thunders):
            start = int(N * (k + rng.uniform(.15, .55)) / thunders)
            L = int(SR * rng.uniform(5, 7))
            tt = np.arange(L) / SR
            env = (1 - np.exp(-tt / .25)) * np.exp(-tt / 1.6) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.7 * tt) ** 2)
            s = rng.integers(0, N)
            piece = boom[(s + np.arange(L)) % N] * env * 1.6
            cl = int(SR * .35)
            piece[:cl] += crack[(s + np.arange(cl)) % N] * np.exp(-np.arange(cl) / SR / .08) * .5
            wrap_add(mix, start, piece * rng.uniform(.8, 1))

    mix = mix / np.abs(mix).max() * 0.6  # folga; o volume final é controlado no site
    pcm = (mix * 32767).astype(np.int16)
    out = OUT / f"{nome}.mp3"
    with tempfile.TemporaryDirectory() as tmp:
        wav = pathlib.Path(tmp) / "x.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "64k", str(out)], check=True)
    print(out.name, out.stat().st_size // 1024, "KB")


OUT.mkdir(parents=True, exist_ok=True)
for nome, perfil in PERFIS.items():
    gerar(nome, **perfil)
