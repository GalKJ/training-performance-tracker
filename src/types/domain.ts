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
};

export type AddLiftEntryInput = {
  exerciseName: string;
  weightKg: number;
  reps: number;
  performedAt: string;
  notes?: string;
};

export type UpdateLiftEntryInput = {
  id: string;
  weightKg: number;
  reps: number;
  performedAt: string;
  notes?: string;
};
