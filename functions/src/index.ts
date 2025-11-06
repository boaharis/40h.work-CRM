import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ===========================================
// Customer Lifetime Value Calculator
// ===========================================
export const updateCustomerLTV = functions.firestore
  .document('tenants/{tenantId}/invoices/{invoiceId}')
  .onWrite(async (change, context) => {
    const { tenantId } = context.params;
    const invoice = change.after.exists ? change.after.data() : null;

    if (!invoice || invoice.status !== 'paid') {
      return null;
    }

    const customerId = invoice.customerId;

    // Calculate total lifetime value
    const invoicesSnapshot = await db
      .collection(`tenants/${tenantId}/invoices`)
      .where('customerId', '==', customerId)
      .where('status', '==', 'paid')
      .get();

    const lifetimeValue = invoicesSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().total || 0);
    }, 0);

    const totalInvoices = invoicesSnapshot.size;
    const averageTransactionSize = totalInvoices > 0 ? lifetimeValue / totalInvoices : 0;

    // Update customer document
    await db
      .collection(`tenants/${tenantId}/customers`)
      .doc(customerId)
      .update({
        lifetimeValue,
        averageTransactionSize,
        totalInvoices,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return null;
  });

// ===========================================
// Lead Scoring Automation
// ===========================================
export const calculateLeadScore = functions.firestore
  .document('tenants/{tenantId}/leads/{leadId}')
  .onWrite(async (change, context) => {
    const { tenantId, leadId } = context.params;
    const lead = change.after.exists ? change.after.data() : null;

    if (!lead) {
      return null;
    }

    let score = 0;

    // Data completeness (max 30 points)
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.serviceType && lead.serviceType.length > 0) score += 10;

    // Engagement (max 40 points)
    if (lead.lastContactedAt) {
      const daysSinceContact = (Date.now() - lead.lastContactedAt.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysSinceContact < 7) score += 20;
      else if (daysSinceContact < 14) score += 10;
    }

    if (lead.pipelineStage === 'qualified') score += 10;
    if (lead.pipelineStage === 'proposal') score += 15;
    if (lead.pipelineStage === 'negotiation') score += 20;

    // Value (max 30 points)
    if (lead.estimatedValue) {
      if (lead.estimatedValue >= 5000) score += 30;
      else if (lead.estimatedValue >= 2000) score += 20;
      else if (lead.estimatedValue >= 1000) score += 10;
    }

    // Update lead score
    if (lead.score !== score) {
      await db
        .collection(`tenants/${tenantId}/leads`)
        .doc(leadId)
        .update({
          score,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    return null;
  });

// ===========================================
// Quote Expiration Checker (Scheduled)
// ===========================================
export const checkExpiredQuotes = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();

    // Get all tenants
    const tenantsSnapshot = await db.collection('tenants').get();

    for (const tenantDoc of tenantsSnapshot.docs) {
      const tenantId = tenantDoc.id;

      // Find expired quotes
      const expiredQuotesSnapshot = await db
        .collection(`tenants/${tenantId}/quotes`)
        .where('status', 'in', ['sent', 'viewed'])
        .where('validUntil', '<', now)
        .get();

      // Update expired quotes
      const batch = db.batch();
      expiredQuotesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'expired',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    }

    return null;
  });

