import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { MascotProps } from '../../src/data.js';
import { assetUrl, clampGlow, clampSize, initialOf, resolveMascot } from '../../src/data.js';

export type { MascotProps };

export function Mascot({ name = 'yoji', pose = 'idle', size = 96, label, glow = 0, eager = false }: MascotProps) {
  const r = resolveMascot(name, pose);
  const px = clampSize(size);
  const g = clampGlow(glow);
  const src = assetUrl(r.id, r.pose, 1);
  const src2 = assetUrl(r.id, r.pose, 2);
  const [failedSrc, setFailedSrc] = useState('');

  if (failedSrc === src) {
    const style = { width: px, height: px, '--joy-mascot-glow': g } as CSSProperties;
    return (
      <span
        className={g > 0 ? 'joy-mascot joy-mascot--fallback joy-mascot--glow' : 'joy-mascot joy-mascot--fallback'}
        data-joy-mascot={r.id}
        data-pose={r.pose}
        style={style}
        role={label ? 'img' : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
      >
        {initialOf(r.id)}
      </span>
    );
  }
  const style = { '--joy-mascot-glow': g } as CSSProperties;
  return (
    <img
      className={g > 0 ? 'joy-mascot joy-mascot--glow' : 'joy-mascot'}
      data-joy-mascot={r.id}
      data-pose={r.pose}
      src={src}
      srcSet={`${src} 1x, ${src2} 2x`}
      width={px}
      height={px}
      alt={label ?? ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={style}
      onError={() => setFailedSrc(src)}
    />
  );
}
