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
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2, Info, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
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
        onSuccess('Account created successfully! Welcome to Brand QR Studio.');
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
    sign_in: 'Sign In to Account',
    sign_up: 'Create Free Account',
    forgot_password: 'Reset Password',
  }[mode];

  const description = {
    sign_in: 'Access and manage your cloud-saved brand QR designs.',
    sign_up: 'Save custom designs, logos, and sync across any browser.',
    forgot_password: 'Enter your email to receive a secure recovery link.',
  }[mode];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} description={description} maxWidth="sm">
      <div className="space-y-4">
        {/* Firebase connection status */}
        {isFirebaseConfigured ? (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Live Firebase Cloud Sync Enabled</span>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Firebase Not Configured</p>
              <p className="mt-0.5 text-slate-500">
                Supply your Firebase environment variables in <code className="text-indigo-600">.env.local</code>.
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
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer"
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
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                or with email
              </span>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'sign_in' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('forgot_password');
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-[0.99] cursor-pointer"
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
        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'sign_in' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('sign_up');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
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
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
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
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
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
