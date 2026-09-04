# 🏆 RecoverAI — Razorpay Track 03 Submission
### Track: AI Revenue Recovery (*"Find revenue that’s slipping away and win it back"*)

---

## 💡 Executive Summary
**RecoverAI** is an autonomous revenue recovery agent built specifically for Indian fintech merchants on the Razorpay ecosystem. Instead of dumb retries or static email blasts, RecoverAI closes the revenue leak loop:

```
DETECT (Failures / Drops)
  ↓
DIAGNOSE (Explainable AI Root Cause)
  ↓
DECIDE (Probability & Bounded Intervention)
  ↓
POLICY ENGINE (Safety, Limits, Opt-Out, Cooldowns)
  ↓
MERCHANT APPROVAL (Sensitive / High-Value Gate)
  ↓
BOUNDED TOOL EXECUTION (Idempotent Provider Dispatch)
  ↓
MEASURE (Real Confirmed Settlements Only)
  ↓
STOP SAFELY (Stopping Rules)
  ↓
AUDIT TRAIL (Immutable Regulatory Trace)
```

---

## 🌟 Key Differentiators & Highlights

1. **Not a ChatGPT Wrapper or Dashboard:**
   - Features a deterministic AI decision layer (`IAIProvider`) outputting structured JSON with positive/negative signals, root-cause tags, and confidence scores.
2. **Grounded Financial Metric Safety:**
   - **Money Actually Recovered** is strictly derived from verified `CAPTURED` payments. Simulated AI predictions and actual settlements are never conflated.
3. **Deterministic Idempotency Locks:**
   - Every financial action is protected by unique idempotency keys (`IDEMP_<ACTION>_<EVENT>_<HASH>`), preventing double debits or spam.
4. **Comprehensive Policy & Stopping Rules:**
   - Hard limits on retries (max 3), quiet hours (9 PM to 8 AM IST), customer opt-out compliance, and instant halt upon payment capture.
5. **Batch Campaign Triage Engine:**
   - Handles 100+ case sweeps with automatic case segmentation into Retries, Payment Links, Reminders, and Manual Reviews.

---

## 📊 Rubric Compliance Matrix

| Razorpay Rubric Criteria | RecoverAI Implementation | Status |
|---|---|---|
| **Revenue Risk Detection** | Ingests 4 categories: Payment Failures, Abandoned Carts, Subscriptions, Overdue Invoices | 🟢 Complete |
| **Root Cause Diagnosis** | Classifies transient vs permanent errors (Insufficient Funds, Card Expired, Bank Outages, 3DS Timeouts) | 🟢 Complete |
| **Intervention Decisioning** | Recommends bounded actions (Smart Retry, 1-Click Link, Reminder, Escalation) with explainable reasoning | 🟢 Complete |
| **Policy & Compliance** | Configurable Policy Engine with strict limits, opt-out enforcement, and quiet hours | 🟢 Complete |
| **Merchant Control** | Approval gates for high-value transactions (> ₹50,000) or lower confidence scores | 🟢 Complete |
| **Measurement Accuracy** | Distinct tracking of At-Risk, Predicted Recoverable, and Actually Recovered | 🟢 Complete |
| **Auditability** | Complete immutable audit log with timestamps, actors, tool calls, and state transitions | 🟢 Complete |

---

## 🛠️ Tech Stack & Architecture
- **Framework:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS
- **Design System:** Custom Fintech Dark/Light UI + Lucide Icons + Recharts
- **Testing:** Vitest (28 Unit, Integration, and E2E Scenarios)
- **Database:** Typed In-Memory Database with 17 Schema Tables (`schema.sql`)
- **Payment Abstraction:** `IPaymentProvider` with `MockPaymentProvider`
