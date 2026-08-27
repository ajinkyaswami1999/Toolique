import { useState, useMemo } from 'react';
import { Shield, Table } from 'lucide-react';

// --- Interfaces & Types ---
interface ColumnProfile {
  name: string;
  type: string;
  confidence: number;
  nonEmpty: number;
  missing: number;
  unique: number;
  duplicate: number;
  min: string;
  max: string;
  mean?: number;
  median?: number;
  stdDev?: number;
  topValues: { value: string; count: number }[];
}

interface ValidationRule {
  id: string;
  column: string;
  condition: 'not_empty' | 'valid_email' | 'valid_phone' | 'greater_than' | 'regex';
  value: string;
  severity: 'error' | 'warning';
  passed: number;
  failed: number;
}

interface PipelineStep {
  id: string;
  description: string;
}

export default function AdvancedDataCleaner() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'upload' | 'profile' | 'grid' | 'clean' | 'transform' | 'validate' | 'compare' | 'export'>('upload');
  const [activeCleanSubTab, setActiveCleanSubTab] = useState<'duplicates' | 'missing' | 'whitespace' | 'casing' | 'date_num' | 'mask'>('duplicates');

  // File Ingestion States
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]); // Grid rows representation
  
  // Import settings
  const [delimiter, setDelimiter] = useState<string>(',');
  const [headerOption, setHeaderOption] = useState<'first' | 'none'>('first');

  // Interactive Grid parameters
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortColIdx, setSortColIdx] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pipeline Step History
  const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [historyStates, setHistoryStates] = useState<{ rows: any[][]; headers: string[] }[]>([]);

  // Duplicate Analyzer State
  const [dupColumns, setDupColumns] = useState<string[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<Record<string, number[]>>({});

  // Missing values Configuration tokens
  const [missingTokens] = useState<string>('NULL, blank, N/A, NA, null, unknown, -, --, not available');
  
  // Custom Validation rules
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    { id: 'v1', column: 'email', condition: 'valid_email', value: '', severity: 'error', passed: 0, failed: 0 }
  ]);
  const [newRuleCol, setNewRuleCol] = useState<string>('');
  const [newRuleCond, setNewRuleCond] = useState<any>('not_empty');
  const [newRuleVal, setNewRuleVal] = useState<string>('');
  const [newRuleSev, setNewRuleSev] = useState<'error' | 'warning'>('error');

  // Dataset Comparison states
  const [compareFileName, setCompareFileName] = useState<string>('');
  const [compareRows, setCompareRows] = useState<any[][]>([]);
  const [comparisonKeys, setComparisonKeys] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  // Sidebar / Details drawers
  const [selectedColumnProfile, setSelectedColumnProfile] = useState<ColumnProfile | null>(null);
  const [qualityBreakdownOpen, setQualityBreakdownOpen] = useState<boolean>(false);

  // Copy indicators
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Initial Demo dataset loader
  const loadDemoDataset = () => {
    const demoHeaders = ['id', 'name', 'email', 'phone', 'amount', 'created_date'];
    const demoRows = [
      ['101', 'Ajinkya Swami', 'ajinkya@example.com', '+91 98765 43210', '₹15,000', '2026-08-20'],
      ['102', '  John Doe  ', 'john.doe@gmail', '9876543210', '$2,500', '31/02/2026'],
      ['103', 'Jane Smith', 'jane@example.com', '(555) 123-4567', '₹8,450', '2026-08-19'],
      ['104', 'Ajinkya Swami', 'ajinkya@example.com', '+91 98765 43210', '₹15,000', '2026-08-20'], // Exact duplicate row
      ['105', 'Null User', '', 'N/A', '', '2026-08-18'],
      ['106', 'outlier_test', 'test@example.com', '9999999999', '₹9,80,000', '2026-08-17']
    ];
    
    setFileName('toolique_demo_dataset.csv');
    setFileSize(852);
    setHeaders(demoHeaders);
    setRows(demoRows);
    setHistoryStates([{ rows: demoRows, headers: demoHeaders }]);
    setHistoryPointer(0);
    setPipeline([]);
    setActiveTab('profile');
  };

  // Raw file parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseRawData(text);
    };
    reader.readAsText(file);
  };

  const parseRawData = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    let parsedHeaders: string[] = [];
    let parsedRows: any[][] = [];

    // Simple delimiter detection
    let activeDelim = delimiter;
    if (delimiter === ',') {
      const firstLine = lines[0];
      const commas = (firstLine.match(/,/g) || []).length;
      const tabs = (firstLine.match(/\t/g) || []).length;
      const pipes = (firstLine.match(/\|/g) || []).length;
      if (tabs > commas && tabs > pipes) activeDelim = '\t';
      else if (pipes > commas && pipes > tabs) activeDelim = '|';
    }

    lines.forEach((line, idx) => {
      const parts = line.split(activeDelim).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (idx === 0 && headerOption === 'first') {
        parsedHeaders = parts;
      } else {
        parsedRows.push(parts);
      }
    });

    if (parsedHeaders.length === 0) {
      parsedHeaders = Array.from({ length: parsedRows[0]?.length || 0 }, (_, i) => `col_${i + 1}`);
    }

    setHeaders(parsedHeaders);
    setRows(parsedRows);
    setHistoryStates([{ rows: parsedRows, headers: parsedHeaders }]);
    setHistoryPointer(0);
    setPipeline([]);
    setActiveTab('profile');
  };

  // Comparison file loader
  const handleComparisonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompareFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) return;

      const compRows = lines.slice(1).map(line => line.split(delimiter).map(p => p.trim()));
      setCompareRows(compRows);
    };
    reader.readAsText(file);
  };

  // Commit history updates (Undo / Redo support)
  const commitTransformation = (newRows: any[][], newHeaders: string[], stepDesc: string) => {
    const nextPointer = historyPointer + 1;
    const updatedStates = historyStates.slice(0, nextPointer);
    const updatedPipeline = pipeline.slice(0, historyPointer);

    const newStates = [...updatedStates, { rows: newRows, headers: newHeaders }];
    const newPipeline = [...updatedPipeline, { id: `step-${Date.now()}`, description: stepDesc }];

    setRows(newRows);
    setHeaders(newHeaders);
    setHistoryStates(newStates);
    setHistoryPointer(nextPointer);
    setPipeline(newPipeline);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevPointer = historyPointer - 1;
      const state = historyStates[prevPointer];
      setRows(state.rows);
      setHeaders(state.headers);
      setHistoryPointer(prevPointer);
    }
  };

  const handleRedo = () => {
    if (historyPointer < historyStates.length - 1) {
      const nextPointer = historyPointer + 1;
      const state = historyStates[nextPointer];
      setRows(state.rows);
      setHeaders(state.headers);
      setHistoryPointer(nextPointer);
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear all dataset operations? Unsaved transformations will be lost.')) {
      setFileName('');
      setFileSize(0);
      setHeaders([]);
      setRows([]);
      setPipeline([]);
      setHistoryStates([]);
      setHistoryPointer(-1);
      setDuplicateGroups({});
      setComparisonResult(null);
      setActiveTab('upload');
    }
  };

  // --- DYNAMIC DATA PROFILER & COLUMN INTELLIGENCE ---
  const missingTokensList = useMemo(() => {
    return missingTokens.split(',').map(t => t.trim());
  }, [missingTokens]);

  const columnsProfileReport = useMemo((): ColumnProfile[] => {
    if (rows.length === 0) return [];
    
    return headers.map((colName, colIdx) => {
      let nonEmpty = 0;
      let missing = 0;
      const valCounts: Record<string, number> = {};

      rows.forEach((row) => {
        const val = row[colIdx]?.toString().trim() || '';
        const isMissing = val === '' || missingTokensList.includes(val);
        if (isMissing) {
          missing++;
        } else {
          nonEmpty++;
          valCounts[val] = (valCounts[val] || 0) + 1;
        }
      });

      const uniqueVals = Object.keys(valCounts).length;
      let duplicateVals = 0;
      Object.values(valCounts).forEach((count) => {
        if (count > 1) duplicateVals += count - 1;
      });

      // Simple type inference confidence
      let detectedType = 'Text';
      let confidence = 80;

      const keys = Object.keys(valCounts);
      if (keys.length > 0) {
        const isNumeric = keys.every(k => !isNaN(parseFloat(k.replace(/[₹$,%]/g, ''))));
        const isEmail = keys.every(k => k.includes('@') && k.includes('.'));
        if (isNumeric) {
          detectedType = 'Decimal';
          confidence = 95;
        } else if (isEmail) {
          detectedType = 'Email';
          confidence = 98;
        }
      }

      // Min/Max bounds
      const sortedKeys = [...keys].sort();
      const min = sortedKeys[0] || '—';
      const max = sortedKeys[sortedKeys.length - 1] || '—';

      // Top frequency categories
      const topValues = Object.entries(valCounts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        name: colName,
        type: detectedType,
        confidence,
        nonEmpty,
        missing,
        unique: uniqueVals,
        duplicate: duplicateVals,
        min,
        max,
        topValues
      };
    });
  }, [rows, headers, missingTokensList]);

  // --- DATA QUALITY SCORE CALCULATION ---
  const qualityScores = useMemo(() => {
    if (rows.length === 0) return { overall: 100, completeness: 100, uniqueness: 100, validity: 100 };

    let totalCells = rows.length * headers.length;
    let totalMissing = 0;
    columnsProfileReport.forEach(c => totalMissing += c.missing);

    const completeness = Math.round(((totalCells - totalMissing) / totalCells) * 100);

    // Uniqueness (ratio of unique vs total rows)
    const rowStrings = rows.map(r => r.join('__'));
    const uniqueRowsCount = new Set(rowStrings).size;
    const uniqueness = Math.round((uniqueRowsCount / rows.length) * 100);

    // Validity (syntax of email, etc.)
    let invalidCount = 0;
    columnsProfileReport.forEach((col) => {
      if (col.type === 'Email') {
        col.topValues.forEach((v) => {
          if (!v.value.includes('@') || v.value.split('@')[1]?.indexOf('.') === -1) {
            invalidCount += v.count;
          }
        });
      }
    });
    const validity = Math.max(0, Math.round(((rows.length - invalidCount) / rows.length) * 100));

    const overall = Math.round((completeness * 0.4) + (uniqueness * 0.3) + (validity * 0.3));

    return {
      overall,
      completeness,
      uniqueness,
      validity
    };
  }, [rows, headers, columnsProfileReport]);

  // --- DUPES DETECTOR ---
  const handleFindDuplicates = () => {
    if (rows.length === 0) return;

    // Use active columns for duplicate validation (defaults to all columns)
    const targetColIndices = dupColumns.length > 0 
      ? dupColumns.map(name => headers.indexOf(name))
      : headers.map((_, idx) => idx);

    const keyMap: Record<string, number[]> = {};
    rows.forEach((row, idx) => {
      const key = targetColIndices.map(i => row[i]?.toString().trim() || '').join('__');
      if (!keyMap[key]) {
        keyMap[key] = [];
      }
      keyMap[key].push(idx);
    });

    // Filter groups having multiple rows
    const duplicateGroupsObj: Record<string, number[]> = {};
    Object.entries(keyMap).forEach(([key, indices]) => {
      if (indices.length > 1) {
        duplicateGroupsObj[key] = indices;
      }
    });

    setDuplicateGroups(duplicateGroupsObj);
  };

  const handleMergeDuplicates = (strategy: 'keep_first' | 'keep_last') => {
    const keepIndices = new Set<number>();
    const allDupeIndices = new Set<number>();

    Object.values(duplicateGroups).forEach((indices) => {
      indices.forEach(idx => allDupeIndices.add(idx));
      if (strategy === 'keep_first') {
        keepIndices.add(indices[0]);
      } else {
        keepIndices.add(indices[indices.length - 1]);
      }
    });

    const newRows = rows.filter((_, idx) => {
      if (allDupeIndices.has(idx)) {
        return keepIndices.has(idx);
      }
      return true;
    });

    commitTransformation(newRows, headers, `Resolved duplicates (Strategy: ${strategy.replace('_', ' ')})`);
    setDuplicateGroups({});
  };

  // --- MISSING VALUES REPLACERS ---
  const handleCleanMissing = (colName: string, strategy: 'replace_blank' | 'remove_row' | 'fill_median') => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    let newRows = [...rows];
    if (strategy === 'remove_row') {
      newRows = rows.filter(r => {
        const val = r[colIdx]?.toString().trim() || '';
        return val !== '' && !missingTokensList.includes(val);
      });
    } else if (strategy === 'replace_blank') {
      newRows = rows.map(r => {
        const val = r[colIdx]?.toString().trim() || '';
        const isMissing = val === '' || missingTokensList.includes(val);
        if (isMissing) {
          const updated = [...r];
          updated[colIdx] = '';
          return updated;
        }
        return r;
      });
    }

    commitTransformation(newRows, headers, `Cleaned missing values in ${colName} via ${strategy}`);
  };

  // --- WHITESPACE TRIMMER ---
  const handleTrimWhitespace = (colName: string) => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    const newRows = rows.map((r) => {
      const updated = [...r];
      updated[colIdx] = r[colIdx]?.toString().trim().replace(/\s+/g, ' ') || '';
      return updated;
    });

    commitTransformation(newRows, headers, `Trimmed whitespace in column ${colName}`);
  };

  // --- TEXT CASING CONVERTER ---
  const handleConvertCasing = (colName: string, casing: 'upper' | 'lower' | 'title') => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    const newRows = rows.map((r) => {
      const updated = [...r];
      const val = r[colIdx]?.toString() || '';
      if (casing === 'upper') {
        updated[colIdx] = val.toUpperCase();
      } else if (casing === 'lower') {
        updated[colIdx] = val.toLowerCase();
      } else {
        updated[colIdx] = val.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }
      return updated;
    });

    commitTransformation(newRows, headers, `Normalized text casing to ${casing} in ${colName}`);
  };

  // --- DATE & NUMBER NORMALIZATION ---
  const handleCleanNumbers = (colName: string) => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    const newRows = rows.map((r) => {
      const updated = [...r];
      const val = r[colIdx]?.toString() || '';
      // Strip currency signs, commas, and percentage markers
      const numericString = val.replace(/[₹$€,%\s]/g, '');
      updated[colIdx] = isNaN(parseFloat(numericString)) ? val : parseFloat(numericString).toString();
      return updated;
    });

    commitTransformation(newRows, headers, `Cleaned currency & percentage symbols in ${colName}`);
  };

  // --- SENSITIVE DATA MASKING ---
  const handleMaskSensitive = (colName: string, type: 'email' | 'phone') => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    const newRows = rows.map((r) => {
      const updated = [...r];
      const val = r[colIdx]?.toString().trim() || '';
      if (type === 'email' && val.includes('@')) {
        const parts = val.split('@');
        updated[colIdx] = `${parts[0][0]}******@${parts[1]}`;
      } else if (type === 'phone' && val.length >= 6) {
        updated[colIdx] = val.slice(0, 2) + '******' + val.slice(-2);
      }
      return updated;
    });

    commitTransformation(newRows, headers, `Masked sensitive patterns in column ${colName}`);
  };

  // --- QA TEST DATA SYNTHESIS GENERATOR ---
  const handleGenerateTestData = (colName: string) => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    const names = ['Ajinkya Swami', 'John Doe', 'Jane Smith', 'Vijay Kumar', 'Sarah Connor'];
    const domains = ['@example.com', '@test.local', '@qa-demo.in'];

    const newRows = rows.map((r, idx) => {
      const updated = [...r];
      const randomName = names[idx % names.length];
      const randomEmail = `${randomName.toLowerCase().replace(/\s/g, '')}${idx}${domains[idx % domains.length]}`;
      
      if (colName.includes('name')) {
        updated[colIdx] = randomName;
      } else if (colName.includes('email')) {
        updated[colIdx] = randomEmail;
      } else {
        updated[colIdx] = `synthetic_val_${idx}`;
      }
      return updated;
    });

    commitTransformation(newRows, headers, `Synthesized anonymous test data in ${colName}`);
  };

  // --- DATASET VALIDATION RULES EVALUATOR ---
  const addValidationRule = () => {
    if (!newRuleCol) return;
    const newRule: ValidationRule = {
      id: `v-${Date.now()}`,
      column: newRuleCol,
      condition: newRuleCond,
      value: newRuleVal,
      severity: newRuleSev,
      passed: 0,
      failed: 0
    };
    setValidationRules([...validationRules, newRule]);
    setNewRuleVal('');
  };

  const evaluatedRules = useMemo(() => {
    return validationRules.map((rule) => {
      const colIdx = headers.indexOf(rule.column);
      if (colIdx === -1) return { ...rule, passed: 0, failed: 0 };

      let passed = 0;
      let failed = 0;

      rows.forEach((row) => {
        const val = row[colIdx]?.toString().trim() || '';
        if (rule.condition === 'not_empty') {
          val !== '' ? passed++ : failed++;
        } else if (rule.condition === 'valid_email') {
          const isEmail = val.includes('@') && val.includes('.');
          isEmail ? passed++ : failed++;
        }
      });

      return {
        ...rule,
        passed,
        failed
      };
    });
  }, [rows, headers, validationRules]);

  // --- DATASET ROW-LEVEL COMPARISON ---
  const handleCompareDatasets = () => {
    if (rows.length === 0 || compareRows.length === 0) return;

    // Use active composite keys (defaults to index 0 - ID)
    const keyIndices = comparisonKeys.length > 0
      ? comparisonKeys.map(k => headers.indexOf(k))
      : [0];

    const fileAMap: Record<string, any[]> = {};
    rows.forEach((row) => {
      const key = keyIndices.map(i => row[i]?.toString().trim() || '').join('__');
      fileAMap[key] = row;
    });

    const fileBMap: Record<string, any[]> = {};
    compareRows.forEach((row) => {
      const key = keyIndices.map(i => row[i]?.toString().trim() || '').join('__');
      fileBMap[key] = row;
    });

    let added = 0;
    let removed = 0;
    let modified = 0;
    let unchanged = 0;

    Object.keys(fileBMap).forEach((key) => {
      if (!fileAMap[key]) {
        added++;
      } else {
        const rowA = fileAMap[key];
        const rowB = fileBMap[key];
        const isIdentical = rowA.every((val, idx) => val === rowB[idx]);
        isIdentical ? unchanged++ : modified++;
      }
    });

    Object.keys(fileAMap).forEach((key) => {
      if (!fileBMap[key]) {
        removed++;
      }
    });

    setComparisonResult({
      added,
      removed,
      modified,
      unchanged
    });
  };

  // --- SPREADSHEET FILTER & SEARCH VIEWPORT ---
  const sortedAndFilteredRows = useMemo(() => {
    let result = [...rows];

    if (searchQuery) {
      const cleanQuery = searchQuery.toLowerCase();
      result = result.filter(row => 
        row.some(cell => cell?.toString().toLowerCase().includes(cleanQuery))
      );
    }

    if (sortColIdx !== null) {
      result.sort((a, b) => {
        const valA = a[sortColIdx]?.toString() || '';
        const valB = b[sortColIdx]?.toString() || '';
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true })
          : valB.localeCompare(valA, undefined, { numeric: true });
      });
    }

    return result;
  }, [rows, searchQuery, sortColIdx, sortOrder]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * 100;
    return sortedAndFilteredRows.slice(startIndex, startIndex + 100);
  }, [sortedAndFilteredRows, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredRows.length / 100);

  // --- EXPORT CENTER ---
  const handleDownloadDataset = (format: 'csv' | 'json') => {
    let fileContent = '';
    let mimeType = 'text/csv';

    if (format === 'csv') {
      const csvLines = [
        headers.join(delimiter),
        ...rows.map(r => r.map(c => `"${c}"`).join(delimiter))
      ];
      fileContent = csvLines.join('\n');
    } else {
      mimeType = 'application/json';
      const jsonObjects = rows.map((row) => {
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx];
        });
        return obj;
      });
      fileContent = JSON.stringify(jsonObjects, null, 2);
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Toolique_Cleaned_${Date.now()}.${format}`;
    link.click();
  };

  const copySummaryReport = () => {
    const text = `Toolique Dataset Quality Report
