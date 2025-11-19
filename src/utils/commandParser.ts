/**
 * コマンドの解析（例: !translate en こんにちは）
 */
export function parseCommand(content: string): {
    command: string;
    targetLang?: string;
    text?: string;
} | null {
    const trimmed = content.trim();
    
    console.log(`[DEBUG] コマンド解析: "${trimmed}"`);
    
    // !translate または !t コマンド
    if (trimmed.startsWith('!translate ') || trimmed.startsWith('!t ')) {
        const parts = trimmed.split(/\s+/);
        console.log(`[DEBUG] コマンド部分: ${JSON.stringify(parts)}`);
        if (parts.length >= 3) {
            // !translate en テキスト
            const targetLang = parts[1];
            const text = parts.slice(2).join(' ');
            console.log(`[DEBUG] 翻訳コマンド解析成功: targetLang=${targetLang}, text=${text.substring(0, 50)}...`);
            return { command: 'translate', targetLang, text };
        } else if (parts.length === 2) {
            // !translate テキスト（デフォルト言語に翻訳）
            const text = parts[1];
            console.log(`[DEBUG] 翻訳コマンド解析成功（デフォルト言語）: text=${text.substring(0, 50)}...`);
            return { command: 'translate', text };
        }
    }
    
    // !help コマンド
    if (trimmed === '!help' || trimmed === '!h') {
        console.log(`[DEBUG] ヘルプコマンド解析成功`);
        return { command: 'help' };
    }
    
    console.log(`[DEBUG] コマンド解析失敗: 該当なし`);
    return null;
}

