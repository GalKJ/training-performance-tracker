import { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { parseDurationToSeconds } from "../lib/duration";
import { monoColors } from "../theme/mono";
import {
  parseSplitInputs,
  SplitTimesInput,
  TIME_KEYBOARD,
} from "./SplitTimesInput";

type AddLiftEntryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: {
    exerciseName: string;
    weightKg: number;
    reps: number;
    notes: string;
    durationSeconds: number | null;
    splitSeconds: number[];
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
  const [time, setTime] = useState("");
  const [splits, setSplits] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showOneRmHint, setShowOneRmHint] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const resetForm = () => {
    setExerciseName("");
    setWeightKg("");
    setReps("");
    setNotes("");
    setTime("");
    setSplits([]);
    setFormError(null);
    setShowOneRmHint(false);
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
      setFormError("Enter an exercise, a weight and a rep count.");
      return;
    }

    let durationSeconds: number | null = null;
    if (time.trim()) {
      durationSeconds = parseDurationToSeconds(time);
      if (durationSeconds === null) {
        setFormError("Time must look like 45, 2:30 or 1:05:00.");
        return;
      }
    }

    const splitSeconds = parseSplitInputs(splits);
    if (splitSeconds === null) {
      setFormError("Splits must look like 45, 2:30 or 1:05:00.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        exerciseName: effectiveName,
        weightKg: parsedWeight,
        reps: parsedReps,
        notes,
        durationSeconds,
        splitSeconds,
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
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/25">
        <ScrollView
          style={{ maxHeight: "85%" }}
          contentContainerStyle={{
            paddingBottom: keyboardHeight || 32,
            paddingHorizontal: 16,
            paddingTop: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          className="rounded-t-xl bg-mono-background"
        >
          <View className="flex-row items-center justify-between">
            <Text
              style={{ fontFamily: "Inter_800ExtraBold", fontSize: 24 }}
              className="text-mono-primary"
            >
              Add Entry
            </Text>
            <Pressable
              onPress={() => setShowOneRmHint((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel="How the estimated 1RM is calculated"
              accessibilityState={{ expanded: showOneRmHint }}
              hitSlop={8}
              className="h-7 w-7 items-center justify-center rounded-sm bg-mono-surfaceContainer"
            >
              <Text
                style={{ fontFamily: "Inter_700Bold", fontSize: 14 }}
                className="text-mono-primary"
              >
                ?
              </Text>
            </Pressable>
          </View>

          {showOneRmHint ? (
            <View className="mt-3 rounded-sm bg-mono-surface px-3 py-3">
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
                className="text-mono-secondary"
              >
                Est 1RM — Brzycki Equation
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  lineHeight: 20,
                }}
                className="mt-1 text-mono-primary"
              >
                Your estimated 1RM is calculated from single sets. Enter the
                weight and the reps you completed in one set, and save each set
                as its own entry. The estimate is most accurate when a set is
                taken close to failure at 10 reps or fewer — your best set
                drives the 1RM shown in Metrics.
              </Text>
            </View>
          ) : null}

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
              value={time}
              onChangeText={setTime}
              placeholder="Time — mm:ss (optional)"
              keyboardType={TIME_KEYBOARD}
              placeholderTextColor={monoColors.secondary}
              className="rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
              style={{ fontFamily: "Inter_500Medium" }}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={monoColors.secondary}
              className="rounded-sm bg-mono-surfaceContainer px-3 py-3 text-mono-primary"
              style={{ fontFamily: "Inter_500Medium" }}
            />
          </View>

          {/* Split times */}
          <View className="mt-5">
            <SplitTimesInput splits={splits} onChange={setSplits} />
          </View>

          {formError || error ? (
            <Text
              style={{ fontFamily: "Inter_500Medium" }}
              className="mt-3 text-mono-secondary"
            >
              {formError ?? error}
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
        </ScrollView>
      </View>
    </Modal>
  );
};
