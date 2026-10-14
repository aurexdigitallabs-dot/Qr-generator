'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QRTypeSelector, QR_TYPE_OPTIONS } from '@/components/qr/QRTypeSelector';
import { QRPreview, QRPreviewRef } from '@/components/qr/QRPreview';
import { QRDesignEditor } from '@/components/qr/QRDesignEditor';
import { QRExportActions } from '@/components/qr/QRExportActions';
import { SavedQRCodesModal } from '@/components/saved/SavedQRCodesModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useToast } from '@/components/ui/Toast';

// Form components
import { UrlForm } from '@/components/qr/forms/UrlForm';
import { TextForm } from '@/components/qr/forms/TextForm';
import { EmailForm } from '@/components/qr/forms/EmailForm';
import { PhoneForm } from '@/components/qr/forms/PhoneForm';
import { WifiForm } from '@/components/qr/forms/WifiForm';
import { VCardForm } from '@/components/qr/forms/VCardForm';
import { WhatsappForm } from '@/components/qr/forms/WhatsappForm';
import { InstagramForm } from '@/components/qr/forms/InstagramForm';
import { YoutubeForm } from '@/components/qr/forms/YoutubeForm';
import { MapsForm } from '@/components/qr/forms/MapsForm';
import { SmsForm } from '@/components/qr/forms/SmsForm';

// Data types & encoders
import { QRContentType, QRDesignSettings, SavedQRCode, ExportFormat, ExportResolution } from '@/types/qr';
import { AppUser } from '@/types/auth';
import { DEFAULT_DESIGN } from '@/lib/qr/presets';
import { encodePayload } from '@/lib/qr/encoders';
import {
  getLocalSavedQRCodes,
  saveLocalQRCode,
  deleteLocalQRCode,
  renameLocalQRCode,
} from '@/lib/storage/localStorage';
import {
  subscribeToAuth,
  logoutUser,
  saveQRCodeToFirestore,
  getQRCodesFromFirestore,
  deleteQRCodeFromFirestore,
} from '@/lib/firebase/services';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { Bookmark, Sparkles, Shield, ArrowDown, Check } from 'lucide-react';

