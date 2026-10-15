import { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Sliders,
  Calendar,
  Fingerprint
} from 'lucide-react';

// Levenshtein Distance
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Jaro-Winkler Similarity
function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;

  // Winkler prefix boost (up to 4 chars)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, len1, len2); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1.0 - jaro);
}

// Token Sort Ratio (handles inverted names e.g. "Rahul Sharma" vs "Sharma Rahul")
function tokenSortRatio(s1: string, s2: string): number {
  const clean1 = s1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).sort().join(' ');
  const clean2 = s2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).sort().join(' ');

  const dist = levenshteinDistance(clean1, clean2);
  const maxLen = Math.max(clean1.length, clean2.length);
  if (maxLen === 0) return 1.0;
  return Math.max(0, 1 - dist / maxLen);
}

export default function KYCNameDOBMatchAnalyzer() {
  const [doc1Name, setDoc1Name] = useState('Rahul Suresh Sharma');
  const [doc2Name, setDoc2Name] = useState('Sharma Rahul S');
  const [doc1Dob, setDoc1Dob] = useState('1992-08-15');
  const [doc2Dob, setDoc2Dob] = useState('1992-08-15');

  const [copied, setCopied] = useState(false);

  // Analysis Engine
  const matchResult = useMemo(() => {
    const s1 = doc1Name.toLowerCase().trim();
    const s2 = doc2Name.toLowerCase().trim();

    // 1. Name Metrics
    const jwScore = Math.round(jaroWinkler(s1, s2) * 100);
    const tsScore = Math.round(tokenSortRatio(s1, s2) * 100);
    const levDist = levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    const levScore = maxLen > 0 ? Math.round((1 - levDist / maxLen) * 100) : 100;

    // Combined Name Score (Weighted: 60% Token Sort + 40% Jaro-Winkler)
    const combinedNameScore = Math.round(tsScore * 0.6 + jwScore * 0.4);

    // 2. DOB Match Engine
    let dobScore = 0;
    let dobDiagnosis = 'DOB Mismatch';

    if (doc1Dob && doc2Dob) {
      if (doc1Dob === doc2Dob) {
        dobScore = 100;
        dobDiagnosis = 'Exact Date Match (100%)';
      } else {
        const [y1, m1, d1] = doc1Dob.split('-');
        const [y2, m2, d2] = doc2Dob.split('-');

        if (y1 === y2 && m1 === d2 && d1 === m2) {
          dobScore = 90;
          dobDiagnosis = 'Day/Month Format Swap Inversion Detected (e.g., DD/MM vs MM/DD)';
        } else if (y1 === y2) {
          dobScore = 70;
          dobDiagnosis = 'Birth Year Matches (Common in Legacy Aadhaar YOB Only Cards)';
        } else {
          dobScore = 0;
          dobDiagnosis = 'Year and Date Discrepancy';
        }
      }
    }

    // 3. Composite KYC Decision Score (70% Name + 30% DOB)
    const compositeScore = Math.round(combinedNameScore * 0.7 + dobScore * 0.3);

    let decision: 'AUTO_APPROVED' | 'MANUAL_REVIEW' | 'REJECTED' = 'AUTO_APPROVED';
    if (compositeScore >= 85) decision = 'AUTO_APPROVED';
    else if (compositeScore >= 65) decision = 'MANUAL_REVIEW';
    else decision = 'REJECTED';

    return {
      jwScore,
      tsScore,
      levScore,
      combinedNameScore,
      dobScore,
      dobDiagnosis,
      compositeScore,
      decision
    };
  }, [doc1Name, doc2Name, doc1Dob, doc2Dob]);

  const loadPreset = (type: 'inverted' | 'initials' | 'yob_only' | 'typo') => {
    if (type === 'inverted') {
      setDoc1Name('Amit Kumar Verma');
      setDoc2Name('Verma Amit Kumar');
      setDoc1Dob('1988-11-20');
      setDoc2Dob('1988-11-20');
    } else if (type === 'initials') {
      setDoc1Name('K. Venkatesh Iyer');
      setDoc2Name('Kalyanaraman Venkatesh Iyer');
      setDoc1Dob('1994-04-12');
      setDoc2Dob('1994-04-12');
    } else if (type === 'yob_only') {
      setDoc1Name('Sunita Rani');
      setDoc2Name('Sunita Rani');
      setDoc1Dob('1975-01-01');
      setDoc2Dob('1975-06-18');
    } else if (type === 'typo') {
      setDoc1Name('Mohammad Rizwan');
      setDoc2Name('Mohammed Rizwaan');
      setDoc1Dob('1996-03-05');
      setDoc2Dob('1996-05-03');
    }
  };

  const handleCopyAudit = () => {
    const text = `=====================================================
KYC IDENTITY & NAME/DOB MATCH AUDIT RECORD
=====================================================
Primary Document Name: ${doc1Name}
Secondary Document Name: ${doc2Name}
Primary Document DOB: ${doc1Dob}
Secondary Document DOB: ${doc2Dob}

MATCHING METRICS:
- Token Sort Similarity (Order Inversion): ${matchResult.tsScore}%
- Jaro-Winkler Similarity: ${matchResult.jwScore}%
- Combined Name Score: ${matchResult.combinedNameScore}%
- DOB Verification Score: ${matchResult.dobScore}% (${matchResult.dobDiagnosis})
- Weighted Composite Score: ${matchResult.compositeScore}%

FINAL ONBOARDING DECISION:
[${matchResult.decision.replace('_', ' ')}]
- Straight-Through Processing (STP) Threshold: >= 85%
- Manual Compliance Review Threshold: 65% - 84%
=====================================================`;

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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              KYC Name & Date of Birth (DOB) Fuzzy Match Analyzer
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Multi-metric Jaro-Winkler, Token Sort, and DOB tolerance comparison between Aadhaar, PAN, and Bank Records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Deterministic Client Algorithms</span>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Test Scenarios:</span>
        <button
          onClick={() => loadPreset('inverted')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
        >
          Inverted Name Order
        </button>
        <button
          onClick={() => loadPreset('initials')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
        >
          Initials vs Full Name
        </button>
        <button
          onClick={() => loadPreset('yob_only')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
        >
          Year of Birth (YOB) Only
        </button>
        <button
          onClick={() => loadPreset('typo')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
        >
          Phonetic Typo & Day/Month Swap
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Columns (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 rounded-xl space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Document Records to Compare
            </h3>

            {/* Document 1 (Aadhaar) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5" />
                Record A (e.g. Aadhaar / UIDAI Data)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={doc1Name}
                    onChange={e => setDoc1Name(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={doc1Dob}
                    onChange={e => setDoc1Dob(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Document 2 (PAN / Bank) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Record B (e.g. PAN Card / Bank Account)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={doc2Name}
                    onChange={e => setDoc2Name(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={doc2Dob}
                    onChange={e => setDoc2Dob(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="saas-card p-5 rounded-xl space-y-3 text-xs">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-600" />
              Algorithm Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Token Sort Ratio (Handles Inverted Order):</span>
                <span className="font-bold text-slate-900 dark:text-white">{matchResult.tsScore}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Jaro-Winkler Similarity (Prefix Weighted):</span>
                <span className="font-bold text-slate-900 dark:text-white">{matchResult.jwScore}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Levenshtein Edit Distance:</span>
                <span className="font-bold text-slate-900 dark:text-white">{matchResult.levScore}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">DOB Tolerance Result:</span>
                <span className="font-bold text-emerald-600">{matchResult.dobDiagnosis} ({matchResult.dobScore}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Decision Engine & Audit Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`saas-card p-6 rounded-xl border ${
              matchResult.decision === 'AUTO_APPROVED'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : matchResult.decision === 'MANUAL_REVIEW'
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-rose-500/30 bg-rose-500/5'
            } space-y-4`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                KYC Decision Engine
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  matchResult.decision === 'AUTO_APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : matchResult.decision === 'MANUAL_REVIEW'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {matchResult.decision.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Composite Match Score</span>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                {matchResult.compositeScore}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    matchResult.compositeScore >= 85
                      ? 'bg-emerald-500'
                      : matchResult.compositeScore >= 65
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${matchResult.compositeScore}%` }}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {matchResult.decision === 'AUTO_APPROVED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : matchResult.decision === 'MANUAL_REVIEW' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="text-slate-700 dark:text-slate-300">
                  {matchResult.decision === 'AUTO_APPROVED'
                    ? 'Straight-Through Processing (STP) Approved: High confidence match.'
                    : matchResult.decision === 'MANUAL_REVIEW'
                    ? 'Route to Compliance Queue: Minor naming inversion or DOB format variation.'
                    : 'KYC Onboarding Blocked: Substantial discrepancy between documents.'}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyAudit}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Audit Trail' : 'Copy KYC Match Audit Trail'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
