import { Message } from 'discord.js';
import { Translator } from '../services/translator';
import { getChannelSetting } from '../database';
import { createTranslationEmbed } from '../utils/embeds';

export async function execute(message: Message, translator: Translator): Promise<void> {
    // Bot自身のメッセージは無視
    if (message.author.bot) {
        return;
    }

    // DMは無視（サーバーでのみ動作）
    if (!message.guild) {
        return;
    }

    // メッセージが空の場合は無視
    const content = message.content?.trim();
    if (!content || content.length === 0) {
        return;
    }

    // チャンネルの翻訳機能が無効化されているかチェック
    const channelId = message.channelId;
    const isEnabled = await getChannelSetting(channelId);
    
    if (!isEnabled) {
        return;
    }

    // メッセージが長すぎる場合は無視
    if (content.length > 2000) {
        return;
    }

    // 自動翻訳を実行
    autoTranslate(message, translator, content).catch(error => {
        console.error('自動翻訳中にエラーが発生しました:', error);
    });
}

async function autoTranslate(message: Message, translator: Translator, text: string): Promise<void> {
    // 言語を自動検出
    const sourceLang = translator.detectLanguage(text);
    
    // 翻訳先言語を決定（日本語なら英語、英語なら日本語）
    const targetLang = sourceLang === 'ja' ? 'en' : 'ja';
    
    // タイピングインジケーターを表示
    if ('sendTyping' in message.channel && typeof message.channel.sendTyping === 'function') {
        await message.channel.sendTyping();
    }
    
    try {
        const result = await translator.translate(text, targetLang);
        
        const embed = createTranslationEmbed(
            text,
            result.text,
            sourceLang,
            targetLang
        );

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('翻訳エラー:', error);
        // エラー時は静かに失敗（メッセージを送らない）
    }
}

