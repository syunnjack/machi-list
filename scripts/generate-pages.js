const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const siteUrl = "https://machi-list.jp";
const today = "2026-07-23";

const shops = readJson("data/shops.json");
const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");

const prefectures = [
  {
    "key": "hokkaido",
    "label": "北海道"
  },
  {
    "key": "aomori",
    "label": "青森県"
  },
  {
    "key": "iwate",
    "label": "岩手県"
  },
  {
    "key": "miyagi",
    "label": "宮城県"
  },
  {
    "key": "akita",
    "label": "秋田県"
  },
  {
    "key": "yamagata",
    "label": "山形県"
  },
  {
    "key": "fukushima",
    "label": "福島県"
  },
  {
    "key": "ibaraki",
    "label": "茨城県"
  },
  {
    "key": "tochigi",
    "label": "栃木県"
  },
  {
    "key": "gunma",
    "label": "群馬県"
  },
  {
    "key": "saitama",
    "label": "埼玉県"
  },
  {
    "key": "chiba",
    "label": "千葉県"
  },
  {
    "key": "tokyo",
    "label": "東京都"
  },
  {
    "key": "kanagawa",
    "label": "神奈川県"
  },
  {
    "key": "niigata",
    "label": "新潟県"
  },
  {
    "key": "toyama",
    "label": "富山県"
  },
  {
    "key": "ishikawa",
    "label": "石川県"
  },
  {
    "key": "fukui",
    "label": "福井県"
  },
  {
    "key": "yamanashi",
    "label": "山梨県"
  },
  {
    "key": "nagano",
    "label": "長野県"
  },
  {
    "key": "gifu",
    "label": "岐阜県"
  },
  {
    "key": "shizuoka",
    "label": "静岡県"
  },
  {
    "key": "aichi",
    "label": "愛知県"
  },
  {
    "key": "mie",
    "label": "三重県"
  },
  {
    "key": "shiga",
    "label": "滋賀県"
  },
  {
    "key": "kyoto",
    "label": "京都府"
  },
  {
    "key": "osaka",
    "label": "大阪府"
  },
  {
    "key": "hyogo",
    "label": "兵庫県"
  },
  {
    "key": "nara",
    "label": "奈良県"
  },
  {
    "key": "wakayama",
    "label": "和歌山県"
  },
  {
    "key": "tottori",
    "label": "鳥取県"
  },
  {
    "key": "shimane",
    "label": "島根県"
  },
  {
    "key": "okayama",
    "label": "岡山県"
  },
  {
    "key": "hiroshima",
    "label": "広島県"
  },
  {
    "key": "yamaguchi",
    "label": "山口県"
  },
  {
    "key": "tokushima",
    "label": "徳島県"
  },
  {
    "key": "kagawa",
    "label": "香川県"
  },
  {
    "key": "ehime",
    "label": "愛媛県"
  },
  {
    "key": "kochi",
    "label": "高知県"
  },
  {
    "key": "fukuoka",
    "label": "福岡県"
  },
  {
    "key": "saga",
    "label": "佐賀県"
  },
  {
    "key": "nagasaki",
    "label": "長崎県"
  },
  {
    "key": "kumamoto",
    "label": "熊本県"
  },
  {
    "key": "oita",
    "label": "大分県"
  },
  {
    "key": "miyazaki",
    "label": "宮崎県"
  },
  {
    "key": "kagoshima",
    "label": "鹿児島県"
  },
  {
    "key": "okinawa",
    "label": "沖縄県"
  }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function css(depth) {
  return `${"../".repeat(depth)}assets/styles.css`;
}

function home(depth) {
  return "../".repeat(depth);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function toRelative(url, depth) {
  if (url.startsWith("http")) return url;
  return `${home(depth)}${url.replace(/^\//, "")}`;
}

function mapUrl(shop) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name} ${shop.address}`)}`;
}

function vcUrl(targetUrl) {
  return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=YOUR_VC_SID&pid=YOUR_VC_PID&vc_url=${encodeURIComponent(targetUrl)}`;
}

function searchUrl(keyword) {
  return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
}

function timesParkingUrl(area) {
  return vcUrl(`https://btimes.jp/search/?keyword=${encodeURIComponent(area.label)}`);
}

function timesCardUrl() {
  return vcUrl("https://btimes.jp/about/");
}

function parkingLandUseUrl() {
  return vcUrl("https://www.times24.co.jp/lp/li01002.html");
}

function parkingOperatorSearchUrl(area) {
  return searchUrl(`${area.label} 駐車場経営 土地活用 タイムズ24 三井のリパーク 名鉄協商 日本駐車場開発`);
}

function reparkLandUseUrl() {
  return "https://www.repark.jp/lp/01/";
}

function vendingInstallSearchUrl(area) {
  return searchUrl(`${area.label} 自販機設置 コカ・コーラ サントリー ダイドー 伊藤園`);
}

function officeTenantSearchUrl(area) {
  return searchUrl(`${area.label} 貸事務所 貸店舗 テナント 居抜き`);
}

function openingResearchUrl(area) {
  return searchUrl(`${area.label} 開業 競合店 周辺調査 立地`);
}

function bookingUrl(area, genre) {
  if (genre.key === "parking-lot") return timesParkingUrl(area);
  if (genre.key === "bicycle-parking") return searchUrl(`${area.label} 駐輪場 料金 定期利用 自治体`);
  if (genre.key === "parking-management") return parkingLandUseUrl();
  if (genre.key === "vending-machine") return searchUrl(`${area.label} 自動販売機 キャッシュレス 災害対応`);
  if (genre.key === "vending-machine-installation") return vendingInstallSearchUrl(area);
  if (genre.key === "office-tenant") return officeTenantSearchUrl(area);
  if (genre.key === "opening-area-research") return openingResearchUrl(area);
  return vcUrl(`https://www.hotpepper.jp/?keyword=${encodeURIComponent(`${area.label} ${genre.label}`)}`);
}

function couponUrl(genre) {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${genre.label} クーポン`)}/`;
}

