# Joymify Mascot Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Implementers never dispatch reviewers or run the phase gate themselves; the controller does.** A "Phase gate" step below is for the controller only. Do not launch `code-reviewer`, language reviewers, `/simplify` or any other review from inside a task; finish the task, run its Verify-Cmd, commit, report.

**Goal (owner, verbatim):** "Please add in design joymify lib and use in our quest project." — the owner's 7 mascot characters become a joy-design package (`@montionugera/joy-mascots`), and Joy-Quest replaces Star Slime with the learner's chosen character; the shop sells the 6 non-Yoji characters.

**Architecture:** A new joy-design package `packages/mascots` ships 70 WebP pictures (7 characters x 5 poses x 1x/2x) plus a Svelte `Mascot` and a React `Mascot` that read one plain-JS data file. Joy-Quest drops its code-drawn `StarSlime`; a thin `Companion.svelte` wraps `<Mascot>`, and the shop `slot: "character"` / column `member_cosmetics.mascot` hold the learner's choice (Yoji free by default). The worn character reaches the lesson rider and the quiz band through the page loads.

**Tech Stack:** joy-design: plain JS + Svelte 5 + React 19 + TypeScript, `node --test`, `sharp` (build-time only), Playwright (storybook hub), pnpm workspace, GitHub Actions. Joy-Quest: Go + pgx + goose + sqlc + testify (real Postgres via `testdb`), SvelteKit 2 + Svelte 5 runes + vitest + Playwright. Art: Python (`uv run`, pillow, numpy, scipy, pytest).

**Spec:** `/Users/pasitnusso/workspace/joy-quest/.claude/worktrees/_release/.claude/idea_backlog/I-015-joymify-mascot-family-pico-yoji-luna-rex/spec.md` (approved; source of truth).

## Where each phase runs

| Variable | Path | Used by |
|---|---|---|
| `IDEA` | `/Users/pasitnusso/workspace/joy-quest/.claude/worktrees/_release/.claude/idea_backlog/I-015-joymify-mascot-family-pico-yoji-luna-rex` | Phase A (backlog metadata, committed on `release/1.3` in the `_release` worktree like commit `f9dc7c2`) |
| `JD` | the joy-design feature worktree the controller claims for pair idea I-105 (read-only reference checkout: `/Users/pasitnusso/workspace/repos/joy-design/.claude/worktrees/_release`) | Phase B |
| `JQ` | the Joy-Quest feature worktree the controller claims for I-015 (`psrw claim`); reference checkout `/Users/pasitnusso/workspace/joy-quest/.claude/worktrees/_release` | Phases C, D, Final |

Every relative path below is relative to `JD` (Phase B), `JQ` (Phases C, D, Final), or starts with `IDEA/`. Postgres for Phase C and all Go tests comes from `make db-up` in `JQ`; export the Makefile's test URLs by running Go tests through `make test-server` or by copying the `TEST_DATABASE_URL` / `MIGRATIONS_TEST_DATABASE_URL` defaults from the Makefile header.

## Global Constraints

- Character ids and names: `yoji` Yoji, `pico` Pico, `luna` Luna, `rex` Rex, `mochi` Mochi, `zing` Zing, `byte` Byte.
- Personality (3 words): yoji "kind, bright, positive" (lead); pico "chill, honest, real"; luna "dreamy, creative, sensitive"; rex "confident, bold, unfiltered"; mochi "sweet, caring, supportive"; zing "fun, party, chaos"; byte "smart, curious, solver".
- Prices (coins): yoji Free (built-in, not in config), pico 100, luna 100, rex 150, mochi 150, zing 200, byte 200. Set in `default_config.json`; reversible.
- Poses: `idle`, `cheer`, `thinking`, `try-again`, `sleepy` (35 PNGs, 512 px, `IDEA/ref/art/poses/`). Package pictures: 256 px (`<id>-<pose>.webp`) and 512 px (`<id>-<pose>@2x.webp`), alpha kept.
- Joy-Quest pose map: `happy -> idle`, `cheer -> cheer`, `opening -> cheer`, `thinking -> thinking`, `tryAgain -> try-again`, `sleepy -> sleepy`.
- DB column is `member_cosmetics.mascot` (NOT `character`, an SQL type name); shop slot value is `"character"`; `DefaultLook = {"character": "yoji"}`; migration `0017_mascot_character.sql`, run as `joyquest_owner`, ends with its `GRANT`s.
- `Mascot` props: `name`, `pose` (default `idle`), `size` (CSS px, default 96, max 256), `label` (alt text; none = `alt=""`), `glow` (0-5), `eager` (default lazy). Unknown `name`/`pose` falls back to `yoji`/`idle` and warns once in dev.
- Copy strings (verbatim): page `<title>` and h1 "Characters"; strip link "Characters"; hero label "You are wearing <Name>"; "Wearing"; "Wear"; "Buy · N coins"; "Need M more coins" (from `needMore()`), disabled button accessible name "Buy <Name>, N coins. Need M more coins"; confirm "Buy Luna for 100 coins?" with [Buy Luna] [Cancel]; live region "Luna is yours. 20 coins left." and "Now wearing Luna."; empty hint "Finish a lesson to earn coins"; server already_owned "You already have <Name>."; server not_owned "Buy <Name> first, then you can wear them."; 409 `not_enough_coins` message "Need M more coins"; 403 `not_owned`.
- Publishing: `@montionugera/joy-mascots` publishes like the other joy-design packages, to GitHub Packages and public npmjs.org (owner decision 2026-11-06: the art is public; the joy-design repo is public). Joy-Quest installs it from public npm exactly like `joy-svelte`, with no token. Publishing `0.1.0` is R0: only the owner's yes in the tab, only via `.github/workflows/publish.yml` (tag `packages-v0.1.0`); never `npm publish` or `pnpm publish` by hand, never from a worker.
- No PNG/WebP pictures are copied into `web/`; Joy-Quest gets pictures only through the package. The `link:` dependency never merges to `main`; the final web task switches it to `0.1.0`.
- Svelte 5 runes only in Joy-Quest (`$state`, `$derived`, `$props`, `$effect`); no `export let`, `$:`, `on:click`.
- No colour literals in joy-design packages or hub (tokens only; no `var(--joy-x, fallback)`).
- Tests that seed content tables (topics, modules, lessons) seed via the owner-role `store.New(ctx, testdb.OwnerURL(t), 1)` + `SeedFixtureTopic` (see `newRwEnv` in `server/internal/store/rewards_test.go`); the app role has no INSERT on content tables. `reward_events` and `member_cosmetics` accept app-role INSERT/UPDATE per their grants.
- Every UI claim needs phone (390x844) + desktop (1280x800) shots, light and dark, actually looked at (rule 16).

---

## Phase A: Crop script scale rule and `--check` (Python)

Runs in: `IDEA` (the `_release` worktree). Run commands from `IDEA`.

### Task A1: Body-height scale rule in `crop_mascots.py`

**Files:**
- Modify: `IDEA/crop_mascots.py` (exists; replace `crop_one` and the pose loop in `main`)
- Create: `IDEA/test_crop_mascots.py`

**Interfaces:**
- Consumes: existing `POSES`, `NAMES`, `remove_painted_checker(rgba) -> np.ndarray`, `pose_columns(alpha, n) -> list[tuple[int,int]]`.
- Produces: `ALPHA_MIN = 20`, `body_box(alpha) -> (y0, y1, x0, x1)` (largest 8-connected alpha component; y1/x1 exclusive), `all_box(alpha)` (same shape, every opaque pixel), `pose_limit(rgba, size, margin, feet) -> float`, `scale_character(pieces: dict[str, np.ndarray], size: int, pad: float = 0.06) -> dict[str, PIL.Image.Image]`. `crop_one` is removed.

- [ ] **Step 1: Write the failing test**

```python test:IDEA/test_crop_mascots.py
import numpy as np
import pytest
from PIL import Image

import crop_mascots as c


def piece(body_h, prop=None, body_w=100):
    """600x400 RGBA sheet slice: a body block at rows 200..200+body_h, optional detached prop rows."""
    rgba = np.zeros((600, 400, 4), dtype=np.uint8)
    rgba[200 : 200 + body_h, 150 : 150 + body_w] = (200, 100, 50, 255)
    if prop is not None:
        y0, y1 = prop
        rgba[y0:y1, 160:190] = (255, 255, 0, 255)
    return rgba


def out_box(img):
    return c.body_box(np.array(img)[..., 3])


def test_body_box_ignores_a_detached_prop():
    rgba = piece(300, prop=(20, 60))
    assert c.body_box(rgba[..., 3]) == (200, 500, 150, 250)
    assert c.all_box(rgba[..., 3])[0] == 20


def test_every_pose_uses_one_factor_and_one_feet_line():
    pieces = {"idle": piece(300), "cheer": piece(300, prop=(100, 140)), "sleepy": piece(280)}
    out = c.scale_character(pieces, 512)
    h = {k: out_box(v)[1] - out_box(v)[0] for k, v in out.items()}
    bottoms = {k: out_box(v)[1] for k, v in out.items()}
    assert abs(h["idle"] - h["cheer"]) <= 1, "a prop must not shrink the body"
    assert abs(h["sleepy"] / h["idle"] - 280 / 300) < 0.01, "same factor, not a refit"
    assert max(bottoms.values()) - min(bottoms.values()) <= 1, "bodies stand on one feet line"


def test_prop_overflow_shrinks_the_whole_character():
    pieces = {"idle": piece(300), "cheer": piece(300, prop=(10, 60))}  # prop 190 px above the body
    out = c.scale_character(pieces, 512)
    margin = int(512 * 0.06)
    assert np.array(out["cheer"])[: margin - 1, :, 3].max() == 0, "the prop stays inside the margin"
    h_idle = out_box(out["idle"])[1] - out_box(out["idle"])[0]
    h_cheer = out_box(out["cheer"])[1] - out_box(out["cheer"])[0]
    assert abs(h_idle - h_cheer) <= 1
    assert h_idle < 300 * 1.2, "idle shrank too: the factor is per character"


def test_empty_pose_is_an_error():
    with pytest.raises(ValueError):
        c.body_box(np.zeros((10, 10), dtype=np.uint8))
```

Verify-Cmd: `cd /Users/pasitnusso/workspace/joy-quest/.claude/worktrees/_release/.claude/idea_backlog/I-015-joymify-mascot-family-pico-yoji-luna-rex && uv run --with pytest --with pillow --with numpy --with scipy pytest test_crop_mascots.py -q`

- [ ] **Step 2: Run to fail.** Run the Verify-Cmd. Expected: errors `AttributeError: module 'crop_mascots' has no attribute 'body_box'` (4 failing tests).

- [ ] **Step 3: Implement.** In `crop_mascots.py` replace `crop_one` entirely with the block below (place it after `pose_columns`), and replace the inner `for pose, (c0, c1) in zip(...)` loop in `main` as shown after the block.

```python
ALPHA_MIN = 20
S8 = np.ones((3, 3), dtype=int)  # 8-connectivity for the body component


def body_box(alpha: np.ndarray) -> tuple[int, int, int, int]:
    """Box (y0, y1, x0, x1) of the largest connected alpha component: the body.

    Detached props (confetti, a floating bulb) are other components and are ignored.
    """
    labels, n = ndimage.label(alpha > ALPHA_MIN, structure=S8)
    if n == 0:
        raise ValueError("empty pose")
    sizes = ndimage.sum(np.ones_like(labels), labels, range(1, n + 1))
    ys, xs = np.nonzero(labels == int(np.argmax(sizes)) + 1)
    return int(ys.min()), int(ys.max()) + 1, int(xs.min()), int(xs.max()) + 1


def all_box(alpha: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(alpha > ALPHA_MIN)
    if len(xs) == 0:
        raise ValueError("empty pose")
    return int(ys.min()), int(ys.max()) + 1, int(xs.min()), int(xs.max()) + 1


def pose_limit(rgba: np.ndarray, size: int, margin: int, feet: int) -> float:
    """Largest scale at which this pose, standing on the feet line, stays inside the margins."""
    alpha = rgba[..., 3]
    by0, by1, bx0, bx1 = body_box(alpha)
    ay0, ay1, ax0, ax1 = all_box(alpha)
    cx = (bx0 + bx1) / 2
    limits = []
    for extent, room in (
        (cx - ax0, size / 2 - margin),
        (ax1 - cx, size / 2 - margin),
        (by1 - ay0, feet - margin),
        (ay1 - by1, size - margin - feet),
    ):
        if extent > 0:
            limits.append(room / extent)
    return min(limits)


def scale_character(
    pieces: dict[str, np.ndarray], size: int, pad: float = 0.06
) -> dict[str, Image.Image]:
    """One scale factor for all poses of a character, bodies aligned on the feet line.

    The factor is what fits the idle pose; if any pose's props would overflow the margins
    the factor shrinks for the whole character (min over poses), never for one pose.
    """
    margin = int(size * pad)
    feet = size - 2 * margin
    s = min(pose_limit(p, size, margin, feet) for p in pieces.values())
    out: dict[str, Image.Image] = {}
    for pose, rgba in pieces.items():
        by0, by1, bx0, bx1 = body_box(rgba[..., 3])
        ay0, ay1, ax0, ax1 = all_box(rgba[..., 3])
        cx = (bx0 + bx1) / 2
        crop = Image.fromarray(np.ascontiguousarray(rgba[ay0:ay1, ax0:ax1]), "RGBA")
        crop = crop.resize(
            (max(1, round(crop.width * s)), max(1, round(crop.height * s))), Image.LANCZOS
        )
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        canvas.paste(crop, (round(size / 2 - (cx - ax0) * s), round(feet - (by1 - ay0) * s)))
        out[pose] = canvas
    return out
```

In `main`, replace the inner pose loop with:

```python
        cols = pose_columns(rgba[..., 3], len(POSES))
        pieces = {pose: rgba[:, c0:c1] for pose, (c0, c1) in zip(POSES, cols)}
        for pose, img in scale_character(pieces, a.size).items():
            img.save(a.out_dir / f"{name}-{pose}.png")
```

Update the module docstring "Output" line to: `Output: <out_dir>/<name>-<pose>.png, square, one scale per character (body height equal across poses), bodies on a common feet line, transparent.`

- [ ] **Step 4: Run to pass.** Run the Verify-Cmd. Expected: `4 passed`.

- [ ] **Step 5: Commit.** Stage `IDEA/crop_mascots.py` and `IDEA/test_crop_mascots.py` with `git -C /Users/pasitnusso/workspace/joy-quest/.claude/worktrees/_release add`, then make a new commit (never amend) with message `feat(I-015): crop script scales each character by body height`.

### Task A2: `--check` spread report

**Files:**
- Modify: `IDEA/crop_mascots.py`, `IDEA/test_crop_mascots.py`

**Interfaces:**
- Consumes: `body_box`, `POSES`, `NAMES`.
- Produces: `MAX_SPREAD_PCT = 5.0`; `CHECK_POSES` (the four upright poses: `POSES` without `sleepy`, which is drawn slumped on purpose); `check_dir(poses_dir: Path, names: list[str] = NAMES) -> int` — prints one line `<id> <min> <max> <spread>%` per character (spread = (max-min)/max x 100 over `CHECK_POSES`, one decimal) and returns 0 ok, 1 if any spread > 5, 2 if a file (any of the five poses) is missing; CLI `uv run crop_mascots.py --check <poses_dir>`.

- [ ] **Step 1: Write the failing test** (append to `IDEA/test_crop_mascots.py`)

```python test:IDEA/test_crop_mascots.py
def write_character(dirpath, name, heights):
    for pose, h in zip(c.POSES, heights):
        rgba = np.zeros((512, 512, 4), dtype=np.uint8)
        rgba[400 - h : 400, 200:300] = (10, 10, 10, 255)
        Image.fromarray(rgba, "RGBA").save(dirpath / f"{name}-{pose}.png")


def test_check_passes_within_five_percent(tmp_path, capsys):
    # heights follow c.POSES: idle, cheer, thinking, try-again, sleepy (sleepy is slumped on purpose)
    write_character(tmp_path, "yoji", [100, 100, 100, 97, 60])
    assert c.check_dir(tmp_path, ["yoji"]) == 0
    assert capsys.readouterr().out.strip() == "yoji 97 100 3.0%"


def test_check_fails_over_five_percent(tmp_path, capsys):
    write_character(tmp_path, "yoji", [100, 100, 100, 92, 60])
    assert c.check_dir(tmp_path, ["yoji"]) == 1
    assert capsys.readouterr().out.strip() == "yoji 92 100 8.0%"


def test_check_ignores_the_sleepy_pose(tmp_path, capsys):
    write_character(tmp_path, "yoji", [100, 100, 100, 100, 50])
    assert c.check_dir(tmp_path, ["yoji"]) == 0
    assert capsys.readouterr().out.strip() == "yoji 100 100 0.0%"


def test_check_reports_a_missing_file(tmp_path):
    write_character(tmp_path, "yoji", [100] * 5)
    (tmp_path / "yoji-cheer.png").unlink()
    assert c.check_dir(tmp_path, ["yoji"]) == 2


def test_cli_check_flag_exits_with_the_result(tmp_path):
    import subprocess
    import sys

    for name in c.NAMES:
        write_character(tmp_path, name, [100] * 5)
    r = subprocess.run(
        [sys.executable, c.__file__, "--check", str(tmp_path)], capture_output=True, text=True
    )
    assert r.returncode == 0, r.stderr
    assert len(r.stdout.strip().splitlines()) == 7
```

Verify-Cmd: `cd /Users/pasitnusso/workspace/joy-quest/.claude/worktrees/_release/.claude/idea_backlog/I-015-joymify-mascot-family-pico-yoji-luna-rex && uv run --with pytest --with pillow --with numpy --with scipy pytest test_crop_mascots.py -q`

- [ ] **Step 2: Run to fail.** Expected: 5 new failures (`no attribute 'check_dir'`; the CLI test exits non-zero because `--check` is an unknown argument).

- [ ] **Step 3: Implement.** Add after `scale_character`:

```python
MAX_SPREAD_PCT = 5.0
CHECK_POSES = [p for p in POSES if p != "sleepy"]  # sleepy is drawn slumped on purpose


def check_dir(poses_dir: Path, names: list[str] = NAMES) -> int:
    """Print `<id> <min> <max> <spread>%` body height per character (sleepy excluded); 1 if any spread > MAX_SPREAD_PCT."""
    worst = 0
    for name in names:
        heights = []
        for pose in POSES:
            f = poses_dir / f"{name}-{pose}.png"
            if not f.exists():
                print(f"missing {f}", file=sys.stderr)
                return 2
            if pose not in CHECK_POSES:
                continue
            y0, y1, _, _ = body_box(np.array(Image.open(f).convert("RGBA"))[..., 3])
            heights.append(y1 - y0)
        lo, hi = min(heights), max(heights)
        spread = (hi - lo) / hi * 100
        print(f"{name} {lo} {hi} {spread:.1f}%")
        if spread > MAX_SPREAD_PCT:
            worst = 1
    return worst
```

Replace the argparse lines at the top of `main` (through `a.out_dir.mkdir(...)`) with:

```python
    ap = argparse.ArgumentParser()
    ap.add_argument("source_dir", type=Path, nargs="?")
    ap.add_argument("out_dir", type=Path, nargs="?")
    ap.add_argument("--size", type=int, default=512)
    ap.add_argument("--check", type=Path, metavar="POSES_DIR",
                    help="report body-height spread per character; exit 1 if any is over 5%% (sleepy excluded)")
    a = ap.parse_args()
    if a.check:
        return check_dir(a.check)
    if a.source_dir is None or a.out_dir is None:
        ap.error("source_dir and out_dir are required unless --check is given")
    a.out_dir.mkdir(parents=True, exist_ok=True)
```

Add the line `Usage: uv run crop_mascots.py --check <poses_dir>` to the module docstring.

- [ ] **Step 4: Run to pass.** Run the Verify-Cmd. Expected: `9 passed`.
- [ ] **Step 5: Commit** (new commit) `feat(I-015): crop_mascots --check reports body-height spread`.

### Task A3: Regenerate the 35 poses and run `--check` on the real art

**Files:**
- Modify (regenerate): `IDEA/ref/art/poses/*.png` (35 exist)
- Read: `IDEA/ref/art/source/joymify-mascot-<id>.png` (7 exist)

**Interfaces:** Consumes `crop_mascots.py` from A1/A2. Produces the final 35 PNGs that Phase B reads.

- [ ] **Step 1: Regenerate.** `cd IDEA && uv run crop_mascots.py ref/art/source ref/art/poses` — expected: seven lines `<id>: 5 poses`.
- [ ] **Step 2: Run the check on the real art.** `cd IDEA && uv run crop_mascots.py --check ref/art/poses; echo "exit=$?"` — spec requirement 6 expects seven lines and `exit=0` (every spread <= 5% across idle, cheer, thinking, try-again).
  The `sleepy` pose is excluded from the spread (drawn slumped on purpose; spec updated 2026-11-06), so the real art is expected to print seven lines and `exit=0`. If it does not, report the seven lines to the controller; do NOT change `MAX_SPREAD_PCT` and do NOT rescale poses yourself.
- [ ] **Step 3: Look at the sheet.** `cd IDEA && uv run --with pillow python -c "from PIL import Image; import glob; fs=sorted(glob.glob('ref/art/poses/*.png')); W=Image.new('RGBA',(5*256,7*256),(255,255,255,255)); [W.alpha_composite(Image.open(f).convert('RGBA').resize((256,256)),((i%5)*256,(i//5)*256)) for i,f in enumerate(fs)]; W.save('/tmp/mascot-contact.png')"`, then show `/tmp/mascot-contact.png` with the inline image tool (rows are alphabetical by file, so characters interleave; it is an eyeball check of scale and clipping).
- [ ] **Step 4: Commit** (after `--check` printed `exit=0`): stage the 35 PNGs, new commit `art(I-015): regenerate 35 poses with per-character scale`.

**Phase gate (controller only):** verify → review (code-reviewer + python-reviewer on opus) → /simplify → re-verify. Verify = both pytest runs green and the `--check` output pasted into the report.

---

## Phase B: joy-design package `@montionugera/joy-mascots`

Runs in: `JD` (joy-design feature worktree for I-105). Install once with `pnpm install` at the `JD` root; run package tests with `cd packages/mascots && node --test test/*.test.js`. Package art input is `IDEA/ref/art/poses/` (35 PNGs from Phase A); no PNG is committed to joy-design, only the generated WebP files.

### Task B1: Package skeleton and the picture pipeline (70 WebP + `urls.js`)

