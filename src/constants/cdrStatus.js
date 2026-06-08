export const CDR_CANONICAL = {
  SUBMITTED: 'SUBMITTED',
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  UNKNOWN: 'UNKNOWN',
  DELIVERED_OPERATOR: 'DELIVERED_OPERATOR',
  DELIVERED_HANDSET: 'DELIVERED_HANDSET'
};

export const CDR_STATUS_LABELS = {
  [CDR_CANONICAL.SUBMITTED]: 'Submitted',
  [CDR_CANONICAL.PENDING]: 'Pending',
  [CDR_CANONICAL.SENT]: 'Sent',
  [CDR_CANONICAL.FAILED]: 'Failed',
  [CDR_CANONICAL.UNKNOWN]: 'Unknown',
  [CDR_CANONICAL.DELIVERED_OPERATOR]: 'Delivered',
  [CDR_CANONICAL.DELIVERED_HANDSET]: 'Delivered'
};

const LEGACY_TO_LABEL = {
  SUBMITTED: CDR_STATUS_LABELS[CDR_CANONICAL.PENDING],
  DELIVRD: CDR_STATUS_LABELS[CDR_CANONICAL.DELIVERED_HANDSET],
  SUCCESS: CDR_STATUS_LABELS[CDR_CANONICAL.DELIVERED_HANDSET],
  ACCEPTD: CDR_STATUS_LABELS[CDR_CANONICAL.DELIVERED_OPERATOR],
  ESME_ROK: CDR_STATUS_LABELS[CDR_CANONICAL.SENT],
  UNDELIV: CDR_STATUS_LABELS[CDR_CANONICAL.FAILED],
  REJECTD: CDR_STATUS_LABELS[CDR_CANONICAL.FAILED],
  EXPIRED: CDR_STATUS_LABELS[CDR_CANONICAL.FAILED],
  DELETED: CDR_STATUS_LABELS[CDR_CANONICAL.FAILED],
  UNKNOWN: CDR_STATUS_LABELS[CDR_CANONICAL.UNKNOWN],
  UNKNOW: CDR_STATUS_LABELS[CDR_CANONICAL.UNKNOWN]
};

export function cdrStatusLabel(status) {
  if (status == null || status === '') return 'Unknown';
  const u = String(status).toUpperCase();
  if (CDR_STATUS_LABELS[u]) return CDR_STATUS_LABELS[u];
  if (LEGACY_TO_LABEL[u]) return LEGACY_TO_LABEL[u];
  if (u.startsWith('ESME_R')) return CDR_STATUS_LABELS[CDR_CANONICAL.FAILED];
  return String(status);
}

export function cdrStatusBadgeVariant(status) {
  const u = String(status ?? '').toUpperCase();
  if (u === CDR_CANONICAL.DELIVERED_HANDSET || u === 'DELIVRD' || u === 'SUCCESS') return { bg: 'soft-success', text: 'success' };
  if (u === CDR_CANONICAL.DELIVERED_OPERATOR || u === 'ACCEPTD') return { bg: 'soft-primary', text: 'primary' };
  if (u === CDR_CANONICAL.UNKNOWN || u === 'UNKNOW' || u === 'UNKNOWN') return { bg: 'soft-secondary', text: 'secondary' };
  if (u === CDR_CANONICAL.FAILED || u.startsWith('ESME_R') || ['UNDELIV', 'REJECTD', 'EXPIRED', 'DELETED', 'UNKNOWN'].includes(u)) {
    return { bg: 'soft-danger', text: 'danger' };
  }
  if (u === CDR_CANONICAL.SENT || u === 'ESME_ROK') return { bg: 'soft-info', text: 'info' };
  if (u === CDR_CANONICAL.SUBMITTED || u === CDR_CANONICAL.PENDING) return { bg: 'soft-warning', text: 'warning' };
  return { bg: 'soft-secondary', text: 'secondary' };
}

export function cdrStatusSolidBg(status) {
  const u = String(status ?? '').toUpperCase();
  if (u === CDR_CANONICAL.DELIVERED_HANDSET || u === 'DELIVRD' || u === 'SUCCESS') return 'success';
  if (u === CDR_CANONICAL.DELIVERED_OPERATOR || u === 'ACCEPTD') return 'primary';
  if (u === CDR_CANONICAL.UNKNOWN || u === 'UNKNOW' || u === 'UNKNOWN') return 'secondary';
  if (u === CDR_CANONICAL.FAILED || u.startsWith('ESME_R') || ['UNDELIV', 'REJECTD', 'EXPIRED', 'DELETED', 'UNKNOWN'].includes(u)) {
    return 'danger';
  }
  if (u === CDR_CANONICAL.SENT || u === 'ESME_ROK') return 'info';
  if (u === CDR_CANONICAL.SUBMITTED || u === CDR_CANONICAL.PENDING) return 'warning';
  return 'secondary';
}
