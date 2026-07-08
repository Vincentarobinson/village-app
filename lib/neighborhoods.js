/* Atlanta launch neighborhoods with centroids.
 * Coordinates are neighborhood centers — profiles never store an
 * exact address (spec §3.3). Expand as metros open. */
export const NEIGHBORHOODS = [
  { name: "Grant Park", lat: 33.7365, lng: -84.3703 },
  { name: "East Atlanta", lat: 33.7396, lng: -84.3441 },
  { name: "Ormewood Park", lat: 33.7291, lng: -84.3583 },
  { name: "Kirkwood", lat: 33.7534, lng: -84.3266 },
  { name: "Reynoldstown", lat: 33.7473, lng: -84.3542 },
  { name: "Inman Park", lat: 33.7613, lng: -84.3520 },
  { name: "Old Fourth Ward", lat: 33.7635, lng: -84.3721 },
  { name: "Decatur", lat: 33.7748, lng: -84.2963 },
  { name: "Oakhurst", lat: 33.7645, lng: -84.3053 },
  { name: "Edgewood", lat: 33.7541, lng: -84.3394 },
];

export function findNeighborhood(name) {
  return NEIGHBORHOODS.find((n) => n.name === name) || null;
}
