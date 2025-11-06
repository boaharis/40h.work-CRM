/**
 * Setup Demo Tenant Script
 *
 * This script creates a demo tenant in your Firestore database
 * with default configuration, branding, and features.
 *
 * Usage:
 * 1. Make sure you have FIREBASE_ADMIN credentials in .env.local
 * 2. Run: npx ts-node scripts/setup-demo-tenant.ts
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function setupDemoTenant() {
  console.log('🚀 Setting up demo tenant...\n');

  const tenantId = 'demo';

  const tenantData = {
    name: 'Demo Moving Company',
    subdomain: 'demo',
    status: 'active',
    subscription: 'professional',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),

    config: {
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
        lead: [
          {
            id: 'move_date',
            name: 'moveDate',
            label: 'Preferred Move Date',
            type: 'date',
            required: false,
            order: 1,
            showInList: true,
            showInDetail: true,
          },
          {
            id: 'move_size',
            name: 'moveSize',
            label: 'Move Size',
            type: 'select',
            required: false,
            options: ['Studio', '1 Bedroom', '2 Bedrooms', '3+ Bedrooms', 'Office'],
            order: 2,
            showInList: true,
            showInDetail: true,
          },
        ],
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
        saturday: { open: true, start: '10:00', end: '14:00' },
        sunday: { open: false, start: '09:00', end: '17:00' },
      },

      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',

      emailSettings: {
        fromEmail: 'noreply@demo.com',
        fromName: 'Demo Moving Company',
        useOAuth: false,
      },

      smsSettings: {
        provider: 'twilio',
      },

      whatsappSettings: {},
    },

    branding: {
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

      companyName: 'Demo Moving Company',
      tagline: 'Your Trusted Moving Partner',
    },

    features: {
      communications: true,
      leadManagement: true,
      quotes: true,
      jobs: true,
      invoicing: true,
      resourceManagement: true,
      analytics: true,
      automations: true,
      customerPortal: false,
      whiteLabel: true,
      apiAccess: false,
    },
  };

  try {
    // Create or update tenant
    await db.collection('tenants').doc(tenantId).set(tenantData);
    console.log('✅ Demo tenant created successfully!');
    console.log('\nTenant ID:', tenantId);
    console.log('Subdomain:', 'demo.localhost:3000');
    console.log('\nYou can now:');
    console.log('1. Run the dev server: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Sign up for a new account');
    console.log('\n✨ Happy developing!\n');
  } catch (error) {
    console.error('❌ Error creating demo tenant:', error);
    process.exit(1);
  }
}

// Run the setup
setupDemoTenant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
