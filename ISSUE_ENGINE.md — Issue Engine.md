# Issue Engine

Every issue must have:

- unique rule ID
- category
- severity
- description
- evidence
- affected URL
- detection version

## Example

```text id="f1n2s6"
Rule:
SEO_TITLE_MISSING

Category:
SEO

Severity:
WARNING

Evidence:
title = null
```

## Severity

Use:

- CRITICAL
- WARNING
- NOTICE

Do not call something critical without a deterministic justification.

## Issue Aggregation

Dashboard counts must be calculated from actual issue records.