'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { QRDesignSettings, ExportFormat, ExportResolution, ReliabilityReport } from '@/types/qr';
import { evaluateScanReliability } from '@/lib/qr/reliability';
import { ScanReliabilityMeter } from './ScanReliabilityMeter';
import { Smartphone, Monitor, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QRPreviewRef {
  downloadQR: (format: ExportFormat, resolution: ExportResolution, fileName: string) => Promise<void>;
  copyToClipboard: () => Promise<void>;
}

interface QRPreviewProps {
  payload: string;
  hasValidPayload: boolean;
  design: QRDesignSettings;
  typeName: string;
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

    const imageOptions: any = {
      hideBackgroundDots: true,
      imageSize: design.logo.sizeRatio || 0.25,
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

        // Render Canvas view
        if (canvasContainerRef.current) {
          const canvasOptions = buildQROptions(300);
          if (!canvasQRRef.current || !canvasContainerRef.current.children.length) {
            canvasContainerRef.current.innerHTML = '';
            canvasQRRef.current = new QRCodeStyling(canvasOptions);
            canvasQRRef.current.append(canvasContainerRef.current);
          } else {
            canvasQRRef.current.update(canvasOptions);
          }
        }

        // Render Phone view
        if (phoneContainerRef.current) {
          const phoneOptions = buildQROptions(220);
          if (!phoneQRRef.current || !phoneContainerRef.current.children.length) {
            phoneContainerRef.current.innerHTML = '';
            phoneQRRef.current = new QRCodeStyling(phoneOptions);
            phoneQRRef.current.append(phoneContainerRef.current);
          } else {
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
    async downloadQR(format: ExportFormat, resolution: ExportResolution, fileName: string) {
      if (typeof window === 'undefined') return;
      const QRCodeStyling = (await import('qr-code-styling')).default;

      // Build dedicated instance at the target resolution
      const exportOptions = {
        ...buildQROptions(resolution),
        type: (format === 'svg' ? 'svg' : 'canvas') as 'svg' | 'canvas',
      };

      const exportInstance = new QRCodeStyling(exportOptions);
      await exportInstance.download({
        name: fileName.replace(/\.[^/.]+$/, ''),
        extension: format,
      });
    },

    async copyToClipboard() {
      if (typeof window === 'undefined') return;
      const QRCodeStyling = (await import('qr-code-styling')).default;

      const exportOptions = {
        ...buildQROptions(1024),
        type: 'canvas' as const,
      };

      const exportInstance = new QRCodeStyling(exportOptions);
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Real-Time Preview
            </span>
            <span className="text-xs text-slate-400">({typeName})</span>
          </div>

          {/* Toggle between Flat Card and Phone Mockup */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer',
                viewMode === 'canvas' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
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
                viewMode === 'phone' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mockup</span>
            </button>
          </div>
        </div>

        {/* Center Stage Preview Area */}
        <div className="flex items-center justify-center p-3 sm:p-6 bg-slate-50/70 rounded-2xl border border-slate-100 min-h-[340px] relative overflow-hidden">
          {/* Flat Canvas View - Always in DOM, toggled via CSS */}
          <div className={cn(viewMode === 'canvas' ? 'flex' : 'hidden', 'items-center justify-center w-full')}>
            <div
              className={cn(
                'relative p-4 rounded-2xl shadow-md transition-all flex items-center justify-center',
                design.backgroundTransparent ? 'bg-transparent border border-dashed border-slate-300' : 'bg-white'
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
            <div className="w-[280px] bg-slate-900 text-white rounded-[40px] p-4 shadow-xl border-4 border-slate-800 flex flex-col items-center">
              {/* Notch / Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full mb-3" />
              <div className="w-full text-center mb-3">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
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

              <div className="w-full px-2 py-1.5 bg-slate-800/80 rounded-xl text-center">
                <span className="text-[11px] text-indigo-300 font-medium truncate block">
                  {payload || 'No destination link'}
                </span>
              </div>
            </div>
          </div>

          {/* Invalid or Empty State Overlay Warning */}
          {!hasValidPayload && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Incomplete or Invalid Content
              </p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Fill in the required fields on the left to generate and scan your live QR code.
              </p>
            </div>
          )}
        </div>

        {/* Scan Instruction Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ready for iOS Camera & Google Lens</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {payload ? `${payload.length} chars` : '0 chars'}
          </span>
        </div>
      </div>

      {/* Embedded Live Scan Reliability Meter */}
      <ScanReliabilityMeter report={reliabilityReport} />
    </div>
  );
});
