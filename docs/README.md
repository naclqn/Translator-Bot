# Translator Bot

Gemini API を使用した Discord 翻訳 Bot です。

## 機能

- **メッセージコマンド**: `!t [言語] [テキスト]`
- **リアクション翻訳**: ✅ リアクションで自動翻訳
- **チャンネル設定**: `/translate-enable` で有効化
- **レートリミット管理**: 自動フォールバック機能付き

## セットアップ

### 1. インストール

```bash
bun install
```

### 2. 環境変数 (.env)

```env
DISCORD_BOT_TOKEN=your_token
GEMINI_API_KEY=your_key
DEFAULT_TARGET_LANGUAGE=ja
GEMINI_MODELS=gemini-2.5-flash-lite,gemini-2.0-flash
MODEL_STRATEGY=fallback
DATABASE_URL=file:./prisma/data/translator.db
```

### 3. データベース

```bash
bun run prisma:migrate
```

### 4. 起動

```bash
bun run start
```

## 使い方

### コマンド

- `/translate-enable`: チャンネルで翻訳を有効化
- `/translate-disable`: チャンネルで翻訳を無効化
- `!t [言語] [テキスト]`: 指定言語に翻訳 (例: `!t en こんにちは`)
- `!t [テキスト]`: デフォルト言語に翻訳

### リアクション

メッセージに ✅ を付けると、日本語 ⇔ 英語の相互翻訳を行います。

## プロジェクト構造

- `src/commands`: コマンド定義
- `src/events`: イベントハンドラ
- `src/services`: 翻訳・レートリミットロジック
- `src/database`: Prisma 設定

## ライセンス

MIT
