import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Copy, Check, Trash2, Download, Upload,
  ArrowLeftRight, RefreshCw, Shield,
  AlertCircle, FileCheck, Layers
} from 'lucide-react';

type ToolTab = 'text' | 'file-to-base64' | 'base64-to-file' | 'hex' | 'visualizer';
type Base64Variant = 'standard' | 'url-safe';
type LineWrapOption = 'none' | '64' | '76';
type CharsetOption = 'utf-8' | 'latin1';

// Preset samples
const PRESETS = [
  { label: 'Plain Greeting', value: 'Hello, Toolique Developer Ecosystem! 🚀' },
  { label: 'JSON Payload', value: '{\n  "user": "alex_chen",\n  "role": "admin",\n  "timestamp": 1718000000,\n  "active": true\n}' },
  { label: 'Basic Auth', value: 'admin:SuperSecretPassword2026!' },
  { label: 'JWT Header & Payload', value: '{"alg":"HS256","typ":"JWT"}.{"sub":"1234567890","name":"Jane Doe","iat":1516239022}' },
  { label: 'HTML Tag', value: '<div class="banner">\n  <h1>Welcome to Toolique</h1>\n  <p>100% Client-Side Privacy</p>\n</div>' }
];

// Helper: Convert UTF-8 string to Uint8Array safely
function stringToUtf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper: Convert Uint8Array to UTF-8 string safely
function utf8BytesToString(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

// Helper: Convert Latin1 string to Uint8Array
function stringToLatin1Bytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

// Helper: Convert Uint8Array to Latin1 string
function latin1BytesToString(bytes: Uint8Array): string {
  let res = '';
  for (let i = 0; i < bytes.length; i++) {
    res += String.fromCharCode(bytes[i]);
  }
  return res;
}

// Helper: Base64 Encode from Uint8Array
function bytesToBase64(bytes: Uint8Array, variant: Base64Variant = 'standard', wrap: LineWrapOption = 'none'): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);

  if (variant === 'url-safe') {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  if (wrap === '64') {
    return base64.match(/.{1,64}/g)?.join('\n') || base64;
  } else if (wrap === '76') {
    return base64.match(/.{1,76}/g)?.join('\n') || base64;
  }

  return base64;
}

// Helper: Base64 Decode to Uint8Array
function base64ToBytes(b64Str: string): Uint8Array {
  let clean = b64Str.trim().replace(/\s+/g, '');
  // Convert URL-safe to standard
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');
  // Add missing padding
  while (clean.length % 4 !== 0) {
    clean += '=';
  }

  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Detect MIME from Magic Bytes
function detectMimeType(bytes: Uint8Array): { mime: string; ext: string; label: string } {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: 'image/png', ext: 'png', label: 'PNG Image' };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg', label: 'JPEG Image' };
  }
  if (bytes.length >= 6 && (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)) {
    return { mime: 'image/gif', ext: 'gif', label: 'GIF Image' };
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp', label: 'WebP Image' };
  }
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { mime: 'application/pdf', ext: 'pdf', label: 'PDF Document' };
  }
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return { mime: 'application/zip', ext: 'zip', label: 'ZIP Archive' };
  }
  if (bytes.length >= 4 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return { mime: 'audio/mpeg', ext: 'mp3', label: 'MP3 Audio' };
  }
  if (bytes.length >= 4 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return { mime: 'video/mp4', ext: 'mp4', label: 'MP4 Video' };
  }

  // Check if printable UTF-8 text or SVG/JSON
  try {
    const text = utf8BytesToString(bytes);
    if (text.trim().startsWith('<svg') || text.trim().startsWith('<?xml')) {
      return { mime: 'image/svg+xml', ext: 'svg', label: 'SVG Vector Graphic' };
    }
    if ((text.trim().startsWith('{') && text.trim().endsWith('}')) || (text.trim().startsWith('[') && text.trim().endsWith(']'))) {
      return { mime: 'application/json', ext: 'json', label: 'JSON Document' };
    }
    return { mime: 'text/plain;charset=utf-8', ext: 'txt', label: 'Plain Text' };
  } catch {
    return { mime: 'application/octet-stream', ext: 'bin', label: 'Binary File' };
  }
}

