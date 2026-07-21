import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: string;
  showTagline?: boolean;
  taglineColor?: string;
  variant?: 'full' | 'icon-only';
}

export const TooliqueIcon: React.FC<{ className?: string; color?: string }> = ({ 
  className = "w-8 h-8", 
  color 
}) => {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Toolique Icon"
    >
      <path 
        fill={color || "currentColor"} 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M 256 104 L 336 76 L 448 136 L 396 164 L 376 200 L 396 236 L 448 264 L 320 264 L 320 344 L 340 376 L 256 448 L 172 376 L 192 344 L 192 264 L 64 264 L 116 236 L 136 200 L 116 164 L 64 136 L 176 76 Z M 242 184 L 256 164 L 270 184 L 270 344 L 242 344 Z M 256 348 L 288 366 L 288 404 L 256 422 L 224 404 L 224 366 Z"
      />
    </svg>
  );
};

export const TooliqueLogo: React.FC<LogoProps> = ({
  className = "",
  iconSize = "w-9 h-9",
  showTagline = false,
  variant = 'full'
}) => {
  if (variant === 'icon-only') {
    return <TooliqueIcon className={`${iconSize} text-[#0B3A68] dark:text-indigo-400 ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <TooliqueIcon className={`${iconSize} text-[#0B3A68] dark:text-indigo-400 shrink-0 transition-transform duration-300 group-hover:scale-105`} />
      <div className="flex flex-col justify-center">
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B3A68] dark:text-white font-['Exo_2',sans-serif] leading-none">
          toolique
        </span>
        {showTagline && (
          <span className="text-[8px] sm:text-[9.5px] font-bold tracking-[0.22em] text-[#8A99AC] dark:text-zinc-400 uppercase mt-1 leading-none">
            THE SMART UTILITY SUITE
          </span>
        )}
      </div>
    </div>
  );
};

export default TooliqueLogo;
