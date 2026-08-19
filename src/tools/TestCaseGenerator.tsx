import { useState } from 'react';
import { Clipboard, Check, FileSpreadsheet, Play as StartIcon } from 'lucide-react';

interface TestCase {
  id: string;
  title: string;
  type: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: 'High' | 'Medium' | 'Low';
}

const FEATURE_TEMPLATES: Record<string, { name: string; cases: Omit<TestCase, 'id'>[] }> = {
  login: {
    name: 'User Authentication / Login',
    cases: [
      {
        title: 'Successful Login with Valid Credentials',
        type: 'Functional',
        preconditions: 'User is on the login page. Account is active.',
        steps: [
          'Enter a registered email address in the Email field.',
          'Enter the correct password in the Password field.',
          'Click the Login button.'
        ],
        expectedResult: 'User is successfully authenticated and redirected to the dashboard. Session is established.',
        priority: 'High'
      },
      {
        title: 'Login Failure with Invalid Password',
        type: 'Negative / Security',
        preconditions: 'User is on the login page.',
        steps: [
          'Enter a valid registered email address.',
          'Enter an incorrect password.',
          'Click the Login button.'
        ],
        expectedResult: 'Error message displays: "Invalid credentials." User remains on the login page.',
        priority: 'High'
      },
      {
        title: 'Empty Inputs Validation',
        type: 'Validation',
        preconditions: 'User is on the login page.',
        steps: [
          'Leave email and password fields empty.',
          'Click the Login button.'
        ],
        expectedResult: 'Validation errors trigger for both fields: "Email is required" and "Password is required".',
        priority: 'Medium'
      },
      {
        title: 'SQL Injection Vulnerability Test in Email Field',
        type: 'Security',
        preconditions: 'User is on the login page.',
        steps: [
          "Enter text: admin' OR '1'='1 in the Email field.",
          'Enter any random text in the Password field.',
          'Click the Login button.'
        ],
        expectedResult: 'Login fails safely. The application does not throw DB error details or authenticate the user.',
        priority: 'High'
      }
    ]
  },
  signup: {
    name: 'User Registration / Sign Up',
    cases: [
      {
        title: 'Successful Sign Up with Valid Details',
        type: 'Functional',
        preconditions: 'Visitor is on the Sign Up page.',
        steps: [
          'Enter unique name, email address, and strong password.',
          'Check the "Agree to Terms" checkbox.',
          'Click the Sign Up button.'
        ],
        expectedResult: 'Account is successfully created. Verification email is sent. User is redirected to verification page.',
        priority: 'High'
      },
      {
        title: 'Sign Up with Duplicate Email Address',
        type: 'Negative',
        preconditions: 'Visitor is on the Sign Up page. An account already exists for "user@example.com".',
        steps: [
          'Enter name and "user@example.com" in Email.',
          'Enter valid password and click Sign Up.'
        ],
        expectedResult: 'Validation error: "An account with this email address already exists."',
        priority: 'High'
      },
      {
        title: 'Password Strength Indicator Test',
        type: 'UI / Security',
        preconditions: 'Visitor is on the Sign Up page.',
        steps: [
          'Type weak password "12345" and observe strength bar.',
          'Type moderate password "Password123" and observe strength bar.',
          'Type strong password "P@$$w0rd2026!" and observe strength bar.'
        ],
        expectedResult: 'Strength indicators dynamically change colors/grades (Weak, Medium, Strong) as criteria are met.',
        priority: 'Medium'
      }
    ]
  },
  payment: {
    name: 'E-Commerce Payment Checkout',
    cases: [
      {
        title: 'Successful Transaction via Credit Card',
        type: 'Integration',
        preconditions: 'User has items in cart and is on payment checkout screen.',
        steps: [
          'Select Credit Card as payment method.',
          'Enter valid 16-digit card number, CVV, and expiry date.',
          'Click Submit Payment.'
        ],
        expectedResult: 'Payment is authorized. Order confirmation page displays. Cart is cleared. Transaction record is logged.',
        priority: 'High'
      },
      {
        title: 'Transaction Declined due to Insufficient Funds',
        type: 'Negative / Error Handling',
        preconditions: 'User has items in cart. Card has insufficient balance.',
        steps: [
          'Select Credit Card and enter card details.',
          'Click Submit Payment.'
        ],
        expectedResult: 'Payment is declined. Helpful error message displays: "Transaction failed: Insufficient funds." Cart remains intact.',
        priority: 'High'
      },
      {
        title: 'Expired Card Verification',
        type: 'Validation',
        preconditions: 'User is on the payment screen.',
        steps: [
          'Enter credit card details with an expiry date in the past.',
          'Attempt payment submission.'
        ],
        expectedResult: 'Validation error displayed on screen: "Card has expired". Submission blocked.',
        priority: 'High'
      }
    ]
  },
  fileupload: {
    name: 'File Upload & Verification',
    cases: [
      {
        title: 'Upload Valid PDF Document within Size Limit',
        type: 'Functional',
        preconditions: 'User is on the document upload screen. Document size is < 5MB.',
        steps: [
          'Click browse and select a valid 2MB PDF file.',
          'Click the Upload button.'
        ],
        expectedResult: 'File uploads successfully. Progress bar reaches 100%. Success message displays. File name appears in listing.',
        priority: 'High'
      },
      {
        title: 'Upload File Exceeding Size Limit',
        type: 'Negative / Boundary',
        preconditions: 'User is on the upload screen. File size limit is 5MB.',
        steps: [
          'Select a 6.2MB document file.',
          'Attempt to upload.'
        ],
        expectedResult: 'Upload is blocked. Validation alert displays: "File size exceeds the maximum limit of 5MB."',
        priority: 'Medium'
      },
      {
        title: 'Upload Unsupported File Format',
        type: 'Negative / Security',
        preconditions: 'Only .pdf, .jpg, and .png formats are allowed.',
        steps: [
          'Select a executable script file "malicious.exe".',
          'Attempt upload.'
        ],
        expectedResult: 'File upload is rejected immediately. Validation message: "Invalid file format. Only PDF, JPG, and PNG are allowed."',
        priority: 'High'
      }
    ]
  }
};

