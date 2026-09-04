-- =============================================================================
-- RECOVERAI DATABASE SCHEMA (PostgreSQL / Supabase / SQLite Compatible)
-- Razorpay Track 03: AI Revenue Recovery Agent
-- =============================================================================

-- 1. MERCHANTS
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_category VARCHAR(100) NOT NULL,
    country VARCHAR(3) DEFAULT 'IND',
    default_currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'MERCHANT_ADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    company VARCHAR(255),
    lifetime_value NUMERIC(14, 2) DEFAULT 0.00,
    payment_reliability_score INTEGER DEFAULT 80, -- 0 to 100
    total_successful_payments INTEGER DEFAULT 0,
    total_failed_payments INTEGER DEFAULT 0,
    is_opted_out BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL, -- UPI, CREDIT_CARD, DEBIT_CARD, NETBANKING, NACH
    status VARCHAR(50) NOT NULL, -- PENDING, AUTHORIZED, CAPTURED, FAILED, REFUNDED
    gateway_reference VARCHAR(128),
    error_code VARCHAR(100),
    error_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PAYMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS payment_attempts (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    provider VARCHAR(50) NOT NULL, -- MOCK, RAZORPAY_TEST
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED, PENDING
    transaction_id VARCHAR(128),
    raw_error_code VARCHAR(100),
    raw_error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CHECKOUT SESSIONS
CREATE TABLE IF NOT EXISTS checkout_sessions (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    cart_value NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    step_reached VARCHAR(100) NOT NULL, -- CART, SHIPPING, PAYMENT_METHOD, OTP_VERIFICATION
    payment_method_selected VARCHAR(50),
    status VARCHAR(50) NOT NULL, -- ACTIVE, COMPLETED, ABANDONED, RECOVERED
    abandoned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    billing_amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    billing_interval VARCHAR(20) DEFAULT 'MONTHLY',
    status VARCHAR(50) NOT NULL, -- ACTIVE, PAST_DUE, PAUSED, CANCELLED, RECOVERED
    consecutive_failed_attempts INTEGER DEFAULT 0,
    last_billing_date TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    days_overdue INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- DRAFT, SENT, OVERDUE, PAID, WRITTEN_OFF
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. REVENUE RISK EVENTS
CREATE TABLE IF NOT EXISTS revenue_risk_events (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- PAYMENT_FAILURE, CHECKOUT_ABANDONMENT, SUBSCRIPTION_FAILURE, OVERDUE_INVOICE
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL, -- AT_RISK, ANALYZING, RECOMMENDED, AWAITING_APPROVAL, SCHEDULED, IN_PROGRESS, RECOVERED, PARTIALLY_RECOVERED, FAILED, MANUAL_REVIEW, STOPPED, EXPIRED
    risk_level VARCHAR(20) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE SET NULL,
    checkout_session_id VARCHAR(64) REFERENCES checkout_sessions(id) ON DELETE SET NULL,
    subscription_id VARCHAR(64) REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_id VARCHAR(64) REFERENCES invoices(id) ON DELETE SET NULL,
    raw_error_code VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    max_retries_allowed INTEGER DEFAULT 3,
    reminder_count INTEGER DEFAULT 0,
    max_reminders_allowed INTEGER DEFAULT 3,
    recovered_amount NUMERIC(14, 2) DEFAULT 0.00,
    recovered_at TIMESTAMP WITH TIME ZONE,
    recovery_method_used VARCHAR(50),
    escalation_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. RECOVERY ATTEMPTS
CREATE TABLE IF NOT EXISTS recovery_attempts (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES revenue_risk_events(id) ON DELETE CASCADE,
    intervention_type VARCHAR(50) NOT NULL, -- SMART_RETRY, PAYMENT_LINK, RECOVERY_REMINDER, FINANCE_ESCALATION, MANUAL_REVIEW
    attempt_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, EXECUTED, SUCCESS, FAILED, BLOCKED
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL,
    gateway_response_id VARCHAR(128),
    error_message TEXT,
    amount_attempted NUMERIC(14, 2) NOT NULL,
    amount_recovered NUMERIC(14, 2) DEFAULT 0.00,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. RECOVERY CAMPAIGNS
CREATE TABLE IF NOT EXISTS recovery_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    filter_type VARCHAR(50) DEFAULT 'ALL',
    status VARCHAR(50) NOT NULL, -- DRAFT, ANALYZED, AWAITING_APPROVAL, RUNNING, COMPLETED, STOPPED
    total_cases INTEGER DEFAULT 0,
    total_at_risk NUMERIC(14, 2) DEFAULT 0.00,
    predicted_recoverable NUMERIC(14, 2) DEFAULT 0.00,
    expected_recovery_rate NUMERIC(5, 2) DEFAULT 0.00,
    actual_recovered NUMERIC(14, 2) DEFAULT 0.00,
    actual_recovery_rate NUMERIC(5, 2) DEFAULT 0.00,
    processed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CAMPAIGN ITEMS
CREATE TABLE IF NOT EXISTS campaign_items (
    id VARCHAR(64) PRIMARY KEY,
    campaign_id VARCHAR(64) REFERENCES recovery_campaigns(id) ON DELETE CASCADE,
    event_id VARCHAR(64) REFERENCES revenue_risk_events(id) ON DELETE CASCADE,
    assigned_action VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- QUEUED, EXECUTING, RECOVERED, FAILED, STOPPED, MANUAL_REVIEW
    recovered_amount NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. AI DECISIONS (Structured metadata from AI Agent)
CREATE TABLE IF NOT EXISTS ai_decisions (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES revenue_risk_events(id) ON DELETE CASCADE,
    root_cause_category VARCHAR(100) NOT NULL,
    root_cause_title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    recovery_probability INTEGER NOT NULL, -- 0 to 100
    confidence_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH
    recommended_action VARCHAR(50) NOT NULL,
    recommended_delay_hours INTEGER DEFAULT 0,
    score_factors JSONB, -- list of positive & negative impact factors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. AGENT ACTIONS (Safe tool executions)
CREATE TABLE IF NOT EXISTS agent_actions (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES revenue_risk_events(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    tool_parameters JSONB,
    tool_result JSONB,
    status VARCHAR(50) NOT NULL, -- EXECUTED, FAILED, BLOCKED
    executed_by VARCHAR(50) DEFAULT 'AI_AGENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES revenue_risk_events(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL, -- WHATSAPP, SMS, EMAIL
    message_content TEXT NOT NULL,
    provider_message_id VARCHAR(128),
    delivery_status VARCHAR(50) DEFAULT 'SENT', -- SENT, DELIVERED, READ, FAILED
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. RECOVERY POLICIES (Configurable safety boundaries)
CREATE TABLE IF NOT EXISTS recovery_policies (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    max_payment_retries INTEGER DEFAULT 3,
    max_subscription_retries INTEGER DEFAULT 3,
    max_reminders INTEGER DEFAULT 3,
    min_retry_interval_hours INTEGER DEFAULT 2,
    min_reminder_interval_hours INTEGER DEFAULT 24,
    max_automated_recovery_amount NUMERIC(14, 2) DEFAULT 50000.00,
    auto_approve_confidence_score INTEGER DEFAULT 80,
    stop_if_payment_success BOOLEAN DEFAULT TRUE,
    stop_if_invoice_paid BOOLEAN DEFAULT TRUE,
    stop_if_subscription_recovered BOOLEAN DEFAULT TRUE,
    stop_if_customer_optout BOOLEAN DEFAULT TRUE,
    stop_if_max_attempts_reached BOOLEAN DEFAULT TRUE,
    stop_if_manual_review_required BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start VARCHAR(5) DEFAULT '21:00',
    quiet_hours_end VARCHAR(5) DEFAULT '08:00',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. AUDIT LOGS (Immutable Traceability)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(100) NOT NULL,
    actor_type VARCHAR(50) NOT NULL, -- AI_AGENT, MERCHANT, SYSTEM, POLICY_ENGINE
    event_id VARCHAR(64) REFERENCES revenue_risk_events(id) ON DELETE SET NULL,
    campaign_id VARCHAR(64) REFERENCES recovery_campaigns(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    previous_state VARCHAR(50),
    new_state VARCHAR(50),
    policy_result VARCHAR(50) DEFAULT 'PASSED', -- PASSED, BLOCKED, REQUIRES_APPROVAL, N/A
    tool_called VARCHAR(100),
    tool_result TEXT,
    idempotency_key VARCHAR(128),
    amount NUMERIC(14, 2),
    recovered_amount NUMERIC(14, 2)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE & FAST LOOKUPS
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_risk_events_status ON revenue_risk_events(status);
CREATE INDEX IF NOT EXISTS idx_risk_events_type ON revenue_risk_events(type);
CREATE INDEX IF NOT EXISTS idx_risk_events_customer ON revenue_risk_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_event ON recovery_attempts(event_id);
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_idemp ON recovery_attempts(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
