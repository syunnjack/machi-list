const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const coveragePath = args.coverage || "data/coverage-report.json";
const outputPath = args.output || "data/growth-roadmap.json";
const markdownPath = args.markdown || "docs/data-growth-roadmap.md";
const perIntentLimit = Number(args.perIntentLimit || 40);
const seedLimit = Number(args.seedLimit || 160);

const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");
const shops = readJson("data/shops.json");
const coverage = readJson(coveragePath);

const areaByKey = new Map(areas.map((area) => [area.key, area]));
const genreByKey = new Map(genres.map((genre) => [genre.key, genre]));
const shopCountByPair = countBy(shops, (shop) => `${shop.area_key}::${shop.genre_key}`);
const minTarget = Number(coverage.min_target || 2);

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
  "dental-clinic": 5,
  "parking-lot": 5,
  "bicycle-parking": 3,
  "parking-management": 2,
  "vending-machine": 3,
  "vending-machine-installation": 2,
  "office-tenant": 3,
  "opening-area-research": 2,
  "gas-station": 3,
  "post-office": 2,
  "trading-card-shop": 2,
  "hobby-shop": 2,
  "recycle-shop": 2,
  "movie-theater": 1,
  "adult-shop": 1,
  restaurant: 3
};

const intentGroups = [
  {
    key: "daily-utility",
    label: "日常利用",
    reason: "利用頻度が高く、駅前・生活圏の比較に使われやすい組み合わせです。",
    genre_keys: ["convenience-store", "cafe", "drugstore", "dental-clinic", "coin-laundry", "post-office", "gas-station"]
  },
  {
    key: "late-night",
    label: "終電後・深夜",
    reason: "夜の退避先や仮眠先として、現在地から探す需要を取りやすい組み合わせです。",
    genre_keys: ["netcafe", "video-box", "karaoke", "sauna", "spa", "adult-shop"]
  },
  {
    key: "hobby-event",
    label: "趣味・イベント",
    reason: "大会、練習、景品、道具探しまで自然につながる組み合わせです。",
    genre_keys: ["crane-game", "capsule-toy", "game-center", "darts", "bowling", "billiards", "trading-card-shop", "hobby-shop", "movie-theater", "cat-cafe"]
  },
  {
    key: "opening-prep",
    label: "開業準備",
    reason: "出店候補地、周辺競合、備品準備、土地活用の比較に使える組み合わせです。",
    genre_keys: ["office-tenant", "opening-area-research", "parking-management", "vending-machine-installation", "recycle-shop"]
  },
  {
    key: "mobility",
    label: "移動・駐車",
    reason: "駅前、商業施設、車移動の行動に近く、現地で確認されやすい組み合わせです。",
    genre_keys: ["parking-lot", "bicycle-parking", "gas-station", "convenience-store", "vending-machine"]
  }
];

const gaps = buildAllGaps();

const roadmap = {
  generated_at: new Date().toISOString(),
  totals: {
    shops: shops.length,
    areas: areas.length,
    genres: genres.length,
    reported_gaps: coverage.gap_count || gaps.length
  },
  next_batches: intentGroups.map((group) => buildIntentBatch(group)),
  seed_queries: buildSeedQueries(gaps).slice(0, seedLimit),
  operator_targets: operatorTargets(),
  notes: [
    "まずは県庁所在地、政令市中心部、乗換駅周辺を厚くします。",
    "同じ施設が複数ジャンルを持つ場合は、施設名を共通にしてジャンル別の入口を作ります。",
    "候補は確認用ファイルで重複と住所を見てから本採用します。",
    "外部導線は一覧の補助リンクとして扱い、本文の邪魔をしない位置に置きます。"
  ]
};

writeJson(outputPath, roadmap);
writeMarkdown(markdownPath, roadmap);

console.log(`Wrote growth roadmap to ${outputPath}`);
console.log(`Wrote growth roadmap notes to ${markdownPath}`);
for (const batch of roadmap.next_batches) {
  console.log(`${batch.label}: ${batch.items.length} pairs, missing ${batch.missing_total}`);
}

function buildIntentBatch(group) {
  const genreKeys = new Set(group.genre_keys);
  const items = gaps
    .filter((gap) => genreKeys.has(gap.genre_key))
    .map((gap) => ({
      area_key: gap.area_key,
      area_label: gap.area_label,
      prefecture: gap.prefecture,
      genre_key: gap.genre_key,
      genre_label: gap.genre_label,
      current: gap.current,
      target: gap.target,
      missing: gap.missing,
      route: gap.route,
      candidate_queries: queriesFor(gap).slice(0, 3),
      subtle_links: subtleLinksFor(gap)
    }))
    .sort((a, b) => b.missing - a.missing || a.current - b.current || a.area_label.localeCompare(b.area_label, "ja"))
    .slice(0, perIntentLimit);

  return {
    key: group.key,
    label: group.label,
    reason: group.reason,
    genre_keys: group.genre_keys,
    missing_total: items.reduce((sum, item) => sum + item.missing, 0),
    items
  };
}

