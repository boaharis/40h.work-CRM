import { Timestamp } from 'firebase/firestore';

// ============================================
// TENANT & ORGANIZATION TYPES
// ============================================

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: 'active' | 'suspended' | 'trial';
  subscription: SubscriptionTier;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  config: TenantConfig;
  branding: TenantBranding;
  features: TenantFeatures;
}

export interface TenantConfig {
  // Pipeline Configuration
  pipelineStages: PipelineStage[];

  // Custom Fields Configuration
  customFields: {
    customer: CustomField[];
    lead: CustomField[];
    quote: CustomField[];
    job: CustomField[];
  };

  // Form Layouts
  formLayouts: {
    [key: string]: FormLayout;
  };

  // Calculation Rules
  calculationRules: CalculationRule[];

  // Automation Workflows
  automationWorkflows: AutomationWorkflow[];

  // Business Settings
  businessHours: BusinessHours;
  timezone: string;
  currency: string;
  dateFormat: string;

  // Communication Settings
  emailSettings: EmailSettings;
  smsSettings: SMSSettings;
  whatsappSettings: WhatsAppSettings;
}

export interface TenantBranding {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorPalette: ColorPalette;
  typography: Typography;
  customCSS?: string;
  companyName: string;
  tagline?: string;
  emailSignature?: string;
}

export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
  success: ColorShades;
  warning: ColorShades;
  error: ColorShades;
  neutral: ColorShades;
}

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface Typography {
  fontFamily: string;
  headingFont?: string;
  baseFontSize: number;
}

export interface TenantFeatures {
  communications: boolean;
  leadManagement: boolean;
  quotes: boolean;
  jobs: boolean;
  invoicing: boolean;
  resourceManagement: boolean;
  analytics: boolean;
  automations: boolean;
  customerPortal: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
}

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: string;
  tenantId: string;
  email: string;
  phoneNumber?: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'invited';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  settings: UserSettings;
}

export type UserRole = 'admin' | 'manager' | 'sales' | 'field_team' | 'viewer';

export type Permission =
  | 'view_dashboard'
  | 'view_customers'
  | 'edit_customers'
  | 'delete_customers'
  | 'view_leads'
  | 'edit_leads'
  | 'delete_leads'
  | 'view_quotes'
  | 'create_quotes'
  | 'edit_quotes'
  | 'delete_quotes'
  | 'approve_quotes'
  | 'view_jobs'
  | 'create_jobs'
  | 'edit_jobs'
  | 'delete_jobs'
  | 'view_invoices'
  | 'create_invoices'
  | 'edit_invoices'
  | 'delete_invoices'
  | 'view_financials'
  | 'manage_team'
  | 'manage_settings'
  | 'manage_integrations'
  | 'view_analytics';

export interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  language: string;
  timezone: string;
}

// ============================================
// CUSTOMER & LEAD TYPES
// ============================================

export interface Customer {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  addresses: Address[];
  tags: string[];
  customFields: Record<string, any>;
  status: 'active' | 'inactive';
  leadSource?: string;
  assignedTo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;

  // Computed fields
  lifetimeValue: number;
  averageTransactionSize: number;
  lastInteractionAt?: Timestamp;
  totalJobs: number;
  totalInvoices: number;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

export interface Lead {
  id: string;
  tenantId: string;
  customerId?: string; // Link to customer if converted
  source: LeadSource;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  pipelineStage: string;
  score: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string[];
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: Timestamp;
  notes: string;
  customFields: Record<string, any>;
  tags: string[];
  assignedTo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  convertedAt?: Timestamp;
  lostReason?: string;

  // Pipeline history
  pipelineHistory: PipelineHistoryEntry[];

  // Activity tracking
  lastActivityAt?: Timestamp;
  lastContactedAt?: Timestamp;
}

export type LeadSource =
  | 'website'
  | 'email'
  | 'phone'
  | 'referral'
  | 'social_media'
  | 'advertising'
  | 'walk_in'
  | 'other';

export interface PipelineHistoryEntry {
  stage: string;
  enteredAt: Timestamp;
  exitedAt?: Timestamp;
  duration?: number; // in seconds
  movedBy: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
  requiredFields: string[];
  requiredTasks: TaskTemplate[];
  automations: string[]; // IDs of automation workflows
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  required: boolean;
}

// ============================================
// COMMUNICATION TYPES
// ============================================

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  leadId?: string;
  status: 'open' | 'closed';
  tags: string[];
  assignedTo?: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  conversationId: string;
  tenantId: string;
  channel: 'email' | 'sms' | 'whatsapp';
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  subject?: string; // For emails
  body: string;
  bodyHtml?: string; // For emails
  attachments: Attachment[];
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  metadata: Record<string, any>;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  body: string;
  variables: string[];
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================
// QUOTE TYPES
// ============================================

export interface Quote {
  id: string;
  tenantId: string;
  customerId: string;
  leadId?: string;
  quoteNumber: string;
  version: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  validUntil: Timestamp;

  // Line items
  lineItems: QuoteLineItem[];

  // Calculations
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  discountPercentage?: number;
  total: number;

  // Internal cost analysis
  estimatedCost: number;
  margin: number;
  marginPercentage: number;

  // Metadata
  notes?: string;
  terms?: string;
  customFields: Record<string, any>;

  // Approval workflow
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Timestamp;

  // Version control
  parentQuoteId?: string; // If this is a revision
  revisions: string[]; // IDs of child revisions

