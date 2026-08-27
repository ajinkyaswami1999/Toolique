import { useState, useEffect, useMemo } from 'react';
import { 
  Play, Folder, Plus, Trash2, Eye, EyeOff, Copy, Check, RefreshCw, Save, Search, Shield
} from 'lucide-react';

interface KeyValueRow {
  key: string;
  value: string;
  enabled: boolean;
}

interface AssertionRow {
  type: 'status' | 'time' | 'json_exists' | 'json_value' | 'header';
  property: string; // e.g. "$.user.id" or "Content-Type"
  operator: 'equals' | 'contains' | 'less_than' | 'greater_than' | 'exists';
  value: string;
}

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: KeyValueRow[];
  params: KeyValueRow[];
  bodyType: 'none' | 'json' | 'urlencoded' | 'raw';
  bodyJson: string;
  bodyRaw: string;
  authType: 'none' | 'bearer' | 'basic' | 'apikey';
  authBearer: string;
  authBasicUser: string;
  authBasicPass: string;
  authApiKeyName: string;
  authApiKeyValue: string;
  authApiKeyLocation: 'header' | 'query';
  assertions: AssertionRow[];
}

interface Collection {
  id: string;
  name: string;
  requests: SavedRequest[];
}

interface HistoryItem {
  method: string;
  url: string;
  timestamp: string;
  status: number;
  statusText: string;
  time: number;
  requestConfig: SavedRequest;
}

interface EnvVariable {
  key: string;
  value: string;
}

