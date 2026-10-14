import { QRContentType } from '@/types/qr';

export interface VCardData {
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  mobile?: string;
  workPhone?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface WifiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
}

export interface SmsData {
  phone: string;
  message?: string;
}

export interface MapsData {
  query: string;
  latitude?: string;
  longitude?: string;
}

function escapeWifiString(str: string): string {
  return str.replace(/([\\;,":])/g, '\\$1');
}

export function encodePayload(type: QRContentType, data: Record<string, any>): string {
  switch (type) {
    case 'url': {
      const raw = (data.url || '').trim();
      if (!raw) return '';
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(raw)) {
        return raw;
      }
      return `https://${raw}`;
    }

    case 'text': {
      return (data.text || '').trim();
    }

    case 'email': {
      const email = (data.email || '').trim();
      if (!email) return '';
      const params: string[] = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      return `mailto:${email}${params.length > 0 ? `?${params.join('&')}` : ''}`;
    }

    case 'phone': {
      const phone = (data.phone || '').trim().replace(/[\s()-]/g, '');
      if (!phone) return '';
      return `tel:${phone}`;
    }

    case 'whatsapp': {
      const phone = (data.phone || '').trim().replace(/[^\d+]/g, '').replace(/^\+/, '');
      if (!phone) return '';
      const message = (data.message || '').trim();
      return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    }

    case 'wifi': {
      const ssid = (data.ssid || '').trim();
      if (!ssid) return '';
      const encryption = data.encryption || 'WPA';
      const password = data.password || '';
      const hidden = data.hidden ? 'true' : 'false';
      
      const escapedSsid = escapeWifiString(ssid);
      const escapedPassword = password ? escapeWifiString(password) : '';
      
      return `WIFI:T:${encryption};S:${escapedSsid};P:${escapedPassword};H:${hidden};;`;
    }

    case 'vcard': {
      const fn = (data.firstName || '').trim();
      const ln = (data.lastName || '').trim();
      if (!fn && !ln && !data.organization) return '';

      const fullName = [fn, ln].filter(Boolean).join(' ') || data.organization || 'Contact';

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${ln};${fn};;;`,
        `FN:${fullName}`,
      ];

      if (data.organization) lines.push(`ORG:${data.organization}`);
      if (data.title) lines.push(`TITLE:${data.title}`);
      if (data.workPhone) lines.push(`TEL;TYPE=WORK,VOICE:${data.workPhone}`);
      if (data.mobile) lines.push(`TEL;TYPE=CELL,VOICE:${data.mobile}`);
      if (data.email) lines.push(`EMAIL;TYPE=PREF,INTERNET:${data.email}`);
      if (data.website) {
        const web = data.website.startsWith('http') ? data.website : `https://${data.website}`;
        lines.push(`URL:${web}`);
      }
      
      const adrParts = [
        '', // pobox
        '', // ext
        data.street || '',
        data.city || '',
        data.state || '',
        data.postalCode || '',
        data.country || '',
      ];
      if (adrParts.some(Boolean)) {
        lines.push(`ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.postalCode || ''};${data.country || ''}`);
      }

      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'instagram': {
      const input = (data.username || '').trim();
      if (!input) return '';
      if (input.startsWith('http')) return input;
      const cleanUsername = input.replace(/^@/, '');
      return `https://instagram.com/${cleanUsername}`;
    }

    case 'youtube': {
      const url = (data.url || '').trim();
      if (!url) return '';
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(url)) return url;
      return `https://${url}`;
    }

    case 'maps': {
      const query = (data.query || '').trim();
      const lat = (data.latitude || '').trim();
      const lng = (data.longitude || '').trim();

      if (lat && lng) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
      if (query) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      }
      return '';
    }

    case 'sms': {
      const phone = (data.phone || '').trim().replace(/[\s()-]/g, '');
      if (!phone) return '';
      const message = (data.message || '').trim();
      return `smsto:${phone}:${message}`;
    }

    default:
      return '';
  }
}
