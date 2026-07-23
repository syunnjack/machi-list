const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, process.env.PLACES_CANDIDATES_FILE || "data/google-places-candidates.json");
const outputPath = path.join(root, process.env.PLACES_REVIEW_FILE || "data/place-candidates.review.json");

const shops = readJson("data/shops.json");
const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");
const candidates = fs.existsSync(inputPath) ? readJson(path.relative(root, inputPath)) : [];
const previousReviewed = fs.existsSync(outputPath) ? readJson(path.relative(root, outputPath)) : [];

const areaByKey = new Map(areas.map((area) => [area.key, area]));
const genreByKey = new Map(genres.map((genre) => [genre.key, genre]));
const existingIds = new Set(shops.map((shop) => shop.id));
const existingPlaceIds = new Set(shops.map((shop) => shop.source?.google_place_id).filter(Boolean));
const existingFingerprints = new Set(shops.map(fingerprint));
const previousByKey = new Map(previousReviewed.map((candidate) => [reviewKey(candidate), candidate]));

const reviewed = candidates.map((candidate) => {
  const area = areaByKey.get(candidate.area_key);
  const genre = genreByKey.get(candidate.genre_key);
  const placeId = candidate.source?.google_place_id;
  const issues = [
    existingIds.has(candidate.id) ? "same_id" : "",
    placeId && existingPlaceIds.has(placeId) ? "same_place_id" : "",
    existingFingerprints.has(fingerprint(candidate)) ? "similar_name_address" : "",
    area ? "" : "missing_area",
    genre ? "" : "missing_genre",
    candidate.business_status && candidate.business_status !== "OPERATIONAL" ? "not_operational" : "",
    candidate.address ? "" : "missing_address"
  ].filter(Boolean);

  const score = scoreCandidate(candidate, issues);
  const previous = previousByKey.get(reviewKey(candidate));
  return {
    ...candidate,
    review_status: previous?.review_status || candidate.review_status || "pending",
    review_note: previous?.review_note || candidate.review_note || "",
    review_score: score,
    review_issues: issues,
    review_summary: {
      area_label: area?.label || candidate.area_key,
      genre_label: genre?.label || candidate.genre_key,
      has_official_url: Boolean(candidate.official_url),
      has_phone: Boolean(candidate.phone),
      can_adopt: issues.length === 0 && score >= 60
    }
  };
});

reviewed.sort((a, b) => b.review_score - a.review_score || String(a.name).localeCompare(String(b.name), "ja"));
fs.writeFileSync(outputPath, `${JSON.stringify(reviewed, null, 2)}\n`, "utf8");

const ready = reviewed.filter((candidate) => candidate.review_summary.can_adopt).length;
console.log(`Wrote ${reviewed.length} reviewed candidates to ${path.relative(root, outputPath)}`);
console.log(`Ready candidates: ${ready}`);
console.log(`Needs check: ${reviewed.length - ready}`);

function scoreCandidate(candidate, issues) {
  let score = 50;
  if (candidate.address) score += 15;
  if (candidate.official_url) score += 10;
  if (candidate.phone) score += 5;
  if (candidate.source?.google_place_id) score += 10;
  if (candidate.business_status === "OPERATIONAL") score += 10;
  score -= issues.length * 25;
  return Math.max(0, Math.min(100, score));
}

function fingerprint(item) {
  return normalizeText(`${item.area_key} ${item.genre_key} ${item.name} ${item.address || ""}`);
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
}

function reviewKey(candidate) {
  return candidate.source?.google_place_id || candidate.id || fingerprint(candidate);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