**Files:**
- Create: `packages/mascots/package.json`, `packages/mascots/scripts/build-assets.mjs`, `packages/mascots/test/assets.test.js`, `packages/mascots/assets/<id>-<pose>.webp` and `<id>-<pose>@2x.webp` (70 generated), `packages/mascots/src/urls.js` (generated), `packages/mascots/src/assets.js` (generated), `packages/mascots/src/assets.d.ts`
- Modify: `pnpm-lock.yaml` (by `pnpm install`)
- Exists and is copied from: `packages/icons/package.json` (shape), `pnpm-workspace.yaml` already globs `packages/*`.

**Interfaces:**
- Consumes: `IDEA/ref/art/poses/<id>-<pose>.png` (512 px square, RGBA).
- Produces: `assets/<id>-<pose>.webp` (256x256) and `assets/<id>-<pose>@2x.webp` (512x512), alpha kept; `src/urls.js` exporting `URLS: Record<string, string>` keyed `<id>-<pose>` and `<id>-<pose>@2x`, every value a literal `new URL('../assets/<file>', import.meta.url).href` (literal so bundlers emit the file; used by `data.js` `assetUrl` and the React twin only); `src/assets.js` exporting `ASSETS: Record<string, string>` with the same 70 keys, built from 70 static ESM imports (`import yojiIdle from '../assets/yoji-idle.webp'`), used by `Mascot.svelte`. Reason: Vite rewrites `new URL(..., import.meta.url)` only in the client build; in SSR it yields `file://` URLs, Svelte 5 does not repair `src` on hydration, and dev mode prebundling breaks it too. Static imports are rewritten by Vite for SSR, client and dev alike. npm script `assets` = `node scripts/build-assets.mjs <poses_dir>`.

- [ ] **Step 1: Write the failing test**

```js test:packages/mascots/test/assets.test.js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const IDS = ['yoji', 'pico', 'luna', 'rex', 'mochi', 'zing', 'byte'];
const POSES = ['idle', 'cheer', 'thinking', 'try-again', 'sleepy'];
const assets = path.resolve('./assets');

test('70 WebP pictures: every character x pose x 1x/2x, right size, alpha kept', async () => {
  let total = 0;
  for (const id of IDS) {
    for (const pose of POSES) {
      for (const [px, suffix] of [[256, ''], [512, '@2x']]) {
        const file = path.join(assets, `${id}-${pose}${suffix}.webp`);
        assert.ok(fs.existsSync(file), `${file} exists`);
        const meta = await sharp(file).metadata();
        assert.strictEqual(meta.format, 'webp');
        assert.strictEqual(meta.width, px, `${id}-${pose}${suffix} width`);
        assert.strictEqual(meta.height, px);
        assert.strictEqual(meta.hasAlpha, true, `${id}-${pose}${suffix} keeps alpha`);
        total += fs.statSync(file).size;
      }
    }
  }
  assert.strictEqual(fs.readdirSync(assets).filter((f) => f.endsWith('.webp')).length, 70);
  assert.ok(total < 2 * 1024 * 1024, `all pictures together are ${total} bytes, spec estimate is under 2 MB`);
});

test('assets.js imports all 70 files statically (what Vite rewrites in SSR, client and dev)', () => {
  const source = fs.readFileSync(path.resolve('./src/assets.js'), 'utf8');
  const imports = source.match(/^import \w+ from '\.\.\/assets\/[a-z-]+(@2x)?\.webp';$/gm) ?? [];
  assert.strictEqual(imports.length, 70);
  assert.ok(!source.includes('import.meta.url'), 'no new URL in assets.js');
  assert.strictEqual((source.match(/^  '[a-z-]+(@2x)?': \w+,$/gm) ?? []).length, 70);
});

test('urls.js lists all 70 files as literal new URL(..., import.meta.url) calls', async () => {
  const source = fs.readFileSync(path.resolve('./src/urls.js'), 'utf8');
  const literals = source.match(/new URL\('\.\.\/assets\/[a-z-]+(@2x)?\.webp', import\.meta\.url\)\.href/g) ?? [];
  assert.strictEqual(literals.length, 70);
  const { URLS } = await import('../src/urls.js');
  assert.strictEqual(Object.keys(URLS).length, 70);
  for (const url of Object.values(URLS)) assert.ok(fs.existsSync(new URL(url)), `${url} exists`);
});
```

Verify-Cmd: `cd packages/mascots && node --test test/assets.test.js`

- [ ] **Step 2: Run to fail.** Expected: `Cannot find package 'sharp'` / ENOENT on `assets/yoji-idle.webp` (all three tests fail).

- [ ] **Step 3: Implement.** Create `packages/mascots/package.json` (this is the complete final file; later tasks do not change it except the notes inside them):

```json
{
  "name": "@montionugera/joy-mascots",
  "version": "0.1.0",
  "type": "module",
  "license": "SEE LICENSE IN PROVENANCE.md",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/montionugera/joy-design.git",
    "directory": "packages/mascots"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "files": [
    "assets",
    "dist",
    "src/index.ts",
    "src/index.d.ts",
    "src/data.js",
    "src/data.d.ts",
    "src/urls.js",
    "src/assets.js",
    "src/assets.d.ts",
    "src/mascot.css",
    "src/*.svelte",
    "PROVENANCE.md"
  ],
  "sideEffects": [
    "*.css"
  ],
  "main": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.d.ts",
      "svelte": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "default": "./dist/react.js"
    },
    "./data": {
      "types": "./src/data.d.ts",
      "default": "./src/data.js"
    },
    "./mascot.css": "./src/mascot.css"
  },
  "scripts": {
    "assets": "node scripts/build-assets.mjs",
    "build": "tsc -p tsconfig.build.json",
    "test": "node --test test/*.test.js",
    "check": "svelte-check --tsconfig ./tsconfig.json --threshold error"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "svelte": "^5.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "svelte": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "sharp": "^0.34.0",
    "svelte": "^5.57.1",
    "svelte-check": "^4.7.6",
    "typescript": "^5.9.3"
  }
}
```

Create `packages/mascots/scripts/build-assets.mjs`:

```js
#!/usr/bin/env node
// Usage: node scripts/build-assets.mjs <poses_dir>
// Turns the 35 square PNGs (<id>-<pose>.png, made by crop_mascots.py) into 70 WebP files, src/urls.js and src/assets.js.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IDS = ['yoji', 'pico', 'luna', 'rex', 'mochi', 'zing', 'byte'];
const POSES = ['idle', 'cheer', 'thinking', 'try-again', 'sleepy'];
const DENSITIES = [[256, ''], [512, '@2x']];

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/build-assets.mjs <poses_dir>');
  process.exit(2);
}
const out = path.join(root, 'assets');
fs.mkdirSync(out, { recursive: true });

const keys = [];
for (const id of IDS) {
  for (const pose of POSES) {
    const file = path.join(src, `${id}-${pose}.png`);
    if (!fs.existsSync(file)) {
      console.error(`missing ${file}`);
      process.exit(1);
    }
    for (const [px, suffix] of DENSITIES) {
      const name = `${id}-${pose}${suffix}`;
      await sharp(file)
        .resize(px, px)
        .webp({ quality: 85, alphaQuality: 100, effort: 6 })
        .toFile(path.join(out, `${name}.webp`));
      keys.push(name);
    }
  }
}

const lines = keys.map((k) => `  '${k}': new URL('../assets/${k}.webp', import.meta.url).href,`);
fs.writeFileSync(
  path.join(root, 'src', 'urls.js'),
  `// Generated by scripts/build-assets.mjs. Do not edit.\n` +
    `// Each URL is a literal new URL(file, import.meta.url) so Vite and other bundlers emit the picture.\n` +
    `export const URLS = {\n${lines.join('\n')}\n};\n`,
);
// Static ESM imports: Vite rewrites these for SSR, client and dev (new URL(..., import.meta.url) only for the client build).
const ident = (k) => k.replace(/[-@](\w)/g, (_, c) => c.toUpperCase());
fs.writeFileSync(
  path.join(root, 'src', 'assets.js'),
  `// Generated by scripts/build-assets.mjs. Do not edit.\n` +
    `// Static imports so Vite emits the picture and returns a real URL in SSR, client and dev.\n` +
    keys.map((k) => `import ${ident(k)} from '../assets/${k}.webp';`).join('\n') +
    `\n\nexport const ASSETS = {\n${keys.map((k) => `  '${k}': ${ident(k)},`).join('\n')}\n};\n`,
);
fs.writeFileSync(
  path.join(root, 'src', 'assets.d.ts'),
  `// Generated by scripts/build-assets.mjs. Do not edit.\nexport const ASSETS: Readonly<Record<string, string>>;\n`,
);
console.log(`built ${keys.length} pictures`);
```

Then run:
`mkdir -p packages/mascots/src && pnpm install && cd packages/mascots && node scripts/build-assets.mjs /Users/pasitnusso/workspace/joy-quest/.claude/worktrees/_release/.claude/idea_backlog/I-015-joymify-mascot-family-pico-yoji-luna-rex/ref/art/poses`
Expected last line: `built 70 pictures`. (If the size assertion fails, lower `quality` to 80 in the script and rerun; do not loosen the test.)

- [ ] **Step 4: Run to pass.** Run the Verify-Cmd. Expected: `# pass 3`, `# fail 0`.
- [ ] **Step 5: Commit** `feat(I-105): joy-mascots package skeleton and picture pipeline`.

### Task B2: `data.js` (characters, poses, URLs, fallbacks)

**Files:**
- Create: `packages/mascots/src/data.js`, `packages/mascots/src/data.d.ts`, `packages/mascots/test/data.test.js`
- Consumes: `packages/mascots/src/urls.js` (B1)

**Interfaces:**
- Produces (exact exports of `data.js`): `POSES: readonly string[]`; `MASCOTS: readonly { id: string; name: string; personality: readonly [string,string,string]; poses: readonly string[] }[]` (order yoji, pico, luna, rex, mochi, zing, byte); `DEFAULT_ID = 'yoji'`; `DEFAULT_POSE = 'idle'`; `assetUrl(id, pose, density = 1): string` (density 1 or 2; throws `RangeError` for an unknown pair); `resolveMascot(name, pose, warn?): { id: string; pose: string }` (unknown id -> `yoji`, unknown pose -> `idle`; calls `warn(message)` once per distinct bad value; the default `warn` prints with `console.warn` only when `import.meta.env?.DEV`); `clampSize(size): number` (NaN/non-finite -> 96, min 1, max 256, rounded); `clampGlow(glow): number` (0-5 integer); `initialOf(id): string`.

- [ ] **Step 1: Write the failing test**

```js test:packages/mascots/test/data.test.js
import test from 'node:test';
import assert from 'node:assert';
import { MASCOTS, POSES, DEFAULT_ID, DEFAULT_POSE, assetUrl, resolveMascot, clampSize, clampGlow, initialOf } from '../src/data.js';

test('seven characters in the owner order with names and three-word personalities', () => {
  assert.deepStrictEqual(MASCOTS.map((m) => m.id), ['yoji', 'pico', 'luna', 'rex', 'mochi', 'zing', 'byte']);
  assert.deepStrictEqual(MASCOTS.map((m) => m.name), ['Yoji', 'Pico', 'Luna', 'Rex', 'Mochi', 'Zing', 'Byte']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'yoji').personality, ['kind', 'bright', 'positive']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'pico').personality, ['chill', 'honest', 'real']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'luna').personality, ['dreamy', 'creative', 'sensitive']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'rex').personality, ['confident', 'bold', 'unfiltered']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'mochi').personality, ['sweet', 'caring', 'supportive']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'zing').personality, ['fun', 'party', 'chaos']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'byte').personality, ['smart', 'curious', 'solver']);
  assert.deepStrictEqual([...POSES], ['idle', 'cheer', 'thinking', 'try-again', 'sleepy']);
  for (const m of MASCOTS) assert.deepStrictEqual([...m.poses], [...POSES]);
});

test('assetUrl returns the 1x and 2x file for every pair and throws for an unknown one', () => {
  for (const m of MASCOTS) {
    for (const pose of POSES) {
      assert.ok(assetUrl(m.id, pose).endsWith(`/assets/${m.id}-${pose}.webp`));
      assert.ok(assetUrl(m.id, pose, 2).endsWith(`/assets/${m.id}-${pose}@2x.webp`));
    }
  }
  assert.throws(() => assetUrl('nope', 'idle'), RangeError);
});

test('unknown name or pose falls back to yoji / idle and warns once per bad value', () => {
  const seen = [];
  const warn = (m) => seen.push(m);
  assert.deepStrictEqual(resolveMascot('rex', 'cheer', warn), { id: 'rex', pose: 'cheer' });
  assert.deepStrictEqual(resolveMascot('dragon', 'cheer', warn), { id: DEFAULT_ID, pose: 'cheer' });
  assert.deepStrictEqual(resolveMascot('dragon', 'cheer', warn), { id: DEFAULT_ID, pose: 'cheer' });
  assert.deepStrictEqual(resolveMascot('luna', 'flying', warn), { id: 'luna', pose: DEFAULT_POSE });
  assert.deepStrictEqual(resolveMascot(undefined, undefined, warn), { id: 'yoji', pose: 'idle' });
  assert.strictEqual(seen.length, 2, 'one warning for dragon, one for flying');
});

test('size is clamped to 1..256 with 96 for junk, glow to 0..5', () => {
  assert.strictEqual(clampSize(96), 96);
  assert.strictEqual(clampSize(999), 256);
  assert.strictEqual(clampSize(0), 1);
  assert.strictEqual(clampSize(Number.NaN), 96);
  assert.strictEqual(clampSize('64'), 64);
  assert.strictEqual(clampGlow(9), 5);
  assert.strictEqual(clampGlow(-2), 0);
  assert.strictEqual(clampGlow(2.6), 3);
  assert.strictEqual(clampGlow(undefined), 0);
});

test('the fallback letter is the first letter of the name', () => {
  assert.strictEqual(initialOf('mochi'), 'M');
  assert.strictEqual(initialOf('missing'), 'Y');
});
```

Verify-Cmd: `cd packages/mascots && node --test test/data.test.js`

- [ ] **Step 2: Run to fail.** Expected: `ERR_MODULE_NOT_FOUND ... src/data.js`.

- [ ] **Step 3: Implement.** `packages/mascots/src/data.js`:

```js
// Plain JS, no framework. The Svelte and React Mascot both read this file; the React build imports
// it through ../../src/data.js, so there is no copy under dist/.
// assetUrl() (new URL based) serves React and plain JS; Mascot.svelte reads ASSETS from assets.js instead (static imports).
import { URLS } from './urls.js';

export const POSES = Object.freeze(['idle', 'cheer', 'thinking', 'try-again', 'sleepy']);

const make = (id, name, personality) => Object.freeze({ id, name, personality: Object.freeze(personality), poses: POSES });

export const MASCOTS = Object.freeze([
  make('yoji', 'Yoji', ['kind', 'bright', 'positive']),
  make('pico', 'Pico', ['chill', 'honest', 'real']),
  make('luna', 'Luna', ['dreamy', 'creative', 'sensitive']),
  make('rex', 'Rex', ['confident', 'bold', 'unfiltered']),
  make('mochi', 'Mochi', ['sweet', 'caring', 'supportive']),
  make('zing', 'Zing', ['fun', 'party', 'chaos']),
  make('byte', 'Byte', ['smart', 'curious', 'solver']),
]);

export const DEFAULT_ID = 'yoji';
export const DEFAULT_POSE = 'idle';

export function assetUrl(id, pose, density = 1) {
  const key = `${id}-${pose}${density === 2 ? '@2x' : ''}`;
  const url = URLS[key];
  if (!url) throw new RangeError(`joy-mascots: no picture for ${key}`);
  return url;
}

const warned = new Set();
const devWarn = (message) => {
  if (import.meta.env?.DEV) console.warn(message);
};

export function resolveMascot(name, pose, warn = devWarn) {
  const once = (key, message) => {
    if (warned.has(key)) return;
    warned.add(key);
    warn(message);
  };
  let id = name ?? DEFAULT_ID;
  if (!MASCOTS.some((m) => m.id === id)) {
    once(`name:${id}`, `joy-mascots: unknown name "${id}", showing ${DEFAULT_ID}`);
    id = DEFAULT_ID;
  }
  let p = pose ?? DEFAULT_POSE;
  if (!POSES.includes(p)) {
    once(`pose:${p}`, `joy-mascots: unknown pose "${p}", showing ${DEFAULT_POSE}`);
    p = DEFAULT_POSE;
  }
  return { id, pose: p };
}

export function clampSize(size) {
  const n = Number(size);
  if (!Number.isFinite(n)) return 96;
  return Math.min(256, Math.max(1, Math.round(n)));
}

export function clampGlow(glow) {
  const n = Number(glow);
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.round(n)));
}

export function initialOf(id) {
  return (MASCOTS.find((m) => m.id === id)?.name ?? 'Yoji').charAt(0);
}
```

`packages/mascots/src/data.d.ts`:

```ts
export interface MascotInfo {
  readonly id: string;
  readonly name: string;
  readonly personality: readonly [string, string, string];
  readonly poses: readonly string[];
}
export const POSES: readonly string[];
export const MASCOTS: readonly MascotInfo[];
export const DEFAULT_ID: 'yoji';
export const DEFAULT_POSE: 'idle';
export function assetUrl(id: string, pose: string, density?: 1 | 2): string;
export function resolveMascot(
  name: string | undefined,
  pose: string | undefined,
  warn?: (message: string) => void,
): { id: string; pose: string };
export function clampSize(size: unknown): number;
export function clampGlow(glow: unknown): number;
export function initialOf(id: string): string;
```

- [ ] **Step 4: Run to pass.** Expected: `# pass 5`, `# fail 0`.
- [ ] **Step 5: Commit** `feat(I-105): joy-mascots data and URL helpers`.

### Task B3: Svelte `Mascot.svelte`, stylesheet and entry

**Files:**
- Create: `packages/mascots/src/Mascot.svelte`, `packages/mascots/src/mascot.css`, `packages/mascots/src/index.ts`, `packages/mascots/src/index.d.ts`, `packages/mascots/tsconfig.json`, `packages/mascots/test/helpers.js`, `packages/mascots/test/mascot.svelte.test.js`

**Interfaces:**
- Consumes: `data.js` exports from B2, `ASSETS` from `assets.js` (B1; static ESM imports, so Vite gives a real URL in SSR, client and dev); `svelte/server` `render`.
- Produces: default component `Mascot` with props `{ name?: string; pose?: string; size?: number; label?: string; glow?: number; eager?: boolean }`; package root exports `Mascot`, `MASCOTS`, `POSES`, `assetUrl`, `type MascotProps`. DOM contract (React twin must match): `<img class="joy-mascot" data-joy-mascot="<id>" data-pose="<pose>" src srcset="<1x> 1x, <2x> 2x" width height alt loading decoding="async" style="--joy-mascot-glow:<0-5>">`; on load error a `<span class="joy-mascot joy-mascot--fallback" data-joy-mascot data-pose style="width:Npx;height:Npx;--joy-mascot-glow:G">` holding the initial, `role="img"` + `aria-label` when `label` is given, else `aria-hidden="true"`.

- [ ] **Step 1: Write the failing test.** First `packages/mascots/test/helpers.js` (test support, used again by B4):

```js
// Loads .svelte (compiled for the server), .tsx/.ts (transpiled) and .css (ignored) through Node.
import fs from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';

const require = createRequire(import.meta.url);
const ts = require('typescript');

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.css')) return { format: 'module', source: 'export {};', shortCircuit: true };
    // Stand-in for Vite's asset handling: a .webp import becomes a site-absolute URL (as in the Vite build).
    if (url.endsWith('.webp')) {
      return { format: 'module', source: `export default ${JSON.stringify('/assets/' + url.split('/').pop())};`, shortCircuit: true };
    }
    if (url.endsWith('.svelte')) {
      const file = fileURLToPath(url);
      const { js } = compile(fs.readFileSync(file, 'utf8'), { generate: 'server', filename: file, dev: false });
      return { format: 'module', source: js.code, shortCircuit: true };
    }
    if (url.endsWith('.tsx') || url.endsWith('.ts')) {
      const out = ts.transpileModule(fs.readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText;
      return { format: 'module', source: out, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

/** Attribute map of the first tag in `html`, with the style normalised (sorted, no spaces, no trailing ;).
 *  `on*` attributes are dropped: Svelte SSR adds `onerror="this.__e=event"` to <img>, React renders none. */
export function firstTagAttrs(html) {
  const tag = html.match(/<(img|span)\b[^>]*>/)[0];
  const attrs = { tag: tag.match(/^<(\w+)/)[1] };
  for (const m of tag.matchAll(/([\w-]+)="([^"]*)"/g)) {
    const key = m[1].toLowerCase();
    if (!key.startsWith('on')) attrs[key] = m[2];
  }
  if (attrs.style) attrs.style = attrs.style.replace(/\s+/g, '').split(';').filter(Boolean).sort().join(';');
  return attrs;
}
```

`packages/mascots/test/mascot.svelte.test.js`:

```js
import './helpers.js';
import test from 'node:test';
import assert from 'node:assert';
import { render } from 'svelte/server';
import { firstTagAttrs } from './helpers.js';

const { default: Mascot } = await import('../src/Mascot.svelte');
const html = (props) => render(Mascot, { props }).body;

test('Rex cheer at 96 shows the right picture, size and alt', () => {
  const a = firstTagAttrs(html({ name: 'rex', pose: 'cheer', size: 96, label: 'Rex' }));
  assert.strictEqual(a.tag, 'img');
  assert.strictEqual(a.alt, 'Rex');
  assert.strictEqual(a.width, '96');
  assert.strictEqual(a.height, '96');
  assert.match(a.src, /rex-cheer\.webp$/);
  assert.ok(a.src.startsWith('/'), 'a site-absolute URL, never file:');
  assert.match(a.srcset, /rex-cheer\.webp 1x, .*rex-cheer@2x\.webp 2x$/);
  assert.strictEqual(a['data-joy-mascot'], 'rex');
  assert.strictEqual(a['data-pose'], 'cheer');
  assert.strictEqual(a.loading, 'lazy');
  assert.strictEqual(a.class, 'joy-mascot');
});

test('no label means a decorative picture; eager switches loading', () => {
  const a = firstTagAttrs(html({ name: 'luna', eager: true }));
  assert.strictEqual(a.alt, '');
  assert.strictEqual(a.loading, 'eager');
  assert.match(a.src, /luna-idle\.webp$/, 'pose defaults to idle');
});

test('unknown name or pose shows Yoji idle', () => {
  const a = firstTagAttrs(html({ name: 'dragon', pose: 'flying' }));
  assert.match(a.src, /yoji-idle\.webp$/);
});

test('size is capped at 256 and glow at 5', () => {
  const a = firstTagAttrs(html({ size: 999, glow: 9 }));
  assert.strictEqual(a.width, '256');
  assert.strictEqual(a.style, '--joy-mascot-glow:5');
});

test('defaults: Yoji idle at 96, glow 0', () => {
  const a = firstTagAttrs(html({}));
  assert.match(a.src, /yoji-idle\.webp$/);
  assert.strictEqual(a.width, '96');
  assert.strictEqual(a.style, '--joy-mascot-glow:0');
});
```

