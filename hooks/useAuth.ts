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
  const { tenant } = useTenantStore();

  useEffect(() => {
    console.log('[useAuth] Setting up auth state listener');
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('[useAuth] Auth state changed, user:', firebaseUser?.email);

      if (firebaseUser) {
        // Get custom claims
        const claims = await getUserClaims();
        console.log('[useAuth] Custom claims:', claims);

        // Determine tenantId - try claims first, then fall back to tenant store
        let tenantId = claims?.tenantId || tenant?.id;
        console.log('[useAuth] Tenant ID:', tenantId);

        // If no tenantId from claims or store, try to find user in any tenant (for development)
        if (!tenantId) {
          console.log('[useAuth] No tenantId found, searching for user across tenants...');
          // This is a fallback - in production, always use claims or tenant store
          // For now, default to 'demo' tenant
          tenantId = 'demo';
        }

        if (tenantId) {
          console.log('[useAuth] Subscribing to user document at: tenants/' + tenantId + '/users/' + firebaseUser.uid);
          const userDocRef = doc(db, `tenants/${tenantId}/users`, firebaseUser.uid);

          const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            console.log('[useAuth] User document snapshot, exists:', doc.exists());

            if (doc.exists()) {
              const userData = {
                id: doc.id,
                ...doc.data(),
              } as User;

              console.log('[useAuth] User data loaded:', userData.email);

              setAuthState({
                user: userData,
                firebaseUser,
                loading: false,
                claims: claims || { tenantId, role: userData.role, permissions: userData.permissions },
              });
            } else {
              console.error('[useAuth] User document not found');
              setAuthState({
                user: null,
                firebaseUser: null,
                loading: false,
                claims: null,
              });
            }
          }, (error) => {
            console.error('[useAuth] Error listening to user document:', error);
            setAuthState({
              user: null,
              firebaseUser: null,
              loading: false,
              claims: null,
            });
          });

          return () => {
            console.log('[useAuth] Unsubscribing from user document');
            unsubscribeUser();
          };
        } else {
          console.error('[useAuth] Could not determine tenantId');
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
    };
  }, [tenant]);

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
