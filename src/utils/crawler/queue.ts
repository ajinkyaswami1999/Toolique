/**
 * Crawler Queue Manager utility.
 */

export interface QueueItem {
  url: string;
  depth: number;
  parentUrl: string;
  discoverySource: string;
}

export class CrawlQueue {
  private queue: QueueItem[] = [];
  private visited = new Set<string>();
  private targetHost: string;
  private maxUrls: number;
  private maxDepth: number;
  private includeSubdomains: boolean;

  constructor(startingUrl: string, maxUrls: number = 1000, maxDepth: number = 5, includeSubdomains: boolean = false) {
    this.maxUrls = maxUrls;
    this.maxDepth = maxDepth;
    this.includeSubdomains = includeSubdomains;
    try {
      this.targetHost = new URL(startingUrl).hostname.toLowerCase();
    } catch {
      this.targetHost = '';
    }

    // Add starting URL to queue
    this.enqueue({
      url: startingUrl,
      depth: 0,
      parentUrl: '',
      discoverySource: 'USER_INPUT'
    });
  }

  /**
   * Enqueues a new discovered URL if it complies with scope and depth constraints.
   */
  public enqueue(item: QueueItem): boolean {
    if (this.visited.has(item.url)) return false;
    if (this.visited.size + this.queue.length >= this.maxUrls) return false;
    if (item.depth > this.maxDepth) return false;

    try {
      const itemUrl = new URL(item.url);
      const itemHost = itemUrl.hostname.toLowerCase();

      // Enforce scope validation
      if (!this.includeSubdomains && itemHost !== this.targetHost) {
        return false;
      }
      if (this.includeSubdomains && !itemHost.endsWith(this.targetHost)) {
        return false;
      }

      // Check if already in queue to prevent duplicate enqueue
      if (this.queue.some(q => q.url === item.url)) {
        return false;
      }

      this.queue.push(item);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pops the next URL from the queue.
   */
  public dequeue(): QueueItem | undefined {
    const item = this.queue.shift();
    if (item) {
      this.visited.add(item.url);
    }
    return item;
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getVisitedCount(): number {
    return this.visited.size;
  }

  public isQueueEmpty(): boolean {
    return this.queue.length === 0;
  }

  public clear(): void {
    this.queue = [];
    this.visited.clear();
  }
}
