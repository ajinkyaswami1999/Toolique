# Security Specification

Refer to the primary [SECURITY.md](file:///c:/AJINKYA/Personal/Projects/ToolStack%20India/SECURITY.md) documentation for full implementation details.

## SSRF Protection
- **Synchronous Checks**: Hostname string blocklists (localhost, private subnets, cloud metadata).
- **Asynchronous Checks**: DNS-over-HTTPS (DoH) resolution of A/AAAA records before connection, checking resolved IPs against private CIDR blocks.
- **Redirects**: Enforced manual redirect chains validation at each hop.

## Port & Protocol Restrictions
- Allowed protocols: `http:` and `https:`.
- Allowed ports: `80`, `443` or empty.
- Blocked credentials: URL UserInfo authentication tokens.

## Resource Limits
- Max response size: 10MB (stream byte-counting reader).
- Max redirects: 10 hops (loop detection).
- Concurrency limit: Max 5 active crawls per user workspace.

## Access Controls
- Ownership verification (IDOR protection) on crawls, pages, issues, comparisons, and exports.
- Path traversal verification on export filenames and IDs.
- React-escaped XSS protection on text displays.