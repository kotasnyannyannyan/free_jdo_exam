// Fisher-Yates shuffle: 統計的に偏らないシャッフル。
// `array.sort(() => 0.5 - Math.random())` はコンパレータの仕様違反で、
// エンジンによって順序が偏るため使わない。
export function shuffle<T>(array: readonly T[]): T[] {
  const result = array.slice() as T[];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
