# F-044 plan
1. Write failing Playwright spec `apps/storybook-hub/tests/nav-keyboard.spec.ts` (href/data-view contract, click, Tab+Enter, drawer trap).
2. `navigationHtml`: render `href="#<id>" data-view="<id>"`, drop `onclick`; `switchView` marks active by `data-view` and sets `aria-current="page"`.
3. Gate: rebuild, run spec, run `scripts/precheck.sh`; independent review; refactor; re-verify.
