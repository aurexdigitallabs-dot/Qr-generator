'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AuthMode } from '@/types/auth';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  formatAuthError,
} from '@/lib/firebase/services';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2, Info, ShieldCheck, Download } from 'lucide-react';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  reason?: string | null;
}

export function AuthModal({ isOpen, onClose, onSuccess, reason }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setInfoMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setErrorMessage(
        'Firebase credentials are not configured yet in .env.local.'
      );
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      await loginWithGoogle();
      onSuccess('Signed in successfully with Google!');
      handleClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // user closed popup cleanly
      } else {
        setErrorMessage(formatAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
      setErrorMessage('Firebase credentials are not configured yet in .env.local.');
      return;
    }

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      if (mode === 'sign_in') {
        if (!password) throw new Error('Please enter your password');
        await loginWithEmail(email, password);
        onSuccess('Welcome back! Signed in successfully.');
        handleClose();
      } else if (mode === 'sign_up') {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await registerWithEmail(email, password);
        onSuccess('Account created successfully! Welcome to BrandQR by Aurex Digitals.');
        handleClose();
      } else if (mode === 'forgot_password') {
        await resetPassword(email);
        setInfoMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const title = {
    sign_in: 'Sign In to BrandQR',
    sign_up: 'Create Free Account',
    forgot_password: 'Reset Password',
  }[mode];

  const description = {
    sign_in: 'Access and manage your cloud-saved brand QR designs and download history.',
    sign_up: 'Save custom designs, logos, and sync across all your devices.',
    forgot_password: 'Enter your email to receive a secure recovery link.',
  }[mode];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} description={description} maxWidth="sm">
      <div className="space-y-4">
        {/* Subtle Aurex branding bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
              <Image
                src="/Aurex%20icon%20only.png"
                alt="Aurex Digitals"
                width={20}
                height={18}
                className="h-full w-auto object-contain"
              />
            </div>
            <span className="text-xs font-semibold text-[#171717]">
              BrandQR by Aurex Digitals
            </span>
          </div>
          <span className="text-[10px] text-[#737373] font-medium uppercase tracking-wider">
            Cloud Sync
          </span>
        </div>

        {/* Context / Reason Notice (e.g. login required to download) */}
        {reason && (
          <div className="p-3 bg-[#FFF2EB] border border-[#FFE6D9] rounded-xl flex items-start gap-2.5 text-xs text-[#171717] shadow-2xs">
            <Download className="w-4 h-4 text-[#FF6B2C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#171717]">Authentication Required</p>
              <p className="text-[#737373] mt-0.5 leading-relaxed">{reason}</p>
            </div>
          </div>
        )}

        {/* Firebase connection status */}
        {isFirebaseConfigured ? (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Live Firebase Cloud Sync Enabled</span>
          </div>
        ) : (
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl flex items-start gap-2.5 text-xs text-[#737373]">
            <Info className="w-4 h-4 text-[#FF6B2C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#171717]">Firebase Credentials</p>
              <p className="mt-0.5 text-[#737373]">
                Provide your Firebase environment variables in <code className="text-[#FF6B2C] font-mono">.env.local</code>.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{infoMessage}</p>
          </div>
        )}

        {/* Mode !== forgot_password: Show Google Sign In */}
        {mode !== 'forgot_password' && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-[#171717] text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-[#E5E5E5] w-full" />
              <span className="bg-white px-2 text-[10px] uppercase tracking-wider text-[#737373] font-semibold absolute">
                or with email
              </span>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="auth-password" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
                  Password
                </label>
                {mode === 'sign_in' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('forgot_password');
                    }}
                    className="text-[11px] text-[#FF6B2C] hover:text-[#E85B1E] font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FF6B2C] hover:bg-[#E85B1E] text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-[0.99] cursor-pointer"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {mode === 'sign_in' && 'Sign In'}
              {mode === 'sign_up' && 'Create Free Account'}
              {mode === 'forgot_password' && 'Send Reset Email'}
            </span>
          </button>
        </form>

        {/* Footer switch between modes */}
        <div className="pt-2 border-t border-[#E5E5E5] text-center text-xs text-[#737373]">
          {mode === 'sign_in' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('sign_up');
                }}
                className="text-[#FF6B2C] hover:text-[#E85B1E] font-semibold"
              >
                Sign up free
              </button>
            </p>
          )}

          {mode === 'sign_up' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('sign_in');
                }}
                className="text-[#FF6B2C] hover:text-[#E85B1E] font-semibold"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'forgot_password' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('sign_in');
                }}
                className="text-[#FF6B2C] hover:text-[#E85B1E] font-semibold"
              >
                Back to Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
