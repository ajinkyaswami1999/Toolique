# Implementation Plan

Do not implement everything simultaneously.

## Phase 0 — Repository Inspection

Inspect existing Toolique architecture.

Do not modify anything yet.

Document:

- framework
- database
- storage
- API
- deployment
- existing components
- existing tool architecture

## Phase 1 — Crawler Core

Implement:

- URL validation
- URL normalization
- queue
- workers
- HTTP fetch
- robots
- crawl limits

## Phase 2 — Persistence

Implement:

- crawl
- crawl_url
- page
- response
- links
- errors

## Phase 3 — Extraction

Implement:

- HTML
- links
- metadata
- headings
- images
- resources
- structured data

## Phase 4 — Analyzers

Implement:

- SEO
- links
- content
- resources
- security
- performance
- indexability
- duplicate detection

## Phase 5 — Issue Engine

Implement deterministic issue rules.

## Phase 6 — Scoring

Implement transparent scoring.

## Phase 7 — API

Implement paginated APIs.

## Phase 8 — Realtime

Implement crawl progress.

## Phase 9 — Dashboard

Build the results UI.

## Phase 10 — Page Inspector

Build detailed page view.

## Phase 11 — Architecture

Build tree/graph visualization.

## Phase 12 — Exports

Implement CSV/JSON/XLSX/PDF where supported.

## Phase 13 — Comparison

Implement crawl comparison.

## Phase 14 — Security

Perform SSRF and abuse hardening.

## Phase 15 — Testing

Run unit, integration, security and load tests.

## Phase 16 — Real Website Validation

Test against multiple real websites.

## Final Rule

Do not move to the next phase if the previous phase does not pass its tests.