# タスク依頼書

## 目的
Prismaのデータベース接続エラー（Error code 14: Unable to open the database file）を解決する

## 現状の問題
- PrismaがSQLiteデータベースファイルを開けない
- 相対パス `file:./prisma/data/translator.db` または `file:prisma/data/translator.db` が正しく解決されていない
- データベースファイルは `C:\Users\2yan\Documents\Translator-bot\prisma\data\translator.db` に存在する

## 実施内容

### 1. 余計なコードの削除
以下のファイルから、以下の処理を全て削除する：
- `src/database/index.ts`
- `src/services/rateLimiter.ts`

削除する処理：
- `path`モジュールのimport
- `fs`モジュールのimport
- プロジェクトルートの取得処理（`path.resolve(__dirname, '..', '..')`など）
- 絶対パスへの変換処理
- ディレクトリ作成処理（`fs.mkdirSync`など）
- WindowsパスをPrisma形式に変換する処理（`replace(/\\/g, '/')`など）
- 環境変数の上書き処理（`process.env.DATABASE_URL = ...`）
- `datasources`オプションでのパス指定

### 2. シンプルな実装に変更
`getPrismaClient()`関数を以下のようにシンプルにする：

```typescript
function getPrismaClient(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}
```

環境変数`DATABASE_URL`は、`.env`ファイルまたは`src/index.ts`と`src/config/index.ts`で既に設定されているため、それを使用する。

### 3. 環境変数の設定確認
`src/index.ts`と`src/config/index.ts`で`DATABASE_URL`が設定されていることを確認し、必要に応じて修正する。

## 期待される結果
- Prismaが環境変数`DATABASE_URL`をそのまま使用してデータベースに接続できる
- 余計な変換処理やパス解決処理がなくなり、コードがシンプルになる
- データベース接続エラーが解消される

## 注意事項
- 依頼書の内容を確認してから実装を開始すること
- 実装前にユーザーの確認を得ること


