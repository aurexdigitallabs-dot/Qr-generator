'use client';

import React from 'react';
import { QRContentType } from '@/types/qr';
import {
  Globe,
  AlignLeft,
  Mail,
  Phone,
  MessageCircle,
  Wifi,
  Contact,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

export interface QRTypeOption {
  type: QRContentType;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const QR_TYPE_OPTIONS: QRTypeOption[] = [
  {
    type: 'url',
    label: 'Website URL',
    shortLabel: 'URL',
    icon: Globe,
    description: 'Open any webpage, landing page, or web link',
  },
  {
    type: 'wifi',
    label: 'Wi-Fi Network',
    shortLabel: 'Wi-Fi',
    icon: Wifi,
    description: 'Connect to home or office Wi-Fi network instantly',
  },
  {
    type: 'vcard',
    label: 'Digital vCard',
    shortLabel: 'vCard',
    icon: Contact,
    description: 'Full digital business card and contact profile',
  },
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    shortLabel: 'WhatsApp',
    icon: MessageCircle,
    description: 'Direct WhatsApp chat with pre-written message',
  },
  {
    type: 'text',
    label: 'Plain Text',
    shortLabel: 'Text',
    icon: AlignLeft,
    description: 'Display raw text, secret code, or note on scan',
  },
  {
    type: 'email',
    label: 'Email',
    shortLabel: 'Email',
    icon: Mail,
    description: 'Send prefilled email to a chosen address',
  },
  {
    type: 'phone',
    label: 'Phone Call',
    shortLabel: 'Phone',
    icon: Phone,
    description: 'Prompt native phone dialer with phone number',
  },
  {
    type: 'instagram',
    label: 'Instagram',
    shortLabel: 'Instagram',
    icon: InstagramIcon,
    description: 'Link directly to an Instagram profile',
  },
  {
    type: 'youtube',
    label: 'YouTube',
    shortLabel: 'YouTube',
    icon: YoutubeIcon,
    description: 'Direct link to a YouTube video or channel',
  },
  {
    type: 'maps',
    label: 'Google Maps',
    shortLabel: 'Maps',
    icon: MapPin,
    description: 'Open address or GPS location in Maps app',
  },
  {
    type: 'sms',
    label: 'SMS Message',
    shortLabel: 'SMS',
    icon: MessageSquare,
    description: 'Compose prefilled SMS message to a phone number',
  },
];

interface QRTypeSelectorProps {
  selectedType: QRContentType;
  onSelect: (type: QRContentType) => void;
}

export function QRTypeSelector({ selectedType, onSelect }: QRTypeSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Select QR Content Type
        </span>
        <span className="text-xs text-slate-400 font-mono">11 standard formats</span>
      </div>

      {/* Horizontally scrollable on mobile, compact multi-row flex on desktop */}
      <div
        role="tablist"
        aria-label="QR Code Content Types"
        className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap scroll-smooth"
      >
        {QR_TYPE_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;

          return (
            <button
              key={item.type}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(item.type)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border select-none',
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon
                className={cn(
                  'w-3.5 h-3.5',
                  isSelected ? 'text-indigo-400' : 'text-slate-500'
                )}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
