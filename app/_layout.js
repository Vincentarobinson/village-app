import * as React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { usePreventScreenCapture } from "expo-screen-capture";
import { AppStateProvider } from "../lib/app-state";
import { C } from "../lib/theme";

export default function RootLayout() {
  /*
   * Trust & safety: screenshots and screen recordings are blocked
   * app-wide (spec §3.1 / SPEC-CHANGES §1). On iOS this blanks the
   * app in recordings and screenshots; on Android it sets FLAG_SECURE.
   */
  usePreventScreenCapture();

  return (
    <AppStateProvider>
      <StatusBar style="dark" backgroundColor={C.cream} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.cream },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="not-in-your-area" />
      </Stack>
    </AppStateProvider>
  );
}
