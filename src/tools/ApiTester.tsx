import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Folder,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Save,
  Search,
  CheckCircle2,
  XCircle,
  X,
  ChevronRight,
  ChevronDown,
  Share2,
  MoreHorizontal,
  Box,
  Monitor,
  History,
  FileText
} from 'lucide-react';

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface AssertionRow {
  id: string;
  type: 'status' | 'time' | 'header' | 'json_path' | 'body_contains';
  property: string;
  operator: 'equals' | 'contains' | 'not_equals' | 'less_than' | 'greater_than' | 'exists';
  value: string;
}

interface RequestTab {
  id: string;
  name: string;
  method: string;
  url: string;
  queryParams: KeyValueRow[];
  headers: KeyValueRow[];
  bodyType: 'none' | 'json' | 'form-data' | 'urlencoded' | 'raw' | 'graphql';
  bodyJson: string;
  bodyFormData: KeyValueRow[];
  bodyUrlEncoded: KeyValueRow[];
  bodyRaw: string;
  bodyRawFormat: 'text' | 'json' | 'xml' | 'html' | 'javascript';
  bodyGraphQLQuery: string;
  bodyGraphQLVars: string;
  authType: 'none' | 'bearer' | 'basic' | 'apikey';
  authBearer: string;
  authBasicUser: string;
  authBasicPass: string;
  authApiKeyName: string;
  authApiKeyValue: string;
  authApiKeyLocation: 'header' | 'query';
  assertions: AssertionRow[];
  useCorsProxy: boolean;
  scriptPreRequest: string;
  scriptPostResponse: string;
}

interface Collection {
  id: string;
  name: string;
  requests: Partial<RequestTab>[];
}

interface HistoryItem {
  id: string;
  method: string;
  url: string;
  timestamp: string;
  status: number;
  statusText: string;
  time: number;
  size: string;
  requestConfig: RequestTab;
}

interface EnvVariable {
  key: string;
  value: string;
}

// Predefined Mock Datasets for testing
const SAMPLE_DATASETS = [
  {
    id: 'users',
    name: 'User Profiles',
    icon: '👥',
    desc: '3 user objects with ID, email, avatar & roles',
    data: [
      { id: 'usr_101', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', role: 'admin', active: true },
      { id: 'usr_102', name: 'Priya Patel', email: 'priya.patel@example.com', role: 'developer', active: true },
      { id: 'usr_103', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', role: 'viewer', active: false }
    ]
  },
  {
    id: 'products',
    name: 'E-Commerce Catalog',
    icon: '🛍️',
    desc: 'Inventory records with SKU, price, stock & ratings',
    data: [
      { id: 'prod_901', sku: 'SKU-HEADSET-01', title: 'Wireless ANC Headphones', price: 149.99, stock: 45, rating: 4.8 },
      { id: 'prod_902', sku: 'SKU-KEYBOARD-02', title: 'Mechanical RGB Keyboard', price: 89.5, stock: 120, rating: 4.9 },
      { id: 'prod_903', sku: 'SKU-MONITOR-03', title: '34" Curved 4K Monitor', price: 499.0, stock: 18, rating: 4.7 }
    ]
  },
  {
    id: 'transactions',
    name: 'Orders & Payments',
    icon: '💳',
    desc: 'Transaction records with amount, currency & status',
    data: [
      { txnId: 'txn_982348123', orderId: 'ord_1001', amount: 249.49, currency: 'USD', status: 'succeeded', timestamp: '2026-09-22T10:00:00Z' },
      { txnId: 'txn_982348124', orderId: 'ord_1002', amount: 89.0, currency: 'USD', status: 'pending', timestamp: '2026-09-22T10:05:00Z' }
    ]
  },
  {
    id: 'locations',
    name: 'Geo Locations',
    icon: '📍',
    desc: 'Coordinates, city, state & postal code items',
    data: [
      { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.8777, postalCode: '400001' },
      { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946, postalCode: '560001' },
      { city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.7749, lng: -122.4194, postalCode: '94103' }
    ]
  },
  {
    id: 'auth_jwt',
    name: 'JWT Auth Claims',
    icon: '🔑',
    desc: 'Standard JWT claims with sub, exp, aud, roles',
    data: {
      iss: 'https://auth.toolique.io/',
      sub: 'usr_auth_7849102',
      aud: 'https://api.toolique.io/v1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      scope: 'read:users write:users read:reports admin:all',
      roles: ['SuperAdmin', 'Engineer']
    }
  }
];

// 1-Click Starter API Templates
const QUICK_STARTERS = [
  {
    label: 'JSONPlaceholder Users (GET)',
    method: 'GET',
    category: 'REST API',
    desc: 'Fetch 10 users with email & address',
    action: {
      name: 'Fetch Users List',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      bodyType: 'none' as const,
      queryParams: [{ id: 'p1', key: '_limit', value: '10', enabled: true }],
      headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
      assertions: [
        { id: 'a1', type: 'status' as const, property: '', operator: 'equals' as const, value: '200' },
        { id: 'a2', type: 'time' as const, property: '', operator: 'less_than' as const, value: '1500' }
      ]
    }
  },
  {
    label: 'Create Post (JSON Body)',
    method: 'POST',
    category: 'REST API',
    desc: 'Create new post with JSON payload',
    action: {
      name: 'Create Post Item',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      bodyType: 'json' as const,
      bodyJson: '{\n  "title": "REST API Studio Testing",\n  "body": "Testing multi-format HTTP client features",\n  "userId": 1\n}',
      queryParams: [],
      headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json; charset=UTF-8', enabled: true }],
      assertions: [
        { id: 'a1', type: 'status' as const, property: '', operator: 'equals' as const, value: '201' }
      ]
    }
  },
  {
    label: 'Form Data Upload (Multipart)',
    method: 'POST',
    category: 'Forms',
    desc: 'Post multipart/form-data key-value pairs',
    action: {
      name: 'Submit Multipart Form',
      method: 'POST',
      url: 'https://httpbin.org/post',
      bodyType: 'form-data' as const,
      bodyFormData: [
        { id: 'fd1', key: 'username', value: 'ajinkya_developer', enabled: true },
        { id: 'fd2', key: 'environment', value: 'staging', enabled: true }
      ],
      queryParams: [],
      headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
      assertions: [
        { id: 'a1', type: 'status' as const, property: '', operator: 'equals' as const, value: '200' }
      ]
    }
  },
  {
    label: 'Countries GraphQL Query',
    method: 'POST',
    category: 'GraphQL',
    desc: 'Fetch country names and emojis via GraphQL query',
    action: {
      name: 'Query Country Emojis',
      method: 'POST',
      url: 'https://countries.trevorblades.com/',
      bodyType: 'graphql' as const,
      bodyGraphQLQuery: 'query GetCountry {\n  country(code: "IN") {\n    name\n    native\n    capital\n    emoji\n    currency\n  }\n}',
      bodyGraphQLVars: '{\n  \n}',
      queryParams: [],
      headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true }],
      assertions: [
        { id: 'a1', type: 'status' as const, property: '', operator: 'equals' as const, value: '200' }
      ]
    }
  },
  {
    label: 'HttpBin Client Diagnostics',
    method: 'GET',
    category: 'Diagnostics',
    desc: 'Inspect browser request headers & IP',
    action: {
      name: 'Get Client IP & Headers',
      method: 'GET',
      url: 'https://httpbin.org/headers',
      bodyType: 'none' as const,
      queryParams: [],
      headers: [{ id: 'h1', key: 'X-Client-Agent', value: 'Toolique-API-Studio', enabled: true }],
      assertions: [
        { id: 'a1', type: 'status' as const, property: '', operator: 'equals' as const, value: '200' }
      ]
    }
  }
];

// Helper to create a clean blank request tab
const createBlankTab = (idSuffix = '1', name = 'New Request'): RequestTab => ({
  id: `tab-${Date.now()}-${idSuffix}`,
  name,
  method: 'GET',
  url: '',
  queryParams: [],
  headers: [
    { id: 'h1', key: 'Accept', value: 'application/json', enabled: true }
  ],
  bodyType: 'none',
  bodyJson: '{\n  \n}',
  bodyFormData: [
    { id: 'fd1', key: '', value: '', enabled: true }
  ],
  bodyUrlEncoded: [
    { id: 'ue1', key: '', value: '', enabled: true }
  ],
  bodyRaw: '',
  bodyRawFormat: 'json',
  bodyGraphQLQuery: 'query {\n  \n}',
  bodyGraphQLVars: '{\n  \n}',
  authType: 'none',
  authBearer: '',
  authBasicUser: '',
  authBasicPass: '',
  authApiKeyName: 'X-API-Key',
  authApiKeyValue: '',
  authApiKeyLocation: 'header',
  assertions: [
    { id: 'a1', type: 'status', property: '', operator: 'equals', value: '200' }
  ],
  useCorsProxy: false,
  scriptPreRequest: '',
  scriptPostResponse: ''
});