Verify-Cmd: `cd packages/mascots && node --test test/mascot.svelte.test.js`

- [ ] **Step 2: Run to fail.** Expected: `ERR_MODULE_NOT_FOUND ... Mascot.svelte`.

- [ ] **Step 3: Implement.** `packages/mascots/src/Mascot.svelte`:

```svelte
<script>
  import './mascot.css';
  import { clampGlow, clampSize, initialOf, resolveMascot } from './data.js';
  import { ASSETS } from './assets.js';

  /** @type {{ name?: string, pose?: string, size?: number, label?: string, glow?: number, eager?: boolean }} */
  let { name = 'yoji', pose = 'idle', size = 96, label, glow = 0, eager = false } = $props();

  const r = $derived(resolveMascot(name, pose));
  const px = $derived(clampSize(size));
  const g = $derived(clampGlow(glow));
  const src = $derived(ASSETS[`${r.id}-${r.pose}`]);
  const src2 = $derived(ASSETS[`${r.id}-${r.pose}@2x`]);
  let failedSrc = $state('');
  const failed = $derived(failedSrc === src);
</script>

{#if failed}
  <span
    class="joy-mascot joy-mascot--fallback"
    data-joy-mascot={r.id}
    data-pose={r.pose}
    style="width:{px}px;height:{px}px;--joy-mascot-glow:{g}"
    role={label ? 'img' : undefined}
    aria-label={label || undefined}
    aria-hidden={label ? undefined : 'true'}>{initialOf(r.id)}</span
  >
{:else}
  <img
    class="joy-mascot"
    data-joy-mascot={r.id}
    data-pose={r.pose}
    {src}
    srcset="{src} 1x, {src2} 2x"
    width={px}
    height={px}
    alt={label ?? ''}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    style="--joy-mascot-glow:{g}"
    onerror={() => (failedSrc = src)}
  />
{/if}
```

`packages/mascots/src/mascot.css` (tokens only; no colour literals, no `var(--joy-x, fallback)`):

```css
.joy-mascot {
  --joy-mascot-glow: 0;
  display: inline-block;
  flex: none;
  object-fit: contain;
  vertical-align: middle;
  filter: drop-shadow(0 0 calc(var(--joy-mascot-glow) * 3px) var(--joy-accent-default));
  animation: joy-mascot-bob 3.2s ease-in-out infinite;
}

.joy-mascot--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: var(--joy-radius-pill);
  border: 1px solid var(--joy-border-default);
  background: var(--joy-surface-sunken);
  color: var(--joy-text-primary);
  font-weight: 700;
  animation: none;
}

@keyframes joy-mascot-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .joy-mascot {
    animation: none;
  }
}
```

`packages/mascots/src/index.ts`:

```ts
export { default as Mascot } from './Mascot.svelte';
export { MASCOTS, POSES, assetUrl } from './data.js';
```

`packages/mascots/src/index.d.ts`:

```ts
import type { Component } from 'svelte';

export interface MascotProps {
  name?: string;
  pose?: string;
  size?: number;
  label?: string;
  glow?: number;
  eager?: boolean;
}

export const Mascot: Component<MascotProps>;
export { MASCOTS, POSES, assetUrl } from './data.js';
export type { MascotInfo } from './data.js';
```

