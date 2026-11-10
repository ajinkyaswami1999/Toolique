import React from 'react';
import { Upload, FileCheck, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useFileDrop } from '../../hooks/useFileDrop';

export type DropzoneColorTheme = 'indigo' | 'rose' | 'amber' | 'emerald' | 'zinc';

export interface FileDropzoneProps {
  /** Accepted file extensions or MIME types (e.g. ".pdf,application/pdf", "image/*") */
  accept?: string;
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Maximum allowable file size in MB */
  maxSizeMb?: number;
  /** Alias for maxSizeMb */
  maxSizeMB?: number;
  /** Primary callback when one or more files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Convenience callback for single-file mode */
  onFileSelected?: (file: File) => void;
  /** Alias for onFileSelected */
  onFileSelect?: (file: File) => void;
  /** Currently selected file(s) for preview */
  currentFiles?: File[] | null;
  /** Single file shortcut for preview */
  currentFile?: File | null;
  /** Callback to clear/reset the selected file(s) */
  onClear?: () => void;
  /** Header prompt text */
  title?: string;
  /** Subtitle / helper note */
  description?: string;
  /** Alias for description */
  subtitle?: string;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Accent color scheme */
  colorTheme?: DropzoneColorTheme;
  /** Loading state indicator */
  loading?: boolean;
  /** Text to show during loading state */
  loadingText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disable drag & drop and file input */
  disabled?: boolean;
}

const THEME_STYLES: Record<
  DropzoneColorTheme,
  {
    dragActive: string;
    idle: string;
    iconBg: string;
    iconText: string;
    highlight: string;
  }
> = {
  indigo: {
    dragActive: 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20 scale-[0.99]',
    idle: 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-indigo-500/60 hover:bg-indigo-500/5',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    highlight: 'text-indigo-600 dark:text-indigo-400',
  },
  rose: {
    dragActive: 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 scale-[0.99]',
    idle: 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-rose-500/60 hover:bg-rose-500/5',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    iconText: 'text-rose-600 dark:text-rose-400',
    highlight: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    dragActive: 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 scale-[0.99]',
    idle: 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-amber-500/60 hover:bg-amber-500/5',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    iconText: 'text-amber-600 dark:text-amber-400',
    highlight: 'text-amber-600 dark:text-amber-400',
  },
  emerald: {
    dragActive: 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 scale-[0.99]',
    idle: 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-emerald-500/60 hover:bg-emerald-500/5',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    highlight: 'text-emerald-600 dark:text-emerald-400',
  },
  zinc: {
    dragActive: 'border-zinc-500 bg-zinc-500/10 dark:bg-zinc-500/20 scale-[0.99]',
    idle: 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-zinc-600',
    iconBg: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
    iconText: 'text-zinc-700 dark:text-zinc-300',
    highlight: 'text-zinc-900 dark:text-white',
  },
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple = false,
  maxSizeMb,
  maxSizeMB,
  onFilesSelected,
  onFileSelected,
  onFileSelect,
  currentFiles,
  currentFile,
  onClear,
  title,
  description,
  subtitle,
  icon,
  colorTheme = 'indigo',
  loading = false,
  loadingText = 'Processing file...',
  className = '',
  disabled = false,
}) => {
  const effectiveMaxSize = maxSizeMb ?? maxSizeMB ?? 50;
  const singleFileCallback = onFileSelected || onFileSelect;
  const descText = description || subtitle;

  const {
    isDragging,
    error,
    fileInputRef,
    openFileDialog,
    dragHandlers,
    handleInputChange,
  } = useFileDrop({
    accept,
    multiple,
    maxSizeMb: effectiveMaxSize,
    onFilesSelected: (files) => {
      if (onFilesSelected) {
        onFilesSelected(files);
      }
      if (files.length > 0 && singleFileCallback) {
        singleFileCallback(files[0]);
      }
    },
  });

  const filesToDisplay = currentFiles || (currentFile ? [currentFile] : []);
  const hasFiles = filesToDisplay.length > 0;
  const theme = THEME_STYLES[colorTheme];

  const defaultTitle = multiple ? 'Drop files here or browse' : 'Drop file here or browse';
  const defaultDesc = accept
    ? `Supports ${accept} files up to ${effectiveMaxSize}MB`
    : `Supports files up to ${effectiveMaxSize}MB`;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || loading}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Drop Area */}
      {!hasFiles ? (
        <div
          {...dragHandlers}
          onClick={() => {
            if (!disabled && !loading) openFileDialog();
          }}
          className={`relative border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer group select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${isDragging ? theme.dragActive : theme.idle}`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 ${theme.iconBg}`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              icon || <Upload className="w-6 h-6" />
            )}
          </div>

          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {loading ? (
              loadingText
            ) : (
              <>
                {title || defaultTitle.split(' or ')[0]} or{' '}
                <span className={theme.highlight}>browse</span>
              </>
            )}
          </p>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {descText || defaultDesc}
          </p>
        </div>
      ) : (
        /* Selected Files Preview Card */
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {filesToDisplay.length === 1 ? 'Selected File' : `Selected Files (${filesToDisplay.length})`}
            </span>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                disabled={disabled || loading}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filesToDisplay.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {(f.size / (1024 * 1024)).toFixed(2)} MB • {f.type || 'Binary / Document'}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
