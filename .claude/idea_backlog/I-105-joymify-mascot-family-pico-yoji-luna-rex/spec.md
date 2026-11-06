---
title: "Joymify mascot family (Pico, Yoji, Luna, Rex, Mochi, Zing, Byte) in joy-design and Joy-Quest"
id: I-105
status: refined
pair: Joy-Quest F-014 (from I-015); this is a copy of the approved Joy-Quest spec. joy-design owns Design §1 (package) and the publish; plan tasks B1-B8 in Joy-Quest .claude/refined_backlog/F-014-*/plan.md
from_idea: I-015
---

# Joymify mascot family in joy-design and Joy-Quest

## Goal

Learners see the owner's own characters instead of the code-drawn Star Slime: Yoji by default, and any of the other six once they buy it with coins. Every Joymify app can use the same characters from joy-design. We know it worked when the shop sells the six characters and every Star Slime spot in Joy-Quest shows the learner's chosen character.

Owner's words (2026-11-04): "Please add in design joymify lib and use in our quest project."
Owner decision (2026-11-06): the shop sells the six non-Yoji characters instead of colours and accessories; Yoji is free.
**The owner will confirm this by** opening `/shop` on the local preview (phone 390 and desktop 1280, light and dark), seeing Yoji marked "Wearing" and six characters with prices, buying one, and then seeing it on the My Learning strip and the lesson rider.

## Non-goals

- No animation beyond today's CSS bob/bounce (no sprite sheets, no Rive/Lottie).
- No chat characters or per-character dialogue yet (I-014 "game-like" follow-up work).
- No recolouring of the raster art; no accessories on top of characters.
- No refund or carry-over of old Star Slime purchases (no production users; memory `joyquest_no_prod_users`).
- No mascot added to the chest opener (it has none today).
- Flutter / Swift joy-design twins: later, not in this spec.

## Users & jobs

- **Learner (phone first, iPad, desktop):** wants a friendly companion that reacts to their lessons and something worth saving coins for.
- **Joymify app builder:** wants `<Mascot name="yoji" pose="cheer">` from joy-design, not copied PNGs.

## Characters and poses

| id | Name | Personality (3 words) | Price |
|---|---|---|---|
| `yoji` | Yoji | kind, bright, positive (lead) | Free |
| `pico` | Pico | chill, honest, real | 100 |
| `luna` | Luna | dreamy, creative, sensitive | 100 |
| `rex` | Rex | confident, bold, unfiltered | 150 |
| `mochi` | Mochi | sweet, caring, supportive | 150 |
| `zing` | Zing | fun, party, chaos | 200 |
| `byte` | Byte | smart, curious, solver | 200 |

Art poses: `idle`, `cheer`, `thinking`, `try-again`, `sleepy` (35 PNGs, 512 px, in `ref/art/poses/`, cut by `crop_mascots.py`).
Joy-Quest pose map: `happy → idle`, `cheer → cheer`, `opening → cheer`, `thinking → thinking`, `tryAgain → try-again`, `sleepy → sleepy`.

## Design

### 1. joy-design package `@montionugera/joy-mascots` (packages/mascots)

One package with a Svelte entry and a `./react` export (same export shape as `packages/icons`):
- `assets/<id>-<pose>.webp` (256 px) and `assets/<id>-<pose>@2x.webp` (512 px), made from the 35 PNGs by a build script; alpha kept.
- `src/data.js`: `MASCOTS` (id, name, personality, poses), `POSES`, `assetUrl(id, pose, density)`. Each URL is built with `new URL('../assets/<file>', import.meta.url).href` so Vite and other bundlers emit the file. Plain JS, no framework; the React build imports this same file (no copy under `dist/`).
- `package.json` `files` includes `assets/` and `src/data.js`.
- `src/Mascot.svelte` and `src/react/Mascot.tsx`: props `name`, `pose` (default `idle`), `size` (CSS px, default 96, max 256), `label` (alt text), `glow` (0–5 soft halo), `eager` (default lazy). With no `label` the image is decorative (`alt=""`). One `<img>` with `srcset` 1x/2x and `width`/`height` set (no layout shift).
- Unknown `name` or `pose`: falls back to `yoji` / `idle`; warns once in dev.
- `prefers-reduced-motion`: no bob animation.
- Image load failure: a soft circle with the character's initial, same size.
- PROVENANCE.md: art by the owner, redrawn in ChatGPT from the owner's sheet (2026-11-05); not Duolingo. `license: SEE LICENSE IN PROVENANCE.md`.
- Storybook hub page "Mascots": 7 × 5 pose grid with names and personalities, light and dark.
- Publish `0.1.0`: add `mascots` to every package loop in `.github/workflows/publish.yml` (lines 156, 162, 187, 209, 279, 321, 371) and to `scripts/test/consumer-smoke.sh` (smoke test renders one image from the packed tarball); tag `packages-v0.1.0`. **R0: needs the owner's yes in the tab.** It goes to the same registries as the other joy-design packages (GitHub Packages and public npmjs.org); the joy-design repo is public, so the art is public (owner OK, 2026-11-06).

