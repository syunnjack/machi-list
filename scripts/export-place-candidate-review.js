const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const inputPath = args.input || process.env.PLACES_REVIEW_FILE || "data/place-candidates.review.json";
const csvPath = args.csv || "data/place-candidates.review.csv";
const markdownPath = args.markdown || "docs/place-candidate-review.md";
const limit = Number(args.limit || 120);

const candidates = fs.existsSync(path.join(root, inputPath)) ? readJson(inputPath) : [];
const rows = candidates
  .map(toReviewRow)
  .sort((a, b) => {
    if (a.status !== b.status) return statusRank(a.status) - statusRank(b.status);
    return b.score - a.score || a.area.localeCompare(b.area, "ja") || a.genre.localeCompare(b.genre, "ja") || a.name.localeCompare(b.name, "ja");
  });

writeCsv(csvPath, rows);
writeMarkdown(markdownPath, rows.slice(0, limit), rows);

console.log(`Wrote ${rows.length} review rows to ${csvPath}`);
console.log(`Wrote review summary to ${markdownPath}`);
console.log(`Can adopt: ${rows.filter((row) => row.can_adopt).length}`);
console.log(`Needs check: ${rows.filter((row) => !row.can_adopt).length}`);

function toReviewRow(candidate) {
  const issues = candidate.review_issues || [];
  return {
    status: candidate.review_status || "pending",
    score: Number(candidate.review_score || 0),
    can_adopt: Boolean(candidate.review_summary?.can_adopt),
    area: candidate.review_summary?.area_label || candidate.area_key || "",
    genre: candidate.review_summary?.genre_label || candidate.genre_key || "",
    name: candidate.name || "",
    address: candidate.address || "",
    phone: candidate.phone || "",
    official_url: candidate.official_url || "",
    maps_url: candidate.source?.google_maps_url || "",
    place_id: candidate.source?.google_place_id || "",
    issues: issues.join("|"),
    note: candidate.review_note || ""
  };
}

function writeCsv(relativePath, rows) {
  const headers = [
    "status",
    "score",
    "can_adopt",
    "area",
    "genre",
    "name",
    "address",
    "phone",
    "official_url",
    "maps_url",
    "place_id",
    "issues",
    "note"
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((key) => csvCell(row[key])).join(","));
  }
  fs.writeFileSync(path.join(root, relativePath), `${lines.join("\n")}\n`, "utf8");
}

function writeMarkdown(relativePath, visibleRows, allRows) {
  const canAdopt = allRows.filter((row) => row.can_adopt).length;
  const needsCheck = allRows.length - canAdopt;
  const issueCounts = countIssues(allRows);
  const lines = [
    "# 候補レビュー",
    "",
    `候補数: ${allRows.length}`,
    `採用しやすい候補: ${canAdopt}`,
    `確認が必要な候補: ${needsCheck}`,
    "",
    "## よく出ている確認項目",
    ""
  ];

  if (issueCounts.length) {
    for (const item of issueCounts.slice(0, 12)) {
      lines.push(`- ${item.issue}: ${item.count}件`);
    }
  } else {
    lines.push("- なし");
  }

  lines.push("");
  lines.push("## 優先確認リスト");
  lines.push("");
  lines.push("|状態|点数|採用目安|エリア|ジャンル|店名|確認項目|");
  lines.push("|---|---:|---|---|---|---|---|");

  for (const row of visibleRows) {
    lines.push(`|${md(row.status)}|${row.score}|${row.can_adopt ? "可" : "要確認"}|${md(row.area)}|${md(row.genre)}|${md(row.name)}|${md(row.issues || "なし")}|`);
  }

  lines.push("");
  lines.push("## 作業手順");
  lines.push("");
  lines.push("- CSVで住所、公式サイト、重複の有無を確認します。");
  lines.push("- 採用する候補はJSON側の `review_status` を `approved` にします。");
  lines.push("- その後 `npm run candidates:adopt`、`npm run generate`、`npm run report:data` を実行します。");
  lines.push("");

  fs.writeFileSync(path.join(root, relativePath), `${lines.join("\n")}\n`, "utf8");
}

function countIssues(rows) {
  const counts = new Map();
  for (const row of rows) {
    if (!row.issues) continue;
    for (const issue of row.issues.split("|")) {
      counts.set(issue, (counts.get(issue) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count || a.issue.localeCompare(b.issue));
}

function statusRank(status) {
  return { pending: 0, approved: 1, rejected: 2 }[status] ?? 3;
}

function csvCell(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function md(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
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
