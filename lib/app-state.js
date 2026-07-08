import * as React from "react";
import { supabase } from "./supabase";

/*
 * App state.
 * - session/myProfile come from Supabase (real).
 * - verified: ID gate, stubbed until Stripe Identity (docs/INTEGRATIONS.md).
 * - inLaunchArea: drives the not-in-your-area screen.
 * - connections/rsvps Sets remain for optimistic UI + mock fallback.
 */
const AppStateContext = React.createContext(null);

export function AppStateProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [myProfile, setMyProfile] = React.useState(null);
  const [user, setUser] = React.useState(null); // local (pre-Supabase) profile draft
  const [verified, setVerified] = React.useState(false);
  const [inLaunchArea, setInLaunchArea] = React.useState(true);
  const [connections, setConnections] = React.useState(new Set());
  const [rsvps, setRsvps] = React.useState(new Set([1]));

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setMyProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggleConnection = (id) =>
    setConnections((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleRsvp = (id) =>
    setRsvps((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const value = {
    session,
    myProfile,
    setMyProfile,
    user,
    setUser,
    verified,
    setVerified,
    inLaunchArea,
    setInLaunchArea,
    connections,
    toggleConnection,
    rsvps,
    toggleRsvp,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
