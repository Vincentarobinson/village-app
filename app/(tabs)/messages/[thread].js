import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../components/ui";
import { THREADS, MESSAGES } from "../../../lib/mock";
import { C } from "../../../lib/theme";

/*
 * Chat — scaffold uses mock messages; production uses Supabase
 * Realtime channels (threads / thread_members / messages tables).
 * Text + one image per message; block & report on every thread.
 */
export default function Thread() {
  const { thread: threadId } = useLocalSearchParams();
  const router = useRouter();
  const t = THREADS.find((x) => x.id === String(threadId));
  const [msgs, setMsgs] = React.useState(MESSAGES[String(threadId)] || []);
  const [draft, setDraft] = React.useState("");

  if (!t) return null;

  function send() {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { me: true, text: draft.trim() }]);
    setDraft("");
  }

  function threadActions() {
    Alert.alert(t.name, "Thread options", [
      { text: "Report", onPress: () => Alert.alert("Reported", "Thanks — our team will review this conversation.") },
      { text: "Block", style: "destructive", onPress: () => Alert.alert("Blocked", "You won't see each other on Village.") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={17} color={C.ink} />
        </Pressable>
        <Avatar initials={t.initials} hue={t.hue} size={38} />
        <Text style={styles.name}>{t.name}</Text>
        <Pressable onPress={threadActions} style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={C.sub} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <FlatList
          data={msgs}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.msgs}
          renderItem={({ item: m }) => (
            <View
              style={[
                styles.bubble,
                m.me ? styles.bubbleMe : styles.bubbleThem,
              ]}
            >
              <Text style={[styles.bubbleText, m.me && { color: "#fff" }]}>
                {m.text}
              </Text>
            </View>
          )}
        />

        <View style={styles.composer}>
          <Pressable
            style={styles.imgBtn}
            onPress={() =>
              Alert.alert(
                "Add a photo",
                "Image messages run through the same moderation + location-stripping pipeline as every Village upload. (Wired in the photo-pipeline milestone.)"
              )
            }
          >
            <Ionicons name="image-outline" size={20} color={C.sub} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            placeholder="Message…"
            placeholderTextColor={`${C.sub}99`}
            style={styles.input}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={styles.sendBtn}>
            <Ionicons name="send" size={16} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { flex: 1, fontWeight: "800", fontSize: 15.5, color: C.ink },
  moreBtn: { padding: 6 },
  msgs: { padding: 18, gap: 8 },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  bubbleMe: { alignSelf: "flex-end", backgroundColor: C.pine },
  bubbleThem: { alignSelf: "flex-start", backgroundColor: "#fff" },
  bubbleText: {
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 19,
    color: C.ink,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    paddingBottom: 14,
  },
  imgBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 999,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: C.ink,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.coral,
    alignItems: "center",
    justifyContent: "center",
  },
});
