import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  RefreshCw, 
  Bug, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  Terminal 
} from 'lucide-react';
import { CopyButton } from './common/CopyButton';
import { Link } from 'react-router-dom';

export interface ToolErrorBoundaryProps {
  children: ReactNode;
  toolId?: string;
  toolName?: string;
  resetKey?: any;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
}

interface ToolErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  resetCount: number;
}

export class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  constructor(props: ToolErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      resetCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ToolErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error(`[ToolErrorBoundary] Crash in tool '${this.props.toolId || 'unknown'}':`, error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ToolErrorBoundaryProps): void {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.handleReset();
    }
  }

  handleReset = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      resetCount: prev.resetCount + 1,
    }));
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  getErrorReport = (): string => {
    const { error, errorInfo } = this.state;
    const { toolId, toolName } = this.props;

    const report = {
      toolId: toolId || 'unknown',
      toolName: toolName || 'unknown',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
      componentStack: errorInfo?.componentStack,
    };

    return JSON.stringify(report, null, 2);
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showDetails, resetCount } = this.state;
    const { children, toolName, fallback } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback({ error, reset: this.handleReset });
      }
      if (fallback) {
        return fallback;
      }

      return (
        <div className="w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-zinc-900/90 shadow-sm text-left space-y-6">
          {/* Header Warning Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                Tool Isolation Guard
              </div>
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                Something went wrong in {toolName || 'this tool'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                An unhandled runtime error occurred in this component. Your browser session and client-side data remain secure.
              </p>
            </div>
          </div>

          {/* Primary Recovery Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset State</span>
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>

            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition"
            >
              <Home className="w-4 h-4" />
              <span>Browse All Tools</span>
            </Link>
          </div>

          {/* Collapsible Error Diagnostics Details */}
          <div className="border-t border-zinc-200/80 dark:border-zinc-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5 text-rose-500" />
                <span>{showDetails ? 'Hide' : 'Show'} Technical Error Details</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <CopyButton
                text={this.getErrorReport()}
                label="Copy Error Report"
                copiedLabel="Report Copied!"
                size="xs"
                variant="outline"
              />
            </div>

            {showDetails && (
              <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-200 font-mono text-[11px] leading-relaxed overflow-x-auto space-y-3 border border-zinc-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-zinc-800/80 pb-2">
                  <Terminal className="w-3.5 h-3.5 shrink-0" />
                  <span>{error.name}: {error.message}</span>
                </div>

                {error.stack && (
                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-bold">
                      Stack Trace
                    </div>
                    <pre className="whitespace-pre-wrap text-zinc-400 text-[10px] max-h-48 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div className="space-y-1 pt-2 border-t border-zinc-900">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-bold">
                      Component Stack
                    </div>
                    <pre className="whitespace-pre-wrap text-zinc-500 text-[10px] max-h-36 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <React.Fragment key={resetCount}>
        {children}
      </React.Fragment>
    );
  }
}

export default ToolErrorBoundary;
