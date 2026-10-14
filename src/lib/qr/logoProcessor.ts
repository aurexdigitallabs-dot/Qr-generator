import { LogoBadgeShape } from '@/types/qr';

export const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_LOGO_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
];

export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a PNG, JPG, WebP, or SVG file.',
    };
  }

  if (file.size > MAX_LOGO_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 2MB.`,
    };
  }

  return { valid: true };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

interface ProcessBadgeOptions {
  shape: LogoBadgeShape;
  badgeColor: string;
  hasBorder: boolean;
  borderColor: string;
}

/**
 * Renders the logo onto a square badge canvas preserving the exact aspect ratio,
 * preventing stretching or distorting, and applying the requested container shape.
 */
export async function processLogoBadge(
  rawImageUrl: string,
  options: ProcessBadgeOptions
): Promise<string> {
  if (typeof window === 'undefined') return rawImageUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(rawImageUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const { shape, badgeColor, hasBorder, borderColor } = options;

      // Draw container if not transparent
      if (shape !== 'transparent') {
        ctx.fillStyle = badgeColor || '#FFFFFF';

        if (shape === 'circle') {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();

          if (hasBorder) {
            ctx.strokeStyle = borderColor || '#E2E8F0';
            ctx.lineWidth = 14;
            ctx.stroke();
          }
        } else if (shape === 'rounded') {
          const radius = size * 0.22; // ~112px
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, radius);
          ctx.closePath();
          ctx.fill();

          if (hasBorder) {
            ctx.strokeStyle = borderColor || '#E2E8F0';
            ctx.lineWidth = 14;
            ctx.stroke();
          }
        } else if (shape === 'square') {
          ctx.beginPath();
          ctx.rect(0, 0, size, size);
          ctx.closePath();
          ctx.fill();

          if (hasBorder) {
            ctx.strokeStyle = borderColor || '#E2E8F0';
            ctx.lineWidth = 14;
            ctx.stroke();
          }
        }
      }

      // Calculate inner dimensions to keep safe padding from badge boundary
      const innerPadding = shape === 'transparent' ? 0 : size * 0.16;
      const maxWidth = size - innerPadding * 2;
      const maxHeight = size - innerPadding * 2;

      // Fit aspect ratio without stretching
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      const imgAspect = imgWidth / imgHeight;

      let drawW = maxWidth;
      let drawH = drawW / imgAspect;

      if (drawH > maxHeight) {
        drawH = maxHeight;
        drawW = drawH * imgAspect;
      }

      const drawX = (size - drawW) / 2;
      const drawY = (size - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      resolve(rawImageUrl);
    };

    img.src = rawImageUrl;
  });
}
