/*
 * Village design tokens — v2 "editorial" theme.
 * White canvas, ink-black actions, one emerald accent, yellow only
 * for highlights. Token names kept stable so screens restyle freely.
 */
export const C = {
  ink: "#1A1D1C",       // near-black: text + primary buttons
  pine: "#1E7A5A",      // emerald accent: active states, links, verified
  coral: "#1A1D1C",     // action color → now ink (black pills, Etsy-style)
  danger: "#D93A2B",    // errors, destructive
  butter: "#FFD666",    // highlight badges & banners only
  cream: "#FFFFFF",     // app background → white
  card: "#FFFFFF",
  sub: "#707875",       // secondary text
  line: "#ECEAE4",      // hairline borders
  pineTint: "#E9F2EC",  // soft green wash
  inactive: "#9AA19D",
  surface: "#F6F5F1",   // warm gray for wells/inputs
};

export const radii = {
  card: 18,
  input: 14,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: "#1A1D1C",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bar: {
    shadowColor: "#1A1D1C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
};
