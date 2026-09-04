import { 
  Customer, 
  RevenueRiskEvent, 
  RevenueRiskType,
  PaymentMethod,
  EventStatus,
  RecoveryPolicy, 
  RecoveryCampaign, 
  AuditLogEntry, 
  ScoreFactor, 
  AIRootCauseDiagnosis 
} from '@/types';

// Deterministic seed dataset for RecoverAI
export const INITIAL_POLICY: RecoveryPolicy = {
  maxPaymentRetries: 3,
  maxSubscriptionRetries: 3,
  maxReminders: 3,
  minRetryIntervalHours: 2,
  minReminderIntervalHours: 24,
  maxAutomatedRecoveryAmount: 50000, // ₹50,000 limit before requiring merchant approval
  autoApproveConfidenceScore: 80, // >= 80% auto-approves low-risk interventions
  stopIfPaymentSuccess: true,
  stopIfInvoicePaid: true,
  stopIfSubscriptionRecovered: true,
  stopIfCustomerOptout: true,
  stopIfMaxAttemptsReached: true,
  stopIfManualReviewRequired: true,
  quietHoursEnabled: true,
  quietHoursStart: '21:00',
  quietHoursEnd: '08:00',
};

// 100 Indian Customers
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

export function generateCustomers(): Customer[] {
  const customers: Customer[] = [];
  
  // Hero Customer 1: Aditi Sharma (High reliability, for the ₹4,999 demo)
  customers.push({
    id: 'CUST-1001',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@gmail.com',
    phone: '+91 98201 44521',
    company: 'Nexus Studio',
    lifetimeValue: 48900,
    paymentReliabilityScore: 92,
    totalSuccessfulPayments: 8,
    totalFailedPayments: 1,
    isOptedOut: false,
    notes: 'Long-time customer with excellent payment track record.'
  });

  // Hero Customer 2: Rahul Verma (Checkout abandonment ₹8,500)
  customers.push({
    id: 'CUST-1002',
    name: 'Rahul Verma',
    email: 'rahul.verma@techcraft.in',
    phone: '+91 98450 12390',
    company: 'TechCraft Solutions',
    lifetimeValue: 64200,
    paymentReliabilityScore: 84,
    totalSuccessfulPayments: 5,
    totalFailedPayments: 0,
    isOptedOut: false,
    notes: 'High-value customer, shopping cart abandoned at OTP stage.'
  });

  // Hero Customer 3: Rohan Gupta (B2B Invoice ₹1,50,000)
  customers.push({
    id: 'CUST-1003',
    name: 'Rohan Gupta',
    email: 'r.gupta@technova.io',
    phone: '+91 99880 77661',
    company: 'TechNova Solutions',
    lifetimeValue: 850000,
    paymentReliabilityScore: 78,
    totalSuccessfulPayments: 12,
    totalFailedPayments: 2,
    isOptedOut: false,
    notes: 'Enterprise account. 12 days overdue on annual enterprise license.'
  });

  // Generate 97 more deterministic customers
  for (let i = 4; i <= 100; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 11) % LAST_NAMES.length];
    const company = (i % 3 === 0) ? COMPANIES[(i * 5) % COMPANIES.length] : undefined;
    const ltv = 5000 + ((i * 1373) % 185000);
    const reliability = 60 + ((i * 17) % 38);
    const successful = 2 + ((i * 3) % 15);
    const failed = (i % 6 === 0) ? 2 : (i % 3 === 0) ? 1 : 0;
    
    customers.push({
      id: `CUST-${1000 + i}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company ? company.toLowerCase().replace(/[^a-z]/g, '') + '.in' : 'gmail.com'}`,
      phone: `+91 ${98000 + (i * 179)} ${10000 + (i * 88)}`.slice(0, 15),
      company,
      lifetimeValue: ltv,
      paymentReliabilityScore: reliability,
      totalSuccessfulPayments: successful,
      totalFailedPayments: failed,
      isOptedOut: i === 42 || i === 88, // 2 customers opted out for safety demo
    });
  }

  return customers;
}

export const SEED_CUSTOMERS = generateCustomers();

