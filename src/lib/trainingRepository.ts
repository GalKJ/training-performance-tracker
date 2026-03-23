import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AddLiftEntryInput, Exercise, LiftEntry } from "../types/domain";
import { isSupabaseConfigured, supabase } from "./supabase";

type CachePayload = {
  exercises: Exercise[];
  liftEntries: LiftEntry[];
};

const CACHE_KEY = "training-performance-tracker:v1";

const demoExercises: Exercise[] = [
  { id: "ex-1", name: "Back Squat", createdAt: "2026-01-08T09:00:00.000Z" },
  { id: "ex-2", name: "Bench Press", createdAt: "2026-01-08T09:00:00.000Z" },
  { id: "ex-3", name: "Deadlift", createdAt: "2026-01-08T09:00:00.000Z" },
];

const demoLiftEntries: LiftEntry[] = [
  {
    id: "lf-1",
    exerciseId: "ex-1",
    weightKg: 145,
    reps: 3,
    performedAt: "2026-03-18T17:10:00.000Z",
  },
  {
    id: "lf-2",
    exerciseId: "ex-1",
    weightKg: 150,
    reps: 2,
    performedAt: "2026-03-21T18:20:00.000Z",
  },
  {
    id: "lf-3",
    exerciseId: "ex-2",
    weightKg: 102.5,
    reps: 4,
    performedAt: "2026-03-19T17:50:00.000Z",
  },
  {
    id: "lf-4",
    exerciseId: "ex-3",
    weightKg: 180,
    reps: 2,
    performedAt: "2026-03-22T16:30:00.000Z",
  },
];

const buildId = (prefix: string): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const parseRowDate = (value: string | null | undefined): string => {
  return value ?? new Date().toISOString();
};

const mapExerciseRow = (row: any): Exercise => ({
  id: String(row.id),
  name: String(row.name),
  createdAt: parseRowDate(row.created_at),
});

const mapLiftRow = (row: any): LiftEntry => ({
  id: String(row.id),
  exerciseId: String(row.exercise_id),
  weightKg: Number(row.weight_kg),
  reps: Number(row.reps),
  performedAt: parseRowDate(row.performed_at),
  notes: row.notes ?? null,
});

const readCache = async (): Promise<CachePayload | null> => {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CachePayload;
  } catch {
    return null;
  }
};

const writeCache = async (payload: CachePayload): Promise<void> => {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
};

const fallbackData = async (): Promise<CachePayload> => {
  const cached = await readCache();
  if (cached) {
    return cached;
  }

  const seeded = {
    exercises: demoExercises,
    liftEntries: demoLiftEntries,
  };

  await writeCache(seeded);
  return seeded;
};

const getOrCreateExerciseId = async (
  exerciseName: string,
  exercises: Exercise[],
): Promise<{ exerciseId: string; exercises: Exercise[] }> => {
  const normalizedName = exerciseName.trim().toLowerCase();
  const existingExercise = exercises.find(
    (exercise) => exercise.name.toLowerCase() === normalizedName,
  );
  if (existingExercise) {
    return { exerciseId: existingExercise.id, exercises };
  }

  const exerciseId = buildId("ex");
  const updatedExercises = [
    ...exercises,
    {
      id: exerciseId,
      name: exerciseName.trim(),
      createdAt: new Date().toISOString(),
    },
  ];

  return { exerciseId, exercises: updatedExercises };
};

export const getTrainingData = async (): Promise<CachePayload> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const [exerciseResult, liftResult] = await Promise.all([
        supabase
          .from("exercises")
          .select("*")
          .order("name", { ascending: true }),
        supabase
          .from("lift_entries")
          .select("*")
          .order("performed_at", { ascending: false }),
      ]);

      if (exerciseResult.error) {
        throw exerciseResult.error;
      }
      if (liftResult.error) {
        throw liftResult.error;
      }

      const remoteData = {
        exercises: (exerciseResult.data ?? []).map(mapExerciseRow),
        liftEntries: (liftResult.data ?? []).map(mapLiftRow),
      };

      await writeCache(remoteData);
      return remoteData;
    } catch {
      return fallbackData();
    }
  }

  return fallbackData();
};

export const addLiftEntry = async (input: AddLiftEntryInput): Promise<void> => {
  const sanitizedName = input.exerciseName.trim();
  if (!sanitizedName) {
    throw new Error("Exercise name is required.");
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const existingExerciseResult = await supabase
        .from("exercises")
        .select("*")
        .ilike("name", sanitizedName)
        .limit(1)
        .maybeSingle();

      if (existingExerciseResult.error) {
        throw existingExerciseResult.error;
      }

      let exerciseId = existingExerciseResult.data?.id as string | undefined;

      if (!exerciseId) {
        const insertExerciseResult = await supabase
          .from("exercises")
          .insert({ name: sanitizedName })
          .select("*")
          .single();

        if (insertExerciseResult.error) {
          throw insertExerciseResult.error;
        }

        exerciseId = String(insertExerciseResult.data.id);
      }

      const insertLiftResult = await supabase.from("lift_entries").insert({
        exercise_id: exerciseId,
        weight_kg: input.weightKg,
        reps: input.reps,
        performed_at: input.performedAt,
        notes: input.notes ?? null,
      });

      if (insertLiftResult.error) {
        throw insertLiftResult.error;
      }

      return;
    } catch {
      // Fall through to cache write when remote is unavailable.
    }
  }

  const snapshot = await fallbackData();
  const { exerciseId, exercises } = await getOrCreateExerciseId(
    sanitizedName,
    snapshot.exercises,
  );

  const newLiftEntry: LiftEntry = {
    id: buildId("lf"),
    exerciseId,
    weightKg: input.weightKg,
    reps: input.reps,
    performedAt: input.performedAt,
    notes: input.notes ?? null,
  };

  await writeCache({
    exercises,
    liftEntries: [newLiftEntry, ...snapshot.liftEntries],
  });
};
