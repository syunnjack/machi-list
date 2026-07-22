const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shopsFile = path.join(root, "data", "shops.json");
const shops = JSON.parse(fs.readFileSync(shopsFile, "utf8"));
const areas = JSON.parse(fs.readFileSync(path.join(root, "data", "areas.json"), "utf8"));
const genres = JSON.parse(fs.readFileSync(path.join(root, "data", "genres.json"), "utf8"));

const areaByKey = Object.fromEntries(areas.map((area) => [area.key, area]));
const genreByKey = Object.fromEntries(genres.map((genre) => [genre.key, genre]));

function hasBrokenText(value) {
  const text = String(value ?? "");
  return text.includes("?") || [...text].some((char) => [0x7e3a, 0x7e67, 0xfffd].includes(char.charCodeAt(0)));
}

function vcUrl(targetUrl) {
  return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=YOUR_VC_SID&pid=YOUR_VC_PID&vc_url=${encodeURIComponent(targetUrl)}`;
}

function rakutenUrl(keyword) {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
}

function defaultHours(genreKey) {
  return {
    netcafe: "24時間営業",
    karaoke: "夜まで営業",
    "adult-shop": "営業時間確認",
    "game-center": "営業時間確認",
    sauna: "営業時間確認",
    spa: "営業時間確認",
    restaurant: "夜まで営業"
  }[genreKey] || "営業時間確認";
}

function normalizeShop(shop) {
  const area = areaByKey[shop.area_key];
  const genre = genreByKey[shop.genre_key];
  if (!area || !genre) return shop;

  shop.prefecture_key = area.prefecture_key;
  shop.prefecture = area.prefecture;
  shop.city = area.city;
  shop.ward = area.ward;
  shop.area_path = area.path;
  shop.area_label = area.label;
  shop.genre = genre.label;
  shop.url = `/area/${area.prefecture_key}/${area.path}/${shop.genre_key}/`;
  shop.source = shop.source || {};
  shop.source.google_query = shop.source.google_query || `${shop.name} ${area.label}`;
  shop.place_query = shop.place_query || shop.source.google_query;

  if (!shop.budget_label || hasBrokenText(shop.budget_label)) {
    shop.budget_label = shop.budget_min ? `目安${Number(shop.budget_min).toLocaleString("ja-JP")}円から` : "目安確認中";
  }
  if (!shop.hours || hasBrokenText(shop.hours)) {
    shop.hours = defaultHours(shop.genre_key);
  }

  if (!shop.official_url) shop.official_url = "";
  if (!shop.booking_url && shop.genre_key !== "adult-shop") {
    shop.booking_url = vcUrl(`https://www.hotpepper.jp/?keyword=${encodeURIComponent(`${area.label} ${genre.label}`)}`);
  }
  if (!shop.coupon_url) {
    shop.coupon_url = shop.genre_key === "adult-shop" ? rakutenUrl("アダルトグッズ 通販") : rakutenUrl(`${genre.label} クーポン`);
  }
  if (!shop.shopping_url) {
    shop.shopping_url = shop.genre_key === "adult-shop" ? rakutenUrl("アダルトグッズ 通販") : rakutenUrl(`${genre.label} 関連商品`);
  }
  return shop;
}

