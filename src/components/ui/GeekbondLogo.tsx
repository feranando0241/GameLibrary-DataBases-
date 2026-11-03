import React from 'react';

interface GeekbondLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GeekbondLogo: React.FC<GeekbondLogoProps> = ({
  className = '',
  showSubtitle = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-2xl tracking-wider',
    md: 'text-3xl tracking-wider',
    lg: 'text-5xl tracking-widest',
  };

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <span
        className={`font-display font-black text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] leading-tight transition-colors hover:text-[#00FFD1] dark:hover:text-[#00FFD1] light:hover:text-[#00897B] tracking-wider ${sizeClasses[size]}`}
        style={{
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 900,
        }}
      >
        GEEKBOND
      </span>
      {showSubtitle && (
        <span className="text-[10px] text-[#00FFD1] dark:text-[#00FFD1] light:text-[#00897B] uppercase tracking-[0.25em] font-mono font-bold -mt-0.5">
          Game Library
        </span>
      )}
    </div>
  );
};
