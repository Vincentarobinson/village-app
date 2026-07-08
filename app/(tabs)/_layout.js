import * as React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../lib/theme";
import { useAppState } from "../../lib/app-state";
import { registerForPush } from "../../lib/notifications";

const tabIcon =
  (name) =>
  ({ color, focused }) =>
    (
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={22}
        color={color}
      />
    );

export default function TabsLayout() {
  const { session } = useAppState();

  React.useEffect(() => {
    if (session) registerForPush();
  }, [session]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.pine,
        tabBarInactiveTintColor: C.inactive,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          shadowColor: "#1A1D1C",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
          elevation: 12,
          paddingTop: 6,
          height: 84,
        },
        sceneStyle: { backgroundColor: C.cream },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{ title: "Discover", tabBarIcon: tabIcon("people") }}
      />
      <Tabs.Screen
        name="meetups"
        options={{ title: "Meetups", tabBarIcon: tabIcon("calendar") }}
      />
      <Tabs.Screen
        name="market"
        options={{ title: "Market", tabBarIcon: tabIcon("storefront") }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: "Messages", tabBarIcon: tabIcon("chatbubble") }}
      />
      <Tabs.Screen
        name="me"
        options={{ title: "Me", tabBarIcon: tabIcon("person") }}
      />
    </Tabs>
  );
}
