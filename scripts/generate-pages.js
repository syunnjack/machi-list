const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shops = JSON.parse(fs.readFileSync(path.join(root, "data", "shops.json"), "utf8"));
const siteUrl = "https://machi-list.jp";
const today = "2026-07-22";

const areas = [
  { key: "nagoya-chikusa", path: "nagoya/chikusa", label: "名古屋市千種区", station: "今池駅・千種駅", parent: "名古屋市" },
  { key: "nagoya-higashi", path: "nagoya/higashi", label: "名古屋市東区", station: "大曽根駅・高岳駅", parent: "名古屋市" },
  { key: "nagoya-kita", path: "nagoya/kita", label: "名古屋市北区", station: "黒川駅・平安通駅", parent: "名古屋市" },
  { key: "nagoya-nishi", path: "nagoya/nishi", label: "名古屋市西区", station: "上小田井駅・浄心駅", parent: "名古屋市" },
  { key: "nagoya-nakamura", path: "nagoya/nakamura", label: "名古屋市中村区", station: "名古屋駅", parent: "名古屋市" },
  { key: "nagoya-naka", path: "nagoya/naka", label: "名古屋市中区", station: "栄駅・伏見駅", parent: "名古屋市" },
  { key: "nagoya-showa", path: "nagoya/showa", label: "名古屋市昭和区", station: "御器所駅・八事駅", parent: "名古屋市" },
  { key: "nagoya-mizuho", path: "nagoya/mizuho", label: "名古屋市瑞穂区", station: "新瑞橋駅・瑞穂区役所駅", parent: "名古屋市" },
  { key: "nagoya-atsuta", path: "nagoya/atsuta", label: "名古屋市熱田区", station: "金山駅・熱田神宮西駅", parent: "名古屋市" },
  { key: "nagoya-nakagawa", path: "nagoya/nakagawa", label: "名古屋市中川区", station: "高畑駅・尾頭橋駅", parent: "名古屋市" },
  { key: "nagoya-minato", path: "nagoya/minato", label: "名古屋市港区", station: "港区役所駅・荒子川公園駅", parent: "名古屋市" },
  { key: "nagoya-minami", path: "nagoya/minami", label: "名古屋市南区", station: "笠寺駅・新瑞橋駅", parent: "名古屋市" },
  { key: "nagoya-moriyama", path: "nagoya/moriyama", label: "名古屋市守山区", station: "新守山駅・小幡駅", parent: "名古屋市" },
  { key: "nagoya-midori", path: "nagoya/midori", label: "名古屋市緑区", station: "徳重駅・南大高駅", parent: "名古屋市" },
  { key: "nagoya-meito", path: "nagoya/meito", label: "名古屋市名東区", station: "藤が丘駅・一社駅", parent: "名古屋市" },
  { key: "nagoya-tempaku", path: "nagoya/tempaku", label: "名古屋市天白区", station: "植田駅・塩釜口駅", parent: "名古屋市" },
  { key: "toyota", path: "toyota", label: "豊田市", station: "豊田市駅・土橋駅", parent: "" },
  { key: "okazaki", path: "okazaki", label: "岡崎市", station: "岡崎駅・東岡崎駅", parent: "" },
  { key: "obu", path: "obu", label: "大府市", station: "大府駅", parent: "" },
  { key: "anjo", path: "anjo", label: "安城市", station: "三河安城駅・安城駅", parent: "" },
  { key: "kariya", path: "kariya", label: "刈谷市", station: "刈谷駅・逢妻駅", parent: "" },
  { key: "owariasahi", path: "owariasahi", label: "尾張旭市", station: "尾張旭駅", parent: "" }
];

