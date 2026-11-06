# F-094 critique — hub "Mascots" page and Mascot component (2026-11-06)

Evidence: B6 opus review (APPROVE), implementer light shots 390+1280, controller dark shots 390+1280
(`mascots-dark-phone.png`, `mascots-dark-desktop.png`, theme=dark, bg rgb(13,22,36)); Joy-Quest consumer shots
(20 shots, 5 surfaces, light+dark, 0 console errors, 0 overflow) at joy-quest F-014 b5ef728.

## Findings
- P1 (fixed in B6 gate) Dark-theme screenshots missing -> taken; all 35 pictures readable, dark outlines hold on navy.
- P2 (fixed, 4bdae8c8) lazy images flaky in the hub spec -> `expect.poll`; personality text now asserted.
- P2 (fixed, 223dd986) glow 0 still drew a drop-shadow -> none at 0.
- P3 (accepted) stray dot visible in shots = the hub `.canvas` dotted background, pre-existing.
- P3 (accepted) per-pose props make some poses read slightly smaller (Byte cheer bulb); within the 1.9% body-height spread.
- Off-goal (filed in docs/superpowers/ideas.md): Brand view download links 404 under /design/ (build.js:5453).
