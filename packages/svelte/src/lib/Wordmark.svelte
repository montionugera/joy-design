<script lang="ts">
  import { MARK, WORDMARK } from '@joymify/brand';

  // The "Joymify" outlined wordmark, optionally paired with the bare diamond mark. Geometry comes
  // from @joymify/brand; colours are `--joy-brand-*` custom properties chosen by `tone` so the
  // lockup stays correct on both a light canvas (deep) and a brand tile background (cream) — the
  // component itself never paints a background, the consumer supplies the tile.
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

  // The mark (when shown) fills the full lockup height; the glyph outline is scaled to 70% of it
  // and vertically centred on whichever box currently owns the centreline (the mark's box when
  // shown, the full lockup otherwise).
  const markSize = $derived(withMark ? lockupHeight : 0);
  const gap = $derived(withMark ? round2(lockupHeight * 0.3) : 0);
  const markY = $derived(round2((lockupHeight - markSize) / 2));
  const markCenterY = $derived(markY + markSize / 2);

  const scale = $derived(round2((lockupHeight * 0.7) / WORDMARK.baseline));
  const wmWidth = $derived(round2(WORDMARK.width * scale));
  const wordmarkX = $derived(round2(markSize + gap));
  const wordmarkY = $derived(round2(markCenterY + scale * (WORDMARK.baseline - WORDMARK.height / 2)));
  const totalWidth = $derived(round2(wordmarkX + wmWidth));
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox={`0 0 ${totalWidth} ${lockupHeight}`}
  width={totalWidth}
  height={lockupHeight}
  class="joy-wordmark {className}"
  role="img"
  aria-label={title}
>
  <title>{title}</title>
  {#if withMark}
    <g transform={`translate(0 ${markY}) scale(${round2(markSize / 32)})`}>
      <path d={MARK.outline} fill="none" stroke={markColor} stroke-width={MARK.outlineWidth} />
      <path d={MARK.inner} fill={markColor} />
    </g>
  {/if}
  <path d={WORDMARK.d} fill={glyphColor} transform={`translate(${wordmarkX} ${wordmarkY}) scale(${scale})`} />
</svg>
