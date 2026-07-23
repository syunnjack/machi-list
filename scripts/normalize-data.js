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

function searchUrl(keyword) {
  return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
}

function timesUrl(area) {
  return vcUrl(`https://times-info.net/?keyword=${encodeURIComponent(area.label)}`);
}

function timesCardUrl() {
  return vcUrl("https://btimes.jp/about/");
}

function parkingOperatorSearchUrl(area) {
  return searchUrl(`${area.label} 駐車場管理会社 土地活用 一括借り上げ`);
}

function reparkLandUseUrl() {
  return "https://www.repark.jp/lp/01/";
}

function meitetsuParkingLandUseUrl() {
  return "https://land.mkp.jp/";
}

function npdParkingUrl() {
  return "https://n-p-d.co.jp/service/parking/";
}

function cocaColaVendingUrl() {
  return "https://www.coca-cola.com/jp/ja/media-center/vending-machine";
}

function suntoryVendingUrl() {
  return "https://www.suntory.co.jp/softdrink/jihanki/index.html";
}

function dydoVendingUrl() {
  return "https://www.dydo.co.jp/jihankiconsul/faq/";
}

function itoenVendingUrl() {
  return "https://www.itoen.co.jp/company/vender/";
}

function homesOfficeUrl() {
  return "https://www.homes.co.jp/chintai/office/";
}

function athomeBusinessUrl() {
  return "https://www.athome.co.jp/";
}

function inukiTenantUrl() {
  return "https://www.i-tenpo.com/";
}

function openingResearchUrl(area) {
  return searchUrl(`${area.label} 開業 競合店 周辺調査 立地`);
}

const eventGenreKeys = new Set(["darts", "bowling", "billiards"]);

function isEventGenre(genreKey) {
  return eventGenreKeys.has(genreKey);
}

function eventUrl(area, genre) {
  return vcUrl(`https://www.asoview.com/search/?keyword=${encodeURIComponent(`${area.label} ${genre.label} プロチャレンジ イベント`)}`);
}

function toolKeyword(genreKey, label) {
  return {
    darts: "ダーツ バレル フライト",
    bowling: "ボウリング ボール シューズ",
    billiards: "ビリヤード キュー チョーク",
    netcafe: "ネットカフェ 備品 軽食",
    "movie-theater": "映画 前売り券",
    "video-box": "軽食 充電器 アメニティ",
    "capsule-toy": "カプセルトイ 収納 ケース",
    "crane-game": "クレーンゲーム 景品 収納",
    "convenience-store": "携帯灰皿",
    cafe: "カフェ タンブラー",
    "coin-laundry": "洗濯ネット 洗剤 乾燥機シート",
    drugstore: "日用品 まとめ買い",
    "trading-card-shop": "トレカ スリーブ デッキケース",
    "hobby-shop": "プラモデル 工具 ケース",
    "recycle-shop": "収納ボックス 梱包資材",
    "dental-clinic": "歯ブラシ 歯間ブラシ デンタルフロス",
    "parking-lot": "タイムズカード ETC 車載 便利グッズ",
    "bicycle-parking": "自転車 鍵 レインカバー ライト",
    "parking-management": "駐車場 看板 防犯カメラ 照明",
    "vending-machine": "飲料 まとめ買い 防災備蓄",
    "vending-machine-installation": "自販機 防犯カメラ 屋外照明",
    "office-tenant": "店舗 開業 備品 オフィス家具",
    "opening-area-research": "店舗 看板 チラシ 防犯カメラ",
    "gas-station": "洗車用品 車 メンテナンス",
    "post-office": "梱包資材 封筒 宅配袋"
  }[genreKey] || `${label} 関連商品`;
}

