# Complete Setup Guide - Multi-Tenant CRM Platform

This guide will walk you through setting up the complete CRM platform from scratch.

## Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 18 or higher installed
- ✅ npm or yarn package manager
- ✅ A Google account (for Firebase)
- ✅ Basic knowledge of React and Next.js
- ✅ A code editor (VS Code recommended)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "crm-platform")
4. Disable Google Analytics (optional, you can enable it later)
5. Click "Create project"

### 1.2 Enable Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Click Enable, then Save
   - **Google**: Click Enable, enter your support email, then Save
   - **Phone**: Click Enable, add test phone numbers if needed, then Save

### 1.3 Create Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode" (we'll add our own rules)
4. Choose your database location (closest to your users)
5. Click "Enable"

### 1.4 Set up Firebase Storage

1. Click "Storage" in the left sidebar
2. Click "Get started"
3. Click "Next" (we'll use our custom rules)
4. Choose the same location as your Firestore database
5. Click "Done"

### 1.5 Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app with a nickname (e.g., "CRM Web App")
6. Copy the `firebaseConfig` object - you'll need this!

### 1.6 Generate Service Account Key

1. Still in Project Settings, click "Service accounts" tab
2. Click "Generate new private key"
3. Click "Generate key" to download the JSON file
4. **IMPORTANT**: Keep this file secure! Never commit it to git!
5. You'll use values from this file in your `.env.local`

## Step 2: Install the Application

### 2.1 Navigate to Project Directory

```bash
cd /Users/harismuranovic/Desktop/HARIS/PROJEKTE/DZENID/40h.work-CRM
```

### 2.2 Install Dependencies

The dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

## Step 3: Configure Environment Variables

### 3.1 Create Environment File

Copy the example file:

```bash
cp .env.local.example .env.local
```

### 3.2 Fill in Firebase Configuration

Open `.env.local` and add your Firebase Web SDK config from Step 1.5:

```env
# Firebase Web SDK Config (from firebaseConfig object)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3.3 Add Firebase Admin SDK Credentials

From the service account JSON file you downloaded in Step 1.6:

```env
# Firebase Admin SDK (from service account JSON)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important**: The private key must be in quotes and include the `\n` characters for line breaks!

## Step 4: Deploy Firebase Security Rules

### 4.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 4.2 Login to Firebase

```bash
firebase login
```

Follow the prompts to authenticate with your Google account.

### 4.3 Initialize Firebase

```bash
firebase init
```

When prompted:
- **Which Firebase features?** Select:
  - ✅ Firestore
  - ✅ Functions
  - ✅ Storage
  - ✅ Emulators (optional but recommended)

- **Use existing project?** Yes
- **Select your project** from the list
- **Firestore rules file?** Press Enter (use default: firestore.rules)
- **Firestore indexes file?** Press Enter (use default: firestore.indexes.json)
- **Functions language?** TypeScript
- **Use ESLint?** No (we already have our setup)
- **Overwrite files?** No! (keep existing files)
- **Install dependencies?** Yes
- **Storage rules file?** Press Enter (use default: storage.rules)

### 4.4 Deploy Rules and Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

This will deploy:
- Firestore security rules (multi-tenant isolation)
- Firestore indexes (for complex queries)
- Storage security rules (file upload protection)

## Step 5: Set Up Demo Tenant

### 5.1 Run the Setup Script

```bash
npx ts-node scripts/setup-demo-tenant.ts
```

This creates a demo tenant with:
- Default pipeline stages
- Sample custom fields
- Professional branding
- All features enabled

### 5.2 Verify in Firebase Console

1. Go to Firestore Database in Firebase Console
2. You should see a collection named `tenants`
3. Inside, there should be a document with ID `demo`

## Step 6: Deploy Cloud Functions

### 6.1 Navigate to Functions Directory

```bash
cd functions
```

### 6.2 Install Function Dependencies

```bash
npm install
```

### 6.3 Build Functions

```bash
npm run build
```

### 6.4 Deploy to Firebase

```bash
cd ..
firebase deploy --only functions
```

This deploys automated functions for:
- Customer lifetime value calculation
- Lead scoring
- Quote expiration checking
- Auto-numbering (quotes, jobs, invoices)
- Activity logging
- And more!

## Step 7: Run the Application

### 7.1 Start Development Server

```bash
npm run dev
```

### 7.2 Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the login page!

## Step 8: Create Your First User

### 8.1 Sign Up

1. Click "Sign up" on the login page
2. Enter your details
3. Choose any sign-up method:
   - Email/Password
   - Google Sign-In
   - Phone Number

### 8.2 Verify User in Firebase

1. Go to Firebase Console > Authentication
2. You should see your user listed
3. Go to Firestore Database
4. Navigate to `tenants/demo/users`
5. You should see your user document

## Step 9: Test the Platform

### 9.1 Explore the Dashboard

After logging in, you'll see:
- Real-time metrics dashboard
- Navigation sidebar
- Quick action buttons

### 9.2 Create a Customer

1. Click "Customers" in the sidebar
2. Click "+ Add Customer"
3. Fill in the details
4. Save

### 9.3 Create a Lead

1. Click "Leads" in the sidebar
2. Click "+ Add Lead"
3. Fill in the details
4. Save
5. Try dragging the lead card between pipeline stages!

### 9.4 Create a Quote

1. Click "Quotes" in the sidebar
2. Click "+ New Quote"
3. Add line items
4. Watch the calculations update in real-time
5. See margin percentages

## Step 10: Optional - Set Up Integrations

### Stripe (Payment Processing)

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Twilio (SMS)

1. Create account at [Twilio](https://twilio.com)
2. Get credentials from Console
3. Add to `.env.local`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### WhatsApp Business API

1. Apply for WhatsApp Business API access
2. Get credentials
3. Add to `.env.local`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_id
   WHATSAPP_ACCESS_TOKEN=your_token
   ```

## Troubleshooting

### Firebase Permission Errors

**Problem**: "Missing or insufficient permissions"

**Solution**:
1. Make sure you deployed the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Check that your user has the correct custom claims
3. Sign out and sign back in to refresh tokens

### Custom Claims Not Working

**Problem**: User can't access resources after signup

**Solution**:
1. Check that `/api/auth/set-claims` is working
2. Verify the API route has correct Firebase Admin credentials
3. Sign out and sign back in to refresh the ID token
4. Check browser console for errors

### Tenant Not Found

**Problem**: "Tenant configuration not loaded"

**Solution**:
1. Make sure you ran the setup script
2. Verify the tenant exists in Firestore (`tenants/demo`)
3. Check that the subdomain detection is working (localhost defaults to 'demo')

### Build Errors

**Problem**: TypeScript or build errors

**Solution**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```
3. Rebuild:
   ```bash
   npm run build
   ```

### Cloud Functions Not Deploying

**Problem**: Functions deployment fails

**Solution**:
1. Make sure you're on the right Firebase project:
   ```bash
   firebase use --add
   ```
2. Build functions first:
   ```bash
   cd functions && npm run build && cd ..
   ```
3. Deploy with verbose logging:
   ```bash
   firebase deploy --only functions --debug
   ```

## Development Tips

### Using Firebase Emulators

For local development without hitting production Firebase:

1. Start emulators:
   ```bash
   firebase emulators:start
   ```

2. Update `.env.local` to use emulators:
   ```env
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
   ```

3. Access Emulator UI at http://localhost:4000

### Hot Reload

The Next.js dev server supports hot reload. Just save your files and see changes instantly!

### Database Backups

Regularly backup your Firestore data:

```bash
gcloud firestore export gs://[BUCKET_NAME]/[EXPORT_FOLDER]
```

## Next Steps

1. **Customize your tenant**: Edit the tenant document in Firestore
2. **Add more users**: Invite team members
3. **Configure features**: Enable/disable modules per tenant
4. **Set up custom domain**: Point your domain to the app
5. **Deploy to production**: Use Vercel or Firebase Hosting

## Production Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Option 2: Firebase Hosting

1. Build the app:
   ```bash
   npm run build
   ```

2. Export static files:
   ```bash
   npm run export
   ```

3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## Support

If you encounter issues:

1. Check this guide first
2. Review the main README.md
3. Check Firebase Console for errors
4. Look at browser console for client-side errors
5. Check Cloud Functions logs: `firebase functions:log`

## Security Checklist

Before going to production:

- [ ] Changed all default passwords
- [ ] Updated security rules
- [ ] Enabled 2FA on Firebase account
- [ ] Set up proper backups
- [ ] Configured rate limiting
- [ ] Reviewed API keys and secrets
- [ ] Set up monitoring and alerts
- [ ] Tested all authentication flows
- [ ] Verified tenant isolation
- [ ] Added proper error handling

## Congratulations! 🎉

Your multi-tenant CRM platform is now up and running!

You've successfully:
- ✅ Set up Firebase
- ✅ Configured multi-tenant architecture
- ✅ Deployed security rules
- ✅ Created a demo tenant
- ✅ Deployed Cloud Functions
- ✅ Tested the application

Happy coding! 🚀
