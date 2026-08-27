# Performance and Scaling

## Requirements

The system must support crawls up to 10,000 URLs without:

- frontend freezing
- browser memory exhaustion
- database timeout
- queue explosion

## Frontend

Use:

- pagination
- virtualization
- incremental loading
- aggregated endpoints

## Backend

Use:

- worker queues
- bounded concurrency
- database indexes
- batch writes
- aggregation

## Architecture Graph

Use progressive rendering.

## Large Crawl

Do not return all records in one API response.