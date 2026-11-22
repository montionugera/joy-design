#!/usr/bin/env python3
"""Builds joy-combined-theme.html: Midnight Brass (base) + First Light (call gradient) + Kintsugi (seams).
Edit this file and rebuild; the HTML is generated. Every hex is from ../gen.py (themes A, B, C) or the
joy-design status ramp. Proof of contrast: joy-combined-contrast.py reads the generated file."""
import pathlib

SKY = {'sky-1': '#0B1226', 'sky-2': '#1F2352', 'sky-3': '#6B3A5B', 'sky-4': '#C7774A', 'sky-5': '#F0BE78',
       'sky-text': '#FBF3E9', 'pill': '#DAB362', 'pill-fg': '#150B00', 'sun': '#DAB362'}
LIGHT = {'canvas': '#F3F5F9', 'card': '#FFFFFF', 'hover': '#F3F5F9', 'text': '#14253E', 'muted': '#4E5F7B', 'border': '#D5DBE6',
         'mast': '#14253E', 'mast-hover': '#223250', 'mast-text': '#F3F5F9', 'mast-ctl': '#A9B4C6',
         'action': '#DAB362', 'action-hover': '#F4E6CA', 'action-fg': '#150B00', 'action-edge': '#A5802B',
         'solid': '#14253E', 'solid-hover': '#223250', 'solid-fg': '#F3F5F9',
         'live': '#A5802B', 'tile': '#14253E', 'mark': '#DAB362', 'tile-edge': '#A5802B',
         'seam-a': '#B8892B', 'seam-b': '#9A7120',
         'ok': '#306D35', 'warn': '#865000', 'bad': '#9F3331', 'info': '#2C6193', **SKY}
DARK = {'canvas': '#0A121F', 'card': '#111B2B', 'hover': '#0A121F', 'text': '#EEF2F8', 'muted': '#A9B4C6', 'border': '#223250',
        'mast': '#0A121F', 'mast-hover': '#111B2B', 'mast-text': '#EEF2F8', 'mast-ctl': '#A9B4C6',
        'action': '#DAB362', 'action-hover': '#F4E6CA', 'action-fg': '#150B00', 'action-edge': '#DAB362',
        'solid': '#EEF2F8', 'solid-hover': '#D5DBE6', 'solid-fg': '#0A121F',
        'live': '#DAB362', 'tile': '#14253E', 'mark': '#DAB362', 'tile-edge': '#A5802B',
        'seam-a': '#B8892B', 'seam-b': '#E9CD94',
        'ok': '#93C794', 'warn': '#E08A4E', 'bad': '#FB9890', 'info': '#8FBCEB', **SKY}
# One gradient, B's five stops. Dark keeps B's positions; light is the same sky a few minutes later (horizon raised).
POS = {'light': (0, 30, 60, 82, 100), 'dark': (0, 42, 70, 89, 100)}
ANGLE = 172
SKY_H, ZONE_H, SUN_Y, SUN_R = 520, 172, 250, 48


def block(tok, mode):
    stops = ','.join(f'var(--sky-{i + 1}) {p}%' for i, p in enumerate(POS[mode]))
    return ''.join(f'--{k}:{v};' for k, v in tok.items()) + f'--sky-stops:{stops};--sky-angle:{ANGLE}deg'


def grad_text(mode):
    return f'linear-gradient({ANGLE}deg, ' + ', '.join(f'{SKY[f"sky-{i + 1}"]} {p}%' for i, p in enumerate(POS[mode])) + ')'


