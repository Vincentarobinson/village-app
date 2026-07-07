import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button, Card, Sub } from "../../../../components/ui";
import { SITTERS } from "../../../../lib/mock";
import { C } from "../../../../lib/theme";

export default function SitterProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const s = SITTERS.find((x) => x.id === String(id));

  if (!s) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>

        <View style={styles.center}>
          <Avatar
            initials={s.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
            hue={C.pine}
            size={96}
          />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{s.name}</Text>
            {s.verified && (
              <Ionicons name="shield-checkmark" size={17} color={C.pine} />
            )}
          </View>
          <Sub>{s.sub}</Sub>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statN}>{s.rate}</Text>
              <Text style={styles.statL}>Rate</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statN}>{s.rating}</Text>
              <Text style={styles.statL}>Rating</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statN}>{s.jobs}</Text>
              <Text style={styles.statL}>Sits</Text>
            </View>
          </View>
        </View>

        <Card style={{ marginTop: 6 }}>
          <Text style={styles.bio}>{s.bio}</Text>
        </Card>

        <Card style={{ marginTop: 14, backgroundColor: s.verified ? C.pineTint : "#FFF4DC" }}>
          <View style={styles.badgeRow}>
            <Ionicons
              name={s.verified ? "shield-checkmark" : "hourglass-outline"}
              size={18}
              color={s.verified ? C.pine : "#8A6510"}
            />
            <Text
              style={[
                styles.badgeText,
                { color: s.verified ? C.pine : "#8A6510" },
              ]}
            >
              {s.verified
                ? "Background checked — national criminal, sex-offender registry, county records"
                : "Verification pending — this sitter can't take bookings yet"}
            </Text>
          </View>
        </Card>

        <Button
          title="Message"
          style={{ marginTop: 20 }}
          onPress={() => router.push("/messages/t3")}
        />
        <Sub style={styles.note}>
          In-app booking and payments are coming — for now, arrange details in
          chat.
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
    marginBottom: 12,
  },
  center: { alignItems: "center" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 4,
  },
  name: { fontSize: 22, fontWeight: "800", color: C.ink },
  statRow: { flexDirection: "row", gap: 10, marginVertical: 18 },
  stat: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  statN: { fontWeight: "900", fontSize: 16, color: C.pine },
  statL: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.sub,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  bio: { fontSize: 14.5, lineHeight: 22, color: C.ink, fontWeight: "500" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  badgeText: { flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  note: { textAlign: "center", marginTop: 12, fontSize: 12.5 },
});
