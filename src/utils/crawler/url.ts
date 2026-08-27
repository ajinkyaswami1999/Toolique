/**
 * URL Validation and Normalization utility according to specifications.
 */

// SSRF blocklist of strings for hostname quick checks
const SSRF_BLOCKED_HOSTS = [
  'localhost',
  '0.0.0.0',
  '127.0.0.1',
  '169.254.169.254',
  '::1',
  '[::1]'
];

const SSRF_BLOCKED_PREFIXES = [
  '127.',
  '10.',
  '192.168.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '169.254.'
];

/**
 * Checks if an IP address falls into a private/loopback/restricted range.
 */
export function isIpPrivate(ip: string): boolean {
  // IPv4 Check
  const ipv4Match = ip.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    if (octets.some(o => o < 0 || o > 255)) return true; // Malformed/invalid IP is unsafe
    
    const [o1, o2] = octets;
    
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return true;
    
    // 10.0.0.0/8 (Private A)
    if (o1 === 10) return true;
    
    // 172.16.0.0/12 (Private B)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    
    // 192.168.0.0/16 (Private C)
    if (o1 === 192 && o2 === 168) return true;
    
    // 169.254.0.0/16 (Link-local)
    if (o1 === 169 && o2 === 254) return true;
    
    // 0.0.0.0/32 and loopback/reserved
    if (o1 === 0) return true;
    
    // 224.0.0.0/4 (Multicast)
    if (o1 >= 224 && o1 <= 239) return true;
    
    // 240.0.0.0/4 (Reserved / Broadcast)
    if (o1 >= 240) return true;
    
    // 100.64.0.0/10 (Shared Address Space)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    
    // 198.18.0.0/15 (Benchmarking)
    if (o1 === 198 && o2 >= 18 && o2 <= 19) return true;
    
    return false;
  }

  // IPv6 Check
  let ipv6 = ip.trim().toLowerCase();
  // Strip bracket wrappers if present
  if (ipv6.startsWith('[') && ipv6.endsWith(']')) {
    ipv6 = ipv6.slice(1, -1);
  }

  // Loopback (::1)
  if (ipv6 === '::1' || ipv6 === '0:0:0:0:0:0:0:1') return true;
  
  // Unspecified (::)
  if (ipv6 === '::' || ipv6 === '0:0:0:0:0:0:0:0' || ipv6 === '') return true;

  // Link-Local (fe80::/10)
  if (ipv6.startsWith('fe8') || ipv6.startsWith('fe9') || ipv6.startsWith('fea') || ipv6.startsWith('feb')) return true;

  // Unique Local Address (fc00::/7)
  if (ipv6.startsWith('fc') || ipv6.startsWith('fd')) return true;

  // Multicast (ff00::/8)
  if (ipv6.startsWith('ff')) return true;

  return false;
}

/**
 * Resolves a hostname to IP addresses using DNS-over-HTTPS (DoH).
 */
export async function resolveDns(hostname: string): Promise<string[]> {
  const ips: string[] = [];
  const cleanHost = hostname.replace(/\[|\]/g, '');

  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanHost)}&type=A`;
    const res = await fetch(url, {
      headers: { 'accept': 'application/dns-json' },
      mode: 'cors'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer) {
        data.Answer.forEach((ans: { type: number; data: string }) => {
          if (ans.type === 1) { // A record
            ips.push(ans.data);
          }
        });
      }
    }
  } catch {
    // Fallback
  }

  if (ips.length === 0) {
    try {
      const url = `https://dns.google/resolve?name=${encodeURIComponent(cleanHost)}&type=A`;
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        if (data.Answer) {
          data.Answer.forEach((ans: { type: number; data: string }) => {
            if (ans.type === 1) { // A record
              ips.push(ans.data);
            }
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  // IPv6 check
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanHost)}&type=AAAA`;
    const res = await fetch(url, {
      headers: { 'accept': 'application/dns-json' },
      mode: 'cors'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer) {
        data.Answer.forEach((ans: { type: number; data: string }) => {
          if (ans.type === 28) { // AAAA record
            ips.push(ans.data);
          }
        });
      }
    }
  } catch {
    // Ignore
  }

  return ips;
}

export const getIsTestEnv = () => typeof process !== 'undefined' && 
  (process.env.NODE_ENV === 'test' || process.env.TOOLIQUE_TEST_SSRF_BYPASS === 'true');

/**
 * Performs synchronous checks for URL schema, ports, credentials, and obvious host strings.
 */
export function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // 1. Protocol Restriction
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    if (getIsTestEnv()) {
      // Allow localhost and other ports in local automated testing environments
      return true;
    }

    // 2. UserInfo Credentials Block
    if (url.username || url.password) {
      return false;
    }
    if (urlString.includes('@')) {
      const authority = urlString.slice(urlString.indexOf('://') + 3, urlString.indexOf(url.hostname) + url.hostname.length);
      if (authority.includes('@')) {
        return false;
      }
    }

    // 3. Port Restriction (allow default only)
    if (url.port !== '' && url.port !== '80' && url.port !== '443') {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    
    // 4. Hostname string blocklist
    if (SSRF_BLOCKED_HOSTS.includes(hostname)) {
      return false;
    }
    
    // 5. Hostname prefix blocklist
    if (SSRF_BLOCKED_PREFIXES.some(prefix => hostname.startsWith(prefix))) {
      return false;
    }

    // 6. Direct IP address check
    if (isIpPrivate(hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Performs asynchronous DNS resolution and validates resolved IP addresses to protect against DNS rebinding.
 */
export async function isSafeUrlAsync(urlString: string): Promise<boolean> {
  if (getIsTestEnv()) {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  if (!isSafeUrl(urlString)) {
    return false;
  }

  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    // If it's already an IP literal, it has been validated in isSafeUrl
    const isIpv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    const isIpv6 = hostname.includes(':');
    if (isIpv4 || isIpv6) {
      return true;
    }

    const resolvedIps = await resolveDns(hostname);
    if (resolvedIps.length === 0) {
      // Unresolvable hosts are treated as unsafe to avoid DNS rebinding or connection hijacking
      return false;
    }

    // If any resolved IP is private/loopback, reject the URL
    if (resolvedIps.some(ip => isIpPrivate(ip))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes URL path deterministically:
 * - strips hashes/fragments
 * - lowercases domain hostname
 * - strips default port numbers
 * - strips tracking parameters (utm_*, fbclid, etc.)
 */
export function normalizeUrl(urlString: string, stripTracking: boolean = true): string {
  try {
    const url = new URL(urlString);
    url.hash = ''; // strip fragment
    url.hostname = url.hostname.toLowerCase();

    // Remove default ports
    if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) {
      url.port = '';
    }

    if (stripTracking) {
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      trackingParams.forEach(param => {
        url.searchParams.delete(param);
      });
    }

    // Resolve double slashes in paths (excluding scheme prefix)
    let path = url.pathname.replace(/\/+/g, '/');
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    url.pathname = path;

    return url.toString();
  } catch {
    return urlString;
  }
}

/**
 * Resolves a relative link path against a base URL location.
 */
export function resolveRelativeUrl(relativeUrl: string, baseUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return relativeUrl;
  }
}
