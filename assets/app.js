const valueCommerce = {
  sid: "YOUR_VC_SID",
  pid: "YOUR_VC_PID",
  redirectBase: "https://ck.jp.ap.valuecommerce.com/servlet/referral"
};

const text = {
  allCount: "件を表示しています。",
  noResultTitle: "条件に合うお店がありません",
  noResultBody: "エリア、店ジャンル、条件を少し広げて探してみてください。",
  headers: ["店舗", "エリア", "距離", "予算", "特徴", "操作"],
  detail: "詳細",
  booking: "予約",
  guide: "買い方",
  related: "関連商品",
  supplies: "軽食・備品",
  online: "通販",
  event: "大会・イベント",
  tools: "道具",
  member: "会員・カード",
  fee: "料金・定期利用",
  consult: "相談先を確認",
  compare: "比較",
  ticket: "上映・チケット",
  stock: "在庫・商品",
  map: "地図",
  route: "ルート",
  parking: "駐車場",
  late: "夜まで",
  coupon: "クーポン",
  smoking: "喫煙",
  power: "電源",
  wifi: "Wi-Fi",
  eatIn: "イートイン",
  walk: "徒歩約",
  minutes: "分",
  unknown: "確認中"
};

const areaPositions = {
  "nagoya-chikusa": { x: 43, y: 43 },
  "nagoya-higashi": { x: 42, y: 42 },
  "nagoya-kita": { x: 39, y: 39 },
  "nagoya-nishi": { x: 34, y: 42 },
  "nagoya-nakamura": { x: 36, y: 44 },
  "nagoya-naka": { x: 40, y: 48 },
  "nagoya-showa": { x: 42, y: 52 },
  "nagoya-mizuho": { x: 44, y: 55 },
  "nagoya-atsuta": { x: 41, y: 57 },
  "nagoya-nakagawa": { x: 34, y: 55 },
  "nagoya-minato": { x: 33, y: 62 },
  "nagoya-minami": { x: 43, y: 61 },
  "nagoya-moriyama": { x: 50, y: 38 },
  "nagoya-midori": { x: 47, y: 64 },
  "nagoya-meito": { x: 50, y: 47 },
  "nagoya-tempaku": { x: 47, y: 52 },
  toyota: { x: 72, y: 50 },
  okazaki: { x: 64, y: 66 },
  obu: { x: 45, y: 62 },
  anjo: { x: 58, y: 70 },
  kariya: { x: 52, y: 66 },
  owariasahi: { x: 52, y: 38 }
};

const defaultOrigin = {
  label: "名古屋駅",
  lat: 35.170915,
  lng: 136.881537,
  fallback: true
};

let facilities = [];
let areas = [];
let genres = [];
let currentOrigin = defaultOrigin;
let selectedFacilityIndex = null;

const resultEl = document.querySelector("#shopResults");
const metaEl = document.querySelector("#resultMeta");
const mapPinsEl = document.querySelector("#mapPins");
const routeSummaryEl = document.querySelector("#routeSummary");
const routePanelEl = document.querySelector("#routePanel");
const areaSelect = document.querySelector("#areaSelect");
const genreSelect = document.querySelector("#genreSelect");
const sortSelect = document.querySelector("#sortSelect");
const searchButton = document.querySelector("#searchButton");
const filterEls = Array.from(document.querySelectorAll(".filter"));

function vcLink(targetUrl) {
  return `${valueCommerce.redirectBase}?sid=${valueCommerce.sid}&pid=${valueCommerce.pid}&vc_url=${encodeURIComponent(targetUrl)}`;
}

function rakutenSearchLink(keyword) {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
}

function searchLink(keyword) {
  return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
}

function timesParkingLink(areaLabel) {
  return vcLink(`https://btimes.jp/search/?keyword=${encodeURIComponent(areaLabel)}`);
}

function timesMemberLink() {
  return vcLink("https://btimes.jp/about/");
}

function searchLinkForArea(areaLabel, keyword) {
  return searchLink(`${areaLabel} ${keyword}`);
}

const eventGenreKeys = new Set(["darts", "bowling", "billiards"]);

