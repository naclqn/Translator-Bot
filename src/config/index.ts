import * as dotenv from 'dotenv';
import { AVAILABLE_MODELS, ModelName, ModelStrategy } from '../services/translator';

dotenv.config();

// 環境変数の検証
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const DEFAULT_TARGET_LANGUAGE = process.env.DEFAULT_TARGET_LANGUAGE || 'ja';
export const MODELS_ENV = process.env.GEMINI_MODELS || 'gemini-2.5-flash-lite';
export const MODEL_STRATEGY = (process.env.MODEL_STRATEGY || 'fallback') as ModelStrategy;
// Prisma 7.0では環境変数DATABASE_URLが必要
// デフォルト値を設定（PrismaClient初期化前に確実に設定されるように）
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:prisma/data/translator.db';
}
export const DATABASE_URL = process.env.DATABASE_URL;

if (!DISCORD_BOT_TOKEN) {
    console.error('エラー: DISCORD_BOT_TOKENが設定されていません');
    process.exit(1);
}

if (!GEMINI_API_KEY) {
    console.error('エラー: GEMINI_API_KEYが設定されていません');
    process.exit(1);
}

// モデルリストの解析
export function parseModels(envValue: string): ModelName[] {
    const models = envValue
        .split(',')
        .map(m => m.trim())
        .filter(m => m.length > 0) as ModelName[];
    
    // 有効なモデル名かチェック
    const invalidModels = models.filter(m => !AVAILABLE_MODELS.includes(m));
    if (invalidModels.length > 0) {
        console.warn(`警告: 無効なモデル名が指定されています: ${invalidModels.join(', ')}`);
        console.warn(`利用可能なモデル: ${AVAILABLE_MODELS.join(', ')}`);
    }
    
    const validModels = models.filter(m => AVAILABLE_MODELS.includes(m));
    if (validModels.length === 0) {
        console.error('エラー: 有効なモデルが指定されていません');
        process.exit(1);
    }
    
    return validModels;
}

// 戦略の検証
if (MODEL_STRATEGY !== 'fallback' && MODEL_STRATEGY !== 'rotation') {
    console.error('エラー: MODEL_STRATEGYは "fallback" または "rotation" である必要があります');
    process.exit(1);
}

export const models = parseModels(MODELS_ENV);