// ===========================================
// Activity Log Creator
// ===========================================
export const createActivityLog = functions.firestore
  .document('tenants/{tenantId}/{collection}/{documentId}')
  .onCreate(async (snapshot, context) => {
    const { tenantId, collection, documentId } = context.params;

    // Only log specific collections
    const loggableCollections = ['customers', 'leads', 'quotes', 'jobs', 'invoices'];
    if (!loggableCollections.includes(collection)) {
      return null;
    }

    const data = snapshot.data();
    const activityType = `${collection.slice(0, -1)}_created`; // Remove 's' from collection name

    await db.collection(`tenants/${tenantId}/activities`).add({
      type: activityType,
      entityType: collection.slice(0, -1),
      entityId: documentId,
      userId: data.createdBy || 'system',
      description: `New ${collection.slice(0, -1)} created`,
      metadata: {
        name: data.name || data.firstName || 'Unknown',
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });

// ===========================================
// Invoice Payment Notification
// ===========================================
export const sendInvoicePaymentNotification = functions.firestore
  .document('tenants/{tenantId}/invoices/{invoiceId}')
  .onUpdate(async (change, context) => {
    const { tenantId, invoiceId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    // Check if invoice was just paid
    if (before.status !== 'paid' && after.status === 'paid') {
      // In production, you would send email/SMS notification here
      console.log(`Invoice ${invoiceId} was paid for tenant ${tenantId}`);

      // You could integrate with SendGrid, Twilio, etc.
      // await sendEmail({
      //   to: after.customerEmail,
      //   subject: 'Payment Received',
      //   body: `Thank you for your payment of $${after.total}`
      // });
    }

    return null;
  });

// ===========================================
// Auto-assign Leads (Round Robin)
// ===========================================
export const autoAssignLead = functions.firestore
  .document('tenants/{tenantId}/leads/{leadId}')
  .onCreate(async (snapshot, context) => {
    const { tenantId, leadId } = context.params;
    const lead = snapshot.data();

    // Skip if already assigned
    if (lead.assignedTo) {
      return null;
    }

    // Get all sales users for this tenant
    const usersSnapshot = await db
      .collection(`tenants/${tenantId}/users`)
      .where('role', '==', 'sales')
      .where('status', '==', 'active')
      .get();

    if (usersSnapshot.empty) {
      return null;
    }

    // Get last assigned user from tenant config
    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    const tenantData = tenantDoc.data();
    const lastAssignedIndex = tenantData?.lastAssignedIndex || 0;

    // Round-robin assignment
    const users = usersSnapshot.docs;
    const nextIndex = (lastAssignedIndex + 1) % users.length;
    const assignedUser = users[nextIndex];

    // Update lead with assignment
    await snapshot.ref.update({
      assignedTo: assignedUser.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update tenant's last assigned index
    await db.collection('tenants').doc(tenantId).update({
      lastAssignedIndex: nextIndex,
    });

    return null;
  });

// ===========================================
// Generate Quote Number
// ===========================================
export const generateQuoteNumber = functions.firestore
  .document('tenants/{tenantId}/quotes/{quoteId}')
  .onCreate(async (snapshot, context) => {
    const { tenantId, quoteId } = context.params;
    const quote = snapshot.data();

    // Skip if quote number already exists
    if (quote.quoteNumber) {
      return null;
    }

    // Get the count of quotes for this tenant
    const quotesSnapshot = await db
      .collection(`tenants/${tenantId}/quotes`)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const currentYear = new Date().getFullYear();
    let nextNumber = 1;

    if (!quotesSnapshot.empty) {
      const lastQuote = quotesSnapshot.docs[0].data();
      if (lastQuote.quoteNumber) {
        const lastNumber = parseInt(lastQuote.quoteNumber.split('-')[1] || '0');
        nextNumber = lastNumber + 1;
      }
    }

    const quoteNumber = `Q${currentYear}-${String(nextNumber).padStart(5, '0')}`;

    await snapshot.ref.update({
      quoteNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });

// ===========================================
// Generate Job Number
// ===========================================
export const generateJobNumber = functions.firestore
  .document('tenants/{tenantId}/jobs/{jobId}')
  .onCreate(async (snapshot, context) => {
    const { tenantId, jobId } = context.params;
    const job = snapshot.data();

    if (job.jobNumber) {
      return null;
    }

    const jobsSnapshot = await db
      .collection(`tenants/${tenantId}/jobs`)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const currentYear = new Date().getFullYear();
    let nextNumber = 1;

    if (!jobsSnapshot.empty) {
      const lastJob = jobsSnapshot.docs[0].data();
      if (lastJob.jobNumber) {
        const lastNumber = parseInt(lastJob.jobNumber.split('-')[1] || '0');
        nextNumber = lastNumber + 1;
      }
    }

    const jobNumber = `JOB${currentYear}-${String(nextNumber).padStart(5, '0')}`;

    await snapshot.ref.update({
      jobNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });

// ===========================================
// Generate Invoice Number
// ===========================================
export const generateInvoiceNumber = functions.firestore
  .document('tenants/{tenantId}/invoices/{invoiceId}')
  .onCreate(async (snapshot, context) => {
    const { tenantId, invoiceId } = context.params;
    const invoice = snapshot.data();

    if (invoice.invoiceNumber) {
      return null;
    }

    const invoicesSnapshot = await db
      .collection(`tenants/${tenantId}/invoices`)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const currentYear = new Date().getFullYear();
    let nextNumber = 1;

    if (!invoicesSnapshot.empty) {
      const lastInvoice = invoicesSnapshot.docs[0].data();
      if (lastInvoice.invoiceNumber) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1] || '0');
        nextNumber = lastNumber + 1;
      }
    }

    const invoiceNumber = `INV${currentYear}-${String(nextNumber).padStart(5, '0')}`;

    await snapshot.ref.update({
      invoiceNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });
