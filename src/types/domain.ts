export type Exercise = {
  id: string;
  name: string;
  /** True when the exercise is a WOD rather than a straight lift. */
  isWorkout: boolean;
  createdAt: string;
};

/** The two buckets the History and Metrics screens split exercises into. */
export type ExerciseCategory = "lift" | "wod";

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
  /** When true, flags the entry's exercise as a WOD. */
  isWorkout?: boolean;
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
