import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { monoColors } from "../theme/mono";
import { WorkoutScreen } from "../screens/WorkoutScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { ExerciseDetailScreen } from "../screens/ExerciseDetailScreen";
import { MetricsScreen } from "../screens/MetricsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export type HistoryStackParamList = {
  HistoryList: undefined;
  ExerciseDetail: { exerciseId: string; exerciseName: string };
};

export type RootTabParamList = {
  Workout: undefined;
  History: undefined;
  Metrics: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

const HeaderTitle = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-mono-background px-5 pb-3 pt-3"
    >
      <Text
        style={{
          fontFamily: "Inter_900Black",
          fontSize: 28,
          letterSpacing: -1,
        }}
        className="text-mono-primary"
      >
        TRAINING TRACKER
      </Text>
    </View>
  );
};

const HistoryStackNavigator = () => {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: monoColors.background },
        headerStyle: { backgroundColor: monoColors.background },
        headerShadowVisible: false,
        headerTintColor: monoColors.primary,
      }}
    >
      <HistoryStack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <HistoryStack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={({ route }) => ({
          header: () => <HeaderTitle />,
          headerShown: true,
          title: route.params.exerciseName,
          headerStyle: { backgroundColor: monoColors.background },
          headerTintColor: monoColors.primary,
          headerTitleStyle: {
            fontFamily: "Inter_700Bold",
            fontSize: 18,
            letterSpacing: -0.5,
          },
          headerShadowVisible: false,
        })}
      />
    </HistoryStack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="History"
        screenOptions={{
          header: () => <HeaderTitle />,
          tabBarActiveTintColor: monoColors.primary,
          tabBarInactiveTintColor: monoColors.secondary,
          tabBarIcon: () => null,
          tabBarIconStyle: { display: "none" },
          tabBarStyle: {
            backgroundColor: monoColors.background,
            borderTopWidth: 1,
            borderTopColor: monoColors.surfaceContainer,
            height: 56,
            paddingTop: 10,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 1.2,
          },
          sceneStyle: {
            backgroundColor: monoColors.background,
          },
        }}
      >
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        <Tab.Screen name="History" component={HistoryStackNavigator} />
        <Tab.Screen name="Metrics" component={MetricsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