function isEventGenre(genreKey) {
  return eventGenreKeys.has(genreKey);
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
    "parking-lot": "タイムズカード ETC 車載 便利グッズ",
    "bicycle-parking": "自転車 鍵 レインカバー ライト",
    "parking-management": "駐車場 看板 防犯カメラ 照明",
    "vending-machine": "飲料 まとめ買い 防災備蓄",
    "vending-machine-installation": "自販機 防犯カメラ 屋外照明",
    "office-tenant": "店舗 開業 備品 オフィス家具",
    "opening-area-research": "店舗 看板 チラシ 防犯カメラ"
  }[genreKey] || `${label} 関連商品`;
}

function eventSearchLink(areaLabel, genreLabel) {
  return vcLink(`https://www.asoview.com/search/?keyword=${encodeURIComponent(`${areaLabel} ${genreLabel} プロチャレンジ イベント`)}`);
}

function mapSearchLink(keyword) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}`;
}

function routeLink(facility, origin = currentOrigin) {
  const destination = facility.lat && facility.lng ? `${facility.lat},${facility.lng}` : `${facility.name} ${facility.address}`;
  const originParam = origin?.fallback ? "" : `&origin=${origin.lat},${origin.lng}`;
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

function normalizeShop(shop, index) {
  const isAdult = shop.genre_key === "adult-shop";
  const isEvent = isEventGenre(shop.genre_key);
  const isParking = shop.genre_key === "parking-lot";
  const isBicycleParking = shop.genre_key === "bicycle-parking";
  const isParkingManagement = shop.genre_key === "parking-management";
  const isVending = shop.genre_key === "vending-machine";
  const isVendingInstallation = shop.genre_key === "vending-machine-installation";
  const isOfficeTenant = shop.genre_key === "office-tenant";
  const isOpeningResearch = shop.genre_key === "opening-area-research";
  const hotpepperKeyword = `${shop.area_label} ${shop.genre}`;
  return {
    name: shop.name,
    url: shop.url.startsWith("/") ? "." + shop.url : shop.url,
    prefecture: shop.prefecture,
    city: shop.city,
    ward: shop.ward || "",
    areaKey: shop.area_key,
    genreKey: shop.genre_key,
    genre: shop.genre,
    area: shop.area,
    address: shop.address,
    hours: shop.hours,
    station: shop.nearest_station,
    walkMinutes: shop.station_walk_minutes,
    budgetMin: shop.budget_min,
    budgetLabel: shop.budget_label,
    score: Math.max(60, 100 - index),
    parking: Boolean(shop.parking),
    late: Boolean(shop.late),
    coupon: Boolean(shop.coupon),
    smokingArea: shop.smoking_area || "",
    powerSeat: shop.power_seat || "",
    wifi: shop.wifi || "",
    eatIn: shop.eat_in || "",
    bookingUrl: shop.booking_url || (isAdult ? "./guide/discreet-buying/" : (isEvent ? eventSearchLink(shop.area_label, shop.genre) : (isParking ? timesParkingLink(shop.area_label) : (isBicycleParking ? searchLink(`${shop.area_label} 駐輪場 料金 定期利用 自治体`) : (isParkingManagement ? searchLinkForArea(shop.area_label, "駐車場管理会社 土地活用") : (isVending ? searchLinkForArea(shop.area_label, "自動販売機 キャッシュレス 災害対応") : (isVendingInstallation ? searchLinkForArea(shop.area_label, "自販機設置 相談") : (isOfficeTenant ? searchLinkForArea(shop.area_label, "貸事務所 貸店舗 テナント") : (isOpeningResearch ? searchLinkForArea(shop.area_label, "開業 競合店 周辺調査") : vcLink(`https://www.hotpepper.jp/SA33/?keyword=${encodeURIComponent(hotpepperKeyword)}`)))))))))),
    relatedUrl: shop.shopping_url || shop.coupon_url || (isParking ? timesMemberLink() : rakutenSearchLink(isAdult ? "アダルトグッズ 通販" : toolKeyword(shop.genre_key, shop.genre))),
    mapUrl: mapSearchLink(`${shop.name} ${shop.address}`),
    lat: shop.lat || null,
    lng: shop.lng || null
  };
}

