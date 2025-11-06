'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useTenantStore } from '@/stores/tenantStore';
import { getTenantFromHostname, getTenantConfig } from '@/lib/tenant';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { setTenant } = useTenantStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        const hostname = window.location.hostname;
        console.log('[Providers] Loading tenant for hostname:', hostname);

        const tenantId = getTenantFromHostname(hostname);
        console.log('[Providers] Tenant ID:', tenantId);

        if (tenantId) {
          console.log('[Providers] Fetching tenant config for:', tenantId);
          const tenantConfig = await getTenantConfig(tenantId);

          if (tenantConfig) {
            console.log('[Providers] Tenant config loaded successfully:', tenantConfig.branding.companyName);
            setTenant(tenantConfig);

            // Apply theme colors
            const root = document.documentElement;
            const colors = tenantConfig.branding.colorPalette.primary;
            Object.entries(colors).forEach(([shade, color]) => {
              root.style.setProperty(`--color-primary-${shade}`, color);
            });

            // Update page title and favicon
            document.title = tenantConfig.branding.companyName;
            if (tenantConfig.branding.faviconUrl) {
              const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
              link.type = 'image/x-icon';
              link.rel = 'shortcut icon';
              link.href = tenantConfig.branding.faviconUrl;
              document.getElementsByTagName('head')[0].appendChild(link);
            }
          } else {
            console.error('[Providers] No tenant config found for:', tenantId);
          }
        } else {
          console.error('[Providers] Could not determine tenant ID from hostname:', hostname);
        }
      } catch (error) {
        console.error('[Providers] Error loading tenant configuration:', error);
        if (error instanceof Error) {
          console.error('[Providers] Error message:', error.message);
          console.error('[Providers] Error stack:', error.stack);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [setTenant]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
