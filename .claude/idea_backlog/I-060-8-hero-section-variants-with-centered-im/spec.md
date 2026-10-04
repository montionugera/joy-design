---
title: "8 Hero Section variants with centered image cover editorial, and Apple-style continuous narrative scroll landing page with 5 interactive scenes"
id: I-060
status: idea
---

# 8 Hero Section variants with centered image cover editorial, and Apple-style continuous narrative scroll landing page with 5 interactive scenes

## Problem
1. **Editorial Cover is not vertically centered and lacks an image cover backdrop**: In the previous release, the editorial cover displayed as a plain cream box with no image cover background, and content was pushed toward the top rather than being an authentic full-bleed, vertically and horizontally centered luxury editorial magazine cover.
2. **Limited Hero Section Variants**: Storybook Hub only showcased 3 variants. Users building enterprise and luxury product landing pages need a comprehensive palette of 5–8 distinct, production-ready hero section archetypes (Antigravity particles, 3D wave mesh, centered luxury editorial image cover, Apple keynote hardware showcase, SaaS financial cockpit, Cyberpunk HUD, Swiss typographic poster, and Luminous fluid gradient aura).
3. **Absence of an Apple Keynote-style Continuous Narrative Scroll Landing Experience**: Joymify Design System lacked a full-page sample showcasing continuous scroll-driven hardware storytelling like Apple's iPhone Duo / MacBook Pro landing pages, featuring interactive device posture folding mechanisms, widescreen cinematic display immersion, internal silicon bento specifications, and real-time studio customizer.

## Why now
The user explicitly requested 5–8 hero variants with a centered image cover editorial, plus a full-page continuous narrative scroll landing page with ~5 scenes matching the uploaded iPhone Duo foldable design references. Delivering this elevates Joymify Design System into a premier enterprise and consumer showcase for both Svelte 5 and React 19.

## Sketch
1. **Hero Section Suite (8 Distinct Variants in Hub)**:
   - Provide an 8-option segmented switcher (`#landing-hero-options`) in `#view-landing-blocks`:
     1. `Antigravity Particles`: Floating multi-color capsules, pills, and confetti with lift-off physics and cursor avoidance.
     2. `3D Wave Mesh`: Interactive perspective sine-wave wireframe mesh with camera mouse tilt.
     3. `Editorial Cover`: Centered luxury fashion/architectural image cover with high-contrast display typography, obsidian leather backdrop with ambient gold illumination, and gold pill CTA.
     4. `Apple Keynote`: Minimalist titanium device silhouette with specular rim highlight, clean headline, dual pill CTAs, and specs pill.
     5. `SaaS Cockpit`: Real-time order routing metrics, floating glass latency badges, live sparklines canvas, and command input.
     6. `Cyberpunk HUD`: Tactical scanline grid, monospace telemetry data stream, corner reticles, glowing status tags.
     7. `Swiss Typographic`: Massive grotesque type scale, marquee ticker tape, brutalist grid borders.
     8. `Luminous Fluid Aura`: Organic chromatic fluid orbs with blur filter and gentle ambient drift.
2. **Continuous Narrative Scroll Landing Page (`#view-apple-landing`)**:
   - Add a dedicated view in `apps/storybook-hub/src/navigation.manifest.json` under Enterprise & Telemetry.
   - **Sticky Sub-Navigation**: Model title ("iPhone Duo" / "Joymify Studio"), specs pill, and dual action buttons ("ดูข้อมูล" Overview, "ดูราคา" Buy).
   - **Scene 1 (The Monumental Intro)**: Bold Thai/EN headline ("ความอเนกประสงค์ / iOS ที่พลิกโฉมมาใหม่"), floating 3D hardware silhouette with specular rim lighting.
   - **Scene 2 (Interactive Posture & Fold Mechanics)**: Continuous scrub slider (`< >`) controlling 0°–180° CSS 3D folding angles, alongside interactive posture pills (`+ แนวนอน`, `+ แนวตั้ง`, `+ พับปิด`, `+ วางเปิด`, `+ กางตั้ง`, `+ ความทนทาน`).
   - **Scene 3 (Cinematic Ultra-Wide Display)**: Edge-to-edge widescreen cinema frame with ambient back-glow, dynamic aspect ratio switcher (16:9, 4:3, 21:9), and audio wave visualizer.
   - **Scene 4 (Bionic Silicon & Thermal Specs Bento)**: Micro-architecture chip visualization, titanium grade 5 chassis details, and real-time benchmark comparison bars.
   - **Scene 5 (Studio Customizer & Configuration Tray)**: Interactive finish customizer (Natural Titanium, Desert Titanium, Obsidian Navy, Liquid Silver), storage tier selector, trade-in calculator, and order CTA.

## Acceptance criteria
- [ ] Editorial Cover in `#view-landing-blocks` features a rich image cover backdrop, full vertical and horizontal centering, high-contrast serif typography, and gold pill CTA.
- [ ] Storybook Hub includes 8 distinct interactive hero section variants with a responsive segmented controller.
- [ ] Storybook Hub includes `#view-apple-landing` in `navigation.manifest.json` and renders the 5-scene continuous narrative scroll experience.
- [ ] Posture fold slider and pills in Scene 2 dynamically manipulate the 3D device fold angle from 0° to 180° with live degree readout.
- [ ] Zero OS emojis in code or UI (all icons use `@joymify/icons` SVGs).
- [ ] Zero hardcoded color literals outside `tokens.json` (`scripts/lint-colors.sh` exits 0).
- [ ] All workspace tests, Svelte/React parity checks, and Playwright quality contracts pass cleanly in Gate 1.
- [ ] Clean visual verification in both light and dark themes at 375px and 1280px.

