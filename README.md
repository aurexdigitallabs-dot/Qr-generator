# BrandQR Studio — Professional Vector & Logo QR Code Engine

A production-ready, mobile-first web application for generating customized, scannable QR codes with brand identity logos, custom color gradients, dot/corner styling, downloadable formats (High-Res PNG, SVG Vector), and design library management.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase** (Authentication, Cloud Firestore, Cloud Storage).

---

## 🚀 Key Features

### 1. 11 Supported QR Content Types
- **Website URL:** With protocol validation (`https://`) and clean deep linking.
- **Wi-Fi Network:** Supports WPA/WPA2/WPA3, WEP, unencrypted networks, and hidden SSIDs.
- **Digital vCard 3.0:** Full contact profile (Name, Title, Org, Mobile, Work Phone, Email, Website, Postal Address).
- **WhatsApp Direct Chat:** Direct `wa.me` deep link with prefilled message draft.
- **Plain Text:** Multiline notes, serial numbers, coupon codes.
- **Email:** Recipient address, subject line, and prefilled draft body.
- **Phone Call:** Native dialer trigger with international country code validation.
- **Instagram Profile:** Direct link with or without `@` handle.
- **YouTube:** Video or channel link with short URL support.
- **Google Maps:** Location name, address query, or GPS coordinates.
- **SMS Message:** Target phone number with prefilled SMS body.

### 2. High-Fidelity Brand Logo Integration
- Upload PNG, JPG, WebP, or SVG logos (Max 2MB with client-side validation).
- **Aspect-ratio preservation:** High-resolution offscreen canvas fits logos within safe bounds without stretching or distorting.
- **Logo Background Container:** Select between `Circle`, `Rounded`, `Square`, or `None (Transparent)`.
- **Custom Container Color:** Contrast backing with quiet margin.
- **Safe Scaling:** Slider limited to 15%–32% to prevent obscuring QR position markers.
- **Automatic Error Correction:** Upgraded to Level `H` (30% recovery) automatically when a logo is embedded.
- **One-Click Sample Logos:** Wi-Fi, Web Link, Instagram, Star, and Café icons for immediate testing.

### 3. QR Design Editor & Presets
- **Curated Presets:** *Precision Onyx*, *Electric Indigo*, *Emerald Heritage*, *Royal Amethyst*, *Sunset Terracotta*, *Titanium Matrix*.
- **Patterns & Geometry:**
  - Dots: `Rounded`, `Dots`, `Classy`, `Classy Soft`, `Square`, `Extra Rounded`.
  - Corner Frame: `Rounded Square`, `Classic Box`, `Single Dot`.
  - Corner Eye: `Inner Dot`, `Inner Square`.
- **Color Customization:** Solid foreground colors, Linear and Radial gradients, custom angles, and transparent background canvas toggle.
- **Quiet Zone Margin:** Slider control from 0px to 24px.
- **One-Click Restore:** Instant return to safe default design.

### 4. Scan Reliability & WCAG Contrast Analyzer
- Real-time mathematical calculation of WCAG 2.1 contrast ratio between foreground and background.
- Scannability rating index (0–100%) with visual progress indicator.
- Diagnostics for inverted codes, dense payload warnings, margin tightness, and error correction recommendations.

### 5. Multi-Format High-Resolution Export
- **PNG Raster:** Selectable resolution presets: Standard (512px), HD (1024px), Ultra Print (2048px).
- **SVG Vector:** Scalable vector format suitable for print, signage, and design tools.
- **Direct Clipboard Copy:** Copies raw PNG blob directly to OS clipboard.
- Clean QR-only export without surrounding UI frames.

### 6. Design Library & Authentication
- **Guest Mode:** Save designs directly in browser local storage without requiring registration.
- **Cloud Account:** Sign in with Google or Email/Password via Firebase Authentication.
- **Cloud Sync:** Save designs to Cloud Firestore and persist uploaded logos in Cloud Storage.
- **Library Management:** Search, Load back into editor, Duplicate, Rename, and Delete with confirmation.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4
- **QR Engine:** `qr-code-styling`
- **Form Management:** React Hook Form + Zod
- **Icons:** Lucide React + custom inline brand SVGs
- **Database & Auth:** Firebase Auth, Cloud Firestore, Cloud Storage

---

## 📋 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22.16.0)
- npm 9+

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 🔐 Firebase Configuration

To enable cloud authentication and sync across devices, create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Note:** If Firebase credentials are not provided, the application runs in **Guest Mode**, allowing full generation, customization, exports, and local library persistence without throwing any errors.

### Security Rules Included
- `firestore.rules`: Enforces user ownership (`request.auth.uid == userId`) and payload validation limits.
- `storage.rules`: Restricts logo uploads to authenticated owners with 2MB file size limits and valid image MIME types.

---

## 📱 Mobile-First Design & Viewports Tested

- **320px & 360px:** Small mobile devices (no horizontal overflow, fluid touch controls).
- **375px & 390px:** Standard iPhones (iPhone SE, iPhone 14/15).
- **414px & 430px:** Large phones (iPhone Pro Max, Galaxy Plus).
- **768px & 1024px:** Tablets & iPads.
- **1280px & 1440px+:** Desktop widescreen (two-column layout with sticky preview).
