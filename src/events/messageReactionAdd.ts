import { MessageReaction, User, PartialMessageReaction, PartialUser, Message } from 'discord.js';
import { Translator } from '../services/translator';
import { getChannelSetting } from '../database';
import { createTranslationEmbed } from '../utils/embeds';

export async function execute(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    translator: Translator
): Promise<void> {
    // Bot自身のリアクションは無視
    if (user.bot) {
        return;
    }

    // リアクションが✅（white_check_mark）でない場合は無視
    if (reaction.emoji.name !== '✅' && reaction.emoji.name !== 'white_check_mark') {
        return;
    }

    // メッセージを取得（部分的な場合は完全なメッセージを取得）
    const message: Message = reaction.message.partial 
        ? await reaction.message.fetch() 
        : reaction.message as Message;

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

    // 翻訳を実行
    await translateMessage(message, translator, content, user);
}

async function translateMessage(
    message: Message,
    translator: Translator,
    text: string,
    user: User | PartialUser
): Promise<void> {
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

        // リアクションをしたユーザーをメンションして送信
        if ('send' in message.channel && typeof message.channel.send === 'function') {
            await message.channel.send({
                content: `${user}`,
                embeds: [embed]
            });
        }
    } catch (error) {
        console.error('翻訳エラー:', error);
        // エラー時は静かに失敗（メッセージを送らない）
    }
}

