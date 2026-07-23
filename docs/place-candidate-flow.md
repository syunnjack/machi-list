# Google Places候補の取り込み

候補はすぐ本データへ入れず、確認用ファイルを通して採用します。

```bash
npm run seeds:places
```

`seeds:places` は不足チェック、候補語生成、拡張ロードマップ作成、次に取得する候補キュー作成まで行います。

標準の取得キューは `data/place-seeds.next.json` です。PowerShellでは次のように実行します。

```powershell
$env:PLACE_SEEDS_FILE="data/place-seeds.next.json"; npm run sync:places
```

小分けに取得する場合は、件数と開始位置を指定します。まずは10件ずつ確認するのがおすすめです。

```powershell
$env:PLACE_SEEDS_FILE="data/place-seeds.next.json"
$env:PLACES_SEED_LIMIT="10"
$env:PLACES_SEED_OFFSET="0"
$env:PLACES_APPEND="1"
npm run sync:places
```

次の10件は `PLACES_SEED_OFFSET` を `10`、その次は `20` にします。取得結果は `data/google-places-candidates.json`、実行レポートは `data/google-places-sync-report.json` に出ます。

候補取得後に確認用ファイルを作ります。

```bash
npm run candidates:review
```

CSVで確認した候補を承認する場合は、まず承認IDファイルのテンプレートを作ります。

```bash
npm run candidates:approve
```

`data/place-candidates.approve.txt` に採用する候補の `id` または `google_place_id` を1行ずつ書き、もう一度実行します。

```bash
npm run candidates:approve
```

`data/place-candidates.review.json` の候補を確認し、採用するものだけ `review_status` を `approved` にします。そのあと次を実行します。

```bash
npm run candidates:adopt
npm run generate
npm run report:data
npm run report:adoption
```

採用済み候補は `data/seed-place-approved.json` に入り、次回以降も自動で `data/shops.json` に反映されます。
採用後の件数は `data/adoption-report.json` と `docs/adoption-report.md` で確認できます。

## 見るポイント

- `review_score` が高い候補を優先する
- `review_issues` が空の候補を優先する
- `same_place_id`、`same_id`、`missing_area`、`missing_genre` がある候補は採用しない
- 公式URL、住所、営業状態を確認してから `approved` にする
