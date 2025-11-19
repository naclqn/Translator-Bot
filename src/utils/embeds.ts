import { EmbedBuilder } from 'discord.js';
import { getLanguageEmoji } from './language';

/**
 * ヘルプメッセージの生成
 */
export function createHelpEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('📚 翻訳Bot ヘルプ')
        .setDescription('このBotは**Gemini 1.5 Flash**を使用して自然な翻訳を提供します。')
        .addFields(
            {
                name: '💡 基本的な使い方',
                value: '```\n!translate [言語コード] [テキスト]\n!t [言語コード] [テキスト]\n```',
                inline: false
            },
            {
                name: '📖 使用例',
                value: '```\n!translate en こんにちは\n!t ja Hello, how are you?\n!translate こんにちは\n```\n（最後の例はデフォルト言語に翻訳）',
                inline: false
            },
            {
                name: '🌍 対応言語',
                value: '🇯🇵 ja 🇺🇸 en 🇰🇷 ko 🇨🇳 zh 🇪🇸 es 🇫🇷 fr 🇩🇪 de 🇮🇹 it 🇵🇹 pt 🇷🇺 ru\n🇸🇦 ar 🇮🇳 hi 🇹🇭 th 🇻🇳 vi 🇮🇩 id 🇹🇷 tr 🇵🇱 pl 🇳🇱 nl 🇸🇪 sv 🇩🇰 da',
                inline: false
            },
            {
                name: '⚙️ その他のコマンド',
                value: '`!help` または `!h` - このヘルプを表示',
                inline: false
            }
        )
        .setColor(0x5865F2)
        .setTimestamp();
}

/**
 * 翻訳機能有効化時の説明Embedを生成
 */
export function createEnableInstructionEmbed(): EmbedBuilder {
    const jaEmoji = getLanguageEmoji('ja');
    const enEmoji = getLanguageEmoji('en');
    
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setDescription(
            `**${jaEmoji} JP**\`\`\`\n翻訳したいメッセージに✅のリアクションを付けてください。\n\`\`\`\n**${enEmoji} EN**\`\`\`\nPlease add a ✅ reaction to the message you want to translate.\n\`\`\``
        );
}

/**
 * 翻訳結果のEmbedを生成（コンパクト版）
 */
export function createTranslationEmbed(
    sourceText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string
): EmbedBuilder {
    const sourceEmoji = getLanguageEmoji(sourceLang);
    const targetEmoji = getLanguageEmoji(targetLang);
    const sourceLangUpper = sourceLang.toUpperCase();
    const targetLangUpper = targetLang.toUpperCase();
    
    // テキストが長すぎる場合は切り詰め
    const displaySourceText = sourceText.length > 1000 
        ? sourceText.substring(0, 997) + '...' 
        : sourceText;
    const displayTranslatedText = translatedText.length > 1000 
        ? translatedText.substring(0, 997) + '...' 
        : translatedText;
    
    // コンパクトなデザイン：改行を最小限に（コードブロックは前後に自動改行が入るため、前の改行を削除）
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setDescription(
            `**${sourceEmoji} ${sourceLangUpper}**\`\`\`\n${displaySourceText}\n\`\`\`\n**${targetEmoji} ${targetLangUpper}**\`\`\`\n${displayTranslatedText}\n\`\`\``
        );
}
