import { z } from 'zod';

export const urlSchema = z.object({
  url: z
    .string()
    .min(1, 'Please enter a URL')
    .refine(
      (val) => {
        try {
          const testUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(val) ? val : `https://${val}`;
          new URL(testUrl);
          return val.includes('.');
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid website URL (e.g. yourbrand.com or https://example.com)' }
    ),
});

export const textSchema = z.object({
  text: z.string().min(1, 'Please enter text content').max(2000, 'Text cannot exceed 2000 characters'),
});

export const emailSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  subject: z.string().optional(),
  body: z.string().optional(),
});

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\+)?[\d\s\-()]{5,20}$/, 'Please enter a valid phone number with digits'),
});

export const whatsappSchema = z.object({
  phone: z
    .string()
    .min(1, 'WhatsApp phone number is required')
    .regex(/^(\+)?[\d\s\-()]{5,20}$/, 'Please enter a valid phone number with country code'),
  message: z.string().optional(),
});

export const wifiSchema = z.object({
  ssid: z.string().min(1, 'Network SSID name is required').max(64, 'SSID must be under 64 characters'),
  password: z.string().optional(),
  encryption: z.enum(['WPA', 'WEP', 'nopass']),
  hidden: z.boolean().default(false),
});

export const vcardSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  mobile: z.string().optional(),
  workPhone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  website: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
}).refine(
  (data) => Boolean((data.firstName && data.firstName.trim()) || (data.lastName && data.lastName.trim()) || (data.organization && data.organization.trim())),
  {
    message: 'Please provide at least a First Name, Last Name, or Organization',
    path: ['firstName'],
  }
);

export const instagramSchema = z.object({
  username: z.string().min(1, 'Please enter an Instagram handle or link'),
});

export const youtubeSchema = z.object({
  url: z
    .string()
    .min(1, 'Please enter a YouTube link')
    .refine(
      (val) => {
        return val.includes('youtube.com') || val.includes('youtu.be') || val.startsWith('http');
      },
      { message: 'Please enter a valid YouTube channel or video link' }
    ),
});

export const mapsSchema = z.object({
  query: z.string().min(1, 'Please enter a location, address, or GPS coordinates'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const smsSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\+)?[\d\s\-()]{5,20}$/, 'Please enter a valid phone number'),
  message: z.string().optional(),
});