function shoppingUrl(genre) {
  const keywords = {
    netcafe: "テレワーク 便利グッズ",
    "game-center": "ゲーム 景品 収納",
    "adult-shop": "アダルトグッズ 通販",
    karaoke: "カラオケ マイク",
    sauna: "サウナ グッズ",
    spa: "入浴剤 温泉気分",
    "cat-cafe": "猫用品",
    restaurant: "外食 クーポン",
    darts: "ダーツ バレル フライト",
    bowling: "ボウリング ボール シューズ",
    billiards: "ビリヤード キュー チョーク",
    "movie-theater": "映画 前売り券",
    "video-box": "軽食 充電器 アメニティ",
    "capsule-toy": "カプセルトイ 収納 ケース",
    "crane-game": "クレーンゲーム 景品 収納",
    "convenience-store": "携帯灰皿",
    cafe: "カフェ タンブラー",
    "parking-lot": "タイムズカード ETC 車載 便利グッズ",
    "bicycle-parking": "自転車 鍵 レインカバー ライト",
    "parking-management": "駐車場 看板 防犯カメラ 照明",
    "vending-machine": "飲料 まとめ買い 防災備蓄",
    "vending-machine-installation": "自販機 防犯カメラ 屋外照明",
    "office-tenant": "店舗 開業 備品 オフィス家具",
    "opening-area-research": "店舗 看板 チラシ 防犯カメラ"
  };
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keywords[genre.key] || `${genre.label} 関連商品`)}/`;
}

const eventGenreKeys = new Set(["darts", "bowling", "billiards"]);

function isEventGenre(genreKey) {
  return eventGenreKeys.has(genreKey);
}

function eventUrl(area, genre) {
  const keyword = isEventGenre(genre.key) ? `${area.label} ${genre.label} プロチャレンジ イベント` : `${area.label} ${genre.label}`;
  return vcUrl(`https://www.asoview.com/search/?keyword=${encodeURIComponent(keyword)}`);
}

