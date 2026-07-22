const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shops = JSON.parse(fs.readFileSync(path.join(root, "data", "shops.json"), "utf8"));
const siteUrl = "https://machi-list.jp";

const areas = [
  { key: "nagoya-nakamura", path: "nagoya/nakamura", label: "名古屋市中村区", station: "名古屋駅", parent: "名古屋市" },
  { key: "nagoya-naka", path: "nagoya/naka", label: "名古屋市中区", station: "栄駅・伏見駅", parent: "名古屋市" },
  { key: "toyota", path: "toyota", label: "豊田市", station: "豊田市駅・土橋駅", parent: "" },
  { key: "okazaki", path: "okazaki", label: "岡崎市", station: "岡崎駅・北岡崎駅", parent: "" },
  { key: "obu", path: "obu", label: "大府市", station: "大府駅", parent: "" },
  { key: "owariasahi", path: "owariasahi", label: "尾張旭市", station: "尾張旭駅", parent: "" }
];

const genres = [
  { key: "netcafe", label: "ネットカフェ", description: "個室、シャワー、ナイトパック、駐車場の有無を見比べたい方向けです。" },
  { key: "game-center", label: "ゲームセンター", description: "駅近、商業施設内、クレーンゲーム、夜の立ち寄りやすさを確認できます。" },
  { key: "adult-shop", label: "アダルトショップ", description: "人目を気にせず買いやすい店舗、駐車場、営業時間、通販の選択肢を確認できます。" },
  { key: "karaoke", label: "カラオケ", description: "駅近、夜まで営業、クーポン、周辺飲食店との組み合わせを見られます。" },
  { key: "sauna", label: "サウナ", description: "料金目安、駅からの近さ、駐車場、サウナ後の周辺施設を確認できます。" }
];

const commonCss = (depth) => `${"../".repeat(depth)}assets/styles.css`;
const home = (depth) => `${"../".repeat(depth)}`;
const today = "2026-07-22";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function write(file, content) {
  mkdirFor(file);
  fs.writeFileSync(file, content, "utf8");
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
    <link rel="stylesheet" href="${commonCss(depth)}">
    ${structuredData}
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${home(depth)}"><span class="brand-mark">M</span><span><strong>まちリスト</strong><small>市町村とジャンルで探す店舗一覧</small></span></a>
      <nav class="nav"><a href="${home(depth)}">トップ</a><a href="${home(depth)}category/">ジャンル</a><a href="${home(depth)}area/aichi/">愛知県</a></nav>
    </header>
    <main>
${body}
    </main>
    <footer class="site-footer"><p>© 2026 まちリスト</p><p><a href="${home(depth)}llms.txt">llms.txt</a></p></footer>
  </body>
</html>
`;
}

function shopCards(items, depth) {
  if (!items.length) {
    return `<article class="shop-card"><div><h3>掲載準備中です</h3><p>近隣エリアの店舗や、予約・クーポン・通販の確認先を掲載しています。店舗情報が確認でき次第、一覧に追加します。</p></div><div class="shop-actions"><a class="button" href="${home(depth)}">条件を変えて探す</a></div></article>`;
  }
  return items.map((shop) => `
              <article class="shop-card">
                <div>
                  <h3><a href="${toRelative(shop.url, depth)}">${escapeHtml(shop.name)}</a></h3>
                  <p>${escapeHtml(shop.address)} / ${escapeHtml(shop.nearest_station)}から徒歩約${shop.station_walk_minutes}分</p>
                  <div class="badges">
                    <span class="badge">${escapeHtml(shop.hours)}</span>
                    ${shop.parking ? `<span class="badge">駐車場あり</span>` : ""}
                    ${shop.late ? `<span class="badge">夜まで営業</span>` : ""}
                    ${shop.coupon ? `<span class="badge">クーポンあり</span>` : ""}
                  </div>
                </div>
                <div class="shop-actions">
                  <a class="button" href="${toRelative(shop.url, depth)}">詳細</a>
                  <a class="button button-light" href="${mapUrl(shop)}">地図</a>
                </div>
              </article>`).join("");
}

function toRelative(url, depth) {
  if (url.startsWith("http")) return url;
  return `${home(depth)}${url.replace(/^\//, "")}`;
}

function mapUrl(shop) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name} ${shop.address}`)}`;
}

