import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Sub } from "../components/ui";
import { C } from "../lib/theme";

/* Welcome — entry point before auth. */
export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoGlyph}>⌂</Text>
          </View>
          <Text style={styles.brand}>Village</Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.title}>
            It takes a village.{"\n"}
            <Text style={styles.titleAccent}>Find yours.</Text>
          </Text>
          <Sub style={styles.tagline}>
            The community app for single parents — verified neighbors,
            real meetups, trusted sitters.
          </Sub>
        </View>

        <View style={styles.footer}>
          <Button
            title="Create account"
            onPress={() => router.push("/(onboarding)/sign-up")}
          />
          <Button
            title="Sign in"
            variant="tint"
            style={{ marginTop: 10 }}
            onPress={() => router.push("/(onboarding)/sign-in")}
          />
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={13} color={C.pine} />
            <Sub style={{ fontSize: 12 }}>
              {" "}Every member is ID-verified before they can see profiles
            </Sub>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  wrap: { flex: 1, paddingHorizontal: 24, paddingVertical: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.pine,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: { color: C.butter, fontSize: 17, fontWeight: "900" },
  brand: { fontSize: 22, fontWeight: "700", color: C.ink },
  center: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -1,
  },
  titleAccent: { fontStyle: "italic", color: C.pine },
  tagline: { marginTop: 14, fontSize: 15, lineHeight: 22, maxWidth: 300 },
  footer: { paddingBottom: 8 },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});
