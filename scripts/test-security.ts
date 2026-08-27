/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock global variables for headless execution
(global as any).window = {
  location: {
    origin: 'https://toolique-test.in'
  }
};

const mockDb: any = {
  objectStoreNames: {
    contains: () => true
  },
  transaction: (stores: any, mode: any) => {
    const tx: any = {
      objectStore: (storeName: any) => {
        return {
          put: (data: any) => {
            const req: any = {};
            setTimeout(() => {
              if (storeName === 'crawls') {
                mockCrawls[data.id] = data;
              }
              if (req.onsuccess) req.onsuccess();
            }, 0);
            return req;
          },
          get: (key: any) => {
            const req: any = {};
            setTimeout(() => {
              if (storeName === 'crawls') {
                req.result = mockCrawls[key];
              }
              if (req.onsuccess) req.onsuccess();
            }, 0);
            return req;
          },
          getAll: () => {
            const req: any = {};
            setTimeout(() => {
              if (storeName === 'crawls') {
                req.result = Object.values(mockCrawls);
              } else {
                req.result = [];
              }
              if (req.onsuccess) req.onsuccess();
            }, 0);
            return req;
          }
        };
      },
      oncomplete: () => {
        if (tx.oncomplete) tx.oncomplete();
      },
      onerror: () => {}
    };
    return tx;
  }
};

(global as any).indexedDB = {
  open: (name: string, version: number) => {
    const req: any = {
      result: mockDb,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    };
    setTimeout(() => {
      if (req.onsuccess) req.onsuccess();
    }, 0);
    return req;
  }
};

// Mock global fetch for DoH simulation
let fetchMockIps: string[] = [];
(global as any).fetch = async (url: string, init?: any) => {
  if (url.includes('cloudflare-dns.com') || url.includes('dns.google')) {
    return {
      ok: true,
      json: async () => ({
        Answer: fetchMockIps.map(ip => ({ type: ip.includes(':') ? 28 : 1, data: ip }))
      })
    };
  }
  return { ok: false };
};

import { isSafeUrl, isSafeUrlAsync, isIpPrivate } from '../src/utils/crawler/url';
import { handleCrawlerApi } from '../src/utils/crawler/api';
import { CrawlStorage } from '../src/utils/crawler/storage';

const mockCrawls: Record<string, any> = {};

