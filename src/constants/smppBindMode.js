export const SMPP_BIND_MODE_OPTIONS = [
  { id: 'transmitter', name: 'Transmitter' },
  { id: 'receiver', name: 'Receiver' },
  { id: 'transceiver', name: 'Transceiver' }
];

/** Maps legacy short codes and Jasmin phrases to canonical values for form state / API payloads. */
export function canonicalSmppBindMode(value) {
  const s = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  if (!s) return 'transceiver';
  if (s === 'tx' || s === 'bindtransmitter') return 'transmitter';
  if (s === 'rx' || s === 'bindreceiver') return 'receiver';
  if (s === 'trx' || s === 'bindtransceiver') return 'transceiver';
  if (s === 'transmitter' || s === 'receiver' || s === 'transceiver') return s;
  return 'transceiver';
}
