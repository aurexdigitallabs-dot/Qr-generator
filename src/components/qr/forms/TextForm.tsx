'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { textSchema } from '@/lib/validation/schemas';
import { AlignLeft } from 'lucide-react';

interface TextFormProps {
  initialData?: { text?: string };
  onChange: (data: { text: string }, isValid: boolean) => void;
}

export function TextForm({ initialData, onChange }: TextFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ text: string }>({
    resolver: zodResolver(textSchema),
    mode: 'onChange',
    defaultValues: {
      text: initialData?.text ?? '',
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

  const charCount = (values.text || '').length;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="text-input" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
            Plain Text Message <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-[#737373] font-mono">{charCount} / 2000</span>
        </div>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute top-3 left-3.5 pointer-events-none text-[#737373]">
            <AlignLeft className="w-4 h-4" />
          </div>
          <textarea
            id="text-input"
            rows={4}
            {...register('text')}
            placeholder="Type any message, notes, coupon code, or serial number..."
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
        {errors.text && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.text.message}</p>
        )}
        <p className="mt-1 text-xs text-[#737373]">
          Any text displayed directly on the scanner screen without opening an internet browser.
        </p>
      </div>
    </div>
  );
}
