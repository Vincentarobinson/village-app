import * as React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Card, H1, Sub } from "../../../components/ui";
import { useAppState } from "../../../lib/app-state";
import { acceptConnection, ignoreConnection } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { C } from "../../../lib/theme";

export default function ConnectionRequests() {
  const router = useRouter();
  const { session } = useAppState();
  const [rows, setRows] = React.useState(null);

  const load = React.useCallback(async () => {
    if (!session) {
      setRows([]);
      return;
    }
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("connections")
        .select(
          "id, created_at, requester:profiles!connections_requester_id_fkey(display_name, avatar_url, neighborhood)"
        )
        .eq("addressee_id", auth.user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRows(data || []);
    } catch {
      setRows([]);
    }
  }, [session]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function accept(row) {
    setRows((r) => r.filter((x) => x.id !== row.id));
    try {
      const threadId = await acceptConnection(row.id);
      if (threadId) router.push(`/messages/${threadId}`);
    } catch {
      load();
    }
  }

  async function ignore(row) {
    setRows((r) => r.filter((x) => x.id !== row.id));
    try {
      await ignoreConnection(row.id);
    } catch {
      load();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>
        <H1>Requests</H1>
        <Sub style={{ marginTop: 4 }}>
          Accepting opens a private chat — connections are always mutual.
        </Sub>
      </View>

      <FlatList
        data={rows || []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          rows === null ? (
            <Sub style={{ textAlign: "center", padding: 40 }}>Loading…</Sub>
          ) : (
            <Sub style={{ textAlign: "center", padding: 40 }}>
              No pending requests right now.
            </Sub>
          )
        }
        renderItem={({ item: r }) => {
          const p = r.requester || {};
          return (
            <Card style={{ marginBottom: 12 }}>
              <View style={styles.row}>
                {p.avatar_url ? (
                  <Image source={{ uri: p.avatar_url }} style={styles.avatarImg} />
                ) : (
                  <Avatar
                    initials={(p.display_name || "?")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                    hue={C.pine}
                    size={48}
                  />
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{p.display_name || "A parent"}</Text>
                  <Sub style={{ marginTop: 2 }}>{p.neighborhood || ""}</Sub>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => ignore(r)}
                  style={[styles.btn, { backgroundColor: C.pineTint }]}
                >
                  <Text style={[styles.btnText, { color: C.sub }]}>Ignore</Text>
                </Pressable>
                <Pressable
                  onPress={() => accept(r)}
                  style={[styles.btn, { backgroundColor: C.coral }]}
                >
                  <Text style={[styles.btnText, { color: "#fff" }]}>Accept</Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  list: { padding: 18 },
  row: { flexDirection: "row", alignItems: "center" },
  avatarImg: { width: 48, height: 48, borderRadius: 17 },
  name: { fontWeight: "800", fontSize: 15.5, color: C.ink },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  btn: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 18 },
  btnText: { fontWeight: "800", fontSize: 13 },
});
