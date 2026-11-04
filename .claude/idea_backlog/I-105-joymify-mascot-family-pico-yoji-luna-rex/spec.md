---
title: "Joymify mascot family (Pico, Yoji, Luna, Rex, Mochi, Zing, Byte) in joy-design and Joy-Quest"
id: I-105
status: idea
---

# Joymify mascot family as shared joy-design characters

## Problem

The owner drew the Joymify mascot set on 2026-11-04 (`ref/owner-mascot-sheet-2026-11-04.jpeg`, tagline "Different vibes, same journey."). Joy-Quest's F-013 Star Slime is one generic character drawn in code; it should become this family, shared by every Joymify app through joy-design.

Characters (all star-topped yellow blobs, own design, not Duolingo's):
- **Pico**: chill, honest, real (backwards navy cap, side-eye, thumbs up)
- **Yoji**: kind, bright, always positive (wink, peace sign); the lead / default companion
- **Luna**: dreamer, creative, sensitive (pink beanie, headphones, eyes closed)
- **Rex**: confident, bold, no filter (black shades, arms crossed, black jacket)
- **Mochi**: sweet, caring, supportive (leaf sprout, bubble tea, hearts)
- **Zing**: party lover, fun, chaos (rainbow shades, confetti)
- **Byte**: smart, curious, problem solver (round glasses, laptop, light bulb)

## Why now

The owner asked (2026-11-04): "Please add in design joymify lib and use in our quest project." F-013 Phase 2 is shipping the Star Slime UI now; swapping in the family later costs more the longer we wait.

## Sketch

1. joy-design: a mascot package or module (art + names + personality lines), with Svelte and React twins, shown in the Storybook hub. The art source is still open (owner decision): crop raster art from this sheet, have each character redrawn cleanly (ChatGPT in Chrome, per memory), or redraw as SVG components like StarSlime.
2. Joy-Quest: Yoji replaces Star Slime as the default companion; the other six become companions or chat characters (game-like direction, I-014); the shop "looks" may map onto them.

## Acceptance criteria

- [ ] All 7 characters are available from joy-design with name + 3-word personality, in Svelte and React, visible in the hub at 390 and 1280 widths, light and dark.
- [ ] Joy-Quest uses Yoji (via joy-design) wherever Star Slime appears today: rider, reward panel, My Learning strip, shop, quiz band.
- [ ] No Duolingo art, names or look; the art is the owner's.

Twin idea in Joy-Quest: I-015 (consumer side).
