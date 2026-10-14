'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Layers, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 mt-16 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              High-Fidelity Vectors
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export pixel-perfect SVG vectors and ultra-resolution 2048px PNGs ready for packaging, business cards, and outdoor billboards.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Logo Safety & Protection
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatic Level-H Reed-Solomon error correction preserves up to 30% recovery, ensuring scannability even with custom brand emblems.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Universal Standard Formats
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fully compliant with ISO/IEC 18004 standards. Supports vCard 3.0, WPA Wi-Fi, and standard deep-linking protocols.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Privacy & Local Processing
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Static QR generation occurs locally in your browser. No third-party tracking redirects or scan hijacking.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 BrandQR Studio. Built for professional designers, businesses, and developers.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> WCAG 2.2 Checked
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <Lock className="w-3.5 h-3.5 text-indigo-600" /> Client-Side Vector Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
