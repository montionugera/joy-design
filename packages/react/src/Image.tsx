import * as React from 'react';
import { ImagePreview } from './ImagePreview.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  preview?: boolean | { src?: string; mask?: React.ReactNode };
  fallback?: string;
}

/**
 * `ref` points at the wrapper (`.joy-image-wrapper`) and `className`/`style` style it; the remaining props
 * (`...rest`) go on the `<img>`, like the Svelte twin. Clicking (or Enter/Space on) a previewable image
 * opens `ImagePreview`.
 */
export const Image = React.forwardRef<HTMLDivElement, ImageProps>(
  (
    { src, alt = '', preview = true, fallback, className = '', style, onError, ...rest },
    ref
  ) => {
    const [openPreview, setOpenPreview] = React.useState(false);
    const [imgSrc, setImgSrc] = React.useState(src);
    const [isHovered, setIsHovered] = React.useState(false);

    React.useEffect(() => {
      setImgSrc(src);
    }, [src]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      onError?.(e);
      if (fallback) setImgSrc(fallback);
    };

    const previewSrc = typeof preview === 'object' && preview.src ? preview.src : imgSrc;

    return (
      <>
        <div
          ref={ref}
          className={cx('joy-image-wrapper', className, preview && 'joy-image-wrapper--previewable')}
          style={style}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            if (preview) setOpenPreview(true);
          }}
          role={preview ? 'button' : undefined}
          tabIndex={preview ? 0 : undefined}
          onKeyDown={(e) => {
            if (preview && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setOpenPreview(true);
            }
          }}
        >
          <img {...rest} src={imgSrc} alt={alt} onError={handleError} className="joy-image__img" />

          {preview && isHovered && (
            <div className="joy-image__overlay">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Preview</span>
            </div>
          )}
        </div>

        {preview && <ImagePreview open={openPreview} src={previewSrc} onClose={() => setOpenPreview(false)} />}
      </>
    );
  }
);

Image.displayName = 'Image';
