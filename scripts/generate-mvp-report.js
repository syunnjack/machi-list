const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const docsDir = path.join(root, "docs");

const shops = readJson("shops.json");
const areas = readJson("areas.json");
const genres = readJson("genres.json");
const quality = readJson("data-quality-report.json", {});
const adoption = readJson("adoption-report.json", {});

const generatedPageCount = countHtmlFiles(path.join(root, "area"))
  + countHtmlFiles(path.join(root, "category"))
  + countHtmlFiles(path.join(root, "guide"))
  + countHtmlFiles(path.join(root, "shop"));

const files = {
  top: "index.html",
  sitemap: "sitemap.xml",
  robots: "robots.txt",
  crawlerGuide: "llms.txt",
  dataQuickstart: "docs/data-operation-quickstart.md",
  placeFlow: "docs/place-candidate-flow.md",
  candidateReview: "docs/place-candidate-review.md"
};

const shopGenrePairs = new Set(shops.map((shop) => `${field(shop, "areaKey", "area_key")}:${field(shop, "genreKey", "genre_key")}`));
const activeAreas = new Set(shops.map((shop) => field(shop, "areaKey", "area_key")).filter(Boolean));
const activeGenres = new Set(shops.map((shop) => field(shop, "genreKey", "genre_key")).filter(Boolean));
const shopsWithMap = shops.filter((shop) => field(shop, "mapUrl", "map_url") || field(shop, "placeId", "place_id") || shop.source?.google_place_id || field(shop, "placeQuery", "place_query")).length;
const shopsWithAction = shops.filter((shop) => field(shop, "bookingUrl", "booking_url") || field(shop, "relatedUrl", "related_url") || field(shop, "couponUrl", "coupon_url") || field(shop, "shoppingUrl", "shopping_url") || field(shop, "officialUrl", "official_url")).length;

const checks = [
  check("top_page", fileExists(files.top), "Top page is available."),
  check("sitemap", fileExists(files.sitemap), "Sitemap is available."),
  check("robots", fileExists(files.robots), "Robots file is available."),
  check("crawler_guide", fileExists(files.crawlerGuide), "Crawler guide file is available."),
  check("data_quickstart", fileExists(files.dataQuickstart), "Data operation quickstart is available."),
  check("place_flow", fileExists(files.placeFlow), "Place candidate workflow is available."),
  check("candidate_review", fileExists(files.candidateReview), "Candidate review document is available."),
  check("shop_count", shops.length >= 2800, `${shops.length} shops are registered.`),
  check("area_count", areas.length >= 120, `${areas.length} areas are registered.`),
  check("genre_count", genres.length >= 32, `${genres.length} genres are registered.`),
  check("active_area_count", activeAreas.size >= 120, `${activeAreas.size} areas have shop data.`),
  check("active_genre_count", activeGenres.size >= 24, `${activeGenres.size} genres have shop data.`),
  check("area_genre_pairs", shopGenrePairs.size >= 1200, `${shopGenrePairs.size} area and genre pairs have data.`),
  check("generated_pages", generatedPageCount >= 500, `${generatedPageCount} HTML pages are generated.`),
  check("map_routes", shopsWithMap >= shops.length * 0.95, `${shopsWithMap} shops have map route signals.`),
  check("action_links", shopsWithAction >= shops.length * 0.95, `${shopsWithAction} shops have action links.`),
  check("duplicate_shop_ids", (quality.duplicate_shop_ids || []).length === 0, "Shop ids are unique."),
  check("missing_area_references", (quality.missing_area_references || []).length === 0, "Area references are valid."),
  check("missing_genre_references", (quality.missing_genre_references || []).length === 0, "Genre references are valid."),
  check("url_state", fileContains("assets/app.js", "URLSearchParams") && fileContains("assets/app.js", "replaceState"), "Search state can be shared by URL.")
];

const report = {
  generated_at: new Date().toISOString(),
  status: checks.every((item) => item.ok) ? "ready" : "needs_work",
  totals: {
    shops: shops.length,
    areas: areas.length,
    genres: genres.length,
    active_areas: activeAreas.size,
    active_genres: activeGenres.size,
    area_genre_pairs: shopGenrePairs.size,
    generated_pages: generatedPageCount,
    map_ready_shops: shopsWithMap,
    action_ready_shops: shopsWithAction,
    pending_candidate_count: adoption.totals?.pending_candidate_count || 0
  },
  checks
};

fs.writeFileSync(path.join(dataDir, "mvp-report.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, "mvp-checklist.md"), renderMarkdown(report));

console.log(`MVP report: ${report.status}`);
console.log(`Shops: ${shops.length}, areas: ${areas.length}, genres: ${genres.length}, pages: ${generatedPageCount}`);

function readJson(fileName, fallback = []) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function fileContains(relativePath, text) {
  const filePath = path.join(root, relativePath);
  return fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").includes(text);
}

function countHtmlFiles(directory) {
  if (!fs.existsSync(directory)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) count += countHtmlFiles(entryPath);
    if (entry.isFile() && entry.name.endsWith(".html")) count += 1;
  }
  return count;
}

function check(key, ok, message) {
  return { key, ok, message };
}

function field(item, camelKey, snakeKey) {
  return item[camelKey] ?? item[snakeKey];
}

function renderMarkdown(report) {
  const passed = report.checks.filter((item) => item.ok).length;
  const rows = report.checks.map((item) => `| ${item.ok ? "OK" : "NG"} | ${item.key} | ${item.message} |`).join("\n");
  return `# MVP Checklist

Generated: ${report.generated_at}

Status: ${report.status}

Passed: ${passed}/${report.checks.length}

## Totals

| Item | Count |
| --- | ---: |
| Shops | ${report.totals.shops} |
| Areas | ${report.totals.areas} |
| Genres | ${report.totals.genres} |
| Active areas | ${report.totals.active_areas} |
| Active genres | ${report.totals.active_genres} |
| Area and genre pairs | ${report.totals.area_genre_pairs} |
| Generated pages | ${report.totals.generated_pages} |
| Map ready shops | ${report.totals.map_ready_shops} |
| Action ready shops | ${report.totals.action_ready_shops} |
| Pending candidates | ${report.totals.pending_candidate_count} |

## Checks

| Result | Key | Detail |
| --- | --- | --- |
${rows}
`;
}