CSS = '''
:root{--r-ctl:3px;--r-card:4px;--ctl-h:44px;--sky-h:%(sky_h)spx;--zone-h:%(zone_h)spx;--sun-y:%(sun_y)spx;--sun-r:%(sun_r)spx}
@media (min-width:900px){:root{--ctl-h:36px}}
:root,.t-light{%(light)s}
.t-dark{%(dark)s}
@media (prefers-color-scheme:dark){:root{%(dark)s}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%%}
body{margin:0;background:var(--canvas);color:var(--text);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
code{font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow-wrap:anywhere}
h1,h2,h3,h4,p,ul,dl,dd,figure{margin:0}
ul{padding:0;list-style:none}
button{font:inherit}
:focus-visible{outline:2px solid var(--text);outline-offset:2px}
.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.page{max-width:1180px;margin:0 auto;padding:32px 16px 72px}
h1{font-size:28px;line-height:1.2;letter-spacing:-.01em;text-wrap:balance}
.lede{max-width:68ch;color:var(--muted);margin-top:8px;text-wrap:pretty}
.sec,.phone,.win{scroll-margin-top:16px}
.sec{margin-top:48px}
.sec>h2{font-size:20px;line-height:28px}
.note{max-width:68ch;color:var(--muted);font-size:15px;line-height:24px;margin:4px 0 20px;text-wrap:pretty}
.cap{font-size:14px;color:var(--muted);margin:8px 0 0}
.seam{display:block;height:1px;border:0;margin:0;background:linear-gradient(90deg,transparent,var(--seam-a) 18%%,var(--seam-b) 50%%,var(--seam-a) 82%%,transparent)}

/* mark and icons */
.mark{flex:none;display:block}
.mark .t{fill:var(--tile);stroke:var(--tile-edge)}.mark .o{fill:none;stroke:var(--mark);stroke-width:1.6}.mark .i{fill:var(--mark)}.mark .d{fill:var(--tile)}
.ico{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
.ico.k24{stroke-width:2.4}

/* controls: gold = the one main action, solid = a decisive action, outline = the rest. One height per row. */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:var(--ctl-h);padding:0 16px;border:1px solid var(--muted);border-radius:var(--r-ctl);background:transparent;color:var(--text);font-weight:600;font-size:15px;line-height:1;white-space:nowrap;cursor:pointer}
.btn:not(:disabled):hover{background:var(--hover)}
.btn.gold{background:var(--action);border-color:var(--action-edge);color:var(--action-fg)}
.btn.gold:not(:disabled):hover{background:var(--action-hover)}
.btn.solid{background:var(--solid);border-color:var(--solid);color:var(--solid-fg)}
.btn.solid:not(:disabled):hover{background:var(--solid-hover);border-color:var(--solid-hover)}
.btn:active{transform:translateY(1px)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.icon{width:var(--ctl-h);padding:0}

/* call screen: the only place the gradient lives */
.phones{display:flex;flex-wrap:wrap;justify-content:center;gap:24px 48px}
.phone-wrap{width:min(100%%,390px)}
.phone{border:1px solid var(--border);border-radius:var(--r-card);overflow:hidden;background:var(--card);color:var(--text);font-size:15px;line-height:22px}
.sky{position:relative;height:var(--sky-h);background:linear-gradient(var(--sky-angle),var(--sky-stops));color:var(--sky-text);text-align:center}
.zone{height:var(--zone-h);padding:16px 16px 0;overflow:hidden}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;height:36px;margin-bottom:28px}
.who{font-weight:600;font-size:16px}
.pill{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 10px;border-radius:var(--r-ctl);background:var(--pill);color:var(--pill-fg);font-weight:600;font-size:13px;font-variant-numeric:tabular-nums}
.pill i{width:7px;height:7px;background:currentColor;transform:rotate(45deg)}
.sky h3{font-size:26px;line-height:32px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hint{max-width:30ch;margin:4px auto 0;text-wrap:balance;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.sun{position:absolute;left:50%%;top:calc(var(--sun-y) - 100px);width:200px;height:200px;margin-left:-100px;overflow:visible}
.sun .ring{fill:none;stroke:var(--sun);stroke-width:1;transform-origin:center;transform-box:fill-box}
.sun .o{fill:none;stroke:var(--sun);stroke-width:6.4}.sun .i{fill:var(--sun)}.sun .d{fill:var(--sky-1)}
.deck{display:grid;gap:16px;padding:16px 16px 20px}
.talk{display:grid;gap:8px}
.talk div{display:grid;grid-template-columns:40px minmax(0,1fr)}
.talk dt{font-weight:700}
.level{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:24px;color:var(--muted);font-size:14px}
.dia{display:inline-flex;gap:10px;padding:0 4px}
.dia i{width:11px;height:11px;border:1.5px solid var(--muted);transform:rotate(45deg)}
.dia i.on{background:var(--live);border-color:var(--live)}
.acts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.acts .btn{height:48px}

/* data screen: flat surfaces, a midnight masthead, seams at the joins */
.win{border:1px solid var(--border);border-radius:var(--r-card);overflow:hidden;background:var(--card);color:var(--text);font-size:15px;line-height:22px}
.win+.cap{margin-bottom:28px}
.bar{--text:var(--mast-text);--muted:var(--mast-ctl);--hover:var(--mast-hover);display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px 16px;background:var(--mast);color:var(--text)}
.bar h3{flex:1;font-size:16px;font-weight:600}
.week{display:flex;align-items:center;gap:8px}
.range{min-width:104px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
.tabs{display:flex;padding:0 8px;border-bottom:1px solid var(--border)}
.tab{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:44px;padding:0 12px;color:var(--muted);font-weight:600;cursor:pointer}
.tab:hover{color:var(--text)}
.tab .n{font-weight:400;font-variant-numeric:tabular-nums}
.tab:has(input:checked){color:var(--text);box-shadow:inset 0 -2px 0 var(--text)}
.tab:has(input:focus-visible){outline:2px solid var(--text);outline-offset:-3px}
.body{display:grid;grid-template-columns:minmax(0,1fr)}
.join{height:1px;background:linear-gradient(90deg,transparent,var(--seam-a) 18%%,var(--seam-b) 50%%,var(--seam-a) 82%%,transparent)}
.pane{min-width:0;padding:16px}
.pane.fill{display:flex;flex-direction:column}
.head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:0 12px;margin-bottom:8px}
.head h4{font-size:15px;font-weight:600}
.head p,.key{font-size:13px;color:var(--muted)}
.grid{width:calc(100%% + 24px);margin:0 -12px;border-collapse:collapse;font-variant-numeric:tabular-nums}
.grid th{padding:6px 12px 8px;text-align:left;font-size:13px;font-weight:600;color:var(--muted);white-space:nowrap}
.grid thead tr{background:linear-gradient(90deg,transparent,var(--seam-a) 18%%,var(--seam-b) 50%%,var(--seam-a) 82%%,transparent) bottom/100%% 1px no-repeat}
.grid td{padding:9px 12px;border-top:1px solid var(--border)}
.grid tbody tr:first-child td{border-top-color:transparent}
.grid tbody tr:hover{background:var(--hover)}
.name{font-weight:600}
.kind{color:var(--muted)}
.prog{white-space:nowrap}
.num{display:inline-block;min-width:42px}
.steps{display:inline-flex;gap:8px;padding:0 3px;vertical-align:1px}
.steps i{width:7px;height:7px;border:1.5px solid var(--muted);transform:rotate(45deg)}
.steps i.on{background:var(--text);border-color:var(--text)}
.key{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-top:auto;padding-top:14px}
.key .steps{margin-right:-2px}.key .steps~.steps{margin-left:10px}
.st{display:inline-flex;align-items:center;gap:6px;font-weight:600;white-space:nowrap}
.st.ok{color:var(--ok)}.st.warn{color:var(--warn)}.st.bad{color:var(--bad)}.st.info{color:var(--info)}.st.none{color:var(--muted)}
.st .now{width:9px;height:9px;margin:0 3.5px;background:var(--live);transform:rotate(45deg)}
.win:has(.f-goal:checked) tbody tr:not([data-kind=goal]),
.win:has(.f-habit:checked) tbody tr:not([data-kind=habit]),
.win:has(.f-task:checked) tbody tr:not([data-kind=task]){display:none}
.chart{display:block;width:100%%;max-width:352px;height:auto}
.chart .base{stroke:var(--border)}
.chart .u{fill:var(--text)}
.chart .u.now{fill:var(--live)}
.chart text{font-size:12px;fill:var(--muted);font-variant-numeric:tabular-nums;text-anchor:middle}
.chart .cur{fill:var(--text);font-weight:600}
.jobs li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:0 12px;padding:9px 0;border-top:1px solid var(--border)}
.jobs li:first-child{border-top:0;padding-top:2px}
.jobs .t{font-weight:600}
.jobs .m{grid-column:1;font-size:13px;color:var(--muted)}
.jobs .btn{grid-area:2/2;margin-top:4px}
@media (min-width:900px){
  .body{grid-template-columns:minmax(0,1fr) 1px 352px}
  .join{height:auto;background:linear-gradient(180deg,transparent,var(--seam-a) 18%%,var(--seam-b) 50%%,var(--seam-a) 82%%,transparent)}
  .tab{height:40px}
  .kind{width:88px}.prog{width:196px}.status{width:132px}
}
@media (max-width:899px){
  .week{order:3;flex-basis:100%%;justify-content:space-between}
  .tab{flex:1}
}
@media (max-width:640px){
  .grid thead{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0)}
  .grid,.grid tbody{display:block}
  .tabs{padding:0 4px}
  .tab{padding:0 4px}
  .grid tbody tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;padding:10px 12px;border-top:1px solid var(--border)}
  .grid tbody tr:first-child{border-top-color:transparent}
  .grid td{display:block;padding:0;border:0}
  .grid .status{grid-area:1/2;justify-self:end}
  .grid .kind{grid-area:2/2;justify-self:end}
  .grid .prog{grid-area:2/1}
}

/* reference: tokens and rules */
.tok{width:100%%;max-width:900px;border-collapse:collapse;font-size:14px}
.tok th,.tok td{padding:6px 12px 6px 0;text-align:left;vertical-align:top;border-top:1px solid var(--border)}
.tok thead th{border-top:0;font-size:13px;font-weight:600;color:var(--muted)}
.tok th[scope=row]{font-weight:400}
.tok th span{display:block;font-size:13px;color:var(--muted)}
.tok td{white-space:nowrap}
@media (min-width:760px){.tok th span{display:inline;margin-left:10px}}
.sw{display:inline-block;width:14px;height:14px;margin-right:8px;border:1px solid currentColor;vertical-align:-2px}
.defs{display:grid;gap:16px 32px;max-width:900px;margin-top:28px}
@media (min-width:760px){.defs{grid-template-columns:1fr 1fr}.defs .wide{grid-column:1/-1}}
.defs h3,.rule h3{font-size:15px;font-weight:600}
.defs p{font-size:14px;color:var(--muted)}
.strip{height:24px;border:1px solid var(--border);border-radius:var(--r-ctl);overflow:hidden;margin:6px 0}
.strip div{height:100%%;background:linear-gradient(90deg,var(--sky-stops))}
.demo{display:block;padding:11px 0;margin:6px 0;background:var(--card);border:1px solid var(--border);border-radius:var(--r-ctl)}
.rules{max-width:980px;margin-top:16px}
.rule{display:grid;gap:4px 24px;padding:14px 0;border-top:1px solid var(--border);font-size:15px}
.rule p{color:var(--muted);text-wrap:pretty}
.rule b{color:var(--text);font-weight:600}
@media (min-width:760px){.rule{grid-template-columns:150px minmax(0,1fr) minmax(0,1fr)}}

/* motion marks live things only. The page is complete without it. */
@media (prefers-reduced-motion:no-preference){
  .btn{transition:background-color .15s,border-color .15s,transform .1s}
  .pill i,.st .now{animation:beat 1.4s cubic-bezier(.25,1,.5,1) infinite alternate}
  .dia i.on{animation:beat 1.1s cubic-bezier(.25,1,.5,1) infinite alternate;animation-delay:calc(var(--i)*90ms)}
  .sun .ring{animation:echo 2.8s cubic-bezier(.25,1,.5,1) infinite alternate}
  .sun .ring.r2{animation-delay:.35s}
}
@keyframes beat{to{transform:rotate(45deg) scale(.72)}}
@keyframes echo{to{transform:scale(1.07)}}
''' % dict(light=block(LIGHT, 'light'), dark=block(DARK, 'dark'), sky_h=SKY_H, zone_h=ZONE_H, sun_y=SUN_Y, sun_r=SUN_R)


