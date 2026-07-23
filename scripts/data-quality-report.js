const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");
const shops = readJson("data/shops.json");
const outputPath = process.env.DATA_QUALITY_FILE || "data/data-quality-report.json";

const areaKeys = new Set(areas.map((area) => area.key));
const genreKeys = new Set(genres.map((genre) => genre.key));

const duplicateAreaKeys = duplicatesBy(areas, (area) => area.key).map((group) => ({
  key: group[0].key,
  labels: group.map((area) => area.label),
  paths: group.map((area) => area.path)
}));

const duplicateShopIds = duplicatesBy(shops, (shop) => shop.id).map((group) => ({
  id: group[0].id,
  names: group.map((shop) => shop.name),
  area_keys: group.map((shop) => shop.area_key),
  genre_keys: group.map((shop) => shop.genre_key),
  looks_like_multi_genre: new Set(group.map((shop) => shop.genre_key)).size > 1
}));

const missingAreaReferences = shops
  .filter((shop) => !areaKeys.has(shop.area_key))
  .map((shop) => ({ id: shop.id, name: shop.name, area_key: shop.area_key }));

const missingGenreReferences = shops
  .filter((shop) => !genreKeys.has(shop.genre_key))
  .map((shop) => ({ id: shop.id, name: shop.name, genre_key: shop.genre_key }));

const areaSummaries = areas.map((area) => {
  const items = shops.filter((shop) => shop.area_key === area.key);
  const genreCount = new Map();
  for (const shop of items) {
    genreCount.set(shop.genre_key, (genreCount.get(shop.genre_key) || 0) + 1);
  }
  return {
    area_key: area.key,
    label: area.label,
    prefecture: area.prefecture,
    shop_count: items.length,
    genre_count: genreCount.size,
    near_station_count: items.filter((shop) => Number(shop.station_walk_minutes) <= 8).length,
    late_count: items.filter((shop) => shop.late).length,
    parking_count: items.filter((shop) => shop.parking || shop.genre_key === "parking-lot").length
  };
});

const thinAreas = [...areaSummaries]
  .sort((a, b) => a.shop_count - b.shop_count || a.genre_count - b.genre_count || a.label.localeCompare(b.label, "ja"))
  .slice(0, 40);

const strongAreas = [...areaSummaries]
  .sort((a, b) => b.shop_count - a.shop_count || b.genre_count - a.genre_count || a.label.localeCompare(b.label, "ja"))
  .slice(0, 40);

const report = {
  generated_at: new Date().toISOString(),
  shop_count: shops.length,
  area_count: areas.length,
  genre_count: genres.length,
  duplicate_area_keys: duplicateAreaKeys,
  duplicate_shop_ids: duplicateShopIds,
  duplicate_shop_ids_needing_review: duplicateShopIds.filter((row) => !row.looks_like_multi_genre),
  missing_area_references: missingAreaReferences,
  missing_genre_references: missingGenreReferences,
  thin_areas: thinAreas,
  strong_areas: strongAreas,
  next_actions: [
    "thin_areasの駅近、夜、駐車場、滞在系ジャンルを優先して補う",
    "duplicate_area_keysを解消して生成ページの上書きを防ぐ",
    "missing_*_referencesが出た場合は取り込み前に止める",
    "公式店舗一覧やPlaces候補を候補ファイルに出してから目視確認する"
  ]
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Wrote data quality report to ${outputPath}`);
console.log(`Duplicate area keys: ${duplicateAreaKeys.length}`);
console.log(`Duplicate shop ids: ${duplicateShopIds.length}`);
console.log(`Missing area references: ${missingAreaReferences.length}`);
console.log(`Missing genre references: ${missingGenreReferences.length}`);

function duplicatesBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
