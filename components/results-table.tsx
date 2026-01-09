'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ResultsTableProps {
  data: any[];
  scenarioName?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function ResultsTable({ data, scenarioName }: ResultsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const columns = useMemo(() => {
    if (!data || data?.length === 0) return [];
    const allKeys = new Set<string>();
    data?.forEach((row) => {
      Object.keys(row ?? {})?.forEach((key) => allKeys.add(key));
    });
    return Array.from(allKeys);
  }, [data]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...(data ?? [])]?.sort((a, b) => {
      const aVal = getNestedValue(a, sortColumn);
      const bVal = getNestedValue(b, sortColumn);

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const flattenedData = sortedData?.map((row) => flattenObject(row));
    const filename = `${scenarioName ?? 'xero-query'}-${new Date().toISOString().split('T')?.[0]}.csv`;
    exportToCSV(flattenedData, filename);
  };

  if (!data || data?.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No data to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedData?.length ?? 0} {sortedData?.length === 1 ? 'result' : 'results'}
        </p>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns?.map((column) => (
                <TableHead key={column} className="font-semibold">
                  <button
                    onClick={() => handleSort(column)}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    {formatColumnName(column)}
                    {sortColumn === column ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData?.map((row, idx) => (
              <TableRow key={idx}>
                {columns?.map((column) => (
                  <TableCell key={column}>
                    {formatCellValue(getNestedValue(row, column))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return null;
  
  const parts = path?.split('.');
  let value = obj;
  
  for (const part of parts ?? []) {
    if (value?.[part] === undefined || value?.[part] === null) {
      return null;
    }
    value = value?.[part];
  }
  
  return value;
}

function formatColumnName(column: string): string {
  return column
    ?.replace(/([A-Z])/g, ' $1')
    ?.replace(/^./, (str) => str?.toUpperCase())
    ?.trim();
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '-';
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'object') {
    if (value?.Name) return value?.Name;
    return JSON.stringify(value);
  }
  
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      // Use ISO date format to avoid hydration issues with locale-specific formatting
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return value;
    }
  }
  
  if (typeof value === 'number') {
    // Check if it's an integer - display without decimals
    if (Number.isInteger(value)) {
      return value.toString();
    }
    // For decimal numbers, use consistent formatting to avoid hydration issues
    if (Math.abs(value) >= 0.01) {
      return value.toFixed(2);
    }
  }
  
  return String(value);
}

function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {};
  
  Object.entries(obj ?? {})?.forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });
  
  return flattened;
}
