// OpenStreetMap から本屋・古本屋を取って data/shops.json に足す。
//
// ## OSM の住所タグはあてにならない
//
// **名古屋市千種区の shop=books は5件あるが、addr:* が付いているものは0件**
// （2026-09-07 実測）。名前と座標しか無い。そこで住所はこう組み立てる。
//
//   都道府県・市区町村 … 国土地理院の市区町村コード（座標から引く）
//   町丁目            … 同じ応答の lv01Nm
//
// どちらも推測ではない。**住所に都道府県名が無いページは generate-pages.js が
// noindex にする**ので、都道府県まで入れられないと載せる意味がない。
//
// ## エリアの絞り込みを Overpass だけでやろうとしない
//
// **Overpass は area の中の area を絞れない。**
// `area[name=名古屋市]->.city; area[name=中区](area.city)` と書いても、
// 広島市中区や浜松市中区まで返る（2026-09-07 実測）。
// かといって都道府県まるごとを引くと重すぎて fetch が落ちる。
//
// なので **Overpass は名前で広く引くだけ**にして、
// **どの市区町村かは国土地理院の市区町村コードで判定する。**
// 全国に4つある「北区」も、大阪市北区と堺市北区も、これで正しく分かれる。
//
// 使い方:
//   node scripts/fetch-osm-bookstores.js
//   node scripts/fetch-osm-bookstores.js --only=aichi   都道府県キーで試す
//
// 走らせたあとは normalize-data.js → generate-pages.js の順。

const fs = require("node:fs");
const path = require("node:path");

// **Node は IPv6 に先につないで10秒で諦める。**
// overpass-api.de は IPv6 が返るが応答しないため、これが無いと全滅する
// （UND_ERR_CONNECT_TIMEOUT。Python の urllib は IPv4 に落ちるので通っていた）。
require("node:dns").setDefaultResultOrder("ipv4first");

const root = path.resolve(__dirname, "..");
const shopsFile = path.join(root, "data", "shops.json");
const areas = JSON.parse(fs.readFileSync(path.join(root, "data", "areas.json"), "utf8"));

// **1つが落ちても続けられるように複数持つ。** 本家は混むと fetch ごと失敗する。
const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.jp/api/interpreter",
];
const GSI_REVERSE = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress";
const GSI_MUNI = "https://maps.gsi.go.jp/js/muni.js";
const UA = "machi-list-bookstore/1.0 (+https://machi-list.jp)";

const OVERPASS_PAUSE = 4000;
const GSI_PAUSE = 900;

// 中古を扱う店の見分け方。タグが無い店が多いので、屋号でも拾う。
const USED_BRANDS = /(ブックオフ|BOOKOFF|Book ?Off|古本市場|古本|古書|開放倉庫|まんだらけ|ブックマーケット|万代書店|夢屋書店)/i;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getText(url, timeoutMs = 60000) {
  const response = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

/** 市区町村コードの一覧。`23101` → 愛知県 / 名古屋市 / 千種区 */
async function loadMunicipalities() {
  const source = await getText(GSI_MUNI);
  const table = new Map();
  for (const [, code, body] of source.matchAll(/GSI\.MUNI_ARRAY\["(\d+)"\]\s*=\s*'([^']*)'/g)) {
    const parts = body.split(",");
    if (parts.length < 4) continue;
    // 政令市の区は「名古屋市　千種区」のように全角空白で区切られている。
    const [city, ward = ""] = parts[3].split(/[\s　]+/);
    table.set(code, { prefecture: parts[1], city, ward });
  }
  return table;
}

async function overpass(query, tries = 4) {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    const endpoint = OVERPASS[attempt % OVERPASS.length];
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      // **混んでいると JSON ではなく XML のエラーページが返る。**
      // そのまま json() すると解析エラーになるので、文字で受けて判定する。
      const text = await response.text();
      if (!text.startsWith("{")) throw new Error("混雑（XMLが返りました）");
      return JSON.parse(text);
    } catch (error) {
      if (attempt === tries - 1) {
        console.error(`    Overpass あきらめます: ${error.message}`);
        return { elements: [] };
      }
      await sleep(10000 * (attempt + 1));
    }
  }
  return { elements: [] };
}

/** 座標から市区町村コードと町丁目。**取れなければ空。推測しない。** */
async function reverseGeocode(lat, lon) {
  try {
    const body = JSON.parse(await getText(`${GSI_REVERSE}?lat=${lat}&lon=${lon}`, 30000));
    const found = body && body.results;
    if (!found) return null;
    return { muniCd: String(found.muniCd || ""), town: String(found.lv01Nm || "") };
  } catch {
    return null;
  }
}

const keyOf = (element) => `${element.type}/${element.id}`;

function centreOf(element) {
  if (element.center) return { lat: element.center.lat, lon: element.center.lon };
  if (typeof element.lat === "number") return { lat: element.lat, lon: element.lon };
  return null;
}

