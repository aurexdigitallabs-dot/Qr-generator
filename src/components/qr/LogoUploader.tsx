'use client';

import React, { useRef, useState } from 'react';
import { LogoSettings, LogoBadgeShape } from '@/types/qr';
import {
  validateLogoFile,
  fileToDataUrl,
  processLogoBadge,
} from '@/lib/qr/logoProcessor';
import { SAMPLE_LOGOS } from '@/lib/qr/sampleLogos';
import { Upload, Trash2, Sliders, Circle, Square, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoUploaderProps {
  logo: LogoSettings;
  onChange: (updatedLogo: LogoSettings) => void;
  onError: (msg: string) => void;
}

export function LogoUploader({ logo, onChange, onError }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      onError(validation.error || 'Invalid logo file');
      return;
    }

    try {
      setIsProcessing(true);
      const rawUrl = await fileToDataUrl(file);
      const processedUrl = await processLogoBadge(rawUrl, {
        shape: logo.badgeShape,
        badgeColor: logo.badgeColor,
        hasBorder: logo.hasBorder,
        borderColor: logo.borderColor,
      });

      onChange({
        ...logo,
        rawImageUrl: rawUrl,
        dataUrl: processedUrl,
        fileName: file.name,
      });
    } catch {
      onError('Failed to read or process the uploaded logo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSample = async (sampleSvgUrl: string, sampleName: string) => {
    try {
      setIsProcessing(true);
      const processedUrl = await processLogoBadge(sampleSvgUrl, {
        shape: logo.badgeShape,
        badgeColor: logo.badgeColor,
        hasBorder: logo.hasBorder,
        borderColor: logo.borderColor,
      });

      onChange({
        ...logo,
        rawImageUrl: sampleSvgUrl,
        dataUrl: processedUrl,
        fileName: `${sampleName}.svg`,
      });
    } catch {
      onError('Failed to apply sample icon.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateBadgeShape = async (newShape: LogoBadgeShape) => {
    if (!logo.rawImageUrl) {
      onChange({ ...logo, badgeShape: newShape });
      return;
    }

    try {
      setIsProcessing(true);
      const processedUrl = await processLogoBadge(logo.rawImageUrl, {
        shape: newShape,
        badgeColor: logo.badgeColor,
        hasBorder: logo.hasBorder,
        borderColor: logo.borderColor,
      });

      onChange({
        ...logo,
        badgeShape: newShape,
        dataUrl: processedUrl,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateBadgeColor = async (newColor: string) => {
    if (!logo.rawImageUrl) {
      onChange({ ...logo, badgeColor: newColor });
      return;
    }

    try {
      setIsProcessing(true);
      const processedUrl = await processLogoBadge(logo.rawImageUrl, {
        shape: logo.badgeShape,
        badgeColor: newColor,
        hasBorder: logo.hasBorder,
        borderColor: logo.borderColor,
      });

      onChange({
        ...logo,
        badgeColor: newColor,
        dataUrl: processedUrl,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeLogo = () => {
    onChange({
      ...logo,
      rawImageUrl: undefined,
      dataUrl: undefined,
      fileName: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasLogo = Boolean(logo.rawImageUrl || logo.dataUrl);

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Main Upload Drop Area */}
      {!hasLogo ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition text-slate-600 group-hover:text-indigo-600">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to upload brand logo
          </p>
          <p className="text-xs text-slate-500 mt-1">
            PNG, JPG, WebP, or SVG (Max 2MB)
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Aspect ratio is automatically preserved with clean margin padding
          </p>
        </div>
      ) : (
        /* Active Logo Card */
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs relative">
              {logo.dataUrl ? (
                <Image
                  src={logo.dataUrl}
                  alt="Logo preview"
                  width={40}
                  height={40}
                  unoptimized
                  className="max-h-full max-w-full object-contain"
                />
              ) : null}
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {logo.fileName || 'Embedded Brand Logo'}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3" /> Ready & Aspect Preserved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={removeLogo}
              aria-label="Remove logo"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preset sample icons for fast testing */}
      <div>
        <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Or try sample icons
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SAMPLE_LOGOS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.svgDataUrl, sample.name)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-xs font-medium text-slate-700 shrink-0 shadow-2xs hover:bg-indigo-50/30 transition"
            >
              <div
                className="w-4 h-4 flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: decodeURIComponent(sample.svgDataUrl.replace('data:image/svg+xml;utf8,', '')),
                }}
              />
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo container & sizing controls */}
      {hasLogo && (
        <div className="space-y-3.5 pt-2 border-t border-slate-200/80">
          {/* Container Badge Shape */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Logo Background Container
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { shape: 'circle', label: 'Circle', icon: Circle },
                { shape: 'rounded', label: 'Rounded', icon: Square },
                { shape: 'square', label: 'Square', icon: Square },
                { shape: 'transparent', label: 'None', icon: Sliders },
              ].map((item) => (
                <button
                  key={item.shape}
                  type="button"
                  onClick={() => updateBadgeShape(item.shape as LogoBadgeShape)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition gap-1',
                    logo.badgeShape === item.shape
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Badge Background Color (if not transparent) */}
          {logo.badgeShape !== 'transparent' && (
            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-medium text-slate-700 block">
                  Container Background
                </span>
                <span className="text-[11px] text-slate-400">
                  Contrast backing for clean quiet boundary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={logo.badgeColor || '#FFFFFF'}
                  onChange={(e) => updateBadgeColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
                <span className="text-xs font-mono uppercase text-slate-600">
                  {logo.badgeColor || '#FFFFFF'}
                </span>
              </div>
            </div>
          )}

          {/* Logo Size Ratio Slider (15% - 35%) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="logo-size-range" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Logo Scale in QR Code
              </label>
              <span className="text-xs font-mono text-slate-600">
                {Math.round(logo.sizeRatio * 100)}%
              </span>
            </div>
            <input
              id="logo-size-range"
              type="range"
              min="0.15"
              max="0.32"
              step="0.01"
              value={logo.sizeRatio}
              onChange={(e) =>
                onChange({
                  ...logo,
                  sizeRatio: parseFloat(e.target.value),
                })
              }
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Small (15%)</span>
              <span className="text-indigo-600 font-medium">Safe Limit (25%)</span>
              <span>Max (32%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
