/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CrawlEvent {
  eventId: string;
  type: string;
  crawlId: string;
  timestamp: string;
  sequenceNumber: number;
  payload: any;
}

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
  currentUrls: string[];
  startTime?: number;
  totalTimeMs?: number;
  averageResponseTimeMs?: number;
}

class CrawlEventBroker {
  private seqNumbers = new Map<string, number>();
  private eventBuffers = new Map<string, CrawlEvent[]>();
  private snapshots = new Map<string, CrawlSnapshot>();
  private subscribers = new Map<string, Set<(event: CrawlEvent) => void>>();
  private totalResponseTimes = new Map<string, number>();

  /**
   * Publishes a new realtime event and broadcasts it to subscribers.
   */
  public publish(crawlId: string, type: string, payload: any): CrawlEvent {
    // Increment sequence number
    const currentSeq = (this.seqNumbers.get(crawlId) || 0) + 1;
    this.seqNumbers.set(crawlId, currentSeq);

    const event: CrawlEvent = {
      eventId: `evt-${crawlId}-${currentSeq}`,
      type,
      crawlId,
      timestamp: new Date().toISOString(),
      sequenceNumber: currentSeq,
      payload
    };

    // Update snapshot state based on event type
    this.updateSnapshot(crawlId, type, payload);

    // Buffer event (cap at 1000 events per crawl)
    let buffer = this.eventBuffers.get(crawlId);
    if (!buffer) {
      buffer = [];
      this.eventBuffers.set(crawlId, buffer);
    }
    buffer.push(event);
    if (buffer.length > 1000) {
      buffer.shift();
    }

    // Broadcast to subscribers
    const subs = this.subscribers.get(crawlId);
    if (subs) {
      subs.forEach(cb => {
        try {
          cb(event);
        } catch (e) {
          console.error('Error in subscriber callback:', e);
        }
      });
    }

    return event;
  }

  /**
   * Subscribes to a crawl. Replays missed events if lastSequenceNumber is provided.
   */
  public subscribe(
    crawlId: string,
    callback: (event: CrawlEvent) => void,
    lastSequenceNumber?: number
  ): { unsubscribe: () => void; snapshot: CrawlSnapshot } {
    let subs = this.subscribers.get(crawlId);
    if (!subs) {
      subs = new Set();
      this.subscribers.set(crawlId, subs);
    }
    subs.add(callback);

    // Get snapshot
    const snapshot = this.getSnapshot(crawlId);

    // Replay missed events
    if (lastSequenceNumber !== undefined) {
      const buffer = this.eventBuffers.get(crawlId) || [];
      const missed = buffer.filter(e => e.sequenceNumber > lastSequenceNumber);
      missed.forEach(e => callback(e));
    }

    return {
      unsubscribe: () => {
        const activeSubs = this.subscribers.get(crawlId);
        if (activeSubs) {
          activeSubs.delete(callback);
          if (activeSubs.size === 0) {
            this.subscribers.delete(crawlId);
          }
        }
      },
      snapshot
    };
  }

  /**
   * Retrieves the current snapshot for a crawl.
   */
  public getSnapshot(crawlId: string): CrawlSnapshot {
    let snap = this.snapshots.get(crawlId);
    if (!snap) {
      snap = {
        crawlId,
        status: 'QUEUED',
        discovered: 0,
        queued: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
        currentUrls: []
      };
      this.snapshots.set(crawlId, snap);
    }
    return { ...snap, currentUrls: [...snap.currentUrls] };
  }

  /**
   * Calculates actual crawl speed metrics dynamically.
   */
  public getSpeedMetrics(crawlId: string): { urlsPerMin: number; urlsPerSec: number; avgTime: number } {
    const snap = this.getSnapshot(crawlId);
    if (!snap.startTime) {
      return { urlsPerMin: 0, urlsPerSec: 0, avgTime: snap.averageResponseTimeMs || 0 };
    }

    const durationMs = Date.now() - snap.startTime;
    const durationSec = durationMs / 1000;
    const totalProcessed = snap.completed + snap.failed;

    if (durationSec <= 0 || totalProcessed <= 0) {
      return { urlsPerMin: 0, urlsPerSec: 0, avgTime: snap.averageResponseTimeMs || 0 };
    }

    const urlsPerSec = totalProcessed / durationSec;
    const urlsPerMin = urlsPerSec * 60;

    return {
      urlsPerMin: parseFloat(urlsPerMin.toFixed(2)),
      urlsPerSec: parseFloat(urlsPerSec.toFixed(2)),
      avgTime: snap.averageResponseTimeMs || 0
    };
  }

  /**
   * Updates internal snapshot state according to crawl events.
   */
  private updateSnapshot(crawlId: string, type: string, payload: any) {
    const snap = this.getSnapshot(crawlId);

    switch (type) {
      case 'crawl_started':
        snap.status = 'CRAWLING';
        snap.startTime = Date.now();
        snap.discovered = 0;
        snap.queued = 0;
        snap.processing = 0;
        snap.completed = 0;
        snap.failed = 0;
        snap.blocked = 0;
        snap.skipped = 0;
        snap.currentUrls = [];
        this.totalResponseTimes.set(crawlId, 0);
        break;

      case 'crawl_paused':
        snap.status = 'PAUSED';
        break;

      case 'crawl_resumed':
        snap.status = 'CRAWLING';
        break;

      case 'crawl_completed':
        snap.status = 'CRAWLED';
        snap.processing = 0;
        snap.currentUrls = [];
        break;

      case 'crawl_stopped':
        snap.status = 'PARTIAL';
        snap.processing = 0;
        snap.currentUrls = [];
        break;

      case 'crawl_failed':
        snap.status = 'FAILED';
        snap.processing = 0;
        snap.currentUrls = [];
        break;

      case 'url_discovered':
        snap.discovered++;
        break;

      case 'url_queued':
        snap.queued++;
        break;

      case 'url_started':
        snap.queued = Math.max(0, snap.queued - 1);
        snap.processing++;
        if (payload.url && !snap.currentUrls.includes(payload.url)) {
          snap.currentUrls.push(payload.url);
        }
        break;

      case 'url_completed':
        snap.processing = Math.max(0, snap.processing - 1);
        snap.completed++;
        snap.currentUrls = snap.currentUrls.filter(u => u !== payload.url);
        if (payload.time) {
          const totalTime = (this.totalResponseTimes.get(crawlId) || 0) + payload.time;
          this.totalResponseTimes.set(crawlId, totalTime);
          snap.averageResponseTimeMs = Math.round(totalTime / snap.completed);
        }
        break;

      case 'url_failed':
        snap.processing = Math.max(0, snap.processing - 1);
        snap.failed++;
        snap.currentUrls = snap.currentUrls.filter(u => u !== payload.url);
        break;

      case 'url_blocked':
        snap.blocked++;
        break;

      case 'url_skipped':
        snap.skipped++;
        break;
    }

    this.snapshots.set(crawlId, snap);
  }
}

export const eventBroker = new CrawlEventBroker();
