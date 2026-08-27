import { 
  Cpu, Eye, EyeOff, ShieldCheck, Check, Copy, Printer, Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';

import { useState, useEffect, useMemo } from 'react';

// --- Interfaces & Types ---
interface ClaimMetadata {
  key: string;
  name: string;
  meaning: string;
  value: any;
  formatted: string;
  status: 'valid' | 'invalid' | 'expired' | 'warning' | 'info';
}

interface SecurityIssue {
  type: 'critical' | 'warning' | 'info' | 'good';
  title: string;
  description: string;
}

// --- Registered Claims Metadata Table ---
const REGISTERED_CLAIMS_INFO: Record<string, { name: string; meaning: string }> = {
  iss: { name: 'Issuer', meaning: 'Identifies the principal that issued the JWT.' },
  sub: { name: 'Subject', meaning: 'Identifies the principal that is the subject of the JWT.' },
  aud: { name: 'Audience', meaning: 'Identifies the recipients that the JWT is intended for.' },
  exp: { name: 'Expiration Time', meaning: 'Identifies the expiration time on or after which the JWT must not be accepted.' },
  nbf: { name: 'Not Before', meaning: 'Identifies the time before which the JWT must not be accepted.' },
  iat: { name: 'Issued At', meaning: 'Identifies the time at which the JWT was issued.' },
  jti: { name: 'JWT ID', meaning: 'Provides a unique identifier for the JWT.' },
  azp: { name: 'Authorized Party', meaning: 'The party to which the ID Token was issued.' },
  scope: { name: 'Scope', meaning: 'Scope privileges list associated with the token.' },
  roles: { name: 'Roles', meaning: 'Authorization roles granted to the subject.' },
  permissions: { name: 'Permissions', meaning: 'Specific policy permissions allowed.' }
};

// --- Sample JWT Presets ---
const SAMPLE_JWT_HS256 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const SAMPLE_JWT_EXPIRED = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.h7_F0fW7hQ9qQZ2eE6U_Z3c5Y5yY7u_1_2_3_4_5_6_7';
const SAMPLE_JWT_RS256 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1hcnkgSmFuZSIsImF1ZCI6Im15LWFwaSIsImlzcyI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzIwMDAwMDAwLCJleHAiOjE3MjAwMDM2MDB9.s123_signature_placeholder_abc';

export default function JWTDecoder() {
  const [activeTab, setActiveTab] = useState<'decode' | 'encode' | 'compare' | 'playground'>('decode');

  // Common State
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT_HS256);
  
  // Safe Screenshot masking toggle
  const [maskPII, setMaskPII] = useState<boolean>(false);
  
  // Custom Validation rules (Issuer/Audience)
  const [expectedIssuer, setExpectedIssuer] = useState<string>('https://api.example.com');
  const [expectedAudience, setExpectedAudience] = useState<string>('my-api');
  
  // Generator Inputs
  const [genHeader, setGenHeader] = useState<string>(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [genPayload, setGenPayload] = useState<string>(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }, null, 2));
  const [genSecret, setGenSecret] = useState<string>('your-256-bit-secret');
  const [generatedJWT, setGeneratedJWT] = useState<string>('');

  // Compare Mode State
  const [tokenA, setTokenA] = useState<string>(SAMPLE_JWT_HS256);
  const [tokenB, setTokenB] = useState<string>(SAMPLE_JWT_RS256);

  // Copy status indicators
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Helper Base64url Encoder/Decoders
  const base64UrlEncode = (str: string) => {
    try {
      const base64 = btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        })
      );
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch {
      return '';
    }
  };

  const base64UrlDecode = (str: string) => {
    try {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return '';
    }
  };

  // --- PARSE ENCODED TOKEN STRUCTURE ---
  const tokenStructure = useMemo(() => {
    const trimmed = tokenInput.trim();
    if (!trimmed) return null;

    const segments = trimmed.split('.');
    const segmentCount = segments.length;
    const isValidStructure = segmentCount === 3;

    let headerJson: any = null;
    let payloadJson: any = null;
    let signatureRaw = '';
    let decodeError: string | null = null;

    if (segmentCount >= 1 && segments[0]) {
      try {
        headerJson = JSON.parse(base64UrlDecode(segments[0]));
      } catch {
        decodeError = 'Header segment is not valid base64url encoded JSON.';
      }
    }
    if (segmentCount >= 2 && segments[1]) {
      try {
        payloadJson = JSON.parse(base64UrlDecode(segments[1]));
      } catch {
        decodeError = 'Payload segment is not valid base64url encoded JSON.';
      }
    }
    if (segmentCount >= 3) {
      signatureRaw = segments[2];
    }

    return {
      isValidStructure,
      segmentCount,
      header: headerJson,
      payload: payloadJson,
      signature: signatureRaw,
      segments,
      decodeError
    };
  }, [tokenInput]);

  // --- CLAIMS INTELLIGENCE PARSER ---
  const claimsIntelligence = useMemo(() => {
    if (!tokenStructure || !tokenStructure.payload) return [];

    const payload = tokenStructure.payload;
    const list: ClaimMetadata[] = [];
    const nowSecs = Math.floor(Date.now() / 1000);

    Object.keys(payload).forEach((key) => {
      const val = payload[key];
      const isReg = REGISTERED_CLAIMS_INFO[key];
      if (!isReg) return;

      let formatted = String(val);
      let status: 'valid' | 'invalid' | 'expired' | 'warning' | 'info' = 'info';

      if (['exp', 'iat', 'nbf'].includes(key) && typeof val === 'number') {
        const dateObj = new Date(val * 1000);
        formatted = dateObj.toLocaleString('en-IN');

        if (key === 'exp') {
          const expired = val < nowSecs;
          status = expired ? 'expired' : 'valid';
          formatted += expired ? ' (Expired)' : ' (Active)';
        } else if (key === 'nbf') {
          const notActiveYet = val > nowSecs;
          status = notActiveYet ? 'warning' : 'valid';
          formatted += notActiveYet ? ' (Not Active Yet)' : ' (Valid)';
        } else if (key === 'iat') {
          status = val > nowSecs ? 'warning' : 'valid';
        }
      }

      list.push({
        key,
        name: isReg.name,
        meaning: isReg.meaning,
        value: val,
        formatted,
        status
      });
    });

    return list;
  }, [tokenStructure]);

  // --- SECURITY ANALYZER SCORING ---
  const securityAnalysis = useMemo(() => {
    if (!tokenStructure) return null;

    const issues: SecurityIssue[] = [];
    let score = 100;

    const header = tokenStructure.header || {};
    const payload = tokenStructure.payload || {};

    // 1. Check alg claim
    const alg = header.alg;
    if (!alg) {
      score -= 30;
      issues.push({
        type: 'critical',
        title: 'Missing Algorithm Claim (alg)',
        description: 'The header does not contain a signature algorithm claim, leaving the token vulnerable to parsing bypasses.'
      });
    } else if (alg.toLowerCase() === 'none') {
      score -= 50;
      issues.push({
        type: 'critical',
        title: 'Algorithm set to "none"',
        description: 'Unsigned tokens permit signature bypass. Ensure production services reject "none" algorithm tokens.'
      });
    } else {
      issues.push({
        type: 'good',
        title: `Algorithm verified: ${alg}`,
        description: 'Token specifies a standard algorithm for signature verification.'
      });
    }

    // 2. Check exp claim
    const exp = payload.exp;
    const nowSecs = Math.floor(Date.now() / 1000);
    if (!exp) {
      score -= 20;
      issues.push({
        type: 'warning',
        title: 'Missing Expiration (exp)',
        description: 'Without an expiration time, the token remains valid indefinitely, posing high risks if leaked.'
      });
    } else {
      if (exp < nowSecs) {
        issues.push({
          type: 'critical',
          title: 'Token is Expired',
          description: `The token expired at ${new Date(exp * 1000).toLocaleString('en-IN')}. Reject authentication.`
        });
      } else {
        const lifetime = exp - (payload.iat || nowSecs);
        if (lifetime > 86400 * 30) {
          score -= 10;
          issues.push({
            type: 'warning',
            title: 'Excessively Long Expiry Duration',
            description: `The token is valid for ${(lifetime / 86400).toFixed(1)} days. Keep production tokens under 24 hours.`
          });
        }
      }
    }

    // 3. Scan for sensitive data leak in payload keys
    const sensitiveKeys = ['password', 'passwd', 'secret', 'token', 'access_key', 'private', 'card', 'cvv', 'pan', 'aadhaar'];
    const payloadKeys = Object.keys(payload);
    const leakedKeys = payloadKeys.filter(k => sensitiveKeys.some(s => k.toLowerCase().includes(s)));

    if (leakedKeys.length > 0) {
      score -= 15;
      issues.push({
        type: 'warning',
        title: 'Sensitive Data Keys Detected',
        description: `Potential sensitive fields [${leakedKeys.join(', ')}] found in payload. Do not expose secrets in JWT payloads.`
      });
    }

    // 4. Validate issuer and audience expectations
    if (payload.iss && expectedIssuer && payload.iss !== expectedIssuer) {
      issues.push({
        type: 'info',
        title: 'Issuer Mismatch',
        description: `Expected: ${expectedIssuer}, Token Issuer: ${payload.iss}`
      });
    }
    if (payload.aud && expectedAudience && payload.aud !== expectedAudience) {
      issues.push({
        type: 'info',
        title: 'Audience Mismatch',
        description: `Expected: ${expectedAudience}, Token Audience: ${payload.aud}`
      });
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }, [tokenStructure, expectedIssuer, expectedAudience]);

  // --- MASKED PAYLOAD (FOR SAFE SCREENSHOT MODE) ---
  const maskedPayloadStr = useMemo(() => {
    if (!tokenStructure || !tokenStructure.payload) return '';

    const payload = { ...tokenStructure.payload };
    if (!maskPII) return JSON.stringify(payload, null, 2);

    const maskKeys = ['email', 'phone', 'secret', 'password', 'token', 'pan', 'aadhaar', 'name'];
    Object.keys(payload).forEach((key) => {
      if (maskKeys.some(mk => key.toLowerCase().includes(mk))) {
        const valStr = String(payload[key]);
        if (valStr.length > 4) {
          payload[key] = valStr.slice(0, 2) + '*'.repeat(valStr.length - 4) + valStr.slice(-2);
        } else {
          payload[key] = '***';
        }
      }
    });

    return JSON.stringify(payload, null, 2);
  }, [tokenStructure, maskPII]);

  // --- GENERATOR LOGIC ---
  useEffect(() => {
    if (activeTab !== 'playground' && activeTab !== 'encode') return;

    try {
      const headerObj = JSON.parse(genHeader);
      const payloadObj = JSON.parse(genPayload);

      const headerB64 = base64UrlEncode(JSON.stringify(headerObj));
      const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));

      // Signing HMAC-SHA256 locally
      const unsigned = `${headerB64}.${payloadB64}`;
      const textEncoder = new TextEncoder();
      const secretBytes = textEncoder.encode(genSecret);
      const messageBytes = textEncoder.encode(unsigned);

      window.crypto.subtle.importKey(
        'raw',
        secretBytes,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(key => {
        return window.crypto.subtle.sign('HMAC', key, messageBytes);
      }).then(signature => {
        const sigBytes = new Uint8Array(signature);
        let binaryStr = '';
        sigBytes.forEach(b => binaryStr += String.fromCharCode(b));
        const sigB64 = btoa(binaryStr)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');

        setGeneratedJWT(`${unsigned}.${sigB64}`);
      }).catch(() => {
        setGeneratedJWT('Signing Failed (Check crypto runtime)');
      });
    } catch {
      setGeneratedJWT('Invalid Input JSON Syntax');
    }
  }, [genHeader, genPayload, genSecret, activeTab]);

  // --- TOKENS SIDE-BY-SIDE DIFFERENCES ---
  const tokensComparison = useMemo(() => {
    if (activeTab !== 'compare') return null;

    const parseSegments = (tokStr: string) => {
      const segments = tokStr.trim().split('.');
      if (segments.length !== 3) return null;
      try {
        return {
          header: JSON.parse(base64UrlDecode(segments[0])),
          payload: JSON.parse(base64UrlDecode(segments[1]))
        };
      } catch {
        return null;
      }
    };

    const pA = parseSegments(tokenA);
    const pB = parseSegments(tokenB);

    if (!pA || !pB) return null;

    // Diff payload fields
    const allKeys = Array.from(new Set([...Object.keys(pA.payload), ...Object.keys(pB.payload)]));
    const payloadDiffs = allKeys.map((key) => {
      const valA = pA.payload[key];
      const valB = pB.payload[key];
      const matches = JSON.stringify(valA) === JSON.stringify(valB);
      return {
        key,
        valA: valA === undefined ? '(Missing)' : JSON.stringify(valA),
        valB: valB === undefined ? '(Missing)' : JSON.stringify(valB),
        matches
      };
    });

    return {
      algA: pA.header.alg || 'none',
      algB: pB.header.alg || 'none',
      payloadDiffs
    };
  }, [tokenA, tokenB, activeTab]);

  // --- API Request Code Snippets ---
  const apiSnippets = useMemo(() => {
    const trimmed = tokenInput.trim();
    return {
      curl: `curl -H "Authorization: Bearer ${trimmed.slice(0, 15)}..." https://api.example.com/protected`,
      javascript: `fetch('https://api.example.com/protected', {\n  headers: {\n    'Authorization': 'Bearer ${trimmed.slice(0, 15)}...'\n  }\n});`,
      python: `import requests\nheaders = {'Authorization': 'Bearer ${trimmed.slice(0, 15)}...'}\nresponse = requests.get('https://api.example.com/protected', headers=headers)`
    };
  }, [tokenInput]);

  // --- Exporters ---
  const copyReport = () => {
    if (!tokenStructure) return;
    const text = `JWT Audit Debug Report (Toolique)
----------------------------------------------
Header          : ${JSON.stringify(tokenStructure.header, null, 2)}
Algorithm       : ${tokenStructure.header?.alg || 'none'}
Expiration      : ${new Date(tokenStructure.payload?.exp * 1000).toLocaleString('en-IN')}
----------------------------------------------
Security Score  : ${securityAnalysis?.score || 0} / 100
Issues Detected : ${securityAnalysis?.issues.length || 0}`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>JWT Debug Report - Toolique</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #333; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 10px; }
            pre { bg: #f5f5f5; padding: 10px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <h2>JWT Token Debug Sheet</h2>
          <h3>Header:</h3>
          <pre>${JSON.stringify(tokenStructure?.header, null, 2)}</pre>
          <h3>Payload:</h3>
          <pre>${JSON.stringify(tokenStructure?.payload, null, 2)}</pre>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // slate-900 theme color
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('JWT COMPILATION AUDIT REPORT', 15, 22);
    doc.setFontSize(10);
    doc.text('Decoded Payload and Cryptographic Signature Claims — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Token Headers metadata', 15, 52);
    doc.setFontSize(9);
    doc.text(JSON.stringify(tokenStructure?.header || {}, null, 2), 15, 60);

    doc.setFontSize(12);
    doc.text('Decoded Payload claims', 15, 110);
    doc.setFontSize(9);
    doc.text(JSON.stringify(tokenStructure?.payload || {}, null, 2), 15, 118);

    doc.save(`JWT_Debug_Sheet_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">JWT Decoder & Debugger</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Verify claim details, timelines, algorithm strength, and local signature checks</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setTokenInput(SAMPLE_JWT_HS256);
            }}
            className="text-[9px] font-black text-teal-700 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 px-2.5 py-1 rounded"
          >
            Load HS256
          </button>
          <button
            onClick={() => {
              setTokenInput(SAMPLE_JWT_EXPIRED);
            }}
            className="text-[9px] font-black text-teal-700 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 px-2.5 py-1 rounded"
          >
            Load Expired
          </button>
          <button
            onClick={() => {
              setTokenInput(SAMPLE_JWT_RS256);
            }}
            className="text-[9px] font-black text-teal-700 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 px-2.5 py-1 rounded"
          >
            Load RS256
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('decode')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'decode' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          JWT Decoder & Analyzer
        </button>
        <button
          onClick={() => setActiveTab('encode')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'encode' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          JWT Encoder / Signer
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'compare' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Compare Tokens
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'playground' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          JWT Live Playground
        </button>
      </div>

      {/* WORKSPACE MODE: DECODE */}
      {activeTab === 'decode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: pasted encoded token */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider block border-b pb-2">Encoded Token Payload</h3>
              
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste encoded JWT token (header.payload.signature)..."
                className="w-full h-80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-mono break-all focus:outline-none focus:border-teal-500"
              />

              <div className="flex justify-between items-center text-xs">
                {tokenStructure?.isValidStructure ? (
                  <span className="text-emerald-500 font-bold">✓ Valid 3-segment JWT Structure</span>
                ) : (
                  <span className="text-rose-500 font-bold">⚠️ Invalid segment count ({tokenStructure?.segmentCount || 0})</span>
                )}
                <button
                  onClick={() => setTokenInput('')}
                  className="text-zinc-400 hover:text-zinc-600 font-bold"
                >
                  Clear Fields
                </button>
              </div>
            </div>

            {/* Expected target validation fields */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider block">Claims Validators</h3>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">Expected Issuer (iss)</label>
                  <input type="text" value={expectedIssuer} onChange={(e) => setExpectedIssuer(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">Expected Audience (aud)</label>
                  <input type="text" value={expectedAudience} onChange={(e) => setExpectedAudience(e.target.value)} className="w-full p-2 border rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: decoded values visualizers */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visual color segment layout bar */}
            {tokenStructure && (
              <div className="p-5 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">JWT Component Segmentation</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMaskPII(!maskPII)}
                      className="text-[9px] font-bold px-2 py-1 bg-zinc-900 border rounded flex items-center gap-1.5"
                    >
                      {maskPII ? <EyeOff className="w-3 h-3 text-rose-400" /> : <Eye className="w-3 h-3" />}
                      <span>{maskPII ? 'Masking Active' : 'Safe Screenshot'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono break-all leading-normal">
                  <span className="text-rose-450 font-bold bg-rose-500/10 p-0.5 rounded">{tokenStructure.segments[0]}</span>
                  <span className="text-zinc-650">.</span>
                  <span className="text-teal-400 font-bold bg-teal-500/10 p-0.5 rounded">{tokenStructure.segments[1]?.slice(0, 40)}...</span>
                  <span className="text-zinc-650">.</span>
                  <span className="text-amber-450 font-bold bg-amber-500/10 p-0.5 rounded">{tokenStructure.segments[2]?.slice(0, 15)}...</span>
                </div>
              </div>
            )}

            {/* Tabs for inspecting sections */}
            {tokenStructure && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Header Inspect */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest block border-b pb-2">Header Configuration</h4>
                  <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl overflow-x-auto">
                    {JSON.stringify(tokenStructure.header, null, 2)}
                  </pre>
                </div>

                {/* Payload JSON Inspector */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-teal-600 uppercase tracking-widest block border-b pb-2">Payload Data Claims</h4>
                  <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl overflow-x-auto">
                    {maskedPayloadStr}
                  </pre>
                </div>

                {/* Claims intelligence grid */}
                {claimsIntelligence.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-indigo-650 uppercase tracking-widest block border-b pb-2">Decoded Claims Meanings</h4>
                    <div className="divide-y text-xs">
                      {claimsIntelligence.map((c) => (
                        <div key={c.key} className="py-2.5 flex justify-between items-start gap-4">
                          <div>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{c.key}</span>
                            <span className="text-[10px] text-zinc-400 block">{c.name} — {c.meaning}</span>
                          </div>
                          <span className="font-mono text-zinc-650 font-semibold text-right">{c.formatted}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security analyzer score card */}
                {securityAnalysis && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">JWT Security Score</h4>
                      <span className="text-sm font-black text-teal-600 font-mono">{securityAnalysis.score} / 100</span>
                    </div>

                    <div className="space-y-3">
                      {securityAnalysis.issues.map((iss, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          iss.type === 'critical' ? 'bg-rose-500/5 border-rose-500/20 text-rose-700' :
                          iss.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-700' :
                          iss.type === 'good' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700' :
                          'bg-zinc-50 border-zinc-200 text-zinc-650'
                        }`}>
                          <div className="font-bold">{iss.title}</div>
                          <div className="text-[10px] mt-0.5 opacity-90">{iss.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signature verification segment details */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest block border-b pb-2">Cryptographic Signature</h4>
                  <pre className="text-xs font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl overflow-x-auto break-all whitespace-pre-wrap">
                    {tokenStructure.signature || 'Unsigned'}
                  </pre>
                  <p className="text-[10px] text-zinc-400 italic">Signature segment validates that the token was signed by the issuer. Decoding signatures without keys is mathematically impossible.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORKSPACE MODE: ENCODER */}
      {activeTab === 'encode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Header JSON</span>
              <textarea
                value={genHeader}
                onChange={(e) => setGenHeader(e.target.value)}
                className="w-full h-32 p-3 border rounded text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Payload JSON</span>
              <textarea
                value={genPayload}
                onChange={(e) => setGenPayload(e.target.value)}
                className="w-full h-64 p-3 border rounded text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">HMAC Secret Key</span>
              <input
                type="text"
                value={genSecret}
                onChange={(e) => setGenSecret(e.target.value)}
                className="w-full p-2 border rounded text-xs font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-4 font-mono">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-bold text-teal-300 uppercase block">Live Generated Token Output</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedJWT);
                  setCopiedToken(true);
                  setTimeout(() => setCopiedToken(false), 2000);
                }}
                className="text-xs text-zinc-350 hover:text-white"
              >
                {copiedToken ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-xs break-all leading-normal select-all">
              {generatedJWT}
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE MODE: COMPARE */}
      {activeTab === 'compare' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-2">
              <label className="text-xs font-bold text-zinc-550 block uppercase">Token A</label>
              <textarea
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value)}
                placeholder="Paste Token A..."
                className="w-full h-40 p-2.5 border rounded text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-2">
              <label className="text-xs font-bold text-zinc-550 block uppercase">Token B</label>
              <textarea
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value)}
                placeholder="Paste Token B..."
                className="w-full h-40 p-2.5 border rounded text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {tokensComparison && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Payload claims compare</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-2 pl-2">Claim Key</th>
                      <th className="py-2 text-center">Token A Value</th>
                      <th className="py-2 text-center">Token B Value</th>
                      <th className="py-2 text-right pr-2">Match Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-semibold font-mono text-zinc-700 dark:text-zinc-350">
                    {tokensComparison.payloadDiffs.map((row) => (
                      <tr key={row.key} className={`hover:bg-zinc-50/50 ${!row.matches ? 'bg-rose-500/5' : ''}`}>
                        <td className="py-2.5 pl-2 font-sans font-bold">{row.key}</td>
                        <td className="py-2.5 text-center text-zinc-500">{row.valA}</td>
                        <td className="py-2.5 text-center text-zinc-500">{row.valB}</td>
                        <td className="py-2.5 text-right pr-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] ${row.matches ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                            {row.matches ? 'Identical' : 'Mismatch'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE MODE: PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider block">Playground Editors</h3>
            
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 block uppercase">Header</span>
              <textarea value={genHeader} onChange={(e) => setGenHeader(e.target.value)} className="w-full h-24 p-2 border rounded text-xs font-mono" />
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 block uppercase">Payload</span>
              <textarea value={genPayload} onChange={(e) => setGenPayload(e.target.value)} className="w-full h-48 p-2 border rounded text-xs font-mono" />
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 block uppercase">HMAC Secret Key</span>
              <input type="text" value={genSecret} onChange={(e) => setGenSecret(e.target.value)} className="w-full p-2 border rounded text-xs font-mono" />
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-4 font-mono">
            <h3 className="text-xs font-black text-teal-400 uppercase tracking-wider block border-b border-zinc-850 pb-2">Live Play Signature Output</h3>
            <div className="text-xs break-all leading-normal select-all">
              {generatedJWT}
            </div>
          </div>
        </div>
      )}

      {/* API REQUEST SNIPPETS DESK */}
      {tokenStructure && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">API Request Code Snippets</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-450 uppercase block">cURL Command</span>
              <pre className="text-[11px] font-mono text-zinc-700 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">{apiSnippets.curl}</pre>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-450 uppercase block">Fetch JavaScript Request</span>
              <pre className="text-[11px] font-mono text-zinc-700 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">{apiSnippets.javascript}</pre>
            </div>
          </div>
        </div>
      )}

      {/* EXPORTS DOCK ACTIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Export Debug Audits</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyReport}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Report Copied' : 'Copy Debug Summary'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Debug Sheet</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Disclaimers & Privacy sandbox banner */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <ShieldCheck className="w-4 h-4 text-teal-605" />
          <span>Privacy Sandbox Security Controls</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          🔒 <strong>100% Client-Side Executions:</strong> All token decode parsing, timeline evaluations, signature sign HMAC utilities, and difference comparisons are processed locally in your browser memory. Cryptographic verification keys, secrets, and raw payload strings are never transmitted over the network or saved to remote databases.
        </p>
      </div>
    </div>
  );
}
