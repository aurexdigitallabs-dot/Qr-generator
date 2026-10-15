'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@/lib/validation/schemas';
import { Mail, Tag, FileText } from 'lucide-react';

interface EmailFormProps {
  initialData?: { email?: string; subject?: string; body?: string };
  onChange: (data: { email: string; subject?: string; body?: string }, isValid: boolean) => void;
}

export function EmailForm({ initialData, onChange }: EmailFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ email: string; subject?: string; body?: string }>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
    defaultValues: {
      email: initialData?.email ?? '',
      subject: initialData?.subject ?? '',
      body: initialData?.body ?? '',
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
        <label htmlFor="email-input" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
          Recipient Email <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email-input"
            type="email"
            {...register('email')}
            placeholder="contact@yourcompany.com"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject-input" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
          Subject Line (Optional)
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
            <Tag className="w-4 h-4" />
          </div>
          <input
            id="subject-input"
            type="text"
            {...register('subject')}
            placeholder="e.g. Schedule a demo"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="body-input" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
          Prefilled Body (Optional)
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute top-3 left-3.5 pointer-events-none text-[#737373]">
            <FileText className="w-4 h-4" />
          </div>
          <textarea
            id="body-input"
            rows={3}
            {...register('body')}
            placeholder="Prefilled draft for the user to send..."
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
      </div>
    </div>
  );
}
