'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneSchema } from '@/lib/validation/schemas';
import { Phone } from 'lucide-react';

interface PhoneFormProps {
  initialData?: { phone?: string };
  onChange: (data: { phone: string }, isValid: boolean) => void;
}

export function PhoneForm({ initialData, onChange }: PhoneFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ phone: string }>({
    resolver: zodResolver(phoneSchema),
    mode: 'onChange',
    defaultValues: {
      phone: initialData?.phone || '+1 555 234 5678',
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

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="phone-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Phone Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            id="phone-input"
            type="tel"
            {...register('phone')}
            placeholder="+1 (555) 000-0000"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
        {errors.phone && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.phone.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Include country code for international compatibility (e.g. +1, +44, +91). Scanning triggers the native dialer.
        </p>
      </div>
    </div>
  );
}
