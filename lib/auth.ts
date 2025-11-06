import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

// Google OAuth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return await getUserData(userCredential.user.uid);
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  tenantId: string,
  displayName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Create user document in Firestore
  const userData: Omit<User, 'id'> = {
    tenantId,
    email,
    displayName,
    role: 'sales', // Default role
    permissions: ['view_dashboard', 'view_customers', 'edit_customers', 'view_leads', 'edit_leads'],
    status: 'active',
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    settings: {
      notifications: {
        email: true,
        sms: true,
        push: true,
        inApp: true,
      },
      language: 'en',
      timezone: 'UTC',
    },
  };

  await setDoc(doc(db, `tenants/${tenantId}/users`, userCredential.user.uid), userData);

  // Set custom claims via Cloud Function
  try {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();
    const setCustomClaimsFunc = httpsCallable(functions, 'setCustomClaims');
    await setCustomClaimsFunc({
      uid: userCredential.user.uid,
      tenantId,
      role: 'sales',
      permissions: userData.permissions,
    });
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }

  return {
    id: userCredential.user.uid,
    ...userData,
  } as User;
};

// Sign in with Google
export const signInWithGoogle = async (tenantId: string): Promise<User> => {
  const userCredential = await signInWithPopup(auth, googleProvider);

  // Check if user exists in tenant
  const userDocRef = doc(db, `tenants/${tenantId}/users`, userCredential.user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Create new user
    const userData: Omit<User, 'id'> = {
      tenantId,
      email: userCredential.user.email!,
      displayName: userCredential.user.displayName || userCredential.user.email!,
      photoURL: userCredential.user.photoURL || undefined,
      role: 'sales',
      permissions: ['view_dashboard', 'view_customers', 'edit_customers', 'view_leads', 'edit_leads'],
      status: 'active',
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      settings: {
        notifications: {
          email: true,
          sms: true,
          push: true,
          inApp: true,
        },
        language: 'en',
        timezone: 'UTC',
      },
    };

    await setDoc(userDocRef, userData);

    // Set custom claims via Cloud Function
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const setCustomClaimsFunc = httpsCallable(functions, 'setCustomClaims');
      await setCustomClaimsFunc({
        uid: userCredential.user.uid,
        tenantId,
        role: 'sales',
        permissions: userData.permissions,
      });
    } catch (error) {
      console.error('Error setting custom claims:', error);
    }

    return {
      id: userCredential.user.uid,
      ...userData,
    } as User;
  }

  return await getUserData(userCredential.user.uid);
};

// Phone authentication setup
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
};

// Send phone verification code
export const sendPhoneVerificationCode = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

// Verify phone code
export const verifyPhoneCode = async (
  confirmationResult: ConfirmationResult,
  code: string,
  tenantId: string
): Promise<User> => {
  const userCredential = await confirmationResult.confirm(code);

  // Check if user exists
  const userDocRef = doc(db, `tenants/${tenantId}/users`, userCredential.user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Create new user
    const userData: Omit<User, 'id'> = {
      tenantId,
      email: '', // Phone users might not have email
      phoneNumber: userCredential.user.phoneNumber || undefined,
      displayName: userCredential.user.phoneNumber || 'User',
      role: 'sales',
      permissions: ['view_dashboard', 'view_customers', 'edit_customers', 'view_leads', 'edit_leads'],
      status: 'active',
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      settings: {
        notifications: {
          email: false,
          sms: true,
          push: true,
          inApp: true,
        },
        language: 'en',
        timezone: 'UTC',
      },
    };

    await setDoc(userDocRef, userData);

    // Set custom claims via Cloud Function
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const setCustomClaimsFunc = httpsCallable(functions, 'setCustomClaims');
      await setCustomClaimsFunc({
        uid: userCredential.user.uid,
        tenantId,
        role: 'sales',
        permissions: userData.permissions,
      });
    } catch (error) {
      console.error('Error setting custom claims:', error);
    }

    return {
      id: userCredential.user.uid,
      ...userData,
    } as User;
  }

  return await getUserData(userCredential.user.uid);
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<User> => {
  // First, get the user's tenant ID from their auth token or a lookup collection
  // For now, we'll need to search across tenants or store a user->tenant mapping

  // This is a placeholder - in production, you'd have a user lookup table
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  return {
    id: uid,
    ...userData,
  } as User;
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user's custom claims
export const getUserClaims = async (): Promise<any> => {
  const user = auth.currentUser;
  if (!user) return null;

  const idTokenResult = await user.getIdTokenResult();
  return idTokenResult.claims;
};

// Refresh user token (to get updated custom claims)
export const refreshUserToken = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
    await user.getIdToken(true);
  }
};
