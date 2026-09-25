export interface BrandPalette {
  tile: string;
  mark: string;
  markOnTile: string;
  markContrast: string;
  ink: string;
  inkOnTile: string;
}

export interface MarkGeometry {
  viewBox: string;
  tileRx: number;
  outline: string;
  outlineWidth: number;
  inner: string;
  dot: { cx: number; cy: number; r: number };
}

export interface GlyphOutline {
  d: string;
  width: number;
  height: number;
  baseline: number;
}

export declare const MARK: MarkGeometry;
export declare const WORDMARK: GlyphOutline;
export declare const TAGLINE: GlyphOutline;

export declare function markSvg(options: {
  palette: BrandPalette;
  tile?: boolean;
  size?: number;
  title?: string;
}): string;

export declare function wordmarkSvg(options: {
  palette: BrandPalette;
  tone?: 'deep' | 'cream';
}): string;

export declare function ogCardSvg(options: { palette: BrandPalette }): string;

export declare function heroBannerSvg(options: { palette: BrandPalette }): string;

export interface LatticeCell {
  x: number;
  y: number;
  opacity: number;
}

export interface HeroLattice {
  width: number;
  height: number;
  cell: number;
  diamondScale: number;
  diamonds: LatticeCell[];
}

export declare function heroLattice(options?: {
  width?: number;
  height?: number;
  cell?: number;
  fadeStart?: number;
  maxOpacity?: number;
}): HeroLattice;

export interface WordmarkLayout {
  width: number;
  height: number;
  markX: number;
  markY: number;
  markSize: number;
  markCenterY: number;
  glyphX: number;
  glyphY: number;
  glyphScale: number;
  glyphWidth: number;
}

export declare function wordmarkLayout(options?: { height?: number; withMark?: boolean }): WordmarkLayout;