def mark(size):
    return (f'<svg class="mark" width="{size}" height="{size}" viewBox="0 0 32 32" aria-hidden="true"><rect class="t" x=".5" y=".5" width="31" height="31" rx="3"/>'
            '<path class="o" d="M16 4 28 16 16 28 4 16Z"/><path class="i" d="M16 9 23 16 16 23 9 16Z"/><circle class="d" cx="16" cy="16" r="1.6"/></svg>')


def ico(body, k24=False):
    return f'<svg class="ico{" k24" if k24 else ""}" viewBox="0 0 {"24 24" if k24 else "16 16"}" aria-hidden="true">{body}</svg>'


ICO = {
    'ok': ico('<path d="M3 8.5 6.5 12 13 4.5"/>'),
    'warn': ico('<path d="M8 2.5 14 13.5H2Z"/><path d="M8 7v3M8 11.8v.1"/>'),
    'bad': ico('<circle cx="8" cy="8" r="6"/><path d="M6 6l4 4M10 6l-4 4"/>'),
    'info': ico('<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/>'),
    'none': ico('<circle cx="8" cy="8" r="6" stroke-dasharray="2.4 2.31"/>'),
    'run': '<i class="now"></i>',
    'end': ico('<path d="M3 13.5c5-5 13-5 18 0l-2.2 2.6-3.6-1.6v-2.6c-2-.7-4.4-.7-6.4 0v2.6l-3.6 1.6z"/>', True),
    'mic': ico('<rect x="6" y="2" width="4" height="7.5" rx="2"/><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5"/>'),
    'prev': ico('<path d="M10 3.5 5.5 8l4.5 4.5"/>'), 'next': ico('<path d="M6 3.5 10.5 8 6 12.5"/>'),
}


