import { Text, View } from "react-native";

import { useTrainingData } from "../hooks/useTrainingData";
import { isSupabaseConfigured } from "../lib/supabase";

export const ProfileScreen = () => {
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
          BACKEND MODE
        </Text>
        <Text
          style={{
            fontFamily: "Inter_900Black",
            fontSize: 24,
            letterSpacing: -0.5,
          }}
          className="mt-1 text-mono-primary"
        >
          {isSupabaseConfigured ? "SUPABASE CLOUD" : "LOCAL CACHE\nFALLBACK"}
        </Text>
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
          className="mt-2 text-mono-secondary"
        >
          Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for
          cloud sync.
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
          DATA STATUS
        </Text>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 15,
          }}
          className="mt-2 text-mono-primary"
        >
          Exercises: {exercises.length}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 15,
          }}
          className="mt-1 text-mono-primary"
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
