/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  MapPin,
  Activity,
  Terminal,
  Info,
  ExternalLink,
  Search,
  AlertCircle,
  Network,
  Clock,
  ShieldCheck,
  Share2,
  Globe,
  Server,
  Wifi,
  Laptop,
  Download,
  Code2,
  Cpu,
  Layers
} from 'lucide-react';

export interface IPData {
  ip: string;
  type: 'IPv4' | 'IPv6';
  country?: string;
  countryCode?: string;
  countryFlag?: string;
  region?: string;
  city?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  org?: string;
  asn?: string;
  timezone?: string;
  localTime?: string;
  isProxyOrVpn?: boolean;
  raw?: any;
}

export interface DualStackStatus {
  ipv4: string | null;
  ipv6: string | null;
  checkingIpv6: boolean;
}

export interface PingBenchmarkResult {
  name: string;
  provider: string;
  url: string;
  latencyMs: number | null;
  status: 'pending' | 'testing' | 'success' | 'failed';
}

export interface DNSRecordItem {
  name: string;
  type: number;
  typeName: string;
  TTL: number;
  data: string;
}

export type ToolTab = 'overview' | 'fingerprint' | 'subnet' | 'ping' | 'dns' | 'cli';

export default function WhatsMyIP() {
  const [activeTab, setActiveTab] = useState<ToolTab>('overview');
  const [data, setData] = useState<IPData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Dual-Stack Status
  const [dualStack, setDualStack] = useState<DualStackStatus>({
    ipv4: null,
    ipv6: null,
    checkingIpv6: true
  });

  // WebRTC Leak Candidate Detection
  const [webrtcIps, setWebrtcIps] = useState<string[]>([]);
  const [webrtcScanning, setWebrtcScanning] = useState<boolean>(false);
  const [webrtcTested, setWebrtcTested] = useState<boolean>(false);

  // Custom IP / Domain Lookup State
  const [queryInput, setQueryInput] = useState<string>('');
  const [customResult, setCustomResult] = useState<IPData | null>(null);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Subnet / CIDR prefix for Calculator
  const [cidrPrefix, setCidrPrefix] = useState<number>(24);

  // Live Ping Benchmark State
  const [benchmarks, setBenchmarks] = useState<PingBenchmarkResult[]>([
    { name: 'Cloudflare DNS', provider: 'Anycast Edge', url: 'https://1.1.1.1/cdn-cgi/trace', latencyMs: null, status: 'pending' },
    { name: 'Google Public DNS', provider: 'Global Edge', url: 'https://dns.google/resolve?name=example.com', latencyMs: null, status: 'pending' },
    { name: 'Quad9 DNS', provider: 'Secure Anycast', url: 'https://dns.quad9.net:5053/dns-query?name=example.com', latencyMs: null, status: 'pending' },
    { name: 'Toolique Origin CDN', provider: 'Edge Relay', url: 'https://ipwho.is/', latencyMs: null, status: 'pending' }
  ]);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  // DNS Resolver State
  const [dnsDomain, setDnsDomain] = useState<string>('');
  const [dnsRecordType, setDnsRecordType] = useState<string>('A');
  const [dnsResults, setDnsResults] = useState<DNSRecordItem[]>([]);
  const [dnsLoading, setDnsLoading] = useState<boolean>(false);
  const [dnsError, setDnsError] = useState<string | null>(null);

  // Copy Feedback States
  const [copiedIp, setCopiedIp] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedCustom, setCopiedCustom] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Fetch Public IP and Geolocation with Multi-Source Fallbacks
  const fetchMyIP = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      // Primary: ipwho.is (CORS enabled, rich ASN, ISP, Geolocation, SSL, Free)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      let fetchedData: IPData | null = null;

      try {
        const res = await fetch('https://ipwho.is/', {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.success !== false && json.ip) {
            fetchedData = {
              ip: json.ip,
              type: json.type === 'IPv6' ? 'IPv6' : 'IPv4',
              country: json.country,
              countryCode: json.country_code,
              countryFlag: json.flag?.emoji || '🌐',
              region: json.region,
              city: json.city,
              postal: json.postal,
              latitude: json.latitude,
              longitude: json.longitude,
              isp: json.connection?.isp,
              org: json.connection?.org,
              asn: json.connection?.asn ? `AS${json.connection.asn}` : undefined,
              timezone: json.timezone?.id ? `${json.timezone.id} (${json.timezone.utc || ''})` : json.timezone?.id,
              localTime: json.timezone?.current_time,
              raw: json
            };
          }
        }
      } catch (e) {
        console.warn('Primary IP lookup endpoint failed, attempting fallback...', e);
      }

      // Fallback 1: ipapi.co
      if (!fetchedData) {
        try {
          const resFallback = await fetch('https://ipapi.co/json/', {
            headers: { Accept: 'application/json' }
          });
          if (resFallback.ok) {
            const json = await resFallback.json();
            if (json.ip && !json.error) {
              fetchedData = {
                ip: json.ip,
                type: json.version === 'IPv6' ? 'IPv6' : 'IPv4',
                country: json.country_name,
                countryCode: json.country_code,
                countryFlag: '🌐',
                region: json.region,
                city: json.city,
                postal: json.postal,
                latitude: json.latitude,
                longitude: json.longitude,
                isp: json.org,
                org: json.org,
                asn: json.asn,
                timezone: json.timezone ? `${json.timezone} (${json.utc_offset || ''})` : json.timezone,
                raw: json
              };
            }
          }
        } catch (e) {
          console.warn('Fallback 1 failed, attempting ipify...', e);
        }
      }

      // Fallback 2: api64.ipify.org (Dual-stack pure IP)
      if (!fetchedData) {
        const resIpify = await fetch('https://api64.ipify.org?format=json');
        if (resIpify.ok) {
          const json = await resIpify.json();
          if (json.ip) {
            const isV6 = json.ip.includes(':');
            fetchedData = {
              ip: json.ip,
              type: isV6 ? 'IPv6' : 'IPv4',
              countryFlag: '🌐'
            };
          }
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      if (fetchedData) {
        setData(fetchedData);
        setLastChecked(new Date());

        // Update Dual-Stack status
        if (fetchedData.type === 'IPv4') {
          setDualStack(prev => ({ ...prev, ipv4: fetchedData.ip }));
        } else {
          setDualStack(prev => ({ ...prev, ipv6: fetchedData.ip }));
        }
      } else {
        throw new Error('Unable to retrieve IP address. Please check your network connection or ad-blocker.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to detect IP address. Network request failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Probe IPv6 connectivity in background
  const probeIPv6 = useCallback(async () => {
    setDualStack(prev => ({ ...prev, checkingIpv6: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch('https://api64.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.ip && json.ip.includes(':')) {
          setDualStack(prev => ({ ...prev, ipv6: json.ip, checkingIpv6: false }));
          return;
        }
      }
    } catch {
      // IPv6 not supported or timeout
    }
    setDualStack(prev => ({ ...prev, checkingIpv6: false }));
  }, []);

  // WebRTC Local IP Leak Detection Test
  const testWebRTCLeak = useCallback(() => {
    setWebrtcScanning(true);
    setWebrtcTested(true);
    const discovered: Set<string> = new Set();

    try {
      const RTCPeer = (window as any).RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection;
      if (!RTCPeer) {
        setWebrtcScanning(false);
        return;
      }

      const pc = new RTCPeer({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');
      pc.createOffer().then((offer: any) => pc.setLocalDescription(offer)).catch(() => {});

      pc.onicecandidate = (event: any) => {
        if (!event || !event.candidate) {
          setWebrtcScanning(false);
          return;
        }
        const candidate = event.candidate.candidate;
        // Extract IP addresses from ICE candidate string
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/gi;
        const matches = candidate.match(ipRegex);
        if (matches) {
          matches.forEach((ip: string) => {
            if (!ip.endsWith('.local')) {
              discovered.add(ip);
            }
          });
          setWebrtcIps(Array.from(discovered));
        }
      };

      setTimeout(() => {
        setWebrtcScanning(false);
        try { pc.close(); } catch { /* ignore */ }
      }, 3500);
    } catch (e) {
      console.warn('WebRTC inspection not supported or blocked:', e);
      setWebrtcScanning(false);
    }
  }, []);

  useEffect(() => {
    fetchMyIP();
    probeIPv6();
  }, [fetchMyIP, probeIPv6]);

  // Lookup Custom IP / Domain
  const handleQueryCustomIP = async (ipToSearch?: string) => {
    const target = (ipToSearch || queryInput).trim();
    if (!target) return;

    setQueryLoading(true);
    setQueryError(null);
    setCustomResult(null);

    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(target)}`);
      if (!res.ok) throw new Error('Query request failed.');
      const json = await res.json();

      if (json.success === false) {
        throw new Error(json.message || `No data found for "${target}".`);
      }

      setCustomResult({
        ip: json.ip,
        type: json.type === 'IPv6' ? 'IPv6' : 'IPv4',
        country: json.country,
        countryCode: json.country_code,
        countryFlag: json.flag?.emoji || '🌐',
        region: json.region,
        city: json.city,
        postal: json.postal,
        latitude: json.latitude,
        longitude: json.longitude,
        isp: json.connection?.isp,
        org: json.connection?.org,
        asn: json.connection?.asn ? `AS${json.connection.asn}` : undefined,
        timezone: json.timezone?.id ? `${json.timezone.id} (${json.timezone.utc || ''})` : json.timezone?.id,
        localTime: json.timezone?.current_time,
        raw: json
      });
    } catch (err: any) {
      console.error(err);
      setQueryError(err.message || 'Failed to lookup IP address. Verify IP format.');
    } finally {
      setQueryLoading(false);
    }
  };

  // Run Global Ping Benchmark
  const runPingBenchmark = async () => {
    setIsBenchmarking(true);
    const updated = [...benchmarks];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'testing';
      setBenchmarks([...updated]);

      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        await fetch(updated[i].url, { mode: 'no-cors', signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeout);
        const duration = Math.round(performance.now() - start);
        updated[i].latencyMs = duration;
        updated[i].status = 'success';
      } catch {
        // Fallback calculation for no-cors
        const duration = Math.round(performance.now() - start);
        if (duration < 3900) {
          updated[i].latencyMs = duration;
          updated[i].status = 'success';
        } else {
          updated[i].status = 'failed';
          updated[i].latencyMs = null;
        }
      }
      setBenchmarks([...updated]);
    }
    setIsBenchmarking(false);
  };

  // Run DoH DNS Query
  const handleDnsLookup = async () => {
    if (!dnsDomain.trim()) return;
    setDnsLoading(true);
    setDnsError(null);
    setDnsResults([]);

    try {
      const typeNumMap: Record<string, number> = { A: 1, AAAA: 28, MX: 15, TXT: 16, NS: 2, CNAME: 5 };

      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(dnsDomain.trim())}&type=${dnsRecordType}`, {
        headers: { Accept: 'application/dns-json' }
      });

      if (!res.ok) throw new Error('DNS Query failed.');
      const json = await res.json();

      if (json.Answer && json.Answer.length > 0) {
        const mapped = json.Answer.map((a: any) => ({
          name: a.name,
          type: a.type,
          typeName: Object.keys(typeNumMap).find(k => typeNumMap[k] === a.type) || `Type ${a.type}`,
          TTL: a.TTL,
          data: a.data
        }));
        setDnsResults(mapped);
      } else {
        setDnsResults([]);
        setDnsError(`No ${dnsRecordType} records found for "${dnsDomain}".`);
      }
    } catch (err: any) {
      console.error(err);
      setDnsError(err.message || 'Failed to query DNS records.');
    } finally {
      setDnsLoading(false);
    }
  };

  // Copy IP Handler
  const handleCopyIP = (ipStr?: string) => {
    const targetIp = ipStr || data?.ip;
    if (!targetIp) return;
    navigator.clipboard.writeText(targetIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  // Copy All Information Manifest
  const handleCopyAll = () => {
    if (!data) return;
    const manifest = [
      `=== WHAT'S MY IP NETWORK MANIFEST ===`,
      `Public IP Address: ${data.ip}`,
      `IP Version: ${data.type}`,
      `Country: ${data.country || 'N/A'} (${data.countryCode || 'N/A'})`,
      `Region / State: ${data.region || 'N/A'}`,
      `City: ${data.city || 'N/A'}`,
      `Postal Code: ${data.postal || 'N/A'}`,
      `Approx Coordinates: ${data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : 'N/A'}`,
      `ISP: ${data.isp || 'N/A'}`,
      `Organization: ${data.org || 'N/A'}`,
      `ASN: ${data.asn || 'N/A'}`,
      `Timezone: ${data.timezone || 'N/A'}`,
      `Detected Latency: ${latencyMs ? `${latencyMs}ms` : 'N/A'}`,
      `Dual-Stack IPv6: ${dualStack.ipv6 || 'Not Available on this network'}`,
      `WebRTC Local IPs: ${webrtcIps.length > 0 ? webrtcIps.join(', ') : 'Shielded / No Private Leak'}`,
      `Timestamp: ${lastChecked?.toLocaleString() || new Date().toLocaleString()}`,
      `Audited with: Toolique What's My IP (https://toolique.in/developer/whats-my-ip)`
    ].join('\n');

    navigator.clipboard.writeText(manifest);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Download Diagnostic JSON Export
  const handleDownloadReport = () => {
    if (!data) return;
    const reportData = {
      meta: {
        generator: "Toolique What's My IP Network Studio",
        url: "https://toolique.in/developer/whats-my-ip",
        timestamp: new Date().toISOString()
      },
      publicIp: {
        ip: data.ip,
        version: data.type,
        dualStack: {
          ipv4: dualStack.ipv4,
          ipv6: dualStack.ipv6
        }
      },
      network: {
        isp: data.isp,
        organization: data.org,
        asn: data.asn,
        latencyMs: latencyMs
      },
      geolocation: {
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        city: data.city,
        postal: data.postal,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        timezone: data.timezone
      },
      browserEnvironment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}-bit)`
      },
      webrtcLeakStatus: {
        scanned: webrtcTested,
        detectedLocalIps: webrtcIps
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network_ip_report_${data.ip.replace(/[:.]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // IP Classification Helper
  const ipClassification = useMemo(() => {
    if (!data?.ip) return null;
    const ip = data.ip;

    if (ip.includes(':')) {
      if (ip === '::1') return { label: 'IPv6 Loopback', type: 'Special' };
      if (ip.toLowerCase().startsWith('fe80:')) return { label: 'IPv6 Link-Local', type: 'Private' };
      if (ip.toLowerCase().startsWith('fc00:') || ip.toLowerCase().startsWith('fd00:')) return { label: 'IPv6 Unique Local', type: 'Private' };
      return { label: 'Public Global IPv6 (Routable)', type: 'Public' };
    }

    // IPv4
    const parts = ip.split('.').map(Number);
    if (parts.length === 4) {
      if (parts[0] === 10) return { label: 'Private Class A (RFC 1918)', type: 'Private' };
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return { label: 'Private Class B (RFC 1918)', type: 'Private' };
      if (parts[0] === 192 && parts[1] === 168) return { label: 'Private Class C (RFC 1918)', type: 'Private' };
      if (parts[0] === 127) return { label: 'Loopback Host (127.0.0.1)', type: 'Special' };
      if (parts[0] === 169 && parts[1] === 254) return { label: 'Link-Local / APIPA', type: 'Private' };
      if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return { label: 'Carrier-Grade NAT (CGNAT / RFC 6598)', type: 'CGNAT' };
      if (parts[0] >= 224 && parts[0] <= 239) return { label: 'Multicast', type: 'Special' };
    }

    return { label: 'Public IPv4 (Internet Routable)', type: 'Public' };
  }, [data?.ip]);

  // Subnet and Binary Calculations for IPv4
  const subnetDetails = useMemo(() => {
    if (!data?.ip || data.type !== 'IPv4') return null;
    const parts = data.ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;

    // Integer conversion
    const ipInt = ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);

    // Binary string
    const binary = parts.map(p => p.toString(2).padStart(8, '0')).join('.');

    // Hex string
    const hex = '0x' + parts.map(p => p.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Reverse DNS Arpa
    const reverseDns = `${parts[3]}.${parts[2]}.${parts[1]}.${parts[0]}.in-addr.arpa`;

    // Subnet calculation with cidrPrefix
    const maskInt = cidrPrefix === 0 ? 0 : (~0 << (32 - cidrPrefix)) >>> 0;
    const maskParts = [
      (maskInt >>> 24) & 255,
      (maskInt >>> 16) & 255,
      (maskInt >>> 8) & 255,
      maskInt & 255
    ];
    const maskStr = maskParts.join('.');

    const wildcardParts = maskParts.map(p => 255 - p);
    const wildcardStr = wildcardParts.join('.');

    const networkInt = (ipInt & maskInt) >>> 0;
    const networkParts = [
      (networkInt >>> 24) & 255,
      (networkInt >>> 16) & 255,
      (networkInt >>> 8) & 255,
      networkInt & 255
    ];
    const networkStr = networkParts.join('.');

    const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
    const broadcastParts = [
      (broadcastInt >>> 24) & 255,
      (broadcastInt >>> 16) & 255,
      (broadcastInt >>> 8) & 255,
      broadcastInt & 255
    ];
    const broadcastStr = broadcastParts.join('.');

    const totalHosts = Math.pow(2, 32 - cidrPrefix);
    const usableHosts = cidrPrefix >= 31 ? (cidrPrefix === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    const firstHostInt = cidrPrefix >= 31 ? networkInt : networkInt + 1;
    const lastHostInt = cidrPrefix >= 31 ? broadcastInt : broadcastInt - 1;

    const firstHostStr = [
      (firstHostInt >>> 24) & 255,
      (firstHostInt >>> 16) & 255,
      (firstHostInt >>> 8) & 255,
      firstHostInt & 255
    ].join('.');

    const lastHostStr = [
      (lastHostInt >>> 24) & 255,
      (lastHostInt >>> 16) & 255,
      (lastHostInt >>> 8) & 255,
      lastHostInt & 255
    ].join('.');

    return {
      ipInt,
      binary,
      hex,
      reverseDns,
      maskStr,
      wildcardStr,
      networkStr,
      broadcastStr,
      totalHosts,
      usableHosts,
      firstHostStr,
      lastHostStr
    };
  }, [data?.ip, data?.type, cidrPrefix]);

  // Client System & Browser Specs
  const clientSpecs = useMemo(() => {
    const nav = typeof window !== 'undefined' ? window.navigator : ({} as any);
    const conn = (nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection || {};

    return {
      userAgent: nav.userAgent || 'Unknown',
      platform: nav.platform || 'Unknown',
      language: nav.language || 'en',
      languages: nav.languages ? nav.languages.join(', ') : nav.language,
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width} × ${window.screen.height}` : 'N/A',
      windowResolution: typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : 'N/A',
      pixelRatio: typeof window !== 'undefined' ? `${window.devicePixelRatio}x` : '1x',
      colorDepth: typeof window !== 'undefined' ? `${window.screen.colorDepth}-bit` : '24-bit',
      cores: nav.hardwareConcurrency ? `${nav.hardwareConcurrency} Cores` : 'N/A',
      deviceMemory: (nav as any).deviceMemory ? `${(nav as any).deviceMemory} GB` : 'N/A',
      connectionType: conn.effectiveType ? conn.effectiveType.toUpperCase() : 'Broadband / Wi-Fi',
      downlink: conn.downlink ? `${conn.downlink} Mbps` : 'N/A',
      rtt: conn.rtt ? `${conn.rtt} ms` : 'N/A',
      cookiesEnabled: nav.cookieEnabled ? 'Enabled' : 'Disabled',
      doNotTrack: nav.doNotTrack === '1' ? 'Enabled' : 'Not Set / Disabled',
      touchSupport: typeof window !== 'undefined' && ('ontouchstart' in window || nav.maxTouchPoints > 0) ? 'Touchscreen' : 'Mouse / Trackpad'
    };
  }, []);

  // CLI Snippets
  const cliSnippets = useMemo(() => {
    return [
      {
        lang: 'cURL (Terminal)',
        code: `curl -s https://ipwho.is/ | jq`
      },
      {
        lang: 'cURL Plain Text IP',
        code: `curl -s https://api64.ipify.org`
      },
      {
        lang: 'PowerShell (Windows)',
        code: `(Invoke-RestMethod -Uri "https://ipwho.is/").ip`
      },
      {
        lang: 'Python (requests)',
        code: `import requests\n\nres = requests.get('https://ipwho.is/').json()\nprint(f"IP: {res['ip']}, Country: {res['country']}, ISP: {res['connection']['isp']}")`
      },
      {
        lang: 'JavaScript / Node.js (fetch)',
        code: `fetch('https://ipwho.is/')\n  .then(res => res.json())\n  .then(data => console.log('Public IP:', data.ip, data.city));`
      },
      {
        lang: 'Go',
        code: `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n)\n\nfunc main() {\n\tresp, _ := http.Get("https://api64.ipify.org")\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Printf("Public IP: %s\\n", body)\n}`
      }
    ];
  }, []);

  const handleCopyCode = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(lang);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Answer Engine Optimization (AEO) Quick Answer Box */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p className="font-bold text-zinc-900 dark:text-white text-sm">
            What is my public IP address?
          </p>
          <p className="leading-relaxed">
            Your <strong>public IP address</strong> is the globally unique numerical identifier assigned to your internet router or device by your Internet Service Provider (ISP). Remote web servers, APIs, and cloud services use this address to route bidirectional network packets back to your machine.
          </p>
        </div>
      </div>

      {/* Hero Public IP Card */}
      <div className="saas-card p-6 sm:p-8 bg-gradient-to-br from-white via-indigo-50/20 to-zinc-50 dark:from-zinc-900 dark:via-indigo-950/10 dark:to-zinc-900 border-2 border-indigo-500/30 dark:border-indigo-500/20 shadow-lg relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
                Your Public IP
              </span>
              {data?.type && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {data.type}
                </span>
              )}
              {ipClassification && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {ipClassification.label}
                </span>
              )}
              {latencyMs !== null && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  {latencyMs} ms
                </span>
              )}
            </div>

            {/* Main Detected IP Value */}
            {loading ? (
              <div className="flex items-center gap-3 py-2">
                <RefreshCw className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-xl sm:text-2xl font-mono text-zinc-400">Detecting public IP...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 py-1 font-semibold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-white break-all select-all">
                  {data?.ip}
                </h2>
                {data?.city && data?.country && (
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1.5 pt-0.5">
                    <span>{data.countryFlag}</span>
                    <span>{data.city}, {data.region}, {data.country}</span>
                    {data.isp && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                        <span className="text-zinc-500 truncate max-w-xs">{data.isp}</span>
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => handleCopyIP()}
              disabled={loading || !data?.ip}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {copiedIp ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedIp ? 'IP Copied!' : 'Copy IP'}</span>
            </button>

            <button
              onClick={handleCopyAll}
              disabled={loading || !data?.ip}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Copy formatted network details manifest"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedAll ? 'Details Copied!' : 'Copy Details'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              disabled={loading || !data?.ip}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition disabled:opacity-50 cursor-pointer shadow-xs"
              title="Export Network Report (.json)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={fetchMyIP}
              disabled={loading}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition disabled:opacity-50 cursor-pointer"
              title="Re-check IP address"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Footer info strip */}
        {lastChecked && (
          <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last detected: {lastChecked.toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% In-Browser Direct Lookup &bull; Zero Server Logging
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800 no-scrollbar">
        {[
          { id: 'overview', label: 'Network & Location', icon: Globe },
          { id: 'fingerprint', label: 'Client & WebRTC Audit', icon: ShieldCheck },
          { id: 'subnet', label: 'Binary & Subnet CIDR', icon: Cpu },
          { id: 'ping', label: 'Global Ping Benchmark', icon: Activity },
          { id: 'dns', label: 'DNS-over-HTTPS Resolver', icon: Server },
          { id: 'cli', label: 'Developer CLI Snippets', icon: Code2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ToolTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & GEOLOCATION */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dual-Stack IPv4 & IPv6 Readiness Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* IPv4 Status */}
            <div className="saas-card p-4 flex items-center justify-between gap-3 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs">
                  IPv4
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">IPv4 Connectivity</p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {data?.type === 'IPv4' ? data.ip : dualStack.ipv4 || 'Standard IPv4 detected'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            {/* IPv6 Status */}
            <div className="saas-card p-4 flex items-center justify-between gap-3 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs">
                  IPv6
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">IPv6 Connectivity</p>
                  <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[200px]">
                    {data?.type === 'IPv6'
                      ? data.ip
                      : dualStack.ipv6
                      ? dualStack.ipv6
                      : dualStack.checkingIpv6
                      ? 'Probing IPv6 stack...'
                      : 'Not Supported / IPv4 Only'}
                  </p>
                </div>
              </div>
              {data?.type === 'IPv6' || dualStack.ipv6 ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-semibold shrink-0">
                  Unavailable
                </span>
              )}
            </div>
          </div>

          {/* Network & Approximate Location Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Network & ISP Information */}
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Network & Internet Provider
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Internet Service Provider (ISP)</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[220px]">
                    {data?.isp || 'Not Disclosed'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Autonomous System (ASN)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {data?.asn || 'Unknown ASN'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Network Organization</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[220px]">
                    {data?.org || data?.isp || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">IP Protocol Standard</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {data?.type === 'IPv6' ? 'IPv6 (128-bit Address)' : 'IPv4 (32-bit Address)'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Round-Trip Latency</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {latencyMs ? `${latencyMs} ms` : 'Measuring...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Approximate Geolocation */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Approximate Geolocation
                </h3>
                <span className="text-[10px] text-zinc-400 font-semibold">IP-Based Centroid</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Country</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>{data?.countryFlag}</span>
                    <span>{data?.country || 'Unknown'} ({data?.countryCode || 'N/A'})</span>
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Region / State</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {data?.region || 'Not Disclosed'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">City</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {data?.city || 'Not Disclosed'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Postal / ZIP Code</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {data?.postal || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Time Zone</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {data?.timezone || 'N/A'}
                  </span>
                </div>

                {data?.latitude && data?.longitude && (
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 font-medium">Coordinates</span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=12/${data.latitude}/${data.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive OpenStreetMap Embed */}
          {data?.latitude && data?.longitude && (
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Centroid Geographic Map Preview</span>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=13/${data.latitude}/${data.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Screen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full h-64 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative bg-zinc-100 dark:bg-zinc-900">
                <iframe
                  title="OpenStreetMap Location"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude - 0.08}%2C${data.latitude - 0.05}%2C${data.longitude + 0.08}%2C${data.latitude + 0.05}&layer=mapnik&marker=${data.latitude}%2C${data.longitude}`}
                  className="border-0"
                />
              </div>
            </div>
          )}

          {/* Custom IP & Domain Geolocation Inspector */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Inspect Any IP Address or Domain
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Enter an arbitrary IPv4, IPv6, or domain name to check its ASN, ISP, and geographic origin.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-medium text-[11px]">Popular:</span>
                {[
                  { label: 'Cloudflare (1.1.1.1)', ip: '1.1.1.1' },
                  { label: 'Google (8.8.8.8)', ip: '8.8.8.8' },
                  { label: 'Quad9 (9.9.9.9)', ip: '9.9.9.9' }
                ].map((p) => (
                  <button
                    key={p.ip}
                    onClick={() => {
                      setQueryInput(p.ip);
                      handleQueryCustomIP(p.ip);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQueryCustomIP();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Terminal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. 8.8.8.8, 1.1.1.1, or 2606:4700:4700::1111"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={queryLoading || !queryInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
              >
                {queryLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Lookup IP</span>
              </button>
            </form>

            {queryError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{queryError}</span>
              </div>
            )}

            {/* Custom Query Results Card */}
            {customResult && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                      {customResult.ip}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                      {customResult.type}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customResult.ip);
                      setCopiedCustom(true);
                      setTimeout(() => setCopiedCustom(false), 2000);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCustom ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCustom ? 'Copied!' : 'Copy IP'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Location</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                      {customResult.countryFlag} {customResult.city || customResult.country || 'N/A'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">ISP</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                      {customResult.isp || 'N/A'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">ASN</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                      {customResult.asn || 'N/A'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Timezone</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                      {customResult.timezone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT FINGERPRINT & WEBRTC LEAK AUDIT */}
      {activeTab === 'fingerprint' && (
        <div className="space-y-6">
          {/* WebRTC Leak Test Box */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  WebRTC Local IP Leak Detection Test
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  WebRTC can sometimes leak your internal private LAN IP address (`192.168.x.x` or `10.x.x.x`) to websites even if you use a VPN.
                </p>
              </div>

              <button
                onClick={testWebRTCLeak}
                disabled={webrtcScanning}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${webrtcScanning ? 'animate-spin' : ''}`} />
                <span>{webrtcScanning ? 'Scanning WebRTC...' : 'Run WebRTC Leak Audit'}</span>
              </button>
            </div>

            {webrtcTested ? (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2">
                  {webrtcIps.length === 0 ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Protected &bull; No Private LAN Leak Detected
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Candidate Local IPs Exposed: {webrtcIps.join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {webrtcIps.length === 0
                    ? 'Your browser successfully shielded private IP candidates via mDNS or WebRTC privacy settings.'
                    : 'Your browser emitted the local IP candidates above through STUN ICE negotiation.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">Click "Run WebRTC Leak Audit" to probe STUN candidates and verify local network isolation.</p>
            )}
          </div>

          {/* Client Telemetry & Browser Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System & Hardware */}
            <div className="saas-card p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Browser & Device Environment
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">OS Platform</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.platform}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Screen Resolution</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.screenResolution}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Viewport Window</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.windowResolution}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Pixel Ratio / Depth</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.pixelRatio} ({clientSpecs.colorDepth})</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">CPU Logic Cores</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.cores}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Device RAM Memory</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.deviceMemory}</span>
                </div>
              </div>
            </div>

            {/* Network & Privacy Headers */}
            <div className="saas-card p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Wifi className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Network Connection & Privacy Flags
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Connection Effective Type</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.connectionType}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Downlink Bandwidth</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.downlink}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Client Preferred Languages</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{clientSpecs.languages}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Do Not Track (DNT)</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.doNotTrack}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Cookies Storage</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.cookiesEnabled}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-medium">Input Interaction</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{clientSpecs.touchSupport}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BINARY, HEX & SUBNET CIDR CALCULATOR */}
      {activeTab === 'subnet' && (
        <div className="space-y-6">
          {subnetDetails ? (
            <div className="space-y-6">
              {/* Encoding Conversions */}
              <div className="saas-card p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Address Formats & Binary Representations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">32-Bit Binary String</span>
                    <p className="font-mono font-bold text-zinc-900 dark:text-white break-all">{subnetDetails.binary}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Decimal / Integer (INET_ATON)</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{subnetDetails.ipInt}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Hexadecimal</span>
                    <p className="font-mono font-bold text-zinc-900 dark:text-white">{subnetDetails.hex}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Reverse DNS PTR String</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{subnetDetails.reverseDns}</p>
                  </div>
                </div>
              </div>

              {/* Subnet CIDR Range Calculator */}
              <div className="saas-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Subnet & CIDR Mask Calculator
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Calculate subnet ranges, usable hosts, and broadcast addresses for this IP.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Prefix CIDR:</span>
                    <select
                      value={cidrPrefix}
                      onChange={(e) => setCidrPrefix(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                    >
                      {Array.from({ length: 32 }, (_, i) => 32 - i).map(c => (
                        <option key={c} value={c}>/{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Subnet Mask</span>
                    <p className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5">{subnetDetails.maskStr}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Wildcard Mask</span>
                    <p className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5">{subnetDetails.wildcardStr}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Network Address</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{subnetDetails.networkStr}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Broadcast Address</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{subnetDetails.broadcastStr}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 font-medium">Usable Host Range:</span>
                    <p className="font-mono font-bold text-zinc-900 dark:text-white">
                      {subnetDetails.firstHostStr} &mdash; {subnetDetails.lastHostStr}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 font-medium">Total Usable Host IPs:</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {subnetDetails.usableHosts.toLocaleString()} hosts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="saas-card p-6 text-center text-zinc-500 text-xs">
              Subnet CIDR calculator is available for active IPv4 address topologies.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE GLOBAL PING BENCHMARK */}
      {activeTab === 'ping' && (
        <div className="saas-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Multi-Edge Latency Benchmark
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Measure round-trip ping time to major global edge nodes and public DNS resolvers.
              </p>
            </div>

            <button
              onClick={runPingBenchmark}
              disabled={isBenchmarking}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin' : ''}`} />
              <span>{isBenchmarking ? 'Testing Latencies...' : 'Start Ping Benchmark'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {benchmarks.map((b) => (
              <div key={b.name} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{b.name}</p>
                  <p className="text-[11px] text-zinc-500 font-medium">{b.provider}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {b.status === 'testing' ? (
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Ping...
                    </span>
                  ) : b.status === 'success' && b.latencyMs !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${b.latencyMs < 50 ? 'bg-emerald-500' : b.latencyMs < 120 ? 'bg-teal-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, Math.max(10, (b.latencyMs / 300) * 100))}%` }}
                        />
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold ${
                        b.latencyMs < 50 ? 'bg-emerald-500/10 text-emerald-600' : b.latencyMs < 120 ? 'bg-teal-500/10 text-teal-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {b.latencyMs} ms
                      </span>
                    </div>
                  ) : b.status === 'failed' ? (
                    <span className="text-xs text-red-500 font-semibold">Timeout / Blocked</span>
                  ) : (
                    <span className="text-xs text-zinc-400">Ready</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DNS-OVER-HTTPS RESOLVER */}
      {activeTab === 'dns' && (
        <div className="saas-card p-6 space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              DNS-over-HTTPS (DoH) Record Resolver
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Query live DNS records (A, AAAA, MX, TXT, NS, CNAME) directly via encrypted Cloudflare DoH APIs.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDnsLookup();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Enter domain name (e.g. google.com, toolique.in)"
                value={dnsDomain}
                onChange={(e) => setDnsDomain(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={dnsRecordType}
              onChange={(e) => setDnsRecordType(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
            >
              <option value="A">A (IPv4)</option>
              <option value="AAAA">AAAA (IPv6)</option>
              <option value="MX">MX (Mail Servers)</option>
              <option value="TXT">TXT (SPF / DMARC)</option>
              <option value="NS">NS (Name Servers)</option>
              <option value="CNAME">CNAME (Aliases)</option>
            </select>

            <button
              type="submit"
              disabled={dnsLoading || !dnsDomain.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {dnsLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Query DNS</span>
            </button>
          </form>

          {dnsError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dnsError}</span>
            </div>
          )}

          {dnsResults.length > 0 && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-bold uppercase text-[10px]">
                    <th className="p-2.5">Domain Record</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">TTL</th>
                    <th className="p-2.5">Value / Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {dnsResults.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-2.5 font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">{r.name}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                          {r.typeName}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-zinc-500">{r.TTL}s</td>
                      <td className="p-2.5 font-mono text-zinc-900 dark:text-white break-all font-semibold">{r.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DEVELOPER CLI SNIPPETS */}
      {activeTab === 'cli' && (
        <div className="saas-card p-6 space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Terminal Commands & Developer Code Snippets
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Copy ready-to-run terminal commands and programming snippets to fetch public IP in your code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cliSnippets.map((s) => (
              <div key={s.lang} className="p-4 rounded-xl bg-zinc-900 text-zinc-100 space-y-2 border border-zinc-800 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">{s.lang}</span>
                  <button
                    onClick={() => handleCopyCode(s.code, s.lang)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSnippet === s.lang ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === s.lang ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-xs font-mono bg-black/40 p-2.5 rounded-lg overflow-x-auto text-emerald-400">
                  <code>{s.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Guarantee Card */}
      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
          <p className="font-bold text-zinc-900 dark:text-white">Toolique Privacy Guarantee</p>
          <p className="leading-relaxed">
            Toolique does not store, log, track, or share your IP address in cookies, localStorage, or application databases. The lookup query is processed in-memory directly between your browser and public CORS lookup APIs.
          </p>
        </div>
      </div>
    </div>
  );
}
