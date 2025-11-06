# Multi-Tenant CRM Platform for Moving & Storage Companies

A sophisticated, white-label, multi-tenant CRM platform specifically designed for moving companies and storage rental businesses. Built with Next.js 14, Firebase, and TypeScript.

## Features

### Core Functionality
- ✅ **Multi-Tenant Architecture** - Complete data isolation with tenant-specific subdomains
- ✅ **White-Label Customization** - Full branding control (colors, logo, domain)
- ✅ **Authentication** - Email/password, Google OAuth, and phone authentication
- ✅ **Role-Based Access Control** - Granular permissions system
- ✅ **Real-Time Data Sync** - Instant updates across all connected clients

### Business Modules
- ✅ **Dashboard** - Real-time metrics and KPIs
- ✅ **Customer Management** - Complete CRM with custom fields
- ✅ **Lead Pipeline** - Drag-and-drop Kanban board
- ✅ **Quote System** - Advanced calculation engine with margin analysis
- 🚧 **Job Scheduling** - Calendar integration and team assignment
- 🚧 **Invoice Management** - Payment tracking and Stripe integration
- 🚧 **Communications Hub** - Unified Email/SMS/WhatsApp
- 🚧 **Resource Management** - Teams and equipment tracking

### Advanced Features
- ⏳ **Automation Engine** - Workflow builder for process automation
- ⏳ **Customer Portal** - Self-service for customers
- ⏳ **Analytics & Reporting** - BigQuery integration
- ⏳ **PWA** - Offline functionality
- ⏳ **Mobile Apps** - React Native (future)

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **State Management**: Zustand, React Query
- **UI Components**: Custom design system with Emotion
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Payments**: Stripe
- **Communications**: Twilio (SMS), WhatsApp Business API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account and project
- (Optional) Stripe account for payment processing
- (Optional) Twilio account for SMS
- (Optional) WhatsApp Business API access

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable: Email/Password, Google, Phone

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode (we have custom rules)
   - Choose your location

