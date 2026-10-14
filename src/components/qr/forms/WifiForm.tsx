'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { wifiSchema } from '@/lib/validation/schemas';
import { Wifi, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface WifiFormProps {
  initialData?: {
    ssid?: string;
    password?: string;
    encryption?: 'WPA' | 'WEP' | 'nopass';
    hidden?: boolean;
  };
  onChange: (
    data: {
      ssid: string;
      password?: string;
      encryption: 'WPA' | 'WEP' | 'nopass';
      hidden?: boolean;
    },
    isValid: boolean
  ) => void;
}

export function WifiForm({ initialData, onChange }: WifiFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{
    ssid: string;
    password?: string;
    encryption: 'WPA' | 'WEP' | 'nopass';
    hidden?: boolean;
  }>({
    resolver: zodResolver(wifiSchema),
    mode: 'onChange',
    defaultValues: {
      ssid: initialData?.ssid || 'Office-Guest-WiFi',
      password: initialData?.password || 'SecurePass2026',
      encryption: initialData?.encryption || 'WPA',
      hidden: initialData?.hidden || false,
    },
  });

  const values = watch();
  const lastRef = React.useRef<string>('');

  useEffect(() => {
    const key = JSON.stringify({ values, isValid });
    if (lastRef.current !== key) {
      lastRef.current = key;
      onChange(values, isValid);
    }
  }, [values, isValid, onChange]);

  const encryptionType = values.encryption;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ssid-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Network Name (SSID) <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Wifi className="w-4 h-4" />
          </div>
          <input
            id="ssid-input"
            type="text"
            {...register('ssid')}
            placeholder="MyHomeWiFi"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
        {errors.ssid && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.ssid.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Security Protocol
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
            { value: 'WEP', label: 'WEP' },
            { value: 'nopass', label: 'No Password' },
          ].map((item) => (
            <label
              key={item.value}
              className={`flex items-center justify-center px-3 py-2 text-xs font-medium rounded-xl border cursor-pointer transition text-center ${
                encryptionType === item.value
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                value={item.value}
                {...register('encryption')}
                className="sr-only"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {encryptionType !== 'nopass' && (
        <div>
          <label htmlFor="wifi-pass-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="wifi-pass-input"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter Wi-Fi password"
              className="block w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <div className="pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            {...register('hidden')}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <span className="text-xs font-medium text-slate-700">
            Hidden Network (SSID is not broadcasted)
          </span>
        </label>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>Guests can simply point their camera to automatically connect without typing passwords manually.</p>
      </div>
    </div>
  );
}
