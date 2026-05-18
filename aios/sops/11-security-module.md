# SOP-11 — Security Module

**Version**: 1.0
**Module**: Security
**Status**: Active
**Access**: Dustin (Level 9) only

---

## Purpose
Protect Myers Digital's systems, client data, and GHL infrastructure from security threats.

## Trigger
Any security incident, access anomaly, or security review request. Director access only.

## Incident Response Playbook

### Level 1 (Low) — Unusual Activity
- Log to Notion Automation Log
- Monitor for 24 hours
- Review at next daily digest

### Level 2 (Medium) — Suspected Breach
- Log immediately
- Slack alert to Dustin
- Director brief with findings
- 4-hour resolution target

### Level 3 (High) — Confirmed Breach
- Log immediately
- Immediate Dustin notification (Slack + call if needed)
- Lock affected access
- Activate incident response playbook
- `SEC-03` Zapier: team notification

### Level 4 (Critical) — Client Data at Risk
- All Level 3 steps immediately
- Notify affected clients per data breach protocol
- External legal/security counsel if needed
- Document for regulatory compliance

## Access Control

| System | Who Has Access | Review Frequency |
|---|---|---|
| GHL Agency Account | Dustin only | Monthly |
| Client Sub-Accounts | Dustin + assigned contractor | Per project |
| Notion AIOS | Dustin | Monthly |
| Zapier | Dustin | Monthly |
| Stripe | Dustin | Monthly |

## Quarterly Security Review
1. Audit all tool access lists
2. Rotate API keys if unchanged > 90 days
3. Review GHL sub-account access per client
4. Check for unused accounts and deactivate
5. Review contractor access after project completion
