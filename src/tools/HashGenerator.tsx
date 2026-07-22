import { useState, useEffect } from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';

// Lightweight, pure TypeScript MD5 implementation
function computeMD5(str: string): string {
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

  const utf8 = unescape(encodeURIComponent(str));
  const words: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    words[i >> 2] |= utf8.charCodeAt(i) << ((i % 4) * 8);
  }
  
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;

  const len = utf8.length;
  words[len >> 2] |= 0x80 << ((len % 4) * 8);
  const wordsLen = ((len + 8) >> 6) * 16 + 14;
  while (words.length < wordsLen) words.push(0);
  words.push(len * 8);
  words.push(0);

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

export default function HashGenerator() {
  const [input, setInput] = useState<string>('Toolique');
  const [hashes, setHashes] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  useEffect(() => {
    if (!input) {
      Promise.resolve().then(() => {
        setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      });
      return;
    }

    // Compute MD5 synchronously
    const md5Val = computeMD5(input);

    // Compute SHA hashes asynchronously using Web Cryptography API
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    Promise.all([
      crypto.subtle.digest('SHA-1', data),
      crypto.subtle.digest('SHA-256', data),
      crypto.subtle.digest('SHA-512', data),
    ])
      .then(([sha1Buf, sha256Buf, sha512Buf]) => {
        setHashes({
          md5: md5Val,
          sha1: bufferToHex(sha1Buf),
          sha256: bufferToHex(sha256Buf),
          sha512: bufferToHex(sha512Buf),
        });
      })
      .catch(() => {
        // Fallback for environments lacking crypto.subtle (e.g. non-secure HTTP localhost fallback)
        setHashes({
          md5: md5Val,
          sha1: 'Hashing failed or not supported in this environment.',
          sha256: 'Hashing failed or not supported in this environment.',
          sha512: 'Hashing failed or not supported in this environment.',
        });
      });
  }, [input]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Input Area */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Source String / Plaintext
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your plain text here to compute hashes..."
            className="w-full flex-grow min-h-[300px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-mono text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none resize-none"
          />
          <button
            onClick={() => setInput('')}
            className="text-xs font-semibold text-rose-500 hover:underline text-right"
          >
            Clear Text
          </button>
        </div>

        {/* Right Output Area */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block pb-2 border-b border-slate-100 dark:border-slate-800/60">
            Calculated Checksums / Hashes
          </span>

          <div className="space-y-4">
            {/* MD5 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">MD5 Checksum (128-bit)</span>
                <button
                  onClick={() => handleCopy(hashes.md5, 'md5')}
                  className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold flex items-center gap-1 transition"
                >
                  {copiedKey === 'md5' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'md5' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-350 break-all select-all">
                {hashes.md5 || <span className="text-slate-400">Result will show here...</span>}
              </div>
            </div>

            {/* SHA-1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">SHA-1 Hash (160-bit)</span>
                <button
                  onClick={() => handleCopy(hashes.sha1, 'sha1')}
                  className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold flex items-center gap-1 transition"
                >
                  {copiedKey === 'sha1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sha1' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-350 break-all select-all">
                {hashes.sha1 || <span className="text-slate-400">Result will show here...</span>}
              </div>
            </div>

            {/* SHA-256 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">SHA-256 Hash (256-bit)</span>
                <button
                  onClick={() => handleCopy(hashes.sha256, 'sha256')}
                  className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold flex items-center gap-1 transition"
                >
                  {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sha256' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-350 break-all select-all">
                {hashes.sha256 || <span className="text-slate-400">Result will show here...</span>}
              </div>
            </div>

            {/* SHA-512 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">SHA-512 Hash (512-bit)</span>
                <button
                  onClick={() => handleCopy(hashes.sha512, 'sha512')}
                  className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold flex items-center gap-1 transition"
                >
                  {copiedKey === 'sha512' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sha512' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-350 break-all select-all">
                {hashes.sha512 || <span className="text-slate-400">Result will show here...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-0.5">
          <KeyRound className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <h4 className="font-bold text-slate-800 dark:text-white mb-0.5">Understanding cryptographic hashes</h4>
          <p>
            Cryptographic hash functions are mathematical algorithms that map data of arbitrary size to a bit array of a fixed size (the hash value). They are one-way functions, meaning it is computationally infeasible to recreate the original string from the hash output.
          </p>
        </div>
      </div>
    </div>
  );
}

