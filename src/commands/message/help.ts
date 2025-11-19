import { Message } from 'discord.js';
import { createHelpEmbed } from '../../utils/embeds';

export async function execute(message: Message): Promise<void> {
    await message.reply({ embeds: [createHelpEmbed()] });
}




