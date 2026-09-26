# F-040 acceptance screenshots

Viewport-sized captures of the Storybook hub after Wave 5, with reduced motion so the kinetic field stands still. Regenerate from `apps/storybook-hub`:

```bash
node apps/storybook-hub/build.js   # from the repo root, then cd apps/storybook-hub
F040_SCREENS=1 PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/screens-f040.spec.ts --project=desktop-chrome
```

The full per-view matrix (38 views x 375/1280 x light/dark) is written by Contract 6 to `apps/storybook-hub/test-results/` (gitignored).

| File | View | Theme | Width |
| --- | --- | --- | --- |
| `landing-light-375.png` | #overview | light | 375px |
| `landing-dark-375.png` | #overview | dark | 375px |
| `landing-light-1280.png` | #overview | light | 1280px |
| `landing-dark-1280.png` | #overview | dark | 1280px |
| `primitives-light-375.png` | #primitives | light | 375px |
| `primitives-dark-375.png` | #primitives | dark | 375px |
| `primitives-light-1280.png` | #primitives | light | 1280px |
| `primitives-dark-1280.png` | #primitives | dark | 1280px |
| `forms-light-375.png` | #forms | light | 375px |
| `forms-dark-375.png` | #forms | dark | 375px |
| `forms-light-1280.png` | #forms | light | 1280px |
| `forms-dark-1280.png` | #forms | dark | 1280px |
| `data-display-light-375.png` | #data-display-feedback | light | 375px |
| `data-display-dark-375.png` | #data-display-feedback | dark | 375px |
| `data-display-light-1280.png` | #data-display-feedback | light | 1280px |
| `data-display-dark-1280.png` | #data-display-feedback | dark | 1280px |
