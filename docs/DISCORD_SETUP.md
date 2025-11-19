# Discord Bot セットアップガイド

## 必要なスコープと権限

### 1. OAuth2スコープ（Bot招待URL）

Discord Developer Portalの「OAuth2」→「URL Generator」で以下のスコープを選択してください：

- ✅ **`bot`** - Botをサーバーに招待するために必要
- ✅ **`applications.commands`** - スラッシュコマンドを使用するために必要

### 2. Bot権限（Bot Permissions）

以下の権限を選択してください：

- ✅ **`Send Messages`** (2048) - メッセージを送信するため
- ✅ **`Embed Links`** (16384) - Embedメッセージを送信するため
- ✅ **`Read Message History`** (65536) - メッセージ履歴を読み取るため
- ✅ **`Use Slash Commands`** - スラッシュコマンドを使用するため（通常は自動で付与）
- ✅ **`Add Reactions`** - リアクション機能を使用するため（オプション、Botがリアクションを付ける場合）

**最小限の権限値**: `2048 + 16384 + 65536 = 83968`

### 3. Privileged Gateway Intents（必須）

「Bot」タブの「Privileged Gateway Intents」セクションで以下を有効化してください：

- ✅ **`MESSAGE CONTENT INTENT`** - メッセージの内容を読み取るために必要

**注意**: このIntentはDiscord Developer Portalで手動で有効化する必要があります。

## セットアップ手順

### ステップ1: アプリケーションの作成

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 「New Application」をクリック
3. アプリケーション名を入力して作成

### ステップ2: Botの作成と設定

1. 左メニューから「Bot」を選択
2. 「Add Bot」をクリック
3. 「Privileged Gateway Intents」セクションで以下を有効化:
   - ✅ `MESSAGE CONTENT INTENT`
4. 「TOKEN」をコピー（後で使用します）

### ステップ3: OAuth2 URLの生成

1. 左メニューから「OAuth2」→「URL Generator」を選択
2. **Scopes**で以下を選択:
   - ✅ `bot`
   - ✅ `applications.commands`
3. **Bot Permissions**で以下を選択:
   - ✅ `Send Messages`
   - ✅ `Embed Links`
   - ✅ `Read Message History`
   - ✅ `Use Slash Commands`
   - ✅ `Add Reactions`（オプション）
4. 生成されたURLをコピーしてブラウザで開く
5. サーバーを選択してBotを招待

### ステップ4: 環境変数の設定

`.env`ファイルに以下を設定:

```
DISCORD_BOT_TOKEN=your_bot_token_here
```

## 権限の説明

| 権限 | 用途 |
|------|------|
| `Send Messages` | 翻訳結果やヘルプメッセージを送信 |
| `Embed Links` | 翻訳結果を埋め込みメッセージで表示 |
| `Read Message History` | メッセージコマンド（`!translate`など）を読み取り |
| `Use Slash Commands` | スラッシュコマンド（`/translate-enable`など）を使用 |
| `Add Reactions` | リアクションを追加（オプション） |
| `MESSAGE CONTENT INTENT` | メッセージの内容を読み取る（Privileged Intent） |

## トラブルシューティング

### Botがメッセージを読み取れない

- `MESSAGE CONTENT INTENT`が有効化されているか確認
- Botを再招待する（Intentを有効化した後は再招待が必要な場合があります）

### スラッシュコマンドが表示されない

- `applications.commands`スコープが選択されているか確認
- Botを再招待する
- スラッシュコマンドの登録が完了するまで数分かかる場合があります

### メッセージを送信できない

- Botに`Send Messages`権限があるか確認
- チャンネルの権限設定を確認

### リアクション翻訳が動作しない

- チャンネルの翻訳機能が有効になっているか確認（`/translate-status`で確認）
- Botに`Read Message History`権限があるか確認
- `MESSAGE CONTENT INTENT`が有効化されているか確認




