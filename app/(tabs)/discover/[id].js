import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button, Card, Sub, Tag } from "../../../components/ui";
import { PhotoGallery } from "../../../components/photo-gallery";
import { PARENTS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { getParentProfile, requestConnection } from "../../../lib/api";
import { C } from "../../../lib/theme";

export default function ParentProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session, connections, toggleConnection } = useAppState();
  const isMock = /^\d+$/.test(String(id));
  const mock = isMock ? PARENTS.find((x) => String(x.id) === String(id)) : null;

  const [live, setLive] = React.useState(null);
  const [requested, setRequested] = React.useState(false);

  React.useEffect(() => {
    if (isMock || !session) return;
    getParentProfile(String(id))
      .then(setLive)
      .catch(() => {});
  }, [id, isMock, session]);

  const p = isMock
    ? mock && {
        display_name: mock.name,
        parent_type: mock.type.toLowerCase(),
        neighborhood: mock.hood,
        bio: mock.bio,
        tags: mock.tags,
        ageRanges: [mock.kids.replace(/Kids? /, "")],
        photos: [],
        _initials: mock.initials,
        _hue: mock.hue,
        _dist: mock.dist,
      }
    : live;

  if (!p) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
        <Sub style={{ textAlign: "center", padding: 40 }}>Loading…</Sub>
      </SafeAreaView>
    );
  }

  const isConn = isMock ? connections.has(mock.id) : requested;

  function connect() {
    if (isMock) {
      toggleConnection(mock.id);
      return;
    }
    setRequested(true);
    requestConnection(String(id)).catch(() => setRequested(false));
  }

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

        {p.photos && p.photos.length > 0 ? (
          <View style={{ marginTop: 8 }}>
            <PhotoGallery photos={p.photos} />
          </View>
        ) : (
          <View style={styles.center}>
            <Avatar
              initials={
                p._initials ||
                p.display_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              }
              hue={p._hue || C.pine}
              size={96}
            />
          </View>
        )}

        <View style={styles.nameBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{p.display_name}</Text>
            <Ionicons name="shield-checkmark" size={16} color={C.pine} />
          </View>
          <Sub>
            Single {p.parent_type}
            {p.ageRanges?.length ? ` · Kids ${p.ageRanges.join(" & ")}` : ""}
            {p.neighborhood ? ` · ${p.neighborhood}` : ""}
            {p._dist ? ` · ${p._dist} mi` : ""}
          </Sub>
        </View>

        {(p.bio || (p.tags || []).length > 0) && (
          <Card style={{ marginTop: 16 }}>
            {p.bio ? <Text style={styles.bio}>{p.bio}</Text> : null}
            {(p.tags || []).length > 0 && (
              <View style={[styles.tags, p.bio && { marginTop: 12 }]}>
                {p.tags.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </View>
            )}
          </Card>
        )}

        <Button
          title={isConn ? "Request sent ✓" : "Connect"}
          variant={isConn ? "tint" : "coral"}
          style={{ marginTop: 20 }}
          onPress={connect}
        />
        <Sub style={styles.note}>
          Messaging unlocks when you both accept — connections on Village are
          always mutual.
        </Sub>
        <View style={{ height: 30 }} />
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
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center", marginTop: 12 },
  nameBlock: { alignItems: "center", marginTop: 16 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  name: { fontSize: 22, fontWeight: "800", color: C.ink },
  bio: { fontSize: 14.5, lineHeight: 22, color: C.ink, fontWeight: "500" },
  tags: { flexDirection: "row", flexWrap: "wrap" },
  note: { textAlign: "center", marginTop: 12, fontSize: 12.5 },
});
