const LABELS = {
  NUMBER_NOT_FOUND_IN_CONFIG: 'No number assignment',
  UNDEFINED_NUMBER: 'Undefined number'
};

export function cdrErrorCodeLabel(code) {
  if (code == null || String(code).trim() === '') return '—';
  const key = String(code).trim();
  return LABELS[key] ?? key;
}
