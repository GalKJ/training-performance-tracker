import { Text, View } from "react-native";

import { useTrainingData } from "../hooks/useTrainingData";
import { isSupabaseConfigured } from "../lib/supabase";

export const ProfileScreen = () => {
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
          BACKEND MODE
        </Text>
        <Text
          style={{ fontFamily: "Inter_800ExtraBold", fontSize: 26 }}
          className="mt-1 text-mono-primary"
        >
          {isSupabaseConfigured ? "SUPABASE CLOUD" : "LOCAL CACHE FALLBACK"}
        </Text>
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
          className="mt-2 text-mono-secondary"
        >
          Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for
          cloud sync.
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
          DATA STATUS
        </Text>
        <Text
          style={{ fontFamily: "Inter_600SemiBold", fontSize: 15 }}
          className="mt-2 text-mono-primary"
        >
          Exercises: {exercises.length}
        </Text>
        <Text
          style={{ fontFamily: "Inter_600SemiBold", fontSize: 15 }}
          className="text-mono-primary"
        >
          Lift Entries: {liftEntries.length}
        </Text>
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
          className="mt-2 text-mono-secondary"
        >
          Units locked to kilograms (KG).
        </Text>
      </View>
    </View>
  );
};
