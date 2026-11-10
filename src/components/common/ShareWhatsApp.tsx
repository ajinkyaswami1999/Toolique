import React from 'react';
import { MessageCircle } from 'lucide-react';

export type WhatsAppButtonVariant = 'solid' | 'outline' | 'pill';
export type WhatsAppButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ShareWhatsAppProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Formatted message string to share, or a function resolving it */
  text: string | (() => string);
  /** Optional recipient phone number in international format (e.g. "919876543210") */
  phone?: string;
  /** Button label */
  label?: string;
  /** Force icon-only rendering */
  iconOnly?: boolean;
  /** Visual presentation variant */
  variant?: WhatsAppButtonVariant;
  /** Button sizing */
  size?: WhatsAppButtonSize;
  /** Optional callback invoked prior to opening WhatsApp */
  onClick?: () => void;
}

const SIZE_STYLES: Record<WhatsAppButtonSize, { button: string; icon: string }> = {
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

const VARIANT_STYLES: Record<WhatsAppButtonVariant, string> = {
  solid: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm',
  outline: 'border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
  pill: 'rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
};

export const ShareWhatsApp: React.FC<ShareWhatsAppProps> = ({
  text,
  phone,
  label = 'Share Requisition',
  iconOnly = false,
  variant = 'solid',
  size = 'sm',
  className = '',
  onClick,
  title,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.();

    const rawMessage = typeof text === 'function' ? text() : text;
    const encodedMessage = encodeURIComponent(rawMessage.trim());

    // Sanitize phone number if provided (remove spaces, dashes, +, parentheses)
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const currentSize = SIZE_STYLES[size];
  const variantClass = VARIANT_STYLES[variant];
  const isIconOnly = iconOnly || !label;
  const buttonTitle = title || label || 'Share on WhatsApp';

  return (
    <button
      type="button"
      onClick={handleClick}
      title={buttonTitle}
      aria-label={buttonTitle}
      className={`inline-flex items-center justify-center font-bold transition-all select-none hover:shadow-md cursor-pointer ${
        currentSize.button
      } ${variantClass} ${isIconOnly ? '!px-2 !py-2 rounded-xl' : ''} ${className}`}
      {...rest}
    >
      <MessageCircle className={`${currentSize.icon} shrink-0`} />
      {!isIconOnly && <span className="truncate">{label}</span>}
    </button>
  );
};

export default ShareWhatsApp;
