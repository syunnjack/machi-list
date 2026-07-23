const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const reportPath = args.report || "data/coverage-report.json";
const outputPath = args.output || "data/place-seeds.generated.json";
const limit = Number(args.limit || 120);

const report = readJson(reportPath);
const existingSeeds = fs.existsSync(path.join(root, "data/place-seeds.json"))
  ? readJson("data/place-seeds.json")
  : [];

const existingKeys = new Set(existingSeeds.map(seedKey));
const seeds = [];

for (const gap of report.top_gaps || []) {
  if (seeds.length >= limit) break;

  for (const query of queriesFor(gap)) {
    const seed = {
      query,
      genre_key: gap.genre_key,
      area_key: gap.area_key,
      prefecture: gap.prefecture,
      source: "coverage-gap",
      current_count: gap.current,
      target_count: gap.target
    };

    const key = seedKey(seed);
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    seeds.push(seed);
    break;
  }
}

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(seeds, null, 2)}\n`, "utf8");
console.log(`Wrote ${seeds.length} place seeds to ${outputPath}`);
for (const seed of seeds.slice(0, 20)) {
  console.log(`${seed.area_key} / ${seed.genre_key}: ${seed.query}`);
}

function queriesFor(gap) {
  const area = gap.area_label;
  const genre = gap.genre_label;

  const patterns = {
    netcafe: [`${area} ネットカフェ`, `${area} 漫画喫茶`, `${area} 快活CLUB 自遊空間 アプレシオ`],
    "video-box": [`${area} ビデオボックス`, `${area} 金太郎 花太郎 宝島24`],
    "capsule-toy": [`${area} カプセルトイ`, `${area} ガシャポン`, `${area} ガチャガチャ 専門店`],
    "crane-game": [`${area} UFOキャッチャー`, `${area} クレーンゲーム`, `${area} ゲームセンター 景品`],
    "game-center": [`${area} ゲームセンター`, `${area} GiGO namco タイトー`, `${area} アミューズメント`],
    darts: [`${area} ダーツ`, `${area} DARTSLIVE`, `${area} ダーツバー 快活CLUB`],
    bowling: [`${area} ボウリング場`, `${area} ラウンドワン ボウリング`],
    billiards: [`${area} ビリヤード`, `${area} ビリヤード場 快活CLUB`],
    karaoke: [`${area} カラオケ`, `${area} まねきねこ ビッグエコー`, `${area} 快活CLUB カラオケ`],
    sauna: [`${area} サウナ`, `${area} カプセルホテル サウナ`],
    spa: [`${area} スーパー銭湯`, `${area} SPA 岩盤浴`, `${area} 日帰り温泉`],
    "cat-cafe": [`${area} 猫カフェ`, `${area} 保護猫カフェ`],
    "convenience-store": [`${area} コンビニ イートイン`, `${area} コンビニ 喫煙`, `${area} コンビニ 電源 Wi-Fi`],
    cafe: [`${area} カフェ 電源 Wi-Fi`, `${area} カフェ 喫煙`, `${area} スターバックス タリーズ ドトール`],
    "movie-theater": [`${area} 映画館`, `${area} シネマ`],
    "adult-shop": [`${area} アダルトショップ`, `${area} 大人のおもちゃ 店舗`],
    restaurant: [`${area} 居酒屋 予約`, `${area} 飲食店 クーポン`]
  };

  return patterns[gap.genre_key] || [`${area} ${genre}`];
}

function seedKey(seed) {
  return `${seed.area_key}::${seed.genre_key}::${seed.query}`;
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
