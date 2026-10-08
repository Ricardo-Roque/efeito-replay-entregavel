"""Gera os assets de marca do Código da Reconquista (SVG com texto em contorno + PNG do PWA).

Uso, na raiz do projeto:
    pip install fonttools brotli pillow
    python design/scripts/build-brand.py

Lê as fontes de brand/fonts/ e grava em brand/. Os SVGs têm o texto convertido em contorno,
então não dependem da fonte instalada.
"""
import sys
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from PIL import Image, ImageDraw, ImageFont

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2]
FONTS = OUT / "brand" / "fonts"
HERE = Path(tempfile.mkdtemp(prefix="cr-brand-"))  # instâncias estáticas das fontes variáveis

WINE_900 = "#3D0D1A"
WINE_700 = "#5A1426"
GOLD_500 = "#B08A4F"
GOLD_200 = "#D9B97A"
IVORY = "#FBF7F1"


def instance(src: str, axes: dict, name: str) -> TTFont:
    path = HERE / name
    font = instantiateVariableFont(TTFont(FONTS / src), axes)
    font.flavor = None
    font.save(path)
    return TTFont(path)


PF_BOLD = instance("playfair-display-var.woff2", {"wght": 700}, "pf-700.ttf")



def text_path(font: TTFont, text: str, size: float, x: float, y: float, tracking: float = 0.0):
    """Devolve (d, largura) do texto em contorno, baseline em y."""
    upem = font["head"].unitsPerEm
    scale = size / upem
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]
    pen = SVGPathPen(gs)
    cursor = 0.0
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            raise ValueError(f"glyph ausente: {ch!r}")
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x + cursor, y))
        gs[name].draw(tpen)
        cursor += hmtx[name][0] * scale + tracking * size
    return pen.getCommands(), cursor - tracking * size


def width(font, text, size, tracking=0.0):
    return text_path(font, text, size, 0, 0, tracking)[1]


def svg(w, h, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
        f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">\n'
        f"<title>{title}</title>\n{body}\n</svg>\n"
    )


def write(rel, content):
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print("ok", rel)


TRACK = -0.02

# ---------- Logo em duas linhas (login, celebração) ----------
size = 96
l1, w1 = text_path(PF_BOLD, "Código da", size, 0, 0, TRACK)
l2, w2 = text_path(PF_BOLD, "Reconquista", size, 0, 0, TRACK)
W = max(w1, w2) + 8
d1, _ = text_path(PF_BOLD, "Código da", size, 4, 92, TRACK)
d2, _ = text_path(PF_BOLD, "Reconquista", size, 4, 192, TRACK)
H = 222
write(
    "brand/logo-wordmark.svg",
    svg(W, H, f'<path fill="{WINE_700}" d="{d1}"/>\n<path fill="{GOLD_500}" d="{d2}"/>', "Código da Reconquista"),
)
# Versão para fundo vinho
write(
    "brand/logo-wordmark-on-wine.svg",
    svg(W, H, f'<path fill="{IVORY}" d="{d1}"/>\n<path fill="{GOLD_200}" d="{d2}"/>', "Código da Reconquista"),
)

# ---------- Logo em uma linha (cabeçalho do app) ----------
size = 64
a, wa = text_path(PF_BOLD, "Código da ", size, 0, 0, TRACK)
W = wa + width(PF_BOLD, "Reconquista", size, TRACK) + 8
da, _ = text_path(PF_BOLD, "Código da ", size, 4, 62, TRACK)
db, _ = text_path(PF_BOLD, "Reconquista", size, 4 + wa, 62, TRACK)
write(
    "brand/logo-inline.svg",
    svg(W, 80, f'<path fill="{WINE_700}" d="{da}"/>\n<path fill="{GOLD_500}" d="{db}"/>', "Código da Reconquista"),
)


# ---------- Monograma CR (ícone do app, favicon) ----------
def monogram_body(s: float, rounded: float, frame: bool = True):
    """Quadrado vinho, faixa lateral mais escura com filete dourado (como o PDF) e 'CR' dourado."""
    fs = s * 0.5
    wc = width(PF_BOLD, "CR", fs, -0.03)
    x = (s - wc) / 2 + s * 0.035
    d, _ = text_path(PF_BOLD, "CR", fs, x, s * 0.66, -0.03)
    band = s * 0.11
    parts = [
        f'<rect width="{s}" height="{s}" rx="{rounded}" fill="{WINE_700}"/>',
        f'<clipPath id="c"><rect width="{s}" height="{s}" rx="{rounded}"/></clipPath>',
        f'<g clip-path="url(#c)"><rect width="{band:.1f}" height="{s}" fill="{WINE_900}"/>'
        f'<rect x="{band * 0.62:.1f}" width="{s * 0.008:.1f}" height="{s}" fill="{GOLD_500}" opacity=".85"/></g>',
        f'<path fill="{GOLD_200}" d="{d}"/>',
    ]
    if frame:
        m = s * 0.2
        parts.append(
            f'<line x1="{m + band * 0.4:.1f}" x2="{s - m:.1f}" y1="{s * 0.78:.1f}" y2="{s * 0.78:.1f}" '
            f'stroke="{GOLD_500}" stroke-width="{s * 0.008:.1f}"/>'
        )
    return "\n".join(parts)


