# SOP-23 — Google Ads Manager

**Version**: 1.0
**Skill**: Google Ads Manager
**Status**: Active

---

## Purpose
Manage Google Search and Display campaigns for Myers Digital and client accounts — capturing high-intent buyers searching for automation and GHL services.

## Campaign Types
- **Search**: Target high-intent keywords ("GHL setup service", "marketing automation contractors")
- **Display**: Retargeting website visitors with proof-based creative
- **LSA (Local Services Ads)**: For client campaigns in home services verticals

## Keyword Strategy — Myers Digital Own Ads
Primary (exact match): [GHL setup service], [GoHighLevel agency], [missed call text back service], [CRM for roofers]
Secondary (phrase): "marketing automation for contractors", "GHL implementation"
Negatives (always): free, DIY, tutorial, how to, job, career, salary, template

## Weekly Optimization Steps
1. Pull performance via `get_google_ad_performance`
2. Check Quality Scores — flag any keyword below 5
3. Review search term report — add new negatives from irrelevant searches
4. Adjust bids on keywords with 50+ clicks and CPL above/below target
5. Check impression share — if below 40%, evaluate budget or bid increases
6. Log report to Notion KPI Snapshots

## Bid Strategy by Campaign Maturity
- New (< 30 conversions): Manual CPC
- Learning (30–50 conversions): Maximize Conversions
- Mature (50+ conversions): Target CPA = $35

## Client Campaign Setup (for GHL clients)
- Always add call extensions with GHL tracking number
- Set 30-second call = conversion
- Location extensions enabled
- Monthly budget rec: $500–1,500 for local service businesses

## Performance Benchmarks
| Metric | Target | Action |
|--------|--------|--------|
| CTR | > 3% | Test new headline combinations |
| Conversion Rate | > 10% | Review landing page |
| CPL | < $40 | Tighten match types |
| Quality Score | > 7 | Improve ad-keyword-landing alignment |
| Impression Share | > 40% | Increase budget or bids |