const fixes = {
  "aichi-anjo-kaikatsu-mikawa-anjo": { name: "快活CLUB 三河安城店", address: "愛知県安城市緑町1-26-5", nearest_station: "三河安城駅", area: "三河安城駅周辺" },
  "aichi-kariya-kaikatsu": { name: "快活CLUB 刈谷店", address: "愛知県刈谷市新富町4-907", nearest_station: "刈谷駅", area: "刈谷駅周辺" },
  "aichi-anjo-gigo": { name: "GiGO 安城", address: "愛知県安城市百石町2-35-13", nearest_station: "安城駅", area: "百石町周辺" },
  "aichi-kariya-gigo-aeontown": { name: "GiGO イオンタウン刈谷", address: "愛知県刈谷市東境町京和1", nearest_station: "富士松駅", area: "イオンタウン刈谷周辺" },
  "aichi-anjo-takumi-satomachi": { name: "DVD匠書店 安城里町店", address: "愛知県安城市里町東山ノ田87-2", nearest_station: "新安城駅", area: "里町周辺" },
  "aichi-anjo-akiba-1": { name: "あきば書店 安城1号店", address: "愛知県安城市尾崎町追池52-9", nearest_station: "宇頭駅", area: "尾崎町周辺" },
  "aichi-kariya-zeroshiki": { name: "零式書店 刈谷店", address: "愛知県刈谷市中手町6-203", nearest_station: "逢妻駅", area: "中手町周辺" },
  "aichi-kariya-joyjoy-ekimae": { name: "カラオケJOYJOY 刈谷駅前店", address: "愛知県刈谷市相生町1丁目19", nearest_station: "刈谷駅", area: "刈谷駅周辺" },
  "aichi-kariya-manekineko-higashi": { name: "カラオケまねきねこ 刈谷東店", address: "愛知県刈谷市松栄町3丁目13-11 カタヤマビル2F", nearest_station: "野田新町駅", area: "松栄町周辺" },
  "aichi-kariya-jankara-ekimae": { name: "ジャンカラ 刈谷駅前店", address: "愛知県刈谷市桜町2丁目1-4 2-4F", nearest_station: "刈谷駅", area: "刈谷駅周辺" }
};

