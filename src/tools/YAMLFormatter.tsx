/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from 'react';
import YAML, { parseAllDocuments } from 'yaml';
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  FileCode,
  Zap,
  Code,
  FileText,
  AlertTriangle
} from 'lucide-react';

type FormatterMode = 'studio' | 'yaml-only' | 'json-to-yaml';

interface ValidationResult {
  isValid: boolean;
  message: string;
  line?: number;
  col?: number;
  docCount?: number;
  nodeCount?: number;
  byteSize?: number;
  snippet?: string;
}

const SAMPLE_PRESETS: Record<string, { label: string; yaml: string }> = {
  k8s: {
    label: 'Kubernetes Deployment',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-backend
  namespace: production
  labels:
    app.kubernetes.io/name: web-backend
    app.kubernetes.io/version: "1.4.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-backend
  template:
    metadata:
      labels:
        app: web-backend
    spec:
      containers:
        - name: api-server
          image: ghcr.io/toolique/api:v1.4.0
          ports:
            - containerPort: 8080
              name: http
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: web-backend-svc
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: web-backend
  ports:
    - name: http
      port: 80
      targetPort: 8080`
  },
  docker: {
    label: 'Docker Compose v3',
    yaml: `version: "3.8"
services:
  web:
    image: node:20-alpine
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgres://postgres:secret@db:5432/appdb
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  pgdata:`
  },
  github: {
    label: 'GitHub Actions CI',
    yaml: `name: Production CI/CD
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  verify:
    name: Build & Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm

      - name: Install Dependencies
        run: npm ci

      - name: Typecheck & Lint
        run: npm run lint

      - name: Execute Test Suite
        run: npm test

      - name: Build Production Bundle
        run: npm run build`
  },
  ansible: {
    label: 'Ansible Playbook',
    yaml: `- name: Configure Web Application Servers
  hosts: webservers
  become: true
  vars:
    http_port: 80
    max_clients: 250
    app_directory: /opt/toolique
  tasks:
    - name: Install Nginx Web Server
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Ensure Nginx is Running and Enabled
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Deploy Custom Configuration Template
      ansible.builtin.template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: Restart Nginx
  handlers:
    - name: Restart Nginx
      ansible.builtin.service:
        name: nginx
        state: restarted`
  },
  openapi: {
    label: 'OpenAPI 3.0 Spec',
    yaml: `openapi: 3.0.0
info:
  title: Toolique Developer API
  description: High-performance browser-sandboxed engineering utilities
  version: 2.1.0
servers:
  - url: https://api.toolique.in/v1
    description: Production Edge Gateway
paths:
  /tools:
    get:
      summary: Retrieve All Registered Tools
      description: Returns catalogue of developer formatters, calculators, and converters
      responses:
        "200":
          description: Successful catalogue response
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                      example: YAMLFormatter
                    slug:
                      type: string
                      example: yaml-formatter`
  },
  simple: {
    label: 'Simple App Config',
    yaml: `# Core Application Configuration
server:
  host: 0.0.0.0
  port: 8080
  cors:
    enabled: true
    allowed_origins:
      - https://toolique.in
      - http://localhost:5173
database:
  driver: postgres
  pool_size: 20
  timeout_seconds: 30
cache:
  redis:
    host: 127.0.0.1
    port: 6379
    ttl_seconds: 3600
feature_flags:
  dark_mode: true
  offline_workers: true
  telemetry: false`
  }
};

function countObjectNodes(obj: any): number {
  if (obj === null || typeof obj !== 'object') return 1;
  let count = 0;
  if (Array.isArray(obj)) {
    count += obj.length;
    for (const item of obj) count += countObjectNodes(item);
  } else {
    const keys = Object.keys(obj);
    count += keys.length;
    for (const k of keys) count += countObjectNodes(obj[k]);
  }
  return count;
}

export default function YAMLFormatter() {
  const [mode, setMode] = useState<FormatterMode>('studio');
  const [yamlInput, setYamlInput] = useState<string>(SAMPLE_PRESETS.simple.yaml);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [quoteStyle, setQuoteStyle] = useState<'auto' | 'single' | 'double'>('auto');
  const [copiedTarget, setCopiedTarget] = useState<'yaml' | 'json' | null>(null);

  // Check if input contains literal tab characters (illegal in YAML)
  const hasTabs = useMemo(() => /\t/.test(yamlInput), [yamlInput]);

  // Syntax and structural validation
  const validation = useMemo<ValidationResult>(() => {
    if (!yamlInput.trim()) {
      return { isValid: true, message: 'Editor is empty. Paste or load a YAML configuration.', docCount: 0 };
    }

    try {
      const docs = parseAllDocuments(yamlInput);
      for (let i = 0; i < docs.length; i++) {
        const d = docs[i];
        if (d.errors.length > 0) {
          const firstErr = d.errors[0];
          const line = firstErr.linePos ? firstErr.linePos[0]?.line : undefined;
          const col = firstErr.linePos ? firstErr.linePos[0]?.col : undefined;
          
          let snippet = '';
          if (line) {
            const lines = yamlInput.split('\n');
            const targetLine = lines[line - 1] || '';
            const indicator = ' '.repeat(Math.max(0, (col || 1) - 1)) + '^';
            snippet = `Line ${line}:\n  ${targetLine}\n  ${indicator}`;
          }

          return {
            isValid: false,
            message: `Document #${i + 1} Error: ${firstErr.message}`,
            line,
            col,
            snippet
          };
        }
      }

      const totalNodes = docs.reduce((acc, d) => acc + countObjectNodes(d.toJSON()), 0);
      const byteSize = new Blob([yamlInput]).size;

      return {
        isValid: true,
        message: 'Valid YAML 1.2 Syntax',
        docCount: docs.length,
        nodeCount: totalNodes,
        byteSize
      };
    } catch (err: any) {
      return {
        isValid: false,
        message: err.message || 'Syntax error in YAML payload.'
      };
    }
  }, [yamlInput]);

  // Format & Beautify YAML
  const handleFormatYAML = useCallback(() => {
    if (!yamlInput.trim()) return;

    try {
      const docs = parseAllDocuments(yamlInput);
      for (const d of docs) {
        if (d.errors.length > 0) {
          throw new Error(d.errors[0].message);
        }
      }

      const formattedDocs = docs.map((d) => {
        const json = d.toJSON();
        const options: any = {
          indent: indentSize,
          sortMapEntries: sortKeys,
          defaultStringType: quoteStyle === 'single' ? 'QUOTE_SINGLE' : quoteStyle === 'double' ? 'QUOTE_DOUBLE' : 'PLAIN'
        };
        return YAML.stringify(json, options).trimEnd();
      });

      const result = formattedDocs.length === 1 ? formattedDocs[0] : formattedDocs.join('\n---\n');
      setYamlInput(result);
    } catch {
      // Keep existing input if error occurs
    }
  }, [yamlInput, indentSize, sortKeys, quoteStyle]);

  // Convert YAML -> JSON
  const handleConvertToJSON = useCallback(() => {
    if (!yamlInput.trim()) return;

    try {
      const docs = parseAllDocuments(yamlInput);
      for (const d of docs) {
        if (d.errors.length > 0) {
          throw new Error(d.errors[0].message);
        }
      }

      if (docs.length === 1) {
        const json = docs[0].toJSON();
        setJsonOutput(JSON.stringify(json, null, indentSize));
      } else {
        const allJson = docs.map((d) => d.toJSON());
        setJsonOutput(JSON.stringify(allJson, null, indentSize));
      }
    } catch {
      // Keep existing output if error occurs
    }
  }, [yamlInput, indentSize]);

  // Convert JSON -> YAML
  const handleConvertJSONToYAML = useCallback(() => {
    if (!jsonOutput.trim()) return;

    try {
      const parsed = JSON.parse(jsonOutput);
      const options: any = {
        indent: indentSize,
        sortMapEntries: sortKeys,
        defaultStringType: quoteStyle === 'single' ? 'QUOTE_SINGLE' : quoteStyle === 'double' ? 'QUOTE_DOUBLE' : 'PLAIN'
      };

      if (Array.isArray(parsed) && parsed.length > 1 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        // Multi-document conversion from array
        const docsYaml = parsed.map((item) => YAML.stringify(item, options).trimEnd()).join('\n---\n');
        setYamlInput(docsYaml);
      } else {
        setYamlInput(YAML.stringify(parsed, options).trimEnd());
      }
    } catch {
      // Keep existing input if error occurs
    }
  }, [jsonOutput, indentSize, sortKeys, quoteStyle]);

  // Minify JSON
  const handleMinifyJSON = useCallback(() => {
    if (!jsonOutput.trim()) {
      // First convert from YAML if JSON output is empty
      try {
        const docs = parseAllDocuments(yamlInput);
        if (docs.length === 1) {
          setJsonOutput(JSON.stringify(docs[0].toJSON()));
        } else {
          setJsonOutput(JSON.stringify(docs.map((d) => d.toJSON())));
        }
      } catch {
        // Ignore
      }
      return;
    }

    try {
      const parsed = JSON.parse(jsonOutput);
      setJsonOutput(JSON.stringify(parsed));
    } catch {
      // Ignore
    }
  }, [jsonOutput, yamlInput]);

  // Swap Input and Output
  const handleSwapPanels = useCallback(() => {
    if (!jsonOutput.trim()) return;
    const tempYaml = yamlInput;
    setYamlInput(jsonOutput);
    setJsonOutput(tempYaml);
  }, [yamlInput, jsonOutput]);

  // Fix tabs
  const handleFixTabs = useCallback(() => {
    setYamlInput((prev) => prev.replace(/\t/g, ' '.repeat(indentSize)));
  }, [indentSize]);

  // Copy handler
  const handleCopy = (text: string, type: 'yaml' | 'json') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTarget(type);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  // Download handler
  const handleDownload = (content: string, filename: string, mime: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setYamlInput(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load preset
  const handleLoadPreset = (presetKey: string) => {
    const preset = SAMPLE_PRESETS[presetKey];
    if (preset) {
      setYamlInput(preset.yaml);
      setJsonOutput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Modes & Quick Controls Bar (Note: No duplicate H1 here) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 text-left">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-zinc-850/60 border border-zinc-200/50 dark:border-zinc-800/50">
          <button
            onClick={() => setMode('studio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'studio'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>YAML &harr; JSON Studio</span>
          </button>

          <button
            onClick={() => setMode('yaml-only')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'yaml-only'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beautifier & Validator</span>
          </button>

          <button
            onClick={() => setMode('json-to-yaml')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'json-to-yaml'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON to YAML</span>
          </button>
        </div>

        {/* Security & Client-Side Sandbox Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Private In-Browser Sandbox</span>
        </div>
      </div>

      {/* Preset Templates Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-left">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 shrink-0">
          DevOps Presets:
        </span>
        {Object.entries(SAMPLE_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => handleLoadPreset(key)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pastel-indigo/30 hover:bg-pastel-indigo/60 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 transition shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Warning Alert Banner */}
      {hasTabs && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Illegal Tab Characters Detected:</span>
              <span className="opacity-90 ml-1">
                The YAML standard strictly forbids tabs (`\t`) for indentation.
              </span>
            </div>
          </div>
          <button
            onClick={handleFixTabs}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs transition"
          >
            Convert Tabs to {indentSize} Spaces
          </button>
        </div>
      )}

      {/* Formatter Settings Toolbar */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-left">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Indent Options */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-600 dark:text-zinc-400">Indentation:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value={2}>2 Spaces (Standard)</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>

          {/* Key Sorting */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-600 dark:text-zinc-400">Key Ordering:</span>
            <select
              value={sortKeys ? 'sorted' : 'original'}
              onChange={(e) => setSortKeys(e.target.value === 'sorted')}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="original">Preserve Original Order</option>
              <option value="sorted">Sort Keys Alphabetically (A-Z)</option>
            </select>
          </div>

          {/* Quotation Style */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-600 dark:text-zinc-400">Quotes:</span>
            <select
              value={quoteStyle}
              onChange={(e) => setQuoteStyle(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="auto">Auto / Minimal</option>
              <option value="single">Single Quotes (&apos;)</option>
              <option value="double">Double Quotes (&quot;)</option>
            </select>
          </div>
        </div>

        {/* Global Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-bold cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Upload</span>
            <input
              type="file"
              accept=".yaml,.yml,.json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              setYamlInput('');
              setJsonOutput('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition"
            title="Clear all editors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Primary Split Workspace */}
      <div className={`grid grid-cols-1 ${mode === 'yaml-only' ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6 text-left`}>
        {/* Left Panel: YAML Input Editor */}
        <div className="saas-card p-6 space-y-4 flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>{mode === 'json-to-yaml' ? 'JSON Input Source' : 'YAML Editor & Source'}</span>
              </h2>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {yamlInput.split('\n').length} lines &bull; {yamlInput.length} chars
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(yamlInput, 'yaml')}
                disabled={!yamlInput}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                {copiedTarget === 'yaml' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copiedTarget === 'yaml' ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => handleDownload(yamlInput, 'config.yaml', 'text/yaml')}
                disabled={!yamlInput}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                title="Download .yaml file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea Editor */}
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            className="w-full flex-1 min-h-[420px] font-mono text-xs sm:text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y leading-relaxed text-zinc-900 dark:text-zinc-100"
            placeholder={mode === 'json-to-yaml' ? 'Paste JSON here to convert into clean YAML...' : 'Paste YAML configuration, Docker Compose, or Kubernetes manifest here...'}
            spellCheck={false}
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleFormatYAML}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Format & Beautify YAML</span>
            </button>

            {mode !== 'yaml-only' && (
              <button
                onClick={handleConvertToJSON}
                className="py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-black transition flex items-center justify-center gap-2"
              >
                <span>Convert to JSON</span>
                <ArrowRight className="w-4 h-4 text-indigo-500" />
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: JSON Output or Converter Studio */}
        {mode !== 'yaml-only' && (
          <div className="saas-card p-6 space-y-4 flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-500" />
                  <span>JSON Payload Output</span>
                </h2>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {jsonOutput ? `${jsonOutput.split('\n').length} lines • ${jsonOutput.length} chars` : 'Ready for conversion'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSwapPanels}
                  disabled={!jsonOutput}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                  title="Swap input and output"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Swap</span>
                </button>

                <button
                  onClick={() => handleCopy(jsonOutput, 'json')}
                  disabled={!jsonOutput}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  {copiedTarget === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  <span>{copiedTarget === 'json' ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDownload(jsonOutput, 'output.json', 'application/json')}
                  disabled={!jsonOutput}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                  title="Download .json file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Output Textarea */}
            <textarea
              readOnly
              value={jsonOutput}
              className="w-full flex-1 min-h-[420px] font-mono text-xs sm:text-sm p-4 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none resize-y leading-relaxed text-zinc-900 dark:text-zinc-100"
              placeholder="Click 'Convert to JSON' on the left to see your parsed JSON payload..."
            />

            {/* Secondary Action Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={handleConvertJSONToYAML}
                disabled={!jsonOutput}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-black transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-500" />
                <span>Convert JSON &rarr; YAML</span>
              </button>

              <button
                onClick={handleMinifyJSON}
                disabled={!jsonOutput && !yamlInput}
                className="py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-black transition flex items-center justify-center gap-2 disabled:opacity-50"
                title="Minify JSON to single line"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Minify JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation & Diagnostics Status Box */}
      <div
        className={`p-5 rounded-2xl border transition text-left flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          validation.isValid
            ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50/50 dark:bg-rose-950/15 border-rose-500/30 text-rose-900 dark:text-rose-200'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {validation.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm">
                {validation.isValid ? 'YAML Document Validated' : 'Syntax Validation Failed'}
              </h3>
              {validation.line && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-800 dark:text-rose-300 text-[10px] font-extrabold uppercase">
                  Line {validation.line}, Col {validation.col}
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">
              {validation.message}
            </p>
            {validation.snippet && (
              <pre className="font-mono text-[11px] p-2.5 rounded-lg bg-zinc-900 text-zinc-200 mt-2 whitespace-pre overflow-x-auto">
                {validation.snippet}
              </pre>
            )}
          </div>
        </div>

        {/* Validation Metric Badges */}
        {validation.isValid && validation.docCount !== undefined && validation.docCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {validation.docCount} {validation.docCount === 1 ? 'Document' : 'Documents (---)'}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {validation.nodeCount} Structural Nodes
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {((validation.byteSize || 0) / 1024).toFixed(2)} KB
            </span>
          </div>
        )}
      </div>

      {/* Feature Guide & Developer Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 font-black text-xs uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Strict Indentation Engine</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            YAML relies strictly on uniform whitespace columns rather than JSON braces. This formatter automatically replaces accidental hard tabs (`\t`) with standard 2-space or 4-space indentations.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-650 dark:text-purple-400 font-black text-xs uppercase tracking-wider">
            <Code className="w-4 h-4" />
            <span>Multi-Document Stream (---)</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Native support for composite Kubernetes manifests and Helm charts with multiple YAML documents separated by triple hyphens (`---`), parsed into clean JSON document arrays.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-650 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Git Diff-Friendly Sorting</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Toggle alphabetical key sorting (A-Z) to standardize configuration order across Git commits, eliminating noisy merge conflicts in Docker and Terraform manifests.
          </p>
        </div>
      </div>
    </div>
  );
}
