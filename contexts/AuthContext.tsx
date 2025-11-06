'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onAuthStateChange, getUserClaims } from '@/lib/auth';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  claims: any;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    claims: null,
  });

  useEffect(() => {
    console.log('[AuthProvider] Setting up auth state listener');

    let unsubscribeUser: (() => void) | null = null;

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('[AuthProvider] Auth state changed, user:', firebaseUser?.email);

      if (firebaseUser) {
        try {
          // Get custom claims
          const claims = await getUserClaims();
          console.log('[AuthProvider] Custom claims:', claims);

          // Determine tenantId - try claims first, then fall back to demo
          let tenantId = claims?.tenantId || 'demo';
          console.log('[AuthProvider] Using tenant ID:', tenantId);

          console.log('[AuthProvider] Subscribing to user document at: tenants/' + tenantId + '/users/' + firebaseUser.uid);

          const userDocRef = doc(db, `tenants/${tenantId}/users`, firebaseUser.uid);

          unsubscribeUser = onSnapshot(
            userDocRef,
            (doc) => {
              console.log('[AuthProvider] User document snapshot received, exists:', doc.exists());

              if (doc.exists()) {
                const userData = {
                  id: doc.id,
                  ...doc.data(),
                } as User;

                console.log('[AuthProvider] User data loaded successfully:', userData.email);

                setAuthState({
                  user: userData,
                  firebaseUser,
                  loading: false,
                  claims: claims || { tenantId, role: userData.role, permissions: userData.permissions },
                });
              } else {
                console.error('[AuthProvider] User document not found at path');
                setAuthState({
                  user: null,
                  firebaseUser: null,
                  loading: false,
                  claims: null,
                });
              }
            },
            (error) => {
              console.error('[AuthProvider] Error listening to user document:', error);
              setAuthState({
                user: null,
                firebaseUser: null,
                loading: false,
                claims: null,
              });
            }
          );
        } catch (error) {
          console.error('[AuthProvider] Error in auth state handler:', error);
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            claims: null,
          });
        }
      } else {
        console.log('[AuthProvider] No firebase user, setting auth state to null');
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          claims: null,
        });
      }
    });

    return () => {
      console.log('[AuthProvider] Cleaning up auth state listener');
      unsubscribe();
      if (unsubscribeUser) {
        console.log('[AuthProvider] Cleaning up user document listener');
        unsubscribeUser();
      }
    };
  }, []);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function usePermissions() {
  const { user, claims } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user || !claims) return false;
    return claims.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    if (!claims) return false;
    return claims.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!claims) return false;
    return roles.includes(claims.role);
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('admin'),
    isManager: hasRole('manager'),
  };
}