def st(kind, word):
    return f'<span class="st {kind}">{ICO[kind]}{word}</span>'


def dia(x, y, r):
    return f'M{x} {y - r} {x + r} {y} {x} {y + r} {x - r} {y}Z'


def sun():
    r = SUN_R
    return ('<svg class="sun" viewBox="-100 -100 200 200" aria-hidden="true">'
            f'<path class="ring r2" opacity=".28" d="{dia(0, 0, 86)}"/><path class="ring" opacity=".55" d="{dia(0, 0, 70)}"/>'
            f'<path class="o" d="{dia(0, 0, r)}"/><path class="i" d="{dia(0, 0, r * 7 // 12)}"/><circle class="d" r="6.4"/></svg>')


def call(mode):
    level = ''.join(f'<i{" class=on" if i < 5 else ""} style="--i:{i}"></i>' for i in range(9))
    return f'''<figure class="phone-wrap">
<div class="phone t-{mode}" id="call-{mode}" role="group" aria-label="Call screen, {mode} mode">
<div class="sky">
<div class="zone">
<div class="top"><span class="who">Joy</span><span class="pill"><i></i>Live 04:12</span></div>
<h3>Joy is listening</h3>
<p class="hint">Ask about your week, or say &ldquo;stop&rdquo; to end the call.</p>
</div>
{sun()}
</div>
<div class="deck">
<dl class="talk">
<div><dt>You</dt><dd>How did my week go?</dd></div>
<div><dt>Joy</dt><dd>Three habits are on track. Reading slipped on Tuesday and Wednesday.</dd></div>
</dl>
<hr class="seam">
<div class="level"><span>Your voice</span><span class="dia" role="img" aria-label="Voice level, 5 of 9">{level}</span></div>
<div class="acts"><button class="btn solid" type="button">{ICO['end']}End call</button><button class="btn" type="button" aria-pressed="false">{ICO['mic']}Mute</button></div>
</div>
</div>
<figcaption class="cap">{mode.capitalize()}</figcaption>
</figure>'''


