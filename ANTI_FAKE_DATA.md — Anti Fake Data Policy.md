# Anti-Fake-Data Policy

## Absolute Rule

Production crawler output must NEVER be simulated.

Forbidden:

- hard-coded page counts
- hard-coded URLs
- hard-coded SEO scores
- hard-coded issue counts
- hard-coded response times
- hard-coded progress
- fake charts
- demo JSON
- fake API responses
- static fallback datasets
- random values

## Correct

```text id="uhcvyt"
actualPages = database.count(crawlId)
```

## Incorrect

```text id="g31n8v"
actualPages = 100
```

## Zero Values

Do not replace unavailable values with zero.

Use:

`NOT_AVAILABLE`

when zero cannot be legitimately calculated.

## Development Fixtures

Mocks may exist only in isolated automated tests.

They must never execute in production.

## Verification

Test multiple websites.

Different websites must produce different datasets according to their actual content.