'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { QRDesignSettings, ExportFormat, ExportResolution, ReliabilityReport } from '@/types/qr';
import { evaluateScanReliability } from '@/lib/qr/reliability';
import { ScanReliabilityMeter } from './ScanReliabilityMeter';
import { Smartphone, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QRDownloadResult {
  success: boolean;
  isMobile: boolean;
  sharedViaWebShare: boolean;
  dataUrl: string;
  blob: Blob;
  fileName: string;
  format: ExportFormat;
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isIPadOS = navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua);
  const isTouchScreen = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024;
  return isMobileUA || isIPadOS || isTouchScreen;
}

export interface QRPreviewRef {
  downloadQR: (format: ExportFormat, resolution: ExportResolution, fileName: string) => Promise<QRDownloadResult>;
  copyToClipboard: () => Promise<void>;
}

interface QRPreviewProps {
  payload: string;
  hasValidPayload: boolean;
  design: QRDesignSettings;
  typeName: string;
}

/**
 * Continuous logo scaling extension:
 * Directly sizes and centers the SVG <image> element so that the logo scales smoothly
 * and continuously with the slider at any resolution, without discrete step clamping.
 */
function applyLogoScaling(svg: SVGElement, options: any, scaleRatio: number) {
  if (!svg || !options || !svg.querySelector) return;
  const imageEl = svg.querySelector('image');
  if (!imageEl) return;

  const qrDim = options.width || 300;
  const targetDim = Math.round(qrDim * scaleRatio);
  const targetX = Math.round((qrDim - targetDim) / 2);
  const targetY = Math.round((qrDim - targetDim) / 2);

  imageEl.setAttribute('x', String(targetX));
  imageEl.setAttribute('y', String(targetY));
  imageEl.setAttribute('width', `${targetDim}px`);
  imageEl.setAttribute('height', `${targetDim}px`);
}