`packages/mascots/tsconfig.json` (copy of `packages/icons/tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": []
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.svelte"]
}
```

- [ ] **Step 4: Run to pass.** Expected: `# pass 5`. Then `pnpm --filter @montionugera/joy-mascots check` — expected: `svelte-check found 0 errors`.
- [ ] **Step 5: Commit** `feat(I-105): joy-mascots Svelte Mascot`.

### Task B4: React `Mascot.tsx`, `./react` build and Svelte/React parity

**Files:**
- Create: `packages/mascots/src/react/Mascot.tsx`, `packages/mascots/src/react.ts`, `packages/mascots/tsconfig.build.json`, `packages/mascots/test/mascot.react.test.js`
- Consumes: `data.js`, `test/helpers.js` (`firstTagAttrs`), `react`, `react-dom/server`.

**Interfaces:**
- Produces: `Mascot(props: MascotProps): JSX.Element` and `type MascotProps` from `@montionugera/joy-mascots/react`, same props and DOM contract as the Svelte twin; `./react` re-exports `MASCOTS`, `POSES`, `assetUrl`. Built to `dist/react.js`, `dist/react.d.ts`, `dist/react/Mascot.js`, `dist/react/Mascot.d.ts`. `dist/react/Mascot.js` imports `../../src/data.js` (shipped in `files`), so there is no copy of the data under `dist/`. `src/react.ts` re-exports with the `.js` extension (`'./react/Mascot.js'`, like joy-icons) so plain Node (`ssr-check.mjs`) can load `dist/react.js`. The React twin keeps `assetUrl()` (`new URL`), so React SSR in a Vite app needs the same care as before; Svelte (Joy-Quest) uses the static imports.

- [ ] **Step 1: Write the failing test**

```js test:packages/mascots/test/mascot.react.test.js
import './helpers.js';
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from 'svelte/server';
import { firstTagAttrs } from './helpers.js';

const { Mascot } = await import('../src/react/Mascot.tsx');
const { default: SvelteMascot } = await import('../src/Mascot.svelte');
const reactHtml = (props) => renderToStaticMarkup(h(Mascot, props));
const svelteHtml = (props) => render(SvelteMascot, { props }).body;

// React keeps assetUrl() (file:// URL in plain Node), Svelte uses the static asset imports (site-absolute URL):
// compare the picture by file name, everything else exactly.
const byFile = (url) => url.split('/').pop();
const same = (a) => ({ ...a, src: byFile(a.src), srcset: a.srcset.split(', ').map((p) => byFile(p)).join(', ') });

const cases = [
  {},
  { name: 'rex', pose: 'cheer', size: 96, label: 'Rex' },
  { name: 'luna', pose: 'try-again', size: 128, glow: 3, eager: true },
  { name: 'dragon', pose: 'flying', size: 999, glow: 9 },
  { name: 'byte', pose: 'thinking', size: 0 },
];

for (const props of cases) {
  test(`React and Svelte render the same image for ${JSON.stringify(props)}`, () => {
    assert.deepStrictEqual(same(firstTagAttrs(reactHtml(props))), same(firstTagAttrs(svelteHtml(props))));
  });
}

test('React: Rex cheer at 96 has alt Rex; no label is decorative', () => {
  const a = firstTagAttrs(reactHtml({ name: 'rex', pose: 'cheer', size: 96, label: 'Rex' }));
  assert.strictEqual(a.alt, 'Rex');
  assert.strictEqual(a.width, '96');
  assert.match(a.src, /rex-cheer\.webp$/);
  assert.strictEqual(firstTagAttrs(reactHtml({ name: 'rex' })).alt, '');
});

test('the react entry exports Mascot and the shared data without a copy', () => {
  const entry = fs.readFileSync(new URL('../src/react.ts', import.meta.url), 'utf8');
  assert.ok(entry.includes("export { Mascot } from './react/Mascot.js'"), 'with the .js extension so plain Node (ssr-check.mjs) can load dist/react.js');
  assert.ok(entry.includes("'../src/data.js'"));
  const tsx = fs.readFileSync(new URL('../src/react/Mascot.tsx', import.meta.url), 'utf8');
  assert.ok(tsx.includes("'../../src/data.js'"), 'imports the one shared data file');
});
```

Verify-Cmd: `cd packages/mascots && node --test test/mascot.react.test.js`

- [ ] **Step 2: Run to fail.** Expected: `ERR_MODULE_NOT_FOUND ... src/react/Mascot.tsx`.

- [ ] **Step 3: Implement.** `packages/mascots/src/react/Mascot.tsx`:

```tsx
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { assetUrl, clampGlow, clampSize, initialOf, resolveMascot } from '../../src/data.js';

export interface MascotProps {
  name?: string;
  pose?: string;
  size?: number;
  label?: string;
  glow?: number;
  eager?: boolean;
}

export function Mascot({ name = 'yoji', pose = 'idle', size = 96, label, glow = 0, eager = false }: MascotProps) {
  const r = resolveMascot(name, pose);
  const px = clampSize(size);
  const g = clampGlow(glow);
  const src = assetUrl(r.id, r.pose, 1);
  const src2 = assetUrl(r.id, r.pose, 2);
  const [failedSrc, setFailedSrc] = useState('');

  if (failedSrc === src) {
    const style = { width: px, height: px, '--joy-mascot-glow': g } as CSSProperties;
    return (
      <span
        className="joy-mascot joy-mascot--fallback"
        data-joy-mascot={r.id}
        data-pose={r.pose}
        style={style}
        role={label ? 'img' : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
      >
        {initialOf(r.id)}
      </span>
    );
  }
  const style = { '--joy-mascot-glow': g } as CSSProperties;
  return (
    <img
      className="joy-mascot"
      data-joy-mascot={r.id}
      data-pose={r.pose}
      src={src}
      srcSet={`${src} 1x, ${src2} 2x`}
      width={px}
      height={px}
      alt={label ?? ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={style}
      onError={() => setFailedSrc(src)}
    />
  );
}
```

`packages/mascots/src/react.ts`:

```ts
export { Mascot } from './react/Mascot.js';
export type { MascotProps } from './react/Mascot.js';
export { MASCOTS, POSES, assetUrl } from '../src/data.js';
```

`packages/mascots/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src/react.ts", "src/react/**/*.tsx"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

- [ ] **Step 4: Run to pass.** Run the Verify-Cmd; expected `# pass 7`. Then `pnpm --filter @montionugera/joy-mascots build && ls packages/mascots/dist/react.js packages/mascots/dist/react.d.ts packages/mascots/dist/react/Mascot.js packages/mascots/dist/react/Mascot.d.ts && grep -c "../../src/data.js" packages/mascots/dist/react/Mascot.js` — expected: four paths listed and `1`; also `test ! -e packages/mascots/dist/data.js && echo no-copy` prints `no-copy`. Then `cd packages/mascots && node -e "import('./dist/react.js').then(m => console.log(Object.keys(m).sort().join()))"` — expected `MASCOTS,Mascot,POSES,assetUrl` (plain Node loads the built entry, which needs the `.js` extension in `src/react.ts`). If tsc emits `dist/src/data.*` or `dist/data.*`, the import path or `include` is wrong; fix them, do not copy the file.
- [ ] **Step 5: Commit** `feat(I-105): joy-mascots React Mascot and ./react build`.

### Task B5: PROVENANCE, package surface, colour lint and integration hook

**Files:**
- Create: `packages/mascots/PROVENANCE.md`, `packages/mascots/test/package.test.js`
- Modify: `README.md` (joy-design root; `scripts/test/docs-contract.test.mjs` line ~74 requires the README to name every workspace package), `scripts/lint-colors.sh` (add `"packages/mascots/src"` to the default `targets` array next to `"packages/icons/src"`), `scripts/integration.sh` (add `(cd packages/mascots && node --test test/*.test.js)` after the `packages/react` line)

**Interfaces:** Produces the legal text and the guard test that the tarball surface (`files`, `exports`, `publishConfig`) cannot drift.

- [ ] **Step 1: Write the failing test**

```js test:packages/mascots/test/package.test.js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const provenance = fs.readFileSync(new URL('../PROVENANCE.md', import.meta.url), 'utf8');

test('GitHub Packages registry like the other packages, owner licence, version 0.1.0', () => {
  assert.strictEqual(pkg.name, '@montionugera/joy-mascots');
  assert.strictEqual(pkg.version, '0.1.0');
  assert.strictEqual(pkg.license, 'SEE LICENSE IN PROVENANCE.md');
  assert.strictEqual(pkg.publishConfig.registry, 'https://npm.pkg.github.com');
});

test('files ship the pictures, shared data and stylesheet; exports expose root, react, data, css', () => {
  for (const f of ['assets', 'dist', 'src/data.js', 'src/data.d.ts', 'src/urls.js', 'src/assets.js', 'src/assets.d.ts', 'src/mascot.css', 'src/*.svelte', 'PROVENANCE.md']) {
    assert.ok(pkg.files.includes(f), `files includes ${f}`);
  }
  assert.deepStrictEqual(Object.keys(pkg.exports).sort(), ['.', './data', './mascot.css', './react']);
});

test('PROVENANCE says the art is the owner\'s, all rights reserved, published publicly', () => {
  assert.match(provenance, /All rights reserved/);
  assert.match(provenance, /published publicly/i);
  assert.doesNotMatch(provenance, /private/i);
});

test('PROVENANCE names the owner, the ChatGPT redraw date and the Duolingo disclaimer', () => {
  assert.match(provenance, /owner/i);
  assert.match(provenance, /ChatGPT/);
  assert.match(provenance, /2026-11-05/);
  assert.match(provenance, /not Duolingo/i);
  assert.match(provenance, /Yoji, Pico, Luna, Rex, Mochi, Zing, Byte/);
});
```

Verify-Cmd: `cd packages/mascots && node --test test/package.test.js`

- [ ] **Step 2: Run to fail.** Expected: `ENOENT ... PROVENANCE.md` (the PROVENANCE tests fail; the first two may pass or fail on `files`).
- [ ] **Step 3: Implement.** `packages/mascots/PROVENANCE.md`:

```markdown
# @montionugera/joy-mascots - Provenance

## 1. What this is
The Joymify mascot family as pictures: Yoji, Pico, Luna, Rex, Mochi, Zing, Byte, five poses each (idle, cheer, thinking, try-again, sleepy), with a Svelte 5 and a React 19 `Mascot` component.

## 2. Source of the art
The characters were designed by the owner of Joymify. The pictures were redrawn in ChatGPT from the owner's character sheet on 2026-11-05, then cut into poses by `crop_mascots.py` (Joy-Quest idea I-015) and converted to WebP at 256 px and 512 px by `scripts/build-assets.mjs`. The characters are original to Joymify; they are not Duolingo characters and copy no other product's mascot.

## 3. Licence
The art belongs to the owner of Joymify and all rights are reserved. The pictures are published publicly in this package (GitHub Packages and npmjs.org) so Joymify apps can install them; publishing does not grant any licence to copy, resell or reuse them elsewhere. The package code (components, data, scripts) is under the same terms. No third-party code or art is bundled.
```

Edit `scripts/lint-colors.sh`: in the `targets=( ... )` list add the line `    "packages/mascots/src"` right after `    "packages/icons/src"`. Edit `scripts/integration.sh`: add the line `(cd packages/mascots && node --test test/*.test.js)` after `(cd packages/react && node --test test/components.test.js)`.

  Edit `README.md` (joy-design root): add a row to the packages table next to `@montionugera/joy-icons`: `| \`packages/mascots\` (\`@montionugera/joy-mascots\`) | The Joymify mascot family (Yoji, Pico, Luna, Rex, Mochi, Zing, Byte), 5 poses each, as WebP pictures with a Svelte 5 \`Mascot\` (\`@montionugera/joy-mascots\`) and a React 19 \`Mascot\` (\`@montionugera/joy-mascots/react\`). |` and add \`@montionugera/joy-mascots\` to the package table in the install section (README line ~68) with entries `@montionugera/joy-mascots/react` (React) and `@montionugera/joy-mascots` (Svelte, needs a Svelte bundler). The `docs-contract` test reads the README for the package name, so this edit belongs here, not at the end.

- [ ] **Step 4: Run to pass.** `cd packages/mascots && node --test test/*.test.js` — expected: all files pass (`# fail 0`). Then from `JD` root `scripts/lint-colors.sh packages/mascots/src; echo exit=$?` — expected `exit=0`; and `cd packages/mascots && pnpm pack --pack-destination /tmp/mascots-pack >/dev/null && tar -tzf /tmp/mascots-pack/*.tgz | grep -c webp` — expected `70`, and `tar -tzf /tmp/mascots-pack/*.tgz | grep -E "test/|\.test\."` prints nothing. Then from `JD` root `node --test scripts/test/docs-contract.test.mjs` — expected pass (the README names `@montionugera/joy-mascots`).
- [ ] **Step 5: Commit** `feat(I-105): joy-mascots provenance, package surface test, README, lint and integration hook`.

### Task B6: Storybook hub page "Mascots"

**Files:**
- Modify: `apps/storybook-hub/src/navigation.manifest.json` (add after the `brand` entry: `{ "id": "mascots", "label": "Mascots", "icon": "brand" }`), `apps/storybook-hub/build.js` (import, view section, asset copy)
- Create: `apps/storybook-hub/tests/mascots.spec.ts`

**Interfaces:**
- Consumes: `MASCOTS`, `POSES` from `packages/mascots/src/data.js`; the 70 WebP files; Playwright helper `setTheme(page, "light" | "dark")` from `apps/storybook-hub/tests/helpers.ts`.
- Produces: hub view `#view-mascots` (nav `href="#mascots"`) with a 7 x 5 grid: a row per character (name as `h3`, personality), five `<img>` per row (`alt=""` plus the pose name in a caption), assets served from `mascots/<id>-<pose>@2x.webp`.

- [ ] **Step 1: Write the failing test**

```ts test:apps/storybook-hub/tests/mascots.spec.ts
import { test, expect } from "@playwright/test";
import { setTheme } from "./helpers";

for (const theme of ["light", "dark"] as const) {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    test(`Mascots view: 35 pictures load in ${theme} at ${viewport.width}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.setViewportSize(viewport);
      await page.goto("/#mascots");
      await setTheme(page, theme);
      const view = page.locator("#view-mascots");
      await expect(view.getByRole("heading", { name: "Mascots", exact: true, level: 2 })).toBeVisible();
      for (const name of ["Yoji", "Pico", "Luna", "Rex", "Mochi", "Zing", "Byte"]) {
        await expect(view.getByRole("heading", { name, level: 3 })).toBeVisible();
      }
      const imgs = view.locator("img.hub-mascot");
      await expect(imgs).toHaveCount(35);
      const broken = await imgs.evaluateAll((els) =>
        (els as HTMLImageElement[]).filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src),
      );
      expect(broken).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}
```

Verify-Cmd: `cd apps/storybook-hub && node build.js && pnpm exec playwright test tests/mascots.spec.ts tests/brand.spec.ts`

- [ ] **Step 2: Run to fail.** Expected: `build.js` succeeds (before the edit), `mascots.spec.ts` fails with `locator('#view-mascots')` not found (4 failures); `brand.spec.ts` passes.
- [ ] **Step 3: Implement.**
  1. `apps/storybook-hub/build.js`, with the other imports at the top (line 5 imports the brand package): add `import { MASCOTS, POSES } from "../../packages/mascots/src/data.js";`.
  2. Add the view right after the closing `</section>` of `view-brand` (the line before `<!-- View: Tokens -->`, around line 5457). Insert this template-literal text (it sits inside the big HTML template, so keep `${...}` as is):

```js
      <!-- View: Mascots (I-105) -->
      <section id="view-mascots" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Mascots</h2>
        <p class="header-tagline">The Joymify mascot family from @montionugera/joy-mascots: seven characters, five poses each. Art by the owner, redrawn in ChatGPT (see the package PROVENANCE.md).</p>
        ${MASCOTS.map(
          (m) => `
        <div class="playground-box">
          <div class="playground-header"><h3 style="margin: 0;">${m.name}</h3><span>${m.personality.join(", ")}</span></div>
          <div class="canvas" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: var(--joy-space-3); justify-items: center;">
            ${POSES.map(
              (pose) => `<figure style="margin: 0; text-align: center;"><img class="hub-mascot" src="mascots/${m.id}-${pose}.webp" srcset="mascots/${m.id}-${pose}.webp 1x, mascots/${m.id}-${pose}@2x.webp 2x" width="96" height="96" alt="" loading="lazy" /><figcaption>${pose}</figcaption></figure>`,
            ).join("")}
          </div>
        </div>`,
        ).join("")}
      </section>
```

  3. Near the brand asset copy (around line 14852-14860, after `fs.copyFileSync(path.join(brandAssetsSrc, "favicon.svg"), path.join(designOutDir, "favicon.svg"));`) add:

```js
// Mascot pictures (I-105): the hub page references them as mascots/<id>-<pose>[@2x].webp.
const mascotAssetsSrc = path.join(__dirname, "../../packages/mascots/assets");
const mascotOutDir = path.join(outDir, "mascots");
fs.mkdirSync(mascotOutDir, { recursive: true });
for (const file of fs.readdirSync(mascotAssetsSrc).filter((f) => f.endsWith(".webp"))) {
  fs.copyFileSync(path.join(mascotAssetsSrc, file), path.join(mascotOutDir, file));
}
```

  4. Add the manifest entry in `navigation.manifest.json` and the `.hub-mascot` rule is not needed (the images carry width/height).
- [ ] **Step 4: Run to pass.** Run the Verify-Cmd. Expected: `mascots.spec.ts` 4 passed, `brand.spec.ts` unchanged passes. Also run `grep -rn "Brand Assets" apps/storybook-hub/tests | head` and, if any spec counts navigation items, run that spec and update its expected count by one.
- [ ] **Step 5: Look at it.** Take 390 and 1280 screenshots of `#mascots` in light and dark with the hub's Playwright (or `ui-visual-verify` shoot.mjs), read them, show them. Commit `feat(I-105): Mascots page in the storybook hub`.

### Task B7: Publish workflow lists and consumer smoke

**Files:**
- Modify: `.github/workflows/publish.yml`, `scripts/test/consumer-smoke.sh`, `scripts/test/publish-contract.test.mjs`
- Create: `packages/mascots/test/publish-workflow.test.js`

**Interfaces:** Produces the addition of `mascots` to every package loop of `publish.yml` (GitHub Packages and npmjs.org, like the other packages), a manifest entry with both tarballs, the updated `publish-contract.test.mjs` (a `mascots` row in `PUBLISHED`, loops, trap) and a smoke test that installs the packed `joy-mascots` tarball into a fresh Vite app and renders one image.

- [ ] **Step 1: Write the failing test**

```js test:packages/mascots/test/publish-workflow.test.js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const yml = fs.readFileSync(new URL('../../../.github/workflows/publish.yml', import.meta.url), 'utf8');
const smoke = fs.readFileSync(new URL('../../../scripts/test/consumer-smoke.sh', import.meta.url), 'utf8');
const loops = yml.split('\n').filter((l) => /for dir in tokens icons brand react svelte/.test(l));

test('mascots is in every package loop, GitHub Packages and npmjs.org', () => {
  assert.strictEqual(loops.length, 7, 'seven package loops in publish.yml');
  assert.strictEqual(loops.filter((l) => l.includes('svelte mascots; do')).length, 7);
});

test('the manifest and the trap name mascots, with both tarballs', () => {
  assert.ok(yml.includes("'svelte', 'mascots']"), 'manifest loop lists mascots');
  assert.ok(yml.includes('packages/mascots/package.json\' EXIT'), 'the trap restores the mascots package.json too');
});

test('the build job builds joy-mascots before the smoke test', () => {
  assert.ok(yml.includes('pnpm --filter @montionugera/joy-mascots build'));
});

test('consumer smoke packs, checks and renders joy-mascots', () => {
  assert.ok(smoke.includes('packages=(tokens icons brand react svelte mascots)'));
  assert.ok(smoke.includes('mascots) echo'), 'allowed paths and required files are defined');
  assert.ok(smoke.includes('MASCOTS_TGZ'));
  assert.ok(smoke.includes('@montionugera/joy-mascots/react'));
  assert.ok(smoke.includes('rex-cheer'));
});
```

Verify-Cmd: `cd packages/mascots && node --test test/publish-workflow.test.js`

- [ ] **Step 2: Run to fail.** Expected: 4 failures (`0 !== 7` style loop-count assertion first).
- [ ] **Step 3: Implement.** In `.github/workflows/publish.yml`:
  1. Line 3 comment: `# Publishes @montionugera/joy-tokens, icons, brand, react, svelte and mascots to GitHub Packages and to npmjs.org.`
  2. Build step (the `Build icons and react` step, line 104-107): rename to `Build icons, react and mascots` and add `pnpm --filter @montionugera/joy-mascots build`.
  3. Lines 156, 162, 187, 209, 279, 321 and 371 (all seven): change `for dir in tokens icons brand react svelte; do` to `for dir in tokens icons brand react svelte mascots; do`.
  4. Line 161 trap: append ` packages/mascots/package.json` to the `git checkout -- ...` list inside the trap string (the string must end `packages/svelte/package.json packages/mascots/package.json' EXIT`).
  5. Manifest script (line 175): change the list to `['tokens', 'icons', 'brand', 'react', 'svelte', 'mascots']`. Nothing else changes in it: both sets exist for mascots.
  6. Before publishing to npmjs.org the owner must register the new package `@montionugera/joy-mascots` for trusted publishing on npmjs.com (repo `montionugera/joy-design`, workflow `publish.yml`, environment `packages`), like the other packages (see the README); the controller raises this in Task B8.

  In `scripts/test/publish-contract.test.mjs`: (a) add to `PUBLISHED` after the `svelte` row: `{ dir: 'mascots', name: '@montionugera/joy-mascots', version: '0.1.0', license: 'SEE LICENSE IN PROVENANCE.md', sideEffects: ['*.css'], files: ['assets', 'dist', 'src/index.ts', 'src/index.d.ts', 'src/data.js', 'src/data.d.ts', 'src/urls.js', 'src/assets.js', 'src/assets.d.ts', 'src/mascot.css', 'src/*.svelte', 'PROVENANCE.md'] },` (must equal `packages/mascots/package.json` `files` exactly; the generic per-package tests then check metadata and that every export path is inside `files`); (b) line ~245: extend the `trap 'git checkout -- ...'` regex to end `packages\/svelte\/package\.json packages\/mascots\/package\.json' EXIT` and change the message to `the trap must restore the six package.json files`; (c) line ~340: the expected loop string becomes `'for dir in tokens icons brand react svelte mascots; do'`.

  In `scripts/test/consumer-smoke.sh`: set `packages=(tokens icons brand react svelte mascots)`; add to `allowed_pattern`: `mascots) echo '^package/(package\.json|PROVENANCE\.md|assets/[^/]+\.webp|dist/.+|src/(index\.ts|index\.d\.ts|data\.js|data\.d\.ts|urls\.js|assets\.js|assets\.d\.ts|mascot\.css)|src/[^/]+\.svelte)$' ;;`; add to `required_files`: `mascots) echo "assets/yoji-idle.webp assets/yoji-idle@2x.webp dist/react.js dist/react.d.ts dist/react/Mascot.js src/index.ts src/data.js src/urls.js src/assets.js src/Mascot.svelte src/mascot.css PROVENANCE.md" ;;`; in step 1 add `(cd "$repo_root" && pnpm --filter @montionugera/joy-mascots build)`; in the `node -e` block pass `MASCOTS_TGZ="$(tarball_of mascots)"` and add `"@montionugera/joy-mascots": "file:" + process.env.MASCOTS_TGZ,` to `tarballs`; in `App.tsx` add `import { Mascot } from '@montionugera/joy-mascots/react';`, `import '@montionugera/joy-mascots/mascot.css';` and `<Mascot name="rex" pose="cheer" size={96} label="Rex" />` inside `<main>`; in `ssr-check.mjs` import `{ Mascot } from '@montionugera/joy-mascots/react'`, render `h(Mascot, { name: 'rex', pose: 'cheer', size: 96, label: 'Rex' })` inside `main`, and add the needles `'alt="Rex"'` and `'rex-cheer'`; in `ssr-svelte-check.mjs` add `'@montionugera/joy-mascots'` to `dedupe`-free `ssr.noExternal`, load `server.ssrLoadModule('@montionugera/joy-mascots')`, render `mod.Mascot` with `{ name: 'rex', pose: 'cheer', label: 'Rex' }` and fail unless the body contains `rex-cheer`; after the Vite build add `ls "$app"/dist/assets/rex-cheer*.webp >/dev/null || fail "the built app has no rex-cheer picture"`; extend the final lockfile grep regex with `|mascots`.
- [ ] **Step 4: Run to pass.** `cd packages/mascots && node --test test/publish-workflow.test.js` — expected `# pass 4`. Then `./scripts/test/consumer-smoke.sh` from the `JD` root (needs network) — expected final lines `ssr-check: rendered ... characters of markup` and `ssr-svelte-check: rendered Badge:`, exit 0. Then `node --test scripts/test/publish-contract.test.mjs scripts/test/docs-contract.test.mjs` — expected all pass. Then `git diff --stat` shows only `publish.yml`, `consumer-smoke.sh`, `publish-contract.test.mjs` and the new test.
- [ ] **Step 5: Commit** `ci(I-105): publish joy-mascots to GitHub Packages and npmjs.org; smoke-test its tarball`.

### Task B8: STOP - publishing 0.1.0 is R0 (controller asks the owner)

**Files:** none. This task is not for a worker.

- [ ] **Step 1 (controller only): Stop and ask.** After the Phase B gate, the controller asks the owner with `AskUserQuestion`, one question: "joy-mascots 0.1.0 is ready. Publish it (GitHub Packages and public npmjs.org, like the other joy-design packages) by pushing tag packages-v0.1.0 on main? npmjs.org also needs a trusted publisher registered for the new package." Options: publish to both (recommended) / not yet. Nothing else in this plan publishes anything.
- [ ] **Step 2 (controller only): After a yes**, merge the I-105 branch to `main` through the usual `psrw` flow, then tag and push `packages-v0.1.0` and watch `publish.yml` (`gh run watch --exit-status`). A worker never runs `npm publish`, `pnpm publish` or pushes the tag. Verify with `npm view @montionugera/joy-mascots@0.1.0 version` (public npm, no token) printing `0.1.0`.
- [ ] **Step 3 (controller only):** if the owner picks "not yet", Phase D stops before Task D8 and keeps the `link:` dependency on the feature branch.

**Phase gate (controller only):** verify → review (code-reviewer + typescript-reviewer on opus) → /simplify → re-verify. Verify = `cd packages/mascots && node --test test/*.test.js`, `pnpm --filter @montionugera/joy-mascots check build`, `cd apps/storybook-hub && node build.js && pnpm exec playwright test tests/mascots.spec.ts tests/brand.spec.ts`, `scripts/lint-colors.sh`, `scripts/test/consumer-smoke.sh`, and the screenshots read.

---

## Phase C: Joy-Quest server

Runs in: `JQ` (Joy-Quest feature worktree for I-015). Needs Postgres: `make db-up`, then `make migrate` once. Every Verify-Cmd below carries the two test URLs from the Makefile header (`PG_PORT` defaults to 5432); `<T>` in the prose means these two assignments:
`TEST_DATABASE_URL='postgres://joyquest_app:app@localhost:5432/joyquest_test?sslmode=disable' MIGRATIONS_TEST_DATABASE_URL='postgres://joyquest_owner:owner@localhost:5432/joyquest_test?sslmode=disable'`

### Task C1: Reward config - character slot and the six shop items

**Files:**
- Modify: `server/internal/rewards/config.go` (lines 43-44 `DefaultLook`, line 112 error text), `server/internal/rewards/default_config.json` (the `shop` array), `server/internal/rewards/config_test.go` (line 33 expectation)

**Interfaces:**
- Consumes: `rewards.ShopItem`, `rewards.Config.Validate`.
- Produces: `rewards.DefaultLook == map[string]string{"character": "yoji"}`; `DefaultConfig().Shop` = the six items; `Validate` error text `shop[i].slot must be one of character (got "<slot>")`.

- [ ] **Step 1: Write the failing test.** In `server/internal/rewards/config_test.go` change the existing case on line 33 to

```go
		{"shop slot", func(c *Config) { c.Shop[0].Slot = "hat" }, `shop[0].slot must be one of character (got "hat")`},
```
and append:

```go test:server/internal/rewards/config_test.go
func TestDefaultConfig_ShopIsTheSixCharacters(t *testing.T) {
	type row struct {
		ID, Name string
		Price    int
	}
	var got []row
	for _, it := range DefaultConfig().Shop {
		require.Equal(t, "character", it.Slot)
		got = append(got, row{it.ID, it.Name, it.Price})
	}
	require.Equal(t, []row{
		{"pico", "Pico", 100}, {"luna", "Luna", 100}, {"rex", "Rex", 150},
		{"mochi", "Mochi", 150}, {"zing", "Zing", 200}, {"byte", "Byte", 200},
	}, got)
	require.Equal(t, map[string]string{"character": "yoji"}, DefaultLook)
	require.NoError(t, DefaultConfig().Validate())
}
```

Verify-Cmd: `cd server && go test -count=1 ./internal/rewards/`

- [ ] **Step 2: Run to fail.** Expected: `TestDefaultConfig_ShopIsTheSixCharacters` fails (`Not equal` on the slot "body"), and the changed "shop slot" case fails with the old text `must be one of body, star, accessory`.
- [ ] **Step 3: Implement.** In `config.go` replace the `DefaultLook` line and comment with

```go
// Default look per slot; these are always "owned" and never in the shop. Today the only slot is the
// learner's character.
var DefaultLook = map[string]string{"character": "yoji"}
```
and the slot error with `p = append(p, fmt.Sprintf("%s.slot must be one of character (got %q)", path, it.Slot))`. Replace the `"shop": [...]` array in `default_config.json` with

```json
  "shop": [
    {"id": "pico",  "slot": "character", "name": "Pico",  "price": 100},
    {"id": "luna",  "slot": "character", "name": "Luna",  "price": 100},
    {"id": "rex",   "slot": "character", "name": "Rex",   "price": 150},
    {"id": "mochi", "slot": "character", "name": "Mochi", "price": 150},
    {"id": "zing",  "slot": "character", "name": "Zing",  "price": 200},
    {"id": "byte",  "slot": "character", "name": "Byte",  "price": 200}
  ]
```
- [ ] **Step 4: Run to pass.** The Verify-Cmd passes (`ok  .../internal/rewards`).
- [ ] **Step 5: Commit** `feat(I-015): reward config sells the six characters`.

### Task C2: Migration 0017 (`member_cosmetics.mascot`, stored rewards config rewrite)

**Files:**
- Create: `server/migrations/0017_mascot_character.sql`, `server/internal/store/mascot_migration_test.go`
- Modify: `server/internal/store/migrate_test.go` (`TestMigrate_0016UpDownUp`, last two statements), `server/internal/store/db/` (regenerated in C3, not here)
- Exists: `server/migrations/0016_rewards.sql`, `server/migrations/migrations.go` (embeds `*.sql`), `server/internal/testdb/testdb.go` (`testdb.New`, `testdb.OwnerURL`).

**Interfaces:**
- Consumes: Task C1 (`rewards.DefaultConfig().Shop` = six characters); goose `DownToContext`/`UpContext` over `migrations.FS` (pattern in `migrate_test.go` lines 156-211); `store.RewardConfig(ctx)` (`store/rewards.go:36`) and `rewards.DefaultConfig()`.
- Produces: table `member_cosmetics(member_id uuid PK, mascot text NOT NULL DEFAULT 'yoji', updated_at timestamptz)`; `settings` row `rewards` (if present) with `shop` = the six character items and every other key unchanged; Down restores `body`/`star`/`accessory` with their old defaults and the old seven-item `shop`.

- [ ] **Step 1: Write the failing test**

```go test:server/internal/store/mascot_migration_test.go
package store_test

import (
	"context"
	"database/sql"
	"encoding/json"
	"testing"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/stretchr/testify/require"

	"github.com/montionugera/joy-quest/server/internal/rewards"
	"github.com/montionugera/joy-quest/server/internal/testdb"
	"github.com/montionugera/joy-quest/server/migrations"
)

func cosmeticColumns(t *testing.T, db *sql.DB) []string {
	t.Helper()
	rows, err := db.Query(`SELECT column_name FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'member_cosmetics' ORDER BY column_name`)
	require.NoError(t, err)
	defer rows.Close()
	var cols []string
	for rows.Next() {
		var c string
		require.NoError(t, rows.Scan(&c))
		cols = append(cols, c)
	}
	require.NoError(t, rows.Err())
	return cols
}

func TestMascotMigration_ColumnDefaultAndAppRoleGrants(t *testing.T) {
	st := testdb.New(t)
	ctx := context.Background()
	sqlDB, err := sql.Open("pgx", testdb.OwnerURL(t))
	require.NoError(t, err)
	t.Cleanup(func() { _ = sqlDB.Close() })
	require.ElementsMatch(t, []string{"member_id", "mascot", "updated_at"}, cosmeticColumns(t, sqlDB))

	var memberID string
	require.NoError(t, st.Pool.QueryRow(ctx, `INSERT INTO members (sso_user_id, email, handle, role)
		VALUES ('usr_mc', 'mc@x.io', 'mascoter', 'learner') RETURNING id`).Scan(&memberID))
	_, err = st.Pool.Exec(ctx, `INSERT INTO member_cosmetics (member_id) VALUES ($1)`, memberID)
	require.NoError(t, err)
	var mascot string
	require.NoError(t, st.Pool.QueryRow(ctx, `SELECT mascot FROM member_cosmetics WHERE member_id = $1`, memberID).Scan(&mascot))
	require.Equal(t, "yoji", mascot, "a new learner wears Yoji")
	_, err = st.Pool.Exec(ctx, `UPDATE member_cosmetics SET mascot = 'pico' WHERE member_id = $1`, memberID)
	require.NoError(t, err, "the app role can change the worn character")
}

func TestMascotMigration_RewritesStoredShopAndKeepsOtherKeys(t *testing.T) {
	st := testdb.New(t)
	ctx := context.Background()
	sqlDB, err := sql.Open("pgx", testdb.OwnerURL(t))
	require.NoError(t, err)
	t.Cleanup(func() { _ = sqlDB.Close() })
	goose.SetBaseFS(migrations.FS)
	require.NoError(t, goose.SetDialect("postgres"))

	// Back to 0016: the old columns return.
	require.NoError(t, goose.DownToContext(ctx, sqlDB, ".", 16))
	require.ElementsMatch(t, []string{"member_id", "body", "star", "accessory", "updated_at"}, cosmeticColumns(t, sqlDB))

	// A tuned config with the old body items, as an admin would have saved it.
	cfg := rewards.DefaultConfig()
	cfg.LessonXP = 37
	cfg.Shop = []rewards.ShopItem{
		{ID: "body-mint", Slot: "body", Name: "Mint body", Price: 30},
		{ID: "acc-scarf", Slot: "accessory", Name: "Cozy scarf", Price: 80},
	}
	raw, err := json.Marshal(cfg)
	require.NoError(t, err)
	_, err = sqlDB.ExecContext(ctx, `INSERT INTO settings (key, value) VALUES ('rewards', $1)
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, string(raw))
	require.NoError(t, err)

	require.NoError(t, goose.UpContext(ctx, sqlDB, "."))
	require.ElementsMatch(t, []string{"member_id", "mascot", "updated_at"}, cosmeticColumns(t, sqlDB))

	got, err := st.RewardConfig(ctx)
	require.NoError(t, err)
	want := rewards.DefaultConfig()
	require.Equal(t, 37, got.LessonXP, "the admin's tuned value survives")
	require.Equal(t, want.Chests, got.Chests)
	require.Equal(t, want.XPPerLevel, got.XPPerLevel)
	require.Equal(t, want.Shop, got.Shop, "exactly the six character items (Task C1 config)")
	require.NoError(t, got.Validate())

	// Down rewrites the stored shop to the fixed pre-0017 items written in the migration's Down block
	// (body-mint first), whatever the config held before Up; it does not keep the six character items.
	require.NoError(t, goose.DownToContext(ctx, sqlDB, ".", 16))
	var firstID string
	require.NoError(t, sqlDB.QueryRowContext(ctx, `SELECT value->'shop'->0->>'id' FROM settings WHERE key = 'rewards'`).Scan(&firstID))
	require.Equal(t, "body-mint", firstID)
	require.NoError(t, goose.UpContext(ctx, sqlDB, "."))
}

func TestMascotMigration_NoStoredConfigIsFine(t *testing.T) {
	st := testdb.New(t)
	ctx := context.Background()
	var n int
	require.NoError(t, st.Pool.QueryRow(ctx, `SELECT count(*) FROM settings WHERE key = 'rewards'`).Scan(&n))
	require.Zero(t, n, "nothing stored: the migration touched no row and the defaults apply")
}
```

Verify-Cmd: `cd server && TEST_DATABASE_URL='postgres://joyquest_app:app@localhost:5432/joyquest_test?sslmode=disable' MIGRATIONS_TEST_DATABASE_URL='postgres://joyquest_owner:owner@localhost:5432/joyquest_test?sslmode=disable' go test -tags dev -p 1 -count=1 -run 'TestMascotMigration|TestMigrate_|TestRewardsMigration' ./internal/store/`

- [ ] **Step 2: Run to fail.** Run the Verify-Cmd. Expected: `TestMascotMigration_ColumnDefaultAndAppRoleGrants` fails (`pq`/pgx error: column "mascot" ... does not exist, SQLSTATE 42703); the other two fail on the same missing column or on Down not finding 0017.

- [ ] **Step 3: Implement.** Create `server/migrations/0017_mascot_character.sql`:

```sql
-- +goose Up
-- The learner's chosen character replaces the Star Slime look (I-015). Old body/star/accessory
-- picks are dropped with no refund (no production users); their purchase rows stay in the
-- append-only reward_events ledger and only count against the coin total.
ALTER TABLE member_cosmetics ADD COLUMN mascot text NOT NULL DEFAULT 'yoji';
ALTER TABLE member_cosmetics DROP COLUMN body, DROP COLUMN star, DROP COLUMN accessory;

-- A stored rewards config keeps every key except shop, which becomes the six characters. Without
-- this the old slots would fail Validate and RewardConfigQ would quietly fall back to the defaults,
-- losing the admin's tuned values.
UPDATE settings
SET value = jsonb_set(value, '{shop}', '[
  {"id": "pico",  "slot": "character", "name": "Pico",  "price": 100},
  {"id": "luna",  "slot": "character", "name": "Luna",  "price": 100},
  {"id": "rex",   "slot": "character", "name": "Rex",   "price": 150},
  {"id": "mochi", "slot": "character", "name": "Mochi", "price": 150},
  {"id": "zing",  "slot": "character", "name": "Zing",  "price": 200},
  {"id": "byte",  "slot": "character", "name": "Byte",  "price": 200}
]'::jsonb),
    updated_at = now()
WHERE key = 'rewards';

GRANT SELECT, INSERT, UPDATE ON member_cosmetics TO joyquest_app;
GRANT SELECT, INSERT, UPDATE ON settings TO joyquest_app;

-- +goose Down
ALTER TABLE member_cosmetics
    ADD COLUMN body      text NOT NULL DEFAULT 'honey',
    ADD COLUMN star      text NOT NULL DEFAULT 'classic',
    ADD COLUMN accessory text NOT NULL DEFAULT '';
ALTER TABLE member_cosmetics DROP COLUMN mascot;

UPDATE settings
SET value = jsonb_set(value, '{shop}', '[
  {"id": "body-mint",   "slot": "body",      "name": "Mint body",     "price": 30},
  {"id": "body-berry",  "slot": "body",      "name": "Berry body",    "price": 30},
  {"id": "body-sky",    "slot": "body",      "name": "Sky body",      "price": 40},
  {"id": "star-sparkle","slot": "star",      "name": "Sparkle star",  "price": 50},
  {"id": "star-ring",   "slot": "star",      "name": "Ringed star",   "price": 60},
  {"id": "acc-scarf",   "slot": "accessory", "name": "Cozy scarf",    "price": 80},
  {"id": "acc-glasses", "slot": "accessory", "name": "Round glasses", "price": 80}
]'::jsonb),
    updated_at = now()
WHERE key = 'rewards';

GRANT SELECT, INSERT, UPDATE ON member_cosmetics TO joyquest_app;
```

In `server/internal/store/migrate_test.go` in `TestMigrate_0016UpDownUp` change

```go
	_, err = st.Pool.Exec(ctx, `UPDATE member_cosmetics SET body='mint' WHERE member_id=$1`, memberID)
	require.NoError(t, err, "app role can update cosmetics")
```
to
```go
	_, err = st.Pool.Exec(ctx, `UPDATE member_cosmetics SET mascot='pico' WHERE member_id=$1`, memberID)
	require.NoError(t, err, "app role can update the worn character")
```

- [ ] **Step 4: Run to pass.** Expected: all tests in the Verify-Cmd pass.
- [ ] **Step 5: Commit** `feat(I-015): migration 0017 mascot column and stored shop rewrite`.

### Task C3: Store - `Equipped{Character}`, `Equip`, `Purchase`, sqlc

**Files:**
- Modify: `server/queries/rewards.sql` (`UpsertCosmetics`), `server/internal/store/rewards.go` (`Equipped` ~line 291, `defaultEquipped` ~117, `RewardsSummary` ~360, `Purchase` ~480, `Equip` ~507), `server/internal/store/rewards_shop_test.go` (`TestPurchaseAndEquip`), regenerated `server/internal/store/db/*.go`
- Consumes: `rwEnv`/`newRwEnv`/`e.tx` helpers (`rewards_test.go`, `rewards_shop_test.go`), `rewards.DefaultLook`, `store.SetRewardConfig`.

**Interfaces:**
- Produces: `store.Equipped{Character string \`json:"character"\`}`; `Equip(ctx, q, memberID, slot, itemID) (Equipped, error)` accepts only slot `"character"` (else `ErrUnknownItem`), `yoji` always succeeds, other ids must be in the config (else `ErrUnknownItem`) and owned (else `ErrNotOwned`); `Purchase(..., "yoji")` returns `ErrAlreadyOwned`; `Summary.Equipped.Character` is `yoji` when the stored id is not in the config; `db.UpsertCosmeticsParams{MemberID uuid.UUID; Mascot string}`; `db.MemberCosmetic{MemberID, Mascot, UpdatedAt}`.

- [ ] **Step 1: Write the failing test.** Replace `TestPurchaseAndEquip` in `server/internal/store/rewards_shop_test.go` with:

```go test:server/internal/store/rewards_shop_test.go
func TestPurchaseAndEquip(t *testing.T) {
	e := newRwEnv(t, "UTC")
	ctx := context.Background()
	err := e.tx(t, func(q *db.Queries) error { return store.Purchase(ctx, q, e.m.ID, "luna", time.Now()) })
	var nec *store.NotEnoughCoinsError
	require.ErrorAs(t, err, &nec)
	require.Equal(t, 100, nec.Need)

	_, err = e.st.Pool.Exec(ctx, `INSERT INTO reward_events (member_id, kind, amount, source) VALUES ($1,'coins',300,'chest:seed')`, e.m.ID)
	require.NoError(t, err)
	require.NoError(t, e.tx(t, func(q *db.Queries) error { return store.Purchase(ctx, q, e.m.ID, "luna", time.Now()) }))
	err = e.tx(t, func(q *db.Queries) error { return store.Purchase(ctx, q, e.m.ID, "luna", time.Now()) })
	require.ErrorIs(t, err, store.ErrAlreadyOwned)
	err = e.tx(t, func(q *db.Queries) error { return store.Purchase(ctx, q, e.m.ID, "nope", time.Now()) })
	require.ErrorIs(t, err, store.ErrUnknownItem)
	err = e.tx(t, func(q *db.Queries) error { return store.Purchase(ctx, q, e.m.ID, "yoji", time.Now()) })
	require.ErrorIs(t, err, store.ErrAlreadyOwned, "Yoji is built in: nothing to buy")

	var eq store.Equipped
	require.NoError(t, e.tx(t, func(q *db.Queries) (err error) { eq, err = store.Equip(ctx, q, e.m.ID, "character", "luna"); return }))
	require.Equal(t, "luna", eq.Character)
	err = e.tx(t, func(q *db.Queries) error { _, err := store.Equip(ctx, q, e.m.ID, "character", "rex"); return err })
	require.ErrorIs(t, err, store.ErrNotOwned)
	err = e.tx(t, func(q *db.Queries) error { _, err := store.Equip(ctx, q, e.m.ID, "body", "luna"); return err })
	require.ErrorIs(t, err, store.ErrUnknownItem, "the old slots are gone")
	err = e.tx(t, func(q *db.Queries) error { _, err := store.Equip(ctx, q, e.m.ID, "character", "dragon"); return err })
	require.ErrorIs(t, err, store.ErrUnknownItem)
	require.NoError(t, e.tx(t, func(q *db.Queries) (err error) { eq, err = store.Equip(ctx, q, e.m.ID, "character", "yoji"); return }))
	require.Equal(t, "yoji", eq.Character, "Yoji is always wearable")

	var s store.Summary
	require.NoError(t, e.tx(t, func(q *db.Queries) (err error) { s, err = store.RewardsSummary(ctx, q, e.m, time.Now()); return }))
	require.Equal(t, 200, s.Coins)
	require.Equal(t, "yoji", s.Equipped.Character)
}

func TestSummary_NewLearnerWearsYoji(t *testing.T) {
	e := newRwEnv(t, "UTC")
	ctx := context.Background()
	var s store.Summary
	require.NoError(t, e.tx(t, func(q *db.Queries) (err error) { s, err = store.RewardsSummary(ctx, q, e.m, time.Now()); return }))
	require.Equal(t, store.Equipped{Character: "yoji"}, s.Equipped)
}

func TestSummary_ReportsYojiWhenTheWornCharacterLeftTheShop(t *testing.T) {
	e := newRwEnv(t, "UTC")
	ctx := context.Background()
	_, err := e.st.Pool.Exec(ctx, `INSERT INTO reward_events (member_id, kind, amount, source) VALUES ($1,'coins',300,'chest:seed')`, e.m.ID)
	require.NoError(t, err)
	require.NoError(t, e.tx(t, func(q *db.Queries) error { return store.Purchase(ctx, q, e.m.ID, "luna", time.Now()) }))
	require.NoError(t, e.tx(t, func(q *db.Queries) error { _, err := store.Equip(ctx, q, e.m.ID, "character", "luna"); return err }))

	cfg := rewards.DefaultConfig()
	cfg.Shop = cfg.Shop[:1] // only Pico is sold now; Luna was removed later
	require.NoError(t, e.st.SetRewardConfig(ctx, e.m.ID, cfg))

	var s store.Summary
	require.NoError(t, e.tx(t, func(q *db.Queries) (err error) { s, err = store.RewardsSummary(ctx, q, e.m, time.Now()); return }))
	require.Equal(t, "yoji", s.Equipped.Character)
}
```
(`rewards` and `uuid` imports already exist in that file; drop `uuid` only if the compiler says it is unused.)

Verify-Cmd: `cd server && TEST_DATABASE_URL='postgres://joyquest_app:app@localhost:5432/joyquest_test?sslmode=disable' MIGRATIONS_TEST_DATABASE_URL='postgres://joyquest_owner:owner@localhost:5432/joyquest_test?sslmode=disable' go test -tags dev -p 1 -count=1 -run 'TestPurchaseAndEquip|TestSummary_' ./internal/store/`

- [ ] **Step 2: Run to fail.** Expected: compile error `eq.Character undefined (type store.Equipped has no field or method Character)`.
- [ ] **Step 3: Implement.**
  1. `server/queries/rewards.sql`, replace `UpsertCosmetics`:

```sql
-- name: UpsertCosmetics :one
INSERT INTO member_cosmetics (member_id, mascot) VALUES ($1, $2)
ON CONFLICT (member_id) DO UPDATE SET mascot = EXCLUDED.mascot, updated_at = now()
RETURNING *;
```
  2. `make sqlc` (from `JQ`). Expected: no error; `git diff --stat server/internal/store/db` shows `models.go`, `rewards.sql.go` changed; `make sqlc-check` prints nothing.
  3. `server/internal/store/rewards.go`:
     - `Equipped` becomes `type Equipped struct { Character string \`json:"character"\` }`.
     - `defaultEquipped()` returns `Equipped{Character: rewards.DefaultLook["character"]}`.
     - Add below `shopItem`:

```go
// wornOrDefault reports Yoji when the stored character is no longer sold (an item removed later).
func wornOrDefault(cfg rewards.Config, id string) string {
	if id == rewards.DefaultLook["character"] {
		return id
	}
	if _, ok := shopItem(cfg, id); ok {
		return id
	}
	return rewards.DefaultLook["character"]
}
```
     - In `RewardsSummary` replace `s.Equipped = Equipped{Body: c.Body, Star: c.Star, Accessory: c.Accessory}` with `s.Equipped = Equipped{Character: wornOrDefault(cfg, c.Mascot)}`.
     - In `Purchase`, first statement after the `cfg` load: `if itemID == rewards.DefaultLook["character"] { return ErrAlreadyOwned }`.
     - Replace the tail of `Equip` (from `cur := defaultEquipped()` to the end) with:

```go
	if _, err := q.UpsertCosmetics(ctx, db.UpsertCosmeticsParams{MemberID: memberID, Mascot: itemID}); err != nil {
		return Equipped{}, err
	}
	return Equipped{Character: itemID}, nil
}
```
- [ ] **Step 4: Run to pass.** Run the Verify-Cmd - expected `ok`. Then `cd server && go build ./... && go vet -tags dev ./...` - expected no output (httpapi still compiles because it only passes `store.Equipped` through).
- [ ] **Step 5: Commit** `feat(I-015): store equips and reports the worn character`.

### Task C4: HTTP API - built-in Yoji item and character copy

**Files:**
- Modify: `server/internal/httpapi/rewards.go` (`getShop` ~78-104, `postPurchase` ~107-131, `putEquip` ~140-162), `server/internal/httpapi/rewards_test.go` (`TestRewards_ShopConflicts` ~145-160; new test)
- Consumes: test helpers in package `httpapi_test`: `newRewardsAPI(t)` (returns `*httptest.Server, *store.Store, *pgxpool.Pool`), `token(t, jwt.MapClaims)`, `consent(t, srv, tok)`, `do(t, srv, method, path, tok, body) (int, map[string]any)`, `errCode(body)`.

**Interfaces:**
- Produces: `GET /v1/shop` -> `items[0] == {"id":"yoji","slot":"character","name":"Yoji","price":0,"owned":true,"need":0}` then the configured items; `equipped` is `{"character": "<id>"}`; `POST /v1/shop/{id}/purchase` 409 `already_owned` message `You already have <Name>.`; `PUT /v1/me/cosmetics/equip` body `{slot:"character", item_id}` 403 `not_owned` message `Buy <Name> first, then you can wear them.`

- [ ] **Step 1: Write the failing test.** In `TestRewards_ShopConflicts` change `body-mint` to `pico` and `"slot": "body"` to `"slot": "character"` (both occurrences: lines ~149 and ~157), then add:

```go test:server/internal/httpapi/rewards_test.go
func TestRewards_CharacterShopFlow(t *testing.T) {
	srv, st, _ := newRewardsAPI(t)
	tok := token(t, jwt.MapClaims{"sub": "u1", "email": "a@x.io"})
	consent(t, srv, tok)

	status, shop := do(t, srv, "GET", "/v1/shop", tok, nil)
	require.Equal(t, 200, status)
	items := shop["items"].([]any)
	require.Len(t, items, 7, "Yoji plus the six sold characters")
	require.Equal(t, map[string]any{"id": "yoji", "slot": "character", "name": "Yoji", "price": float64(0), "owned": true, "need": float64(0)}, items[0])
	var ids []string
	for _, it := range items {
		ids = append(ids, it.(map[string]any)["id"].(string))
	}
	require.Equal(t, []string{"yoji", "pico", "luna", "rex", "mochi", "zing", "byte"}, ids)
	require.Equal(t, map[string]any{"character": "yoji"}, shop["equipped"], "a new learner wears Yoji")

	_, me := do(t, srv, "GET", "/v1/me", tok, nil)
	_, err := st.Pool.Exec(context.Background(), `INSERT INTO reward_events (member_id, kind, amount, source) VALUES ($1,'coins',100,'chest:seed')`, me["id"])
	require.NoError(t, err)

	status, body := do(t, srv, "POST", "/v1/shop/rex/purchase", tok, nil)
	require.Equal(t, 409, status)
	require.Equal(t, "not_enough_coins", errCode(body))
	require.Equal(t, "Need 50 more coins", body["error"].(map[string]any)["message"])
	status, body = do(t, srv, "PUT", "/v1/me/cosmetics/equip", tok, map[string]any{"slot": "character", "item_id": "rex"})
	require.Equal(t, 403, status)
	require.Equal(t, "not_owned", errCode(body))
	require.Equal(t, "Buy Rex first, then you can wear them.", body["error"].(map[string]any)["message"])

	status, bought := do(t, srv, "POST", "/v1/shop/luna/purchase", tok, nil)
	require.Equal(t, 200, status)
	require.EqualValues(t, 0, bought["coins"])
	status, body = do(t, srv, "POST", "/v1/shop/luna/purchase", tok, nil)
	require.Equal(t, 409, status)
	require.Equal(t, "already_owned", errCode(body))
	require.Equal(t, "You already have Luna.", body["error"].(map[string]any)["message"])
	status, body = do(t, srv, "POST", "/v1/shop/yoji/purchase", tok, nil)
	require.Equal(t, 409, status)
	require.Equal(t, "You already have Yoji.", body["error"].(map[string]any)["message"])

	status, eq := do(t, srv, "PUT", "/v1/me/cosmetics/equip", tok, map[string]any{"slot": "character", "item_id": "luna"})
	require.Equal(t, 200, status)
	require.Equal(t, map[string]any{"character": "luna"}, eq)
	_, home := do(t, srv, "GET", "/v1/me/rewards", tok, nil)
	require.Equal(t, map[string]any{"character": "luna"}, home["equipped"])

	status, _ = do(t, srv, "PUT", "/v1/me/cosmetics/equip", tok, map[string]any{"slot": "character", "item_id": "yoji"})
	require.Equal(t, 200, status, "Yoji is always wearable")
	status, _ = do(t, srv, "PUT", "/v1/me/cosmetics/equip", tok, map[string]any{"slot": "body", "item_id": "luna"})
	require.Equal(t, 404, status, "the old slots are gone")
}
```

Verify-Cmd: `cd server && TEST_DATABASE_URL='postgres://joyquest_app:app@localhost:5432/joyquest_test?sslmode=disable' MIGRATIONS_TEST_DATABASE_URL='postgres://joyquest_owner:owner@localhost:5432/joyquest_test?sslmode=disable' go test -tags dev -p 1 -count=1 -run 'TestRewards_' ./internal/httpapi/`

- [ ] **Step 2: Run to fail.** Expected: `TestRewards_CharacterShopFlow` fails at `require.Len(t, items, 7)` (`expected: 7, actual: 6`).
- [ ] **Step 3: Implement** in `server/internal/httpapi/rewards.go`:
  - Add (needs imports `context` already present, and `rewards` package `github.com/montionugera/joy-quest/server/internal/rewards`):

```go
// characterName is the name used in messages: Yoji is built in, the rest come from the shop config.
func (s *server) characterName(ctx context.Context, id string) string {
	if id == rewards.DefaultLook["character"] {
		return "Yoji"
	}
	cfg, err := store.RewardConfigQ(ctx, db.New(s.store.Pool))
	if err != nil {
		return id
	}
	for _, it := range cfg.Shop {
		if it.ID == id {
			return it.Name
		}
	}
	return id
}
```
  - `getShop`: build `items` as `make([]shopItemView, 0, len(cfg.Shop)+1)` and append first `shopItemView{ID: rewards.DefaultLook["character"], Slot: "character", Name: "Yoji", Price: 0, Owned: true}` before the `for _, it := range cfg.Shop` loop.
  - `postPurchase`: the `ErrAlreadyOwned` case becomes `writeError(w, http.StatusConflict, "already_owned", fmt.Sprintf("You already have %s.", s.characterName(r.Context(), r.PathValue("item_id"))))`.
  - `putEquip`: the `ErrNotOwned` case becomes `writeError(w, http.StatusForbidden, "not_owned", fmt.Sprintf("Buy %s first, then you can wear them.", s.characterName(r.Context(), body.ItemID)))`; the 500 text becomes `"could not change your character"`.
- [ ] **Step 4: Run to pass.** Run the Verify-Cmd - expected `ok`. Also `cd server && go vet -tags dev ./...` clean.
- [ ] **Step 5: Commit** `feat(I-015): shop API lists Yoji first and names characters in messages`.

### Task C5: Dev-only coin grant in `cmd/seed`

**Files:**
- Modify: `server/cmd/seed/main.go`
- Create: `server/cmd/seed/coins.go`, `server/cmd/seed/coins_test.go` (both `//go:build dev`)
- Consumes: `store.New(ctx, url, 1)`, `st.Pool`, `db.New(pool).GetMemberBySSOUserID`, `db.InsertRewardEventParams`, `rewards.KindCoins`.

**Interfaces:**
- Produces: `grantCoins(ctx context.Context, st *store.Store, ssoSub string, amount int) error` inserting one `coins` row (unique source `seed:<uuid>`) for the member with that SSO user id; error if the member does not exist or `amount < 1`. CLI: `go run -tags dev ./cmd/seed -grant-sub <sso_sub> -coins <n>` (still needs `MIGRATIONS_DATABASE_URL`, owner role). Used by the e2e test in Task D7.

- [ ] **Step 1: Write the failing test**

```go test:server/cmd/seed/coins_test.go
//go:build dev

package main

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/montionugera/joy-quest/server/internal/store"
	"github.com/montionugera/joy-quest/server/internal/testdb"
)

func TestGrantCoins_AddsCoinsRowsForTheMember(t *testing.T) {
	st := testdb.New(t)
	ctx := context.Background()
	owner, err := store.New(ctx, testdb.OwnerURL(t), 1)
	require.NoError(t, err)
	t.Cleanup(owner.Close)
	m, err := st.UpsertMember(ctx, "usr_seed_t", "seed-t@example.com", "learner")
	require.NoError(t, err)

	require.NoError(t, grantCoins(ctx, owner, "usr_seed_t", 300))
	require.NoError(t, grantCoins(ctx, owner, "usr_seed_t", 50))
	var total int
	require.NoError(t, st.Pool.QueryRow(ctx, `SELECT COALESCE(SUM(amount), 0) FROM reward_events WHERE member_id = $1 AND kind = 'coins'`, m.ID).Scan(&total))
	require.Equal(t, 350, total, "two grants, both counted (each has its own source)")

	require.Error(t, grantCoins(ctx, owner, "usr_missing", 10), "unknown member")
	require.Error(t, grantCoins(ctx, owner, "usr_seed_t", 0), "amount must be positive")
}
```

Verify-Cmd: `cd server && TEST_DATABASE_URL='postgres://joyquest_app:app@localhost:5432/joyquest_test?sslmode=disable' MIGRATIONS_TEST_DATABASE_URL='postgres://joyquest_owner:owner@localhost:5432/joyquest_test?sslmode=disable' go test -tags dev -p 1 -count=1 ./cmd/seed/`

- [ ] **Step 2: Run to fail.** Expected: `undefined: grantCoins`.
- [ ] **Step 3: Implement.** `server/cmd/seed/coins.go`:

```go
//go:build dev

package main

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/montionugera/joy-quest/server/internal/rewards"
	"github.com/montionugera/joy-quest/server/internal/store"
	"github.com/montionugera/joy-quest/server/internal/store/db"
)

// grantCoins gives a signed-in member coins so e2e can buy a character without finishing lessons.
// Dev only (this package is //go:build dev and never deployed); needs the owner role like the rest of seed.
func grantCoins(ctx context.Context, st *store.Store, ssoSub string, amount int) error {
	if amount < 1 {
		return errors.New("seed: -coins must be at least 1")
	}
	q := db.New(st.Pool)
	m, err := q.GetMemberBySSOUserID(ctx, ssoSub)
	if err != nil {
		return fmt.Errorf("seed: no member with sso id %q (sign in once first): %w", ssoSub, err)
	}
	_, err = q.InsertRewardEvent(ctx, db.InsertRewardEventParams{
		MemberID: m.ID, Kind: rewards.KindCoins, Amount: int32(amount),
		Source: "seed:" + uuid.NewString(), Meta: []byte(`{}`), At: time.Now(),
	})
	return err
}
```

In `server/cmd/seed/main.go`: add `"flag"` to the imports, change the package doc line "Command seed inserts the fixture content topic" to end with "With `-grant-sub <sso_sub> -coins <n>` it instead gives that member coins (e2e).", change the success log to `log.Info("seed: done")`, and replace `run()`'s tail with:

```go
	grantSub := flag.String("grant-sub", "", "SSO user id of a signed-in member to give coins to (dev/e2e only)")
	coins := flag.Int("coins", 0, "coins to give with -grant-sub")
	flag.Parse()
	ctx := context.Background()
	st, err := store.New(ctx, url, 1)
	if err != nil {
		return err
	}
	defer st.Close()
	if *grantSub != "" {
		return grantCoins(ctx, st, *grantSub, *coins)
	}
	return st.SeedFixtureTopic(ctx)
```
(remove the old `ctx := context.Background()` / `store.New` lines above it so they are not declared twice).
- [ ] **Step 4: Run to pass.** Run the Verify-Cmd - expected `ok  .../cmd/seed`. Then the command line: `make migrate && cd server && go run -tags dev ./cmd/seed -grant-sub usr_nobody -coins 5; echo exit=$?` - expected the JSON log line `seed failed` mentioning `no member with sso id "usr_nobody"` and `exit=1`.
- [ ] **Step 5: Commit** `feat(I-015): dev seed can grant coins to a signed-in member`.

**Phase gate (controller only):** verify → review (code-reviewer + golang-reviewer on opus) → /simplify → re-verify. Verify = `make db-up migrate sqlc-check test-server` green, plus the C1 test run on its own with its output pasted (Tier 2: migration against real Postgres).

---

## Phase D: Joy-Quest web

Runs in: `JQ` (Joy-Quest feature worktree for I-015); commands from `JQ/web` unless a path says otherwise. Vitest tests: `cd web && pnpm exec vitest run <file>`; type-check `cd web && pnpm check`. Until joy-mascots 0.1.0 is published the dependency is a `link:` to the joy-design checkout `JD` (Phase B output); after Phase B the controller gives the implementer the absolute `JD` path as `<JD>`.

### Task D0: Design brief (CONTROLLER, not a worker)

**Files:** Create `.claude/idea_backlog/I-015-joymify-mascot-family-pico-yoji-luna-rex/design-brief.md` in `JQ`'s feature folder (the feature's `refined_backlog/F-NNN/` copy after `psrw refine`/`claim`; use the path `psrw claim` printed).

- [ ] **Step 1 (controller only):** Invoke `impeccable` in shape mode for the "Characters" shop page and the three other Companion surfaces. Input: spec section 5 and the state matrix, `docs/README.md` "Design canvas" tokens, the joy-design tokens (memory `joyquest_joy_design_default`). Output `design-brief.md` covering: hero composition at 390 and 1280, card anatomy and rhythm (7 cards, Yoji first), the inline confirm, the empty-coins state, the "Wearing" status treatment, light and dark, and which tokens each part uses. Workers read this file before D5.
- [ ] **Step 2 (controller only):** Show the brief to the owner only if it changes anything in the spec; otherwise proceed.

### Task D1: Dependency, `characters.ts` and `Companion.svelte`

**Files:**
- Modify: `web/package.json` (dependency), `web/pnpm-lock.yaml` (by pnpm), `web/vite.config.ts` (`ssr.noExternal`)
- Create: `web/src/lib/game/characters.ts`, `web/src/lib/game/Companion.svelte`, `web/src/lib/game/companion.render.test.ts`
- Exists: `web/src/lib/game/slime.ts` (`Pose`, `glowLevel`, `poseForHour` stay)

**Interfaces:**
- Consumes: `@montionugera/joy-mascots` -> `Mascot` (Svelte component, props `name,pose,size,label,glow,eager`), `MASCOTS` (`{id,name,personality,poses}[]`); `glowLevel(combo)` and `type Pose` from `./slime`.
- Produces: `DEFAULT_CHARACTER = 'yoji'`, `characterId(id: string | null | undefined): string`, `characterName(id): string`, `characterPersonality(id): string` (e.g. "dreamy, creative, sensitive") from `characters.ts`; `Companion.svelte` props `{ pose: Pose; size?: number; character?: string; glow?: number; label?: string }` rendering `<span class="companion" data-pose={pose} data-character={id}>` around `<Mascot>` (decorative when no `label`), mapping `happy->idle, cheer->cheer, opening->cheer, thinking->thinking, tryAgain->try-again, sleepy->sleepy`, glow = `glowLevel(glow)`.

- [ ] **Step 1: Add the dependency, then write the failing test.**
  `cd web && pnpm add "@montionugera/joy-mascots@link:<JD>/packages/mascots"` (writes a `link:` entry; this entry never merges to main, Task D8 replaces it). In `web/vite.config.ts` add, as a sibling of `plugins` and `test`: `ssr: { noExternal: ['@montionugera/joy-mascots'] },` (the package's `Mascot.svelte` imports its pictures as static ESM assets (`import yojiIdle from '../assets/yoji-idle.webp'`, see B1), which Vite rewrites to real URLs in SSR, client and dev; the server build must bundle the package so Vite processes those imports and emits the files; same reason `consumer-smoke.sh` lists joy-svelte).

```ts test:web/src/lib/game/companion.render.test.ts
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Companion from './Companion.svelte';
import { characterId, characterName, characterPersonality } from './characters';

const html = (props: object) => render(Companion, { props: props as never }).body;

describe('Companion', () => {
	it.each([
		['happy', 'idle'],
		['cheer', 'cheer'],
		['opening', 'cheer'],
		['thinking', 'thinking'],
		['tryAgain', 'try-again'],
		['sleepy', 'sleepy']
	] as const)('pose %s shows the %s picture of the chosen character', (pose, file) => {
		const out = html({ pose, character: 'luna' });
		expect(out).toContain(`data-pose="${pose}"`);
		expect(out).toContain('data-character="luna"');
		expect(out).toMatch(new RegExp(`luna-${file}[^"]*\\.webp`));
	});

	it('shows Yoji when no character or an unknown one is given', () => {
		expect(html({ pose: 'happy' })).toContain('data-character="yoji"');
		expect(html({ pose: 'happy', character: 'dragon' })).toContain('data-character="yoji"');
	});

	it('is decorative without a label and named with one', () => {
		expect(html({ pose: 'happy' })).toContain('alt=""');
		expect(html({ pose: 'happy', character: 'rex', label: 'Rex' })).toContain('alt="Rex"');
	});

	it('maps combo to a glow capped at 5', () => {
		expect(html({ pose: 'happy', glow: 9 })).toMatch(/--joy-mascot-glow:\s*5/);
		expect(html({ pose: 'happy', glow: 0 })).toMatch(/--joy-mascot-glow:\s*0/);
	});

	it('renders a site-absolute picture URL in SSR, never file:', () => {
		const out = html({ pose: 'happy', character: 'luna' });
		const src = out.match(/\bsrc="([^"]+)"/)?.[1] ?? '';
		expect(src.startsWith('/')).toBe(true);
		expect(src).not.toMatch(/^file:/);
		for (const u of out.match(/\bsrcset="([^"]+)"/)![1].split(', ')) expect(u.startsWith('/')).toBe(true);
	});

	it('draws the requested size', () => {
		expect(html({ pose: 'happy', size: 40 })).toContain('width="40"');
	});
});

describe('characters', () => {
	it('names, personalities and fallback', () => {
		expect(characterName('luna')).toBe('Luna');
		expect(characterPersonality('luna')).toBe('dreamy, creative, sensitive');
		expect(characterId('byte')).toBe('byte');
		expect(characterId('dragon')).toBe('yoji');
		expect(characterId(undefined)).toBe('yoji');
		expect(characterName(null)).toBe('Yoji');
	});
});
```

Verify-Cmd: `cd web && pnpm exec vitest run src/lib/game/companion.render.test.ts`

- [ ] **Step 2: Run to fail.** Expected: `Failed to resolve import "./Companion.svelte"`.
- [ ] **Step 3: Implement.**

```ts
// web/src/lib/game/characters.ts
import { MASCOTS } from '@montionugera/joy-mascots';

export const DEFAULT_CHARACTER = 'yoji';

/** A known character id, or Yoji for anything else (an id removed from the shop later, a failed fetch). */
export function characterId(id: string | null | undefined): string {
	return MASCOTS.some((m) => m.id === id) ? (id as string) : DEFAULT_CHARACTER;
}

export function characterName(id: string | null | undefined): string {
	return MASCOTS.find((m) => m.id === characterId(id))!.name;
}

export function characterPersonality(id: string | null | undefined): string {
	return MASCOTS.find((m) => m.id === characterId(id))!.personality.join(', ');
}
```

```svelte
<!-- web/src/lib/game/Companion.svelte -->
<script lang="ts">
	import { Mascot } from '@montionugera/joy-mascots';
	import { characterId } from './characters';
	import { glowLevel, type Pose } from './slime';

	let {
		pose,
		size = 96,
		character = 'yoji',
		glow = 0,
		label
	}: { pose: Pose; size?: number; character?: string; glow?: number; label?: string } = $props();

	// Joy-Quest pose names -> joy-mascots pose names.
	const PICTURE: Record<Pose, string> = {
		happy: 'idle',
		cheer: 'cheer',
		opening: 'cheer',
		thinking: 'thinking',
		tryAgain: 'try-again',
		sleepy: 'sleepy'
	};

	const id = $derived(characterId(character));
</script>

<span class="companion" data-pose={pose} data-character={id}>
	<Mascot name={id} pose={PICTURE[pose]} {size} {label} glow={glowLevel(glow)} />
</span>

<style>
	.companion {
		display: inline-flex;
		line-height: 0;
	}
</style>
```

  If the failing run's error is `Unknown file extension ".svelte"` for the package, add `'@montionugera/joy-mascots'` under `test.server.deps.inline` in the `node` project of `vite.config.ts` and rerun.
- [ ] **Step 4: Run to pass.** Expected `Tests  12 passed`. Then `pnpm check` - expected `0 errors` (the linked package ships `src/index.d.ts` types).
- [ ] **Step 5: Commit** `feat(I-015): Companion wraps the joy-mascots Mascot`.

### Task D2: Worn character reaches the lesson rider and the quiz band

**Files:**
- Create: `web/src/lib/server/character.ts`, `web/src/lib/server/character.test.ts`
- Modify: `web/src/routes/lessons/[id]/+page.server.ts` (load return), `web/src/routes/lessons/[id]/+page.svelte` (line ~336 `<CardSession`), `web/src/routes/lessons/[id]/page.server.test.ts`, `web/src/routes/attempts/[id]/+page.server.ts`, `web/src/routes/attempts/[id]/+page.svelte` (line 33), `web/src/routes/attempts/[id]/page.server.test.ts`, `web/src/lib/game/CardSession.svelte`, `web/src/lib/game/ProgressRider.svelte`, `web/src/lib/game/QuizRewardBand.svelte`, `web/src/lib/game/quiz-band.render.test.ts`, `web/src/lib/game/session.render.test.ts`
- Exists: `web/src/lib/server/api.ts` (`apiFetch<T>(fetchFn, token, url, init)`), `web/src/lib/server/env.ts` (`config().apiUrl`), `web/src/routes/test-support/{env-mock,fake-fetch}.ts` (`testEnv`, `fakeJsonFetch`, `fakePathFetch`).

**Interfaces:**
- Produces: `wornCharacter(fetchFn: typeof fetch, token: string | null): Promise<string>` (reads `GET /v1/me/rewards` -> `equipped.character`; any failure or missing field -> `'yoji'`); load data `character: string` on `/lessons/[id]` and `/attempts/[id]`; props `character?: string` on `CardSession`, `ProgressRider`, `QuizRewardBand` (default `'yoji'`); the rider and the band render `Companion` (decorative) instead of `StarSlime`.

- [ ] **Step 1: Write the failing tests.**

```ts test:web/src/lib/server/character.test.ts
import { describe, expect, it, vi } from 'vitest';
import { testEnv } from '../../routes/test-support/env-mock';
import { fakeJsonFetch } from '../../routes/test-support/fake-fetch';

vi.mock('$env/dynamic/private', () => ({ env: testEnv() }));
const { wornCharacter } = await import('./character');

describe('wornCharacter', () => {
	it('reads equipped.character from the rewards summary', async () => {
		expect(await wornCharacter(fakeJsonFetch(200, { equipped: { character: 'luna' } }), 'tok')).toBe('luna');
	});
	it('shows Yoji when the call fails', async () => {
		const f = fakeJsonFetch(500, { error: { code: 'x', message: 'x' } });
		expect(await wornCharacter(f, 'tok')).toBe('yoji');
	});
	it('shows Yoji when the summary has no character', async () => {
		expect(await wornCharacter(fakeJsonFetch(200, {}), 'tok')).toBe('yoji');
		expect(await wornCharacter(fakeJsonFetch(200, { equipped: {} }), 'tok')).toBe('yoji');
	});
	it('shows Yoji when the network throws', async () => {
		const f = (async () => {
			throw new Error('down');
		}) as typeof fetch;
		expect(await wornCharacter(f, null)).toBe('yoji');
	});
});
```

Add to `web/src/routes/lessons/[id]/page.server.test.ts`, inside `describe('lessons/[id] load', ...)` (reuse `fakeEvent`, `fakePathFetch`, `baseLesson`, `outline`, `runLoad` defined in that file; add `character: string` to its `LoadResult` type):

```ts test:web/src/routes/lessons/[id]/page.server.test.ts
	it('returns the worn character from the rewards summary', async () => {
		const event = fakeEvent(
			fakePathFetch({
				'/v1/lessons/l1': { status: 200, body: baseLesson },
				'/v1/topics/t1/dashboard': { status: 200, body: { notes: [], modules: outline } },
				'/v1/me/rewards': { status: 200, body: { equipped: { character: 'luna' } } }
			})
		);
		expect((await runLoad(event)).character).toBe('luna');
	});

	it('shows Yoji when the rewards call fails', async () => {
		const event = fakeEvent(
			fakePathFetch({
				'/v1/lessons/l1': { status: 200, body: baseLesson },
				'/v1/topics/t1/dashboard': { status: 200, body: { notes: [], modules: outline } },
				'/v1/me/rewards': { status: 500, body: { error: { code: 'x', message: 'x' } } }
			})
		);
		expect((await runLoad(event)).character).toBe('yoji');
	});
```

Add to `web/src/routes/attempts/[id]/page.server.test.ts` (extend its `runLoad` return type with `character: string`):

```ts test:web/src/routes/attempts/[id]/page.server.test.ts
describe('attempts/[id] worn character', () => {
	it('returns the worn character, or Yoji when the fetch fails', async () => {
		const ok = fakePathFetch({
			'/v1/attempts/attempt1': { status: 200, body: { id: 'attempt1' } },
			'/v1/me/rewards': { status: 200, body: { equipped: { character: 'rex' } } }
		});
		expect((await runLoad(fakeEvent(ok))).character).toBe('rex');
		const down = fakePathFetch({
			'/v1/attempts/attempt1': { status: 200, body: { id: 'attempt1' } },
			'/v1/me/rewards': { status: 500, body: { error: { code: 'x', message: 'x' } } }
		});
		expect((await runLoad(fakeEvent(down))).character).toBe('yoji');
	});
});
```

Add to `web/src/lib/game/quiz-band.render.test.ts`:

```ts test:web/src/lib/game/quiz-band.render.test.ts
describe('QuizRewardBand character', () => {
	it('shows the worn character, decorative, and Yoji by default', () => {
		const luna = render(QuizRewardBand, { props: { awards: null, perfect: true, character: 'luna' } }).body;
		expect(luna).toContain('data-character="luna"');
		expect(luna).toContain('alt=""');
		const dflt = render(QuizRewardBand, { props: { awards: null, perfect: true } }).body;
		expect(dflt).toContain('data-character="yoji"');
	});
});
```

Add to `web/src/lib/game/session.render.test.ts` inside `describe('CardSession', ...)`:

```ts test:web/src/lib/game/session.render.test.ts
	it('the progress rider shows the character it was given', () => {
		const out = render(CardSession, {
			props: { cards, memberId: 'm', lessonId: 'l', title: 'Commas', card, character: 'zing' }
		}).body;
		expect(out).toContain('data-character="zing"');
	});
```

Verify-Cmd: `cd web && pnpm exec vitest run src/lib/server/character.test.ts src/routes/lessons src/routes/attempts src/lib/game/quiz-band.render.test.ts src/lib/game/session.render.test.ts`

- [ ] **Step 2: Run to fail.** Expected: `Failed to resolve import "./character"`; `character` undefined in the load tests; no `data-character` in the band/session output.
- [ ] **Step 3: Implement.**

```ts
// web/src/lib/server/character.ts
import { apiFetch } from './api';
import { config } from './env';
import { DEFAULT_CHARACTER } from '../game/characters';

/** The worn character for pages that only decorate with it; any failure shows Yoji. */
export async function wornCharacter(fetchFn: typeof fetch, token: string | null): Promise<string> {
	try {
		const r = await apiFetch<{ equipped?: { character?: string } }>(
			fetchFn,
			token,
			`${config().apiUrl}/v1/me/rewards`
		);
		return r.equipped?.character || DEFAULT_CHARACTER;
	} catch (e) {
		console.error('worn character fetch failed, showing Yoji', e);
		return DEFAULT_CHARACTER;
	}
}
```

  - `lessons/[id]/+page.server.ts`: add `import { wornCharacter } from '$lib/server/character';` and change the final return of `load` to `const character = await wornCharacter(fetch, locals.token); return { lesson, enrolled, noteBody, modules, completed, character };`.
  - `lessons/[id]/+page.svelte`: add `character={data.character}` to the `<CardSession ... />` props (the block at ~line 336).
  - `attempts/[id]/+page.server.ts`: import the helper; in `load` replace `return { results, awards: parseAwards(url) };` with `return { results, awards: parseAwards(url), character: await wornCharacter(fetch, locals.token) };`. `attempts/[id]/+page.svelte` line 33: `<QuizRewardBand awards={data.awards} {perfect} character={data.character} />`.
  - `CardSession.svelte`: add `character = 'yoji'` to the destructured props and `character?: string;` to their type; pass `<ProgressRider {index} total={n} {combo} {reducedMotion} {character} />`.
  - `ProgressRider.svelte`: replace the import with `import Companion from './Companion.svelte';`, add `character = 'yoji'` / `character?: string` to props, and replace `<StarSlime pose="happy" size={40} glow={combo} />` with `<Companion pose="happy" size={40} glow={combo} {character} />`.
  - `QuizRewardBand.svelte`: replace the `StarSlime` import with `Companion`, add `character = 'yoji'` / `character?: string` props, and replace the element with `<Companion pose={perfect ? 'cheer' : 'tryAgain'} size={120} {character} />`.
- [ ] **Step 4: Run to pass.** Verify-Cmd then `cd web && pnpm exec vitest run` (whole suite, expected all pass: the old `data-pose` assertions still hold because `Companion` keeps `data-pose`) and `pnpm check` (`0 errors`).
- [ ] **Step 5: Commit** `feat(I-015): lesson rider and quiz band show the worn character`.

### Task D3: One `Equipped` type, strip and reward panel on Companion, delete Star Slime

**Files:**
- Modify: `web/src/lib/game/types.ts` (lines 13-18), `web/src/lib/game/slime.ts` (delete lines 6-end tables, keep `Pose`, `poseForHour`, `glowLevel`), `web/src/lib/game/RewardsStrip.svelte` (import, line 78, link text line 93), `web/src/lib/game/LessonReward.svelte` (import, line 56), `web/src/lib/game/art.render.test.ts` (keep the `Chest` describe only), `web/src/lib/game/rewards.render.test.ts`, `web/src/lib/game/lessonreward.dom.test.ts`, `web/src/lib/game/helpers.test.ts`, `web/src/routes/learning/page.render.test.ts`, `web/src/routes/shop/+page.svelte` (minimal compile fix only), `web/src/routes/shop/page.render.test.ts`
- Delete: `web/src/lib/game/StarSlime.svelte`, `web/src/lib/game/test-support/TwoSlimes.svelte`

**Interfaces:**
- Produces: `interface Equipped { character: string }` (id of the worn character; default `'yoji'`); `RewardsStrip` shows `Companion` with `alt` = the character's name and the link text `Characters`; `LessonReward` shows a decorative `Companion` (pose `opening` while a chest opens, else `cheer`) for `rewards?.equipped.character`.

- [ ] **Step 1: Write the failing tests.** In `web/src/lib/game/rewards.render.test.ts` change the `base` fixture's `equipped` to `{ character: 'yoji' }` and append inside `describe('RewardsStrip states', ...)`:

```ts test:web/src/lib/game/rewards.render.test.ts
	it('a new learner sees Yoji with the name as alt', () => {
		const out = strip(base);
		expect(out).toContain('alt="Yoji"');
		expect(out).toContain('data-character="yoji"');
	});
	it('the strip shows the worn character and links to Characters', () => {
		const out = strip({ ...base, equipped: { character: 'luna' } });
		expect(out).toContain('alt="Luna"');
		expect(out).toContain('data-character="luna"');
		expect(out).toContain('Characters');
		expect(out.toLowerCase()).not.toContain('star slime');
	});
```

In `lessonreward.dom.test.ts` change the `summary` fixture's `equipped` to `{ character: 'yoji' }` and append at the end of its last `describe`:

```ts test:web/src/lib/game/lessonreward.dom.test.ts
	it('shows the worn character in the reward panel', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		app = mount(LessonReward, {
			target,
			props: {
				awards: { xp: 5, chests: [] },
				rewards: { ...summary(1, 10), equipped: { character: 'luna' } } as never,
				nextLessonId: null,
				topicId: 't'
			}
		});
		flushSync();
		expect(target.querySelector('[data-character="luna"][data-pose="cheer"]')).not.toBeNull();
	});
