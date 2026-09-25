// Canonical Joymify brand geometry. The mark shape (viewBox, tile radius,
// outline diamond, inner diamond, centre dot) is a fixed literal per the
// F-043 Global Constraints (sourced from user-fe's favicon.svg). The
// wordmark and tagline outlines are generated from the display font — see
// outlines.generated.js (do not edit that file by hand).

export const MARK = {
  viewBox: '0 0 32 32',
  tileRx: 6,
  outline: 'M16 4 28 16 16 28 4 16Z',
  outlineWidth: 1.6,
  inner: 'M16 9 23 16 16 23 9 16Z',
  dot: { cx: 16, cy: 16, r: 1.6 }
};

export { WORDMARK, TAGLINE } from './outlines.generated.js';