const genres = [
  { key: "netcafe", label: "ネットカフェ", description: "個室、シャワー、ナイトパック、駐車場の有無を比べられます。" },
  { key: "game-center", label: "ゲームセンター", description: "駅近、商業施設内、クレーンゲーム、夜の立ち寄りやすさを確認できます。" },
  { key: "adult-shop", label: "アダルトショップ", description: "人目を気にせず買いやすい店舗、駐車場、営業時間、通販の選択肢を確認できます。" },
  { key: "karaoke", label: "カラオケ", description: "駅近、夜まで営業、クーポン、周辺飲食店との組み合わせを見られます。" },
  { key: "sauna", label: "サウナ", description: "料金目安、駅からの近さ、駐車場、サウナ後の周辺施設を確認できます。" },
  { key: "spa", label: "スーパー銭湯・SPA・岩盤浴", description: "大浴場、露天風呂、岩盤浴、食事処、駐車場、料金目安をまとめて確認できます。" },
  { key: "restaurant", label: "飲食店・居酒屋", description: "駅近、夜営業、予算目安、予約やクーポンの確認がしやすい店をまとめています。" }
];

const commonCss = (depth) => `${"../".repeat(depth)}assets/styles.css`;
const home = (depth) => `${"../".repeat(depth)}`;
const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const toRelative = (url, depth) => url.startsWith("http") ? url : `${home(depth)}${url.replace(/^\//, "")}`;
const mapUrl = (shop) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name} ${shop.address}`)}`;
const vc = (target) => `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=YOUR_VC_SID&pid=YOUR_VC_PID&vc_url=${encodeURIComponent(target)}`;
const hotpepperUrl = (area, genre) => vc(`https://www.hotpepper.jp/SA33/?keyword=${area.label} ${genre.label}`);
const rakutenUrl = (genre) => `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${genre.label} クーポン`)}/`;

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function shell({ title, description, canonical, depth, body, structuredData = "" }) {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${canonical}">
    <link rel="stylesheet" href="${commonCss(depth)}">
    ${structuredData}
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${home(depth)}"><span class="brand-mark">M</span><span><strong>まちリスト</strong><small>市区町村とジャンルで探す店舗一覧</small></span></a>
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
    return `<article class="shop-card"><div><h3>掲載準備中です</h3><p>近隣エリアの店舗や、予約・クーポン・通販の確認先を順次追加しています。</p></div><div class="shop-actions"><a class="button" href="${home(depth)}">条件を変えて探す</a></div></article>`;
  }
  return items.map((shop) => `
              <article class="shop-card">
                <div>
                  <h3><a href="${toRelative(shop.url, depth)}">${esc(shop.name)}</a></h3>
                  <p>${esc(shop.address)} / ${esc(shop.nearest_station)}から徒歩約${esc(shop.station_walk_minutes)}分</p>
                  <div class="badges">
                    <span class="badge">${esc(shop.hours)}</span>
                    ${shop.parking ? `<span class="badge">駐車場あり</span>` : ""}
                    ${shop.late ? `<span class="badge">夜まで営業</span>` : ""}
                    ${shop.coupon ? `<span class="badge">クーポン確認</span>` : ""}
                  </div>
                </div>
                <div class="shop-actions">
                  <a class="button" href="${toRelative(shop.url, depth)}">詳細</a>
                  <a class="button button-light" href="${mapUrl(shop)}">地図</a>
                </div>
              </article>`).join("");
}

function itemList(name, canonical, items) {
  const elements = items.map((shop, index) => `{"@type":"ListItem","position":${index + 1},"url":"${siteUrl}${shop.url}"}`).join(",");
  return `<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":"${esc(name)}","url":"${canonical}","itemListElement":[${elements}]}</script>`;
}

function areaLinks(depth, current = "") {
  return areas.map((area) => `<a href="${home(depth)}area/aichi/${area.path}/"${area.key === current ? ` aria-current="page"` : ""}>${area.label}</a>`).join("");
}

function genreLinks(depth, area) {
  return genres.map((genre) => `<a href="${home(depth)}area/aichi/${area.path}/${genre.key}/">${area.label}の${genre.label}</a>`).join("");
}

