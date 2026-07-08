import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, H1, Sub, SectionLabel } from "../../../components/ui";
import { MEETUPS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { fetchMeetups, rsvpMeetup, cancelRsvp } from "../../../lib/api";
import { C } from "../../../lib/theme";

const KIND_ICON = {
  playdate: "balloon-outline",
  park_hang: "sunny-outline",
  adults_only: "restaurant-outline",
  walk: "walk-outline",
  birthday: "gift-outline",
  other: "calendar-outline",
};
const KIND_LABEL = {
  playdate: "Playdate",
  park_hang: "Park Hang",
  adults_only: "Adults only",
  walk: "Walk",
  birthday: "Birthday",
  other: "Meetup",
};

const MOCK_ROWS = MEETUPS.map((m) => ({
  id: `mock-${m.id}`,
  _mockId: m.id,
  title: m.title,
  kind:
    m.kind === "Adults only"
      ? "adults_only"
      : m.kind === "Dads"
      ? "other"
      : "playdate",
  when_text: m.when,
  place_name: m.where,
  going: m.going,
  iAmGoing: false,
  hostName: m.host,
  kindLabel: m.kind,
}));

export default function Meetups() {
  const router = useRouter();
  const { session, rsvps, toggleRsvp } = useAppState();
  const [rows, setRows] = React.useState(null);
  const [live, setLive] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!session) {
      setRows(MOCK_ROWS);
      setLive(false);
      return;
    }
    try {
      const data = await fetchMeetups();
      setRows(data);
      setLive(true);
    } catch {
      setRows(MOCK_ROWS);
      setLive(false);
    }
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function toggleGoing(m) {
    if (!live) {
      toggleRsvp(m._mockId);
      return;
    }
    // optimistic
    setRows((rs) =>
      rs.map((r) =>
        r.id === m.id
          ? { ...r, iAmGoing: !r.iAmGoing, going: r.going + (r.iAmGoing ? -1 : 1) }
          : r
      )
    );
    try {
      if (m.iAmGoing) await cancelRsvp(m.id);
      else await rsvpMeetup(m.id);
    } catch {
      load();
    }
  }

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
        data={rows || []}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <SectionLabel>
            Upcoming near you{live ? "" : " (demo data)"}
          </SectionLabel>
        }
        ListEmptyComponent={
          rows === null ? (
            <Sub style={{ textAlign: "center", padding: 40 }}>Loading…</Sub>
          ) : (
            <Sub style={{ textAlign: "center", padding: 40 }}>
              Nothing scheduled yet — be the first to host one.
            </Sub>
          )
        }
        renderItem={({ item: m }) => {
          const going = live ? m.iAmGoing : rsvps.has(m._mockId);
          const count = live ? m.going : m.going + (going ? 1 : 0);
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
                    <Sub style={{ fontSize: 12.5 }}> {m.when_text}</Sub>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={C.sub} />
                    <Sub style={{ fontSize: 12.5 }}> {m.place_name}</Sub>
                  </View>
                  <View style={styles.bottomRow}>
                    <View style={styles.kindPill}>
                      <Text style={styles.kindText}>
                        {m.kindLabel || KIND_LABEL[m.kind]} · {count} going
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => toggleGoing(m)}
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
