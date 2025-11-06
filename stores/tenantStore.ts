import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '@/types';

interface TenantStore {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  updateBranding: (branding: Partial<Tenant['branding']>) => void;
  updateConfig: (config: Partial<Tenant['config']>) => void;
  updateFeatures: (features: Partial<Tenant['features']>) => void;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      tenant: null,

      setTenant: (tenant) => set({ tenant }),

      updateBranding: (branding) =>
        set((state) => ({
          tenant: state.tenant
            ? {
                ...state.tenant,
                branding: {
                  ...state.tenant.branding,
                  ...branding,
                },
              }
            : null,
        })),

      updateConfig: (config) =>
        set((state) => ({
          tenant: state.tenant
            ? {
                ...state.tenant,
                config: {
                  ...state.tenant.config,
                  ...config,
                },
              }
            : null,
        })),

      updateFeatures: (features) =>
        set((state) => ({
          tenant: state.tenant
            ? {
                ...state.tenant,
                features: {
                  ...state.tenant.features,
                  ...features,
                },
              }
            : null,
        })),
    }),
    {
      name: 'tenant-storage',
    }
  )
);
