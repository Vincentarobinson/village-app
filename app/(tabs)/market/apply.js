import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Field, H1, Sub, Card } from "../../../components/ui";
import { supabase } from "../../../lib/supabase";
import { C } from "../../../lib/theme";

/*
 * In-app sitter application — writes to the same `sitter_applications`
 * table as the website form. The background check itself (Checkr
 * Hosted Apply) is Phase 3; sitters pay the screening fee.
 */
export default function SitterApply() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    zip: "",
    rate: "",
    about: "",
  });
  const [consents, setConsents] = React.useState(false);
  const [status, setStatus] = React.useState("idle");
  const [error, setError] = React.useState("");

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setError("");
    if (!form.fullName.trim()) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return setError("Enter a valid email.");
    if (!consents)
      return setError("Background-check consent is required to apply.");

    setStatus("sending");
    const { error: err } = await supabase.from("sitter_applications").insert({
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      zip: /^\d{5}$/.test(form.zip) ? form.zip : null,
      hourly_rate: form.rate.trim() || null,
      about: form.about.trim() || null,
      consents_to_background_check: true,
    });
    if (err && err.code !== "23505") {
      setStatus("idle");
      return setError("Couldn't submit right now — try again.");
    }
    setStatus("done");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={C.ink} />
        </Pressable>

        {status === "done" ? (
          <View style={styles.doneWrap}>
            <View style={styles.doneIcon}>
              <Ionicons name="checkmark-circle" size={40} color={C.pine} />
            </View>
            <H1 style={{ textAlign: "center" }}>Application received</H1>
            <Sub style={styles.doneSub}>
              We&apos;ll reach out with your background-check invite as your
              area gets close to launch. You&apos;ll appear in the Sitters list
              once you pass.
            </Sub>
            <Button
              title="Back to Market"
              variant="tint"
              style={{ marginTop: 24 }}
              onPress={() => router.back()}
            />
          </View>
        ) : (
          <>
            <H1>Become a Village sitter</H1>
            <Sub style={{ marginTop: 6, marginBottom: 22 }}>
              Set your own rate. Pass one background check. Sit for families
              in your own neighborhood.
            </Sub>

            <Field label="Full name">
              <Input value={form.fullName} onChangeText={set("fullName")} />
            </Field>
            <Field label="Email">
              <Input
                value={form.email}
                onChangeText={set("email")}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Field>
            <Field label="ZIP">
              <Input
                value={form.zip}
                onChangeText={(v) => set("zip")(v.replace(/\D/g, ""))}
                keyboardType="number-pad"
                maxLength={5}
              />
            </Field>
            <Field label="Hourly rate (optional)">
              <Input
                value={form.rate}
                onChangeText={set("rate")}
                placeholder="$18/hr"
              />
            </Field>
            <Field label="About you (optional)">
              <Input
                value={form.about}
                onChangeText={set("about")}
                multiline
                numberOfLines={3}
                style={{ height: 84, textAlignVertical: "top" }}
                placeholder="CPR certified, 4 years with toddlers…"
              />
            </Field>

            <Pressable onPress={() => setConsents(!consents)}>
              <Card style={styles.consent}>
                <Ionicons
                  name={consents ? "checkbox" : "square-outline"}
                  size={20}
                  color={C.pine}
                />
                <Text style={styles.consentText}>
                  I understand Village sitters complete a professional
                  background check before going live, and that sitters cover
                  the one-time screening fee.
                </Text>
              </Card>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title="Submit application"
              loading={status === "sending"}
              style={{ marginTop: 8 }}
              onPress={submit}
            />
            <View style={{ height: 40 }} />
          </>
        )}
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
  consent: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: C.pineTint,
    marginBottom: 14,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: C.ink,
  },
  error: { color: C.danger, fontWeight: "600", marginBottom: 10 },
  doneWrap: { alignItems: "center", paddingTop: 60 },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: C.pineTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  doneSub: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 300,
  },
});
