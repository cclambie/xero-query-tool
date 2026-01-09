export function exportToCSV(data: any[], filename: string): void {
  if (!data || data?.length === 0) {
    alert('No data to export');
    return;
  }

  const allKeys = new Set<string>();
  data?.forEach((row) => {
    Object.keys(row ?? {})?.forEach((key) => allKeys.add(key));
  });
  const headers = Array.from(allKeys);

  const csvRows: string[] = [];
  
  csvRows.push(headers?.map((h) => escapeCSVValue(h))?.join(','));
  
  data?.forEach((row) => {
    const values = headers?.map((header) => {
      const value = row?.[header];
      return escapeCSVValue(formatValue(value));
    });
    csvRows.push(values?.join(','));
  });

  const csvContent = csvRows?.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link?.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function escapeCSVValue(value: string): string {
  if (value?.includes(',') || value?.includes('"') || value?.includes('\n')) {
    return `"${value?.replace(/"/g, '""')}"`;
  }
  return value ?? '';
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
