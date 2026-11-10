import { useState, useCallback, useRef } from 'react';

export interface UseFileDropOptions {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  onError?: (errorMessage: string) => void;
}

export interface UseFileDropReturn {
  isDragging: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openFileDialog: () => void;
  clearError: () => void;
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Validates whether a file matches an accept pattern (e.g. "image/*", ".pdf", "application/pdf").
 */
export function isFileAccepted(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === '' || accept.trim() === '*') return true;

  const patterns = accept.split(',').map((p) => p.trim().toLowerCase());
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) {
      return fileName.endsWith(pattern);
    }
    if (pattern.endsWith('/*')) {
      const mimeGroup = pattern.slice(0, -2);
      return fileType.startsWith(mimeGroup);
    }
    return fileType === pattern;
  });
}

/**
 * Reusable hook for drag & drop file upload operations with size & MIME validation.
 */
export function useFileDrop(options: UseFileDropOptions = {}): UseFileDropReturn {
  const { accept, maxSizeMb, multiple = false, onFilesSelected, onError } = options;
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const validateAndProcessFiles = useCallback(
    (fileList: FileList | File[]) => {
      clearError();
      const rawFiles = Array.from(fileList);

      if (rawFiles.length === 0) return;

      const selectedFiles = multiple ? rawFiles : [rawFiles[0]];
      const validFiles: File[] = [];

      for (const file of selectedFiles) {
        // MIME / Extension validation
        if (accept && !isFileAccepted(file, accept)) {
          const msg = `File "${file.name}" is not an accepted format (${accept}).`;
          setError(msg);
          onError?.(msg);
          return;
        }

        // Size validation
        if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
          const msg = `File "${file.name}" exceeds the maximum size limit of ${maxSizeMb}MB.`;
          setError(msg);
          onError?.(msg);
          return;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onFilesSelected?.(validFiles);
      }
    },
    [accept, maxSizeMb, multiple, onFilesSelected, onError, clearError]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndProcessFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [validateAndProcessFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndProcessFiles(e.target.files);
        // Reset input value so the same file can be selected again if needed
        e.target.value = '';
      }
    },
    [validateAndProcessFiles]
  );

  return {
    isDragging,
    error,
    fileInputRef,
    openFileDialog,
    clearError,
    dragHandlers: {
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
    },
    handleInputChange,
  };
}
