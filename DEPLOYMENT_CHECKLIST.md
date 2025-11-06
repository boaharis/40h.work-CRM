# Production Deployment Checklist

Use this checklist before deploying to production.

## ☑️ Pre-Deployment

### Firebase Setup
- [ ] Firebase project created
- [ ] Billing enabled (Blaze plan for Cloud Functions)
- [ ] Authentication providers enabled
  - [ ] Email/Password
  - [ ] Google OAuth
  - [ ] Phone (optional)
- [ ] Firestore database created
- [ ] Storage bucket created
- [ ] Security rules deployed
  - [ ] `firebase deploy --only firestore:rules`
  - [ ] `firebase deploy --only storage:rules`
- [ ] Indexes deployed
  - [ ] `firebase deploy --only firestore:indexes`

### Environment Configuration
- [ ] `.env.local` created (never commit this!)
- [ ] All Firebase credentials added
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Firebase Admin credentials added
  - [ ] `FIREBASE_ADMIN_PROJECT_ID`
  - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
  - [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
- [ ] App URL configured
  - [ ] `NEXT_PUBLIC_APP_URL`

### Code Quality
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Run build: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Test locally: `npm run dev`

### Demo Tenant
- [ ] Run setup script: `npx ts-node scripts/setup-demo-tenant.ts`
- [ ] Verify tenant in Firestore Console
- [ ] Test authentication flow
- [ ] Create test user
- [ ] Verify custom claims are set

### Cloud Functions
- [ ] Navigate to functions: `cd functions`
- [ ] Install dependencies: `npm install`
- [ ] Build functions: `npm run build`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Verify all 9 functions deployed:
  - [ ] updateCustomerLTV
  - [ ] calculateLeadScore
  - [ ] checkExpiredQuotes
  - [ ] createActivityLog
  - [ ] sendInvoicePaymentNotification
  - [ ] autoAssignLead
  - [ ] generateQuoteNumber
  - [ ] generateJobNumber
  - [ ] generateInvoiceNumber

## 🚀 Deployment Options

### Option A: Vercel (Recommended)

#### Setup
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import project from GitHub
- [ ] Configure environment variables in Vercel:
  - [ ] All `NEXT_PUBLIC_*` variables
  - [ ] All `FIREBASE_ADMIN_*` variables
  - [ ] Optional: Stripe, Twilio, WhatsApp credentials

#### Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Visit deployment URL
- [ ] Test authentication
- [ ] Test dashboard access
- [ ] Verify real-time updates work

#### Domain Setup
- [ ] Add custom domain in Vercel
- [ ] Configure DNS (A record or CNAME)
- [ ] Enable SSL (automatic in Vercel)
- [ ] Set up wildcard subdomain for multi-tenant
  - [ ] Add `*.yourdomain.com` to Vercel
  - [ ] Configure DNS wildcard: `*.yourdomain.com` → Vercel

### Option B: Firebase Hosting

#### Setup
- [ ] Initialize hosting: `firebase init hosting`
- [ ] Build app: `npm run build`
- [ ] Configure firebase.json for Next.js
- [ ] Set up rewrites for SSR

#### Deploy
- [ ] Deploy: `firebase deploy --only hosting`
- [ ] Visit Firebase hosting URL
- [ ] Test functionality

#### Domain Setup
- [ ] Add custom domain in Firebase Console
- [ ] Verify domain ownership
- [ ] Update DNS records
- [ ] Wait for SSL certificate (automatic)

## 🔒 Security Checklist

### Firebase Security
- [ ] Review Firestore security rules
- [ ] Review Storage security rules
- [ ] Enable App Check (recommended)
- [ ] Set up reCAPTCHA for phone auth
- [ ] Configure authorized domains
- [ ] Review user permissions

### Application Security
- [ ] Environment variables not in code
- [ ] `.env.local` in .gitignore
- [ ] No hardcoded secrets
- [ ] No console.logs with sensitive data
- [ ] Error messages don't expose internal details
- [ ] Rate limiting configured (optional)

### Access Control
- [ ] Default user roles configured
- [ ] Admin users identified
- [ ] Permission system tested
- [ ] Tenant isolation verified
  - [ ] User in Tenant A cannot access Tenant B data
  - [ ] Cross-tenant queries fail appropriately

## 🧪 Testing Checklist

### Authentication Tests
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google
- [ ] Sign out
- [ ] Password reset flow (if implemented)
- [ ] Custom claims set correctly
- [ ] Permissions enforced

### Dashboard Tests
- [ ] Dashboard loads
- [ ] Metrics display correctly
- [ ] Real-time updates work
- [ ] Quick actions functional
- [ ] Navigation works

### Customer Management
- [ ] Create customer
- [ ] View customer list
- [ ] Search customers
- [ ] Edit customer
- [ ] Delete customer (if allowed)
- [ ] Real-time sync works

### Lead Pipeline
- [ ] Create lead
- [ ] View lead pipeline
- [ ] Drag-and-drop between stages
- [ ] Changes sync in real-time
- [ ] Lead details display
- [ ] Lead scoring works

### Quotes
- [ ] Create quote
- [ ] Add line items
- [ ] Calculations correct
  - [ ] Subtotal
  - [ ] Tax
  - [ ] Discount
  - [ ] Total
  - [ ] Margin
- [ ] View quote list
- [ ] Status changes work

### Cloud Functions
- [ ] Lead created → auto-assigned
- [ ] Lead updated → score calculated
- [ ] Quote created → number generated
- [ ] Invoice paid → customer LTV updated
- [ ] Activity logs created

## 📊 Performance Checklist

### Frontend Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Code splitting working
- [ ] Images optimized
- [ ] Fonts optimized

### Database Performance
- [ ] Indexes created for common queries
- [ ] No N+1 query problems
- [ ] Pagination implemented where needed
- [ ] Real-time subscriptions optimized
  - [ ] Unsubscribe on unmount
  - [ ] No memory leaks

### Monitoring Setup
- [ ] Firebase Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Performance monitoring active
- [ ] Cloud Function logs accessible
- [ ] Alerts configured for critical errors

## 💳 Billing & Costs

### Firebase Costs
- [ ] Understand Firestore pricing
  - [ ] Read operations
  - [ ] Write operations
  - [ ] Delete operations
  - [ ] Storage
- [ ] Understand Cloud Function pricing
  - [ ] Invocations
  - [ ] Compute time
  - [ ] Outbound networking
- [ ] Set up billing alerts
  - [ ] Alert at 50% of budget
  - [ ] Alert at 80% of budget
  - [ ] Alert at 100% of budget
- [ ] Budget configured in GCP

### Vercel Costs (if using)
- [ ] Understand Vercel pricing
- [ ] Bandwidth limits known
- [ ] Build time limits known
- [ ] Serverless function limits known

## 📈 Post-Deployment

### Immediate (First Hour)
- [ ] Verify site is accessible
- [ ] Test authentication
- [ ] Create test data
- [ ] Check all pages load
- [ ] Monitor error logs
- [ ] Check Cloud Function executions

### First Day
- [ ] Monitor Firebase usage
- [ ] Check for errors in logs
- [ ] Test with real users (if beta)
- [ ] Verify email deliverability
- [ ] Check real-time sync performance
- [ ] Monitor response times

### First Week
- [ ] Review analytics
- [ ] Check for bugs reported
- [ ] Monitor costs
- [ ] Optimize slow queries
- [ ] Review Cloud Function logs
- [ ] User feedback collection

## 🔧 Backup & Recovery

### Backup Strategy
- [ ] Firestore backup configured
  - [ ] Daily exports to Cloud Storage
  - [ ] Retention policy set (30 days)
- [ ] Function source code in git
- [ ] Environment variables documented
- [ ] Database schema documented

### Recovery Plan
- [ ] Tested Firestore restore procedure
- [ ] Disaster recovery plan documented
- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Emergency contacts listed

## 📱 Mobile & PWA

### PWA Setup (Optional)
- [ ] manifest.json configured
- [ ] Service worker registered
- [ ] Offline functionality tested
- [ ] Install prompt working
- [ ] Icons generated (all sizes)

### Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Responsive design verified
- [ ] Touch interactions work
- [ ] Performance acceptable on mobile

## 🌐 SEO & Marketing (Optional)

### SEO Setup
- [ ] Meta tags configured
- [ ] Open Graph tags added
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Google Search Console setup

### Analytics
- [ ] Google Analytics connected
- [ ] Conversion tracking setup
- [ ] Event tracking configured
- [ ] User flow analysis setup

## 📞 Support Setup

### Documentation
- [ ] User documentation created
- [ ] Admin documentation created
- [ ] API documentation (if applicable)
- [ ] Troubleshooting guide

### Support Channels
- [ ] Support email configured
- [ ] Help desk setup (optional)
- [ ] FAQ page created
- [ ] Contact form working

## ✅ Go-Live Approval

### Final Checks
- [ ] All above items completed
- [ ] Stakeholders notified
- [ ] Support team ready
- [ ] Monitoring in place
- [ ] Rollback plan ready

### Sign-Off
- [ ] Technical lead approval
- [ ] Product owner approval
- [ ] Security review complete
- [ ] Legal review (if required)

---

## 🎉 You're Ready to Launch!

Once all items are checked:

1. Make deployment announcement
2. Monitor closely for first 24 hours
3. Be ready to rollback if needed
4. Celebrate! 🚀

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Production URL**: _________________

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
