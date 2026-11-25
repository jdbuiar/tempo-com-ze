"""Monta os atlas do surfe a partir das folhas de animação (PNG com fundo transparente).

Uso:  python scripts/montar_sprites_surfe.py PASTA_DAS_FOLHAS

A pasta precisa ter: duo-ze-jorge.png, duo-niko-jorge.png, duo-brisa-jorge.png,
niko-solo.png, brisa-solo.png e mar.png. Gera em assets/:
  surf-duo-ze.webp, surf-duo-niko.webp, surf-duo-brisa.webp  (12 colunas x 4 linhas)
     colunas 0-5: o parceiro nos quadros 1-6; colunas 6-11: o Jorge nos quadros 1-6
     linhas: 0 meia estação, 1 chuva, 2 frio, 3 calor
  surf-niko.webp, surf-brisa.webp  (8 colunas x 3 linhas, quadros 1-24)
  surf-mar.webp  (24 faixas de mar empilhadas: 12 de ida e 12 de volta)
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
OUT = Path(__file__).resolve().parent.parent / 'assets'
FEET = 0.98     # altura dos pés no quadro (igual ao Zé atual)
JORGE = 0.84    # altura do Jorge parado, em fração do quadro


def pieces(path, min_size=1500):
    """Recorta cada personagem: componentes grandes + pedacinhos soltos colados neles (números saem)."""
    rgba = np.array(Image.open(path).convert('RGBA'))
    mask = rgba[:, :, 3] > 40
    lab, n = ndimage.label(mask)
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    objs = ndimage.find_objects(lab)
    big = [i for i in range(n) if sizes[i] >= min_size]
    owner = {i: i for i in big}
    for i in range(n):
        if i in owner or sizes[i] < 4:
            continue
        sy, sx = objs[i]
        if rgba[sy, sx][lab[sy, sx] == i + 1][:, :3].mean() < 70:   # números dos quadros (texto preto)
            continue
        cy, cx = (sy.start + sy.stop) / 2, (sx.start + sx.stop) / 2
        best, dist = None, 14
        for j in big:
            by, bx = objs[j]
            d = max(by.start - cy, cy - by.stop, bx.start - cx, cx - bx.stop, 0)
            if d < dist:
                best, dist = j, d
        if best is not None:
            owner[i] = best
    out = []
    for j in big:
        keep = np.isin(lab, [i + 1 for i, o in owner.items() if o == j])
        ys, xs = np.where(keep)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        img = rgba[y0:y1, x0:x1].copy()
        img[:, :, 3] = np.where(keep[y0:y1, x0:x1], img[:, :, 3], 0)
        out.append({'img': img, 'y0': y0, 'x0': x0, 'h': y1 - y0, 'w': x1 - x0})
    return out


def feet_x(img):
    """Centro dos pés: média das colunas com tinta nos 15% de baixo."""
    a = img[:, :, 3] > 40
    low = a[int(a.shape[0] * 0.85):]
    xs = np.where(low.any(0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else a.shape[1] / 2


def place(img, scale, cell):
    """Coloca o recorte no quadro: pés centralizados e apoiados em FEET."""
    h, w = img.shape[:2]
    pic = Image.fromarray(img).resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (cell, cell))
    left = round(cell / 2 - feet_x(img) * scale)
    top = round(cell * FEET - pic.height)
    if left < 0 or top < 0 or left + pic.width > cell:
        print('  aviso: recorte encostou na borda', left, top, pic.width, cell)
    canvas.alpha_composite(pic, (left, top)) if left >= 0 and top >= 0 else canvas.paste(pic, (left, top), pic)
    return canvas


def save(frames, cols, cell, name):
    rows = (len(frames) + cols - 1) // cols
    atlas = Image.new('RGBA', (cols * cell, rows * cell))
    for k, f in enumerate(frames):
        atlas.alpha_composite(f, ((k % cols) * cell, (k // cols) * cell))
    atlas.save(OUT / name, 'WEBP', quality=86, method=6)
    print(name, atlas.size, round((OUT / name).stat().st_size / 1024), 'KB')


def standing(items):
    return float(np.median([p['h'] for p in items]))


def duo(name, cell=256):
    found = pieces(SRC / name)
    assert len(found) == 48, (name, len(found))
    rows = sorted(found, key=lambda p: p['y0'])
    grid = [sorted(rows[r * 12:(r + 1) * 12], key=lambda p: p['x0']) for r in range(4)]
    partner, jorge = [], []
    for r in range(4):
        for f in range(6):
            a, b = grid[r][2 * f], grid[r][2 * f + 1]
            if f == 5:   # no quadro 6 eles já se cruzaram: Jorge à esquerda
                a, b = b, a
            partner.append(a)
            jorge.append(b)
    scale = JORGE * cell / standing(jorge)
    frames = []
    for r in range(4):
        frames += [place(p['img'], scale, cell) for p in partner[r * 6:(r + 1) * 6]]
        frames += [place(p['img'], scale, cell) for p in jorge[r * 6:(r + 1) * 6]]
    return frames, standing(partner) * scale / cell


def solo(name, cols, ratio, cell=300):
    found = [p for p in pieces(SRC / name) if p['h'] > 120]   # o balão desenhado fica de fora
    assert len(found) == 24, (name, len(found))
    rows = sorted(found, key=lambda p: p['y0'])
    order = []
    for r in range(3 if cols == 8 else 4):
        order += sorted(rows[r * cols:(r + 1) * cols], key=lambda p: p['x0'])
    walking = [p['h'] for p in order[:8]]
    scale = ratio * cell / float(np.median(walking))
    scale = min(scale, (FEET - 0.01) * cell / max(p['h'] for p in order))
    return [place(p['img'], scale, cell) for p in order]


def sea():
    img = Image.open(SRC / 'mar.png').convert('RGBA')
    half = img.width // 2
    pitch = img.height // 12
    strips = []
    for c in range(2):
        for r in range(12):
            strip = img.crop((c * half, r * pitch, (c + 1) * half, (r + 1) * pitch))
            both = Image.new('RGBA', (half * 2, pitch))
            both.alpha_composite(strip, (0, 0))
            both.alpha_composite(strip.transpose(Image.FLIP_LEFT_RIGHT), (half, 0))  # emenda sem costura
            strips.append(both)
    atlas = Image.new('RGBA', (half * 2, pitch * 24))
    for k, s in enumerate(strips):
        atlas.alpha_composite(s, (0, k * pitch))
    atlas.save(OUT / 'surf-mar.webp', 'WEBP', quality=78, method=6)
    print('surf-mar.webp', atlas.size, 'faixa', pitch, round((OUT / 'surf-mar.webp').stat().st_size / 1024), 'KB')


ratios = {}
for who in ['ze', 'niko', 'brisa']:
    frames, ratios[who] = duo(f'duo-{who}-jorge.png')
    save(frames, 12, 256, f'surf-duo-{who}.webp')
save(solo('niko-solo.png', 8, ratios['niko']), 8, 300, 'surf-niko.webp')
save(solo('brisa-solo.png', 6, ratios['brisa']), 8, 300, 'surf-brisa.webp')
sea()