function isUsed(tags) {
  const second = String(tags.second_hand || "").toLowerCase();
  if (second === "only" || second === "yes") return true;
  if (/antiquarian|second_hand|used|old/.test(String(tags.books || "").toLowerCase())) return true;
  return USED_BRANDS.test(`${tags.name || ""} ${tags.brand || ""} ${tags.operator || ""}`);
}

function officialUrl(tags) {
  const url = tags.website || tags["contact:website"] || tags.url || "";
  return /^https?:\/\//.test(url) ? url : "";
}

/** OSM の opening_hours は機械向けの書式。**読める形にできたものだけ出す。** */
function hoursOf(tags) {
  const raw = String(tags.opening_hours || "").trim();
  if (!raw || raw.length > 40) return "";
  if (raw === "24/7") return "24時間営業";
  const simple = raw.match(/^Mo-Su (\d{2}:\d{2})-(\d{2}:\d{2})$/);
  return simple ? `${simple[1]}〜${simple[2]}` : "";
}

/** その店が、このエリアの市区町村にあるか。 */
function sameArea(muni, area) {
  if (!muni) return false;
  if (muni.prefecture !== area.prefecture) return false;
  if (area.ward) return muni.city === area.city && muni.ward === area.ward;
  return muni.city === area.city && !muni.ward;
}

async function main() {
  const only = (process.argv.find((arg) => arg.startsWith("--only=")) || "").split("=")[1] || "";
  const targets = only ? areas.filter((area) => area.prefecture_key === only) : areas;
  if (!targets.length) {
    console.log(`--only=${only} に合うエリアがありません。`);
    return;
  }

  console.log("市区町村コードを取ります。");
  const municipalities = await loadMunicipalities();
  console.log(`  ${municipalities.size}件\n`);

  const geocoded = new Map();
  const records = [];
  const seen = new Set();
  let checked = 0;
  let outside = 0;

  for (const area of targets) {
    // **OSM の境界名は「千種区」で、「名古屋市千種区」では引けない。**
    // areas.json の label は後者なので、そのまま渡すと候補0件になる。
    // 同名の区が他県にも出るが、市区町村コードで弾くので構わない。
    const osmName = area.ward || area.city;
    const body = await overpass(`[out:json][timeout:120];
area["name"="${osmName}"]->.a;
nwr["shop"="books"](area.a);
out center tags;`);
    await sleep(OVERPASS_PAUSE);

    const candidates = (body.elements || []).filter((element) => element.tags && element.tags.name);
    let kept = 0;

    for (const element of candidates) {
      const key = keyOf(element);
      if (seen.has(key)) continue;
      const centre = centreOf(element);
      if (!centre) continue;

      if (!geocoded.has(key)) {
        geocoded.set(key, await reverseGeocode(centre.lat, centre.lon));
        checked += 1;
        await sleep(GSI_PAUSE);
      }
      const place = geocoded.get(key);
      const muni = place ? municipalities.get(place.muniCd) : null;
      if (!sameArea(muni, area)) {
        outside += 1;
        continue;
      }

      seen.add(key);
      kept += 1;
      const tags = element.tags;
      records.push({
        id: `osm-book-${element.type}${element.id}`,
        name: tags.name,
        genre_key: isUsed(tags) ? "used-bookstore" : "bookstore",
        area_key: area.key,
        area: area.label,
        address: `${muni.prefecture}${muni.city}${muni.ward}${place.town}`,
        hours: hoursOf(tags),
        nearest_station: area.station || "",
        station_walk_minutes: 0,
        budget_min: 0,
        budget_label: "",
        parking: false,
        late: false,
        coupon: false,
        official_url: officialUrl(tags),
        lat: centre.lat,
        lng: centre.lon,
        source: {
          google_place_id: null,
          google_query: `${tags.name} ${area.label}`,
          osm: `https://www.openstreetmap.org/${element.type}/${element.id}`,
          address_source: "国土地理院 逆ジオコーダ",
        },
      });
    }

    console.log(`  ${area.label}（${osmName}）  候補${candidates.length} → ${kept}件`);
  }

  const shops = JSON.parse(fs.readFileSync(shopsFile, "utf8"));
  const existing = new Set(shops.map((shop) => shop.id));
  const added = records.filter((record) => !existing.has(record.id));
  shops.push(...added);
  fs.writeFileSync(shopsFile, `${JSON.stringify(shops, null, 2)}\n`, "utf8");

  const fresh = added.filter((r) => r.genre_key === "bookstore").length;
  const used = added.filter((r) => r.genre_key === "used-bookstore").length;
  console.log(`\n${added.length}件を足しました（本屋 ${fresh} / 古本屋 ${used}）。`);
  console.log(`  座標を引いた: ${checked}件 / 対象外だった: ${outside}件`);
  console.log(`  町丁目まで入った: ${added.filter((r) => /[0-9０-９丁目番地字]/.test(r.address)).length}件`);
  console.log("次は node scripts/normalize-data.js");
}

main();
