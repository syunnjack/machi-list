const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const outputPath = args.output || "data/adoption-report.json";
const markdownPath = args.markdown || "docs/adoption-report.md";

const shops = readJson("data/shops.json");
const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");
const approvedSeeds = readJsonIfExists("data/seed-place-approved.json", []);
const reviewRows = readJsonIfExists("data/place-candidates.review.json", []);
const qualityReport = readJsonIfExists("data/data-quality-report.json", null);
const coverageReport = readJsonIfExists("data/coverage-report.json", null);

const areaByKey = new Map(areas.map((area) => [area.key, area]));
const genreByKey = new Map(genres.map((genre) => [genre.key, genre]));
const approvedIds = new Set(approvedSeeds.map((seed) => seed[0]));
const approvedShops = shops.filter((shop) => approvedIds.has(shop.id));
const reviewedApproved = reviewRows.filter((candidate) => candidate.review_status === "approved");

const areaSummary = summarize(approvedShops, "area_key").map((row) => ({
  area_key: row.key,
  area_label: areaByKey.get(row.key)?.label || row.key,
  prefecture: areaByKey.get(row.key)?.prefecture || "",
  count: row.count
}));

const genreSummary = summarize(approvedShops, "genre_key").map((row) => ({
  genre_key: row.key,
  genre_label: genreByKey.get(row.key)?.label || row.key,
  count: row.count
}));

const report = {
  generated_at: new Date().toISOString(),
  totals: {
    shops: shops.length,
    areas: areas.length,
    genres: genres.length,
    approved_seed_count: approvedSeeds.length,
    approved_shop_count: approvedShops.length,
    reviewed_approved_count: reviewedApproved.length,
    pending_candidate_count: reviewRows.filter((candidate) => candidate.review_status === "pending").length
  },
  quality: qualityReport ? {
    duplicate_area_keys: qualityReport.duplicate_area_keys?.length || 0,
    duplicate_shop_ids: qualityReport.duplicate_shop_ids?.length || 0,
    missing_area_references: qualityReport.missing_area_references?.length || 0,
    missing_genre_references: qualityReport.missing_genre_references?.length || 0
  } : null,
  coverage: coverageReport ? {
    gap_count: coverageReport.gap_count,
    top_gaps: (coverageReport.top_gaps || []).slice(0, 20)
  } : null,
  approved_by_area: areaSummary,
  approved_by_genre: genreSummary,
  latest_approved: approvedShops.slice(-30).map((shop) => ({
    id: shop.id,
    name: shop.name,
    area_key: shop.area_key,
    area_label: shop.area_label,
    genre_key: shop.genre_key,
    genre: shop.genre,
    address: shop.address,
    official_url: shop.official_url || ""
  })),
  next_actions: [
    "候補CSVで住所と公式サイトを確認し、採用IDファイルへ追加します。",
    "承認後は採用、生成、品質確認、カバレッジ更新を同じ順番で実行します。",
    "不足が大きいエリア・ジャンルから10件単位で追加します。"
  ]
};

writeJson(outputPath, report);
writeMarkdown(markdownPath, report);

console.log(`Wrote adoption report to ${outputPath}`);
console.log(`Wrote adoption notes to ${markdownPath}`);
console.log(`Approved seeds: ${report.totals.approved_seed_count}`);
console.log(`Approved shops in current data: ${report.totals.approved_shop_count}`);

function summarize(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = item[key] || "";
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([keyValue, count]) => ({ key: keyValue, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function writeMarkdown(relativePath, reportData) {
  const lines = [
    "# 採用レポート",
    "",
    `生成日時: ${reportData.generated_at}`,
    "",
    "## 現在の件数",
    "",
    `- 店舗数: ${reportData.totals.shops}`,
    `- エリア数: ${reportData.totals.areas}`,
    `- ジャンル数: ${reportData.totals.genres}`,
    `- 承認済み候補: ${reportData.totals.approved_seed_count}`,
    `- 確認待ち候補: ${reportData.totals.pending_candidate_count}`,
    "",
    "## 品質確認",
    ""
  ];

  if (reportData.quality) {
    lines.push(`- エリアキー重複: ${reportData.quality.duplicate_area_keys}`);
    lines.push(`- 店舗ID重複: ${reportData.quality.duplicate_shop_ids}`);
    lines.push(`- エリア参照不足: ${reportData.quality.missing_area_references}`);
    lines.push(`- ジャンル参照不足: ${reportData.quality.missing_genre_references}`);
  } else {
    lines.push("- 品質レポート未生成");
  }

  lines.push("");
  lines.push("## 承認済み候補の多いエリア");
  lines.push("");
  if (reportData.approved_by_area.length) {
    for (const row of reportData.approved_by_area.slice(0, 20)) {
      lines.push(`- ${row.prefecture} ${row.area_label}: ${row.count}件`);
    }
  } else {
    lines.push("- まだ承認済み候補はありません");
  }

  lines.push("");
  lines.push("## 承認済み候補の多いジャンル");
  lines.push("");
  if (reportData.approved_by_genre.length) {
    for (const row of reportData.approved_by_genre.slice(0, 20)) {
      lines.push(`- ${row.genre_label}: ${row.count}件`);
    }
  } else {
    lines.push("- まだ承認済み候補はありません");
  }

  lines.push("");
  lines.push("## 次の作業");
  lines.push("");
  for (const action of reportData.next_actions) {
    lines.push(`- ${action}`);
  }
  lines.push("");

  fs.writeFileSync(path.join(root, relativePath), `${lines.join("\n")}\n`, "utf8");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readJsonIfExists(relativePath, fallback) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? readJson(relativePath) : fallback;
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
