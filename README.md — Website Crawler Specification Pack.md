# Toolique Website Crawler

## Purpose

This directory contains the complete engineering specification for the Toolique Website Crawler.

The crawler is a production-grade, deterministic website crawling and analysis platform capable of processing up to 10,000 URLs per crawl.

## Core Principles

1. Real website data only.
2. Zero hard-coded crawl results.
3. Zero fake/demo production data.
4. Zero AI.
5. Deterministic analysis.
6. Every metric must be traceable to crawl data.
7. Safe and polite crawling.
8. Strong SSRF protection.
9. Partial crawl results must be preserved.
10. The crawler engine is the source of truth, not the UI.

## Specification Order

Read these documents before implementation:

1. MASTER_SPEC.md
2. PRODUCT_SPEC.md
3. ARCHITECTURE.md
4. CRAWLER_ENGINE.md
5. CRAWL_LIFECYCLE.md
6. URL_DISCOVERY.md
7. URL_NORMALIZATION.md
8. HTTP_ENGINE.md
9. PAGE_EXTRACTION.md
10. ANALYZERS.md
11. DATA_MODEL.md
12. API_SPEC.md
13. REALTIME_EVENTS.md
14. UI_SPEC.md
15. SECURITY.md
16. TEST_PLAN.md
17. ACCEPTANCE_CRITERIA.md
18. ANTI_FAKE_DATA.md
19. IMPLEMENTATION_PLAN.md

## Source of Truth

When code and specification conflict, do not silently choose.

Identify the conflict and resolve it according to the specification.

## Production Rule

The following pipeline must always remain true:

REAL WEBSITE
→ REAL REQUEST
→ REAL RESPONSE
→ REAL PARSING
→ REAL ANALYSIS
→ REAL DATABASE RECORD
→ REAL API RESPONSE
→ REAL UI

Never substitute static values.