function subtleLinks(area, genre, depth) {
  if (isEventGenre(genre.key)) {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${eventUrl(area, genre)}">大会・イベント</a><a href="${shoppingUrl(genre)}">道具を探す</a><a href="${bookingUrl(area, genre)}">練習する店</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "netcafe") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${bookingUrl(area, genre)}">空席・予約</a><a href="${shoppingUrl(genre)}">軽食・備品</a><a href="${couponUrl(genre)}">クーポンを探す</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "video-box") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${bookingUrl(area, genre)}">店舗を確認</a><a href="${shoppingUrl(genre)}">軽食・備品</a><a href="${couponUrl(genre)}">クーポンを探す</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "movie-theater") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${shoppingUrl(genre)}">前売り券を探す</a><a href="${couponUrl(genre)}">クーポンを探す</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "capsule-toy") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${shoppingUrl(genre)}">収納・ケース</a><a href="${couponUrl(genre)}">取扱商品を探す</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "crane-game") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${couponUrl(genre)}">景品・イベント</a><a href="${shoppingUrl(genre)}">収納・グッズ</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "convenience-store") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${shoppingUrl(genre)}">携帯灰皿</a><a href="${couponUrl(genre)}">クーポンを探す</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "cafe") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${bookingUrl(area, genre)}">店舗を確認</a><a href="${shoppingUrl(genre)}">タンブラー</a><a href="${couponUrl(genre)}">クーポンを探す</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "parking-lot") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${timesParkingUrl(area)}">予約できる駐車場</a><a href="${timesCardUrl()}">会員登録を確認</a><a href="${parkingLandUseUrl()}">土地活用を相談</a><a href="${parkingOperatorSearchUrl(area)}">管理会社を比べる</a></section>`;
  }
  if (genre.key === "bicycle-parking") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${bookingUrl(area, genre)}">料金・定期利用</a><a href="${shoppingUrl(genre)}">鍵・ライト</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "parking-management") {
    return `<section class="side-block subtle-links"><h2>相談前に確認</h2><a href="${parkingLandUseUrl()}">タイムズ24に相談</a><a href="${reparkLandUseUrl()}">三井のリパークに相談</a><a href="${parkingOperatorSearchUrl(area)}">管理会社を比べる</a><a href="${shoppingUrl(genre)}">設備を確認</a></section>`;
  }
  if (genre.key === "vending-machine") {
    return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${bookingUrl(area, genre)}">設置場所を探す</a><a href="${shoppingUrl(genre)}">飲料をまとめて探す</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  if (genre.key === "vending-machine-installation") {
    return `<section class="side-block subtle-links"><h2>相談前に確認</h2><a href="${vendingInstallSearchUrl(area)}">設置相談先を比べる</a><a href="https://www.suntory.co.jp/softdrink/jihanki/index.html">サントリーに相談</a><a href="https://www.coca-cola.com/jp/ja/media-center/vending-machine">コカ・コーラを確認</a><a href="${shoppingUrl(genre)}">周辺設備を確認</a></section>`;
  }
  if (genre.key === "office-tenant") {
    return `<section class="side-block subtle-links"><h2>開業前に確認</h2><a href="${officeTenantSearchUrl(area)}">貸事務所・テナント</a><a href="https://www.homes.co.jp/chintai/office/">貸事務所を探す</a><a href="https://www.athome.co.jp/">事業用物件を探す</a><a href="${shoppingUrl(genre)}">開業備品</a></section>`;
  }
  if (genre.key === "opening-area-research") {
    return `<section class="side-block subtle-links"><h2>開業前に確認</h2><a href="${openingResearchUrl(area)}">周辺を調べる</a><a href="${home(depth)}area/${area.prefecture_key}/${area.path}/">周辺ジャンルを見る</a><a href="${shoppingUrl(genre)}">開業準備品</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
  }
  return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${bookingUrl(area, genre)}">予約できる店</a><a href="${couponUrl(genre)}">クーポンを探す</a><a href="${shoppingUrl(genre)}">${genre.key === "adult-shop" ? "通販を見る" : "関連アイテム"}</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
}

function primaryActionLabel(shop) {
  if (shop.genre_key === "adult-shop") return "買い方";
  if (isEventGenre(shop.genre_key)) return "大会・イベント";
  if (shop.genre_key === "movie-theater") return "上映・チケット";
  if (shop.genre_key === "video-box") return "店舗を確認";
  if (shop.genre_key === "capsule-toy") return "在庫・商品";
  if (shop.genre_key === "crane-game") return "景品・イベント";
  if (shop.genre_key === "convenience-store") return "店舗を確認";
  if (shop.genre_key === "cafe") return "店舗を確認";
  if (shop.genre_key === "parking-lot") return "予約・空き確認";
  if (shop.genre_key === "bicycle-parking") return "料金・定期利用";
  if (shop.genre_key === "parking-management") return "相談先を確認";
  if (shop.genre_key === "vending-machine") return "設置場所を確認";
  if (shop.genre_key === "vending-machine-installation") return "設置相談";
  if (shop.genre_key === "office-tenant") return "物件を探す";
  if (shop.genre_key === "opening-area-research") return "周辺を調べる";
  return "予約";
}

function secondaryActionLabel(shop) {
  if (shop.genre_key === "adult-shop") return "通販";
  if (isEventGenre(shop.genre_key)) return "道具";
  if (shop.genre_key === "netcafe" || shop.genre_key === "video-box") return "軽食・備品";
  if (shop.genre_key === "capsule-toy") return "収納・ケース";
  if (shop.genre_key === "crane-game") return "収納・グッズ";
  if (shop.genre_key === "convenience-store") return "携帯灰皿";
  if (shop.genre_key === "cafe") return "タンブラー";
  if (shop.genre_key === "parking-lot") return "会員・カード";
  if (shop.genre_key === "bicycle-parking") return "鍵・ライト";
  if (shop.genre_key === "parking-management") return "管理会社比較";
  if (shop.genre_key === "vending-machine") return "飲料・備蓄";
  if (shop.genre_key === "vending-machine-installation") return "周辺設備";
  if (shop.genre_key === "office-tenant") return "開業備品";
  if (shop.genre_key === "opening-area-research") return "開業準備品";
  return "クーポン";
}

function supportHeading(genre) {
  if (isEventGenre(genre.key)) return "大会・イベント・道具";
  if (genre.key === "netcafe" || genre.key === "video-box") return "終電後の休憩・軽食・備品";
  if (genre.key === "movie-theater") return "上映・チケット・周辺情報";
  if (genre.key === "capsule-toy") return "取扱商品・収納・周辺情報";
  if (genre.key === "crane-game") return "景品・イベント・周辺情報";
  if (genre.key === "convenience-store") return "店頭喫煙・灰皿・周辺情報";
  if (genre.key === "cafe") return "電源・Wi-Fi・イートイン";
  if (genre.key === "parking-lot") return "予約・会員登録・土地活用";
  if (genre.key === "bicycle-parking") return "料金・定期利用・自治体案内";
  if (genre.key === "parking-management") return "駐車場経営・管理委託・相談先";
  if (genre.key === "vending-machine") return "設置場所・キャッシュレス・防災";
  if (genre.key === "vending-machine-installation") return "設置相談・商品補充・故障対応";
  if (genre.key === "office-tenant") return "貸事務所・貸店舗・居抜き物件";
  if (genre.key === "opening-area-research") return "競合店・周辺施設・立地確認";
  return "予約・クーポン・周辺情報";
}

function supportText(area, genre) {
  if (isEventGenre(genre.key)) return `${area.label}周辺で使える大会情報、練習先、道具、駐車場を必要な時に開けます。`;
  if (genre.key === "netcafe" || genre.key === "video-box") return `${area.label}周辺で終電後に休める店、シャワー、充電、軽食、備品を必要な時に確認できます。`;
  if (genre.key === "movie-theater") return `${area.label}周辺の上映時間、チケット、クーポン、駐車場を必要な時に開けます。`;
  if (genre.key === "capsule-toy") return `${area.label}周辺のカプセルトイ専門店、設置場所、取扱商品、収納用品を必要な時に確認できます。`;
  if (genre.key === "crane-game") return `${area.label}周辺のクレーンゲーム、UFOキャッチャー、景品、駅近店舗を必要な時に確認できます。`;
  if (genre.key === "convenience-store") return `${area.label}周辺のコンビニ、店頭喫煙、灰皿、駐車場、24時間営業を必要な時に確認できます。`;
  if (genre.key === "cafe") return `${area.label}周辺のカフェ、電源、Wi-Fi、イートイン、駅からの近さを必要な時に確認できます。`;
  if (genre.key === "parking-lot") return `${area.label}周辺の駐車場、事前予約、会員登録、土地活用の相談先を必要な時に確認できます。`;
  if (genre.key === "bicycle-parking") return `${area.label}周辺の駐輪場、一時利用、定期利用、料金、自治体の案内を必要な時に確認できます。`;
  if (genre.key === "parking-management") return `${area.label}周辺で駐車場管理、土地活用、一括借り上げ、予約制駐車場の相談先を確認できます。`;
  if (genre.key === "vending-machine") return `${area.label}周辺の自動販売機、キャッシュレス対応、防災対応、買いやすい場所を必要な時に確認できます。`;
  if (genre.key === "vending-machine-installation") return `${area.label}周辺で自販機設置、商品補充、売上金回収、空容器回収、故障対応の相談先を確認できます。`;
  if (genre.key === "office-tenant") return `${area.label}周辺で新規開業向けの貸事務所、貸店舗、居抜き物件、周辺施設を確認できます。`;
  if (genre.key === "opening-area-research") return `${area.label}周辺で競合店、近隣施設、駐車場、駅からの近さを開業前に確認できます。`;
  return `${area.label}周辺で使える予約、クーポン、通販、駐車場を必要な時に開けます。`;
}

function supportPrimaryUrl(area, genre) {
  if (isEventGenre(genre.key)) return eventUrl(area, genre);
  if (genre.key === "netcafe" || genre.key === "video-box") return shoppingUrl(genre);
  if (genre.key === "capsule-toy") return couponUrl(genre);
  if (genre.key === "crane-game") return couponUrl(genre);
  if (genre.key === "convenience-store") return couponUrl(genre);
  if (genre.key === "cafe") return bookingUrl(area, genre);
  if (genre.key === "parking-lot") return timesParkingUrl(area);
  if (genre.key === "bicycle-parking") return bookingUrl(area, genre);
  if (genre.key === "parking-management") return parkingLandUseUrl();
  if (genre.key === "vending-machine") return bookingUrl(area, genre);
  if (genre.key === "vending-machine-installation") return vendingInstallSearchUrl(area);
  if (genre.key === "office-tenant") return officeTenantSearchUrl(area);
  if (genre.key === "opening-area-research") return openingResearchUrl(area);
  return bookingUrl(area, genre);
}

function supportPrimaryLabel(genre) {
  if (isEventGenre(genre.key)) return "大会・イベント";
  if (genre.key === "netcafe" || genre.key === "video-box") return "軽食・備品";
  if (genre.key === "movie-theater") return "上映・チケット";
  if (genre.key === "capsule-toy") return "取扱商品を探す";
  if (genre.key === "crane-game") return "景品・イベント";
  if (genre.key === "convenience-store") return "クーポンを探す";
  if (genre.key === "cafe") return "店舗を確認";
  if (genre.key === "parking-lot") return "予約・空き確認";
  if (genre.key === "bicycle-parking") return "料金・定期利用";
  if (genre.key === "parking-management") return "相談先を確認";
  if (genre.key === "vending-machine") return "設置場所を探す";
  if (genre.key === "vending-machine-installation") return "設置相談先を比べる";
  if (genre.key === "office-tenant") return "物件を探す";
  if (genre.key === "opening-area-research") return "周辺を調べる";
  return "予約できる店";
}

function supportSecondaryUrl(genre, area = null) {
  if (genre.key === "parking-lot") return area ? parkingLandUseUrl(area) : parkingLandUseUrl();
  if (genre.key === "bicycle-parking") return shoppingUrl(genre);
  if (genre.key === "parking-management") return area ? parkingOperatorSearchUrl(area) : reparkLandUseUrl();
  if (genre.key === "vending-machine") return shoppingUrl(genre);
  if (genre.key === "vending-machine-installation") return shoppingUrl(genre);
  if (genre.key === "office-tenant") return shoppingUrl(genre);
  if (genre.key === "opening-area-research") return shoppingUrl(genre);
  return isEventGenre(genre.key) ? shoppingUrl(genre) : couponUrl(genre);
}

function supportSecondaryLabel(genre) {
  if (isEventGenre(genre.key)) return "道具を探す";
  if (genre.key === "parking-lot") return "土地活用を相談";
  if (genre.key === "bicycle-parking") return "鍵・ライト";
  if (genre.key === "parking-management") return "管理会社を比べる";
  if (genre.key === "vending-machine") return "飲料・備蓄";
  if (genre.key === "vending-machine-installation") return "周辺設備";
  if (genre.key === "office-tenant") return "開業備品";
  if (genre.key === "opening-area-research") return "開業準備品";
  return "クーポンを探す";
}

function pageShell({ title, description, canonical, depth, body, structuredData = "" }) {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonical}">
    <link rel="stylesheet" href="${css(depth)}">
    ${structuredData}
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${home(depth)}"><span class="brand-mark">M</span><span><strong>まちリスト</strong><small>市区町村とジャンルで探す店舗一覧</small></span></a>
      <nav class="nav"><a href="${home(depth)}">トップ</a><a href="${home(depth)}category/">ジャンル</a>${prefectures.map((pref) => `<a href="${home(depth)}area/${pref.key}/">${pref.label}</a>`).join("")}</nav>
    </header>
    <main>
${body}
    </main>
    <footer class="site-footer"><p>© 2026 まちリスト</p><p><a href="${home(depth)}llms.txt">llms.txt</a></p></footer>
  </body>
</html>
`;
}

