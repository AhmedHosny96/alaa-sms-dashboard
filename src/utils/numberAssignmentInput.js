export function normalizeMsisdnDigits(value) {
  if (value == null || typeof value !== 'string') return null;
  const trimmed = String(value).trim().replace(/^\+/, '').replace(/\D/g, '');
  if (!trimmed) return null;
  return trimmed;
}

export function dedupeMsisdnsPreserveOrder(list) {
  const seen = new Set();
  const out = [];
  for (const n of list || []) {
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function splitCsvCells(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ',') {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

function looksLikeHeader(cell) {
  if (!cell) return false;
  return /number|msisdn|phone|mobile|e\.164|subscriber/i.test(cell);
}

function looksLikeMsisdnCell(cell) {
  const n = normalizeMsisdnDigits(cell);
  return !!(n && n.length >= 7);
}

export function extractNumbersFromFreeText(value) {
  if (!value) return [];
  const parts = String(value)
    .split(/[\s,|;]+|[\r\n]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const normalized = [];
  for (const p of parts) {
    const n = normalizeMsisdnDigits(p);
    if (n) normalized.push(n);
  }
  return dedupeMsisdnsPreserveOrder(normalized);
}

export function extractNumbersFromCsvText(csvText) {
  if (!csvText) return [];
  const text = String(csvText).replace(/^\uFEFF/, '');
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (!rawLines.length) return [];

  let startIdx = 0;
  const firstCells = splitCsvCells(rawLines[0]);
  const firstRowHasMsisdn = firstCells.some(looksLikeMsisdnCell);
  if (
    !firstRowHasMsisdn &&
    (looksLikeHeader(firstCells[0] || '') ||
      /\b(status|provider|country|title|name)\b/i.test(rawLines[0]))
  ) {
    startIdx = 1;
  }

  const normalized = [];
  for (let i = startIdx; i < rawLines.length; i++) {
    const cells = splitCsvCells(rawLines[i]).filter((c) => c.length > 0);
    for (const cell of cells) {
      const n = normalizeMsisdnDigits(cell);
      if (n) {
        normalized.push(n);
        break;
      }
    }
  }
  return dedupeMsisdnsPreserveOrder(normalized);
}

export function formatAssignedNumber(row) {
  if (!row) return '—';
  if (row.msisdn) return row.msisdn;
  if (row.number) return row.number;
  if (row.rangeStart != null && row.rangeEnd != null && String(row.rangeStart) !== '' && String(row.rangeEnd) !== '') {
    return `${row.rangeStart}–${row.rangeEnd}`;
  }
  return '—';
}
