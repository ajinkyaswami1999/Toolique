# Test Plan

## Unit Tests

Test:

- URL normalization
- URL scope
- robots parser
- sitemap parser
- HTML extraction
- title analysis
- metadata
- canonical
- hreflang
- duplicate detection
- scoring
- issue engine

## Integration Tests

Test:

- static site
- WordPress
- Next.js
- SPA
- redirects
- 404
- 500
- 429
- robots
- sitemap
- malformed HTML
- timeout

## Security

Test:

- localhost
- private IP
- redirect to private IP
- DNS rebinding
- oversized responses
- excessive redirects

## Load

Test:

- 100 URLs
- 1,000 URLs
- 5,000 URLs
- 10,000 URLs

## UI

Test:

- desktop
- tablet
- mobile
- dark mode
- accessibility
- browser refresh during crawl