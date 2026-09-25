<script lang="ts">
  import { MARK, WORDMARK, wordmarkLayout } from '@joymify/brand';

  // The "Joymify" outlined wordmark, optionally paired with the bare diamond mark. Geometry AND
  // layout (the mark/gap/glyph proportions) come from @joymify/brand's `wordmarkLayout` — the same
  // helper the canonical wordmark-*.svg asset is built from (packages/brand/src/render.js), so this
  // component can never drift from the shipped asset the way a copied implementation once did.
  // Colours are `--joy-brand-*` custom properties chosen by `tone` so the lockup stays correct on
  // both a light canvas (deep) and a brand tile background (cream) — the component itself never
  // paints a background, the consumer supplies the tile.
  interface Props {
    tone?: 'deep' | 'cream';
    height?: number;
    withMark?: boolean;
    title?: string;
    class?: string;
  }

  let { tone = 'deep', height = 32, withMark = true, title = 'Joymify', class: className = '' }: Props = $props();

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const lockupHeight = $derived(Number.isFinite(height) && height > 0 ? height : 32);
  const isCream = $derived(tone === 'cream');
  const glyphColor = $derived(isCream ? 'var(--joy-brand-ink-on-tile)' : 'var(--joy-brand-ink)');
  const markColor = $derived(isCream ? 'var(--joy-brand-mark-on-tile)' : 'var(--joy-brand-mark)');

  // padding: 0 — no outer whitespace, unlike the downloadable asset, so the mark fills the full
  // component height (markSize === height).
  const layout = $derived(wordmarkLayout({ height: lockupHeight, withMark, padding: 0 }));
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox={`0 0 ${layout.width} ${lockupHeight}`}
  width={layout.width}
  height={lockupHeight}
  class="joy-wordmark {className}"
  role="img"
  aria-label={title}
>
  <title>{title}</title>
  {#if withMark}
    <g transform={`translate(${layout.markX} ${layout.markY}) scale(${round2(layout.markSize / 32)})`}>
      <path d={MARK.outline} fill="none" stroke={markColor} stroke-width={MARK.outlineWidth} />
      <path d={MARK.inner} fill={markColor} />
    </g>
  {/if}
  <path d={WORDMARK.d} fill={glyphColor} transform={`translate(${layout.glyphX} ${layout.glyphY}) scale(${layout.glyphScale})`} />
</svg>
