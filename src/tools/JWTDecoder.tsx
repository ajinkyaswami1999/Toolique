import { useState, useEffect } from 'react';
import { Key, Copy, Check, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

interface DecodedToken {
  header: object | null;
  payload: object | null;
  signature: string;
  isExpired: boolean | null;
  expirationTime: string | null;
  issuedTime: string | null;
  notBeforeTime: string | null;
}

export default function JWTDecoder() {
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');

  // Decoder State
  const [token, setToken] = useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  );
  const [decoded, setDecoded] = useState<DecodedToken>({
    header: null,
    payload: null,
    signature: '',
    isExpired: null,
    expirationTime: null,
    issuedTime: null,
    notBeforeTime: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedHeader, setCopiedHeader] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Encoder State
  const [encodeHeader, setEncodeHeader] = useState<string>(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)
  );
  const [encodePayload, setEncodePayload] = useState<string>(
    JSON.stringify(
      {
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022,
        exp: 2516239022,
      },
      null,
      2
    )
  );
  const [encodeSecret, setEncodeSecret] = useState<string>('your-256-bit-secret');
  const [encodedHeader, setEncodedHeader] = useState<string>('');
  const [encodedPayload, setEncodedPayload] = useState<string>('');
  const [encodedSignature, setEncodedSignature] = useState<string>('');
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Helper Functions
  const base64UrlEncode = (str: string) => {
    const base64 = btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const base64UrlDecode = (str: string) => {
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
  };

  async function signHMAC256(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const secretData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const key = await window.crypto.subtle.importKey(
      'raw',
      secretData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', key, messageData);
    const bytes = new Uint8Array(signature);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  // Decoder Effect
  useEffect(() => {
    setError(null);
    if (!token) {
      setDecoded({
        header: null,
        payload: null,
        signature: '',
        isExpired: null,
        expirationTime: null,
        issuedTime: null,
        notBeforeTime: null,
      });
      return;
    }

    const segments = token.trim().split('.');
    if (segments.length !== 3) {
      setError('A valid JWT must have 3 segments separated by dots (.)');
      return;
    }

    try {
      const headerDecoded = JSON.parse(base64UrlDecode(segments[0]));
      const payloadDecoded = JSON.parse(base64UrlDecode(segments[1]));
      const signature = segments[2];

      let isExpired = null;
      let expirationTime = null;
      let issuedTime = null;
      let notBeforeTime = null;

      if (payloadDecoded.exp) {
        const expDate = new Date(payloadDecoded.exp * 1000);
        expirationTime = expDate.toLocaleString('en-IN');
        isExpired = expDate.getTime() < Date.now();
      }

      if (payloadDecoded.iat) {
        issuedTime = new Date(payloadDecoded.iat * 1000).toLocaleString('en-IN');
      }

      if (payloadDecoded.nbf) {
        notBeforeTime = new Date(payloadDecoded.nbf * 1000).toLocaleString('en-IN');
      }

      setDecoded({
        header: headerDecoded,
        payload: payloadDecoded,
        signature,
        isExpired,
        expirationTime,
        issuedTime,
        notBeforeTime,
      });
    } catch (err) {
      setError('Failed to parse JWT segments. Please verify that the token is base64url encoded JSON.');
    }
  }, [token]);

  // Encoder Effect
  useEffect(() => {
    let hObj: object;
    try {
      hObj = JSON.parse(encodeHeader);
      setHeaderError(null);
    } catch (e: any) {
      setHeaderError(`Invalid Header JSON: ${e.message}`);
      return;
    }

    let pObj: object;
    try {
      pObj = JSON.parse(encodePayload);
      setPayloadError(null);
    } catch (e: any) {
      setPayloadError(`Invalid Payload JSON: ${e.message}`);
      return;
    }

    const hB64 = base64UrlEncode(JSON.stringify(hObj));
    const pB64 = base64UrlEncode(JSON.stringify(pObj));
    setEncodedHeader(hB64);
    setEncodedPayload(pB64);

    const unsigned = `${hB64}.${pB64}`;
    signHMAC256(unsigned, encodeSecret)
      .then((sig) => {
        setEncodedSignature(sig);
      })
      .catch((err) => {
        console.error('Signing error:', err);
      });
  }, [encodeHeader, encodePayload, encodeSecret]);

  const copySection = (data: object | null, setCopied: (v: boolean) => void) => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('decode')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'decode'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          JWT Decoder
        </button>
        <button
          onClick={() => setActiveTab('encode')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'encode'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          JWT Encoder
        </button>
      </div>

      {activeTab === 'decode' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 saas-card flex flex-col space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Encoded JWT Token
            </span>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your encoded JWT string here..."
              className="w-full flex-grow min-h-[380px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-mono text-zinc-700 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none resize-none break-all"
            />
            <button
              onClick={() => setToken('')}
              className="text-xs font-semibold text-rose-500 hover:underline text-right cursor-pointer"
            >
              Clear Token
            </button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {error ? (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Invalid Token Structure</h4>
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              <>
                {decoded.payload && (
                  <div className="p-4 saas-card flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                      {decoded.isExpired === true ? (
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                      ) : decoded.isExpired === false ? (
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                          <Clock className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Token Expiration Status
                        </div>
                        <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                          {decoded.isExpired === true
                            ? 'Token has expired'
                            : decoded.isExpired === false
                            ? 'Token is active / valid'
                            : 'No expiry claim found'}
                        </div>
                      </div>
                    </div>

                    {decoded.expirationTime && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-800 pl-4 py-1">
                        <div>
                          <strong>Expiry:</strong> {decoded.expirationTime}
                        </div>
                        {decoded.issuedTime && (
                          <div>
                            <strong>Issued:</strong> {decoded.issuedTime}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {decoded.header && (
                  <div className="p-6 saas-card border-rose-500/20 dark:border-rose-500/10 space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">
                        Header: Algorithm & Token Type
                      </span>
                      <button
                        onClick={() => copySection(decoded.header, setCopiedHeader)}
                        className="text-xs font-semibold text-zinc-400 hover:text-indigo-650 dark:text-zinc-500 dark:hover:text-indigo-400 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedHeader ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedHeader ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl overflow-x-auto">
                      {JSON.stringify(decoded.header, null, 2)}
                    </pre>
                  </div>
                )}

                {decoded.payload && (
                  <div className="p-6 saas-card border-teal-500/20 dark:border-teal-500/10 space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                        Payload: Data Claims
                      </span>
                      <button
                        onClick={() => copySection(decoded.payload, setCopiedPayload)}
                        className="text-xs font-semibold text-zinc-400 hover:text-indigo-650 dark:text-zinc-500 dark:hover:text-indigo-400 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl overflow-x-auto">
                      {JSON.stringify(decoded.payload, null, 2)}
                    </pre>
                  </div>
                )}

                {decoded.signature && (
                  <div className="p-6 saas-card border-amber-500/20 dark:border-amber-500/10 space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                        Signature / Cryptographic segment
                      </span>
                    </div>
                    <pre className="text-xs font-mono text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl overflow-x-auto break-all whitespace-pre-wrap">
                      HMACSHA256(
                        base64UrlEncode(header) + "." +
                        base64UrlEncode(payload),
                        <span className="text-amber-500 dark:text-amber-400">"{decoded.signature.slice(0, 30)}..."</span>
                      )
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 saas-card flex flex-col space-y-3">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                Header (Algorithm & Token Type)
              </span>
              <textarea
                value={encodeHeader}
                onChange={(e) => setEncodeHeader(e.target.value)}
                className={`w-full min-h-[120px] p-3 rounded-xl border ${
                  headerError ? 'border-rose-500 focus:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                } bg-transparent text-xs font-mono text-zinc-700 dark:text-zinc-200 focus:outline-none resize-y`}
                placeholder="Header JSON..."
              />
              {headerError && (
                <span className="text-[11px] font-semibold text-rose-500">{headerError}</span>
              )}
            </div>

            <div className="p-6 saas-card flex flex-col space-y-3">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                Payload (Data Claims)
              </span>
              <textarea
                value={encodePayload}
                onChange={(e) => setEncodePayload(e.target.value)}
                className={`w-full min-h-[220px] p-3 rounded-xl border ${
                  payloadError ? 'border-rose-500 focus:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                } bg-transparent text-xs font-mono text-zinc-700 dark:text-zinc-200 focus:outline-none resize-y`}
                placeholder="Payload JSON..."
              />
              {payloadError && (
                <span className="text-[11px] font-semibold text-rose-500">{payloadError}</span>
              )}
            </div>

            <div className="p-6 saas-card flex flex-col space-y-3">
              <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                HMAC-SHA256 Signature Secret
              </span>
              <input
                type="text"
                value={encodeSecret}
                onChange={(e) => setEncodeSecret(e.target.value)}
                className="saas-input font-mono text-xs"
                placeholder="Secret key..."
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 saas-card flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">
                  Live Generated JWT Token
                </span>
                <button
                  onClick={() =>
                    copyText(`${encodedHeader}.${encodedPayload}.${encodedSignature}`, setCopiedToken)
                  }
                  disabled={!!headerError || !!payloadError}
                  className="text-xs font-semibold text-zinc-400 hover:text-indigo-650 dark:text-zinc-500 dark:hover:text-indigo-400 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied Token' : 'Copy Token'}</span>
                </button>
              </div>

              {headerError || payloadError ? (
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/10 text-xs font-semibold text-rose-500">
                  Please correct the JSON syntax errors in the editors to generate the token.
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-xs font-mono break-all leading-relaxed select-all">
                  <span className="text-rose-500 dark:text-rose-450 font-bold">{encodedHeader}</span>
                  <span className="text-zinc-400">.</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">{encodedPayload}</span>
                  <span className="text-zinc-400">.</span>
                  <span className="text-amber-500 dark:text-amber-450 font-bold">{encodedSignature}</span>
                </div>
              )}

              <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed">
                <p>
                  This token is dynamically assembled by base64url encoding the Header and Payload, then signing the result with HMAC-SHA256 and your Secret.
                </p>
              </div>
            </div>

            {!headerError && !payloadError && (
              <div className="p-6 saas-card border-amber-500/20 dark:border-amber-500/10 space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                    Signature Verification Formula
                  </span>
                </div>
                <pre className="text-xs font-mono text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl overflow-x-auto break-all whitespace-pre-wrap">
                  HMACSHA256(
                    base64UrlEncode(header) + "." +
                    base64UrlEncode(payload),
                    <span className="text-amber-500 dark:text-amber-400">"{encodeSecret}"</span>
                  )
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5">
          <Key className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <h4 className="font-bold text-zinc-800 dark:text-white mb-0.5">Security & Privacy Note</h4>
          <p>
            JWT components are processed entirely in your browser memory. No tokens, payloads, or signing secrets are sent to any remote servers, maintaining complete confidentiality for sensitive cryptographic credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

