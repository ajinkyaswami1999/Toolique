import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  FileText,
  UploadCloud,
  ShieldCheck,
  RefreshCw,
  Download,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
  Lock,
  File,
  CheckCircle2,
  XCircle,
  Binary
} from 'lucide-react';

/* =========================================================================
   PURE TYPESCRIPT CRYPTOGRAPHIC & CHECKSUM IMPLEMENTATIONS
   ========================================================================= */

// RFC 1321 MD5 for Uint8Array
function computeMD5(bytes: Uint8Array): string {
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];
  const r = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

  const len = bytes.length;
  const words = new Int32Array(((len + 8) >> 6) * 16 + 16);
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[len >> 2] |= 0x80 << ((len % 4) * 8);
  words[words.length - 2] = (len * 8) & 0xffffffff;
  words[words.length - 1] = Math.floor((len * 8) / 0x100000000);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;

  const leftRotate = (x: number, c: number) => (x << c) | (x >>> (32 - c));

  for (let i = 0; i < words.length; i += 16) {
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;

    for (let j = 0; j < 64; j++) {
      let f: number;
      let g: number;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + k[j] + words[i + g]) | 0, r[j])) | 0;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
  }

  const toHex = (n: number) => {
    let out = '';
    for (let i = 0; i < 4; i++) {
      out += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return out;
  };

  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// RFC 2104 HMAC-MD5
function computeHMACMD5(keyBytes: Uint8Array, messageBytes: Uint8Array): string {
  let k = keyBytes;
  if (k.length > 64) {
    const hex = computeMD5(k);
    k = hexToBytes(hex);
  }
  const paddedKey = new Uint8Array(64);
  paddedKey.set(k);

  const ipad = new Uint8Array(64);
  const opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }

  const innerMsg = new Uint8Array(64 + messageBytes.length);
  innerMsg.set(ipad, 0);
  innerMsg.set(messageBytes, 64);
  const innerHex = computeMD5(innerMsg);
  const innerBytes = hexToBytes(innerHex);

  const outerMsg = new Uint8Array(64 + 16);
  outerMsg.set(opad, 0);
  outerMsg.set(innerBytes, 64);
  return computeMD5(outerMsg);
}

// Standard ISO 3309 CRC-32
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC32_TABLE[i] = c >>> 0;
}

