import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Card, Chip, Sub } from "../../../components/ui";
import { PARENTS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { fetchNearbyParents, requestConnection, getMyProfile } from "../../../lib/api";
import { findNeighborhood } from "../../../lib/neighborhoods";
import { C } from "../../../lib/theme";

const WHO = [
  { label: "All", value: "all" },
  { label: "Moms", value: "mom" },
  { label: "Dads", value: "dad" },
];

/* Mock rows shaped like the RPC result, for logged-out demo mode. */
const MOCK_ROWS = PARENTS.map((p) => ({
  user_id: `mock-${p.id}`,
  display_name: p.name,
  avatar_url: null,
  parent_type: p.type.toLowerCase(),
  neighborhood: p.hood,
  tags: p.tags,
  dist_mi: p.dist,
  age_ranges: [p.kids.replace(/Kids? /, "")],
  photos: [],
  _initials: p.initials,
  _hue: p.hue,
  _mockId: p.id,
}));

export default function Discover() {
  const router = useRouter();
  const { session, myProfile, setMyProfile, connections, toggleConnection } =
    useAppState();
  const [who, setWho] = React.useState("all");
  const [radius, setRadius] = React.useState(5);
  const [showFilters, setShowFilters] = React.useState(false);
  const [rows, setRows] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [live, setLive] = React.useState(false);
  const [requested, setRequested] = React.useState(new Set());

  const load = React.useCallback(async () => {
    if (!session) {
      setRows(MOCK_ROWS);
      setLive(false);
      return;
    }
    try {
      let profile = myProfile;
      if (!profile) {
        profile = await getMyProfile();
        if (profile) setMyProfile(profile);
      }
      const centroid = findNeighborhood(profile?.neighborhood);
      if (!centroid) {
        setRows(MOCK_ROWS);
        setLive(false);
        return;
      }
      const data = await fetchNearbyParents({
        lat: centroid.lat,
        lng: centroid.lng,
        radiusMi: radius,
        who,
      });
      setRows(data);
      setLive(true);
    } catch {
      setRows(MOCK_ROWS);
      setLive(false);
    }
  }, [session, myProfile, radius, who]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function connect(row) {
    if (!live) {
      toggleConnection(row._mockId);
      return;
    }
    setRequested((prev) => new Set(prev).add(row.user_id));
    try {
      await requestConnection(row.user_id);
    } catch {
      setRequested((prev) => {
        const n = new Set(prev);
        n.delete(row.user_id);
        return n;
      });
    }
  }

  const list = (rows || []).filter(
    (r) =>
      (who === "all" || r.parent_type === who) &&
      (live || r.dist_mi <= radius)
  );

  const firstName = (
    myProfile?.display_name ||
    "there"
  ).split(" ")[0];
  const hood = live
    ? myProfile?.neighborhood || "Your neighborhood"
    : "Grant Park, Atlanta";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        {/* greeting row */}
        <View style={styles.greetRow}>
          <View>
            <Text style={styles.greeting}>Hi, {firstName}</Text>
            <View style={styles.locRow}>
              <Ionicons name="location" size={12} color={C.pine} />
              <Sub style={{ fontSize: 12.5 }}>
                {" "}{hood} · {radius} mi{live ? "" : " · demo"}
              </Sub>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/discover/requests")}
            style={styles.requestsBtn}
          >
            <Ionicons name="person-add-outline" size={17} color={C.pine} />
          </Pressable>
        </View>

        <View style={styles.chips}>
          {WHO.map((w) => (
            <Chip
              key={w.value}
              label={w.label}
              active={who === w.value}
              onPress={() => setWho(w.value)}
            />
          ))}
          <Chip
            label={`Within ${radius} mi`}
            active={showFilters}
            onPress={() => setShowFilters(!showFilters)}
          />
        </View>

        {showFilters && (
          <Card style={{ marginTop: 12, paddingVertical: 14 }}>
            <Text style={styles.filterLabel}>Distance: {radius} miles</Text>
            <Slider
              minimumValue={1}
              maximumValue={15}
              step={1}
              value={radius}
              onSlidingComplete={setRadius}
              minimumTrackTintColor={C.pine}
              maximumTrackTintColor={C.line}
              thumbTintColor={C.pine}
            />
          </Card>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={(r) => String(r.user_id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Parents near you</Text>
        }
        ListEmptyComponent={
          rows === null ? (
            <Sub style={{ textAlign: "center", padding: 40 }}>Loading…</Sub>
          ) : (
            <Sub style={{ textAlign: "center", padding: 40 }}>
              {live
                ? "No parents in range yet — widen the distance, or invite someone you know."
                : "No parents match those filters yet. Try widening the distance."}
            </Sub>
          )
        }
        renderItem={({ item: r }) => {
          const isRequested = live
            ? requested.has(r.user_id)
            : connections.has(r._mockId);
          const kidsLabel =
            r.age_ranges && r.age_ranges.length
              ? `Kids ${r.age_ranges.join(" & ")}`
              : "Parent";
          const photo = (r.photos && r.photos[0]) || r.avatar_url;
          return (
            <Pressable
              onPress={() =>
                router.push(
                  live ? `/discover/${r.user_id}` : `/discover/${r._mockId}`
                )
              }
            >
              <Card style={styles.parentCard}>
                {/* photo-forward left column */}
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.parentPhoto} />
                ) : (
                  <View style={[styles.parentPhoto, styles.parentPhotoEmpty]}>
                    <Avatar
                      initials={
                        r._initials ||
                        r.display_name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      }
                      hue={r._hue || C.pine}
                      size={54}
                    />
                  </View>
                )}

                <View style={styles.parentBody}>
                  <View style={styles.nameRow}>
                    <View style={styles.nameWrap}>
                      <Text style={styles.name} numberOfLines={1}>
                        {r.display_name}
                      </Text>
                      <Ionicons name="shield-checkmark" size={13} color={C.pine} />
                    </View>
                    <Text style={styles.dist}>{r.dist_mi} mi</Text>
                  </View>
                  <Sub style={{ fontSize: 12.5, marginTop: 2 }} numberOfLines={1}>
                    Single {r.parent_type} · {kidsLabel}
                  </Sub>
                  <Sub style={{ fontSize: 12.5 }} numberOfLines={1}>
                    {r.neighborhood}
                  </Sub>

                  <View style={styles.cardFooter}>
                    <Text style={styles.tagLine} numberOfLines={1}>
                      {(r.tags || []).slice(0, 2).join(" · ")}
                    </Text>
                    <Pressable
                      onPress={() => connect(r)}
                      style={[
                        styles.connectBtn,
                        isRequested && styles.connectBtnDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.connectText,
                          isRequested && { color: C.pine },
                        ]}
                      >
                        {isRequested ? "Requested" : "Connect"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 10 },
  greetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 30,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.8,
  },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  requestsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: { flexDirection: "row", marginTop: 16 },
  filterLabel: { fontSize: 13, fontWeight: "800", color: C.ink, marginBottom: 6 },
  list: { padding: 18, paddingTop: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.sub,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  parentCard: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 12,
    gap: 12,
  },
  parentPhoto: {
    width: 92,
    height: 112,
    borderRadius: 12,
  },
  parentPhotoEmpty: {
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
  },
  parentBody: { flex: 1, paddingVertical: 4, paddingRight: 4 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  name: { fontWeight: "800", fontSize: 16.5, color: C.ink, flexShrink: 1 },
  dist: { fontSize: 12, fontWeight: "700", color: C.sub },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    gap: 8,
  },
  tagLine: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "700",
    color: C.pine,
  },
  connectBtn: {
    backgroundColor: C.ink,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  connectBtnDone: { backgroundColor: C.pineTint },
  connectText: { color: "#fff", fontWeight: "800", fontSize: 12.5 },
});
