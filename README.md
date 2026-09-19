# Joymify Design System (`joy-design`)

Enterprise multi-platform design system and composed Storybook workshop powering the Joymify ecosystem:
- **Quant** (`quant-fe`, `quant-admin-fe`): Svelte 5 + SvelteKit high-density trading UI
- **JoyCoach** (`joy-coach-fe`): Svelte 5 coaching and scoring UI
- **AssetStudio** (`asset-studio`): React 19 visual generation & inspection suite
- **JoyQuest / Portal** (`joymify-portal`): Svelte 5 & React 19 interactive platform

## Architecture
- `packages/tokens`: Style Dictionary W3C design tokens compiled to CSS variables and Tailwind v4 themes.
- `packages/svelte`: Native Svelte 5 components built with Runes (`$props`, `$state`, `$derived`).
- `packages/react`: Accessible React 19 components with full TypeScript support and token bindings.
- `apps/storybook-hub`: Unified Storybook Composition Hub referencing both Svelte (port 6006) and React (port 6007).
