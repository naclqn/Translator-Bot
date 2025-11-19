import { getPrismaClient } from '../database';

/**
 * モデルのレートリミット設定
 */
export const MODEL_RATE_LIMITS: Record<string, { rpm: number; tpm: number; rpd: number }> = {
    'gemini-2.5-pro': { rpm: 2, tpm: 125000, rpd: 50 },
    'gemini-2.5-flash': { rpm: 10, tpm: 250000, rpd: 250 },
    'gemini-2.5-flash-preview': { rpm: 10, tpm: 250000, rpd: 250 },
    'gemini-2.5-flash-lite': { rpm: 15, tpm: 250000, rpd: 1000 },
    'gemini-2.5-flash-lite-preview': { rpm: 15, tpm: 250000, rpd: 1000 },
    'gemini-2.0-flash': { rpm: 15, tpm: 1000000, rpd: 200 },
    'gemini-2.0-flash-lite': { rpm: 30, tpm: 1000000, rpd: 200 }
};

/**
 * レートリミットチェック
 * @param modelName モデル名
 * @param estimatedTokens 推定トークン数
 * @returns リクエスト可能かどうか
 */
export async function checkRateLimit(
    modelName: string,
    estimatedTokens: number
): Promise<{ allowed: boolean; waitMs?: number; reason?: string }> {
    const limits = MODEL_RATE_LIMITS[modelName];
    if (!limits) {
        return { allowed: true }; // 制限が定義されていない場合は許可
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // レートリミットレコードを取得または作成
    let rateLimit = await getPrismaClient().rateLimit.findUnique({
        where: { modelName }
    });

    if (!rateLimit) {
        rateLimit = await getPrismaClient().rateLimit.create({
            data: {
                modelName,
                lastResetMin: now,
                lastResetDay: today
            }
        });
    }

    // 分単位のリセットチェック（1分経過したらリセット）
    const minutesSinceReset = (now.getTime() - rateLimit.lastResetMin.getTime()) / 1000 / 60;
    if (minutesSinceReset >= 1) {
        await getPrismaClient().rateLimit.update({
            where: { modelName },
            data: {
                requestCount: 0,
                tokenCount: 0,
                lastResetMin: now
            }
        });
        rateLimit.requestCount = 0;
        rateLimit.tokenCount = 0;
    }

    // 日単位のリセットチェック
    if (rateLimit.lastResetDay < today) {
        await getPrismaClient().rateLimit.update({
            where: { modelName },
            data: {
                dailyRequests: 0,
                lastResetDay: today
            }
        });
        rateLimit.dailyRequests = 0;
    }

    // RPMチェック
    if (rateLimit.requestCount >= limits.rpm) {
        const waitMs = 60000 - (now.getTime() - rateLimit.lastResetMin.getTime());
        return {
            allowed: false,
            waitMs: Math.max(0, waitMs),
            reason: `RPM制限: ${rateLimit.requestCount}/${limits.rpm}`
        };
    }

    // TPMチェック
    if (rateLimit.tokenCount + estimatedTokens > limits.tpm) {
        const waitMs = 60000 - (now.getTime() - rateLimit.lastResetMin.getTime());
        return {
            allowed: false,
            waitMs: Math.max(0, waitMs),
            reason: `TPM制限: ${rateLimit.tokenCount + estimatedTokens}/${limits.tpm}`
        };
    }

    // RPDチェック
    if (rateLimit.dailyRequests >= limits.rpd) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const waitMs = tomorrow.getTime() - now.getTime();
        return {
            allowed: false,
            waitMs: Math.max(0, waitMs),
            reason: `RPD制限: ${rateLimit.dailyRequests}/${limits.rpd}`
        };
    }

    return { allowed: true };
}

/**
 * レートリミットを更新（リクエスト成功後）
 */
export async function updateRateLimit(
    modelName: string,
    tokens: number
): Promise<void> {
    await getPrismaClient().rateLimit.update({
        where: { modelName },
        data: {
            requestCount: { increment: 1 },
            tokenCount: { increment: tokens },
            dailyRequests: { increment: 1 }
        }
    });
}

/**
 * API使用履歴を記録
 */
export async function recordApiUsage(
    modelName: string,
    tokens: number,
    success: boolean,
    errorMessage?: string
): Promise<void> {
    await getPrismaClient().apiUsage.create({
        data: {
            modelName,
            tokens,
            success,
            errorMessage
        }
    });
}

/**
 * トークン数を推定（簡易版：文字数ベース）
 */
export function estimateTokens(text: string): number {
    // 日本語は約2文字=1トークン、英語は約4文字=1トークンとして簡易計算
    const japaneseChars = (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/g) || []).length;
    const otherChars = text.length - japaneseChars;
    return Math.ceil(japaneseChars / 2 + otherChars / 4);
}