write("brand/monogram.svg", svg(512, 512, monogram_body(512, 96), "Código da Reconquista"))
write("brand/favicon.svg", svg(64, 64, monogram_body(64, 14, frame=False), "Código da Reconquista"))


# ---------- Emblemas das fases (numeral romano em anel dourado) ----------
def emblem(numeral: str, fill: str, ring: str, ink: str, title: str):
    s = 120
    fs = 46 if len(numeral) < 3 else 38
    w = width(PF_BOLD, numeral, fs)
    d, _ = text_path(PF_BOLD, numeral, fs, (s - w) / 2, 76, 0)
    body = (
        f'<circle cx="60" cy="60" r="58" fill="{fill}"/>'
        f'<circle cx="60" cy="60" r="54" fill="none" stroke="{ring}" stroke-width="1.5"/>'
        f'<circle cx="60" cy="60" r="49" fill="none" stroke="{ring}" stroke-width=".75" opacity=".6"/>'
        f'<path fill="{ink}" d="{d}"/>'
    )
    return svg(s, s, body, title)


fases = [
    ("I", "Fase 1 · Reset emocional"),
    ("II", "Fase 2 · Nova comunicação"),
    ("III", "Fase 3 · Reconexão"),
    ("IV", "Fase 4 · Do contato ao reencontro"),
]
for i, (num, title) in enumerate(fases, 1):
    write(f"brand/emblems/fase-{i}.svg", emblem(num, IVORY, GOLD_500, WINE_700, title))
    write(f"brand/emblems/fase-{i}-on-wine.svg", emblem(num, WINE_700, GOLD_200, GOLD_200, title))


# ---------- Medalhas de conquista ----------
FIG_FONT = instance("figtree-var.woff2", {"wght": 700}, "fig.ttf")


def badge(big: str, small: str, title: str):
    """Medalha vinho com anel duplo dourado, numeral em Playfair e legenda em duas linhas."""
    s = 160
    fs = 56
    w = width(PF_BOLD, big, fs)
    d, _ = text_path(PF_BOLD, big, fs, (s - w) / 2, 90, 0)
    sfs = 8.5
    lines = small.split("|")
    parts = []
    for i, line in enumerate(lines):
        sw = width(FIG_FONT, line, sfs, 0.14)
        dl, _ = text_path(FIG_FONT, line, sfs, (s - sw) / 2, 110 + i * 11, 0.14)
        parts.append(f'<path fill="{IVORY}" d="{dl}"/>')
    body = (
        f'<circle cx="80" cy="80" r="70" fill="{WINE_700}"/>'
        f'<circle cx="80" cy="80" r="64" fill="none" stroke="{GOLD_200}" stroke-width="1.5"/>'
        f'<circle cx="80" cy="80" r="59" fill="none" stroke="{GOLD_200}" stroke-width=".75" opacity=".55"/>'
        f'<line x1="62" x2="98" y1="99" y2="99" stroke="{GOLD_500}" stroke-width="1"/>'
        f'<path fill="{GOLD_200}" d="{d}"/>' + "".join(parts)
    )
    return svg(s, s, body, title)


write("brand/badges/sem-impulso-7.svg", badge("7", "DIAS SEM|IMPULSO", "7 dias sem agir por impulso"))
write("brand/badges/dia-14.svg", badge("14", "DIAS DE|CONSTÂNCIA", "14 dias de plano"))
write("brand/badges/dia-21.svg", badge("21", "DIAS|COMPLETOS", "Protocolo de 21 dias concluído"))
for i, num in enumerate(["I", "II", "III", "IV"], 1):
    write(f"brand/badges/fase-{i}-concluida.svg", badge(num, "FASE|CONCLUÍDA", f"Fase {i} concluída"))


# ---------- PNGs do PWA ----------
def png_icon(size: int, maskable: bool, rel: str):
    scale = 4
    S = size * scale
    img = Image.new("RGB", (S, S), WINE_700)
    dr = ImageDraw.Draw(img)
    band = int(S * (0.0 if maskable else 0.11))
    if band:
        dr.rectangle([0, 0, band, S], fill=WINE_900)
        x = int(band * 0.62)
        dr.rectangle([x, 0, x + max(1, int(S * 0.008)), S], fill=GOLD_500)
    content = 0.72 if maskable else 1.0  # área segura do maskable
    fs = int(S * 0.5 * content)
    font = ImageFont.truetype(str(HERE / "pf-700.ttf"), fs)
    bbox = dr.textbbox((0, 0), "CR", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx = S / 2 + (0 if maskable else S * 0.035)
    dr.text((cx - tw / 2 - bbox[0], S * 0.47 - th / 2 - bbox[1]), "CR", font=font, fill=GOLD_200)
    ly = int(S * (0.5 + 0.28 * content))
    m = S * (0.5 - 0.3 * content)
    dr.rectangle([int(m + band * 0.4), ly, int(S - m), ly + max(1, int(S * 0.008))], fill=GOLD_500)
    img = img.resize((size, size), Image.LANCZOS)
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)
    print("ok", rel)


png_icon(192, False, "brand/icons/icon-192.png")
png_icon(512, False, "brand/icons/icon-512.png")
png_icon(512, True, "brand/icons/icon-maskable-512.png")
png_icon(180, False, "brand/icons/apple-touch-180.png")
png_icon(32, False, "brand/icons/favicon-32.png")
