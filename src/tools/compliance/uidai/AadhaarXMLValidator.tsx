import { useState, useMemo } from 'react';
import {
  FileCode,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Code,
  Fingerprint
} from 'lucide-react';

const SAMPLE_AUTH_25_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Auth uid="234567890128" rc="Y" tid="public" ac="STG001" sa="SUBSTG01" ver="2.5" txn="TXN:20241014:1829012" lk="MBwA...sample_license_key_hash...">
  <Uses pi="y" pa="n" pfa="n" bio="y" btp="FMR" pin="n" otp="n"/>
  <Meta udc="MANTRA1100" rdsId="MANTRA.RD" rdsVer="1.0.4" dpId="MANTRA" dc="c5b2910..." mi="MFS100" mc="IIw..."/>
  <Skey ci="20261014">MC0CGQCz9...base64_encrypted_session_key...</Skey>
  <Hmac>2Q1n...base64_hmac_hash...</Hmac>
  <Data type="X">PD94bWwgdmVyc2lvbj0...base64_encrypted_pid_data...</Data>
</Auth>`;

export default function AadhaarXMLValidator() {
  const [xmlInput, setXmlInput] = useState<string>(SAMPLE_AUTH_25_XML);
  const [copied, setCopied] = useState(false);

  // Auth 2.5 Schema Verification Engine
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const detectedAttrs: Record<string, string> = {};

    if (!xmlInput.trim()) {
      return { isValid: false, errors: ['XML payload is empty'], warnings: [], detectedAttrs: {} };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, 'application/xml');

      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return {
          isValid: false,
          errors: ['XML Syntax Error: Invalid XML document structure'],
          warnings: [],
          detectedAttrs: {}
        };
      }

      const root = doc.documentElement;
      if (root.tagName !== 'Auth' && root.tagName !== 'Kyc') {
        errors.push(`Invalid root element: Expected '<Auth>' or '<Kyc>', found '<${root.tagName}>'`);
      }

      // Check root attributes
      const ver = root.getAttribute('ver');
      detectedAttrs['ver'] = ver || '';
      if (ver !== '2.5') {
        errors.push(`Statutory Version Error: 'ver' must strictly be '2.5' under UIDAI circular (found: '${ver}')`);
      }

      const uid = root.getAttribute('uid');
      detectedAttrs['uid'] = uid ? `${uid.slice(0, 4)}...${uid.slice(-4)}` : '';
      if (!uid) {
        errors.push("Missing mandatory attribute: 'uid' (12-digit Aadhaar or 16-digit VID)");
      } else if (!/^\d{12}$/.test(uid) && !/^\d{16}$/.test(uid)) {
        errors.push("Invalid 'uid': Must be a 12-digit Aadhaar number or 16-digit Virtual ID");
      }

      const ac = root.getAttribute('ac');
      detectedAttrs['ac'] = ac || '';
      if (!ac) errors.push("Missing mandatory attribute: 'ac' (AUA Code)");

      const sa = root.getAttribute('sa');
      detectedAttrs['sa'] = sa || '';
      if (!sa) errors.push("Missing mandatory attribute: 'sa' (Sub-AUA Code)");

      const txn = root.getAttribute('txn');
      detectedAttrs['txn'] = txn || '';
      if (!txn) errors.push("Missing mandatory attribute: 'txn' (Transaction ID)");

      const lk = root.getAttribute('lk');
      detectedAttrs['lk'] = lk || '';
      if (!lk) errors.push("Missing mandatory attribute: 'lk' (AUA License Key)");

      // Child Elements
      const usesNode = doc.querySelector('Uses');
      if (!usesNode) {
        errors.push("Missing mandatory child element: '<Uses>'");
      } else {
        const bio = usesNode.getAttribute('bio');
        const btp = usesNode.getAttribute('btp');
        if (bio === 'y' && !btp) {
          warnings.push("When 'bio'='y', 'btp' (Biometric Type: FMR/FIR/IIR) is strongly recommended");
        }
      }

      const metaNode = doc.querySelector('Meta');
      if (!metaNode) {
        errors.push("Missing mandatory child element: '<Meta>' (Registered Device metadata)");
      }

      const skeyNode = doc.querySelector('Skey');
      if (!skeyNode) {
        errors.push("Missing mandatory child element: '<Skey>' (Encrypted Session Key)");
      } else {
        const ci = skeyNode.getAttribute('ci');
        detectedAttrs['ci'] = ci || '';
        if (!ci) {
          errors.push("Missing 'ci' attribute in '<Skey>' (UIDAI Public Certificate Identifier)");
        }
      }

      const hmacNode = doc.querySelector('Hmac');
      if (!hmacNode) {
        errors.push("Missing mandatory child element: '<Hmac>'");
      }

      const dataNode = doc.querySelector('Data');
      if (!dataNode) {
        errors.push("Missing mandatory child element: '<Data>' (Encrypted PID block)");
      } else {
        const type = dataNode.getAttribute('type');
        if (type !== 'X' && type !== 'P') {
          warnings.push("'<Data>' attribute 'type' should be 'X' (XML encrypted) or 'P' (Protobuf)");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        detectedAttrs
      };
    } catch (err: any) {
      return {
        isValid: false,
        errors: [`XML Parser Exception: ${err.message}`],
        warnings: [],
        detectedAttrs: {}
      };
    }
  }, [xmlInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              UIDAI Auth 2.5 & e-KYC 2.5 XML Schema Validator
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Lint and validate Auth 2.5 XML payloads against UIDAI specifications: `ac`, `sa`, `ver="2.5"`, &lt;Uses&gt;, and &lt;Skey&gt;.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Auth 2.5 Specifications</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: XML Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-600" />
                UIDAI Request Payload (XML)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setXmlInput(SAMPLE_AUTH_25_XML)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Load Sample Auth 2.5
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  title="Copy XML"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <textarea
              value={xmlInput}
              onChange={e => setXmlInput(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>
        </div>

        {/* Right: Validation Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`saas-card p-6 rounded-xl border ${
              validation.isValid
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-rose-500/30 bg-rose-500/5'
            } space-y-4`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Schema Status
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  validation.isValid
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {validation.isValid ? 'UIDAI 2.5 COMPLIANT' : `${validation.errors.length} SCHEMA ERRORS`}
              </span>
            </div>

            {/* Error List */}
            {validation.errors.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                  Mandatory Specification Gaps:
                </span>
                <ul className="space-y-1.5 text-xs text-rose-600 dark:text-rose-400">
                  {validation.errors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning List */}
            {validation.warnings.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  Best Practice Advisories:
                </span>
                <ul className="space-y-1.5 text-xs text-amber-600 dark:text-amber-400">
                  {validation.warnings.map((warn, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detected Attributes */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">API Version:</span>
                <span className="font-mono text-slate-900 dark:text-white">{validation.detectedAttrs['ver'] || 'Missing'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AUA Code (ac):</span>
                <span className="font-mono text-slate-900 dark:text-white">{validation.detectedAttrs['ac'] || 'Missing'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sub-AUA Code (sa):</span>
                <span className="font-mono text-slate-900 dark:text-white">{validation.detectedAttrs['sa'] || 'Missing'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Public Cert Identifier (ci):</span>
                <span className="font-mono text-slate-900 dark:text-white">{validation.detectedAttrs['ci'] || 'Missing'}</span>
              </div>
            </div>
          </div>

          <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Code className="w-4 h-4 text-amber-600" />
              Auth 2.5 Mandatory Transition
            </div>
            <p>
              UIDAI sunset legacy Auth 1.6 and 2.0 protocols. All AUAs, KUAs, and Sub-AUAs must strictly use Version 2.5 with Registered Devices (RD Service L0/L1) to prevent replay and biometric spoofing attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
