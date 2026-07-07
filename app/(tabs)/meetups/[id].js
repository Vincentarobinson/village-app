import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Sub } from "../../../components/ui";
import { MEETUPS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { C } from "../../../lib/theme";

export default function MeetupDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { rsvps, toggleRsvp } = useAppState();
  const m = MEETUPS.find((x) => String(x.id) === String(id));

  if (!m) return null;
  const going = rsvps.has(m.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>

        <Text style={styles.title}>{m.title}</Text>
        <Sub style={{ marginTop: 4 }}>Hosted by {m.host}</Sub>

        <Card style={{ marginTop: 18 }}>
          {[
            ["time-outline", m.when],
            ["location-outline", m.where],
            ["people-outline", `${m.going + (going ? 1 : 0)} going · ${m.kind}`],
          ].map(([icon, label]) => (
            <View key={label} style={styles.row}>
              <Ionicons name={icon} size={17} color={C.pine} />
              <Text style={styles.rowText}>{label}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={styles.desc}>{m.desc}</Text>
        </Card>

        <Button
          title={going ? "You're going ✓ (tap to cancel)" : "RSVP"}
          variant={going ? "tint" : "coral"}
          style={{ marginTop: 20 }}
          onPress={() => toggleRsvp(m.id)}
        />

        {going && (
          <Button
            title="Open event group chat"
            variant="pine"
            style={{ marginTop: 10 }}
            onPress={() => router.push("/messages/t2")}
          />
        )}

        <Sub style={styles.note}>
          Every meetup gets a group chat automatically. Report or block from
          any thread.
        </Sub>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  rowText: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  desc: { fontSize: 14.5, lineHeight: 22, color: C.ink, fontWeight: "500" },
  note: { textAlign: "center", marginTop: 14, fontSize: 12.5 },
});
