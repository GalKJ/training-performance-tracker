import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { monoColors } from "../theme/mono";

type AddLiftEntryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: {
    exerciseName: string;
    weightKg: number;
    reps: number;
    notes: string;
  }) => Promise<void>;
  // When provided, the exercise field is locked to this value and shown as a label.
  lockedExerciseName?: string;
  error?: string | null;
};

export const AddLiftEntryModal = ({
  visible,
  onClose,
  onSubmit,
  lockedExerciseName,
  error,
}: AddLiftEntryModalProps) => {
  const [exerciseName, setExerciseName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setExerciseName("");
    setWeightKg("");
    setReps("");
    setNotes("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async () => {
    const effectiveName = lockedExerciseName ?? exerciseName;
    const parsedWeight = Number(weightKg);
    const parsedReps = Number(reps);

    if (
      !effectiveName.trim() ||
      !Number.isFinite(parsedWeight) ||
      parsedWeight <= 0 ||
      !Number.isFinite(parsedReps) ||
      parsedReps <= 0
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        exerciseName: effectiveName,
        weightKg: parsedWeight,
        reps: parsedReps,
        notes,
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/25">
        <View className="rounded-t-xl bg-mono-background px-4 pb-8 pt-5">
          <Text
            style={{ fontFamily: "Inter_800ExtraBold", fontSize: 24 }}
            className="text-mono-primary"
          >
            Add Lift Entry
          </Text>

          {lockedExerciseName ? (
            <View className="mt-2 rounded-sm bg-mono-surfaceContainerLow px-3 py-2">
              <Text
                style={{ fontFamily: "Inter_700Bold", fontSize: 14 }}
                className="text-mono-secondary"
              >
                {lockedExerciseName}
              </Text>
            </View>
          ) : null}

          <View className="mt-4 gap-3">
            {!lockedExerciseName ? (
              <TextInput
                value={exerciseName}
                onChangeText={setExerciseName}
                placeholder="Exercise"
                placeholderTextColor={monoColors.secondary}
                className="rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
                style={{ fontFamily: "Inter_500Medium" }}
              />
            ) : null}
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

          {error ? (
            <Text
              style={{ fontFamily: "Inter_500Medium" }}
              className="mt-3 text-mono-secondary"
            >
              {error}
            </Text>
          ) : null}

          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={handleClose}
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
              onPress={handleSubmit}
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
  );
};