function defaultHours(genreKey) {
  return {
    netcafe: "24時間営業",
    karaoke: "夜まで営業",
    "adult-shop": "営業時間確認",
    "game-center": "営業時間確認",
    sauna: "営業時間確認",
    spa: "営業時間確認",
    "cat-cafe": "営業時間確認",
    restaurant: "夜まで営業",
    darts: "夜まで営業",
    bowling: "営業時間確認",
    billiards: "夜まで営業",
    "movie-theater": "上映時間確認",
    "video-box": "24時間営業",
    "capsule-toy": "営業時間確認",
    "crane-game": "営業時間確認",
    "convenience-store": "24時間営業",
    cafe: "営業時間確認",
    "coin-laundry": "営業時間確認",
    drugstore: "営業時間確認",
    "trading-card-shop": "営業時間確認",
    "hobby-shop": "営業時間確認",
    "recycle-shop": "営業時間確認",
    "dental-clinic": "診療時間確認",
    "parking-lot": "24時間営業",
    "bicycle-parking": "利用時間確認",
    "parking-management": "相談時間確認",
    "vending-machine": "利用時間確認",
    "vending-machine-installation": "相談時間確認",
    "office-tenant": "物件確認",
    "opening-area-research": "調査項目確認",
    "gas-station": "営業時間確認",
    "post-office": "窓口時間確認"
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
  if (!shop.booking_url && shop.genre_key === "cat-cafe" && shop.official_url) {
    shop.booking_url = shop.official_url;
  }
  if (!shop.booking_url && shop.genre_key === "movie-theater" && shop.official_url) {
    shop.booking_url = shop.official_url;
  }
  if (!shop.booking_url && shop.genre_key === "video-box" && shop.official_url) {
    shop.booking_url = shop.official_url;
  }
  if (!shop.booking_url && (shop.genre_key === "capsule-toy" || shop.genre_key === "crane-game") && shop.official_url) {
    shop.booking_url = shop.official_url;
  }
  if (!shop.booking_url && shop.genre_key === "parking-lot") {
    shop.booking_url = timesUrl(area);
  }
  if (!shop.booking_url && shop.genre_key === "bicycle-parking") {
    shop.booking_url = searchUrl(`${area.label} 駐輪場 料金 定期利用 自治体`);
  }
  if (!shop.booking_url && shop.genre_key === "parking-management") {
    shop.booking_url = shop.official_url || parkingOperatorSearchUrl(area);
  }
  if (!shop.booking_url && shop.genre_key === "vending-machine") {
    shop.booking_url = searchUrl(`${area.label} 自動販売機 キャッシュレス 災害対応`);
  }
  if (!shop.booking_url && shop.genre_key === "vending-machine-installation") {
    shop.booking_url = shop.official_url || searchUrl(`${area.label} 自販機設置 相談`);
  }
  if (!shop.booking_url && shop.genre_key === "office-tenant") {
    shop.booking_url = shop.official_url || searchUrl(`${area.label} 貸事務所 貸店舗 テナント`);
  }
  if (!shop.booking_url && shop.genre_key === "opening-area-research") {
    shop.booking_url = openingResearchUrl(area);
  }
  if (!shop.booking_url && (shop.genre_key === "convenience-store" || shop.genre_key === "cafe" || shop.genre_key === "coin-laundry" || shop.genre_key === "drugstore" || shop.genre_key === "trading-card-shop" || shop.genre_key === "hobby-shop" || shop.genre_key === "recycle-shop" || shop.genre_key === "dental-clinic" || shop.genre_key === "gas-station" || shop.genre_key === "post-office") && shop.official_url) {
    shop.booking_url = shop.official_url;
  }
  if (!shop.booking_url && isEventGenre(shop.genre_key)) {
    shop.booking_url = eventUrl(area, genre);
  }
  if (!shop.booking_url && shop.genre_key !== "adult-shop") {
    shop.booking_url = vcUrl(`https://www.hotpepper.jp/?keyword=${encodeURIComponent(`${area.label} ${genre.label}`)}`);
  }
  if (!shop.coupon_url && shop.genre_key === "parking-lot") {
    shop.coupon_url = timesCardUrl();
  }
  if (!shop.coupon_url && shop.genre_key === "parking-management") {
    shop.coupon_url = parkingOperatorSearchUrl(area);
  }
  if (!shop.coupon_url && shop.genre_key === "vending-machine-installation") {
    shop.coupon_url = searchUrl(`${area.label} 自販機設置 比較`);
  }
  if (!shop.coupon_url && shop.genre_key === "office-tenant") {
    shop.coupon_url = searchUrl(`${area.label} 居抜き物件 貸店舗`);
  }
  if (!shop.coupon_url && shop.genre_key === "opening-area-research") {
    shop.coupon_url = openingResearchUrl(area);
  }
  if (!shop.coupon_url) {
    shop.coupon_url = shop.genre_key === "adult-shop" ? rakutenUrl("アダルトグッズ 通販") : rakutenUrl(isEventGenre(shop.genre_key) ? toolKeyword(shop.genre_key, genre.label) : `${genre.label} クーポン`);
  }
  if (!shop.shopping_url) {
    shop.shopping_url = shop.genre_key === "parking-lot" ? timesCardUrl() : (shop.genre_key === "parking-management" ? parkingOperatorSearchUrl(area) : (shop.genre_key === "adult-shop" ? rakutenUrl("アダルトグッズ 通販") : rakutenUrl(toolKeyword(shop.genre_key, genre.label))));
  }
  return shop;
}

function enrichAmenities(shop) {
  if (shop.genre_key === "convenience-store" || shop.genre_key === "cafe") {
    shop.smoking_area = shop.smoking_area || "要確認";
    shop.power_seat = shop.power_seat || "要確認";
    shop.wifi = shop.wifi || "要確認";
    shop.eat_in = shop.eat_in || "要確認";
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
  ["hokkaido-sapporo-kaikatsu-south", "快活CLUB 札幌駅南口店", "netcafe", "sapporo-chuo", "北海道札幌市中央区北4条西2-1-2 キタコートレードビル4F", "札幌駅", 1, 1100, "目安1,100円から", false, true, true, "札幌駅南口周辺", "https://www.kaikatsu.jp/shop/detail/20107.html"],
  ["hokkaido-sapporo-manekineko-ekimae", "カラオケまねきねこ 札幌駅前店", "karaoke", "sapporo-chuo", "北海道札幌市中央区北4条西1丁目4-1", "さっぽろ駅", 2, 900, "目安900円から", true, true, true, "札幌駅前周辺", "https://www.karaokemanekineko.jp/locations/hokkaido/sapporo/sapporo-ekimae-store/"],
  ["hokkaido-sapporo-gigo-west", "GiGO札幌駅西口", "game-center", "sapporo-chuo", "北海道札幌市北区北六条西6丁目1-1 WEST6", "札幌駅", 5, 1000, "目安1,000円から", false, true, false, "札幌駅西口周辺", "https://www.gigo.co.jp/shops/sapporo-nishiguchi"],
  ["miyagi-sendai-kaikatsu-ichibancho", "快活CLUB 仙台一番町店", "netcafe", "sendai-aoba", "宮城県仙台市青葉区一番町4-5-13 ボウルサンシャインビル2F", "広瀬通駅", 5, 1200, "目安1,200円から", false, true, true, "一番町周辺", "https://www.kaikatsu.jp/shop/detail/20138.html"],
  ["miyagi-sendai-manekineko-ichibancho", "カラオケまねきねこ 仙台一番町店", "karaoke", "sendai-aoba", "宮城県仙台市青葉区一番町4-4-33 トレンドビル4F", "勾当台公園駅", 3, 900, "目安900円から", false, true, true, "一番町周辺", "https://www.karaokemanekineko.jp/locations/miyagi/sendai-shi/sendai-ichibancho-store/"],
  ["miyagi-sendai-gigo", "GiGO仙台", "game-center", "sendai-aoba", "宮城県仙台市青葉区中央2-5-5 三経60ビル", "広瀬通駅", 5, 1000, "目安1,000円から", false, true, false, "仙台駅西口周辺", "https://www.gigo.co.jp/shops/sendai"],
  ["hyogo-kobe-kaikatsu-sannomiya", "快活CLUB 三宮駅前店", "netcafe", "kobe-chuo", "兵庫県神戸市中央区旭通5-3-2 タツミビルディング6-8F", "三宮駅", 4, 1200, "目安1,200円から", false, true, true, "三宮駅前周辺", "https://www.kaikatsu.jp/shop/detail/20562.html"],
  ["hyogo-kobe-manekineko-kitanozaka", "カラオケまねきねこ 北野坂店", "karaoke", "kobe-chuo", "兵庫県神戸市中央区加納町4丁目5-2 北野坂スクウェアビル1-3F", "三宮駅", 5, 900, "目安900円から", false, true, true, "北野坂周辺", "https://www.karaokemanekineko.jp/store/kitanozaka-store/"],
  ["hyogo-kobe-gigo-sannomiya", "GiGO三宮南口", "game-center", "kobe-chuo", "兵庫県神戸市中央区三宮町1-7-17 三慶ビル", "三ノ宮駅", 1, 1000, "目安1,000円から", false, true, false, "三宮南口周辺", "https://www.gigo.co.jp/shops/sannomiya-minamiguchi"],
  ["hyogo-kobe-mocha-sannomiya", "猫カフェMOCHA 三宮店", "cat-cafe", "kobe-chuo", "兵庫県神戸市中央区下山手通2丁目1-14 アークコースト5F", "三宮駅", 1, 1200, "目安1,200円から", false, true, true, "三宮駅周辺", "https://catmocha.jp/shop/kobesannomiya/"],
  ["hiroshima-naka-kaikatsu-hondori", "快活CLUB 広島本通店", "netcafe", "hiroshima-naka", "広島県広島市中区本通9-25", "立町駅", 3, 1200, "目安1,200円から", false, true, true, "本通周辺", "https://www.kaikatsu.jp/shop/detail/20893.html"],
  ["hiroshima-naka-gigo-hondori", "GiGO広島本通", "game-center", "hiroshima-naka", "広島県広島市中区本通9-30 ランドマークビル1F・B1", "本通駅", 5, 1000, "目安1,000円から", false, true, false, "本通周辺", "https://www.gigo.co.jp/shops/hiroshima-hondori"],
  ["hiroshima-naka-manekineko-chuodori", "カラオケまねきねこ 広島中央通り店", "karaoke", "hiroshima-naka", "広島県広島市中区堀川町4-11 HIROSHIMA CENTER BLD.2-3F", "八丁堀駅", 2, 900, "目安900円から", false, true, true, "中央通り周辺", "https://www.karaokemanekineko.jp/locations/hiroshima/hiroshima-shi/hiroshima-chuodori-store/"],
  ["fukuoka-hakata-manekineko-ekimae", "カラオケまねきねこ 博多駅前店", "karaoke", "fukuoka-hakata", "福岡県福岡市博多区博多駅東2丁目4-6 ハカタベビル4・5F", "博多駅", 3, 900, "目安900円から", false, true, true, "博多駅前周辺", "https://www.karaokemanekineko.jp/store/hakata-ekimae-store/"],
  ["fukuoka-chuo-gigo-tenjin", "GiGO福岡天神", "game-center", "fukuoka-chuo", "福岡県福岡市中央区天神2-7-6 DADAビル", "西鉄福岡駅", 3, 1000, "目安1,000円から", false, true, false, "天神周辺", "https://www.gigo.co.jp/shops/fukuoka-tenjin"],
  ["fukuoka-chuo-mocha-tenjindaimyo", "猫カフェMOCHA 天神大名店", "cat-cafe", "fukuoka-chuo", "福岡県福岡市中央区大名1-12-6 NEO大名ビル3F", "赤坂駅", 8, 1200, "目安1,200円から", false, true, true, "天神大名周辺", "https://catmocha.jp/shop/tenjindaimyo/"],
  ["tokyo-shinjuku-kaikatsu-west", "快活CLUB 新宿駅西口店", "netcafe", "tokyo-shinjuku", "東京都新宿区西新宿1-8-5 アルファ107ビル4F", "新宿駅", 3, 1200, "目安1,200円から", false, true, true, "西新宿周辺", "https://www.kaikatsu.jp/shop/result.html?area=13"],
  ["tokyo-shinjuku-kaikatsu-east", "快活CLUB 新宿駅東口店", "netcafe", "tokyo-shinjuku", "東京都新宿区新宿3丁目34-11 ピースビル6・7階", "新宿駅", 3, 1200, "目安1,200円から", false, true, true, "新宿三丁目周辺", "https://www.kaikatsu.jp/shop/result.html?area=13"],
  ["tokyo-shinjuku-joysound-west", "JOYSOUND 新宿西口店", "karaoke", "tokyo-shinjuku", "東京都新宿区西新宿1-12-1 高倉第一ビル 受付2F", "新宿駅", 5, 1000, "目安1,000円から", false, true, true, "西新宿周辺", "https://shop.joysound.com/shop/joysound-shinjukunishiguchi/"],
  ["tokyo-shinjuku-manekineko-southeast", "カラオケまねきねこ 新宿東南口店", "karaoke", "tokyo-shinjuku", "東京都新宿区新宿3-35-18 新宿東南口ビル4F・6F", "新宿三丁目駅", 1, 900, "目安900円から", false, true, true, "新宿東南口周辺", "https://www.karaokemanekineko.jp/store/shinjuku-tonanguchi-store/"],
  ["tokyo-shinjuku-mocha", "猫カフェ モカラウンジ 新宿店", "cat-cafe", "tokyo-shinjuku", "東京都新宿区新宿3-31-5 新宿ペガサス館6F", "新宿三丁目駅", 1, 1200, "目安1,200円から", false, true, true, "新宿三丁目周辺", "https://catmocha.jp/shop/shinjuku"],
  ["tokyo-shibuya-kaikatsu-center", "快活CLUB 渋谷センター街店", "netcafe", "tokyo-shibuya", "東京都渋谷区宇田川町24-10 横田ビル2-4階", "渋谷駅", 3, 1200, "目安1,200円から", false, true, true, "渋谷センター街周辺", "https://www.kaikatsu.jp/shop/result.html?area=13"],
  ["tokyo-shibuya-kaikatsu-ebisu", "快活CLUB 恵比寿駅東口店", "netcafe", "tokyo-shibuya", "東京都渋谷区恵比寿1-12-1 CRD Ebisu-1st 3F", "恵比寿駅", 2, 1200, "目安1,200円から", false, true, true, "恵比寿駅東口周辺", "https://www.kaikatsu.jp/shop/result.html?area=13"],
  ["tokyo-shibuya-mocha-harajuku", "猫カフェMOCHA 原宿店", "cat-cafe", "tokyo-shibuya", "東京都渋谷区神宮前1-14-25 クロスアベニュー原宿4F", "原宿駅", 1, 1200, "目安1,200円から", false, true, true, "原宿駅周辺", "https://catmocha.jp/shop/harajuku/"],
  ["tokyo-shibuya-mocha-center", "猫カフェMOCHA 渋谷センター街店", "cat-cafe", "tokyo-shibuya", "東京都渋谷区宇田川町32-12 アソルティ渋谷8F", "渋谷駅", 5, 1200, "目安1,200円から", false, true, true, "渋谷センター街周辺", "https://catmocha.jp/shoplist/"],
  ["tokyo-toshima-mocha-ikebukuro", "猫カフェMOCHA 池袋本店", "cat-cafe", "tokyo-toshima", "東京都豊島区西池袋1-15-6 豊島会館3F", "池袋駅", 2, 1200, "目安1,200円から", false, true, true, "池袋駅西口周辺", "https://catmocha.jp/shoplist/"],
  ["osaka-kita-kaikatsu-taiyuji", "快活CLUB 梅田太融寺店", "netcafe", "osaka-kita", "大阪府大阪市北区太融寺町5-8 ダイヤモンドレジャービル4-5階", "梅田駅", 8, 1200, "目安1,200円から", false, true, true, "太融寺町周辺", "https://www.kaikatsu.jp/shop/result.html?area=27"],
  ["osaka-kita-kaikatsu-higashidori", "快活CLUB 梅田東通り店", "netcafe", "osaka-kita", "大阪府大阪市北区堂山町4-12 白馬車ビル6F", "梅田駅", 7, 1200, "目安1,200円から", false, true, true, "堂山町周辺", "https://www.kaikatsu.jp/shop/result.html?area=27"],
  ["osaka-chuo-kaikatsu-kita-shinsaibashi", "快活CLUB 北心斎橋店", "netcafe", "osaka-chuo", "大阪府大阪市中央区南船場3丁目10-5 NORD+S南船場4F", "心斎橋駅", 3, 1200, "目安1,200円から", false, true, true, "南船場周辺", "https://www.kaikatsu.jp/shop/result.html?area=27"],
  ["osaka-chuo-kaikatsu-dotonbori", "快活CLUB なんば道頓堀店", "netcafe", "osaka-chuo", "大阪府大阪市中央区道頓堀1-2-15 3-8F", "日本橋駅", 2, 1200, "目安1,200円から", false, true, true, "道頓堀周辺", "https://www.kaikatsu.jp/shop/result.html?area=27"],
  ["osaka-chuo-manekineko-shinsaibashi", "カラオケまねきねこ 心斎橋店", "karaoke", "osaka-chuo", "大阪府大阪市中央区心斎橋筋1-4-13 OSAKA心斎橋BUILDING5F・6F", "心斎橋駅", 2, 900, "目安900円から", false, true, true, "心斎橋周辺", "https://www.karaokemanekineko.jp/locations/osaka/osaka-shi/shinsaibashi-1st-store/"],
  ["osaka-chuo-manekineko-namba-hips", "カラオケまねきねこ なんばHIPS店", "karaoke", "osaka-chuo", "大阪府大阪市中央区難波1-8-16 3F", "なんば駅", 1, 900, "目安900円から", false, true, true, "なんば駅周辺", "https://www.karaokemanekineko.jp/locations/osaka/"],
  ["osaka-abeno-kaikatsu-tennoji", "快活CLUB あべの天王寺駅前店", "netcafe", "osaka-abeno", "大阪府大阪市阿倍野区阿倍野筋1-5-31 きんえいアポロビル7F", "天王寺駅", 1, 1200, "目安1,200円から", false, true, true, "天王寺駅周辺", "https://www.kaikatsu.jp/shop/result.html?area=27"],
  ["kyoto-nakagyo-mocha-kawaramachi", "猫カフェMOCHA 京都河原町店", "cat-cafe", "kyoto-nakagyo", "京都府京都市中京区河原町通三条下ル大黒町58 mina 4F", "京都市役所前駅", 5, 1200, "目安1,200円から", false, true, true, "河原町三条周辺", "https://catmocha.jp/shop/kawaramachi/"],
  ["kyoto-nakagyo-nekokaigi", "猫カフェねこ会議", "cat-cafe", "kyoto-nakagyo", "京都府京都市中京区御池大東町590 御池加納ビル2F", "京都市役所前駅", 3, 1200, "目安1,200円から", false, false, false, "御池通周辺", "https://www.nekokaigi.com/english/guide.html"],
  ["kyoto-nakagyo-kaikatsu-kawaramachi2", "快活CLUB 京都四条河原町2号店", "netcafe", "kyoto-nakagyo", "京都府京都市中京区河原町通三条下る二丁目山崎町258", "京都市役所前駅", 5, 1200, "目安1,200円から", false, true, true, "河原町三条周辺", "https://www.kaikatsu.jp/shop/result.html?area=26&service=101"],
  ["kyoto-shimogyo-kaikatsu-kawaramachi", "快活CLUB 京都四条河原町店", "netcafe", "kyoto-shimogyo", "京都府京都市下京区河原町通四条下る順風町305 四条河原町ビル5F", "京都河原町駅", 2, 1200, "目安1,200円から", false, true, true, "四条河原町周辺", "https://www.kaikatsu.jp/shop/result.html?area=26&service=101"],
  ["kanagawa-yokohama-naka-kaikatsu-kannai", "快活CLUB 関内店", "netcafe", "yokohama-naka", "神奈川県横浜市中区吉田町1-1 永興ビル2F", "関内駅", 5, 1200, "目安1,200円から", false, true, true, "関内駅周辺", "https://www.kaikatsu.jp/shop/detail/20907.html"],
  ["kanagawa-yokohama-naka-kaikatsu-isezaki", "快活CLUB 伊勢佐木町店", "netcafe", "yokohama-naka", "神奈川県横浜市中区伊勢佐木町1-6-5 亀楽ビル4F", "関内駅", 5, 1200, "目安1,200円から", false, true, true, "伊勢佐木町周辺", "https://www.kaikatsu.jp/shop/result.html?area=14"],
  ["kanagawa-yokohama-naka-with-necochan", "猫ちゃんといっしょ 猫カフェ", "cat-cafe", "yokohama-naka", "神奈川県横浜市中区山下町87-3 ロンシンリューズタワー3F", "元町・中華街駅", 4, 1200, "目安1,200円から", false, true, false, "横浜中華街周辺", "https://www.with-necochan.com/"],
  ["kanagawa-yokohama-nishi-karaokekan-west", "カラオケ館 横浜西口店", "karaoke", "yokohama-nishi", "神奈川県横浜市西区南幸2丁目7-17", "横浜駅", 5, 1000, "目安1,000円から", false, true, true, "横浜駅西口周辺", "https://www.joysound.com/web/shop/list?keyword=%E6%A8%AA%E6%B5%9C%E9%A7%85"],
  ["gifu-gifu-kaikatsu-hozumi", "快活CLUB 岐阜穂積店", "netcafe", "gifu", "岐阜県岐阜市西河渡3-68-2", "西岐阜駅", 30, 1200, "目安1,200円から", true, true, true, "西河渡周辺", "https://www.kaikatsu.jp/shop/result.html?area=21"],
  ["gifu-gifu-kaikatsu-yanaizu", "快活CLUB 岐阜柳津店", "netcafe", "gifu", "岐阜県岐阜市柳津町本郷4-113 タイヨーボービル1F", "柳津駅", 10, 1200, "目安1,200円から", true, true, true, "柳津町周辺", "https://www.kaikatsu.jp/shop/result.html?area=21"],
  ["gifu-gifu-karaoke-happy-iwasaki", "カラオケハッピー 岩崎店", "karaoke", "gifu", "岐阜県岐阜市岩崎1008-1", "名鉄岐阜駅", 70, 900, "目安900円から", true, true, true, "岩崎周辺", "https://www.karaoke-happy.com/"],
  ["gifu-gifu-manekineko-fukumitsu", "カラオケまねきねこ 岐阜福光店", "karaoke", "gifu", "岐阜県岐阜市福光西2-3-15", "名鉄岐阜駅", 55, 900, "目安900円から", true, true, true, "福光西周辺", "https://www.karaokemanekineko.jp/"],
  ["gifu-ginan-ginanonsen", "ぎなん温泉", "spa", "ginan", "岐阜県羽島郡岐南町上印食9-59-1", "細畑駅", 18, 800, "目安800円から", true, true, true, "上印食周辺", "https://www.ginanonsen.jp/"],
  ["mie-tsu-kaiteki-club", "快適CLUB 津店", "netcafe", "tsu", "三重県津市栄町3-232 アポアホテル津", "津駅", 2, 1200, "目安1,200円から", false, true, false, "津駅東口周辺", "https://kaitekiclub.com/%E5%BF%AB%E9%81%A9club%E3%80%80%E6%B4%A5%E5%BA%97/"],
  ["mie-tsu-kaikatsu-23-tsuminami", "快活CLUB 23号津南店", "netcafe", "tsu", "三重県津市雲出本郷町松縄1746", "高茶屋駅", 15, 1200, "目安1,200円から", true, true, true, "雲出本郷町周辺", "https://www.kaikatsu.jp/shop/result.html?area=24"],
  ["mie-yokkaichi-kaikatsu-nishishinchi", "快活CLUB 四日市西新地店", "netcafe", "yokkaichi", "三重県四日市市西新地17-1", "近鉄四日市駅", 9, 1200, "目安1,200円から", true, true, true, "西新地周辺", "https://www.kaikatsu.jp/shop/result.html?area=24"],
  ["mie-yokkaichi-kaikatsu-oiwake", "快活CLUB 四日市追分店", "netcafe", "yokkaichi", "三重県四日市市小古曽東1-1-2", "追分駅", 7, 1200, "目安1,200円から", true, true, true, "小古曽東周辺", "https://www.kaikatsu.jp/shop/detail/20479.html"],
  ["mie-yokkaichi-kaiteki-club", "快適CLUB 四日市店", "netcafe", "yokkaichi", "三重県四日市市鵜の森2-1-4", "近鉄四日市駅", 7, 1200, "目安1,200円から", true, true, false, "鵜の森周辺", "https://kaitekiclub.com/%E5%BF%AB%E9%81%A9club%E3%80%80%E5%9B%9B%E6%97%A5%E5%B8%82%E5%BA%97/"],
  ["mie-yokkaichi-manekineko-kintetsu", "カラオケまねきねこ 近鉄四日市店", "karaoke", "yokkaichi", "三重県四日市市諏訪栄町10-7 ことぶきビル3F-4F", "近鉄四日市駅", 3, 900, "目安900円から", false, true, true, "諏訪栄町周辺", "https://www.karaokemanekineko.jp/store/kintetsu-yokkaichi-store/"],
  ["mie-yokkaichi-joyjoy-kintetsu", "カラオケJOYJOY 近鉄四日市店", "karaoke", "yokkaichi", "三重県四日市市諏訪栄町4-8", "近鉄四日市駅", 2, 900, "目安900円から", true, true, true, "諏訪栄町周辺", "https://www.joyjoy.co.jp/store/view/Kintetsu-Yokkaichi/zlib/inftrees"],
  ["mie-yokkaichi-mantennoyu", "三滝温泉 満殿の湯", "spa", "yokkaichi", "三重県四日市市末永町6-6", "川原町駅", 3, 600, "目安600円から", true, true, true, "川原町駅周辺", "https://www.mantennoyu.net/"],
  ["aichi-nagoya-naka-mocha-sakae", "猫カフェMOCHA 名古屋栄店", "cat-cafe", "nagoya-naka", "愛知県名古屋市中区栄3-32-6 BECOME SAKAE 2F", "矢場町駅", 1, 1200, "目安1,200円から", false, true, true, "栄・矢場町周辺", "https://catmocha.jp/shop/nagoya/"],
  ["aichi-nagoya-nishi-mocha-noritake", "猫カフェMOCHA イオンモール Nagoya Noritake Garden店", "cat-cafe", "nagoya-nishi", "愛知県名古屋市西区則武新町3-1-17 イオンモールNagoya Noritake Garden 3F", "亀島駅", 6, 1200, "目安1,200円から", true, true, true, "則武新町周辺", "https://catmocha.jp/shoplist/"],
  ["aichi-nagoya-minato-mocha-aquls", "猫カフェMOCHA ららぽーと名古屋みなとアクルス店", "cat-cafe", "nagoya-minato", "愛知県名古屋市港区港明2-3-2 ららぽーと名古屋みなとアクルス1F", "港区役所駅", 5, 1200, "目安1,200円から", true, true, true, "港明周辺", "https://catmocha.jp/shoplist/"],
  ["aichi-nagoya-showa-neko-manma", "猫カフェねこまんま", "cat-cafe", "nagoya-showa", "愛知県名古屋市昭和区南分町2丁目14番地", "御器所駅", 10, 1200, "目安1,200円から", true, false, false, "南分町周辺", "https://www.neko-manma.jp/"],
  ["aichi-nagoya-tempaku-cotanchi", "猫カフェ Cotanchi", "cat-cafe", "nagoya-tempaku", "愛知県名古屋市天白区植田1-2116 88ビル7階", "植田駅", 3, 1200, "目安1,200円から", false, false, true, "植田駅周辺", "https://cotanchi.com/"],
  ["aichi-nagoya-midori-meomaruke", "保護猫カフェ＆猫ホテルめおまるけ", "cat-cafe", "nagoya-midori", "愛知県名古屋市緑区鳴海町前之輪149", "大高駅", 10, 1200, "目安1,200円から", true, true, false, "鳴海町周辺", "https://meomaruke.com/"],
  ["shizuoka-hamamatsu-mocha-ichino", "猫カフェMOCHA イオンモール浜松市野店", "cat-cafe", "hamamatsu-chuo", "静岡県浜松市中央区天王町字諏訪1981-3 イオンモール浜松市野1F", "浜松駅", 40, 1200, "目安1,200円から", true, true, true, "イオンモール浜松市野周辺", "https://catmocha.jp/shop/hamamatsuichino/"],
  ["shizuoka-hamamatsu-adagio", "猫がいるカフェAdagio", "cat-cafe", "hamamatsu-chuo", "静岡県浜松市中央区西伊場町47-17", "浜松駅", 35, 1200, "目安1,200円から", true, true, true, "西伊場町周辺", "https://adagio22.com/"],
  ["shizuoka-numazu-nikuqs", "にくきゅうずカフェ", "cat-cafe", "numazu", "静岡県沼津市青野54-6", "原駅", 30, 1200, "目安1,200円から", true, false, false, "青野周辺", "https://nikuqs.com/"],
  ["shizuoka-aoi-aigo", "静岡市動物愛護館", "cat-cafe", "shizuoka-aoi", "静岡県静岡市葵区産女954番地", "静岡駅", 35, 0, "利用料なし", true, false, false, "産女周辺", "https://www.city.shizuoka.lg.jp/shisetsu/s0001063.html"],
  ["gifu-gifu-kitto", "猫カフェラウンジKitto", "cat-cafe", "gifu", "岐阜県岐阜市野一色5-7-11 1F", "長森駅", 18, 880, "目安880円から", true, false, false, "野一色周辺", "https://kitto.m-evolution.com/"],
  ["gifu-gifu-nekokage", "忍者ねこカフェ 猫影", "cat-cafe", "gifu", "岐阜県岐阜市岩地2丁目20-20", "長森駅", 13, 800, "目安800円から", true, false, false, "岩地周辺", "https://nekokage.org/"],
  ["gifu-ginan-coorikuya", "猫喫茶 空陸家 岐南店", "cat-cafe", "ginan", "岐阜県羽島郡岐南町上印食3丁目169番", "細畑駅", 6, 1000, "目安1,000円から", true, true, false, "上印食周辺", "https://www.coorikuya.com/shop/ginan/"],
  ["gifu-kakamigahara-nekochigura", "Cafe'ねこちぐら", "cat-cafe", "kakamigahara", "岐阜県各務原市鵜沼南町1-82-2", "新鵜沼駅", 8, 1000, "目安1,000円から", true, true, false, "鵜沼南町周辺", "https://cafenekochigura.wixsite.com/cafenekochigura"],
  ["gifu-takayama-nekonotsuki", "猫の月さくらやま", "cat-cafe", "takayama", "岐阜県高山市大新町1丁目44-1", "高山駅", 20, 1000, "目安1,000円から", true, false, false, "大新町周辺", "https://nekonotsuki.com/"],
  ["mie-tsu-neco285", "保護猫カフェ285", "cat-cafe", "tsu", "三重県津市島崎町285", "津駅", 20, 1200, "目安1,200円から", true, false, false, "島崎町周辺", "https://neco.285.co.jp/index.html"],
  ["mie-yokkaichi-coorikuya", "猫喫茶 空陸家 四日市店", "cat-cafe", "yokkaichi", "三重県四日市市日永2-1-4", "日永駅", 9, 1000, "目安1,000円から", true, true, false, "日永周辺", "https://www.coorikuya.com/shop/yokkaichi/"],
  ["mie-tamaki-nekonoie", "ねこ達のいえ", "cat-cafe", "tamaki", "三重県度会郡玉城町勝田3591-2", "田丸駅", 25, 1000, "目安1,000円から", true, false, false, "勝田周辺", "https://nekonoie.ysklog.com/"],
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
  ["shizuoka-fujieda-uotori", "うお鶏 藤枝店", "restaurant", "fujieda", "静岡県藤枝市前島1-3-1 ホテルオーレ2階", "藤枝駅", 1, 3500, "目安3,500円から", true, true, true, "藤枝駅南口周辺", "https://uotori-fujieda.owst.jp/"],
  ["aichi-nagoya-nakamura-bee-meieki", "ダイニングダーツバーBee 名駅店", "darts", "nagoya-nakamura", "愛知県名古屋市中村区名駅3-15-8 名駅グルメプラザビル4階", "名古屋駅", 3, 1000, "目安1,000円から", false, true, true, "名駅周辺", "https://www.bee-style.jp/shop/"],
  ["aichi-nagoya-naka-bee-sakae", "ダイニングダーツバーBee 栄店", "darts", "nagoya-naka", "愛知県名古屋市中区錦3-22-7 ARKビル4階", "栄駅", 3, 1000, "目安1,000円から", false, true, true, "錦三丁目周辺", "https://www.bee-style.jp/shop/"],
  ["aichi-nagoya-naka-beerush-nishiki-darts", "BeeRUSH 錦店", "darts", "nagoya-naka", "愛知県名古屋市中区錦3-17-15 栄ナナイロ10F", "栄駅", 2, 1000, "目安1,000円から", false, true, true, "錦三丁目周辺", "https://www.bee-style.jp/shop/"],
  ["aichi-nagoya-naka-baccarat-darts", "Sports Bar Baccarat", "darts", "nagoya-naka", "愛知県名古屋市中区栄4-20-24 栄ワールドビル1F", "栄駅", 7, 1000, "目安1,000円から", false, true, true, "女子大小路周辺", "https://www.baccarat-nagoya.com/"],
  ["aichi-nagoya-naka-baccarat-billiards", "Sports Bar Baccarat", "billiards", "nagoya-naka", "愛知県名古屋市中区栄4-20-24 栄ワールドビル1F", "栄駅", 7, 1000, "目安1,000円から", false, true, true, "女子大小路周辺", "https://www.baccarat-nagoya.com/"],
  ["aichi-nagoya-naka-bagus-sakae-darts", "バグース 名古屋栄店", "darts", "nagoya-naka", "愛知県名古屋市中区錦3-17-5 EXIT NISHIKI北棟3・4階", "栄駅", 2, 1000, "目安1,000円から", false, true, true, "錦三丁目周辺", "https://www.dd-holdings.jp/brands/bagus/"],
  ["aichi-nagoya-naka-bagus-sakae-billiards", "バグース 名古屋栄店", "billiards", "nagoya-naka", "愛知県名古屋市中区錦3-17-5 EXIT NISHIKI北棟3・4階", "栄駅", 2, 1000, "目安1,000円から", false, true, true, "錦三丁目周辺", "https://www.dd-holdings.jp/brands/bagus/"],
  ["aichi-nagoya-midori-grandbowl", "名古屋グランドボウル", "bowling", "nagoya-midori", "愛知県名古屋市緑区忠治山201", "南大高駅", 10, 700, "目安700円から", true, true, true, "南大高周辺", "https://www.grandbowl.jp/nagoya/access/"],
  ["tokyo-shinjuku-bagus-seibu-darts", "バグース 西武新宿店", "darts", "tokyo-shinjuku", "東京都新宿区歌舞伎町1-25-3 西武新宿駅前ビル5F", "西武新宿駅", 1, 1000, "目安1,000円から", false, true, true, "歌舞伎町周辺", "https://www.bagus-99.com/shops/b_s-shinjuku/"],
  ["tokyo-shinjuku-copa-bowl", "新宿コパボウル", "bowling", "tokyo-shinjuku", "東京都新宿区歌舞伎町1-20-1 HUMAXパビリオン新宿歌舞伎町3・4F", "新宿駅", 5, 700, "目安700円から", false, true, true, "歌舞伎町周辺", "https://copa-shinjuku.com/"],
  ["tokyo-shinjuku-copa-darts", "新宿コパボウル", "darts", "tokyo-shinjuku", "東京都新宿区歌舞伎町1-20-1 HUMAXパビリオン新宿歌舞伎町3・4F", "新宿駅", 5, 1000, "目安1,000円から", false, true, true, "歌舞伎町周辺", "https://copa-shinjuku.com/"],
  ["osaka-chuo-round1-sennichimae", "ラウンドワンスタジアム 千日前店", "bowling", "osaka-chuo", "大阪府大阪市中央区難波1丁目3番1号", "なんば駅", 3, 700, "目安700円から", true, true, true, "千日前周辺", "https://www.round1.co.jp/shop/tenpo/osaka-sennichimae.html"],
  ["osaka-chuo-bagus-shinsaibashi-darts", "バグース 心斎橋店", "darts", "osaka-chuo", "大阪府大阪市中央区心斎橋筋1-1-10 キュープラザ心斎橋7F", "心斎橋駅", 1, 1000, "目安1,000円から", false, true, true, "心斎橋筋周辺", "https://www.dd-holdings.jp/brands/bagus/"],
  ["osaka-chuo-bagus-shinsaibashi-billiards", "バグース 心斎橋店", "billiards", "osaka-chuo", "大阪府大阪市中央区心斎橋筋1-1-10 キュープラザ心斎橋7F", "心斎橋駅", 1, 1000, "目安1,000円から", false, true, true, "心斎橋筋周辺", "https://www.dd-holdings.jp/brands/bagus/"],
  ["kanagawa-yokohama-nishi-bagus-darts", "バグース 横浜西口店", "darts", "yokohama-nishi", "神奈川県横浜市西区北幸1-1-13 Comfort178横浜駅前ビルディング5F", "横浜駅", 1, 1000, "目安1,000円から", false, true, true, "横浜駅西口周辺", "https://www.bagus-99.com/shops/b_yokohama_nishiguchi/"],
  ["kanagawa-yokohama-nishi-bagus-billiards", "バグース 横浜西口店", "billiards", "yokohama-nishi", "神奈川県横浜市西区北幸1-1-13 Comfort178横浜駅前ビルディング5F", "横浜駅", 1, 1000, "目安1,000円から", false, true, true, "横浜駅西口周辺", "https://www.bagus-99.com/shops/b_yokohama_nishiguchi/"],
  ["fukuoka-chuo-bagus-tenjin-darts", "バグース 天神店", "darts", "fukuoka-chuo", "福岡県福岡市中央区天神2-6-32 ジェムキャッスルサザン通り4F", "天神駅", 4, 1000, "目安1,000円から", false, true, true, "天神周辺", "https://bagus-99.com/shops/main/room/?shop=b_tenjin&uri=room"],
  ["fukuoka-chuo-bagus-tenjin-billiards", "バグース 天神店", "billiards", "fukuoka-chuo", "福岡県福岡市中央区天神2-6-32 ジェムキャッスルサザン通り4F", "天神駅", 4, 1000, "目安1,000円から", false, true, true, "天神周辺", "https://bagus-99.com/shops/main/room/?shop=b_tenjin&uri=room"],
  ["aichi-nagoya-nakagawa-round1-bowling", "ラウンドワンスタジアム 中川1号線店", "bowling", "nagoya-nakagawa", "愛知県名古屋市中川区法蔵町2丁目23番", "中島駅", 10, 700, "目安700円から", true, true, true, "中川運河周辺", "https://news.round1.co.jp/shop/tenpo/aichi-nakagawa1.html"],
  ["aichi-nagoya-nakagawa-round1-karaoke", "ラウンドワンスタジアム 中川1号線店", "karaoke", "nagoya-nakagawa", "愛知県名古屋市中川区法蔵町2丁目23番", "中島駅", 10, 1000, "目安1,000円から", true, true, true, "中川運河周辺", "https://news.round1.co.jp/shop/tenpo/aichi-nakagawa1.html"],
  ["aichi-nagoya-nakagawa-round1-game", "ラウンドワンスタジアム 中川1号線店", "game-center", "nagoya-nakagawa", "愛知県名古屋市中川区法蔵町2丁目23番", "中島駅", 10, 500, "目安500円から", true, true, true, "中川運河周辺", "https://news.round1.co.jp/shop/tenpo/aichi-nakagawa1.html"],
  ["aichi-nagoya-nakagawa-round1-darts", "ラウンドワンスタジアム 中川1号線店", "darts", "nagoya-nakagawa", "愛知県名古屋市中川区法蔵町2丁目23番", "中島駅", 10, 1000, "目安1,000円から", true, true, true, "中川運河周辺", "https://news.round1.co.jp/shop/tenpo/aichi-nakagawa1.html"],
  ["aichi-nagoya-midori-round1-bowling", "ラウンドワン 鳴海店", "bowling", "nagoya-midori", "愛知県名古屋市緑区鳴海町杜若28番地", "野並駅", 5, 700, "目安700円から", true, true, true, "野並駅周辺", "https://news.round1.co.jp/shop/tenpo/aichi-narumi.html"],
  ["aichi-nagoya-midori-round1-karaoke", "ラウンドワン 鳴海店", "karaoke", "nagoya-midori", "愛知県名古屋市緑区鳴海町杜若28番地", "野並駅", 5, 1000, "目安1,000円から", true, true, true, "野並駅周辺", "https://news.round1.co.jp/shop/tenpo/aichi-narumi.html"],
  ["aichi-nagoya-midori-round1-game", "ラウンドワン 鳴海店", "game-center", "nagoya-midori", "愛知県名古屋市緑区鳴海町杜若28番地", "野並駅", 5, 500, "目安500円から", true, true, true, "野並駅周辺", "https://news.round1.co.jp/shop/tenpo/aichi-narumi.html"],
  ["aichi-nagoya-midori-round1-darts", "ラウンドワン 鳴海店", "darts", "nagoya-midori", "愛知県名古屋市緑区鳴海町杜若28番地", "野並駅", 5, 1000, "目安1,000円から", true, true, true, "野並駅周辺", "https://news.round1.co.jp/shop/tenpo/aichi-narumi.html"],
  ["aichi-handa-round1-bowling", "ラウンドワンスタジアム 半田店", "bowling", "handa", "愛知県半田市瑞穂町6丁目7番地の8", "知多半田駅", 25, 700, "目安700円から", true, true, true, "瑞穂町周辺", "https://news.round1.co.jp/shop/tenpo/aichi-handa.html"],
  ["aichi-handa-round1-karaoke", "ラウンドワンスタジアム 半田店", "karaoke", "handa", "愛知県半田市瑞穂町6丁目7番地の8", "知多半田駅", 25, 1000, "目安1,000円から", true, true, true, "瑞穂町周辺", "https://news.round1.co.jp/shop/tenpo/aichi-handa.html"],
  ["aichi-handa-round1-game", "ラウンドワンスタジアム 半田店", "game-center", "handa", "愛知県半田市瑞穂町6丁目7番地の8", "知多半田駅", 25, 500, "目安500円から", true, true, true, "瑞穂町周辺", "https://news.round1.co.jp/shop/tenpo/aichi-handa.html"],
  ["aichi-handa-round1-darts", "ラウンドワンスタジアム 半田店", "darts", "handa", "愛知県半田市瑞穂町6丁目7番地の8", "知多半田駅", 25, 1000, "目安1,000円から", true, true, true, "瑞穂町周辺", "https://news.round1.co.jp/shop/tenpo/aichi-handa.html"],
  ["aichi-toyohashi-round1-bowling", "ラウンドワンスタジアム 豊橋店", "bowling", "toyohashi", "愛知県豊橋市大岩町字岩田27番地-2", "二川駅", 10, 700, "目安700円から", true, true, true, "二川駅周辺", "https://www.round1.co.jp/shop/tenpo/aichi-toyohashi.html"],
  ["aichi-toyohashi-round1-karaoke", "ラウンドワンスタジアム 豊橋店", "karaoke", "toyohashi", "愛知県豊橋市大岩町字岩田27番地-2", "二川駅", 10, 1000, "目安1,000円から", true, true, true, "二川駅周辺", "https://www.round1.co.jp/shop/tenpo/aichi-toyohashi.html"],
  ["aichi-toyohashi-round1-game", "ラウンドワンスタジアム 豊橋店", "game-center", "toyohashi", "愛知県豊橋市大岩町字岩田27番地-2", "二川駅", 10, 500, "目安500円から", true, true, true, "二川駅周辺", "https://www.round1.co.jp/shop/tenpo/aichi-toyohashi.html"],
  ["aichi-toyohashi-round1-darts", "ラウンドワンスタジアム 豊橋店", "darts", "toyohashi", "愛知県豊橋市大岩町字岩田27番地-2", "二川駅", 10, 1000, "目安1,000円から", true, true, true, "二川駅周辺", "https://www.round1.co.jp/shop/tenpo/aichi-toyohashi.html"],
  ["aichi-anjo-korona-movie", "シネマワールド 安城", "movie-theater", "anjo", "愛知県安城市浜富町6-8", "南安城駅", 10, 1800, "目安1,800円から", true, true, true, "安城コロナワールド", "https://www.korona.co.jp/store/anj/"],
  ["aichi-anjo-korona-bowling", "コロナキャットボウル 安城店", "bowling", "anjo", "愛知県安城市浜富町6-8", "南安城駅", 10, 700, "目安700円から", true, true, true, "安城コロナワールド", "https://www.korona.co.jp/store/anj/"],
  ["aichi-anjo-korona-game", "メトロポリス 安城店", "game-center", "anjo", "愛知県安城市浜富町6-8", "南安城駅", 10, 500, "目安500円から", true, true, true, "安城コロナワールド", "https://www.korona.co.jp/store/anj/"],
  ["aichi-anjo-korona-karaoke", "カラオケ JOYJOY 安城コロナワールド店", "karaoke", "anjo", "愛知県安城市浜富町6-8", "南安城駅", 10, 1000, "目安1,000円から", true, true, true, "安城コロナワールド", "https://www.korona.co.jp/store/anj/"],
  ["aichi-nagoya-nakagawa-korona-movie", "シネマワールド 中川", "movie-theater", "nagoya-nakagawa", "愛知県名古屋市中川区江松三丁目110番地", "高畑駅", 25, 1800, "目安1,800円から", true, true, true, "中川コロナワールド", "https://www.korona.co.jp/store/nak/"],
  ["aichi-nagoya-nakagawa-korona-bowling", "コロナキャットボウル 中川店", "bowling", "nagoya-nakagawa", "愛知県名古屋市中川区江松三丁目110番地", "高畑駅", 25, 700, "目安700円から", true, true, true, "中川コロナワールド", "https://www.korona.co.jp/store/nak/"],
  ["aichi-nagoya-nakagawa-korona-game", "メトロポリス 中川店", "game-center", "nagoya-nakagawa", "愛知県名古屋市中川区江松三丁目110番地", "高畑駅", 25, 500, "目安500円から", true, true, true, "中川コロナワールド", "https://www.korona.co.jp/store/nak/"],
  ["aichi-nagoya-nakagawa-korona-karaoke", "カラオケ JOYJOY 中川コロナワールド店", "karaoke", "nagoya-nakagawa", "愛知県名古屋市中川区江松三丁目110番地", "高畑駅", 25, 1000, "目安1,000円から", true, true, true, "中川コロナワールド", "https://www.korona.co.jp/store/nak/"],
  ["aichi-komaki-korona-movie", "シネマワールド 小牧", "movie-theater", "komaki", "愛知県小牧市村中新町33", "小牧駅", 30, 1800, "目安1,800円から", true, true, true, "小牧コロナワールド", "https://www.korona.co.jp/store/kom/"],
  ["aichi-komaki-korona-bowling", "コロナキャットボウル 小牧店", "bowling", "komaki", "愛知県小牧市村中新町33", "小牧駅", 30, 700, "目安700円から", true, true, true, "小牧コロナワールド", "https://www.korona.co.jp/store/kom/"],
  ["aichi-komaki-korona-game", "メトロポリス 小牧店", "game-center", "komaki", "愛知県小牧市村中新町33", "小牧駅", 30, 500, "目安500円から", true, true, true, "小牧コロナワールド", "https://www.korona.co.jp/store/kom/"],
  ["aichi-komaki-korona-karaoke", "カラオケ JOYJOY 小牧コロナワールド店", "karaoke", "komaki", "愛知県小牧市村中新町33", "小牧駅", 30, 1000, "目安1,000円から", true, true, true, "小牧コロナワールド", "https://www.korona.co.jp/store/kom/"],
  ["aichi-toyokawa-korona-movie", "シネマワールド 豊川", "movie-theater", "toyokawa", "愛知県豊川市下長山町上アライ14-1", "牛久保駅", 15, 1800, "目安1,800円から", true, true, true, "豊川コロナワールド", "https://cinema.korona.co.jp/pages/4dx/theater.html"],
  ["aichi-toyokawa-korona-bowling", "コロナキャットボウル 豊川店", "bowling", "toyokawa", "愛知県豊川市下長山町上アライ14-1", "牛久保駅", 15, 700, "目安700円から", true, true, true, "豊川コロナワールド", "https://www.korona.co.jp/bowling/basic/tok/665"],
  ["aichi-toyokawa-korona-game", "メトロポリス 豊川店", "game-center", "toyokawa", "愛知県豊川市下長山町上アライ14-1", "牛久保駅", 15, 500, "目安500円から", true, true, true, "豊川コロナワールド", "https://cinema.korona.co.jp/pages/4dx/theater.html"],
  ["aichi-nagoya-naka-jiqoo-nishiki-netcafe", "自遊空間 錦店", "netcafe", "nagoya-naka", "愛知県名古屋市中区錦3-14-21", "栄駅", 1, 1200, "目安1,200円から", false, true, true, "錦三丁目周辺", "https://page.line.me/wek8333o"],
  ["aichi-nagoya-naka-jiqoo-nishiki-darts", "自遊空間 錦店", "darts", "nagoya-naka", "愛知県名古屋市中区錦3-14-21", "栄駅", 1, 1000, "目安1,000円から", false, true, true, "錦三丁目周辺", "https://page.line.me/wek8333o"],
  ["aichi-nagoya-naka-jiqoo-nishiki-karaoke", "自遊空間 錦店", "karaoke", "nagoya-naka", "愛知県名古屋市中区錦3-14-21", "栄駅", 1, 1000, "目安1,000円から", false, true, true, "錦三丁目周辺", "https://page.line.me/wek8333o"],
  ["aichi-obu-jiqoo-netcafe", "自遊空間 大府店", "netcafe", "obu", "愛知県大府市共和町5-66", "共和駅", 8, 1200, "目安1,200円から", true, true, true, "共和町周辺", "https://softdarts.or.jp/member_list"],
  ["aichi-obu-jiqoo-darts", "自遊空間 大府店", "darts", "obu", "愛知県大府市共和町5-66", "共和駅", 8, 1000, "目安1,000円から", true, true, true, "共和町周辺", "https://softdarts.or.jp/member_list"],
  ["aichi-nagoya-nakagawa-anettai-netcafe", "亜熱帯 中川コロナワールド店", "netcafe", "nagoya-nakagawa", "愛知県名古屋市中川区江松3丁目124番地", "高畑駅", 25, 1200, "目安1,200円から", true, true, true, "中川コロナワールド", "https://www.anettai.co.jp/store/view/Nakagawa-Koronaworld"],
  ["aichi-nagoya-nakagawa-anettai-karaoke", "亜熱帯 中川コロナワールド店", "karaoke", "nagoya-nakagawa", "愛知県名古屋市中川区江松3丁目124番地", "高畑駅", 25, 1000, "目安1,000円から", true, true, true, "中川コロナワールド", "https://www.anettai.co.jp/store/view/Nakagawa-Koronaworld"],
  ["aichi-nagoya-nakagawa-anettai-darts", "亜熱帯 中川コロナワールド店", "darts", "nagoya-nakagawa", "愛知県名古屋市中川区江松3丁目124番地", "高畑駅", 25, 1000, "目安1,000円から", true, true, true, "中川コロナワールド", "https://www.anettai.co.jp/store/view/Nakagawa-Koronaworld"],
  ["aichi-nagoya-nakagawa-anettai-billiards", "亜熱帯 中川コロナワールド店", "billiards", "nagoya-nakagawa", "愛知県名古屋市中川区江松3丁目124番地", "高畑駅", 25, 1000, "目安1,000円から", true, true, true, "中川コロナワールド", "https://www.anettai.co.jp/store/view/Nakagawa-Koronaworld"],
  ["aichi-nagoya-minato-kaikatsu-keibajo-netcafe", "快活CLUB 名古屋競馬場前店", "netcafe", "nagoya-minato", "愛知県名古屋市港区小割通3-8", "港北駅", 10, 1200, "目安1,200円から", true, true, true, "小割通周辺", "https://www.kaikatsu.jp/shop/detail/20484.html"],
  ["aichi-nagoya-minato-kaikatsu-keibajo-karaoke", "快活CLUB 名古屋競馬場前店", "karaoke", "nagoya-minato", "愛知県名古屋市港区小割通3-8", "港北駅", 10, 1000, "目安1,000円から", true, true, true, "小割通周辺", "https://www.kaikatsu.jp/shop/detail/20484.html"],
  ["aichi-nagoya-minato-kaikatsu-keibajo-darts", "快活CLUB 名古屋競馬場前店", "darts", "nagoya-minato", "愛知県名古屋市港区小割通3-8", "港北駅", 10, 1000, "目安1,000円から", true, true, true, "小割通周辺", "https://www.kaikatsu.jp/shop/detail/20484.html"],
  ["shizuoka-suruga-aprecio-higashi-netcafe", "アプレシオ 東静岡駅前店", "netcafe", "shizuoka-suruga", "静岡県静岡市駿河区曲金7丁目8-5", "東静岡駅", 6, 1200, "目安1,200円から", true, true, true, "東静岡駅周辺", "https://www.aprecio.jp/as/sp/shop/54/shopinfo"],
  ["shizuoka-suruga-aprecio-higashi-karaoke", "アプレシオ 東静岡駅前店", "karaoke", "shizuoka-suruga", "静岡県静岡市駿河区曲金7丁目8-5", "東静岡駅", 6, 1000, "目安1,000円から", true, true, true, "東静岡駅周辺", "https://www.aprecio.jp/as/sp/shop/54/shopinfo"],
  ["shizuoka-suruga-aprecio-higashi-darts", "アプレシオ 東静岡駅前店", "darts", "shizuoka-suruga", "静岡県静岡市駿河区曲金7丁目8-5", "東静岡駅", 6, 1000, "目安1,000円から", true, true, true, "東静岡駅周辺", "https://www.aprecio.jp/as/sp/shop/54/shopinfo"],
  ["shizuoka-suruga-aprecio-higashi-billiards", "アプレシオ 東静岡駅前店", "billiards", "shizuoka-suruga", "静岡県静岡市駿河区曲金7丁目8-5", "東静岡駅", 6, 1000, "目安1,000円から", true, true, true, "東静岡駅周辺", "https://www.aprecio.jp/as/sp/shop/54/shopinfo"],
  ["shizuoka-hamamatsu-aprecio-biora-netcafe", "アプレシオ 浜松ビオラ田町店", "netcafe", "hamamatsu-chuo", "静岡県浜松市中央区田町223-21-B1F ビオラ田町ビル", "第一通り駅", 4, 1200, "目安1,200円から", true, true, true, "田町周辺", "https://aprecio.jp/as/sp/shopList/"],
  ["shizuoka-hamamatsu-aprecio-biora-karaoke", "アプレシオ 浜松ビオラ田町店", "karaoke", "hamamatsu-chuo", "静岡県浜松市中央区田町223-21-B1F ビオラ田町ビル", "第一通り駅", 4, 1000, "目安1,000円から", true, true, true, "田町周辺", "https://aprecio.jp/as/sp/shopList/"],
  ["shizuoka-hamamatsu-aprecio-biora-darts", "アプレシオ 浜松ビオラ田町店", "darts", "hamamatsu-chuo", "静岡県浜松市中央区田町223-21-B1F ビオラ田町ビル", "第一通り駅", 4, 1000, "目安1,000円から", true, true, true, "田町周辺", "https://aprecio.jp/as/sp/shopList/"],
  ["shizuoka-hamamatsu-aprecio-biora-billiards", "アプレシオ 浜松ビオラ田町店", "billiards", "hamamatsu-chuo", "静岡県浜松市中央区田町223-21-B1F ビオラ田町ビル", "第一通り駅", 4, 1000, "目安1,000円から", true, true, true, "田町周辺", "https://aprecio.jp/as/sp/shopList/"],
  ["shizuoka-sunto-shimizu-aprecio-yawata-netcafe", "アプレシオ 清水町八幡店", "netcafe", "sunto-shimizu", "静岡県駿東郡清水町八幡64-1", "沼津駅", 45, 1200, "目安1,200円から", true, true, true, "八幡周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-sunto-shimizu-aprecio-yawata-karaoke", "アプレシオ 清水町八幡店", "karaoke", "sunto-shimizu", "静岡県駿東郡清水町八幡64-1", "沼津駅", 45, 1000, "目安1,000円から", true, true, true, "八幡周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-sunto-shimizu-aprecio-yawata-darts", "アプレシオ 清水町八幡店", "darts", "sunto-shimizu", "静岡県駿東郡清水町八幡64-1", "沼津駅", 45, 1000, "目安1,000円から", true, true, true, "八幡周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-sunto-shimizu-aprecio-yawata-billiards", "アプレシオ 清水町八幡店", "billiards", "sunto-shimizu", "静岡県駿東郡清水町八幡64-1", "沼津駅", 45, 1000, "目安1,000円から", true, true, true, "八幡周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-fujinomiya-aprecio-netcafe", "アプレシオ 富士宮店", "netcafe", "fujinomiya", "静岡県富士宮市富士見ケ丘1241", "富士宮駅", 25, 1200, "目安1,200円から", true, true, true, "富士見ケ丘周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-fujinomiya-aprecio-darts", "アプレシオ 富士宮店", "darts", "fujinomiya", "静岡県富士宮市富士見ケ丘1241", "富士宮駅", 25, 1000, "目安1,000円から", true, true, true, "富士見ケ丘周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-fujinomiya-aprecio-billiards", "アプレシオ 富士宮店", "billiards", "fujinomiya", "静岡県富士宮市富士見ケ丘1241", "富士宮駅", 25, 1000, "目安1,000円から", true, true, true, "富士見ケ丘周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-yaizu-aprecio-netcafe", "アプレシオ 焼津店", "netcafe", "yaizu", "静岡県焼津市宗高1487-1 大井川ショッピングタウンSC", "藤枝駅", 60, 1200, "目安1,200円から", true, true, true, "大井川周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-yaizu-aprecio-darts", "アプレシオ 焼津店", "darts", "yaizu", "静岡県焼津市宗高1487-1 大井川ショッピングタウンSC", "藤枝駅", 60, 1000, "目安1,000円から", true, true, true, "大井川周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-gotemba-aprecio-netcafe", "アプレシオ 御殿場インター店", "netcafe", "gotemba", "静岡県御殿場市東田中1066-1 東富士ビル2階", "御殿場駅", 20, 1200, "目安1,200円から", true, true, true, "御殿場インター周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-gotemba-aprecio-darts", "アプレシオ 御殿場インター店", "darts", "gotemba", "静岡県御殿場市東田中1066-1 東富士ビル2階", "御殿場駅", 20, 1000, "目安1,000円から", true, true, true, "御殿場インター周辺", "https://aprecio.co.jp/shopList/"],
  ["shizuoka-gotemba-aprecio-billiards", "アプレシオ 御殿場インター店", "billiards", "gotemba", "静岡県御殿場市東田中1066-1 東富士ビル2階", "御殿場駅", 20, 1000, "目安1,000円から", true, true, true, "御殿場インター周辺", "https://aprecio.co.jp/shopList/"],
  ["aichi-nagoya-nakamura-kintaro-meieki1", "金太郎 名駅1号店", "video-box", "nagoya-nakamura", "愛知県名古屋市中村区椿町4-11 神農ビル2F", "名古屋駅", 3, 2000, "目安2,000円から", false, true, true, "名駅西口周辺", "https://kin-v.jp/shop/shopinfo.php?id=13"],
  ["aichi-nagoya-chikusa-kintaro-imaike", "金太郎 今池北店", "video-box", "nagoya-chikusa", "愛知県名古屋市千種区内山3-9-24 太都ビル1F", "今池駅", 3, 2000, "目安2,000円から", true, true, true, "今池駅周辺", "https://kin-v.jp/shop/shopinfo.php?id=16"],
  ["aichi-nagoya-atsuta-kintaro-kanayama", "金太郎 金山3号店", "video-box", "nagoya-atsuta", "愛知県名古屋市熱田区金山町1-19-22 トヤマビル1F", "金山駅", 3, 2000, "目安2,000円から", true, true, true, "金山駅南口周辺", "https://kin-v.jp/shop/shopinfo.php?id=14"],
  ["aichi-nagoya-naka-hanataro-sakae", "花太郎 栄店", "video-box", "nagoya-naka", "愛知県名古屋市中区栄3-12-4 エトワールさかえ2F", "栄駅", 7, 2000, "目安2,000円から", false, true, true, "栄三丁目周辺", "https://kin-v.jp/shop/shopinfo.php?id=446"],
  ["aichi-okazaki-kintaro", "金太郎 岡崎店", "video-box", "okazaki", "愛知県岡崎市鴨田町字広元191 ビバーオレンジ1F", "大門駅", 12, 2000, "目安2,000円から", true, true, true, "大樹寺周辺", "https://kin-v.jp/shop/result.php"],
  ["aichi-toyokawa-kintaro-1", "金太郎 豊川1号店", "video-box", "toyokawa", "愛知県豊川市御油町八面横47", "御油駅", 2, 2000, "目安2,000円から", true, true, true, "御油町周辺", "https://kin-v.jp/shop/result.php"],
  ["aichi-ichinomiya-kintaro", "金太郎 一宮22号店", "video-box", "ichinomiya", "愛知県一宮市伝法寺9-1-8", "稲沢駅", 35, 2000, "目安2,000円から", true, true, true, "伝法寺周辺", "https://kin-v.jp/special/vr_experience.php"],
  ["aichi-nagoya-nishi-kintaro-nishiharu", "金太郎 西春店", "video-box", "nagoya-nishi", "愛知県北名古屋市宇福寺天神77", "西春駅", 35, 2000, "目安2,000円から", true, true, true, "北名古屋市周辺", "https://kin-v.jp/shop/shopinfo.php?id=256"],
  ["aichi-nisshin-mirumiru", "メガステーションミルミル 日進店", "video-box", "nisshin", "愛知県日進市周辺", "赤池駅", 35, 2000, "目安2,000円から", true, true, true, "日進周辺", "https://mirumiru.net/"],
  ["tokyo-toshima-takarajima-ikebukuro", "宝島24 池袋店", "video-box", "tokyo-toshima", "東京都豊島区東池袋1-40-5 受付1F", "池袋駅", 3, 2000, "目安2,000円から", false, true, true, "池袋駅東口周辺", "https://takarajima24.com/shop/"],
  ["tokyo-shinjuku-takarajima-shinjuku", "宝島24 新宿本店", "video-box", "tokyo-shinjuku", "東京都新宿区新宿3丁目周辺", "新宿駅", 5, 2000, "目安2,000円から", false, true, true, "新宿駅周辺", "https://takarajima24.com/shop/"],
  ["tokyo-shibuya-takarajima-shibuya", "宝島24 渋谷本店", "video-box", "tokyo-shibuya", "東京都渋谷区道玄坂周辺", "渋谷駅", 5, 2000, "目安2,000円から", false, true, true, "渋谷駅周辺", "https://takarajima24.com/shop/"],
  ["saitama-omiya-round1-bowling", "ラウンドワン 大宮店", "bowling", "saitama-omiya", "埼玉県さいたま市大宮区宮町4丁目90番地7", "大宮駅", 8, 700, "目安700円から", true, true, true, "大宮駅東口周辺", "https://www.round1.co.jp/shop/tenpo/saitama-omiya.html"],
  ["saitama-omiya-round1-karaoke", "ラウンドワン 大宮店", "karaoke", "saitama-omiya", "埼玉県さいたま市大宮区宮町4丁目90番地7", "大宮駅", 8, 1000, "目安1,000円から", true, true, true, "大宮駅東口周辺", "https://www.round1.co.jp/shop/tenpo/saitama-omiya.html"],
  ["saitama-omiya-round1-game", "ラウンドワン 大宮店", "game-center", "saitama-omiya", "埼玉県さいたま市大宮区宮町4丁目90番地7", "大宮駅", 8, 500, "目安500円から", true, true, true, "大宮駅東口周辺", "https://www.round1.co.jp/shop/tenpo/saitama-omiya.html"],
  ["saitama-omiya-round1-darts", "ラウンドワン 大宮店", "darts", "saitama-omiya", "埼玉県さいたま市大宮区宮町4丁目90番地7", "大宮駅", 8, 1000, "目安1,000円から", true, true, true, "大宮駅東口周辺", "https://www.round1.co.jp/shop/tenpo/saitama-omiya.html"],
  ["saitama-omiya-round1-billiards", "ラウンドワン 大宮店", "billiards", "saitama-omiya", "埼玉県さいたま市大宮区宮町4丁目90番地7", "大宮駅", 8, 1000, "目安1,000円から", true, true, true, "大宮駅東口周辺", "https://www.round1.co.jp/shop/tenpo/saitama-omiya.html"],
  ["saitama-omiya-round1-crane", "ラウンドワン 大宮店", "crane-game", "saitama-omiya", "埼玉県さいたま市大宮区宮町4丁目90番地7", "大宮駅", 8, 500, "目安500円から", true, true, true, "大宮駅東口周辺", "https://www.round1.co.jp/shop/tenpo/saitama-omiya.html"],
  ["saitama-omiya-gigo-game", "GiGO大宮西口", "game-center", "saitama-omiya", "埼玉県さいたま市大宮区桜木町2-3-2 泰伸ビル2F", "大宮駅", 1, 500, "目安500円から", false, true, false, "大宮駅西口周辺", "https://www.gigo.co.jp/shops/omiya-nishiguchi"],
  ["saitama-omiya-gigo-crane", "GiGO大宮西口", "crane-game", "saitama-omiya", "埼玉県さいたま市大宮区桜木町2-3-2 泰伸ビル2F", "大宮駅", 1, 500, "目安500円から", false, true, false, "大宮駅西口周辺", "https://www.gigo.co.jp/shops/omiya-nishiguchi"],
  ["saitama-omiya-gigo-capsule", "GiGO大宮西口", "capsule-toy", "saitama-omiya", "埼玉県さいたま市大宮区桜木町2-3-2 泰伸ビル2F", "大宮駅", 1, 300, "目安300円から", false, true, false, "大宮駅西口周辺", "https://www.gigo.co.jp/shops/omiya-nishiguchi"],
  ["saitama-omiya-gacha-arche", "大宮がちゃ処", "capsule-toy", "saitama-omiya", "埼玉県さいたま市大宮区桜木町2丁目1-1 大宮アルシェ5階", "大宮駅", 2, 300, "目安300円から", false, true, false, "大宮駅西口周辺", "https://www.gashapon.jp/shop/shop.php?paging=3&shop_code=S90000560"],
  ["saitama-omiya-kaikatsu", "快活CLUB 大宮店", "netcafe", "saitama-omiya", "埼玉県さいたま市大宮区仲町1-15 大宮東宝会館4F", "大宮駅", 2, 1200, "目安1,200円から", false, true, true, "大宮駅東口周辺", "https://www.kaikatsu.jp/shop/detail/20908.html"],
  ["saitama-urawa-kaikatsu", "快活CLUB 浦和駅東口店", "netcafe", "saitama-urawa", "埼玉県さいたま市浦和区東仲町11-20 ブランコライユ2F", "浦和駅", 2, 1200, "目安1,200円から", false, true, true, "浦和駅東口周辺", "https://www.kaikatsu.jp/shop/result.html?area=11"],
  ["chiba-chuo-gigo-game", "GiGO千葉", "game-center", "chiba-chuo", "千葉県千葉市中央区富士見2-4-1", "千葉駅", 1, 500, "目安500円から", false, true, false, "千葉駅東口周辺", "https://www.gigo.co.jp/shops/chiba"],
  ["chiba-chuo-gigo-crane", "GiGO千葉", "crane-game", "chiba-chuo", "千葉県千葉市中央区富士見2-4-1", "千葉駅", 1, 500, "目安500円から", false, true, false, "千葉駅東口周辺", "https://www.gigo.co.jp/shops/chiba"],
  ["chiba-chuo-gashapon-ario-soga", "ガシャポンのデパート イトーヨーカドーアリオ蘇我店", "capsule-toy", "chiba-chuo", "千葉県千葉市中央区川崎町52-7 イトーヨーカドーアリオ蘇我店", "蘇我駅", 15, 300, "目安300円から", true, true, false, "蘇我周辺", "https://gashapon.jp/news/campaign_260420/"],
  ["chiba-chuo-kaikatsu", "快活CLUB 千葉中央店", "netcafe", "chiba-chuo", "千葉県千葉市中央区富士見2-7-13 千葉B&Vビル5-7F", "千葉中央駅", 4, 1200, "目安1,200円から", false, true, true, "千葉中央駅周辺", "https://www.kaikatsu.jp/shop/result.html?area=12"],
  ["chiba-ichikawa-round1-bowling", "ラウンドワン 市川鬼高店", "bowling", "ichikawa", "千葉県市川市鬼高4丁目1番3号", "本八幡駅", 15, 700, "目安700円から", true, true, true, "鬼高周辺", "https://www.round1.co.jp/shop/tenpo/chiba-ichikawa.html"],
  ["chiba-ichikawa-round1-karaoke", "ラウンドワン 市川鬼高店", "karaoke", "ichikawa", "千葉県市川市鬼高4丁目1番3号", "本八幡駅", 15, 1000, "目安1,000円から", true, true, true, "鬼高周辺", "https://www.round1.co.jp/shop/tenpo/chiba-ichikawa.html"],
  ["chiba-ichikawa-round1-game", "ラウンドワン 市川鬼高店", "game-center", "ichikawa", "千葉県市川市鬼高4丁目1番3号", "本八幡駅", 15, 500, "目安500円から", true, true, true, "鬼高周辺", "https://www.round1.co.jp/shop/tenpo/chiba-ichikawa.html"],
  ["chiba-ichikawa-round1-darts", "ラウンドワン 市川鬼高店", "darts", "ichikawa", "千葉県市川市鬼高4丁目1番3号", "本八幡駅", 15, 1000, "目安1,000円から", true, true, true, "鬼高周辺", "https://www.round1.co.jp/shop/tenpo/chiba-ichikawa.html"],
  ["chiba-ichikawa-round1-billiards", "ラウンドワン 市川鬼高店", "billiards", "ichikawa", "千葉県市川市鬼高4丁目1番3号", "本八幡駅", 15, 1000, "目安1,000円から", true, true, true, "鬼高周辺", "https://www.round1.co.jp/shop/tenpo/chiba-ichikawa.html"],
  ["chiba-ichikawa-round1-crane", "ラウンドワン 市川鬼高店", "crane-game", "ichikawa", "千葉県市川市鬼高4丁目1番3号", "本八幡駅", 15, 500, "目安500円から", true, true, true, "鬼高周辺", "https://www.round1.co.jp/shop/tenpo/chiba-ichikawa.html"],
  ["okayama-minami-round1-bowling", "ラウンドワン 岡山妹尾店", "bowling", "okayama-minami", "岡山県岡山市南区妹尾3413番地1", "妹尾駅", 25, 700, "目安700円から", true, true, true, "妹尾周辺", "https://www.round1.co.jp/shop/area07.html/area06.html"],
  ["okayama-minami-round1-karaoke", "ラウンドワン 岡山妹尾店", "karaoke", "okayama-minami", "岡山県岡山市南区妹尾3413番地1", "妹尾駅", 25, 1000, "目安1,000円から", true, true, true, "妹尾周辺", "https://www.round1.co.jp/shop/area07.html/area06.html"],
  ["okayama-minami-round1-game", "ラウンドワン 岡山妹尾店", "game-center", "okayama-minami", "岡山県岡山市南区妹尾3413番地1", "妹尾駅", 25, 500, "目安500円から", true, true, true, "妹尾周辺", "https://www.round1.co.jp/shop/area07.html/area06.html"],
  ["okayama-minami-round1-darts", "ラウンドワン 岡山妹尾店", "darts", "okayama-minami", "岡山県岡山市南区妹尾3413番地1", "妹尾駅", 25, 1000, "目安1,000円から", true, true, true, "妹尾周辺", "https://www.round1.co.jp/shop/area07.html/area06.html"],
  ["okayama-minami-round1-billiards", "ラウンドワン 岡山妹尾店", "billiards", "okayama-minami", "岡山県岡山市南区妹尾3413番地1", "妹尾駅", 25, 1000, "目安1,000円から", true, true, true, "妹尾周辺", "https://www.round1.co.jp/shop/area07.html/area06.html"],
  ["okayama-minami-round1-crane", "ラウンドワン 岡山妹尾店", "crane-game", "okayama-minami", "岡山県岡山市南区妹尾3413番地1", "妹尾駅", 25, 500, "目安500円から", true, true, true, "妹尾周辺", "https://www.round1.co.jp/shop/area07.html/area06.html"],
  ["okayama-kita-gachamori-aeon", "ガチャガチャの森 イオンモール岡山店", "capsule-toy", "okayama-kita", "岡山県岡山市北区下石井1丁目2番1号 イオンモール岡山5F", "岡山駅", 5, 300, "目安300円から", true, true, false, "岡山駅前周辺", "https://gashapon.jp/news/campaign_shoplist_260317/"],
  ["okayama-kita-keibunsha-gashapon", "啓文社 岡山本店 ガシャポン", "capsule-toy", "okayama-kita", "岡山県岡山市北区下中野377-1", "大元駅", 15, 300, "目安300円から", true, true, false, "下中野周辺", "https://keibunsha.net/details/store-detail.php?sp=3"],
  ["niigata-chuo-round1-bowling", "ラウンドワン 新潟店", "bowling", "niigata-chuo", "新潟県新潟市中央区美咲町2丁目1番38号", "新潟駅", 45, 700, "目安700円から", true, true, true, "美咲町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["niigata-chuo-round1-karaoke", "ラウンドワン 新潟店", "karaoke", "niigata-chuo", "新潟県新潟市中央区美咲町2丁目1番38号", "新潟駅", 45, 1000, "目安1,000円から", true, true, true, "美咲町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["niigata-chuo-round1-game", "ラウンドワン 新潟店", "game-center", "niigata-chuo", "新潟県新潟市中央区美咲町2丁目1番38号", "新潟駅", 45, 500, "目安500円から", true, true, true, "美咲町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["niigata-chuo-round1-crane", "ラウンドワン 新潟店", "crane-game", "niigata-chuo", "新潟県新潟市中央区美咲町2丁目1番38号", "新潟駅", 45, 500, "目安500円から", true, true, true, "美咲町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kumamoto-chuo-gashapon-wondercity", "ガシャポンのデパート ワンダーシティ南熊本店", "capsule-toy", "kumamoto-chuo", "熊本県熊本市中央区九品寺6丁目9番1", "南熊本駅", 10, 300, "目安300円から", true, true, false, "南熊本周辺", "https://gashapon.jp/news/campaign_shoplist_260601/"],
  ["kumamoto-chuo-capsule-cocosa", "Capsule park 熊本COCOSA店", "capsule-toy", "kumamoto-chuo", "熊本県熊本市中央区下通1-3-8 COCOSA 3F", "通町筋駅", 2, 300, "目安300円から", false, true, false, "下通周辺", "https://gashapon.jp/news/campaign_260420/"],
  ["kumamoto-chuo-round1-bowling", "ラウンドワン 熊本店", "bowling", "kumamoto-chuo", "熊本県熊本市西区春日7丁目25番15号", "熊本駅", 15, 700, "目安700円から", true, true, true, "熊本駅西側周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kumamoto-chuo-round1-karaoke", "ラウンドワン 熊本店", "karaoke", "kumamoto-chuo", "熊本県熊本市西区春日7丁目25番15号", "熊本駅", 15, 1000, "目安1,000円から", true, true, true, "熊本駅西側周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kumamoto-chuo-round1-game", "ラウンドワン 熊本店", "game-center", "kumamoto-chuo", "熊本県熊本市西区春日7丁目25番15号", "熊本駅", 15, 500, "目安500円から", true, true, true, "熊本駅西側周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kumamoto-chuo-round1-crane", "ラウンドワン 熊本店", "crane-game", "kumamoto-chuo", "熊本県熊本市西区春日7丁目25番15号", "熊本駅", 15, 500, "目安500円から", true, true, true, "熊本駅西側周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kagoshima-round1-bowling", "ラウンドワンスタジアム 鹿児島宇宿店", "bowling", "kagoshima", "鹿児島県鹿児島市宇宿2丁目2番2号", "宇宿一丁目駅", 5, 700, "目安700円から", true, true, true, "宇宿周辺", "https://news.round1.co.jp/shop/tenpo/kagoshima-kagoshima.html"],
  ["kagoshima-round1-karaoke", "ラウンドワンスタジアム 鹿児島宇宿店", "karaoke", "kagoshima", "鹿児島県鹿児島市宇宿2丁目2番2号", "宇宿一丁目駅", 5, 1000, "目安1,000円から", true, true, true, "宇宿周辺", "https://news.round1.co.jp/shop/tenpo/kagoshima-kagoshima.html"],
  ["kagoshima-round1-game", "ラウンドワンスタジアム 鹿児島宇宿店", "game-center", "kagoshima", "鹿児島県鹿児島市宇宿2丁目2番2号", "宇宿一丁目駅", 5, 500, "目安500円から", true, true, true, "宇宿周辺", "https://news.round1.co.jp/shop/tenpo/kagoshima-kagoshima.html"],
  ["kagoshima-round1-crane", "ラウンドワンスタジアム 鹿児島宇宿店", "crane-game", "kagoshima", "鹿児島県鹿児島市宇宿2丁目2番2号", "宇宿一丁目駅", 5, 500, "目安500円から", true, true, true, "宇宿周辺", "https://news.round1.co.jp/shop/tenpo/kagoshima-kagoshima.html"],
  ["kitakyushu-kokurakita-round1-bowling", "ラウンドワン 小倉店", "bowling", "kitakyushu-kokurakita", "福岡県北九州市小倉北区西港町15-65", "小倉駅", 35, 700, "目安700円から", true, true, true, "西港町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kitakyushu-kokurakita-round1-karaoke", "ラウンドワン 小倉店", "karaoke", "kitakyushu-kokurakita", "福岡県北九州市小倉北区西港町15-65", "小倉駅", 35, 1000, "目安1,000円から", true, true, true, "西港町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kitakyushu-kokurakita-round1-game", "ラウンドワン 小倉店", "game-center", "kitakyushu-kokurakita", "福岡県北九州市小倉北区西港町15-65", "小倉駅", 35, 500, "目安500円から", true, true, true, "西港町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["kitakyushu-kokurakita-round1-crane", "ラウンドワン 小倉店", "crane-game", "kitakyushu-kokurakita", "福岡県北九州市小倉北区西港町15-65", "小倉駅", 35, 500, "目安500円から", true, true, true, "西港町周辺", "https://www.round1.co.jp/company/company/all-shop.html"],
  ["saitama-omiya-familymart-east", "ファミリーマート 大宮駅東口店", "convenience-store", "saitama-omiya", "埼玉県さいたま市大宮区大門町1丁目92番地6", "大宮駅", 2, 300, "目安300円から", false, true, true, "大宮駅東口周辺", "https://store.family.co.jp/points/58556", "要確認", "要確認", "あり", "あり"],
  ["saitama-omiya-seven-nangin", "セブン-イレブン 大宮駅南銀座通り店", "convenience-store", "saitama-omiya", "埼玉県さいたま市大宮区仲町1-66-1", "大宮駅", 2, 300, "目安300円から", false, true, false, "大宮駅東口周辺", "https://location.sevenbank.co.jp/sevenbank/station/spot/list?node=00005564&radius=5", "要確認", "要確認", "要確認", "要確認"],
  ["kumamoto-chuo-seven-shimotori", "セブン-イレブン 熊本下通1丁目店", "convenience-store", "kumamoto-chuo", "熊本県熊本市中央区下通1丁目7-11", "花畑町駅", 3, 300, "目安300円から", false, true, false, "下通周辺", "https://itp.ne.jp/zenkoku/kumamoto/kumamotoshi-chuoku/shimotori/shoppingu-okaimono/kombini/kombiniensusutoa/konbiniensusutoa/433473843107171970", "要確認", "要確認", "要確認", "要確認"],
  ["kumamoto-chuo-doutor-shimotori", "ドトールコーヒーショップ 熊本下通り店", "cafe", "kumamoto-chuo", "熊本県熊本市中央区手取本町4-7 杉谷ビル1F", "通町筋駅", 2, 500, "目安500円から", false, true, true, "下通周辺", "https://shop.doutor.co.jp/doutor/spot/detail?code=2010823", "喫煙ブースあり", "要確認", "あり", "あり"],
  ["aichi-nagoya-mizuho-komeda-honten", "コメダ珈琲店 本店", "cafe", "nagoya-mizuho", "愛知県名古屋市瑞穂区上山町3-14-8", "八事駅", 25, 600, "目安600円から", true, true, true, "上山町周辺", "https://www.komeda.co.jp/shop/detail.html?id=1", "全席禁煙", "あり", "あり", "あり"],
  ["chiba-chuo-starbucks-perie", "スターバックス ペリエ千葉店", "cafe", "chiba-chuo", "千葉県千葉市中央区新千葉1丁目1-1 ペリエ千葉2F", "千葉駅", 1, 600, "目安600円から", false, true, true, "千葉駅周辺", "https://www.perie.co.jp/chiba/floorguide/detail/?id=406", "禁煙", "要確認", "あり", "あり"]
];

const seedAdditionFiles = [
  "data/seed-shops.json",
  "data/seed-round1-major-cities.json",
  "data/seed-gigo-kaikatsu-major-cities.json",
  "data/seed-capsule-toy-major-cities.json",
  "data/seed-capsule-toy-pref-capitals.json",
  "data/seed-amenity-and-late-night-major-cities.json",
  "data/seed-arcade-crane-major-cities.json",
  "data/seed-station-amenity-pref-capitals.json",
  "data/seed-metropolitan-secondary-cities.json",
];

for (const seedAdditionPath of seedAdditionFiles) {
  const seedAdditionsFile = path.join(root, seedAdditionPath);
  if (!fs.existsSync(seedAdditionsFile)) continue;
  const seedAdditions = JSON.parse(fs.readFileSync(seedAdditionsFile, "utf8").replace(/^\uFEFF/, ""));
  for (const item of seedAdditions) additions.push(item);
}

function isTokaiArea(area) {
  return ["aichi", "gifu", "mie", "shizuoka"].includes(area.prefecture_key);
}

function isMetropolitanArea(area) {
  return ["tokyo", "kanagawa", "chiba", "saitama", "aichi", "osaka", "hyogo", "kyoto", "fukuoka", "miyagi", "hiroshima", "hokkaido"].includes(area.prefecture_key);
}

for (const area of areas) {
  additions.push([
    `${area.key}-reservable-parking-guide`,
    `${area.label} 予約できる駐車場案内`,
    "parking-lot",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    300,
    "目安300円から",
    true,
    true,
    true,
    `${area.label}中心部`,
    timesUrl(area)
  ]);
  additions.push([
    `${area.key}-municipal-bicycle-parking-guide`,
    `${area.label} 駐輪場案内`,
    "bicycle-parking",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    100,
    "目安100円から",
    false,
    true,
    false,
    `${area.label}中心部`,
    searchUrl(`${area.label} 駐輪場 料金 定期利用 自治体`)
  ]);
  additions.push([
    `${area.key}-times24-parking-management`,
    "タイムズ24 駐車場経営相談",
    "parking-management",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "相談内容を確認",
    true,
    false,
    false,
    `${area.label}周辺`,
    "https://www.times24.co.jp/lp/li01002.html"
  ]);
  additions.push([
    `${area.key}-repark-parking-management`,
    "三井のリパーク 駐車場経営相談",
    "parking-management",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "相談内容を確認",
    true,
    false,
    false,
    `${area.label}周辺`,
    reparkLandUseUrl()
  ]);
  if (isTokaiArea(area)) {
    additions.push([
      `${area.key}-meitetsu-parking-management`,
      "名鉄協商パーキング 土地活用相談",
      "parking-management",
      area.key,
      `${area.label}周辺`,
      `${area.label}中心部`,
      0,
      0,
      "相談内容を確認",
      true,
      false,
      false,
      `${area.label}周辺`,
      meitetsuParkingLandUseUrl()
    ]);
  }
  if (isMetropolitanArea(area)) {
    additions.push([
      `${area.key}-npd-parking-management`,
      "日本駐車場開発 駐車場管理相談",
      "parking-management",
      area.key,
      `${area.label}周辺`,
      `${area.label}中心部`,
      0,
      0,
      "相談内容を確認",
      true,
      false,
      false,
      `${area.label}周辺`,
      npdParkingUrl()
    ]);
  }
  additions.push([
    `${area.key}-vending-machine-guide`,
    `${area.label} 自動販売機案内`,
    "vending-machine",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    150,
    "目安150円から",
    false,
    true,
    false,
    `${area.label}中心部`,
    searchUrl(`${area.label} 自動販売機 キャッシュレス 災害対応`)
  ]);
  additions.push([
    `${area.key}-coca-cola-vending-installation`,
    "コカ・コーラ 自動販売機設置相談",
    "vending-machine-installation",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "相談内容を確認",
    false,
    false,
    false,
    `${area.label}周辺`,
    cocaColaVendingUrl()
  ]);
  additions.push([
    `${area.key}-suntory-vending-installation`,
    "サントリー 自動販売機設置相談",
    "vending-machine-installation",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "相談内容を確認",
    false,
    false,
    false,
    `${area.label}周辺`,
    suntoryVendingUrl()
  ]);
  additions.push([
    `${area.key}-dydo-vending-installation`,
    "ダイドードリンコ 自販機設置相談",
    "vending-machine-installation",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "相談内容を確認",
    false,
    false,
    false,
    `${area.label}周辺`,
    dydoVendingUrl()
  ]);
  additions.push([
    `${area.key}-itoen-vending-installation`,
    "伊藤園 自動販売機設置相談",
    "vending-machine-installation",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "相談内容を確認",
    false,
    false,
    false,
    `${area.label}周辺`,
    itoenVendingUrl()
  ]);
  additions.push([
    `${area.key}-homes-office-tenant`,
    "LIFULL HOME'S 貸事務所検索",
    "office-tenant",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "物件条件を確認",
    false,
    false,
    false,
    `${area.label}周辺`,
    homesOfficeUrl()
  ]);
  additions.push([
    `${area.key}-athome-business-tenant`,
    "アットホーム 事業用物件検索",
    "office-tenant",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "物件条件を確認",
    false,
    false,
    false,
    `${area.label}周辺`,
    athomeBusinessUrl()
  ]);
  if (isMetropolitanArea(area)) {
    additions.push([
      `${area.key}-inuki-tenant-search`,
      "居抜き店舗.com テナント検索",
      "office-tenant",
      area.key,
      `${area.label}周辺`,
      `${area.label}中心部`,
      0,
      0,
      "物件条件を確認",
      false,
      false,
      false,
      `${area.label}周辺`,
      inukiTenantUrl()
    ]);
  }
  additions.push([
    `${area.key}-opening-area-research-guide`,
    `${area.label} 出店前の周辺調査`,
    "opening-area-research",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "周辺情報を確認",
    true,
    true,
    false,
    `${area.label}周辺`,
    openingResearchUrl(area)
  ]);
  additions.push([
    `${area.key}-competitor-shop-check`,
    `${area.label} 競合店確認`,
    "opening-area-research",
    area.key,
    `${area.label}周辺`,
    `${area.label}中心部`,
    0,
    0,
    "周辺情報を確認",
    true,
    true,
    false,
    `${area.label}周辺`,
    searchUrl(`${area.label} 競合店 店舗 事務所`)
  ]);
}

const removeIds = new Set([
  "shizuoka-aoi-adult-shop-shizuoka",
  "shizuoka-numazu-adult-shop-numazu",
  "shizuoka-aoi-daijin-shizuoka-sample",
  "shizuoka-hamamatsu-izakaya-yurakugai",
  "shizuoka-numazu-izakaya-ekimae",
  "shizuoka-fujieda-izakaya-ekimae",
  "aichi-nagoya-nakamura-gigo-sasashima-game",
  "naha-gashapon-kokusaidori",
  "saitama-omiya-gigo-nishiguchi-capsule",
  "saitama-omiya-gigo-nishiguchi-crane",
  "saitama-omiya-gigo-nishiguchi-game",
  "yokohama-nishi-edion-capsule",
  "yokohama-nishi-round1-west-crane",
  "yokohama-nishi-round1-west-game",
  "yokohama-nishi-round1-west-karaoke",
  "chiba-chuo-gigo-crane",
  "chiba-chuo-gigo-game",
  "chiba-chuo-kaikatsu",
  "chiba-ichikawa-round1-billiards",
  "chiba-ichikawa-round1-bowling",
  "chiba-ichikawa-round1-crane",
  "chiba-ichikawa-round1-darts",
  "chiba-ichikawa-round1-game",
  "chiba-ichikawa-round1-karaoke",
  "akita-kaikatsu-shinkokudo-netcafe",
  "mito-kaikatsu-watari-netcafe",
  "utsunomiya-kaikatsu-miyuki-netcafe",
  "wakayama-kaikatsu-kokutai-darts",
  "oita-oita-round1-stadium-bowling",
  "oita-oita-round1-stadium-crane",
  "oita-oita-round1-stadium-darts",
  "oita-oita-round1-stadium-game",
  "oita-oita-round1-stadium-karaoke",
  "kumamoto-chuo-round1-bowling",
  "kumamoto-chuo-round1-crane",
  "kumamoto-chuo-round1-game",
  "kumamoto-chuo-round1-karaoke",
  "kagoshima-round1-bowling",
  "kagoshima-round1-crane",
  "kagoshima-round1-game",
  "kagoshima-round1-karaoke",
  "miyazaki-round1-bowling",
  "miyazaki-round1-crane",
  "miyazaki-round1-darts",
  "miyazaki-round1-game",
  "miyazaki-round1-karaoke",
  "niigata-chuo-round1-bowling",
  "niigata-chuo-round1-crane",
  "niigata-chuo-round1-game",
  "niigata-chuo-round1-karaoke",
  "okayama-minami-round1-senoo-billiards",
  "okayama-minami-round1-senoo-bowling",
  "okayama-minami-round1-senoo-crane",
  "okayama-minami-round1-senoo-darts",
  "okayama-minami-round1-senoo-game",
  "okayama-minami-round1-senoo-karaoke",
  "kumamoto-starbucks-station",
  "nagasaki-gigo-cocowalk-capsule",
  "nagasaki-kaikatsu-hamamachi-netcafe"
]);

for (let index = shops.length - 1; index >= 0; index -= 1) {
  if (removeIds.has(shops[index].id)) shops.splice(index, 1);
}

const existing = new Set(shops.map((shop) => shop.id));
for (const item of additions) {
  if (removeIds.has(item[0])) continue;
  if (existing.has(item[0])) continue;
  const [id, name, genreKey, areaKey, address, station, walk, budget, budgetLabel, parking, late, coupon, localArea, officialUrl, smokingArea, powerSeat, wifi, eatIn] = item;
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
    smoking_area: smokingArea || "",
    power_seat: powerSeat || "",
    wifi: wifi || "",
    eat_in: eatIn || "",
    source: { google_place_id: null, google_query: `${name} ${address}` }
  });
}

for (const shop of shops) {
  if (fixes[shop.id]) Object.assign(shop, fixes[shop.id]);
  enrichAmenities(shop);
  normalizeShop(shop);
}

const uniqueShops = [];
const seenShopIds = new Set();
for (const shop of shops) {
  if (seenShopIds.has(shop.id)) continue;
  seenShopIds.add(shop.id);
  uniqueShops.push(shop);
}
shops.length = 0;
shops.push(...uniqueShops);

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
