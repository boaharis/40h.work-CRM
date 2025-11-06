'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenantStore } from '@/stores/tenantStore';
import { usePermissions } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { tenant } = useTenantStore();
  const { hasPermission } = usePermissions();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', permission: 'view_dashboard' },
    { name: 'Customers', href: '/dashboard/customers', icon: '👥', permission: 'view_customers' },
    { name: 'Leads', href: '/dashboard/leads', icon: '🎯', permission: 'view_leads' },
    { name: 'Quotes', href: '/dashboard/quotes', icon: '💰', permission: 'view_quotes' },
    { name: 'Jobs', href: '/dashboard/jobs', icon: '🚚', permission: 'view_jobs' },
    { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾', permission: 'view_invoices' },
    { name: 'Communications', href: '/dashboard/communications', icon: '💬', permission: 'view_dashboard' },
    { name: 'Calendar', href: '/dashboard/calendar', icon: '📅', permission: 'view_dashboard' },
    { name: 'Team', href: '/dashboard/team', icon: '👷', permission: 'manage_team' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📈', permission: 'view_analytics' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', permission: 'manage_settings' },
  ];

  const filteredNavigation = navigation.filter((item) =>
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="flex flex-col w-64 bg-white border-r border-neutral-200">
      <div className="flex items-center h-16 px-6 border-b border-neutral-200">
        {tenant?.branding.logoUrl ? (
          <img
            src={tenant.branding.logoUrl}
            alt={tenant.branding.companyName}
            className="h-8 w-auto"
          />
        ) : (
          <h1 className="text-xl font-bold text-primary-600">
            {tenant?.branding.companyName || 'CRM'}
          </h1>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="text-xs text-neutral-500 text-center">
          {tenant?.branding.companyName}
        </div>
      </div>
    </div>
  );
}
