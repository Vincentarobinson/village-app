import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Sub } from "../../../components/ui";
import { MEETUPS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { rsvpMeetup, cancelRsvp } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { C } from "../../../lib/theme";

const KIND_LABEL = {
  playdate: "Playdate",
  park_hang: "Park Hang",
  adults_only: "Adults only",
  walk: "Walk",
  birthday: "Birthday",
  other: "Meetup",
};

export default function MeetupDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session, rsvps, toggleRsvp } = useAppState();
  const isMock = String(id).startsWith("mock-");
  const mockId = isMock ? Number(String(id).replace("mock-", "")) : null;
  const mock = isMock ? MEETUPS.find((x) => x.id === mockId) : null;

  const [m, setM] = React.useState(null);
  const [iAmGoing, setIAmGoing] = React.useState(false);
  const [going, setGoing] = React.useState(0);
  const [isHost, setIsHost] = React.useState(false);

  const load = React.useCallback(async () => {
    if (isMock || !session) return;
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("meetups")
        .select("*, rsvps(user_id), host:profiles!meetups_host_id_fkey(display_name)")
        .eq("id", String(id))
        .maybeSingle();
      if (error || !data) return;
      setM(data);
      setGoing((data.rsvps || []).length);
      setIAmGoing((data.rsvps || []).some((r) => r.user_id === auth.user.id));
      setIsHost(data.host_id === auth.user.id);
    } catch {
      /* stays null */
    }
  }, [id, isMock, session]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function toggleGoing() {
    if (isMock) {
      toggleRsvp(mockId);
      return;
    }
    const next = !iAmGoing;
    setIAmGoing(next);
    setGoing((g) => g + (next ? 1 : -1));
    try {
      if (next) await rsvpMeetup(m.id);
      else await cancelRsvp(m.id);
    } catch {
      load();
    }
  }

  const title = isMock ? mock?.title : m?.title;
  if (!title) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
        <Sub style={{ textAlign: "center", padding: 40 }}>Loading…</Sub>
      </SafeAreaView>
    );
  }

  const whenText = isMock ? mock.when : m.when_text;
  const whereText = isMock ? mock.where : m.place_name;
  const kindLabel = isMock ? mock.kind : KIND_LABEL[m.kind] || "Meetup";
  const hostName = isMock ? mock.host : m.host?.display_name || "A parent";
  const desc = isMock
    ? mock.desc
    : m.kids_welcome
    ? "Kids welcome."
    : "Adults only.";
  const goingCount = isMock ? mock.going + (rsvps.has(mockId) ? 1 : 0) : going;
  const amGoing = isMock ? rsvps.has(mockId) : iAmGoing;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>

        <Text style={styles.title}>{title}</Text>
        <Sub style={{ marginTop: 4 }}>
          Hosted by {hostName}
          {isHost ? " (you)" : ""}
        </Sub>

        <Card style={{ marginTop: 18 }}>
          {[
            ["time-outline", whenText],
            ["location-outline", whereText],
            ["people-outline", `${goingCount} going · ${kindLabel}`],
          ].map(([icon, label]) => (
            <View key={label} style={styles.row}>
              <Ionicons name={icon} size={17} color={C.pine} />
              <Text style={styles.rowText}>{label}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={styles.desc}>{desc}</Text>
        </Card>

        {!isHost && (
          <Button
            title={amGoing ? "You're going ✓ (tap to cancel)" : "RSVP"}
            variant={amGoing ? "tint" : "coral"}
            style={{ marginTop: 20 }}
            onPress={toggleGoing}
          />
        )}

        {(amGoing || isHost) && (
          <Button
            title="Open event group chat"
            variant="pine"
            style={{ marginTop: 10 }}
            onPress={() =>
              router.push(`/messages/${isMock ? "t2" : m.thread_id}`)
            }
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
  rowText: { fontSize: 14.5, fontWeight: "600", color: C.ink, flex: 1 },
  desc: { fontSize: 14.5, lineHeight: 22, color: C.ink, fontWeight: "500" },
  note: { textAlign: "center", marginTop: 14, fontSize: 12.5 },
});
