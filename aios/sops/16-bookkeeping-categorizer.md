# SOP-16 — Bookkeeping Categorizer

**Version**: 1.0
**Skill**: Bookkeeping Categorizer
**Status**: Active

---

## Purpose
Categorize Myers Digital business expenses, flag deductions, and identify personal/business mixing issues.

## Trigger
Dustin shares credit card or bank transactions for categorization.

## Input Format
Provide transactions in any of these formats:
- Copy-paste from bank statement
- CSV export from bank or credit card
- Screenshot (Claude will parse visible text)

Minimum data per transaction: Date | Merchant | Amount

## Steps

1. Load skill: `skills/custom/bookkeeping-categorizer/SKILL.md`
2. Provide transaction data to Claude
3. Claude categorizes all transactions, flags ambiguous items
4. Review flagged items and confirm or correct categories
5. Corrected categories update Claude's merchant memory for future accuracy
6. Export categorized list to accounting system (QBO or spreadsheet)
7. Log monthly summary to Notion `AIOS — KPI Snapshots` (expense totals by category)

## Monthly Bookkeeping Rhythm
- **1st of month**: Dustin exports last month's transactions
- **2nd of month**: Run through Bookkeeping Categorizer
- **3rd of month**: Review flags and confirm
- **5th of month**: Finance Module uses confirmed data for monthly P&L (FIN-04)

## Key Deductions to Flag for Myers Digital
- GHL agency license (software expense)
- AI tool subscriptions (Claude, ChatGPT, etc.)
- Zapier subscription
- Advertising spend (Meta, Google, LinkedIn)
- Contractor payments (1099 tracking)
- Home office (if applicable)
- Professional development (courses, coaching)
- Business meals with clients