export default function Base64Tool() {
  const [activeTab, setActiveTab] = useState<ToolTab>('text');

  // --- TEXT MODE STATE ---
  const [textMode, setTextMode] = useState<'encode' | 'decode'>('encode');
  const [textInput, setTextInput] = useState<string>('Hello, Toolique Developer Ecosystem! 🚀');
  const [variant, setVariant] = useState<Base64Variant>('standard');
  const [lineWrap, setLineWrap] = useState<LineWrapOption>('none');
  const [charset, setCharset] = useState<CharsetOption>('utf-8');
  const [liveCopied, setLiveCopied] = useState<string | null>(null);

  // --- FILE TO BASE64 STATE ---
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    mime: string;
    base64: string;
    dataUri: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- BASE64 TO FILE STATE ---
  const [decodeInput, setDecodeInput] = useState<string>('');
  const [reconstructedFile, setReconstructedFile] = useState<{
    bytes: Uint8Array;
    mime: string;
    ext: string;
    label: string;
    url: string;
  } | null>(null);
  const [decodeFileError, setDecodeFileError] = useState<string | null>(null);

  // --- HEX CONVERTER STATE ---
  const [hexInput, setHexInput] = useState<string>('48656c6c6f2c20576f726c6421');
  const [hexMode, setHexMode] = useState<'hexToBase64' | 'base64ToHex'>('hexToBase64');

  // ----------------------------------------------------
  // TEXT MODE COMPUTATION
  // ----------------------------------------------------
  const textResult = useMemo(() => {
    if (!textInput) return { output: '', error: null, byteLen: 0, outByteLen: 0 };

    try {
      if (textMode === 'encode') {
        const bytes = charset === 'utf-8' ? stringToUtf8Bytes(textInput) : stringToLatin1Bytes(textInput);
        const encoded = bytesToBase64(bytes, variant, lineWrap);
        return {
          output: encoded,
          error: null,
          byteLen: bytes.byteLength,
          outByteLen: encoded.length
        };
      } else {
        const cleanB64 = textInput.replace(/\s+/g, '');
        const bytes = base64ToBytes(cleanB64);
        const decoded = charset === 'utf-8' ? utf8BytesToString(bytes) : latin1BytesToString(bytes);
        return {
          output: decoded,
          error: null,
          byteLen: cleanB64.length,
          outByteLen: bytes.byteLength
        };
      }
    } catch (err: any) {
      return {
        output: '',
        error: textMode === 'decode'
          ? 'Invalid Base64 sequence or malformed characters. Check encoding / padding.'
          : (err?.message || 'Encoding error occurred.'),
        byteLen: 0,
        outByteLen: 0
      };
    }
  }, [textInput, textMode, variant, lineWrap, charset]);

  // Copy helper
  const copyToClipboard = (text: string, id: string = 'main') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setLiveCopied(id);
    setTimeout(() => setLiveCopied(null), 2000);
  };

  // Swap input & output
  const handleSwap = () => {
    if (!textResult.output) return;
    const newMode = textMode === 'encode' ? 'decode' : 'encode';
    setTextMode(newMode);
    setTextInput(textResult.output);
  };

  // Download text output
  const handleDownloadText = () => {
    if (!textResult.output) return;
    const blob = new Blob([textResult.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = textMode === 'encode' ? 'encoded_base64.txt' : 'decoded_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ----------------------------------------------------
  // FILE TO BASE64 HANDLER
  // ----------------------------------------------------
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      const b64 = bytesToBase64(bytes, 'standard', 'none');
      const mime = file.type || 'application/octet-stream';
      const dataUri = `data:${mime};base64,${b64}`;

      setUploadedFile({
        name: file.name,
        size: file.size,
        mime: mime,
        base64: b64,
        dataUri: dataUri
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // ----------------------------------------------------
  // BASE64 TO FILE RECONSTRUCTOR
  // ----------------------------------------------------
  useEffect(() => {
    if (!decodeInput.trim()) {
      if (reconstructedFile?.url) URL.revokeObjectURL(reconstructedFile.url);
      setReconstructedFile(null);
      setDecodeFileError(null);
      return;
    }

    try {
      let rawB64 = decodeInput.trim();
      let explicitMime: string | null = null;

      // Check if user pasted a data URI: data:<mime>;base64,<payload>
      const dataUriMatch = rawB64.match(/^data:([^;]+);base64,(.*)$/s);
      if (dataUriMatch) {
        explicitMime = dataUriMatch[1];
        rawB64 = dataUriMatch[2];
      }

      const bytes = base64ToBytes(rawB64);
      const detected = detectMimeType(bytes);
      const finalMime = explicitMime || detected.mime;

      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: finalMime });
      const url = URL.createObjectURL(blob);

      if (reconstructedFile?.url) URL.revokeObjectURL(reconstructedFile.url);

      setReconstructedFile({
        bytes,
        mime: finalMime,
        ext: detected.ext,
        label: detected.label,
        url
      });
      setDecodeFileError(null);
    } catch (err: any) {
      if (reconstructedFile?.url) URL.revokeObjectURL(reconstructedFile.url);
      setReconstructedFile(null);
      setDecodeFileError('Failed to reconstruct file. Please verify valid Base64 / Data URI string.');
    }
  }, [decodeInput]);

  // ----------------------------------------------------
  // HEX CONVERTER COMPUTATION
  // ----------------------------------------------------
  const hexResult = useMemo(() => {
    if (!hexInput.trim()) return { output: '', error: null };
    try {
      if (hexMode === 'hexToBase64') {
        const cleanHex = hexInput.replace(/[^0-9a-fA-F]/g, '');
        if (cleanHex.length % 2 !== 0) {
          return { output: '', error: 'Hex string must contain an even number of characters (2 hex digits per byte).' };
        }
        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
          bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
        }
        const b64 = bytesToBase64(bytes);
        return { output: b64, error: null };
      } else {
        const cleanB64 = hexInput.trim().replace(/\s+/g, '');
        const bytes = base64ToBytes(cleanB64);
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
          hex += bytes[i].toString(16).padStart(2, '0');
        }
        return { output: hex, error: null };
      }
    } catch (err: any) {
      return { output: '', error: err?.message || 'Conversion failed.' };
    }
  }, [hexInput, hexMode]);

  // ----------------------------------------------------
  // VISUALIZER CHUNK GENERATOR (First 3 bytes = 4 chars)
  // ----------------------------------------------------
  const visualSample = useMemo(() => {
    const sampleText = textInput.slice(0, 3) || 'Hey';
    const bytes = stringToUtf8Bytes(sampleText).slice(0, 3);
    const b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    // Pack into 24-bit number
    let bit24 = 0;
    for (let i = 0; i < 3; i++) {
      bit24 = (bit24 << 8) | (bytes[i] || 0);
    }

    const chunk6_1 = (bit24 >> 18) & 0x3f;
    const chunk6_2 = (bit24 >> 12) & 0x3f;
    const chunk6_3 = (bit24 >> 6) & 0x3f;
    const chunk6_4 = bit24 & 0x3f;

    return {
      chars: sampleText.split(''),
      bytes: Array.from(bytes),
      binaryString: Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' '),
      chunks: [
        { val: chunk6_1, bin: chunk6_1.toString(2).padStart(6, '0'), char: b64Chars[chunk6_1] },
        { val: chunk6_2, bin: chunk6_2.toString(2).padStart(6, '0'), char: b64Chars[chunk6_2] },
        { val: chunk6_3, bin: chunk6_3.toString(2).padStart(6, '0'), char: bytes.length > 1 ? b64Chars[chunk6_3] : '=' },
        { val: chunk6_4, bin: chunk6_4.toString(2).padStart(6, '0'), char: bytes.length > 2 ? b64Chars[chunk6_4] : '=' }
      ]
    };
  }, [textInput]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Top Navigation Tabs & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: 'text', label: '🔤 Text & Strings' },
            { id: 'file-to-base64', label: '📁 File ➔ Base64' },
            { id: 'base64-to-file', label: '💾 Base64 ➔ File' },
            { id: 'hex', label: '⚡ Hex ⇄ Base64' },
            { id: 'visualizer', label: '🔬 Bitstream Visualizer' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ToolTab)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hidden sm:inline-block">
            100% Client-Side Privacy
          </span>
          <button
            onClick={() => {
              setTextInput(PRESETS[0].value);
              setDecodeInput('');
              setUploadedFile(null);
            }}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:border-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TEXT ENCODER / DECODER */}
      {/* ========================================================================= */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
              <button
                onClick={() => setTextMode('encode')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  textMode === 'encode'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Encode Text
              </button>
              <button
                onClick={() => setTextMode('decode')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  textMode === 'decode'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Decode Base64
              </button>
            </div>

            {/* Presets dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-zinc-400">Presets:</span>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTextMode('encode');
                    setTextInput(p.value);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 transition cursor-pointer shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Advanced Formatting Controls */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value as Base64Variant)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none cursor-pointer"
                title="Base64 Encoding Standard"
              >
                <option value="standard">Standard (RFC 4648 + / =)</option>
                <option value="url-safe">URL-Safe (RFC 4648 - _ )</option>
              </select>

              <select
                value={lineWrap}
                onChange={(e) => setLineWrap(e.target.value as LineWrapOption)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none cursor-pointer"
                title="Line break wrapping"
              >
                <option value="none">No Wrapping (Continuous)</option>
                <option value="64">PEM Wrap (64 Chars)</option>
                <option value="76">MIME Wrap (76 Chars)</option>
              </select>

              <select
                value={charset}
                onChange={(e) => setCharset(e.target.value as CharsetOption)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none cursor-pointer"
                title="Character set interpretation"
              >
                <option value="utf-8">UTF-8 Unicode</option>
                <option value="latin1">Binary / Latin-1</option>
              </select>
            </div>
          </div>

          {/* Dual Panel Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Input Panel */}
            <div className="saas-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      {textMode === 'encode' ? '1. Plaintext Input' : '1. Base64 Encoded Input'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {textInput.length} chars ({textResult.byteLen} bytes)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTextInput('')}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                      title="Clear input"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={textMode === 'encode' ? 'Enter plain text, JSON, code, or unicode strings to encode...' : 'Paste Base64 encoded string to decode...'}
                  rows={12}
                  className="saas-input w-full p-4 font-mono text-xs font-medium leading-relaxed resize-y flex-1"
                />
              </div>

              {/* Action row */}
              <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleSwap}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition cursor-pointer flex items-center gap-1.5"
                  title="Swap Input and Output with reversed mode"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Swap & Invert</span>
                </button>

                <div className="text-[11px] font-medium text-zinc-400">
                  Encoding: <strong className="text-zinc-600 dark:text-zinc-300">{charset.toUpperCase()}</strong>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="saas-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {textMode === 'encode' ? '2. Base64 Result' : '2. Decoded Plaintext'}
                    </span>
                    {textResult.output && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        {textResult.outByteLen} bytes
                      </span>
                    )}
                  </div>

                  {textResult.output && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDownloadText}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
                        title="Download as .txt file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(textResult.output, 'text-output')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {liveCopied === 'text-output' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Output</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {textResult.error ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Decoding Error</p>
                      <p className="text-[11px] opacity-90 mt-0.5">{textResult.error}</p>
                    </div>
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={textResult.output}
                    placeholder="Processed result will appear here automatically..."
                    rows={12}
                    className="saas-input w-full p-4 font-mono text-xs font-medium leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-100 resize-y flex-1"
                  />
                )}
              </div>

              {/* Statistics & Meta */}
              {textResult.output && !textResult.error && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span>Size Expansion: <strong className="text-indigo-600 dark:text-indigo-400">{textMode === 'encode' ? '+33.3%' : '-25.0%'}</strong></span>
                    <span>Padding: <strong className="text-zinc-700 dark:text-zinc-300">{textResult.output.endsWith('==') ? '2 chars (==)' : textResult.output.endsWith('=') ? '1 char (=)' : 'None'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(`Authorization: Basic ${textResult.output}`, 'curl-auth')}
                      className="text-xs hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer font-bold"
                    >
                      {liveCopied === 'curl-auth' ? '✓ Copied cURL Header' : '+ Copy as Basic Auth Header'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FILE TO BASE64 DATA URI GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'file-to-base64' && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 p-8 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 text-center cursor-pointer transition-all duration-200 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
            />
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                  Drop any file here or click to browse
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                  Supports Images (PNG, JPG, SVG, WebP, GIF), PDFs, Audio, Video, Fonts, and Binary files up to 50MB.
                </p>
              </div>
            </div>
          </div>

          {uploadedFile && (
            <div className="saas-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">{uploadedFile.name}</h4>
                    <p className="text-xs text-zinc-500 font-medium">
                      {(uploadedFile.size / 1024).toFixed(1)} KB · MIME: <span className="font-mono text-indigo-600 dark:text-indigo-400">{uploadedFile.mime}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => copyToClipboard(uploadedFile.dataUri, 'file-data-uri')}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {liveCopied === 'file-data-uri' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>Copy Full Data URI</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(uploadedFile.base64, 'file-raw-b64')}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {liveCopied === 'file-raw-b64' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>Copy Raw Base64</span>
                  </button>
                </div>
              </div>

              {/* Ready Code Snippets */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                  Copy Snippet for Web & Dev
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {uploadedFile.mime.startsWith('image/') && (
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[280px]">
                        {`<img src="${uploadedFile.dataUri.slice(0, 35)}..." />`}
                      </div>
                      <button
                        onClick={() => copyToClipboard(`<img src="${uploadedFile.dataUri}" alt="${uploadedFile.name}" />`, 'html-img')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold hover:text-indigo-600 text-[11px]"
                      >
                        {liveCopied === 'html-img' ? 'Copied' : 'HTML <img>'}
                      </button>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[280px]">
                      {`background-image: url("${uploadedFile.dataUri.slice(0, 30)}...");`}
                    </div>
                    <button
                      onClick={() => copyToClipboard(`background-image: url("${uploadedFile.dataUri}");`, 'css-bg')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold hover:text-indigo-600 text-[11px]"
                    >
                      {liveCopied === 'css-bg' ? 'Copied' : 'CSS url()'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Data URI Output Box */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">
                  Data URI String ({uploadedFile.dataUri.length.toLocaleString()} characters)
                </span>
                <textarea
                  readOnly
                  value={uploadedFile.dataUri}
                  rows={6}
                  className="saas-input w-full p-4 font-mono text-xs font-medium bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BASE64 TO FILE RECONSTRUCTOR & PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'base64-to-file' && (
        <div className="space-y-6">
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Paste Base64 or Data URI String
              </span>
              <button
                onClick={() => setDecodeInput('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Load Sample Red Dot PNG
              </button>
            </div>

            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="Paste raw Base64 string or Data URI (e.g. data:image/png;base64,iVBORw...) to reconstruct and download file..."
              rows={6}
              className="saas-input w-full p-4 font-mono text-xs font-medium resize-y"
            />
          </div>

          {decodeFileError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{decodeFileError}</span>
            </div>
          )}

          {reconstructedFile && (
            <div className="saas-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                      Detected: {reconstructedFile.label}
                    </h4>
                    <p className="text-xs text-zinc-500 font-medium">
                      {(reconstructedFile.bytes.byteLength / 1024).toFixed(2)} KB · Extension: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">.{reconstructedFile.ext}</strong> · MIME: <span className="font-mono">{reconstructedFile.mime}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={reconstructedFile.url}
                  download={`reconstructed_file.${reconstructedFile.ext}`}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .{reconstructedFile.ext.toUpperCase()} File</span>
                </a>
              </div>

              {/* Preview Box */}
              {reconstructedFile.mime.startsWith('image/') && (
                <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Live Image Preview
                  </span>
                  <img
                    src={reconstructedFile.url}
                    alt="Reconstructed Base64"
                    className="max-h-64 mx-auto rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 object-contain p-2"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HEX ⇄ BASE64 BYTE CONVERTER */}
      {/* ========================================================================= */}
      {activeTab === 'hex' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
              <button
                onClick={() => {
                  setHexMode('hexToBase64');
                  setHexInput('48656c6c6f2c20576f726c6421');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  hexMode === 'hexToBase64'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Hex ➔ Base64
              </button>
              <button
                onClick={() => {
                  setHexMode('base64ToHex');
                  setHexInput('SGVsbG8sIFdvcmxkIQ==');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  hexMode === 'base64ToHex'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Base64 ➔ Hex
              </button>
            </div>

            <span className="text-xs font-bold text-zinc-500">
              Byte-Accurate Hex Buffer Transcoding
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="saas-card p-5 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
                {hexMode === 'hexToBase64' ? 'Hexadecimal Input' : 'Base64 Input'}
              </span>
              <textarea
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                rows={8}
                className="saas-input w-full p-4 font-mono text-xs font-medium resize-y"
              />
            </div>

            <div className="saas-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {hexMode === 'hexToBase64' ? 'Base64 Output' : 'Hexadecimal Output'}
                  </span>
                  {hexResult.output && (
                    <button
                      onClick={() => copyToClipboard(hexResult.output, 'hex-out')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer"
                    >
                      {liveCopied === 'hex-out' ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {hexResult.error ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-xs font-semibold">
                    {hexResult.error}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={hexResult.output}
                    rows={8}
                    className="saas-input w-full p-4 font-mono text-xs font-medium bg-zinc-50/50 dark:bg-zinc-950/40"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BITSTREAM VISUALIZER */}
      {/* ========================================================================= */}
      {activeTab === 'visualizer' && (
        <div className="saas-card p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>How Base64 Works: 8-Bit Bytes ➔ 6-Bit Base64 Chunks</span>
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Base64 takes 3 bytes (3 × 8 = 24 bits) from your source text and divides them into 4 groups of 6 bits (4 × 6 = 24 bits). Each 6-bit index (0–63) maps to an ASCII character in the Base64 alphabet table.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
            {/* Step 1: 3 Characters */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                Step 1: 3 Input ASCII Characters
              </span>
              <div className="grid grid-cols-3 gap-3">
                {visualSample.chars.map((char, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
                    <div className="text-lg font-black text-zinc-900 dark:text-white font-mono">'{char}'</div>
                    <div className="text-[10px] font-bold text-zinc-400">Byte {idx + 1}: Decimal {visualSample.bytes[idx]}</div>
                    <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                      {visualSample.bytes[idx]?.toString(2).padStart(8, '0')} (8 bits)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Combined 24-bit Stream */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                Step 2: Combined 24-Bit Stream
              </span>
              <div className="p-3 rounded-xl bg-zinc-900 text-indigo-400 font-mono text-center font-extrabold tracking-widest text-xs">
                {visualSample.binaryString}
              </div>
            </div>

            {/* Step 3: Split into 4 x 6-bit chunks */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                Step 3: Split into 4 Base64 6-Bit Index Values
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {visualSample.chunks.map((chunk, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-center space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Chunk {idx + 1} (6 bits)</span>
                    <div className="text-xs font-mono font-black text-zinc-800 dark:text-zinc-200">{chunk.bin}</div>
                    <div className="text-[10px] font-semibold text-zinc-500">Index {chunk.val}</div>
                    <div className="text-xl font-black text-indigo-700 dark:text-indigo-300 font-mono pt-1">
                      ➔ '{chunk.char}'
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Under-The-Hood Architecture */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0 mt-0.5">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <h4 className="font-extrabold text-zinc-900 dark:text-white">
            Client-Side Browser Sandbox Guarantee
          </h4>
          <p>
            All Base64 encoding and decoding operations execute 100% inside your web browser's JavaScript V8/WebAssembly heap using native <code className="text-indigo-600 dark:text-indigo-400 font-mono">TextEncoder</code>, <code className="text-indigo-600 dark:text-indigo-400 font-mono">TextDecoder</code>, and byte buffer arrays. Zero bytes of sensitive passwords, API keys, or uploaded files are ever transmitted to any external server.
          </p>
        </div>
      </div>
    </div>
  );
}
