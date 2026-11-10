import React, { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

export type CopyButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'pill';
export type CopyButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onError'> {
  /** Text to copy, or an async/sync resolver function */
  text: string | (() => string | Promise<string>);
  /** Optional button label shown when not copied */
  label?: string;
  /** Label shown immediately after successful copy */
  copiedLabel?: string;
  /** Force icon-only rendering */
  iconOnly?: boolean;
  /** Visual presentation style */
  variant?: CopyButtonVariant;
  /** Component size */
  size?: CopyButtonSize;
  /** Duration in ms for the copied state to remain active */
  duration?: number;
  /** Callback fired after successful copy */
  onSuccess?: (text: string) => void;
  /** Callback fired on copy error */
  onError?: (error: Error) => void;
}

const SIZE_STYLES: Record<CopyButtonSize, { button: string; icon: string }> = {
  xs: {
    button: 'px-2 py-1 text-[11px] gap-1 rounded-lg',
    icon: 'w-3 h-3',
  },
  sm: {
    button: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-xl',
    icon: 'w-3.5 h-3.5',
  },
  md: {
    button: 'px-3.5 py-2 text-sm gap-2 rounded-xl',
    icon: 'w-4 h-4',
  },
  lg: {
    button: 'px-4 py-2.5 text-base gap-2 rounded-2xl',
    icon: 'w-5 h-5',
  },
};

const VARIANT_STYLES: Record<CopyButtonVariant, { idle: string; copied: string }> = {
  primary: {
    idle: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    copied: 'bg-emerald-600 text-white shadow-sm',
  },
  secondary: {
    idle: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200',
    copied: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  outline: {
    idle: 'border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 shadow-sm',
    copied: 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  },
  ghost: {
    idle: 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    copied: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  pill: {
    idle: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
    copied: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  },
};

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  copiedLabel = 'Copied!',
  iconOnly = false,
  variant = 'outline',
  size = 'sm',
  duration = 2000,
  className = '',
  title,
  onSuccess,
  onError,
  disabled = false,
  ...rest
}) => {
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useClipboard({
    duration,
    onSuccess,
    onError,
  });

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled || loading) return;

    try {
      setLoading(true);
      const textToCopy = typeof text === 'function' ? await text() : text;
      await copy(textToCopy);
    } finally {
      setLoading(false);
    }
  };

  const isIconOnly = iconOnly || !label;
  const currentSize = SIZE_STYLES[size];
  const currentVariant = VARIANT_STYLES[variant];
  const variantClass = copied ? currentVariant.copied : currentVariant.idle;
  const buttonTitle = title || (copied ? copiedLabel : label || 'Copy to clipboard');

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      title={buttonTitle}
      aria-label={buttonTitle}
      aria-live="polite"
      className={`inline-flex items-center justify-center font-bold transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed ${
        currentSize.button
      } ${variantClass} ${isIconOnly ? '!px-2 !py-2 rounded-xl' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className={`${currentSize.icon} animate-spin`} />
      ) : copied ? (
        <Check className={`${currentSize.icon} text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-150`} />
      ) : (
        <Copy className={`${currentSize.icon} transition-transform group-hover:scale-105`} />
      )}

      {!isIconOnly && (
        <span className="truncate">
          {copied ? copiedLabel : label}
        </span>
      )}
    </button>
  );
};

export default CopyButton;