  // Delivery
  sentAt?: Timestamp;
  viewedAt?: Timestamp;
  acceptedAt?: Timestamp;
  rejectedAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface QuoteLineItem {
  id: string;
  type: 'service' | 'product' | 'fee';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;

  // For internal tracking
  unitCost?: number;
  costTotal?: number;
}

// ============================================
// JOB TYPES
// ============================================

export interface Job {
  id: string;
  tenantId: string;
  customerId: string;
  quoteId?: string;
  jobNumber: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  serviceType: string;

  // Scheduling
  scheduledDate: Timestamp;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDuration: number; // in minutes

  // Actual execution
  actualStartTime?: Timestamp;
  actualEndTime?: Timestamp;
  actualDuration?: number; // in minutes

  // Team assignment
  assignedTeamId: string;
  assignedMembers: string[];

  // Equipment
  equipmentUsed: EquipmentAssignment[];

  // Location
  serviceAddress: Address;
  destinationAddress?: Address; // For moving jobs

  // Execution details
  checklistItems: ChecklistItem[];
  photos: JobPhoto[];
  notes: string;
  customFields: Record<string, any>;

  // Customer feedback
  customerSignature?: string;
  customerRating?: number;
  customerFeedback?: string;

  // Financials
  estimatedCost: number;
  actualCost: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  createdBy: string;
}

export interface EquipmentAssignment {
  equipmentId: string;
  equipmentName: string;
  checkOutTime: Timestamp;
  checkInTime?: Timestamp;
}

export interface ChecklistItem {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
  photoRequired: boolean;
  photoIds: string[];
}

export interface JobPhoto {
  id: string;
  url: string;
  caption?: string;
  category: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

// ============================================
// INVOICE TYPES
// ============================================

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  jobId?: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  // Line items
  lineItems: InvoiceLineItem[];

  // Calculations
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;

  // Payment terms
  dueDate: Timestamp;
  paymentTerms: string;

  // Payment tracking
  payments: Payment[];

  // Reminders
  remindersSent: ReminderSent[];

  // Metadata
  notes?: string;
  customFields: Record<string, any>;

  // Timestamps
  issuedAt: Timestamp;
  sentAt?: Timestamp;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface InvoiceLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'card' | 'bank_transfer' | 'cash' | 'check' | 'other';
  stripePaymentIntentId?: string;
  reference?: string;
  notes?: string;
  receivedAt: Timestamp;
  recordedBy: string;
}

export interface ReminderSent {
  sentAt: Timestamp;
  type: 'gentle' | 'firm' | 'final';
  channel: 'email' | 'sms';
}

// ============================================
// RESOURCE MANAGEMENT TYPES
// ============================================

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  members: string[]; // User IDs
  skills: string[];
  equipment: string[]; // Equipment IDs
  status: 'available' | 'busy' | 'offline';

  // Capacity planning
  dailyCapacity: number; // hours
  currentWorkload: number; // hours

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Equipment {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';

  // Location tracking
  currentLocation?: string;
  assignedTo?: string; // Team ID or User ID

  // Maintenance
  lastMaintenanceDate?: Timestamp;
  nextMaintenanceDate?: Timestamp;
  maintenanceHistory: MaintenanceRecord[];

  // Usage tracking
  utilizationRate: number; // percentage

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MaintenanceRecord {
  id: string;
  date: Timestamp;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  performedBy: string;
}

// ============================================
// AUTOMATION TYPES
// ============================================

export interface AutomationWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  status: 'active' | 'inactive';
  executionCount: number;
  lastExecutedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface AutomationTrigger {
  type: 'data_change' | 'schedule' | 'webhook' | 'manual';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface AutomationAction {
  type: 'send_email' | 'send_sms' | 'assign_user' | 'update_field' | 'create_task' | 'webhook';
  config: Record<string, any>;
}

// ============================================
// CUSTOM FIELD TYPES
// ============================================

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'file' | 'calculated';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select/multiselect
  validationRules?: ValidationRule[];
  calculationFormula?: string; // For calculated fields
  order: number;
  showInList: boolean;
  showInDetail: boolean;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface FormLayout {
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  title: string;
  fields: string[]; // Field IDs
  columns: 1 | 2 | 3;
  collapsible: boolean;
  defaultCollapsed: boolean;
}

export interface CalculationRule {
  id: string;
  name: string;
  formula: string;
  outputField: string;
  triggerFields: string[];
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: boolean;
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface EmailSettings {
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  useOAuth: boolean;
}

export interface SMSSettings {
  provider: 'twilio' | 'other';
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
}

export interface WhatsAppSettings {
  phoneNumberId?: string;
  accessToken?: string;
  businessAccountId?: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardMetrics {
  monthlyRevenue: number;
  revenueChange: number; // percentage
  activeLeads: number;
  leadsChange: number;
  closingRate: number;
  closingRateChange: number;
  averageTicketSize: number;
  ticketSizeChange: number;
  pipelineValue: number;
  pipelineBreakdown: PipelineStageMetric[];
}

export interface PipelineStageMetric {
  stage: string;
  count: number;
  value: number;
  averageDuration: number; // days
}

export interface ActivityLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  type: 'customer_created' | 'quote_sent' | 'job_completed' | 'invoice_paid' | 'lead_moved';
  entityType: 'customer' | 'lead' | 'quote' | 'job' | 'invoice';
  entityId: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Timestamp;
}
