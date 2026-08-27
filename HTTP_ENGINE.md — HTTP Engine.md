# HTTP Engine

## Collect

For every request:

- URL
- method
- status
- headers
- content type
- content length
- bytes downloaded
- response duration
- redirect chain

Where available:

- DNS duration
- connection duration
- TLS duration
- TTFB

## Status Classes

- 1xx
- 2xx
- 3xx
- 4xx
- 5xx

## Errors

Classify:

- DNS
- timeout
- connection
- TLS
- HTTP
- parsing

## Retry

Implement bounded retries.

## User Agent

Use a transparent Toolique crawler user-agent.

Never impersonate Googlebot.