function buildAllGaps() {
  const keys = [...new Set(intentGroups.flatMap((group) => group.genre_keys))].filter((key) => genreByKey.has(key));
  const rows = [];
  for (const area of areas) {
    for (const genreKey of keys) {
      const genre = genreByKey.get(genreKey);
      const current = shopCountByPair.get(`${area.key}::${genreKey}`) || 0;
      const target = Math.max(minTarget, targetByGenre[genreKey] || minTarget);
      const missing = Math.max(0, target - current);
      if (!missing) continue;
      rows.push({
        area_key: area.key,
        area_path: area.path,
        area_label: area.label,
        prefecture_key: area.prefecture_key,
        prefecture: area.prefecture,
        genre_key: genreKey,
        genre_label: genre.label,
        current,
        target,
        missing,
        route: `/area/${area.prefecture_key}/${area.path}/${genre.key}/`
      });
    }
  }
  return rows.sort((a, b) => b.missing - a.missing || a.current - b.current || a.prefecture_key.localeCompare(b.prefecture_key) || a.area_key.localeCompare(b.area_key));
}

function buildSeedQueries(sourceGaps) {
  const seeds = [];
  const seen = new Set();
  for (const gap of sourceGaps) {
    for (const query of queriesFor(gap)) {
      const key = `${gap.area_key}::${gap.genre_key}::${query}`;
      if (seen.has(key)) continue;
      seen.add(key);
      seeds.push({
        query,
        area_key: gap.area_key,
        area_label: gap.area_label,
        genre_key: gap.genre_key,
        genre_label: gap.genre_label,
        current: gap.current,
        target: gap.target,
        source: "growth-roadmap"
      });
      break;
    }
  }
  return seeds;
}

function queriesFor(gap) {
  const area = gap.area_label;
  const patterns = {
    "convenience-store": [`${area} コンビニ イートイン`, `${area} コンビニ 喫煙`, `${area} コンビニ 電源 Wi-Fi`],
    cafe: [`${area} カフェ 電源 Wi-Fi`, `${area} カフェ 喫煙`, `${area} カフェ 作業`],
    drugstore: [`${area} ドラッグストア`, `${area} 薬局 日用品`, `${area} ウエルシア スギ薬局 マツモトキヨシ ${area}`],
    "dental-clinic": [`${area} 歯医者`, `${area} 歯科 予約`, `${area} 歯科医院 駅近`],
    "coin-laundry": [`${area} コインランドリー`, `${area} 24時間 コインランドリー`, `${area} 洗濯乾燥機`],
    "post-office": [`${area} 郵便局`, `${area} ゆうゆう窓口`, `${area} 郵便局 ATM`],
    "gas-station": [`${area} ガソリンスタンド`, `${area} セルフ ガソリンスタンド`, `${area} 洗車 ガソリンスタンド`],
    netcafe: [`${area} ネットカフェ`, `${area} 漫画喫茶`, `${area} 快活CLUB 自遊空間 アプレシオ`],
    "video-box": [`${area} ビデオボックス`, `${area} 金太郎 花太郎 宝島24`, `${area} 個室 DVD`],
    karaoke: [`${area} カラオケ`, `${area} まねきねこ ビッグエコー`, `${area} 深夜 カラオケ`],
    sauna: [`${area} サウナ`, `${area} カプセルホテル サウナ`, `${area} 深夜 サウナ`],
    spa: [`${area} スーパー銭湯`, `${area} SPA 岩盤浴`, `${area} 日帰り温泉`],
    "adult-shop": [`${area} アダルトショップ`, `${area} 大人のおもちゃ 店舗`, `${area} DVD 個室 グッズ`],
    "crane-game": [`${area} UFOキャッチャー`, `${area} クレーンゲーム`, `${area} ゲームセンター 景品`],
    "capsule-toy": [`${area} カプセルトイ`, `${area} ガシャポン`, `${area} ガチャガチャ 専門店`],
    "game-center": [`${area} ゲームセンター`, `${area} GiGO namco タイトー`, `${area} アミューズメント`],
    darts: [`${area} ダーツ`, `${area} DARTSLIVE`, `${area} ダーツバー 快活CLUB`],
    bowling: [`${area} ボウリング場`, `${area} ラウンドワン ボウリング`, `${area} コロナワールド ボウリング`],
    billiards: [`${area} ビリヤード`, `${area} ビリヤード場`, `${area} 快活CLUB ビリヤード`],
    "trading-card-shop": [`${area} トレカショップ`, `${area} カードショップ`, `${area} ポケカ 遊戯王 デュエルスペース`],
    "hobby-shop": [`${area} ホビーショップ`, `${area} プラモデル フィギュア`, `${area} ガンプラ 模型店`],
    "movie-theater": [`${area} 映画館`, `${area} シネマ`, `${area} 上映 チケット`],
    "cat-cafe": [`${area} 猫カフェ`, `${area} 保護猫カフェ`, `${area} 猫カフェ 予約`],
    "office-tenant": [`${area} 貸事務所`, `${area} 貸店舗 テナント`, `${area} 居抜き物件 開業`],
    "opening-area-research": [`${area} 開業 競合店`, `${area} 出店 周辺調査`, `${area} 店舗 立地調査`],
    "parking-management": [`${area} 駐車場経営`, `${area} 駐車場管理会社`, `${area} 土地活用 コインパーキング`],
    "vending-machine-installation": [`${area} 自販機設置`, `${area} 自動販売機 設置 相談`, `${area} 飲料 自販機 設置`],
    "parking-lot": [`${area} 駐車場`, `${area} コインパーキング`, `${area} 最大料金 駐車場`],
    "bicycle-parking": [`${area} 駐輪場`, `${area} 市営駐輪場`, `${area} 駐輪場 料金 定期利用`],
    "vending-machine": [`${area} 自動販売機`, `${area} 自販機 キャッシュレス`, `${area} 災害対応 自販機`],
    restaurant: [`${area} 居酒屋 予約`, `${area} 飲食店 クーポン`, `${area} ランチ 夜営業`],
    "recycle-shop": [`${area} リサイクルショップ`, `${area} 買取 中古 家電`, `${area} セカンドストリート ハードオフ ブックオフ`]
  };
  return patterns[gap.genre_key] || [`${area} ${gap.genre_label}`];
}

