'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Search, X, Filter } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    onChange?: (value: string) => void;
  }>;
  onClear?: () => void;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  dateRange,
  onDateRangeChange,
  filters = [],
  onClear,
  className,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange?.(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, searchValue, onSearchChange]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
  }, []);

  const handleQuickDateRange = (days: number) => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), days));
    onDateRangeChange?.({ start, end });
  };

  const hasActiveFilters = 
    localSearch.trim() !== '' ||
    dateRange?.start !== null ||
    dateRange?.end !== null ||
    filters.some(f => f.value);

  const handleClear = () => {
    setLocalSearch('');
    onSearchChange?.('');
    onDateRangeChange?.({ start: null, end: null });
    filters.forEach(f => f.onChange?.(''));
    onClear?.();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Date Range Quick Select */}
        {onDateRangeChange && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange(7)}
              className={cn(
                dateRange?.start && 
                dateRange.start.getTime() === startOfDay(subDays(new Date(), 7)).getTime()
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-500 dark:border-cyan-500/50'
                  : ''
              )}
            >
              Last 7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange(30)}
              className={cn(
                dateRange?.start && 
                dateRange.start.getTime() === startOfDay(subDays(new Date(), 30)).getTime()
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-500 dark:border-cyan-500/50'
                  : ''
              )}
            >
              Last 30 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange(90)}
              className={cn(
                dateRange?.start && 
                dateRange.start.getTime() === startOfDay(subDays(new Date(), 90)).getTime()
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-500 dark:border-cyan-500/50'
                  : ''
              )}
            >
              Last 90 days
            </Button>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Additional Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>
          {filters
            .filter(filter => filter.options && Array.isArray(filter.options))
            .map((filter) => (
            <div key={filter.key} className="flex items-center space-x-2">
              <label className="text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {filter.label}:
              </label>
              <select
                value={filter.value || ''}
                onChange={(e) => filter.onChange?.(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Active filters:</span>
          {localSearch.trim() && (
            <span className="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded border border-cyan-200 dark:border-cyan-500/30">
              Search: {localSearch}
            </span>
          )}
          {dateRange?.start && dateRange?.end && (
            <span className="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded border border-cyan-200 dark:border-cyan-500/30">
              {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
            </span>
          )}
          {filters
            .filter(f => f.value)
            .map((filter) => {
              const option = filter.options?.find(o => o.value === filter.value);
              return (
                <span
                  key={filter.key}
                  className="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded border border-cyan-200 dark:border-cyan-500/30"
                >
                  {filter.label}: {option?.label || filter.value}
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
}

