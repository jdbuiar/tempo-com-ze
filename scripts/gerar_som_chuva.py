"""Gera o som de chuva fraca do site (assets/sons/chuva-fraca.mp3).

Tudo é feito no domínio da frequência e com gotas que "dão a volta" no fim,
então o arquivo emenda sem estalo quando toca em loop.

Uso: python scripts/gerar_som_chuva.py
"""
import subprocess, wave, pathlib, tempfile
import numpy as np

SR = 44100
SECONDS = 24
N = SR * SECONDS
rng = np.random.default_rng(26)
out = pathlib.Path(__file__).resolve().parent.parent / "assets" / "sons" / "chuva-fraca.mp3"


def shaped_noise(lo, hi, tilt):
    """Ruído periódico (emenda perfeita) com faixa de lo a hi Hz e inclinação tilt (dB/oitava)."""
    spec = rng.normal(size=N // 2 + 1) + 1j * rng.normal(size=N // 2 + 1)
    f = np.fft.rfftfreq(N, 1 / SR)
    f[0] = 1
    gain = (f / 1000) ** (tilt / 6.02)
    gain *= 1 / (1 + (lo / f) ** 4)  # passa-alta suave
    gain *= 1 / (1 + (f / hi) ** 4)  # passa-baixa suave
    gain[0] = 0
    x = np.fft.irfft(spec * gain, n=N)
    return x / np.abs(x).max()


# 1) chiado de fundo da chuva caindo longe, com variação lenta (periódica no loop)
t = np.arange(N) / SR
hiss = shaped_noise(500, 7000, -2.5)
swell = 0.82 + 0.1 * np.sin(2 * np.pi * 2 / SECONDS * t) + 0.08 * np.sin(2 * np.pi * 5 / SECONDS * t + 1.3)
mix = 0.32 * hiss * swell

# 2) tamborilar perto: rajadinhas curtas de ruído (gotas em telhado e folhas)
tick_src = shaped_noise(1500, 9000, -1)
drops = np.zeros(N)
for start in rng.integers(0, N, size=SECONDS * 22):
    length = int(SR * rng.uniform(0.002, 0.009))
    env = np.exp(-np.linspace(0, 6, length))
    idx = (start + np.arange(length)) % N
    src = (rng.integers(0, N) + np.arange(length)) % N
    drops[idx] += tick_src[src] * env * rng.uniform(0.15, 0.7)

# 3) alguns "plinks" mais claros, de gota caindo em poça
for start in rng.integers(0, N, size=SECONDS * 2):
    length = int(SR * 0.05)
    tt = np.arange(length) / SR
    f0 = rng.uniform(1400, 3200)
    tone = np.sin(2 * np.pi * (f0 + 900 * tt / tt[-1]) * tt) * np.exp(-tt / 0.012)
    idx = (start + np.arange(length)) % N
    drops[idx] += tone * rng.uniform(0.05, 0.16)

mix += 0.55 * drops
mix = mix / np.abs(mix).max() * 0.6  # deixa folga, o volume final é controlado no site
pcm = (mix * 32767).astype(np.int16)

out.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    wav = pathlib.Path(tmp) / "chuva.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "64k", str(out)], check=True)
print(out, out.stat().st_size // 1024, "KB")
