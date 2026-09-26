<script lang="ts">
  // A small label badge. The `corner` variant is absolutely positioned and rotated, so its parent
  // must set `position: relative; overflow: hidden` for the band to clip to the parent's box.
  interface Props {
    label: string;
    variant?: 'corner' | 'inline';
    tone?: 'gold' | 'navy';
    decorative?: boolean;
    class?: string;
  }

  let { label, variant = 'inline', tone = 'gold', decorative = false, class: className = '' }: Props = $props();
</script>

<span class="joy-ribbon joy-ribbon--{variant} joy-ribbon--{tone} {className}" aria-hidden={decorative ? 'true' : undefined}>{label}</span>
