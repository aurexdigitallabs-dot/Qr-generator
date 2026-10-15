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
      ssid: initialData?.ssid ?? '',
      password: initialData?.password ?? '',
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
        <label htmlFor="ssid-input" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
          Network Name (SSID) <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
            <Wifi className="w-4 h-4" />
          </div>
          <input
            id="ssid-input"
            type="text"
            {...register('ssid')}
            placeholder="MyHomeWiFi"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
        {errors.ssid && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.ssid.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
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
                  ? 'bg-[#FFF2EB] border-[#FF6B2C] text-[#FF6B2C] font-semibold'
                  : 'bg-white border-[#E5E5E5] text-[#737373] hover:bg-slate-50'
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
          <label htmlFor="wifi-pass-input" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="wifi-pass-input"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter Wi-Fi password"
              className="block w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737373] hover:text-[#737373]"
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
            className="w-4 h-4 rounded text-[#FF6B2C] focus:ring-[#FF6B2C] border-slate-300"
          />
          <span className="text-xs font-medium text-[#171717]">
            Hidden Network (SSID is not broadcasted)
          </span>
        </label>
      </div>

      <div className="p-3 bg-slate-50 border border-[#E5E5E5]/80 rounded-xl flex items-start gap-2.5 text-xs text-[#737373]">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>Guests can simply point their camera to automatically connect without typing passwords manually.</p>
      </div>
    </div>
  );
}
