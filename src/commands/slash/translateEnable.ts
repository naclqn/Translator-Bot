import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { setChannelSetting } from '../../database';
import { createEnableInstructionEmbed } from '../../utils/embeds';

export const data = new SlashCommandBuilder()
    .setName('translate-enable')
    .setDescription('このチャンネルで翻訳機能を有効化します')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channelId = interaction.channelId;
    await setChannelSetting(channelId, true);
    
    const embed = createEnableInstructionEmbed();
    
    await interaction.reply({
        embeds: [embed]
    });
}
