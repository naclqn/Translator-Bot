import { Message } from 'discord.js';
import { Translator } from '../../services/translator';
import { getChannelSetting } from '../../database';
import { isValidLanguageCode } from '../../utils/language';
import { createTranslationEmbed } from '../../utils/embeds';
import { DEFAULT_TARGET_LANGUAGE } from '../../config';

export async function execute(
    message: Message,
    translator: Translator,
    targetLang: string | undefined,
    text: string
): Promise<void> {
    // チャンネルの翻訳機能が無効化されているかチェック
    const channelId = message.channelId;
    const isEnabled = await getChannelSetting(channelId);
    
    console.log(`[DEBUG] チャンネル設定確認: channelId=${channelId}, enabled=${isEnabled}`);
    
    if (!isEnabled) {
        await message.reply('❌ このチャンネルでは翻訳機能が無効化されています。\n`/translate-enable` で有効化してください。');
        return;
    }

    // テキストが指定されていない場合
    if (!text || text.trim().length === 0) {
        await message.reply('❌ 翻訳するテキストを指定してください。\n例: `!translate en こんにちは`');
        return;
    }

    // 言語コードの検証
    const finalTargetLang = targetLang || DEFAULT_TARGET_LANGUAGE;
    if (!isValidLanguageCode(finalTargetLang)) {
        await message.reply(`❌ 無効な言語コードです: ${finalTargetLang}\n\`!help\` で対応言語を確認してください。`);
        return;
    }

    // テキストが長すぎる場合
    if (text.length > 2000) {
        await message.reply('❌ 翻訳するテキストが長すぎます（2000文字以内）');
        return;
    }

    // 翻訳処理（タイピングインジケーターを表示）
    if ('sendTyping' in message.channel && typeof message.channel.sendTyping === 'function') {
        await message.channel.sendTyping();
    }
    
    try {
        
        const result = await translator.translate(text, finalTargetLang);

        // 言語検出（英語と日本語のみ、API呼び出しなし）
        const sourceLang = translator.detectLanguage(text);
        
        const embed = createTranslationEmbed(
            text,
            result.text,
            sourceLang,
            finalTargetLang
        );

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('翻訳エラー:', error);
        const errorMessage = error instanceof Error 
            ? error.message 
            : '不明なエラーが発生しました';
        await message.reply(`❌ 翻訳中にエラーが発生しました: ${errorMessage}`);
    }
}

