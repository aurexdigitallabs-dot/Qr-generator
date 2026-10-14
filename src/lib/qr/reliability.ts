import { QRDesignSettings, ReliabilityReport } from '@/types/qr';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function evaluateScanReliability(
  encodedPayload: string,
  design: QRDesignSettings
): ReliabilityReport {
  const recommendations: string[] = [];
  let score = 100;

  const fgColor = design.dotsColor || '#0F172A';
  const bgColor = design.backgroundTransparent ? '#FFFFFF' : design.backgroundColor || '#FFFFFF';

  const contrast = calculateContrastRatio(fgColor, bgColor);
  const rgbFg = hexToRgb(fgColor);
  const rgbBg = hexToRgb(bgColor);

  const lumFg = rgbFg ? getLuminance(rgbFg.r, rgbFg.g, rgbFg.b) : 0;
  const lumBg = rgbBg ? getLuminance(rgbBg.r, rgbBg.g, rgbBg.b) : 1;
  const isInverted = lumFg > lumBg;

  // 1. Contrast evaluation
  const isContrastSufficient = contrast >= 4.0;
  if (contrast < 2.5) {
    score -= 40;
    recommendations.push(
      `Critically low contrast (${contrast.toFixed(1)}:1). Smartphone cameras will fail to distinguish QR dots.`
    );
  } else if (contrast < 4.5) {
    score -= 20;
    recommendations.push(
      `Moderate contrast (${contrast.toFixed(1)}:1). Increase foreground/background darkness contrast for faster scanning.`
    );
  }

  // 2. Inverted QR evaluation
  if (isInverted) {
    score -= 10;
    recommendations.push(
      'Light foreground on dark background detected. Modern smartphone cameras support this, but older industrial barcode scanners may require dark-on-light.'
    );
  }

  // 3. Logo & Error Correction check
  const hasLogo = Boolean(design.logo?.dataUrl || design.logo?.rawImageUrl);
  let isLogoSafe = true;

  if (hasLogo) {
    if (design.errorCorrectionLevel === 'L') {
      score -= 30;
      isLogoSafe = false;
      recommendations.push(
        'Logo embedded with Low error correction (7%). Switch Error Correction to "H" (30%) or "Q" (25%) so the code can recover masked data.'
      );
    } else if (design.errorCorrectionLevel === 'M') {
      score -= 10;
      recommendations.push(
        'Medium error correction (15%) is acceptable, but "H" (30%) is strongly recommended when using a center logo.'
      );
    }

    if (design.logo.sizeRatio > 0.32) {
      score -= 15;
      isLogoSafe = false;
      recommendations.push(
        `Logo size (${Math.round(design.logo.sizeRatio * 100)}%) is large. Keep logo under 30% to prevent covering QR position landmarks.`
      );
    }
  }

  // 4. Content payload density check
  const payloadLength = encodedPayload.length;
  if (payloadLength > 400) {
    score -= 15;
    recommendations.push(
      `High data density (${payloadLength} characters). Use a shorter URL or concise text to ensure high scan speed at greater distances.`
    );
  } else if (payloadLength > 200) {
    score -= 5;
  }

  // 5. Margin / Quiet zone check
  if (design.margin < 5) {
    score -= 5;
    recommendations.push(
      'Quiet zone margin is tight. Keeping at least 10px margin prevents camera confusion from adjacent borders.'
    );
  }

  score = Math.max(10, Math.min(100, score));

  let level: ReliabilityReport['level'] = 'excellent';
  if (score < 50) level = 'critical';
  else if (score < 75) level = 'caution';
  else if (score < 90) level = 'good';

  if (recommendations.length === 0) {
    recommendations.push('High contrast and optimal error correction. Ready for instant camera scanning.');
  }

  return {
    score,
    level,
    contrastRatio: Number(contrast.toFixed(1)),
    isContrastSufficient,
    isInverted,
    isLogoSafe,
    recommendations,
  };
}
