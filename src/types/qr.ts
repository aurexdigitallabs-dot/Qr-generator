export type QRContentType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'wifi'
  | 'vcard'
  | 'instagram'
  | 'youtube'
  | 'maps'
  | 'sms';

export type DotType =
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'classy-rounded'
  | 'square'
  | 'extra-rounded';

export type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
export type CornerDotType = 'dot' | 'square';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type ExportFormat = 'png' | 'svg';
export type ExportResolution = 512 | 1024 | 2048;

export type LogoBadgeShape = 'circle' | 'rounded' | 'square' | 'transparent';

export interface LogoSettings {
  dataUrl?: string; // Processed dataUrl ready for QR code
  rawImageUrl?: string; // Original uploaded dataUrl
  fileName?: string;
  sizeRatio: number; // 0.15 - 0.35 (default: 0.25)
  margin: number; // 0 - 15 (default: 4)
  badgeShape: LogoBadgeShape;
  badgeColor: string; // default: '#ffffff'
  hasBorder: boolean;
  borderColor: string;
}

export interface QRDesignSettings {
  dotsType: DotType;
  dotsColor: string;
  dotsGradientEnabled: boolean;
  dotsGradientType: 'linear' | 'radial';
  dotsGradientColor: string;
  dotsGradientRotation: number;
  cornersSquareType: CornerSquareType;
  cornersSquareColor: string;
  cornersDotType: CornerDotType;
  cornersDotColor: string;
  backgroundColor: string;
  backgroundTransparent: boolean;
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logo: LogoSettings;
}

export interface SavedQRCode {
  id: string;
  userId?: string;
  name: string;
  type: QRContentType;
  contentData: Record<string, any>;
  encodedString: string;
  design: QRDesignSettings;
  createdAt: number;
  updatedAt: number;
}

export interface ReliabilityReport {
  score: number; // 0 - 100
  level: 'excellent' | 'good' | 'caution' | 'critical';
  contrastRatio: number;
  isContrastSufficient: boolean;
  isInverted: boolean;
  isLogoSafe: boolean;
  recommendations: string[];
}

export interface QRDownloadHistoryItem {
  id: string;
  userId: string;
  name: string;
  type: QRContentType;
  contentData: Record<string, any>;
  encodedString: string;
  format: ExportFormat;
  resolution: ExportResolution;
  design: QRDesignSettings;
  logoUrl?: string;
  downloadedAt: number;
}

