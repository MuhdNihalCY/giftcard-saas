'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChartContainerProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
  onExport?: () => void;
  exportLabel?: string;
  height?: number | string;
}

export function ChartContainer({
  title,
  description,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
  children,
  className,
  onExport,
  exportLabel = 'Export',
  height = 300,
}: ChartContainerProps) {
  const chartHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <Card className={cn('hover:shadow-gold-glow-sm transition-all duration-300', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex-1">
          <CardTitle className="text-xl font-serif">{title}</CardTitle>
          {description && (
            <p className="text-sm text-plum-300 mt-1">{description}</p>
          )}
        </div>
        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="text-plum-300 hover:text-gold-400"
          >
            <Download className="w-4 h-4 mr-1" />
            {exportLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="w-full" height={chartHeight} />
          </div>
        ) : isEmpty ? (
          <div
            className="flex items-center justify-center text-plum-300"
            style={{ minHeight: chartHeight }}
          >
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div style={{ height: chartHeight }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}