ROWS = [  # name, kind, done, of, status kind, status word
    ('Run a 10K by March', 'goal', 3, 4, 'ok', 'On track'), ('Morning run', 'habit', 3, 4, 'ok', 'On track'),
    ('Sleep by 23:00', 'habit', 5, 7, 'ok', 'On track'), ('Read 20 pages', 'habit', 2, 7, 'warn', 'Behind'),
    ('Stretch for 10 minutes', 'habit', 0, 7, 'bad', 'Off track'), ('Ship the portfolio site', 'goal', 1, 3, 'warn', 'Behind'),
    ('Draft the case study', 'task', 0, 1, 'none', 'Not started'), ('Book a physio appointment', 'task', 1, 1, 'ok', 'Done'),
]
JOBS = [  # title, status kind, word, meta, button
    ('Summarise this week&rsquo;s journal', 'run', 'Running', 'This Mac, started 2 min ago', ''),
    ('Draft a stretch plan', 'info', 'Queued', 'This Mac, next in line', ''),
    ('Sync next week&rsquo;s calendar', 'bad', 'Error', 'The helper went offline at 08:40', '<button class="btn" type="button">Retry</button>'),
    ('Find three 10K training plans', 'ok', 'Done', 'This Mac, today 09:12', ''),
]
DAYS = [('Mon', 4), ('Tue', 2), ('Wed', 5), ('Thu', 3), ('Fri', 4), ('Sat', None), ('Sun', None)]
TODAY = 4


