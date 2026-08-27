# Beta Testing Guide

Welcome to the Toolique Website Crawler Beta Testing guide. This document outlines how to execute the pre-production validation suites, verify code compliance, and run local stress testing simulations.

---

## 1. Setup and Environment Verification
Before running tests, ensure all dependencies are installed and the project compiles cleanly.

```bash
# Verify TypeScript compile and build
npm run build

# Verify ESLint code style compliance
npx eslint src/utils/crawler/
npx eslint src/tools/WebsiteCrawler.tsx
```

---

## 2. Automated Event-Driven Stress Test Run
We have implemented a controlled test suite that spins up a local server, mocks browser APIs (Worker, Blob, IndexedDB) in Node.js, and validates crawl performance and data integrity constraints.

To execute the test suite:

```bash
# Execute the crawl test suite
npx tsx scripts/test-10k.ts
```

### What this test verifies:
1. **SSRF Bypass in Test Environment**: Confirms that local loopback fetches to `127.0.0.1` are permitted when `TOOLIQUE_TEST_SSRF_BYPASS=true` is set.
2. **Robots.txt parsing**: Verifies that pages disallowed by `robots.txt` are blocked.
3. **HTTP Status Handling**: Verifies correct persistence of 200, 301, 404, and 500 status codes.
4. **Header Directives**: Confirms that `X-Robots-Tag: noindex, nofollow` headers are parsed and mapped to indexability rules.
5. **SEO Page Analysis**: Validates that SEO analyzer issues (e.g. missing titles, tags) are successfully logged.
6. **Structured Data**: Validates correct parsing of JSON-LD scripts on crawl targets.
7. **Queue Management**: Checks that the queue drains completely to 0 pending URLs.

---

## 3. High-Scale Local Stress Server
If you wish to test or run a standalone high-scale server that serves 10,000 links in a 10-ary search tree structure for other benchmarking tools, run:

```bash
# Spin up the standalone 10k test server
npx tsx scripts/server-10k.ts
```

The server binds to `http://127.0.0.1:3000` and generates:
- `/robots.txt`: Custom disallowed paths.
- `/sitemap.xml`: Full programmatic XML map containing 10,000 URLs.
- `/page-i` (from 0 to 9999): Mock webpages containing recursive child links, style links, script resources, and image nodes.
