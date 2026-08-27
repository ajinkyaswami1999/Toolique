# Performance Analyzer

Measure crawler-observed network metrics.

Possible measurements:

- DNS
- connection
- TLS
- TTFB
- response duration
- download duration
- response size
- resource count

## Important

These are crawler-observed metrics.

Do not call them:

- Core Web Vitals
- real-user performance
- Google performance

unless actual browser/RUM data exists.

## Browser Rendering

If enabled, optionally collect:

- DOMContentLoaded
- load event
- resource timing
- transferred bytes