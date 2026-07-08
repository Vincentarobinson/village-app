import * as React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Card, H1, Sub } from "../../../components/ui";
import { THREADS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { fetchThreads } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { C } from "../../../lib/theme";

const HUES = ["#E8734A", "#1E4D42", "#7A5C9E", "#B0893B", "#C25B7C"];

export default function Messages() {
  const router = useRouter();
  const { session } = useAppState();
  const [rows, setRows] = React.useState(null);
  const [live, setLive] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!session) {
      setRows(THREADS.map((t) => ({ ...t, _mock: true })));
      setLive(false);
      return;
    }
    try {
      const { data: auth } = await supabase.auth.getUser();
      const threads = await fetchThreads();
      const shaped = threads.map((t, i) => {
        const others = (t.thread_members || []).filter(
          (m) => m.user_id !== auth.user.id
        );
        const name =
          t.kind === "meetup"
            ? "Meetup chat"
            : others.map((o) => o.profiles?.display_name || "Parent").join(", ") ||
              "New conversation";
        return {
          id: t.id,
          name,
          last: "",
          time: "",
          initials: name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          hue: HUES[i % HUES.length],
          unread: 0,
        };
      });
      setRows(shaped);
      setLive(true);
    } catch {
      setRows(THREADS.map((t) => ({ ...t, _mock: true })));
      setLive(false);
    }
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <H1>Messages</H1>
        <Sub style={{ marginTop: 4 }}>
          Chats open once a connection is mutual.{live ? "" : " (demo data)"}
        </Sub>
      </View>
      <FlatList
        data={rows || []}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          rows === null ? (
            <Sub style={{ textAlign: "center", padding: 40 }}>Loading…</Sub>
          ) : (
            <Sub style={{ textAlign: "center", padding: 40 }}>
              No conversations yet — accept a connection to start one.
            </Sub>
          )
        }
        renderItem={({ item: t }) => (
          <Pressable onPress={() => router.push(`/messages/${t.id}`)}>
            <Card style={styles.thread}>
              <Avatar initials={t.initials} hue={t.hue} size={46} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.row}>
                  <Text style={styles.name}>{t.name}</Text>
                  <Sub style={{ fontSize: 11.5 }}>{t.time}</Sub>
                </View>
                {t.last ? (
                  <Sub numberOfLines={1} style={{ marginTop: 2 }}>
                    {t.last}
                  </Sub>
                ) : null}
              </View>
              {t.unread > 0 && (
                <View style={styles.unread}>
                  <Text style={styles.unreadText}>{t.unread}</Text>
                </View>
              )}
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8 },
  list: { padding: 18 },
  thread: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 14,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontWeight: "800", fontSize: 14.5, color: C.ink },
  unread: {
    backgroundColor: C.coral,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});
