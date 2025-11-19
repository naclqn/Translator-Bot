# Translator Bot

Gemini API を使用した Discord 翻訳 Bot です。

## クイックスタート

### 1. セットアップ

```bash
# 依存関係のインストール
bun install

# 環境変数の設定
cp .env.example .env
# .envを編集してDISCORD_BOT_TOKENとGEMINI_API_KEYを設定してください

# データベースの初期化
bun run prisma:migrate
```

### 2. 起動

```bash
# ビルド
bun run build

# 起動
bun run start

# 開発モード
bun run dev
```

## 主な機能

- **メッセージコマンド**: `!t [言語] [テキスト]`
- **リアクション翻訳**: ✅ リアクションで自動翻訳
- **チャンネル設定**: `/translate-enable` で有効化
- **複数モデル対応**: Gemini の複数モデルを自動切り替え

詳細なドキュメントは [`docs/`](./docs/) を参照してください。

## ライセンス

MIT
