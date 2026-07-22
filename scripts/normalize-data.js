const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "data", "shops.json");
const shops = JSON.parse(fs.readFileSync(file, "utf8"));

const areaMeta = {
  "nagoya-chikusa": ["名古屋市", "千種区", "名古屋市千種区", "nagoya/chikusa"],
  "nagoya-higashi": ["名古屋市", "東区", "名古屋市東区", "nagoya/higashi"],
  "nagoya-kita": ["名古屋市", "北区", "名古屋市北区", "nagoya/kita"],
  "nagoya-nishi": ["名古屋市", "西区", "名古屋市西区", "nagoya/nishi"],
  "nagoya-nakamura": ["名古屋市", "中村区", "名古屋市中村区", "nagoya/nakamura"],
  "nagoya-naka": ["名古屋市", "中区", "名古屋市中区", "nagoya/naka"],
  "nagoya-showa": ["名古屋市", "昭和区", "名古屋市昭和区", "nagoya/showa"],
  "nagoya-mizuho": ["名古屋市", "瑞穂区", "名古屋市瑞穂区", "nagoya/mizuho"],
  "nagoya-atsuta": ["名古屋市", "熱田区", "名古屋市熱田区", "nagoya/atsuta"],
  "nagoya-nakagawa": ["名古屋市", "中川区", "名古屋市中川区", "nagoya/nakagawa"],
  "nagoya-minato": ["名古屋市", "港区", "名古屋市港区", "nagoya/minato"],
  "nagoya-minami": ["名古屋市", "南区", "名古屋市南区", "nagoya/minami"],
  "nagoya-moriyama": ["名古屋市", "守山区", "名古屋市守山区", "nagoya/moriyama"],
  "nagoya-midori": ["名古屋市", "緑区", "名古屋市緑区", "nagoya/midori"],
  "nagoya-meito": ["名古屋市", "名東区", "名古屋市名東区", "nagoya/meito"],
  "nagoya-tempaku": ["名古屋市", "天白区", "名古屋市天白区", "nagoya/tempaku"],
  toyota: ["豊田市", "", "豊田市", "toyota"],
  okazaki: ["岡崎市", "", "岡崎市", "okazaki"],
  obu: ["大府市", "", "大府市", "obu"],
  anjo: ["安城市", "", "安城市", "anjo"],
  kariya: ["刈谷市", "", "刈谷市", "kariya"],
  owariasahi: ["尾張旭市", "", "尾張旭市", "owariasahi"]
};

