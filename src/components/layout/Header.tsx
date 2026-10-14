'use client';

import React from 'react';
import { AppUser } from '@/types/auth';
import { QrCode, FolderOpen, LogIn, LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
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
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                BrandQR Studio
              </h1>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
              High-Fidelity Branded QR Code Engine
            </p>
          </div>
        </div>

        {/* Right side navigation & user actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Saved & History button with counter badge */}
          <button
            type="button"
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition select-none cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <span>Library</span>
            {totalCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl">
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
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-800 max-w-[100px] sm:max-w-[140px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-2xs select-none cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