### 2. Scale normalisation (crop script)

Today each pose is fitted on its own, so a prop shrinks the character. New rule in `crop_mascots.py`:
- **Body height** = vertical distance from the lowest to the highest opaque pixel of the largest connected alpha component (the body; detached props such as confetti or a floating bulb are other components and ignored).
- Each character's scale factor comes from its `idle` pose; all 5 poses of that character use that factor, aligned on the body's bottom (feet line), padded onto a 512 px square. If a prop would overflow, the factor shrinks for the whole character, never for one pose.
- `crop_mascots.py --check` prints `<id> min max spread%` (body height in the output images) per character and exits 1 if any spread > 5%. The `sleepy` pose is excluded from the spread (it is drawn slumped on purpose: yoji 7.6%, pico 5.4% with it).

### 3. Joy-Quest shop model (server)

- Shop items: the 7 body/star/accessory items are replaced by 6 items with `slot: "character"` (prices in the table), in `server/internal/rewards/default_config.json`.
- `config.go`: `DefaultLook` becomes `{"character": "yoji"}`; the slot check and its error text accept only `character`.
- `GET /v1/shop` puts a built-in Yoji item first (`{id:"yoji", slot:"character", price:0, owned:true}`, not in config), so the page renders 7 cards from one list. Equipping `yoji` always succeeds.
- Migration `0017_mascot_character.sql` (run as `joyquest_owner`, ends with its `GRANT`s):
  - `member_cosmetics`: add `mascot text NOT NULL DEFAULT 'yoji'`; drop `body`, `star`, `accessory` (Down adds them back with their defaults and drops `mascot`). Column name `mascot`, not `character`, because `character` is an SQL type name.
  - The stored rewards config row in `settings` (if any): replace its `shop` array with the 6 character items and keep every other key (e.g. a tuned `lesson_xp`). Without this, `RewardConfigQ` (`store/rewards.go:36-38`) would see the old slots, fail `Validate`, and quietly fall back to defaults, losing the admin's values.
- Store: `Equipped` becomes `{Character}`; `defaultEquipped`, the `Equip` switch, and `UpsertCosmetics` in `queries/rewards.sql` change to match; `make sqlc`.
- Buy and equip keep today's API flow: `Buy` writes a `purchase` ledger row and short coins return 409 `not_enough_coins` with message "Need M more coins" (the `need` number is already on each item in `GET /v1/shop`); wearing an unowned character returns 403 `not_owned`.
- Old `purchase` rows for removed items stay in the append-only ledger; they only count against the coin total, which stays correct.
- If `member_cosmetics.mascot` holds an id not in the config (an item removed later), the API reports `yoji`.
- Server copy: already_owned → "You already have <Name>."; not_owned → "Buy <Name> first, then you can wear them."

### 4. Joy-Quest UI (web)

- `web/package.json` depends on `@montionugera/joy-mascots@0.1.0`. Until it is published, development may use a `link:` to the joy-design checkout; that link never merges to main and is switched to `0.1.0` before ship. PNGs are never copied into `web/`.
- New `web/src/lib/game/Companion.svelte`: wraps `<Mascot>`, maps Joy-Quest poses (table above), maps combo to `glow`, takes the `character` id (falls back to Yoji).
- Replace every `StarSlime` use with `Companion`: `ProgressRider`, `LessonReward`, `RewardsStrip`, `QuizRewardBand`, `routes/shop/+page.svelte`, `test-support/TwoSlimes.svelte`, `art.render.test.ts`, and other tests.
- **Pass the worn character to surfaces that lack it today:** `ProgressRider` and `QuizRewardBand` get no look now. `routes/lessons/[id]/+page.server.ts` load and `routes/attempts/[id]/+page.server.ts` fetch the worn character (`/v1/me/rewards`) and pass it through `CardSession` → `ProgressRider` and into `QuizRewardBand`. If that fetch fails, show Yoji.
- Delete `StarSlime.svelte` and the `LOOKS` / `STARS` / `ACCESSORIES` tables in `slime.ts` (keep `poseForHour`, `glowLevel`). `lib/game/types.ts` `Equipped` becomes `{ character: string }`.
- Admin rewards editor `routes/admin/rewards/+page.svelte`: `SLOTS = ['character']`, new rows default to `slot: 'character'`; update its tests.
- Accessibility: `Companion` is decorative (no alt) on shop cards, in `ProgressRider` and `QuizRewardBand`. Only the shop hero ("You are wearing <Name>") and the `RewardsStrip` ("<Name>") carry a label.

