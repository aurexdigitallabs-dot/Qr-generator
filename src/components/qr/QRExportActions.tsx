'use client';

import React, { useState } from 'react';
import { ExportFormat, ExportResolution } from '@/types/qr';
import { Download, Copy, Check, FileCode, Image as ImageIcon, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRExportActionsProps {
  hasValidPayload: boolean;
  isAuthenticated: boolean;
  onDownload: (format: ExportFormat, resolution: ExportResolution, fileName: string) => Promise<void>;
  onCopyToClipboard: () => Promise<void>;
  onRequireAuth?: () => void;
}

export function QRExportActions({
  hasValidPayload,
  isAuthenticated,
  onDownload,
  onCopyToClipboard,
  onRequireAuth,
}: QRExportActionsProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [resolution, setResolution] = useState<ExportResolution>(1024);
  const [fileName, setFileName] = useState('brand-qrcode');
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = async () => {
    if (isExporting) return;
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!hasValidPayload) return;
    try {
      setIsExporting(true);
      await onDownload(format, resolution, fileName || 'qrcode');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (isExporting) return;
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!hasValidPayload) return;
    try {
      setIsExporting(true);
      await onCopyToClipboard();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Export & Download
        </span>
        <span className="text-xs text-slate-400 font-mono">Vector & Raster</span>
      </div>

      {/* Format Selection (PNG vs SVG) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFormat('png')}
          className={cn(
            'flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer',
            format === 'png'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>PNG Raster</span>
        </button>

        <button
          type="button"
          onClick={() => setFormat('svg')}
          className={cn(
            'flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer',
            format === 'svg'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          )}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>SVG Vector</span>
        </button>
      </div>

      {/* Resolution selection (applicable to PNG) */}
      {format === 'png' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Resolution Scale
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 512, label: 'Standard', desc: '512px' },
              { val: 1024, label: 'HD 2x', desc: '1024px' },
              { val: 2048, label: 'Ultra Print', desc: '2048px' },
            ].map((res) => (
              <button
                key={res.val}
                type="button"
                onClick={() => setResolution(res.val as ExportResolution)}
                className={cn(
                  'p-2 rounded-xl border text-center transition cursor-pointer',
                  resolution === res.val
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                <span className="block text-xs">{res.label}</span>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{res.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Name Input */}
      <div>
        <label htmlFor="file-name-input" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
          Export Filename
        </label>
        <div className="relative rounded-xl">
          <input
            id="file-name-input"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="my-qr-code"
            className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-mono text-slate-400 pointer-events-none">
            .{format}
          </span>
        </div>
      </div>

      {/* Primary Actions: Download + Copy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          disabled={isAuthenticated ? (!hasValidPayload || isExporting) : isExporting}
          onClick={handleDownload}
          className={cn(
            'flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition select-none cursor-pointer',
            (!isAuthenticated || (hasValidPayload && !isExporting))
              ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
              : 'bg-slate-300 cursor-not-allowed text-slate-500'
          )}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : !isAuthenticated ? (
            <Lock className="w-4 h-4 text-indigo-200" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isAuthenticated ? `Download ${format.toUpperCase()}` : `Sign In to Download`}</span>
        </button>

        <button
          type="button"
          disabled={isAuthenticated ? (!hasValidPayload || isExporting) : isExporting}
          onClick={handleCopy}
          className={cn(
            'flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border transition select-none cursor-pointer',
            (!isAuthenticated || (hasValidPayload && !isExporting))
              ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 active:scale-[0.99]'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          )}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Copy Image</span>
            </>
          )}
        </button>
      </div>

      {/* Cloud History & Auth note */}
      <div className="pt-0.5 text-center">
        {!isAuthenticated ? (
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Login required to download & store QR history in cloud</span>
          </p>
        ) : (
          <p className="text-[11px] text-emerald-700 flex items-center justify-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Downloads are automatically recorded to your personal history</span>
          </p>
        )}
      </div>
    </div>
  );
}