function computeCRC32(bytes: Uint8Array): string {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/* =========================================================================
   TYPES & PRESETS
   ========================================================================= */

interface HashItem {
  id: string;
  name: string;
  family: string;
  bits: number;
  rawHex: string;
  statusBadge: string;
  statusColor: 'green' | 'amber' | 'slate' | 'blue';
  description: string;
}

const SAMPLE_PRESETS = [
  { label: 'Hello World', text: 'Hello, World!' },
  { label: 'Toolique', text: 'Toolique India' },
  { label: 'Empty String', text: '' },
  { label: 'Admin Pass', text: 'Admin@2026!SecureKey' },
  { label: 'Bearer Token', text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
  { label: 'JSON Sample', text: '{"service":"toolique","status":"active","code":200}' }
];

export default function HashGenerator() {
  // Input Modes: 'text' or 'file'
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  // Text State
  const [textInput, setTextInput] = useState<string>('Toolique India');

  // File State
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // HMAC Mode
  const [enableHmac, setEnableHmac] = useState<boolean>(false);
  const [hmacKey, setHmacKey] = useState<string>('secret-key');
  const [showHmacKey, setShowHmacKey] = useState<boolean>(false);

  // Formatting Options
  const [letterCase, setLetterCase] = useState<'lower' | 'upper'>('lower');
  const [outputEncoding, setOutputEncoding] = useState<'hex' | 'base64'>('hex');

  // Hash Verifier / Matcher
  const [verifyTarget, setVerifyTarget] = useState<string>('');

  // Computed Raw Hashes (stored in lower-case hex for easy transformation)
  const [hashes, setHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha384: string;
    sha512: string;
    crc32: string;
  }>({
    md5: '',
    sha1: '',
    sha256: '',
    sha384: '',
    sha512: '',
    crc32: ''
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState<boolean>(false);

  // Helper to get active Uint8Array payload
  const currentBytes = useMemo<Uint8Array>(() => {
    if (activeTab === 'file') {
      return fileBytes || new Uint8Array(0);
    }
    return new TextEncoder().encode(textInput);
  }, [activeTab, fileBytes, textInput]);

  // Handle File selection
  const handleFileChange = (selectedFile: File) => {
    setFileError(null);
    if (selectedFile.size > 200 * 1024 * 1024) {
      setFileError('File exceeds 200MB. Please select a smaller file for browser in-memory hashing.');
      return;
    }

    setIsProcessingFile(true);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        setFileBytes(new Uint8Array(buffer));
      }
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      setFileError('Failed to read file from disk.');
      setIsProcessingFile(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Compute Hashes Reactively
  useEffect(() => {
    let isCancelled = false;

    async function runComputation() {
      const data = currentBytes;

      // Handle HMAC mode
      if (enableHmac) {
        const keyData = new TextEncoder().encode(hmacKey || '');

        // 1. HMAC-MD5
        const md5Val = computeHMACMD5(keyData, data);

        // 2. Web Crypto HMAC for SHA-1, SHA-256, SHA-384, SHA-512
        try {
          const importKeyForHash = async (hashName: string) => {
            return await crypto.subtle.importKey(
              'raw',
              keyData,
              { name: 'HMAC', hash: { name: hashName } },
              false,
              ['sign']
            );
          };

          const [key1, key256, key384, key512] = await Promise.all([
            importKeyForHash('SHA-1'),
            importKeyForHash('SHA-256'),
            importKeyForHash('SHA-384'),
            importKeyForHash('SHA-512')
          ]);

          const [sig1, sig256, sig384, sig512] = await Promise.all([
            crypto.subtle.sign('HMAC', key1, data.buffer as ArrayBuffer),
            crypto.subtle.sign('HMAC', key256, data.buffer as ArrayBuffer),
            crypto.subtle.sign('HMAC', key384, data.buffer as ArrayBuffer),
            crypto.subtle.sign('HMAC', key512, data.buffer as ArrayBuffer)
          ]);

          if (!isCancelled) {
            setHashes({
              md5: md5Val,
              sha1: bufferToHex(sig1),
              sha256: bufferToHex(sig256),
              sha384: bufferToHex(sig384),
              sha512: bufferToHex(sig512),
              crc32: 'N/A (Non-HMAC)'
            });
          }
        } catch {
          if (!isCancelled) {
            setHashes({
              md5: md5Val,
              sha1: 'Unsupported in current context',
              sha256: 'Unsupported in current context',
              sha384: 'Unsupported in current context',
              sha512: 'Unsupported in current context',
              crc32: 'N/A (Non-HMAC)'
            });
          }
        }
        return;
      }

      // Standard Hash Mode
      const md5Val = computeMD5(data);
      const crc32Val = computeCRC32(data);

      try {
        const [sha1Buf, sha256Buf, sha384Buf, sha512Buf] = await Promise.all([
          crypto.subtle.digest('SHA-1', data.buffer as ArrayBuffer),
          crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer),
          crypto.subtle.digest('SHA-384', data.buffer as ArrayBuffer),
          crypto.subtle.digest('SHA-512', data.buffer as ArrayBuffer)
        ]);

        if (!isCancelled) {
          setHashes({
            md5: md5Val,
            sha1: bufferToHex(sha1Buf),
            sha256: bufferToHex(sha256Buf),
            sha384: bufferToHex(sha384Buf),
            sha512: bufferToHex(sha512Buf),
            crc32: crc32Val
          });
        }
      } catch {
        if (!isCancelled) {
          setHashes({
            md5: md5Val,
            sha1: 'WebCrypto digest error',
            sha256: 'WebCrypto digest error',
            sha384: 'WebCrypto digest error',
            sha512: 'WebCrypto digest error',
            crc32: crc32Val
          });
        }
      }
    }

    runComputation();

    return () => {
      isCancelled = true;
    };
  }, [currentBytes, enableHmac, hmacKey]);

  // Format hash output based on casing & encoding
  const formatOutput = useCallback((rawHex: string): string => {
    if (!rawHex || rawHex.includes('Unsupported') || rawHex.includes('N/A') || rawHex.includes('error')) {
      return rawHex;
    }

    if (outputEncoding === 'base64') {
      try {
        const bytes = hexToBytes(rawHex);
        return bufferToBase64(bytes);
      } catch {
        return rawHex;
      }
    }

    return letterCase === 'upper' ? rawHex.toUpperCase() : rawHex.toLowerCase();
  }, [letterCase, outputEncoding]);

  // Formatted Hash Table Data
  const hashList: HashItem[] = useMemo(() => [
    {
      id: 'sha256',
      name: enableHmac ? 'HMAC-SHA-256' : 'SHA-256',
      family: 'SHA-2',
      bits: 256,
      rawHex: hashes.sha256,
      statusBadge: 'NIST Recommended',
      statusColor: 'green',
      description: 'Default industry standard for Bitcoin, SSL/TLS certificates, Git commit trees, and cloud integrity.'
    },
    {
      id: 'sha512',
      name: enableHmac ? 'HMAC-SHA-512' : 'SHA-512',
      family: 'SHA-2',
      bits: 512,
      rawHex: hashes.sha512,
      statusBadge: 'High Security',
      statusColor: 'green',
      description: 'Maximum bit security; highly optimized for 64-bit server architectures and military-grade vaults.'
    },
    {
      id: 'sha384',
      name: enableHmac ? 'HMAC-SHA-384' : 'SHA-384',
      family: 'SHA-2',
      bits: 384,
      rawHex: hashes.sha384,
      statusBadge: 'NSA Suite B',
      statusColor: 'blue',
      description: 'Truncated SHA-512 variant immune to length-extension attacks, certified by US National Security Agency.'
    },
    {
      id: 'md5',
      name: enableHmac ? 'HMAC-MD5' : 'MD5',
      family: 'MD',
      bits: 128,
      rawHex: hashes.md5,
      statusBadge: 'Integrity Only',
      statusColor: 'amber',
      description: 'Fast 128-bit checksum. Cryptographically vulnerable to collisions; use for file checksums and Content-MD5.'
    },
    {
      id: 'sha1',
      name: enableHmac ? 'HMAC-SHA-1' : 'SHA-1',
      family: 'SHA-1',
      bits: 160,
      rawHex: hashes.sha1,
      statusBadge: 'Legacy / Deprecated',
      statusColor: 'amber',
      description: 'Legacy 160-bit hash. Deprecated by major web browsers and Git in favor of SHA-256.'
    },
    {
      id: 'crc32',
      name: 'CRC-32 Checksum',
      family: 'Checksum',
      bits: 32,
      rawHex: hashes.crc32,
      statusBadge: 'Non-Cryptographic',
      statusColor: 'slate',
      description: 'Cyclic redundancy check widely utilized in ZIP archives, Ethernet frame checks, and PNG chunk validation.'
    }
  ], [enableHmac, hashes]);

  // Hash Verifier Result
  const verifyResult = useMemo(() => {
    const trimmed = verifyTarget.trim().toLowerCase();
    if (!trimmed) return null;

    for (const item of hashList) {
      if (!item.rawHex || item.rawHex.length < 8) continue;

      const lowerHex = item.rawHex.toLowerCase();
      if (lowerHex === trimmed) {
        return { matched: true, item, format: 'Hexadecimal' };
      }

      // Check base64 matching if string might be base64
      try {
        const b64 = bufferToBase64(hexToBytes(item.rawHex));
        if (b64 === verifyTarget.trim()) {
          return { matched: true, item, format: 'Base64' };
        }
      } catch {
        // ignore conversion error
      }
    }

    return { matched: false };
  }, [verifyTarget, hashList]);

  // Copy Single Hash
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy All Hashes as Formatted Text
  const handleCopyAll = () => {
    const sourceLabel = activeTab === 'file' ? (file ? file.name : 'Uploaded File') : `String ("${textInput.slice(0, 24)}...")`;
    const lines = [
      `# Toolique India - Cryptographic Checksums`,
      `# Source: ${sourceLabel}`,
      `# Mode: ${enableHmac ? `HMAC (${hmacKey})` : 'Standard Hashing'}`,
      `# Date: ${new Date().toISOString()}`,
      `# Format: ${outputEncoding.toUpperCase()} (${letterCase})`,
      ''
    ];

    hashList.forEach((item) => {
      lines.push(`${item.name}: ${formatOutput(item.rawHex)}`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopyAllStatus(true);
    setTimeout(() => setCopyAllStatus(false), 2000);
  };

  // Download Checksum File
  const handleDownloadChecksumFile = () => {
    const fileName = activeTab === 'file' && file ? `${file.name}.sha256` : 'checksums.txt';
    const lines = [
      `# Toolique India Cryptographic Checksum File`,
      `# Target: ${activeTab === 'file' && file ? file.name : 'input.txt'}`,
      `# Generated: ${new Date().toLocaleString('en-IN')}`,
      ''
    ];

    hashList.forEach((item) => {
      lines.push(`${item.name} (${activeTab === 'file' && file ? file.name : 'input.txt'}) = ${formatOutput(item.rawHex)}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Quick Random Nonce Generator
  const handleGenerateRandomNonce = () => {
    const randomArray = new Uint8Array(16);
    crypto.getRandomValues(randomArray);
    const nonce = bufferToHex(randomArray);
    setTextInput(nonce);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Controls & Input Mode Selector (Zero heading doubling: No H1 here) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {/* Input Mode Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'text'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Text / Plaintext String</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'file'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>File Checksum Studio</span>
          </button>
        </div>

        {/* Global Action Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-pastel-indigo/30 hover:bg-pastel-indigo/60 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 transition flex items-center gap-1.5"
          >
            {copyAllStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copyAllStatus ? 'All Copied!' : 'Copy All Hashes'}</span>
          </button>

          <button
            onClick={handleDownloadChecksumFile}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Area (Left 5 Cols) + Hash Suite (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Source & Mode Options */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Binary className="w-4 h-4 text-indigo-500" />
                <span>Source Input Payload</span>
              </h2>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                {activeTab === 'text' ? `${currentBytes.length} Bytes` : file ? `${(file.size / 1024).toFixed(1)} KB` : 'No file'}
              </span>
            </div>

            {/* TEXT MODE */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                {/* Presets Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Presets:</span>
                  {SAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setTextInput(p.text)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    onClick={handleGenerateRandomNonce}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pastel-amber/40 hover:bg-pastel-amber/80 text-amber-900 dark:text-amber-200 transition flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Random Nonce</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    id="hash-text-input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type or paste any plaintext, token, password, or code snippet to compute cryptographic checksums..."
                    rows={8}
                    className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 font-mono text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 shadow-inner resize-y leading-relaxed"
                  />
                  {textInput && (
                    <button
                      onClick={() => setTextInput('')}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition"
                      title="Clear input"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                  <span>Characters: {textInput.length}</span>
                  <span>UTF-8 Size: {currentBytes.length} octets</span>
                </div>
              </div>
            )}

            {/* FILE MODE */}
            {activeTab === 'file' && (
              <div className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-center transition cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/30"
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      {isProcessingFile ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {isProcessingFile ? 'Computing checksums from binary...' : 'Click or drag file here'}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Executable, ZIP, PDF, Image, ISO, or Document up to 200MB
                      </p>
                    </div>
                  </div>
                </div>

                {fileError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{fileError}</span>
                  </div>
                )}

                {file && (
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate">
                        <File className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                      <span>MIME: {file.type || 'application/octet-stream'}</span>
                      <span>Status: {isProcessingFile ? 'Hashing...' : 'Ready'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HMAC Mode Box */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="hmac-toggle" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>HMAC Mode (Keyed Hash)</span>
                </label>
                <input
                  id="hmac-toggle"
                  type="checkbox"
                  checked={enableHmac}
                  onChange={(e) => setEnableHmac(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {enableHmac && (
                <div className="space-y-1.5 pt-1 animate-fadeIn">
                  <label htmlFor="hmac-secret-key" className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block">
                    Shared Secret Key *
                  </label>
                  <div className="relative">
                    <input
                      id="hmac-secret-key"
                      type={showHmacKey ? 'text' : 'password'}
                      value={hmacKey}
                      onChange={(e) => setHmacKey(e.target.value)}
                      placeholder="Enter secret key..."
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowHmacKey(!showHmacKey)}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showHmacKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Generates message authentication codes RFC 2104 compliant with SHA-1, SHA-256, SHA-384, SHA-512, and MD5.
                  </p>
                </div>
              )}
            </div>

            {/* Display & Encoding Options */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                Output Formatting
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Casing */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Hex Casing
                  </label>
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setLetterCase('lower')}
                      className={`flex-1 py-1 rounded-md transition ${
                        letterCase === 'lower'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      lower (abc)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLetterCase('upper')}
                      className={`flex-1 py-1 rounded-md transition ${
                        letterCase === 'upper'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      UPPER (ABC)
                    </button>
                  </div>
                </div>

                {/* Encoding */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Format
                  </label>
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setOutputEncoding('hex')}
                      className={`flex-1 py-1 rounded-md transition ${
                        outputEncoding === 'hex'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Hexadecimal
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutputEncoding('base64')}
                      className={`flex-1 py-1 rounded-md transition ${
                        outputEncoding === 'base64'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Base64 (SRI)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Hash Verifier & Checksum Matcher Card */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" />
                <span>Checksum Verifier / Matcher</span>
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Paste an expected checksum from a software release or vendor manifest to check authenticity:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={verifyTarget}
                onChange={(e) => setVerifyTarget(e.target.value)}
                placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-inner"
              />

              {verifyResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition ${
                    verifyResult.matched
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {verifyResult.matched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span>MATCH CONFIRMED!</span>
                        <span className="block text-[11px] font-normal text-emerald-800 dark:text-emerald-200">
                          Matches <strong>{verifyResult.item?.name}</strong> ({verifyResult.format})
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <span>MISMATCH / NO MATCH FOUND</span>
                        <span className="block text-[11px] font-normal text-rose-800 dark:text-rose-200">
                          Entered hash does not match any computed algorithm for this payload.
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Checksums Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 md:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>Calculated Cryptographic Checksums</span>
              </h2>
              <span className="text-[11px] font-bold text-zinc-400 uppercase">
                {enableHmac ? 'Keyed Authentication' : 'Message Digest'}
              </span>
            </div>

            {/* List of Hash Cards */}
            <div className="space-y-4">
              {hashList.map((item) => {
                const formattedValue = formatOutput(item.rawHex);
                const isCopied = copiedKey === item.id;
                const isMatched = verifyResult?.matched && verifyResult.item?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition ${
                      isMatched
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 shadow-sm'
                        : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                          {item.bits}-bit
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            item.statusColor === 'green'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : item.statusColor === 'blue'
                              ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400'
                              : item.statusColor === 'amber'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {item.statusBadge}
                        </span>
                        {isMatched && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500 text-white animate-pulse">
                            MATCHED TARGET
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopy(formattedValue, item.id)}
                        className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                          isCopied
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Hash Output Monospace Box */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/80 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all shadow-inner">
                      {formattedValue || <span className="text-zinc-400">Computing checksum...</span>}
                    </div>

                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Security Footer */}
          <div className="p-4 rounded-xl bg-pastel-indigo/20 border border-pastel-indigo/40 dark:bg-zinc-900/40 dark:border-zinc-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white">
                Client-Side Cryptographic Guarantee
              </h3>
              <p>
                All message digests are calculated natively inside your browser using the W3C Web Cryptography API (`crypto.subtle`) and compiled WebAssembly / JavaScript. No files, passwords, or plaintexts are ever transmitted over the network or saved to remote disks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
