export const exportCsv = (
  filename: string,
  rows: Record<string, unknown>[],
  headers?: string[],
): void => {
  if (rows.length === 0) return;
  const keys = headers ?? Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    keys.join(','),
    ...rows.map((r) => keys.map((k) => escape(r[k])).join(',')),
  ].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
};
