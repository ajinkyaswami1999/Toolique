# System Architecture

## Recommended Architecture

```text
Browser
   |
   v
Toolique Frontend
   |
   v
Crawler API
   |
   v
Crawl Job Manager
   |
   v
Queue
   |
   +---- Worker 1
   +---- Worker 2
   +---- Worker 3
   |
   v
HTTP Engine
   |
   v
Parser
   |
   v
Analyzer Pipeline
   |
   v
Database
   |
   +---- Aggregation
   +---- Issue Engine
   +---- Scoring
   |
   v
Realtime Events
   |
   v
Dashboard
```

## Architectural Requirements

The frontend must not perform the complete crawl.

The crawler must run as a background job.

The browser must receive progress asynchronously.

## Separation

Separate:

- crawler
- parser
- analyzers
- storage
- API
- presentation

The UI must never contain crawler business logic.

## Failure Isolation

A single URL failure must not terminate the entire crawl.

## Persistence

Persist crawl progress so that browser refresh does not necessarily destroy the crawl.