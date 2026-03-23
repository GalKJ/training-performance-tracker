import { Text, View } from "react-native";

import { useTrainingData } from "../hooks/useTrainingData";

export const WorkoutScreen = () => {
  const { exercises, liftEntries } = useTrainingData();

  return (
    <View className="flex-1 bg-mono-background px-4 pt-4">
      <View className="rounded-sm bg-mono-surface px-4 py-4">
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 12,
            letterSpacing: 0.5,
          }}
          className="text-mono-secondary"
        >
          TODAY'S SNAPSHOT
        </Text>
        <Text
          style={{
            fontFamily: "Inter_900Black",
            fontSize: 48,
            letterSpacing: -1,
          }}
          className="text-mono-primary"
        >
          {liftEntries.length}
        </Text>
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 14 }}
          className="text-mono-secondary"
        >
          total logged lifts
        </Text>
      </View>

      <View className="mt-4 rounded-sm bg-mono-surfaceContainerLow px-4 py-4">
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 12,
            letterSpacing: 0.5,
          }}
          className="text-mono-secondary"
        >
          EXERCISES TRACKED
        </Text>
        <Text
          style={{
            fontFamily: "Inter_800ExtraBold",
            fontSize: 34,
            letterSpacing: -0.6,
          }}
          className="text-mono-primary"
        >
          {exercises.length}
        </Text>
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 14 }}
          className="text-mono-secondary"
        >
          all values in KG
        </Text>
      </View>
    </View>
  );
};
