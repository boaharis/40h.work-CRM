# Quick Start Guide - 5 Minutes to Running Application

This guide gets you up and running in the fastest way possible. For detailed setup, see [SETUP.md](./SETUP.md).

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Firebase account (free tier is fine)

## 5-Minute Setup

### 1. Firebase Setup (2 minutes)

1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) → "Add project"
2. **Enable Auth**: Authentication → Enable Email/Password and Google
3. **Create Database**: Firestore Database → Create in production mode
4. **Enable Storage**: Storage → Get started
5. **Get Config**: Project Settings → Add web app → Copy config

### 2. Environment Setup (1 minute)

```bash
# Copy environment file
cp .env.local.example .env.local

# Edit .env.local and paste your Firebase config
# Just need the NEXT_PUBLIC_* values for now
```

Minimal `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### 3. Deploy Rules (1 minute)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore and Storage, use existing project)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

### 4. Run Application (1 minute)

```bash
# Install dependencies (already done if you cloned)
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000 🎉

## Your First Login

1. Click "Sign up"
2. Enter email and password
3. You're in!

**Note**: The first user gets created but won't have proper permissions yet. For full functionality, you need to:

1. Create a demo tenant (see below)
2. Set up the admin SDK in `.env.local`

## Create Demo Tenant (Optional but Recommended)

This gives you a fully configured tenant with sample data structures:

1. **Get Admin Credentials**:
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key → Download JSON

2. **Add to .env.local**:
   ```env
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
   ```

3. **Run setup script**:
   ```bash
   npx ts-node scripts/setup-demo-tenant.ts
   ```

Now you have:
- ✅ Pre-configured pipeline stages
- ✅ Sample custom fields
- ✅ Professional branding
- ✅ All features enabled

## What You Can Do Now

### Dashboard
- View real-time metrics
- See recent activity
- Quick actions

### Customers
- Add new customers
- View customer list
- Search and filter

### Leads
- Create leads
- Drag & drop between pipeline stages
- Watch real-time updates

### Quotes
- Build quotes with line items
- See automatic calculations
- Track margin percentages

## Common Issues

### "Missing or insufficient permissions"
**Fix**: Deploy the security rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### "Tenant configuration not found"
**Fix**: Run the demo tenant setup script or create a tenant manually in Firestore

### Can't sign in after creating account
**Fix**: The custom claims API needs admin credentials. Add `FIREBASE_ADMIN_*` variables to `.env.local`

## Next Steps

1. **Deploy Cloud Functions** - Get automated features:
   ```bash
   cd functions && npm install && npm run build
   firebase deploy --only functions
   ```

2. **Read the docs**:
   - [SETUP.md](./SETUP.md) - Detailed setup guide
   - [README.md](./README.md) - Full documentation
   - [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Architecture and features

3. **Customize**:
   - Edit tenant config in Firestore
   - Modify pipeline stages
   - Add custom fields
   - Update branding

## Development Tips

### Project Structure
```
app/
├── (dashboard)/       # Protected pages
│   └── dashboard/     # Main app
│       ├── customers/ # Customer management
│       ├── leads/     # Lead pipeline
│       └── quotes/    # Quote system
├── auth/              # Login/signup
└── api/               # API routes

components/            # Reusable UI components
lib/                   # Utilities
hooks/                 # Custom hooks
stores/                # State management
types/                 # TypeScript types
```

### Hot Reload
Save any file and see changes instantly!

### Firebase Emulators (Offline Development)
```bash
firebase emulators:start
```
Access emulator UI at http://localhost:4000

### Add a New Page
```tsx
// app/(dashboard)/dashboard/my-page/page.tsx
export default function MyPage() {
  return <div>My New Page</div>;
}
```

Visit at http://localhost:3000/dashboard/my-page

## Deploy to Production

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Follow prompts, add environment variables in Vercel dashboard, done!

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Get Help

- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **Architecture Questions**: See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- **Firebase Errors**: Check Firebase Console logs
- **Code Issues**: Check browser console

## You're Ready! 🚀

You now have:
- ✅ A running multi-tenant CRM
- ✅ Real-time dashboard
- ✅ Customer management
- ✅ Lead pipeline with Kanban
- ✅ Quote system with calculations
- ✅ Secure multi-tenant architecture

**Happy coding!** 💻