async function loadFacilities() {
  try {
    const [shopsResponse, areasResponse, genresResponse] = await Promise.all([
      fetch("./data/shops.json", { cache: "no-store" }),
      fetch("./data/areas.json", { cache: "no-store" }),
      fetch("./data/genres.json", { cache: "no-store" })
    ]);
    if (!shopsResponse.ok) throw new Error("shops.json not found");
    const shops = await shopsResponse.json();
    areas = areasResponse.ok ? await areasResponse.json() : [];
    genres = genresResponse.ok ? await genresResponse.json() : [];
    facilities = shops.map(normalizeShop);
    populateSelects();
  } catch (error) {
    facilities = [];
    console.warn("店舗データを読み込めませんでした。", error);
  }
}

function populateSelects() {
  if (areaSelect && areas.length) {
    const current = areaSelect.value;
    areaSelect.innerHTML = `<option value="">すべてのエリア</option>${areas.map((area) => `<option value="${area.key}">${area.prefecture} ${area.label}</option>`).join("")}`;
    areaSelect.value = current;
  }
  if (genreSelect && genres.length) {
    const current = genreSelect.value;
    genreSelect.innerHTML = `<option value="">すべてのジャンル</option>${genres.map((genre) => `<option value="${genre.key}">${genre.label}</option>`).join("")}`;
    genreSelect.value = current;
  }
}

function activeFilters() {
  return filterEls.filter((input) => input.checked).map((input) => input.value);
}

function matchesFilter(facility, filter) {
  if (filter === "parking") return facility.parking;
  if (filter === "late") return facility.late;
  if (filter === "station") return Number(facility.walkMinutes) <= 10;
  if (filter === "coupon") return facility.coupon;
  return true;
}

function searchFacilities() {
  const area = areaSelect?.value || "";
  const genre = genreSelect?.value || "";
  const filters = activeFilters();
  const results = facilities.filter((facility) => {
    return (!area || facility.areaKey === area)
      && (!genre || facility.genreKey === genre)
      && filters.every((filter) => matchesFilter(facility, filter));
  });
  const sortedResults = sortFacilities(results);
  renderResults(sortedResults);
  renderMap(sortedResults);
}

function sortFacilities(results) {
  const sort = sortSelect?.value || "recommended";
  return [...results].sort((a, b) => {
    if (sort === "distance") return Number(a.walkMinutes || 999) - Number(b.walkMinutes || 999);
    if (sort === "budget") return Number(a.budgetMin || 999999) - Number(b.budgetMin || 999999);
    return Number(b.score || 0) - Number(a.score || 0);
  });
}

function actionLabel(facility) {
  if (facility.genreKey === "adult-shop") return text.guide;
  if (isEventGenre(facility.genreKey)) return text.event;
  if (facility.genreKey === "movie-theater") return text.ticket;
  if (facility.genreKey === "video-box") return "店舗を確認";
  if (facility.genreKey === "capsule-toy") return text.stock;
  if (facility.genreKey === "crane-game") return "景品・イベント";
  if (facility.genreKey === "convenience-store") return "店舗を確認";
  if (facility.genreKey === "cafe") return "店舗を確認";
  if (facility.genreKey === "parking-lot") return "予約・空き確認";
  if (facility.genreKey === "bicycle-parking") return text.fee;
  if (facility.genreKey === "parking-management") return text.consult;
  if (facility.genreKey === "vending-machine") return "設置場所を確認";
  if (facility.genreKey === "vending-machine-installation") return "設置相談";
  if (facility.genreKey === "office-tenant") return "物件を探す";
  if (facility.genreKey === "opening-area-research") return "周辺を調べる";
  return text.booking;
}

