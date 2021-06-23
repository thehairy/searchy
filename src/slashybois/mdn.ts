import type { ApplicationCommandData, CommandInteraction, CommandInteractionOption, MessageComponentInteraction, GuildMember, Message } from 'discord.js';
import { MessageButton, Permissions } from 'discord.js';
import { fetchJSON } from '../utils.js';

export async function run(interaction: CommandInteraction): Promise<unknown> {
    await interaction.defer();

    const message = await interaction.fetchReply() as Message;
    const button = new MessageButton()
        .setCustomID('delete')
        .setEmoji('bin:857030444590432286')
        .setStyle('DANGER')
    ;
    
    const { value: query } = interaction.options.get('query') as CommandInteractionOption;
    const embed = await fetchJSON(`https://mdn.gideonbot.com/embed?q=${query}`);
    if (embed.code === 404) return interaction.editReply(`No result found.`);

    interaction.editReply({ embeds: [embed], components: [[button]] });

    const filter = (i: MessageComponentInteraction) => i.customID === 'delete' && (i?.member as GuildMember).permissions.has(Permissions.FLAGS.MANAGE_MESSAGES);
    return message.awaitMessageComponentInteraction(filter, { time: 15000 }).then(async () => await interaction.deleteReply());
}

export const data: ApplicationCommandData = {
    name: 'mdn',
    description: 'Searches MDN for the provided query.',
    options: [
        {
            name: 'query',
            type: 'STRING',
            description: 'The query to search for',
            required: true,
        },
    ],
};