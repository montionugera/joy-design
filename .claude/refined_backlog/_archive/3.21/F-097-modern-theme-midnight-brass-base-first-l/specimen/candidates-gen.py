"""Joy Design theme candidates: one data list -> contrast report + static specimen page."""
import html, sys

def lum(h):
    h = h.lstrip('#'); r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def cr(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

assert round(cr('#000000', '#ffffff'), 1) == 21.0 and round(cr('#777777', '#ffffff'), 2) == 4.48

def mode(canvas, card, text, muted, border, action, action_fg, grad=None):
    return dict(canvas=canvas, card=card, text=text, muted=muted, border=border,
                action=action, action_fg=action_fg, grad=grad or canvas)

THEMES = [
 dict(key='brass', name='Midnight Brass', strategy='Restrained', proposed=True,
      idea='Today’s navy and gold, tightened. Cream is swapped for a cool porcelain tinted toward the navy, corners go sharp, and gold becomes a brass sheen used only where something is live.',
      gradient='Brass sheen on the mark and live states only; a faint navy glow behind dark screens.',
      radius=3, live=['#F4E6CA', '#DAB362', '#A5802B'], live_fg='#150B00', tile='#14253E', seam=False,
      light=mode('#F3F5F9', '#FFFFFF', '#14253E', '#4E5F7B', '#D5DBE6', '#14253E', '#F3F5F9',
                 'linear-gradient(180deg,#FFFFFF 0%,#F3F5F9 45%)'),
      dark=mode('#0A121F', '#111B2B', '#EEF2F8', '#A9B4C6', '#223250', '#DAB362', '#150B00',
                'radial-gradient(120% 70% at 50% 0%,#16294A 0%,#0A121F 62%)')),
 dict(key='firstlight', name='First Light', strategy='Committed, gradient-led', proposed=True,
      idea='The minute before sunrise: night navy lifting through dusk violet into copper and gold. The gradient is the signature surface for the call screen and brand moments; everything else stays flat.',
      gradient='Full horizon gradient as the screen background; the same warm end as the live colour.',
      radius=14, live=['#E08A4E', '#F2C27E'], live_fg='#2A1505', tile='#1A1F45', seam=False,
      light=mode('#F8F3EF', '#FFFFFF', '#1A1F45', '#555A7F', '#E8DCD3', '#1A1F45', '#FBF3E9',
                 'linear-gradient(180deg,#FCE0C8 0%,#FBF1E6 40%,#F5F2F3 100%)'),
      dark=mode('#0B1226', '#141A36', '#FBF3E9', '#B7B6CC', '#2A3160', '#F0BE78', '#2A1505',
                'linear-gradient(172deg,#0B1226 0%,#1F2352 42%,#6B3A5B 70%,#C7774A 89%,#F0BE78 100%)')),
 dict(key='kintsugi', name='Kintsugi', strategy='Restrained, light-first', proposed=True,
      idea='Porcelain surfaces joined by thin gold seams. Gold never fills anything: it only draws lines, so the brand colour reads as craft instead of decoration.',
      gradient='Gold only as hairline seams that fade at both ends; a soft glaze highlight on cards.',
      radius=10, live=['#B8892B', '#E9CD94', '#B8892B'], live_fg='#2F1E00', tile='#14253E', seam=True,
      light=mode('#EFF1F3', '#FAFBFC', '#14253E', '#51607A', '#DADFE6', '#14253E', '#FAFBFC',
                 'linear-gradient(160deg,#F7F8FA 0%,#EFF1F3 55%,#E7EAEE 100%)'),
      dark=mode('#0F1724', '#161F2E', '#EDF0F4', '#A6AFBD', '#263246', '#EDF0F4', '#0F1724',
                'linear-gradient(160deg,#131C2B 0%,#0F1724 55%,#0B121D 100%)')),
 dict(key='velvet', name='Velvet', strategy='Departure, bold', proposed=True,
      idea='Navy deepens into aubergine, and gold softens into champagne and rose-gold. Plush, evening, clearly not a bank. The furthest from today’s brand.',
      gradient='Navy to plum across dark screens; rose-gold to champagne for live states.',
      radius=18, live=['#D9A38F', '#F0D7B5'], live_fg='#2A1420', tile='#2B1840', seam=False,
      light=mode('#F6F1F3', '#FFFFFF', '#24152F', '#67586F', '#E4D9E0', '#2B1840', '#F7EFEA',
                 'linear-gradient(180deg,#F1E6EC 0%,#F6F1F3 45%)'),
      dark=mode('#171226', '#211935', '#F7EFEA', '#BDB0C4', '#3A2D52', '#E9C9A8', '#2A1420',
                'linear-gradient(150deg,#101A30 0%,#1E1533 50%,#3A1A3A 100%)')),
 dict(key='charcoal', name='Charcoal and off-white', strategy='Reference only, not proposed', proposed=False,
      idea='The look asked about. Clean and safe, and with the logo hidden it could belong to any product launched this year.',
      gradient='None.',
      radius=8, live=['#1C1C1A', '#1C1C1A'], live_fg='#F5F4F0', tile='#1C1C1A', seam=False,
      light=mode('#F5F4F0', '#FFFFFF', '#1C1C1A', '#5F5E5A', '#E2E0DA', '#1C1C1A', '#F5F4F0'),
      dark=mode('#161616', '#1F1F1F', '#EDEDEA', '#A3A29D', '#2E2E2E', '#EDEDEA', '#161616')),
]
# the reference theme's dark live pill is light-on-dark inverted
THEMES[-1]['dark_live'] = (['#EDEDEA', '#EDEDEA'], '#161616')

LIT = {'brass': ('#A5802B', '#DAB362'), 'firstlight': ('#C96F35', '#F2C27E'), 'kintsugi': ('#9A7120', '#E9CD94'),
       'velvet': ('#B56E5A', '#F0D7B5'), 'charcoal': ('#1C1C1A', '#EDEDEA')}
def lit(t, m): return LIT[t['key']][m == 'dark']

def checks(t, m):
    d = t[m]
    live, live_fg = t.get('dark_live', (t['live'], t['live_fg'])) if m == 'dark' else (t['live'], t['live_fg'])
    rows = [('text on card', cr(d['text'], d['card']), 4.5), ('muted on card', cr(d['muted'], d['card']), 4.5),
            ('action label', cr(d['action_fg'], d['action']), 4.5),
            ('live label (worst stop)', min(cr(live_fg, s) for s in live), 4.5),
            ('lit level mark on card', cr(lit(t, m), d['card']), 3.0)]
    return rows

fail = 0
for t in THEMES:
    for m in ('light', 'dark'):
        for label, v, need in checks(t, m):
            ok = v >= need; fail += not ok
            print(f"{t['name']:<24}{m:<6}{label:<26}{v:5.2f}  {'ok' if ok else 'FAIL'}")
if fail: sys.exit(f"{fail} contrast failures")

def mark(t, uid, stops):
    g = ''.join(f'<stop offset="{i/(len(stops)-1):.2f}" stop-color="{s}"/>' for i, s in enumerate(stops))
    return (f'<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="{uid}" x1="0" y1="0" x2="1" y2="1">{g}</linearGradient></defs>'
            f'<rect width="32" height="32" rx="{min(t["radius"],8)}" fill="{t["tile"]}"/>'
            f'<path d="M16 4 28 16 16 28 4 16Z" fill="none" stroke="url(#{uid})" stroke-width="1.6"/>'
            f'<path d="M16 9 23 16 16 23 9 16Z" fill="url(#{uid})"/><circle cx="16" cy="16" r="1.6" fill="{t["tile"]}"/></svg>')

def panel(t, m):
    d = t[m]
    live, live_fg = t.get('dark_live', (t['live'], t['live_fg'])) if m == 'dark' else (t['live'], t['live_fg'])
    live_css = f"linear-gradient(100deg,{','.join(live)})"
    tile = t['tile'] if not (t['key'] == 'charcoal' and m == 'dark') else '#EDEDEA'
    tt = dict(t, tile=tile)
    style = (f"--canvas:{d['grad']};--card:{d['card']};--text:{d['text']};--muted:{d['muted']};--border:{d['border']};"
             f"--action:{d['action']};--action-fg:{d['action_fg']};--live:{live_css};--live-fg:{live_fg};--r:{t['radius']}px;--lit:{lit(t, m)};--seam:{live[len(live)//2]}")
    meter = ''.join(f'<i class="{"on" if i < 4 else ""}" style="--i:{i}"></i>' for i in range(7))
    sw = [('canvas', d['canvas']), ('card', d['card']), ('text', d['text']), ('muted', d['muted']), ('action', d['action'])]
    swatches = ''.join(f'<li><span style="background:{v}"></span><b>{k}</b><code>{v}</code></li>' for k, v in sw)
    swatches += f'<li><span style="background:{live_css}"></span><b>live</b><code>{" → ".join(live) if len(set(live))>1 else live[0]}</code></li>'
    ratios = ' · '.join(f'{l} {v:.1f}:1' for l, v, _ in checks(t, m)[:3])
    return f'''<div class="panel{' seam' if t['seam'] else ''}" style="{style}">
<div class="screen"><div class="card">
<div class="top">{mark(tt, f"g-{t['key']}-{m}", live)}<span class="who">Joy</span><span class="pill">Live</span></div>
<h3>Joy is listening</h3>
<p>Ask about today&rsquo;s plan, or say &ldquo;stop&rdquo; to end the call.</p>
<p class="muted">Last call 12 minutes ago. 3 goals updated.</p>
<div class="meter" role="img" aria-label="Voice level, 4 of 7">{meter}</div>
<div class="actions"><button class="primary" type="button">End call</button><button class="ghost" type="button">Mute</button></div>
</div></div>
<p class="mode">{m.capitalize()} mode <span>{ratios}</span></p>
<ul class="swatches">{swatches}</ul></div>'''

def section(i, t):
    tag = f'Candidate {chr(65+i)}' if t['proposed'] else 'For comparison'
    return f'''<section id="{t['key']}"><header><p class="tag">{tag} <span>{html.escape(t['strategy'])}</span></p>
<h2>{html.escape(t['name'])}</h2><p class="idea">{html.escape(t['idea'])}</p>
<p class="grad"><b>Gradient:</b> {html.escape(t['gradient'])} <b>Corners:</b> {t['radius']}px.</p></header>
<div class="pair">{panel(t,'light')}{panel(t,'dark')}</div></section>'''

CSS = '''
:root{--host:#DADCE0;--host-ink:#16181D;--host-muted:#4A4F5A;--host-line:#BFC3CA;--host-card:#ECEDEF}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--host);color:var(--host-ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1120px;margin:0 auto;padding:40px 20px 72px}
h1{font-size:1.9rem;line-height:1.15;margin:0 0 12px;letter-spacing:-.015em;text-wrap:balance}
.lede{max-width:68ch;margin:0 0 10px;color:var(--host-muted);text-wrap:pretty}
.pick{max-width:68ch;margin:20px 0 0;padding:14px 16px;background:var(--host-card);border:1px solid var(--host-line);border-radius:8px}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0}
nav a{color:var(--host-ink);text-decoration:none;border:1px solid var(--host-line);border-radius:999px;padding:8px 14px;min-height:44px;display:inline-flex;align-items:center;background:var(--host-card)}
nav a:hover{border-color:var(--host-ink)}a:focus-visible,button:focus-visible{outline:2px solid var(--host-ink);outline-offset:3px}
section{margin-top:56px;padding-top:28px;border-top:1px solid var(--host-line)}
.tag{margin:0 0 4px;font-weight:600;font-size:.9rem}.tag span{font-weight:400;color:var(--host-muted);margin-left:8px}
h2{font-size:1.5rem;line-height:1.2;margin:0 0 8px;letter-spacing:-.01em}
.idea{max-width:68ch;margin:0 0 6px;text-wrap:pretty}.grad{max-width:68ch;margin:0;color:var(--host-muted);font-size:.94rem}.grad b{color:var(--host-ink);font-weight:600}
.pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:20px}
.panel{min-width:0}
.screen{background:var(--canvas);border-radius:14px;padding:28px 18px 34px;min-height:340px;display:flex;align-items:center;justify-content:center;border:1px solid var(--host-line)}
.card{position:relative;overflow:hidden;width:100%;max-width:340px;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:calc(var(--r) * 1.4);padding:18px}
.top{display:flex;align-items:center;gap:10px;margin-bottom:16px}.mark{width:32px;height:32px;flex:none}.who{font-weight:600}
.pill{margin-left:auto;background:var(--live);color:var(--live-fg);font-size:.8rem;font-weight:700;padding:4px 11px;border-radius:999px}
.card h3{margin:0 0 6px;font-size:1.25rem;line-height:1.25;letter-spacing:-.01em}
.card p{margin:0 0 6px;font-size:.95rem;line-height:1.5}.card .muted{color:var(--muted);font-size:.86rem}
.meter{display:flex;gap:13px;padding:16px 4px 18px}
.meter i{width:11px;height:11px;transform:rotate(45deg);border:1px solid var(--muted);border-radius:1px}
.meter i.on{background:var(--lit);border-color:var(--lit);animation:breathe 2.4s cubic-bezier(.23,1,.32,1) infinite;animation-delay:calc(var(--i) * 140ms)}
@keyframes breathe{50%{transform:rotate(45deg) scale(1.28)}}
@media (prefers-reduced-motion:reduce){.meter i.on{animation:none}}
.actions{display:flex;gap:10px}
.actions button{font:inherit;font-weight:600;min-height:44px;padding:0 18px;border-radius:var(--r);cursor:pointer}
.primary{background:var(--action);color:var(--action-fg);border:1px solid var(--action);flex:1}
.ghost{background:transparent;color:var(--text);border:1px solid color-mix(in srgb,var(--text) 50%,transparent)}
.card button:focus-visible{outline-color:var(--text)}
.seam .screen{position:relative;overflow:hidden}.seam .card{z-index:1}
.seam .card::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#B8892B 22%,#E9CD94 50%,#B8892B 78%,transparent)}
.seam .screen::before,.seam .screen::after{content:"";position:absolute;height:1px;background:linear-gradient(90deg,transparent,#B8892B 18%,#E9CD94 50%,#B8892B 82%,transparent)}
.seam .screen::before{left:-10%;width:75%;top:30%;transform:rotate(-24deg)}
.seam .screen::after{right:-12%;width:70%;top:74%;transform:rotate(-31deg)}
.seam .card{background-image:radial-gradient(90% 70% at 20% 0%,color-mix(in srgb,#fff 9%,transparent),transparent 70%)}
.mode{margin:12px 2px 8px;font-weight:600;font-size:.9rem}.mode span{font-weight:400;color:var(--host-muted);margin-left:8px;font-size:.84rem}
.swatches{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:8px}
.swatches li{display:grid;grid-template-columns:28px 1fr;grid-template-rows:auto auto;column-gap:9px;align-items:center;font-size:.8rem;line-height:1.3}
.swatches span{grid-row:1/3;width:28px;height:28px;border-radius:6px;border:1px solid var(--host-line)}
.swatches b{font-weight:600}.swatches code{font:inherit;color:var(--host-muted);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--host-line);color:var(--host-muted);max-width:68ch;font-size:.92rem}
footer p{margin:0 0 8px}
'''

nav = ''.join(f'<a href="#{t["key"]}">{html.escape(t["name"])}</a>' for t in THEMES)
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Joy Design theme candidates</title><style>{CSS}</style></head><body><main>
<h1>Joy Design theme candidates</h1>
<p class="lede">Four directions for a modern Joy Design, each shown on the same small call screen in light and dark mode, with the common charcoal look last for comparison. Every direction keeps the diamond mark and reserves green, amber, red and blue for status.</p>
<p class="lede">Judge them with the name covered: which one could only be Joy?</p>
<p class="pick"><b>Suggested pick:</b> Midnight Brass as the everyday base, with the First Light gradient as the one signature surface (call screen, launch screen, brand pages). They share the navy, so they combine without a second palette.</p>
<nav aria-label="Candidates">{nav}</nav>
{''.join(section(i, t) for i, t in enumerate(THEMES))}
<footer><p>Contrast figures are WCAG ratios computed from the hex values on this page; text needs 4.5:1. Only the pairs listed were checked.</p>
<p>Typefaces are not part of this comparison: every panel uses the system font so that only colour, gradient and corner shape differ.</p></footer>
</main></body></html>'''
open('joy-theme-candidates.html', 'w').write(page)
print('wrote joy-theme-candidates.html', len(page), 'bytes')
