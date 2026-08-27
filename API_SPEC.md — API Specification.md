# API Specification

## Crawl

```text id="sy8z1m"
POST /api/crawl
GET /api/crawl/:id
POST /api/crawl/:id/pause
POST /api/crawl/:id/resume
POST /api/crawl/:id/stop
DELETE /api/crawl/:id
```

## Data

```text id="m6t5iv"
GET /api/crawl/:id/pages
GET /api/crawl/:id/issues
GET /api/crawl/:id/links
GET /api/crawl/:id/images
GET /api/crawl/:id/resources
GET /api/crawl/:id/redirects
GET /api/crawl/:id/sitemap
GET /api/crawl/:id/robots
GET /api/crawl/:id/statistics
```

## Requirements

APIs must return real database/crawler data.

No static response fixtures in production.

Use pagination for large datasets.