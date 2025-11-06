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
        const tenantId = getTenantFromHostname(hostname);

        if (tenantId) {
          const tenantConfig = await getTenantConfig(tenantId);
          if (tenantConfig) {
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
          }
        }
      } catch (error) {
        console.error('Error loading tenant configuration:', error);
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