function hotpepperUrl(area, genre) {
  return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=YOUR_VC_SID&pid=YOUR_VC_PID&vc_url=${encodeURIComponent(`https://www.hotpepper.jp/SA33/?keyword=${area.label} ${genre.label}`)}`;
}

function rakutenUrl(genre) {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${genre.label} クーポン`)}/`;
}

function directoryLinks(depth, currentAreaKey = "") {
  return areas.map((area) => `<a href="${home(depth)}area/aichi/${area.path}/"${area.key === currentAreaKey ? ` aria-current="page"` : ""}>${area.label}</a>`).join("");
}

function genreLinks(depth, area) {
  return genres.map((genre) => `<a href="${home(depth)}area/aichi/${area.path}/${genre.key}/">${area.label}の${genre.label}</a>`).join("");
}

function makeItemList(name, canonical, items) {
  const elements = items.map((shop, index) => `{"@type":"ListItem","position":${index + 1},"url":"${siteUrl}${shop.url}"}`).join(",");
  return `<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":"${name}","url":"${canonical}","itemListElement":[${elements}]}</script>`;
}

function areaIndex(area) {
  const items = shops.filter((shop) => shop.area_key === area.key);
  const depth = area.path.split("/").length + 2;
  const urlPath = `/area/aichi/${area.path}/`;
  const canonical = `${siteUrl}${urlPath}`;
  const body = `      <header class="page-header">
        <p class="eyebrow">愛知県</p>
        <h1>${area.label}のお店・商業施設一覧</h1>
        <p>${area.label}で探せる店舗をジャンル別に整理しています。${area.station}周辺、駐車場、夜まで営業、クーポンの有無を確認できます。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><a href="${home(depth)}area/aichi/">愛知県</a><span>/</span><span>${area.label}</span></nav>
      </header>
      <section class="answer-box"><h2>${area.label}で探せるジャンル</h2><div class="category-grid">${genres.map((genre) => `<a class="category-card" href="./${genre.key}/"><span class="category-icon">${genre.label.slice(0, 1)}</span><strong>${genre.label}</strong><small>${genre.description}</small></a>`).join("")}</div></section>
      <section class="two-column"><div><section class="section"><h2>${area.label}の店舗一覧</h2><div class="shop-list">${shopCards(items, depth)}</div></section></div><aside class="side-column"><section class="side-block"><h2>市区町村</h2>${directoryLinks(depth, area.key)}</section><section class="side-block"><h2>ジャンル別</h2>${genreLinks(depth, area)}</section></aside></section>`;
  write(path.join(root, "area", "aichi", ...area.path.split("/"), "index.html"), pageShell({
    title: `${area.label}のお店・商業施設一覧｜まちリスト`,
    description: `${area.label}のネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナを一覧で探せます。`,
    canonical,
    depth,
    structuredData: makeItemList(`${area.label}のお店・商業施設一覧`, canonical, items),
    body
  }));
}

