import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Field, H1, Sub, Chip } from "../../../components/ui";
import { useAppState } from "../../../lib/app-state";
import { createMeetup } from "../../../lib/api";
import { C } from "../../../lib/theme";

const KINDS = [
  { label: "Playdate", value: "playdate" },
  { label: "Park Hang", value: "park_hang" },
  { label: "Adults Only", value: "adults_only" },
  { label: "Walk", value: "walk" },
  { label: "Birthday", value: "birthday" },
  { label: "Other", value: "other" },
];
const VISIBILITY = [
  { label: "Connections", value: "connections" },
  { label: "Neighborhood", value: "neighborhood" },
  { label: "Public", value: "public" },
];

export default function CreateMeetup() {
  const router = useRouter();
  const { session, myProfile } = useAppState();
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState("playdate");
  const [when, setWhen] = React.useState("");
  const [where, setWhere] = React.useState("");
  const [capacity, setCapacity] = React.useState("");
  const [visibility, setVisibility] = React.useState("neighborhood");
  const [kidsWelcome, setKidsWelcome] = React.useState(true);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function create() {
    setError("");
    if (!title.trim()) return setError("Give your meetup a title.");
    if (!when.trim()) return setError("Add a date and time.");
    if (!where.trim()) return setError("Add a location.");

    if (!session) {
      Alert.alert(
        "Demo mode",
        "Sign in to host a real meetup — this build is running on demo data.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    setSaving(true);
    try {
      const meetupId = await createMeetup({
        title: title.trim(),
        kind,
        whenText: when.trim(),
        placeName: where.trim(),
        neighborhood: myProfile?.neighborhood || null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        kidsWelcome,
        visibility,
      });
      Alert.alert(
        "Meetup created",
        "It's live, and its group chat is ready — everyone who RSVPs joins automatically.",
        [{ text: "See it", onPress: () => router.replace(`/meetups/${meetupId}`) }]
      );
    } catch (e) {
      setError(e.message || "Couldn't create the meetup — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>

        <H1>Host a meetup</H1>
        <Sub style={{ marginTop: 6, marginBottom: 24 }}>
          A group chat is created automatically for everyone who RSVPs.
        </Sub>

        <Field label="Title">
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Saturday Park Playdate"
          />
        </Field>

        <Field label="Type">
          <View style={styles.chipWrap}>
            {KINDS.map((k) => (
              <View key={k.value} style={{ marginBottom: 8 }}>
                <Chip
                  label={k.label}
                  active={kind === k.value}
                  onPress={() => setKind(k.value)}
                />
              </View>
            ))}
          </View>
        </Field>

        <Field label="When">
          <Input
            value={when}
            onChangeText={setWhen}
            placeholder="Sat, Jul 18 · 10:00 AM"
          />
        </Field>

        <Field label="Where (name a public place)">
          <Input
            value={where}
            onChangeText={setWhere}
            placeholder="Grant Park Playground"
          />
        </Field>

        <Field label="Capacity (optional)">
          <Input
            value={capacity}
            onChangeText={(v) => setCapacity(v.replace(/\D/g, ""))}
            keyboardType="number-pad"
            placeholder="No limit"
          />
        </Field>

        <Field label="Who can see it">
          <View style={styles.chipWrap}>
            {VISIBILITY.map((v) => (
              <Chip
                key={v.value}
                label={v.label}
                active={visibility === v.value}
                onPress={() => setVisibility(v.value)}
              />
            ))}
          </View>
        </Field>

        <Pressable
          onPress={() => setKidsWelcome(!kidsWelcome)}
          style={styles.toggleRow}
        >
          <Ionicons
            name={kidsWelcome ? "checkbox" : "square-outline"}
            size={20}
            color={C.pine}
          />
          <Text style={styles.toggleText}>Kids welcome</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Create meetup" onPress={create} loading={saving} />
        <View style={{ height: 40 }} />
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
  chipWrap: { flexDirection: "row", flexWrap: "wrap" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  toggleText: { fontSize: 14.5, fontWeight: "600", color: C.ink },
  error: { color: C.danger, fontWeight: "600", marginBottom: 14 },
});
