import { useState, useEffect, useCallback } from 'react';
import { X, Copy, Check, Calculator as CalcIcon, Delete } from 'lucide-react';

interface CalculatorPanelProps {
  onClose: () => void;
}

export default function CalculatorPanel({ onClose }: CalculatorPanelProps) {
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [formulaPreview, setFormulaPreview] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Number / Decimal input
  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  // Clear
  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setFormulaPreview('');
  }, []);

  // Backspace
  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  // Toggle Sign
  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value) && value !== 0) {
      setDisplay(String(-value));
    }
  }, [display]);

  // Percentage
  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      const fixed = value / 100;
      setDisplay(String(fixed));
      setFormulaPreview(`${value}% =`);
    }
  }, [display]);

  // Perform Operation
  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setFormulaPreview(`${display} ${nextOperator}`);
    } else if (operator) {
      const currentValue = previousValue;
      let result = currentValue;

      if (operator === '+') result = currentValue + inputValue;
      else if (operator === '-') result = currentValue - inputValue;
      else if (operator === '×' || operator === '*') result = currentValue * inputValue;
      else if (operator === '÷' || operator === '/') {
        if (inputValue === 0) {
          setDisplay('Error');
          setFormulaPreview('Cannot divide by 0');
          setPreviousValue(null);
          setOperator(null);
          setWaitingForOperand(true);
          return;
        }
        result = currentValue / inputValue;
      }

      // Round floating point quirks
      result = parseFloat(result.toFixed(10));
      setDisplay(String(result));
      setPreviousValue(result);
      setFormulaPreview(`${result} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, previousValue]);

  // Equals
  const calculateResult = useCallback(() => {
    if (operator === null || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result = previousValue;

    if (operator === '+') result = previousValue + inputValue;
    else if (operator === '-') result = previousValue - inputValue;
    else if (operator === '×' || operator === '*') result = previousValue * inputValue;
    else if (operator === '÷' || operator === '/') {
      if (inputValue === 0) {
        setDisplay('Error');
        setFormulaPreview('Cannot divide by 0');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        return;
      }
      result = previousValue / inputValue;
    }

    result = parseFloat(result.toFixed(10));
    setFormulaPreview(`${previousValue} ${operator} ${inputValue} =`);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, operator, previousValue]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a textarea or input field outside calculator
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.closest('.toolique-calculator-panel')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        inputDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        inputDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        performOperation('+');
      } else if (e.key === '-') {
        e.preventDefault();
        performOperation('-');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === '%' ) {
        e.preventDefault();
        inputPercent();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, calculateResult, backspace, clearAll, inputPercent, onClose]);

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div 
      className="toolique-calculator-panel fixed bottom-24 right-6 sm:right-8 z-[100] w-[310px] sm:w-[330px] rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-indigo-500/10 dark:shadow-black/40 overflow-hidden text-left animate-fadeIn scale-100 origin-bottom-right transition-all"
      role="dialog"
      aria-label="Quick Calculator"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <CalcIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white leading-none">
              Quick Calculator
            </h3>
            <span className="text-[9px] font-bold text-zinc-400">Keyboard enabled</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copyResult}
            title="Copy current value"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="p-4 bg-zinc-900 dark:bg-black text-white space-y-1 select-all">
        <div className="text-[11px] font-mono text-zinc-400 font-semibold text-right h-4 overflow-hidden truncate">
          {formulaPreview || '\u00A0'}
        </div>
        <div className="text-2xl sm:text-3xl font-mono font-black text-right tracking-tight truncate text-emerald-400">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="p-3 grid grid-cols-4 gap-2 bg-zinc-50/40 dark:bg-zinc-900/40">
        {/* Row 1 */}
        <button
          type="button"
          onClick={clearAll}
          className="h-11 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 font-black text-xs transition flex items-center justify-center border border-rose-500/10"
        >
          AC
        </button>
        <button
          type="button"
          onClick={backspace}
          className="h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition flex items-center justify-center"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={inputPercent}
          className="h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-300 font-black text-xs transition flex items-center justify-center"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => performOperation('÷')}
          className={`h-11 rounded-2xl ${operator === '÷' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'} hover:bg-indigo-600 hover:text-white active:scale-95 font-black text-base transition flex items-center justify-center`}
        >
          ÷
        </button>

        {/* Row 2 */}
        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => inputDigit(d)}
            className="h-11 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 text-zinc-900 dark:text-white font-black text-sm transition flex items-center justify-center shadow-xs border border-zinc-200/50 dark:border-zinc-800/50"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => performOperation('×')}
          className={`h-11 rounded-2xl ${operator === '×' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'} hover:bg-indigo-600 hover:text-white active:scale-95 font-black text-base transition flex items-center justify-center`}
        >
          ×
        </button>

        {/* Row 3 */}
        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => inputDigit(d)}
            className="h-11 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 text-zinc-900 dark:text-white font-black text-sm transition flex items-center justify-center shadow-xs border border-zinc-200/50 dark:border-zinc-800/50"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => performOperation('-')}
          className={`h-11 rounded-2xl ${operator === '-' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'} hover:bg-indigo-600 hover:text-white active:scale-95 font-black text-base transition flex items-center justify-center`}
        >
          -
        </button>

        {/* Row 4 */}
        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => inputDigit(d)}
            className="h-11 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 text-zinc-900 dark:text-white font-black text-sm transition flex items-center justify-center shadow-xs border border-zinc-200/50 dark:border-zinc-800/50"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => performOperation('+')}
          className={`h-11 rounded-2xl ${operator === '+' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'} hover:bg-indigo-600 hover:text-white active:scale-95 font-black text-base transition flex items-center justify-center`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          type="button"
          onClick={toggleSign}
          className="h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-300 font-black text-xs transition flex items-center justify-center"
        >
          ±
        </button>
        <button
          type="button"
          onClick={() => inputDigit('0')}
          className="h-11 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 text-zinc-900 dark:text-white font-black text-sm transition flex items-center justify-center shadow-xs border border-zinc-200/50 dark:border-zinc-800/50"
        >
          0
        </button>
        <button
          type="button"
          onClick={inputDecimal}
          className="h-11 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 text-zinc-900 dark:text-white font-black text-sm transition flex items-center justify-center shadow-xs border border-zinc-200/50 dark:border-zinc-800/50"
        >
          .
        </button>
        <button
          type="button"
          onClick={calculateResult}
          className="h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg active:scale-95 transition flex items-center justify-center shadow-md shadow-indigo-500/20"
        >
          =
        </button>
      </div>
    </div>
  );
}