def steps(done, of):
    return '<span class="steps" aria-hidden="true">' + ''.join(f'<i{" class=on" if i < done else ""}></i>' for i in range(of)) + '</span>'


def chart():
    """Unit chart: one diamond is one check-in, the same mark as a progress step. Today is the lit column."""
    out, said = ['<path class="base" d="M8 100H312"/>'], []
    for i, (day, n) in enumerate(DAYS):
        x, now = 28 + i * 44, i == TODAY
        for k in range(n or 0):
            out.append(f'<path class="u{" now" if now else ""}" d="{dia(x, 90 - k * 15, 5.5)}"/>')
        if n is not None:
            out.append(f'<text{" class=cur" if now else ""} x="{x}" y="{90 - n * 15 + 4}">{n}</text>')
            said.append(f'{day} {n}{" so far" if now else ""}')
        out.append(f'<text{" class=cur" if now else ""} x="{x}" y="120">{day}</text>')
    label = 'Check-ins per day. ' + ', '.join(said) + '. Saturday and Sunday are still to come.'
    return f'<svg class="chart" viewBox="0 0 320 126" role="img" aria-label="{label}">{"".join(out)}</svg>'


def data(mode):
    tabs = ''.join(f'<label class="tab"><input class="sr-only f-{k}" type="radio" name="kind-{mode}"{" checked" if k == "all" else ""}>{w} <span class="n">{n}</span></label>'
                   for k, w, n in (('all', 'All', 8), ('goal', 'Goals', 2), ('habit', 'Habits', 4), ('task', 'Tasks', 2)))
    rows = ''.join(f'<tr role="row" data-kind="{kind}"><td role="cell" class="name">{name}</td><td role="cell" class="kind">{kind.capitalize()}</td>'
                   f'<td role="cell" class="prog"><span class="num">{d} / {of}</span>{steps(d, of)}</td><td role="cell" class="status">{st(s, w)}</td></tr>'
                   for name, kind, d, of, s, w in ROWS)
    jobs = ''.join(f'<li><span class="t">{t}</span>{st(s, w)}<span class="m">{m}</span>{b}</li>' for t, s, w, m, b in JOBS)
    return f'''<div class="win t-{mode}" id="data-{mode}" role="group" aria-label="Week overview, {mode} mode">
<div class="bar">{mark(28)}<h3>Week overview</h3>
<div class="week" role="group" aria-label="Week"><button class="btn icon" type="button" aria-label="Previous week">{ICO['prev']}</button><span class="range">16 &ndash; 22 Nov</span><button class="btn icon" type="button" aria-label="Next week" disabled>{ICO['next']}</button></div>
<button class="btn gold" type="button">Start call</button></div>
<hr class="seam">
<div class="tabs" role="radiogroup" aria-label="Show">{tabs}</div>
<div class="body">
<div class="pane fill">
<div class="head"><h4>Goals and habits</h4><p>4 of 8 on track or done, 2 behind, 1 off track</p></div>
<table class="grid" role="table"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Name</th><th role="columnheader" scope="col">Kind</th><th role="columnheader" scope="col">This week</th><th role="columnheader" scope="col">Status</th></tr></thead>
<tbody role="rowgroup">{rows}</tbody></table>
<p class="key"><span class="steps" aria-hidden="true"><i class=on></i></span>one check-in done<span class="steps" aria-hidden="true"><i></i></span>still to do this week</p>
</div>
<div class="join"></div>
<div class="side">
<div class="pane"><div class="head"><h4>Check-ins per day</h4><p>18 so far, Friday still open</p></div>{chart()}</div>
<hr class="seam">
<div class="pane"><div class="head"><h4>Jobs</h4><p>1 running, 1 queued, 1 failed</p></div><ul class="jobs">{jobs}</ul></div>
</div>
</div>
</div>
<p class="cap">{mode.capitalize()}</p>'''


