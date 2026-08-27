# URL Normalization

## Requirements

Normalize URLs deterministically.

Handle:

- fragments
- hostname casing
- default ports
- relative paths
- duplicate slashes
- URL encoding
- trailing slash
- HTTP/HTTPS
- www/non-www according to configured scope

## Fragments

Fragments must not create separate crawl URLs.

## Query Parameters

Store original query parameters.

Provide configurable handling for:

- tracking parameters
- session parameters
- duplicate parameters

Never blindly remove meaningful application parameters.

## Deduplication

Maintain:

- original_url
- normalized_url
- canonical_url

Deduplicate by normalized URL according to crawl configuration.