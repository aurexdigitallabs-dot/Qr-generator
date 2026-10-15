'use client';

import React from 'react';
import { ReliabilityReport } from '@/types/qr';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScanReliabilityMeterProps {
  report: ReliabilityReport;
}

export function ScanReliabilityMeter({ report }: ScanReliabilityMeterProps) {
  const { score, level, contrastRatio, isInverted, recommendations } = report;

  const config = {
    excellent: {
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: 'bg-emerald-500',
      label: 'Optimal Scannability',
      icon: ShieldCheck,
    },
    good: {
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      barColor: 'bg-blue-500',
      label: 'Good Scannability',
      icon: ShieldCheck,
    },
    caution: {
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
      label: 'Moderate Risk',
      icon: AlertTriangle,
    },
    critical: {
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
      label: 'Difficult to Scan',
      icon: AlertCircle,
    },
  }[level];

  const Icon = config.icon;

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-2xs space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#FAFAFA] text-[#171717] border border-[#E5E5E5]">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#171717] block leading-tight">
              Scan Reliability Index
            </span>
            <span className="text-[11px] text-[#737373]">
              Live contrast &amp; camera optics analysis
            </span>
          </div>
        </div>

        <div className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5', config.badgeBg)}>
          <span>{config.label}</span>
          <span className="font-mono">({score}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#FAFAFA] border border-[#E5E5E5] h-2 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', config.barColor)}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-[#E5E5E5] text-xs">
        <div className="bg-[#FAFAFA] p-2 rounded-xl border border-[#E5E5E5]">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider block font-semibold">
            Contrast Ratio
          </span>
          <span className="text-sm font-semibold text-[#171717] font-mono">
            {contrastRatio}:1
          </span>
        </div>

        <div className="bg-[#FAFAFA] p-2 rounded-xl border border-[#E5E5E5]">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider block font-semibold">
            Color Polar
          </span>
          <span className="text-xs font-semibold text-[#171717]">
            {isInverted ? 'Light on Dark' : 'Dark on Light'}
          </span>
        </div>

        <div className="bg-[#FAFAFA] p-2 rounded-xl border border-[#E5E5E5] col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider block font-semibold">
            Standard Status
          </span>
          <span className={cn('text-xs font-semibold', report.isContrastSufficient ? 'text-emerald-700' : 'text-rose-600')}>
            {report.isContrastSufficient ? 'ISO Verified' : 'Low Contrast'}
          </span>
        </div>
      </div>

      {/* Recommendations / Tips */}
      {recommendations.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-[#737373] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-[#FF6B2C] shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