function featureBadges(shop) {
  return [
    shop.hours ? `<span class="badge">${escapeHtml(shop.hours)}</span>` : "",
    shop.parking ? `<span class="badge">駐車場あり</span>` : "",
    shop.late ? `<span class="badge">夜まで営業</span>` : "",
    shop.coupon ? `<span class="badge">クーポン確認</span>` : "",
    shop.smoking_area ? `<span class="badge">喫煙: ${escapeHtml(shop.smoking_area)}</span>` : "",
    shop.power_seat ? `<span class="badge">電源: ${escapeHtml(shop.power_seat)}</span>` : "",
    shop.wifi ? `<span class="badge">Wi-Fi: ${escapeHtml(shop.wifi)}</span>` : "",
    shop.eat_in ? `<span class="badge">イートイン: ${escapeHtml(shop.eat_in)}</span>` : ""
  ].filter(Boolean).join("");
}

function shopCards(items, depth) {
  if (!items.length) {
    return `<article class="shop-card"><div><h3>掲載準備中です</h3><p>このエリアの店舗、予約、クーポン、通販、駐車場情報を順次追加しています。</p></div><div class="shop-actions"><a class="button" href="${home(depth)}">条件を変えて探す</a></div></article>`;
  }

  return items.map((shop) => `
              <article class="shop-card">
                <div>
                  <h3><a href="${toRelative(shop.url, depth)}">${escapeHtml(shop.name)}</a></h3>
                  <p>${escapeHtml(shop.address)} / ${escapeHtml(shop.nearest_station)}から徒歩約${escapeHtml(shop.station_walk_minutes)}分</p>
                  <div class="badges">${featureBadges(shop)}</div>
                </div>
                <div class="shop-actions">
                  <a class="button" href="${toRelative(shop.url, depth)}">詳細</a>
                  <a class="button button-light" href="${shop.booking_url || mapUrl(shop)}">${primaryActionLabel(shop)}</a>
                  <a class="button button-light" href="${shop.shopping_url || shop.coupon_url || couponUrl({ label: shop.genre })}">${secondaryActionLabel(shop)}</a>
                  <a class="button button-light" href="${mapUrl(shop)}">地図</a>
                </div>
              </article>`).join("");
}

