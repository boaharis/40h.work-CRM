import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// ===========================================
// Set Custom Claims (for authentication)
// ===========================================
export const setCustomClaims = functions.https.onCall(async (request) => {
  const { uid, tenantId, role, permissions } = request.data;

  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    await admin.auth().setCustomUserClaims(uid, {
      tenantId,
      role,
      permissions,
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set custom claims');
  }
});