function relatedLabel(facility) {
  if (facility.genreKey === "adult-shop") return text.online;
  if (isEventGenre(facility.genreKey)) return text.tools;
  if (facility.genreKey === "netcafe" || facility.genreKey === "video-box") return text.supplies;
  if (facility.genreKey === "capsule-toy") return "収納・ケース";
  if (facility.genreKey === "crane-game") return "収納・グッズ";
  if (facility.genreKey === "convenience-store") return "携帯灰皿";
  if (facility.genreKey === "cafe") return "タンブラー";
  if (facility.genreKey === "parking-lot") return text.member;
  if (facility.genreKey === "bicycle-parking") return "鍵・ライト";
  if (facility.genreKey === "parking-management") return "管理会社比較";
  if (facility.genreKey === "vending-machine") return "飲料・備蓄";
  if (facility.genreKey === "vending-machine-installation") return "周辺設備";
  if (facility.genreKey === "office-tenant") return "開業備品";
  if (facility.genreKey === "opening-area-research") return "開業準備品";
  return text.related;
}

function smokingBadge(facility) {
  if (!facility.smokingArea) return "";
  return `<span class="badge">${text.smoking}: ${facility.smokingArea}</span>`;
}

function amenityBadges(facility) {
  return [
    facility.powerSeat ? `<span class="badge">${text.power}: ${facility.powerSeat}</span>` : "",
    facility.wifi ? `<span class="badge">${text.wifi}: ${facility.wifi}</span>` : "",
    facility.eatIn ? `<span class="badge">${text.eatIn}: ${facility.eatIn}</span>` : ""
  ].join("");
}

function pinPosition(facility, index) {
  const area = areas.find((item) => item.key === facility.areaKey);
  const base = area ? { x: area.map_x, y: area.map_y } : (areaPositions[facility.areaKey] || { x: 50, y: 50 });
  return {
    x: Math.max(8, Math.min(92, base.x + ((index % 3) - 1) * 4)),
    y: Math.max(12, Math.min(88, base.y + (Math.floor(index / 3) % 3) * 5))
  };
}

function distanceKm(origin, destination) {
  if (!origin || !destination.lat || !destination.lng) return null;
  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function routeEstimate(distance) {
  if (distance == null) return { walk: text.unknown, drive: text.unknown };
  const walkMinutes = Math.max(2, Math.round(distance / 4.2 * 60));
  const driveMinutes = Math.max(3, Math.round(distance / 22 * 60 + 5));
  return { walk: `${walkMinutes}分`, drive: `${driveMinutes}分` };
}

function requestCurrentLocation() {
  if (!navigator.geolocation) return Promise.resolve(defaultOrigin);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentOrigin = {
          label: "現在地",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fallback: false
        };
        resolve(currentOrigin);
      },
      () => {
        currentOrigin = defaultOrigin;
        resolve(currentOrigin);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 300000 }
    );
  });
}

