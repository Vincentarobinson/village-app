import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../lib/theme";

/*
 * Coming-soon state for Market sections that aren't live in v1
 * (Deals, Give & Get). Sitters are live from day one.
 */
export function ComingSoon({ icon = "storefront-outline", title, body }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={C.pine} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: C.ink,
    textAlign: "center",
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: C.sub,
    fontWeight: "600",
    textAlign: "center",
  },
  badge: {
    marginTop: 16,
    backgroundColor: C.butter,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  badgeText: { fontSize: 12, fontWeight: "800", color: "#8A6510" },
});
