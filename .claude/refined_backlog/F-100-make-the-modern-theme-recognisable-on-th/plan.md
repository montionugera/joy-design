# Make the modern theme recognisable on the design site — plan

One task, one file plus its test (spec.md has the design and the acceptance criteria):

1. Failing Playwright test in `apps/storybook-hub/tests/palette-switcher.spec.ts`: with `modern` picked, `.joy-hero` has a gradient background image, a seam and a diamond; with `classic` it has none; Modern's picker dots differ from Classic's.
2. CSS in `apps/storybook-hub/build.js` under `[data-palette="modern"]`; picker row dots near the `data-palette="modern"` item.
3. Screenshots (phone, desktop; light, dark) next to the specimen; independent design check; Gate 1.