// Helper to build realistic timeline events
function createTimeline(
  createdAt: string, 
  stage0Desc: string, 
  stage1Desc?: string, 
  stage2Desc?: string, 
  stage3Desc?: string, 
  stage4Desc?: string
) {
  const timeline = [
    {
      id: 'TL-1',
      timestamp: createdAt,
      title: 'Revenue-Risk Event Detected',
      description: stage0Desc,
      stage: 0,
      status: 'COMPLETED' as const,
      actor: 'System Ingestion',
    }
  ];

  if (stage1Desc) {
    timeline.push({
      id: 'TL-2',
      timestamp: new Date(new Date(createdAt).getTime() + 1200).toISOString(),
      title: 'AI Root Cause Diagnosis & Scoring',
      description: stage1Desc,
      stage: 1,
      status: 'COMPLETED' as const,
      actor: 'RecoverAI Agent',
    });
  }

  if (stage2Desc) {
    timeline.push({
      id: 'TL-3',
      timestamp: new Date(new Date(createdAt).getTime() + 2400).toISOString(),
      title: 'Policy & Safety Validation',
      description: stage2Desc,
      stage: 2,
      status: 'COMPLETED' as const,
      actor: 'Policy Engine',
    });
  }

  if (stage3Desc) {
    timeline.push({
      id: 'TL-4',
      timestamp: new Date(new Date(createdAt).getTime() + 7200000).toISOString(),
      title: 'Recovery Action Executed',
      description: stage3Desc,
      stage: 3,
      status: 'COMPLETED' as const,
      actor: 'Recovery Workflow Engine',
    });
  }

  if (stage4Desc) {
    timeline.push({
      id: 'TL-5',
      timestamp: new Date(new Date(createdAt).getTime() + 7202500).toISOString(),
      title: 'Outcome Verified',
      description: stage4Desc,
      stage: 4,
      status: 'COMPLETED' as const,
      actor: 'Payment Provider & Ledger',
    });
  }

  return timeline;
}

