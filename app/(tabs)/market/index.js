import * as React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Chip, H1, Sub } from "../../../components/ui";
import { ComingSoon } from "../../../components/coming-soon";
import { SITTERS } from "../../../lib/mock";
import { C } from "../../../lib/theme";

/*
 * Market v1: Sitters are LIVE (browse + message + apply).
 * Deals and Give & Get show coming-soon states (SPEC-CHANGES).
 */
const SECTIONS = ["Sitters", "Deals", "Give & Get"];

export default function Market() {
  const router = useRouter();
  const [section, setSection] = React.useState("Sitters");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <H1>Marketplace</H1>
        <Sub style={{ marginTop: 4, marginBottom: 14 }}>
          Trusted sitters now — deals and hand-me-downs on the way.
        </Sub>
        <View style={{ flexDirection: "row" }}>
          {SECTIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={section === s}
              onPress={() => setSection(s)}
            />
          ))}
        </View>
      </View>

      {section === "Sitters" && (
        <FlatList
          data={SITTERS}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Pressable
              onPress={() => router.push("/market/apply")}
              style={styles.applyBanner}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.applyTitle}>Want to sit for Village?</Text>
                <Sub style={{ fontSize: 12.5, color: "#6B5B2E" }}>
                  Apply and start your background check
                </Sub>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color={C.ink} />
            </Pressable>
          }
          renderItem={({ item: s }) => (
            <Pressable onPress={() => router.push(`/market/sitter/${s.id}`)}>
              <Card style={{ marginBottom: 12 }}>
                <View style={styles.sitterTop}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{s.name}</Text>
                    {s.verified && (
                      <Ionicons name="shield-checkmark" size={15} color={C.pine} />
                    )}
                  </View>
                  <Text style={styles.rate}>{s.rate}</Text>
                </View>
                <Sub style={{ marginTop: 3 }}>{s.sub}</Sub>
                <View style={styles.sitterBottom}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#C79A2A" />
                    <Text style={styles.ratingText}>
                      {s.rating} · {s.jobs} sits in the village
                    </Text>
                  </View>
                  {!s.verified && (
                    <Text style={styles.pending}>Verification pending</Text>
                  )}
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}

      {section === "Deals" && (
        <ComingSoon
          icon="ticket-outline"
          title="Local deals are coming"
          body="Discounted passes to bounce parks, museums, skate nights, and more — negotiated for Village families. We're signing partners now."
        />
      )}

      {section === "Give & Get" && (
        <ComingSoon
          icon="cube-outline"
          title="Give & Get is coming"
          body="Pass strollers, clothes, and bikes to families a few blocks away — free or cheap, always in person."
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8 },
  list: { padding: 18 },
  applyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.butter,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  applyTitle: { fontWeight: "800", fontSize: 14.5, color: C.ink },
  sitterTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { fontWeight: "800", fontSize: 15.5, color: C.ink },
  rate: { fontWeight: "900", fontSize: 16, color: C.coral },
  sitterBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12.5, fontWeight: "700", color: C.ink },
  pending: { fontSize: 11.5, fontWeight: "700", color: C.sub },
});
