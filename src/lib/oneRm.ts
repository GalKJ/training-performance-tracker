import type { LiftEntry } from "../types/domain";

export const estimateOneRepMax = (weightKg: number, reps: number): number => {
  const safeReps = Math.max(1, reps);
  return weightKg * (1 + safeReps / 30);
};

export const roundToNearestHalf = (value: number): number => {
  return Math.round(value * 2) / 2;
};

export const getBestOneRepMax = (entries: LiftEntry[]): number => {
  if (entries.length === 0) {
    return 0;
  }

  return entries.reduce((maxValue, entry) => {
    const oneRm = estimateOneRepMax(entry.weightKg, entry.reps);
    return Math.max(maxValue, oneRm);
  }, 0);
};
