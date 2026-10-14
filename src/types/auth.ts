export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export type AuthMode = 'sign_in' | 'sign_up' | 'forgot_password';
