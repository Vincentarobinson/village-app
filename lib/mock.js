/* Mock data for the scaffold — replaced by Supabase queries as flows are wired. */

export const PARENTS = [
  { id: 1, name: "Danielle R.", type: "Mom", kids: "Kids 4 & 7", dist: 0.8, hood: "Grant Park", tags: ["Weekend playdates", "Coffee walks"], initials: "DR", hue: "#E8734A", bio: "ATL native raising two wild ones. Always down for a park morning and good coffee." },
  { id: 2, name: "Marcus T.", type: "Dad", kids: "Kid 5", dist: 1.4, hood: "East Atlanta", tags: ["Park hangs", "Youth sports"], initials: "MT", hue: "#1E4D42", bio: "Single dad of a soccer-obsessed 5-year-old. Weekends are for the field." },
  { id: 3, name: "Ayesha K.", type: "Mom", kids: "Kids 2 & 6", dist: 2.1, hood: "Ormewood", tags: ["Toddler meetups", "Meal swaps"], initials: "AK", hue: "#7A5C9E", bio: "Meal-prep queen. Will trade lasagna for an hour of quiet." },
  { id: 4, name: "James B.", type: "Dad", kids: "Kids 8 & 10", dist: 3.2, hood: "Kirkwood", tags: ["Bike rides", "Game nights"], initials: "JB", hue: "#B0893B", bio: "Two boys, three bikes, endless energy. Game night host most Fridays." },
  { id: 5, name: "Renee W.", type: "Mom", kids: "Kid 3", dist: 4.6, hood: "Decatur", tags: ["New to area", "Library storytime"], initials: "RW", hue: "#C25B7C", bio: "Just moved from Chicago — my 3-year-old and I are looking for our people." },
];

export const MEETUPS = [
  { id: 1, title: "Saturday Park Playdate", when: "Sat, Jul 11 · 10:00 AM", where: "Grant Park Playground", going: 8, kind: "Kids + parents", host: "Danielle R.", desc: "Casual morning at the big playground. Snacks welcome, chaos guaranteed." },
  { id: 2, title: "Parents' Night Out", when: "Fri, Jul 17 · 7:30 PM", where: "The Beacon, Grant Park", going: 12, kind: "Adults only", host: "Marcus T.", desc: "Adults-only dinner. A pooled sitter option is coming with bookings." },
  { id: 3, title: "Splash Pad Morning", when: "Sun, Jul 19 · 9:30 AM", where: "Historic Fourth Ward Park", going: 6, kind: "Kids + parents", host: "Ayesha K.", desc: "Bring towels and a change of clothes. Coffee run after for whoever survives." },
  { id: 4, title: "Single Dads Coffee", when: "Sat, Jul 25 · 8:30 AM", where: "Muchacho, Reynoldstown", going: 5, kind: "Dads", host: "James B.", desc: "Low-key coffee for single dads. First-timers especially welcome." },
];

export const SITTERS = [
  { id: "s1", name: "Keisha M.", sub: "CPR certified · 4 yrs exp · Grant Park", rate: "$18/hr", rating: 4.9, jobs: 32, verified: true, bio: "Elementary-ed background, CPR/first-aid certified. Weeknights and weekends." },
  { id: "s2", name: "Tori & Lex", sub: "Parent-to-parent sit swap · Ormewood", rate: "Swap", rating: 5.0, jobs: 11, verified: true, bio: "Two Village moms who swap sits. Happy to fold you into the rotation." },
  { id: "s3", name: "Devon P.", sub: "After-school pickup · East Atlanta", rate: "$16/hr", rating: 4.8, jobs: 21, verified: false, bio: "College senior, after-school pickups and evening sits near EAV." },
];

export const THREADS = [
  { id: "t1", name: "Danielle R.", last: "Saturday at the park works — see you there!", time: "9:12 AM", initials: "DR", hue: "#E8734A", unread: 2 },
  { id: "t2", name: "Grant Park Parents", last: "Marcus: Anyone going to the splash pad Sunday?", time: "Yesterday", initials: "GP", hue: "#1E4D42", unread: 0 },
  { id: "t3", name: "Keisha M. (sitter)", last: "I'm free Friday evening if you still need coverage", time: "Tue", initials: "KM", hue: "#7A5C9E", unread: 0 },
];

export const MESSAGES = {
  t1: [
    { me: false, text: "Hey! Are you bringing the kids to the park playdate Saturday?" },
    { me: true, text: "Yes! We'll be there around 10." },
    { me: false, text: "Saturday at the park works — see you there!" },
  ],
  t2: [
    { me: false, text: "Marcus: Anyone going to the splash pad Sunday?" },
    { me: true, text: "We're in — 9:30 right?" },
  ],
  t3: [
    { me: false, text: "I'm free Friday evening if you still need coverage" },
  ],
};
