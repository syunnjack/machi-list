const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const sampleSize = Number(process.env.STATUS_CHECK_SAMPLE || 150);
const shopsPath = path.join(root, "data/shops.json");
const removedLogPath = path.join(root, "data/closed-shops-log.json");

if (!apiKey) {
  console.error("GOOGLE_PLACES_API_KEY is required.");
  process.exit(1);
}

const shops = JSON.parse(fs.readFileSync(shopsPath, "utf8"));
const withPlaceId = shops.filter((shop) => shop.source?.google_place_id);

// Prioritize shops that haven't been checked recently (or ever).
const sorted = [...withPlaceId].sort((a, b) => {
  const aChecked = a.source.last_status_check_at || "0";
  const bChecked = b.source.last_status_check_at || "0";
  return aChecked.localeCompare(bChecked);
});
const sample = sorted.slice(0, sampleSize);

async function checkStatus(placeId) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "businessStatus"
    }
  });
  if (!response.ok) {
    if (response.status === 404) return "NOT_FOUND";
    throw new Error(`${placeId}: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return data.businessStatus || "UNKNOWN";
}

async function main() {
  const closed = [];
  const errors = [];
  const now = new Date().toISOString();

  for (const shop of sample) {
    try {
      const status = await checkStatus(shop.source.google_place_id);
      shop.source.last_status_check_at = now;
      if (status === "CLOSED_PERMANENTLY" || status === "NOT_FOUND") {
        closed.push({ id: shop.id, name: shop.name, area_key: shop.area_key, genre_key: shop.genre_key, status, checked_at: now });
      }
    } catch (error) {
      errors.push({ id: shop.id, message: error.message });
    }
  }

  const closedIds = new Set(closed.map((c) => c.id));
  const remaining = shops.filter((shop) => !closedIds.has(shop.id));

  fs.writeFileSync(shopsPath, `${JSON.stringify(remaining, null, 2)}\n`, "utf8");

  const previousLog = fs.existsSync(removedLogPath) ? JSON.parse(fs.readFileSync(removedLogPath, "utf8")) : [];
  fs.writeFileSync(removedLogPath, `${JSON.stringify([...previousLog, ...closed], null, 2)}\n`, "utf8");

  console.log(`Checked ${sample.length} shops. Removed ${closed.length} closed/not-found. Errors: ${errors.length}`);
  if (closed.length) console.log(closed.map((c) => `${c.area_key} / ${c.name}: ${c.status}`).join("\n"));
  if (errors.length) console.log(errors.map((e) => `${e.id}: ${e.message}`).join("\n"));
}

main();
