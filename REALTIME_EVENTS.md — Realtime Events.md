# Realtime Event Broker Specification & Architecture

This document specifies the single-source-of-truth realtime event system integrated into the Toolique Website Crawler.

---

## 1. Event Types

The crawler publishes the following deterministic events during a crawl job lifecycle:

| Event Type | Category | Description |
| :--- | :--- | :--- |
| `crawl_started` | Status | A new crawl session has initiated. |
| `crawl_paused` | Status | The crawl session has paused. |
| `crawl_resumed` | Status | The crawl session has resumed. |
| `crawl_stopped` | Status | The crawl session has stopped (PARTIAL). |
| `crawl_completed` | Status | The crawl completed successfully. |
| `crawl_failed` | Status | The crawl failed due to a critical network error. |
| `url_discovered` | Flow | A new link target has been found. |
| `url_queued` | Flow | The link is added to the pending queue. |
| `url_started` | Worker | A worker has begun fetching the URL. |
| `url_completed` | Worker | Fetch resolved and page characteristics parsed. |
| `url_failed` | Worker | Fetch request failed or returned non-2xx status. |
| `url_blocked` | Worker | Request skipped due to robots.txt disallow rules. |
| `url_skipped` | Worker | Request skipped (e.g. cross-domain rules). |
| `issue_detected` | Diagnostics| An analyzer module flagged a health issue. |

---

## 2. Event Schema

Every realtime event conforms to the following TypeScript contract:

```typescript
export interface CrawlEvent {
  eventId: string;          // Format: evt-{crawlId}-{sequenceNumber}
  type: string;             // Event type name
  crawlId: string;          // Target crawl ID
  timestamp: string;        // ISO 8601 string
  sequenceNumber: number;   // Monotonically increasing sequence number
  payload: Record<string, any>;
}
```

Example payload for a completed fetch:
```json
{
  "eventId": "evt-crawl-12345-5",
  "type": "url_completed",
  "crawlId": "crawl-12345",
  "timestamp": "2026-08-24T11:22:50.000Z",
  "sequenceNumber": 5,
  "payload": {
    "url": "https://example.com/about",
    "time": 350
  }
}
```

---

## 3. Initial Snapshot & Subscription

When a client subscribes to a crawl, the `CrawlEventBroker` immediately yields the current crawl state snapshot to prevent UI blank/zero states:

```typescript
export interface CrawlSnapshot {
  crawlId: string;
  status: string;
  discovered: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  blocked: number;
  skipped: number;
  currentUrls: string[]; // Active worker URL targets
  startTime?: number;
  averageResponseTimeMs?: number;
}
```

---

## 4. Reconnection & Replay Buffer

To handle browser network disconnects or page reloads:
1. The broker maintains a **sliding window buffer of the last 1000 events** in memory per active crawl.
2. Clients subscribe by passing their last received `sequenceNumber`.
3. The broker automatically replays all missed events from the buffer with `sequenceNumber > lastSequenceNumber` to restore client state seamlessly.

---

## 5. Security & Isolation
- Subscribers must specify the `crawlId` to listen to.
- The broker scopes events strictly by `crawlId`, preventing cross-session data leakage.