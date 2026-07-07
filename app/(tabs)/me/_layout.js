import { Stack } from "expo-router";
import { C } from "../../../lib/theme";

export default function MeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.cream },
      }}
    />
  );
}
