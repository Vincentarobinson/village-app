import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, H1, Sub, Card } from "../../components/ui";
import { useAppState } from "../../lib/app-state";
import { C } from "../../lib/theme";

/*
 * ID VERIFICATION GATE — currently STUBBED.
 *
 * Production flow (docs/INTEGRATIONS.md):
 *  1. Backend creates a Stripe Identity VerificationSession
 *  2. App opens the hosted verification flow (ID photo + selfie)
 *  3. Webhook flips users.id_verified_at
 * Nobody can view profiles or message until verified.
 */
export default function VerifyIdentity() {
  const router = useRouter();
  const { setVerified } = useAppState();
  const [state, setState] = React.useState("intro"); // intro | checking | done

  function startVerification() {
    setState("checking");
    // STUB: replace with Stripe Identity hosted flow
    setTimeout(() => {
      setVerified(true);
      setState("done");
    }, 1500);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
      <View style={styles.wrap}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={state === "done" ? "shield-checkmark" : "shield-half-outline"}
            size={34}
            color={C.pine}
          />
        </View>

        {state === "done" ? (
          <>
            <H1 style={styles.center}>You&apos;re verified</H1>
            <Sub style={styles.centerSub}>
              Thanks for keeping Village safe. Let&apos;s set up your profile.
            </Sub>
            <Button
              title="Set up my profile"
              style={{ marginTop: 28 }}
              onPress={() => router.push("/(onboarding)/profile-setup")}
            />
          </>
        ) : (
          <>
            <H1 style={styles.center}>Verify your identity</H1>
            <Sub style={styles.centerSub}>
              Every member verifies with a government ID before seeing any
              profiles. It takes about two minutes and keeps Village a
              parents-only space.
            </Sub>

            <Card style={{ marginTop: 24 }}>
              {[
                ["camera-outline", "Photograph your government ID"],
                ["happy-outline", "Take a quick selfie"],
                ["lock-closed-outline", "Handled by a secure partner — we never store your documents"],
              ].map(([icon, label]) => (
                <View key={label} style={styles.row}>
                  <Ionicons name={icon} size={18} color={C.pine} />
                  <Text style={styles.rowText}>{label}</Text>
                </View>
              ))}
            </Card>

            <Button
              title={state === "checking" ? "Verifying…" : "Start verification"}
              loading={state === "checking"}
              style={{ marginTop: 28 }}
              onPress={startVerification}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },
  iconWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  center: { textAlign: "center" },
  centerSub: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  rowText: { flex: 1, fontSize: 14, fontWeight: "600", color: C.ink },
});