```

In `helpers.test.ts` (line 33) and `routes/learning/page.render.test.ts` (line 102) change the fixture to `equipped: { character: 'yoji' }`. In `art.render.test.ts` remove the `StarSlime` import, the `look` constant and the whole `describe('StarSlime', ...)`, keeping `Chest`.

For the shop page (minimal, D5 redesigns it): in `routes/shop/page.render.test.ts` replace the top fixtures and the first test with

```ts test:web/src/routes/shop/page.render.test.ts
const equipped = { character: 'yoji' };
const items = [
	{ id: 'yoji', slot: 'character', name: 'Yoji', price: 0, owned: true, need: 0 },
	{ id: 'pico', slot: 'character', name: 'Pico', price: 100, owned: false, need: 0 },
	{ id: 'luna', slot: 'character', name: 'Luna', price: 100, owned: true, need: 0 },
	{ id: 'rex', slot: 'character', name: 'Rex', price: 150, owned: false, need: 22 }
];
```
and, in `it('every tile state')`, `shop: { items, coins: 128, equipped }`, expectations `toContain('Pico')`, `toContain('Need 22 more coins')`, `toContain('aria-label="Buy Rex. Need 22 more coins"')`, `toContain('Wear')`, `toContain('Wearing')`, `toContain('128')`; in `it('409 message shown')` use `item_id: 'pico'` and `shop: { items, coins: 128, equipped }`.

Verify-Cmd: `cd web && pnpm exec vitest run src/lib/game src/routes/learning src/routes/shop/page.render.test.ts`

- [ ] **Step 2: Run to fail.** Expected: `alt="Yoji"` missing (strip still renders `StarSlime`), `data-character` missing, shop render test fails on `Pico`/`aria-label`.
- [ ] **Step 3: Implement.**
  - `types.ts`: replace the `Equipped` doc comment and interface with

```ts
/** The worn character's id; a new learner wears 'yoji'. */
export interface Equipped {
	character: string;
}
```
  - `slime.ts` becomes exactly:

```ts
export type Pose = 'happy' | 'thinking' | 'cheer' | 'opening' | 'tryAgain' | 'sleepy';

