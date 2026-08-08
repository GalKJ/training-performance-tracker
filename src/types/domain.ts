export type Exercise = {
  id: string;
  name: string;
  createdAt: string;
};

export type LiftEntry = {
  id: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  performedAt: string;
  notes?: string | null;
  /** Total time for the entry, in seconds. */
  durationSeconds?: number | null;
  /** Individual split times, in seconds, in the order they were recorded. */
  splitSeconds?: number[] | null;
};

export type AddLiftEntryInput = {
  exerciseName: string;
  weightKg: number;
  reps: number;
  performedAt: string;
  notes?: string;
  durationSeconds?: number | null;
  splitSeconds?: number[] | null;
};

export type UpdateLiftEntryInput = {
  id: string;
  weightKg: number;
  reps: number;
  performedAt: string;
  notes?: string;
  durationSeconds?: number | null;
  splitSeconds?: number[] | null;
};
