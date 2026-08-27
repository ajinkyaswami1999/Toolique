# Toolique Coding Agent Instructions

## IMPORTANT

The Website Crawler is a production feature.

Do not treat it as a UI prototype.

Before modifying code:

1. Inspect the existing repository.
2. Inspect existing Toolique architecture.
3. Read:

```text
docs/website-crawler/README.md
docs/website-crawler/MASTER_SPEC.md
docs/website-crawler/ANTI_FAKE_DATA.md
docs/website-crawler/ARCHITECTURE.md
docs/website-crawler/DATA_MODEL.md
docs/website-crawler/SECURITY.md
docs/website-crawler/ACCEPTANCE_CRITERIA.md
docs/website-crawler/IMPLEMENTATION_PLAN.md
```

Then inspect the remaining specifications relevant to the implementation phase.

## Do not

- create fake data
- create static crawler results
- create fake progress
- create fake API responses
- hard-code scores
- hard-code URLs
- use AI
- bypass robots.txt by default
- create insecure URL fetching
- expose internal server errors
- put crawler logic in UI components
- load 10,000 records into the browser unnecessarily

## Do

- use actual crawl data
- create deterministic analyzers
- preserve crawl state
- validate every URL
- protect against SSRF
- use background workers
- use bounded concurrency
- use database indexes
- paginate large datasets
- test every analyzer
- preserve partial results
- make metrics traceable

## Before Implementation

Provide a short implementation plan based on the specifications.

Identify:

- existing architecture
- reusable components
- required infrastructure
- potential conflicts
- missing dependencies
- database changes
- security risks

Do not silently invent infrastructure.

## During Implementation

Implement one phase at a time.

After each phase:

1. Run tests.
2. Verify functionality.
3. Check specification compliance.
4. Fix issues.
5. Continue.

## Critical Requirement

Every website-specific number shown in the UI must be traceable to actual crawl data.

If you cannot determine a value:

```text
Not available
```

Do not fabricate it.

## Final Verification

Before completion, verify:

```text
Website A → actual dataset A
Website B → actual dataset B
```

and ensure there is no production fallback to static/mock data.

The crawler must be real.