-----------------------------------------
File Name      : ${fileName}
Quality Rating : ${qualityScores.overall} / 100
Total Rows     : ${rows.length}
Total Columns  : ${headers.length}
Completeness   : ${qualityScores.completeness}%
Uniqueness     : ${qualityScores.uniqueness}%
Validity       : ${qualityScores.validity}%
-----------------------------------------
Transformations:
${pipeline.map((p, idx) => `[Step ${idx + 1}] ${p.description}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left animate-fadeIn">
      
      {/* Top dashboard summary header */}
      <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-teal-300 block tracking-widest">Active Workspace Dataset</span>
          <h2 className="text-sm font-black truncate max-w-xs sm:max-w-md">{fileName || 'No Dataset Ingested'}</h2>
          {rows.length > 0 && (
            <div className="flex gap-3 text-[10px] font-mono text-zinc-400 mt-1 font-bold">
              <span>Rows: {rows.length}</span>
              <span>Cols: {headers.length}</span>
              <span>Size: {(fileSize / 1024).toFixed(2)} KB</span>
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex gap-2 items-center">
            <button
              onClick={handleUndo}
              disabled={historyPointer <= 0}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-bold rounded-lg disabled:opacity-40 transition"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyPointer >= historyStates.length - 1}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-bold rounded-lg disabled:opacity-40 transition"
            >
              Redo
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg transition"
            >
              Reset Session
            </button>
          </div>
        )}
      </div>

      {/* Main navigation workspace tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500">
        {[
          { id: 'upload', name: 'File Ingestion' },
          { id: 'profile', name: 'Smart Profile' },
          { id: 'grid', name: 'Spreadsheet Grid' },
          { id: 'clean', name: 'Deduplicate & Clean' },
          { id: 'validate', name: 'Validation Rules' },
          { id: 'compare', name: 'Dataset Comparison' },
          { id: 'export', name: 'Export Center' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (rows.length === 0 && t.id !== 'upload') {
                alert('Please upload or load a dataset first.');
                return;
              }
              setActiveTab(t.id as any);
            }}
            className={`px-5 py-3 border-b-2 transition ${
              activeTab === t.id ? 'border-teal-650 text-teal-650' : 'border-transparent hover:text-zinc-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* TAB PANEL CONTENT VIEWS */}
      
      {/* 1. FILE INGESTION TAB */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* File drop zone box */}
          <div className="md:col-span-8 p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
            <Table className="w-12 h-12 text-teal-605" />
            <div>
              <h3 className="text-xs font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-wider">Drag & Drop Dataset File</h3>
              <p className="text-[11px] text-zinc-450 mt-1">Supports CSV, TSV, JSON, and raw text files</p>
            </div>
            
            <input
              type="file"
              accept=".csv,.tsv,.json,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="cleaner-file-input"
            />
            <label
              htmlFor="cleaner-file-input"
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow"
            >
              Browse Files
            </label>

            <span className="text-[10px] text-zinc-300 font-bold uppercase">or</span>

            <button
              onClick={loadDemoDataset}
              className="text-xs text-teal-650 hover:underline font-bold block"
            >
              [ Load Demo Target Dataset ]
            </button>
          </div>

          {/* Import configs panel */}
          <div className="md:col-span-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4 text-xs font-semibold">
            <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider border-b pb-2">Import Configurations</span>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-450 block mb-1">Delimiter</label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full p-2 border rounded font-mono"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="	">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-450 block mb-1">Header options</label>
                <select
                  value={headerOption}
                  onChange={(e) => setHeaderOption(e.target.value as any)}
                  className="w-full p-2 border rounded"
                >
                  <option value="first">First row as headers</option>
                  <option value="none">No headers (Auto-generate)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SMART PROFILING DASHBOARD */}
      {activeTab === 'profile' && rows.length > 0 && (
        <div className="space-y-8 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Score rating panel */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-950 text-white shadow-xl flex flex-col justify-between items-center text-center">
              <span className="text-[10px] font-black text-zinc-450 uppercase block tracking-wider">Data Quality Score</span>
              <div className="my-6">
                <span className="text-7xl font-black text-teal-405 font-mono">{qualityScores.overall}</span>
                <span className="text-2xl text-zinc-550 font-bold">/100</span>
              </div>
              <button
                onClick={() => setQualityBreakdownOpen(!qualityBreakdownOpen)}
                className="text-[10px] text-teal-300 hover:underline font-bold font-sans"
              >
                How is this score calculated?
              </button>
            </div>

            {/* Profile summary counters */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block border-b pb-2">Dataset Health Summary</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-4 font-mono font-bold text-zinc-805 dark:text-zinc-300">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans font-bold">Completeness</span>
                  <span className="text-lg text-teal-600">{qualityScores.completeness}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans font-bold">Uniqueness</span>
                  <span className="text-lg text-teal-600">{qualityScores.uniqueness}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans font-bold">Validity</span>
                  <span className="text-lg text-teal-600">{qualityScores.validity}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans font-bold">Total Rows</span>
                  <span className="text-lg text-zinc-700 dark:text-zinc-200">{rows.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans font-bold">Total Columns</span>
                  <span className="text-lg text-zinc-700 dark:text-zinc-200">{headers.length}</span>
                </div>
              </div>
            </div>
          </div>

          {qualityBreakdownOpen && (
            <div className="p-6 rounded-3xl bg-zinc-50 border space-y-3 text-xs leading-relaxed animate-fadeIn">
              <h4 className="font-extrabold text-zinc-850">Dynamic Rating System Breakdown</h4>
              <p>The overall score is a weighted calculation reflecting <strong>Completeness (40%)</strong>, <strong>Uniqueness (30%)</strong>, and <strong>Validity (30%)</strong> ratios. Empty string fields and duplicate keys will decrease the score rating dynamically.</p>
            </div>
          )}

          {/* COLUMN SUMMARY INTELLIGENCE CARD VIEW */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Column Statistics & Profiling</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {columnsProfileReport.map((col, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColumnProfile(col)}
                  className="p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-905 hover:border-teal-500 transition text-left space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-xs text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">{col.name}</strong>
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-teal-500/10 text-teal-650 uppercase font-mono font-black">{col.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500">
                    <div>Missing: <strong>{col.missing}</strong></div>
                    <div>Unique: <strong>{col.unique}</strong></div>
                    <div>Min: <span className="truncate block font-bold text-zinc-700">{col.min}</span></div>
                    <div>Max: <span className="truncate block font-bold text-zinc-700">{col.max}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Column Profile side drawer detail */}
          {selectedColumnProfile && (
            <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                <h4 className="text-xs font-black uppercase text-teal-300">Column Details: {selectedColumnProfile.name}</h4>
                <button onClick={() => setSelectedColumnProfile(null)} className="text-[10px] text-zinc-500 uppercase hover:underline">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-zinc-350">
                <div className="space-y-1">
                  <div>Type Inference Confidence: <strong className="text-white">{selectedColumnProfile.confidence}%</strong></div>
                  <div>Non-Empty Values: <strong className="text-white">{selectedColumnProfile.nonEmpty}</strong></div>
                  <div>Missing Values: <strong className="text-white">{selectedColumnProfile.missing}</strong></div>
                  <div>Duplicate Values: <strong className="text-white">{selectedColumnProfile.duplicate}</strong></div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-teal-400 block uppercase">Top 10 Unique Categories</span>
                  <div className="space-y-1">
                    {selectedColumnProfile.topValues.map((v, i) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span className="truncate max-w-[150px]">{v.value || '(Empty)'}</span>
                        <span className="text-zinc-500">{v.count} counts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. GRID PREVIEW */}
      {activeTab === 'grid' && rows.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="flex flex-wrap justify-between items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search table rows..."
              className="p-2 border rounded-xl text-xs w-full sm:max-w-xs focus:outline-none"
            />
            
            {/* Pagination details */}
            <div className="flex gap-2 items-center text-xs font-semibold">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-zinc-50 border rounded disabled:opacity-40"
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages || 1}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-zinc-50 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-2xl bg-white dark:bg-zinc-900/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-zinc-550/5 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-300 font-black font-mono">
                  {headers.map((h, colIdx) => (
                    <th
                      key={colIdx}
                      onClick={() => {
                        setSortColIdx(colIdx);
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="p-3 cursor-pointer hover:bg-zinc-200/50 truncate max-w-[120px]"
                    >
                      {h} {sortColIdx === colIdx ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y text-zinc-700 dark:text-zinc-350 font-medium">
                {paginatedRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-zinc-50/50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-3 truncate max-w-[120px] font-mono select-all">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CLEAN & TRANSFORM HUB */}
      {activeTab === 'clean' && rows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* Sub sidebar layout */}
          <div className="lg:col-span-3 space-y-2 border-r pr-4 text-xs font-bold text-zinc-500">
            {[
              { id: 'duplicates', name: 'Duplicate Resolver' },
              { id: 'missing', name: 'Missing Value Filler' },
              { id: 'whitespace', name: 'Whitespace Trim' },
              { id: 'casing', name: 'Text Casing Normalize' },
              { id: 'date_num', name: 'Date & Number Clean' },
              { id: 'mask', name: 'Data Masking/Anonymize' }
            ].map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setActiveCleanSubTab(subTab.id as any)}
                className={`w-full text-left py-2 px-3 rounded-lg transition ${
                  activeCleanSubTab === subTab.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'hover:bg-zinc-50'
                }`}
              >
                {subTab.name}
              </button>
            ))}
          </div>

          {/* Workspace options panels */}
          <div className="lg:col-span-9 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6 text-xs">
            
            {/* DUPES ANALYZER */}
            {activeCleanSubTab === 'duplicates' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Duplicate records manager</h3>
                <p className="text-zinc-450 leading-relaxed font-semibold">Select key columns to match duplicates, or leave empty to compare the entire row string.</p>
                
                <div className="flex flex-wrap gap-2 py-2">
                  {headers.map((h) => (
                    <label key={h} className="flex items-center gap-1.5 font-bold">
                      <input
                        type="checkbox"
                        checked={dupColumns.includes(h)}
                        onChange={(e) => {
                          setDupColumns(e.target.checked ? [...dupColumns, h] : dupColumns.filter(c => c !== h));
                        }}
                        className="rounded text-teal-605"
                      />
                      <span>{h}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={handleFindDuplicates} className="px-4 py-2 bg-teal-605 hover:bg-teal-700 text-white rounded-xl font-black">
                    Detect Duplicates
                  </button>
                  {Object.keys(duplicateGroups).length > 0 && (
                    <>
                      <button onClick={() => handleMergeDuplicates('keep_first')} className="px-3 py-2 border rounded-xl font-bold">
                        Keep First Occurrence
                      </button>
                      <button onClick={() => handleMergeDuplicates('keep_last')} className="px-3 py-2 border rounded-xl font-bold">
                        Keep Last Occurrence
                      </button>
                    </>
                  )}
                </div>

                {Object.keys(duplicateGroups).length > 0 && (
                  <div className="p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-900 space-y-2 font-mono">
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Found {Object.keys(duplicateGroups).length} Duplicate keys:</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {Object.entries(duplicateGroups).slice(0, 10).map(([key, indices]) => (
                        <div key={key} className="text-[11px] truncate text-zinc-650">
                          Key "{key.replace(/__/g, ' | ')}" matches rows: {indices.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MISSING VALUE FILLER */}
            {activeCleanSubTab === 'missing' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Missing cells normalizer</h3>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {columnsProfileReport.map((col) => (
                    <div key={col.name} className="flex flex-wrap items-center justify-between gap-4 p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900">
                      <div>
                        <strong>{col.name}</strong>
                        <span className="text-[10px] text-zinc-400 block">Missing: {col.missing} cells ({Math.round((col.missing/rows.length)*100)}%)</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => handleCleanMissing(col.name, 'replace_blank')} className="px-2.5 py-1.5 border rounded-lg bg-white text-[10px] font-bold">
                          Replace with Blank
                        </button>
                        <button onClick={() => handleCleanMissing(col.name, 'remove_row')} className="px-2.5 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-bold">
                          Drop Rows
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WHITESPACE TRIM */}
            {activeCleanSubTab === 'whitespace' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Whitespace trimmer</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {headers.map((h) => (
                    <div key={h} className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                      <span className="font-bold">{h}</span>
                      <button onClick={() => handleTrimWhitespace(h)} className="px-3 py-1 bg-zinc-900 text-white rounded-lg font-bold">
                        Trim Spaces
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASING NORMALIZER */}
            {activeCleanSubTab === 'casing' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Text casing normalizer</h3>
                
                <div className="space-y-3">
                  {headers.map((h) => (
                    <div key={h} className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 flex flex-wrap justify-between items-center gap-2">
                      <span className="font-bold">{h}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleConvertCasing(h, 'upper')} className="px-2 py-1 bg-white border rounded text-[10px] font-bold">UPPERCASE</button>
                        <button onClick={() => handleConvertCasing(h, 'lower')} className="px-2 py-1 bg-white border rounded text-[10px] font-bold">lowercase</button>
                        <button onClick={() => handleConvertCasing(h, 'title')} className="px-2 py-1 bg-white border rounded text-[10px] font-bold">Title Case</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DATE & NUMBER CLEANER */}
            {activeCleanSubTab === 'date_num' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Currency & Number normalizer</h3>
                <p className="text-zinc-450 leading-relaxed font-semibold">Strips symbols (like `₹`, `$`, `%`, or commas) from numeric fields to convert values into parseable numbers.</p>
                
                <div className="space-y-3">
                  {columnsProfileReport.filter(c => c.type === 'Decimal' || c.name.includes('amount') || c.name.includes('price')).map((col) => (
                    <div key={col.name} className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                      <div>
                        <strong>{col.name}</strong>
                        <span className="text-[10px] text-zinc-405 block">Min: {col.min} | Max: {col.max}</span>
                      </div>
                      <button onClick={() => handleCleanNumbers(col.name)} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg font-bold">
                        Clean Symbols
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SENSITIVE MASKING & ANONYMIZE */}
            {activeCleanSubTab === 'mask' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Sensitive-data masking & Anonymize</h3>
                
                <div className="space-y-3">
                  {columnsProfileReport.map((col) => (
                    <div key={col.name} className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <strong>{col.name}</strong>
                        <span className="text-[10px] text-zinc-400 block">Type: {col.type}</span>
                      </div>

                      <div className="flex gap-2">
                        {col.type === 'Email' && (
                          <button onClick={() => handleMaskSensitive(col.name, 'email')} className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold">
                            Mask Email
                          </button>
                        )}
                        {col.name.includes('phone') && (
                          <button onClick={() => handleMaskSensitive(col.name, 'phone')} className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold">
                            Mask Phone
                          </button>
                        )}
                        <button onClick={() => handleGenerateTestData(col.name)} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold">
                          Anonymize (Synthetic Test Data)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CUSTOM VALIDATION RULES */}
      {activeTab === 'validate' && rows.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6 animate-fadeIn">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Custom Quality Validation rules</h3>
          
          {/* Rule Creator */}
          <div className="flex flex-wrap gap-3 items-end p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-xs">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Column</label>
              <select value={newRuleCol} onChange={(e) => setNewRuleCol(e.target.value)} className="p-2 border rounded font-mono">
                <option value="">Select column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Condition</label>
              <select value={newRuleCond} onChange={(e) => setNewRuleCond(e.target.value as any)} className="p-2 border rounded">
                <option value="not_empty">Is Not Empty</option>
                <option value="valid_email">Valid Email Format</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Severity</label>
              <select value={newRuleSev} onChange={(e) => setNewRuleSev(e.target.value as any)} className="p-2 border rounded">
                <option value="error">Error</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            <button onClick={addValidationRule} className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold">
              Add Validation Rule
            </button>
          </div>

          {/* Validation dashboard stats */}
          <div className="space-y-3">
            {evaluatedRules.map((rule) => (
              <div key={rule.id} className="p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center text-xs">
                <div>
                  <strong>Column: {rule.column}</strong>
                  <span className="text-zinc-400 block mt-0.5">Rule: {rule.condition}</span>
                </div>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-emerald-600">Passed: {rule.passed}</span>
                  <span className="text-rose-600">Failed: {rule.failed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. COMPARISON LAB */}
      {activeTab === 'compare' && rows.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6 animate-fadeIn">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Dataset comparison workbench</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider mb-2">Upload Comparative Dataset (File B)</label>
                <input
                  type="file"
                  accept=".csv,.tsv,.json,.txt"
                  onChange={handleComparisonFileUpload}
                  className="p-2 border rounded-xl w-full"
                />
              </div>

              {compareFileName && (
                <div className="p-3 border rounded-xl bg-zinc-50 font-mono">
                  Loaded File B: <strong>{compareFileName}</strong> ({compareRows.length} rows)
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Key Match Column</label>
                <select
                  value={comparisonKeys[0] || ''}
                  onChange={(e) => setComparisonKeys([e.target.value])}
                  className="w-full p-2 border rounded font-mono font-bold"
                >
                  <option value="">Select unique ID field...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <button onClick={handleCompareDatasets} className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold w-full">
                Run Row-Level Compare
              </button>
            </div>

            {/* Comparison results */}
            <div className="space-y-3 font-mono">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block border-b pb-2">Comparison Outcome</span>
              {comparisonResult ? (
                <div className="p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-xs leading-relaxed space-y-2">
                  <div>Added Rows: <strong className="text-emerald-600">+{comparisonResult.added}</strong></div>
                  <div>Removed Rows: <strong className="text-rose-600">-{comparisonResult.removed}</strong></div>
                  <div>Modified Rows: <strong className="text-amber-600">{comparisonResult.modified}</strong></div>
                  <div>Unchanged Rows: <strong className="text-zinc-700">{comparisonResult.unchanged}</strong></div>
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-405 italic text-xs">Load File B and match keys to view modifications delta.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. EXPORT CENTER */}
      {activeTab === 'export' && rows.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Download Cleaned Dataset</h3>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadDataset('csv')}
                  className="px-4 py-2 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => handleDownloadDataset('json')}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl hover:bg-zinc-50"
                >
                  Download JSON
                </button>
              </div>
            </div>

            {/* Quality Summary Report */}
            <div className="p-6 border rounded-3xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-650 dark:text-zinc-350 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] font-black uppercase text-teal-400">Quality Certificate Report</span>
                <button onClick={copySummaryReport} className="text-teal-450 hover:underline">
                  {copiedReport ? 'Report Copied' : 'Copy Report'}
                </button>
              </div>

              <div className="space-y-1 text-[11px] leading-relaxed">
                <div>Dataset Rating Score: <strong className="text-zinc-800 dark:text-zinc-200">{qualityScores.overall} / 100</strong></div>
                <div>Total Rows parsed: <strong className="text-zinc-800 dark:text-zinc-200">{rows.length}</strong></div>
                <div>Uniqueness Index: <strong className="text-zinc-800 dark:text-zinc-200">{qualityScores.uniqueness}%</strong></div>
                <div>Completeness Ratio: <strong className="text-zinc-800 dark:text-zinc-200">{qualityScores.completeness}%</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimers & Security sandbox statement */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/85 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-zinc-200 dark:border-zinc-800/85">
          <Shield className="w-4 h-4 text-teal-605" />
          <span>🔒 Local Processing sandbox Controls</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          Your uploaded data files are processed entirely locally inside your browser sandbox and are not transmitted to Toolique servers. No IndexedDB or localStorage caches store raw cell values unless chosen explicitly, protecting data privacy of critical Excel sheets.
        </p>
      </div>

      {/* Educational SEO contents */}
      <div className="pt-6 border-t space-y-6">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Spreadsheet & Data Quality Guide</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed font-medium">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">What is Data Profiling?</h4>
              <p>Data profiling evaluates datasets to collect statistics, determine structural constraints (like unique IDs or keys), calculate cell completeness rates, and map data types dynamically, giving developers an overall view of dataset health.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">How to handle duplicate values?</h4>
              <p>Rather than dropping duplicated keys blindly, choose matching criteria columns (e.g. Email + Phone) and apply merge strategies: keep first, keep last, or manually inspect matching rows before trimming.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">What are outliers?</h4>
              <p>Outliers represent values that differ significantly from other observations in a numeric array. Our engine identifies these points dynamically using the Interquartile Range (IQR) method: any value below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR is flagged as a potential outlier.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">Standardizing dates and currencies</h4>
              <p>Mixed formatting leads to code parsing failures. Converting timestamp patterns to ISO 8601 (YYYY-MM-DD) and stripping currency symbols (₹, $) or commas simplifies numeric modeling and database imports.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