TOKENS = [
    ('canvas', 'Page background (A)'), ('card', 'Content surface (A)'), ('text', 'Text, data marks, selection, focus ring'),
    ('muted', 'Secondary text, control boundary, unlit marks'), ('border', 'Cool hairline: frames and row rules'),
    ('mast', 'Masthead surface, midnight in both modes'), ('mast-text', 'Text on the masthead'), ('mast-ctl', 'Control boundary on the masthead'),
    ('action', 'Gold: the one main action'), ('action-hover', 'Main action, hover'), ('action-fg', 'Label on gold'),
    ('action-edge', 'Edge of the gold button'), ('solid', 'Decisive action (End call)'), ('solid-fg', 'Label on solid'),
    ('live', 'Lit marks: voice level, today, running'), ('pill', 'Live pill on the gradient'), ('mark', 'Mark diamond'), ('tile', 'Mark tile'),
    ('seam-a', 'Seam, outer (C)'), ('seam-b', 'Seam, centre (C)'),
    ('ok', 'Status: on track, done'), ('warn', 'Status: behind'), ('bad', 'Status: off track, error'), ('info', 'Status: queued'),
    ('sky-text', 'Text on the call gradient (B)'),
]


def tokens():
    cell = lambda m, k, v: f'<td><span class="t-{m}"><i class="sw" style="background:var(--{k})"></i></span><code>{v}</code></td>'
    rows = ''.join(f'<tr><th scope="row"><code>{k}</code><span>{use}</span></th>{cell("light", k, LIGHT[k])}{cell("dark", k, DARK[k])}</tr>' for k, use in TOKENS)
    seam = lambda t: f'linear-gradient(90deg, transparent, {t["seam-a"]} 18%, {t["seam-b"]} 50%, {t["seam-a"]} 82%, transparent)'
    return f'''<table class="tok"><thead><tr><th scope="col">Role</th><th scope="col">Light</th><th scope="col">Dark</th></tr></thead><tbody>{rows}</tbody></table>
<div class="defs">
<div class="wide"><h3>Radii</h3><p>Controls 3px. Cards and frames 4px. Diamonds are squares turned 45 degrees, corners left square.</p></div>
<div><h3>First Light, light</h3><div class="strip"><div class="t-light"></div></div><p><code>{grad_text("light")}</code></p></div>
<div><h3>First Light, dark</h3><div class="strip"><div class="t-dark"></div></div><p><code>{grad_text("dark")}</code></p></div>
<div><h3>Seam, light</h3><div class="demo t-light"><hr class="seam"></div><p><code>{seam(LIGHT)}</code>, 1px</p></div>
<div><h3>Seam, dark</h3><div class="demo t-dark"><hr class="seam"></div><p><code>{seam(DARK)}</code>, 1px</p></div>
</div>'''


