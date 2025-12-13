'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  formatValue?: (value: number) => string;
}

export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  isLoading = false,
  onClick,
  className,
  formatValue,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('hover:shadow-cyan-glow transition-all duration-300', className)}>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  const displayValue = typeof value === 'number' && formatValue ? formatValue(value) : value;

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-600';
    if (trend.value < 0) return 'text-red-600';
    return 'text-slate-400';
  };

  return (
      <Card
        className={cn(
          'hover:shadow-cyan-glow transition-all duration-300',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        {Icon && (
          <div className="p-2 rounded-lg bg-cyan-100">
            <Icon className="w-4 h-4 text-cyan-600" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-3xl font-serif font-bold bg-cyan-gradient bg-clip-text text-transparent">
            {displayValue}
          </p>
          {trend && (
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon()}
              <span className={cn('font-medium', getTrendColor())}>
                {trend.value > 0 ? '+' : ''}
                {trend.value.toFixed(1)}%
              </span>
              <span className="text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}













