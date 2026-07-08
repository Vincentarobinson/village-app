import * as React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Sub } from "../components/ui";
import { useAppState } from "../lib/app-state";
import { C } from "../lib/theme";

/*
 * Shown when a verified member's neighborhood isn't live yet.
 * Village activates metro-by-metro based on waitlist density —
 * this screen keeps waiting users warm instead of showing an
 * empty Discover feed.
 */
export default function NotInYourArea() {
  const router = useRouter();
  const { setInLaunchArea } = useAppState();
  const [notified, setNotified] = React.useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <View style={styles.pinOuter}>
          <View style={styles.pinInner}>
            <Ionicons name="location" size={30} color={C.butter} />
          </View>
        </View>

        <Text style={styles.title}>
          We&apos;re not in your{"\n"}neighborhood yet
        </Text>
        <Sub style={styles.body}>
          Village opens one community at a time, so every neighborhood has
          real families from day one. Yours is on the map — we&apos;ll let you
          know the moment it&apos;s ready.
        </Sub>

        <View style={styles.counter}>
          <Ionicons name="people-outline" size={16} color={C.pine} />
          <Text style={styles.counterText}>
            23 parents near you are waiting too
          </Text>
        </View>

        {notified ? (
          <View style={styles.confirmed}>
            <Text style={styles.confirmedText}>
              You&apos;re on the list — we&apos;ll notify you first.
            </Text>
          </View>
        ) : (
          <Button
            title="Notify me when it's my turn"
            style={{ marginTop: 14, alignSelf: "stretch" }}
            onPress={() => setNotified(true)}
          />
        )}

        <Pressable style={styles.invite}>
          <Text style={styles.inviteText}>Invite parents you know</Text>
          <Ionicons name="chevron-forward" size={14} color={C.sub} />
        </Pressable>

        {/* DEV ONLY: simulate metro going live */}
        {__DEV__ && (
          <Pressable
            onPress={() => {
              setInLaunchArea(true);
              router.replace("/(tabs)/discover");
            }}
            style={{ marginTop: 24 }}
          >
            <Text style={{ color: C.inactive, fontSize: 12 }}>
              [dev] simulate launch in my area
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  pinOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
  },
  pinInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.pine,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 28,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    color: C.ink,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  body: {
    marginTop: 12,
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: "center",
  },
  counter: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  counterText: { fontSize: 13.5, fontWeight: "600", color: C.ink },
  confirmed: {
    marginTop: 14,
    alignSelf: "stretch",
    backgroundColor: C.pineTint,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmedText: { color: C.pine, fontWeight: "700", fontSize: 13.5 },
  invite: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inviteText: { fontSize: 13.5, fontWeight: "600", color: C.sub },
});