RULES = [
    ('Gold', 'The mark. Something live: the Live pill, the lit voice level, today&rsquo;s column, a running job. The one main action of a screen, as a fill, in both modes.',
     'Text, a fill larger than a button, a card background, a destructive action such as End call, or a stand-in for amber. More than one gold button on a screen.'),
    ('Gradient', 'First Light is the call screen background and brand moments such as sign-in or launch. One per screen, same five stops in both modes.',
     'Cards, buttons, text, charts or any data screen. Words and the mark over it stay above the plum stop; everything else sits on the solid deck.'),
    ('Seams', 'The join between two sections of one surface, and the rule under a table header. One pixel, fading at both ends.',
     'Card outlines, control borders, row rules, or a stripe down the side of an item. Those use the cool hairline or nothing.'),
    ('Status colours', 'Green, amber, red and blue for state only, each with its icon and a word.',
     'Decoration, chart series, links, emphasis, or buttons.'),
    ('Diamond', 'One unit of something counted: a check-in, a level step. The mark, and the lit mark of a live thing.',
     'A status icon, a selection tick, a container for text, or a pattern.'),
]


def rules():
    return '<div class="rules">' + ''.join(f'<div class="rule"><h3>{h}</h3><p><b>Use for.</b> {a}</p><p><b>Never.</b> {b}</p></div>' for h, a, b in RULES) + '</div>'


HTML = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Joy combined theme</title>
<style>{CSS}</style>
</head>
<body>
<div class="page">
<header>
<h1>Joy combined theme</h1>
<p class="lede">One theme from three ideas. Midnight Brass is the everyday base, First Light is the single gradient and belongs to the call screen, and Kintsugi is the gold seam that joins sections. The 45-degree diamond is the unit everything is counted in.</p>
</header>
<main>
<section class="sec" id="call">
<h2>Call screen</h2>
<p class="note">The gradient is the screen. Words and the mark stay on the night end of it; the transcript and the controls sit on a solid deck.</p>
<div class="phones">{call('light')}{call('dark')}</div>
</section>
<section class="sec" id="data">
<h2>Week overview</h2>
<p class="note">Flat surfaces under a midnight masthead. Gold is the main action, today&rsquo;s column and the running job; seams mark the joins.</p>
{data('light')}
{data('dark')}
</section>
<section class="sec" id="tokens">
<h2>Tokens</h2>
<p class="note">Every value comes from the three chosen candidates or the existing status ramp. Dark amber is First Light&rsquo;s copper, so a warning cannot be mistaken for brass.</p>
{tokens()}
</section>
<section class="sec" id="rules">
<h2>Rules</h2>
{rules()}
</section>
</main>
</div>
</body>
</html>
'''
pathlib.Path(__file__).with_name('joy-combined-theme.html').write_text(HTML)
print('wrote joy-combined-theme.html', len(HTML), 'bytes')
