import { useState, useEffect, useCallback, useRef } from 'react';

export interface Suggestion {
  id: string;
  displayText: string;
  [key: string]: any;
}

export function useAutocomplete<T extends Suggestion>(
  fetchSuggestions: (query: string) => Promise<T[]>,
  debounceMs = 300
) {
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestionsDebounced = useCallback(
    async (query: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!query || !query.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);
      setIsOpen(true);

      try {
        const results = await fetchSuggestions(query.trim());
        // Check if request was aborted
        if (signal.aborted) {
          return;
        }
        setSuggestions(results);
        setSelectedIndex(-1);
      } catch (error: any) {
        // Ignore abort errors
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions([]);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [fetchSuggestions]
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleQueryChange = useCallback(
    (query: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestionsDebounced(query);
      }, debounceMs);
    },
    [fetchSuggestionsDebounced, debounceMs]
  );

  const selectSuggestion = useCallback((suggestion: T | null) => {
    if (suggestion) {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return suggestion;
    }
    return null;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, onSelect?: (suggestion: T) => void) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            const selected = selectSuggestion(suggestions[selectedIndex]);
            if (selected && onSelect) {
              onSelect(selected);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, selectSuggestion]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setSuggestions([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    isOpen,
    selectedIndex,
    handleQueryChange,
    selectSuggestion,
    handleKeyDown,
    close,
    setIsOpen,
  };
}
