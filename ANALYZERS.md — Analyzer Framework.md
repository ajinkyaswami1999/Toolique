# Analyzer Framework

Analyzers must be independent deterministic modules.

Each analyzer should have:

```text id="5v73fh"
name
version
input
output
rules
severity
```

## Analyzer Types

- SEO
- links
- content
- resources
- images
- security
- performance
- indexability
- duplicates
- structured data

## Analyzer Contract

Input:

Actual crawl/page data.

Output:

Structured analysis.

Example:

```text id="8r70ti"
{
  rule: "MISSING_TITLE",
  severity: "WARNING",
  page_id: "...",
  evidence: {}
}
```

No analyzer may invent data.