function subtleLinksFor(gap) {
  const area = gap.area_label;
  const genre = gap.genre_label;
  const shoppingKeywords = {
    netcafe: "ネットカフェ 軽食 備品",
    "video-box": "軽食 充電器 アメニティ",
    darts: "ダーツ バレル フライト",
    bowling: "ボウリング ボール シューズ",
    billiards: "ビリヤード キュー チョーク",
    "parking-lot": "ETC 車載 便利グッズ",
    "bicycle-parking": "自転車 鍵 レインカバー ライト",
    "vending-machine": "飲料 まとめ買い 防災備蓄",
    "vending-machine-installation": "防犯カメラ 屋外照明",
    "office-tenant": "店舗 開業 備品 オフィス家具",
    "opening-area-research": "店舗 看板 チラシ 防犯カメラ",
    cafe: "カフェ タンブラー",
    "convenience-store": "携帯灰皿 モバイルバッテリー",
    "capsule-toy": "カプセルトイ 収納 ケース",
    "crane-game": "クレーンゲーム 景品 収納",
    "adult-shop": "アダルトグッズ 通販"
  };

  return [
    {
      label: linkLabelFor(gap.genre_key),
      url: `https://www.google.com/search?q=${encodeURIComponent(`${area} ${genre}`)}`
    },
    {
      label: "関連アイテム",
      url: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(shoppingKeywords[gap.genre_key] || `${genre} 関連商品`)}/`
    }
  ];
}

function linkLabelFor(genreKey) {
  if (["restaurant", "cafe", "karaoke", "cat-cafe", "sauna", "spa"].includes(genreKey)) return "空き状況";
  if (["darts", "bowling", "billiards"].includes(genreKey)) return "大会・イベント";
  if (["parking-lot", "bicycle-parking"].includes(genreKey)) return "料金確認";
  if (["office-tenant", "opening-area-research", "parking-management", "vending-machine-installation"].includes(genreKey)) return "比較する";
  return "店舗確認";
}

function operatorTargets() {
  return [
    { genre_key: "parking-lot", label: "時間貸し駐車場", examples: ["タイムズ", "三井のリパーク", "名鉄協商"] },
    { genre_key: "parking-management", label: "土地活用", examples: ["タイムズ24", "三井のリパーク", "日本駐車場開発"] },
    { genre_key: "vending-machine-installation", label: "自販機設置", examples: ["コカ・コーラ", "サントリー", "伊藤園", "ダイドー"] },
    { genre_key: "netcafe", label: "複合型ネットカフェ", examples: ["快活CLUB", "自遊空間", "アプレシオ"] },
    { genre_key: "video-box", label: "ビデオボックス", examples: ["金太郎", "花太郎", "宝島24"] },
    { genre_key: "game-center", label: "大型複合店", examples: ["ラウンドワン", "コロナワールド", "GiGO", "namco"] }
  ];
}

function writeMarkdown(relativePath, roadmap) {
  const lines = [
    "# データ拡張ロードマップ",
    "",
    `生成日時: ${roadmap.generated_at}`,
    "",
    "## 次に厚くする領域",
    ""
  ];

  for (const batch of roadmap.next_batches) {
    lines.push(`### ${batch.label}`);
    lines.push(batch.reason);
    lines.push("");
    for (const item of batch.items.slice(0, 12)) {
      lines.push(`- ${item.prefecture} ${item.area_label} / ${item.genre_label}: ${item.current}/${item.target}件`);
    }
    lines.push("");
  }

  lines.push("## 候補語サンプル");
  lines.push("");
  for (const seed of roadmap.seed_queries.slice(0, 40)) {
    lines.push(`- ${seed.query}`);
  }
  lines.push("");

  lines.push("## 運用メモ");
  lines.push("");
  for (const note of roadmap.notes) {
    lines.push(`- ${note}`);
  }
  lines.push("");

  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join("\n")}\n`, "utf8");
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
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
