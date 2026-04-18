import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AddLiftEntryInput,
  Exercise,
  LiftEntry,
  UpdateLiftEntryInput,
} from "../types/domain";
import { isSupabaseConfigured, supabase } from "./supabase";

type CachePayload = {
  exercises: Exercise[];
  liftEntries: LiftEntry[];
};

const CACHE_KEY = "training-performance-tracker:v1";

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

  const seeded: CachePayload = {
    exercises: [],
    liftEntries: [],
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

export const updateLiftEntry = async (
  input: UpdateLiftEntryInput,
): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const result = await supabase
        .from("lift_entries")
        .update({
          weight_kg: input.weightKg,
          reps: input.reps,
          performed_at: input.performedAt,
          notes: input.notes ?? null,
        })
        .eq("id", input.id);

      if (result.error) {
        throw result.error;
      }

      return;
    } catch {
      // Fall through to cache write when remote is unavailable.
    }
  }

  const snapshot = await fallbackData();
  const updatedEntries = snapshot.liftEntries.map((entry) =>
    entry.id === input.id
      ? {
          ...entry,
          weightKg: input.weightKg,
          reps: input.reps,
          performedAt: input.performedAt,
          notes: input.notes ?? null,
        }
      : entry,
  );

  await writeCache({ exercises: snapshot.exercises, liftEntries: updatedEntries });
};

export const deleteLiftEntry = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const result = await supabase
        .from("lift_entries")
        .delete()
        .eq("id", id);

      if (result.error) {
        throw result.error;
      }

      return;
    } catch {
      // Fall through to cache write when remote is unavailable.
    }
  }

  const snapshot = await fallbackData();
  const updatedEntries = snapshot.liftEntries.filter(
    (entry) => entry.id !== id,
  );

  await writeCache({ exercises: snapshot.exercises, liftEntries: updatedEntries });
};

export const deleteExercise = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const entriesResult = await supabase
        .from("lift_entries")
        .delete()
        .eq("exercise_id", id);

      if (entriesResult.error) {
        throw entriesResult.error;
      }

      const exerciseResult = await supabase
        .from("exercises")
        .delete()
        .eq("id", id);

      if (exerciseResult.error) {
        throw exerciseResult.error;
      }

      return;
    } catch {
      // Fall through to cache write when remote is unavailable.
    }
  }

  const snapshot = await fallbackData();
  const updatedEntries = snapshot.liftEntries.filter(
    (entry) => entry.exerciseId !== id,
  );
  const updatedExercises = snapshot.exercises.filter(
    (exercise) => exercise.id !== id,
  );

  await writeCache({ exercises: updatedExercises, liftEntries: updatedEntries });
};
