'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { smsSchema } from '@/lib/validation/schemas';
import { Phone, MessageSquare } from 'lucide-react';

interface SmsFormProps {
  initialData?: { phone?: string; message?: string };
  onChange: (data: { phone: string; message?: string }, isValid: boolean) => void;
}

export function SmsForm({ initialData, onChange }: SmsFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ phone: string; message?: string }>({
    resolver: zodResolver(smsSchema),
    mode: 'onChange',
    defaultValues: {
      phone: initialData?.phone || '+1 555 765 4321',
      message: initialData?.message || 'JOIN VIP',
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
        <label htmlFor="sms-phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Phone Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            id="sms-phone"
            type="tel"
            {...register('phone')}
            placeholder="+1 (555) 000-0000"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
        {errors.phone && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="sms-body" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Prefilled SMS Message (Optional)
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <textarea
            id="sms-body"
            rows={3}
            {...register('message')}
            placeholder="e.g. YES, RSVP, or OPT-IN..."
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Scanning opens the phone&apos;s native SMS messaging app with this recipient and message draft ready to send.
        </p>
      </div>
    </div>
  );
}
