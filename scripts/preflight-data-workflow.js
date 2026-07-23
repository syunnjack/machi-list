const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputPath = process.env.DATA_PREFLIGHT_FILE || "data/data-workflow-preflight.json";

const checks = [
  envCheck("GOOGLE_PLACES_API_KEY", Boolean(process.env.GOOGLE_PLACES_API_KEY), "Google Places候補を取得できます。", "Google Places候補取得前にAPIキーを設定してください。"),
  jsonArrayCheck("data/place-seeds.next.json", "取得キュー"),
  jsonArrayCheck("data/google-places-candidates.json", "取得済み候補", { optional: true }),
  jsonArrayCheck("data/place-candidates.review.json", "レビュー候補"),
  jsonArrayCheck("data/place-candidates.review.csv", "レビューCSV", { csv: true, optional: true }),
  jsonArrayCheck("data/place-candidates.approve.txt", "承認IDファイル", { text: true, optional: true }),
  jsonArrayCheck("data/seed-place-approved.json", "承認済み採用データ"),
  jsonObjectCheck("data/data-quality-report.json", "品質レポート"),
  jsonObjectCheck("data/adoption-report.json", "採用レポート")
];

const summary = summarize(checks);
const nextAction = decideNextAction(checks);
const report = {
  generated_at: new Date().toISOString(),
  status: summary.blockers ? "needs_setup" : "ready",
  summary,
  next_action: nextAction,
  checks
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Wrote preflight report to ${outputPath}`);
console.log(`Status: ${report.status}`);
console.log(`Next: ${nextAction.command}`);
console.log(nextAction.reason);
for (const check of checks) {
  console.log(`${check.ok ? "OK" : "NG"} ${check.label}: ${check.message}`);
}

function envCheck(key, ok, okMessage, ngMessage) {
  return {
    key,
    label: key,
    type: "env",
    ok,
    count: ok ? 1 : 0,
    message: ok ? okMessage : ngMessage
  };
}

function jsonArrayCheck(relativePath, label, options = {}) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    return {
      key: relativePath,
      label,
      type: options.csv ? "csv" : options.text ? "text" : "json-array",
      ok: Boolean(options.optional),
      count: 0,
      message: options.optional ? "未作成ですが、次工程で作成できます。" : "ファイルがありません。"
    };
  }

  if (options.csv || options.text) {
    const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/).filter((line) => line.trim());
    return {
      key: relativePath,
      label,
      type: options.csv ? "csv" : "text",
      ok: true,
      count: Math.max(0, options.csv ? lines.length - 1 : lines.filter((line) => !line.trim().startsWith("#")).length),
      message: `${lines.length}行あります。`
    };
  }

  try {
    const value = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const ok = Array.isArray(value);
    return {
      key: relativePath,
      label,
      type: "json-array",
      ok,
      count: ok ? value.length : 0,
      message: ok ? `${value.length}件あります。` : "JSON配列ではありません。"
    };
  } catch (error) {
    return {
      key: relativePath,
      label,
      type: "json-array",
      ok: false,
      count: 0,
      message: error.message
    };
  }
}

function jsonObjectCheck(relativePath, label) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    return { key: relativePath, label, type: "json-object", ok: false, count: 0, message: "ファイルがありません。" };
  }
  try {
    const value = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    return {
      key: relativePath,
      label,
      type: "json-object",
      ok: value && !Array.isArray(value),
      count: value && !Array.isArray(value) ? 1 : 0,
      message: value && !Array.isArray(value) ? "作成済みです。" : "JSONオブジェクトではありません。"
    };
  } catch (error) {
    return { key: relativePath, label, type: "json-object", ok: false, count: 0, message: error.message };
  }
}

function summarize(items) {
  return {
    total: items.length,
    ok: items.filter((item) => item.ok).length,
    blockers: items.filter((item) => !item.ok).length
  };
}

function decideNextAction(items) {
  const byKey = new Map(items.map((item) => [item.key, item]));
  const hasApiKey = byKey.get("GOOGLE_PLACES_API_KEY")?.ok;
  const queueCount = byKey.get("data/place-seeds.next.json")?.count || 0;
  const candidateCount = byKey.get("data/google-places-candidates.json")?.count || 0;
  const reviewCount = byKey.get("data/place-candidates.review.json")?.count || 0;
  const approvedCount = byKey.get("data/seed-place-approved.json")?.count || 0;

  if (!queueCount) {
    return { command: "npm run seeds:places", reason: "まず取得キューを作成します。" };
  }
  if (!candidateCount) {
    return {
      command: hasApiKey
        ? "$env:PLACE_SEEDS_FILE=\"data/place-seeds.next.json\"; $env:PLACES_SEED_LIMIT=\"10\"; $env:PLACES_SEED_OFFSET=\"0\"; $env:PLACES_APPEND=\"1\"; npm run sync:places"
        : "$env:GOOGLE_PLACES_API_KEY=\"...\"",
      reason: hasApiKey ? "候補キューから最初の10件を取得できます。" : "候補取得にはAPIキーが必要です。"
    };
  }
  if (!reviewCount) {
    return { command: "npm run candidates:review", reason: "取得済み候補を確認用ファイルへ変換します。" };
  }
  if (!approvedCount) {
    return { command: "npm run candidates:approve", reason: "採用する候補IDを指定します。" };
  }
  return { command: "npm run data:pipeline", reason: "承認済み候補を反映し、レポートまで更新します。" };
}
