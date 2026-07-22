const valueCommerce = {
  sid: "YOUR_VC_SID",
  pid: "YOUR_VC_PID",
  redirectBase: "https://ck.jp.ap.valuecommerce.com/servlet/referral"
};

const rakuten = {
  searchBase: "https://search.rakuten.co.jp/search/mall/"
};

const text = {
  allCount: "件の候補を表示しています。",
  noResultTitle: "条件に合う候補がありません",
  noResultBody: "エリア、店ジャンル、条件を少し広げて探してみてください。",
  headers: ["施設", "エリア", "距離", "予算", "特徴", "操作"],
  detail: "詳細",
  booking: "予約・クーポン",
  guide: "購入ガイド",
  related: "関連商品",
  online: "通販を見る",
  map: "地図で確認",
  parking: "駐車場",
  late: "夜まで",
  coupon: "クーポン",
  walk: "徒歩約",
  minutes: "分",
  unknown: "要確認"
};

const areaPositions = {
  toyota: { x: 72, y: 50 },
  "nagoya-nakamura": { x: 36, y: 44 },
  okazaki: { x: 64, y: 66 },
  "nagoya-naka": { x: 40, y: 48 },
  obu: { x: 45, y: 62 },
  owariasahi: { x: 52, y: 38 }
};

const defaultOrigin = {
  label: "名古屋駅",
  lat: 35.170915,
  lng: 136.881537,
  fallback: true
};

let currentOrigin = defaultOrigin;
let selectedFacilityIndex = null;

function vcLink(targetUrl) {
  const encoded = encodeURIComponent(targetUrl);
  return `${valueCommerce.redirectBase}?sid=${valueCommerce.sid}&pid=${valueCommerce.pid}&vc_url=${encoded}`;
}

function rakutenSearchLink(keyword) {
  return `${rakuten.searchBase}${encodeURIComponent(keyword)}/`;
}

