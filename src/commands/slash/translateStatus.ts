import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getChannelSetting } from '../../database';

export const data = new SlashCommandBuilder()
    .setName('translate-status')
    .setDescription('このチャンネルの翻訳機能の状態を確認します');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channelId = interaction.channelId;
    const isEnabled = await getChannelSetting(channelId);
    
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle('📊 翻訳機能の状態')
                .setDescription(
                    isEnabled 
                        ? '✅ **有効**\nこのチャンネルで翻訳機能が使用できます。'
                        : '❌ **無効**\nこのチャンネルで翻訳機能は使用できません。'
                )
                .setColor(isEnabled ? 0x00FF00 : 0xFF0000)
                .setTimestamp()
        ],
        ephemeral: true
    });
}

