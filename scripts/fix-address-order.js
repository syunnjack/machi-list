// 語順が逆になっている住所を直す。
//
// ## 何が起きていたか
//
// Google Places の英語表記をそのまま入れた住所が58件あった（2026-09-07 実測）。
//
//     ４丁目 尾上町 中区 横浜市 神奈川県 231-0015
//
// **都道府県が末尾に来ている。** generate-pages.js の noindex 判定は
// 「都道府県名が住所にあるか」だけを見るので、これでも index されてしまう。
// つまり noindex では止まらず、中身の読めないページとして公開されていた。
//
// 横浜市中区の自動販売機ページは、この壊れた住所2件と広告行1件だけで、
// **表示回数が60から0に落ちた**（サーチコンソール 2026-08-22週→08-29週）。
//
// ## 直し方
//
//   1. 住所の中に「〒123-4567 都道府県…」が入っていれば、**そこだけを取る**
//   2. 入っていなければ、都道府県の手前の語を**逆に並べ替える**
//
// どちらもできなければ触らない。**推測で住所を作らない。**
//
// 使い方:
//   node scripts/fix-address-order.js          直す内容を出すだけ
//   node scripts/fix-address-order.js --write  data/shops.json に書く

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shopsFile = path.join(root, "data", "shops.json");

// **3文字の県名を先に並べる。** `..県` を先に書くと「神奈川県」が
// 「奈川県」として当たって、直した住所が「奈川県神…」になる。
const PREFECTURE = /(北海道|京都府|大阪府|東京都|神奈川県|和歌山県|鹿児島県|..県)/;
const POSTCODE = /(\d{3}-\d{4})/;

/** 郵便番号を外した本体で、都道府県が先頭に無いものを壊れているとみなす。 */
function isBroken(address) {
  const text = String(address || "");
  // 「日本、」付きと壊れた郵便番号も直す対象にする。並びは正しくても見た目が悪い。
  if (/^日本、/.test(text)) return true;
  if (/^〒(?!\d{3}-\d{4})/.test(text)) return true;
  const body = text.replace(/^〒?\s*\d{3}-?\d{4}\s*/, "").trim();
  const found = body.match(PREFECTURE);
  return Boolean(found) && body.indexOf(found[1]) > 2;
}

/** 1. 文字列の中に正しい並びの住所が埋まっていれば、それを取り出す。 */
function pickEmbedded(address) {
  const match = String(address).match(
    /〒\s*(\d{3}-\d{4})\s+((?:北海道|京都府|大阪府|東京都|神奈川県|和歌山県|鹿児島県|..県)[^\s、,]{4,40}[0-9０-９]+[0-9０-９\-－−ー丁目番地号の]*)/
  );
  if (!match) return "";
  return `〒${match[1]} ${match[2]}`.replace(/\s+/g, " ").trim();
}

/** 2. 都道府県より前の語を逆に並べ替える。 */
function reverseOrder(address) {
  const text = String(address).replace(/^日本、?\s*/, "").trim();
  const postcode = (text.match(POSTCODE) || [])[1] || "";
  const found = text.match(PREFECTURE);
  if (!found) return "";

  const head = text.slice(0, text.indexOf(found[1]));
  // 建物名は「,」より前に来る。**英字だけの語も建物名なので落とす。**
  const afterComma = head.includes(",") ? head.slice(head.lastIndexOf(",") + 1) : head;
  const parts = afterComma
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    // **英字を含む語だけ落とす。** 数字だけの語は番地なので残す
    // （534-15 を落とすと「恵比須町」しか残らない）。
    .filter((part) => !/[A-Za-z]/.test(part));

  if (parts.length < 2) return "";
  const body = parts.reverse().join("");
  const zip = postcode ? `〒${postcode} ` : "";
  return `${zip}${found[1]}${body}`;
}

/** 3. 郵便番号が壊れているもの。`〒2F …… JP 901-0151` の形。 */
function repairPostcode(address) {
  const text = String(address).trim();
  if (!/^〒(?!\d{3}-\d{4})/.test(text)) return "";
  const tail = text.match(/JP\s+(\d{3}-?\d{4})\s*$/);
  if (!tail) return "";
  const body = text
    .replace(/^〒\S*\s*/, "")
    .replace(/\s*JP\s+\d{3}-?\d{4}\s*$/, "")
    .replace(/\s+[A-Za-z]\s*$/, "")
    .trim();
  if (!PREFECTURE.test(body)) return "";
  const zip = tail[1].includes("-") ? tail[1] : `${tail[1].slice(0, 3)}-${tail[1].slice(3)}`;
  return `〒${zip} ${body}`;
}

/** 先頭の「日本、」は要らない。**住所としては正しいので並べ替えない。** */
function stripCountry(address) {
  const text = String(address).trim();
  if (!/^日本、/.test(text)) return "";
  return text.replace(/^日本、\s*/, "");
}

function fix(address) {
  return stripCountry(address) || repairPostcode(address) || pickEmbedded(address) || reverseOrder(address);
}

function main() {
  const write = process.argv.includes("--write");
  const shops = JSON.parse(fs.readFileSync(shopsFile, "utf8"));

  let fixed = 0;
  let skipped = 0;
  for (const shop of shops) {
    if (!isBroken(shop.address)) continue;
    const next = fix(shop.address);
    if (!next || isBroken(next)) {
      skipped += 1;
      console.log(`  そのまま  ${shop.name}`);
      console.log(`            ${shop.address}`);
      continue;
    }
    fixed += 1;
    console.log(`  直す      ${shop.name}`);
    console.log(`    前: ${shop.address}`);
    console.log(`    後: ${next}`);
    if (write) {
      shop.address = next;
      if (shop.place_query) shop.place_query = `${shop.name} ${next}`;
      if (shop.source && shop.source.google_query) shop.source.google_query = `${shop.name} ${next}`;
    }
  }

  console.log(`\n直せる ${fixed}件 / 触らない ${skipped}件`);
  if (write) {
    fs.writeFileSync(shopsFile, `${JSON.stringify(shops, null, 2)}\n`, "utf8");
    console.log("data/shops.json に書きました。次は node scripts/normalize-data.js");
  } else {
    console.log("--write を付けると書き込みます。");
  }
}

main();
