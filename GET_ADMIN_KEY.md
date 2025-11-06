# Get Firebase Admin Service Account Key

To complete the setup, you need to download your Firebase Admin SDK private key:

## Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/crm-platform-70d35/settings/serviceaccounts/adminsdk

2. **Click "Generate new private key"**

3. **Click "Generate key"** - A JSON file will download

4. **Open the downloaded JSON file**

5. **Copy these values to your `.env.local` file**:
   ```
   FIREBASE_ADMIN_PROJECT_ID=crm-platform-70d35
   FIREBASE_ADMIN_CLIENT_EMAIL=[copy from JSON: client_email]
   FIREBASE_ADMIN_PRIVATE_KEY="[copy from JSON: private_key - keep the quotes and \n characters]"
   ```

## Example:

If your JSON file looks like this:
```json
{
  "type": "service_account",
  "project_id": "crm-platform-70d35",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@crm-platform-70d35.iam.gserviceaccount.com",
  ...
}
```

Your `.env.local` should have:
```env
FIREBASE_ADMIN_PROJECT_ID=crm-platform-70d35
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@crm-platform-70d35.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANT**: Keep the `\n` characters in the private key! They are important for proper formatting.

## After adding these values:

Run the setup script to create your demo tenant:
```bash
npx ts-node scripts/setup-demo-tenant.ts
```

Then start the dev server:
```bash
npm run dev
```
