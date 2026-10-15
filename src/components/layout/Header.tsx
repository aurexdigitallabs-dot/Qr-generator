'use client';

import React from 'react';
import { AppUser } from '@/types/auth';
import { FolderOpen, LogIn, LogOut } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  user: AppUser | null;
  savedCount: number;
  historyCount?: number;
  onOpenSaved: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export function Header({
  user,
  savedCount,
  historyCount = 0,
  onOpenSaved,
  onOpenAuth,
  onSignOut,
}: HeaderProps) {
  const totalCount = savedCount + historyCount;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand identity: BrandQR QR Icon + Product Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative flex items-center justify-center h-10 w-10 rounded-xl overflow-hidden shadow-xs shrink-0 border border-[#E5E5E5] bg-[#0f172a]">
            <Image
              src="/icon.svg"
              alt="BrandQR icon"
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-[#171717] tracking-tight leading-none">
                BrandQR
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#FFF2EB] text-[#FF6B2C] border border-[#FFE6D9] shrink-0">
                By Aurex Digitals
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-[#737373] font-medium mt-0.5 truncate">
              Smart QR Codes. Your Brand.
            </p>
          </div>
        </div>

        {/* Right side navigation & user actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Library button with counter badge */}
          <button
            type="button"
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#171717] bg-[#FAFAFA] hover:bg-[#F0F0F0] border border-[#E5E5E5] transition select-none cursor-pointer active:scale-[0.99]"
          >
            <FolderOpen className="w-4 h-4 text-[#737373]" />
            <span className="hidden xs:inline">Library</span>
            {totalCount > 0 && (
              <span className="min-w-[18px] h-4 px-1 rounded-full bg-[#FF6B2C] text-white text-[10px] flex items-center justify-center font-bold">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={20}
                    height={20}
                    unoptimized
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FFF2EB] text-[#FF6B2C] flex items-center justify-center text-[10px] font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-[#171717] max-w-[80px] sm:max-w-[130px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="p-1.5 text-[#737373] hover:text-[#171717] hover:bg-[#F0F0F0] rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#111111] hover:bg-[#1C1C1C] border border-[#111111] transition shadow-2xs select-none cursor-pointer active:scale-[0.99]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF6B2C]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
