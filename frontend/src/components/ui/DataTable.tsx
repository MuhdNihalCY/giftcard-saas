'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  getRowId?: (row: T) => string | number;
  exportable?: boolean;
  onExport?: () => void;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  pagination,
  sortable = true,
  onSort,
  sortKey,
  sortDirection,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId,
  exportable = false,
  onExport,
  emptyMessage = 'No data available',
  className,
  rowClassName,
}: DataTableProps<T>) {
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set(selectedRows.map((row) => (getRowId ? getRowId(row) : row.id)))
  );

  const handleSort = (key: string) => {
    if (!sortable || !onSort) return;
    const newDirection =
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectable || !onSelectionChange || !getRowId) return;
    if (checked) {
      const allIds = new Set(data.map((row) => getRowId(row)));
      setSelectedRowIds(allIds);
      onSelectionChange(data);
    } else {
      setSelectedRowIds(new Set());
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!selectable || !onSelectionChange || !getRowId) return;
    const rowId = getRowId(row);
    const newSelected = new Set(selectedRowIds);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRowIds(newSelected);
    const selected = data.filter((row) => newSelected.has(getRowId(row)));
    onSelectionChange(selected);
  };

  const isAllSelected = useMemo(() => {
    if (!selectable || data.length === 0) return false;
    return data.every((row) => {
      const id = getRowId ? getRowId(row) : row.id;
      return selectedRowIds.has(id);
    });
  }, [data, selectedRowIds, selectable, getRowId]);

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <TableSkeleton rows={5} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Export Button */}
      {exportable && onExport && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300',
                    column.sortable && sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && sortable && sortKey === column.key && (
                      <span className="text-cyan-600 dark:text-cyan-400">
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId ? getRowId(row) : row.id;
                const isSelected = selectedRowIds.has(rowId);
                return (
                  <tr
                    key={rowId || index}
                    className={cn(
                      'border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-cyan-50 dark:bg-cyan-900/20',
                      rowClassName && rowClassName(row)
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row, e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn('px-4 py-3 text-sm text-slate-700 dark:text-slate-300', column.className)}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className="min-w-[2rem]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

