/**
 * VajraNet Persistent Device/Operator Unique ID Utility
 * 
 * Government Format: VAJRA-GOV-[3 random uppercase letters]-[5 random digits] (e.g. VAJRA-GOV-NDR-82910)
 * Volunteer Format:  VAJRA-VOL-[3 random uppercase letters]-[5 random digits] (e.g. VAJRA-VOL-AXM-49102)
 */

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '0123456789';

function randomChars(count: number, source: string): string {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += source.charAt(Math.floor(Math.random() * source.length));
  }
  return result;
}

export function generateVajraId(role: 'GOVERNMENT' | 'VOLUNTEER' | 'CITIZEN' | string = 'GOVERNMENT'): string {
  const prefix = role.toUpperCase() === 'VOLUNTEER' ? 'VAJRA-VOL' : 'VAJRA-GOV';
  const alphaPart = randomChars(3, LETTERS);
  const digitPart = randomChars(5, DIGITS);
  return `${prefix}-${alphaPart}-${digitPart}`;
}

export function getOrCreateRoleVajraId(role: 'GOVERNMENT' | 'VOLUNTEER'): string {
  const storageKey = role === 'VOLUNTEER' ? 'vajranet_vol_id' : 'vajranet_govt_id';
  const expectedPrefix = role === 'VOLUNTEER' ? 'VAJRA-VOL' : 'VAJRA-GOV';

  try {
    let existingId = localStorage.getItem(storageKey);
    if (!existingId || !existingId.startsWith(expectedPrefix)) {
      existingId = generateVajraId(role);
      localStorage.setItem(storageKey, existingId);
    }
    return existingId;
  } catch (e) {
    return generateVajraId(role);
  }
}

export function getOrCreateVajraId(role: 'GOVERNMENT' | 'VOLUNTEER' | string = 'GOVERNMENT'): string {
  const targetRole = role === 'VOLUNTEER' ? 'VOLUNTEER' : 'GOVERNMENT';
  return getOrCreateRoleVajraId(targetRole);
}

export function isValidVajraId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const clean = id.trim().toUpperCase();
  return /^VAJRA-(GOV|VOL|USR|CIT)-[A-Z]{2,4}-\d{4,6}$/i.test(clean);
}

export function normalizeVajraId(id: string): string {
  if (!id) return '';
  return id.trim().toUpperCase();
}
