import { describe, expect, it } from "vitest";
import {
  calcStats,
  parseNumbers,
  populationStandardDeviation,
  populationVariance,
} from "@/tools/statistics-calculator/statistics";

// The textarea's own default value, so the numbers below are the ones a first
// visitor actually sees.
const defaultInput = [4, 7, 2, 9, 1, 5, 7, 3, 8, 6];

describe("parseNumbers", () => {
  it("splits on newlines, commas and semicolons alike", () => {
    expect(parseNumbers("4, 7; 2\n9")).toEqual([4, 7, 2, 9]);
  });

  it("drops entries that are not numbers rather than yielding NaN", () => {
    expect(parseNumbers("abc, 5")).toEqual([5]);
  });

  it("collapses runs of separators and surrounding blanks", () => {
    expect(parseNumbers(" 1 , , 2 ")).toEqual([1, 2]);
    expect(parseNumbers("")).toEqual([]);
  });
});

describe("calcStats", () => {
  it("computes mean, median and mode of a hand-checked fixture", () => {
    // sorted: 1 2 3 4 5 6 7 7 8 9 — sum 52 over 10 values, so mean 5.2;
    // the two middle values are 5 and 6, so median 5.5; only 7 repeats.
    const stats = calcStats(defaultInput)!;
    expect(stats.count).toBe(10);
    expect(stats.sum).toBe(52);
    expect(stats.mean).toBeCloseTo(5.2, 10);
    expect(stats.median).toBe(5.5);
    expect(stats.mode).toBe("7");
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(9);
    expect(stats.range).toBe(8);
  });

  it("averages the two middle values of an even-length list", () => {
    expect(calcStats([1, 2, 3, 4])!.median).toBe(2.5);
  });

  it("takes the single middle value of an odd-length list", () => {
    expect(calcStats([3, 1, 2])!.median).toBe(2);
  });

  it("divides the variance by n, not by n - 1", () => {
    // The squared deviations of the fixture sum to 63.6. Over n that is 6.36;
    // the sample variance, over n - 1, would be 7.0666…
    const stats = calcStats(defaultInput)!;
    expect(stats.variance).toBeCloseTo(6.36, 10);
    expect(stats.variance).not.toBeCloseTo(63.6 / 9, 4);
    expect(stats.stdDev).toBeCloseTo(Math.sqrt(6.36), 10);
  });

  it("reports no mode when every value occurs exactly once", () => {
    expect(calcStats([3, 1, 2])!.mode).toBe("No mode");
  });

  it("lists every value tied for the top frequency", () => {
    expect(calcStats([1, 1, 2, 2])!.mode).toBe("1, 2");
  });

  it("reports at most three modes, however many are tied", () => {
    // Four values tied at frequency two. The panel promises "up to three".
    expect(calcStats([1, 1, 2, 2, 3, 3, 4, 4])!.mode).toBe("1, 2, 3");
  });

  it("picks quartiles by index into the sorted list, without interpolating", () => {
    // sorted: 1 2 3 4 5 6 7 7 8 9 — q1 is element ⌊10/4⌋ = 2 and q3 is
    // element ⌊30/4⌋ = 7, both counted from zero. An interpolating quartile
    // would give 3.25 and 7.75 instead.
    const stats = calcStats(defaultInput)!;
    expect(stats.q1).toBe(3);
    expect(stats.q3).toBe(7);
    expect(stats.iqr).toBe(4);
  });

  it("returns null for an empty list, which is what makes the panel say to enter numbers", () => {
    expect(calcStats([])).toBeNull();
    expect(calcStats(parseNumbers(""))).toBeNull();
  });
});

describe("populationVariance and populationStandardDeviation", () => {
  it("uses n as the divisor, so the textbook eight-value set gives exactly 2", () => {
    // The standard worked example: 2 4 4 4 5 5 7 9, mean 5. Over n the standard
    // deviation is 2 exactly; over n - 1 it would be 2.1380…
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(populationVariance(values, 5)).toBe(4);
    expect(populationStandardDeviation(values, 5)).toBe(2);
  });
});
