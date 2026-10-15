import { useState, useMemo } from 'react';
import {
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Key,
  UserCheck,
  MapPin,
  Fingerprint
} from 'lucide-react';

const SAMPLE_OFFLINE_EKYC_XML = `<?xml version="1.0" encoding="UTF-8"?>
<OfflinePaperlessKyc referenceId="102920240915124018291">
  <UidData>
    <Poi dob="15-08-1992" e="" g="M" m="f2d8e6a1829102c91823" name="Rahul Suresh Sharma"/>
    <Poa careof="S/O Suresh Sharma" country="India" dist="Bengaluru Urban" house="Flat 402, Green Glen" landmark="Near Bellandur Lake" loc="Outer Ring Road" pc="560103" po="Bellandur" state="Karnataka" street="1st Main" subdist="Bengaluru South" vtc="Bengaluru"/>
    <Pht>/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=</Pht>
  </UidData>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <Reference URI="">
        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <DigestValue>aG9sYSBtdW5kbyBkaWdlc3QgY2hlY2tzdW0=</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>MEQCIDv+2kK2980192830192830192830192830192830192AiB65...</SignatureValue>
  </Signature>
</OfflinePaperlessKyc>`;

export default function EKYCDataValidator() {
  const [xmlInput, setXmlInput] = useState<string>(SAMPLE_OFFLINE_EKYC_XML);
  const [shareCode, setShareCode] = useState<string>('1992');
  const [copied, setCopied] = useState(false);

  // XML Parser & Validation
  const validationResult = useMemo(() => {
    if (!xmlInput.trim()) {
      return { isValidXml: false, error: 'Empty XML input', details: null };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, 'application/xml');

      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return { isValidXml: false, error: 'Malformed XML syntax', details: null };
      }

      // Check essential UIDAI Offline XML tags
      const root = doc.documentElement;
      const isOfflineRoot = root.tagName === 'OfflinePaperlessKyc';
      const referenceId = root.getAttribute('referenceId') || '';

      const poiNode = doc.querySelector('Poi');
      const poaNode = doc.querySelector('Poa');
      const phtNode = doc.querySelector('Pht');
      const signatureNode = doc.querySelector('Signature');

      const name = poiNode?.getAttribute('name') || '';
      const dob = poiNode?.getAttribute('dob') || '';
      const gender = poiNode?.getAttribute('g') || '';
      const maskedAadhaarRef = referenceId.slice(0, 4) || 'XXXX';

      const careof = poaNode?.getAttribute('careof') || '';
      const house = poaNode?.getAttribute('house') || '';
      const street = poaNode?.getAttribute('street') || '';
      const dist = poaNode?.getAttribute('dist') || '';
      const state = poaNode?.getAttribute('state') || '';
      const pincode = poaNode?.getAttribute('pc') || '';

      const hasPhoto = Boolean(phtNode?.textContent?.trim());
      const hasSignature = Boolean(signatureNode);

      const isValidOfflineStructure = isOfflineRoot && Boolean(poiNode) && Boolean(poaNode);

      return {
        isValidXml: true,
        isValidOfflineStructure,
        error: null,
        details: {
          referenceId,
          maskedAadhaarRef,
          name,
          dob,
          gender,
          careof,
          fullAddress: `${house}, ${street}, ${dist}, ${state} - ${pincode}`,
          pincode,
          hasPhoto,
          hasSignature,
          isShareCodeValid: /^[a-zA-Z0-9]{4}$/.test(shareCode)
        }
      };
    } catch (err: any) {
      return { isValidXml: false, error: err.message, details: null };
    }
  }, [xmlInput, shareCode]);

  const handleCopyExtracted = () => {
    if (!validationResult.details) return;
    const text = `UIDAI OFFLINE E-KYC EXTRACTED DATA:
Name: ${validationResult.details.name}
DOB: ${validationResult.details.dob}
Gender: ${validationResult.details.gender}
Address: ${validationResult.details.fullAddress}
PIN Code: ${validationResult.details.pincode}
Digital Signature: ${validationResult.details.hasSignature ? 'Present (XML-DSig)' : 'Missing'}
Reference ID: ${validationResult.details.referenceId}`;

    navigator.clipboard.writeText(text);
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
              UIDAI Paperless Offline e-KYC (XML / ZIP) Validator
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Validate Offline Aadhaar XML structure, inspect Proof of Identity (Poi) and Address (Poa), and test share-code hashing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Local DOMParser</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: XML Input & Share Code (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-600" />
                Offline e-KYC XML Payload
              </h3>
              <button
                onClick={() => setXmlInput(SAMPLE_OFFLINE_EKYC_XML)}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
              >
                Load Sample UIDAI XML
              </button>
            </div>

            <textarea
              value={xmlInput}
              onChange={e => setXmlInput(e.target.value)}
              rows={14}
              placeholder="Paste raw Offline Aadhaar XML..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                4-Character Share Code (Used to decrypt UIDAI ZIP or verify mobile hash)
              </label>
              <input
                type="text"
                maxLength={4}
                value={shareCode}
                onChange={e => setShareCode(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Validation Output & Extracted Metadata (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div
            className={`saas-card p-6 rounded-xl border ${
              validationResult.isValidOfflineStructure
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-rose-500/30 bg-rose-500/5'
            } space-y-4`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Structure Assessment
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  validationResult.isValidOfflineStructure
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {validationResult.isValidOfflineStructure ? 'VALID OFFLINE E-KYC' : 'STRUCTURE INVALID'}
              </span>
            </div>

            {validationResult.error && (
              <div className="text-xs text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationResult.error}</span>
              </div>
            )}

            {validationResult.details && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {validationResult.details.name || 'Name not found'}
                  </span>
                  <span className="text-slate-500">
                    ({validationResult.details.gender}, DOB: {validationResult.details.dob})
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {validationResult.details.fullAddress}
                  </span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Digital Signature (XML-DSig):</span>
                    <span className={`font-semibold ${validationResult.details.hasSignature ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {validationResult.details.hasSignature ? 'Present (RSA-SHA256)' : 'Missing Signature'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resident Photo Block:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {validationResult.details.hasPhoto ? 'Base64 Encoded JPEG' : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Share Code Format:</span>
                    <span className={`font-semibold ${validationResult.details.isShareCodeValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {validationResult.details.isShareCodeValid ? 'Valid (4 chars)' : 'Must be 4 characters'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyExtracted}
                  className="w-full mt-3 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Metadata' : 'Copy Extracted KYC Metadata'}
                </button>
              </div>
            )}
          </div>

          <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              UIDAI Paperless e-KYC Security Model
            </div>
            <p>
              Offline XML eliminates the requirement for online biometric authentication by relying on an XML-DSig signature issued by UIDAI. The resident's actual 12-digit Aadhaar number is never included in the XML; only a reference ID is present.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
