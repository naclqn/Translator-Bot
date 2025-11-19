/**
 * 言語コードの検証
 */
export function isValidLanguageCode(code: string): boolean {
    const validCodes = [
        'ja', 'en', 'ko', 'zh', 'es', 'fr', 'de', 'it', 'pt', 'ru',
        'ar', 'hi', 'th', 'vi', 'id', 'tr', 'pl', 'nl', 'sv', 'da'
    ];
    return validCodes.includes(code.toLowerCase());
}

/**
 * 言語名の取得
 */
export function getLanguageName(code: string): string {
    const languageMap: Record<string, string> = {
        'ja': '日本語',
        'en': '英語',
        'ko': '韓国語',
        'zh': '中国語',
        'es': 'スペイン語',
        'fr': 'フランス語',
        'de': 'ドイツ語',
        'it': 'イタリア語',
        'pt': 'ポルトガル語',
        'ru': 'ロシア語',
        'ar': 'アラビア語',
        'hi': 'ヒンディー語',
        'th': 'タイ語',
        'vi': 'ベトナム語',
        'id': 'インドネシア語',
        'tr': 'トルコ語',
        'pl': 'ポーランド語',
        'nl': 'オランダ語',
        'sv': 'スウェーデン語',
        'da': 'デンマーク語'
    };
    return languageMap[code.toLowerCase()] || code.toUpperCase();
}

/**
 * 言語の絵文字
 */
export function getLanguageEmoji(code: string): string {
    const emojiMap: Record<string, string> = {
        'ja': '🇯🇵',
        'en': '🇺🇸',
        'ko': '🇰🇷',
        'zh': '🇨🇳',
        'es': '🇪🇸',
        'fr': '🇫🇷',
        'de': '🇩🇪',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'ru': '🇷🇺',
        'ar': '🇸🇦',
        'hi': '🇮🇳',
        'th': '🇹🇭',
        'vi': '🇻🇳',
        'id': '🇮🇩',
        'tr': '🇹🇷',
        'pl': '🇵🇱',
        'nl': '🇳🇱',
        'sv': '🇸🇪',
        'da': '🇩🇰'
    };
    return emojiMap[code.toLowerCase()] || '🌐';
}




