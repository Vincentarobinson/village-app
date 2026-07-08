import { supabase } from "./supabase";

/* ------------------------------------------------------------------ */
/* Real data layer — profiles, discover (PostGIS), connections, chat.  */
/* Screens fall back to lib/mock.js when there's no session.           */
/* ------------------------------------------------------------------ */

/* ---------- profiles ---------- */

export async function uploadAvatar(userId, uri) {
  const resp = await fetch(uri);
  const arrayBuffer = await resp.arrayBuffer();
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveProfile({
  displayName,
  parentType, // "mom" | "dad" | "parent"
  bio,
  neighborhood, // { name, lat, lng }
  tags,
  ageRanges,
  avatarUrl,
}) {
  const { error } = await supabase.rpc("upsert_my_profile", {
    p_display_name: displayName,
    p_parent_type: parentType,
    p_bio: bio || null,
    p_neighborhood: neighborhood?.name || null,
    p_lat: neighborhood?.lat ?? null,
    p_lng: neighborhood?.lng ?? null,
    p_tags: tags || [],
    p_age_ranges: ageRanges || [],
    p_avatar_url: avatarUrl || null,
  });
  if (error) throw error;
}

export async function getMyProfile() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*, kids_meta(age_range)")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* Replace all profile photos (first photo = avatar). uris = local file uris. */
export async function saveProfilePhotos(userId, uris) {
  const urls = [];
  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    if (uri.startsWith("http")) {
      urls.push(uri); // already uploaded
      continue;
    }
    const resp = await fetch(uri);
    const buf = await resp.arrayBuffer();
    const path = `${userId}/photo-${Date.now()}-${i}.jpg`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, buf, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  await supabase.from("profile_photos").delete().eq("user_id", userId);
  if (urls.length) {
    const { error } = await supabase
      .from("profile_photos")
      .insert(urls.map((url, position) => ({ user_id: userId, url, position })));
    if (error) throw error;
  }
  return urls;
}

/* One parent's full public profile (for the detail screen). */
export async function getParentProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, kids_meta(age_range), profile_photos(url, position)")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    photos: (data.profile_photos || [])
      .sort((a, b) => a.position - b.position)
      .map((p) => p.url),
    ageRanges: (data.kids_meta || []).map((k) => k.age_range),
  };
}

/* ---------- discover (PostGIS) ---------- */

export async function fetchNearbyParents({ lat, lng, radiusMi, who }) {
  const { data, error } = await supabase.rpc("nearby_parents", {
    p_lat: lat,
    p_lng: lng,
    p_radius_mi: radiusMi,
    p_who: who, // 'all' | 'mom' | 'dad'
  });
  if (error) throw error;
  return data || [];
}

/* ---------- connections ---------- */

export async function requestConnection(addresseeId) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("connections").insert({
    requester_id: auth.user.id,
    addressee_id: addresseeId,
  });
  if (error && error.code !== "23505") throw error; // ignore duplicate
}

export async function fetchMyConnections() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return [];
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${auth.user.id},addressee_id.eq.${auth.user.id}`);
  if (error) throw error;
  return data || [];
}

export async function acceptConnection(connectionId) {
  const { data, error } = await supabase.rpc("accept_connection", {
    conn_id: connectionId,
  });
  if (error) throw error;
  return data; // new thread id
}

export async function ignoreConnection(connectionId) {
  const { error } = await supabase
    .from("connections")
    .update({ status: "ignored" })
    .eq("id", connectionId);
  if (error) throw error;
}

/* ---------- meetups ---------- */

export async function fetchMeetups() {
  const { data: auth } = await supabase.auth.getUser();
  const [{ data: meetups, error }, { data: myRsvps }] = await Promise.all([
    supabase
      .from("meetups")
      .select("*, rsvps(count), host:profiles!meetups_host_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("rsvps").select("meetup_id").eq("user_id", auth.user.id),
  ]);
  if (error) throw error;
  const mine = new Set((myRsvps || []).map((r) => r.meetup_id));
  return (meetups || []).map((m) => ({
    ...m,
    going: m.rsvps?.[0]?.count ?? 0,
    iAmGoing: mine.has(m.id),
    hostName: m.host?.display_name || "A parent",
  }));
}

export async function createMeetup({
  title,
  kind,
  whenText,
  placeName,
  neighborhood,
  capacity,
  kidsWelcome,
  visibility,
}) {
  const { data, error } = await supabase.rpc("create_meetup", {
    p_title: title,
    p_kind: kind,
    p_when_text: whenText,
    p_place_name: placeName,
    p_neighborhood: neighborhood || null,
    p_capacity: capacity || null,
    p_kids_welcome: kidsWelcome,
    p_visibility: visibility,
  });
  if (error) throw error;
  return data; // meetup id
}

export async function rsvpMeetup(meetupId) {
  const { data, error } = await supabase.rpc("rsvp_meetup", {
    p_meetup_id: meetupId,
  });
  if (error) throw error;
  return data; // thread id
}

export async function cancelRsvp(meetupId) {
  const { error } = await supabase.rpc("cancel_rsvp", {
    p_meetup_id: meetupId,
  });
  if (error) throw error;
}

/* ---------- chat (Supabase Realtime) ---------- */

export async function fetchThreads() {
  const { data, error } = await supabase
    .from("threads")
    .select("id, kind, created_at, thread_members(user_id, profiles(display_name, avatar_url))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchMessages(threadId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw error;
  return data || [];
}

export async function sendMessage(threadId, body) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: auth.user.id,
    body,
  });
  if (error) throw error;
}

/* Live inserts for one thread. Returns unsubscribe fn. */
export function subscribeToThread(threadId, onMessage) {
  const channel = supabase
    .channel(`thread-${threadId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => onMessage(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
