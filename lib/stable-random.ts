export function hashStringToUnitInterval(input: string) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Convert to [0,1)
  return (h >>> 0) / 2 ** 32;
}

export function stableRandomBetween(input: string, min: number, max: number) {
  const t = hashStringToUnitInterval(input);
  return min + (max - min) * t;
}

