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
import { Avatar, Card, Chip, H1, Sub, Tag } from "../../../components/ui";
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
  const [rows, setRows] = React.useState(null); // null = loading
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

  const hood = live
    ? myProfile?.neighborhood || "Your neighborhood"
    : "Grant Park, Atlanta";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.locRow}>
          <Ionicons name="location" size={13} color={C.pine} />
          <Sub style={{ fontSize: 12.5 }}>
            {" "}{hood} · within {radius} mi{live ? "" : " · demo data"}
          </Sub>
        </View>
        <View style={styles.titleRow}>
          <H1>Parents near you</H1>
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
            label="Filters"
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
              minimumTrackTintColor={C.coral}
              maximumTrackTintColor={C.line}
              thumbTintColor={C.coral}
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
          return (
            <Pressable
              onPress={() =>
                router.push(
                  live ? `/discover/${r.user_id}` : `/discover/${r._mockId}`
                )
              }
            >
              <Card style={{ marginBottom: 12 }}>
                <View style={styles.cardTop}>
                  {r.avatar_url ? (
                    <Image source={{ uri: r.avatar_url }} style={styles.avatarImg} />
                  ) : (
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
                      size={52}
                    />
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{r.display_name}</Text>
                      <Sub style={{ fontSize: 12 }}>{r.dist_mi} mi</Sub>
                    </View>
                    <Sub style={{ marginTop: 2 }}>
                      Single {r.parent_type} · {kidsLabel} · {r.neighborhood}
                    </Sub>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}>
                    {(r.tags || []).map((t) => (
                      <Tag key={t} label={t} />
                    ))}
                  </View>
                  <Pressable
                    onPress={() => connect(r)}
                    style={[
                      styles.connectBtn,
                      { backgroundColor: isRequested ? C.pineTint : C.coral },
                    ]}
                  >
                    <Text
                      style={{
                        color: isRequested ? C.pine : "#fff",
                        fontWeight: "800",
                        fontSize: 13,
                      }}
                    >
                      {isRequested ? "Requested ✓" : "Connect"}
                    </Text>
                  </Pressable>
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
  header: { paddingHorizontal: 18, paddingTop: 8 },
  locRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  requestsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: { flexDirection: "row", marginTop: 14 },
  filterLabel: { fontSize: 13, fontWeight: "800", color: C.ink, marginBottom: 6 },
  list: { padding: 18, paddingTop: 16 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  avatarImg: { width: 52, height: 52, borderRadius: 18 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  name: { fontWeight: "800", fontSize: 16, color: C.ink },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  connectBtn: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