function mapSearchLink(keyword) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}`;
}

function routeLink(facility, origin = currentOrigin) {
  const destination = facility.lat && facility.lng
    ? `${facility.lat},${facility.lng}`
    : facility.name;
  const originParam = origin?.fallback ? "" : `&origin=${origin.lat},${origin.lng}`;
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

const facilities = [
  {
    name: "快活CLUB 豊田小坂店",
    url: "./area/aichi/toyota/netcafe/",
    prefecture: "愛知県",
    city: "豊田市",
    ward: "",
    areaKey: "toyota",
    genreKey: "netcafe",
    genre: "ネットカフェ",
    area: "小坂町周辺",
    address: "愛知県豊田市小坂町周辺",
    hours: "24時間営業の候補",
    station: "豊田市駅",
    walkMinutes: 18,
    budgetMin: 1200,
    budgetLabel: "目安 1,200円〜",
    score: 91,
    parking: true,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y223/?keyword=%E8%B1%8A%E7%94%B0%20%E5%80%8B%E5%AE%A4"),
    relatedUrl: rakutenSearchLink("ネットカフェ 便利グッズ"),
    mapUrl: mapSearchLink("快活CLUB 豊田小坂店")
    ,lat: 35.079
    ,lng: 137.148
  },
  {
    name: "快活CLUB 名古屋駅太閤通口店",
    url: "./area/aichi/nagoya/nakamura/netcafe/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中村区",
    areaKey: "nagoya-nakamura",
    genreKey: "netcafe",
    genre: "ネットカフェ",
    area: "名古屋駅太閤通口周辺",
    address: "愛知県名古屋市中村区名駅周辺",
    hours: "24時間営業の候補",
    station: "名古屋駅",
    walkMinutes: 4,
    budgetMin: 1100,
    budgetLabel: "目安 1,100円〜",
    score: 90,
    parking: false,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y200/?keyword=%E5%90%8D%E5%8F%A4%E5%B1%8B%E9%A7%85"),
    relatedUrl: rakutenSearchLink("ネットカフェ 便利グッズ"),
    mapUrl: mapSearchLink("快活CLUB 名古屋駅太閤通口店")
    ,lat: 35.169
    ,lng: 136.879
  },
  {
    name: "自遊空間 名駅店",
    url: "./area/aichi/nagoya/nakamura/netcafe/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中村区",
    areaKey: "nagoya-nakamura",
    genreKey: "netcafe",
    genre: "ネットカフェ",
    area: "名駅周辺",
    address: "愛知県名古屋市中村区名駅周辺",
    hours: "要確認",
    station: "名古屋駅",
    walkMinutes: 6,
    budgetMin: 1000,
    budgetLabel: "目安 1,000円〜",
    score: 84,
    parking: false,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y200/?keyword=%E5%90%8D%E9%A7%85"),
    relatedUrl: rakutenSearchLink("ネットカフェ 仮眠 グッズ"),
    mapUrl: mapSearchLink("自遊空間 名駅店")
    ,lat: 35.171
    ,lng: 136.884
  },
  {
    name: "GiGO マーケットスクエアささしま",
    url: "./area/aichi/nagoya/nakamura/game-center/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中村区",
    areaKey: "nagoya-nakamura",
    genreKey: "game-center",
    genre: "ゲームセンター",
    area: "ささしまライブ周辺",
    address: "愛知県名古屋市中村区平池町周辺",
    hours: "要確認",
    station: "ささしまライブ駅",
    walkMinutes: 3,
    budgetMin: 500,
    budgetLabel: "目安 500円〜",
    score: 89,
    parking: true,
    late: true,
    coupon: false,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y200/?keyword=%E3%81%95%E3%81%95%E3%81%97%E3%81%BE"),
    relatedUrl: rakutenSearchLink("ゲームセンター 景品"),
    mapUrl: mapSearchLink("GiGO マーケットスクエアささしま")
    ,lat: 35.1622704
    ,lng: 136.8850032
  },
  {
    name: "タイトーステーション フェドラ大須店",
    url: "./area/aichi/nagoya/naka/game-center/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中区",
    areaKey: "nagoya-naka",
    genreKey: "game-center",
    genre: "ゲームセンター",
    area: "大須周辺",
    address: "愛知県名古屋市中区大須周辺",
    hours: "要確認",
    station: "上前津駅",
    walkMinutes: 5,
    budgetMin: 500,
    budgetLabel: "目安 500円〜",
    score: 88,
    parking: false,
    late: true,
    coupon: false,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y210/?keyword=%E5%A4%A7%E9%A0%88"),
    relatedUrl: rakutenSearchLink("クレーンゲーム 景品"),
    mapUrl: mapSearchLink("タイトーステーション フェドラ大須店")
    ,lat: 35.158
    ,lng: 136.904
  },
  {
    name: "namco イオンモール大高店",
    url: "./area/aichi/nagoya/naka/game-center/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "緑区",
    areaKey: "nagoya-naka",
    genreKey: "game-center",
    genre: "ゲームセンター",
    area: "大高周辺",
    address: "愛知県名古屋市緑区大高周辺",
    hours: "要確認",
    station: "南大高駅",
    walkMinutes: 4,
    budgetMin: 500,
    budgetLabel: "目安 500円〜",
    score: 82,
    parking: true,
    late: false,
    coupon: false,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/?keyword=%E5%A4%A7%E9%AB%98"),
    relatedUrl: rakutenSearchLink("ゲーム 景品"),
    mapUrl: mapSearchLink("namco イオンモール大高店")
    ,lat: 35.052
    ,lng: 136.947
  },
  {
    name: "あきば書店 岡崎北店",
    url: "./area/aichi/okazaki/adult-shop/",
    prefecture: "愛知県",
    city: "岡崎市",
    ward: "",
    areaKey: "okazaki",
    genreKey: "adult-shop",
    genre: "アダルトショップ",
    area: "井田新町",
    address: "愛知県岡崎市井田新町1-5",
    hours: "10:00-24:00",
    station: "北岡崎駅",
    walkMinutes: 8,
    budgetMin: 1000,
    budgetLabel: "商品により異なる",
    score: 86,
    parking: true,
    late: true,
    coupon: false,
    bookingUrl: "./guide/discreet-buying/",
    relatedUrl: rakutenSearchLink("ラブグッズ"),
    mapUrl: mapSearchLink("あきば書店 岡崎北店")
    ,lat: 34.972
    ,lng: 137.160
  },
  {
    name: "金太郎 名古屋駅前店",
    url: "./area/aichi/okazaki/adult-shop/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中村区",
    areaKey: "nagoya-nakamura",
    genreKey: "adult-shop",
    genre: "アダルトショップ",
    area: "名古屋駅周辺",
    address: "愛知県名古屋市中村区名駅周辺",
    hours: "要確認",
    station: "名古屋駅",
    walkMinutes: 5,
    budgetMin: 1000,
    budgetLabel: "商品により異なる",
    score: 85,
    parking: false,
    late: true,
    coupon: false,
    bookingUrl: "./guide/discreet-buying/",
    relatedUrl: rakutenSearchLink("ラブグッズ"),
    mapUrl: mapSearchLink("金太郎 名古屋駅前店")
    ,lat: 35.171
    ,lng: 136.881
  },
  {
    name: "匠書店 岡崎北店",
    url: "./area/aichi/okazaki/adult-shop/",
    prefecture: "愛知県",
    city: "岡崎市",
    ward: "",
    areaKey: "okazaki",
    genreKey: "adult-shop",
    genre: "アダルトショップ",
    area: "北岡崎駅周辺",
    address: "愛知県岡崎市北部エリア",
    hours: "要確認",
    station: "北岡崎駅",
    walkMinutes: 10,
    budgetMin: 1000,
    budgetLabel: "商品により異なる",
    score: 84,
    parking: true,
    late: true,
    coupon: false,
    bookingUrl: "./guide/discreet-buying/",
    relatedUrl: rakutenSearchLink("ラブグッズ"),
    mapUrl: mapSearchLink("匠書店 岡崎北店")
    ,lat: 34.975
    ,lng: 137.158
  },
  {
    name: "匠書店 大府店",
    url: "./area/aichi/okazaki/adult-shop/",
    prefecture: "愛知県",
    city: "大府市",
    ward: "",
    areaKey: "obu",
    genreKey: "adult-shop",
    genre: "アダルトショップ",
    area: "大府市周辺",
    address: "愛知県大府市周辺",
    hours: "要確認",
    station: "大府駅",
    walkMinutes: 12,
    budgetMin: 1000,
    budgetLabel: "商品により異なる",
    score: 82,
    parking: true,
    late: true,
    coupon: false,
    bookingUrl: "./guide/discreet-buying/",
    relatedUrl: rakutenSearchLink("ラブグッズ"),
    mapUrl: mapSearchLink("匠書店 大府店")
    ,lat: 35.008
    ,lng: 136.963
  },
  {
    name: "零式書店 尾張旭店",
    url: "./area/aichi/okazaki/adult-shop/",
    prefecture: "愛知県",
    city: "尾張旭市",
    ward: "",
    areaKey: "owariasahi",
    genreKey: "adult-shop",
    genre: "アダルトショップ",
    area: "尾張旭市周辺",
    address: "愛知県尾張旭市周辺",
    hours: "要確認",
    station: "尾張旭駅",
    walkMinutes: 14,
    budgetMin: 1000,
    budgetLabel: "商品により異なる",
    score: 81,
    parking: true,
    late: true,
    coupon: false,
    bookingUrl: "./guide/discreet-buying/",
    relatedUrl: rakutenSearchLink("ラブグッズ"),
    mapUrl: mapSearchLink("零式書店 尾張旭店")
    ,lat: 35.216
    ,lng: 137.035
  },
  {
    name: "ビッグエコー 名駅4丁目店",
    url: "./area/aichi/nagoya/nakamura/karaoke/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中村区",
    areaKey: "nagoya-nakamura",
    genreKey: "karaoke",
    genre: "カラオケ",
    area: "名駅4丁目周辺",
    address: "愛知県名古屋市中村区名駅周辺",
    hours: "要確認",
    station: "名古屋駅",
    walkMinutes: 4,
    budgetMin: 800,
    budgetLabel: "目安 800円〜",
    score: 90,
    parking: false,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y200/?keyword=%E3%83%93%E3%83%83%E3%82%B0%E3%82%A8%E3%82%B3%E3%83%BC%20%E5%90%8D%E9%A7%85"),
    relatedUrl: rakutenSearchLink("カラオケ マイク"),
    mapUrl: mapSearchLink("ビッグエコー 名駅4丁目店")
    ,lat: 35.170
    ,lng: 136.886
  },
  {
    name: "カラオケ館 錦本店",
    url: "./area/aichi/nagoya/naka/karaoke/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中区",
    areaKey: "nagoya-naka",
    genreKey: "karaoke",
    genre: "カラオケ",
    area: "錦周辺",
    address: "愛知県名古屋市中区錦周辺",
    hours: "要確認",
    station: "栄駅",
    walkMinutes: 4,
    budgetMin: 800,
    budgetLabel: "目安 800円〜",
    score: 88,
    parking: false,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y210/?keyword=%E9%8C%A6%20%E3%82%AB%E3%83%A9%E3%82%AA%E3%82%B1"),
    relatedUrl: rakutenSearchLink("カラオケ マイク"),
    mapUrl: mapSearchLink("カラオケ館 錦本店")
    ,lat: 35.171
    ,lng: 136.906
  },
  {
    name: "ジャンカラ 名駅東口店",
    url: "./area/aichi/nagoya/nakamura/karaoke/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中村区",
    areaKey: "nagoya-nakamura",
    genreKey: "karaoke",
    genre: "カラオケ",
    area: "名駅東口周辺",
    address: "愛知県名古屋市中村区名駅周辺",
    hours: "要確認",
    station: "名古屋駅",
    walkMinutes: 5,
    budgetMin: 700,
    budgetLabel: "目安 700円〜",
    score: 87,
    parking: false,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y200/?keyword=%E5%90%8D%E9%A7%85%20%E3%82%AB%E3%83%A9%E3%82%AA%E3%82%B1"),
    relatedUrl: rakutenSearchLink("カラオケ グッズ"),
    mapUrl: mapSearchLink("ジャンカラ 名駅東口店")
    ,lat: 35.171
    ,lng: 136.884
  },
  {
    name: "サウナ＆カプセルホテル ウェルビー栄",
    url: "./area/aichi/nagoya/naka/sauna/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中区",
    areaKey: "nagoya-naka",
    genreKey: "sauna",
    genre: "サウナ",
    area: "栄3丁目",
    address: "愛知県名古屋市中区栄3-13-12",
    hours: "5:00-24:00 最終退館26:00",
    station: "栄駅",
    walkMinutes: 6,
    budgetMin: 2000,
    budgetLabel: "目安 2,000円〜",
    score: 92,
    parking: true,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y210/?keyword=%E6%A0%84%20%E3%82%B5%E3%82%A6%E3%83%8A"),
    relatedUrl: rakutenSearchLink("サウナ グッズ"),
    mapUrl: mapSearchLink("サウナ＆カプセルホテル ウェルビー栄")
    ,lat: 35.1664
    ,lng: 136.9054
  },
  {
    name: "SaunaLab Nagoya",
    url: "./area/aichi/nagoya/naka/sauna/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "中区",
    areaKey: "nagoya-naka",
    genreKey: "sauna",
    genre: "サウナ",
    area: "栄3丁目",
    address: "愛知県名古屋市中区栄3丁目9-22 グランドビル8F",
    hours: "要確認",
    station: "栄駅",
    walkMinutes: 6,
    budgetMin: 2200,
    budgetLabel: "目安 2,200円〜",
    score: 89,
    parking: false,
    late: false,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/Y210/?keyword=SaunaLab%20Nagoya"),
    relatedUrl: rakutenSearchLink("サウナハット"),
    mapUrl: mapSearchLink("SaunaLab Nagoya")
    ,lat: 35.1662
    ,lng: 136.9079
  },
  {
    name: "ウェルビー今池",
    url: "./area/aichi/nagoya/naka/sauna/",
    prefecture: "愛知県",
    city: "名古屋市",
    ward: "千種区",
    areaKey: "nagoya-naka",
    genreKey: "sauna",
    genre: "サウナ",
    area: "今池",
    address: "愛知県名古屋市千種区今池5-25-5",
    hours: "要確認",
    station: "今池駅",
    walkMinutes: 5,
    budgetMin: 1500,
    budgetLabel: "目安 1,500円〜",
    score: 87,
    parking: true,
    late: true,
    coupon: true,
    bookingUrl: vcLink("https://www.hotpepper.jp/SA33/?keyword=%E4%BB%8A%E6%B1%A0%20%E3%82%B5%E3%82%A6%E3%83%8A"),
    relatedUrl: rakutenSearchLink("サウナ グッズ"),
    mapUrl: mapSearchLink("ウェルビー今池")
    ,lat: 35.1668
    ,lng: 136.937
  }
];

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
    const matchesArea = !area || facility.areaKey === area;
    const matchesGenre = !genre || facility.genreKey === genre;
    const matchesFilters = filters.every((filter) => matchesFilter(facility, filter));
    return matchesArea && matchesGenre && matchesFilters;
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
  return text.booking;
}

function relatedLabel(facility) {
  if (facility.genreKey === "adult-shop") return text.online;
  return text.related;
}

function pinPosition(facility, index) {
  const base = areaPositions[facility.areaKey] || { x: 50, y: 50 };
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
  if (distance == null) return { walk: "要確認", drive: "要確認" };
  const walkMinutes = Math.max(2, Math.round(distance / 4.2 * 60));
  const driveMinutes = Math.max(3, Math.round(distance / 22 * 60 + 5));
  return {
    walk: `${walkMinutes}分`,
    drive: `${driveMinutes}分`
  };
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
  routePanelEl.innerHTML = `
    <p class="eyebrow">ルート</p>
    <h2>${facility.name}</h2>
    <p>現在地を確認しています。</p>
  `;
  const origin = await requestCurrentLocation();
  const distance = distanceKm(origin, facility);
  const estimate = routeEstimate(distance);
  const distanceLabel = distance == null ? "要確認" : `${distance.toFixed(1)}km`;
  const note = origin.fallback
    ? "現在地が使えないため、名古屋駅からの目安を表示しています。"
    : "現在地からの直線距離をもとにした目安です。";
  routeSummaryEl.textContent = `${facility.name} まで 車 約${estimate.drive} / 徒歩 約${estimate.walk}`;
  routePanelEl.innerHTML = `
    <p class="eyebrow">ルート</p>
    <h2>${facility.name}</h2>
    <dl class="route-stats">
      <div><dt>出発地</dt><dd>${origin.label}</dd></div>
      <div><dt>目的地</dt><dd>${facility.city}${facility.ward ? facility.ward : ""} ${facility.area}</dd></div>
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
  mapPinsEl.innerHTML = results.map((facility, index) => {
    const position = pinPosition(facility, index);
    return `
      <div class="map-pin" style="left: ${position.x}%; top: ${position.y}%;">
        <button type="button" data-route-index="${facilities.indexOf(facility)}" aria-label="${facility.name}のルート"><span>${index + 1}</span></button>
        <small>${facility.city}${facility.ward ? facility.ward : ""}</small>
      </div>
    `;
  }).join("");
}

