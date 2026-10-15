'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E5E5E5] mt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Brand & Capability Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Brand & Attribution Column (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden shadow-xs border border-[#E5E5E5] bg-[#0f172a]">
                <Image
                  src="/icon.svg"
                  alt="BrandQR"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-base font-bold text-[#171717] tracking-tight block">
                  BrandQR
                </span>
                <span className="text-xs text-[#737373]">
                  Smart QR Codes. Your Brand.
                </span>
              </div>
            </div>

            <p className="text-xs text-[#737373] leading-relaxed max-w-sm">
              Create QR codes that carry your brand identity. Engineered for crisp print resolution, digital sharing, and maximum scan reliability.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="relative h-7 w-5 shrink-0">
                  <Image
                    src="/Aurex.png"
                    alt="Aurex Digitals"
                    width={20}
                    height={28}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-[#171717]">
                  Designed &amp; Developed by Aurex Digitals
                </span>
              </div>
              <p className="text-[11px] text-[#737373] font-medium tracking-wide">
                Master The Market.
              </p>
            </div>
          </div>

          {/* Capabilities & Specifications (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2 p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5]">
              <span className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                High-Fidelity Vectors
              </span>
              <p className="text-xs text-[#737373] leading-relaxed">
                Export pixel-perfect SVG vectors and ultra-resolution 2048px PNGs ready for packaging, business cards, and outdoor billboards.
              </p>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5]">
              <span className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Reed-Solomon Level-H
              </span>
              <p className="text-xs text-[#737373] leading-relaxed">
                Up to 30% error correction preserves scannability even when customized with brand logos, custom colors, and unique shapes.
              </p>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5]">
              <span className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Privacy First Engine
              </span>
              <p className="text-xs text-[#737373] leading-relaxed">
                QR generation happens locally in your browser. No middleman redirects or link tracking — pure direct destination codes.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Attribution Bar */}
        <div className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
          <p>© 2025 BrandQR. A product by Aurex Digitals. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[#171717] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#FF6B2C]" /> ISO/IEC 18004 Standard
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#171717] font-medium">
              <Lock className="w-3.5 h-3.5 text-[#737373]" /> Client-Side Vector Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
