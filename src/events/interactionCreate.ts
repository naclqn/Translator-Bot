import { ChatInputCommandInteraction } from 'discord.js';
import { commands } from '../commands/slash';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands.find(cmd => cmd.data.name === interaction.commandName);
    
    if (command) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`コマンド ${interaction.commandName} の実行中にエラーが発生しました:`, error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ コマンドの実行中にエラーが発生しました。',
                    ephemeral: true
                });
            }
        }
    }
}

