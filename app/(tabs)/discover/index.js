import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Card, Chip, H1, Sub, Tag } from "../../../components/ui";
import { PARENTS } from "../../../lib/mock";
import { useAppState } from "../../../lib/app-state";
import { C } from "../../../lib/theme";

const WHO = ["All", "Moms", "Dads"];

export default function Discover() {
  const router = useRouter();
  const { connections, toggleConnection } = useAppState();
  const [who, setWho] = React.useState("All");
  const [radius, setRadius] = React.useState(5);
  const [showFilters, setShowFilters] = React.useState(false);

  const list = PARENTS.filter(
    (p) =>
      (who === "All" ||
        (who === "Moms" && p.type === "Mom") ||
        (who === "Dads" && p.type === "Dad")) &&
      p.dist <= radius
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.locRow}>
          <Ionicons name="location" size={13} color={C.coral} />
          <Sub style={{ fontSize: 12.5 }}>
            {" "}Grant Park, Atlanta · within {radius} mi
          </Sub>
        </View>
        <H1>Parents near you</H1>

        <View style={styles.chips}>
          {WHO.map((w) => (
            <Chip key={w} label={w} active={who === w} onPress={() => setWho(w)} />
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
              onValueChange={setRadius}
              minimumTrackTintColor={C.coral}
              maximumTrackTintColor={C.line}
              thumbTintColor={C.coral}
            />
          </Card>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Sub style={{ textAlign: "center", padding: 40 }}>
            No parents match those filters yet. Try widening the distance.
          </Sub>
        }
        renderItem={({ item: p }) => {
          const isConn = connections.has(p.id);
          return (
            <Pressable onPress={() => router.push(`/discover/${p.id}`)}>
              <Card style={{ marginBottom: 12 }}>
                <View style={styles.cardTop}>
                  <Avatar initials={p.initials} hue={p.hue} size={52} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{p.name}</Text>
                      <Sub style={{ fontSize: 12 }}>{p.dist} mi</Sub>
                    </View>
                    <Sub style={{ marginTop: 2 }}>
                      Single {p.type.toLowerCase()} · {p.kids} · {p.hood}
                    </Sub>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}>
                    {p.tags.map((t) => (
                      <Tag key={t} label={t} />
                    ))}
                  </View>
                  <Pressable
                    onPress={() => toggleConnection(p.id)}
                    style={[
                      styles.connectBtn,
                      { backgroundColor: isConn ? C.pineTint : C.coral },
                    ]}
                  >
                    <Text
                      style={{
                        color: isConn ? C.pine : "#fff",
                        fontWeight: "800",
                        fontSize: 13,
                      }}
                    >
                      {isConn ? "Requested ✓" : "Connect"}
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
  chips: { flexDirection: "row", marginTop: 14 },
  filterLabel: { fontSize: 13, fontWeight: "800", color: C.ink, marginBottom: 6 },
  list: { padding: 18, paddingTop: 16 },
  cardTop: { flexDirection: "row", alignItems: "center" },
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
