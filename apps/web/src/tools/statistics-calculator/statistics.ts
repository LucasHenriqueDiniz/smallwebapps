export function parseNumbers(text: string): number[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

// Divided by n, not n - 1. The names say population because that is the only
// thing separating these two from their sample counterparts, and a caller
// reading "variance" alone has no way to tell which one it got.
export function populationVariance(values: number[], mean: number): number {
  return values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
}

export function populationStandardDeviation(values: number[], mean: number): number {
  return Math.sqrt(populationVariance(values, mean));
}

export function calcStats(nums: number[]) {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  const freqMap: Record<number, number> = {};
  for (const v of sorted) freqMap[v] = (freqMap[v] ?? 0) + 1;
  const maxFreq = Math.max(...Object.values(freqMap));
  const modes = Object.entries(freqMap).filter(([, f]) => f === maxFreq).map(([v]) => Number(v));

  const variance = populationVariance(sorted, mean);
  const stdDev = populationStandardDeviation(sorted, mean);

  const q1 = sorted[Math.floor(n / 4)];
  const q3 = sorted[Math.floor((3 * n) / 4)];

  // The keys are what the Copy button writes out verbatim, so they are the
  // component's rendered contract and are left as they are.
  return {
    count: n,
    sum,
    mean,
    median,
    mode: modes.length === n ? "No mode" : modes.slice(0, 3).join(", "),
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    variance,
    stdDev,
    q1,
    q3,
    iqr: q3 - q1,
  };
}
