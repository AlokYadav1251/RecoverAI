# 🎯 RecoverAI — 3-Minute Hackathon Demo Script
### Razorpay Track 03: AI Revenue Recovery

Use this script to present **RecoverAI** to evaluators or recruiters.

---

## ⏱️ Step-by-Step Demo Flow

### Phase 1: The Problem & Dashboard Overview (0:00 - 0:45)
1. Open **[http://localhost:3000](http://localhost:3000)**.
2. Highlight the 4 KPI cards:
   - **Revenue At Risk:** Total potential revenue slipping away.
   - **Predicted Recoverable:** AI yield estimation based on historical data.
   - **Money Actually Recovered:** Real confirmed settlements (never fabricated).
   - **Recovery Rate:** Percentage yield of rescued revenue.
3. Point out the **Live Revenue Risk Radar** chart showing real-time distribution across **UPI, Cards, Mandates, and Invoices**.

---

### Phase 2: Hero Demo — Single Event ₹4,999 Payment Recovery (0:45 - 1:45)
1. Click **"Risk Inbox"** in the sidebar (or click the top at-risk item on the Dashboard).
2. Click on **Aditi Sharma — ₹4,999 (Payment Failure)** (`EVT-HERO-4999`).
3. Point out the **AI Diagnosis & Reasoning Panel**:
   - **Root Cause:** Insufficient Account Balance (Temporary payroll gap).
   - **Recovery Probability:** **87%** (High Confidence).
   - **Recommended Action:** **Smart Retry after 2 hours**.
   - **Explainability:** Show the Positive Signals (8 successful past payments, 92/100 reliability score) and Negative Signals.
4. Point out the **Policy Engine Check**:
   - Limit check: `0/3 Retries` (Passed).
   - Cooldown: Satisfied.
   - Automation Limit: Within ₹50,000 threshold.
   - Opt-out status: Verified active.
5. Click **"Approve & Execute Smart Retry"**.
6. Observe:
   - Live execution spinner connects to `MockPaymentProvider`.
   - Payment succeeds!
   - Event status updates to **RECOVERED**.
   - **Money Actually Recovered** increases by **₹4,999**.
   - Stopping rule automatically triggers (`STOP_IF_PAYMENT_SUCCESS`).
7. Open the **Audit Trail** tab in the modal:
   - Point out the immutable log with timestamp, idempotency key (`IDEMP_...`), and previous $\to$ new states.

---

### Phase 3: Hero Demo — 100-Case Batch Recovery Campaign (1:45 - 2:30)
1. Click **"Campaigns"** in the sidebar.
2. Select the **"End-of-Month Enterprise & UPI Revenue Sweep"** (or click **"New Recovery Campaign"**).
3. Show the **AI Triage Breakdown**:
   - 32 Smart Retries
   - 27 Payment Links
   - 18 Reminders
   - 13 Manual Reviews
   - 10 Do Not Contact
4. Click **"Review & Approve Campaign"**.
5. Click **"Execute Campaign"**:
   - Watch the live execution stream process the queue.
   - Confetti celebration triggers upon completion!
   - Result screen shows:
     - **Revenue At Risk:** ₹8,40,000
     - **Predicted Recoverable:** ₹4,72,000
     - **Actually Recovered:** **₹3,91,500** (46.6% actual recovery rate).

---

### Phase 4: Policy Safety & Stopping Rules (2:30 - 3:00)
1. Click **"Policies"** in the sidebar.
2. Show the configurable safety boundaries:
   - Max retries, quiet hours (9 PM - 8 AM IST), opt-out enforcement.
3. Click **"Copilot"** in the sidebar:
   - Ask: *"What is our current recovery rate and top failure cause?"*
   - Watch RecoverAI explain the revenue recovery intelligence in plain English.
