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
    ('ok', ['card', 'hover'], 'status icon'), ('warn', ['card', 'hover'], 'status icon'),
    ('bad', ['card', 'hover'], 'status icon'), ('info', ['card', 'hover'], 'status icon'),
]
INFO = [('border', ['card'], 'hairline, decorative'), ('seam-a', ['card'], 'seam ends, decorative'),
        ('seam-b', ['card'], 'seam centre, decorative'), ('tile-edge', ['mast'], 'mark tile frame, decorative'),
        ('warn', ['live'], 'amber against brass: must differ in hue, not in luminance')]

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
    # amber and brass must not be the same colour again (the defect both reviews found): at least 25 units on one channel
    w, g = (tuple(int(tok[k][i:i + 2], 16) for i in (1, 3, 5)) for k in ('warn', 'live'))
    gap = max(abs(a - b) for a, b in zip(w, g))
    if gap < 25: fail += 1
    print(f'  hue  warn {tok["warn"]} vs live {tok["live"]}: largest channel gap {gap}  {"ok" if gap >= 25 else "FAIL"}')

# Every colour the page paints must be a token: no stray hex in CSS outside the token blocks, none in markup attributes.
style = re.search(r'<style>(.*?)</style>', HTML, re.S).group(1)
stray = re.findall(r'#[0-9A-Fa-f]{3,8}\b', re.sub(r'\{[^{}]*--canvas:[^{}]*\}', '', style))
stray += re.findall(r'(?:fill|stroke|style|color)="[^"]*#[0-9A-Fa-f]{3,8}', HTML)
if stray: fail += 1; print('FAIL colour outside the token blocks:', stray)

print(f'lowest text contrast: {lowest:.2f}')
if fail: sys.exit(f'{fail} contrast failures')
print('all pairs pass')
