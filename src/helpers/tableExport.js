import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getCellValue = (row, column) => {
  if (typeof column.getValue === 'function') {
    return normalizeValue(column.getValue(row));
  }
  return normalizeValue(row?.[column.key]);
};

const buildMatrix = (rows, columns) => {
  const headers = columns.map((column) => column.header);
  const body = (rows || []).map((row) => columns.map((column) => getCellValue(row, column)));
  return { headers, body };
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const escapeCsv = (value) => {
  const text = normalizeValue(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const copyAsTsv = async ({ headers, body }) => {
  const lines = [headers.join('\t'), ...body.map((row) => row.map(escapeCsv).join('\t'))];
  const text = lines.join('\n');
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const exportCsv = ({ headers, body, filename }) => {
  const lines = [
    headers.map(escapeCsv).join(','),
    ...body.map((row) => row.map(escapeCsv).join(','))
  ];
  const csv = lines.join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
};

const exportExcel = ({ headers, body, filename }) => {
  const aoa = [headers, ...body];
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

const exportPdf = ({ headers, body, filename, title }) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  if (title) {
    doc.setFontSize(12);
    doc.text(title, 14, 14);
  }
  autoTable(doc, {
    head: [headers],
    body,
    startY: title ? 20 : 14,
    styles: { fontSize: 8, cellPadding: 2 }
  });
  doc.save(`${filename}.pdf`);
};

const printTable = ({ headers, body, title }) => {
  const headerHtml = headers.map((h) => `<th>${h}</th>`).join('');
  const bodyHtml = body
    .map((row) => `<tr>${row.map((cell) => `<td>${normalizeValue(cell)}</td>`).join('')}</tr>`)
    .join('');
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>${title || 'Table Export'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h3 { margin: 0 0 12px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; text-align: left; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h3>${title || 'Table Export'}</h3>
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
};

export const exportTableData = async ({ type, rows = [], columns = [], filename = 'table-export', title }) => {
  const matrix = buildMatrix(rows, columns);

  switch (type) {
    case 'copy':
      await copyAsTsv(matrix);
      return;
    case 'csv':
      exportCsv({ ...matrix, filename });
      return;
    case 'excel':
      exportExcel({ ...matrix, filename });
      return;
    case 'pdf':
      exportPdf({ ...matrix, filename, title });
      return;
    case 'print':
      printTable({ ...matrix, title });
      return;
    default:
      return;
  }
};
