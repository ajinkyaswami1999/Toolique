# Site Architecture

## Tree

Represent:

```text id="pslqvu"
Root
 ├── Section
 │    ├── Page
 │    └── Page
 └── Section
```

## Graph

Represent:

- nodes = URLs
- edges = internal links

## Node Data

- URL
- status
- depth
- inbound links
- outbound links

## Performance

Do not render all 10,000 nodes at full complexity immediately.

Use:

- progressive loading
- virtualization
- clustering
- depth filters
- search