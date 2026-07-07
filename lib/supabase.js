import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

/*
 * Supabase client — same `village` project as the landing page.
 * The anon key is safe to ship in the app: Row Level Security
 * controls all access.
 */
const SUPABASE_URL = "https://wspqqqreqcjbvxhrwsbe.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_7fxSpBu-kiqsKNAwUTvSRg_RuzgWYtn";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
