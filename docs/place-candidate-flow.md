# Google Places候補の取り込み

候補はすぐ本データへ入れず、確認用ファイルを通して採用します。

```bash
npm run seeds:places
npm run sync:places
npm run candidates:review
```

`data/place-candidates.review.json` の候補を確認し、採用するものだけ `review_status` を `approved` にします。そのあと次を実行します。

```bash
npm run candidates:adopt
npm run generate
npm run report:data
```

採用済み候補は `data/seed-place-approved.json` に入り、次回以降も自動で `data/shops.json` に反映されます。

## 見るポイント

- `review_score` が高い候補を優先する
- `review_issues` が空の候補を優先する
- `same_place_id`、`same_id`、`missing_area`、`missing_genre` がある候補は採用しない
- 公式URL、住所、営業状態を確認してから `approved` にする