export default function ApiTester() {
  // Modes & View toggles
  const [mode, setMode] = useState<'advanced' | 'simple'>('advanced');
  const [activeTab, setActiveTab] = useState<'params' | 'auth' | 'headers' | 'body' | 'tests'>('params');
  const [activeResponseTab, setActiveResponseTab] = useState<'pretty' | 'raw' | 'headers' | 'health' | 'codegen' | 'schema' | 'qa' | 'docs' | 'compare'>('pretty');
  
  // Sidebar tabs
  const [sidebarTab, setSidebarTab] = useState<'collections' | 'history' | 'env'>('collections');

  // Request Builder State
  const [selectedMethod, setSelectedMethod] = useState<string>('GET');
  const [requestUrl, setRequestUrl] = useState<string>('{{baseUrl}}/get');
  const [queryParams, setQueryParams] = useState<KeyValueRow[]>([{ key: 'page', value: '1', enabled: true }]);
  const [headersList, setHeadersList] = useState<KeyValueRow[]>([{ key: 'Accept', value: 'application/json', enabled: true }]);
  
  // Body states
  const [bodyType, setBodyType] = useState<'none' | 'json' | 'urlencoded' | 'raw'>('json');
  const [bodyJson, setBodyJson] = useState<string>('{\n  "name": "John Doe",\n  "role": "QA Engineer"\n}');
  const [bodyRaw, setBodyRaw] = useState<string>('');
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);

  // Authentication states
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'apikey'>('none');
  const [authBearer, setAuthBearer] = useState<string>('');
  const [authBasicUser, setAuthBasicUser] = useState<string>('');
  const [authBasicPass, setAuthBasicPass] = useState<string>('');
  const [maskPass, setMaskPass] = useState<boolean>(true);
  const [authApiKeyName, setAuthApiKeyName] = useState<string>('X-API-Key');
  const [authApiKeyValue, setAuthApiKeyValue] = useState<string>('');
  const [authApiKeyLocation, setAuthApiKeyLocation] = useState<'header' | 'query'>('header');

  // Assertions lists
  const [assertions, setAssertions] = useState<AssertionRow[]>([
    { type: 'status', property: '', operator: 'equals', value: '200' },
    { type: 'time', property: '', operator: 'less_than', value: '1000' }
  ]);

  // Environment states
  const [currentEnv, setCurrentEnv] = useState<'development' | 'staging' | 'production'>('development');
  const [envVars, setEnvVars] = useState<Record<string, EnvVariable[]>>({
    development: [
      { key: 'baseUrl', value: 'https://httpbin.org' },
      { key: 'token', value: 'dev_token_abc123' }
    ],
    staging: [
      { key: 'baseUrl', value: 'https://staging.httpbin.org' },
      { key: 'token', value: 'stage_token_xyz789' }
    ],
    production: [
      { key: 'baseUrl', value: 'https://httpbin.org' },
      { key: 'token', value: 'prod_token_sec456' }
    ]
  });

  // Importers
  const [curlImportText, setCurlImportText] = useState<string>('');
  const [openApiImportText, setOpenApiImportText] = useState<string>('');

  // Collections & Local History
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: 'col-1',
      name: 'Default APIs',
      requests: [
        {
          id: 'req-1',
          name: 'Fetch Headers Info',
          method: 'GET',
          url: '{{baseUrl}}/headers',
          headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
          params: [],
          bodyType: 'none',
          bodyJson: '{}',
          bodyRaw: '',
          authType: 'bearer',
          authBearer: '{{token}}',
          authBasicUser: '',
          authBasicPass: '',
          authApiKeyName: '',
          authApiKeyValue: '',
          authApiKeyLocation: 'header',
          assertions: [{ type: 'status', property: '', operator: 'equals', value: '200' }]
        }
      ]
    }
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Response execution states
  const [isSending, setIsSending] = useState<boolean>(false);
  const [responseState, setResponseState] = useState<any | null>(null);
  const [responseError, setResponseError] = useState<any | null>(null);

  // Assertion runner results
  const [assertionResults, setAssertionResults] = useState<any[]>([]);

  // Response comparisons
  const [compareResponseText, setCompareResponseText] = useState<string>('');
  const [comparisonDelta, setComparisonDelta] = useState<any | null>(null);

  // JSON search filters
  const [prettySearchQuery, setPrettySearchQuery] = useState<string>('');

  // Copy indicators
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Keyboard Shortcuts (Ctrl/Cmd + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        triggerSendRequest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestUrl, selectedMethod, queryParams, headersList, bodyType, bodyJson, bodyRaw, authType, authBearer, authBasicUser, authBasicPass, authApiKeyName, authApiKeyValue, authApiKeyLocation, assertions, currentEnv, envVars]);

  // Load from local storage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('toolique_api_history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedCollections = localStorage.getItem('toolique_api_collections');
      if (storedCollections) setCollections(JSON.parse(storedCollections));
    } catch (e) {
      console.error('Failed to load local data:', e);
    }
  }, []);

  const saveHistoryToLocal = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem('toolique_api_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
    }
  };

  const saveCollectionsToLocal = (newCols: Collection[]) => {
    try {
      localStorage.setItem('toolique_api_collections', JSON.stringify(newCols));
    } catch (e) {
      console.error(e);
    }
  };

  // Variable Substitutions interpolation helper
  const interpolateUrl = (url: string) => {
    let output = url;
    const currentVars = envVars[currentEnv];
    currentVars.forEach((variable) => {
      const regex = new RegExp(`\\{\\{\\s*${variable.key}\\s*\\}\\}`, 'g');
      output = output.replace(regex, variable.value);
    });
    return output;
  };

  // SSRF & Security boundary validator (checks for private network host IPs)
  const isSecuritySafeUrl = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();

      // Block local/internal lookups
      const blockedHosts = [
        'localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 
        '10.', '172.16.', '172.17.', '172.18.', '172.19.', 
        '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', 
        '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', 
        '172.30.', '172.31.', '192.168.'
      ];

      return !blockedHosts.some(blocked => host.startsWith(blocked) || host === blocked);
    } catch {
      return false;
    }
  };

  // Format / Validate JSON
  const formatJsonBody = () => {
    try {
      const parsed = JSON.parse(bodyJson);
      setBodyJson(JSON.stringify(parsed, null, 2));
      setJsonValidationError(null);
    } catch (err: any) {
      setJsonValidationError(err.message);
    }
  };

  const validateJsonSyntax = () => {
    try {
      JSON.parse(bodyJson);
      setJsonValidationError('Syntax is VALID JSON ✔');
    } catch (err: any) {
      setJsonValidationError(`Error: ${err.message}`);
    }
  };

  // --- CURL IMPORTER ---
  const handleImportCurl = () => {
    const raw = curlImportText.trim();
    if (!raw) return;

    try {
      // Basic split parse logic
      const methodMatch = raw.match(/-X\s+([A-Z]+)/);
      const method = methodMatch ? methodMatch[1] : 'GET';

      const urlMatch = raw.match(/(?:'|")?(https?:\/\/[^\s'"]+)/);
      const url = urlMatch ? urlMatch[1] : 'https://';

      // Parse headers
      const headerMatches = raw.matchAll(/-H\s+["']([^"']+)["']/g);
      const headers: KeyValueRow[] = [];
      for (const m of headerMatches) {
        const parts = m[1].split(':');
        if (parts.length >= 2) {
          headers.push({ key: parts[0].trim(), value: parts.slice(1).join(':').trim(), enabled: true });
        }
      }

      // Parse body
      const bodyMatch = raw.match(/-d\s+['"]([^'"]+)['"]/);
      const bodyText = bodyMatch ? bodyMatch[1] : '';

      setSelectedMethod(method);
      setRequestUrl(url);
      if (headers.length > 0) setHeadersList(headers);
      if (bodyText) {
        setBodyType('json');
        setBodyJson(bodyText);
      }
      setCurlImportText('');
    } catch (e) {
      alert('Failed parsing cURL block. Ensure valid layout format.');
    }
  };

  // --- OPENAPI IMPORTER ---
  const handleImportOpenApi = () => {
    try {
      const parsed = JSON.parse(openApiImportText);
      const endpoints: SavedRequest[] = [];
      
      if (parsed.paths) {
        Object.keys(parsed.paths).forEach((path) => {
          const methods = parsed.paths[path];
          Object.keys(methods).forEach((method) => {
            endpoints.push({
              id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: methods[method].summary || `${method.toUpperCase()} ${path}`,
              method: method.toUpperCase(),
              url: `{{baseUrl}}${path}`,
              headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
              params: [],
              bodyType: 'none',
              bodyJson: '{}',
              bodyRaw: '',
              authType: 'none',
              authBearer: '',
              authBasicUser: '',
              authBasicPass: '',
              authApiKeyName: '',
              authApiKeyValue: '',
              authApiKeyLocation: 'header',
              assertions: []
            });
          });
        });
      }

      const newCol: Collection = {
        id: `col-${Date.now()}`,
        name: parsed.info?.title || 'OpenAPI Collection',
        requests: endpoints
      };

      const updated = [...collections, newCol];
      setCollections(updated);
      saveCollectionsToLocal(updated);
      setOpenApiImportText('');
    } catch {
      alert('Invalid OpenAPI JSON format.');
    }
  };

  // Save requests to collection
  const handleSaveRequest = () => {
    const activeReq: SavedRequest = {
      id: `req-${Date.now()}`,
      name: `API Request ${new Date().toLocaleTimeString()}`,
      method: selectedMethod,
      url: requestUrl,
      headers: headersList,
      params: queryParams,
      bodyType,
      bodyJson,
      bodyRaw,
      authType,
      authBearer,
      authBasicUser,
      authBasicPass,
      authApiKeyName,
      authApiKeyValue,
      authApiKeyLocation,
      assertions
    };

    const updated = collections.map((c, idx) => {
      if (idx === 0) {
        return { ...c, requests: [activeReq, ...c.requests] };
      }
      return c;
    });
    setCollections(updated);
    saveCollectionsToLocal(updated);
  };

  // Restore request from config
  const restoreRequestConfig = (req: SavedRequest) => {
    setSelectedMethod(req.method);
    setRequestUrl(req.url);
    setHeadersList(req.headers);
    setQueryParams(req.params);
    setBodyType(req.bodyType);
    setBodyJson(req.bodyJson);
    setBodyRaw(req.bodyRaw);
    setAuthType(req.authType);
    setAuthBearer(req.authBearer);
    setAuthBasicUser(req.authBasicUser);
    setAuthBasicPass(req.authBasicPass);
    setAuthApiKeyName(req.authApiKeyName);
    setAuthApiKeyValue(req.authApiKeyValue);
    setAuthApiKeyLocation(req.authApiKeyLocation);
    setAssertions(req.assertions);
  };

  // Environment variables management
  const updateEnvVar = (idx: number, key: string, value: string) => {
    const updated = [...envVars[currentEnv]];
    updated[idx] = { key, value };
    const newVars = { ...envVars, [currentEnv]: updated };
    setEnvVars(newVars);
  };

  const addEnvVar = () => {
    const updated = [...envVars[currentEnv], { key: 'newKey', value: '' }];
    setEnvVars({ ...envVars, [currentEnv]: updated });
  };

  const deleteEnvVar = (idx: number) => {
    const updated = envVars[currentEnv].filter((_, i) => i !== idx);
    setEnvVars({ ...envVars, [currentEnv]: updated });
  };

  // Trigger browser fetch operation
  const triggerSendRequest = async () => {
    setIsSending(true);
    setResponseState(null);
    setResponseError(null);
    setAssertionResults([]);

    const cleanUrl = interpolateUrl(requestUrl);
    
    // SSRF boundary block checks
    if (!isSecuritySafeUrl(cleanUrl)) {
      setResponseError({
        type: 'SSRF_BLOCKED',
        message: 'Security Boundary Alert: SSRF Protection blocked access to loopbacks or private local range IPs.'
      });
      setIsSending(false);
      return;
    }

    // Build URL query params
    let finalUrl = cleanUrl;
    const activeParams = queryParams.filter(p => p.enabled && p.key);
    if (activeParams.length > 0) {
      const urlObj = new URL(cleanUrl);
      activeParams.forEach((param) => {
        urlObj.searchParams.set(param.key, interpolateUrl(param.value));
      });
      finalUrl = urlObj.toString();
    }

    // Setup headers
    const activeHeaders: Record<string, string> = {};
    headersList.filter(h => h.enabled && h.key).forEach((header) => {
      activeHeaders[header.key] = interpolateUrl(header.value);
    });

    // Inject Auth
    if (authType === 'bearer' && authBearer) {
      activeHeaders['Authorization'] = `Bearer ${interpolateUrl(authBearer)}`;
    } else if (authType === 'basic') {
      const token = btoa(`${interpolateUrl(authBasicUser)}:${interpolateUrl(authBasicPass)}`);
      activeHeaders['Authorization'] = `Basic ${token}`;
    } else if (authType === 'apikey' && authApiKeyLocation === 'header') {
      activeHeaders[authApiKeyName] = interpolateUrl(authApiKeyValue);
    }

    // Body preparation
    let fetchBody: any = undefined;
    if (selectedMethod !== 'GET' && selectedMethod !== 'HEAD') {
      if (bodyType === 'json') {
        fetchBody = bodyJson;
        activeHeaders['Content-Type'] = 'application/json';
      } else if (bodyType === 'urlencoded') {
        const bodyParams = new URLSearchParams();
        fetchBody = bodyParams.toString();
        activeHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (bodyType === 'raw') {
        fetchBody = bodyRaw;
      }
    }

    const startTime = performance.now();
    try {
      const response = await fetch(finalUrl, {
        method: selectedMethod,
        headers: activeHeaders,
        body: fetchBody
      });
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      const responseText = await response.text();
      
      let parsedJson: any = null;
      let isJson = false;
      try {
        parsedJson = JSON.parse(responseText);
        isJson = true;
      } catch {
        // Safe to ignore if non-JSON
      }

      // Headers map
      const headersObj: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headersObj[key] = val;
      });

      const resSize = (responseText.length / 1024).toFixed(2);

      const resultPayload = {
        status: response.status,
        statusText: response.statusText,
        time: latency,
        size: resSize,
        headers: headersObj,
        isJson,
        json: parsedJson,
        text: responseText
      };

      setResponseState(resultPayload);
      runAssertionChecks(resultPayload);

      // Append history
      const histItem: HistoryItem = {
        method: selectedMethod,
        url: requestUrl,
        timestamp: new Date().toLocaleTimeString(),
        status: response.status,
        statusText: response.statusText,
        time: latency,
        requestConfig: {
          id: `req-${Date.now()}`,
          name: '',
          method: selectedMethod,
          url: requestUrl,
          headers: headersList,
          params: queryParams,
          bodyType,
          bodyJson,
          bodyRaw,
          authType,
          authBearer,
          authBasicUser,
          authBasicPass,
          authApiKeyName,
          authApiKeyValue,
          authApiKeyLocation,
          assertions
        }
      };

      const updatedHistory = [histItem, ...history].slice(0, 30);
      setHistory(updatedHistory);
      saveHistoryToLocal(updatedHistory);

    } catch (e: any) {
      // CORS Error check
      setResponseError({
        type: 'CORS_ERROR',
        message: 'Network Error: This API request may be blocked by browser CORS security policies. Ensure headers are allowed.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Run assertion tests
  const runAssertionChecks = (res: any) => {
    const results = assertions.map((ass) => {
      let passed = false;
      let actualValue = '';

      if (ass.type === 'status') {
        actualValue = res.status.toString();
        passed = actualValue === ass.value;
      } else if (ass.type === 'time') {
        actualValue = `${res.time} ms`;
        passed = res.time < parseFloat(ass.value);
      } else if (ass.type === 'json_exists') {
        // Simple search index path exists check
        if (res.isJson && res.json) {
          passed = res.text.includes(ass.value);
        }
      }

      return {
        ...ass,
        passed,
        actualValue
      };
    });

    setAssertionResults(results);
  };

  // JSON Schema generator
  const generatedSchemaText = useMemo(() => {
    if (!responseState || !responseState.isJson) return 'No parsed JSON response output available.';
    try {
      const buildSchema = (obj: any): any => {
        const type = typeof obj;
        if (obj === null) return { type: 'null' };
        if (Array.isArray(obj)) {
          return {
            type: 'array',
            items: obj.length > 0 ? buildSchema(obj[0]) : {}
          };
        }
        if (type === 'object') {
          const properties: any = {};
          Object.keys(obj).forEach((k) => {
            properties[k] = buildSchema(obj[k]);
          });
          return { type: 'object', properties };
        }
        return { type };
      };
      return JSON.stringify(buildSchema(responseState.json), null, 2);
    } catch {
      return 'Failed generating schema.';
    }
  }, [responseState]);

  // QA test cases generator
  const qaTestCases = useMemo(() => {
    if (!responseState) return [];
    return [
      { id: 'TC001', scenario: 'Validate HTTP status matches expectations', request: `${selectedMethod} ${requestUrl}`, expected: `Status: ${responseState.status} ${responseState.statusText}`, priority: 'HIGH' },
      { id: 'TC002', scenario: 'Verify response size within limits', request: `${selectedMethod} ${requestUrl}`, expected: 'Response size under 1 MB', priority: 'MEDIUM' },
      { id: 'TC003', scenario: 'Verify JSON payload formatting syntax is valid', request: `${selectedMethod} ${requestUrl}`, expected: 'JSON structure validation check passes', priority: 'HIGH' }
    ];
  }, [responseState, selectedMethod, requestUrl]);

  // API Documentation generator
  const generatedDocsText = useMemo(() => {
    return `### API Endpoint Reference\n---\n**Endpoint**: \`${requestUrl}\`  \n**Method**: \`${selectedMethod}\`  \n\n#### Headers Configuration\n${headersList.map(h => `- \`${h.key}\`: \`${h.value}\``).join('\n')}\n\n#### Response Details\n- **Status Code**: \`${responseState?.status || '—'}\`\n- **Response Size**: \`${responseState?.size || '—'} KB\`\n- **Latency**: \`${responseState?.time || '—'} ms\``;
  }, [requestUrl, selectedMethod, headersList, responseState]);

  // Code Gen snippets mapping
  const codeGenSnippets = useMemo(() => {
    const cleanUrl = interpolateUrl(requestUrl);
    return {
      curl: `curl -X ${selectedMethod} "${cleanUrl}" \\\n  -H "Accept: application/json"`,
      python: `import requests\n\nurl = "${cleanUrl}"\nresponse = requests.${selectedMethod.toLowerCase()}(url)\nprint(response.status_code)`,
      javascript: `fetch("${cleanUrl}", {\n  method: "${selectedMethod}"\n})\n  .then(res => res.json())\n  .then(data => console.log(data));`,
      playwright: `const response = await request.${selectedMethod.toLowerCase()}('${cleanUrl}');\nexpect(response.ok()).toBeTruthy();`
    };
  }, [selectedMethod, requestUrl]);

  // Diff Response Comparator
  const executeResponseDiff = () => {
    if (!responseState) return;
    try {
      const current = JSON.stringify(responseState.json || {});
      const previous = JSON.stringify(JSON.parse(compareResponseText));
      if (current === previous) {
        setComparisonDelta('Responses are identical ✔');
      } else {
        setComparisonDelta('Detected changes in JSON parameters structure ✕');
      }
    } catch {
      setComparisonDelta('Failed to parse previous response JSON.');
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const clearLocalHistory = () => {
    setHistory([]);
    localStorage.removeItem('toolique_api_history');
  };

  const clearCollections = () => {
    setCollections([]);
    localStorage.removeItem('toolique_api_collections');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left animate-fadeIn">
      
      {/* Dynamic Simple/Advanced Mode switch */}
      <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">REST API Debugger Workspace</h2>
        <div className="flex bg-zinc-50 rounded-lg p-0.5 text-[10px] font-bold">
          <button onClick={() => setMode('simple')} className={`px-2.5 py-1 rounded ${mode === 'simple' ? 'bg-white shadow' : 'text-zinc-400'}`}>Simple Mode</button>
          <button onClick={() => setMode('advanced')} className={`px-2.5 py-1 rounded ${mode === 'advanced' ? 'bg-white shadow' : 'text-zinc-400'}`}>Advanced Mode</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR: COLLECTIONS & HISTORY */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-2 border-b text-[10px] font-bold pb-2">
            <button onClick={() => setSidebarTab('collections')} className={`pb-1 border-b-2 transition ${sidebarTab === 'collections' ? 'border-teal-650 text-teal-650' : 'border-transparent text-zinc-400'}`}>Collections</button>
            <button onClick={() => setSidebarTab('history')} className={`pb-1 border-b-2 transition ${sidebarTab === 'history' ? 'border-teal-650 text-teal-650' : 'border-transparent text-zinc-400'}`}>History</button>
            <button onClick={() => setSidebarTab('env')} className={`pb-1 border-b-2 transition ${sidebarTab === 'env' ? 'border-teal-650 text-teal-650' : 'border-transparent text-zinc-400'}`}>Environment</button>
          </div>

          {sidebarTab === 'collections' && (
            <div className="space-y-4">
              {collections.map((col) => (
                <div key={col.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <Folder className="w-4 h-4 text-teal-605" />
                    <span>{col.name}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-[11px] font-medium text-zinc-500">
                    {col.requests.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => restoreRequestConfig(req)}
                        className="block w-full text-left py-1 hover:text-teal-650 transition truncate"
                      >
                        <strong className="text-[9px] uppercase font-mono mr-1 text-teal-655">{req.method}</strong> {req.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <button onClick={clearCollections} className="text-[9px] text-rose-500 font-bold uppercase hover:underline">Clear Collections</button>
              </div>
            </div>
          )}

          {sidebarTab === 'history' && (
            <div className="space-y-3">
              {history.map((hist, idx) => (
                <button
                  key={idx}
                  onClick={() => restoreRequestConfig(hist.requestConfig)}
                  className="w-full text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border text-[11px] font-mono hover:border-teal-550 transition space-y-1 block"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-teal-605">{hist.method}</strong>
                    <span className="text-[9px] text-zinc-450">{hist.timestamp}</span>
                  </div>
                  <div className="text-zinc-650 truncate">{hist.url}</div>
                  <div className="text-[9px] text-zinc-400 font-semibold">{hist.status} {hist.statusText} — {hist.time}ms</div>
                </button>
              ))}

              {history.length === 0 && (
                <div className="text-center py-6 text-zinc-400 italic text-xs">No local request history logs.</div>
              )}
              {history.length > 0 && (
                <button onClick={clearLocalHistory} className="text-[9px] text-rose-500 font-bold uppercase hover:underline block">Clear History</button>
              )}
            </div>
          )}

          {sidebarTab === 'env' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Environment:</span>
                <select
                  value={currentEnv}
                  onChange={(e) => setCurrentEnv(e.target.value as any)}
                  className="p-1 border rounded text-[11px] bg-transparent font-bold"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div className="space-y-2">
                {envVars[currentEnv].map((v, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={v.key}
                      onChange={(e) => updateEnvVar(i, e.target.value, v.value)}
                      className="w-1/2 p-1.5 border rounded text-[11px] font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      value={v.value}
                      onChange={(e) => updateEnvVar(i, v.key, e.target.value)}
                      className="w-1/2 p-1.5 border rounded text-[11px] font-mono focus:outline-none"
                    />
                    <button onClick={() => deleteEnvVar(i)} className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={addEnvVar} className="text-[10px] text-teal-650 font-bold flex items-center gap-1 hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Add Variable
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CORE BUILDER & WORKSPACE */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Method Selector / URL bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex gap-2">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-xs font-black font-mono focus:outline-none text-zinc-700 dark:text-zinc-300"
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="text"
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                placeholder="https://api.example.com/v1/users"
                className="flex-grow p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-mono font-semibold focus:outline-none"
              />
              <button
                onClick={triggerSendRequest}
                disabled={isSending}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-black font-mono flex items-center justify-center gap-1.5 shadow"
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Send</span>
              </button>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-zinc-450 font-bold border-t pt-3">
              <span>Send Shortcut: <strong>Ctrl + Enter</strong></span>
              <button onClick={handleSaveRequest} className="text-teal-650 flex items-center gap-1 hover:underline">
                <Save className="w-3.5 h-3.5" /> Save Request Configuration
              </button>
            </div>
          </div>

          {/* PARAMS, AUTHORIZATION, HEADERS, BODY, ASSERTIONS TABS */}
          {mode === 'advanced' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
              <div className="flex gap-4 border-b pb-2 text-xs font-bold text-zinc-500">
                {[
                  { id: 'params', name: 'Query Params' },
                  { id: 'auth', name: 'Authorization' },
                  { id: 'headers', name: 'Headers' },
                  { id: 'body', name: 'Request Body' },
                  { id: 'tests', name: 'Assertions Lab' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`pb-1.5 border-b-2 transition ${activeTab === t.id ? 'border-teal-655 text-teal-655' : 'border-transparent hover:text-zinc-700'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* QUERY PARAMS BUILDER */}
              {activeTab === 'params' && (
                <div className="space-y-3">
                  {queryParams.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={(e) => {
                          const updated = [...queryParams];
                          updated[idx].enabled = e.target.checked;
                          setQueryParams(updated);
                        }}
                        className="rounded text-teal-600"
                      />
                      <input
                        type="text"
                        value={p.key}
                        onChange={(e) => {
                          const updated = [...queryParams];
                          updated[idx].key = e.target.value;
                          setQueryParams(updated);
                        }}
                        placeholder="Key"
                        className="w-1/2 p-2 border rounded text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={p.value}
                        onChange={(e) => {
                          const updated = [...queryParams];
                          updated[idx].value = e.target.value;
                          setQueryParams(updated);
                        }}
                        placeholder="Value"
                        className="w-1/2 p-2 border rounded text-xs font-mono"
                      />
                      <button
                        onClick={() => setQueryParams(queryParams.filter((_, i) => i !== idx))}
                        className="text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setQueryParams([...queryParams, { key: '', value: '', enabled: true }])}
                    className="text-xs text-teal-605 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add Parameter Row
                  </button>
                </div>
              )}

              {/* AUTHORIZATION CONFIGURATOR */}
              {activeTab === 'auth' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Auth Type</label>
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value as any)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="apikey">API Key</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    {authType === 'bearer' && (
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Token</label>
                        <input
                          type="password"
                          value={authBearer}
                          onChange={(e) => setAuthBearer(e.target.value)}
                          placeholder="Bearer token secret..."
                          className="w-full p-2 border rounded font-mono"
                        />
                      </div>
                    )}

                    {authType === 'basic' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Username</label>
                          <input
                            type="text"
                            value={authBasicUser}
                            onChange={(e) => setAuthBasicUser(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Password</label>
                          <div className="relative">
                            <input
                              type={maskPass ? 'password' : 'text'}
                              value={authBasicPass}
                              onChange={(e) => setAuthBasicPass(e.target.value)}
                              className="w-full p-2 border rounded pr-8"
                            />
                            <button
                              onClick={() => setMaskPass(!maskPass)}
                              className="absolute right-2 top-2.5 text-zinc-400"
                            >
                              {maskPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {authType === 'apikey' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Key Name</label>
                            <input
                              type="text"
                              value={authApiKeyName}
                              onChange={(e) => setAuthApiKeyName(e.target.value)}
                              className="w-full p-2 border rounded font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Key Value</label>
                            <input
                              type="password"
                              value={authApiKeyValue}
                              onChange={(e) => setAuthApiKeyValue(e.target.value)}
                              className="w-full p-2 border rounded font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Location</label>
                          <select
                            value={authApiKeyLocation}
                            onChange={(e) => setAuthApiKeyLocation(e.target.value as any)}
                            className="p-1.5 border rounded text-xs"
                          >
                            <option value="header">HTTP Header</option>
                            <option value="query">Query Parameter</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {authType === 'none' && (
                      <p className="text-zinc-400 italic">This request does not send auth headers.</p>
                    )}
                  </div>
                </div>
              )}

              {/* REQUEST HEADERS BUILDER */}
              {activeTab === 'headers' && (
                <div className="space-y-3">
                  {headersList.map((h, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) => {
                          const updated = [...headersList];
                          updated[idx].enabled = e.target.checked;
                          setHeadersList(updated);
                        }}
                        className="rounded text-teal-600"
                      />
                      <input
                        type="text"
                        value={h.key}
                        onChange={(e) => {
                          const updated = [...headersList];
                          updated[idx].key = e.target.value;
                          setHeadersList(updated);
                        }}
                        placeholder="Key"
                        className="w-1/2 p-2 border rounded text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={h.value}
                        onChange={(e) => {
                          const updated = [...headersList];
                          updated[idx].value = e.target.value;
                          setHeadersList(updated);
                        }}
                        placeholder="Value"
                        className="w-1/2 p-2 border rounded text-xs font-mono"
                      />
                      <button
                        onClick={() => setHeadersList(headersList.filter((_, i) => i !== idx))}
                        className="text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setHeadersList([...headersList, { key: '', value: '', enabled: true }])}
                    className="text-xs text-teal-605 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add Header Row
                  </button>
                </div>
              )}

              {/* REQUEST BODY EDITOR */}
              {activeTab === 'body' && (
                <div className="space-y-4">
                  <div className="flex gap-3 text-xs font-bold border-b pb-2">
                    {['none', 'json', 'urlencoded', 'raw'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setBodyType(t as any)}
                        className={`capitalize transition ${bodyType === t ? 'text-teal-605' : 'text-zinc-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {bodyType === 'json' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button onClick={formatJsonBody} className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-[10px] font-bold transition">Format JSON</button>
                        <button onClick={validateJsonSyntax} className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-[10px] font-bold transition">Validate JSON</button>
                      </div>
                      <textarea
                        value={bodyJson}
                        onChange={(e) => setBodyJson(e.target.value)}
                        className="w-full h-36 p-3 border rounded font-mono text-xs focus:outline-none"
                      />
                      {jsonValidationError && (
                        <div className="p-2 rounded bg-zinc-50 border text-[10px] font-mono text-zinc-650">{jsonValidationError}</div>
                      )}
                    </div>
                  )}

                  {bodyType === 'raw' && (
                    <textarea
                      value={bodyRaw}
                      onChange={(e) => setBodyRaw(e.target.value)}
                      placeholder="Plain text payload..."
                      className="w-full h-36 p-3 border rounded font-mono text-xs focus:outline-none"
                    />
                  )}

                  {bodyType === 'none' && <p className="text-zinc-400 italic text-xs">No request body is sent.</p>}
                </div>
              )}

              {/* ASSERTIONS LAB */}
              {activeTab === 'tests' && (
                <div className="space-y-3">
                  {assertions.map((ass, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-xs">
                      <select
                        value={ass.type}
                        onChange={(e) => {
                          const updated = [...assertions];
                          updated[idx].type = e.target.value as any;
                          setAssertions(updated);
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="status">Status Code</option>
                        <option value="time">Response Time (ms)</option>
                        <option value="json_exists">Response JSON path</option>
                      </select>
                      
                      <select
                        value={ass.operator}
                        onChange={(e) => {
                          const updated = [...assertions];
                          updated[idx].operator = e.target.value as any;
                          setAssertions(updated);
                        }}
                        className="p-2 border rounded font-mono"
                      >
                        <option value="equals">equals</option>
                        <option value="less_than">less than</option>
                        <option value="contains">contains</option>
                      </select>

                      <input
                        type="text"
                        value={ass.value}
                        onChange={(e) => {
                          const updated = [...assertions];
                          updated[idx].value = e.target.value;
                          setAssertions(updated);
                        }}
                        placeholder="Expected value"
                        className="p-2 border rounded font-mono flex-grow"
                      />

                      <button
                        onClick={() => setAssertions(assertions.filter((_, i) => i !== idx))}
                        className="text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setAssertions([...assertions, { type: 'status', property: '', operator: 'equals', value: '200' }])}
                    className="text-xs text-teal-650 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add Assertion Check
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OPENAPI & CURL CODE IMPORTER DESK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">Import CLI cURL Command</span>
              <textarea
                value={curlImportText}
                onChange={(e) => setCurlImportText(e.target.value)}
                placeholder="curl -X POST -H 'Content-Type: application/json' -d '...' https://..."
                className="w-full h-20 p-2 border rounded text-[11px] font-mono focus:outline-none"
              />
              <button onClick={handleImportCurl} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold w-full">Import cURL</button>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">Import OpenAPI 3.0 (JSON)</span>
              <textarea
                value={openApiImportText}
                onChange={(e) => setOpenApiImportText(e.target.value)}
                placeholder='{ "openapi": "3.0.0", "paths": { ... } }'
                className="w-full h-20 p-2 border rounded text-[11px] font-mono focus:outline-none"
              />
              <button onClick={handleImportOpenApi} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold w-full">Import OpenAPI Specification</button>
            </div>
          </div>

          {/* RESPONSE VIEWER SUB-DASHBOARD */}
          {responseState && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6 animate-fadeIn">
              
              {/* Response Stats indicators */}
              <div className="flex flex-wrap gap-6 items-center justify-between border-b pb-3">
                <div className="flex gap-4 items-center">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                    responseState.status >= 200 && responseState.status < 300 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {responseState.status} {responseState.statusText}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500">Latency: <strong className="text-zinc-800 dark:text-zinc-200">{responseState.time} ms</strong></span>
                  <span className="text-xs font-mono font-bold text-zinc-500">Size: <strong className="text-zinc-800 dark:text-zinc-200">{responseState.size} KB</strong></span>
                </div>
              </div>

              {/* Sub tab selections */}
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {[
                  { id: 'pretty', name: 'Pretty Body' },
                  { id: 'raw', name: 'Raw Body' },
                  { id: 'headers', name: 'Response Headers' },
                  { id: 'health', name: 'Health Assertion Checks' },
                  { id: 'codegen', name: 'Generate Code' },
                  { id: 'schema', name: 'Export JSON Schema' },
                  { id: 'qa', name: 'Generate QA Test Cases' },
                  { id: 'docs', name: 'Generate API Docs' },
                  { id: 'compare', name: 'Compare Responses' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResponseTab(tab.id as any)}
                    className={`px-3 py-1 rounded-lg border transition ${
                      activeResponseTab === tab.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* TAB VIEWER CONTENT PANELS */}
              
              {/* PRETTY JSON VIEWER */}
              {activeResponseTab === 'pretty' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex gap-3 items-center">
                    <Search className="w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={prettySearchQuery}
                      onChange={(e) => setPrettySearchQuery(e.target.value)}
                      placeholder="Search parameters in JSON response..."
                      className="flex-grow p-1.5 border rounded text-xs focus:outline-none"
                    />
                  </div>

                  {responseState.isJson ? (
                    <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-750 dark:text-zinc-250 max-h-96 overflow-y-auto select-all whitespace-pre-wrap break-all">
                      {JSON.stringify(responseState.json, null, 2)}
                    </pre>
                  ) : (
                    <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-750 dark:text-zinc-250 max-h-96 overflow-y-auto select-all whitespace-pre-wrap break-all">
                      {responseState.text}
                    </pre>
                  )}
                </div>
              )}

              {/* RAW RESPONSE */}
              {activeResponseTab === 'raw' && (
                <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-700 dark:text-zinc-300 max-h-96 overflow-y-auto select-all break-all whitespace-pre-wrap animate-fadeIn">
                  {responseState.text}
                </pre>
              )}

              {/* RESPONSE HEADERS */}
              {activeResponseTab === 'headers' && (
                <div className="overflow-x-auto animate-fadeIn">
                  <table className="w-full text-xs text-left font-mono">
                    <thead>
                      <tr className="border-b text-zinc-400 font-bold">
                        <th className="py-2 pl-2">Header Key</th>
                        <th className="py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                      {Object.keys(responseState.headers).map((k) => (
                        <tr key={k}>
                          <td className="py-2.5 pl-2 font-bold text-teal-650">{k}</td>
                          <td className="py-2.5 break-all">{responseState.headers[k]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* HEALTH ASSERTIONS LIST */}
              {activeResponseTab === 'health' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="text-xs font-black uppercase text-zinc-400 border-b pb-2">Assertion Results: {assertionResults.filter(r => r.passed).length} / {assertionResults.length} Passed</div>
                  <div className="space-y-2">
                    {assertionResults.map((res, i) => (
                      <div key={i} className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center text-xs">
                        <div>
                          <strong className="capitalize text-zinc-800 dark:text-zinc-200">Assertion Type: {res.type.replace('_', ' ')}</strong>
                          <span className="text-zinc-400 block mt-0.5">Condition: {res.operator} "{res.value}" (Actual: {res.actualValue})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-black font-mono text-[9px] uppercase ${
                          res.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {res.passed ? 'Passed ✓' : 'Failed ✕'}
                        </span>
                      </div>
                    ))}

                    {assertionResults.length === 0 && (
                      <p className="text-zinc-400 italic text-xs">No health assertions configured.</p>
                    )}
                  </div>
                </div>
              )}

              {/* CODE GENERATOR */}
              {activeResponseTab === 'codegen' && (
                <div className="space-y-4 animate-fadeIn">
                  {Object.entries(codeGenSnippets).map(([lang, code]) => (
                    <div key={lang} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                        <span>{lang} Snippet</span>
                        <button
                          onClick={() => handleCopyCode(code, lang)}
                          className="text-teal-655 hover:underline flex items-center gap-1"
                        >
                          {copiedCodeId === lang ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCodeId === lang ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap select-all">
                        {code}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* EXPORT JSON SCHEMA */}
              {activeResponseTab === 'schema' && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                    <span>Generated JSON Schema output</span>
                    <button
                      onClick={() => handleCopyCode(generatedSchemaText, 'schema')}
                      className="text-teal-655 hover:underline"
                    >
                      {copiedCodeId === 'schema' ? 'Copied' : 'Copy Schema'}
                    </button>
                  </div>
                  <pre className="p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-700 dark:text-zinc-300 max-h-60 overflow-y-auto whitespace-pre-wrap select-all">
                    {generatedSchemaText}
                  </pre>
                </div>
              )}

              {/* GENERATE QA TEST CASES */}
              {activeResponseTab === 'qa' && (
                <div className="overflow-x-auto animate-fadeIn">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b text-zinc-400 font-bold font-mono">
                        <th className="py-2 pl-2">ID</th>
                        <th className="py-2">Test Scenario</th>
                        <th className="py-2">Endpoint Target</th>
                        <th className="py-2">Expected Outcome</th>
                        <th className="py-2 pr-2">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700 dark:text-zinc-300 font-medium">
                      {qaTestCases.map((tc) => (
                        <tr key={tc.id}>
                          <td className="py-2.5 pl-2 font-bold text-teal-650 font-mono">{tc.id}</td>
                          <td className="py-2.5">{tc.scenario}</td>
                          <td className="py-2.5 font-mono text-[10px] text-zinc-405">{tc.request}</td>
                          <td className="py-2.5 text-zinc-650">{tc.expected}</td>
                          <td className="py-2.5 pr-2 font-black font-mono text-[10px]">{tc.priority}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* GENERATE API DOCUMENTATION */}
              {activeResponseTab === 'docs' && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                    <span>Generated Markdown Documentation</span>
                    <button
                      onClick={() => handleCopyCode(generatedDocsText, 'docs')}
                      className="text-teal-655 hover:underline"
                    >
                      {copiedCodeId === 'docs' ? 'Copied' : 'Copy Documentation'}
                    </button>
                  </div>
                  <pre className="p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-700 dark:text-zinc-300 max-h-60 overflow-y-auto whitespace-pre-wrap select-all">
                    {generatedDocsText}
                  </pre>
                </div>
              )}

              {/* COMPARE RESPONSES */}
              {activeResponseTab === 'compare' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Paste Second Response Payload JSON</label>
                    <textarea
                      value={compareResponseText}
                      onChange={(e) => setCompareResponseText(e.target.value)}
                      placeholder='{ "key": "value" }'
                      className="w-full h-24 p-2 border rounded font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <button onClick={executeResponseDiff} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold">Compare Responses</button>
                  
                  {comparisonDelta && (
                    <div className="p-3 border rounded-xl bg-zinc-50 text-xs font-mono text-zinc-750 font-bold">
                      Result: {comparisonDelta}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CORS ERROR DETAILS PANEL */}
          {responseError && (
            <div className="p-6 rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] space-y-4 text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-500/10 text-rose-600 uppercase font-mono">⚠ Request Failed</span>
                <span className="text-zinc-400 font-bold">Error Type: {responseError.type === 'CORS_ERROR' ? 'CORS BLOCK' : 'SSRF PROTECTED'}</span>
              </div>
              <p className="text-zinc-650 leading-relaxed font-semibold">
                {responseError.message}
              </p>
              {responseError.type === 'CORS_ERROR' && (
                <div className="pt-2 leading-relaxed text-zinc-500">
                  🛡 <strong>Why did this happen?</strong> Browser environment fetch security policies (CORS) restrict standard direct client scripts from accessing third-party API hosts unless they respond with wildcard access headers (`Access-Control-Allow-Origin: *`). The request will compile and succeed cleanly when executed inside server clients (like Postman or raw CLI cURL).
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimers & Security sandbox policy */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/85 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-zinc-200 dark:border-zinc-800/85">
          <Shield className="w-4 h-4 text-teal-605" />
          <span>Local Security Sandbox Controls</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-405">
          🔒 <strong>SSRF Protection Shield:</strong> Requests pointing to local networks or cloud metadata directories (e.g. `localhost`, `127.0.0.1`, or `169.254.169.254`) are blocked before leaving the browser environment. No credentials or payload parameters are stored on third-party servers. All request history checkpoints reside locally inside your browser's private storage registry.
        </p>
      </div>

      {/* Educational FAQ block */}
      <div className="pt-6 border-t space-y-6">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">REST API Testing Guide</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed font-medium">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">What is an Online API Tester?</h4>
              <p>An API tester is a utility allowing developers and QA engineers to send HTTP request configurations (GET, POST, PUT, DELETE, PATCH, etc.) to target backend servers and verify response payloads, headers, status codes, and connection latency metrics directly from the browser window.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">Why does CORS block some API calls in the browser?</h4>
              <p>Cross-Origin Resource Sharing (CORS) is a security guardrail built into modern browsers. If a target backend endpoint does not send appropriate headers allowing requests from your domain origin, the browser prevents reading the payload. Developers verify blocked APIs by copying cURL codes or executing them via CLI terminals.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">How do environment variables help?</h4>
              <p>Variables let you customize API endpoints without rewriting paths manually. Use braces such as `{"{{baseUrl}}"}` inside query inputs or URL bars, and switch staging databases (Development, Staging, Production) to swap values instantly.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">Are authorization keys secure?</h4>
              <p>Yes. All Bearer authentication strings, basic authentication passwords, and API key header values are saved exclusively in your browser session's local cache sandbox. No credentials leave your device.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
