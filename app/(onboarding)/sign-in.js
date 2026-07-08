import * as React from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Field, H1, Sub } from "../../components/ui";
import { supabase } from "../../lib/supabase";
import { C } from "../../lib/theme";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) return setError(err.message);
    router.replace("/(tabs)/discover");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrap}
      >
        <H1>Welcome back</H1>
        <Sub style={{ marginTop: 6, marginBottom: 28 }}>
          Sign in to get back to your village.
        </Sub>

        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <Input value={password} onChangeText={setPassword} secureTextEntry />
        </Field>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Sign in" onPress={handleSignIn} loading={loading} />
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
