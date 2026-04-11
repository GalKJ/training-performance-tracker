import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { HistoryStackParamList } from "../navigation/AppNavigator";
import { useTrainingData } from "../hooks/useTrainingData";
import { monoColors } from "../theme/mono";

type ExerciseSummary = {
  id: string;
  name: string;
  maxWeightKg: number;
  lastSessionDate: string;
};

const formatShortDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString();
};

export const HistoryScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const { exercises, liftEntries, isLoading, error, addEntry, refresh } =
    useTrainingData();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exerciseSummaries = useMemo<ExerciseSummary[]>(() => {
    return exercises
      .map((exercise) => {
        const entries = liftEntries.filter(
          (entry) => entry.exerciseId === exercise.id,
        );
        if (entries.length === 0) {
          return {
            id: exercise.id,
            name: exercise.name,
            maxWeightKg: 0,
            lastSessionDate: "No entries",
          };
        }

        const maxWeightKg = Math.max(...entries.map((entry) => entry.weightKg));
        const latestDate = entries
          .map((entry) => entry.performedAt)
          .sort((a, b) =>
            new Date(a).getTime() > new Date(b).getTime() ? -1 : 1,
          )[0];

        return {
          id: exercise.id,
          name: exercise.name,
          maxWeightKg,
          lastSessionDate: formatShortDate(latestDate),
        };
      })
      .filter((summary) =>
        summary.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, liftEntries, query]);

  const resetForm = () => {
    setExerciseName("");
    setWeightKg("");
    setReps("");
    setNotes("");
  };

  const submitEntry = async () => {
    const parsedWeight = Number(weightKg);
    const parsedReps = Number(reps);

    if (
      !exerciseName.trim() ||
      !Number.isFinite(parsedWeight) ||
      parsedWeight <= 0 ||
      !Number.isFinite(parsedReps) ||
      parsedReps <= 0
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addEntry({
        exerciseName,
        weightKg: parsedWeight,
        reps: parsedReps,
        performedAt: new Date().toISOString(),
        notes,
      });
      setIsModalOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-mono-background px-5 pb-6">
      <Text
        style={{
          fontFamily: "Inter_900Black",
          fontSize: 32,
          letterSpacing: -0.8,
        }}
        className="mt-2 text-mono-primary"
      >
        EXERCISE{"\n"}HISTORY
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search exercises"
        placeholderTextColor={monoColors.secondary}
        style={{ fontFamily: "Inter_500Medium", fontSize: 14 }}
        className="mt-4 rounded-sm bg-mono-surfaceContainer px-4 py-3 text-mono-primary"
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={monoColors.primary} />
        </View>
      ) : (
        <FlatList
          data={exerciseSummaries}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={refresh}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 110,
            gap: 10,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("ExerciseDetail", {
                  exerciseId: item.id,
                  exerciseName: item.name,
                })
              }
              className="rounded-sm bg-mono-surface px-4 py-4"
            >
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 16,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                  }}
                  className="flex-1 text-mono-primary"
                >
                  {item.name}
                </Text>
                <View className="items-end">
                  <Text
                    style={{
                      fontFamily: "Inter_900Black",
                      fontSize: 28,
                      letterSpacing: -0.6,
                    }}
                    className="text-mono-primary"
                  >
                    {item.maxWeightKg > 0
                      ? `${item.maxWeightKg}`
                      : "--"}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 10,
                      letterSpacing: 0.5,
                    }}
                    className="-mt-1 text-mono-secondary"
                  >
                    KG
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="rounded-sm bg-mono-surfaceContainerLow px-4 py-4">
              <Text
                style={{ fontFamily: "Inter_500Medium" }}
                className="text-mono-secondary"
              >
                No exercises match your search.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => setIsModalOpen(true)}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-sm bg-mono-primary"
        style={{
          elevation: 4,
        }}
      >
        <Text
          style={{ fontFamily: "Inter_900Black", fontSize: 30, lineHeight: 32 }}
          className="text-white"
        >
          +
        </Text>
      </Pressable>

      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/25">
          <View className="rounded-t-xl bg-mono-background px-4 pb-8 pt-5">
            <Text
              style={{ fontFamily: "Inter_800ExtraBold", fontSize: 24 }}
              className="text-mono-primary"
            >
              Add Lift Entry
            </Text>
            <View className="mt-4 gap-3">
              <TextInput
                value={exerciseName}
                onChangeText={setExerciseName}
                placeholder="Exercise"
                placeholderTextColor={monoColors.secondary}
                className="rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                style={{ fontFamily: "Inter_500Medium" }}
              />
              <View className="flex-row gap-3">
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="Weight KG"
                  keyboardType="decimal-pad"
                  placeholderTextColor={monoColors.secondary}
                  className="flex-1 rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                  style={{ fontFamily: "Inter_500Medium" }}
                />
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  placeholder="Reps"
                  keyboardType="number-pad"
                  placeholderTextColor={monoColors.secondary}
                  className="flex-1 rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                  style={{ fontFamily: "Inter_500Medium" }}
                />
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes (optional)"
                placeholderTextColor={monoColors.secondary}
                className="rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                style={{ fontFamily: "Inter_500Medium" }}
              />
            </View>

            {!!error && (
              <Text
                style={{ fontFamily: "Inter_500Medium" }}
                className="mt-3 text-mono-secondary"
              >
                {error}
              </Text>
            )}

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1 items-center justify-center rounded-sm bg-mono-surfaceContainer py-3"
              >
                <Text
                  style={{ fontFamily: "Inter_700Bold" }}
                  className="text-mono-primary"
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={submitEntry}
                disabled={isSubmitting}
                className="flex-1 items-center justify-center rounded-sm bg-mono-primary py-3"
              >
                <Text
                  style={{ fontFamily: "Inter_700Bold" }}
                  className="text-white"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