export function poseForHour(h: number): 'happy' | 'sleepy' {
	return h >= 22 || h <= 5 ? 'sleepy' : 'happy';
}

export const glowLevel = (combo: number): number => Math.min(Math.max(combo, 0), 5);
```
  - `RewardsStrip.svelte`: `import Companion from './Companion.svelte';` and `import { characterName } from './characters';` replace the `StarSlime` import; the element becomes `<Companion {pose} size={96} character={current.equipped.character} label={characterName(current.equipped.character)} />` (eye-follow is dropped); the link text `Star Slime looks` becomes `Characters`.
  - `LessonReward.svelte`: import `Companion` instead; element becomes `<Companion pose={busy > 0 ? 'opening' : 'cheer'} size={160} character={rewards?.equipped.character} />`.
  - Delete `StarSlime.svelte` and `test-support/TwoSlimes.svelte` (`git rm`).
  - `routes/shop/+page.svelte` (compile fix only): import `Companion` instead of `StarSlime` and drop the `Equipped` type import; replace `wearing`/`preview` with `const wearing = (id: string) => shop?.equipped.character === id;`; the hero element becomes `<Companion pose="happy" size={160} character={shop.equipped.character} label="Your character" />`; the tile element `<Companion pose="happy" size={88} character={item.id} />`; `{#if wearing(item.slot, item.id)}` becomes `{#if wearing(item.id)}`; title/h1/aria-label still say "Star Slime" - D5 rewrites them.
- [ ] **Step 4: Run to pass.** Verify-Cmd, then `cd web && pnpm exec vitest run && pnpm check && pnpm lint` - expected all pass (`prettier --write` the touched files first if lint complains). `grep -rn "StarSlime\|LOOKS\|STARS\|ACCESSORIES" web/src` prints nothing.
- [ ] **Step 5: Commit** `feat(I-015): Companion replaces StarSlime everywhere but the shop page`.

### Task D4: Shop actions and copy (server side of the Characters page)

**Files:**
- Modify: `web/src/lib/game/copy.ts` (append), `web/src/lib/game/helpers.test.ts` (copy tests), `web/src/routes/shop/+page.server.ts`, `web/src/routes/shop/page.server.test.ts`

**Interfaces:**
- Produces in `copy.ts`: `buyLabel(price)` -> "Buy · 100 coins"; `buyConfirmLine(name, price)` -> "Buy Luna for 100 coins?"; `needLabel(name, price, need)` -> "Buy Luna, 100 coins. Need 22 more coins"; `boughtLine(name, left)` -> "Luna is yours. 20 coins left."; `wornLine(name)` -> "Now wearing Luna."; `heroLabel(name)` -> "You are wearing Luna"; `emptyCoinsHint` -> "Finish a lesson to earn coins". Actions: `buy` and `wear` pass the API's own message through (the server now words `already_owned` and `not_owned` with the character's name); `wear` still posts `{ slot, item_id }` to `PUT /v1/me/cosmetics/equip`.

