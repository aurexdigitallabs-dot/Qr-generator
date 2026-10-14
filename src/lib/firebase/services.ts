import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage, googleProvider, isFirebaseConfigured } from './client';
import { SavedQRCode } from '@/types/qr';

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not configured. Please set your Firebase credentials in environment variables.');
  }
  return signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please set your Firebase credentials in environment variables.');
  }
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please set your Firebase credentials in environment variables.');
  }
  return createUserWithEmailAndPassword(auth, email, pass);
}

export async function resetPassword(email: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please set your Firebase credentials in environment variables.');
  }
  return sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  if (!isFirebaseConfigured || !auth) return;
  return signOut(auth);
}

/**
 * Uploads logo to Firebase Storage to avoid storing large base64 strings in Firestore
 */
export async function uploadLogoAsset(userId: string, qrId: string, logoDataUrl: string): Promise<string> {
  if (!isFirebaseConfigured || !storage) return '';

  try {
    const response = await fetch(logoDataUrl);
    const blob = await response.blob();
    const logoRef = ref(storage, `users/${userId}/logos/${qrId}.png`);
    await uploadBytes(logoRef, blob, { contentType: 'image/png' });
    return await getDownloadURL(logoRef);
  } catch (err) {
    console.error('Failed to upload logo to Firebase Storage:', err);
    return '';
  }
}

/**
 * Saves or updates a QR code in Firestore for the authenticated user
 */
export async function saveQRCodeToFirestore(
  userId: string,
  qr: SavedQRCode,
  logoDataUrl?: string
): Promise<SavedQRCode> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  let finalLogoUrl = qr.design.logo.dataUrl;

  // If there is a new dataUrl that starts with data: and storage is available, upload it
  if (logoDataUrl && logoDataUrl.startsWith('data:') && storage) {
    const uploadedUrl = await uploadLogoAsset(userId, qr.id, logoDataUrl);
    if (uploadedUrl) {
      finalLogoUrl = uploadedUrl;
    }
  }

  // Sanitize design to avoid saving huge base64 in firestore
  const sanitizedDesign = {
    ...qr.design,
    logo: {
      ...qr.design.logo,
      dataUrl: finalLogoUrl?.startsWith('data:') ? '' : finalLogoUrl,
      rawImageUrl: undefined,
    },
  };

  const userQrDocRef = doc(db, `users/${userId}/qrcodes`, qr.id);

  const docPayload = {
    id: qr.id,
    userId,
    name: qr.name,
    type: qr.type,
    contentData: qr.contentData,
    encodedString: qr.encodedString,
    design: sanitizedDesign,
    logoUrl: finalLogoUrl || null,
    createdAt: qr.createdAt || Date.now(),
    updatedAt: Date.now(),
    serverTimestamp: serverTimestamp(),
  };

  await setDoc(userQrDocRef, docPayload, { merge: true });

  return {
    ...qr,
    design: {
      ...qr.design,
      logo: {
        ...qr.design.logo,
        dataUrl: finalLogoUrl,
      },
    },
  };
}

/**
 * Fetches all saved QR codes for the authenticated user
 */
export async function getQRCodesFromFirestore(userId: string): Promise<SavedQRCode[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const qrsRef = collection(db, `users/${userId}/qrcodes`);
    const q = query(qrsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: data.id || docSnap.id,
        userId: data.userId,
        name: data.name || 'Untitled QR',
        type: data.type || 'url',
        contentData: data.contentData || {},
        encodedString: data.encodedString || '',
        design: {
          ...data.design,
          logo: {
            ...data.design?.logo,
            dataUrl: data.logoUrl || data.design?.logo?.dataUrl || '',
          },
        },
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt || Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt || Date.now(),
      } as SavedQRCode;
    });
  } catch (err) {
    console.error('Error fetching QR codes from Firestore:', err);
    return [];
  }
}

/**
 * Deletes a QR code and its associated logo asset
 */
export async function deleteQRCodeFromFirestore(userId: string, qrId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const docRef = doc(db, `users/${userId}/qrcodes`, qrId);
  await deleteDoc(docRef);

  if (storage) {
    try {
      const logoRef = ref(storage, `users/${userId}/logos/${qrId}.png`);
      await deleteObject(logoRef);
    } catch {
      // Ignored if file didn't exist
    }
  }
}