export default function TestCaseGenerator() {
  const [templateKey, setTemplateKey] = useState<string>('login');
  const [customFeature, setCustomFeature] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [testCases, setTestCases] = useState<TestCase[]>(
    FEATURE_TEMPLATES.login.cases.map((c, i) => ({ ...c, id: `TC-${100 + i}` }))
  );
  
  const [copied, setCopied] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const handleLoadTemplate = (key: string) => {
    setTemplateKey(key);
    if (FEATURE_TEMPLATES[key]) {
      const cases = FEATURE_TEMPLATES[key].cases.map((c, i) => ({
        ...c,
        id: `TC-${100 + i}`
      }));
      setTestCases(cases);
    }
  };

  const handleGenerateCustom = () => {
    if (!customFeature) return;

    const formattedFeatureName = customFeature.charAt(0).toUpperCase() + customFeature.slice(1);

    const generated: TestCase[] = [
      {
        id: 'TC-101',
        title: `Verify happy path functionality of ${formattedFeatureName}`,
        type: 'Functional / Happy Path',
        preconditions: `User is logged in and is visiting the ${formattedFeatureName} component.`,
        steps: [
          `Navigate to the ${formattedFeatureName} section.`,
          `Input valid required fields according to: "${customDescription || 'Standard inputs'}".`,
          `Submit the action.`
        ],
        expectedResult: `Action completes successfully. Corresponding UI updates and records are persisted locally.`,
        priority: 'High'
      },
      {
        id: 'TC-102',
        title: `Verify validation checks on empty inputs for ${formattedFeatureName}`,
        type: 'Validation Check',
        preconditions: `User is on the ${formattedFeatureName} page.`,
        steps: [
          `Clear all input fields.`,
          `Submit the page.`
        ],
        expectedResult: `Required field validation messages display. Submission is blocked.`,
        priority: 'Medium'
      },
      {
        id: 'TC-103',
        title: `Verify negative boundary tests for ${formattedFeatureName}`,
        type: 'Negative / Boundary',
        preconditions: `User is on the ${formattedFeatureName} page.`,
        steps: [
          `Enter extremely long strings or negative values in inputs.`,
          `Attempt to submit.`
        ],
        expectedResult: `Input is either truncated, triggers error notifications, or fails safely without breaking system state.`,
        priority: 'Medium'
      },
      {
        id: 'TC-104',
        title: `Verify authorization checks on ${formattedFeatureName}`,
        type: 'Security',
        preconditions: `User is logged out or authenticated with a non-admin account.`,
        steps: [
          `Attempt to access the URL endpoint of ${formattedFeatureName} directly.`,
          `Attempt to perform operations.`
        ],
        expectedResult: `Access is denied. User is redirected to home/login screen. Status code 401 or 403 returned.`,
        priority: 'High'
      }
    ];

    setTestCases(generated);
    setTemplateKey('custom');
  };

  const handleCopyMarkdown = () => {
    let md = `# Test Suite: ${templateKey === 'custom' ? customFeature : FEATURE_TEMPLATES[templateKey].name}\n\n`;
    
    testCases.forEach((tc) => {
      md += `### ${tc.id}: ${tc.title}\n`;
      md += `- **Type**: ${tc.type}\n`;
      md += `- **Priority**: ${tc.priority}\n`;
      md += `- **Preconditions**: ${tc.preconditions}\n`;
      md += `- **Steps**:\n`;
      tc.steps.forEach((step, idx) => {
        md += `  ${idx + 1}. ${step}\n`;
      });
      md += `- **Expected Result**: ${tc.expectedResult}\n\n`;
      md += `--- \n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    let csv = 'Test Case ID,Title,Type,Preconditions,Steps,Expected Result,Priority\n';
    
    testCases.forEach((tc) => {
      const stepsEscaped = `"${tc.steps.map((s, i) => `${i+1}. ${s}`).join('\n').replace(/"/g, '""')}"`;
      const titleEscaped = `"${tc.title.replace(/"/g, '""')}"`;
      const preEscaped = `"${tc.preconditions.replace(/"/g, '""')}"`;
      const expEscaped = `"${tc.expectedResult.replace(/"/g, '""')}"`;
      
      csv += `${tc.id},${titleEscaped},${tc.type},${preEscaped},${stepsEscaped},${expEscaped},${tc.priority}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `test_suite_${templateKey === 'custom' ? customFeature.replace(/\s+/g, '_') : templateKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-5">
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
              Preset Templates
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(FEATURE_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleLoadTemplate(key)}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                    templateKey === key
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                      : 'bg-white/40 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-850/60 hover:bg-zinc-50 dark:hover:bg-zinc-850/40 text-zinc-650 dark:text-zinc-350'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
              Generate Custom Feature
            </h3>
            
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Feature Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shopping Cart, Forgot Password"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Feature Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Describe inputs, validation requirements, or workflow..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="saas-input resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateCustom}
                disabled={!customFeature.trim()}
                className="saas-button-primary w-full cursor-pointer"
              >
                <StartIcon className="w-4 h-4" />
                <span>Generate Test Cases</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <div className="saas-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white">
                  Generated Test Cases
                </h2>
                <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-semibold">
                  Suite contains {testCases.length} items. Calculations and data remain entirely in your browser.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="saas-button-secondary py-2 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied MD!' : 'Copy Markdown'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="saas-button-primary py-2 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {exportSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                  <span>{exportSuccess ? 'Downloaded!' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {testCases.map((tc) => (
                <div
                  key={tc.id}
                  className="p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-3 hover:border-indigo-500/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black font-mono text-indigo-650 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                        {tc.id}
                      </span>
                      <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded border bg-zinc-100 dark:bg-zinc-900 border-zinc-200/40 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400">
                        {tc.type}
                      </span>
                    </div>

                    <span
                      className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${
                        tc.priority === 'High'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          : tc.priority === 'Medium'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}
                    >
                      {tc.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-zinc-900 dark:text-white">
                    {tc.title}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="space-y-1">
                      <div className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400">Preconditions</div>
                      <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed bg-white/40 dark:bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-200/20 dark:border-zinc-800/20">
                        {tc.preconditions}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400">Expected Result</div>
                      <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed bg-white/40 dark:bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-200/20 dark:border-zinc-800/20">
                        {tc.expectedResult}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400">Test Steps</div>
                    <ol className="list-decimal pl-4.5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed">
                      {tc.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-medium text-zinc-550 dark:text-zinc-400">
        📌 <strong>Tip:</strong> You can export this test suite as a CSV file to import it directly into standard QA tracking tools. All operations are done entirely inside your local browser.
      </div>
    </div>
  );
}