function genrePage(area, genre) {
  const items = shops.filter((shop) => shop.area_key === area.key && shop.genre_key === genre.key);
  const depth = area.path.split("/").length + 3;
  const urlPath = `/area/aichi/${area.path}/${genre.key}/`;
  const canonical = `${siteUrl}${urlPath}`;
  const nearItems = shops.filter((shop) => shop.genre_key === genre.key && shop.area_key !== area.key).slice(0, 4);
  const comparisonRows = items.length ? items : nearItems;
  const body = `      <header class="page-header">
        <p class="eyebrow">${area.label} / ${genre.label}</p>
        <h1>${area.label}の${genre.label}一覧</h1>
        <p>${area.label}で${genre.label}を探す方向けに、駅からの近さ、予算目安、駐車場、夜まで営業、クーポンの確認先をまとめています。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><a href="${home(depth)}area/aichi/">愛知県</a><span>/</span><a href="../">${area.label}</a><span>/</span><span>${genre.label}</span></nav>
      </header>
      <section class="answer-box"><h2>このページの見方</h2><ul><li>${genre.description}</li><li>一覧は店舗名、住所、駅からの目安、営業時間、条件で比較できます。</li><li>行く前に予約、クーポン、駐車場、周辺の飲食店も確認できます。</li></ul></section>
      <section class="monetization-strip"><div><p class="eyebrow">あわせて確認</p><h2>予約・クーポン・周辺情報を確認</h2><p>${area.label}周辺で使える予約先、クーポン、通販、駐車場をまとめて開けます。</p></div><div class="route-actions"><a class="button" href="${hotpepperUrl(area, genre)}">予約できるお店</a><a class="button button-light" href="${rakutenUrl(genre)}">クーポンを探す</a></div></section>
      <section class="two-column"><div><section class="section"><h2>${area.label}の${genre.label}</h2><div class="shop-list">${shopCards(items, depth)}</div></section><section class="section"><h2>比較表</h2><table class="info-table"><tr><th>店舗</th><th>駅</th><th>予算</th><th>特徴</th></tr>${comparisonRows.map((shop) => `<tr><td>${escapeHtml(shop.name)}</td><td>${escapeHtml(shop.nearest_station)} 徒歩約${shop.station_walk_minutes}分</td><td>${escapeHtml(shop.budget_label)}</td><td>${[shop.parking ? "駐車場" : "", shop.late ? "夜まで" : "", shop.coupon ? "クーポン" : ""].filter(Boolean).join(" / ") || "確認中"}</td></tr>`).join("")}</table></section></div><aside class="side-column"><section class="side-block"><h2>同じエリア</h2>${genreLinks(depth, area)}</section><section class="side-block"><h2>近隣の${genre.label}</h2>${nearItems.map((shop) => `<a href="${toRelative(shop.url, depth)}">${shop.area_label} ${shop.name}</a>`).join("") || `<a href="${home(depth)}area/aichi/">愛知県一覧を見る</a>`}</section></aside></section>
      <section class="section"><h2>よくある確認</h2><div class="faq-list"><article class="faq-item"><h3>${area.label}で${genre.label}を探す時の見方は？</h3><p>駅からの距離、駐車場、営業時間、予算目安を先に見ると選びやすくなります。</p></article><article class="faq-item"><h3>行く前に確認した方がよいことは？</h3><p>営業時間、料金、取扱内容、クーポン、駐車場は変わる場合があります。来店前に公式情報や地図情報も確認してください。</p></article></div></section>`;
  write(path.join(root, "area", "aichi", ...area.path.split("/"), genre.key, "index.html"), pageShell({
    title: `${area.label}の${genre.label}一覧｜まちリスト`,
    description: `${area.label}の${genre.label}を一覧で比較。駅からの近さ、予算、駐車場、夜まで営業、クーポンを確認できます。`,
    canonical,
    depth,
    structuredData: makeItemList(`${area.label}の${genre.label}一覧`, canonical, items),
    body
  }));
}

function aichiIndex() {
  const depth = 2;
  const canonical = `${siteUrl}/area/aichi/`;
  const body = `      <header class="page-header">
        <p class="eyebrow">愛知県</p>
        <h1>愛知県のお店・商業施設一覧</h1>
        <p>愛知県の主要市区町村から、ネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナを探せます。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><span>愛知県</span></nav>
      </header>
      <section class="answer-box"><h2>市区町村から探す</h2><div class="category-grid">${areas.map((area) => `<a class="category-card" href="./${area.path}/"><span class="category-icon">${area.label.slice(0, 1)}</span><strong>${area.label}</strong><small>${area.station}周辺の店舗を確認</small></a>`).join("")}</div></section>
      <section class="two-column"><div><section class="section"><h2>愛知県の掲載店舗</h2><div class="shop-list">${shopCards(shops, depth)}</div></section></div><aside class="side-column"><section class="side-block"><h2>ジャンル</h2>${genres.map((genre) => `<a href="${home(depth)}category/#${genre.key}">${genre.label}</a>`).join("")}</section><section class="side-block"><h2>確認できること</h2><a href="${home(depth)}">近い順で探す</a><a href="${home(depth)}">予算の安い順で探す</a><a href="${home(depth)}guide/discreet-buying/">人目を気にせず買う方法</a></section></aside></section>`;
  write(path.join(root, "area", "aichi", "index.html"), pageShell({
    title: "愛知県のお店・商業施設一覧｜まちリスト",
    description: "愛知県のネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナを市区町村から探せます。",
    canonical,
    depth,
    structuredData: makeItemList("愛知県のお店・商業施設一覧", canonical, shops),
    body
  }));
}

function updateSitemap() {
  const urls = ["/", "/category/", "/area/aichi/", "/shop/aichi-okazaki-akiba-shoten-okazaki-kita/", "/guide/discreet-buying/"];
  for (const area of areas) {
    urls.push(`/area/aichi/${area.path}/`);
    for (const genre of genres) urls.push(`/area/aichi/${area.path}/${genre.key}/`);
  }
  const unique = [...new Set(urls)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((url) => `  <url><loc>${siteUrl}${url}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`;
  write(path.join(root, "sitemap.xml"), xml);
}

aichiIndex();
for (const area of areas) {
  areaIndex(area);
  for (const genre of genres) genrePage(area, genre);
}
updateSitemap();

console.log(`Generated ${areas.length} area pages and ${areas.length * genres.length} genre pages.`);