const additions = [
  ["aichi-nagoya-chikusa-joyjoy-imaike", "カラオケJOYJOY 今池店", "karaoke", "nagoya-chikusa", "愛知県名古屋市千種区今池1-11-6", "今池駅", 2, 900, "目安900円から", false, true, true, "今池周辺"],
  ["aichi-nagoya-nakamura-joysound-meieki3", "JOYSOUND 名駅三丁目中央店", "karaoke", "nagoya-nakamura", "愛知県名古屋市中村区名駅2-15-8 名駅グルメプラザ7階", "名古屋駅", 5, 1000, "目安1,000円から", false, true, true, "名駅周辺"],
  ["aichi-nagoya-naka-manekineko-osu", "カラオケまねきねこ 大須店", "karaoke", "nagoya-naka", "愛知県名古屋市中区大須3-30-60 大須301ビル7階", "上前津駅", 4, 900, "目安900円から", false, true, true, "大須周辺"],
  ["aichi-nagoya-atsuta-joysound-kanayama", "JOYSOUND 金山店", "karaoke", "nagoya-atsuta", "愛知県名古屋市熱田区金山町1-5-5", "金山駅", 2, 1000, "目安1,000円から", false, true, true, "金山周辺"],
  ["aichi-toyota-big-echo-toyota", "ビッグエコー 豊田店", "karaoke", "toyota", "愛知県豊田市元城町4-26", "豊田市駅", 8, 1000, "目安1,000円から", true, true, true, "豊田市駅周辺"],
  ["aichi-toyota-kaikatsu-kosaka", "快活CLUB 豊田小坂店", "netcafe", "toyota", "愛知県豊田市小坂町14-2-1", "新豊田駅", 18, 1200, "目安1,200円から", true, true, true, "小坂町周辺"],
  ["aichi-okazaki-kaikatsu-daijuji", "快活CLUB 岡崎大樹寺店", "netcafe", "okazaki", "愛知県岡崎市大樹寺3-12-5", "大門駅", 9, 1200, "目安1,200円から", true, true, true, "大樹寺周辺"],
  ["aichi-nagoya-nakagawa-joyjoy-sanno", "カラオケJOYJOY 山王店", "karaoke", "nagoya-nakagawa", "愛知県名古屋市中川区山王2-3-70", "山王駅", 5, 900, "目安900円から", true, true, true, "山王周辺"],
  ["aichi-nagoya-mizuho-joyjoy-aratamabashi", "カラオケJOYJOY 新瑞橋店", "karaoke", "nagoya-mizuho", "愛知県名古屋市瑞穂区洲山町2-22", "新瑞橋駅", 1, 900, "目安900円から", false, true, true, "新瑞橋周辺"],
  ["aichi-nagoya-meito-big-echo", "ビッグエコー 名東店", "karaoke", "nagoya-meito", "愛知県名古屋市名東区上社2-215", "本郷駅", 3, 1000, "目安1,000円から", true, true, true, "上社周辺"],
  ["shizuoka-aoi-kaikatsu-ryutsu", "快活CLUB 静岡流通通り店", "netcafe", "shizuoka-aoi", "静岡県静岡市葵区沓谷6-18-10", "長沼駅", 15, 1200, "目安1,200円から", true, true, true, "流通通り周辺", "https://www.kaikatsu.jp/shop/result.html?area=22"],
  ["shizuoka-suruga-kaikatsu-ekinan", "快活CLUB 静岡駅南口店", "netcafe", "shizuoka-suruga", "静岡県静岡市駿河区南町10-1 アクロスキューブ静岡南町2-3F", "静岡駅", 1, 1200, "目安1,200円から", false, true, true, "静岡駅南口周辺", "https://www.kaikatsu.jp/shop/result.html?area=22"],
  ["shizuoka-hamamatsu-kaikatsu-ekikita", "快活CLUB 浜松駅北口店", "netcafe", "hamamatsu-chuo", "静岡県浜松市中央区旭町10-8 浜松駅前ビル3F", "浜松駅", 2, 1200, "目安1,200円から", false, true, true, "浜松駅北口周辺", "https://www.kaikatsu.jp/shop/detail/20974.html"],
  ["shizuoka-numazu-kaikatsu", "快活CLUB 沼津店", "netcafe", "numazu", "静岡県沼津市共栄町19-5", "大岡駅", 18, 1200, "目安1,200円から", true, true, true, "共栄町周辺", "https://www.kaikatsu.jp/shop/result.html?area=22"],
  ["shizuoka-fuji-kaikatsu-aoba", "快活CLUB 富士青葉店", "netcafe", "fuji", "静岡県富士市青葉町36", "竪堀駅", 20, 1200, "目安1,200円から", true, true, true, "青葉町周辺", "https://www.kaikatsu.jp/shop/result.html?area=22"],
  ["shizuoka-aoi-gigo-shizuoka", "GiGO 静岡", "game-center", "shizuoka-aoi", "静岡県静岡市葵区七間町4", "静岡駅", 12, 500, "目安500円から", false, true, false, "七間町周辺", "https://www.gigo.co.jp/shops/shizuoka"],
  ["shizuoka-shimizu-gigo-baydream", "GiGO ベイドリーム清水", "game-center", "shizuoka-shimizu", "静岡県静岡市清水区駒越北町8-1 ベイドリーム清水2F", "清水駅", 35, 500, "目安500円から", true, true, false, "ベイドリーム清水周辺", "https://www.gigo.co.jp/shops/shizuoka"],
  ["shizuoka-hamamatsu-round1", "ラウンドワンスタジアム 浜松店", "game-center", "hamamatsu-chuo", "静岡県浜松市中央区天王町諏訪1981-17", "自動車学校前駅", 25, 500, "目安500円から", true, true, true, "天王町周辺"],
  ["shizuoka-numazu-mollyfantasy", "モーリーファンタジー 沼津店", "game-center", "numazu", "静岡県沼津市東椎路東荒301-3", "片浜駅", 25, 500, "目安500円から", true, false, true, "東椎路周辺"],
  ["shizuoka-fuji-round1", "ラウンドワン 富士店", "game-center", "fuji", "静岡県富士市八代町4-15", "ジヤトコ前駅", 12, 500, "目安500円から", true, true, true, "八代町周辺"],
  ["shizuoka-aoi-manekineko-gofukucho", "カラオケまねきねこ 静岡呉服町通り店", "karaoke", "shizuoka-aoi", "静岡県静岡市葵区紺屋町1-4 目のまえスクランブルビルディング4-6階", "静岡駅", 7, 900, "目安900円から", false, true, true, "呉服町周辺", "https://www.jkba.or.jp/kamei/list/shizuoka"],
  ["shizuoka-suruga-big-echo-ekinan", "ビッグエコー 静岡南口駅前店", "karaoke", "shizuoka-suruga", "静岡県静岡市駿河区南町10-1 アクロスキューブ静岡", "静岡駅", 1, 1000, "目安1,000円から", false, true, true, "静岡駅南口周辺", "https://www.jkba.or.jp/kamei/list/shizuoka"],
  ["shizuoka-hamamatsu-manekineko-shinhamamatsu", "カラオケまねきねこ 新浜松駅前店", "karaoke", "hamamatsu-chuo", "静岡県浜松市中央区千歳町88-1", "新浜松駅", 2, 900, "目安900円から", false, true, true, "新浜松駅周辺", "https://www.jkba.or.jp/kamei/list/shizuoka"],
  ["shizuoka-numazu-manekineko-kitaguchi", "カラオケまねきねこ 沼津北口店", "karaoke", "numazu", "静岡県沼津市高島町3-1 B1F", "沼津駅", 2, 900, "目安900円から", false, true, true, "沼津駅北口周辺", "https://www.karaokemanekineko.jp/locations/shizuoka/numazu-shi/numazu-kitaguchi-store/"],
  ["shizuoka-shimizu-manekineko-kusanagi", "カラオケまねきねこ 草薙駅前店", "karaoke", "shizuoka-shimizu", "静岡県静岡市清水区草薙1-2-15", "草薙駅", 1, 900, "目安900円から", false, true, true, "草薙駅周辺", "https://www.jkba.or.jp/kamei/list/shizuoka"],
  ["shizuoka-suruga-sauna-shikiji", "サウナしきじ", "sauna", "shizuoka-suruga", "静岡県静岡市駿河区敷地2-25-1", "静岡駅", 35, 1700, "目安1,700円から", true, true, false, "敷地周辺", "https://www.visit-shizuoka.com/spot/detail_466.html"],
  ["shizuoka-aoi-yunoki-no-sato", "柚木の郷", "spa", "shizuoka-aoi", "静岡県静岡市葵区東静岡駅前周辺", "東静岡駅", 3, 1100, "目安1,100円から", true, true, true, "東静岡駅周辺", "https://www.supersento.com/chubu/shizuoka/1_shizuoka.html"],
  ["shizuoka-aoi-ofurocafe-bijinyu", "おふろcafe bijinyu", "spa", "shizuoka-aoi", "静岡県静岡市葵区籠上周辺", "静岡駅", 35, 630, "目安630円から", true, true, true, "籠上周辺", "https://www.supersento.com/chubu/shizuoka/1_shizuoka.html"],
  ["shizuoka-numazu-suruganoyu", "天然日帰り温泉 駿河の湯", "spa", "numazu", "静岡県沼津市岡宮1265-3", "沼津駅", 45, 900, "目安900円から", true, true, true, "岡宮周辺", "https://www.suruganoyu.co.jp/about"],
  ["shizuoka-hamamatsu-arai-benten", "浜名湖弁天島温泉 ファミリー向け日帰り施設", "spa", "hamamatsu-chuo", "静岡県浜松市中央区舞阪町弁天島周辺", "弁天島駅", 10, 900, "目安900円から", true, false, true, "弁天島周辺"],
  ["shizuoka-fuji-yuura", "湯らぎの里", "spa", "fuji", "静岡県富士市蓼原周辺", "富士駅", 25, 900, "目安900円から", true, true, true, "蓼原周辺"],
  ["shizuoka-hamamatsu-tokyo-shoten-takaoka", "東京書店 浜松高丘店", "adult-shop", "hamamatsu-chuo", "静岡県浜松市中央区高丘西2-9-33", "浜松駅", 70, 1000, "目安1,000円から", true, true, true, "高丘西周辺", "https://www.adultshop-go.com/store/%E6%9D%B1%E4%BA%AC%E6%9B%B8%E5%BA%97%E6%B5%9C%E6%9D%BE%E9%AB%98%E4%B8%98%E5%BA%97/"],
  ["shizuoka-aoi-issen-shizuoka", "いっせん 静岡駅店", "restaurant", "shizuoka-aoi", "静岡県静岡市葵区両替町2-5-13 第2リッツビル1F", "静岡駅", 7, 3000, "目安3,000円から", false, true, true, "両替町周辺", "https://issen-shizuoka.foodre.jp/"],
  ["shizuoka-hamamatsu-gyoza-ensho", "餃子の遠州 有楽街店", "restaurant", "hamamatsu-chuo", "静岡県浜松市中央区鍛冶町319-11", "第一通り駅", 4, 2500, "目安2,500円から", false, true, true, "有楽街周辺", "https://www.hotpepper.jp/strJ001202107/"],
  ["shizuoka-hamamatsu-ippo", "魚の居酒屋 いっぽ 浜松", "restaurant", "hamamatsu-chuo", "静岡県浜松市中央区田町316-30 ブルーノアビル2F", "第一通り駅", 3, 4000, "目安4,000円から", false, true, true, "有楽街周辺", "https://ippo-izakaya-hamamatsu.owst.jp/"],
  ["shizuoka-numazu-bus-stop", "居酒屋 バスストップ", "restaurant", "numazu", "静岡県沼津市高島町19-6 1F", "沼津駅", 7, 2500, "目安2,500円から", false, true, true, "沼津駅北口周辺", "https://www.bus-stop.jp/"],
  ["shizuoka-fujieda-sumire", "やきとり家すみれ 藤枝店", "restaurant", "fujieda", "静岡県藤枝市前島2-1-43", "藤枝駅", 1, 2500, "目安2,500円から", false, true, true, "藤枝駅南口周辺", "https://www.hotpepper.jp/strJ004026770/"],
  ["shizuoka-fujieda-uotori", "うお鶏 藤枝店", "restaurant", "fujieda", "静岡県藤枝市前島1-3-1 ホテルオーレ2階", "藤枝駅", 1, 3500, "目安3,500円から", true, true, true, "藤枝駅南口周辺", "https://uotori-fujieda.owst.jp/"]
];

