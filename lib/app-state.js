import * as React from "react";

/*
 * Lightweight app state for the scaffold.
 *
 * onboarding: "welcome" → "verify" → "profile" → done
 * verified:   ID-verification gate. STUBBED for now — flips true
 *             instantly. Wire Stripe Identity here before beta
 *             (see docs/INTEGRATIONS.md).
 * inLaunchArea: whether the user's neighborhood is live. Drives
 *             the not-in-your-area screen.
 */
const AppStateContext = React.createContext(null);

export function AppStateProvider({ children }) {
  const [user, setUser] = React.useState(null); // { name, parentType, hood, kidAges, tags, bio, avatarUri }
  const [verified, setVerified] = React.useState(false);
  const [inLaunchArea, setInLaunchArea] = React.useState(true);
  const [connections, setConnections] = React.useState(new Set([2]));
  const [rsvps, setRsvps] = React.useState(new Set([1]));

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
