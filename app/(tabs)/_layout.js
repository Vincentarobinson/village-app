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
        tabBarActiveTintColor: C.coral,
        tabBarInactiveTintColor: C.inactive,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#EFE9DD",
          borderTopWidth: 1.5,
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
