'use client';

import React, { useState } from 'react';
import { X, Share2, Copy, ExternalLink, Check, Download, Sparkles, Smartphone, Layers } from 'lucide-react';
import { ExportFormat } from '@/types/qr';

interface MobileSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataUrl: string;
  format: ExportFormat;
  fileName: string;
  blob?: Blob | null;
}

export function MobileSaveModal({
  isOpen,
  onClose,
  dataUrl,
  format,
  fileName,
  blob,
}: MobileSaveModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !dataUrl) return null;

  const isSvg = format === 'svg';

  // 1. Native Web Share API action (iOS Save Image to Photos / Android Share Sheet)
  const handleShare = async () => {
    if (typeof navigator === 'undefined') return;
    setIsSharing(true);
    try {
      let shareFile: File | null = null;
      if (blob) {
        shareFile = new File([blob], fileName, {
          type: isSvg ? 'image/svg+xml' : 'image/png',
        });
      } else if (dataUrl.startsWith('data:')) {
        // Construct blob from dataUrl
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || (isSvg ? 'image/svg+xml' : 'image/png');
        const bstr = atob(parts[1]);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        shareFile = new File([u8arr], fileName, { type: mime });
      }

      if (shareFile && typeof navigator.canShare === 'function' && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          files: [shareFile],
          title: fileName,
          text: 'Your custom QR Code',
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: fileName,
          text: 'Generated Brand QR Code',
          url: window.location.href,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Mobile share warning:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // 2. Direct browser download trigger
  const handleDirectDownload = async () => {
    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
        setIsDownloading(false);
      }, 1000);
    } catch (e) {
      console.warn('Direct mobile download error:', e);
      setIsDownloading(false);
    }
  };

  // 3. Copy image to clipboard
  const handleCopy = async () => {
    try {
      if (!isSvg && blob && navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }

      // If SVG or fallback: copy text
      if (isSvg && blob) {
        const text = await blob.text();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }

      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

  // 4. Open in standalone new tab
  const handleOpenInNewTab = () => {
    if (typeof window === 'undefined') return;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${fileName}</title>
            <style>
              body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; box-sizing: border-box; text-align: center; }
              img { max-width: 90vw; max-height: 70vh; object-fit: contain; background: white; padding: 16px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              p { margin-top: 16px; font-size: 14px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="${fileName}" />
            <p>👆 Press and hold the QR code above to save to your device photos</p>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF2EB] flex items-center justify-center text-[#FF6B2C]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Save QR Code</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFE6D9] text-[#FF6B2C] uppercase">
                  {format}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{fileName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Image preview & Touch instruction */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* QR Display Card */}
          <div className="bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl p-4 flex flex-col items-center justify-center border border-[#E5E5E5]/80 shadow-inner">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-[#E5E5E5] max-w-[210px] max-h-[210px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt={fileName}
                className="w-full h-auto object-contain select-all cursor-pointer rounded-lg"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#FF6B2C] bg-[#FFF2EB]/90 border border-[#FFE6D9] px-3.5 py-1.5 rounded-full font-medium text-center">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#FF6B2C]" />
              <span>
                {isSvg
                  ? <>Tap &amp; hold image or use <strong>Save to Files</strong></>
                  : <>Tap &amp; hold image to <strong>Save to Photos</strong></>}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5 pt-1">
            {/* Primary Action: Web Share Sheet (iOS Save Image to Photos / Android Save to device) */}
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#FF6B2C] text-white font-semibold text-sm hover:bg-[#E85B1E] active:scale-[0.99] transition shadow-md shadow-[#FF6B2C]/20 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {isSvg ? 'Save / Share via System Sheet' : 'Save to Photos / Share Sheet'}
              </span>
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleDirectDownload}
                disabled={isDownloading}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-[#E5E5E5] bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-[#E5E5E5] bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? 'Copied!' : (isSvg ? 'Copy SVG' : 'Copy Image')}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-[#E5E5E5] bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-600" />
                <span>Open Tab</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-[#E5E5E5] text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