// Generate the 210 seed revenue risk events
export function generateSeedEvents(customers: Customer[]): RevenueRiskEvent[] {
  const events: RevenueRiskEvent[] = [];
  const now = new Date('2026-08-27T02:00:00.000Z');

  // ----------------------------------------------------
  // HERO CASE 1: Single Event Hero Demo (₹4,999 Payment Failure - Insufficient Funds)
  // ----------------------------------------------------
  const heroCust = customers[0]; // Aditi Sharma
  const heroEventDate = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  events.push({
    id: 'EVT-HERO-4999',
    type: 'PAYMENT_FAILURE',
    customerId: heroCust.id,
    customer: heroCust,
    amount: 4999,
    currency: 'INR',
    status: 'RECOMMENDED',
    riskLevel: 'LOW',
    paymentId: 'pay_hero_99182',
    paymentMethod: 'UPI',
    bankCode: 'HDFC',
    rawErrorCode: 'INSUFFICIENT_FUNDS',
    aiDiagnosis: {
      category: 'INSUFFICIENT_FUNDS',
      title: 'Temporary Insufficient Funds',
      explanation: 'Customer attempted UPI payment during end-of-month payroll cycle. Customer has 8 prior successful transactions on this VPA.',
      suggestedAction: 'SMART_RETRY',
      delayHours: 2,
      confidence: 'HIGH'
    },
    recoveryProbability: 87,
    predictedRecoverableAmount: 4999,
    scoreFactors: [
      { impact: 'POSITIVE', description: 'Previous 8 payments were successful (100% historical settlement)', weight: 35 },
      { impact: 'POSITIVE', description: 'Customer has high payment reliability score (92/100)', weight: 30 },
      { impact: 'POSITIVE', description: 'Failure type is temporary liquidity dip (payroll cycle match)', weight: 25 },
      { impact: 'NEGATIVE', description: 'First retry window pending', weight: -3 }
    ],
    recommendedIntervention: 'SMART_RETRY',
    interventionReasoning: 'Schedule smart background UPI pull after 2 hours. High recovery probability (87%) without disturbing customer with SMS/Email notifications.',
    retryCount: 0,
    maxRetriesAllowed: 3,
    reminderCount: 0,
    maxRemindersAllowed: 3,
    escalationLevel: 1,
    recoveredAmount: 0,
    timeline: createTimeline(
      heroEventDate,
      '₹4,999 UPI payment failed. Error: INSUFFICIENT_FUNDS on HDFC Bank.',
      'AI diagnosed root cause as Temporary Insufficient Funds. Recovery probability calculated at 87% (High Confidence).',
      'Bounded policy validated: Retry count (0/3), cooldown satisfied, amount within ₹50k threshold. Auto-approve recommendation generated.'
    ),
    createdAt: heroEventDate,
    updatedAt: heroEventDate
  });

  // ----------------------------------------------------
  // HERO CASE 2: Checkout Abandonment (₹8,500)
  // ----------------------------------------------------
  const caCust = customers[1]; // Rahul Verma
  const caEventDate = new Date(now.getTime() - 4 * 3600 * 1000).toISOString();
  events.push({
    id: 'EVT-HERO-8500',
    type: 'CHECKOUT_ABANDONMENT',
    customerId: caCust.id,
    customer: caCust,
    amount: 8500,
    currency: 'INR',
    status: 'RECOMMENDED',
    riskLevel: 'MEDIUM',
    sessionId: 'chk_sess_99342',
    checkoutStep: 'PAYMENT_SELECTION',
    paymentMethod: 'CREDIT_CARD',
    aiDiagnosis: {
      category: 'CHECKOUT_FRICTION',
      title: 'Checkout Abandoned at OTP Stage',
      explanation: 'Customer reached payment gateway and entered card details but dropped off before entering SMS OTP.',
      suggestedAction: 'PAYMENT_LINK',
      confidence: 'HIGH'
    },
    recoveryProbability: 71,
    predictedRecoverableAmount: 6035,
    scoreFactors: [
      { impact: 'POSITIVE', description: 'Customer reached final checkout payment stage', weight: 40 },
      { impact: 'POSITIVE', description: '5 successful historical orders with Lifetime Value of ₹64,200', weight: 35 },
      { impact: 'NEGATIVE', description: 'Abandoned 4 hours ago, urgency decay active', weight: -14 }
    ],
    recommendedIntervention: 'PAYMENT_LINK',
    interventionReasoning: 'Dispatch instant pre-filled 1-click Razorpay payment link with cart items preserved via WhatsApp/SMS.',
    retryCount: 0,
    maxRetriesAllowed: 3,
    reminderCount: 0,
    maxRemindersAllowed: 3,
    escalationLevel: 1,
    recoveredAmount: 0,
    timeline: createTimeline(
      caEventDate,
      'Checkout session chk_sess_99342 abandoned at payment stage. Cart value: ₹8,500.',
      'AI detected high buyer intent with existing purchase history. Estimated recovery probability 71%.',
      'Policy check passed: Cooldown valid, contact limits within bounds.'
    ),
    createdAt: caEventDate,
    updatedAt: caEventDate
  });

  // ----------------------------------------------------
  // HERO CASE 3: Subscription Failure (Pro Plan ₹2,999/mo)
  // ----------------------------------------------------
  const subCust = customers[4];
  const subEventDate = new Date(now.getTime() - 6 * 3600 * 1000).toISOString();
  events.push({
    id: 'EVT-HERO-2999',
    type: 'SUBSCRIPTION_FAILURE',
    customerId: subCust.id,
    customer: subCust,
    amount: 2999,
    currency: 'INR',
    status: 'SCHEDULED',
    riskLevel: 'LOW',
    subscriptionId: 'sub_pro_monthly_44',
    planName: 'Pro Tier Monthly',
    paymentMethod: 'NACH',
    rawErrorCode: 'TEMPORARY_BANK_OUTAGE',
    aiDiagnosis: {
      category: 'TEMPORARY_BANK_OUTAGE',
      title: 'Intermittent Banking Gateway Downtime',
      explanation: 'Recurring mandate debit returned temporary processing timeout from ICICI core banking.',
      suggestedAction: 'SMART_RETRY',
      delayHours: 6,
      confidence: 'HIGH'
    },
    recoveryProbability: 82,
    predictedRecoverableAmount: 2459,
    scoreFactors: [
      { impact: 'POSITIVE', description: 'Active subscriber for 7 consecutive billing cycles', weight: 45 },
      { impact: 'POSITIVE', description: 'Bank error confirmed as temporary gateway timeout', weight: 35 },
      { impact: 'NEGATIVE', description: 'First retry attempt', weight: -8 }
    ],
    recommendedIntervention: 'SMART_RETRY',
    interventionReasoning: 'Schedule automatic mandate retry in 6 hours when bank batch processing stabilizes. Do not interrupt customer yet.',
    retryCount: 1,
    maxRetriesAllowed: 3,
    reminderCount: 0,
    maxRemindersAllowed: 3,
    nextScheduledAttemptAt: new Date(now.getTime() + 4 * 3600 * 1000).toISOString(),
    escalationLevel: 1,
    recoveredAmount: 0,
    timeline: createTimeline(
      subEventDate,
      'Subscription billing failed for Pro Plan (₹2,999). Gateway code: ICICI_TIMEOUT.',
      'AI diagnosed root cause as Temporary Gateway Outage. Recovery probability: 82%.',
      'Policy approved automated mandate retry at 6-hour interval.'
    ),
    createdAt: subEventDate,
    updatedAt: subEventDate
  });

  // ----------------------------------------------------
  // HERO CASE 4: Overdue B2B Invoice (INV-1042 ₹1,50,000)
  // ----------------------------------------------------
  const invCust = customers[2]; // Rohan Gupta (TechNova Solutions)
  const invEventDate = new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString();
  events.push({
    id: 'EVT-HERO-150000',
    type: 'OVERDUE_INVOICE',
    customerId: invCust.id,
    customer: invCust,
    amount: 150000,
    currency: 'INR',
    status: 'AWAITING_APPROVAL',
    riskLevel: 'HIGH',
    invoiceId: 'INV-1042',
    daysOverdue: 12,
    aiDiagnosis: {
      category: 'INVOICE_NEGLECT',
      title: 'B2B Enterprise AP Processing Delay',
      explanation: 'Invoice INV-1042 is 12 days past due date. TechNova AP cycle is typically bi-weekly. 1 reminder already sent.',
      suggestedAction: 'RECOVERY_REMINDER',
      confidence: 'MEDIUM'
    },
    recoveryProbability: 63,
    predictedRecoverableAmount: 94500,
    scoreFactors: [
      { impact: 'POSITIVE', description: 'TechNova Solutions has ₹8,50,000 verified lifetime spend', weight: 40 },
      { impact: 'POSITIVE', description: 'Historical invoices paid within 15-20 days grace period', weight: 30 },
      { impact: 'NEGATIVE', description: 'Amount > ₹1,00,000 exceeds standard automated cap (Requires Approval)', weight: -20 },
      { impact: 'NEGATIVE', description: '12 days overdue exceeds 10-day soft threshold', weight: -13 }
    ],
    recommendedIntervention: 'RECOVERY_REMINDER',
    interventionReasoning: 'Send executive payment link reminder to finance controller with 48-hour automated escalation to Account Executive.',
    retryCount: 0,
    maxRetriesAllowed: 3,
    reminderCount: 1,
    maxRemindersAllowed: 3,
    escalationLevel: 2,
    recoveredAmount: 0,
    timeline: createTimeline(
      invEventDate,
      'Invoice INV-1042 (₹1,50,000) flagged as 12 days overdue.',
      'AI evaluated enterprise AP history: High customer value, mild procedural delay. Recovery probability: 63%.',
      'Policy Engine: Action flagged as HIGH RISK because amount (₹1,50,000) exceeds automated limit (₹50,000). Merchant approval required.'
    ),
    createdAt: invEventDate,
    updatedAt: invEventDate
  });

  // ----------------------------------------------------
  // Generate 206 more realistic events across all categories and statuses
  // ----------------------------------------------------
  const EVENT_TYPES: RevenueRiskType[] = ['PAYMENT_FAILURE', 'CHECKOUT_ABANDONMENT', 'SUBSCRIPTION_FAILURE', 'OVERDUE_INVOICE'];
  const METHODS: PaymentMethod[] = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NETBANKING', 'NACH'];
  
  const FAILURE_CONFIGS = [
    { cat: 'INSUFFICIENT_FUNDS', action: 'SMART_RETRY', prob: 85, title: 'Insufficient Funds', desc: 'Temporary liquidity deficit on customer bank account.' },
    { cat: 'BANK_DECLINE', action: 'PAYMENT_LINK', prob: 64, title: 'Issuing Bank Decline', desc: 'Transaction declined by issuer. Alternate payment method recommended.' },
    { cat: 'CARD_EXPIRED', action: 'PAYMENT_LINK', prob: 78, title: 'Card Expired / Replacement Needed', desc: 'Saved card reached expiration date. Send instant card update link.' },
    { cat: 'AUTH_FAILED', action: 'PAYMENT_LINK', prob: 69, title: '3DS Authentication Failed', desc: 'OTP verification failed or timed out during authorization.' },
    { cat: 'TEMPORARY_BANK_OUTAGE', action: 'SMART_RETRY', prob: 88, title: 'Temporary Bank Downtime', desc: 'Partner bank gateway returned 503 service unavailable.' },
    { cat: 'NETWORK_TIMEOUT', action: 'SMART_RETRY', prob: 82, title: 'Gateway Network Timeout', desc: 'Network handshake timed out before authorization confirmation.' },
    { cat: 'CHECKOUT_FRICTION', action: 'PAYMENT_LINK', prob: 73, title: 'Cart Abandoned at Payment Step', desc: 'User dropped out at final step. Send 1-click payment link.' },
    { cat: 'INVOICE_NEGLECT', action: 'RECOVERY_REMINDER', prob: 62, title: 'Overdue Commercial Invoice', desc: 'Corporate receivable pending finance clearance.' }
  ] as const;

  const STATUSES: EventStatus[] = [
    'RECOVERED', 'RECOVERED', 'RECOVERED', 'RECOVERED', // 40% recovered in seed
    'AT_RISK', 'RECOMMENDED', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'SCHEDULED',
    'FAILED', 'STOPPED', 'MANUAL_REVIEW'
  ];

  const AMOUNTS = [499, 999, 1499, 2499, 2999, 4999, 6500, 8500, 12500, 18000, 25000, 45000, 75000, 120000, 150000];

  for (let i = 5; i <= 210; i++) {
    const cust = customers[(i * 3) % customers.length];
    const type = EVENT_TYPES[i % EVENT_TYPES.length];
    const amount = AMOUNTS[(i * 7) % AMOUNTS.length];
    const method = METHODS[i % METHODS.length];
    const status = (cust.isOptedOut) ? 'STOPPED' : STATUSES[(i * 11) % STATUSES.length];
    const failCfg = FAILURE_CONFIGS[i % FAILURE_CONFIGS.length];
    const hoursAgo = 1 + ((i * 13) % 480); // 1h to 20 days ago
    const eventDate = new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();
    
    const prob = Math.min(96, Math.max(25, failCfg.prob + ((i % 7) - 3) * 4 + Math.floor((cust.paymentReliabilityScore - 70) / 3)));
    const isRecovered = status === 'RECOVERED';
    const recAmount = isRecovered ? amount : 0;
    const recDate = isRecovered ? new Date(new Date(eventDate).getTime() + 3600 * 1000 * (1 + (i % 6))).toISOString() : undefined;
    const retryCount = isRecovered ? (1 + (i % 2)) : (status === 'STOPPED' ? 3 : (i % 3));
    const reminderCount = type === 'OVERDUE_INVOICE' ? (isRecovered ? 1 : 2) : 0;
    const riskLevel = amount > 50000 ? 'HIGH' : prob < 50 ? 'HIGH' : prob < 75 ? 'MEDIUM' : 'LOW';

    const positiveSignals: ScoreFactor[] = [
      { impact: 'POSITIVE', description: `${cust.totalSuccessfulPayments} previous successful payments (${cust.paymentReliabilityScore}% reliability)`, weight: 35 },
      { impact: 'POSITIVE', description: `Optimal recovery strategy identified: ${failCfg.action.replace('_', ' ')}`, weight: 25 }
    ];
    if (cust.lifetimeValue > 20000) {
      positiveSignals.push({ impact: 'POSITIVE', description: `High lifetime value customer (₹${cust.lifetimeValue.toLocaleString('en-IN')})`, weight: 20 });
    }

    const negativeSignals: ScoreFactor[] = [];
    if (retryCount > 0) {
      negativeSignals.push({ impact: 'NEGATIVE', description: `${retryCount} prior recovery attempt(s) logged`, weight: -10 * retryCount });
    }
    if (hoursAgo > 72) {
      negativeSignals.push({ impact: 'NEGATIVE', description: `Event age exceeds 72 hours (decay active)`, weight: -12 });
    }
    if (cust.isOptedOut) {
      negativeSignals.push({ impact: 'NEGATIVE', description: `Customer communication opt-out flag active`, weight: -50 });
    }

    events.push({
      id: `EVT-${1000 + i}`,
      type,
      customerId: cust.id,
      customer: cust,
      amount,
      currency: 'INR',
      status,
      riskLevel,
      paymentId: type === 'PAYMENT_FAILURE' ? `pay_seed_${1000 + i}` : undefined,
      sessionId: type === 'CHECKOUT_ABANDONMENT' ? `chk_sess_${1000 + i}` : undefined,
      subscriptionId: type === 'SUBSCRIPTION_FAILURE' ? `sub_plan_${1000 + i}` : undefined,
      invoiceId: type === 'OVERDUE_INVOICE' ? `INV-${1000 + i}` : undefined,
      planName: type === 'SUBSCRIPTION_FAILURE' ? (amount > 5000 ? 'Enterprise Plan' : 'Growth Plan') : undefined,
      daysOverdue: type === 'OVERDUE_INVOICE' ? Math.floor(hoursAgo / 24) : undefined,
      paymentMethod: method,
      aiDiagnosis: {
        category: failCfg.cat,
        title: failCfg.title,
        explanation: failCfg.desc,
        suggestedAction: failCfg.action as any,
        confidence: prob >= 75 ? 'HIGH' : prob >= 50 ? 'MEDIUM' : 'LOW'
      },
      recoveryProbability: prob,
      predictedRecoverableAmount: Math.round(amount * (prob / 100)),
      scoreFactors: [...positiveSignals, ...negativeSignals],
      recommendedIntervention: failCfg.action as any,
      interventionReasoning: `Automated recovery strategy tailored for ${failCfg.title} with estimated ${prob}% success rate within policy bounds.`,
      retryCount,
      maxRetriesAllowed: 3,
      reminderCount,
      maxRemindersAllowed: 3,
      escalationLevel: status === 'STOPPED' ? 4 : isRecovered ? 1 : Math.min(3, retryCount + reminderCount),
      recoveredAmount: recAmount,
      recoveredAt: recDate,
      recoveryMethodUsed: isRecovered ? (failCfg.action as any) : undefined,
      timeline: createTimeline(
        eventDate,
        `${type.replace('_', ' ')} detected for ₹${amount.toLocaleString('en-IN')}.`,
        `AI diagnosed: ${failCfg.title}. Recovery probability: ${prob}%.`,
        cust.isOptedOut ? 'Blocked by Policy: Customer opted out.' : 'Policy validated: Action within safe bounds.',
        retryCount > 0 ? `Executed ${failCfg.action.replace('_', ' ')}.` : undefined,
        isRecovered ? `Recovered ₹${amount.toLocaleString('en-IN')} via ${failCfg.action.replace('_', ' ')}.` : undefined
      ),
      createdAt: eventDate,
      updatedAt: recDate || eventDate
    });
  }

  return events;
}

