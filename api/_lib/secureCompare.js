import crypto from 'crypto';

function firstValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return value ?? '';
}

export function timingSafeEqualString(value, expected) {
  const left = String(firstValue(value));
  const right = String(firstValue(expected));
  if (!left || !right) return false;

  const leftHash = crypto.createHash('sha256').update(left).digest();
  const rightHash = crypto.createHash('sha256').update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash) && left.length === right.length;
}

export function anyTimingSafeMatch(values, expected) {
  return values.some((value) => timingSafeEqualString(value, expected));
}
