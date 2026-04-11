import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AddLiftEntryInput,
  Exercise,
  LiftEntry,
  UpdateLiftEntryInput,
} from "../types/domain";
import {
  addLiftEntry,
  deleteLiftEntry,
  deleteExercise,
  getTrainingData,
  updateLiftEntry,
} from "../lib/trainingRepository";

type UseTrainingDataResult = {
  exercises: Exercise[];
  liftEntries: LiftEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addEntry: (input: AddLiftEntryInput) => Promise<void>;
  updateEntry: (input: UpdateLiftEntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  deleteExerciseById: (id: string) => Promise<void>;
};

export const useTrainingData = (): UseTrainingDataResult => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [liftEntries, setLiftEntries] = useState<LiftEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const snapshot = await getTrainingData();
      setExercises(snapshot.exercises);
      setLiftEntries(snapshot.liftEntries);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Could not load training data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEntry = useCallback(
    async (input: AddLiftEntryInput) => {
      await addLiftEntry(input);
      await refresh();
    },
    [refresh],
  );

  const updateEntry = useCallback(
    async (input: UpdateLiftEntryInput) => {
      await updateLiftEntry(input);
      await refresh();
    },
    [refresh],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await deleteLiftEntry(id);
      await refresh();
    },
    [refresh],
  );

  const deleteExerciseById = useCallback(
    async (id: string) => {
      await deleteExercise(id);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh().catch(() => {
      // Refresh handles state.
    });
  }, [refresh]);

  return useMemo(
    () => ({
      exercises,
      liftEntries,
      isLoading,
      error,
      refresh,
      addEntry,
      updateEntry,
      deleteEntry,
      deleteExerciseById,
    }),
    [
      addEntry,
      deleteEntry,
      deleteExerciseById,
      error,
      exercises,
      isLoading,
      liftEntries,
      refresh,
      updateEntry,
    ],
  );
};
