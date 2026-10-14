'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { urlSchema } from '@/lib/validation/schemas';
import { Globe } from 'lucide-react';

interface UrlFormProps {
  initialData?: { url?: string };
  onChange: (data: { url: string }, isValid: boolean) => void;
}

export function UrlForm({ initialData, onChange }: UrlFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ url: string }>({
    resolver: zodResolver(urlSchema),
    mode: 'onChange',
    defaultValues: {
      url: initialData?.url || 'https://google.com',
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
        <label htmlFor="url-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Website or Landing Page URL <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Globe className="w-4 h-4" />
          </div>
          <input
            id="url-input"
            type="text"
            {...register('url')}
            placeholder="https://example.com/welcome"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
        {errors.url && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.url.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Tip: Enter your full link or custom domain. Users will be redirected directly when scanned.
        </p>
      </div>
    </div>
  );
}
