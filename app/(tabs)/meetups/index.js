import * as React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, H1, Sub, SectionLabel } from "../../../components/ui";
import { MEETUPS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { C } from "../../../lib/theme";

const KIND_ICON = {
  "Kids + parents": "balloon-outline",
  "Adults only": "restaurant-outline",
  Dads: "cafe-outline",
};

export default function Meetups() {
  const router = useRouter();
  const { rsvps, toggleRsvp } = useAppState();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <H1>Meetups</H1>
          <Pressable
            style={styles.hostBtn}
            onPress={() => router.push("/meetups/create")}
          >
            <Ionicons name="add" size={15} color="#fff" />
            <Text style={styles.hostBtnText}>Host one</Text>
          </Pressable>
        </View>

        <Card style={styles.banner}>
          <Text style={styles.bannerTitle}>Sitter-covered events</Text>
          <Sub style={{ marginTop: 3, color: "#6B5B2E" }}>
            Adults-only meetups will soon pool a verified sitter so everyone
            actually gets to show up.
          </Sub>
        </Card>
      </View>

      <FlatList
        data={MEETUPS}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<SectionLabel>Upcoming near you</SectionLabel>}
        renderItem={({ item: m }) => {
          const going = rsvps.has(m.id);
          return (
            <Pressable onPress={() => router.push(`/meetups/${m.id}`)}>
              <Card style={{ marginBottom: 12, flexDirection: "row", gap: 14 }}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={KIND_ICON[m.kind] || "calendar-outline"}
                    size={24}
                    color={C.pine}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{m.title}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={12} color={C.sub} />
                    <Sub style={{ fontSize: 12.5 }}> {m.when}</Sub>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={C.sub} />
                    <Sub style={{ fontSize: 12.5 }}> {m.where}</Sub>
                  </View>
                  <View style={styles.bottomRow}>
                    <View style={styles.kindPill}>
                      <Text style={styles.kindText}>
                        {m.kind} · {m.going + (going ? 1 : 0)} going
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => toggleRsvp(m.id)}
                      style={[
                        styles.rsvpBtn,
                        { backgroundColor: going ? C.pineTint : C.coral },
                      ]}
                    >
                      <Text
                        style={{
                          color: going ? C.pine : "#fff",
                          fontWeight: "800",
                          fontSize: 13,
                        }}
                      >
                        {going ? "Going ✓" : "RSVP"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.pine,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  hostBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  banner: { marginTop: 14, backgroundColor: C.butter },
  bannerTitle: { fontWeight: "800", fontSize: 14, color: C.ink },
  list: { padding: 18, paddingTop: 0 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "800", fontSize: 15.5, color: C.ink },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  kindPill: {
    backgroundColor: C.pineTint,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  kindText: { fontSize: 11.5, fontWeight: "800", color: C.pine },
  rsvpBtn: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 15 },
});
