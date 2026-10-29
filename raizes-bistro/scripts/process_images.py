"""Gera os assets do site a partir das fotos enviadas pelo cliente.

Uso:
    python3 -I scripts/process_images.py <pasta "pratos_raízes"> <pasta public/>

Saídas:
    public/images/pratos/<slug>.webp   prato recortado em círculo (fundo transparente), visto de cima, 640px
    public/images/pratos/sm/<slug>.webp  mesma coisa em 360px para celular
    public/images/site/<nome>.webp     fotos complementares otimizadas
    public/brand/logo-*.png|webp       logo em versão clara e escura, fundo transparente
    public/images/textures/lazy-susan.webp  madeira da mesa giratória (gerada proceduralmente)

Requer: pillow, numpy, opencv-python-headless.
"""

import glob
import json
import os
import re
import sys
import unicodedata

import cv2
import numpy as np
from PIL import Image, ImageDraw

SRC, PUBLIC = sys.argv[1], sys.argv[2]
DISH_DIRS = ["entradas", "sugestao_chef", "principal", "sobremesa/pratos_raizes"]
# Pratos em que o prato ocupa a foto inteira: recorta o círculo inscrito em vez de detectar a borda.
FULL_FRAME = {"lagostim-a-thermidor", "steak-de-mignon-a-la-parmegiana"}
SITE_PHOTOS = [
    "foto-local", "foto-carpaccio", "foto01", "imagem-ambiente", "imagem-ambiente2", "imagem-ambiente3",
    "imagem-ambiente4", "imagem-bebida", "imagem-chef", "imagem-chef2", "imagem-exemplo2", "imagem-exemplo3",
    "imagem-exemplo5", "imagem-exemplo6", "imagem-exemplo7", "imagem-mesa_pessoas", "imagem-mesa_taça",
    "imagem-mesa_taça2", "imagem-mesa_taça3", "imagem-mesa_taça_vinho", "imagem-qeuijo", "imagem-vinho",
    "midia-base", "midia-fundo", "cardapio-hoje", "cardapio-modelo", "cardapio-fisico",
]


def slugify(name):
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    name = re.sub(r"^prato-", "", name.strip().lower())
    return re.sub(r"[^a-z0-9]+", "-", name).strip("-")


def find_plate(img):
    """Acha a borda do prato (maior círculo próximo do centro) com HoughCircles."""
    h, w = img.shape[:2]
    s = min(h, w)
    k = w / 512
    small = cv2.resize(img, (512, int(512 * h / w)))
    gray = cv2.medianBlur(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY), 5)
    for p2 in (60, 45, 35, 28):
        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=40, param1=90, param2=p2,
                                   minRadius=int(0.30 * s / k), maxRadius=int(0.52 * s / k))
        if circles is None:
            continue
        cx, cy = small.shape[1] / 2, small.shape[0] / 2

        def score(c):
            x, y, r = c
            inside = min(x - r, y - r, small.shape[1] - x - r, small.shape[0] - y - r)
            return r - 1.5 * np.hypot(x - cx, y - cy) + (0 if inside > -8 else inside * 3)

        x, y, r = max(circles[0], key=score)
        return x * k, y * k, r * k
    return w / 2, h / 2, s * 0.46


def cut_plate(path, slug, out_dir, sizes=((640, ""), (360, "sm"))):
    pil = Image.open(path).convert("RGB")
    w, h = pil.size
    if slug in FULL_FRAME:
        x, y, r = w / 2, h / 2, min(w, h) / 2
    else:
        x, y, r = find_plate(cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR))
        r = min(r * 1.02, x, y, w - x, h - y)
    d = int(2 * r)
    x0, y0 = int(x - r), int(y - r)
    square = pil.crop((x0, y0, x0 + d, y0 + d))
    for size, sub in sizes:
        crop = square.resize((size, size), Image.LANCZOS)
        mask = Image.new("L", (size * 4, size * 4), 0)
        ImageDraw.Draw(mask).ellipse((3, 3, size * 4 - 3, size * 4 - 3), fill=255)
        crop.putalpha(mask.resize((size, size), Image.LANCZOS))
        os.makedirs(os.path.join(out_dir, sub), exist_ok=True)
        crop.save(os.path.join(out_dir, sub, slug + ".webp"), quality=80, method=6)
    return {"src": os.path.basename(path), "circle": [round(float(v)) for v in (x, y, r)]}


def export_photo(path, out_dir, max_side=1600):
    im = Image.open(path).convert("RGB")
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    name = slugify(os.path.splitext(os.path.basename(path))[0])
    im.save(os.path.join(out_dir, name + ".webp"), quality=80, method=6)
    return name, im.size


