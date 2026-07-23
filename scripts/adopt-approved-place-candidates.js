const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const reviewPath = path.join(root, process.env.PLACES_REVIEW_FILE || "data/place-candidates.review.json");
const outputPath = path.join(root, process.env.APPROVED_PLACE_SEEDS_FILE || "data/seed-place-approved.json");

const areas = readJson("data/areas.json");
const shops = readJson("data/shops.json");
const reviewed = fs.existsSync(reviewPath) ? readJson(path.relative(root, reviewPath)) : [];
const approvedSeeds = fs.existsSync(outputPath) ? readJson(path.relative(root, outputPath)) : [];

const areaByKey = new Map(areas.map((area) => [area.key, area]));
const existingIds = new Set([
  ...shops.map((shop) => shop.id),
  ...approvedSeeds.map((seed) => seed[0])
]);
const existingPlaceIds = new Set(shops.map((shop) => shop.source?.google_place_id).filter(Boolean));

let added = 0;
for (const candidate of reviewed) {
  if (!isApproved(candidate)) continue;
  if (candidate.review_issues?.some((issue) => ["missing_area", "missing_genre", "same_id", "same_place_id"].includes(issue))) continue;
  if (existingIds.has(candidate.id)) continue;
  if (candidate.source?.google_place_id && existingPlaceIds.has(candidate.source.google_place_id)) continue;

  const seed = toSeed(candidate);
  approvedSeeds.push(seed);
  existingIds.add(seed[0]);
  added += 1;
}

approvedSeeds.sort((a, b) => String(a[3]).localeCompare(String(b[3]), "ja") || String(a[2]).localeCompare(String(b[2]), "ja") || String(a[1]).localeCompare(String(b[1]), "ja"));
fs.writeFileSync(outputPath, `${JSON.stringify(approvedSeeds, null, 2)}\n`, "utf8");

console.log(`Added ${added} approved candidates to ${path.relative(root, outputPath)}`);
console.log(`Approved seed count: ${approvedSeeds.length}`);

function isApproved(candidate) {
  return candidate.review_status === "approved" || candidate.approved === true;
}

function toSeed(candidate) {
  const area = areaByKey.get(candidate.area_key);
  const defaults = genreDefaults(candidate.genre_key);
  return [
    candidate.id,
    candidate.name,
    candidate.genre_key,
    candidate.area_key,
    candidate.address || `${area?.label || candidate.area_key}周辺`,
    area?.station || area?.label || "",
    defaults.walk,
    defaults.budget,
    defaults.budgetLabel,
    defaults.parking,
    defaults.late,
    Boolean(candidate.official_url),
    area?.label || candidate.area_key,
    candidate.official_url || candidate.source?.google_maps_url || "",
    defaults.smokingArea,
    defaults.powerSeat,
    defaults.wifi,
    defaults.eatIn
  ];
}

function genreDefaults(genreKey) {
  const byGenre = {
    "dental-clinic": { budget: 1000, budgetLabel: "目安1,000円から", walk: 8, parking: true, late: false },
    "parking-lot": { budget: 300, budgetLabel: "目安300円から", walk: 4, parking: true, late: true },
    "bicycle-parking": { budget: 100, budgetLabel: "目安100円から", walk: 3, parking: false, late: true },
    "convenience-store": { budget: 300, budgetLabel: "目安300円から", walk: 5, parking: false, late: true, smokingArea: "要確認", powerSeat: "要確認", wifi: "要確認", eatIn: "要確認" },
    cafe: { budget: 600, budgetLabel: "目安600円から", walk: 6, parking: false, late: true, smokingArea: "要確認", powerSeat: "要確認", wifi: "要確認", eatIn: "要確認" },
    "gas-station": { budget: 1000, budgetLabel: "給油量により変動", walk: 12, parking: true, late: true },
    drugstore: { budget: 800, budgetLabel: "目安800円から", walk: 8, parking: true, late: true },
    restaurant: { budget: 1500, budgetLabel: "目安1,500円から", walk: 7, parking: false, late: true },
    "coin-laundry": { budget: 500, budgetLabel: "目安500円から", walk: 8, parking: true, late: true }
  };
  return {
    budget: byGenre[genreKey]?.budget ?? 1000,
    budgetLabel: byGenre[genreKey]?.budgetLabel ?? "目安1,000円から",
    walk: byGenre[genreKey]?.walk ?? 8,
    parking: byGenre[genreKey]?.parking ?? false,
    late: byGenre[genreKey]?.late ?? false,
    smokingArea: byGenre[genreKey]?.smokingArea ?? "",
    powerSeat: byGenre[genreKey]?.powerSeat ?? "",
    wifi: byGenre[genreKey]?.wifi ?? "",
    eatIn: byGenre[genreKey]?.eatIn ?? ""
  };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
