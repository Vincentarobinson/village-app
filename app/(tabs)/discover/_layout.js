import { Stack } from "expo-router";
import { C } from "../../../lib/theme";

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.cream },
      }}
    />
  );
}
