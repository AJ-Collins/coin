export function validateEmail(email: string): boolean {
  const trimmed = (email || '').trim();
  if (trimmed.length === 0 || trimmed.length > 255) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function validateTxHash(txHash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(txHash);
}

export function truncateString(str: string, maxLength: number): string {
  return (str || '').slice(0, maxLength);
}

export function isPositiveNumber(n: number, maxValue?: number): boolean {
  if (n <= 0 || !Number.isFinite(n)) return false;
  if (maxValue !== undefined && n > maxValue) return false;
  return true;
}

export function clampPageAndLimit(page?: string, limit?: string) {
  return {
    page: Math.max(1, parseInt(page || '1') || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit || '10') || 10)),
  };
}
