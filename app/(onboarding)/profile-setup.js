import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Field, H1, Sub, Chip } from "../../components/ui";
import { useAppState } from "../../lib/app-state";
import { C } from "../../lib/theme";

const PARENT_TYPES = ["Mom", "Dad", "Parent"];
const AGE_RANGES = ["0-2", "3-5", "6-9", "10-13", "14-17"];
const INTERESTS = [
  "Playdates",
  "Park hangs",
  "Coffee walks",
  "Meal swaps",
  "Game nights",
  "Youth sports",
  "Storytime",
  "New to area",
];

export default function ProfileSetup() {
  const router = useRouter();
  const { setUser, inLaunchArea } = useAppState();

  const [avatarUri, setAvatarUri] = React.useState(null);
  const [name, setName] = React.useState("");
  const [parentType, setParentType] = React.useState("Mom");
  const [hood, setHood] = React.useState("");
  const [ages, setAges] = React.useState(new Set());
  const [tags, setTags] = React.useState(new Set());
  const [bio, setBio] = React.useState("");
  const [error, setError] = React.useState("");

  const toggle = (setter) => (v) =>
    setter((prev) => {
      const n = new Set(prev);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });

  async function pickPhoto() {
    /*
     * Photo pipeline (spec §3.2): on upload we compress to 1600px,
     * strip EXIF/GPS, then run moderation before the photo goes
     * public. Neutral framing — it's just "your photos."
     */
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      exif: false, // never read EXIF into the app
    });
    if (!res.canceled) setAvatarUri(res.assets[0].uri);
  }

  function finish() {
    setError("");
    if (!avatarUri) return setError("A profile photo is required on Village.");
    if (!name.trim()) return setError("Add your first name and last initial.");
    if (!hood.trim()) return setError("Add your neighborhood.");
    if (ages.size === 0) return setError("Select your kids' age range(s).");

    setUser({
      name: name.trim(),
      parentType,
      hood: hood.trim(),
      kidAges: [...ages],
      tags: [...tags],
      bio: bio.trim(),
      avatarUri,
    });

    router.replace(inLaunchArea ? "/(tabs)/discover" : "/not-in-your-area");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <H1>Set up your profile</H1>
        <Sub style={{ marginTop: 6, marginBottom: 24 }}>
          This is what nearby parents see. Kids are shown as age ranges only.
        </Sub>

        {/* profile photo — required */}
        <Pressable onPress={pickPhoto} style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Ionicons name="camera-outline" size={26} color={C.pine} />
              <Text style={styles.avatarText}>Add photo</Text>
            </View>
          )}
        </Pressable>
        <Sub style={{ textAlign: "center", fontSize: 12, marginBottom: 24 }}>
          Required — every upload is moderated and location data is removed.
        </Sub>

        <Field label="Name (first name + last initial)">
          <Input value={name} onChangeText={setName} placeholder="Vincent R." />
        </Field>

        <Field label="I'm a single…">
          <View style={styles.chipRow}>
            {PARENT_TYPES.map((t) => (
              <Chip
                key={t}
                label={t}
                active={parentType === t}
                onPress={() => setParentType(t)}
              />
            ))}
          </View>
        </Field>

        <Field label="Neighborhood (never your exact address)">
          <Input value={hood} onChangeText={setHood} placeholder="Grant Park" />
        </Field>

        <Field label="Kids' age ranges">
          <View style={styles.chipRow}>
            {AGE_RANGES.map((a) => (
              <Chip
                key={a}
                label={a}
                active={ages.has(a)}
                onPress={() => toggle(setAges)(a)}
              />
            ))}
          </View>
        </Field>

        <Field label="Interests">
          <View style={[styles.chipRow, { flexWrap: "wrap", rowGap: 8 }]}>
            {INTERESTS.map((t) => (
              <Chip
                key={t}
                label={t}
                active={tags.has(t)}
                onPress={() => toggle(setTags)(t)}
              />
            ))}
          </View>
        </Field>

        <Field label="Short bio (optional)">
          <Input
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={{ height: 84, textAlignVertical: "top" }}
            placeholder="A line or two about you and your crew"
          />
        </Field>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Join the village" onPress={finish} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 24 },
  avatarWrap: { alignSelf: "center", marginBottom: 8 },
  avatar: { width: 108, height: 108, borderRadius: 36 },
  avatarEmpty: {
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.line,
    borderStyle: "dashed",
  },
  avatarText: { fontSize: 12, fontWeight: "700", color: C.pine, marginTop: 4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  error: { color: C.coral, fontWeight: "600", marginBottom: 14 },
});
