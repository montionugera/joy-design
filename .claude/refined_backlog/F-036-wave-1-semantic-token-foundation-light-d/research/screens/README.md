# F-036 Wave 1 screenshot evidence

Generated from the built Storybook Hub's verified `#primitives` view with the
document theme set through `data-theme`. Screenshots are viewport captures, not
component crops, so they retain the portal navigation and primary actions.

| Screenshot                      | Purple remaining | Dark borders                                   | Black shadow halos | Brand-gold primary action        | Verdict |
| ------------------------------- | ---------------- | ---------------------------------------------- | ------------------ | -------------------------------- | ------- |
| `primitives-light-375x812.png`  | None             | N/A                                            | N/A                | Visible `Deposit` action is gold | Pass    |
| `primitives-dark-375x812.png`   | None             | Card, splitter, and action borders are visible | None               | Visible `Deposit` action is gold | Pass    |
| `primitives-light-1280x800.png` | None             | N/A                                            | N/A                | Visible `Deposit` action is gold | Pass    |
| `primitives-dark-1280x800.png`  | None             | Card, splitter, and action borders are visible | None               | Visible `Deposit` action is gold | Pass    |

The inspected dark screenshots use navy-tinted card surfaces and show no black
shadow halo around the cards. At 375px, the existing portal topbar still clips
some framework controls at the far right; that responsive-layout issue is not
part of this Phase C color-gate change.

Regenerate with:

```bash
PLAYWRIGHT_PORT=6007 F036_SCREENS=1 pnpm --filter storybook-hub exec playwright test tests/screens-f036.spec.ts --project=desktop-chrome
```
