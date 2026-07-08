import * as React from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Field, H1, Sub } from "../../components/ui";
import { supabase } from "../../lib/supabase";
import { C } from "../../lib/theme";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSignUp() {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError("Enter a valid email.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) return setError(err.message);
    router.push("/(onboarding)/verify-identity");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrap}
      >
        <H1>Create your account</H1>
        <Sub style={{ marginTop: 6, marginBottom: 28 }}>
          Apple and Google sign-in are coming; email works everywhere.
        </Sub>

        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="8+ characters"
          />
        </Field>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Continue" onPress={handleSignUp} loading={loading} />
        <Button
          title="Back"
          variant="tint"
          style={{ marginTop: 10 }}
          onPress={() => router.back()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  error: { color: C.danger, fontWeight: "600", marginBottom: 14 },
});
