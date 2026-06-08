import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportRowsByType = async ({ type, title, filenamePrefix, columns, rows, pdfOptions = {} }) => {
  if (!Array.isArray(columns) || !Array.isArray(rows)) return;
  const safeRows = rows.map((row) => {
    const out = {};
    columns.forEach((col) => {
      const value = row?.[col];
      out[col] = value == null || value === '' ? '-' : String(value);
    });
    return out;
  });

  if (type === 'copy') {
    const lines = [columns.join('\t')];
    safeRows.forEach((row) => {
      lines.push(columns.map((col) => row[col] ?? '-').join('\t'));
    });
    await navigator.clipboard.writeText(lines.join('\n'));
    return;
  }

  if (type === 'csv') {
    const sheet = XLSX.utils.json_to_sheet(safeRows, { header: columns });
    const csv = XLSX.utils.sheet_to_csv(sheet);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filenamePrefix}-${Date.now()}.csv`);
    return;
  }

  if (type === 'excel') {
    const sheet = XLSX.utils.json_to_sheet(safeRows, { header: columns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, title || 'Export');
    XLSX.writeFile(wb, `${filenamePrefix}-${Date.now()}.xlsx`);
    return;
  }

  if (type === 'pdf') {
    const pdfColumns = Array.isArray(pdfOptions.columns) && pdfOptions.columns.length ? pdfOptions.columns : columns;
    const pdfRowsBase = typeof pdfOptions.mapRow === 'function'
      ? safeRows.map((row) => pdfOptions.mapRow({ ...row }))
      : safeRows;
    const pdfRows = pdfRowsBase.map((row) => {
      const out = {};
      pdfColumns.forEach((col) => {
        out[col] = row?.[col] ?? '-';
      });
      return out;
    });
    const doc = new jsPDF({
      orientation: pdfOptions.orientation || 'landscape',
      unit: 'pt',
      format: pdfOptions.format || 'a4'
    });
    doc.setFontSize(12);
    doc.text(title || 'Export', 40, 30);
    autoTable(doc, {
      head: [pdfColumns],
      body: pdfRows.map((row) => pdfColumns.map((col) => row[col] ?? '-')),
      startY: 44,
      theme: 'grid',
      margin: { left: 20, right: 20, top: 44, bottom: 28 },
      styles: {
        fontSize: pdfOptions.fontSize || 8,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        overflow: 'linebreak',
        cellPadding: 3
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: pdfOptions.headerFontSize || (pdfOptions.fontSize || 8)
      },
      columnStyles: pdfOptions.columnStyles || {},
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 12);
      }
    });
    doc.save(`${filenamePrefix}-${Date.now()}.pdf`);
    return;
  }

  if (type === 'print') {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) return;
    const header = `<tr>${columns.map((col) => `<th style="border:1px solid #ddd;padding:6px;text-align:left;">${col}</th>`).join('')}</tr>`;
    const body = safeRows
      .map((row) => `<tr>${columns.map((col) => `<td style="border:1px solid #ddd;padding:6px;">${row[col] ?? '-'}</td>`).join('')}</tr>`)
      .join('');
    printWindow.document.write(`<!doctype html><html><head><title>${title || 'Export'}</title></head><body style="font-family:Arial,sans-serif;">
      <h3>${title || 'Export'}</h3><table style="border-collapse:collapse;width:100%;font-size:12px;">${header}${body}</table>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};
