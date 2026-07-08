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
import { useAppState } from "../../../lib/app-state";
import { fetchMessages, sendMessage, subscribeToThread } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { C } from "../../../lib/theme";

/*
 * Chat. Live mode: Supabase Realtime (postgres_changes on messages).
 * Demo mode (no session / mock thread id): local mock messages.
 */
export default function Thread() {
  const { thread: threadId } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAppState();
  const id = String(threadId);
  const isMock = !session || MESSAGES[id] !== undefined;

  const mockThread = THREADS.find((x) => x.id === id);
  const [msgs, setMsgs] = React.useState(isMock ? MESSAGES[id] || [] : null);
  const [draft, setDraft] = React.useState("");
  const [myId, setMyId] = React.useState(null);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    if (isMock) return;
    let unsub = () => {};
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setMyId(auth?.user?.id || null);
      try {
        const initial = await fetchMessages(id);
        setMsgs(initial);
      } catch {
        setMsgs([]);
      }
      unsub = subscribeToThread(id, (m) =>
        setMsgs((prev) => {
          if ((prev || []).some((x) => x.id === m.id)) return prev;
          return [...(prev || []), m];
        })
      );
    })();
    return () => unsub();
  }, [id, isMock]);

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (isMock) {
      setMsgs((m) => [...m, { me: true, text }]);
      return;
    }
    try {
      await sendMessage(id, text);
      // realtime insert will echo it back
    } catch {
      Alert.alert("Couldn't send", "Check your connection and try again.");
      setDraft(text);
    }
  }

  function threadActions() {
    Alert.alert("Thread options", "", [
      { text: "Report", onPress: () => Alert.alert("Reported", "Thanks — our team will review this conversation.") },
      { text: "Block", style: "destructive", onPress: () => Alert.alert("Blocked", "You won't see each other on Village.") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  const title = mockThread?.name || "Conversation";
  const initials = mockThread?.initials || title.slice(0, 2).toUpperCase();
  const hue = mockThread?.hue || C.pine;

  const isMine = (m) => (isMock ? m.me : m.sender_id === myId);
  const textOf = (m) => (isMock ? m.text : m.body);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={17} color={C.ink} />
        </Pressable>
        <Avatar initials={initials} hue={hue} size={38} />
        <Text style={styles.name}>{title}</Text>
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
          ref={listRef}
          data={msgs || []}
          keyExtractor={(m, i) => String(m.id || i)}
          contentContainerStyle={styles.msgs}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          renderItem={({ item: m }) => (
            <View
              style={[
                styles.bubble,
                isMine(m) ? styles.bubbleMe : styles.bubbleThem,
              ]}
            >
              <Text style={[styles.bubbleText, isMine(m) && { color: "#fff" }]}>
                {textOf(m)}
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
