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
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Field, H1, Sub, Chip } from "../../components/ui";
import { useAppState } from "../../lib/app-state";
import {
  NEIGHBORHOODS,
  findNeighborhood,
  fuzzCoords,
} from "../../lib/neighborhoods";
import { saveProfile, saveProfilePhotos, getMyProfile } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { C } from "../../lib/theme";

const MAX_PHOTOS = 5;
const PARENT_TYPES = [
  { label: "Mom", value: "mom" },
  { label: "Dad", value: "dad" },
  { label: "Parent", value: "parent" },
];
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
  const { setUser, setMyProfile, inLaunchArea } = useAppState();

  const [photos, setPhotos] = React.useState([]); // local uris, first = main
  const [name, setName] = React.useState("");
  const [parentType, setParentType] = React.useState("mom");
  const [hood, setHood] = React.useState(null); // selected list name or "other"
  const [customHood, setCustomHood] = React.useState("");
  const [customCoords, setCustomCoords] = React.useState(null); // fuzzed
  const [locBusy, setLocBusy] = React.useState(false);
  const [ages, setAges] = React.useState(new Set());
  const [tags, setTags] = React.useState(new Set());
  const [bio, setBio] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const toggle = (setter) => (v) =>
    setter((prev) => {
      const n = new Set(prev);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });

  async function addPhoto() {
    if (photos.length >= MAX_PHOTOS) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
      exif: false, // location metadata never enters the app
    });
    if (!res.canceled) setPhotos((p) => [...p, res.assets[0].uri]);
  }

  function removePhoto(i) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  async function useMyLocation() {
    setError("");
    setLocBusy(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission declined — you can pick a neighborhood from the list instead.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      // Privacy: round to ~1km grid before it ever leaves this function.
      setCustomCoords(fuzzCoords(pos.coords.latitude, pos.coords.longitude));
    } catch {
      setError("Couldn't get your location — pick from the list instead.");
    } finally {
      setLocBusy(false);
    }
  }

  async function finish() {
    setError("");
    if (photos.length === 0)
      return setError("At least one profile photo is required on Village.");
    if (!name.trim()) return setError("Add your first name and last initial.");

    let neighborhood;
    if (hood === "other") {
      if (!customHood.trim())
        return setError("Type your neighborhood or area name.");
      if (!customCoords)
        return setError('Tap "Use my approximate location" so parents nearby can find you.');
      neighborhood = { name: customHood.trim(), ...customCoords };
    } else if (hood) {
      neighborhood = findNeighborhood(hood);
    } else {
      return setError("Pick your neighborhood.");
    }

    if (ages.size === 0) return setError("Select your kids' age range(s).");

    setUser({
      name: name.trim(),
      parentType,
      hood: neighborhood.name,
      kidAges: [...ages],
      tags: [...tags],
      bio: bio.trim(),
      avatarUri: photos[0],
    });

    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        let uploaded = [];
        try {
          uploaded = await saveProfilePhotos(auth.user.id, photos);
        } catch {
          // photos are retryable from Me tab; don't block onboarding
        }
        await saveProfile({
          displayName: name.trim(),
          parentType,
          bio: bio.trim(),
          neighborhood,
          tags: [...tags],
          ageRanges: [...ages],
          avatarUrl: uploaded[0] || null,
        });
        const p = await getMyProfile();
        setMyProfile(p);
      }
      router.replace(inLaunchArea ? "/(tabs)/discover" : "/not-in-your-area");
    } catch (e) {
      setError(e.message || "Couldn't save your profile — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <H1>Set up your profile</H1>
        <Sub style={{ marginTop: 6, marginBottom: 24 }}>
          This is what nearby parents see. Kids are shown as age ranges only.
        </Sub>

        {/* photos — first is your main photo, up to 5, swipeable on your profile */}
        <Field label={`Photos (${photos.length}/${MAX_PHOTOS} — first is your main photo)`}>
          <View style={styles.photoRow}>
            {photos.map((uri, i) => (
              <View key={uri + i} style={styles.photoCell}>
                <Image source={{ uri }} style={styles.photo} />
                {i === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                )}
                <Pressable style={styles.removeBtn} onPress={() => removePhoto(i)}>
                  <Ionicons name="close" size={12} color="#fff" />
                </Pressable>
              </View>
            ))}
            {photos.length < MAX_PHOTOS && (
              <Pressable onPress={addPhoto} style={[styles.photoCell, styles.addCell]}>
                <Ionicons name="add" size={22} color={C.pine} />
              </Pressable>
            )}
          </View>
          <Sub style={{ fontSize: 12, marginTop: 6 }}>
            At least one required. Every upload is moderated and location data
            is removed automatically.
          </Sub>
        </Field>

        <Field label="Name (first name + last initial)">
          <Input value={name} onChangeText={setName} placeholder="Vincent R." />
        </Field>

        <Field label="I'm a single…">
          <View style={styles.chipRow}>
            {PARENT_TYPES.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                active={parentType === t.value}
                onPress={() => setParentType(t.value)}
              />
            ))}
          </View>
        </Field>

        <Field label="Neighborhood (never your exact address)">
          <View style={[styles.chipRow, { flexWrap: "wrap" }]}>
            {NEIGHBORHOODS.map((n) => (
              <View key={n.name} style={{ marginBottom: 8 }}>
                <Chip
                  label={n.name}
                  active={hood === n.name}
                  onPress={() => setHood(n.name)}
                />
              </View>
            ))}
            <View style={{ marginBottom: 8 }}>
              <Chip
                label="Other…"
                active={hood === "other"}
                onPress={() => setHood("other")}
              />
            </View>
          </View>

          {hood === "other" && (
            <View style={styles.otherBox}>
              <Input
                value={customHood}
                onChangeText={setCustomHood}
                placeholder="Your neighborhood or area (e.g. Smyrna)"
              />
              <Pressable
                onPress={useMyLocation}
                style={[styles.locBtn, customCoords && styles.locBtnDone]}
              >
                <Ionicons
                  name={customCoords ? "checkmark-circle" : "navigate-outline"}
                  size={16}
                  color={customCoords ? "#fff" : C.pine}
                />
                <Text style={[styles.locBtnText, customCoords && { color: "#fff" }]}>
                  {locBusy
                    ? "Getting approximate area…"
                    : customCoords
                    ? "Approximate area saved"
                    : "Use my approximate location"}
                </Text>
              </Pressable>
              <Sub style={{ fontSize: 11.5, marginTop: 8 }}>
                We round your location to about a 1-km area so neighbors can
                find you by distance — your exact location is never stored or
                shown.
              </Sub>
            </View>
          )}
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
          <View style={[styles.chipRow, { flexWrap: "wrap" }]}>
            {INTERESTS.map((t) => (
              <View key={t} style={{ marginBottom: 8 }}>
                <Chip
                  label={t}
                  active={tags.has(t)}
                  onPress={() => toggle(setTags)(t)}
                />
              </View>
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

        <Button title="Join the village" onPress={finish} loading={saving} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 24 },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoCell: {
    width: 76,
    height: 95,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  photo: { width: "100%", height: "100%" },
  addCell: {
    backgroundColor: C.pineTint,
    borderWidth: 1.5,
    borderColor: C.line,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(30,77,66,0.9)",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  mainBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(34,51,59,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  otherBox: { marginTop: 10 },
  locBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: C.pine,
    paddingVertical: 11,
  },
  locBtnDone: { backgroundColor: C.pine, borderColor: C.pine },
  locBtnText: { fontSize: 13.5, fontWeight: "700", color: C.pine },
  error: { color: C.danger, fontWeight: "600", marginBottom: 14 },
});
