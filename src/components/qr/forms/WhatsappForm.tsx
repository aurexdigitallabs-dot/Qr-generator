'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { whatsappSchema } from '@/lib/validation/schemas';
import { MessageSquare, Phone } from 'lucide-react';

interface WhatsappFormProps {
  initialData?: { phone?: string; message?: string };
  onChange: (data: { phone: string; message?: string }, isValid: boolean) => void;
}

export function WhatsappForm({ initialData, onChange }: WhatsappFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ phone: string; message?: string }>({
    resolver: zodResolver(whatsappSchema),
    mode: 'onChange',
    defaultValues: {
      phone: initialData?.phone ?? '',
      message: initialData?.message ?? '',
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
        <label htmlFor="wa-phone-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          WhatsApp Number (With Country Code) <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            id="wa-phone-input"
            type="tel"
            {...register('phone')}
            placeholder="+1 555 0192"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
        {errors.phone && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.phone.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Example: +15551234567 or +447911123456 (do not omit country code).
        </p>
      </div>

      <div>
        <label htmlFor="wa-message-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Prefilled Message (Optional)
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <textarea
            id="wa-message-input"
            rows={3}
            {...register('message')}
            placeholder="Type a draft chat message for the customer..."
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          When scanned, this automatically launches WhatsApp directly into the chat with this prefilled message.
        </p>
      </div>
    </div>
  );
}
