# SOP-19 — Scroll-Stopper Ad Skill

**Version**: 1.0
**Skill**: Scroll-Stopper Ad
**Status**: Active

---

## Purpose
Convert newsletters and mined transcript content into paid ad creative for Meta, LinkedIn, and Google.

## Trigger
Newsletter is published, new content hooks are mined, or Callan needs new ad creative.

## Content → Ad Pipeline
1. Newsletter published (SOP-18)
2. Newsletter's top hook/story becomes ad primary text
3. Two ad variants built: one framework from playbook + one contrarian
4. Callan reviews and selects winner to test
5. Launch in ad platform
6. Track performance → feed results back to content strategy

## Steps

1. Load skill: `skills/custom/scroll-stopper-ad-skill/SKILL.md`
2. Provide source content (newsletter or transcript hook)
3. Claude builds 2 ad variants using different frameworks
4. Apply Callan Voice Skill to both
5. Callan selects variant to test
6. Log ad creative to Google Drive `/Ads/[Month]`
7. Launch in ad platform
8. Track CTR and CPL → log to Notion KPI Snapshots

## Platform Guidelines

| Platform | Ad Format | Best Framework | Audience |
|---|---|---|---|
| Meta (Facebook/Instagram) | Feed image or video | Revenue Gap or Speed Problem | Cold traffic (service business owners) |
| LinkedIn | Sponsored content | Proof (specific result) | Warm professional audience |
| Google | Search or Display | Speed Problem | High-intent searchers |

## Ad Performance Benchmarks
| Metric | Target | Action if Below |
|---|---|---|
| CTR (Meta) | > 1.5% | Test new hook in primary text |
| CPL | < $30 | Adjust audience targeting |
| CPL (LinkedIn) | < $75 | Adjust offer or copy |
| Booking Rate | > 20% of leads | Improve landing page or qualifier |
