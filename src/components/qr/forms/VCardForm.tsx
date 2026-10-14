'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vcardSchema } from '@/lib/validation/schemas';
import { VCardData } from '@/lib/qr/encoders';
import { User, Building, Briefcase, Phone, Mail, Globe, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface VCardFormProps {
  initialData?: Partial<VCardData>;
  onChange: (data: VCardData, isValid: boolean) => void;
}

export function VCardForm({ initialData, onChange }: VCardFormProps) {
  const [showAddress, setShowAddress] = useState(false);

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<VCardData>({
    resolver: zodResolver(vcardSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: initialData?.firstName || 'Alex',
      lastName: initialData?.lastName || 'Morgan',
      organization: initialData?.organization || 'Acme Design Co',
      title: initialData?.title || 'Product Director',
      mobile: initialData?.mobile || '+1 555 432 1098',
      workPhone: initialData?.workPhone || '',
      email: initialData?.email || 'alex@acmedesign.com',
      website: initialData?.website || 'https://acmedesign.com',
      street: initialData?.street || '',
      city: initialData?.city || 'San Francisco',
      state: initialData?.state || 'CA',
      postalCode: initialData?.postalCode || '',
      country: initialData?.country || 'USA',
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
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="vcard-fn" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            First Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <input
              id="vcard-fn"
              type="text"
              {...register('firstName')}
              placeholder="First Name"
              className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="vcard-ln" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Last Name
          </label>
          <input
            id="vcard-ln"
            type="text"
            {...register('lastName')}
            placeholder="Last Name"
            className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="vcard-org" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Company / Org
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building className="w-3.5 h-3.5" />
            </div>
            <input
              id="vcard-org"
              type="text"
              {...register('organization')}
              placeholder="Company Name"
              className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="vcard-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Job Title
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <input
              id="vcard-title"
              type="text"
              {...register('title')}
              placeholder="e.g. Design Lead"
              className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="vcard-mobile" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Mobile Phone
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <input
              id="vcard-mobile"
              type="tel"
              {...register('mobile')}
              placeholder="+1 555 0192"
              className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="vcard-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <input
              id="vcard-email"
              type="email"
              {...register('email')}
              placeholder="you@domain.com"
              className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="vcard-web" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Website / Portfolio
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <input
            id="vcard-web"
            type="text"
            {...register('website')}
            placeholder="https://yourportfolio.com"
            className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Collapsible Address Section */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAddress(!showAddress)}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{showAddress ? 'Hide Postal Address' : '+ Add Postal Address'}</span>
          {showAddress ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAddress && (
          <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div>
              <label htmlFor="vcard-street" className="block text-xs font-medium text-slate-600 mb-1">
                Street Address
              </label>
              <input
                id="vcard-street"
                type="text"
                {...register('street')}
                placeholder="100 Market St, Suite 400"
                className="block w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="vcard-city" className="block text-xs font-medium text-slate-600 mb-1">
                  City
                </label>
                <input
                  id="vcard-city"
                  type="text"
                  {...register('city')}
                  placeholder="San Francisco"
                  className="block w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="vcard-state" className="block text-xs font-medium text-slate-600 mb-1">
                  State
                </label>
                <input
                  id="vcard-state"
                  type="text"
                  {...register('state')}
                  placeholder="CA"
                  className="block w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="vcard-country" className="block text-xs font-medium text-slate-600 mb-1">
                  Country
                </label>
                <input
                  id="vcard-country"
                  type="text"
                  {...register('country')}
                  placeholder="USA"
                  className="block w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
