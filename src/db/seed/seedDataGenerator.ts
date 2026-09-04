import {
  MerchantRecord,
  UserRecord,
  CustomerRecord,
  PaymentRecord,
  PaymentAttemptRecord,
  CheckoutSessionRecord,
  SubscriptionRecord,
  InvoiceRecord,
  RevenueRiskEventRecord,
  RecoveryAttemptRecord,
  RecoveryCampaignRecord,
  CampaignItemRecord,
  AIDecisionRecord,
  AgentActionRecord,
  NotificationRecord,
  RecoveryPolicyRecord,
  AuditLogRecord,
  RevenueRiskType,
  PaymentMethod,
  EventStatus,
} from '@/types/database';

export interface SeedDataResult {
  merchants: MerchantRecord[];
  users: UserRecord[];
  customers: CustomerRecord[];
  payments: PaymentRecord[];
  paymentAttempts: PaymentAttemptRecord[];
  checkoutSessions: CheckoutSessionRecord[];
  subscriptions: SubscriptionRecord[];
  invoices: InvoiceRecord[];
  revenueRiskEvents: RevenueRiskEventRecord[];
  recoveryAttempts: RecoveryAttemptRecord[];
  recoveryCampaigns: RecoveryCampaignRecord[];
  campaignItems: CampaignItemRecord[];
  aiDecisions: AIDecisionRecord[];
  agentActions: AgentActionRecord[];
  notifications: NotificationRecord[];
  recoveryPolicies: RecoveryPolicyRecord[];
  auditLogs: AuditLogRecord[];
}