### 5. Shop page "Characters"

- `<title>` and h1: "Characters". RewardsStrip link: "Characters".
- **Hero:** worn character, name (h2), personality, coin balance. Below 480 px it stacks: character at 128 px centred, then name, personality and coins on their own lines. At 480 px and up: character (160 px) left, text right.
- **Cards (7, Yoji first):** picture (idle), name, personality, price (or "Free"), then one action:
  - "Wearing" (status text, the current one)
  - "Wear" button (owned)
  - "Buy · N coins" button (enough coins)
  - "Need M more coins" disabled button (from `needMore()` in `lib/game/copy.ts`; accessible name "Buy <Name>, N coins. Need M more coins")
- One column at 390 px, two at ≥640 px, three or four at 1280 px. Buttons full-width in the card, at least 44 px tall.
- **Buy confirm:** pressing "Buy · N coins" shows an inline confirm on that card: "Buy Luna for 100 coins?" with [Buy Luna] [Cancel]. Cancel or Esc returns focus to the Buy button.
- **After buying:** a polite live region says "Luna is yours. 20 coins left.", and focus moves to that card's "Wear" button. **After wearing:** it says "Now wearing Luna.", and focus moves to that card's "Wearing" status. If a buy or wear fails, focus stays on the card and the error shows inside it.
- Copy everywhere: "Star Slime" becomes the character's name (e.g. "Yoji cheers you on").

## Requirements (EARS)

1. When an app renders `<Mascot name="rex" pose="cheer" size={96} label="Rex">`, joy-mascots shall show Rex's cheer picture at 96×96 with alt "Rex".
   If `name` or `pose` is unknown, then it shall show Yoji idle.
2. When a new learner opens any reward surface, Joy-Quest shall show Yoji.
3. When a learner with enough coins confirms buying Luna, the server shall record one `purchase` row of −100 and list Luna as owned.
   If the learner lacks coins, then the server shall return 409 and record nothing.
4. When a learner wears Luna, the rider, reward panel, My Learning strip, quiz band and shop hero shall show Luna on the next page load.
   If the learner tries to wear a character they don't own, then the server shall return 403 and keep the current one.
   If the worn-character fetch fails on a lesson or quiz page, then that page shall show Yoji.
5. While a learner has `prefers-reduced-motion`, the mascot shall not bob.
6. When `crop_mascots.py --check` runs on `ref/art/poses/`, it shall exit 0 with 7 lines, every spread ≤5% across idle, cheer, thinking and try-again.
7. When migration 0017 runs on a database with a stored rewards config, the stored `shop` shall hold exactly the 6 character items and every other key shall be unchanged.

## Acceptance criteria

- [ ] Given a fresh learner, when they open My Learning, then the strip shows `img[alt="Yoji"]`.
- [ ] Given a balance B ≥ 100, when they confirm buying Luna, then the balance shows B − 100, the live region says "Luna is yours. B−100 coins left.", and Luna's card shows "Wear" with focus on it.
- [ ] Given a balance of 50, when they view Rex (150), then its button is disabled with "Need 100 more coins".
- [ ] Given Luna is worn, when they start a lesson, then the rider shows Luna; finishing shows Luna cheer in the reward panel.
- [ ] Given Rex is worn, when they tap "Wear" on Yoji, then the hero and the My Learning strip show Yoji.
- [ ] Given a stored rewards config with `lesson_xp: 37` and the old body items, when 0017 runs, then `GET /v1/shop` lists yoji, pico, luna, rex, mochi, zing, byte and `/admin/rewards` still shows lesson_xp 37 (store test against real Postgres).
- [ ] Given the hub, when opened at 390 and 1280 in light and dark, then all 35 pictures load with no broken images.
- [ ] `grep -ri 'star slime' web/src web/e2e` returns nothing.

## End-to-end verification

`make test-server test-web e2e` green, including:
- Update `web/e2e/shop-admin.spec.ts` to expect `getByRole('heading', { name: 'Characters', level: 1 })`.
- New Playwright test: fresh learner → gets coins through a dev-only `//go:build dev` path (a `make seed` step that inserts a `coins` reward_events row via the owner-role Store) → `/shop` → reads the balance and Luna's price → buys Luna → balance = before − price → wears → My Learning strip shows `img[alt="Luna"]`.

Plus ui-visual-verify shots of `/shop`, My Learning and a lesson at 390×844 and 1280×800, light and dark; and the joy-design consumer smoke test passing on the packed tarball.

## State matrix (shop page)

