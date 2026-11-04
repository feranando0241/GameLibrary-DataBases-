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
    sm: 'text-xl tracking-wider',
    md: 'text-3xl tracking-wider',
    lg: 'text-5xl tracking-widest',
  };

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <span
        className={`font-display font-black text-ink leading-tight transition-colors hover:text-accent tracking-wider ${sizeClasses[size]}`}
      >
        GEEKBOND
      </span>
      {showSubtitle && (
        <span className="text-xs text-muted uppercase tracking-[0.25em] font-mono font-bold -mt-0.5">
          Game Library
        </span>
      )}
    </div>
  );
};
