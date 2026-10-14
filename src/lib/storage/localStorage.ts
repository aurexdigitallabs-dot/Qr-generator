import { SavedQRCode, QRDownloadHistoryItem } from '@/types/qr';

const STORAGE_KEY = 'qr_brand_studio_saved_codes_v1';
const HISTORY_STORAGE_KEY = 'qr_brand_studio_download_history_v1';

export function getLocalSavedQRCodes(): SavedQRCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read saved QR codes from local storage:', err);
    return [];
  }
}

export function saveLocalQRCode(qr: SavedQRCode): SavedQRCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalSavedQRCodes();
    const index = existing.findIndex((item) => item.id === qr.id);
    let updated: SavedQRCode[];

    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...qr, updatedAt: Date.now() };
    } else {
      updated = [qr, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save QR code to local storage:', err);
    return getLocalSavedQRCodes();
  }
}

export function deleteLocalQRCode(id: string): SavedQRCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalSavedQRCodes();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete QR code from local storage:', err);
    return getLocalSavedQRCodes();
  }
}

export function renameLocalQRCode(id: string, newName: string): SavedQRCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalSavedQRCodes();
    const updated = existing.map((item) =>
      item.id === id ? { ...item, name: newName.trim() || 'Untitled QR', updatedAt: Date.now() } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to rename QR code in local storage:', err);
    return getLocalSavedQRCodes();
  }
}

export function getLocalDownloadHistory(): QRDownloadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read download history from local storage:', err);
    return [];
  }
}

export function saveLocalDownloadHistory(item: QRDownloadHistoryItem): QRDownloadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalDownloadHistory();
    const updated = [item, ...existing.filter((i) => i.id !== item.id)];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save history to local storage:', err);
    return getLocalDownloadHistory();
  }
}

export function deleteLocalDownloadHistory(id: string): QRDownloadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getLocalDownloadHistory();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete history item from local storage:', err);
    return getLocalDownloadHistory();
  }
}

export function clearLocalDownloadHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear download history in local storage:', err);
  }
}

