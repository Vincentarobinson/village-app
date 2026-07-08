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
import { Button, Input, Field, H1, Sub, Chip } from "../../../components/ui";
import { useAppState } from "../../../lib/app-state";
import { NEIGHBORHOODS, findNeighborhood } from "../../../lib/neighborhoods";
import { saveProfile, saveProfilePhotos, getMyProfile } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { C } from "../../../lib/theme";

const MAX_PHOTOS = 5;
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

/* Edit profile — including your photos, anytime (not just onboarding). */
export default function EditProfile() {
  const router = useRouter();
  const { session, myProfile, setMyProfile } = useAppState();

  const [photos, setPhotos] = React.useState([]); // mix of https urls + new local uris
  const [name, setName] = React.useState("");
  const [hood, setHood] = React.useState(null);
  const [ages, setAges] = React.useState(new Set());
  const [tags, setTags] = React.useState(new Set());
  const [bio, setBio] = React.useState("");
  const [parentType, setParentType] = React.useState("mom");
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      if (!session) {
        setLoaded(true);
        return;
      }
      try {
        const { data: auth } = await supabase.auth.getUser();
        const p = myProfile || (await getMyProfile());
        if (p) {
          setName(p.display_name || "");
          setHood(p.neighborhood || null);
          setBio(p.bio || "");
          setParentType(p.parent_type || "mom");
          setTags(new Set(p.tags || []));
          setAges(new Set((p.kids_meta || []).map((k) => k.age_range)));
        }
        const { data: ph } = await supabase
          .from("profile_photos")
          .select("url, position")
          .eq("user_id", auth.user.id)
          .order("position");
        setPhotos((ph || []).map((x) => x.url));
      } catch {
        /* fall through */
      } finally {
        setLoaded(true);
      }
    })();
  }, [session]);

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
      exif: false,
    });
    if (!res.canceled) setPhotos((p) => [...p, res.assets[0].uri]);
  }

  function removePhoto(i) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  function makeMain(i) {
    setPhotos((p) => [p[i], ...p.filter((_, idx) => idx !== i)]);
  }

  async function save() {
    setError("");
    if (photos.length === 0)
      return setError("Keep at least one photo — profiles need one on Village.");
    if (!name.trim()) return setError("Your name can't be empty.");
    if (!session) return setError("Sign in to edit your profile.");

    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uploaded = await saveProfilePhotos(auth.user.id, photos);
      await saveProfile({
        displayName: name.trim(),
        parentType,
        bio: bio.trim(),
        neighborhood: findNeighborhood(hood) || null,
        tags: [...tags],
        ageRanges: [...ages],
        avatarUrl: uploaded[0] || null,
      });
      const p = await getMyProfile();
      setMyProfile(p);
      router.back();
    } catch (e) {
      setError(e.message || "Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
        <Sub style={{ textAlign: "center", padding: 40 }}>Loading…</Sub>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>

        <H1>Edit profile</H1>
        <Sub style={{ marginTop: 6, marginBottom: 24 }}>
          Tap a photo to make it your main one. Up to {MAX_PHOTOS} — parents
          swipe through them on your profile.
        </Sub>

        <Field label={`Photos (${photos.length}/${MAX_PHOTOS})`}>
          <View style={styles.photoRow}>
            {photos.map((uri, i) => (
              <Pressable key={uri + i} style={styles.photoCell} onPress={() => makeMain(i)}>
                <Image source={{ uri }} style={styles.photo} />
                {i === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                )}
                <Pressable style={styles.removeBtn} onPress={() => removePhoto(i)}>
                  <Ionicons name="close" size={12} color="#fff" />
                </Pressable>
              </Pressable>
            ))}
            {photos.length < MAX_PHOTOS && (
              <Pressable onPress={addPhoto} style={[styles.photoCell, styles.addCell]}>
                <Ionicons name="add" size={22} color={C.pine} />
              </Pressable>
            )}
          </View>
        </Field>

        <Field label="Name">
          <Input value={name} onChangeText={setName} />
        </Field>

        <Field label="Neighborhood">
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
          </View>
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

        <Field label="Bio">
          <Input
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={{ height: 84, textAlignVertical: "top" }}
          />
        </Field>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Save changes" onPress={save} loading={saving} />
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
    backgroundColor: "rgba(30,122,90,0.92)",
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
    backgroundColor: "rgba(26,29,28,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  error: { color: C.danger, fontWeight: "600", marginBottom: 14 },
});
