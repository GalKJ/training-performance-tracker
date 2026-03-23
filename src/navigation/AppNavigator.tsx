import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import { monoColors } from "../theme/mono";
import { WorkoutScreen } from "../screens/WorkoutScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { MetricsScreen } from "../screens/MetricsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export type RootTabParamList = {
  Workout: undefined;
  History: undefined;
  Metrics: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const HeaderTitle = () => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text
        style={{
          fontFamily: "Inter_900Black",
          fontSize: 24,
          letterSpacing: -0.8,
        }}
        className="text-mono-primary"
      >
        PERFORMANCE
      </Text>
    </View>
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
          tabBarStyle: {
            backgroundColor: monoColors.background,
            borderTopWidth: 0,
            height: 70,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontFamily: "Inter_700Bold",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
          },
          sceneStyle: {
            backgroundColor: monoColors.background,
          },
        }}
      >
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Metrics" component={MetricsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
