#!/usr/bin/env python3
"""Contrast proof for joy-combined-theme.html. Reads the token values out of the delivered file (not a copy),
checks every text/background pair and every state mark / control boundary the page uses, and the geometry that
keeps words and the mark on the night end of the gradient. Exits non-zero on a failure.
lum and cr are the functions from ../gen.py."""
import math, pathlib, re, sys

HTML = pathlib.Path(__file__).with_name('joy-combined-theme.html').read_text()


def lum(h):
    h = h.lstrip('#'); r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def cr(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


assert round(cr('#000000', '#ffffff'), 1) == 21.0 and round(cr('#777777', '#ffffff'), 2) == 4.48


def _lin(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def _gam(c): c = max(0.0, min(1.0, c)); return round(255 * (12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055))


def oklab(h):
    r, g, b = (_lin(int(h[i:i + 2], 16) / 255) for i in (1, 3, 5))
    l, m, s = ((0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3), (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3),
               (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3))
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def unlab(L, a, b):
    l, m, s = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return '#%02X%02X%02X' % (_gam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), _gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
                              _gam(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s))


def lch(h):
    L, a, b = oklab(h); return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360


def hue_gap(a, b):
    d = abs(lch(a)[2] - lch(b)[2]); return min(d, 360 - d)


def ramp(stops, tok, space):
    """The gradient as the browser draws it, one colour per 1%: space is 'oklab' (the declared mix) or 'srgb' (the fallback)."""
    out = []
    for pct in range(101):
        i = max(k for k, (_, p) in enumerate(stops) if p <= pct); j = min(i + 1, len(stops) - 1)
        (na, pa), (nb, pb) = stops[i], stops[j]; t = (pct - pa) / (pb - pa) if pb > pa else 0
        if space == 'oklab':
            out.append(unlab(*(x + (y - x) * t for x, y in zip(oklab(tok[na]), oklab(tok[nb])))))
        else:
            out.append('#%02X%02X%02X' % tuple(round(int(tok[na][k:k + 2], 16) * (1 - t) + int(tok[nb][k:k + 2], 16) * t) for k in (1, 3, 5)))
    return out


assert unlab(*oklab('#C7743F')) == '#C7743F' and round(lch('#FF00FF')[2]) == 328 and round(hue_gap('#FF0000', '#0000FF')) == 125


def block(mode):
    return re.search(r'\.t-%s\{([^}]*)\}' % mode, HTML).group(1)


def px(name):
    return float(re.search(r'--%s:([\d.]+)px' % name, HTML).group(1))


# (foreground, backgrounds, why). ZONE = gradient stops that can be under the text zone, SUN = under the big mark.
TEXT = [  # needs 4.5
    ('text', ['card', 'canvas', 'hover'], 'body text, table, tabs, deck, outline button label; hover is row and button hover'),
    ('muted', ['card', 'canvas'], 'secondary text, column heads, chart labels, not-started status'),
    ('mast-text', ['mast', 'mast-hover'], 'masthead title, week range, outline button on the masthead'),
    ('action-fg', ['action', 'action-hover'], 'gold main action label, rest and hover'),
    ('solid-fg', ['solid', 'solid-hover'], 'End call label, rest and hover'),
    ('pill-fg', ['pill'], 'Live pill label'),
    ('ok', ['card', 'hover'], 'status word: on track, done'),
    ('warn', ['card', 'hover'], 'status word: behind'),
    ('bad', ['card', 'hover'], 'status word: off track, error'),
    ('info', ['card', 'hover'], 'status word: queued'),
    ('sky-text', ['ZONE'], 'all text on the call gradient'),
]
MARK = [  # needs 3.0
    ('muted', ['card', 'canvas'], 'control boundary: outline buttons, unlit diamonds'),
    ('mast-ctl', ['mast'], 'control boundary on the masthead'),
    ('action', ['mast'], 'gold button against the masthead'),
    ('action-edge', ['card', 'canvas'], 'gold button edge when it sits on a porcelain surface'),
    ('solid', ['card'], 'End call against the deck'),
    ('text', ['card', 'canvas'], 'focus ring, selected tab rule, progress steps, chart diamonds'),
    ('mast-text', ['mast'], 'focus ring on the masthead'),
    ('live', ['card'], 'lit voice level, today column, running job'),
    ('pill', ['sky-1', 'sky-2'], 'Live pill against the top of the gradient'),
    ('sun', ['SUN'], 'the large mark on the gradient'),
    ('mark', ['tile'], 'brand diamond on its tile'),
    ('seam-b', ['card', 'canvas'], 'seam, shaded facet: the half that carries the seam on a porcelain surface'),
    ('seam-a', ['mast'], 'seam, lit facet: the half that lies on the masthead'),
    ('ok', ['card', 'hover'], 'status icon'), ('warn', ['card', 'hover'], 'status icon'),
    ('bad', ['card', 'hover'], 'status icon'), ('info', ['card', 'hover'], 'status icon'),
]
INFO = [('border', ['card'], 'hairline, decorative'), ('seam-a', ['card'], 'seam, lit facet on a surface: the highlight, not what carries it'),
        ('tile-edge', ['mast'], 'mark tile frame, decorative'),
        ('warn', ['live'], 'amber against brass: must differ in hue, not in luminance')]
GOLDS = ('live', 'action', 'action-edge', 'pill', 'mark', 'sun', 'seam-a', 'seam-b')

fail, lowest = 0, 99.0
H = px('sky-h')
for mode in ('light', 'dark'):
    css = block(mode)
    tok = dict(re.findall(r'--([\w-]+):(#[0-9A-Fa-f]{6})\b', css))
    stops = [(n, int(p)) for n, p in re.findall(r'var\(--(sky-\d)\) (\d+)%', css)]
    angle = math.radians(float(re.search(r'--sky-angle:(\d+)deg', css).group(1)))
    sx, sy = math.sin(angle), -math.cos(angle)

    def reach(y, xs):
        """Furthest point along the gradient line (0-100) touched at height y, over the frame widths in use."""
        return max(0.5 + ((x - W / 2) * sx + (y - H / 2) * sy) / (abs(W * sx) + abs(H * sy)) for W in (288, 358, 390) for x in xs(W)) * 100

    def under(r):
        # channels interpolate monotonically between two stops, so luminance there is bounded by the two stops:
        # test every stop up to and including the first one at or past the reach.
        return [n for i, (n, p) in enumerate(stops) if i == 0 or stops[i - 1][1] < r]

    zone = reach(px('zone-h'), lambda W: (0, W))                     # text spans the full width
    # a diamond's furthest point along the gradient is its bottom tip, on the centre line; +5 is the mitred outline stroke
    sun = reach(px('sun-y') + px('sun-r') + 5, lambda W: (W / 2,))
    area = {'ZONE': under(zone), 'SUN': under(sun)}
    print(f'{mode}: text reaches {zone:.1f}% of the gradient ({", ".join(tok[n] for n in area["ZONE"])}); '
          f'the mark reaches {sun:.1f}% ({", ".join(tok[n] for n in area["SUN"])})')
    for group, need in ((TEXT, 4.5), (MARK, 3.0), (INFO, 0)):
        for fg, bgs, why in group:
            for bg in [b for name in bgs for b in area.get(name, [name])]:
                v = cr(tok[fg], tok[bg]); ok = v >= need; fail += not ok
                if group is TEXT: lowest = min(lowest, v)
                print(f'  {"text" if need == 4.5 else "mark" if need else "info"} {fg:<11} {tok[fg]} on {bg:<12} {tok[bg]} {v:5.2f}  '
                      f'{"ok" if ok else "FAIL"}{"" if need else " (not required)"}  {why}')
    # amber must not sit in the gold hue family again (the defect three reviews found): oklch hue, 25 degrees from every gold, 20 from red
    for k, need in [(g, 25) for g in GOLDS] + [('bad', 20)]:
        gap = hue_gap(tok['warn'], tok[k]); ok = gap >= need; fail += not ok
        print(f'  hue  warn {tok["warn"]} vs {k:<11} {tok[k]} {gap:5.1f} deg (need {need})  {"ok" if ok else "FAIL"}')
    # a seam must read as gold, not brown or grey: saturated, in the gold hue band
    for k in ('seam-a', 'seam-b'):
        L, C, h = lch(tok[k]); ok = C >= 0.10 and 70 <= h <= 95; fail += not ok
        print(f'  gold {k} {tok[k]} chroma {C:.3f} hue {h:.0f}  {"ok" if ok else "FAIL"}')
    # the gradient as drawn, both mixes: no purple or mauve, no mid-light grey, and it only gets lighter
    for space in ('oklab', 'srgb'):
        r = ramp(stops, tok, space); bad = []
        for pct, c in enumerate(r):
            L, C, h = lch(c)
            if C > 0.02 and (h > 285 or h < 20): bad.append(f'{pct}% {c} purple (hue {h:.0f})')
            if C < 0.03 and L > 0.27: bad.append(f'{pct}% {c} grey')
            if pct and L < lch(r[pct - 1])[0] - 0.004: bad.append(f'{pct}% {c} darker than the step before')
        fail += bool(bad)
        grey = min(r, key=lambda c: lch(c)[1])
        print(f'  sky  {space:<5} mix: least saturated point {grey} (lightness {lch(grey)[0]:.2f})  {"ok" if not bad else "FAIL " + "; ".join(bad)}')
        # text and the mark against the colours actually under them, not only the stops
        for fg, name, need, r_to in (('sky-text', 'text', 4.5, zone), ('sun', 'mark', 3.0, sun)):
            worst = min(cr(tok[fg], c) for c in r[:math.ceil(r_to) + 1]); ok = worst >= need; fail += not ok
            if fg == 'sky-text': lowest = min(lowest, worst)
            print(f'  sky  {space:<5} mix: {name} {tok[fg]} worst {worst:5.2f} over 0-{math.ceil(r_to)}%  {"ok" if ok else "FAIL"}')

# Every colour the page paints must be a token: no stray hex in CSS outside the token blocks, none in markup attributes.
style = re.search(r'<style>(.*?)</style>', HTML, re.S).group(1)
stray = re.findall(r'#[0-9A-Fa-f]{3,8}\b', re.sub(r'\{[^{}]*--canvas:[^{}]*\}', '', style))
stray += re.findall(r'(?:fill|stroke|style|color)="[^"]*#[0-9A-Fa-f]{3,8}', HTML)
if stray: fail += 1; print('FAIL colour outside the token blocks:', stray)

print(f'lowest text contrast: {lowest:.2f}')
if fail: sys.exit(f'{fail} contrast failures')
print('all pairs pass')