function areaIndex(area) {
  const items = shops.filter((shop) => shop.area_key === area.key);
  const depth = area.path.split("/").length + 2;
  const canonical = `${siteUrl}/area/aichi/${area.path}/`;
  const body = `      <header class="page-header">
        <p class="eyebrow">愛知県</p>
        <h1>${area.label}のお店・商業施設一覧</h1>
        <p>${area.label}で探せる店舗をジャンル別に整理しています。${area.station}周辺、駐車場、夜まで営業、クーポンの有無を確認できます。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><a href="${home(depth)}area/aichi/">愛知県</a><span>/</span><span>${area.label}</span></nav>
      </header>
      <section class="answer-box"><h2>${area.label}で探せるジャンル</h2><div class="category-grid">${genres.map((genre) => `<a class="category-card" href="./${genre.key}/"><span class="category-icon">${genre.label.slice(0, 1)}</span><strong>${genre.label}</strong><small>${genre.description}</small></a>`).join("")}</div></section>
      <section class="two-column"><div><section class="section"><h2>${area.label}の店舗一覧</h2><div class="shop-list">${shopCards(items, depth)}</div></section></div><aside class="side-column"><section class="side-block"><h2>市区町村</h2>${areaLinks(depth, area.key)}</section><section class="side-block"><h2>ジャンル別</h2>${genreLinks(depth, area)}</section></aside></section>`;
  write(path.join(root, "area", "aichi", ...area.path.split("/"), "index.html"), shell({
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
  const canonical = `${siteUrl}/area/aichi/${area.path}/${genre.key}/`;
  const nearItems = shops.filter((shop) => shop.genre_key === genre.key && shop.area_key !== area.key).slice(0, 5);
  const comparisonRows = items.length ? items : nearItems;
  const body = `      <header class="page-header">
        <p class="eyebrow">${area.label} / ${genre.label}</p>
        <h1>${area.label}の${genre.label}一覧</h1>
        <p>${area.label}で${genre.label}を探す方向けに、駅からの近さ、予算目安、駐車場、夜営業、クーポンの確認先をまとめています。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><a href="${home(depth)}area/aichi/">愛知県</a><span>/</span><a href="../">${area.label}</a><span>/</span><span>${genre.label}</span></nav>
      </header>
      <section class="answer-box"><h2>このページで確認できること</h2><ul><li>${genre.description}</li><li>店舗名、住所、駅からの目安、予算、特徴を一覧で比較できます。</li><li>行く前に予約、クーポン、駐車場、周辺の飲食店を確認できます。</li></ul></section>
      <section class="monetization-strip"><div><p class="eyebrow">あわせて確認</p><h2>予約・クーポン・周辺情報</h2><p>${area.label}周辺で使える予約、クーポン、通販、駐車場を必要な時に開けます。</p></div><div class="route-actions"><a class="button" href="${hotpepperUrl(area, genre)}">予約できる店</a><a class="button button-light" href="${rakutenUrl(genre)}">クーポンを探す</a></div></section>
      <section class="two-column"><div><section class="section"><h2>${area.label}の${genre.label}</h2><div class="shop-list">${shopCards(items, depth)}</div></section><section class="section"><h2>比較表</h2><table class="info-table"><tr><th>店舗</th><th>駅</th><th>予算</th><th>特徴</th></tr>${comparisonRows.map((shop) => `<tr><td>${esc(shop.name)}</td><td>${esc(shop.nearest_station)} 徒歩約${esc(shop.station_walk_minutes)}分</td><td>${esc(shop.budget_label)}</td><td>${[shop.parking ? "駐車場" : "", shop.late ? "夜まで" : "", shop.coupon ? "クーポン" : ""].filter(Boolean).join(" / ") || "確認中"}</td></tr>`).join("")}</table></section></div><aside class="side-column"><section class="side-block"><h2>同じエリア</h2>${genreLinks(depth, area)}</section><section class="side-block"><h2>近隣の${genre.label}</h2>${nearItems.map((shop) => `<a href="${toRelative(shop.url, depth)}">${shop.area_label} ${shop.name}</a>`).join("") || `<a href="${home(depth)}area/aichi/">愛知県一覧を見る</a>`}</section></aside></section>
      <section class="section"><h2>よくある確認</h2><div class="faq-list"><article class="faq-item"><h3>${area.label}で${genre.label}を探す時の見方は？</h3><p>駅からの距離、駐車場、営業時間、予算目安を先に見ると選びやすくなります。</p></article><article class="faq-item"><h3>行く前に確認した方がよいことは？</h3><p>営業時間、料金、取扱内容、クーポン、駐車場は変わる場合があります。来店前に公式情報や地図情報も確認してください。</p></article></div></section>`;
  write(path.join(root, "area", "aichi", ...area.path.split("/"), genre.key, "index.html"), shell({
    title: `${area.label}の${genre.label}一覧｜まちリスト`,
    description: `${area.label}の${genre.label}を一覧で比較。駅からの近さ、予算、駐車場、夜営業、クーポンを確認できます。`,
    canonical,
    depth,
    structuredData: itemList(`${area.label}の${genre.label}一覧`, canonical, items),
    body
  }));
}

function aichiIndex() {
  const depth = 2;
  const canonical = `${siteUrl}/area/aichi/`;
  const body = `      <header class="page-header">
        <p class="eyebrow">愛知県</p>
        <h1>愛知県のお店・商業施設一覧</h1>
        <p>愛知県の主要市区町村から、ネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、飲食店を探せます。</p>
        <nav class="breadcrumb"><a href="${home(depth)}">全国</a><span>/</span><span>愛知県</span></nav>
      </header>
      <section class="answer-box"><h2>市区町村から探す</h2><div class="category-grid">${areas.map((area) => `<a class="category-card" href="./${area.path}/"><span class="category-icon">${area.label.slice(0, 1)}</span><strong>${area.label}</strong><small>${area.station}周辺の店舗を確認</small></a>`).join("")}</div></section>
      <section class="two-column"><div><section class="section"><h2>愛知県の掲載店舗</h2><div class="shop-list">${shopCards(shops, depth)}</div></section></div><aside class="side-column"><section class="side-block"><h2>ジャンル</h2>${genres.map((genre) => `<a href="${home(depth)}category/#${genre.key}">${genre.label}</a>`).join("")}</section><section class="side-block"><h2>確認できること</h2><a href="${home(depth)}">近い順で探す</a><a href="${home(depth)}">予算の安い順で探す</a><a href="${home(depth)}guide/discreet-buying/">人目を気にせず買う方法</a></section></aside></section>`;
  write(path.join(root, "area", "aichi", "index.html"), shell({
    title: "愛知県のお店・商業施設一覧｜まちリスト",
    description: "愛知県のネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、飲食店を市区町村から探せます。",
    canonical,
    depth,
    structuredData: itemList("愛知県のお店・商業施設一覧", canonical, shops),
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
      <section class="answer-box"><h2>ジャンル一覧</h2><div class="category-grid">${genres.map((genre) => `<a id="${genre.key}" class="category-card" href="${home(depth)}area/aichi/okazaki/${genre.key}/"><span class="category-icon">${genre.label.slice(0, 1)}</span><strong>${genre.label}</strong><small>${genre.description}</small></a>`).join("")}</div></section>
      <section class="section"><h2>愛知県の市区町村</h2><div class="link-grid">${areas.map((area) => `<a href="${home(depth)}area/aichi/${area.path}/">${area.label}</a>`).join("")}</div></section>`;
  write(path.join(root, "category", "index.html"), shell({
    title: "ジャンルから探す｜まちリスト",
    description: "ネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、飲食店をジャンルから探せます。",
    canonical,
    depth,
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
  write(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((url) => `  <url><loc>${siteUrl}${url}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
}

aichiIndex();
categoryIndex();
for (const area of areas) {
  areaIndex(area);
  for (const genre of genres) genrePage(area, genre);
}
updateSitemap();

console.log(`Generated ${areas.length} area pages and ${areas.length * genres.length} genre pages.`);
