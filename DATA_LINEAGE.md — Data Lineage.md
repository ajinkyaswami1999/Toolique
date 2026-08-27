# Data Lineage

Every user-visible metric must have a traceable origin.

## Example

```text id="ykm15c"
Broken Links: 27
        ↓
27 issue/link records
        ↓
Actual HTTP responses
        ↓
Actual target URLs
        ↓
Actual website
```

## Rules

A dashboard metric must never originate from:

- UI constants
- mock objects
- demo JSON
- hard-coded values

## Evidence

Whenever possible, allow users to click a metric and inspect the underlying records.