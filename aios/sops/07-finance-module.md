# SOP-07 — Finance Module

**Version**: 1.0
**Module**: Finance
**Status**: Active

---

## Purpose
Manage Myers Digital's financial operations, MRR tracking, expense management, and financial reporting.

## Trigger
Any directive involving revenue, expenses, invoicing, cash flow, or financial analysis.

## Revenue Model

### Recurring Revenue (MRR)
- Starter: $497/mo per client
- Growth: $997/mo per client
- Scale: $1,997/mo per client

### Project Revenue (Setup Fees)
- Starter: $1,497 one-time
- Growth: $3,997 one-time
- Scale: $7,997 one-time

### Upsells & Add-Ons
- Individual tool additions to existing packages

## Monthly Close Process (FIN-SOP-01)
1. Pull all Stripe transactions for the month
2. Reconcile MRR: new clients + expansions - churns
3. Record setup fees separately from recurring
4. Categorize all business expenses (route to Bookkeeping Categorizer)
5. Update Notion KPI Snapshots with final monthly numbers
6. Generate P&L summary for Dustin
7. `FIN-04` Zapier fires — email summary to Dustin

## Invoice Creation (FIN-SOP-02)
1. Dustin requests invoice via Director
2. Finance Module confirms: client name, package, amount, due date
3. Dustin confirms
4. `FIN-01` Zapier fires: create invoice + email client
5. Log to Notion Decision Log

## Budget Variance Investigation (FIN-SOP-03)
Triggered when any expense category exceeds 20% of budget:
1. Identify the category and specific transactions
2. Route to Bookkeeping Categorizer for detail
3. Assess: one-time spike or trend?
4. Recommend action: reduce, reallocate, or investigate
5. Log finding to Notion Decision Log
