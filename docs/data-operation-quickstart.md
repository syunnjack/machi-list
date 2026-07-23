# データ運用クイックスタート

## 1. 次に集める候補を作る

```powershell
npm run seeds:places
```

主な出力:

- `data/place-seeds.next.json`
- `data/growth-roadmap.json`
- `docs/data-growth-roadmap.md`

## 2. Google Places候補を10件ずつ取得する

```powershell
$env:PLACE_SEEDS_FILE="data/place-seeds.next.json"
$env:PLACES_SEED_LIMIT="10"
$env:PLACES_SEED_OFFSET="0"
$env:PLACES_APPEND="1"
npm run sync:places
```

次の10件は `PLACES_SEED_OFFSET` を `10`、その次は `20` にします。

主な出力:

- `data/google-places-candidates.json`
- `data/google-places-sync-report.json`

## 3. 候補を確認しやすい形にする

```powershell
npm run candidates:review
```

主な出力:

- `data/place-candidates.review.json`
- `data/place-candidates.review.csv`
- `docs/place-candidate-review.md`

## 4. 採用する候補を指定する

まずテンプレートを作ります。

```powershell
npm run candidates:approve
```

`data/place-candidates.approve.txt` に採用する候補の `id` または `google_place_id` を1行ずつ書き、もう一度実行します。

```powershell
npm run candidates:approve
```

## 5. 採用済み候補をサイトへ反映する

```powershell
npm run data:pipeline
```

このコマンドは、候補更新、承認済み候補の採用、ページ生成、品質レポート、採用レポートまでまとめて実行します。

主な出力:

- `data/shops.json`
- `data/data-quality-report.json`
- `data/adoption-report.json`
- `docs/adoption-report.md`

## 6. 公開前チェック

```powershell
npm run check
```

品質レポートで次が0なら、そのまま公開作業へ進めます。

- duplicate area keys
- duplicate shop ids
- missing area references
- missing genre references
