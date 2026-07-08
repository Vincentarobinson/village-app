import * as React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { C, radii, shadow } from "../lib/theme";

/* ---------- shared UI primitives (Village design system) ---------- */

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H1({ children, style }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}

export function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Sub({ children, style }) {
  return <Text style={[styles.sub, style]}>{children}</Text>;
}

export function Body({ children, style }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Button({ title, onPress, variant = "coral", disabled, loading, style }) {
  const bg =
    variant === "coral" ? C.coral : variant === "pine" ? C.pine : C.pineTint;
  const fg = variant === "tint" ? C.pine : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? C.ink : "#fff",
          borderColor: active ? C.ink : C.line,
        },
      ]}
    >
      <Text
        style={[styles.chipText, { color: active ? "#fff" : C.ink }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export function Avatar({ initials, hue, size = 46 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.6,
        backgroundColor: hue || C.pine,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontWeight: "800",
          fontSize: size * 0.36,
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

export function Input(props) {
  return (
    <TextInput
      placeholderTextColor={`${C.sub}99`}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  card: {
    backgroundColor: C.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    ...shadow.card,
  },
  h1: {
    fontSize: 32,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: C.sub,
    marginTop: 18,
    marginBottom: 10,
  },
  sub: { fontSize: 13, color: C.sub, fontWeight: "600" },
  body: { fontSize: 15, color: C.ink, lineHeight: 22 },
  button: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontWeight: "800", fontSize: 15 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: "700" },
  tag: {
    backgroundColor: C.pineTint,
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 11.5, fontWeight: "700", color: C.pine },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radii.input,
    backgroundColor: C.surface,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    color: C.ink,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.sub,
    marginBottom: 6,
  },
});