4. **Set up Firebase Storage**
   - Go to Storage
   - Click "Get started"
   - Use default security rules (we'll update them)

5. **Get your Firebase config**
   - Go to Project Settings > General
   - Under "Your apps", click the web icon (</>)
   - Register your app and copy the config

6. **Set up Service Account (for Admin SDK)**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely (never commit to git!)

### Installation

1. **Clone the repository**
   ```bash
   cd 40h.work-CRM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local` with your Firebase credentials**
   ```env
   # Firebase Web SDK Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin SDK (from service account JSON)
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

5. **Deploy Firebase Security Rules**
   ```bash
   # Install Firebase CLI if you haven't
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase in your project
   firebase init

   # Select:
   # - Firestore (rules and indexes)
   # - Functions
   # - Storage

   # Deploy rules
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

6. **Set up Cloud Functions**
   ```bash
   cd functions
   npm install
   npm run build
   cd ..

   # Deploy functions
   firebase deploy --only functions
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Creating Your First Tenant

1. **Add a tenant document to Firestore manually** (or create an admin panel)

   In Firebase Console > Firestore Database, create a document:

   ```
   Collection: tenants
   Document ID: demo (or your subdomain)

   Fields:
   {
     "name": "Demo Company",
     "subdomain": "demo",
     "status": "active",
     "subscription": "professional",
     "createdAt": [timestamp],
     "updatedAt": [timestamp],
     "config": {
       "pipelineStages": [...] // Use defaults from lib/tenant.ts
     },
     "branding": {
       "companyName": "Demo Company",
       "primaryColor": "#3B82F6",
       ...
     },
     "features": {
       "communications": true,
       "leadManagement": true,
       ...
     }
   }
   ```

2. **Create your first user**
   - Navigate to /auth/signup
   - Sign up with email or Google
   - The user will be created in `tenants/demo/users/[uid]`

3. **Set custom claims** (the API route handles this automatically)
   The system will set custom claims including:
   - `tenantId`
   - `role`
   - `permissions`

## Development

### Project Structure

```
40h.work-CRM/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── dashboard/     # Dashboard pages
│   │       ├── customers/
│   │       ├── leads/
│   │       ├── quotes/
│   │       ├── jobs/
│   │       └── invoices/
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── functions/             # Firebase Cloud Functions
│   └── src/
│       └── index.ts       # All cloud functions
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase client config
│   ├── firebase-admin.ts  # Firebase admin config
│   ├── auth.ts            # Auth utilities
│   └── tenant.ts          # Tenant utilities
├── stores/                # Zustand state stores
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

### Key Concepts

#### Multi-Tenancy
- Each tenant has a unique subdomain (e.g., `acme.yourplatform.com`)
- Custom domains are supported via CNAME mapping
- Data is isolated in Firestore: `/tenants/{tenantId}/...`
- Security rules enforce strict tenant boundaries

#### Authentication Flow
1. User visits tenant subdomain
2. System loads tenant configuration
3. User authenticates via email, Google, or phone
4. Custom claims are set with `tenantId`, `role`, and `permissions`
5. All subsequent requests validate tenant membership

#### Real-Time Updates
- Uses Firestore onSnapshot for live data
- Changes propagate instantly to all connected clients
- Optimistic updates for better UX

#### Theming
- Tenant branding loads on mount
- CSS custom properties dynamically update
- Support for custom CSS injection

## Deployment

### Vercel (Recommended for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

4. **Configure custom domains**
   - Add your wildcard domain (*.yourplatform.com)
   - Configure DNS with CNAME records

### Firebase Hosting (Alternative)

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

## Configuration

### Adding Custom Fields

Edit tenant config in Firestore:
```javascript
{
  config: {
    customFields: {
      customer: [
        {
          id: "preferred_time",
          name: "preferredTime",
          label: "Preferred Contact Time",
          type: "select",
          options: ["Morning", "Afternoon", "Evening"],
          required: false,
          order: 1
        }
      ]
    }
  }
}
```

### Customizing Pipeline Stages

```javascript
{
  config: {
    pipelineStages: [
      {
        id: "new_inquiry",
        name: "New Inquiry",
        color: "#3B82F6",
        order: 0,
        requiredFields: ["firstName", "lastName", "phone"],
        requiredTasks: [
          {
            id: "initial_call",
            name: "Make initial contact call",
            required: true
          }
        ]
      }
    ]
  }
}
```

### Setting Up Integrations

#### Stripe (Payment Processing)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Twilio (SMS)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### WhatsApp Business API
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

## Cloud Functions

The platform includes several automated Cloud Functions:

- **updateCustomerLTV** - Calculates customer lifetime value
- **calculateLeadScore** - Automatic lead scoring
- **checkExpiredQuotes** - Daily quote expiration check
- **createActivityLog** - Audit trail creation
- **autoAssignLead** - Round-robin lead assignment
- **generateQuoteNumber** - Auto-increment quote numbers
- **generateJobNumber** - Auto-increment job numbers
- **generateInvoiceNumber** - Auto-increment invoice numbers

## Security

- All data access is protected by Firestore Security Rules
- Multi-layer permission validation
- Custom authentication claims for tenant isolation
- Rate limiting on API endpoints
- File upload validation and virus scanning
- HTTPS only communication
- Environment variable protection

## Performance

- Server-side rendering for initial page loads
- Incremental Static Regeneration (ISR) where applicable
- Image optimization with Next.js Image
- Code splitting and lazy loading
- CDN caching for static assets
- Firestore composite indexes for complex queries
- Background processing with Cloud Functions

## Roadmap

### Phase 1 (Current)
- [x] Multi-tenant infrastructure
- [x] Authentication system
- [x] Dashboard
- [x] Customer management
- [x] Lead pipeline
- [x] Quote system

### Phase 2
- [ ] Job scheduling
- [ ] Invoice management
- [ ] Stripe integration
- [ ] Email integration
- [ ] SMS integration

### Phase 3
- [ ] WhatsApp integration
- [ ] Automation engine
- [ ] Template system
- [ ] Customer portal
- [ ] Advanced analytics

### Phase 4
- [ ] Mobile apps (React Native)
- [ ] Offline mode (PWA)
- [ ] API for third-party integrations
- [ ] Marketplace for extensions

## Contributing

This is a proprietary codebase. Please contact the development team for contribution guidelines.

## Support

For support, please contact:
- Email: support@yourplatform.com
- Documentation: https://docs.yourplatform.com

## License

Proprietary - All Rights Reserved

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)
