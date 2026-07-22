# machi-list

`machi-list` は、市区町村と店ジャンルを組み合わせた一覧ページを中心に、お店・商業施設を探せるサイトです。
現在のMVPは愛知県、静岡県、岐阜県、三重県に加えて、東京都、大阪府、京都府、神奈川県、北海道、宮城県、兵庫県、広島県、福岡県の主要都市に対応し、ネットカフェ、ゲームセンター、アダルトショップ、カラオケ、サウナ、スーパー銭湯・SPA・岩盤浴、猫カフェ、飲食店・居酒屋、ダーツ、ボウリング場、ビリヤード、映画館、ビデオボックスを扱います。

地図は場所とルート確認の補助として置き、メインは市区町村ごとの一覧・比較ページです。

## 起動

```bash
npm start
```

URL:

```text
http://127.0.0.1:4173/
```

## 確認

```bash
npm run check
npm run generate
```

## 公開

`CNAME` は `machi-list.jp` に設定済みです。GitHub Pages を使う場合は、リポジトリの Pages 設定で Source を GitHub Actions にすると、`main` への反映時に `.github/workflows/pages.yml` が静的ページを生成して公開します。

## ページ生成

```bash
npm run generate
```

`data/areas.json`、`data/genres.json`、`data/shops.json` をもとに、都道府県ページ、市区町村ページ、ジャンル別ページ、`sitemap.xml` を生成します。

## 店舗データ

店舗データは `data/shops.json` に保存します。主な項目は、店舗名、ジャンル、市区町村、住所、営業時間、最寄り駅、徒歩目安、予算目安、駐車場、夜まで営業、クーポン確認、公式URL、予約URL、クーポンURL、通販URL、外部確認用の検索語です。

予約、クーポン、通販などの確認先はテキストリンクで掲載します。画像素材は使わず、一覧やサイドの自然な確認導線として扱います。ネットカフェやビデオボックスでは、終電後に休む人がシャワー、充電、軽食、備品を確認できる導線を置きます。

通常は次のコマンドで、足りない項目の補完と並び替えを行います。

```bash
node scripts/normalize-data.js
```

Google Place ID が確認できた店舗は `source.google_place_id` に入れます。未確認でも、公式サイトや公開地図で確認した店舗は `source.google_query` を入れて、あとから同期しやすい形にします。

## 公開

GitHub Pages で公開する場合は、リポジトリ設定で Pages の公開元を `main` ブランチの root にします。

ドメイン:

```text
machi-list.jp
```

このリポジトリには `CNAME` と `.nojekyll` を置いています。
