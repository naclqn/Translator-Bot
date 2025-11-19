import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { setChannelSetting } from '../../database';

export const data = new SlashCommandBuilder()
    .setName('translate-disable')
    .setDescription('このチャンネルで翻訳機能を無効化します')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channelId = interaction.channelId;
    await setChannelSetting(channelId, false);
    
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle('❌ 翻訳機能を無効化しました')
                .setDescription('このチャンネルで翻訳機能が無効になりました。')
                .setColor(0xFF0000)
                .setTimestamp()
        ],
        ephemeral: true
    });
}

