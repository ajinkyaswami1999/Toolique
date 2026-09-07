import { useState, useMemo } from 'react';
import {
  Sliders,
  Check,
  Copy,
  HelpCircle,
  Zap,
  Sparkles,
  Code2,
  Table as TableIcon,
  Layers,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Hash,
  Type,
  HardDrive,
  Percent,
  Plus,
  Trash2
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type DataType = 'integer' | 'decimal' | 'string_length' | 'date_range' | 'file_size';
type Methodology = '3-value' | '2-value' | 'extreme' | 'ep';
type CodeFormat = 'vitest' | 'pytest' | 'junit5' | 'playwright' | 'csv' | 'markdown';
type ActiveTab = 'single' | 'multi' | 'code';

interface BoundaryPoint {
  id: string;
  label: string;
  value: string | number;
  rawNumeric?: number;
  category: 'Just Below Min' | 'Minimum' | 'Just Above Min' | 'Nominal / Mid' | 'Just Below Max' | 'Maximum' | 'Just Above Max' | 'Extreme Low' | 'Extreme High' | 'Invalid Partition' | 'Valid Partition';
  isValid: boolean;
  explanation: string;
  testCaseId: string;
}

interface MultiVariableField {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

// Industry Presets
interface PresetDefinition {
  id: string;
  name: string;
  category: string;
  dataType: DataType;
  config: {
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    unit?: string;
    minLen?: number;
    maxLen?: number;
    minDate?: string;
    maxDate?: string;
    minBytes?: number;
    maxBytes?: number;
    minSizeVal?: number;
    minSizeUnit?: string;
    maxSizeVal?: number;
    maxSizeUnit?: string;
  };
}

const PRESETS: PresetDefinition[] = [
  {
    id: 'age_kyc',
    name: 'Age Verification (18 – 60 Yrs)',
    category: 'FinTech / KYC',
    dataType: 'integer',
    config: { min: 18, max: 60, step: 1, unit: 'years' }
  },
  {
    id: 'discount_pct',
    name: 'Discount Percentage (0.00% – 50.00%)',
    category: 'E-Commerce',
    dataType: 'decimal',
    config: { min: 0.00, max: 50.00, step: 0.01, precision: 2, unit: '%' }
  },
  {
    id: 'cart_val',
    name: 'Free Delivery Cart (₹500 – ₹50,000)',
    category: 'Payments',
    dataType: 'decimal',
    config: { min: 500, max: 50000, step: 1, precision: 2, unit: '₹' }
  },
  {
    id: 'pwd_len',
    name: 'Password Length (8 – 64 Chars)',
    category: 'Auth / Security',
    dataType: 'string_length',
    config: { minLen: 8, maxLen: 64 }
  },
  {
    id: 'cibil_score',
    name: 'CIBIL Credit Score (300 – 900)',
    category: 'Banking',
    dataType: 'integer',
    config: { min: 300, max: 900, step: 1, unit: 'pts' }
  },
  {
    id: 'upload_mb',
    name: 'Attachment Size (1 KB – 25 MB)',
    category: 'Storage / Upload',
    dataType: 'file_size',
    config: { minSizeVal: 1, minSizeUnit: 'KB', maxSizeVal: 25, maxSizeUnit: 'MB' }
  },
  {
    id: 'flight_days',
    name: 'Advance Booking (1 – 180 Days)',
    category: 'Travel / Booking',
    dataType: 'integer',
    config: { min: 1, max: 180, step: 1, unit: 'days' }
  }
];

export default function BoundaryValueAnalysis() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('single');
  const [dataType, setDataType] = useState<DataType>('integer');
  const [methodology, setMethodology] = useState<Methodology>('3-value');
  const [codeFormat, setCodeFormat] = useState<CodeFormat>('vitest');
  const [copied, setCopied] = useState(false);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // Integer & Decimal params
  const [intMin, setIntMin] = useState<number>(18);
  const [intMax, setIntMax] = useState<number>(60);
  const [intStep, setIntStep] = useState<number>(1);
  const [unitLabel, setUnitLabel] = useState<string>('years');

  const [decMin, setDecMin] = useState<number>(0.00);
  const [decMax, setDecMax] = useState<number>(50.00);
  const [decPrecision, setDecPrecision] = useState<number>(2);

  // String params
  const [strMin, setStrMin] = useState<number>(8);
  const [strMax, setStrMax] = useState<number>(32);

  // Date params
  const [dateMin, setDateMin] = useState<string>('2026-01-01');
  const [dateMax, setDateMax] = useState<string>('2026-12-31');

  // File size params
  const [fileMinVal, setFileMinVal] = useState<number>(1);
  const [fileMinUnit, setFileMinUnit] = useState<string>('KB');
  const [fileMaxVal, setFileMaxVal] = useState<number>(25);
  const [fileMaxUnit, setFileMaxUnit] = useState<string>('MB');

  // Multi-variable combinatorial state
  const [multiFields, setMultiFields] = useState<MultiVariableField[]>([
    { id: 'f1', name: 'Age', min: 18, max: 60, step: 1, unit: 'yrs' },
    { id: 'f2', name: 'Credit Score', min: 300, max: 900, step: 1, unit: 'pts' },
    { id: 'f3', name: 'Monthly Income', min: 15000, max: 200000, step: 1000, unit: '₹' }
  ]);

  // --- PRESET LOADER ---
  const handleLoadPreset = (preset: PresetDefinition) => {
    setDataType(preset.dataType);
    if (preset.dataType === 'integer') {
      setIntMin(preset.config.min ?? 18);
      setIntMax(preset.config.max ?? 60);
      setIntStep(preset.config.step ?? 1);
      setUnitLabel(preset.config.unit ?? '');
    } else if (preset.dataType === 'decimal') {
      setDecMin(preset.config.min ?? 0);
      setDecMax(preset.config.max ?? 100);
      setDecPrecision(preset.config.precision ?? 2);
      setUnitLabel(preset.config.unit ?? '');
    } else if (preset.dataType === 'string_length') {
      setStrMin(preset.config.minLen ?? 8);
      setStrMax(preset.config.maxLen ?? 32);
    } else if (preset.dataType === 'file_size') {
      setFileMinVal(preset.config.minSizeVal ?? 1);
      setFileMinUnit(preset.config.minSizeUnit ?? 'KB');
      setFileMaxVal(preset.config.maxSizeVal ?? 25);
      setFileMaxUnit(preset.config.maxSizeUnit ?? 'MB');
    }
  };

  // --- SINGLE VARIABLE BOUNDARY POINTS GENERATOR ---
  const singleBoundaries = useMemo<BoundaryPoint[]>(() => {
    const list: BoundaryPoint[] = [];

    if (dataType === 'integer') {
      if (intMin >= intMax) return [];
      const delta = intStep || 1;
      const nominal = Math.round(intMin + (intMax - intMin) / 2);

      const items: { label: string; val: number; cat: BoundaryPoint['category']; valid: boolean; exp: string }[] = [
        { label: 'Min - 10Δ', val: intMin - 10 * delta, cat: 'Extreme Low', valid: false, exp: 'Extreme invalid: far below minimum constraint.' },
        { label: 'Min - Δ', val: intMin - delta, cat: 'Just Below Min', valid: false, exp: 'Invalid boundary: exactly one delta step below minimum threshold.' },
        { label: 'Min', val: intMin, cat: 'Minimum', valid: true, exp: 'Valid boundary: exact minimum inclusive constraint.' },
        { label: 'Min + Δ', val: intMin + delta, cat: 'Just Above Min', valid: true, exp: 'Valid boundary: one delta step above minimum constraint.' },
        { label: 'Nominal', val: nominal, cat: 'Nominal / Mid', valid: true, exp: 'Valid standard: typical nominal midpoint input.' },
        { label: 'Max - Δ', val: intMax - delta, cat: 'Just Below Max', valid: true, exp: 'Valid boundary: one delta step below maximum constraint.' },
        { label: 'Max', val: intMax, cat: 'Maximum', valid: true, exp: 'Valid boundary: exact maximum inclusive constraint.' },
        { label: 'Max + Δ', val: intMax + delta, cat: 'Just Above Max', valid: false, exp: 'Invalid boundary: exactly one delta step above maximum threshold.' },
        { label: 'Max + 10Δ', val: intMax + 10 * delta, cat: 'Extreme High', valid: false, exp: 'Extreme invalid: far above maximum constraint.' }
      ];

      items.forEach((it, idx) => {
        if (methodology === '2-value' && !['Min - Δ', 'Min', 'Max', 'Max + Δ'].includes(it.label)) return;
        if (methodology === '3-value' && ['Extreme Low', 'Extreme High'].includes(it.cat)) return;
        list.push({
          id: `pt_${idx}`,
          testCaseId: `TC-INT-BVA-${String(list.length + 1).padStart(2, '0')}`,
          label: it.label,
          value: `${it.val} ${unitLabel}`.trim(),
          rawNumeric: it.val,
          category: it.cat,
          isValid: it.valid,
          explanation: it.exp
        });
      });
    } else if (dataType === 'decimal') {
      if (decMin >= decMax) return [];
      const delta = Math.pow(10, -decPrecision);
      const nominal = Number(((decMin + decMax) / 2).toFixed(decPrecision));

      const items = [
        { label: 'Min - 100ε', val: Number((decMin - 100 * delta).toFixed(decPrecision)), cat: 'Extreme Low' as const, valid: false, exp: 'Extreme invalid: negative/far below lower bound.' },
        { label: 'Min - ε', val: Number((decMin - delta).toFixed(decPrecision)), cat: 'Just Below Min' as const, valid: false, exp: `Invalid boundary: precision epsilon (${delta}) below minimum.` },
        { label: 'Min', val: Number(decMin.toFixed(decPrecision)), cat: 'Minimum' as const, valid: true, exp: 'Valid boundary: exact minimum inclusive threshold.' },
        { label: 'Min + ε', val: Number((decMin + delta).toFixed(decPrecision)), cat: 'Just Above Min' as const, valid: true, exp: `Valid boundary: precision epsilon (${delta}) above minimum.` },
        { label: 'Nominal', val: nominal, cat: 'Nominal / Mid' as const, valid: true, exp: 'Valid standard: exact midpoint value.' },
        { label: 'Max - ε', val: Number((decMax - delta).toFixed(decPrecision)), cat: 'Just Below Max' as const, valid: true, exp: `Valid boundary: precision epsilon (${delta}) below maximum.` },
        { label: 'Max', val: Number(decMax.toFixed(decPrecision)), cat: 'Maximum' as const, valid: true, exp: 'Valid boundary: exact maximum inclusive threshold.' },
        { label: 'Max + ε', val: Number((decMax + delta).toFixed(decPrecision)), cat: 'Just Above Max' as const, valid: false, exp: `Invalid boundary: precision epsilon (${delta}) above maximum.` },
        { label: 'Max + 100ε', val: Number((decMax + 100 * delta).toFixed(decPrecision)), cat: 'Extreme High' as const, valid: false, exp: 'Extreme invalid: far above upper bound.' }
      ];

      items.forEach((it, idx) => {
        if (methodology === '2-value' && !['Min - ε', 'Min', 'Max', 'Max + ε'].includes(it.label)) return;
        if (methodology === '3-value' && ['Extreme Low', 'Extreme High'].includes(it.cat)) return;
        list.push({
          id: `pt_${idx}`,
          testCaseId: `TC-DEC-BVA-${String(list.length + 1).padStart(2, '0')}`,
          label: it.label,
          value: `${it.val} ${unitLabel}`.trim(),
          rawNumeric: it.val,
          category: it.cat,
          isValid: it.valid,
          explanation: it.exp
        });
      });
    } else if (dataType === 'string_length') {
      if (strMin >= strMax || strMin < 1) return [];
      const nominalLen = Math.round((strMin + strMax) / 2);

      const items = [
        { label: 'Empty (0)', len: 0, str: '""', cat: 'Extreme Low' as const, valid: false, exp: 'Invalid extreme: empty string length.' },
        { label: 'MinLen - 1', len: strMin - 1, str: `"a".repeat(${strMin - 1})`, cat: 'Just Below Min' as const, valid: false, exp: `Invalid boundary: ${strMin - 1} characters (below minimum length ${strMin}).` },
        { label: 'MinLen', len: strMin, str: `"a".repeat(${strMin})`, cat: 'Minimum' as const, valid: true, exp: `Valid boundary: exactly minimum allowed length (${strMin} chars).` },
        { label: 'MinLen + 1', len: strMin + 1, str: `"a".repeat(${strMin + 1})`, cat: 'Just Above Min' as const, valid: true, exp: `Valid boundary: ${strMin + 1} characters (just above minimum length).` },
        { label: 'NominalLen', len: nominalLen, str: `"a".repeat(${nominalLen})`, cat: 'Nominal / Mid' as const, valid: true, exp: `Valid nominal: ${nominalLen} characters typical input.` },
        { label: 'MaxLen - 1', len: strMax - 1, str: `"a".repeat(${strMax - 1})`, cat: 'Just Below Max' as const, valid: true, exp: `Valid boundary: ${strMax - 1} characters (just below maximum length).` },
        { label: 'MaxLen', len: strMax, str: `"a".repeat(${strMax})`, cat: 'Maximum' as const, valid: true, exp: `Valid boundary: exactly maximum allowed length (${strMax} chars).` },
        { label: 'MaxLen + 1', len: strMax + 1, str: `"a".repeat(${strMax + 1})`, cat: 'Just Above Max' as const, valid: false, exp: `Invalid boundary: ${strMax + 1} characters (exceeds maximum length ${strMax}).` },
        { label: 'Overflow (1000)', len: 1000, str: `"a".repeat(1000)`, cat: 'Extreme High' as const, valid: false, exp: 'Extreme invalid: large string buffer overflow payload (1000 chars).' }
      ];

      items.forEach((it, idx) => {
        if (methodology === '2-value' && !['MinLen - 1', 'MinLen', 'MaxLen', 'MaxLen + 1'].includes(it.label)) return;
        if (methodology === '3-value' && ['Extreme Low', 'Extreme High'].includes(it.cat)) return;
        list.push({
          id: `pt_${idx}`,
          testCaseId: `TC-STR-BVA-${String(list.length + 1).padStart(2, '0')}`,
          label: `${it.label} [len=${it.len}]`,
          value: it.str,
          rawNumeric: it.len,
          category: it.cat,
          isValid: it.valid,
          explanation: it.exp
        });
      });
    } else if (dataType === 'date_range') {
      const minD = new Date(dateMin);
      const maxD = new Date(dateMax);
      if (isNaN(minD.getTime()) || isNaN(maxD.getTime()) || minD >= maxD) return [];

      const addDays = (d: Date, days: number) => {
        const copy = new Date(d);
        copy.setDate(copy.getDate() + days);
        return copy.toISOString().slice(0, 10);
      };

      const midTime = new Date((minD.getTime() + maxD.getTime()) / 2).toISOString().slice(0, 10);

      const items = [
        { label: 'MinDate - 30d', val: addDays(minD, -30), cat: 'Extreme Low' as const, valid: false, exp: 'Extreme invalid: past date far before allowed window.' },
        { label: 'MinDate - 1d', val: addDays(minD, -1), cat: 'Just Below Min' as const, valid: false, exp: 'Invalid boundary: exactly one day prior to start date.' },
        { label: 'MinDate', val: dateMin, cat: 'Minimum' as const, valid: true, exp: 'Valid boundary: exact starting date of window.' },
        { label: 'MinDate + 1d', val: addDays(minD, 1), cat: 'Just Above Min' as const, valid: true, exp: 'Valid boundary: one day after start date.' },
        { label: 'Mid-Period', val: midTime, cat: 'Nominal / Mid' as const, valid: true, exp: 'Valid nominal: midpoint date.' },
        { label: 'MaxDate - 1d', val: addDays(maxD, -1), cat: 'Just Below Max' as const, valid: true, exp: 'Valid boundary: one day prior to end date.' },
        { label: 'MaxDate', val: dateMax, cat: 'Maximum' as const, valid: true, exp: 'Valid boundary: exact final allowable date.' },
        { label: 'MaxDate + 1d', val: addDays(maxD, 1), cat: 'Just Above Max' as const, valid: false, exp: 'Invalid boundary: one day past allowable window.' },
        { label: 'MaxDate + 30d', val: addDays(maxD, 30), cat: 'Extreme High' as const, valid: false, exp: 'Extreme invalid: far into future outside allowed range.' }
      ];

      items.forEach((it, idx) => {
        if (methodology === '2-value' && !['MinDate - 1d', 'MinDate', 'MaxDate', 'MaxDate + 1d'].includes(it.label)) return;
        if (methodology === '3-value' && ['Extreme Low', 'Extreme High'].includes(it.cat)) return;
        list.push({
          id: `pt_${idx}`,
          testCaseId: `TC-DATE-BVA-${String(list.length + 1).padStart(2, '0')}`,
          label: it.label,
          value: it.val,
          category: it.cat,
          isValid: it.valid,
          explanation: it.exp
        });
      });
    } else if (dataType === 'file_size') {
      const getMultiplier = (u: string) => (u === 'B' ? 1 : u === 'KB' ? 1024 : u === 'MB' ? 1024 * 1024 : 1024 * 1024 * 1024);
      const minBytes = fileMinVal * getMultiplier(fileMinUnit);
      const maxBytes = fileMaxVal * getMultiplier(fileMaxUnit);
      if (minBytes >= maxBytes) return [];

      const formatBytes = (b: number) => {
        if (b < 1024) return `${b} Bytes`;
        if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB (${b.toLocaleString()} B)`;
        return `${(b / (1024 * 1024)).toFixed(2)} MB (${b.toLocaleString()} B)`;
      };

      const midBytes = Math.round((minBytes + maxBytes) / 2);

      const items = [
        { label: '0 Bytes (Empty)', bytes: 0, cat: 'Extreme Low' as const, valid: false, exp: 'Invalid extreme: empty 0-byte file payload.' },
        { label: 'MinSize - 1 Byte', bytes: minBytes - 1, cat: 'Just Below Min' as const, valid: false, exp: `Invalid boundary: 1 byte under minimum allowed size.` },
        { label: 'MinSize', bytes: minBytes, cat: 'Minimum' as const, valid: true, exp: `Valid boundary: exact minimum allowed upload threshold.` },
        { label: 'MinSize + 1 Byte', bytes: minBytes + 1, cat: 'Just Above Min' as const, valid: true, exp: `Valid boundary: 1 byte above minimum threshold.` },
        { label: 'Nominal Size', bytes: midBytes, cat: 'Nominal / Mid' as const, valid: true, exp: `Valid nominal: typical expected file payload.` },
        { label: 'MaxSize - 1 Byte', bytes: maxBytes - 1, cat: 'Just Below Max' as const, valid: true, exp: `Valid boundary: 1 byte under maximum upload capacity.` },
        { label: 'MaxSize', bytes: maxBytes, cat: 'Maximum' as const, valid: true, exp: `Valid boundary: exact maximum upload capacity.` },
        { label: 'MaxSize + 1 Byte', bytes: maxBytes + 1, cat: 'Just Above Max' as const, valid: false, exp: `Invalid boundary: 1 byte over maximum capacity (HTTP 413 Payload Too Large).` },
        { label: 'MaxSize + 50 MB', bytes: maxBytes + 50 * 1024 * 1024, cat: 'Extreme High' as const, valid: false, exp: 'Extreme invalid: severe file size violation.' }
      ];

      items.forEach((it, idx) => {
        if (methodology === '2-value' && !['MinSize - 1 Byte', 'MinSize', 'MaxSize', 'MaxSize + 1 Byte'].includes(it.label)) return;
        if (methodology === '3-value' && ['Extreme Low', 'Extreme High'].includes(it.cat)) return;
        list.push({
          id: `pt_${idx}`,
          testCaseId: `TC-FILE-BVA-${String(list.length + 1).padStart(2, '0')}`,
          label: it.label,
          value: formatBytes(it.bytes),
          rawNumeric: it.bytes,
          category: it.cat,
          isValid: it.valid,
          explanation: it.exp
        });
      });
    }

    return list;
  }, [
    dataType,
    methodology,
    intMin,
    intMax,
    intStep,
    unitLabel,
    decMin,
    decMax,
    decPrecision,
    strMin,
    strMax,
    dateMin,
    dateMax,
    fileMinVal,
    fileMinUnit,
    fileMaxVal,
    fileMaxUnit
  ]);

  // --- MULTI-VARIABLE COMBINATORIAL MATRIX GENERATOR ---
  const combinatorialMatrix = useMemo(() => {
    if (multiFields.length === 0) return [];

    // For single fault assumption BVA: For each variable, test boundary values while others stay at nominal
    const nominals = multiFields.map(f => Math.round((f.min + f.max) / 2));
    const combinations: { testCaseId: string; scenario: string; values: Record<string, number>; isValid: boolean }[] = [];

    // 1. Base Nominal Test Case
    const baseObj: Record<string, number> = {};
    multiFields.forEach((f, i) => {
      baseObj[f.name] = nominals[i];
    });
    combinations.push({
      testCaseId: 'TC-MULTI-001',
      scenario: 'All Variables at Nominal Values',
      values: baseObj,
      isValid: true
    });

    // 2. Boundary points for each field
    multiFields.forEach((f, fIdx) => {
      const boundaryValues = [
        { label: 'Min - Δ', val: f.min - f.step, valid: false },
        { label: 'Min', val: f.min, valid: true },
        { label: 'Min + Δ', val: f.min + f.step, valid: true },
        { label: 'Max - Δ', val: f.max - f.step, valid: true },
        { label: 'Max', val: f.max, valid: true },
        { label: 'Max + Δ', val: f.max + f.step, valid: false }
      ];

      boundaryValues.forEach((bv) => {
        const rowVals: Record<string, number> = {};
        multiFields.forEach((otherF, oIdx) => {
          rowVals[otherF.name] = oIdx === fIdx ? bv.val : nominals[oIdx];
        });

        combinations.push({
          testCaseId: `TC-MULTI-${String(combinations.length + 1).padStart(3, '0')}`,
          scenario: `${f.name} at ${bv.label} (${bv.val} ${f.unit}), others at nominal`,
          values: rowVals,
          isValid: bv.valid
        });
      });
    });

    return combinations;
  }, [multiFields]);

  // --- AUTOMATED CODE GENERATORS ---
  const generatedCode = useMemo(() => {
    if (codeFormat === 'vitest') {
      return `import { describe, test, expect } from 'vitest';
import { validateInput } from './validator';

describe('Boundary Value Analysis (BVA) Test Suite', () => {
  const testCases = [
${singleBoundaries
  .map(
    b =>
      `    { id: '${b.testCaseId}', label: '${b.label}', value: ${
        typeof b.rawNumeric === 'number' ? b.rawNumeric : JSON.stringify(b.value)
      }, expected: ${b.isValid} }`
  )
  .join(',\n')}
  ];

  test.each(testCases)('$id: $label (value: $value) -> expected $expected', ({ value, expected }) => {
    const result = validateInput(value);
    expect(result).toBe(expected);
  });
});`;
    }

    if (codeFormat === 'pytest') {
      return `import pytest
from validator import validate_input

@pytest.mark.parametrize("tc_id, label, value, expected", [
${singleBoundaries
  .map(
    b =>
      `    ("${b.testCaseId}", "${b.label}", ${
        typeof b.rawNumeric === 'number' ? b.rawNumeric : JSON.stringify(b.value)
      }, ${b.isValid ? 'True' : 'False'})`
  )
  .join(',\n')}
])
def test_boundary_values(tc_id, label, value, expected):
    """BVA Verification for ${dataType} range"""
    assert validate_input(value) == expected, f"Failed at {tc_id}: {label}"`;
    }

    if (codeFormat === 'junit5') {
      return `import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.assertEquals;

class BoundaryValueAnalysisTest {

    @ParameterizedTest(name = "{0}: {1} [{2}] -> expected valid: {3}")
    @CsvSource({
${singleBoundaries
  .map(
    b =>
      `        "${b.testCaseId}, ${b.label}, ${
        typeof b.rawNumeric === 'number' ? b.rawNumeric : String(b.value).replace(/"/g, '')
      }, ${b.isValid}"`
  )
  .join(',\n')}
    })
    void testBoundaryInputs(String tcId, String label, String value, boolean expected) {
        boolean result = Validator.isValid(value);
        assertEquals(expected, result);
    }
}`;
    }

    if (codeFormat === 'playwright') {
      return `import { test, expect } from '@playwright/test';

const bvaCases = [
${singleBoundaries
  .map(
    b =>
      `  { tcId: '${b.testCaseId}', label: '${b.label}', input: '${
        typeof b.rawNumeric === 'number' ? b.rawNumeric : b.value
      }', expectedValid: ${b.isValid} }`
  )
  .join(',\n')}
];

test.describe('E2E Form Boundary Value Validation', () => {
  for (const { tcId, label, input, expectedValid } of bvaCases) {
    test(\`\${tcId} - \${label}: \${input}\`, async ({ page }) => {
      await page.goto('/form');
      await page.fill('#input-field', input);
      await page.click('#submit-btn');

      if (expectedValid) {
        await expect(page.locator('.validation-error')).not.toBeVisible();
      } else {
        await expect(page.locator('.validation-error')).toBeVisible();
      }
    });
  }
});`;
    }

    if (codeFormat === 'csv') {
      let csv = `Test Case ID,Boundary Label,Input Value,Category,Status,Explanation\n`;
      singleBoundaries.forEach(b => {
        csv += `"${b.testCaseId}","${b.label}","${b.value}","${b.category}","${
          b.isValid ? 'VALID' : 'INVALID'
        }","${b.explanation}"\n`;
      });
      return csv;
    }

    if (codeFormat === 'markdown') {
      let md = `### 🎯 Boundary Value Analysis Matrix\n\n`;
      md += `| Test Case ID | Boundary Label | Input Value | Category | Status | Explanation |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      singleBoundaries.forEach(b => {
        md += `| \`${b.testCaseId}\` | **${b.label}** | \`${b.value}\` | ${b.category} | ${
          b.isValid ? '🟢 Valid' : '🔴 Invalid'
        } | ${b.explanation} |\n`;
      });
      return md;
    }

    return '';
  }, [codeFormat, singleBoundaries, dataType]);

  // --- ACTIONS ---
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    let csv = `Test Case ID,Boundary Label,Input Value,Category,Status,Explanation\n`;
    singleBoundaries.forEach(b => {
      csv += `"${b.testCaseId}","${b.label}","${b.value}","${b.category}","${
        b.isValid ? 'VALID' : 'INVALID'
      }","${b.explanation}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bva-test-cases-${dataType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* --- PRESETS BAR --- */}
      <div className="saas-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              Instant BVA & Equivalence Presets
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold hidden sm:inline">
              (Pre-configured boundary models)
            </span>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
            ISTQB Standard Compliant
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleLoadPreset(p)}
              className="group p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-full shadow-2xs"
            >
              <div className="text-[9px] font-extrabold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {p.category}
              </div>
              <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 line-clamp-1 leading-tight">
                {p.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN MODE TABS --- */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'single'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Single-Variable Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('multi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'multi'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Variable Matrix ({multiFields.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Automated Test Code</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="saas-button-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: SINGLE-VARIABLE STUDIO --- */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: CONFIGURATION PANEL */}
          <div className="lg:col-span-4 space-y-4">
            <div className="saas-card p-5 space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Boundary Range Specs</span>
                </h3>
              </div>

              {/* Data Type Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Data Domain / Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'integer', label: 'Integer', icon: Hash },
                    { id: 'decimal', label: 'Decimal', icon: Percent },
                    { id: 'string_length', label: 'Text Len', icon: Type },
                    { id: 'date_range', label: 'Date', icon: Calendar },
                    { id: 'file_size', label: 'File Size', icon: HardDrive }
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDataType(t.id as DataType)}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          dataType === t.id
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BVA Methodology Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">BVA Methodology</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: '3-value', label: '3-Value (7 pts)', sub: 'Min±1, Max±1' },
                    { id: '2-value', label: '2-Value (4 pts)', sub: 'ISTQB Basic' },
                    { id: 'extreme', label: 'Robust (9 pts)', sub: 'Outliers & Inf' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethodology(m.id as Methodology)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        methodology === m.id
                          ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium'
                      }`}
                    >
                      <div className="text-[10px] font-bold">{m.label}</div>
                      <div className="text-[8.5px] text-zinc-400">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC RANGE INPUTS BASED ON DATA TYPE */}

              {/* 1. INTEGER INPUTS */}
              {dataType === 'integer' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Minimum (Min)</label>
                      <input
                        type="number"
                        value={intMin}
                        onChange={(e) => setIntMin(Number(e.target.value))}
                        className="saas-input text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Maximum (Max)</label>
                      <input
                        type="number"
                        value={intMax}
                        onChange={(e) => setIntMax(Number(e.target.value))}
                        className="saas-input text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Step Delta (Δ)</label>
                      <input
                        type="number"
                        value={intStep}
                        min={1}
                        onChange={(e) => setIntStep(Math.max(1, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Unit Label</label>
                      <input
                        type="text"
                        placeholder="e.g. years, pts"
                        value={unitLabel}
                        onChange={(e) => setUnitLabel(e.target.value)}
                        className="saas-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DECIMAL INPUTS */}
              {dataType === 'decimal' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Min Decimal</label>
                      <input
                        type="number"
                        step="0.01"
                        value={decMin}
                        onChange={(e) => setDecMin(Number(e.target.value))}
                        className="saas-input text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Max Decimal</label>
                      <input
                        type="number"
                        step="0.01"
                        value={decMax}
                        onChange={(e) => setDecMax(Number(e.target.value))}
                        className="saas-input text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Precision (Decimals)</label>
                      <select
                        value={decPrecision}
                        onChange={(e) => setDecPrecision(Number(e.target.value))}
                        className="saas-select text-xs font-bold"
                      >
                        <option value={1}>1 (0.1)</option>
                        <option value={2}>2 (0.01 currency)</option>
                        <option value={3}>3 (0.001 fine)</option>
                        <option value={4}>4 (0.0001 crypto)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Unit Symbol</label>
                      <input
                        type="text"
                        placeholder="e.g. %, ₹, kg"
                        value={unitLabel}
                        onChange={(e) => setUnitLabel(e.target.value)}
                        className="saas-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STRING LENGTH INPUTS */}
              {dataType === 'string_length' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Min Chars</label>
                      <input
                        type="number"
                        min={1}
                        value={strMin}
                        onChange={(e) => setStrMin(Math.max(1, Number(e.target.value)))}
                        className="saas-input text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Max Chars</label>
                      <input
                        type="number"
                        min={2}
                        value={strMax}
                        onChange={(e) => setStrMax(Number(e.target.value))}
                        className="saas-input text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DATE RANGE INPUTS */}
              {dataType === 'date_range' && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Min Start Date</label>
                    <input
                      type="date"
                      value={dateMin}
                      onChange={(e) => setDateMin(e.target.value)}
                      className="saas-input text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Max End Date</label>
                    <input
                      type="date"
                      value={dateMax}
                      onChange={(e) => setDateMax(e.target.value)}
                      className="saas-input text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 5. FILE SIZE INPUTS */}
              {dataType === 'file_size' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Min Upload</label>
                      <input
                        type="number"
                        value={fileMinVal}
                        onChange={(e) => setFileMinVal(Number(e.target.value))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Min Unit</label>
                      <select
                        value={fileMinUnit}
                        onChange={(e) => setFileMinUnit(e.target.value)}
                        className="saas-select text-xs font-bold"
                      >
                        <option value="B">Bytes</option>
                        <option value="KB">KB</option>
                        <option value="MB">MB</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Max Upload</label>
                      <input
                        type="number"
                        value={fileMaxVal}
                        onChange={(e) => setFileMaxVal(Number(e.target.value))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Max Unit</label>
                      <select
                        value={fileMaxUnit}
                        onChange={(e) => setFileMaxUnit(e.target.value)}
                        className="saas-select text-xs font-bold"
                      >
                        <option value="KB">KB</option>
                        <option value="MB">MB</option>
                        <option value="GB">GB</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: INTERACTIVE NUMBER LINE & BVA MATRIX TABLE */}
          <div className="lg:col-span-8 space-y-4">

            {/* Visual Number Line Diagram */}
            <div className="saas-card p-4 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Equivalence Partitions & Boundary Visualizer</span>
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  {singleBoundaries.filter(b => b.isValid).length} Valid • {singleBoundaries.filter(b => !b.isValid).length} Invalid Points
                </span>
              </div>

              {/* Number Line Visual Canvas */}
              <div className="relative py-4 px-2">
                {/* 3 Partition Bands */}
                <div className="grid grid-cols-12 h-9 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  {/* Lower Invalid */}
                  <div className="col-span-3 bg-rose-500/15 border-r border-dashed border-rose-400 flex items-center justify-center">
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Invalid (&lt; Min)
                    </span>
                  </div>
                  {/* Valid Middle */}
                  <div className="col-span-6 bg-emerald-500/20 border-r border-dashed border-emerald-500 flex items-center justify-center shadow-xs">
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      Valid Accepted Partition [Min ... Max]
                    </span>
                  </div>
                  {/* Upper Invalid */}
                  <div className="col-span-3 bg-rose-500/15 flex items-center justify-center">
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Invalid (&gt; Max)
                    </span>
                  </div>
                </div>

                {/* Boundary Tick Pins */}
                <div className="flex justify-between items-center px-1 pt-2">
                  {singleBoundaries.map((b) => (
                    <div
                      key={b.id}
                      onMouseEnter={() => setHoveredPointId(b.id)}
                      onMouseLeave={() => setHoveredPointId(null)}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-150 ${
                        hoveredPointId === b.id ? 'scale-110 -translate-y-1' : ''
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        b.isValid ? 'bg-emerald-500 border-white dark:border-zinc-900 shadow-xs' : 'bg-rose-500 border-white dark:border-zinc-900 shadow-xs'
                      }`} />
                      <span className="text-[9px] font-black text-zinc-700 dark:text-zinc-300 mt-1 font-mono">
                        {b.label.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Boundary Test Cases Table */}
            <div className="saas-card p-5 space-y-3 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  <span>Computed Boundary Test Cases ({singleBoundaries.length})</span>
                </h3>
              </div>

              {singleBoundaries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        <th className="py-2.5 px-3">Test Case ID</th>
                        <th className="py-2.5 px-3">Boundary Point</th>
                        <th className="py-2.5 px-3">Test Value</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Expected</th>
                        <th className="py-2.5 px-3">Explanation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {singleBoundaries.map((b) => {
                        const isHovered = hoveredPointId === b.id;
                        return (
                          <tr
                            key={b.id}
                            onMouseEnter={() => setHoveredPointId(b.id)}
                            onMouseLeave={() => setHoveredPointId(null)}
                            className={`border-b border-zinc-200/40 dark:border-zinc-800/40 transition-all font-semibold ${
                              isHovered
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                                : 'hover:bg-zinc-50/40 dark:hover:bg-zinc-950/20'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-400">{b.testCaseId}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-650 dark:text-indigo-400 font-bold">
                              {b.label}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] font-black text-zinc-900 dark:text-zinc-100">
                              {b.value}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 text-[10px]">{b.category}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                  b.isValid
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {b.isValid ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                                {b.isValid ? 'VALID' : 'INVALID'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 leading-normal text-[11px]">
                              {b.explanation}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-zinc-400 text-xs font-semibold">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span>Configure a valid Minimum & Maximum range on the left</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MULTI-VARIABLE COMBINATORIAL MATRIX --- */}
      {activeTab === 'multi' && (
        <div className="space-y-4 text-left">
          <div className="saas-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Multi-Variable Boundary Test Combinations (Single Fault Assumption)</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tests each input variable at its boundary thresholds while holding all remaining variables at nominal midpoints.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMultiFields([
                    ...multiFields,
                    { id: 'f_' + Date.now(), name: `Variable ${multiFields.length + 1}`, min: 1, max: 100, step: 1, unit: '' }
                  ]);
                }}
                className="saas-button-primary py-1 px-3 text-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variable</span>
              </button>
            </div>

            {/* Variable Fields Editor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {multiFields.map((f, idx) => (
                <div key={f.id} className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => {
                        const copy = [...multiFields];
                        copy[idx].name = e.target.value;
                        setMultiFields(copy);
                      }}
                      className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-transparent border-none focus:outline-none"
                    />
                    {multiFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMultiFields(multiFields.filter((_, i) => i !== idx))}
                        className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400">Min</label>
                      <input
                        type="number"
                        value={f.min}
                        onChange={(e) => {
                          const copy = [...multiFields];
                          copy[idx].min = Number(e.target.value);
                          setMultiFields(copy);
                        }}
                        className="saas-input py-1 text-[11px] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400">Max</label>
                      <input
                        type="number"
                        value={f.max}
                        onChange={(e) => {
                          const copy = [...multiFields];
                          copy[idx].max = Number(e.target.value);
                          setMultiFields(copy);
                        }}
                        className="saas-input py-1 text-[11px] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400">Unit</label>
                      <input
                        type="text"
                        value={f.unit}
                        onChange={(e) => {
                          const copy = [...multiFields];
                          copy[idx].unit = e.target.value;
                          setMultiFields(copy);
                        }}
                        className="saas-input py-1 text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Combinatorial Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    <th className="py-2.5 px-3">Test Case ID</th>
                    <th className="py-2.5 px-3">Scenario Description</th>
                    {multiFields.map(f => (
                      <th key={f.id} className="py-2.5 px-3">{f.name} ({f.unit || 'val'})</th>
                    ))}
                    <th className="py-2.5 px-3">Expected Status</th>
                  </tr>
                </thead>
                <tbody>
                  {combinatorialMatrix.map((tc) => (
                    <tr
                      key={tc.testCaseId}
                      className="border-b border-zinc-200/40 dark:border-zinc-800/40 hover:bg-zinc-50/40 dark:hover:bg-zinc-950/20 font-semibold"
                    >
                      <td className="py-2 px-3 font-mono text-[10px] text-zinc-400">{tc.testCaseId}</td>
                      <td className="py-2 px-3 text-zinc-800 dark:text-zinc-200 font-bold">{tc.scenario}</td>
                      {multiFields.map(f => (
                        <td key={f.id} className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {tc.values[f.name]} {f.unit}
                        </td>
                      ))}
                      <td className="py-2 px-3">
                        <span
                          className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            tc.isValid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tc.isValid ? 'VALID' : 'INVALID'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: AUTOMATED TEST CODE & SCRIPTS --- */}
      {activeTab === 'code' && (
        <div className="space-y-4 text-left">
          <div className="saas-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Automated Unit & E2E Test Suite Generator
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="saas-button-primary py-1 px-3 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Test Suite'}</span>
                </button>
              </div>
            </div>

            {/* Code Framework Switcher */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {[
                { id: 'vitest', label: 'Vitest / Jest (TS)' },
                { id: 'pytest', label: 'Python (Pytest)' },
                { id: 'junit5', label: 'Java (JUnit 5)' },
                { id: 'playwright', label: 'Playwright (E2E)' },
                { id: 'csv', label: 'Raw CSV Matrix' },
                { id: 'markdown', label: 'Markdown Spec' }
              ].map((cf) => (
                <button
                  key={cf.id}
                  type="button"
                  onClick={() => setCodeFormat(cf.id as CodeFormat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codeFormat === cf.id
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {cf.label}
                </button>
              ))}
            </div>

            {/* Code Display Area */}
            <textarea
              readOnly
              value={generatedCode}
              rows={14}
              className="w-full font-mono text-xs p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      )}

    </div>
  );
}