function itemList(name, canonical, items) {
  const elements = items.map((shop, index) => `{"@type":"ListItem","position":${index + 1},"url":"${siteUrl}${shop.url}"}`).join(",");
  return `<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":"${escapeHtml(name)}","url":"${canonical}","itemListElement":[${elements}]}</script>`;
}

function areasFor(prefectureKey) {
  return areas.filter((area) => area.prefecture_key === prefectureKey);
}

function shopsForPref(prefectureKey) {
  return shops.filter((shop) => shop.prefecture_key === prefectureKey);
}

function areaLinks(prefectureKey, depth, current = "") {
  return areasFor(prefectureKey).map((area) => `<a href="${home(depth)}area/${prefectureKey}/${area.path}/"${area.key === current ? ` aria-current="page"` : ""}>${area.label}</a>`).join("");
}

function genreLinks(area, depth) {
  return genres.map((genre) => `<a href="${home(depth)}area/${area.prefecture_key}/${area.path}/${genre.key}/">${area.label}の${genre.label}</a>`).join("");
}

function genreLandingHref(genre, depth) {
  const shop = shops.find((item) => item.genre_key === genre.key);
  if (shop) return `${home(depth)}area/${shop.prefecture_key}/${shop.area_path}/${genre.key}/`;
  const area = areas[0];
  return `${home(depth)}area/${area.prefecture_key}/${area.path}/${genre.key}/`;
}

const openingSupportGenreKeys = [
  "office-tenant",
  "opening-area-research",
  "parking-lot",
  "parking-management",
  "convenience-store",
  "cafe",
  "restaurant",
  "game-center",
  "crane-game",
  "capsule-toy",
  "netcafe",
  "vending-machine-installation"
];

const openingSupportNotes = {
  "office-tenant": "貸事務所・貸店舗・居抜き物件を確認",
  "opening-area-research": "競合店と周辺施設を横断確認",
  "parking-lot": "来店客・スタッフ用の駐車場を確認",
  "parking-management": "土地活用や駐車場化の相談先を確認",
  "convenience-store": "人の出入り、喫煙、イートイン、電源を確認",
  cafe: "滞在需要、Wi-Fi、電源、喫煙可否を確認",
  restaurant: "昼夜の飲食需要と競合の厚みを確認",
  "game-center": "若年層・回遊需要のある施設を確認",
  "crane-game": "集客装置としての設置場所を確認",
  "capsule-toy": "小型物販・回遊導線を確認",
  netcafe: "終電後・作業需要・休憩需要を確認",
  "vending-machine-installation": "自販機設置や屋外設備の相談先を確認"
};

function areaGenreHref(area, genreKey, depth) {
  return `${home(depth)}area/${area.prefecture_key}/${area.path}/${genreKey}/`;
}

function areaGenreCount(area, genreKey) {
  return shops.filter((shop) => shop.area_key === area.key && shop.genre_key === genreKey).length;
}

function shopsForArea(area) {
  return shops.filter((shop) => shop.area_key === area.key);
}