const removeIds = new Set([
  "shizuoka-aoi-adult-shop-shizuoka",
  "shizuoka-numazu-adult-shop-numazu",
  "shizuoka-aoi-daijin-shizuoka-sample",
  "shizuoka-hamamatsu-izakaya-yurakugai",
  "shizuoka-numazu-izakaya-ekimae",
  "shizuoka-fujieda-izakaya-ekimae"
]);

for (let index = shops.length - 1; index >= 0; index -= 1) {
  if (removeIds.has(shops[index].id)) shops.splice(index, 1);
}

const existing = new Set(shops.map((shop) => shop.id));
for (const item of additions) {
  if (existing.has(item[0])) continue;
  const [id, name, genreKey, areaKey, address, station, walk, budget, budgetLabel, parking, late, coupon, localArea, officialUrl] = item;
  shops.push({
    id,
    name,
    genre_key: genreKey,
    area_key: areaKey,
    area: localArea,
    address,
    hours: defaultHours(genreKey),
    nearest_station: station,
    station_walk_minutes: walk,
    budget_min: budget,
    budget_label: budgetLabel,
    parking,
    late,
    coupon,
    official_url: officialUrl || "",
    source: { google_place_id: null, google_query: `${name} ${address}` }
  });
}

for (const shop of shops) {
  if (fixes[shop.id]) Object.assign(shop, fixes[shop.id]);
  normalizeShop(shop);
}

shops.sort((a, b) => {
  const pref = String(a.prefecture_key).localeCompare(String(b.prefecture_key), "ja");
  if (pref) return pref;
  const area = String(a.area_key).localeCompare(String(b.area_key), "ja");
  if (area) return area;
  const genre = String(a.genre_key).localeCompare(String(b.genre_key), "ja");
  if (genre) return genre;
  return String(a.name).localeCompare(String(b.name), "ja");
});

fs.writeFileSync(shopsFile, `${JSON.stringify(shops, null, 2)}\n`, "utf8");
console.log(`Normalized ${shops.length} shops.`);
