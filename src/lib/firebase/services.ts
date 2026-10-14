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
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './client';
import { SavedQRCode } from '@/types/qr';

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Translates Firebase Auth error codes to helpful user guidance
 */
export function formatAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in your Firebase Console yet. Please enable Email/Password or Google in Firebase Console > Authentication > Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in your Firebase project. Please add localhost to Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    default:
      return err?.message || 'Authentication error occurred.';
  }
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not configured. Please check your credentials.');
  }
  return signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please check your credentials.');
  }
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please check your credentials.');
  }
  return createUserWithEmailAndPassword(auth, email, pass);
}

export async function resetPassword(email: string) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please check your credentials.');
  }
  return sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  if (!isFirebaseConfigured || !auth) return;
  return signOut(auth);
}

/**
 * Recursively cleans objects to remove any undefined fields that cause Firestore errors
 */
function cleanFirestoreData(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Saves or updates a QR code in Firestore for the authenticated user
 */
export async function saveQRCodeToFirestore(
  userId: string,
  qr: SavedQRCode,
  logoUrl?: string
): Promise<SavedQRCode> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const finalLogoUrl = logoUrl || qr.design.logo.dataUrl || null;

  // Sanitize design to avoid saving huge base64 in firestore
  const sanitizedDesign = {
    ...qr.design,
    logo: {
      ...qr.design.logo,
      dataUrl: finalLogoUrl?.startsWith('data:') ? null : finalLogoUrl,
      rawImageUrl: null,
    },
  };

  const userQrDocRef = doc(db, `users/${userId}/qrcodes`, qr.id);

  const rawDocPayload = {
    id: qr.id,
    userId,
    name: qr.name,
    type: qr.type,
    contentData: qr.contentData,
    encodedString: qr.encodedString,
    design: sanitizedDesign,
    logoUrl: finalLogoUrl,
    createdAt: qr.createdAt || Date.now(),
    updatedAt: Date.now(),
    serverTimestamp: serverTimestamp(),
  };

  const safePayload = cleanFirestoreData(rawDocPayload);

  await setDoc(userQrDocRef, safePayload, { merge: true });

  return {
    ...qr,
    design: {
      ...qr.design,
      logo: {
        ...qr.design.logo,
        dataUrl: finalLogoUrl || undefined,
      },
    },
  };
}

/**
 * Fetches all saved QR codes for the authenticated user from Firestore
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
            dataUrl: data.logoUrl || data.design?.logo?.dataUrl || undefined,
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
 * Deletes a QR code from Firestore
 */
export async function deleteQRCodeFromFirestore(userId: string, qrId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const docRef = doc(db, `users/${userId}/qrcodes`, qrId);
  await deleteDoc(docRef);
}

/**
 * Subscribes to real-time updates for user's QR codes from Firestore
 */
export function subscribeToUserQRCodes(
  userId: string,
  onData: (codes: SavedQRCode[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  try {
    const qrsRef = collection(db, `users/${userId}/qrcodes`);
    const q = query(qrsRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const codes = snapshot.docs.map((docSnap) => {
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
                dataUrl: data.logoUrl || data.design?.logo?.dataUrl || undefined,
              },
            },
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toMillis()
                : data.createdAt || Date.now(),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toMillis()
                : data.updatedAt || Date.now(),
          } as SavedQRCode;
        });
        onData(codes);
      },
      (err) => {
        console.warn('Real-time sync snapshot error (falling back to local):', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Could not establish real-time Firestore listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

