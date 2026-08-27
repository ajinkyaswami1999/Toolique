# Toolique Website Crawler — Master Specification

## 1. Product

Tool name:

Website Crawler

Category:

Developer

Route:

`/tools/website-crawler`

Maximum crawl size:

10,000 URLs per crawl.

## 2. Product Promise

Allow users to crawl a website and inspect its actual technical structure, HTTP behavior, SEO metadata, links, content, resources, sitemap, robots.txt, security headers, performance observations, crawl architecture, and issues.

## 3. Non-Negotiable Requirements

### No AI

No AI APIs or LLMs.

### No static results

No hard-coded website-specific data.

### No fake metrics

No fake:

- URL counts
- scores
- charts
- progress
- errors
- response times
- issues

### Dynamic only

Every website-specific value must originate from the current crawl dataset.

## 4. Maximum Crawl

10,000 URLs.

The system must never silently exceed this limit.

## 5. Default Scope

Same hostname.

Optional:

- include subdomains
- external link checking
- JavaScript rendering

## 6. Default Safety

- robots.txt respected
- rate limiting
- concurrency limits
- timeout
- response size limit
- redirect limit
- SSRF protection

## 7. Core Components

- crawler manager
- URL queue
- workers
- HTTP engine
- parser
- analyzers
- persistence
- issue engine
- scoring engine
- realtime event system
- API
- dashboard
- export system

## 8. Data Integrity

Every displayed metric must be reproducible from stored crawl records.

## 9. Crawl States

QUEUED
CRAWLING
PAUSED
COMPLETED
PARTIAL
CANCELLED
FAILED

## 10. Required Capabilities

- URL discovery
- URL normalization
- robots.txt
- sitemap
- HTTP analysis
- redirects
- SEO analysis
- link analysis
- content analysis
- image analysis
- resource analysis
- structured data
- Open Graph
- Twitter/X cards
- indexability
- security headers
- performance observations
- architecture visualization
- exports
- comparison

## 11. Final Rule

The crawler must be a real crawler first and an SEO dashboard second.