function renderResults(results) {
  if (!resultEl || !metaEl) return;
  metaEl.textContent = `${results.length}${text.allCount}`;
  if (results.length === 0) {
    resultEl.innerHTML = `
      <article class="shop-card">
        <div>
          <h3>${text.noResultTitle}</h3>
          <p>${text.noResultBody}</p>
        </div>
      </article>
    `;
    return;
  }
  resultEl.innerHTML = `
    <div class="facility-table" role="table" aria-label="${text.headers[0]}${text.headers[1]}">
      <div class="facility-row facility-head" role="row">
        ${text.headers.map((header) => `<div>${header}</div>`).join("")}
      </div>
      ${results.map((facility) => `
        <div class="facility-row" role="row" data-facility-index="${facilities.indexOf(facility)}">
          <div>
            <span class="list-genre">${facility.genre}</span>
            <strong><a href="${facility.url}">${facility.name}</a></strong>
            <small>${facility.hours}</small>
          </div>
          <div>${facility.prefecture}${facility.city}${facility.ward ? facility.ward : ""}<small>${facility.area}</small></div>
          <div>${facility.station}<small>${facility.walkMinutes ? `${text.walk}${facility.walkMinutes}${text.minutes}` : text.unknown}</small></div>
          <div>${facility.budgetLabel}</div>
          <div>
            <div class="badges">
              ${facility.parking ? `<span class="badge">${text.parking}</span>` : ""}
              ${facility.late ? `<span class="badge">${text.late}</span>` : ""}
              ${facility.coupon ? `<span class="badge">${text.coupon}</span>` : ""}
            </div>
          </div>
          <div class="list-actions">
            <a class="button" href="${facility.url}">${text.detail}</a>
            <a class="button button-light" href="${facility.bookingUrl}">${actionLabel(facility)}</a>
            <a class="button button-light" href="${facility.relatedUrl}">${relatedLabel(facility)}</a>
            <button class="button button-light route-button" type="button" data-route-index="${facilities.indexOf(facility)}">ルート</button>
            <a class="button button-light" href="${facility.mapUrl}">${text.map}</a>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

document.addEventListener("click", (event) => {
  const routeTarget = event.target.closest("[data-route-index]");
  if (!routeTarget) return;
  const facility = facilities[Number(routeTarget.dataset.routeIndex)];
  if (!facility) return;
  showRoute(facility);
});

document.querySelector("#useLocationButton")?.addEventListener("click", async () => {
  if (!routePanelEl) return;
  routePanelEl.innerHTML = `
    <p class="eyebrow">ルート</p>
    <h2>現在地を確認しています</h2>
    <p>ブラウザの確認が出た場合は許可してください。</p>
  `;
  const origin = await requestCurrentLocation();
  routePanelEl.innerHTML = `
    <p class="eyebrow">ルート</p>
    <h2>${origin.label}を出発地にしました</h2>
    <p>一覧の「ルート」または地図のピンを押すと、所要時間の目安を表示します。</p>
  `;
});

searchButton?.addEventListener("click", searchFacilities);
areaSelect?.addEventListener("change", searchFacilities);
genreSelect?.addEventListener("change", searchFacilities);
sortSelect?.addEventListener("change", searchFacilities);
filterEls.forEach((input) => input.addEventListener("change", searchFacilities));

const initialResults = sortFacilities(facilities);
renderResults(initialResults);
renderMap(initialResults);
