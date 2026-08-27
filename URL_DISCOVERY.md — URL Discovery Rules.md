# URL Discovery

## Sources

Discover URLs from:

- anchor tags
- area tags
- canonical
- hreflang
- sitemap
- robots sitemap declarations
- redirects
- relevant HTML references

## Store Both

Original URL:

`https://example.com/page/`

Normalized URL:

`https://example.com/page`

## Discovery Metadata

Every URL should retain:

- discovered_from
- discovery_type
- discovery_timestamp
- parent_url
- crawl_depth

## Discovery Types

Examples:

- INTERNAL_LINK
- SITEMAP
- CANONICAL
- HREFLANG
- REDIRECT
- USER_INPUT

## External URLs

Record them.

Do not recursively crawl them unless enabled.