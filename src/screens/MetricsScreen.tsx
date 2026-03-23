import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useTrainingData } from "../hooks/useTrainingData";
import { getBestOneRepMax, roundToNearestHalf } from "../lib/oneRm";
import type { LiftEntry } from "../types/domain";
import { monoColors } from "../theme/mono";

type MatrixCell = {
  percentage: number;
  valueKg: number;
};

const percentages = Array.from({ length: 12 }, (_, index) => 100 - index * 5);

const buildRanking = (entries: LiftEntry[]) => {
  return [...entries]
    .sort((a, b) => b.weightKg - a.weightKg)
    .slice(0, 3)
    .map((entry, index) => ({
      rank: index + 1,
      label: index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze",
      weight: entry.weightKg,
      reps: entry.reps,
    }));
};

export const MetricsScreen = () => {
  const { exercises, liftEntries, isLoading } = useTrainingData();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );

  const selectedExercise = useMemo(() => {
    if (exercises.length === 0) {
      return null;
    }

    if (!selectedExerciseId) {
      return exercises[0];
    }

    return (
      exercises.find((exercise) => exercise.id === selectedExerciseId) ??
      exercises[0]
    );
  }, [exercises, selectedExerciseId]);

  const selectedEntries = useMemo(() => {
    if (!selectedExercise) {
      return [];
    }
    return liftEntries.filter(
      (entry) => entry.exerciseId === selectedExercise.id,
    );
  }, [liftEntries, selectedExercise]);

  const bestOneRm = useMemo(
    () => getBestOneRepMax(selectedEntries),
    [selectedEntries],
  );

  const matrix = useMemo<MatrixCell[]>(() => {
    return percentages.map((percentage) => ({
      percentage,
      valueKg: roundToNearestHalf(bestOneRm * (percentage / 100)),
    }));
  }, [bestOneRm]);

  const ranking = useMemo(
    () => buildRanking(selectedEntries),
    [selectedEntries],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-mono-background">
        <ActivityIndicator color={monoColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-mono-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {exercises.map((exercise) => {
          const isActive = selectedExercise?.id === exercise.id;
          return (
            <Pressable
              key={exercise.id}
              onPress={() => setSelectedExerciseId(exercise.id)}
              className={`rounded-sm px-3 py-2 ${isActive ? "bg-mono-primary" : "bg-mono-surfaceContainer"}`}
            >
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 12,
                  letterSpacing: 0.5,
                }}
                className={isActive ? "text-white" : "text-mono-primary"}
              >
                {exercise.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="mt-5 rounded-sm bg-mono-surface px-3 py-4">
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 13,
            letterSpacing: 0.6,
          }}
          className="text-mono-secondary"
        >
          ESTIMATED 1RM
        </Text>
        <View className="mt-1 flex-row items-end gap-2">
          <Text
            style={{
              fontFamily: "Inter_900Black",
              fontSize: 54,
              letterSpacing: -1.2,
            }}
            className="text-mono-primary"
          >
            {bestOneRm ? roundToNearestHalf(bestOneRm).toFixed(1) : "0.0"}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 12,
              letterSpacing: 0.6,
            }}
            className="mb-2 text-mono-secondary"
          >
            KG
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        {ranking.map((row) => (
          <View
            key={row.rank}
            className="flex-1 rounded-sm bg-mono-surfaceContainerLow px-3 py-3"
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 11,
                letterSpacing: 0.5,
              }}
              className="text-mono-secondary"
            >
              {row.label} 0{row.rank}
            </Text>
            <Text
              style={{ fontFamily: "Inter_800ExtraBold", fontSize: 22 }}
              className="mt-1 text-mono-primary"
            >
              {row.weight} KG
            </Text>
            <Text
              style={{ fontFamily: "Inter_500Medium", fontSize: 12 }}
              className="text-mono-secondary"
            >
              {row.reps} reps
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-5 flex-row flex-wrap gap-2">
        {matrix.map((cell) => (
          <View
            key={cell.percentage}
            className="w-[31%] rounded-sm bg-mono-surfaceContainer px-3 py-3"
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 12,
                letterSpacing: 0.4,
              }}
              className="text-mono-secondary"
            >
              {cell.percentage}%
            </Text>
            <Text
              style={{ fontFamily: "Inter_800ExtraBold", fontSize: 20 }}
              className="mt-1 text-mono-primary"
            >
              {cell.valueKg.toFixed(1)}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 10,
                letterSpacing: 0.4,
              }}
              className="text-mono-secondary"
            >
              KG
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
