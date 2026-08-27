# Scoring Engine

Scores must be deterministic and transparent.

## Categories

- Technical
- SEO
- Links
- Content
- Security
- Performance

## Requirements

Every score must expose:

- total checks
- passed checks
- failed checks
- weights
- penalties
- final score

## Formula

The exact formula must be implemented in code and versioned.

Never hard-code a final score.

## Example

Do not:

```text id="gk2jhf"
score = 82
```

Instead:

```text id="s6twj5"
score = calculateScore(actualChecks)
```

## Versioning

Store scoring version with each crawl.