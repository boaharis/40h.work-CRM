import { useState, useEffect } from 'react';
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

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    claims: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Get custom claims
        const claims = await getUserClaims();

        // Subscribe to user document in Firestore
        if (claims?.tenantId) {
          const userDocRef = doc(db, `tenants/${claims.tenantId}/users`, firebaseUser.uid);

          const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const userData = {
                id: doc.id,
                ...doc.data(),
              } as User;

              setAuthState({
                user: userData,
                firebaseUser,
                loading: false,
                claims,
              });
            } else {
              setAuthState({
                user: null,
                firebaseUser: null,
                loading: false,
                claims: null,
              });
            }
          });

          return () => unsubscribeUser();
        }
      } else {
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          claims: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

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
