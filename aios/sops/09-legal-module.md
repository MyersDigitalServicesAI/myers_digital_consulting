# SOP-09 — Legal Module

**Version**: 1.0
**Module**: Legal
**Status**: Active

---

## Purpose
Manage Myers Digital's contracts, compliance, and legal risk. All findings require qualified legal counsel review before action.

## Trigger
Any directive involving contracts, compliance, or legal risk.

## Contract Types to Track

| Contract Type | Template Location | Review Cycle |
|---|---|---|
| Client Service Agreement | Notion Legal Folder | Annual or on change |
| Contractor Agreement | Notion Legal Folder | Per engagement |
| GHL Reseller Agreement | Notion Legal Folder | Per GHL update |
| NDA | Notion Legal Folder | Per engagement |

## Contract Lifecycle (LEG-SOP-01)
1. New client agrees to proceed
2. Service Agreement generated from template
3. Sent via DocuSign/PandaDoc to client
4. `LEG-01` Zapier: 7-day reminder if unsigned
5. Contract signed → `LEG-03` Zapier fires: archive in Notion + update CRM
6. 14-day advance notice of renewal → Dustin alert

## Compliance Calendar Items (LEG-SOP-02)
Track in Notion:
- Data processing agreements for GHL client data
- CCPA compliance if serving California clients
- Business license renewals
- E&O insurance renewal

**Alert**: Any compliance item < 14 days → immediate Dustin notification.
