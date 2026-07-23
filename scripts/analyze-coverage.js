const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shops = readJson("data/shops.json");
const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");

const args = parseArgs(process.argv.slice(2));
const minTarget = Number(args.min || 2);
const limit = Number(args.limit || 80);
const outputPath = args.output || "data/coverage-report.json";

const priorityGenreKeys = [
  "netcafe",
  "video-box",
  "capsule-toy",
  "crane-game",
  "game-center",
  "darts",
  "bowling",
  "billiards",
  "karaoke",
  "sauna",
  "spa",
  "cat-cafe",
  "convenience-store",
  "cafe",
  "coin-laundry",
  "drugstore",
  "trading-card-shop",
  "hobby-shop",
  "recycle-shop",
  "movie-theater",
  "adult-shop",
  "restaurant"
];

const targetByGenre = {
  netcafe: 3,
  "video-box": 2,
  "capsule-toy": 3,
  "crane-game": 3,
  "game-center": 3,
  darts: 2,
  bowling: 2,
  billiards: 2,
  karaoke: 3,
  sauna: 2,
  spa: 2,
  "cat-cafe": 1,
  "convenience-store": 3,
  cafe: 3,
  "coin-laundry": 2,
  drugstore: 3,
  "trading-card-shop": 2,
  "hobby-shop": 2,
  "recycle-shop": 2,
  "movie-theater": 1,
  "adult-shop": 1,
  restaurant: 3
};

const genreByKey = new Map(genres.map((genre) => [genre.key, genre]));
const shopCount = new Map();

for (const shop of shops) {
  const key = `${shop.area_key}::${shop.genre_key}`;
  shopCount.set(key, (shopCount.get(key) || 0) + 1);
}

function areaWeight(area) {
  if (!area.parent) return 4;
  if (String(area.path || "").includes("/")) return 2;
  return 3;
}

function genreWeight(genreKey) {
  const index = priorityGenreKeys.indexOf(genreKey);
  return index === -1 ? 1 : priorityGenreKeys.length - index;
}

const gaps = [];

for (const area of areas) {
  for (const genreKey of priorityGenreKeys) {
    const genre = genreByKey.get(genreKey);
    if (!genre) continue;

    const current = shopCount.get(`${area.key}::${genreKey}`) || 0;
    const target = Math.max(minTarget, targetByGenre[genreKey] || minTarget);
    const missing = Math.max(0, target - current);
    if (!missing) continue;

    gaps.push({
      area_key: area.key,
      area_label: area.label,
      prefecture_key: area.prefecture_key,
      prefecture: area.prefecture,
      genre_key: genreKey,
      genre_label: genre.label,
      current,
      target,
      missing,
      score: missing * 100 + areaWeight(area) * 10 + genreWeight(genreKey)
    });
  }
}

gaps.sort((a, b) => b.score - a.score || a.prefecture_key.localeCompare(b.prefecture_key) || a.area_key.localeCompare(b.area_key));

const report = {
  generated_at: new Date().toISOString(),
  shop_count: shops.length,
  area_count: areas.length,
  genre_count: genres.length,
  min_target: minTarget,
  gap_count: gaps.length,
  top_gaps: gaps.slice(0, limit),
  summary_by_genre: summarizeBy(gaps, "genre_key"),
  summary_by_prefecture: summarizeBy(gaps, "prefecture_key")
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Wrote ${report.top_gaps.length} priority gaps to ${outputPath}`);
for (const gap of report.top_gaps.slice(0, 20)) {
  console.log(`${gap.area_label} / ${gap.genre_label}: ${gap.current}/${gap.target}`);
}

function summarizeBy(items, key) {
  const grouped = new Map();
  for (const item of items) {
    const value = item[key];
    const row = grouped.get(value) || { key: value, gaps: 0, missing: 0 };
    row.gaps += 1;
    row.missing += item.missing;
    grouped.set(value, row);
  }
  return [...grouped.values()].sort((a, b) => b.missing - a.missing || a.key.localeCompare(b.key));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    parsed[key] = next && !next.startsWith("--") ? next : true;
    if (parsed[key] === next) index += 1;
  }
  return parsed;
}
