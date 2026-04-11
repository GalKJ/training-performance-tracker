import { Text, View } from "react-native";

import { useTrainingData } from "../hooks/useTrainingData";

export const WorkoutScreen = () => {
  const { exercises, liftEntries } = useTrainingData();

  return (
    <View className="flex-1 bg-mono-background px-5 pt-2">
      <View className="rounded-sm bg-mono-surface px-4 py-5">
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 0.8,
          }}
          className="text-mono-secondary"
        >
          TODAY'S SNAPSHOT
        </Text>
        <Text
          style={{
            fontFamily: "Inter_900Black",
            fontSize: 56,
            letterSpacing: -1.5,
          }}
          className="text-mono-primary"
        >
          {liftEntries.length}
        </Text>
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
          className="text-mono-secondary"
        >
          total logged lifts
        </Text>
      </View>

      <View className="mt-3 rounded-sm bg-mono-surface px-4 py-5">
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 0.8,
          }}
          className="text-mono-secondary"
        >
          EXERCISES TRACKED
        </Text>
        <Text
          style={{
            fontFamily: "Inter_900Black",
            fontSize: 42,
            letterSpacing: -1,
          }}
          className="text-mono-primary"
        >
          {exercises.length}
        </Text>
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
          className="text-mono-secondary"
        >
          all values in KG
        </Text>
      </View>
    </View>
  );
};
