<script lang="ts">
  import './mascot.css';
  import { clampGlow, clampSize, initialOf, resolveMascot } from './data.js';
  import { ASSETS } from './assets.js';

  let {
    name = 'yoji',
    pose = 'idle',
    size = 96,
    label,
    glow = 0,
    eager = false,
  }: { name?: string; pose?: string; size?: number; label?: string; glow?: number; eager?: boolean } = $props();

  const r = $derived(resolveMascot(name, pose));
  const px = $derived(clampSize(size));
  const g = $derived(clampGlow(glow));
  const src = $derived(ASSETS[`${r.id}-${r.pose}`]);
  const src2 = $derived(ASSETS[`${r.id}-${r.pose}@2x`]);
  let failedSrc = $state('');
  const failed = $derived(failedSrc === src);
</script>

{#if failed}
  <span
    class="joy-mascot joy-mascot--fallback"
    data-joy-mascot={r.id}
    data-pose={r.pose}
    style="width:{px}px;height:{px}px;--joy-mascot-glow:{g}"
    role={label ? 'img' : undefined}
    aria-label={label || undefined}
    aria-hidden={label ? undefined : 'true'}>{initialOf(r.id)}</span
  >
{:else}
  <img
    class="joy-mascot"
    data-joy-mascot={r.id}
    data-pose={r.pose}
    {src}
    srcset="{src} 1x, {src2} 2x"
    width={px}
    height={px}
    alt={label ?? ''}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    style="--joy-mascot-glow:{g}"
    onerror={() => (failedSrc = src)}
  />
{/if}