const genreLabels = {
  netcafe: "ネットカフェ",
  "game-center": "ゲームセンター",
  "adult-shop": "アダルトショップ",
  karaoke: "カラオケ",
  sauna: "サウナ",
  spa: "スーパー銭湯・SPA・岩盤浴",
  restaurant: "飲食店・居酒屋"
};

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
  "aichi-kariya-jankara-ekimae": { name: "ジャンカラ 刈谷駅前店", address: "愛知県刈谷市桜町2丁目1-4 2-4F", nearest_station: "刈谷駅", area: "刈谷駅周辺" },
  "aichi-nagoya-midori-takumi": { name: "DVD匠書店 緑店", address: "愛知県名古屋市緑区平手南1丁目418", nearest_station: "徳重駅", area: "平手周辺" },
  "aichi-nagoya-naka-kaikatsu-osu": { name: "快活CLUB 大須店", address: "愛知県名古屋市中区大須3-30-40 万松寺ビル2F", nearest_station: "上前津駅", area: "大須周辺" },
  "aichi-nagoya-naka-kaikatsu-sakae-chojamachi": { name: "快活CLUB 栄長者町店", address: "愛知県名古屋市中区錦2-4-1 広小路クロスタワーB1F", nearest_station: "丸の内駅", area: "長者町周辺" },
  "aichi-nagoya-naka-kaikatsu-sakae-hirokoji": { name: "快活CLUB 栄広小路店", address: "愛知県名古屋市中区栄4-2-8 小浅ビル2F-7F", nearest_station: "栄駅", area: "栄周辺" },
  "aichi-nagoya-chikusa-kaikatsu-chayagasaka": { name: "快活CLUB 茶屋が坂駅前店", address: "愛知県名古屋市千種区茶屋が坂1-20-21", nearest_station: "茶屋ヶ坂駅", area: "茶屋が坂周辺" },
  "aichi-nagoya-kita-kaikatsu-kusunoki": { name: "快活CLUB 名古屋楠インター店", address: "愛知県名古屋市北区玄馬町234-1", nearest_station: "比良駅", area: "楠インター周辺" },
  "aichi-nagoya-minato-kaikatsu-keibajomae": { name: "快活CLUB 当知店", address: "愛知県名古屋市港区小割通3-8", nearest_station: "港北駅", area: "当知周辺" },
  "aichi-nagoya-midori-kaikatsu-narumi-tokushige": { name: "快活CLUB 鳴海徳重店", address: "愛知県名古屋市緑区乗鞍1-1416", nearest_station: "徳重駅", area: "徳重周辺" },
  "aichi-nagoya-tempaku-kaikatsu-ueda": { name: "快活CLUB 153号天白植田店", address: "愛知県名古屋市天白区植田本町2-2107", nearest_station: "植田駅", area: "植田周辺" },
  "aichi-nagoya-moriyama-kaikatsu-moriyama": { name: "快活CLUB 守山店", address: "愛知県名古屋市守山区野萩町1-46", nearest_station: "喜多山駅", area: "守山区野萩町周辺" },
  "aichi-nagoya-atsuta-gigo-kanayama": { name: "GiGO 金山", address: "愛知県名古屋市熱田区金山町1-19-2", nearest_station: "金山駅", area: "金山駅周辺" },
  "aichi-nagoya-chikusa-manekineko-imaike": { name: "カラオケまねきねこ 今池店", address: "愛知県名古屋市千種区今池5丁目1-5 名古屋センタープラザビルB1F", nearest_station: "今池駅", area: "今池周辺" },
  "aichi-nagoya-nakagawa-manekineko": { name: "カラオケまねきねこ 中川店", address: "愛知県名古屋市中川区中島新町2-150", nearest_station: "中島駅", area: "中島新町周辺" },
  "aichi-nagoya-meito-manekineko": { name: "カラオケまねきねこ 名東店", address: "愛知県名古屋市名東区名東本通3丁目117", nearest_station: "一社駅", area: "名東本通周辺" },
  "aichi-nagoya-nakamura-manekineko-meieki4": { name: "カラオケまねきねこ 名駅4丁目店", address: "愛知県名古屋市中村区名駅4-11-1 COLLECT MARK名駅4丁目9-11F", nearest_station: "名古屋駅", area: "名駅周辺" },
  "aichi-nagoya-minami-takumi": { name: "DVD匠書店 南店", address: "愛知県名古屋市南区千竈通4丁目2-1", nearest_station: "笠寺駅", area: "千竈通周辺" },
  "aichi-nagoya-tempaku-takumi-ipponmatsu": { name: "DVD匠書店 一本松店", address: "愛知県名古屋市天白区一本松2丁目1014付近", nearest_station: "塩釜口駅", area: "一本松周辺" },
  "aichi-nagoya-tempaku-takumi-hirabari": { name: "DVD匠書店 平針店", address: "愛知県名古屋市天白区平針2丁目1712", nearest_station: "平針駅", area: "平針周辺" },
  "aichi-nagoya-nakagawa-ayanami": { name: "綾波書店 中川店", address: "愛知県名古屋市中川区法華西町1丁目1806", nearest_station: "高畑駅", area: "法華西町周辺" },
  "aichi-okazaki-rakunoyu": { name: "おかざき楽の湯", address: "愛知県岡崎市庄司田1丁目14-14", nearest_station: "岡崎駅", area: "庄司田周辺", hours: "9:00-23:00" },
  "aichi-okazaki-super-sento-furoya": { name: "スーパー銭湯ふろ屋", address: "愛知県岡崎市洞町西五位原6-1", nearest_station: "男川駅", area: "洞町周辺", hours: "8:00-24:00" },
  "aichi-toyota-oiden-no-yu": { name: "おいでんの湯", address: "愛知県豊田市司町1丁目1-1周辺", nearest_station: "新上挙母駅", area: "司町周辺", hours: "8:00-翌1:00" },
  "aichi-toyota-hottokan-juwajuwa": { name: "豊田ほっとかん じゅわじゅわ", address: "愛知県豊田市本新町7-48-6", nearest_station: "新豊田駅", area: "本新町周辺", hours: "10:00-21:00" },
  "aichi-nagoya-chikusa-apz": { name: "アペゼ", address: "愛知県名古屋市千種区今池周辺", nearest_station: "今池駅", area: "今池周辺", hours: "24時間営業" },
  "aichi-nagoya-higashi-yunoshiro-ozone": { name: "大曽根温泉 湯の城", address: "愛知県名古屋市東区大曽根周辺", nearest_station: "大曽根駅", area: "大曽根周辺", hours: "6:00-翌1:00" },
  "aichi-nagoya-kita-kitanoyu-shonai": { name: "庄内温泉 喜多の湯", address: "愛知県名古屋市北区喜惣治周辺", nearest_station: "比良駅", area: "喜惣治周辺", hours: "9:00-24:00" },
  "aichi-nagoya-nishi-kiwami-sauna": { name: "KIWAMI SAUNA 本店", address: "愛知県名古屋市西区浅間町周辺", nearest_station: "浅間町駅", area: "浅間町周辺", hours: "11:30-23:30前後" },
  "aichi-nagoya-nakamura-suminoyu": { name: "炭の湯", address: "愛知県名古屋市中村区亀島2-11-8", nearest_station: "亀島駅", area: "亀島周辺", hours: "16:00-23:00" },
  "aichi-nagoya-naka-niomon-yu": { name: "仁王門湯", address: "愛知県名古屋市中区大須3-37-20", nearest_station: "上前津駅", area: "大須周辺", hours: "13:00-22:30" },
  "aichi-nagoya-showa-mitake-onsen": { name: "御嶽温泉", address: "愛知県名古屋市昭和区御器所3-10-7", nearest_station: "荒畑駅", area: "御器所周辺", hours: "15:00-翌2:00" },
  "aichi-nagoya-mizuho-kawasumi-yu": { name: "川澄湯", address: "愛知県名古屋市瑞穂区川澄町2-20", nearest_station: "桜山駅", area: "川澄町周辺", hours: "16:00-22:00" },
  "aichi-nagoya-nakagawa-shinmotoyu": { name: "新元湯", address: "愛知県名古屋市中川区下之一色町周辺", nearest_station: "伏屋駅", area: "下之一色町周辺", hours: "公式カレンダー確認" },
  "aichi-nagoya-minato-canal-resort": { name: "キャナル・リゾート", address: "愛知県名古屋市中川区玉川町4丁目1", nearest_station: "六番町駅", area: "玉川町周辺", hours: "9:00-翌1:00前後" },
  "aichi-nagoya-moriyama-ryusenji": { name: "竜泉寺の湯 名古屋守山本店", address: "愛知県名古屋市守山区竜泉寺1丁目1501", nearest_station: "大森・金城学院前駅", area: "竜泉寺周辺", hours: "6:00-翌3:00" },
  "aichi-nagoya-midori-momoyama-no-yu": { name: "桃山の湯", address: "愛知県名古屋市緑区桃山周辺", nearest_station: "神沢駅", area: "桃山周辺", hours: "確認中" },
  "aichi-anjo-denpark-yu": { name: "天然温泉コロナの湯 安城店", address: "愛知県安城市浜富町6-8周辺", nearest_station: "南安城駅", area: "浜富町周辺", hours: "確認中" },
  "aichi-kariya-kariyachiryuu-yunosato": { name: "天然温泉かきつばた", address: "愛知県刈谷市東境町吉野55 刈谷ハイウェイオアシス内", nearest_station: "富士松駅", area: "刈谷ハイウェイオアシス周辺", hours: "確認中" },
  "aichi-obu-megumi-no-yu": { name: "JAあぐりタウン げんきの郷 めぐみの湯", address: "愛知県大府市吉田町正右エ門新田1-1周辺", nearest_station: "大府駅", area: "げんきの郷周辺", hours: "確認中" }
};