export function generateDeterministicSeedData(): SeedDataResult {
  const now = new Date('2026-09-02T12:00:00.000Z');

  // 1. Merchant
  const merchants: MerchantRecord[] = [
    {
      id: 'MERCHANT_DEFAULT',
      name: 'TechCraft Commerce Pvt Ltd',
      businessCategory: 'B2B & E-Commerce SaaS',
      country: 'IND',
      defaultCurrency: 'INR',
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 2. Users
  const users: UserRecord[] = [
    {
      id: 'USR-ADMIN-1',
      merchantId: 'MERCHANT_DEFAULT',
      email: 'finance.lead@techcraft.in',
      fullName: 'Alok Yadav',
      role: 'MERCHANT_ADMIN',
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 3. Customers (100+ Indian Customers)
  const FIRST_NAMES = [
    'Aarav', 'Aditi', 'Alok', 'Ananya', 'Arjun', 'Bhavna', 'Chetan', 'Deepak', 'Divya', 'Gaurav',
    'Harsh', 'Ishaan', 'Jaya', 'Karan', 'Kavita', 'Manish', 'Neha', 'Nikhil', 'Pooja', 'Pranav',
    'Priya', 'Rahul', 'Rhea', 'Rohan', 'Sakshi', 'Sanjay', 'Shreya', 'Siddharth', 'Sneha', 'Tanvi',
    'Tarun', 'Utkarsh', 'Vaibhav', 'Varun', 'Vikas', 'Yash', 'Zoya', 'Abhishek', 'Akanksha', 'Amit',
    'Amrita', 'Aniket', 'Ankit', 'Archana', 'Ashish', 'Avinash', 'Ayush', 'Bharat', 'Chirag', 'Damini'
  ];

  const LAST_NAMES = [
    'Sharma', 'Verma', 'Patel', 'Yadav', 'Gupta', 'Mehta', 'Singh', 'Reddy', 'Nair', 'Iyer',
    'Chopra', 'Malhotra', 'Bhatia', 'Joshi', 'Kapoor', 'Deshmukh', 'Kulkarni', 'Banerjee', 'Ghosh', 'Rao',
    'Mishra', 'Agarwal', 'Shah', 'Jain', 'Saxena', 'Pandey', 'Tripathi', 'Dubey', 'Soni', 'Thakur'
  ];

  const COMPANIES = [
    'TechNova Solutions', 'ZetaPay Logistics', 'Nexus Digital', 'UrbanSphere Commerce', 'CloudScale Technologies',
    'FinVantage Capital', 'HyperGrowth Media', 'OmniChannel Retail', 'BharatERP Systems', 'InstaFulfill Supply',
    'PeakFlow SaaS', 'BlueSky Analytics', 'Matrix Infra', 'AgileHealth Tech', 'QuantumSecure Labs',
    'Vanguard Mobility', 'Astra Logistics', 'GreenLeaf Organics', 'PulseRate Medical', 'CyberShield Systems'
  ];

  const customers: CustomerRecord[] = [];

  // Hero Customers
  customers.push({
    id: 'CUST-1001',
    merchantId: 'MERCHANT_DEFAULT',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@gmail.com',
    phone: '+91 98201 44521',
    company: 'Nexus Studio',
    lifetimeValue: 48900,
    paymentReliabilityScore: 92,
    totalSuccessfulPayments: 8,
    totalFailedPayments: 1,
    isOptedOut: false,
    notes: 'Long-time customer with excellent payment track record.',
    createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
    updatedAt: now.toISOString(),
  });

  customers.push({
    id: 'CUST-1002',
    merchantId: 'MERCHANT_DEFAULT',
    name: 'Rahul Verma',
    email: 'rahul.verma@techcraft.in',
    phone: '+91 98450 12390',
    company: 'TechCraft Solutions',
    lifetimeValue: 64200,
    paymentReliabilityScore: 84,
    totalSuccessfulPayments: 5,
    totalFailedPayments: 0,
    isOptedOut: false,
    notes: 'High-value customer, shopping cart abandoned at OTP stage.',
    createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
    updatedAt: now.toISOString(),
  });

  customers.push({
    id: 'CUST-1003',
    merchantId: 'MERCHANT_DEFAULT',
    name: 'Rohan Gupta',
    email: 'r.gupta@technova.io',
    phone: '+91 99880 77661',
    company: 'TechNova Solutions',
    lifetimeValue: 850000,
    paymentReliabilityScore: 78,
    totalSuccessfulPayments: 12,
    totalFailedPayments: 2,
    isOptedOut: false,
    notes: 'Enterprise account. 12 days overdue on annual enterprise license.',
    createdAt: new Date(now.getTime() - 80 * 86400000).toISOString(),
    updatedAt: now.toISOString(),
  });

  // Generate 102 more deterministic customers (Total: 105 customers)
  for (let i = 4; i <= 105; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 11) % LAST_NAMES.length];
    const company = i % 3 === 0 ? COMPANIES[(i * 5) % COMPANIES.length] : undefined;
    const ltv = 5000 + ((i * 1373) % 185000);
    const reliability = 55 + ((i * 17) % 43);
    const successful = 2 + ((i * 3) % 15);
    const failed = i % 6 === 0 ? 2 : i % 3 === 0 ? 1 : 0;

    customers.push({
      id: `CUST-${1000 + i}`,
      merchantId: 'MERCHANT_DEFAULT',
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${
        company ? company.toLowerCase().replace(/[^a-z]/g, '') + '.in' : 'gmail.com'
      }`,
      phone: `+91 ${98000 + i * 179} ${10000 + i * 88}`.slice(0, 15),
      company,
      lifetimeValue: ltv,
      paymentReliabilityScore: reliability,
      totalSuccessfulPayments: successful,
      totalFailedPayments: failed,
      isOptedOut: i === 42 || i === 88, // 2 customers opted out for safety demo
      createdAt: new Date(now.getTime() - (i * 12 + 10) * 3600000).toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  // 4. Payments (260 payments total)
  const payments: PaymentRecord[] = [];
  const paymentAttempts: PaymentAttemptRecord[] = [];
  const AMOUNTS = [499, 999, 1499, 2499, 2999, 4999, 6500, 8500, 12500, 18000, 25000, 45000, 75000, 150000];
  const METHODS: PaymentMethod[] = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NETBANKING', 'NACH'];
  const ERROR_CODES = [
    { code: 'INSUFFICIENT_FUNDS', desc: 'Customer account had insufficient balance at debit time.' },
    { code: 'TEMPORARY_BANK_OUTAGE', desc: 'Partner bank gateway returned 503 service unavailable.' },
    { code: 'CARD_EXPIRED', desc: 'Saved card token has expired.' },
    { code: 'AUTH_FAILED', desc: '3DS OTP verification timed out.' },
    { code: 'BANK_DECLINE', desc: 'Issuing bank declined debit due to daily velocity limits.' },
    { code: 'NETWORK_TIMEOUT', desc: 'Gateway timeout during handshake.' },
  ];

  for (let i = 1; i <= 260; i++) {
    const cust = customers[i % customers.length];
    const amount = AMOUNTS[(i * 7) % AMOUNTS.length];
    const method = METHODS[i % METHODS.length];
    const isFailed = i <= 110; // First 110 payments failed, rest captured
    const errObj = isFailed ? ERROR_CODES[i % ERROR_CODES.length] : undefined;
    const createdAt = new Date(now.getTime() - (260 - i) * 3 * 3600000).toISOString();

    const payment: PaymentRecord = {
      id: i === 1 ? 'pay_hero_99182' : `pay_${1000 + i}`,
      merchantId: 'MERCHANT_DEFAULT',
      customerId: cust.id,
      amount: i === 1 ? 4999 : amount,
      currency: 'INR',
      paymentMethod: i === 1 ? 'UPI' : method,
      status: isFailed ? 'FAILED' : 'CAPTURED',
      gatewayReference: `rzp_gw_${1000 + i}`,
      errorCode: errObj?.code,
      errorDescription: errObj?.desc,
      createdAt,
      updatedAt: createdAt,
    };
    payments.push(payment);

    // Record initial payment attempt
    paymentAttempts.push({
      id: `att_${1000 + i}_1`,
      paymentId: payment.id,
      attemptNumber: 1,
      amount: payment.amount,
      currency: 'INR',
      provider: 'MOCK',
      status: isFailed ? 'FAILED' : 'SUCCESS',
      transactionId: `txn_att_${1000 + i}`,
      rawErrorCode: errObj?.code,
      rawErrorMessage: errObj?.desc,
      createdAt,
    });
  }

  // 5. Checkout Sessions (55 Checkout Abandonments)
  const checkoutSessions: CheckoutSessionRecord[] = [];
  for (let i = 1; i <= 55; i++) {
    const cust = customers[(i * 2) % customers.length];
    const amount = [1499, 2999, 4999, 8500, 12500, 25000][i % 6];
    const createdAt = new Date(now.getTime() - i * 4 * 3600000).toISOString();
    const isRecovered = i % 3 === 0;

    checkoutSessions.push({
      id: i === 1 ? 'chk_sess_99342' : `chk_sess_${1000 + i}`,
      merchantId: 'MERCHANT_DEFAULT',
      customerId: cust.id,
      cartValue: i === 1 ? 8500 : amount,
      currency: 'INR',
      stepReached: 'PAYMENT_METHOD',
      paymentMethodSelected: 'CREDIT_CARD',
      status: isRecovered ? 'RECOVERED' : 'ABANDONED',
      abandonedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // 6. Subscriptions (35 Subscription Failures)
  const subscriptions: SubscriptionRecord[] = [];
  for (let i = 1; i <= 35; i++) {
    const cust = customers[(i * 3) % customers.length];
    const amount = [999, 1999, 2999, 4999, 9999][i % 5];
    const createdAt = new Date(now.getTime() - i * 8 * 3600000).toISOString();
    const isRecovered = i % 2 === 0;

    subscriptions.push({
      id: i === 1 ? 'sub_pro_monthly_44' : `sub_${1000 + i}`,
      merchantId: 'MERCHANT_DEFAULT',
      customerId: cust.id,
      planName: amount > 5000 ? 'Enterprise Pro Tier' : 'Growth Plan Monthly',
      billingAmount: i === 1 ? 2999 : amount,
      currency: 'INR',
      billingInterval: 'MONTHLY',
      status: isRecovered ? 'RECOVERED' : 'PAST_DUE',
      consecutiveFailedAttempts: isRecovered ? 1 : 2,
      lastBillingDate: createdAt,
      nextBillingDate: new Date(new Date(createdAt).getTime() + 30 * 86400000).toISOString(),
      createdAt,
      updatedAt: createdAt,
    });
  }

  // 7. Invoices (35 Overdue B2B Invoices)
  const invoices: InvoiceRecord[] = [];
  for (let i = 1; i <= 35; i++) {
    const cust = customers[(i * 5) % customers.length];
    const amount = [25000, 45000, 75000, 120000, 150000, 250000][i % 6];
    const daysOverdue = 5 + (i % 25);
    const dueDate = new Date(now.getTime() - daysOverdue * 86400000).toISOString();
    const isPaid = i % 4 === 0;

    invoices.push({
      id: i === 1 ? 'inv_hero_1042' : `inv_${1000 + i}`,
      merchantId: 'MERCHANT_DEFAULT',
      customerId: cust.id,
      invoiceNumber: i === 1 ? 'INV-1042' : `INV-${1000 + i}`,
      amount: i === 1 ? 150000 : amount,
      currency: 'INR',
      dueDate,
      daysOverdue: isPaid ? 0 : daysOverdue,
      status: isPaid ? 'PAID' : 'OVERDUE',
      paidAt: isPaid ? new Date(now.getTime() - 2 * 86400000).toISOString() : undefined,
      createdAt: new Date(new Date(dueDate).getTime() - 30 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  // 8. Revenue Risk Events (210 Events total across all 4 categories)
  const revenueRiskEvents: RevenueRiskEventRecord[] = [];
  const recoveryAttempts: RecoveryAttemptRecord[] = [];
  const aiDecisions: AIDecisionRecord[] = [];
  const agentActions: AgentActionRecord[] = [];
  const notifications: NotificationRecord[] = [];
  const auditLogs: AuditLogRecord[] = [];

  // Hero Case 1: Single Event ₹4,999 Payment Failure
  const heroEventDate = new Date(now.getTime() - 2 * 3600000).toISOString();
  revenueRiskEvents.push({
    id: 'EVT-HERO-4999',
    merchantId: 'MERCHANT_DEFAULT',
    customerId: 'CUST-1001',
    type: 'PAYMENT_FAILURE',
    amount: 4999,
    currency: 'INR',
    status: 'RECOMMENDED',
    riskLevel: 'LOW',
    paymentId: 'pay_hero_99182',
    rawErrorCode: 'INSUFFICIENT_FUNDS',
    retryCount: 0,
    maxRetriesAllowed: 3,
    reminderCount: 0,
    maxRemindersAllowed: 3,
    recoveredAmount: 0,
    escalationLevel: 1,
    createdAt: heroEventDate,
    updatedAt: heroEventDate,
  });

  aiDecisions.push({
    id: 'DEC-HERO-4999',
    eventId: 'EVT-HERO-4999',
    rootCauseCategory: 'INSUFFICIENT_FUNDS',
    rootCauseTitle: 'Temporary Account Balance Shortfall',
    explanation: 'Customer attempted UPI payment during payroll transition window. Customer has 8 previous successful settlements.',
    recoveryProbability: 87,
    confidenceLevel: 'HIGH',
    recommendedAction: 'SMART_RETRY',
    recommendedDelayHours: 2,
    scoreFactors: [
      { impact: 'POSITIVE', description: 'Previous 8 payments were successful (100% historical settlement)', weight: 35 },
      { impact: 'POSITIVE', description: 'High customer payment reliability score (92/100)', weight: 30 },
      { impact: 'POSITIVE', description: 'Temporary liquidity deficit matches payroll cycle', weight: 25 },
      { impact: 'NEGATIVE', description: 'First retry window pending', weight: -3 },
    ],
    createdAt: heroEventDate,
  });

  auditLogs.push({
    id: 'AUD-HERO-1',
    timestamp: heroEventDate,
    actor: 'System Ingestion',
    actorType: 'SYSTEM',
    eventId: 'EVT-HERO-4999',
    action: 'EVENT_INGESTED',
    reason: '₹4,999 UPI payment failure on HDFC Bank ingested.',
    policyResult: 'PASSED',
    amount: 4999,
  });

  // Hero Case 2: Checkout Abandonment ₹8,500
  revenueRiskEvents.push({
    id: 'EVT-HERO-8500',
    merchantId: 'MERCHANT_DEFAULT',
    customerId: 'CUST-1002',
    type: 'CHECKOUT_ABANDONMENT',
    amount: 8500,
    currency: 'INR',
    status: 'RECOMMENDED',
    riskLevel: 'MEDIUM',
    checkoutSessionId: 'chk_sess_99342',
    rawErrorCode: 'CHECKOUT_DROPOFF',
    retryCount: 0,
    maxRetriesAllowed: 3,
    reminderCount: 0,
    maxRemindersAllowed: 3,
    recoveredAmount: 0,
    escalationLevel: 1,
    createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
  });

  // Hero Case 3: Subscription Failure ₹2,999
  revenueRiskEvents.push({
    id: 'EVT-HERO-2999',
    merchantId: 'MERCHANT_DEFAULT',
    customerId: 'CUST-1004',
    type: 'SUBSCRIPTION_FAILURE',
    amount: 2999,
    currency: 'INR',
    status: 'SCHEDULED',
    riskLevel: 'LOW',
    subscriptionId: 'sub_pro_monthly_44',
    rawErrorCode: 'TEMPORARY_BANK_OUTAGE',
    retryCount: 1,
    maxRetriesAllowed: 3,
    reminderCount: 0,
    maxRemindersAllowed: 3,
    recoveredAmount: 0,
    escalationLevel: 1,
    createdAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
  });

  // Hero Case 4: Overdue B2B Invoice ₹1,50,000
  revenueRiskEvents.push({
    id: 'EVT-HERO-150000',
    merchantId: 'MERCHANT_DEFAULT',
    customerId: 'CUST-1003',
    type: 'OVERDUE_INVOICE',
    amount: 150000,
    currency: 'INR',
    status: 'AWAITING_APPROVAL',
    riskLevel: 'HIGH',
    invoiceId: 'inv_hero_1042',
    rawErrorCode: 'INVOICE_NEGLECT',
    retryCount: 0,
    maxRetriesAllowed: 3,
    reminderCount: 1,
    maxRemindersAllowed: 3,
    recoveredAmount: 0,
    escalationLevel: 2,
    createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
  });

  // Generate Remaining 206 Events with Mixed Deterministic Outcomes
  const EVENT_TYPES: RevenueRiskType[] = [
    'PAYMENT_FAILURE',
    'CHECKOUT_ABANDONMENT',
    'SUBSCRIPTION_FAILURE',
    'OVERDUE_INVOICE',
  ];

  const STATUS_POOL: EventStatus[] = [
    'RECOVERED',
    'RECOVERED',
    'RECOVERED',
    'AT_RISK',
    'RECOMMENDED',
    'IN_PROGRESS',
    'AWAITING_APPROVAL',
    'SCHEDULED',
    'FAILED',
    'STOPPED',
    'MANUAL_REVIEW',
  ];

  for (let i = 5; i <= 210; i++) {
    const cust = customers[(i * 3) % customers.length];
    const type = EVENT_TYPES[i % EVENT_TYPES.length];
    const amount = AMOUNTS[(i * 7) % AMOUNTS.length];
    const status = cust.isOptedOut ? 'STOPPED' : STATUS_POOL[(i * 7 + 3) % STATUS_POOL.length];
    const isRecovered = status === 'RECOVERED';
    const createdAt = new Date(now.getTime() - (215 - i) * 2 * 3600000).toISOString();
    const eventId = `EVT-${1000 + i}`;

    revenueRiskEvents.push({
      id: eventId,
      merchantId: 'MERCHANT_DEFAULT',
      customerId: cust.id,
      type,
      amount,
      currency: 'INR',
      status,
      riskLevel: amount > 50000 ? 'HIGH' : isRecovered ? 'LOW' : 'MEDIUM',
      paymentId: type === 'PAYMENT_FAILURE' ? `pay_${1000 + i}` : undefined,
      checkoutSessionId: type === 'CHECKOUT_ABANDONMENT' ? `chk_sess_${1000 + i}` : undefined,
      subscriptionId: type === 'SUBSCRIPTION_FAILURE' ? `sub_${1000 + i}` : undefined,
      invoiceId: type === 'OVERDUE_INVOICE' ? `inv_${1000 + i}` : undefined,
      rawErrorCode: type === 'PAYMENT_FAILURE' ? 'INSUFFICIENT_FUNDS' : 'CHECKOUT_DROPOFF',
      retryCount: isRecovered ? 1 : status === 'STOPPED' ? 3 : i % 3,
      maxRetriesAllowed: 3,
      reminderCount: type === 'OVERDUE_INVOICE' ? 1 : 0,
      maxRemindersAllowed: 3,
      recoveredAmount: isRecovered ? amount : 0,
      recoveredAt: isRecovered ? new Date(new Date(createdAt).getTime() + 3600000).toISOString() : undefined,
      recoveryMethodUsed: isRecovered ? (type === 'PAYMENT_FAILURE' ? 'SMART_RETRY' : 'PAYMENT_LINK') : undefined,
      escalationLevel: status === 'STOPPED' ? 4 : isRecovered ? 1 : 2,
      createdAt,
      updatedAt: createdAt,
    });

    if (isRecovered) {
      recoveryAttempts.push({
        id: `rcv_att_${1000 + i}`,
        eventId,
        interventionType: 'SMART_RETRY',
        attemptNumber: 1,
        status: 'SUCCESS',
        idempotencyKey: `IDEMP_SEED_RCV_${eventId}`,
        provider: 'MOCK',
        gatewayResponseId: `pay_captured_${1000 + i}`,
        amountAttempted: amount,
        amountRecovered: amount,
        executedAt: new Date(new Date(createdAt).getTime() + 3600000).toISOString(),
      });
    }
  }

  // 9. Recovery Campaigns
  const recoveryCampaigns: RecoveryCampaignRecord[] = [
    {
      id: 'CMP-101',
      merchantId: 'MERCHANT_DEFAULT',
      name: 'End-of-Month Enterprise & UPI Revenue Sweep',
      filterType: 'ALL',
      status: 'COMPLETED',
      totalCases: 100,
      totalAtRisk: 840000,
      predictedRecoverable: 472000,
      expectedRecoveryRate: 56.2,
      actualRecovered: 391500,
      actualRecoveryRate: 46.6,
      processedCount: 100,
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'CMP-102',
      merchantId: 'MERCHANT_DEFAULT',
      name: 'High-Value Checkout Abandonment Win-Back',
      filterType: 'CHECKOUT_ABANDONMENT',
      status: 'RUNNING',
      totalCases: 35,
      totalAtRisk: 295000,
      predictedRecoverable: 185000,
      expectedRecoveryRate: 62.7,
      actualRecovered: 118000,
      actualRecoveryRate: 40.0,
      processedCount: 23,
      createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 10. Recovery Policies
  const recoveryPolicies: RecoveryPolicyRecord[] = [
    {
      id: 'POL_MERCHANT_DEFAULT',
      merchantId: 'MERCHANT_DEFAULT',
      maxPaymentRetries: 3,
      maxSubscriptionRetries: 3,
      maxReminders: 3,
      minRetryIntervalHours: 2,
      minReminderIntervalHours: 24,
      maxAutomatedRecoveryAmount: 50000,
      autoApproveConfidenceScore: 80,
      stopIfPaymentSuccess: true,
      stopIfInvoicePaid: true,
      stopIfSubscriptionRecovered: true,
      stopIfCustomerOptout: true,
      stopIfMaxAttemptsReached: true,
      stopIfManualReviewRequired: true,
      quietHoursEnabled: true,
      quietHoursStart: '21:00',
      quietHoursEnd: '08:00',
      updatedAt: now.toISOString(),
    },
  ];

  return {
    merchants,
    users,
    customers,
    payments,
    paymentAttempts,
    checkoutSessions,
    subscriptions,
    invoices,
    revenueRiskEvents,
    recoveryAttempts,
    recoveryCampaigns,
    campaignItems: [],
    aiDecisions,
    agentActions,
    notifications,
    recoveryPolicies,
    auditLogs,
  };
}
