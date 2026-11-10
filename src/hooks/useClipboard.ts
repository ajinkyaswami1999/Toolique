import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseClipboardOptions {
  /**
   * Duration in milliseconds for the copied state to remain true.
   * @default 2000
   */
  duration?: number;
  /**
   * Callback fired when copy is successful.
   */
  onSuccess?: (text: string) => void;
  /**
   * Callback fired when copy fails.
   */
  onError?: (error: Error) => void;
}

export interface UseClipboardReturn {
  /**
   * True while the copy feedback is active.
   */
  copied: boolean;
  /**
   * Copies the provided text to the user's clipboard.
   * Returns true if successful, false otherwise.
   */
  copy: (text: string) => Promise<boolean>;
  /**
   * Holds the last error if copy failed, or null.
   */
  error: Error | null;
  /**
   * Resets the copied state and error immediately.
   */
  reset: () => void;
}

/**
 * Robust, cross-browser hook for copying text to the clipboard.
 * Supports Modern Clipboard API with graceful fallback to document.execCommand('copy').
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { duration = 2000, onSuccess, onError } = options;
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCopied(false);
    setError(null);
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      let success = false;

      // Method 1: Modern navigator.clipboard API
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          success = true;
        } catch {
          // Clipboard API rejected, attempt fallback below
          success = false;
        }
      }

      // Method 2: Document execCommand fallback for older browsers or insecure contexts
      if (!success && typeof document !== 'undefined') {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          // Prevent zoom or layout shift
          textArea.style.position = 'fixed';
          textArea.style.top = '0';
          textArea.style.left = '0';
          textArea.style.width = '2em';
          textArea.style.height = '2em';
          textArea.style.padding = '0';
          textArea.style.border = 'none';
          textArea.style.outline = 'none';
          textArea.style.boxShadow = 'none';
          textArea.style.background = 'transparent';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (successful) {
            success = true;
          } else {
            throw new Error('document.execCommand copy returned false');
          }
        } catch (err) {
          const errObj = err instanceof Error ? err : new Error(String(err));
          setError(errObj);
          onError?.(errObj);
          return false;
        }
      }

      if (success) {
        setCopied(true);
        setError(null);
        onSuccess?.(text);

        timeoutRef.current = setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, duration);

        return true;
      } else {
        const failureError = new Error('Clipboard copy not supported or permitted in this browser.');
        setError(failureError);
        onError?.(failureError);
        return false;
      }
    },
    [duration, onSuccess, onError]
  );

  return { copied, copy, error, reset };
}
