# Data Model

Recommended entities:

```text id="7l8o5r"
crawl
crawl_config
crawl_url
page
http_response
redirect
internal_link
external_link
image
resource
heading
metadata
canonical
hreflang
structured_data
sitemap
robots_rule
security_header
crawl_error
issue
issue_rule
crawl_comparison
```

## crawl

Contains:

- id
- root URL
- status
- configuration
- timestamps
- counts
- scoring version

## crawl_url

Contains:

- crawl ID
- URL
- normalized URL
- state
- depth
- parent
- discovery source

## page

Contains parsed page data.

## issue

Contains deterministic issue records.

Use indexes for:

- crawl_id
- URL
- normalized URL
- status
- issue type
- severity
- crawl depth