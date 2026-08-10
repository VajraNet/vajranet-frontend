/**
 * VajraNet Persistent Device/User Unique ID Utility
 * 
 * Format: VAJRA-USR<3-LETTERS>-<5-DIGITS> (e.g. VAJRA-USR-DEL-89241)
 * One device / installation = One permanent Unique Vajra ID.
 */

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '0123456789';

export function generateVajraId(): string {
  let letterPart = '';
  for (let i = 0; i < 3; i++) {
    letterPart += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
  }
  let numberPart = '';
  for (let i = 0; i < 5; i++) {
    numberPart += DIGITS.charAt(Math.floor(Math.random() * DIGITS.length));
  }
  return `VAJRA-USR-${letterPart}-${numberPart}`;
}

export function getOrCreateVajraId(): string {
  try {
    let existingId = localStorage.getItem('vajranet_unique_id');
    if (!existingId || !existingId.startsWith('VAJRA-USR')) {
      existingId = generateVajraId();
      localStorage.setItem('vajranet_unique_id', existingId);
    }
    return existingId;
  } catch (e) {
    return generateVajraId();
  }
}

export function isValidVajraId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const clean = id.trim().toUpperCase();
  return /^VAJRA-USR(-?[A-Z]{2,4})?-?\d{4,6}$/i.test(clean);
}

export function normalizeVajraId(id: string): string {
  if (!id) return '';
  return id.trim().toUpperCase();
}
