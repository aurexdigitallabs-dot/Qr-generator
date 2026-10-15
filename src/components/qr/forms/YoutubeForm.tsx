'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { youtubeSchema } from '@/lib/validation/schemas';
import { Video } from 'lucide-react';

interface YoutubeFormProps {
  initialData?: { url?: string };
  onChange: (data: { url: string }, isValid: boolean) => void;
}

export function YoutubeForm({ initialData, onChange }: YoutubeFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ url: string }>({
    resolver: zodResolver(youtubeSchema),
    mode: 'onChange',
    defaultValues: {
      url: initialData?.url ?? '',
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
        <label htmlFor="yt-url-input" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
          YouTube Video or Channel URL <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
            <Video className="w-4 h-4" />
          </div>
          <input
            id="yt-url-input"
            type="text"
            {...register('url')}
            placeholder="https://youtube.com/watch?v=... or @channel"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
        {errors.url && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.url.message}</p>
        )}
        <p className="mt-1 text-xs text-[#737373]">
          Supports full youtube.com URLs, short youtu.be links, and channel URLs.
        </p>
      </div>
    </div>
  );
}