export const SEED_EVENTS = generateSeedEvents(SEED_CUSTOMERS);

// Pre-seeded Hero Campaigns
export const SEED_CAMPAIGNS: RecoveryCampaign[] = [
  {
    id: 'CMP-101',
    name: 'End-of-Month Enterprise & UPI Revenue Sweep',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    filterType: 'ALL',
    totalCases: 100,
    totalAtRisk: 840000, // ₹8,40,000 total at risk
    predictedRecoverable: 472000, // ₹4,72,000 predicted
    expectedRecoveryRate: 56.2,
    actualRecovered: 391500, // ₹3,91,500 actually recovered!
    actualRecoveryRate: 46.6,
    triage: {
      retries: 32,
      paymentLinks: 27,
      reminders: 18,
      manualReviews: 13,
      doNotContact: 10,
    },
    results: {
      successfulRecoveries: 38,
      failedRecoveries: 22,
      pending: 0,
      manualReviews: 13,
      stopped: 27,
      byIntervention: {
        retries: { count: 19, recovered: 198000 },
        paymentLinks: { count: 9, recovered: 112500 },
        reminders: { count: 7, recovered: 68000 },
        manualReviews: { count: 3, recovered: 13000 },
        stopped: { count: 0, recovered: 0 },
      }
    },
    processedCount: 100,
  },
  {
    id: 'CMP-102',
    name: 'High-Value Checkout Abandonment Win-Back',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'RUNNING',
    filterType: 'CHECKOUT_ABANDONMENT',
    totalCases: 35,
    totalAtRisk: 295000,
    predictedRecoverable: 185000,
    expectedRecoveryRate: 62.7,
    actualRecovered: 118000,
    actualRecoveryRate: 40.0,
    triage: {
      retries: 0,
      paymentLinks: 28,
      reminders: 4,
      manualReviews: 2,
      doNotContact: 1,
    },
    results: {
      successfulRecoveries: 14,
      failedRecoveries: 6,
      pending: 12,
      manualReviews: 2,
      stopped: 1,
      byIntervention: {
        retries: { count: 0, recovered: 0 },
        paymentLinks: { count: 12, recovered: 102000 },
        reminders: { count: 2, recovered: 16000 },
        manualReviews: { count: 0, recovered: 0 },
        stopped: { count: 0, recovered: 0 },
      }
    },
    processedCount: 23,
  }
];

