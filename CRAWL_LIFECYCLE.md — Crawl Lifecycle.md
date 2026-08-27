# Crawl Lifecycle

## States

QUEUED

→ CRAWLING

→ COMPLETED

or:

CRAWLING

→ PAUSED

→ CRAWLING

or:

CRAWLING

→ CANCELLED

or:

CRAWLING

→ PARTIAL

or:

CRAWLING

→ FAILED

## Start

Validate:

- URL
- protocol
- domain
- configuration

Create crawl record.

Initialize queue.

Start workers.

## During Crawl

Persist:

- URL state
- response
- extracted data
- issues
- progress

## Completion

Only mark COMPLETED when the queue is exhausted or the configured crawl limit is reached normally.

## Partial

Use PARTIAL when crawling stopped unexpectedly or was intentionally stopped after processing useful data.

## Failed

Use FAILED when the crawl cannot meaningfully start or continue.

## Resume

If supported, restore:

- configuration
- queue
- completed URLs
- pending URLs
- failed URLs