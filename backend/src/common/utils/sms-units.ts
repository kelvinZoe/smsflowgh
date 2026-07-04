export function calculateSmsUnits(message: string): number {
  const length = message.trim().length;
  if (length === 0) {
    return 0;
  }
  return Math.ceil(length / 160);
}
