# Crawler Engine

## Responsibilities

The crawler engine is responsible for:

- queue management
- URL fetching
- concurrency
- retries
- redirects
- discovery
- robots compliance
- crawl limits
- timeouts
- persistence

## Worker Lifecycle

```text
Get URL
→ Validate
→ Check scope
→ Check robots
→ Fetch
→ Record response
→ Parse
→ Discover URLs
→ Analyze
→ Persist
→ Emit event
→ Next URL
```

## Concurrency

Concurrency must be configurable and bounded.

Never create unlimited requests.

## Retry

Retry only appropriate transient failures.

Examples:

- timeout
- connection reset
- 429
- selected 5xx

Do not repeatedly retry permanent 404 errors.

## Redirects

Follow redirects within configured limits.

Revalidate every redirected destination for SSRF.

## Maximum URLs

Hard maximum:

10,000.

## Maximum Response Size

Configure safe response-size limits.

## Timeout

Every network request must have a timeout.

## Cancellation

Cancellation must stop new work and safely terminate active workers.