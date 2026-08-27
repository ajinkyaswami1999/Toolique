# Toolique Security & Hardening Policy

This document outlines the security architecture, SSRF protections, resource boundaries, and access control models configured for the Toolique Website Crawler.

---

## 1. SSRF & Network Protections

To prevent the crawler from acting as an intranet proxy or accessing internal resources, a two-stage SSRF protection engine is enforced:

### A. Hostname String Auditing
Every target URL hostname is checked against loopback/private subnets and prefixes:
- **Loopback**: `localhost`, `127.0.0.1`, `::1`
- **Private Subnets**: `10.*`, `192.168.*`, `172.16.*` through `172.31.*`
- **Link-Local & Cloud Metadata**: `169.254.169.254` (cloud metadata), `169.254.*`
- **Multicast**: `224.*` through `239.*`
- **Broadcast / Reserved**: `240.*` through `255.*`

### B. DNS Resolution (DoH) & Rebinding Defense
If the hostname is a domain name, it is resolved to its A/AAAA IP records using DNS-over-HTTPS (DoH) Cloudflare and Google API fallbacks. The crawler validates that **none** of the resolved IP addresses match private/loopback CIDR subnets before making the connection.

### C. Redirect SSRF Protection
The network crawler executes fetches using `redirect: 'manual'`. Every HTTP redirect (3xx) target URL is intercepted and validated against both hostname and DNS SSRF subnets before being followed.

---

## 2. Port & Scheme Restrictions

- **Permitted Protocols**: Only `http:` and `https:` schemes are allowed. Unsafe protocols (e.g. `file://`, `ftp://`, `data:`, `gopher://`, `javascript:`) are rejected.
- **Allowed Ports**: Only standard web ports `80`, `443` or empty default ports are allowed. Any connection to internal service ports (e.g. Redis on 6379, Postgres on 5432) is blocked.
- **UserInfo Block**: URLs containing embedded authentication credentials (e.g. `https://user:pass@domain`) are rejected to prevent credential leaks.

---

## 3. Resource Limits & Memory Safeguards

- **Response Size Cap**: Web Worker downloads stream response bytes dynamically. If a response exceeds **10MB**, the connection stream is cancelled immediately, preventing memory exhaustion and zip bombs.
- **Redirect Chain Limit**: Redirect chains are capped at a maximum of **10 hops** to prevent infinite loop exploits.
- **Crawl Boundaries**: Crawl parameters are strictly capped at `maxUrls = 10,000` and `depth = 20`.
- **Crawl Concurrency**: A maximum of **5 concurrent active crawls** is permitted in a user workspace.

---

## 4. Authentication, IDOR, and File Security

- **Simulated RLS Authorization**: Mock REST API interceptors query IndexedDB tables with a validated `userId` header parameter. If a request is unauthenticated (`Bearer anonymous`), access is denied (`401 Unauthorized`).
- **IDOR Protection**: Accessing crawls, exports, or comparison jobs checks ownership of the requested resource. Cross-access results in `403 Forbidden`.
- **Path Traversal Shield**: Export Job IDs and download paths are strictly validated using `^[a-zA-Z0-9-_]+$`. This blocks directory traversal patterns (`../`).
- **CSV Injection Defense**: Exported spreadsheet values are escaped if they begin with formula prefixes (`=`, `+`, `-`, `@`).

---

## 5. UI Data Sanitization & XSS Protections

- **HTML Previews**: Crawled pages displayed inside inspectors are rendered in sandboxed iframes (`sandbox="allow-same-origin"`) with scripts execution disabled.
- **Metadata Escaping**: Reactive nodes display crawled variables as text nodes, utilizing React's native escaping layer to block cross-site scripting (XSS).
- **JSON-LD Schema parsing**: JSON-LD structures are parsed using native `JSON.parse` inside try-catch blocks to prevent script injection.