export default function HomePage() {
  const { success, error, info } = useToast();
  const previewRef = useRef<QRPreviewRef>(null);

  // Auth state
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Generator state
  const [selectedType, setSelectedType] = useState<QRContentType>('url');
  const [formData, setFormData] = useState<Record<string, any>>({
    url: 'https://google.com',
  });
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [encodedPayload, setEncodedPayload] = useState<string>('https://google.com');

  // Design state
  const [design, setDesign] = useState<QRDesignSettings>(DEFAULT_DESIGN);
  const [saveName, setSaveName] = useState<string>('My Brand QR');

  // Saved codes state
  const [savedCodes, setSavedCodes] = useState<SavedQRCode[]>([]);

  // Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync saved QR codes when user changes
  const loadSavedCodes = useCallback(async () => {
    if (user && isFirebaseConfigured) {
      try {
        const cloudCodes = await getQRCodesFromFirestore(user.uid);
        setSavedCodes(cloudCodes);
      } catch {
        const local = getLocalSavedQRCodes();
        setSavedCodes(local);
      }
    } else {
      const local = getLocalSavedQRCodes();
      setSavedCodes(local);
    }
  }, [user]);

  useEffect(() => {
    loadSavedCodes();
  }, [loadSavedCodes]);

  const lastDataRef = useRef<string>('');

  // Handle form data change and update payload
  const handleFormChange = useCallback(
    (data: Record<string, any>, valid: boolean) => {
      const serialized = JSON.stringify({ data, valid, selectedType });
      if (lastDataRef.current === serialized) {
        return;
      }
      lastDataRef.current = serialized;

      setFormData(data);
      setIsFormValid(valid);
      if (valid) {
        const payload = encodePayload(selectedType, data);
        setEncodedPayload(payload);
      } else {
        setEncodedPayload('');
      }
    },
    [selectedType]
  );

  // Switch type and initialize default data for that type
  const handleTypeSelect = (type: QRContentType) => {
    setSelectedType(type);
    let initialTypeData: Record<string, any> = {};

    switch (type) {
      case 'url':
        initialTypeData = { url: 'https://google.com' };
        break;
      case 'text':
        initialTypeData = { text: 'Welcome to Brand QR Studio' };
        break;
      case 'email':
        initialTypeData = { email: 'hello@example.com', subject: 'Inquiry', body: 'Hi!' };
        break;
      case 'phone':
        initialTypeData = { phone: '+1 555 234 5678' };
        break;
      case 'wifi':
        initialTypeData = { ssid: 'Guest-WiFi', password: 'Password123', encryption: 'WPA' };
        break;
      case 'vcard':
        initialTypeData = { firstName: 'Alex', lastName: 'Morgan', organization: 'Design Studio' };
        break;
      case 'whatsapp':
        initialTypeData = { phone: '+1 555 987 6543', message: 'Hello! I saw your QR code.' };
        break;
      case 'instagram':
        initialTypeData = { username: 'studio' };
        break;
      case 'youtube':
        initialTypeData = { url: 'https://www.youtube.com/@veritasium' };
        break;
      case 'maps':
        initialTypeData = { query: 'Times Square, New York' };
        break;
      case 'sms':
        initialTypeData = { phone: '+1 555 765 4321', message: 'PROMO CODE' };
        break;
    }

    setFormData(initialTypeData);
    const initialPayload = encodePayload(type, initialTypeData);
    setEncodedPayload(initialPayload);
    setIsFormValid(true);
  };

  // Reset design settings to defaults
  const handleResetDesign = () => {
    setDesign(DEFAULT_DESIGN);
    success('Design restored to safe defaults.');
  };

  // Handle saving the current QR code
  const handleSaveCode = async () => {
    if (!isFormValid || !encodedPayload) {
      error('Please complete valid QR content before saving.');
      return;
    }

    const qrRecord: SavedQRCode = {
      id: `qr-${Date.now()}`,
      userId: user?.uid,
      name: saveName.trim() || `${selectedType.toUpperCase()} QR`,
      type: selectedType,
      contentData: formData,
      encodedString: encodedPayload,
      design: design,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (user && isFirebaseConfigured) {
      try {
        await saveQRCodeToFirestore(user.uid, qrRecord, design.logo.dataUrl);
        await loadSavedCodes();
        success('Design saved to your cloud account!');
      } catch (err: any) {
        error(err.message || 'Failed to save to cloud. Saved locally instead.');
        const updated = saveLocalQRCode(qrRecord);
        setSavedCodes(updated);
      }
    } else {
      const updated = saveLocalQRCode(qrRecord);
      setSavedCodes(updated);
      success('Design saved to your browser storage!');
    }
  };

  // Handle loading a saved QR code into the editor
  const handleLoadCode = (code: SavedQRCode) => {
    setSelectedType(code.type);
    setFormData(code.contentData || {});
    setEncodedPayload(code.encodedString || '');
    setIsFormValid(true);
    setDesign(code.design);
    setSaveName(code.name);
    success(`Loaded "${code.name}" into editor.`);
  };

  // Handle duplicating a saved QR code
  const handleDuplicateCode = async (code: SavedQRCode) => {
    const dup: SavedQRCode = {
      ...code,
      id: `qr-${Date.now()}`,
      name: `${code.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (user && isFirebaseConfigured) {
      try {
        await saveQRCodeToFirestore(user.uid, dup);
        await loadSavedCodes();
        success(`Duplicated "${code.name}".`);
      } catch {
        const updated = saveLocalQRCode(dup);
        setSavedCodes(updated);
        success(`Duplicated "${code.name}" locally.`);
      }
    } else {
      const updated = saveLocalQRCode(dup);
      setSavedCodes(updated);
      success(`Duplicated "${code.name}".`);
    }
  };

  // Handle renaming a saved QR code
  const handleRenameCode = async (id: string, newName: string) => {
    if (user && isFirebaseConfigured) {
      const existing = savedCodes.find((c) => c.id === id);
      if (existing) {
        try {
          await saveQRCodeToFirestore(user.uid, { ...existing, name: newName });
          await loadSavedCodes();
          success('Renamed successfully.');
        } catch {
          const updated = renameLocalQRCode(id, newName);
          setSavedCodes(updated);
        }
      }
    } else {
      const updated = renameLocalQRCode(id, newName);
      setSavedCodes(updated);
      success('Renamed successfully.');
    }
  };

  // Handle deleting a saved QR code
  const handleDeleteCode = async (id: string) => {
    if (user && isFirebaseConfigured) {
      try {
        await deleteQRCodeFromFirestore(user.uid, id);
        await loadSavedCodes();
        info('QR code deleted.');
      } catch {
        const updated = deleteLocalQRCode(id);
        setSavedCodes(updated);
        info('QR code deleted locally.');
      }
    } else {
      const updated = deleteLocalQRCode(id);
      setSavedCodes(updated);
      info('QR code deleted.');
    }
  };

  // Download QR code export
  const handleDownloadQR = async (format: ExportFormat, resolution: ExportResolution, fileName: string) => {
    if (!previewRef.current) return;
    try {
      await previewRef.current.downloadQR(format, resolution, fileName);
      success(`${format.toUpperCase()} downloaded successfully at ${resolution}px!`);
    } catch (err: any) {
      error(err.message || 'Failed to download QR code.');
    }
  };

  // Copy QR image to clipboard
  const handleCopyToClipboard = async () => {
    if (!previewRef.current) return;
    try {
      await previewRef.current.copyToClipboard();
      success('QR Code copied to clipboard as image!');
    } catch (err: any) {
      error(err.message || 'Clipboard copy failed.');
    }
  };

  const currentTypeConfig = QR_TYPE_OPTIONS.find((t) => t.type === selectedType);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        user={user}
        savedCount={savedCodes.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={async () => {
          await logoutUser();
          setUser(null);
          success('Signed out.');
          loadSavedCodes();
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Intro Tagline */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Professional Vector & Logo QR Studio</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Static Lifetime Direct Code
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Design, customize, and export scannable QR codes
            </h2>
          </div>

          {/* Quick jump to preview on small screens */}
          <div className="sm:hidden flex items-center gap-2">
            <a
              href="#qr-preview-section"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Jump to Preview</span>
            </a>
          </div>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Content Forms & Design Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Content Type Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <QRTypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />
            </div>

            {/* Step 2: Content Input Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentTypeConfig?.label} Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentTypeConfig?.description}
                  </p>
                </div>
                <span className="text-[11px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                  Step 1
                </span>
              </div>

              {/* Dynamic Form Render based on selected type */}
              <div>
                {selectedType === 'url' && (
                  <UrlForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'text' && (
                  <TextForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'email' && (
                  <EmailForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'phone' && (
                  <PhoneForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'wifi' && (
                  <WifiForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'vcard' && (
                  <VCardForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'whatsapp' && (
                  <WhatsappForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'instagram' && (
                  <InstagramForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'youtube' && (
                  <YoutubeForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'maps' && (
                  <MapsForm initialData={formData} onChange={handleFormChange} />
                )}
                {selectedType === 'sms' && (
                  <SmsForm initialData={formData} onChange={handleFormChange} />
                )}
              </div>
            </div>

            {/* Step 3: Design Customization Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Step 2 · Brand Identity & Geometry
                </span>
              </div>
              <QRDesignEditor
                design={design}
                onChange={setDesign}
                onReset={handleResetDesign}
                onError={(msg) => error(msg)}
              />
            </div>

            {/* Save Design Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-auto flex-1">
                <label htmlFor="save-qr-name" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Save Custom Design
                </label>
                <input
                  id="save-qr-name"
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Website Footer QR"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCode}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer select-none active:scale-[0.99] self-end"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save to Library</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live QR Preview & Actions (5 cols - sticky on desktop) */}
          <div id="qr-preview-section" className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Live QR Preview & Scan Reliability */}
            <QRPreview
              ref={previewRef}
              payload={encodedPayload}
              hasValidPayload={isFormValid}
              design={design}
              typeName={currentTypeConfig?.label || 'QR Code'}
            />

            {/* Export & Download Controls */}
            <QRExportActions
              hasValidPayload={isFormValid}
              onDownload={handleDownloadQR}
              onCopyToClipboard={handleCopyToClipboard}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Saved QR Codes Modal */}
      <SavedQRCodesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedCodes={savedCodes}
        isAuthenticated={Boolean(user)}
        onLoadCode={handleLoadCode}
        onDuplicateCode={handleDuplicateCode}
        onRenameCode={handleRenameCode}
        onDeleteCode={handleDeleteCode}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => {
          success(msg);
          loadSavedCodes();
        }}
      />
    </div>
  );
}
