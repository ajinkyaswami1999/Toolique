# Error Handling

## Error Categories

- DNS
- connection
- timeout
- TLS
- HTTP
- robots
- parsing
- redirect
- response-size
- queue
- internal crawler

## Rule

One failed URL must not terminate the crawl.

## User Message

Use:

```text id="yyd8l0"
Crawl could not process this URL.

Reason:
Connection timeout.

Status:
FAILED

Retry:
Available
```

Do not expose internal stack traces.

## Partial Data

Always preserve successful crawl records.