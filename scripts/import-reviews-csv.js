const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const csvPath = process.argv[2];
const reviewsPath = path.join(root, "data/reviews.json");

if (!csvPath) {
  console.error("usage: node import-reviews-csv.js <formspree-export.csv>");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') inQuotes = false;
      else field += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (char === "\r" && text[i + 1] === "\n") i += 1;
    } else field += char;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const text = fs.readFileSync(csvPath, "utf8").replace(/^﻿/, "");
const rows = parseCsv(text);
const header = rows[0].map((h) => h.trim().toLowerCase());
const dataRows = rows.slice(1).filter((r) => r.length > 1);

const existing = fs.existsSync(reviewsPath) ? JSON.parse(fs.readFileSync(reviewsPath, "utf8")) : [];
const seen = new Set(existing.map((r) => r.import_key).filter(Boolean));

let added = 0;
for (const row of dataRows) {
  const record = Object.fromEntries(header.map((h, i) => [h, row[i] || ""]));
  const importKey = `${record.shop_id}-${record.nickname}-${record.body}`.slice(0, 200);
  if (seen.has(importKey)) continue;
  seen.add(importKey);

  existing.push({
    id: `review-${existing.length + 1}-${Date.now().toString(36)}`,
    shop_id: record.shop_id || "",
    shop_name: record.shop_name || "",
    area_key: record.area_key || "",
    genre_key: record.genre_key || "",
    nickname: (record.nickname || "匿名").slice(0, 30),
    rating: Number(record.rating) || 0,
    body: (record.body || "").slice(0, 600),
    status: "pending",
    imported_at: new Date().toISOString(),
    import_key: importKey
  });
  added += 1;
}

fs.writeFileSync(reviewsPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
console.log(`Imported ${added} new reviews (status: pending). Total: ${existing.length}.`);
console.log("Edit data/reviews.json and set status to \"approved\" for reviews you want to publish, then run npm run generate.");
