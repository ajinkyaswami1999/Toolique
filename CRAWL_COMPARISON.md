# Crawl Comparison & Change Detection Engine

The Toolique Website Crawler features a deterministic comparison and delta-tracking system that identifies modifications, security deviations, SEO adjustments, and architecture graph shifts between a baseline crawl (Crawl A) and a comparative crawl (Crawl B).

---

## 1. URL Identity & Normalization Model

To prevent false positives caused by protocol fluctuations or trailing slashes, all comparisons utilize the crawler's canonical identity rules. URLs are normalized using `normalizeUrl()` before mapping:
- **Fragments Removal**: Strips hash segments (`#`).
- **Domain Lowercasing**: Hostnames are cast to lowercase.
- **Port Stripping**: Default ports (80 for HTTP, 443 for HTTPS) are removed.
- **Tracking Parameter Cleansing**: Automatically deletes marketing parameters (`utm_*`, `fbclid`, `gclid`).
- **Slash Normalization**: Eliminates double slashes and standardizes trailing slashes.

---

## 2. Change Classification

For every URL, the engine evaluates existence and fields to classify pages into one of four states:
- **NEW**: The normalized URL exists only in Crawl B.
- **REMOVED**: The normalized URL exists only in Crawl A.
- **UNCHANGED**: The URL exists in both, and all tracked fields are identical.
- **CHANGED**: The URL exists in both, but one or more tracked fields differ.

---

## 3. Tracked Fields

The following fields participate in page-level comparison:
- **HTTP Parameters**: Status code, Content Type.
- **SEO & Metadata**: Title, Meta Description, Canonical URL, Meta Robots, Indexability.
- **Content Attributes**: Word Count, Response Size (Bytes), H1 Headings list.
- **Link Audits**: Inbound internal link count, Outbound link count.
- **Technical Health**: Diagnostic issues count, Page health score.

---

## 4. Stable Issue Matching

To prevent database-generated primary keys from creating duplicate issue warnings, issues are tracked using a stable composite signature:
```
Issue Signature = NormalizeUrl(i.url) + "|" + i.rule + "|" + i.description
```
Using this identity, issues are classified as:
- **NEW**: Detected in Crawl B but missing in Crawl A.
- **RESOLVED**: Present in Crawl A but absent in Crawl B.
- **PERSISTENT**: Present in both crawls.

---

## 5. Visual Graph Diff Render Model

The Visualizer Canvas renders architectural differences using distinct color codes:
- **Solid Green Node/Edge**: Added element.
- **Dashed Red Node/Edge**: Removed element.
- **Solid Amber Node**: Changed page metadata.
- **Standard Colors**: Unchanged node/edge (represented by HTTP status colors).

---

## 6. High-Performance & Scaling

To support 10,000+ pages and 100,000+ links without thread degradation:
- **Async Yielding Chunks**: Heavy computations (links/resources diffing) run in chunks of 500 items, yielding control to the browser event loop using `setTimeout(..., 0)`.
- **Database Caching**: Computed comparison payloads are stored as stringified JSON inside IndexedDB (`comparison_results`), allowing instant reloading without recalculating on revisit.
- **Auto Retention**: Completed jobs and cached payloads are cleaned up if they exceed 24 hours to preserve browser storage capacities.

---

## 7. Versioning & Security

- **Comparison Versioning**: All jobs are tagged with `comparisonVersion: 1`, ensuring compatibility safety if diff logic shifts in future phases.
- **Sandbox Authorization Boundaries**: Comparisons run entirely client-side inside the user's IndexedDB browser workspace. A user can only compare crawls they are authorized to access, as data from external accounts never exists in their local sandbox.