// Pre-seeded Audit Logs
export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-901',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actor: 'RecoverAI Agent',
    actorType: 'AI_AGENT',
    eventId: 'EVT-HERO-4999',
    action: 'ROOT_CAUSE_DIAGNOSIS',
    reason: 'UPI transaction failed with INSUFFICIENT_FUNDS. Payroll cycle pattern match identified.',
    policyResult: 'PASSED',
    toolCalled: 'analyzeRootCause',
    toolResult: 'Probability: 87%, Recommended: SMART_RETRY',
    idempotencyKey: 'IDEMP_ANALYZE_EVT-HERO-4999_120',
    amount: 4999,
  },
  {
    id: 'AUD-902',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    actor: 'Policy Engine',
    actorType: 'POLICY_ENGINE',
    eventId: 'EVT-HERO-4999',
    action: 'POLICY_VALIDATION',
    reason: 'Validated retry bounds (0/3), cooldown satisfied, amount within automatic threshold.',
    previousState: 'ANALYZING',
    newState: 'RECOMMENDED',
    policyResult: 'PASSED',
    idempotencyKey: 'IDEMP_POLICY_EVT-HERO-4999_120',
  },
  {
    id: 'AUD-903',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    actor: 'Recovery Workflow Engine',
    actorType: 'AI_AGENT',
    eventId: 'EVT-1008',
    action: 'EXECUTE_PAYMENT_LINK',
    reason: 'Generated Razorpay 1-click payment link and dispatched via SMS/WhatsApp.',
    previousState: 'IN_PROGRESS',
    newState: 'RECOVERED',
    policyResult: 'PASSED',
    toolCalled: 'generatePaymentLink',
    toolResult: 'Payment Link plink_88921 captured successfully.',
    idempotencyKey: 'IDEMP_PAYLINK_EVT-1008_118',
    amount: 8500,
    recoveredAmount: 8500,
  },
  {
    id: 'AUD-904',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    actor: 'Policy Engine',
    actorType: 'POLICY_ENGINE',
    eventId: 'EVT-1042',
    action: 'STOP_RECOVERY_WORKFLOW',
    reason: 'Blocked communication: Customer explicitly opted out of marketing/recovery channels.',
    previousState: 'RECOMMENDED',
    newState: 'STOPPED',
    policyResult: 'BLOCKED',
    idempotencyKey: 'IDEMP_STOP_EVT-1042_114',
    amount: 12500,
  }
];
