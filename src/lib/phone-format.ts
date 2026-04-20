/** Digits only, e.g. "+49" → "49", "+1" → "1" */
export function extractDialDigits(dialCode: string): string {
  return dialCode.replace(/\D/g, '');
}

/**
 * National number as digits only, ready to append after E.164 country prefix.
 * - Strips leading trunk zeros (e.g. DE national "0151…" → "151…")
 * - Removes one duplicate country calling code if pasted into the national field (e.g. "049…" / "4915…" with +49)
 */
export function normalizeNationalSubscriberDigits(dialCode: string, nationalRaw: string): string {
  let n = nationalRaw.replace(/\D/g, '');
  while (n.startsWith('0')) {
    n = n.slice(1);
  }
  const cc = extractDialDigits(dialCode);
  if (!cc || !n) return n;
  if (cc.length >= 2 && n.startsWith(cc)) {
    return n.slice(cc.length);
  }
  // NANP +1: drop a single leading "1" only if it looks like duplicated CC (11+ digits)
  if (cc === '1' && n.startsWith('1') && n.length >= 11) {
    return n.slice(1);
  }
  return n;
}

/** dialCode like "+49" or "+380"; nationalRaw is the local input (may include spaces or pasted CC). */
export function buildInternationalPhone(dialCode: string, nationalRaw: string): string {
  const raw = dialCode.trim();
  const normalizedDial = raw.startsWith('+') ? raw : `+${extractDialDigits(raw)}`;
  const national = normalizeNationalSubscriberDigits(normalizedDial, nationalRaw);
  return `${normalizedDial}${national}`;
}