- [ ] **Step 1: Write the failing tests.** Append to `web/src/lib/game/helpers.test.ts` (it already imports `copy`; if not, add `import * as copy from './copy';`):

```ts test:web/src/lib/game/helpers.test.ts
describe('character shop copy', () => {
	it('uses the owner-approved strings', () => {
		expect(copy.buyLabel(100)).toBe('Buy · 100 coins');
		expect(copy.buyConfirmLine('Luna', 100)).toBe('Buy Luna for 100 coins?');
		expect(copy.needLabel('Luna', 100, 22)).toBe('Buy Luna, 100 coins. Need 22 more coins');
		expect(copy.boughtLine('Luna', 20)).toBe('Luna is yours. 20 coins left.');
		expect(copy.boughtLine('Luna', 1)).toBe('Luna is yours. 1 coin left.');
		expect(copy.wornLine('Luna')).toBe('Now wearing Luna.');
		expect(copy.heroLabel('Luna')).toBe('You are wearing Luna');
		expect(copy.emptyCoinsHint).toBe('Finish a lesson to earn coins');
	});
});
```

In `web/src/routes/shop/page.server.test.ts`: change `SHOP` to `{ items: [], coins: 5, equipped: { character: 'yoji' } }`; replace every `body-mint` with `pico` and the two `slot: 'body'` with `slot: 'character'` (and `{ slot: 'bo/dy', item_id: 'pico' }`, `{ slot: 'body', item_id: '../x' }` become `{ slot: 'character', ... }` / `{ slot: 'char/acter', ... }`); replace the two friendly-copy tests with pass-through tests:

```ts test:web/src/routes/shop/page.server.test.ts
	it('wear 403 passes the API message through', async () => {
		const r = (await actions.wear(
			ev(
				form({ slot: 'character', item_id: 'luna' }),
				fakeJsonFetch(403, {
					error: { code: 'not_owned', message: 'Buy Luna first, then you can wear them.' }
				})
			)
		)) as { status: number; data: { error: string; item_id: string } };
		expect(r.status).toBe(403);
		expect(r.data).toEqual({ error: 'Buy Luna first, then you can wear them.', item_id: 'luna' });
	});
	it('buy 409 already_owned passes the API message through', async () => {
		const r = (await actions.buy(
			ev(
				form({ item_id: 'luna' }),
				fakeJsonFetch(409, { error: { code: 'already_owned', message: 'You already have Luna.' } })
			)
		)) as { status: number; data: { error: string } };
		expect(r.status).toBe(409);
		expect(r.data.error).toBe('You already have Luna.');
	});
```

Verify-Cmd: `cd web && pnpm exec vitest run src/lib/game/helpers.test.ts src/routes/shop/page.server.test.ts`

- [ ] **Step 2: Run to fail.** Expected: `copy.buyLabel is not a function`; the pass-through tests fail with the old friendly strings.
- [ ] **Step 3: Implement.** Append to `copy.ts`:

```ts
const coinsWord = (n: number) => `${n} ${n === 1 ? 'coin' : 'coins'}`;

export const buyLabel = (price: number) => `Buy · ${coinsWord(price)}`;
export const buyConfirmLine = (name: string, price: number) =>
	`Buy ${name} for ${coinsWord(price)}?`;
export const needLabel = (name: string, price: number, need: number) =>
	`Buy ${name}, ${coinsWord(price)}. ${needMore(need)}`;
export const boughtLine = (name: string, left: number) => `${name} is yours. ${coinsWord(left)} left.`;
export const wornLine = (name: string) => `Now wearing ${name}.`;
export const heroLabel = (name: string) => `You are wearing ${name}`;
export const emptyCoinsHint = 'Finish a lesson to earn coins';
```
In `shop/+page.server.ts` delete the `FRIENDLY` map and make `apiFail` return `fail(status, { error: e.message, item_id: itemId })`; update its comment to say the API words every message. Nothing else changes.
- [ ] **Step 4: Run to pass.** Verify-Cmd, then `cd web && pnpm exec vitest run && pnpm check` - expected pass.
- [ ] **Step 5: Commit** `feat(I-015): shop copy and pass-through action messages for characters`.

### Task D5: Characters page UI (hero, cards, confirm, live region, focus)

**Files:**
- Modify (rewrite): `web/src/routes/shop/+page.svelte`
- Modify: `web/src/routes/shop/page.render.test.ts` (new assertions), 
- Create: `web/src/routes/shop/page.confirm.dom.test.ts`
- Read first: `design-brief.md` (D0), `web/src/lib/game/CoinIcon.svelte`, global classes `hard`, `btn`, `btn-primary`, `disp`, `prose` (used by the old page)

**Interfaces:**
- Consumes: `data.shop` (`{ items: ShopItem[] | null; coins: number; equipped: { character } }`), `form` (`{ error, item_id }` | `{ bought, coins }` | `{ worn }`), `Companion`, `characterPersonality`, copy fns from D4, `needMore`.
- Produces (DOM contract used by e2e in D7): `<title>` and `h1` "Characters"; hero `section` with `h2` = worn name, `Companion` labelled "You are wearing <Name>", `[data-testid="coins"]`; one `li.card#card-<id>` per item (Yoji first as the API lists it) with `h2` name, personality line, `[data-testid="price"]` ("Free" or the number), then exactly one of: `span#wearing-<id>` "Wearing"; `button#wear-<id>` "Wear"; `button#buy-<id>` "Buy · N coins" then, after press, an inline confirm (text "Buy Luna for 100 coins?", submit button "Buy Luna" with `#confirm-<id>`, button "Cancel"); disabled `button` with aria-label from `needLabel` and text from `needMore`; `p[role=status][data-testid="shop-status"]` live region; per-card error `p[role=alert]`; empty hint "Finish a lesson to earn coins" with a link to `/learning` when coins are 0.

- [ ] **Step 1: Write the failing tests.** Replace the contents of `web/src/routes/shop/page.render.test.ts` below the fixtures (keep the mocks and fixtures from D3) with:

```ts test:web/src/routes/shop/page.render.test.ts
describe('Characters page', () => {
	it('title, h1, hero and the seven cards in order', () => {
		const all = [
			...items,
			{ id: 'mochi', slot: 'character', name: 'Mochi', price: 150, owned: false, need: 22 },
			{ id: 'zing', slot: 'character', name: 'Zing', price: 200, owned: false, need: 72 },
			{ id: 'byte', slot: 'character', name: 'Byte', price: 200, owned: false, need: 72 }
		];
		const out = html({ shop: { items: all, coins: 128, equipped }, shopError: false });
		expect(out).toContain('<title>Characters</title>');
		expect(out).toMatch(/<h1[^>]*>Characters<\/h1>/);
		expect(out).toContain('alt="You are wearing Yoji"');
		expect(out).toContain('kind, bright, positive');
		expect((out.match(/class="card /g) ?? []).length).toBe(7);
		const order = ['Yoji', 'Pico', 'Luna', 'Rex', 'Mochi', 'Zing', 'Byte'].map((n) => out.indexOf(`>${n}</h2>`));
		expect(order.every((i) => i > 0)).toBe(true);
		expect([...order].sort((a, b) => a - b)).toEqual(order);
		expect(out.toLowerCase()).not.toContain('star slime');
	});

	it('each card state: Wearing, Wear, Buy with price, Need with an accessible name', () => {
		const out = html({ shop: { items, coins: 128, equipped }, shopError: false });
		expect(out).toContain('id="wearing-yoji"');
		expect(out).toContain('id="wear-luna"');
		expect(out).toContain('id="buy-pico"');
		expect(out).toContain('Buy · 100 coins');
		expect(out).toContain('Free');
		expect(out).toContain('Need 22 more coins');
		expect(out).toContain('aria-label="Buy Rex, 150 coins. Need 22 more coins"');
		expect(out).toContain('data-testid="shop-status"');
	});

	it('empty state: 0 coins shows the hint and a link back', () => {
		const out = html({
			shop: { items: items.map((i) => (i.owned ? i : { ...i, need: i.price })), coins: 0, equipped },
			shopError: false
		});
		expect(out).toContain('Finish a lesson to earn coins');
		expect(out).toContain('href="/learning"');
	});

	it('an error from an action sits inside that card, not at the top', () => {
		const out = html(
			{ shop: { items, coins: 128, equipped }, shopError: false },
			{ error: 'Need 2 more coins', item_id: 'pico' }
		);
		const card = out.slice(out.indexOf('id="card-pico"'), out.indexOf('id="card-luna"'));
		expect(card).toContain('Need 2 more coins');
		expect(card).toContain('role="alert"');
	});

	it('API down shows the old error alert with Try again', () => {
		const out = html({ shop: null, shopError: true });
		expect(out).toContain("Couldn't load the shop.");
		expect(out).toContain('Try again');
	});

	it('null items read as empty', () => {
		const out = html({ shop: { items: null, coins: 0, equipped }, shopError: false });
		expect(out).toContain('Back to My Learning');
	});
});
```

`web/src/routes/shop/page.confirm.dom.test.ts` (first line `// @vitest-environment happy-dom`; it lives in the `dom` vitest project because of the `.dom.test.ts` suffix):

```ts test:web/src/routes/shop/page.confirm.dom.test.ts
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
vi.mock('$app/paths', () => ({ resolve: (p: string) => p }));
vi.mock('$app/forms', () => ({ enhance: () => ({ destroy() {} }) }));
vi.mock('$app/navigation', () => ({ invalidateAll: vi.fn() }));
const Page = (await import('./+page.svelte')).default;

const items = [
	{ id: 'yoji', slot: 'character', name: 'Yoji', price: 0, owned: true, need: 0 },
	{ id: 'luna', slot: 'character', name: 'Luna', price: 100, owned: false, need: 0 }
];
let app: ReturnType<typeof mount> | null = null;
afterEach(() => {
	if (app) unmount(app);
	app = null;
	document.body.innerHTML = '';
});

function open() {
	const target = document.createElement('div');
	document.body.appendChild(target);
	app = mount(Page, {
		target,
		props: {
			data: { member: null, shop: { items, coins: 120, equipped: { character: 'yoji' } }, shopError: false } as never,
			form: null as never
		}
	});
	flushSync();
	return target;
}

describe('buy confirm', () => {
	it('Buy shows an inline confirm; Cancel returns focus to Buy', async () => {
		const t = open();
		(t.querySelector('#buy-luna') as HTMLButtonElement).click();
		flushSync();
		expect(t.textContent).toContain('Buy Luna for 100 coins?');
		expect(t.querySelector('#buy-luna')).toBeNull();
		const cancel = [...t.querySelectorAll('button')].find((b) => b.textContent === 'Cancel')!;
		cancel.click();
		await vi.waitFor(() => expect(document.activeElement?.id).toBe('buy-luna'));
		expect(t.textContent).not.toContain('Buy Luna for 100 coins?');
	});

	it('Escape closes the confirm and returns focus to Buy', async () => {
		const t = open();
		(t.querySelector('#buy-luna') as HTMLButtonElement).click();
		flushSync();
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await vi.waitFor(() => expect(document.activeElement?.id).toBe('buy-luna'));
	});

	it('opening the confirm moves focus to the confirm button', async () => {
		const t = open();
		(t.querySelector('#buy-luna') as HTMLButtonElement).click();
		await vi.waitFor(() => expect(document.activeElement?.id).toBe('confirm-luna'));
		expect(t.querySelector('#confirm-luna')?.textContent).toBe('Buy Luna');
	});
});
```

Verify-Cmd: `cd web && pnpm exec vitest run src/routes/shop`

- [ ] **Step 2: Run to fail.** Expected: render tests fail (`<title>Characters</title>` missing - the page still says "Star Slime looks"); the dom test fails (`#buy-luna` is null).
- [ ] **Step 3: Implement.** Replace `web/src/routes/shop/+page.svelte` with the code below, then adjust spacing, type scale and colour to `design-brief.md` (structure, ids, copy and behaviour are fixed by the tests; only the `<style>` block may change):

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import CoinIcon from '$lib/game/CoinIcon.svelte';
	import Companion from '$lib/game/Companion.svelte';
	import { characterPersonality } from '$lib/game/characters';
	import {
		boughtLine,
		buyConfirmLine,
		buyLabel,
		emptyCoinsHint,
		heroLabel,
		needLabel,
		needMore,
		wornLine
	} from '$lib/game/copy';
	import type { ShopItem } from '$lib/game/types';

	let { data, form } = $props();

	const shop = $derived(data.shop);
	const items = $derived(shop?.items ?? []);
	const worn = $derived(shop?.equipped.character ?? 'yoji');
	const wornName = $derived(items.find((i) => i.id === worn)?.name ?? 'Yoji');
	let busy = $state<string | null>(null);
	let confirming = $state<string | null>(null);
	let announce = $state('');

	const focusId = async (id: string) => {
		await tick();
		document.getElementById(id)?.focus();
	};
	const openConfirm = (id: string) => {
		confirming = id;
		void focusId(`confirm-${id}`);
	};
	const closeConfirm = (id: string) => {
		confirming = null;
		void focusId(`buy-${id}`);
	};
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && confirming) {
			e.preventDefault();
			closeConfirm(confirming);
		}
	}

	// Runs on every form: the button stays busy until the round trip ends; a failed call still
	// refreshes the balance and the cards. Success moves focus to the next control and announces it.
	const submit = (item: ShopItem, kind: 'buy' | 'wear') => () => {
		busy = item.id;
		return async ({
			result,
			update
		}: {
			result: { type: string; data?: { coins?: number } };
			update: (o?: { reset?: boolean }) => Promise<void>;
		}) => {
			await update({ reset: false });
			if (result.type === 'failure') await invalidateAll();
			busy = null;
			if (result.type === 'success') {
				confirming = null;
				if (kind === 'buy') {
					announce = boughtLine(item.name, result.data?.coins ?? 0);
					await focusId(`wear-${item.id}`);
				} else {
					announce = wornLine(item.name);
					await focusId(`wearing-${item.id}`);
				}
			} else {
				await focusId(`card-${item.id}`);
			}
		};
	};
</script>

<svelte:window onkeydown={onKey} />
<svelte:head><title>Characters</title></svelte:head>

<h1 class="disp" style="font-size: 44px; margin: 0 0 24px;">Characters</h1>

{#if data.shopError || !shop}
	<section class="hard err" style="padding: 20px;" role="alert">
		<p class="prose">Couldn't load the shop.</p>
		<button class="btn btn-primary" type="button" onclick={() => invalidateAll()}>Try again</button>
	</section>
{:else}
	<section class="hero hard" aria-labelledby="hero-name">
		<Companion pose="happy" size={160} character={worn} label={heroLabel(wornName)} />
		<div class="hero-text">
			<h2 id="hero-name" class="hero-name">{wornName}</h2>
			<p class="personality">{characterPersonality(worn)}</p>
			<p class="balance">
				<CoinIcon size={24} /><span class="tabular" data-testid="coins">{shop.coins}</span>
				<span class="sr">coins</span>
			</p>
			{#if shop.coins === 0}
				<p class="hint">{emptyCoinsHint}. <a href={resolve('/learning')}>Go to My Learning</a></p>
			{/if}
		</div>
	</section>

	<p class="sr" role="status" aria-live="polite" data-testid="shop-status">{announce}</p>
	{#if form?.error && !items.some((i) => i.id === form?.item_id)}
		<p class="msg" role="alert" data-testid="shop-error">{form.error}</p>
	{/if}

	<ul class="grid">
		{#each items as item (item.id)}
			<li class="card hard" id="card-{item.id}" tabindex="-1">
				<Companion pose="happy" size={96} character={item.id} />
				<h2 class="name">{item.name}</h2>
				<p class="personality">{characterPersonality(item.id)}</p>
				<p class="price" data-testid="price">
					{#if item.price === 0}Free{:else}<CoinIcon size={18} /><span>{item.price}</span>{/if}
				</p>
				{#if item.id === worn}
					<span class="status" id="wearing-{item.id}" tabindex="-1">Wearing</span>
				{:else if item.owned}
					<form method="POST" action="?/wear" use:enhance={submit(item, 'wear')}>
						<input type="hidden" name="slot" value="character" />
						<input type="hidden" name="item_id" value={item.id} />
						<button id="wear-{item.id}" class="btn btn-primary" type="submit" disabled={busy === item.id}>
							Wear
						</button>
					</form>
				{:else if item.need > 0}
					<button
						class="btn"
						type="button"
						disabled
						aria-label={needLabel(item.name, item.price, item.need)}
					>
						{needMore(item.need)}
					</button>
				{:else if confirming === item.id}
					<div class="confirm" role="group" aria-label="Confirm buying {item.name}">
						<p class="confirm-line">{buyConfirmLine(item.name, item.price)}</p>
						<form method="POST" action="?/buy" use:enhance={submit(item, 'buy')}>
							<input type="hidden" name="item_id" value={item.id} />
							<button
								id="confirm-{item.id}"
								class="btn btn-primary"
								type="submit"
								disabled={busy === item.id}>Buy {item.name}</button
							>
						</form>
						<button class="btn" type="button" onclick={() => closeConfirm(item.id)}>Cancel</button>
					</div>
				{:else}
					<button id="buy-{item.id}" class="btn btn-primary" type="button" onclick={() => openConfirm(item.id)}>
						{buyLabel(item.price)}
					</button>
				{/if}
				{#if form?.item_id === item.id && form?.error}
					<p class="card-err" role="alert">{form.error}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<p style="margin-top: var(--joy-space-6);">
	<a href={resolve('/learning')}>Back to My Learning</a>
</p>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--joy-space-4);
		padding: var(--joy-space-5);
		margin-bottom: var(--joy-space-5);
		text-align: center;
	}
	.hero :global(.joy-mascot) {
		width: 128px;
		height: 128px;
	}
	.hero-name {
		font-size: 28px;
		margin: 0;
	}
	.personality {
		margin: 0;
		color: var(--jq-muted);
	}
	.balance {
		display: inline-flex;
		align-items: center;
		gap: var(--joy-space-2);
		font-size: 28px;
		margin: 0;
	}
	.hint {
		margin: 0;
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--joy-space-4);
		grid-template-columns: 1fr;
	}
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--joy-space-2);
		padding: var(--joy-space-4);
		text-align: center;
	}
	.card > form,
	.card > .btn,
	.confirm form {
		width: 100%;
	}
	.card .btn {
		width: 100%;
	}
	.name {
		font-size: 20px;
		margin: 0;
	}
	.price {
		display: inline-flex;
		align-items: center;
		gap: var(--joy-space-2);
		margin: 0;
	}
	.status {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 44px;
		font-weight: 700;
	}
	.confirm {
		display: flex;
		flex-direction: column;
		gap: var(--joy-space-2);
		width: 100%;
	}
	.confirm-line {
		margin: 0;
		font-weight: 600;
	}
	.card-err,
	.msg {
		margin: 0;
	}
	.btn {
		min-height: 44px;
		min-width: 44px;
	}
	@media (min-width: 480px) {
		.hero {
			flex-direction: row;
			text-align: left;
		}
		.hero :global(.joy-mascot) {
			width: 160px;
			height: 160px;
		}
	}
	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		}
	}
</style>
```
- [ ] **Step 4: Run to pass.** Verify-Cmd - expected all shop tests pass. Then `cd web && pnpm exec vitest run && pnpm check && pnpm lint` (run `pnpm exec prettier --write src/routes/shop` first if lint complains).
- [ ] **Step 5: Commit** `feat(I-015): Characters shop page with hero, cards, confirm, live region and focus`.

### Task D6: Admin rewards editor - the `character` slot

**Files:**
- Modify: `web/src/routes/admin/rewards/+page.svelte` (lines 12 and 19), `web/src/routes/admin/rewards/page.render.test.ts`, `web/src/routes/admin/rewards/page.server.test.ts`, `web/src/lib/game/types.ts` (`RewardsConfig.shop` stays `{id,slot,name,price}[]`; no change)

**Interfaces:** Produces `SLOTS = ['character']` and new empty rows with `slot: 'character'`.

- [ ] **Step 1: Write the failing test.** In `page.render.test.ts` change the `config.shop` fixture to `[{ id: 'pico', slot: 'character', name: 'Pico', price: 100 }]` and append to the first `describe`:

```ts test:web/src/routes/admin/rewards/page.render.test.ts
	it('the only slot is character, for existing rows and the new-item row', () => {
		const out = html(null);
		expect(out.match(/<option value="character"/g)).toHaveLength(2);
		expect(out).toContain('<option value="character" selected>character</option>');
		expect(out).not.toContain('value="body"');
		expect(out).not.toContain('value="accessory"');
	});
