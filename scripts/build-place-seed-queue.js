const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const outputPath = args.output || "data/place-seeds.next.json";
const limit = Number(args.limit || 240);

const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");
const areaKeys = new Set(areas.map((area) => area.key));
const genreKeys = new Set(genres.map((genre) => genre.key));
const areaAliases = {
  nagoya: "nagoya-nakamura",
  aichi: "nagoya-nakamura"
};

const inputs = [
  ...readSeedArray("data/place-seeds.json", "manual"),
  ...readSeedArray("data/place-seeds.generated.json", "coverage"),
  ...readGrowthSeeds("data/growth-roadmap.json")
];

const queued = [];
const skipped = [];
const seen = new Set();

for (const seed of inputs) {
  const normalized = normalizeSeed(seed);
  const issue = seedIssue(normalized);
  if (issue) {
    skipped.push({ ...normalized, issue });
    continue;
  }

  const key = `${normalized.area_key}::${normalized.genre_key}::${normalized.query}`;
  if (seen.has(key)) continue;
  seen.add(key);
  queued.push(normalized);
  if (queued.length >= limit) break;
}

writeJson(outputPath, queued);
writeJson("data/place-seeds.next-report.json", {
  generated_at: new Date().toISOString(),
  input_count: inputs.length,
  output_count: queued.length,
  skipped_count: skipped.length,
  output_path: outputPath,
  next_command_powershell: `$env:PLACE_SEEDS_FILE="${outputPath}"; npm run sync:places`,
  next_command_bash: `PLACE_SEEDS_FILE=${outputPath} npm run sync:places`,
  skipped: skipped.slice(0, 80)
});

console.log(`Wrote ${queued.length} queued place seeds to ${outputPath}`);
console.log(`Skipped ${skipped.length} invalid seeds.`);
for (const seed of queued.slice(0, 20)) {
  console.log(`${seed.area_key} / ${seed.genre_key}: ${seed.query}`);
}

function normalizeSeed(seed) {
  const areaKey = areaAliases[seed.area_key] || seed.area_key;
  const area = areas.find((item) => item.key === areaKey);
  return {
    query: String(seed.query || "").trim(),
    genre_key: String(seed.genre_key || "").trim(),
    area_key: String(areaKey || "").trim(),
    prefecture: seed.prefecture || area?.prefecture || "",
    source: seed.source || "seed-queue",
    current_count: seed.current_count ?? seed.current ?? null,
    target_count: seed.target_count ?? seed.target ?? null,
    brand: seed.brand || null
  };
}

function seedIssue(seed) {
  if (!seed.query) return "missing_query";
  if (!areaKeys.has(seed.area_key)) return "missing_area";
  if (!genreKeys.has(seed.genre_key)) return "missing_genre";
  return "";
}

function readGrowthSeeds(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return [];
  const roadmap = readJson(relativePath);
  return (roadmap.seed_queries || []).map((seed) => ({
    query: seed.query,
    genre_key: seed.genre_key,
    area_key: seed.area_key,
    prefecture: seed.prefecture,
    source: seed.source || "growth-roadmap",
    current_count: seed.current,
    target_count: seed.target
  }));
}

function readSeedArray(relativePath, source) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return [];
  return readJson(relativePath).map((seed) => ({ ...seed, source: seed.source || source }));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