async function runTests() {
  console.log('=== STARTING SECURITY HARDENING & SSRF MITIGATION TESTS ===');

  // Test 1: Private IP Subnets Check
  console.log('\n--- Test 1: Private IPv4/IPv6 Subnets Check ---');
  const privateIps = [
    '127.0.0.1', '10.0.0.1', '192.168.1.1', '172.16.0.1', '169.254.169.254',
    '::1', '::', 'fe80::1', 'fc00::', 'ff00::'
  ];
  privateIps.forEach(ip => {
    if (!isIpPrivate(ip)) {
      throw new Error(`Private IP check failed to block: ${ip}`);
    }
  });
  console.log('✅ Correctly identified all private IPs.');

  // Test 2: Synchronous URL Scheme and Port Block Check
  console.log('\n--- Test 2: URL Scheme, Port and Credentials Check ---');
  const unsafeUrls = [
    'file:///etc/passwd',
    'ftp://example.com/file',
    'gopher://example.com',
    'http://localhost:6379',
    'http://localhost:5432',
    'http://127.0.0.1:9200',
    'https://user:password@example.com',
    'https://user@example.com',
    'http://169.254.169.254/latest/meta-data',
    'http://10.0.0.1/admin'
  ];
  unsafeUrls.forEach(url => {
    if (isSafeUrl(url)) {
      throw new Error(`Unsafe URL check failed to block: ${url}`);
    }
  });
  console.log('✅ Correctly blocked unsafe schemes, custom internal ports, credentials, and local hostnames.');

  // Test 3: Asynchronous DoH SSRF Check (DNS Rebinding Mitigation)
  console.log('\n--- Test 3: Asynchronous DNS Rebinding SSRF Check ---');
  fetchMockIps = ['127.0.0.1'];
  let isSafe = await isSafeUrlAsync('https://safe-domain-resolving-to-local.com');
  console.log(`URL with loopback IP result: ${isSafe} (Expected: false)`);
  if (isSafe) {
    throw new Error('SSRF check failed to block domain resolving to loopback IP.');
  }

  fetchMockIps = ['10.0.0.5'];
  isSafe = await isSafeUrlAsync('https://safe-domain-resolving-to-private-a.com');
  console.log(`URL with private IP result: ${isSafe} (Expected: false)`);
  if (isSafe) {
    throw new Error('SSRF check failed to block domain resolving to private IP.');
  }

  fetchMockIps = ['93.184.216.34'];
  isSafe = await isSafeUrlAsync('https://example.com');
  console.log(`URL with public IP result: ${isSafe} (Expected: true)`);
  if (!isSafe) {
    throw new Error('SSRF check incorrectly blocked a safe public IP.');
  }
  console.log('✅ Asynchronous DoH-resolved SSRF checks passed.');

  // Test 4: Authenticated / Unauthorized Access Simulation (IDOR Checks)
  console.log('\n--- Test 4: Authorization and IDOR Controls ---');
  const storage = new CrawlStorage();
  await storage.init();
  
  // Seed database crawls belonging to specific users
  await storage.saveCrawl({
    id: 'crawl-user-a',
    rootUrl: 'https://example.com',
    domain: 'example.com',
    timestamp: new Date().toISOString(),
    status: 'CRAWLED',
    totalPages: 5,
    brokenLinks: 0,
    seoScore: 90,
    duration: 10,
    maxUrls: 20,
    depth: 5,
    userId: 'user-a'
  });

  // A. Anonymous User access check (Should return 401)
  let response = await handleCrawlerApi('/api/crawler/crawls/crawl-user-a', {
    headers: { 'Authorization': 'Bearer anonymous' }
  });
  console.log(`Anonymous user status code: ${response.status} (Expected: 401)`);
  if (response.status !== 401) {
    throw new Error('Access control failed to block anonymous user.');
  }

  // B. User B accessing User A's crawl (IDOR check - Should return 403)
  response = await handleCrawlerApi('/api/crawler/crawls/crawl-user-a', {
    headers: { 'Authorization': 'Bearer user-b' }
  });
  console.log(`User B accessing User A's crawl status: ${response.status} (Expected: 403)`);
  if (response.status !== 403) {
    throw new Error('Access control failed to prevent IDOR access.');
  }

  // C. User A accessing own crawl (Should return 200)
  response = await handleCrawlerApi('/api/crawler/crawls/crawl-user-a', {
    headers: { 'Authorization': 'Bearer user-a' }
  });
  console.log(`User A accessing own crawl status: ${response.status} (Expected: 200)`);
  if (response.status !== 200) {
    throw new Error('Access control incorrectly blocked authorized user.');
  }
  console.log('✅ Centralized IDOR and simulated auth check controls passed.');

  // Test 5: Path Traversal Defenses
  console.log('\n--- Test 5: Path Traversal Defenses ---');
  response = await handleCrawlerApi('/api/crawler/crawls/..%2F..%2Fother-crawl', {
    headers: { 'Authorization': 'Bearer user-a' }
  });
  console.log(`Path traversal ID status code: ${response.status} (Expected: 400 or 403)`);
  if (response.status !== 400 && response.status !== 403) {
    throw new Error('Path traversal pattern was not blocked.');
  }
  console.log('✅ Path traversal check passed.');

  // Test 6: Pagination bounds protection
  console.log('\n--- Test 6: Pagination Bounds Protection ---');
  response = await handleCrawlerApi('/api/crawler/crawls/crawl-user-a/pages?page=9999999999&pageSize=999999', {
    headers: { 'Authorization': 'Bearer user-a' }
  });
  console.log(`Pagination overflow status code: ${response.status} (Expected: 200 with fallback limits)`);
  if (response.status !== 200) {
    throw new Error('Pagination validation failed.');
  }
  console.log('✅ Pagination overflow checks passed.');

  console.log('\n=== ALL SECURITY AUDIT TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Security verification failed:', err);
  process.exit(1);
});
