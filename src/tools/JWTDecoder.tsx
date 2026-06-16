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

  const base64UrlDecode = (str: string) => {
    // Replace non-url compatible characters and pad base64
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

      // Extract time claims (which are seconds since Epoch)
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

  const copySection = (data: object | null, setCopied: (v: boolean) => void) => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Token Input Section (40% width) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Encoded JWT Token
          </span>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your encoded JWT string here..."
            className="w-full flex-grow min-h-[350px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none resize-none break-all"
          />
          <button
            onClick={() => setToken('')}
            className="text-xs font-semibold text-rose-500 hover:underline text-right"
          >
            Clear Token
          </button>
        </div>

        {/* Decoded Content Section (70% width) */}
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
              {/* Claims / Expiration Summary */}
              {decoded.payload && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap gap-4 items-center justify-between">
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
                      <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500">
                        <Clock className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Token Expiration Status
                      </div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {decoded.isExpired === true
                          ? 'Token has expired'
                          : decoded.isExpired === false
                          ? 'Token is active / valid'
                          : 'No expiry claim found'}
                      </div>
                    </div>
                  </div>

                  {decoded.expirationTime && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-4 py-1">
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

              {/* Decoded Header */}
              {decoded.header && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-500/20 dark:border-red-500/10 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest">
                      Header: Algorithm & Token Type
                    </span>
                    <button
                      onClick={() => copySection(decoded.header, setCopiedHeader)}
                      className="text-xs font-semibold text-slate-400 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 flex items-center gap-1.5 transition"
                    >
                      {copiedHeader ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHeader ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl overflow-x-auto">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
              )}

              {/* Decoded Payload */}
              {decoded.payload && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-teal-500/20 dark:border-teal-500/10 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                      Payload: Data Claims
                    </span>
                    <button
                      onClick={() => copySection(decoded.payload, setCopiedPayload)}
                      className="text-xs font-semibold text-slate-400 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 flex items-center gap-1.5 transition"
                    >
                      {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl overflow-x-auto">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Signature Info */}
              {decoded.signature && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/20 dark:border-amber-500/10 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                      Signature / Cryptographic segment
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl overflow-x-auto break-all whitespace-pre-wrap">
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

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-0.5">
          <Key className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <h4 className="font-bold text-slate-800 dark:text-white mb-0.5">Note on JWT Validation</h4>
          <p>
            This tool parses Header and Payload claims using client-side Javascript. It does not send your token to any server, ensuring credentials remain completely confidential. Since verifying a JWT signature requires the secret key, this tool only verifies the structure and expiration claims.
          </p>
        </div>
      </div>
    </div>
  );
}