| State | What shows | Recovery |
|---|---|---|
| Ideal | Hero (worn character) + 7 cards | — |
| Empty (0 coins) | Yoji "Wearing"; 6 cards show "Need N more coins"; hint "Finish a lesson to earn coins" | Link to My Learning |
| Loading | Server-rendered; no spinner | — |
| Confirming | Inline confirm on one card | Cancel / Esc |
| Partial (image fails) | Initial-in-circle fallback, same size | Reload |
| Error (API down) | Today's shop error alert | "Try again" |

Focus order: hero → cards in reading order → each card's one button (or confirm pair).

## Interfaces & files

- **joy-design:** `packages/mascots/**` (new), Storybook hub story, root workspace config, `.github/workflows/publish.yml` package loops, `scripts/test/consumer-smoke.sh`.
- **Joy-Quest server:** `internal/rewards/{config.go (DefaultLook, slot list + error text), default_config.json}`, `internal/store/rewards.go` (`Equipped`, `defaultEquipped`, `Equip`), `queries/rewards.sql` (`UpsertCosmetics`) + `make sqlc`, `migrations/0017_mascot_character.sql`, `internal/httpapi/rewards.go` (Yoji item, copy) + tests, `cmd/seed` (dev coins).
- **Joy-Quest web:** `web/package.json`; `lib/game/{Companion.svelte (new), slime.ts, types.ts, copy.ts, ProgressRider, LessonReward, RewardsStrip, QuizRewardBand, CardSession}.svelte`; `routes/shop/*`; `routes/lessons/[id]/+page.server.ts`; `routes/attempts/[id]/+page.server.ts`; `routes/admin/rewards/*`; `e2e/shop-admin.spec.ts` + new e2e; delete `StarSlime.svelte`.
- **Art:** `crop_mascots.py` (scale rule + `--check`), `ref/art/poses/` regenerated.

## Order of work

1. Crop script scale fix → regenerate poses → `--check` green (owner looks at the sheet).
2. joy-design package + hub (Svelte + React) → owner OK → publish 0.1.0 (R0).
3. Joy-Quest server (migration, config, store, API, seed).
4. Joy-Quest web (Companion swap, plumbing, shop page, admin) on a `link:` until 0.1.0 is out → switch to 0.1.0 → ui-visual-verify → ship to release 1.3.

## Alternatives considered

- **Do nothing (keep Star Slime):** loses the owner's characters; the owner asked for them.
- **Copy PNGs into Joy-Quest only:** faster, but other Joymify apps can't share; the owner asked for joy-design.
- **Redraw characters as SVG so colours still work:** big art effort and loses the owner-approved look.
- **All 7 free, no shop:** simpler, but coins lose their use. The owner chose selling characters (2026-11-06).

## Assumptions

- ASSUMED: prices 100/100/150/150/200/200 coins, set in config — reversible: Y
- ASSUMED: old body/star/accessory purchases are dropped with no refund (no prod users) — reversible: N (columns dropped)
- DECIDED (owner, 2026-11-06): the art is public; joy-mascots publishes like the other joy-design packages (GitHub Packages + npmjs.org), so Joy-Quest needs no registry token. Replaces the earlier "GitHub Packages only" choice, because the joy-design repo is public.
- ASSUMED: eye-follow is dropped; combo glow becomes a soft halo — reversible: Y
- ASSUMED: WebP 256/512 shipped in the package (70 files, est. <2 MB); hero at most 256 px CSS — reversible: Y
- ASSUMED: buying needs one inline confirm (no refunds exist) — reversible: Y — raised by ux
- ASSUMED: chest opener gets no mascot — reversible: Y — raised by product/tech
- ASSUMED: Yoji "try again" pose kept as is (looks a bit worried); a redraw can swap the file later — reversible: Y

## Appendix — spec review

- 2026-11-06 spec-review: lenses tech, qa, product, ux. Findings 18 raw → 10 merged (8 dropped: dup 8 — locked-card copy reported by qa+product+ux+tech; ChestOpener by product+tech; e2e heading by qa+tech; no bad citations; low-conf 0).
  Applied: stored settings row migrated in 0017 (qa); dev coin seed named for e2e (qa); one locked-card string "Need M more coins" (all lenses); body height defined + `--check` (qa+tech); rider/quiz band plumbing for the worn character (tech); admin editor, types, e2e heading in blast radius (tech+qa); publish.yml loops + tag (tech); assets via `import.meta.url` + `files` (tech); Yoji as built-in free item (ux+tech); buy confirm, live region, focus (ux); decorative alt (ux); hero layout at 390 (ux); `link:` until publish (product); column `mascot` not `character` (self).
  Answered from disk: 3 (409 shape, need field, ChestOpener). Asked at gate: 1 (publish destination). Assumed: 8.