function hasBrokenText(value) {
  const text = String(value ?? "");
  return text.includes("?") || [...text].some((char) => char.charCodeAt(0) === 0x7e3a || char.charCodeAt(0) === 0x7e67 || char.charCodeAt(0) === 0xfffd);
}

const additions = [
  ["aichi-nagoya-nakamura-juhachido", "完全個室 鉄板×炉端 ジュッパチ堂 名古屋駅店", "restaurant", "nagoya-nakamura", "愛知県名古屋市中村区名駅周辺", "名古屋駅", 2, 3500, "目安3,500円から", false, true, true, "名駅周辺", 35.1707, 136.884],
  ["aichi-nagoya-nakamura-meieki-sakaba", "名駅酒場 名古屋駅前店", "restaurant", "nagoya-nakamura", "愛知県名古屋市中村区名駅周辺", "名古屋駅", 1, 3000, "目安3,000円から", false, true, true, "名駅周辺", 35.171, 136.883],
  ["aichi-nagoya-naka-daijin", "大甚本店", "restaurant", "nagoya-naka", "愛知県名古屋市中区栄1丁目5-6", "伏見駅", 1, 2500, "目安2,500円から", false, false, false, "伏見周辺", 35.1688, 136.8972],
  ["aichi-nagoya-naka-tetsumaru-sakae", "鉄板居酒屋 てつまる 栄店", "restaurant", "nagoya-naka", "愛知県名古屋市中区栄3-11-5 栄マンション1F", "栄駅", 8, 3000, "目安3,000円から", false, true, true, "栄周辺", 35.1672, 136.9055],
  ["aichi-okazaki-kanata", "創作中華酒場KANATA 東岡崎店", "restaurant", "okazaki", "愛知県岡崎市明大寺本町1丁目8-1 万平ビル2F", "東岡崎駅", 4, 3500, "目安3,500円から", false, true, true, "東岡崎駅周辺", 34.9546, 137.166],
  ["aichi-okazaki-fanaka", "発酵料理×クラフトビール FaNaKa", "restaurant", "okazaki", "愛知県岡崎市明大寺町川端12 丘ビル2F", "東岡崎駅", 2, 4000, "目安4,000円から", false, true, true, "東岡崎駅周辺", 34.9539, 137.167],
  ["aichi-toyota-cafestand-popo", "Cafe Stand popo", "restaurant", "toyota", "愛知県豊田市西町5-5 豊田ヴィッツタウン1階", "豊田市駅", 3, 2500, "目安2,500円から", true, true, true, "豊田市駅周辺", 35.0868, 137.156],
  ["aichi-toyota-kakurebo", "個室居酒屋 隠れ坊 豊田店", "restaurant", "toyota", "愛知県豊田市豊田市駅周辺", "豊田市駅", 3, 3500, "目安3,500円から", false, true, true, "豊田市駅周辺", 35.087, 137.156],
  ["aichi-kariya-tenkai", "天海 刈谷駅前店", "restaurant", "kariya", "愛知県刈谷市相生町2丁目10-5 ZOHYA BLDG 4F 5F", "刈谷駅", 2, 3500, "目安3,500円から", false, true, true, "刈谷駅周辺", 34.991, 137.009],
  ["aichi-kariya-otori", "焼き鳥職人 鳳 刈谷本店", "restaurant", "kariya", "愛知県刈谷市相生町2-38 4F", "刈谷駅", 3, 3000, "目安3,000円から", false, true, true, "刈谷駅周辺", 34.991, 137.008],
  ["aichi-anjo-musasabi", "Musasabi", "restaurant", "anjo", "愛知県安城市朝日町12-2", "安城駅", 5, 3000, "目安3,000円から", true, true, true, "安城駅周辺", 34.958, 137.086],
  ["aichi-obu-la-farfalla", "ラ・ファルファーラ", "restaurant", "obu", "愛知県大府市中央町3-108", "大府駅", 3, 3000, "目安3,000円から", true, false, true, "大府駅周辺", 35.011, 136.963],
  ["aichi-obu-imura", "泊まれる居酒屋Imura", "restaurant", "obu", "愛知県大府市東新町3-68", "共和駅", 7, 3000, "目安3,000円から", true, true, false, "共和駅周辺", 35.035, 136.955]
];

