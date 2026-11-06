# F-094 design brief — joy-mascots package + hub "Mascots" page

Written after the fact from the approved spec (spec.md) and the Joy-Quest twin brief
(joy-quest F-014 `design-brief.md`); the shape decisions below were made in the 2026-11-06 brainstorm.

- **What it is:** the owner's 7 mascots (Yoji lead, Pico, Luna, Rex, Mochi, Zing, Byte) x 5 poses
  (idle, cheer, thinking, try-again, sleepy) as WebP 1x/2x, plus a Svelte and a React `<Mascot name pose size label glow>`.
- **Art direction:** owner's own sheet, ChatGPT redraw, cropped and scale-normalised by script
  (spread <= 1.9%, sleepy excluded). Art is never recoloured; characters differ by shape, not tint.
- **Component rules:** decorative by default (`alt=""`); a `label` makes it meaningful. Unknown name/pose -> Yoji idle.
  Image error -> initial-letter circle in token colours. `glow` = soft drop-shadow in accent token, 0 = none.
  `prefers-reduced-motion` -> no bob. Sizes in px; the picture keeps its square box so layouts don't jump.
- **Hub page:** 7 rows x 5 poses grid, name (h3) + 3-word personality from `MASCOTS`, pose in a figcaption.
  Tokens only, no hex. Must read on both light canvas and dark navy canvas.
