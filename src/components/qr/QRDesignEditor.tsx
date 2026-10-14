'use client';

import React, { useState } from 'react';
import { QRDesignSettings, DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from '@/types/qr';
import { LogoUploader } from './LogoUploader';
import { DESIGN_PRESETS, DEFAULT_DESIGN } from '@/lib/qr/presets';
import { Palette, Sparkles, Shapes, SlidersHorizontal, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRDesignEditorProps {
  design: QRDesignSettings;
  onChange: (updated: QRDesignSettings) => void;
  onReset: () => void;
  onError: (msg: string) => void;
}

type TabKey = 'presets' | 'logo' | 'colors' | 'shapes';

export function QRDesignEditor({ design, onChange, onReset, onError }: QRDesignEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('presets');

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'presets', label: 'Presets', icon: Sparkles },
    { key: 'logo', label: 'Logo', icon: ImageIcon },
    { key: 'colors', label: 'Colors', icon: Palette },
    { key: 'shapes', label: 'Shapes', icon: Shapes },
  ];

  const dotTypes: { type: DotType; label: string }[] = [
    { type: 'rounded', label: 'Rounded' },
    { type: 'dots', label: 'Dots' },
    { type: 'classy', label: 'Classy' },
    { type: 'classy-rounded', label: 'Classy Soft' },
    { type: 'square', label: 'Classic Square' },
    { type: 'extra-rounded', label: 'Extra Rounded' },
  ];

  const cornerSquareTypes: { type: CornerSquareType; label: string }[] = [
    { type: 'extra-rounded', label: 'Rounded Square' },
    { type: 'square', label: 'Classic Box' },
    { type: 'dot', label: 'Single Dot' },
  ];

  const cornerDotTypes: { type: CornerDotType; label: string }[] = [
    { type: 'dot', label: 'Inner Dot' },
    { type: 'square', label: 'Inner Square' },
  ];

  const errorCorrectionLevels: { level: ErrorCorrectionLevel; label: string; desc: string }[] = [
    { level: 'L', label: 'L (7%)', desc: 'Lowest density, plain text' },
    { level: 'M', label: 'M (15%)', desc: 'Standard scannability' },
    { level: 'Q', label: 'Q (25%)', desc: 'High recovery' },
    { level: 'H', label: 'H (30%)', desc: 'Best for brand logos' },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-indigo-600' : 'text-slate-400')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
          title="Reset to safe default design"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset Defaults</span>
        </button>
      </div>

      {/* Tab 1: Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Curated Style Presets
            </span>
            <span className="text-xs text-slate-400">1-click styling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DESIGN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onChange({
                    ...design,
                    ...preset.settings,
                  });
                }}
                className="flex items-center gap-3 p-3 text-left rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition cursor-pointer group bg-white shadow-2xs"
              >
                {/* Visual Swatch */}
                <div
                  className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center p-1 relative shadow-2xs"
                  style={{ backgroundColor: preset.previewBgColor }}
                >
                  <div
                    className="w-5 h-5 rounded-sm"
                    style={{ backgroundColor: preset.previewDotsColor }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                    {preset.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Logo Integration */}
      {activeTab === 'logo' && (
        <div>
          <LogoUploader
            logo={design.logo}
            onChange={(newLogo) => {
              // Automatically elevate error correction to 'H' when a logo is added!
              const autoEc = newLogo.dataUrl && design.errorCorrectionLevel !== 'H' ? 'H' : design.errorCorrectionLevel;
              onChange({
                ...design,
                errorCorrectionLevel: autoEc,
                logo: newLogo,
              });
            }}
            onError={onError}
          />
        </div>
      )}

      {/* Tab 3: Colors */}
      {activeTab === 'colors' && (
        <div className="space-y-4">
          {/* Foreground Dots Color */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              QR Code Foreground Color
            </label>
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="color"
                value={design.dotsColor}
                onChange={(e) => onChange({ ...design, dotsColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <div className="flex-1">
                <span className="text-xs font-medium text-slate-800 block">Primary Color</span>
                <span className="text-xs font-mono uppercase text-slate-500">{design.dotsColor}</span>
              </div>
            </div>
          </div>

          {/* Gradient Controls */}
          <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Enable Color Gradient</span>
                <span className="text-[11px] text-slate-500">Smooth color transition across pattern</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={design.dotsGradientEnabled}
                  onChange={(e) =>
                    onChange({
                      ...design,
                      dotsGradientEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {design.dotsGradientEnabled && (
              <div className="pt-2 border-t border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={design.dotsGradientColor}
                    onChange={(e) =>
                      onChange({
                        ...design,
                        dotsGradientColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-800 block">Secondary Accent Color</span>
                    <span className="text-xs font-mono uppercase text-slate-500">{design.dotsGradientColor}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ ...design, dotsGradientType: 'linear' })}
                    className={cn(
                      'py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition',
                      design.dotsGradientType === 'linear'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    Linear Gradient
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...design, dotsGradientType: 'radial' })}
                    className={cn(
                      'py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition',
                      design.dotsGradientType === 'radial'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    Radial Gradient
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Background Color & Transparency */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Background Canvas
            </label>
            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  disabled={design.backgroundTransparent}
                  value={design.backgroundColor}
                  onChange={(e) => onChange({ ...design, backgroundColor: e.target.value })}
                  className={cn(
                    'w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white',
                    design.backgroundTransparent && 'opacity-30 cursor-not-allowed'
                  )}
                />
                <div>
                  <span className="text-xs font-medium text-slate-800 block">
                    {design.backgroundTransparent ? 'Transparent Canvas' : 'Canvas Fill'}
                  </span>
                  <span className="text-xs font-mono uppercase text-slate-500">
                    {design.backgroundTransparent ? 'No background' : design.backgroundColor}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={design.backgroundTransparent}
                  onChange={(e) =>
                    onChange({
                      ...design,
                      backgroundTransparent: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span>Transparent</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Shapes & Pattern */}
      {activeTab === 'shapes' && (
        <div className="space-y-4">
          {/* Dot Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Body Pattern Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dotTypes.map((dot) => (
                <button
                  key={dot.type}
                  type="button"
                  onClick={() => onChange({ ...design, dotsType: dot.type })}
                  className={cn(
                    'py-2 px-2.5 text-xs font-medium rounded-xl border text-center transition',
                    design.dotsType === dot.type
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {dot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Square Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Corner Frame (Eye Box)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {cornerSquareTypes.map((cs) => (
                <button
                  key={cs.type}
                  type="button"
                  onClick={() => onChange({ ...design, cornersSquareType: cs.type })}
                  className={cn(
                    'py-2 px-2 text-xs font-medium rounded-xl border text-center transition',
                    design.cornersSquareType === cs.type
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {cs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Dot Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Corner Eye Center
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cornerDotTypes.map((cd) => (
                <button
                  key={cd.type}
                  type="button"
                  onClick={() => onChange({ ...design, cornersDotType: cd.type })}
                  className={cn(
                    'py-2 px-2 text-xs font-medium rounded-xl border text-center transition',
                    design.cornersDotType === cd.type
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {cd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quiet Zone Margin Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="qr-margin-range" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Quiet Zone Margin
              </label>
              <span className="text-xs font-mono text-slate-600">{design.margin}px</span>
            </div>
            <input
              id="qr-margin-range"
              type="range"
              min="0"
              max="24"
              step="2"
              value={design.margin}
              onChange={(e) => onChange({ ...design, margin: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0px (Tight)</span>
              <span className="text-indigo-600 font-medium">12px (Recommended)</span>
              <span>24px (Spacious)</span>
            </div>
          </div>

          {/* Error Correction Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Error Correction Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {errorCorrectionLevels.map((ec) => (
                <button
                  key={ec.level}
                  type="button"
                  onClick={() => onChange({ ...design, errorCorrectionLevel: ec.level })}
                  className={cn(
                    'p-2 rounded-xl border text-center transition',
                    design.errorCorrectionLevel === ec.level
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span className="block text-xs font-bold">{ec.label}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{ec.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