for (const shop of shops) {
  const area = areaMeta[shop.area_key];
  if (area) {
    shop.city = area[0];
    shop.ward = area[1];
    shop.area_label = area[2];
    shop.area_path = area[3];
  }
  shop.prefecture = "愛知県";
  shop.genre = genreLabels[shop.genre_key] || shop.genre;
  if (fixes[shop.id]) Object.assign(shop, fixes[shop.id]);
  if (!shop.budget_label || hasBrokenText(shop.budget_label)) {
    shop.budget_label = shop.budget_min ? `目安${Number(shop.budget_min).toLocaleString("ja-JP")}円から` : "目安確認中";
  }
  if (!shop.hours || hasBrokenText(shop.hours)) {
    shop.hours = {
      netcafe: "24時間営業",
      karaoke: "夜まで営業",
      "adult-shop": "営業時間確認",
      "game-center": "営業時間確認",
      sauna: "営業時間確認",
      spa: "営業時間確認",
      restaurant: "夜まで営業"
    }[shop.genre_key] || "営業時間確認";
  }
  shop.url = `/area/aichi/${shop.area_path}/${shop.genre_key}/`;
  if (shop.source) shop.source.google_query = `${shop.name} ${shop.area_label}`;
}

const existing = new Set(shops.map((shop) => shop.id));
for (const item of additions) {
  if (existing.has(item[0])) continue;
  const [id, name, genreKey, areaKey, address, station, walk, budget, budgetLabel, parking, late, coupon, area, lat, lng] = item;
  const meta = areaMeta[areaKey];
  shops.push({
    id,
    name,
    genre_key: genreKey,
    genre: genreLabels[genreKey],
    prefecture: "愛知県",
    city: meta[0],
    ward: meta[1],
    area_key: areaKey,
    area_path: meta[3],
    area_label: meta[2],
    area,
    address,
    hours: late ? "夜まで営業" : "営業時間確認",
    nearest_station: station,
    station_walk_minutes: walk,
    budget_min: budget,
    budget_label: budgetLabel,
    parking,
    late,
    coupon,
    url: `/area/aichi/${meta[3]}/${genreKey}/`,
    lat,
    lng,
    source: { google_place_id: null, google_query: `${name} ${meta[2]}` }
  });
}

fs.writeFileSync(file, `${JSON.stringify(shops, null, 2)}\n`, "utf8");
console.log(`Normalized ${shops.length} shops.`);
