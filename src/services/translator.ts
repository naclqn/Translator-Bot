import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, updateRateLimit, recordApiUsage, estimateTokens } from './rateLimiter';

/**
 * 利用可能なGeminiモデル（2025年11月時点の無料枠）
 * RPM: リクエスト/分, TPM: トークン/分, RPD: リクエスト/日
 */
export const AVAILABLE_MODELS = [
    'gemini-2.5-pro',              // 2 RPM, 125,000 TPM, 50 RPD
    'gemini-2.5-flash',            // 10 RPM, 250,000 TPM, 250 RPD
    'gemini-2.5-flash-preview',   // 10 RPM, 250,000 TPM, 250 RPD
    'gemini-2.5-flash-lite',       // 15 RPM, 250,000 TPM, 1,000 RPD
    'gemini-2.5-flash-lite-preview', // 15 RPM, 250,000 TPM, 1,000 RPD
    'gemini-2.0-flash',            // 15 RPM, 1,000,000 TPM, 200 RPD
    'gemini-2.0-flash-lite'        // 30 RPM, 1,000,000 TPM, 200 RPD
] as const;

export type ModelName = typeof AVAILABLE_MODELS[number];

/**
 * モデル使用戦略
 */
export type ModelStrategy = 'fallback' | 'rotation';

/**
 * Gemini APIを使用した翻訳機能（複数モデル対応）
 */
export class Translator {
    private genAI: GoogleGenerativeAI;
    private models: ModelName[];
    private strategy: ModelStrategy;
    private currentRotationIndex: number = 0;

    constructor(
        apiKey: string,
        models: ModelName[] = ['gemini-2.5-flash-lite'],
        strategy: ModelStrategy = 'fallback'
    ) {
        if (!apiKey) {
            throw new Error('Gemini APIキーが設定されていません');
        }
        if (models.length === 0) {
            throw new Error('モデルが指定されていません');
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.models = models;
        this.strategy = strategy;
    }

    /**
     * 現在使用するモデルを取得（ローテーション用）
     */
    private getCurrentModel(): ModelName {
        if (this.strategy === 'rotation') {
            const model = this.models[this.currentRotationIndex % this.models.length];
            this.currentRotationIndex = (this.currentRotationIndex + 1) % this.models.length;
            return model;
        }
        return this.models[0];
    }


    /**
     * モデルを使用してコンテンツを生成
     */
    private async generateContentWithModel(
        prompt: string,
        modelName: ModelName
    ): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        if (!text) {
            throw new Error('生成結果が空でした');
        }

        return text;
    }

    /**
     * テキストを翻訳する
     * @param text 翻訳するテキスト
     * @param targetLanguage 翻訳先の言語（例: 'ja', 'en', 'ko'）
     * @param sourceLanguage 翻訳元の言語（オプション、自動検出の場合は省略）
     * @returns 翻訳されたテキストと使用したモデル名
     */
    async translate(
        text: string,
        targetLanguage: string = 'ja',
        sourceLanguage?: string
    ): Promise<{ text: string; model: ModelName }> {
        if (!text || text.trim().length === 0) {
            throw new Error('翻訳するテキストが空です');
        }

        const sourceLangPrompt = sourceLanguage
            ? `翻訳元の言語: ${sourceLanguage}`
            : '翻訳元の言語を自動検出してください';

        const prompt = `あなたは優秀な翻訳者です。以下のテキストを${targetLanguage}に自然で流暢に翻訳してください。

重要な指示:
- 文脈を十分に理解し、自然な表現を使用してください
- 口語的な表現やスラングは適切に翻訳してください
- 専門用語や固有名詞は適切に処理してください
- 翻訳結果のみを返してください。説明、補足、注釈は一切不要です

${sourceLangPrompt}
翻訳先の言語: ${targetLanguage}

テキスト:
${text}

翻訳結果:`;

        const estimatedTokens = estimateTokens(text + prompt);

        if (this.strategy === 'fallback') {
            // フォールバック戦略：エラー時に次のモデルを試す
            let lastError: Error | null = null;
            
            for (const modelName of this.models) {
                // レートリミットチェック
                const rateLimitCheck = await checkRateLimit(modelName, estimatedTokens);
                if (!rateLimitCheck.allowed) {
                    const waitSeconds = Math.ceil((rateLimitCheck.waitMs || 0) / 1000);
                    console.warn(`モデル ${modelName} のレートリミット: ${rateLimitCheck.reason} (待機: ${waitSeconds}秒)`);
                    // 次のモデルを試す
                    continue;
                }

                try {
                    const translatedText = await this.generateContentWithModel(prompt, modelName);
                    
                    // 成功したらレートリミットを更新
                    await updateRateLimit(modelName, estimatedTokens);
                    await recordApiUsage(modelName, estimatedTokens, true);
                    
                    return { text: translatedText, model: modelName };
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error('不明なエラー');
                    const errorMessage = lastError.message;
                    
                    // エラーを記録
                    await recordApiUsage(modelName, estimatedTokens, false, errorMessage);
                    
                    // レートリミットエラー（429）の場合は待機時間を計算
                    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
                        console.warn(`モデル ${modelName} でレートリミットエラー: ${errorMessage}`);
                        // 次のモデルを試す
                        continue;
                    }
                    
                    console.warn(`モデル ${modelName} でエラーが発生しました: ${errorMessage}`);
                    // 次のモデルを試す
                    continue;
                }
            }
            
            // すべてのモデルで失敗
            throw new Error(
                `すべてのモデルで翻訳に失敗しました: ${lastError?.message || '不明なエラー'}`
            );
        } else {
            // ローテーション戦略：順番に使用
            const modelName = this.getCurrentModel();
            
            // レートリミットチェック
            const rateLimitCheck = await checkRateLimit(modelName, estimatedTokens);
            if (!rateLimitCheck.allowed) {
                const waitSeconds = Math.ceil((rateLimitCheck.waitMs || 0) / 1000);
                throw new Error(`レートリミット: ${rateLimitCheck.reason} (待機: ${waitSeconds}秒)`);
            }

            try {
                const translatedText = await this.generateContentWithModel(prompt, modelName);
                
                // 成功したらレートリミットを更新
                await updateRateLimit(modelName, estimatedTokens);
                await recordApiUsage(modelName, estimatedTokens, true);
                
                return { text: translatedText, model: modelName };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '不明なエラー';
                await recordApiUsage(modelName, estimatedTokens, false, errorMessage);
                throw new Error(`モデル ${modelName} で翻訳エラー: ${errorMessage}`);
            }
        }
    }

    /**
     * 言語を自動検出する（英語と日本語のみ対応）
     * 日本語文字（ひらがな、カタカナ、漢字）が含まれていれば日本語、それ以外は英語と判定
     * @param text 検出するテキスト
     * @returns 検出された言語コード ('ja' または 'en')
     */
    detectLanguage(text: string): string {
        if (!text || text.trim().length === 0) {
            return 'en'; // デフォルトは英語
        }

        // 日本語文字の範囲をチェック
        // ひらがな: \u3040-\u309F
        // カタカナ: \u30A0-\u30FF
        // 漢字: \u4E00-\u9FAF
        // CJK統合漢字拡張A: \u3400-\u4DBF
        const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/;
        
        // テキストに日本語文字が含まれているかチェック
        if (japanesePattern.test(text)) {
            return 'ja';
        }
        
        // 日本語文字がなければ英語と判定
        return 'en';
    }

    /**
     * 現在の設定を取得
     */
    getConfig(): { models: ModelName[]; strategy: ModelStrategy } {
        return {
            models: [...this.models],
            strategy: this.strategy
        };
    }
}