async function showRoute(facility) {
  if (!routePanelEl || !routeSummaryEl) return;
  selectedFacilityIndex = facilities.indexOf(facility);
  highlightSelectedFacility();
  routePanelEl.innerHTML = `<p class="eyebrow">ルート</p><h2>${facility.name}</h2><p>現在地を確認しています。</p>`;
  const origin = await requestCurrentLocation();
  const distance = distanceKm(origin, facility);
  const estimate = routeEstimate(distance);
  const distanceLabel = distance == null ? text.unknown : `${distance.toFixed(1)}km`;
  const note = origin.fallback
    ? "現在地が使えないため、名古屋駅からの目安を表示しています。"
    : "現在地からの直線距離をもとにした目安です。";
  routeSummaryEl.textContent = `${facility.name}まで 車 約${estimate.drive} / 徒歩 約${estimate.walk}`;
  routePanelEl.innerHTML = `
    <p class="eyebrow">ルート</p>
    <h2>${facility.name}</h2>
    <dl class="route-stats">
      <div><dt>出発地</dt><dd>${origin.label}</dd></div>
      <div><dt>目的地</dt><dd>${facility.city}${facility.ward} ${facility.area}</dd></div>
      <div><dt>距離目安</dt><dd>${distanceLabel}</dd></div>
      <div><dt>車</dt><dd>約${estimate.drive}</dd></div>
      <div><dt>徒歩</dt><dd>約${estimate.walk}</dd></div>
    </dl>
    <p>${note}</p>
    <div class="route-actions">
      <a class="button" href="${routeLink(facility, origin)}">Google Mapsでルート</a>
      <a class="button button-light" href="${facility.mapUrl}">地図で確認</a>
    </div>
  `;
  routePanelEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function highlightSelectedFacility() {
  document.querySelectorAll(".facility-row[data-facility-index]").forEach((row) => {
    row.classList.toggle("is-selected", Number(row.dataset.facilityIndex) === selectedFacilityIndex);
  });
}

function renderMap(results) {
  if (!mapPinsEl || !routeSummaryEl) return;
  routeSummaryEl.textContent = `${results.length}${text.allCount}`;
  mapPinsEl.innerHTML = results.slice(0, 30).map((facility, index) => {
    const position = pinPosition(facility, index);
    return `
      <div class="map-pin" style="left: ${position.x}%; top: ${position.y}%;">
        <button type="button" data-route-index="${facilities.indexOf(facility)}" aria-label="${facility.name}のルート"><span>${index + 1}</span></button>
        <small>${facility.city}${facility.ward}</small>
      </div>
    `;
  }).join("");
}

function renderResults(results) {
  if (!resultEl || !metaEl) return;
  metaEl.textContent = `${results.length}${text.allCount}`;
  if (results.length === 0) {
    resultEl.innerHTML = `<article class="shop-card"><div><h3>${text.noResultTitle}</h3><p>${text.noResultBody}</p></div></article>`;
    return;
  }
  resultEl.innerHTML = `
    <div class="facility-table" role="table" aria-label="店舗一覧">
      <div class="facility-row facility-head" role="row">${text.headers.map((header) => `<div>${header}</div>`).join("")}</div>
      ${results.map((facility) => `
        <div class="facility-row" role="row" data-facility-index="${facilities.indexOf(facility)}">
          <div><span class="list-genre">${facility.genre}</span><strong><a href="${facility.url}">${facility.name}</a></strong><small>${facility.hours}</small></div>
          <div>${facility.prefecture}${facility.city}${facility.ward}<small>${facility.area}</small></div>
          <div>${facility.station}<small>${facility.walkMinutes ? `${text.walk}${facility.walkMinutes}${text.minutes}` : text.unknown}</small></div>
          <div>${facility.budgetLabel}</div>
          <div><div class="badges">${facility.parking ? `<span class="badge">${text.parking}</span>` : ""}${facility.late ? `<span class="badge">${text.late}</span>` : ""}${facility.coupon ? `<span class="badge">${text.coupon}</span>` : ""}${smokingBadge(facility)}${amenityBadges(facility)}</div></div>
          <div class="list-actions">
            <a class="button" href="${facility.url}">${text.detail}</a>
            <a class="button button-light" href="${facility.bookingUrl}">${actionLabel(facility)}</a>
            <a class="button button-light" href="${facility.relatedUrl}">${relatedLabel(facility)}</a>
            <button class="button button-light route-button" type="button" data-route-index="${facilities.indexOf(facility)}">${text.route}</button>
            <a class="button button-light" href="${facility.mapUrl}">${text.map}</a>
          </div>
        </div>`).join("")}
    </div>
  `;
}

document.addEventListener("click", (event) => {
  const routeTarget = event.target.closest("[data-route-index]");
  if (!routeTarget) return;
  const facility = facilities[Number(routeTarget.dataset.routeIndex)];
  if (facility) showRoute(facility);
});

document.querySelector("#useLocationButton")?.addEventListener("click", async () => {
  if (!routePanelEl) return;
  routePanelEl.innerHTML = `<p class="eyebrow">ルート</p><h2>現在地を確認しています</h2><p>ブラウザの確認が出た場合は許可してください。</p>`;
  const origin = await requestCurrentLocation();
  routePanelEl.innerHTML = `<p class="eyebrow">ルート</p><h2>${origin.label}を出発地にしました</h2><p>一覧の「ルート」または地図のピンを押すと、所要時間の目安を表示します。</p>`;
});

searchButton?.addEventListener("click", searchFacilities);
areaSelect?.addEventListener("change", searchFacilities);
genreSelect?.addEventListener("change", searchFacilities);
sortSelect?.addEventListener("change", searchFacilities);
filterEls.forEach((input) => input.addEventListener("change", searchFacilities));

loadFacilities().then(() => {
  const initialResults = sortFacilities(facilities);
  renderResults(initialResults);
  renderMap(initialResults);
});
