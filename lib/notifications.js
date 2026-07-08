import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

/*
 * Push notifications.
 * Server side is fully wired: Postgres triggers call the Expo push
 * API for new messages, connection requests/accepts, and RSVPs.
 *
 * Token registration needs an EAS project id — run `npx eas init`
 * once (free) and it lands in app.json automatically. Until then
 * registration silently no-ops.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPush() {
  try {
    if (!Device.isDevice) return null; // simulators can't receive push

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return null;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      console.log("[push] no EAS projectId yet — run `npx eas init`");
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Village",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await supabase.from("push_tokens").upsert({
      user_id: auth.user.id,
      token,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    });

    return token;
  } catch (e) {
    console.log("[push] registration skipped:", e.message);
    return null;
  }
}