```
In `page.server.test.ts`: `'shop[0].id': 'pico'`, `'shop[0].slot': 'character'`, `'shop[1].slot': 'character'`, the `CONFIG.shop` entry `{ id: 'pico', slot: 'character', name: 'Pico', price: 100 }` (keep `name`/`price` keys consistent with the form values at lines 24-30 - set `'shop[0].name': 'Pico'`, `'shop[0].price': '100'`), and in `it('a filled new row is added')` use `'shop[1].id': 'zing-2'`, `'shop[1].slot': 'character'`, `'shop[1].name': 'Zing 2'` and expect `{ id: 'zing-2', slot: 'character', name: 'Zing 2', price: 90 }`.

Verify-Cmd: `cd web && pnpm exec vitest run src/routes/admin/rewards`

- [ ] **Step 2: Run to fail.** Expected: `<option value="body"` still present (3 options per select).
- [ ] **Step 3: Implement.** `+page.svelte` line 12: `{ id: '', slot: 'character', name: '', price: '' }`; line 19: `const SLOTS = ['character'];`.
- [ ] **Step 4: Run to pass.** Verify-Cmd, then `cd web && pnpm exec vitest run && pnpm check` pass.
- [ ] **Step 5: Commit** `feat(I-015): admin rewards editor sells characters`.

### Task D7: End-to-end - headings, axe and the buy-and-wear flow

**Files:**
- Modify: `web/e2e/shop-admin.spec.ts` (lines 29-35 first test, line 80-ish axe test heading), `web/e2e/helpers/auth.ts` (`signInFresh` returns the sub)
- Create: `web/e2e/helpers/seed.ts`, `web/e2e/characters.spec.ts`
- Consumes: Task C5 CLI `go run -tags dev ./cmd/seed -grant-sub <sub> -coins <n>` (needs `MIGRATIONS_DATABASE_URL`); helpers `signInFresh`, `signIn`, `finishLesson`; running API, SSO stub, Postgres per `make e2e`.

**Interfaces:**
- Produces: `signInFresh(page, tag): Promise<{ sub: string; email: string }>`; `grantCoins(sub: string, coins: number): void` (shells out to the seed command from `JQ/server`, default `MIGRATIONS_DATABASE_URL=postgres://joyquest_owner:owner@localhost:5432/joyquest?sslmode=disable`).

- [ ] **Step 1: Write the failing test.** Create `web/e2e/characters.spec.ts`:

```ts test:web/e2e/characters.spec.ts
// Fresh learner -> seeded coins (dev-only seed command) -> /shop -> buy Luna -> wear -> Luna on My Learning.
import { expect, test } from '@playwright/test';
import { signInFresh } from './helpers/auth';
import { grantCoins } from './helpers/seed';

test('a fresh learner wears Yoji, buys Luna, wears her and sees her on My Learning', async ({
	page
}) => {
	test.setTimeout(120_000); // the first `go run` compiles the seed command
	const { sub } = await signInFresh(page, 'chars');
	await page.goto('/learning');
	const strip = page.getByRole('region', { name: 'Your rewards' });
	await expect(strip.locator('img[alt="Yoji"]')).toBeVisible();

	grantCoins(sub, 300);
	await page.goto('/shop');
	await expect(page.getByRole('heading', { name: 'Characters', level: 1 })).toBeVisible();
	const balanceBefore = Number(await page.getByTestId('coins').textContent());
	expect(balanceBefore).toBe(300);

	const luna = page.locator('li.card', { has: page.getByRole('heading', { name: 'Luna', level: 2 }) });
	const price = Number((await luna.getByTestId('price').textContent())!.trim());
	expect(price).toBe(100);

	await luna.getByRole('button', { name: /^Buy · \d+ coins$/ }).click();
	await expect(luna.getByText('Buy Luna for 100 coins?')).toBeVisible();
	await luna.getByRole('button', { name: 'Buy Luna', exact: true }).click();

	await expect(page.getByTestId('shop-status')).toHaveText(`Luna is yours. ${balanceBefore - price} coins left.`);
	await expect(page.getByTestId('coins')).toHaveText(String(balanceBefore - price));
	const wear = luna.getByRole('button', { name: 'Wear', exact: true });
	await expect(wear).toBeFocused();

	await wear.click();
	await expect(page.getByTestId('shop-status')).toHaveText('Now wearing Luna.');
	await expect(luna.getByText('Wearing', { exact: true })).toBeFocused();
	await expect(page.getByRole('img', { name: 'You are wearing Luna' })).toBeVisible();

	await page.goto('/learning');
	const img = strip.locator('img[alt="Luna"]');
	await expect(img).toBeVisible();
	expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
});
```

In `web/e2e/shop-admin.spec.ts`: both `getByRole('heading', { name: 'Star Slime looks', level: 1 })` become `getByRole('heading', { name: 'Characters', level: 1 })`; the first test's last assertion `await expect(page.getByRole('button', { name: 'Buy', exact: true })).toHaveCount(0);` becomes `await expect(page.getByRole('button', { name: /^Buy · / })).toHaveCount(0);`.

Verify-Cmd (needs the stack from `make e2e`'s header comment running): `cd web && PLAYWRIGHT_PORT=14173 pnpm exec playwright test e2e/characters.spec.ts e2e/shop-admin.spec.ts`

- [ ] **Step 2: Run to fail.** Expected: `characters.spec.ts` fails at import (`./helpers/seed` not found); `shop-admin.spec.ts` passes after its heading edits only once the page is the new one (it is, after D5) - so before Step 3 the only failure is the missing helper.
- [ ] **Step 3: Implement.** `web/e2e/helpers/auth.ts`: make `signInFresh` return the identity:

```ts
export async function signInFresh(page: Page, tag: string) {
	const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
	const sub = `usr_e2e_${tag}_${stamp}`;
	const email = `e2e-${tag}-${stamp}@example.com`;
	await signIn(page, sub, email);
	return { sub, email };
}
```
`web/e2e/helpers/seed.ts`:

```ts
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const OWNER_URL =
	process.env.MIGRATIONS_DATABASE_URL ??
	'postgres://joyquest_owner:owner@localhost:5432/joyquest?sslmode=disable';

/** Gives a signed-in member coins through the dev-only seed command (owner role; never deployed). */
export function grantCoins(sub: string, coins: number): void {
	execFileSync('go', ['run', '-tags', 'dev', './cmd/seed', '-grant-sub', sub, '-coins', String(coins)], {
		cwd: path.resolve(process.cwd(), '../server'),
		env: { ...process.env, MIGRATIONS_DATABASE_URL: OWNER_URL },
		stdio: 'pipe'
	});
}
```
- [ ] **Step 4: Run to pass.** Start the stack as the Makefile says (`make db-up migrate`, `make seed`, `make dev-ssostub`, `make dev-api` with `ADMIN_SSO_USER_IDS=usr_shot_admin`) and run the Verify-Cmd. Expected: all pass, including the axe test on `/shop` (no serious or critical violations; if axe reports contrast on the "Wearing" status or the personality line, fix the colours in `+page.svelte`'s `<style>` using tokens). Then `make e2e PLAYWRIGHT_PORT=14173` - whole suite green. `grep -ri 'star slime' web/src web/e2e` prints nothing.
  **Dev-mode check (Vite dev prebundles Svelte libraries, which can break asset URLs; the static imports must survive it):** with the API and SSO stub running, `cd web && pnpm dev --port 15173 &`, sign in through the stub in the browser (Chrome tool) and open `http://localhost:15173/shop`; read the first `<img data-joy-mascot>` `src` (must start with `/`, not `file:`) and its `naturalWidth` (> 0). Then, from the shell, `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:15173<that src>` must print `200`. If a page reachable without a session renders a Companion, `curl -s <page> | grep -o 'src="[^"]*yoji-idle[^"]*"'` does the same without the browser. Stop the dev server afterwards. If dev serves a broken URL, add `optimizeDeps: { exclude: ['@montionugera/joy-mascots'] }` to `web/vite.config.ts` and rerun.
- [ ] **Step 5: Commit** `test(I-015): e2e for buying and wearing a character with seeded coins`.

### Task D8: Switch the dependency from `link:` to `0.1.0` (after the owner's publish)

**Precondition (controller):** Task B8 done - `@montionugera/joy-mascots@0.1.0` is on public npm (`npm view @montionugera/joy-mascots@0.1.0 version` prints `0.1.0`). The art is public (owner decision 2026-11-06), so there is no registry config, token, `.npmrc`, Docker secret or CI secret work: Joy-Quest installs it from public npm exactly like `joy-svelte`.

**Files:**
- Modify: `web/package.json`, `web/pnpm-lock.yaml`

**Interfaces:** Produces a registry-resolved lockfile (no `link:`).

- [ ] **Step 1: Write the failing check.** Verify-Cmd: `cd web && ! grep -n 'link:' package.json pnpm-lock.yaml && grep -n '"@montionugera/joy-mascots": "0.1.0"' package.json`
- [ ] **Step 2: Run to fail.** Expected: grep prints the `link:` lines and exits non-zero.
- [ ] **Step 3: Implement.** `cd web && pnpm add @montionugera/joy-mascots@0.1.0 && pnpm install --frozen-lockfile`.
- [ ] **Step 4: Run to pass.** Verify-Cmd prints the `"0.1.0"` line and no `link:`. Then `cd web && pnpm exec vitest run && pnpm check && pnpm build` - expected pass, and `ls web/build/client/_app/immutable/assets | grep -c 'yoji-idle'` prints at least `1` (the pictures came from the package, none from `web/static`; `git status --short web/static` is empty).
- [ ] **Step 5: Commit** `chore(I-015): depend on joy-mascots 0.1.0 from npm` (includes the lockfile).

**Phase gate (controller only):** verify → critique/visual (below) → review (code-reviewer + typescript-reviewer on opus) → /simplify → re-verify.
  1. **Verify:** `cd web && pnpm check && pnpm lint && pnpm test`, `make e2e`.
  2. **Critique (controller only):** run `impeccable` critique on `/shop`, My Learning, a lesson and a quiz result; write `critique.md` next to `design-brief.md`; fix every P0 and P1 finding (new commits), log P2/P3 in `docs/superpowers/ideas.md` as one line each.
  3. **Visual verify (controller only):** with `ui-visual-verify` (`~/.claude/skills/ui-visual-verify/shoot.mjs`) take `/shop`, `/learning` and a lesson at 390x844 and 1280x800, light and dark (12 shots), run its layout lint, fix findings, then `Read` every image and show the final shots to the owner.

---

## Final task: Docs, full verification, live check, commit

**Files:**
- Modify (Joy-Quest, `JQ`): `README.md` (line 9 `/shop` bullet, line 50 `member_cosmetics` bullet), `web/README.md` (line 63 component list, line 66 `/shop` bullet), `docs/README.md` (line 32 "Star Slime" paragraph), `Makefile` (comment on `seed:` target)
- Modify (joy-design, `JD`): `AGENTS.md` (package list sentence: add `@montionugera/joy-mascots`). The joy-design `README.md` was already updated in Task B5 (the docs-contract test needs it there).

- [ ] **Step 1: Update the Joy-Quest docs.** `README.md` line 9 -> ``- `/shop`: the Characters page; learners buy Pico, Luna, Rex, Mochi, Zing and Byte with chest coins and wear any one (Yoji is free).``; line 50 -> ``- `member_cosmetics` - the worn character (`mascot`, default `yoji`).``. `web/README.md` line 63: replace `StarSlime` with `Companion` (wraps `@montionugera/joy-mascots`); line 66 -> ``- `/shop` is the Characters page (buy with an inline confirm, wear; "Need N more coins" when short).``; add one line: ``- Dev only: `cd server && go run -tags dev ./cmd/seed -grant-sub <sso_sub> -coins <n>` gives a signed-in member coins (used by `e2e/characters.spec.ts`).`` `docs/README.md` line 32 -> ``- **Characters.** The mascots are Joymify's own family (Yoji, Pico, Luna, Rex, Mochi, Zing, Byte; art by the owner, never another product's mascot) from `@montionugera/joy-mascots`. The worn one rides the progress bar, cheers at the end of a lesson, and sleeps late at night. Characters are bought at `/shop`.``
- [ ] **Step 2: Update the joy-design docs.** `JD/AGENTS.md`: in the "The packages are ..." sentence add `@montionugera/joy-mascots`. (`JD/README.md` got its package-table row in Task B5; here add only, if B5 did not, one paragraph linking `packages/mascots/PROVENANCE.md` and the line `import '@montionugera/joy-mascots/mascot.css'` for React.)
- [ ] **Step 3: Full verification (Joy-Quest).** `make db-up migrate && make test-server test-web e2e` - expected: all green. Paste the tail of each.
- [ ] **Step 4: Live check (Tier 4).** `cd web && pnpm build && pnpm preview --port 14173` with the API and SSO stub running, sign in through the stub, open `http://localhost:14173/shop`; confirm Yoji "Wearing" with six priced cards, no broken pictures, no unexpected blank or dash states; `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:14173/shop` prints `200` after sign-in cookies (or use the browser). Final grep: `grep -ri 'star slime' web/src web/e2e` prints nothing. Also confirm the data path (Tier 3): `psql` count `SELECT count(*) FROM member_cosmetics WHERE mascot <> 'yoji'` is `>= 1` after the e2e run (Luna wearer).
- [ ] **Step 5: Commit** both repos' doc changes as new commits: `docs(I-015): characters replace Star Slime in the docs` (Joy-Quest) and `docs(I-105): joy-mascots in AGENTS` (joy-design). Then the controller runs `psrw ship` for each repo's feature (Joy-Quest ships to release 1.3; joy-design per its own flow). Memory `joyquest_no_prod_deploy`: merging deploys nothing, so never report this as live.

**Phase gate (controller only):** verify → review (code-reviewer on opus, whole diff) → /simplify → re-verify. Max one fix round.

---

## Self-review

Spec requirement -> task that covers it.

| Spec item | Covered by |
|---|---|
| EARS 1: `<Mascot name="rex" pose="cheer" size={96} label="Rex">` shows Rex cheer at 96x96 with alt "Rex" | B3 (Svelte test "Rex cheer at 96"), B4 (React twin + parity) |
| EARS 1: unknown `name` or `pose` shows Yoji idle | B2 (`resolveMascot`), B3, B4 |
| EARS 2: a new learner sees Yoji on every reward surface | C2 (column default `yoji`), C3 (`TestSummary_NewLearnerWearsYoji`), D1 (Companion default), D3 (strip `alt="Yoji"`), D7 (e2e `img[alt="Yoji"]`) |
| EARS 3: confirming Luna records one `purchase` row of -100 and lists Luna owned | C3 (`TestPurchaseAndEquip`: balance 200 after one purchase), C4 (`TestRewards_CharacterShopFlow`), D7 (balance = before - price) |
| EARS 3: lacking coins returns 409 and records nothing | C3 (`NotEnoughCoinsError`), C4 (409 `not_enough_coins` "Need 50 more coins") |
| EARS 4: wearing Luna shows her on rider, reward panel, strip, quiz band, shop hero on next load | D2 (rider, quiz band), D3 (strip, reward panel), D5 (hero), D7 (strip after wearing) |
| EARS 4: wearing an unowned character returns 403 and keeps the current one | C3 (`ErrNotOwned`), C4 (403 `not_owned`, equipped unchanged) |
| EARS 4: worn-character fetch fails on a lesson or quiz page -> Yoji | D2 (`wornCharacter`, load tests) |
| EARS 5: `prefers-reduced-motion` -> no bob | B3 (`mascot.css` reduced-motion branch); verified visually in the hub (B6) |
| EARS 6: `--check` exits 0 with 7 lines, every spread <= 5% | A2 (`check_dir`, sleepy pose excluded per the updated spec), A3 (real run, expected exit 0) |
| EARS 7: migration 0017 with a stored config -> exactly the 6 character items, other keys unchanged | C2 (`TestMascotMigration_RewritesStoredShopAndKeepsOtherKeys`) |
| Acceptance: fresh learner -> `img[alt="Yoji"]` on My Learning | D3, D7 |
| Acceptance: balance B >= 100, buy Luna -> B-100, live region "Luna is yours. B-100 coins left.", focus on Wear | D4 (`boughtLine`), D5 (`submit`, `focusId`), D7 |
| Acceptance: balance 50, Rex (150) disabled "Need 100 more coins" | D5 render test (`Need 22 more coins` pattern with `needLabel`), `needMore` already exists in `copy.ts` |
| Acceptance: Luna worn -> rider shows Luna; reward panel shows Luna cheer | D2 (rider), D3 (`LessonReward` dom test `[data-character="luna"][data-pose="cheer"]`) |
| Acceptance: Rex worn, tap Wear on Yoji -> hero and strip show Yoji | C3 (`Equip` yoji always succeeds), C4 (equip yoji 200), D5 (Yoji card shows "Wear" when not worn) |
| Acceptance: stored config `lesson_xp: 37` + old body items -> `GET /v1/shop` lists the 7, `/admin/rewards` keeps 37 | C2 (store test against real Postgres) |
| Acceptance: hub at 390/1280 light/dark, all 35 pictures load | B6 (`mascots.spec.ts`, 4 variants) |
| Acceptance: `grep -ri 'star slime' web/src web/e2e` returns nothing | D3 (deletions), D5, D7 step 4, Final step 4 |
| Design 1: package files, `assets` webp 256/512, `src/data.js` with `new URL(..., import.meta.url)`, `files`, props, fallback, reduced motion, PROVENANCE, `license` | B1, B2, B3, B4, B5 |
| Design 1: hub page "Mascots" 7 x 5 grid, light and dark | B6 |
| Design 1: publish.yml loops + consumer-smoke; tag `packages-v0.1.0`; R0 owner yes; GitHub Packages + npmjs.org like the other packages | B7, B8 (both registries, like the other packages) |
| Design 2: scale normalisation (body height of largest component, per-character factor from idle, feet line, shrink whole character, `--check`) | A1, A2, A3 |
| Design 3: config items, `DefaultLook`, slot check text | C1 |
| Design 3: built-in Yoji item first in `GET /v1/shop`, equip yoji always succeeds | C3, C4 |
| Design 3: migration 0017 (column `mascot`, drop old, settings rewrite, owner role, GRANTs, Down) | C2 |
| Design 3: store `Equipped`, `defaultEquipped`, `Equip`, `UpsertCosmetics`, `make sqlc` | C3 |
| Design 3: Buy/equip flow, 409 `not_enough_coins` "Need M more coins", 403 `not_owned`, ledger rows stay | C3, C4 |
| Design 3: stored id not in config -> API reports `yoji` | C3 (`TestSummary_ReportsYojiWhenTheWornCharacterLeftTheShop`) |
| Design 3: server copy already_owned / not_owned with names | C4 |
| Design 4: dependency `@montionugera/joy-mascots@0.1.0`, `link:` until published, never merges, no PNGs in `web/` | D1, D8 |
| Design 4: `Companion.svelte` (pose map, combo -> glow, character fallback) | D1 |
| Design 4: replace every `StarSlime` use (`ProgressRider`, `LessonReward`, `RewardsStrip`, `QuizRewardBand`, shop, `TwoSlimes`, `art.render.test.ts`) | D2, D3, D5 |
| Design 4: plumbing: lessons load / attempts load fetch worn character -> `CardSession` -> `ProgressRider`, `QuizRewardBand`; Yoji on failure | D2 |
| Design 4: delete `StarSlime.svelte`, tables in `slime.ts`; `types.ts` `Equipped` | D3 |
| Design 4: admin rewards editor `SLOTS = ['character']`, new rows default, tests | D6 |
| Design 4: accessibility (decorative everywhere except hero and strip) | D1 (decorative default), D2, D3 (strip label), D5 (hero label) |
| Design 5: title/h1 "Characters", strip link "Characters" | D3, D5 |
| Design 5: hero stacking at 480, 128/160 px | D5 (`<style>`), verified by the visual gate |
| Design 5: 7 cards with the four actions; layout 1/2/3-4 columns; buttons >= 44 px | D5 |
| Design 5: inline buy confirm with Cancel/Esc focus return | D5 (dom test) |
| Design 5: live region and focus after buy/wear; failure keeps focus on the card, error inside | D5 (code), D7 (buy/wear focus), D5 render test (error inside card) |
| Design 5: copy "Star Slime" -> character name | D3, D4, D5 |
| End-to-end: `shop-admin.spec.ts` heading; new Playwright buy/wear test with dev coin seed | C5, D7 |
| End-to-end: ui-visual-verify shots 390x844 and 1280x800 light and dark | Phase D gate step 3 |
| End-to-end: consumer smoke on the packed tarball | B7 |
| State matrix: Ideal, Empty (hint + link), Loading (server-rendered), Confirming, Partial (image fails -> initial circle), Error | D5 (Ideal, Empty, Confirming, Error), B3/B4 (Partial fallback; browser behaviour checked in the visual gate by blocking one picture) |
| Order of work 1-4 | Phases A, B, C, D in that order; D8 after B8 |
| Assumptions (prices, no refund, art public and published like the other packages, eye-follow dropped, WebP < 2 MB, confirm, no chest mascot, Yoji try-again as is) | C1 prices; C2 drop; B7/B8; D3 (no `eyeFollow`); B1 size assertion; D5 confirm; no ChestOpener change anywhere; art untouched |

**Spec gaps and doubts found while planning (for the controller):**
1. `--check` excludes the `sleepy` pose (drawn slumped on purpose; spec updated 2026-11-06), so the real art is expected to pass with exit 0.
2. The spec's `src/data.js` with literal `new URL(...)` URLs forces 70 literals; the plan generates them into `src/urls.js` (React and plain JS) and, for the Svelte component, `src/assets.js` of static ESM imports, because Vite rewrites `new URL(..., import.meta.url)` only in the client build (SSR gives `file://`, dev prebundling breaks it).
3. The art is public (owner, 2026-11-06), so Joy-Quest installs `joy-mascots` from public npm like `joy-svelte`: no token, `.npmrc`, Docker or CI secret work. The owner must register a trusted publisher for the new package on npmjs.com before the first publish.
4. The e2e coin seed is a flag on `cmd/seed` (`-grant-sub`, `-coins`) rather than a fixed `make seed` row, because the learner is created at sign-in with a random id and the buy test must be re-runnable.
5. The React twin needs its stylesheet imported by the consumer (`@montionugera/joy-mascots/mascot.css`); the Svelte component imports it itself.

## Appendix — audit trail

- 2026-11-06 self-grill-audit: verdict no → fixed. Corrected: (1) Svelte side now uses static ESM asset imports via generated `src/assets.js` (B1/B3), `new URL` kept only for React/plain JS; D1 test asserts the SSR `src` starts with `/`, D7 gets a `pnpm dev` + curl check; (2) `firstTagAttrs` drops `on*` attributes (B3 helpers) and the parity test compares pictures by file name (B4); (3) `src/react.ts` exports from `'./react/Mascot.js'` with a plain-Node load check (B4); (4) B7 also updates `publish-contract.test.mjs` (`PUBLISHED` mascots row, loop string, trap regex) and publish.yml trap; (5) D8 shrunk to switching `link:` to `0.1.0` from public npm, all token/.npmrc/Docker/CI secret work and "private" wording removed, mascots in every publish.yml loop incl. npmjs.org (B7, B8, PROVENANCE, constraints, self-review); (6) A3 `--check` excludes `sleepy`, tests and implementation updated, "stop and ask owner" removed, expected exit 0; (7) joy-design README edit moved into B5 for `docs-contract.test.mjs`; (8) C2 "stored row, not the default" comment corrected. Open: none.
