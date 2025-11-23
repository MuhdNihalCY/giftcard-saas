import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseStyles = 'bg-navy-700/50 rounded';
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite] bg-gradient-to-r from-navy-700/50 via-navy-600/50 to-navy-700/50 bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-navy-800/80 backdrop-blur-sm rounded-xl shadow-luxury p-6 border border-navy-700/50">
      <Skeleton variant="rectangular" height={24} width="60%" className="mb-4" />
      <Skeleton variant="rectangular" height={40} width="40%" className="mb-4" />
      <Skeleton variant="rectangular" height={16} width="80%" className="mb-6" />
      <Skeleton variant="rectangular" height={44} width="100%" />
    </div>
  );
}

export function GiftCardSkeleton() {
  return (
    <div className="bg-navy-800/80 backdrop-blur-sm rounded-xl shadow-luxury p-6 border border-navy-700/50 luxury-overlay hover:shadow-gold-glow-sm transition-all duration-300">
      <Skeleton variant="rectangular" height={32} width="70%" className="mb-4" />
      <Skeleton variant="rectangular" height={48} width="50%" className="mb-2" />
      <Skeleton variant="rectangular" height={16} width="40%" className="mb-6" />
      <Skeleton variant="rectangular" height={48} width="100%" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton variant="rectangular" height={40} className="flex-1" />
          <Skeleton variant="rectangular" height={40} width={120} />
          <Skeleton variant="rectangular" height={40} width={120} />
        </div>
      ))}
    </div>
  );
}

