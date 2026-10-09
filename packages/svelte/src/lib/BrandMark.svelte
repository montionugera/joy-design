<script lang="ts">
  import { MARK } from '@montionugera/joy-brand';

  // The Joymify diamond mark. Geometry comes from @montionugera/joy-brand (never copy the paths); every
  // colour is a `--joy-brand-*` custom property so the mark stays correct across light/dark themes,
  // unlike the static assets in @montionugera/joy-brand which bake in resolved hex values.
  interface Props {
    size?: number;
    variant?: 'tile' | 'bare';
    title?: string;
    class?: string;
  }

  let { size = 32, variant = 'tile', title, class: className = '' }: Props = $props();

  const px = $derived(Number.isFinite(size) && size > 0 ? size : 32);
  const isTile = $derived(variant === 'tile');
  const strokeColor = $derived(isTile ? 'var(--joy-brand-mark-on-tile)' : 'var(--joy-brand-mark)');
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox={MARK.viewBox}
  width={px}
  height={px}
  class="joy-brand-mark {className}"
  role={title ? 'img' : undefined}
  aria-label={title || undefined}
  aria-hidden={title ? undefined : 'true'}
  focusable={title ? undefined : 'false'}
>
  {#if title}<title>{title}</title>{/if}
  {#if isTile}
    <rect width="32" height="32" rx={MARK.tileRx} fill="var(--joy-brand-tile)" />
  {/if}
  <path d={MARK.outline} fill="none" stroke={strokeColor} stroke-width={MARK.outlineWidth} />
  <path d={MARK.inner} fill={strokeColor} />
  {#if isTile}
    <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill="var(--joy-brand-mark-contrast)" />
  {/if}
</svg>
