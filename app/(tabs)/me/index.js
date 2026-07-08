import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Card, H1, Sub, SectionLabel, Tag } from "../../../components/ui";
import { useAppState } from "../../../lib/app-state";
import { C } from "../../../lib/theme";

export default function Me() {
  const router = useRouter();
  const { user, connections, rsvps, verified } = useAppState();

  const display = user || {
    name: "Vincent R.",
    parentType: "Dad",
    hood: "Grant Park",
    kidAges: ["3-5", "6-9"],
    tags: ["Park hangs", "Game nights"],
    bio: "",
    avatarUri: null,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.topRow}>
          <H1>Me</H1>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => router.push("/me/edit")}
              style={styles.gearBtn}
            >
              <Ionicons name="create-outline" size={18} color={C.ink} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/me/settings")}
              style={styles.gearBtn}
            >
              <Ionicons name="settings-outline" size={18} color={C.ink} />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileRow}>
          {display.avatarUri ? (
            <Image source={{ uri: display.avatarUri }} style={styles.avatarImg} />
          ) : (
            <Avatar
              initials={display.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
              hue={C.pine}
              size={64}
            />
          )}
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.name}>{display.name}</Text>
            <Sub>
              Single {display.parentType.toLowerCase()} · {display.hood}
            </Sub>
          </View>
        </View>

        <View style={styles.statGrid}>
          {[
            [connections.size, "Connections"],
            [rsvps.size, "Meetups"],
            [0, "Deals used"],
          ].map(([n, l]) => (
            <Card key={l} style={styles.statCard}>
              <Text style={styles.statN}>{n}</Text>
              <Text style={styles.statL}>{l}</Text>
            </Card>
          ))}
        </View>

        <SectionLabel>Trust & safety</SectionLabel>
        {[
          {
            icon: "shield-checkmark",
            color: C.pine,
            t: verified ? "ID verified" : "Verification pending",
            d: "Every member verifies identity before seeing profiles",
          },
          {
            icon: "happy-outline",
            color: C.pine,
            t: `Kids' ages: ${display.kidAges.join(" & ")}`,
            d: "Shown as age ranges only — never names or birthdates",
          },
          {
            icon: "heart",
            color: C.danger,
            t: "Community-first",
            d: "This is not a dating app. Report anyone who treats it like one.",
          },
        ].map((r) => (
          <Card key={r.t} style={styles.trustRow}>
            <Ionicons name={r.icon} size={17} color={r.color} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.trustTitle}>{r.t}</Text>
              <Sub style={{ marginTop: 2, fontSize: 12.5 }}>{r.d}</Sub>
            </View>
          </Card>
        ))}

        {display.tags.length > 0 && (
          <>
            <SectionLabel>Interests</SectionLabel>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {display.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatarImg: { width: 64, height: 64, borderRadius: 22 },
  name: { fontSize: 22, fontWeight: "800", color: C.ink },
  statGrid: { flexDirection: "row", gap: 10, marginTop: 18 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statN: { fontWeight: "900", fontSize: 22, color: C.pine },
  statL: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.sub,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    padding: 14,
  },
  trustTitle: { fontWeight: "800", fontSize: 14, color: C.ink },
});
