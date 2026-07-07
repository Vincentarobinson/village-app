import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Field, H1, Sub, Chip } from "../../../components/ui";
import { C } from "../../../lib/theme";

const KINDS = ["Playdate", "Park Hang", "Adults Only", "Walk", "Birthday", "Other"];
const VISIBILITY = ["Connections", "Neighborhood", "Public"];

export default function CreateMeetup() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState("Playdate");
  const [when, setWhen] = React.useState("");
  const [where, setWhere] = React.useState("");
  const [capacity, setCapacity] = React.useState("");
  const [visibility, setVisibility] = React.useState("Neighborhood");
  const [kidsWelcome, setKidsWelcome] = React.useState(true);
  const [error, setError] = React.useState("");

  function create() {
    setError("");
    if (!title.trim()) return setError("Give your meetup a title.");
    if (!when.trim()) return setError("Add a date and time.");
    if (!where.trim()) return setError("Add a location.");
    Alert.alert(
      "Meetup created",
      "Your meetup is live and its group chat is ready. (Scaffold — will save to Supabase.)",
      [{ text: "Nice", onPress: () => router.back() }]
    );
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
              <View key={k} style={{ marginBottom: 8 }}>
                <Chip label={k} active={kind === k} onPress={() => setKind(k)} />
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
                key={v}
                label={v}
                active={visibility === v}
                onPress={() => setVisibility(v)}
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

        <Button title="Create meetup" onPress={create} />
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
    backgroundColor: "#fff",
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
  error: { color: C.coral, fontWeight: "600", marginBottom: 14 },
});