export default function ApiTester() {
  // Tabs State: starts with 1 blank clean request tab
  const [tabs, setTabs] = useState<RequestTab[]>([createBlankTab('1', 'New Request')]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  // Active Tab Selector
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Request Config Active Tab
  const [requestConfigTab, setRequestConfigTab] = useState<'docs' | 'params' | 'auth' | 'headers' | 'body' | 'scripts' | 'settings'>('params');

  // GraphQL Sub-Tab (Query vs Variables)
  const [graphqlSubTab, setGraphqlSubTab] = useState<'query' | 'variables'>('query');

  // Script Sub-Tab (Pre-request vs Post-response)
  const [scriptSubTab, setScriptSubTab] = useState<'before' | 'after'>('before');

  // Response View Sub-tabs
  const [responseViewTab, setResponseViewTab] = useState<'body' | 'cookies' | 'headers' | 'tests'>('body');
  const [responseFormat, setResponseFormat] = useState<'json' | 'preview' | 'visualize' | 'raw'>('json');

  // Sidebar Multi-Accordion Expansion States
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    collections: true,
    environments: true,
    documents: false,
    specs: false,
    mocks: false,
    datasets: false,
    flows: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [collectionSearchQuery, setCollectionSearchQuery] = useState<string>('');

  // Environments: empty by default with no pre-filled values
  const [currentEnv, setCurrentEnv] = useState<string>('');
  const [envVars, setEnvVars] = useState<Record<string, EnvVariable[]>>({});

  // Collections: empty by default with no hardcoded pre-filled requests
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Execution States: initially null
  const [isSending, setIsSending] = useState<boolean>(false);
  const [responseState, setResponseState] = useState<any | null>(null);
  const [assertionResults, setAssertionResults] = useState<any[]>([]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const storedHist = localStorage.getItem('toolique_api_history_v3');
      if (storedHist) setHistory(JSON.parse(storedHist));

      const storedCols = localStorage.getItem('toolique_api_collections_v3');
      if (storedCols) setCollections(JSON.parse(storedCols));

      const storedEnvs = localStorage.getItem('toolique_api_env_v3');
      if (storedEnvs) setEnvVars(JSON.parse(storedEnvs));

      const storedCurEnv = localStorage.getItem('toolique_api_current_env_v3');
      if (storedCurEnv) setCurrentEnv(storedCurEnv);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    try {
      localStorage.setItem('toolique_api_history_v3', JSON.stringify(items));
    } catch {}
  };

  const saveCollections = (cols: Collection[]) => {
    try {
      localStorage.setItem('toolique_api_collections_v3', JSON.stringify(cols));
    } catch {}
  };

  const saveEnvVars = (envs: Record<string, EnvVariable[]>) => {
    try {
      localStorage.setItem('toolique_api_env_v3', JSON.stringify(envs));
    } catch {}
  };

  // Interpolate {{variables}}
  const interpolate = useCallback(
    (text: string) => {
      let res = text || '';
      if (!currentEnv || !envVars[currentEnv]) return res;
      const activeVars = envVars[currentEnv] || [];
      activeVars.forEach((v) => {
        if (v.key) {
          const regex = new RegExp(`\\{\\{\\s*${v.key}\\s*\\}\\}`, 'g');
          res = res.replace(regex, v.value);
        }
      });
      return res;
    },
    [envVars, currentEnv]
  );

  // Update active tab property helper
  const updateActiveTab = useCallback(
    (updater: Partial<RequestTab> | ((prev: RequestTab) => RequestTab)) => {
      setTabs((prevTabs) =>
        prevTabs.map((t) => {
          if (t.id === activeTabId) {
            if (typeof updater === 'function') {
              return updater(t);
            }
            return { ...t, ...updater };
          }
          return t;
        })
      );
    },
    [activeTabId]
  );

  // Method Color Styling (Harmonized across Light & Dark themes)
  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30';
      case 'POST':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30';
      case 'PUT':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30';
      case 'DELETE':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30';
      case 'PATCH':
        return 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30';
      default:
        return 'text-zinc-700 dark:text-slate-400 bg-zinc-100 dark:bg-slate-500/10 border-zinc-200 dark:border-slate-500/30';
    }
  };

  // Add new tab
  const handleAddNewTab = () => {
    const newTab = createBlankTab(String(tabs.length + 1), `Request ${tabs.length + 1}`);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // Close tab
  const handleCloseTab = (idToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const nextTabs = tabs.filter((t) => t.id !== idToClose);
    setTabs(nextTabs);
    if (activeTabId === idToClose) {
      setActiveTabId(nextTabs[0].id);
    }
  };

  // Create New Environment
  const handleCreateEnvironment = () => {
    const envName = prompt('Enter Environment Name (e.g. Development, Staging, Production):');
    if (!envName || !envName.trim()) return;
    const trimmed = envName.trim();
    if (envVars[trimmed]) {
      alert(`Environment "${trimmed}" already exists.`);
      setCurrentEnv(trimmed);
      return;
    }
    const updated = { ...envVars, [trimmed]: [] };
    setEnvVars(updated);
    saveEnvVars(updated);
    setCurrentEnv(trimmed);
    localStorage.setItem('toolique_api_current_env_v3', trimmed);
  };

  // Add variable to current environment
  const handleAddVariableToCurrentEnv = () => {
    if (!currentEnv) {
      handleCreateEnvironment();
      return;
    }
    const currentList = envVars[currentEnv] || [];
    const updatedList = [...currentList, { key: '', value: '' }];
    const updatedAll = { ...envVars, [currentEnv]: updatedList };
    setEnvVars(updatedAll);
    saveEnvVars(updatedAll);
  };

  // Create New Collection
  const handleCreateCollection = () => {
    const colName = prompt('Enter Collection / Folder Name:');
    if (!colName || !colName.trim()) return;
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name: colName.trim(),
      requests: [
        {
          name: activeTab.name || 'Initial Request',
          method: activeTab.method,
          url: activeTab.url,
          headers: activeTab.headers,
          bodyType: activeTab.bodyType,
          bodyJson: activeTab.bodyJson
        }
      ]
    };
    const updated = [...collections, newCol];
    setCollections(updated);
    saveCollections(updated);
  };

  // Save active tab to existing or new collection
  const handleSaveActiveToCollection = () => {
    if (collections.length === 0) {
      handleCreateCollection();
      return;
    }
    const col = collections[0];
    const updatedReqs = [
      ...col.requests,
      {
        name: activeTab.name || 'New Request',
        method: activeTab.method,
        url: activeTab.url,
        headers: activeTab.headers,
        bodyType: activeTab.bodyType,
        bodyJson: activeTab.bodyJson
      }
    ];
    const updatedCols = collections.map((c, i) => (i === 0 ? { ...c, requests: updatedReqs } : c));
    setCollections(updatedCols);
    saveCollections(updatedCols);
    alert(`Saved "${activeTab.name}" to folder "${col.name}"!`);
  };

  // Run Assertions Engine
  const runAssertions = (resData: any, assertionRules: AssertionRow[]) => {
    if (!assertionRules || assertionRules.length === 0) {
      setAssertionResults([]);
      return;
    }
    const results = assertionRules.map((rule) => {
      let passed = false;
      let actualVal: any = '';

      switch (rule.type) {
        case 'status':
          actualVal = String(resData.status);
          if (rule.operator === 'equals') passed = String(resData.status) === String(rule.value);
          if (rule.operator === 'not_equals') passed = String(resData.status) !== String(rule.value);
          break;
        case 'time':
          actualVal = `${resData.time}ms`;
          if (rule.operator === 'less_than') passed = Number(resData.time) < Number(rule.value);
          if (rule.operator === 'greater_than') passed = Number(resData.time) > Number(rule.value);
          break;
        case 'body_contains':
          actualVal = resData.text;
          passed = resData.text ? resData.text.includes(rule.value) : false;
          break;
        default:
          passed = true;
      }

      return {
        id: rule.id,
        name: `Assertion: ${rule.type} ${rule.operator} ${rule.value}`,
        passed,
        actual: actualVal,
        expected: rule.value
      };
    });

    setAssertionResults(results);
  };

  // Execute Network Fetch + Multi-Format Body Handling + Pre/Post Scripts
  const triggerSendRequest = async () => {
    if (!activeTab.url || !activeTab.url.trim()) {
      alert('Please enter a request URL to send.');
      return;
    }

    setIsSending(true);
    setAssertionResults([]);

    // 1. Run Pre-Request Script in Sandbox
    const dynamicVars: Record<string, string> = {};
    if (activeTab.scriptPreRequest && activeTab.scriptPreRequest.trim()) {
      try {
        const pm = {
          variables: {
            set: (k: string, v: string) => {
              dynamicVars[k] = String(v);
            },
            get: (k: string) => {
              return dynamicVars[k] || envVars[currentEnv]?.find((x) => x.key === k)?.value;
            }
          }
        };
        const scriptFn = new Function('pm', 'console', activeTab.scriptPreRequest);
        scriptFn(pm, console);
      } catch (err) {
        console.warn('Pre-request script execution:', err);
      }
    }

    // Apply dynamic pre-request generated variables
    let cleanRawUrl = activeTab.url;
    Object.keys(dynamicVars).forEach((k) => {
      const regex = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g');
      cleanRawUrl = cleanRawUrl.replace(regex, dynamicVars[k]);
    });
    cleanRawUrl = interpolate(cleanRawUrl);

    let targetUrl = cleanRawUrl;
    try {
      const urlObj = new URL(cleanRawUrl);
      const activeParams = activeTab.queryParams.filter((p) => p.enabled && p.key);
      activeParams.forEach((p) => {
        urlObj.searchParams.set(interpolate(p.key), interpolate(p.value));
      });
      targetUrl = urlObj.toString();
    } catch {}

    let finalFetchUrl = targetUrl;
    if (activeTab.useCorsProxy) {
      finalFetchUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    }

    const headersObj: Record<string, string> = {};
    activeTab.headers
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        let val = interpolate(h.value);
        Object.keys(dynamicVars).forEach((k) => {
          val = val.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), dynamicVars[k]);
        });
        headersObj[interpolate(h.key)] = val;
      });

    if (activeTab.authType === 'bearer' && activeTab.authBearer) {
      headersObj['Authorization'] = `Bearer ${interpolate(activeTab.authBearer)}`;
    } else if (activeTab.authType === 'basic') {
      const credentials = btoa(`${interpolate(activeTab.authBasicUser)}:${interpolate(activeTab.authBasicPass)}`);
      headersObj['Authorization'] = `Basic ${credentials}`;
    } else if (activeTab.authType === 'apikey' && activeTab.authApiKeyLocation === 'header' && activeTab.authApiKeyName) {
      headersObj[interpolate(activeTab.authApiKeyName)] = interpolate(activeTab.authApiKeyValue);
    }

    // 2. Build multi-format Request Body
    let reqBody: any = undefined;
    if (activeTab.method !== 'GET' && activeTab.method !== 'HEAD') {
      if (activeTab.bodyType === 'json') {
        reqBody = interpolate(activeTab.bodyJson || '{}');
        if (!headersObj['Content-Type']) headersObj['Content-Type'] = 'application/json; charset=UTF-8';
      } else if (activeTab.bodyType === 'form-data') {
        const formData = new FormData();
        activeTab.bodyFormData
          .filter((r) => r.enabled && r.key)
          .forEach((r) => {
            formData.append(interpolate(r.key), interpolate(r.value));
          });
        reqBody = formData;
        // Let browser generate multipart/form-data boundary automatically
        delete headersObj['Content-Type'];
      } else if (activeTab.bodyType === 'urlencoded') {
        const urlParams = new URLSearchParams();
        activeTab.bodyUrlEncoded
          .filter((r) => r.enabled && r.key)
          .forEach((r) => {
            urlParams.append(interpolate(r.key), interpolate(r.value));
          });
        reqBody = urlParams.toString();
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
      } else if (activeTab.bodyType === 'raw') {
        reqBody = interpolate(activeTab.bodyRaw || '');
        const mimeMap: Record<string, string> = {
          text: 'text/plain; charset=UTF-8',
          json: 'application/json; charset=UTF-8',
          xml: 'application/xml; charset=UTF-8',
          html: 'text/html; charset=UTF-8',
          javascript: 'application/javascript; charset=UTF-8'
        };
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = mimeMap[activeTab.bodyRawFormat] || 'text/plain; charset=UTF-8';
        }
      } else if (activeTab.bodyType === 'graphql') {
        let parsedVars = {};
        try {
          parsedVars = JSON.parse(interpolate(activeTab.bodyGraphQLVars || '{}'));
        } catch {}
        reqBody = JSON.stringify({
          query: interpolate(activeTab.bodyGraphQLQuery || ''),
          variables: parsedVars
        });
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = 'application/json; charset=UTF-8';
        }
      }
    }

    const startTime = performance.now();

    try {
      const res = await fetch(finalFetchUrl, {
        method: activeTab.method,
        headers: headersObj,
        body: reqBody
      });

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      const textOutput = await res.text();

      let isJson = false;
      let jsonPayload: any = null;
      try {
        jsonPayload = JSON.parse(textOutput);
        isJson = true;
      } catch {}

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      const sizeKb = `${(new Blob([textOutput]).size / 1024).toFixed(2)} KB`;

      const payload = {
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : 'Response Received'),
        time: latency,
        size: sizeKb,
        headers: resHeaders,
        isJson,
        json: jsonPayload,
        text: textOutput,
        url: targetUrl
      };

      setResponseState(payload);

      // Run assertion checks
      runAssertions(payload, activeTab.assertions);

      // Save to history
      const histItem: HistoryItem = {
        id: `h-${Date.now()}`,
        method: activeTab.method,
        url: targetUrl,
        timestamp: new Date().toLocaleTimeString(),
        status: res.status,
        statusText: payload.statusText,
        time: latency,
        size: sizeKb,
        requestConfig: { ...activeTab }
      };
      const newHist = [histItem, ...history].slice(0, 40);
      setHistory(newHist);
      saveHistory(newHist);
    } catch (err: any) {
      const errorPayload = {
        status: 0,
        statusText: 'Network / CORS Error',
        time: Math.round(performance.now() - startTime),
        size: '0 B',
        headers: {},
        isJson: false,
        json: null,
        text: `Request Failed: ${err?.message || 'Failed to fetch'}\n\nTip: Enable the 'CORS Proxy Relay' checkbox in the Settings tab to bypass cross-origin browser limits.`,
        url: targetUrl
      };
      setResponseState(errorPayload);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Comprehensive cURL Generator Supporting All Body Types
  const generateCurlCommand = () => {
    let cmd = `curl -X ${activeTab.method} "${interpolate(activeTab.url)}"`;

    activeTab.headers
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        cmd += ` \\\n  -H "${interpolate(h.key)}: ${interpolate(h.value)}"`;
      });

    if (activeTab.authType === 'bearer' && activeTab.authBearer) {
      cmd += ` \\\n  -H "Authorization: Bearer ${interpolate(activeTab.authBearer)}"`;
    }

    if (activeTab.method !== 'GET' && activeTab.method !== 'HEAD') {
      if (activeTab.bodyType === 'json' && activeTab.bodyJson) {
        cmd += ` \\\n  -H "Content-Type: application/json"`;
        cmd += ` \\\n  -d '${interpolate(activeTab.bodyJson).replace(/'/g, "\\'")}'`;
      } else if (activeTab.bodyType === 'urlencoded') {
        cmd += ` \\\n  -H "Content-Type: application/x-www-form-urlencoded"`;
        const params = new URLSearchParams();
        activeTab.bodyUrlEncoded
          .filter((r) => r.enabled && r.key)
          .forEach((r) => params.append(interpolate(r.key), interpolate(r.value)));
        cmd += ` \\\n  -d "${params.toString()}"`;
      } else if (activeTab.bodyType === 'form-data') {
        activeTab.bodyFormData
          .filter((r) => r.enabled && r.key)
          .forEach((r) => {
            cmd += ` \\\n  -F "${interpolate(r.key)}=${interpolate(r.value)}"`;
          });
      } else if (activeTab.bodyType === 'raw') {
        cmd += ` \\\n  -d '${interpolate(activeTab.bodyRaw).replace(/'/g, "\\'")}'`;
      } else if (activeTab.bodyType === 'graphql') {
        cmd += ` \\\n  -H "Content-Type: application/json"`;
        cmd += ` \\\n  -d '${JSON.stringify({
          query: interpolate(activeTab.bodyGraphQLQuery),
          variables: JSON.parse(activeTab.bodyGraphQLVars || '{}')
        }).replace(/'/g, "\\'")}'`;
      }
    }

    return cmd;
  };

  // Helper to split lines for code editor display
  const renderLineNumberedCode = (code: string, onChange?: (newVal: string) => void, placeholder?: string) => {
    const lines = (code || '').split('\n');
    return (
      <div className="flex bg-zinc-50 dark:bg-[#0c101d] rounded-2xl border border-zinc-200 dark:border-slate-800 text-xs font-mono overflow-hidden shadow-inner">
        {/* Line Numbers column */}
        <div className="py-3 px-2.5 bg-zinc-100/80 dark:bg-[#080b14] text-zinc-400 dark:text-slate-600 select-none text-right font-mono text-[11px] leading-relaxed border-r border-zinc-200 dark:border-slate-800/80 min-w-[38px]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        {/* Code Content Area */}
        <textarea
          value={code}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={!onChange}
          placeholder={placeholder}
          className="flex-1 p-3 bg-transparent text-zinc-800 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-mono text-[11px] overflow-x-auto whitespace-pre"
          rows={Math.max(lines.length, 10)}
          spellCheck={false}
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 text-left font-sans select-none">
      {/* Main Studio Frame with Adaptive Light / Dark Theme Support & Enhanced Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start bg-white/90 dark:bg-[#0d121f] text-zinc-800 dark:text-slate-200 p-3 sm:p-4 md:p-5 rounded-3xl border border-zinc-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-300">
        
        {/* 1. LEFT SIDEBAR NAVIGATION ACCORDION */}
        <div className="lg:col-span-3 bg-zinc-50/90 dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 space-y-3.5 transition-colors">
          {/* Top Activity Rail Icons */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <button
                className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-2xs cursor-pointer"
                title="Explorer"
              >
                <Box className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-slate-800/60 transition cursor-pointer"
                title="Environments"
                onClick={() => toggleSection('environments')}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-slate-800/60 transition cursor-pointer"
                title="History"
                onClick={() => toggleSection('flows')}
              >
                <History className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-slate-800/60 transition cursor-pointer"
                title="Collections"
                onClick={() => toggleSection('collections')}
              >
                <Folder className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const name = prompt('New Request Name:', 'My API Endpoint');
                  if (name) {
                    const newTab = createBlankTab(String(tabs.length + 1), name);
                    setTabs([...tabs, newTab]);
                    setActiveTabId(newTab.id);
                  }
                }}
                className="p-1.5 text-zinc-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Create New Request"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCreateCollection}
                className="p-1.5 text-zinc-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Create New Collection Folder"
              >
                <Folder className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1.5 text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-500" />
            <input
              type="text"
              value={collectionSearchQuery}
              onChange={(e) => setCollectionSearchQuery(e.target.value)}
              placeholder="Search endpoints..."
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-800 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
            />
          </div>

          {/* ACCORDION SECTIONS TREE */}
          <div className="space-y-1.5 text-xs font-mono max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {/* SECTION 1: COLLECTIONS */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1.5 px-2 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50 rounded-xl transition">
                <button
                  onClick={() => toggleSection('collections')}
                  className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-700 dark:text-slate-300 tracking-wider flex-1 text-left cursor-pointer"
                >
                  {expandedSections.collections ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                  )}
                  <span>COLLECTIONS</span>
                </button>
                <button
                  onClick={handleCreateCollection}
                  className="text-zinc-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-teal-400 p-1 rounded hover:bg-zinc-200/80 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Add Folder"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {expandedSections.collections && (
                <div className="pl-3 mt-1 space-y-1">
                  {collections.length === 0 ? (
                    <div className="p-3 bg-white/70 dark:bg-[#090d17] border border-dashed border-zinc-200 dark:border-slate-800 rounded-xl text-center space-y-2">
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400">No collections created</div>
                      <button
                        onClick={handleCreateCollection}
                        className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-teal-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 rounded-lg border border-indigo-200 dark:border-teal-500/30 transition shadow-2xs cursor-pointer"
                      >
                        + New Folder
                      </button>
                    </div>
                  ) : (
                    collections.map((col) => (
                      <div key={col.id} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-800 dark:text-slate-300 py-1 px-1.5">
                          <Folder className="w-3.5 h-3.5 text-indigo-500 dark:text-teal-400" />
                          <span className="truncate">{col.name}</span>
                        </div>
                        <div className="pl-2 space-y-1">
                          {col.requests.map((req, rIdx) => {
                            const isSelected = activeTab.name === req.name;
                            return (
                              <button
                                key={rIdx}
                                onClick={() => {
                                  updateActiveTab({
                                    name: req.name,
                                    method: req.method || 'GET',
                                    url: req.url || '',
                                    headers: req.headers || activeTab.headers,
                                    bodyType: req.bodyType || 'none',
                                    bodyJson: req.bodyJson || activeTab.bodyJson
                                  });
                                }}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left truncate transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 dark:bg-[#211a3b] text-indigo-900 dark:text-white font-bold border border-indigo-200 dark:border-indigo-500/40 shadow-xs'
                                    : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-200/50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <span
                                  className={`text-[9px] font-black font-mono px-1 rounded uppercase border ${getMethodBadgeClass(
                                    req.method || 'GET'
                                  )}`}
                                >
                                  {req.method || 'GET'}
                                </span>
                                <span className="truncate text-[11px]">{req.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* SECTION 2: ENVIRONMENTS */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1.5 px-2 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50 rounded-xl transition">
                <button
                  onClick={() => toggleSection('environments')}
                  className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-700 dark:text-slate-300 tracking-wider flex-1 text-left cursor-pointer"
                >
                  {expandedSections.environments ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                  )}
                  <span>ENVIRONMENTS</span>
                </button>
                <button
                  onClick={handleCreateEnvironment}
                  className="text-zinc-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-teal-400 p-1 rounded hover:bg-zinc-200/80 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Add Environment"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {expandedSections.environments && (
                <div className="pl-3 mt-1 space-y-2">
                  {Object.keys(envVars).length === 0 ? (
                    <div className="p-3 bg-white/70 dark:bg-[#090d17] border border-dashed border-zinc-200 dark:border-slate-800 rounded-xl text-center space-y-2">
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400">No environments configured</div>
                      <button
                        onClick={handleCreateEnvironment}
                        className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-teal-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 rounded-lg border border-indigo-200 dark:border-teal-500/30 transition shadow-2xs cursor-pointer"
                      >
                        + New Environment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.keys(envVars).map((envName) => {
                        const isCurrent = currentEnv === envName;
                        return (
                          <div
                            key={envName}
                            className={`p-2.5 rounded-xl border transition ${
                              isCurrent
                                ? 'bg-indigo-50/80 dark:bg-[#0e1626] border-indigo-300 dark:border-teal-500/40 text-indigo-950 dark:text-teal-300 shadow-xs'
                                : 'bg-white dark:bg-[#090d17] border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-1.5">
                              <button
                                onClick={() => {
                                  setCurrentEnv(envName);
                                  localStorage.setItem('toolique_api_current_env_v3', envName);
                                }}
                                className="flex items-center gap-1.5 font-bold text-[11px] truncate text-left cursor-pointer"
                              >
                                <span className="truncate">{envName}</span>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-400 shrink-0" />}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete environment "${envName}"?`)) {
                                    const { [envName]: _, ...rest } = envVars;
                                    setEnvVars(rest);
                                    saveEnvVars(rest);
                                    if (currentEnv === envName) {
                                      setCurrentEnv('');
                                      localStorage.removeItem('toolique_api_current_env_v3');
                                    }
                                  }
                                }}
                                className="text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                                title="Delete Environment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Variables list if active */}
                            {isCurrent && (
                              <div className="pt-2 border-t border-indigo-200/60 dark:border-slate-800/80 space-y-1.5">
                                {envVars[envName].map((v, vIdx) => (
                                  <div key={vIdx} className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={v.key}
                                      onChange={(e) => {
                                        const updatedList = [...envVars[envName]];
                                        updatedList[vIdx].key = e.target.value;
                                        const updatedAll = { ...envVars, [envName]: updatedList };
                                        setEnvVars(updatedAll);
                                        saveEnvVars(updatedAll);
                                      }}
                                      placeholder="key"
                                      className="w-1/2 p-1.5 bg-white dark:bg-[#05070d] border border-zinc-200 dark:border-slate-800 rounded-lg text-[10px] font-mono text-zinc-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                                    />
                                    <input
                                      type="text"
                                      value={v.value}
                                      onChange={(e) => {
                                        const updatedList = [...envVars[envName]];
                                        updatedList[vIdx].value = e.target.value;
                                        const updatedAll = { ...envVars, [envName]: updatedList };
                                        setEnvVars(updatedAll);
                                        saveEnvVars(updatedAll);
                                      }}
                                      placeholder="value"
                                      className="w-1/2 p-1.5 bg-white dark:bg-[#05070d] border border-zinc-200 dark:border-slate-800 rounded-lg text-[10px] font-mono text-zinc-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                      onClick={() => {
                                        const updatedList = envVars[envName].filter((_, i) => i !== vIdx);
                                        const updatedAll = { ...envVars, [envName]: updatedList };
                                        setEnvVars(updatedAll);
                                        saveEnvVars(updatedAll);
                                      }}
                                      className="p-1 text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer"
                                      title="Delete variable"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={handleAddVariableToCurrentEnv}
                                  className="text-[10px] font-bold text-indigo-600 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Add Variable
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 3: DOCUMENTS */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50 rounded-xl text-[11px] font-black uppercase text-zinc-700 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 tracking-wider transition cursor-pointer"
              >
                {expandedSections.documents ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                )}
                <span>DOCUMENTS</span>
              </button>
              {expandedSections.documents && (
                <div className="pl-4 mt-1 space-y-1 text-[10px] text-zinc-600 dark:text-slate-400">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-zinc-800 dark:text-slate-200">{activeTab.name || 'API Endpoint'} Docs</div>
                    <div className="text-zinc-500 dark:text-slate-400">Auto-generated endpoint schema & specs</div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: SPECS & TEMPLATES */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('specs')}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50 rounded-xl text-[11px] font-black uppercase text-zinc-700 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 tracking-wider transition cursor-pointer"
              >
                {expandedSections.specs ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                )}
                <span>SPECS & TEMPLATES</span>
              </button>
              {expandedSections.specs && (
                <div className="pl-4 mt-1 space-y-1 text-[10px]">
                  {QUICK_STARTERS.map((qs, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateActiveTab({
                          name: qs.action.name,
                          method: qs.action.method,
                          url: qs.action.url,
                          bodyType: qs.action.bodyType,
                          bodyJson: (qs.action as any).bodyJson || activeTab.bodyJson,
                          bodyFormData: (qs.action as any).bodyFormData || activeTab.bodyFormData,
                          bodyGraphQLQuery: (qs.action as any).bodyGraphQLQuery || activeTab.bodyGraphQLQuery,
                          bodyGraphQLVars: (qs.action as any).bodyGraphQLVars || activeTab.bodyGraphQLVars,
                          queryParams: qs.action.queryParams || activeTab.queryParams,
                          headers: qs.action.headers || activeTab.headers,
                          assertions: qs.action.assertions || activeTab.assertions
                        });
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-200/70 dark:hover:bg-slate-800 text-zinc-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-teal-400 truncate block transition cursor-pointer"
                    >
                      {qs.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 5: MOCKS */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('mocks')}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50 rounded-xl text-[11px] font-black uppercase text-zinc-700 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 tracking-wider transition cursor-pointer"
              >
                {expandedSections.mocks ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                )}
                <span>MOCKS</span>
              </button>
              {expandedSections.mocks && (
                <div className="pl-4 mt-1 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 space-y-1 text-[10px]">
                  <div className="flex justify-between items-center text-zinc-700 dark:text-slate-300">
                    <span>Mock Engine:</span>
                    <span className="text-emerald-600 dark:text-teal-400 font-bold">Ready</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 6: DATASETS */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('datasets')}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50 rounded-xl text-[11px] font-black uppercase text-zinc-700 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 tracking-wider transition cursor-pointer"
              >
                {expandedSections.datasets ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                )}
                <span>DATASETS</span>
              </button>
              {expandedSections.datasets && (
                <div className="pl-4 mt-1 space-y-1 text-[10px]">
                  {SAMPLE_DATASETS.map((ds) => (
                    <button
                      key={ds.id}
                      onClick={() => {
                        updateActiveTab({
                          bodyType: 'json',
                          bodyJson: JSON.stringify(ds.data, null, 2)
                        });
                        alert(`Loaded "${ds.name}" into JSON Request Body!`);
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-200/70 dark:hover:bg-slate-800 text-zinc-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white truncate block transition cursor-pointer"
                    >
                      {ds.icon} {ds.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 7: FLOWS & HISTORY */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('flows')}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50 rounded-xl text-[11px] font-black uppercase text-zinc-700 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 tracking-wider transition cursor-pointer"
              >
                {expandedSections.flows ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500" />
                )}
                <span>FLOWS & HISTORY</span>
              </button>
              {expandedSections.flows && (
                <div className="pl-4 mt-1 text-[10px] text-zinc-500 dark:text-slate-500 italic py-1">
                  {history.length === 0 ? 'No requests recorded yet' : `${history.length} executions logged`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. MAIN WORKSPACE */}
        <div className="lg:col-span-9 bg-white dark:bg-[#111728] border border-zinc-200/80 dark:border-slate-800/90 rounded-2xl p-3.5 sm:p-4 md:p-5 space-y-4 transition-colors">
          
          {/* TOP TAB STRIP & ACTIVE ENVIRONMENT DROPDOWN */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-200/80 dark:border-slate-800/80">
            {/* Request Tabs Strip */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full pb-0.5">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 shadow-2xs ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-[#231e3d] border-indigo-200 dark:border-indigo-500/60 text-indigo-700 dark:text-white shadow-xs'
                        : 'bg-zinc-100/80 dark:bg-[#0a0e19] border-zinc-200/80 dark:border-slate-800 text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-200/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 shrink-0" />
                    <span className={`text-[9px] font-black uppercase ${getMethodBadgeClass(tab.method)}`}>
                      {tab.method}
                    </span>
                    <span className="truncate max-w-[140px] text-[11px]">{tab.name}</span>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => handleCloseTab(tab.id, e)}
                        className="p-0.5 rounded hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition ml-1"
                        title="Close Tab"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleAddNewTab}
                className="p-2 rounded-xl border border-dashed border-zinc-300 dark:border-slate-700 text-zinc-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-teal-400 dark:hover:text-teal-400 transition cursor-pointer"
                title="Add New Request Tab"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Environment Dropdown on Top Right */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <div className="flex items-center gap-2 bg-zinc-100/80 dark:bg-[#090d17] border border-zinc-200/80 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentEnv ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400 dark:bg-slate-500'
                  }`}
                />
                <select
                  value={currentEnv}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      handleCreateEnvironment();
                    } else {
                      setCurrentEnv(e.target.value);
                      localStorage.setItem('toolique_api_current_env_v3', e.target.value);
                    }
                  }}
                  className="bg-transparent border-0 text-zinc-800 dark:text-slate-300 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-zinc-600 dark:text-slate-400">
                    No Environment
                  </option>
                  {Object.keys(envVars).map((env) => (
                    <option key={env} value={env} className="bg-white dark:bg-slate-900 text-zinc-900 dark:text-white">
                      {env}
                    </option>
                  ))}
                  <option value="__add_new__" className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-teal-400 font-bold">
                    + New Environment...
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* REQUEST HEADER BREADCRUMBS & ACTIONS */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-slate-400 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-400 font-bold border border-indigo-200 dark:border-teal-500/20 shadow-2xs">
                HTTP
              </span>
              <span className="font-bold text-zinc-800 dark:text-slate-200">
                {currentEnv ? `${currentEnv} > ` : ''}{activeTab.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveActiveToCollection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-slate-300 dark:hover:text-white transition text-xs font-bold shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={() => handleCopy(generateCurlCommand(), 'curl')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-slate-300 dark:hover:text-white transition text-xs font-bold shadow-2xs cursor-pointer"
                title="Export and copy cURL snippet"
              >
                {copiedKey === 'curl' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Copied cURL
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" /> Share cURL
                  </>
                )}
              </button>
            </div>
          </div>

          {/* URL & SEND ACTION BAR */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Method Picker */}
            <select
              value={activeTab.method}
              onChange={(e) => updateActiveTab({ method: e.target.value })}
              className="p-2.5 px-3.5 bg-zinc-100/80 dark:bg-[#0a0e19] border border-zinc-200/90 dark:border-slate-800 rounded-xl text-xs font-mono font-black text-amber-600 dark:text-amber-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition cursor-pointer shadow-2xs"
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900 text-zinc-900 dark:text-white font-bold">
                  {m}
                </option>
              ))}
            </select>

            {/* URL Input */}
            <div className="flex-1 relative flex items-center bg-white dark:bg-[#0a0e19] border border-zinc-200/90 dark:border-slate-800 rounded-xl px-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 shadow-2xs transition">
              <input
                type="text"
                value={activeTab.url}
                onChange={(e) => updateActiveTab({ url: e.target.value })}
                placeholder="https://api.example.com/v1/resource or {{baseUrl}}/path"
                className="w-full bg-transparent text-xs font-mono text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 font-bold focus:outline-none py-2.5"
              />
            </div>

            {/* SEND BUTTON */}
            <button
              onClick={triggerSendRequest}
              disabled={isSending}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 text-white rounded-xl text-xs font-black font-mono flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition cursor-pointer shrink-0"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>Send</span>
            </button>
          </div>

          {/* REQUEST CONFIGURATION SUB-TABS (Postman/Bruno Style) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200/80 dark:border-slate-800 pb-1.5 text-xs font-bold text-zinc-500 dark:text-slate-400">
              {[
                { id: 'params', label: `Params (${activeTab.queryParams.length})` },
                { id: 'auth', label: 'Authorization' },
                { id: 'headers', label: `Headers (${activeTab.headers.filter((h) => h.enabled && h.key).length})` },
                { id: 'body', label: `Body ${activeTab.bodyType !== 'none' ? `(${activeTab.bodyType})` : ''}` },
                { id: 'scripts', label: 'Scripts' },
                { id: 'docs', label: '≡ Docs' },
                { id: 'settings', label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRequestConfigTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    requestConfigTab === tab.id
                      ? 'text-indigo-700 dark:text-white bg-indigo-50/80 dark:bg-slate-800/80 font-black border-b-2 border-indigo-600 dark:border-indigo-500 shadow-2xs'
                      : 'hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-100/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT 1: PARAMS */}
            {requestConfigTab === 'params' && (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {activeTab.queryParams.map((q, idx) => (
                  <div key={q.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={q.enabled}
                      onChange={(e) => {
                        const updated = [...activeTab.queryParams];
                        updated[idx].enabled = e.target.checked;
                        updateActiveTab({ queryParams: updated });
                      }}
                      className="rounded accent-indigo-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={q.key}
                      onChange={(e) => {
                        const updated = [...activeTab.queryParams];
                        updated[idx].key = e.target.value;
                        updateActiveTab({ queryParams: updated });
                      }}
                      placeholder="Param Key"
                      className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={q.value}
                      onChange={(e) => {
                        const updated = [...activeTab.queryParams];
                        updated[idx].value = e.target.value;
                        updateActiveTab({ queryParams: updated });
                      }}
                      placeholder="Value"
                      className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => {
                        const updated = activeTab.queryParams.filter((_, i) => i !== idx);
                        updateActiveTab({ queryParams: updated });
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Remove Parameter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newP = {
                      id: `q-${Date.now()}`,
                      key: '',
                      value: '',
                      enabled: true
                    };
                    updateActiveTab({ queryParams: [...activeTab.queryParams, newP] });
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Query Parameter
                </button>
              </div>
            )}

            {/* TAB CONTENT 2: HEADERS */}
            {requestConfigTab === 'headers' && (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {activeTab.headers.map((h, idx) => (
                  <div key={h.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => {
                        const updated = [...activeTab.headers];
                        updated[idx].enabled = e.target.checked;
                        updateActiveTab({ headers: updated });
                      }}
                      className="rounded accent-indigo-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={h.key}
                      onChange={(e) => {
                        const updated = [...activeTab.headers];
                        updated[idx].key = e.target.value;
                        updateActiveTab({ headers: updated });
                      }}
                      placeholder="Header Name (e.g. Authorization)"
                      className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={h.value}
                      onChange={(e) => {
                        const updated = [...activeTab.headers];
                        updated[idx].value = e.target.value;
                        updateActiveTab({ headers: updated });
                      }}
                      placeholder="Header Value"
                      className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => {
                        const updated = activeTab.headers.filter((_, i) => i !== idx);
                        updateActiveTab({ headers: updated });
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Remove Header"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newH = {
                      id: `h-${Date.now()}`,
                      key: '',
                      value: '',
                      enabled: true
                    };
                    updateActiveTab({ headers: [...activeTab.headers, newH] });
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Header
                </button>
              </div>
            )}

            {/* TAB CONTENT 3: MULTI-FORMAT BODY */}
            {requestConfigTab === 'body' && (
              <div className="space-y-3.5">
                {/* Body Type Selection Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-slate-800 pb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'none', label: 'none' },
                      { id: 'json', label: 'JSON' },
                      { id: 'form-data', label: 'form-data' },
                      { id: 'urlencoded', label: 'x-www-form-urlencoded' },
                      { id: 'raw', label: 'raw' },
                      { id: 'graphql', label: 'GraphQL' }
                    ].map((bt) => (
                      <button
                        key={bt.id}
                        onClick={() => updateActiveTab({ bodyType: bt.id as any })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          activeTab.bodyType === bt.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>

                  {/* Format-Specific Quick Actions */}
                  {activeTab.bodyType === 'json' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(activeTab.bodyJson || '{}');
                            updateActiveTab({ bodyJson: JSON.stringify(parsed, null, 2) });
                          } catch {
                            alert('Invalid JSON structure to format.');
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-teal-400 bg-indigo-50 dark:bg-teal-500/10 hover:bg-indigo-100 dark:hover:bg-teal-500/20 rounded-lg border border-indigo-200 dark:border-teal-500/30 transition cursor-pointer"
                      >
                        Beautify JSON
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(activeTab.bodyJson || '{}');
                            updateActiveTab({ bodyJson: JSON.stringify(parsed) });
                          } catch {
                            alert('Invalid JSON structure to minify.');
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:text-slate-300 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                      >
                        Minify
                      </button>
                    </div>
                  )}

                  {activeTab.bodyType === 'raw' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-slate-400 font-bold">Type:</span>
                      <select
                        value={activeTab.bodyRawFormat}
                        onChange={(e) => updateActiveTab({ bodyRawFormat: e.target.value as any })}
                        className="p-1.5 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-lg text-xs font-bold text-zinc-800 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="json">JSON (application/json)</option>
                        <option value="text">Text (text/plain)</option>
                        <option value="xml">XML (application/xml)</option>
                        <option value="html">HTML (text/html)</option>
                        <option value="javascript">JavaScript (application/javascript)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 1. BODY TYPE: NONE */}
                {activeTab.bodyType === 'none' && (
                  <div className="p-8 bg-zinc-50/80 dark:bg-[#090d17] border border-dashed border-zinc-200 dark:border-slate-800/80 rounded-2xl text-center space-y-2 text-xs text-zinc-500 dark:text-slate-400 font-mono">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-200/80 dark:bg-slate-800/60 flex items-center justify-center text-zinc-400 dark:text-slate-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-zinc-800 dark:text-slate-300">This request does not have a body</div>
                    <div className="text-[11px] text-zinc-500 dark:text-slate-500">
                      Select one of the payload formats above (<strong>JSON</strong>, <strong>form-data</strong>, <strong>x-www-form-urlencoded</strong>, <strong>raw</strong>, or <strong>GraphQL</strong>) to add request data.
                    </div>
                  </div>
                )}

                {/* 2. BODY TYPE: JSON */}
                {activeTab.bodyType === 'json' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-slate-400">
                      <span className="font-mono">application/json</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateActiveTab({ bodyJson: '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "status": "active"\n}' })}
                          className="text-xs font-bold text-indigo-600 dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          + Insert Sample Object
                        </button>
                      </div>
                    </div>
                    {renderLineNumberedCode(activeTab.bodyJson, (val) => updateActiveTab({ bodyJson: val }), '{\n  "key": "value"\n}')}
                  </div>
                )}

                {/* 3. BODY TYPE: FORM-DATA (MULTIPART) */}
                {activeTab.bodyType === 'form-data' && (
                  <div className="space-y-2.5">
                    <div className="text-[11px] text-zinc-500 dark:text-slate-400 flex items-center justify-between">
                      <span className="font-mono">multipart/form-data key-value pairs</span>
                      <span className="text-[10px] text-zinc-400">Boundary will be generated automatically</span>
                    </div>

                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {activeTab.bodyFormData.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => {
                              const updated = [...activeTab.bodyFormData];
                              updated[idx].enabled = e.target.checked;
                              updateActiveTab({ bodyFormData: updated });
                            }}
                            className="rounded accent-indigo-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={item.key}
                            onChange={(e) => {
                              const updated = [...activeTab.bodyFormData];
                              updated[idx].key = e.target.value;
                              updateActiveTab({ bodyFormData: updated });
                            }}
                            placeholder="Field Key"
                            className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => {
                              const updated = [...activeTab.bodyFormData];
                              updated[idx].value = e.target.value;
                              updateActiveTab({ bodyFormData: updated });
                            }}
                            placeholder="Field Value"
                            className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-200/60 dark:bg-slate-800 text-zinc-600 dark:text-slate-400 shrink-0">
                            Text
                          </span>
                          <button
                            onClick={() => {
                              const updated = activeTab.bodyFormData.filter((_, i) => i !== idx);
                              updateActiveTab({ bodyFormData: updated });
                            }}
                            className="p-2 text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Remove Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const newF = {
                          id: `fd-${Date.now()}`,
                          key: '',
                          value: '',
                          enabled: true
                        };
                        updateActiveTab({ bodyFormData: [...activeTab.bodyFormData, newF] });
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Form Field
                    </button>
                  </div>
                )}

                {/* 4. BODY TYPE: URLENCODED */}
                {activeTab.bodyType === 'urlencoded' && (
                  <div className="space-y-2.5">
                    <div className="text-[11px] text-zinc-500 dark:text-slate-400 flex items-center justify-between">
                      <span className="font-mono">application/x-www-form-urlencoded</span>
                      <span className="text-[10px] text-zinc-400">URI-encoded format</span>
                    </div>

                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {activeTab.bodyUrlEncoded.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => {
                              const updated = [...activeTab.bodyUrlEncoded];
                              updated[idx].enabled = e.target.checked;
                              updateActiveTab({ bodyUrlEncoded: updated });
                            }}
                            className="rounded accent-indigo-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={item.key}
                            onChange={(e) => {
                              const updated = [...activeTab.bodyUrlEncoded];
                              updated[idx].key = e.target.value;
                              updateActiveTab({ bodyUrlEncoded: updated });
                            }}
                            placeholder="Parameter Name"
                            className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => {
                              const updated = [...activeTab.bodyUrlEncoded];
                              updated[idx].value = e.target.value;
                              updateActiveTab({ bodyUrlEncoded: updated });
                            }}
                            placeholder="Value"
                            className="w-1/2 p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const updated = activeTab.bodyUrlEncoded.filter((_, i) => i !== idx);
                              updateActiveTab({ bodyUrlEncoded: updated });
                            }}
                            className="p-2 text-zinc-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Remove Parameter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const newU = {
                          id: `ue-${Date.now()}`,
                          key: '',
                          value: '',
                          enabled: true
                        };
                        updateActiveTab({ bodyUrlEncoded: [...activeTab.bodyUrlEncoded, newU] });
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add URL-Encoded Parameter
                    </button>
                  </div>
                )}

                {/* 5. BODY TYPE: RAW */}
                {activeTab.bodyType === 'raw' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-slate-400 font-mono">
                      <span>Raw payload format: {activeTab.bodyRawFormat}</span>
                      {activeTab.bodyRawFormat === 'xml' && (
                        <button
                          onClick={() => updateActiveTab({ bodyRaw: '<?xml version="1.0" encoding="UTF-8"?>\n<note>\n  <to>Developer</to>\n  <from>Toolique</from>\n  <heading>API Studio</heading>\n  <body>Testing raw XML payload</body>\n</note>' })}
                          className="text-xs font-bold text-indigo-600 dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          + Insert Sample XML
                        </button>
                      )}
                    </div>
                    {renderLineNumberedCode(activeTab.bodyRaw, (val) => updateActiveTab({ bodyRaw: val }), `Enter ${activeTab.bodyRawFormat} payload...`)}
                  </div>
                )}

                {/* 6. BODY TYPE: GRAPHQL */}
                {activeTab.bodyType === 'graphql' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGraphqlSubTab('query')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            graphqlSubTab === 'query'
                              ? 'bg-indigo-50 dark:bg-[#231e3d] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                              : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          GraphQL Query
                        </button>
                        <button
                          onClick={() => setGraphqlSubTab('variables')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            graphqlSubTab === 'variables'
                              ? 'bg-indigo-50 dark:bg-[#231e3d] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                              : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          GraphQL Variables
                        </button>
                      </div>

                      {graphqlSubTab === 'query' && (
                        <button
                          onClick={() => updateActiveTab({ bodyGraphQLQuery: 'query GetUserData($limit: Int) {\n  users(limit: $limit) {\n    id\n    name\n    email\n    role\n  }\n}' })}
                          className="text-[11px] font-bold text-indigo-600 dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          + Insert Sample Query
                        </button>
                      )}
                    </div>

                    {graphqlSubTab === 'query' ? (
                      renderLineNumberedCode(
                        activeTab.bodyGraphQLQuery,
                        (val) => updateActiveTab({ bodyGraphQLQuery: val }),
                        'query {\n  # Enter GraphQL query here\n}'
                      )
                    ) : (
                      renderLineNumberedCode(
                        activeTab.bodyGraphQLVars,
                        (val) => updateActiveTab({ bodyGraphQLVars: val }),
                        '{\n  # Enter GraphQL variables as JSON\n}'
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: AUTH */}
            {requestConfigTab === 'auth' && (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <label className="font-bold text-zinc-600 dark:text-slate-400">Auth Type:</label>
                  <select
                    value={activeTab.authType}
                    onChange={(e) => updateActiveTab({ authType: e.target.value as any })}
                    className="p-2 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apikey">API Key</option>
                  </select>
                </div>
                {activeTab.authType === 'bearer' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-slate-400">Bearer Token:</label>
                    <input
                      type="text"
                      value={activeTab.authBearer}
                      onChange={(e) => updateActiveTab({ authBearer: e.target.value })}
                      placeholder="{{token}} or token string"
                      className="w-full p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
                {activeTab.authType === 'basic' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-slate-400 block">Username:</label>
                      <input
                        type="text"
                        value={activeTab.authBasicUser}
                        onChange={(e) => updateActiveTab({ authBasicUser: e.target.value })}
                        placeholder="Username"
                        className="w-full p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-slate-400 block">Password:</label>
                      <input
                        type="password"
                        value={activeTab.authBasicPass}
                        onChange={(e) => updateActiveTab({ authBasicPass: e.target.value })}
                        placeholder="Password"
                        className="w-full p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
                {activeTab.authType === 'apikey' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-slate-400 block">Key Name:</label>
                      <input
                        type="text"
                        value={activeTab.authApiKeyName}
                        onChange={(e) => updateActiveTab({ authApiKeyName: e.target.value })}
                        placeholder="X-API-Key"
                        className="w-full p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-slate-400 block">Key Value:</label>
                      <input
                        type="text"
                        value={activeTab.authApiKeyValue}
                        onChange={(e) => updateActiveTab({ authApiKeyValue: e.target.value })}
                        placeholder="api_key_value"
                        className="w-full p-2.5 bg-zinc-50 dark:bg-[#090d17] border border-zinc-200 dark:border-slate-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 5: SCRIPTS */}
            {requestConfigTab === 'scripts' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                <div className="md:col-span-3 space-y-1.5 text-xs font-bold">
                  <button
                    onClick={() => setScriptSubTab('before')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                      scriptSubTab === 'before'
                        ? 'bg-indigo-50 dark:bg-[#231e3d] text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200 dark:border-indigo-500/30 shadow-2xs'
                        : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span>Before request</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </button>
                  <button
                    onClick={() => setScriptSubTab('after')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                      scriptSubTab === 'after'
                        ? 'bg-indigo-50 dark:bg-[#231e3d] text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200 dark:border-indigo-500/30 shadow-2xs'
                        : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span>After response</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </button>
                </div>

                <div className="md:col-span-9 space-y-2.5">
                  {scriptSubTab === 'before' &&
                    renderLineNumberedCode(activeTab.scriptPreRequest, (val) =>
                      updateActiveTab({ scriptPreRequest: val })
                    )}
                  {scriptSubTab === 'after' &&
                    renderLineNumberedCode(activeTab.scriptPostResponse, (val) =>
                      updateActiveTab({ scriptPostResponse: val })
                    )}

                  <div className="flex items-center justify-end gap-2 text-xs font-mono">
                    <button
                      onClick={() => {
                        const snippet = `\npm.variables.set("timestamp", Date.now().toString());`;
                        if (scriptSubTab === 'before') {
                          updateActiveTab({ scriptPreRequest: (activeTab.scriptPreRequest || '') + snippet });
                        } else {
                          updateActiveTab({ scriptPostResponse: (activeTab.scriptPostResponse || '') + snippet });
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                    >
                      &lt;/&gt; Insert Timestamp Snippet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 6: DOCS */}
            {requestConfigTab === 'docs' && (
              <div className="p-4 bg-zinc-50 dark:bg-[#0a0e19] border border-zinc-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs font-mono">
                <div className="font-bold text-zinc-900 dark:text-slate-200">{activeTab.name} Documentation</div>
                <div className="text-indigo-600 dark:text-teal-400 font-bold">{activeTab.method} {activeTab.url || 'https://...'}</div>
                <div className="text-zinc-500 dark:text-slate-400 text-[11px]">
                  Body Format: <span className="font-bold uppercase text-zinc-700 dark:text-slate-200">{activeTab.bodyType}</span>
                </div>
                <pre className="text-[11px] text-zinc-600 dark:text-slate-400 whitespace-pre-wrap">
                  {`### Request Headers\n${activeTab.headers.map((h) => `- ${h.key}: ${h.value}`).join('\n')}`}
                </pre>
              </div>
            )}

            {/* TAB CONTENT 7: SETTINGS */}
            {requestConfigTab === 'settings' && (
              <div className="p-4 bg-zinc-50 dark:bg-[#0a0e19] border border-zinc-200 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-slate-200">Enable CORS Proxy Relay</div>
                    <div className="text-[11px] text-zinc-500 dark:text-slate-500">Bypass browser cross-origin restrictions when testing external endpoints</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeTab.useCorsProxy}
                    onChange={(e) => updateActiveTab({ useCorsProxy: e.target.checked })}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. RESPONSE VIEWER PANE */}
          <div className="pt-4 border-t border-zinc-200/80 dark:border-slate-800/90 space-y-3.5">
            {/* Response Toolbar with Status Badge, Time, and Size */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 text-xs">
              {/* Left Sub-Tabs */}
              <div className="flex items-center gap-1.5 font-bold">
                <button
                  onClick={() => setResponseViewTab('body')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    responseViewTab === 'body'
                      ? 'bg-zinc-200/80 dark:bg-slate-800 text-zinc-900 dark:text-white font-black shadow-2xs'
                      : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Body
                </button>
                <button
                  onClick={() => setResponseViewTab('cookies')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    responseViewTab === 'cookies'
                      ? 'bg-zinc-200/80 dark:bg-slate-800 text-zinc-900 dark:text-white font-black shadow-2xs'
                      : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Cookies
                </button>
                <button
                  onClick={() => setResponseViewTab('headers')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    responseViewTab === 'headers'
                      ? 'bg-zinc-200/80 dark:bg-slate-800 text-zinc-900 dark:text-white font-black shadow-2xs'
                      : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Headers {responseState?.headers ? `(${Object.keys(responseState.headers).length})` : ''}
                </button>
                <button
                  onClick={() => setResponseViewTab('tests')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    responseViewTab === 'tests'
                      ? 'bg-zinc-200/80 dark:bg-slate-800 text-zinc-900 dark:text-white font-black shadow-2xs'
                      : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span>Test Results</span>
                  {assertionResults.length > 0 && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 rounded font-bold">
                      {assertionResults.filter((a) => a.passed).length}/{assertionResults.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Right Execution Metrics Badges */}
              {responseState && (
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-black border shadow-2xs ${
                      responseState.status >= 200 && responseState.status < 300
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40'
                    }`}
                  >
                    {responseState.status} {responseState.statusText}
                  </span>
                  <span className="text-zinc-500 dark:text-slate-400 font-bold">• {responseState.time} ms</span>
                  <span className="text-zinc-500 dark:text-slate-400 font-bold">• {responseState.size}</span>
                  <button
                    onClick={() => handleCopy(responseState.text || '', 'response')}
                    className="p-1 text-zinc-400 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white rounded transition cursor-pointer"
                    title="Copy Response"
                  >
                    {copiedKey === 'response' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* RESPONSE CONTENT BODY */}
            {responseViewTab === 'body' && (
              responseState ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setResponseFormat('json')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          responseFormat === 'json'
                            ? 'bg-indigo-50 dark:bg-[#231e3d] text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30'
                            : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {'{ }'} JSON
                      </button>
                      <button
                        onClick={() => setResponseFormat('raw')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          responseFormat === 'raw'
                            ? 'bg-indigo-50 dark:bg-[#231e3d] text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30'
                            : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        Raw
                      </button>
                    </div>
                  </div>

                  {renderLineNumberedCode(responseState.text || JSON.stringify(responseState.json, null, 2))}
                </div>
              ) : (
                <div className="p-8 bg-zinc-50/80 dark:bg-[#090d17] border border-dashed border-zinc-200 dark:border-slate-800/80 rounded-2xl text-center space-y-2.5 text-zinc-500 dark:text-slate-400 font-mono">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-200/80 dark:bg-slate-800/60 flex items-center justify-center text-indigo-600 dark:text-teal-400">
                    <Play className="w-4 h-4 fill-indigo-600 dark:fill-teal-400" />
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-slate-300">Ready to Send Request</div>
                  <div className="text-[11px] text-zinc-500 dark:text-slate-500">
                    Enter your endpoint URL above and click <strong>Send</strong> to inspect live response payloads.
                  </div>
                </div>
              )
            )}

            {/* RESPONSE CONTENT TESTS */}
            {responseViewTab === 'tests' && (
              <div className="space-y-2 p-4 bg-zinc-50 dark:bg-[#0a0e19] border border-zinc-200 dark:border-slate-800 rounded-2xl font-mono text-xs">
                {assertionResults.length === 0 ? (
                  <div className="text-center py-4 text-zinc-400 dark:text-slate-500 text-xs italic">
                    No assertions executed. Add test assertions in the Scripts or Params tab.
                  </div>
                ) : (
                  assertionResults.map((test, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-zinc-200/60 dark:border-slate-800/60 last:border-0">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className={test.passed ? 'text-zinc-800 dark:text-slate-200 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                        {test.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-slate-500 ml-auto">
                        {test.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* RESPONSE CONTENT HEADERS */}
            {responseViewTab === 'headers' && responseState && (
              <div className="space-y-1 p-4 bg-zinc-50 dark:bg-[#0a0e19] border border-zinc-200 dark:border-slate-800 rounded-2xl font-mono text-xs max-h-[220px] overflow-y-auto">
                {Object.entries(responseState.headers || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-zinc-200/50 dark:border-slate-800/40 text-[11px]">
                    <span className="text-indigo-600 dark:text-teal-400 font-bold">{k}:</span>
                    <span className="text-zinc-700 dark:text-slate-300 truncate max-w-md">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* RESPONSE CONTENT COOKIES */}
            {responseViewTab === 'cookies' && (
              <div className="p-6 bg-zinc-50 dark:bg-[#0a0e19] border border-zinc-200 dark:border-slate-800 rounded-2xl text-xs text-zinc-500 dark:text-slate-400 text-center font-mono">
                No response cookies captured for this request.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
