'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { instagramSchema } from '@/lib/validation/schemas';
import { AtSign } from 'lucide-react';

interface InstagramFormProps {
  initialData?: { username?: string };
  onChange: (data: { username: string }, isValid: boolean) => void;
}

export function InstagramForm({ initialData, onChange }: InstagramFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ username: string }>({
    resolver: zodResolver(instagramSchema),
    mode: 'onChange',
    defaultValues: {
      username: initialData?.username ?? '',
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
        <label htmlFor="ig-username" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
          Instagram Username or URL <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
            <AtSign className="w-4 h-4" />
          </div>
          <input
            id="ig-username"
            type="text"
            {...register('username')}
            placeholder="username or instagram.com/username"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
        {errors.username && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.username.message}</p>
        )}
        <p className="mt-1 text-xs text-[#737373]">
          Enter handle with or without @ (e.g. &apos;nike&apos; or &apos;https://instagram.com/nike&apos;).
        </p>
      </div>
    </div>
  );
}