def export_logo(path, out_dir):
    """Logo original é branco sobre preto: usa a luminância como alfa."""
    im = Image.open(path).convert("L")
    alpha = im.point(lambda v: 0 if v < 40 else min(255, int((v - 40) * 255 / 180)))
    bbox = alpha.getbbox()
    alpha = alpha.crop(bbox)
    for name, rgb in (("logo-light", (243, 236, 224)), ("logo-dark", (43, 26, 18))):
        logo = Image.new("RGBA", alpha.size, rgb + (0,))
        logo.putalpha(alpha)
        logo.save(os.path.join(out_dir, name + ".png"), optimize=True)
        for width, suffix in ((640, ""), (320, "-sm")):
            small = logo.resize((width, round(width * logo.size[1] / logo.size[0])), Image.LANCZOS)
            small.save(os.path.join(out_dir, name + suffix + ".webp"), quality=88, method=6)


def fbm(h, w, rng, base, octaves=4, aspect=1.0):
    """Ruído suave em oitavas; aspect < 1 estica o ruído na horizontal (fibras da madeira)."""
    acc = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for octave in range(octaves):
        cells = base * 2 ** octave
        grid = rng.random((max(2, int(cells)), max(2, int(cells * aspect)))).astype(np.float32)
        acc += amp * cv2.resize(grid, (w, h), interpolation=cv2.INTER_CUBIC)
        total += amp
        amp *= 0.5
    return acc / total


def lazy_susan(out_dir, size=1800):
    """Tampo giratório em nogueira: veio longitudinal com distorção suave, chanfro e luz de vela."""
    rng = np.random.default_rng(11)
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32) / size
    v = yy * 48 + fbm(size, size, rng, 3) * 5.5 + fbm(size, size, rng, 8, 3) * 1.2
    ring = 0.5 + 0.5 * np.sin(v * 2 * np.pi)
    fiber = fbm(size, size, rng, 320, 3, aspect=0.06)
    tone = fbm(size, size, rng, 2, 2)
    t = 0.58 - 0.20 * ring ** 12 + 0.55 * (fiber - fiber.mean()) + 0.22 * (tone - 0.5) + 0.12 * (ring - 0.5)
    t = np.clip(t, 0, 1)[..., None]
    dark, mid, light = (np.array(c, np.float32) for c in ((30, 16, 10), (88, 50, 30), (138, 86, 52)))
    rgb = np.where(t < 0.5, dark + (mid - dark) * (t / 0.5), mid + (light - mid) * ((t - 0.5) / 0.5))

    c = (size - 1) / 2
    px, py = xx * size - c, yy * size - c
    r = np.hypot(px, py) / c
    glow = np.exp(-(((xx - 0.33) ** 2 + (yy - 0.28) ** 2) / (2 * 0.28 ** 2)))
    rgb = rgb * (0.72 + 0.3 * np.clip(1 - r, 0, 1) ** 0.5)[..., None] + glow[..., None] * np.array([40, 24, 10], np.float32)
    rgb = rgb * (1 - 0.55 * np.clip((r - 0.955) / 0.045, 0, 1) ** 1.5)[..., None]
    highlight = np.clip(1 - np.abs(r - 0.95) / 0.006, 0, 1) * np.clip(0.5 - 0.5 * np.sin(np.arctan2(py, px)), 0, 1)
    rgb = rgb + (highlight * 28)[..., None]
    alpha = np.clip((1 - r) * size / 2.5, 0, 1) * 255
    img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8), "RGBA")
    img.save(os.path.join(out_dir, "lazy-susan.webp"), quality=84, method=6)


def main():
    dishes_out = os.path.join(PUBLIC, "images", "pratos")
    site_out = os.path.join(PUBLIC, "images", "site")
    tex_out = os.path.join(PUBLIC, "images", "textures")
    brand_out = os.path.join(PUBLIC, "brand")
    for d in (dishes_out, site_out, tex_out, brand_out):
        os.makedirs(d, exist_ok=True)

    manifest = {}
    for folder in DISH_DIRS:
        for path in sorted(glob.glob(os.path.join(SRC, folder, "*"))):
            slug = slugify(os.path.splitext(os.path.basename(path))[0])
            manifest[slug] = cut_plate(path, slug, dishes_out)
    with open(os.path.join(dishes_out, "_manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1, ensure_ascii=False)

    comp = os.path.join(SRC, "fotos complementares")
    sizes = {}
    for name in SITE_PHOTOS:
        path = os.path.join(comp, name + ".jfif")
        if not os.path.exists(path):
            path = os.path.join(comp, "fotos complementares", name + ".jfif")
        slug, size = export_photo(path, site_out)
        sizes[slug] = size
    with open(os.path.join(site_out, "_sizes.json"), "w") as f:
        json.dump(sizes, f, indent=1)

    export_logo(os.path.join(comp, "logo-raizes.jfif"), brand_out)
    lazy_susan(tex_out)
    print(f"{len(manifest)} pratos, {len(sizes)} fotos")


if __name__ == "__main__":
    main()
