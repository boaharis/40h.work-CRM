import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onAuthStateChange, getUserClaims } from '@/lib/auth';
import { User } from '@/types';
import { useTenantStore } from '@/stores/tenantStore';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  claims: any;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    claims: null,
  });

  useEffect(() => {
    console.log('[useAuth] Setting up auth state listener');

    let unsubscribeUser: (() => void) | null = null;

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('[useAuth] Auth state changed, user:', firebaseUser?.email);

      if (firebaseUser) {
        try {
          // Get custom claims
          const claims = await getUserClaims();
          console.log('[useAuth] Custom claims:', claims);

          // Determine tenantId - try claims first, then fall back to demo
          let tenantId = claims?.tenantId || 'demo';
          console.log('[useAuth] Using tenant ID:', tenantId);

          console.log('[useAuth] Subscribing to user document at: tenants/' + tenantId + '/users/' + firebaseUser.uid);

          const userDocRef = doc(db, `tenants/${tenantId}/users`, firebaseUser.uid);

          unsubscribeUser = onSnapshot(
            userDocRef,
            (doc) => {
              console.log('[useAuth] User document snapshot received, exists:', doc.exists());

              if (doc.exists()) {
                const userData = {
                  id: doc.id,
                  ...doc.data(),
                } as User;

                console.log('[useAuth] User data loaded successfully:', userData.email);

                setAuthState({
                  user: userData,
                  firebaseUser,
                  loading: false,
                  claims: claims || { tenantId, role: userData.role, permissions: userData.permissions },
                });
              } else {
                console.error('[useAuth] User document not found at path');
                setAuthState({
                  user: null,
                  firebaseUser: null,
                  loading: false,
                  claims: null,
                });
              }
            },
            (error) => {
              console.error('[useAuth] Error listening to user document:', error);
              setAuthState({
                user: null,
                firebaseUser: null,
                loading: false,
                claims: null,
              });
            }
          );
        } catch (error) {
          console.error('[useAuth] Error in auth state handler:', error);
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            claims: null,
          });
        }
      } else {
        console.log('[useAuth] No firebase user, setting auth state to null');
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          claims: null,
        });
      }
    });

    return () => {
      console.log('[useAuth] Cleaning up auth state listener');
      unsubscribe();
      if (unsubscribeUser) {
        console.log('[useAuth] Cleaning up user document listener');
        unsubscribeUser();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return authState;
};

export const usePermissions = () => {
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
};
