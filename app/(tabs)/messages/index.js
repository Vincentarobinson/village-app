import * as React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Card, H1, Sub } from "../../../components/ui";
import { THREADS } from "../../../lib/mock";
import { C } from "../../../lib/theme";

export default function Messages() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <H1>Messages</H1>
        <Sub style={{ marginTop: 4 }}>
          Chats open once a connection is mutual.
        </Sub>
      </View>
      <FlatList
        data={THREADS}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: t }) => (
          <Pressable onPress={() => router.push(`/messages/${t.id}`)}>
            <Card style={styles.thread}>
              <Avatar initials={t.initials} hue={t.hue} size={46} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.row}>
                  <Text style={styles.name}>{t.name}</Text>
                  <Sub style={{ fontSize: 11.5 }}>{t.time}</Sub>
                </View>
                <Sub numberOfLines={1} style={{ marginTop: 2 }}>
                  {t.last}
                </Sub>
              </View>
              {t.unread > 0 && (
                <View style={styles.unread}>
                  <Text style={styles.unreadText}>{t.unread}</Text>
                </View>
              )}
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8 },
  list: { padding: 18 },
  thread: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 14,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontWeight: "800", fontSize: 14.5, color: C.ink },
  unread: {
    backgroundColor: C.coral,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});