function topGenresForArea(area, limit = 8) {
  const counts = new Map();
  for (const shop of shopsForArea(area)) {
    counts.set(shop.genre_key, (counts.get(shop.genre_key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([genreKey, count]) => ({ genre: genres.find((item) => item.key === genreKey), count }))
    .filter((row) => row.genre)
    .sort((a, b) => b.count - a.count || a.genre.label.localeCompare(b.genre.label, "ja"))
    .slice(0, limit);
}

const areaUseCases = [
  {
    label: "駅近で探す",
    note: "駅から歩きやすい施設を先に見る",
    hrefGenre: "convenience-store",
    filter: (shop) => Number(shop.station_walk_minutes) <= 8
  },
  {
    label: "夜に使う",
    note: "終電後や遅い時間の候補を残す",
    hrefGenre: "netcafe",
    filter: (shop) => shop.late
  },
  {
    label: "車で行く",
    note: "駐車場がある施設と周辺駐車場を見る",
    hrefGenre: "parking-lot",
    filter: (shop) => shop.parking || shop.genre_key === "parking-lot"
  },
  {
    label: "休憩・滞在",
    note: "作業、休憩、時間調整に使える場所を見る",
    hrefGenre: "cafe",
    filter: (shop) => ["cafe", "netcafe", "video-box", "spa", "sauna", "karaoke", "movie-theater"].includes(shop.genre_key)
  },
  {
    label: "出店前に見る",
    note: "競合、駐車場、滞在需要をまとめて確認",
    hrefGenre: "opening-area-research",
    filter: (shop) => ["office-tenant", "opening-area-research", "parking-lot", "parking-management", "vending-machine-installation"].includes(shop.genre_key)
  }
];

function areaUseCasePanel(area, depth) {
  const items = shopsForArea(area);
  const cards = areaUseCases.map((useCase) => {
    const count = items.filter(useCase.filter).length;
    return `<a class="signal-card" href="${areaGenreHref(area, useCase.hrefGenre, depth)}"><strong>${useCase.label}</strong><span>${count}件</span><small>${useCase.note}</small></a>`;
  }).join("");
  return `<section class="section area-signals"><div class="section-head"><p class="eyebrow">探し方</p><h2>${area.label}で目的から選ぶ</h2><p>近さ、夜の使いやすさ、車での行きやすさ、滞在しやすさを分けて確認できます。</p></div><div class="signal-grid">${cards}</div></section>`;
}

function topGenrePanel(area, depth) {
  const rows = topGenresForArea(area, 10).map(({ genre, count }) => {
    return `<tr><td><a href="${areaGenreHref(area, genre.key, depth)}">${genre.label}</a></td><td>${count}件</td><td>${genre.description}</td></tr>`;
  }).join("");
  return `<section class="section"><h2>${area.label}で掲載が多いジャンル</h2><table class="info-table"><tr><th>ジャンル</th><th>掲載</th><th>見方</th></tr>${rows}</table></section>`;
}

function prefectureAreaHighlights(prefecture, depth) {
  const rows = areasFor(prefecture.key)
    .map((area) => {
      const areaShops = shopsForArea(area);
      const top = topGenresForArea(area, 1)[0];
      const late = areaShops.filter((shop) => shop.late).length;
      const parking = areaShops.filter((shop) => shop.parking || shop.genre_key === "parking-lot").length;
      return { area, count: areaShops.length, top, late, parking };
    })
    .sort((a, b) => b.count - a.count || a.area.label.localeCompare(b.area.label, "ja"))
    .slice(0, 12)
    .map((row) => `<tr><td><a href="${home(depth)}area/${row.area.prefecture_key}/${row.area.path}/">${row.area.label}</a></td><td>${row.count}件</td><td>${row.top ? `${row.top.genre.label} ${row.top.count}件` : "確認中"}</td><td>夜 ${row.late}件 / 車 ${row.parking}件</td></tr>`)
    .join("");
  return `<section class="section"><h2>${prefecture.label}の主要エリア比較</h2><table class="info-table"><tr><th>エリア</th><th>掲載</th><th>多いジャンル</th><th>使いやすさ</th></tr>${rows}</table></section>`;
}

function relatedGenrePanel(area, genre, depth) {
  const relationMap = {
    "parking-lot": ["parking-management", "bicycle-parking", "office-tenant", "opening-area-research"],
    "parking-management": ["parking-lot", "office-tenant", "opening-area-research", "vending-machine-installation"],
    "vending-machine-installation": ["vending-machine", "office-tenant", "parking-management", "opening-area-research"],
    "office-tenant": ["opening-area-research", "parking-lot", "parking-management", "vending-machine-installation"],
    "opening-area-research": ["office-tenant", "parking-lot", "parking-management", "vending-machine-installation"],
    netcafe: ["video-box", "cafe", "convenience-store", "karaoke"],
    "video-box": ["netcafe", "convenience-store", "parking-lot", "adult-shop"],
    "crane-game": ["game-center", "capsule-toy", "hobby-shop", "trading-card-shop"],
    "capsule-toy": ["crane-game", "game-center", "hobby-shop", "recycle-shop"],
    darts: ["billiards", "bowling", "karaoke", "netcafe"],
    bowling: ["darts", "billiards", "karaoke", "game-center"],
    billiards: ["darts", "bowling", "karaoke", "netcafe"],
    "convenience-store": ["cafe", "parking-lot", "coin-laundry", "drugstore"],
    cafe: ["convenience-store", "netcafe", "restaurant", "cat-cafe"]
  };
  const keys = relationMap[genre.key] || ["parking-lot", "convenience-store", "cafe", "restaurant"];
  const cards = keys.map((genreKey) => {
    const related = genres.find((item) => item.key === genreKey);
    if (!related) return "";
    return `<a class="signal-card" href="${areaGenreHref(area, genreKey, depth)}"><strong>${related.label}</strong><span>${areaGenreCount(area, genreKey)}件</span><small>${related.description}</small></a>`;
  }).filter(Boolean).join("");
  return `<section class="section"><div class="section-head"><p class="eyebrow">あわせて確認</p><h2>${area.label}で近い目的のジャンル</h2></div><div class="signal-grid">${cards}</div></section>`;
}

const openingMetricDefinitions = [
  {
    label: "競合密度",
    note: "近い業態の厚みを確認",
    genreKeys: ["restaurant", "cafe", "game-center", "crane-game", "capsule-toy", "netcafe", "adult-shop", "karaoke", "dental-clinic"]
  },
  {
    label: "駐車場の厚み",
    note: "車で来る人と従業員の導線を確認",
    genreKeys: ["parking-lot", "parking-management", "bicycle-parking", "gas-station"]
  },
  {
    label: "夜需要",
    note: "終電後や夜の滞在先を確認",
    genreKeys: ["netcafe", "video-box", "karaoke", "restaurant", "convenience-store", "adult-shop", "sauna", "spa"]
  },
  {
    label: "滞在需要",
    note: "作業、休憩、回遊の受け皿を確認",
    genreKeys: ["cafe", "netcafe", "spa", "sauna", "cat-cafe", "movie-theater", "karaoke"]
  }
];

function openingMetricScore(area, genreKeys) {
  const items = shops.filter((shop) => shop.area_key === area.key && genreKeys.includes(shop.genre_key));
  const lateCount = items.filter((shop) => shop.late).length;
  const parkingCount = items.filter((shop) => shop.parking).length;
  const stationCount = items.filter((shop) => Number(shop.station_walk_minutes) <= 10).length;
  const score = Math.min(100, Math.round(items.length * 12 + lateCount * 8 + parkingCount * 4 + stationCount * 3));
  const rank = score >= 75 ? "高め" : score >= 45 ? "中" : "これから確認";
  return { count: items.length, rank, score };
}

function openingScorePanel(area) {
  const cards = openingMetricDefinitions.map((metric) => {
    const result = openingMetricScore(area, metric.genreKeys);
    return `<article class="score-card"><strong>${metric.label}</strong><em>${result.rank}</em><div class="score-meter" aria-hidden="true"><span style="--score-width:${result.score}%"></span></div><small>${result.count}件をもとに${metric.note}</small></article>`;
  }).join("");
  return `<section class="section opening-score"><div class="section-head"><p class="eyebrow">出店前の見立て</p><h2>${area.label}の周辺バランス</h2><p>掲載施設の数、駅からの近さ、夜営業、駐車場の有無から目安を出しています。現地確認の前に、優先して見る場所を絞り込めます。</p></div><div class="opening-score-grid">${cards}</div></section>`;
}

function openingResearchPanel(area, depth) {
  const cards = openingSupportGenreKeys.map((genreKey) => {
    const genre = genres.find((item) => item.key === genreKey);
    if (!genre) return "";
    const count = areaGenreCount(area, genreKey);
    return `<a class="insight-card" href="${areaGenreHref(area, genreKey, depth)}"><strong>${genre.label}</strong><span>${count}件</span><small>${openingSupportNotes[genreKey] || genre.description}</small></a>`;
  }).filter(Boolean).join("");

  return `<section class="section opening-research"><div class="section-head"><p class="eyebrow">開業前の見方</p><h2>${area.label}で出店候補を調べる</h2><p>物件だけでなく、競合店、駐車場、駅前の滞在場所、買い物動線、休憩需要を同じエリア内で確認できます。</p></div><div class="insight-grid">${cards}</div></section>`;
}

function openingResearchTable(area) {
  const rows = openingSupportGenreKeys.map((genreKey) => {
    const genre = genres.find((item) => item.key === genreKey);
    if (!genre) return "";
    const count = areaGenreCount(area, genreKey);
    return `<tr><td>${genre.label}</td><td>${count}件</td><td>${openingSupportNotes[genreKey] || genre.description}</td></tr>`;
  }).filter(Boolean).join("");
  return `<section class="section"><h2>出店前に見る周辺項目</h2><table class="info-table"><tr><th>項目</th><th>掲載</th><th>見方</th></tr>${rows}</table></section>`;
}

function prefectureIndex(prefecture) {
  const prefAreas = areasFor(prefecture.key);
  const prefShops = shopsForPref(prefecture.key);
  const depth = 2;
  const canonical = `${siteUrl}/area/${prefecture.key}/`;
  const body = `      <header class="page-header">
        <p class="eyebrow">${prefecture.label}</p>
        <h1>${prefecture.label}のお店・商業施設一覧</h1>
        <p>${prefecture.label}の主要市区町村から、ネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、飲食店を探せます。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><span>${prefecture.label}</span></nav>
      </header>
      <section class="answer-box"><h2>市区町村から探す</h2><div class="category-grid">${prefAreas.map((area) => `<a class="category-card" href="./${area.path}/"><span class="category-icon">${area.label.slice(0, 1)}</span><strong>${area.label}</strong><small>${area.station}周辺の店舗を確認</small></a>`).join("")}</div></section>
      ${prefectureAreaHighlights(prefecture, depth)}
      <section class="two-column"><div><section class="section"><h2>${prefecture.label}の掲載店舗</h2><div class="shop-list">${shopCards(prefShops, depth)}</div></section></div><aside class="side-column"><section class="side-block"><h2>ジャンル</h2>${genres.map((genre) => `<a href="${home(depth)}category/#${genre.key}">${genre.label}</a>`).join("")}</section><section class="side-block"><h2>確認できること</h2><a href="${home(depth)}">近い順で探す</a><a href="${home(depth)}">予算の安い順で探す</a><a href="${home(depth)}guide/discreet-buying/">人目を気にせず買う方法</a></section></aside></section>`;

  write(path.join(root, "area", prefecture.key, "index.html"), pageShell({
    title: `${prefecture.label}のお店・商業施設一覧｜まちリスト`,
    description: `${prefecture.label}のネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、飲食店を市区町村から探せます。`,
    canonical,
    depth,
    structuredData: itemList(`${prefecture.label}のお店・商業施設一覧`, canonical, prefShops),
    body
  }));
}

function areaIndex(area) {
  const items = shops.filter((shop) => shop.area_key === area.key);
  const depth = area.path.split("/").length + 2;
  const canonical = `${siteUrl}/area/${area.prefecture_key}/${area.path}/`;
  const body = `      <header class="page-header">
        <p class="eyebrow">${area.prefecture}</p>
        <h1>${area.label}のお店・商業施設一覧</h1>
        <p>${area.label}で探せる店舗をジャンル別に整理しています。${area.station}周辺、駐車場、夜まで営業、クーポンの有無を確認できます。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><a href="${home(depth)}area/${area.prefecture_key}/">${area.prefecture}</a><span>/</span><span>${area.label}</span></nav>
      </header>
      <section class="answer-box"><h2>${area.label}で探せるジャンル</h2><div class="category-grid">${genres.map((genre) => `<a class="category-card" href="./${genre.key}/"><span class="category-icon">${genre.label.slice(0, 1)}</span><strong>${genre.label}</strong><small>${genre.description}</small></a>`).join("")}</div></section>
      ${areaUseCasePanel(area, depth)}
      ${openingResearchPanel(area, depth)}
      <section class="two-column"><div>${topGenrePanel(area, depth)}<section class="section"><h2>${area.label}の店舗一覧</h2><div class="shop-list">${shopCards(items, depth)}</div></section></div><aside class="side-column"><section class="side-block"><h2>市区町村</h2>${areaLinks(area.prefecture_key, depth, area.key)}</section><section class="side-block"><h2>ジャンル別</h2>${genreLinks(area, depth)}</section></aside></section>`;

  write(path.join(root, "area", area.prefecture_key, ...area.path.split("/"), "index.html"), pageShell({
    title: `${area.label}のお店・商業施設一覧｜まちリスト`,
    description: `${area.label}のネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、飲食店を一覧で探せます。`,
    canonical,
    depth,
    structuredData: itemList(`${area.label}のお店・商業施設一覧`, canonical, items),
    body
  }));
}

function genrePage(area, genre) {
  const items = shops.filter((shop) => shop.area_key === area.key && shop.genre_key === genre.key);
  const depth = area.path.split("/").length + 3;
  const canonical = `${siteUrl}/area/${area.prefecture_key}/${area.path}/${genre.key}/`;
  const nearItems = shops.filter((shop) => shop.prefecture_key === area.prefecture_key && shop.genre_key === genre.key && shop.area_key !== area.key).slice(0, 5);
  const comparisonRows = items;
  const openingResearchExtra = genre.key === "opening-area-research" ? `\n      ${openingScorePanel(area)}\n      ${openingResearchTable(area)}` : "";
  const body = `      <header class="page-header">
        <p class="eyebrow">${area.label} / ${genre.label}</p>
        <h1>${area.label}の${genre.label}一覧</h1>
        <p>${area.label}で${genre.label}を探す方向けに、駅からの近さ、予算目安、駐車場、夜営業、クーポンの確認先をまとめています。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><a href="${home(depth)}area/${area.prefecture_key}/">${area.prefecture}</a><span>/</span><a href="../">${area.label}</a><span>/</span><span>${genre.label}</span></nav>
      </header>
      <section class="answer-box"><h2>このページで確認できること</h2><ul><li>${genre.description}</li><li>店舗名、住所、駅からの目安、予算、特徴を一覧で比較できます。</li><li>行く前に予約、クーポン、駐車場、周辺の飲食店を確認できます。</li></ul></section>
      <section class="monetization-strip"><div><p class="eyebrow">あわせて確認</p><h2>${supportHeading(genre)}</h2><p>${supportText(area, genre)}</p></div><div class="route-actions"><a class="button button-light" href="${supportPrimaryUrl(area, genre)}">${supportPrimaryLabel(genre)}</a><a class="button button-light" href="${supportSecondaryUrl(genre, area)}">${supportSecondaryLabel(genre)}</a></div></section>
      <section class="two-column"><div><section class="section"><h2>${area.label}の${genre.label}</h2><div class="shop-list">${shopCards(items, depth)}</div></section><section class="section"><h2>比較表</h2><table class="info-table"><tr><th>店舗</th><th>駅</th><th>予算</th><th>特徴</th></tr>${comparisonRows.map((shop) => `<tr><td>${escapeHtml(shop.name)}</td><td>${escapeHtml(shop.nearest_station)} 徒歩約${escapeHtml(shop.station_walk_minutes)}分</td><td>${escapeHtml(shop.budget_label)}</td><td>${[shop.parking ? "駐車場" : "", shop.late ? "夜まで" : "", shop.coupon ? "クーポン" : "", shop.smoking_area ? `喫煙: ${shop.smoking_area}` : "", shop.power_seat ? `電源: ${shop.power_seat}` : "", shop.wifi ? `Wi-Fi: ${shop.wifi}` : "", shop.eat_in ? `イートイン: ${shop.eat_in}` : ""].filter(Boolean).join(" / ") || "確認中"}</td></tr>`).join("")}</table></section>${relatedGenrePanel(area, genre, depth)}</div><aside class="side-column"><section class="side-block"><h2>同じエリア</h2>${genreLinks(area, depth)}</section><section class="side-block"><h2>近隣の${genre.label}</h2>${nearItems.map((shop) => `<a href="${toRelative(shop.url, depth)}">${shop.area_label} ${shop.name}</a>`).join("") || `<a href="${home(depth)}area/${area.prefecture_key}/">${area.prefecture}一覧を見る</a>`}</section>${subtleLinks(area, genre, depth)}</aside></section>
${openingResearchExtra}      <section class="section"><h2>よくある確認</h2><div class="faq-list"><article class="faq-item"><h3>${area.label}で${genre.label}を探す時の見方は？</h3><p>駅からの距離、駐車場、営業時間、予算目安を先に見ると選びやすくなります。</p></article><article class="faq-item"><h3>行く前に確認した方がよいことは？</h3><p>営業時間、料金、取扱内容、クーポン、駐車場は変わる場合があります。来店前に公式情報や地図情報も確認してください。</p></article></div></section>`;

  write(path.join(root, "area", area.prefecture_key, ...area.path.split("/"), genre.key, "index.html"), pageShell({
    title: `${area.label}の${genre.label}一覧｜まちリスト`,
    description: `${area.label}の${genre.label}を一覧で比較。駅からの近さ、予算、駐車場、夜営業、クーポンを確認できます。`,
    canonical,
    depth,
    structuredData: itemList(`${area.label}の${genre.label}一覧`, canonical, items),
    body
  }));
}

function categoryIndex() {
  const depth = 1;
  const canonical = `${siteUrl}/category/`;
  const body = `      <header class="page-header">
        <p class="eyebrow">ジャンル</p>
        <h1>ジャンルから探す</h1>
        <p>行きたい施設の種類を選んで、市区町村別の一覧へ進めます。</p>
      </header>
      <section class="answer-box"><h2>ジャンル一覧</h2><div class="category-grid">${genres.map((genre) => `<a id="${genre.key}" class="category-card" href="${genreLandingHref(genre, depth)}"><span class="category-icon">${genre.label.slice(0, 1)}</span><strong>${genre.label}</strong><small>${genre.description}</small></a>`).join("")}</div></section>
      <section class="section"><h2>都道府県</h2><div class="link-grid">${prefectures.map((pref) => `<a href="${home(depth)}area/${pref.key}/">${pref.label}</a>`).join("")}</div></section>`;

  write(path.join(root, "category", "index.html"), pageShell({
    title: "ジャンルから探す｜まちリスト",
    description: "ネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、飲食店をジャンルから探せます。",
    canonical,
    depth,
    body
  }));
}

function updateSitemap() {
  const urls = ["/", "/category/", "/shop/aichi-okazaki-akiba-shoten-okazaki-kita/", "/guide/discreet-buying/"];
  for (const pref of prefectures) {
    urls.push(`/area/${pref.key}/`);
  }
  for (const area of areas) {
    urls.push(`/area/${area.prefecture_key}/${area.path}/`);
    for (const genre of genres) {
      urls.push(`/area/${area.prefecture_key}/${area.path}/${genre.key}/`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].map((url) => `  <url><loc>${siteUrl}${url}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`;
  write(path.join(root, "sitemap.xml"), xml);
}

categoryIndex();
for (const pref of prefectures) {
  prefectureIndex(pref);
}
for (const area of areas) {
  areaIndex(area);
  for (const genre of genres) genrePage(area, genre);
}
updateSitemap();

console.log(`Generated ${prefectures.length} prefecture pages, ${areas.length} area pages and ${areas.length * genres.length} genre pages.`);
