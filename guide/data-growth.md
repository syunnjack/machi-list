# Data Growth Workflow

このサイトの店舗データを増やすときは、次の順番で進めます。

## 1. 薄い組み合わせを出す

```bash
npm run report:coverage
```

`data/coverage-report.json` に、市区町村とジャンルの組み合わせごとの不足状況が出ます。
上位から埋めると、一覧ページの厚みを効率よく増やせます。

## 2. 候補取得用の検索種を作る

```bash
npm run seeds:places
```

`data/place-seeds.generated.json` に、Google Places で候補取得するための検索語が出ます。

## 3. Google Places から候補を取る

PowerShell:

```powershell
$env:GOOGLE_PLACES_API_KEY="YOUR_API_KEY"
$env:PLACE_SEEDS_FILE="data/place-seeds.generated.json"
$env:PLACES_CANDIDATES_FILE="data/google-places-candidates.generated.json"
npm run sync:places
```

取得結果は候補データです。すぐ本番データへ混ぜず、公式サイト・住所・ジャンル重複を確認してから `data/shops.json` または seed ファイルへ反映します。

## 4. 優先ジャンル

まずは、1店舗から複数ジャンルへ展開できる施設を優先します。

- 快活CLUB、自遊空間、アプレシオ
- ラウンドワン、コロナワールド
- GiGO、namco、タイトー系
- イオンモールや駅ビル内のカプセルトイ、クレーンゲーム
- 金太郎、花太郎、宝島24などのビデオボックス

次に、生活導線が強いジャンルを増やします。

- コンビニ
- カフェ
- コインランドリー
- ドラッグストア
- トレカショップ
- ホビーショップ
- リサイクルショップ
- 歯医者
- 駐車場・コインパーキング
- 駐輪場
- 駐車場管理会社・土地活用
- 自動販売機
- 自販機設置
- 貸事務所・テナント
- 出店前の周辺調査
- ガソリンスタンド
- 郵便局

## 5. 反映後の確認

```bash
npm run generate
npm run check
```

さらに、重複がないか、対象ページの一覧件数が増えたかを確認してからコミットします。
