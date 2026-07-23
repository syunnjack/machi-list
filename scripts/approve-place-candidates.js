const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const reviewPath = path.join(root, process.env.PLACES_REVIEW_FILE || "data/place-candidates.review.json");
const idsPath = path.join(root, args.ids || process.env.PLACES_APPROVE_IDS_FILE || "data/place-candidates.approve.txt");
const mode = args.mode || "approved";
const note = args.note || "";

if (!fs.existsSync(reviewPath)) {
  console.error(`Review file not found: ${path.relative(root, reviewPath)}`);
  process.exit(1);
}

const candidates = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
const ids = readIds(idsPath);

if (!ids.size) {
  writeTemplate(idsPath, candidates);
  console.log(`No ids found. Wrote template to ${path.relative(root, idsPath)}`);
  console.log("Add candidate ids or Google place ids to the file, then run this command again.");
  process.exit(0);
}

let changed = 0;
let notFound = 0;

for (const id of ids) {
  const matches = candidates.filter((candidate) => candidate.id === id || candidate.source?.google_place_id === id);
  if (!matches.length) {
    notFound += 1;
    continue;
  }
  for (const candidate of matches) {
    candidate.review_status = mode;
    if (note) candidate.review_note = note;
    changed += 1;
  }
}

fs.writeFileSync(reviewPath, `${JSON.stringify(candidates, null, 2)}\n`, "utf8");
console.log(`Updated ${changed} candidates to ${mode}.`);
console.log(`Not found ids: ${notFound}`);
console.log(`Review file: ${path.relative(root, reviewPath)}`);

function readIds(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  return new Set(
    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
  );
}

function writeTemplate(filePath, items) {
  const ready = items
    .filter((candidate) => candidate.review_summary?.can_adopt)
    .slice(0, 40);
  const lines = [
    "# 採用する候補の id または google_place_id を1行に1つ書きます。",
    "# 行頭が # の行は無視されます。",
    "# 例:",
    ...ready.map((candidate) => `# ${candidate.id}    ${candidate.review_summary?.area_label || candidate.area_key} / ${candidate.review_summary?.genre_label || candidate.genre_key} / ${candidate.name}`)
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
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
