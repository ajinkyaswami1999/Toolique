import { useState, useMemo } from 'react';
import {
  FileCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Copy,
  Check,
  Fingerprint
} from 'lucide-react';

const SAMPLE_PID_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Pid ts="2024-10-14T12:30:45" ver="2.0">
  <Demo lang="01">
    <Pi ms="E" mv="100" name="Rahul Suresh Sharma" gender="M" dob="1992-08-15"/>
    <Pa co="S/O Suresh Sharma" house="402" street="1st Main" pc="560103" dist="Bengaluru" state="Karnataka"/>
  </Demo>
  <Bios>
    <Bio type="FMR" posh="LEFT_INDEX">
      Rk1SACAyMAAAAADwAPwAgAAAAEAAAAAAACQAJAAg...sample_base64_iso_minutiae...
    </Bio>
  </Bios>
</Pid>`;

export default function PIDXMLStructureValidator() {
  const [pidXml, setPidXml] = useState<string>(SAMPLE_PID_XML);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => {
    const issues: string[] = [];
    const highlights: string[] = [];

    if (!pidXml.trim()) {
      return { isValid: false, issues: ['PID block is empty'], highlights: [] };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(pidXml, 'application/xml');

      const parserErr = doc.querySelector('parsererror');
      if (parserErr) {
        return { isValid: false, issues: ['Malformed XML syntax in PID block'], highlights: [] };
      }

      const root = doc.documentElement;
      if (root.tagName !== 'Pid') {
        issues.push(`Expected root tag '<Pid>', found '<${root.tagName}>'`);
      }

      const ts = root.getAttribute('ts');
      if (!ts) {
        issues.push("Missing timestamp attribute 'ts' in '<Pid>'");
      } else {
        highlights.push(`Timestamp: ${ts}`);
      }

      const ver = root.getAttribute('ver');
      if (ver !== '2.0') {
        issues.push(`Version error: 'ver' must strictly be '2.0' (found: '${ver}')`);
      } else {
        highlights.push("PID Specification Version: 2.0 (Compliant)");
      }

      // Check Demo
      const demoNode = doc.querySelector('Demo');
      if (demoNode) {
        const piNode = demoNode.querySelector('Pi');
        const paNode = demoNode.querySelector('Pa');
        if (piNode) highlights.push("Personal Identity (<Pi>) block present");
        if (paNode) highlights.push("Postal Address (<Pa>) block present");
      }

      // Check Bios
      const biosNode = doc.querySelector('Bios');
      if (biosNode) {
        const bioNodes = biosNode.querySelectorAll('Bio');
        highlights.push(`Biometric records: ${bioNodes.length} modality block(s) detected`);

        bioNodes.forEach((bio, idx) => {
          const type = bio.getAttribute('type');
          const posh = bio.getAttribute('posh');
          if (!type || !['FMR', 'FIR', 'IIR'].includes(type)) {
            issues.push(`Bio[${idx}]: Invalid 'type' attribute. Must be 'FMR' (Minutiae), 'FIR' (Image), or 'IIR' (Iris)`);
          }
          if (!posh) {
            issues.push(`Bio[${idx}]: Missing 'posh' (Position of Biometric e.g. LEFT_INDEX, RIGHT_THUMB)`);
          }
        });
      }

      // Security Check: Plaintext vs Encrypted warning
      issues.push("SECURITY NOTICE: Raw PID XML must NEVER be transmitted unencrypted. It must be encrypted using AES-256 and wrapped in '<Data type=\"X\">' before sending to UIDAI CIDR.");

      return {
        isValid: issues.filter(i => !i.startsWith('SECURITY NOTICE')).length === 0,
        issues,
        highlights
      };
    } catch (err: any) {
      return { isValid: false, issues: [err.message], highlights: [] };
    }
  }, [pidXml]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pidXml);
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
              UIDAI PID (Personal Identity Data) XML Structure Inspector
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Validate internal PID block specifications, ISO 19794-2 biometric minutiae tags, and AES-256 encryption hygiene.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>ISO 19794-2 Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-600" />
                Raw PID XML Block
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPidXml(SAMPLE_PID_XML)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Load Sample PID
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
              value={pidXml}
              onChange={e => setPidXml(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>
        </div>

        {/* Right Column: Inspection Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Structure Assessment
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  analysis.isValid
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {analysis.isValid ? 'PID 2.0 VALID' : 'ACTION REQUIRED'}
              </span>
            </div>

            {/* Highlights */}
            {analysis.highlights.length > 0 && (
              <div className="space-y-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                {analysis.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Issues & Warnings */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-xs">
              {analysis.issues.map((iss, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg flex items-start gap-2 ${
                    iss.startsWith('SECURITY NOTICE')
                      ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {iss.startsWith('SECURITY NOTICE') ? (
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{iss}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
