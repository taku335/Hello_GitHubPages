# Hello GitHub Pages

React + Vite で構成した「フィンちゃんのパン屋さん」サイトです。

公開先:
https://taku335.github.io/Hello_GitHubPages/

## ローカル開発（Dockerのみ）

ローカルに Node.js / npm を入れずに、Docker 上で動作確認します。

1. 開発サーバー起動

   ```bash
   make up
   ```

2. ブラウザで確認

   [http://localhost:5173](http://localhost:5173)

3. 終了

   ```bash
   make down
   ```

追加コマンド:

```bash
make test   # コンテナ内でテスト
make build  # コンテナ内でビルド
make logs   # ログ追従
```

Docker Compose を直接使う場合:

```bash
docker compose up --build
docker compose run --rm app npm test
docker compose down
```

## GitHub Pages への公開

このリポジトリは GitHub Actions で `dist/` を GitHub Pages にデプロイします。

1. GitHub リポジトリの Settings -> Pages を開く
2. Build and deployment の Source を `GitHub Actions` に設定
3. `main` ブランチに push すると `.github/workflows/deploy.yml` が実行されて公開
