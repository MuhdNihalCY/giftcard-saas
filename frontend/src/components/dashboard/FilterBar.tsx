'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useAutocomplete, Suggestion } from '@/hooks/useAutocomplete';
import api from '@/lib/api';

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
  suggestionEndpoint?: string;
  onFetchSuggestions?: (query: string) => Promise<Suggestion[]>;
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
  suggestionEndpoint,
  onFetchSuggestions,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Create fetch function for autocomplete
  const fetchSuggestions = useCallback(
    async (query: string): Promise<Suggestion[]> => {
      if (onFetchSuggestions) {
        return onFetchSuggestions(query);
      }
      if (suggestionEndpoint) {
        try {
          const response = await api.get(suggestionEndpoint, {
            params: { q: query },
          });
          return response.data.data || [];
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          return [];
        }
      }
      return [];
    },
    [suggestionEndpoint, onFetchSuggestions]
  );

  // Use autocomplete hook
  const {
    suggestions,
    isLoading: isLoadingSuggestions,
    isOpen: isSuggestionsOpen,
    selectedIndex,
    handleQueryChange,
    selectSuggestion,
    handleKeyDown: handleAutocompleteKeyDown,
    close: closeSuggestions,
    setIsOpen: setSuggestionsOpen,
  } = useAutocomplete(fetchSuggestions, 300);

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (suggestionEndpoint || onFetchSuggestions) {
        handleQueryChange(value);
      }
    },
    [handleQueryChange, suggestionEndpoint, onFetchSuggestions]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: Suggestion) => {
      const searchText = suggestion.displayText || suggestion.code || suggestion.name || '';
      setLocalSearch(searchText);
      onSearchChange?.(searchText);
      closeSuggestions();
    },
    [onSearchChange, closeSuggestions]
  );

  // Debounce search input for actual search (separate from autocomplete)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange?.(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, searchValue, onSearchChange]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSuggestions();
      }
    };

    if (isSuggestionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSuggestionsOpen, closeSuggestions]);

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
        <div className="flex-1" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 z-10" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (suggestionEndpoint || onFetchSuggestions) {
                  handleAutocompleteKeyDown(e, handleSuggestionSelect);
                }
              }}
              onFocus={() => {
                if (localSearch.trim() && (suggestionEndpoint || onFetchSuggestions)) {
                  setSuggestionsOpen(true);
                }
              }}
              className="pl-10"
            />
            {/* Autocomplete Dropdown */}
            {(suggestionEndpoint || onFetchSuggestions) && isSuggestionsOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="py-1">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={suggestion.id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={cn(
                          'px-4 py-2 cursor-pointer text-sm',
                          index === selectedIndex
                            ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-100'
                            : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                        )}
                      >
                        {suggestion.displayText}
                      </li>
                    ))}
                  </ul>
                ) : localSearch.trim() ? (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                    No results found
                  </div>
                ) : null}
              </div>
            )}
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

