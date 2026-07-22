const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const siteUrl = "https://machi-list.jp";
const today = "2026-07-23";

const shops = readJson("data/shops.json");
const areas = readJson("data/areas.json");
const genres = readJson("data/genres.json");

const prefectures = [
  { key: "aichi", label: "愛知県" },
  { key: "shizuoka", label: "静岡県" },
  { key: "gifu", label: "岐阜県" },
  { key: "mie", label: "三重県" },
  { key: "tokyo", label: "東京都" },
  { key: "osaka", label: "大阪府" },
  { key: "kyoto", label: "京都府" },
  { key: "kanagawa", label: "神奈川県" },
  { key: "hokkaido", label: "北海道" },
  { key: "miyagi", label: "宮城県" },
  { key: "hyogo", label: "兵庫県" },
  { key: "hiroshima", label: "広島県" },
  { key: "fukuoka", label: "福岡県" }
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

function bookingUrl(area, genre) {
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
    "video-box": "軽食 充電器 アメニティ"
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
  return `<section class="side-block subtle-links"><h2>行く前に確認</h2><a href="${bookingUrl(area, genre)}">予約できる店</a><a href="${couponUrl(genre)}">クーポンを探す</a><a href="${shoppingUrl(genre)}">${genre.key === "adult-shop" ? "通販を見る" : "関連アイテム"}</a><a href="${home(depth)}">条件を変えて探す</a></section>`;
}

function primaryActionLabel(shop) {
  if (shop.genre_key === "adult-shop") return "買い方";
  if (isEventGenre(shop.genre_key)) return "大会・イベント";
  if (shop.genre_key === "movie-theater") return "上映・チケット";
  if (shop.genre_key === "video-box") return "店舗を確認";
  return "予約";
}

function secondaryActionLabel(shop) {
  if (shop.genre_key === "adult-shop") return "通販";
  if (isEventGenre(shop.genre_key)) return "道具";
  if (shop.genre_key === "netcafe" || shop.genre_key === "video-box") return "軽食・備品";
  return "クーポン";
}

function supportHeading(genre) {
  if (isEventGenre(genre.key)) return "大会・イベント・道具";
  if (genre.key === "netcafe" || genre.key === "video-box") return "終電後の休憩・軽食・備品";
  if (genre.key === "movie-theater") return "上映・チケット・周辺情報";
  return "予約・クーポン・周辺情報";
}

function supportText(area, genre) {
  if (isEventGenre(genre.key)) return `${area.label}周辺で使える大会情報、練習先、道具、駐車場を必要な時に開けます。`;
  if (genre.key === "netcafe" || genre.key === "video-box") return `${area.label}周辺で終電後に休める店、シャワー、充電、軽食、備品を必要な時に確認できます。`;
  if (genre.key === "movie-theater") return `${area.label}周辺の上映時間、チケット、クーポン、駐車場を必要な時に開けます。`;
  return `${area.label}周辺で使える予約、クーポン、通販、駐車場を必要な時に開けます。`;
}

function supportPrimaryUrl(area, genre) {
  if (isEventGenre(genre.key)) return eventUrl(area, genre);
  if (genre.key === "netcafe" || genre.key === "video-box") return shoppingUrl(genre);
  return bookingUrl(area, genre);
}

function supportPrimaryLabel(genre) {
  if (isEventGenre(genre.key)) return "大会・イベント";
  if (genre.key === "netcafe" || genre.key === "video-box") return "軽食・備品";
  if (genre.key === "movie-theater") return "上映・チケット";
  return "予約できる店";
}

function supportSecondaryUrl(genre) {
  return isEventGenre(genre.key) ? shoppingUrl(genre) : couponUrl(genre);
}

function supportSecondaryLabel(genre) {
  if (isEventGenre(genre.key)) return "道具を探す";
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
    shop.coupon ? `<span class="badge">クーポン確認</span>` : ""
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
      <section class="two-column"><div><section class="section"><h2>${area.label}の店舗一覧</h2><div class="shop-list">${shopCards(items, depth)}</div></section></div><aside class="side-column"><section class="side-block"><h2>市区町村</h2>${areaLinks(area.prefecture_key, depth, area.key)}</section><section class="side-block"><h2>ジャンル別</h2>${genreLinks(area, depth)}</section></aside></section>`;

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
  const body = `      <header class="page-header">
        <p class="eyebrow">${area.label} / ${genre.label}</p>
        <h1>${area.label}の${genre.label}一覧</h1>
        <p>${area.label}で${genre.label}を探す方向けに、駅からの近さ、予算目安、駐車場、夜営業、クーポンの確認先をまとめています。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><a href="${home(depth)}area/${area.prefecture_key}/">${area.prefecture}</a><span>/</span><a href="../">${area.label}</a><span>/</span><span>${genre.label}</span></nav>
      </header>
      <section class="answer-box"><h2>このページで確認できること</h2><ul><li>${genre.description}</li><li>店舗名、住所、駅からの目安、予算、特徴を一覧で比較できます。</li><li>行く前に予約、クーポン、駐車場、周辺の飲食店を確認できます。</li></ul></section>
      <section class="monetization-strip"><div><p class="eyebrow">あわせて確認</p><h2>${supportHeading(genre)}</h2><p>${supportText(area, genre)}</p></div><div class="route-actions"><a class="button button-light" href="${supportPrimaryUrl(area, genre)}">${supportPrimaryLabel(genre)}</a><a class="button button-light" href="${supportSecondaryUrl(genre)}">${supportSecondaryLabel(genre)}</a></div></section>
      <section class="two-column"><div><section class="section"><h2>${area.label}の${genre.label}</h2><div class="shop-list">${shopCards(items, depth)}</div></section><section class="section"><h2>比較表</h2><table class="info-table"><tr><th>店舗</th><th>駅</th><th>予算</th><th>特徴</th></tr>${comparisonRows.map((shop) => `<tr><td>${escapeHtml(shop.name)}</td><td>${escapeHtml(shop.nearest_station)} 徒歩約${escapeHtml(shop.station_walk_minutes)}分</td><td>${escapeHtml(shop.budget_label)}</td><td>${[shop.parking ? "駐車場" : "", shop.late ? "夜まで" : "", shop.coupon ? "クーポン" : ""].filter(Boolean).join(" / ") || "確認中"}</td></tr>`).join("")}</table></section></div><aside class="side-column"><section class="side-block"><h2>同じエリア</h2>${genreLinks(area, depth)}</section><section class="side-block"><h2>近隣の${genre.label}</h2>${nearItems.map((shop) => `<a href="${toRelative(shop.url, depth)}">${shop.area_label} ${shop.name}</a>`).join("") || `<a href="${home(depth)}area/${area.prefecture_key}/">${area.prefecture}一覧を見る</a>`}</section>${subtleLinks(area, genre, depth)}</aside></section>
      <section class="section"><h2>よくある確認</h2><div class="faq-list"><article class="faq-item"><h3>${area.label}で${genre.label}を探す時の見方は？</h3><p>駅からの距離、駐車場、営業時間、予算目安を先に見ると選びやすくなります。</p></article><article class="faq-item"><h3>行く前に確認した方がよいことは？</h3><p>営業時間、料金、取扱内容、クーポン、駐車場は変わる場合があります。来店前に公式情報や地図情報も確認してください。</p></article></div></section>`;

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
