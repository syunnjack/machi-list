const fs = require("node:fs");
const path = require("node:path");

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const root = path.resolve(__dirname, "..");
const seedsPath = path.join(root, process.env.PLACE_SEEDS_FILE || "data/place-seeds.json");
const outputPath = path.join(root, process.env.PLACES_CANDIDATES_FILE || "data/google-places-candidates.json");
const maxResults = Number(process.env.PLACES_MAX_RESULTS || 3);

if (!apiKey) {
  console.error("GOOGLE_PLACES_API_KEY is required.");
  process.exit(1);
}

const seeds = JSON.parse(fs.readFileSync(seedsPath, "utf8"));

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function searchText(seed) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.businessStatus",
        "places.googleMapsUri",
        "places.nationalPhoneNumber",
        "places.websiteUri",
        "places.regularOpeningHours"
      ].join(",")
    },
    body: JSON.stringify({
      textQuery: seed.query,
      languageCode: "ja",
      regionCode: "JP"
    })
  });

  if (!response.ok) {
    throw new Error(`${seed.query}: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function normalizeCandidate(seed, place) {
  const name = place.displayName?.text || seed.query;
  return {
    id: `place-${slugify(place.id || name)}`,
    review_status: "pending",
    review_note: "",
    source: {
      google_place_id: place.id,
      google_query: seed.query,
      google_maps_url: place.googleMapsUri || null,
      last_place_sync_at: new Date().toISOString()
    },
    name,
    genre_key: seed.genre_key,
    genre: seed.genre_key === "adult-shop" ? "アダルトショップ" : seed.genre_key,
    prefecture: seed.prefecture,
    area_key: seed.area_key,
    address: place.formattedAddress || null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    phone: place.nationalPhoneNumber || null,
    official_url: place.websiteUri || null,
    business_status: place.businessStatus || null,
    opening_hours: place.regularOpeningHours?.weekdayDescriptions || null,
    booking: null,
    review: {
      seed_source: seed.source || null,
      current_count: seed.current_count ?? null,
      target_count: seed.target_count ?? null,
      needs_address_check: !place.formattedAddress,
      needs_site_check: !place.websiteUri
    },
    commerce: seed.genre_key === "adult-shop"
      ? { provider: "rakuten", keyword: "ラブグッズ" }
      : null
  };
}

async function main() {
  const all = [];
  for (const seed of seeds) {
    const data = await searchText(seed);
    const places = data.places || [];
    for (const place of places.slice(0, maxResults)) {
      all.push(normalizeCandidate(seed, place));
    }
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(all, null, 2)}\n`, "utf8");
  console.log(`Wrote ${all.length} candidates to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
