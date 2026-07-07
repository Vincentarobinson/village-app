import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button, Card, Sub, Tag } from "../../../components/ui";
import { PARENTS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { C } from "../../../lib/theme";

export default function ParentProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { connections, toggleConnection } = useAppState();
  const p = PARENTS.find((x) => String(x.id) === String(id));

  if (!p) return null;
  const isConn = connections.has(p.id);

  function report() {
    Alert.alert("Report or block", "What would you like to do?", [
      { text: "Report profile", onPress: () => Alert.alert("Reported", "Thanks — our team will review this profile.") },
      { text: "Block", style: "destructive", onPress: () => Alert.alert("Blocked", "You won't see each other on Village.") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={C.ink} />
          </Pressable>
          <Pressable onPress={report} style={styles.backBtn}>
            <Ionicons name="flag-outline" size={16} color={C.sub} />
          </Pressable>
        </View>

        <View style={styles.center}>
          <Avatar initials={p.initials} hue={p.hue} size={96} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{p.name}</Text>
            <Ionicons name="shield-checkmark" size={16} color={C.pine} />
          </View>
          <Sub>
            Single {p.type.toLowerCase()} · {p.kids} · {p.hood} · {p.dist} mi
          </Sub>
        </View>

        <Card style={{ marginTop: 20 }}>
          <Text style={styles.bio}>{p.bio}</Text>
          <View style={styles.tags}>
            {p.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </View>
        </Card>

        <Button
          title={isConn ? "Request sent ✓" : "Connect"}
          variant={isConn ? "tint" : "coral"}
          style={{ marginTop: 20 }}
          onPress={() => toggleConnection(p.id)}
        />
        <Sub style={styles.note}>
          Messaging unlocks when you both accept — connections on Village are
          always mutual.
        </Sub>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center", marginTop: 12 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 4,
  },
  name: { fontSize: 22, fontWeight: "800", color: C.ink },
  bio: { fontSize: 14.5, lineHeight: 22, color: C.ink, fontWeight: "500" },
  tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  note: { textAlign: "center", marginTop: 12, fontSize: 12.5 },
});
