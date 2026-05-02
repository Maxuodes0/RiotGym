import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../src/theme";

const tabIcon = (name: keyof typeof Ionicons.glyphMap) =>
  function Icon({ color, size }: { color: string; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 76,
          paddingBottom: 14,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.line
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: tabIcon("home") }} />
      <Tabs.Screen name="workouts" options={{ title: "التمارين", tabBarIcon: tabIcon("barbell") }} />
      <Tabs.Screen name="nutrition" options={{ title: "التغذية", tabBarIcon: tabIcon("nutrition") }} />
      <Tabs.Screen name="progress" options={{ title: "التقدم", tabBarIcon: tabIcon("analytics") }} />
      <Tabs.Screen name="goals" options={{ title: "الأهداف", tabBarIcon: tabIcon("flag") }} />
    </Tabs>
  );
}