export const QRPreview = forwardRef<QRPreviewRef, QRPreviewProps>(function QRPreview(
  { payload, hasValidPayload, design, typeName },
  ref
) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const canvasQRRef = useRef<any>(null);
  const phoneQRRef = useRef<any>(null);

  const [viewMode, setViewMode] = useState<'canvas' | 'phone'>('canvas');
  const [, setIsRendering] = useState(false);

  // Compute live scan reliability
  const reliabilityReport: ReliabilityReport = evaluateScanReliability(payload, design);

  // Setup QRCodeStyling options
  const buildQROptions = (resolution = 320) => {
    const dotsOptions: any = {
      type: design.dotsType,
      color: design.dotsColor,
    };

    if (design.dotsGradientEnabled) {
      dotsOptions.gradient = {
        type: design.dotsGradientType,
        rotation: (design.dotsGradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: design.dotsColor },
          { offset: 1, color: design.dotsGradientColor },
        ],
      };
    }

    const backgroundOptions: any = {
      color: design.backgroundTransparent ? 'transparent' : design.backgroundColor,
    };

    // Calculate mappedImageSize to clear the right number of dots in qr-code-styling's grid
    const targetScale = design.logo.sizeRatio || 0.25;
    const mappedImageSize = Math.min(1.0, Math.pow(targetScale * 1.08, 2) / 0.3);

    const imageOptions: any = {
      hideBackgroundDots: true,
      imageSize: mappedImageSize,
      margin: design.logo.margin || 4,
      crossOrigin: 'anonymous',
    };

    return {
      width: resolution,
      height: resolution,
      type: 'canvas' as const,
      data: payload || 'https://google.com',
      image: design.logo.dataUrl || undefined,
      margin: design.margin,
      qrOptions: {
        errorCorrectionLevel: design.logo.dataUrl ? 'H' : design.errorCorrectionLevel,
      },
      imageOptions,
      dotsOptions,
      cornersSquareOptions: {
        type: design.cornersSquareType,
        color: design.cornersSquareColor || design.dotsColor,
      },
      cornersDotOptions: {
        type: design.cornersDotType,
        color: design.cornersDotColor || design.dotsColor,
      },
      backgroundOptions,
    };
  };

  // Mount & Update both Canvas and Phone QR previews simultaneously
  useEffect(() => {
    let isMounted = true;

    async function initQR() {
      if (typeof window === 'undefined') return;
      setIsRendering(true);

      try {
        const QRCodeStyling = (await import('qr-code-styling')).default;

        if (!isMounted) return;

        const logoScale = design.logo.sizeRatio || 0.25;
        const hasLogo = Boolean(design.logo.dataUrl);

        // Render Canvas view
        if (canvasContainerRef.current) {
          const canvasOptions = buildQROptions(300);
          if (!canvasQRRef.current || !canvasContainerRef.current.children.length) {
            canvasContainerRef.current.innerHTML = '';
            canvasQRRef.current = new QRCodeStyling(canvasOptions);
            if (hasLogo) {
              (canvasQRRef.current as any)._extension = (svg: SVGElement, opts: any) => {
                applyLogoScaling(svg, opts, logoScale);
              };
              canvasQRRef.current.update(canvasOptions);
            }
            canvasQRRef.current.append(canvasContainerRef.current);
          } else {
            if (hasLogo) {
              (canvasQRRef.current as any)._extension = (svg: SVGElement, opts: any) => {
                applyLogoScaling(svg, opts, logoScale);
              };
            } else {
              (canvasQRRef.current as any)._extension = undefined;
            }
            canvasQRRef.current.update(canvasOptions);
          }
        }

        // Render Phone view
        if (phoneContainerRef.current) {
          const phoneOptions = buildQROptions(220);
          if (!phoneQRRef.current || !phoneContainerRef.current.children.length) {
            phoneContainerRef.current.innerHTML = '';
            phoneQRRef.current = new QRCodeStyling(phoneOptions);
            if (hasLogo) {
              (phoneQRRef.current as any)._extension = (svg: SVGElement, opts: any) => {
                applyLogoScaling(svg, opts, logoScale);
              };
              phoneQRRef.current.update(phoneOptions);
            }
            phoneQRRef.current.append(phoneContainerRef.current);
          } else {
            if (hasLogo) {
              (phoneQRRef.current as any)._extension = (svg: SVGElement, opts: any) => {
                applyLogoScaling(svg, opts, logoScale);
              };
            } else {
              (phoneQRRef.current as any)._extension = undefined;
            }
            phoneQRRef.current.update(phoneOptions);
          }
        }
      } catch (err) {
        console.error('Error generating QR code preview:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    }

    initQR();

    return () => {
      isMounted = false;
    };
  }, [
    payload,
    design.dotsType,
    design.dotsColor,
    design.dotsGradientEnabled,
    design.dotsGradientType,
    design.dotsGradientColor,
    design.dotsGradientRotation,
    design.cornersSquareType,
    design.cornersSquareColor,
    design.cornersDotType,
    design.cornersDotColor,
    design.backgroundColor,
    design.backgroundTransparent,
    design.margin,
    design.errorCorrectionLevel,
    design.logo.dataUrl,
    design.logo.sizeRatio,
    design.logo.margin,
  ]);

  // Expose download and clipboard actions via ref
  useImperativeHandle(ref, () => ({
    async downloadQR(format: ExportFormat, resolution: ExportResolution, fileName: string): Promise<QRDownloadResult> {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available during server-side execution.');
      }
      if (!hasValidPayload || !payload) {
        throw new Error('Please enter valid content before downloading.');
      }

      // Sanitize filename and enforce the extension
      const baseName = (fileName || 'brand-qrcode')
        .trim()
        .replace(/\.[^/.]+$/, '')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
      const safeName = baseName || 'brand-qrcode';
      const fullFileName = `${safeName}.${format}`;

      const QRCodeStyling = (await import('qr-code-styling')).default;

      // Build dedicated instance at the target resolution
      const exportOptions = {
        ...buildQROptions(resolution),
        data: payload,
        type: (format === 'svg' ? 'svg' : 'canvas') as 'svg' | 'canvas',
      };

      const exportInstance = new QRCodeStyling(exportOptions);
      if (design.logo.dataUrl) {
        (exportInstance as any)._extension = (svg: SVGElement, opts: any) => {
          applyLogoScaling(svg, opts, design.logo.sizeRatio || 0.25);
        };
        exportInstance.update(exportOptions);
      }

      let finalBlob: Blob | null = null;

      try {
        const rawBlob = await exportInstance.getRawData(format);
        if (rawBlob instanceof Blob) {
          finalBlob = rawBlob;
        } else if (rawBlob) {
          finalBlob = new Blob([new Uint8Array(rawBlob as any)], {
            type: format === 'svg' ? 'image/svg+xml' : 'image/png',
          });
        }
      } catch (err) {
        console.warn('exportInstance.getRawData failed, trying element extraction fallback:', err);
      }

      // Fallback 1: Extract element from exportInstance
      if (!finalBlob) {
        try {
          const el = await (exportInstance as any)._getElement(format);
          if (el) {
            if (format === 'svg') {
              const svgString = new XMLSerializer().serializeToString(el);
              finalBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            } else if ('toBlob' in el) {
              finalBlob = await new Promise<Blob | null>((resolve) => {
                (el as HTMLCanvasElement).toBlob((b) => resolve(b), 'image/png', 1.0);
              });
            }
          }
        } catch (elErr) {
          console.warn('Element extraction fallback failed:', elErr);
        }
      }

      // Fallback 2: Active on-screen canvas/SVG clone
      if (!finalBlob) {
        try {
          if (format === 'svg') {
            const svgNode = canvasContainerRef.current?.querySelector('svg');
            if (svgNode) {
              const svgString = new XMLSerializer().serializeToString(svgNode);
              finalBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            }
          } else {
            const canvasNode = canvasContainerRef.current?.querySelector('canvas');
            if (canvasNode) {
              const offCanvas = document.createElement('canvas');
              offCanvas.width = resolution;
              offCanvas.height = resolution;
              const ctx = offCanvas.getContext('2d');
              if (ctx) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(canvasNode, 0, 0, resolution, resolution);
                finalBlob = await new Promise<Blob | null>((resolve) => {
                  offCanvas.toBlob((b) => resolve(b), 'image/png', 1.0);
                });
              }
            }
          }
        } catch (canvasErr) {
          console.warn('Canvas clone fallback failed:', canvasErr);
        }
      }

      if (!finalBlob) {
        throw new Error('Unable to render QR code image data for download.');
      }

      // Convert Blob to Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert QR code blob to data URL'));
          }
        };
        reader.onerror = () => reject(reader.error || new Error('FileReader error'));
        reader.readAsDataURL(finalBlob!);
      });

      console.log('[BrandQR] Binary blob generated:', {
        bytes: finalBlob.size,
        type: finalBlob.type,
        targetFileName: fullFileName
      });

      const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/png';
      const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

      // Preferred standard browser download: Direct invisible anchor download with Blob URL
      try {
        const objectUrl = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = objectUrl;
        link.download = fullFileName;
        link.setAttribute('target', '_self');
        link.rel = 'noopener';

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
          URL.revokeObjectURL(objectUrl);
        }, 1500);

        if (!isIOS) {
          return {
            success: true,
            isMobile: isMobileDevice(),
            sharedViaWebShare: false,
            dataUrl,
            blob: finalBlob,
            fileName: fullFileName,
            format,
          };
        }
      } catch (blobDownloadErr) {
        console.warn('[BrandQR] Direct blob URL download failed, falling back to stream endpoint:', blobDownloadErr);
      }

      // Server Stream Fallback with Content-Disposition attachment headers
      try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/download-stream';
        form.style.display = 'none';
        form.target = '_self';

        const fileInput = document.createElement('input');
        fileInput.type = 'hidden';
        fileInput.name = 'fileName';
        fileInput.value = fullFileName;
        form.appendChild(fileInput);

        const mimeInput = document.createElement('input');
        mimeInput.type = 'hidden';
        mimeInput.name = 'mimeType';
        mimeInput.value = mimeType;
        form.appendChild(mimeInput);

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'dataUrl';
        dataInput.value = dataUrl;
        form.appendChild(dataInput);

        document.body.appendChild(form);
        form.submit();

        setTimeout(() => {
          if (form.parentNode) {
            form.parentNode.removeChild(form);
          }
        }, 2000);
      } catch (formErr) {
        console.warn('[BrandQR] Form stream failed, falling back to FileSaver:', formErr);
        const { saveAs } = await import('file-saver');
        saveAs(finalBlob, fullFileName);
      }

      return {
        success: true,
        isMobile: isMobileDevice(),
        sharedViaWebShare: false,
        dataUrl,
        blob: finalBlob,
        fileName: fullFileName,
        format,
      };
    },

    async copyToClipboard() {
      if (typeof window === 'undefined') return;
      if (!hasValidPayload || !payload) {
        throw new Error('Please enter valid content before copying.');
      }
      const QRCodeStyling = (await import('qr-code-styling')).default;

      const exportOptions = {
        ...buildQROptions(1024),
        type: 'canvas' as const,
      };

      const exportInstance = new QRCodeStyling(exportOptions);
      if (design.logo.dataUrl) {
        (exportInstance as any)._extension = (svg: SVGElement, opts: any) => {
          applyLogoScaling(svg, opts, design.logo.sizeRatio || 0.25);
        };
        exportInstance.update(exportOptions);
      }

      const rawBlob = await exportInstance.getRawData('png');

      if (!rawBlob) {
        throw new Error('Failed to generate image blob');
      }

      let blob: Blob;
      if (rawBlob instanceof Blob) {
        blob = rawBlob;
      } else {
        blob = new Blob([new Uint8Array(rawBlob as any)], { type: 'image/png' });
      }

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
      } else {
        throw new Error('Clipboard image copy not supported in this browser.');
      }
    },
  }));

  return (
    <div className="w-full space-y-4">
      {/* Preview Card Header & View Switcher */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C] animate-pulse" />
            <span className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
              Real-Time Preview
            </span>
            <span className="text-xs text-[#737373]">({typeName})</span>
          </div>

          {/* Toggle between Flat Card and Phone Mockup */}
          <div className="flex items-center bg-[#FAFAFA] border border-[#E5E5E5] p-0.5 rounded-xl text-xs font-medium text-[#737373]">
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer',
                viewMode === 'canvas' ? 'bg-white text-[#171717] shadow-2xs font-semibold' : 'hover:text-[#171717]'
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('phone')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer',
                viewMode === 'phone' ? 'bg-white text-[#171717] shadow-2xs font-semibold' : 'hover:text-[#171717]'
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mockup</span>
            </button>
          </div>
        </div>

        {/* Center Stage Preview Area */}
        <div className="flex items-center justify-center p-3 sm:p-6 bg-[#FAFAFA] rounded-2xl border border-[#E5E5E5] min-h-[340px] relative overflow-hidden">
          {/* Flat Canvas View - Always in DOM, toggled via CSS */}
          <div className={cn(viewMode === 'canvas' ? 'flex' : 'hidden', 'items-center justify-center w-full')}>
            <div
              className={cn(
                'relative p-4 rounded-2xl shadow-md transition-all flex items-center justify-center',
                design.backgroundTransparent ? 'bg-transparent border border-dashed border-[#E5E5E5]' : 'bg-white'
              )}
              style={{
                backgroundColor: design.backgroundTransparent ? undefined : design.backgroundColor,
              }}
            >
              <div
                ref={canvasContainerRef}
                className="w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] flex items-center justify-center overflow-hidden [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-contain"
              />
            </div>
          </div>

          {/* Phone Frame Mockup View - Always in DOM, toggled via CSS */}
          <div className={cn(viewMode === 'phone' ? 'flex' : 'hidden', 'items-center justify-center w-full')}>
            <div className="w-[280px] bg-[#111111] text-white rounded-[40px] p-4 shadow-xl border-4 border-[#1C1C1C] flex flex-col items-center">
              {/* Notch / Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full mb-3" />
              <div className="w-full text-center mb-3">
                <span className="text-[10px] text-[#737373] font-mono tracking-wider uppercase">
                  Scan Camera Active
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">
                  Point camera at code
                </p>
              </div>

              {/* QR Container Inside Phone */}
              <div
                className="p-3 rounded-2xl shadow-sm mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: design.backgroundTransparent ? '#FFFFFF' : design.backgroundColor,
                }}
              >
                <div
                  ref={phoneContainerRef}
                  className="w-[200px] h-[200px] flex items-center justify-center overflow-hidden [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-contain"
                />
              </div>

              <div className="w-full px-2 py-1.5 bg-[#1C1C1C] border border-[#333333] rounded-xl text-center">
                <span className="text-[11px] text-[#FF6B2C] font-medium truncate block">
                  {payload || 'No destination link'}
                </span>
              </div>
            </div>
          </div>

          {/* Invalid or Empty State Overlay */}
          {!hasValidPayload && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 transition-opacity">
              {!payload || payload.trim() === '' ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] border border-[#FFE6D9] text-[#FF6B2C] flex items-center justify-center mb-3 shadow-2xs">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171717]">
                    Enter Content to Generate Code
                  </h4>
                  <p className="text-xs text-[#737373] mt-1 max-w-xs leading-relaxed">
                    Choose a format above and enter your URL, contact info, or Wi-Fi credentials to activate the live engine.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3 shadow-2xs">
                    <span className="text-lg font-bold">!</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171717]">
                    Content Incomplete
                  </h4>
                  <p className="text-xs text-[#737373] mt-1 max-w-xs leading-relaxed">
                    Please provide all required fields in the form to generate a valid, compliant QR code.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Scan Reliability Meter */}
      <ScanReliabilityMeter report={reliabilityReport} />
    </div>
  );
});
