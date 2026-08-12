import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { HistoryStackParamList } from "../navigation/AppNavigator";
import type { LiftEntry } from "../types/domain";
import { useTrainingData } from "../hooks/useTrainingData";
import { formatDuration, parseDurationToSeconds } from "../lib/duration";
import { monoColors } from "../theme/mono";
import { AddLiftEntryModal } from "../components/AddLiftEntryModal";
import {
  parseSplitInputs,
  SplitTimesInput,
  TIME_KEYBOARD,
} from "../components/SplitTimesInput";

type Props = NativeStackScreenProps<HistoryStackParamList, "ExerciseDetail">;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const describeError = (error: unknown): string => {
  return error instanceof Error ? error.message : "Something went wrong.";
};

export const ExerciseDetailScreen = ({ route, navigation }: Props) => {
  const { exerciseId, exerciseName } = route.params;
  const {
    liftEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    deleteExerciseById,
    refresh,
  } = useTrainingData();

  const entries = useMemo(
    () =>
      liftEntries
        .filter((e) => e.exerciseId === exerciseId)
        .sort(
          (a, b) =>
            new Date(b.performedAt).getTime() -
            new Date(a.performedAt).getTime(),
        ),
    [liftEntries, exerciseId],
  );

  // Action menu state
  const [selectedEntry, setSelectedEntry] = useState<LiftEntry | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editWeightKg, setEditWeightKg] = useState("");
  const [editReps, setEditReps] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editSplits, setEditSplits] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEntry = useCallback(
    async (values: {
      exerciseName: string;
      weightKg: number;
      reps: number;
      notes: string;
      durationSeconds: number | null;
      splitSeconds: number[];
      isWorkout: boolean;
    }) => {
      await addEntry({
        exerciseName: values.exerciseName,
        weightKg: values.weightKg,
        reps: values.reps,
        performedAt: new Date().toISOString(),
        notes: values.notes,
        durationSeconds: values.durationSeconds,
        splitSeconds: values.splitSeconds,
        isWorkout: values.isWorkout,
      });
      setIsAddModalOpen(false);
    },
    [addEntry],
  );

  const handleLongPress = useCallback((entry: LiftEntry) => {
    setSelectedEntry(entry);
    setIsActionMenuOpen(true);
  }, []);

  const openEditModal = useCallback(() => {
    if (!selectedEntry) return;
    setEditWeightKg(String(selectedEntry.weightKg));
    setEditReps(String(selectedEntry.reps));
    setEditNotes(selectedEntry.notes ?? "");
    setEditTime(
      selectedEntry.durationSeconds
        ? formatDuration(selectedEntry.durationSeconds)
        : "",
    );
    setEditSplits((selectedEntry.splitSeconds ?? []).map(formatDuration));
    setEditError(null);
    setIsActionMenuOpen(false);
    setIsEditModalOpen(true);
  }, [selectedEntry]);

  const submitEdit = useCallback(async () => {
    if (!selectedEntry) return;

    const parsedWeight = Number(editWeightKg);
    const parsedReps = Number(editReps);

    if (
      !Number.isFinite(parsedWeight) ||
      parsedWeight <= 0 ||
      !Number.isFinite(parsedReps) ||
      parsedReps <= 0
    ) {
      setEditError("Enter a weight and a rep count.");
      return;
    }

    let durationSeconds: number | null = null;
    if (editTime.trim()) {
      durationSeconds = parseDurationToSeconds(editTime);
      if (durationSeconds === null) {
        setEditError("Time must look like 45, 2:30 or 1:05:00.");
        return;
      }
    }

    const splitSeconds = parseSplitInputs(editSplits);
    if (splitSeconds === null) {
      setEditError("Splits must look like 45, 2:30 or 1:05:00.");
      return;
    }

    setEditError(null);
    setIsSubmitting(true);
    try {
      await updateEntry({
        id: selectedEntry.id,
        weightKg: parsedWeight,
        reps: parsedReps,
        performedAt: selectedEntry.performedAt,
        notes: editNotes || undefined,
        durationSeconds,
        splitSeconds,
      });
      setIsEditModalOpen(false);
      setSelectedEntry(null);
    } catch (submitError) {
      setEditError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update this entry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedEntry,
    editWeightKg,
    editReps,
    editNotes,
    editTime,
    editSplits,
    updateEntry,
  ]);

  const confirmDeleteEntry = useCallback(() => {
    if (!selectedEntry) return;
    setIsActionMenuOpen(false);

    Alert.alert(
      "Delete Entry",
      `Remove this ${selectedEntry.weightKg} KG × ${selectedEntry.reps} entry? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEntry(selectedEntry.id);
              setSelectedEntry(null);
            } catch (deleteError) {
              Alert.alert("Delete Failed", describeError(deleteError));
            }
          },
        },
      ],
    );
  }, [selectedEntry, deleteEntry]);

  const confirmDeleteExercise = useCallback(() => {
    Alert.alert(
      "Delete Exercise",
      `Delete "${exerciseName}" and all its entries? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExerciseById(exerciseId);
              navigation.goBack();
            } catch (deleteError) {
              Alert.alert("Delete Failed", describeError(deleteError));
            }
          },
        },
      ],
    );
  }, [exerciseId, exerciseName, deleteExerciseById, navigation]);

  const renderEntry = useCallback(
    ({ item }: { item: LiftEntry }) => (
      <Pressable
        onLongPress={() => handleLongPress(item)}
        className="rounded-sm bg-mono-surface px-3 py-3"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <View className="flex-row items-baseline gap-1">
              <Text
                style={{ fontFamily: "Inter_800ExtraBold", fontSize: 22 }}
                className="text-mono-primary"
              >
                {item.weightKg}
              </Text>
              <Text
                style={{ fontFamily: "Inter_700Bold", fontSize: 11 }}
                className="text-mono-secondary"
              >
                KG
              </Text>
            </View>
            <Text
              style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
              className="mt-0.5 text-mono-secondary"
            >
              {item.reps} {item.reps === 1 ? "rep" : "reps"}
              {item.durationSeconds
                ? ` · ${formatDuration(item.durationSeconds)}`
                : ""}
            </Text>
            {item.splitSeconds?.length ? (
              <Text
                style={{ fontFamily: "Inter_500Medium", fontSize: 11 }}
                className="mt-1 text-mono-secondary"
              >
                Splits {item.splitSeconds.map(formatDuration).join(" / ")}
              </Text>
            ) : null}
          </View>
          <View className="items-end">
            <Text
              style={{ fontFamily: "Inter_500Medium", fontSize: 12 }}
              className="text-mono-secondary"
            >
              {formatDate(item.performedAt)}
            </Text>
            {item.notes ? (
              <Text
                style={{ fontFamily: "Inter_500Medium", fontSize: 11 }}
                className="mt-0.5 text-mono-secondary"
                numberOfLines={1}
              >
                {item.notes}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    ),
    [handleLongPress],
  );

  return (
    <View className="flex-1 bg-mono-background px-5 pb-6">
      {/* Header area */}
      <View className="flex-row items-center justify-between py-3">
        <Text
          style={{
            fontFamily: "Inter_900Black",
            fontSize: 28,
            letterSpacing: -0.8,
          }}
          className="flex-1 text-mono-primary"
        >
          {exerciseName.toUpperCase()}
        </Text>
        <Pressable onPress={confirmDeleteExercise} className="px-2 py-1">
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
            className="text-mono-secondary"
          >
            Delete
          </Text>
        </Pressable>
      </View>

      {/* Entry list */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshing={false}
        onRefresh={refresh}
        contentContainerStyle={{ paddingBottom: 40, gap: 10 }}
        renderItem={renderEntry}
        ListEmptyComponent={
          <View className="rounded-sm bg-mono-surfaceContainerLow px-3 py-4">
            <Text
              style={{ fontFamily: "Inter_500Medium" }}
              className="text-mono-secondary"
            >
              No entries for this exercise yet.
            </Text>
          </View>
        }
      />

      {/* Add entry FAB */}
      <Pressable
        onPress={() => setIsAddModalOpen(true)}
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

      {/* Add entry modal */}
      <AddLiftEntryModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEntry}
        lockedExerciseName={exerciseName}
      />

      {/* Action menu modal (long-press) */}
      <Modal
        visible={isActionMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsActionMenuOpen(false)}
      >
        <Pressable
          onPress={() => setIsActionMenuOpen(false)}
          className="flex-1 justify-end bg-black/25"
        >
          <View className="rounded-t-xl bg-mono-background px-4 pb-8 pt-5">
            <Text
              style={{ fontFamily: "Inter_800ExtraBold", fontSize: 18 }}
              className="mb-4 text-mono-primary"
            >
              {selectedEntry
                ? `${selectedEntry.weightKg} KG × ${selectedEntry.reps}`
                : ""}
            </Text>

            <Pressable
              onPress={openEditModal}
              className="rounded-sm bg-mono-surfaceContainer px-3 py-3"
            >
              <Text
                style={{ fontFamily: "Inter_700Bold" }}
                className="text-center text-mono-primary"
              >
                Edit
              </Text>
            </Pressable>

            <Pressable
              onPress={confirmDeleteEntry}
              className="mt-3 rounded-sm bg-mono-surfaceContainer px-3 py-3"
            >
              <Text
                style={{ fontFamily: "Inter_700Bold" }}
                className="text-center text-mono-secondary"
              >
                Delete
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsActionMenuOpen(false)}
              className="mt-3 items-center py-2"
            >
              <Text
                style={{ fontFamily: "Inter_500Medium" }}
                className="text-mono-secondary"
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Edit modal */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/25">
          <ScrollView
            style={{ maxHeight: "85%" }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 32,
              paddingTop: 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            className="rounded-t-xl bg-mono-background"
          >
            <Text
              style={{ fontFamily: "Inter_800ExtraBold", fontSize: 24 }}
              className="text-mono-primary"
            >
              Edit Entry
            </Text>

            <View className="mt-2 rounded-sm bg-mono-surfaceContainerLow px-3 py-2">
              <Text
                style={{ fontFamily: "Inter_700Bold", fontSize: 14 }}
                className="text-mono-secondary"
              >
                {exerciseName}
              </Text>
            </View>

            <View className="mt-4 gap-3">
              <View className="flex-row gap-3">
                <TextInput
                  value={editWeightKg}
                  onChangeText={setEditWeightKg}
                  placeholder="Weight KG"
                  keyboardType="decimal-pad"
                  placeholderTextColor={monoColors.secondary}
                  className="flex-1 rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                  style={{ fontFamily: "Inter_500Medium" }}
                />
                <TextInput
                  value={editReps}
                  onChangeText={setEditReps}
                  placeholder="Reps"
                  keyboardType="number-pad"
                  placeholderTextColor={monoColors.secondary}
                  className="flex-1 rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                  style={{ fontFamily: "Inter_500Medium" }}
                />
              </View>
              <TextInput
                value={editTime}
                onChangeText={setEditTime}
                placeholder="Time — mm:ss (optional)"
                keyboardType={TIME_KEYBOARD}
                placeholderTextColor={monoColors.secondary}
                className="rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                style={{ fontFamily: "Inter_500Medium" }}
              />
              <TextInput
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Notes (optional)"
                placeholderTextColor={monoColors.secondary}
                className="rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                style={{ fontFamily: "Inter_500Medium" }}
              />
            </View>

            <View className="mt-5">
              <SplitTimesInput splits={editSplits} onChange={setEditSplits} />
            </View>

            {editError ? (
              <Text
                style={{ fontFamily: "Inter_500Medium" }}
                className="mt-3 text-mono-secondary"
              >
                {editError}
              </Text>
            ) : null}

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => {
                  setIsEditModalOpen(false);
                  setSelectedEntry(null);
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
                onPress={submitEdit}
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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
