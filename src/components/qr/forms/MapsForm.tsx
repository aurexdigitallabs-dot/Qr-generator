'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapsSchema } from '@/lib/validation/schemas';
import { MapPin, Navigation } from 'lucide-react';

interface MapsFormProps {
  initialData?: { query?: string; latitude?: string; longitude?: string };
  onChange: (data: { query: string; latitude?: string; longitude?: string }, isValid: boolean) => void;
}

export function MapsForm({ initialData, onChange }: MapsFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<{ query: string; latitude?: string; longitude?: string }>({
    resolver: zodResolver(mapsSchema),
    mode: 'onChange',
    defaultValues: {
      query: initialData?.query ?? '',
      latitude: initialData?.latitude || '',
      longitude: initialData?.longitude || '',
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
        <label htmlFor="maps-query" className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
          Location Address or Place Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            id="maps-query"
            type="text"
            {...register('query')}
            placeholder="e.g. 1 Infinite Loop, Cupertino, CA"
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
        {errors.query && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.query.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#737373]" />
          <span className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
            Or Coordinates (Optional)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            {...register('latitude')}
            placeholder="Latitude (e.g. 37.7749)"
            className="block w-full px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
          <input
            type="text"
            {...register('longitude')}
            placeholder="Longitude (e.g. -122.4194)"
            className="block w-full px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl text-[#171717] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] transition"
          />
        </div>
        <p className="mt-1 text-xs text-[#737373]">
          When scanned, this immediately opens in Google Maps or Apple Maps with directions.
        </p>
      </div>
    </div>
  );
}
