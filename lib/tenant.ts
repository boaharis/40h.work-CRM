import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Tenant } from '@/types';

// Extract tenant from hostname
export const getTenantFromHostname = (hostname: string): string | null => {
  console.log('[Tenant] Extracting tenant from hostname:', hostname);

  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    console.log('[Tenant] Development environment detected, using demo tenant');
    return 'demo'; // Default tenant for development
  }

  // Handle Firebase Hosting domains (web.app and firebaseapp.com)
  if (hostname.includes('.web.app') || hostname.includes('.firebaseapp.com')) {
    console.log('[Tenant] Firebase Hosting domain detected, using demo tenant');
    return 'demo'; // Default tenant for Firebase Hosting
  }

  // Check for custom domain
  // First, try to match against custom domains in database
  // This would require a separate query or cache

  // Extract subdomain
  const parts = hostname.split('.');

  if (parts.length >= 3) {
    // Format: subdomain.platform.com
    const subdomain = parts[0];
    console.log('[Tenant] Extracted subdomain:', subdomain);
    return subdomain;
  }

  console.log('[Tenant] No tenant found, using default');
  return 'demo'; // Fallback to demo
};

// Get tenant configuration
export const getTenantConfig = async (tenantId: string): Promise<Tenant | null> => {
  try {
    const tenantDoc = await getDoc(doc(db, 'tenants', tenantId));

    if (!tenantDoc.exists()) {
      return null;
    }

    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    } as Tenant;
  } catch (error) {
    console.error('Error fetching tenant config:', error);
    return null;
  }
};

// Get tenant by custom domain
export const getTenantByCustomDomain = async (domain: string): Promise<Tenant | null> => {
  try {
    const q = query(collection(db, 'tenants'), where('customDomain', '==', domain));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const tenantDoc = querySnapshot.docs[0];
    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    } as Tenant;
  } catch (error) {
    console.error('Error fetching tenant by custom domain:', error);
    return null;
  }
};

// Create default tenant configuration
export const getDefaultTenantConfig = (): Tenant['config'] => {
  return {
    pipelineStages: [
      {
        id: 'new',
        name: 'New Lead',
        color: '#3B82F6',
        order: 0,
        requiredFields: ['firstName', 'lastName', 'email'],
        requiredTasks: [],
        automations: [],
      },
      {
        id: 'contacted',
        name: 'Contacted',
        color: '#8B5CF6',
        order: 1,
        requiredFields: ['phone'],
        requiredTasks: [
          {
            id: 'initial_call',
            name: 'Initial Contact Call',
            required: true,
          },
        ],
        automations: [],
      },
      {
        id: 'qualified',
        name: 'Qualified',
        color: '#EC4899',
        order: 2,
        requiredFields: ['serviceType'],
        requiredTasks: [],
        automations: [],
      },
      {
        id: 'proposal',
        name: 'Proposal Sent',
        color: '#F59E0B',
        order: 3,
        requiredFields: [],
        requiredTasks: [],
        automations: [],
      },
      {
        id: 'negotiation',
        name: 'Negotiation',
        color: '#10B981',
        order: 4,
        requiredFields: [],
        requiredTasks: [],
        automations: [],
      },
      {
        id: 'won',
        name: 'Won',
        color: '#059669',
        order: 5,
        requiredFields: [],
        requiredTasks: [],
        automations: [],
      },
      {
        id: 'lost',
        name: 'Lost',
        color: '#EF4444',
        order: 6,
        requiredFields: ['lostReason'],
        requiredTasks: [],
        automations: [],
      },
    ],
    customFields: {
      customer: [],
      lead: [],
      quote: [],
      job: [],
    },
    formLayouts: {},
    calculationRules: [],
    automationWorkflows: [],
    businessHours: {
      monday: { open: true, start: '09:00', end: '17:00' },
      tuesday: { open: true, start: '09:00', end: '17:00' },
      wednesday: { open: true, start: '09:00', end: '17:00' },
      thursday: { open: true, start: '09:00', end: '17:00' },
      friday: { open: true, start: '09:00', end: '17:00' },
      saturday: { open: false, start: '09:00', end: '17:00' },
      sunday: { open: false, start: '09:00', end: '17:00' },
    },
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    emailSettings: {
      fromEmail: '',
      fromName: '',
      useOAuth: false,
    },
    smsSettings: {
      provider: 'twilio',
    },
    whatsappSettings: {},
  };
};

// Create default branding
export const getDefaultBranding = (): Tenant['branding'] => {
  return {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#10B981',
    colorPalette: {
      primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
      },
      secondary: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
      },
      accent: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
      },
      success: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
      },
      warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
      },
      error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
      },
      neutral: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      baseFontSize: 16,
    },
    companyName: 'My CRM',
  };
};

// Create default features
export const getDefaultFeatures = (): Tenant['features'] => {
  return {
    communications: true,
    leadManagement: true,
    quotes: true,
    jobs: true,
    invoicing: true,
    resourceManagement: true,
    analytics: true,
    automations: true,
    customerPortal: false,
    whiteLabel: false,
    apiAccess: false,
  };
};
