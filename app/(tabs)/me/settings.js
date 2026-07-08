import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, H1, SectionLabel, Sub } from "../../../components/ui";
import { supabase } from "../../../lib/supabase";
import { C } from "../../../lib/theme";

export default function Settings() {
  const router = useRouter();

  const rows = [
    {
      section: "Account",
      items: [
        ["person-outline", "Edit profile", () => Alert.alert("Coming with the profiles milestone")],
        ["images-outline", "My photos", () => Alert.alert("Photo manager", "All uploads are moderated and location-stripped automatically.")],
        ["notifications-outline", "Notifications", () => Alert.alert("Coming with the push milestone")],
      ],
    },
    {
      section: "Privacy & safety",
      items: [
        ["hand-left-outline", "Blocked users", () => Alert.alert("No one blocked", "People you block vanish from Discover in both directions.")],
        ["shield-checkmark-outline", "Verification status", () => Alert.alert("Verified", "Your ID verification is active.")],
        ["document-text-outline", "Community guidelines", () => Alert.alert("Community-first", "Village is not a dating app. Romantic advances are reportable.")],
      ],
    },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>
        <H1>Settings</H1>

        {rows.map(({ section, items }) => (
          <View key={section}>
            <SectionLabel>{section}</SectionLabel>
            <Card style={{ padding: 6 }}>
              {items.map(([icon, label, onPress], i) => (
                <Pressable
                  key={label}
                  onPress={onPress}
                  style={[
                    styles.row,
                    i < items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <Ionicons name={icon} size={18} color={C.pine} />
                  <Text style={styles.rowText}>{label}</Text>
                  <Ionicons name="chevron-forward" size={15} color={C.inactive} />
                </Pressable>
              ))}
            </Card>
          </View>
        ))}

        <SectionLabel>Session</SectionLabel>
        <Card style={{ padding: 6 }}>
          <Pressable onPress={signOut} style={styles.row}>
            <Ionicons name="log-out-outline" size={18} color={C.danger} />
            <Text style={[styles.rowText, { color: C.danger }]}>Sign out</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Delete account",
                "This permanently removes your profile, photos, and messages.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => Alert.alert("Scaffold", "Account deletion wires up with the profiles milestone.") },
                ]
              )
            }
            style={[styles.row, styles.rowBorder]}
          >
            <Ionicons name="trash-outline" size={18} color={C.sub} />
            <Text style={[styles.rowText, { color: C.sub }]}>Delete account</Text>
          </Pressable>
        </Card>

        <Sub style={styles.version}>Village 0.1.0 · Robinson Premier Group</Sub>
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
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  rowText: { flex: 1, fontSize: 14.5, fontWeight: "600", color: C.ink },
  version: { textAlign: "center", marginTop: 24, fontSize: 12 },
});
