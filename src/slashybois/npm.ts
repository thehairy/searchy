import type { ApplicationCommandData, CommandInteraction, CommandInteractionOption, MessageComponentInteraction, GuildMember, Message } from 'discord.js';
import type { NPMUser } from 'src/@types';
import fetch from 'node-fetch';
import { default as dayjs } from 'dayjs';
import { MessageEmbed, MessageButton, Permissions } from 'discord.js';
import { _trimArray } from '../utils.js';

export async function run(interaction: CommandInteraction): Promise<unknown> {
    await interaction.defer();

    const message = await interaction.fetchReply() as Message;
    const button = new MessageButton()
        .setCustomID('delete')
        .setEmoji('bin:857030444590432286')
        .setStyle('DANGER')
    ;
    
    const { value: pkg } = interaction.options.get('query') as CommandInteractionOption;
    const res = await fetch(`https://registry.npmjs.com/${pkg}`);

    if (res.status === 404) return interaction.editReply(`No package with the name ${pkg} found.`);
    const body = await res.json();
    if (body.time?.unpublished) return interaction.editReply(`The owner of this package decided to unpublish it.`);

    const version = body['dist-tags'] ? body.versions[body['dist-tags']?.latest] : {};
    const maintainers = _trimArray(body.maintainers.map((user: NPMUser) => user.name));
    const dependencies = version.dependencies ? _trimArray(Object.keys(version.dependencies)) : null;

    const embed = new MessageEmbed()
        .setColor(0xcb0000)
        .setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com/')
        .setTitle(body.name)
        .setURL(`https://www.npmjs.com/package/${pkg}`)
        .setDescription(body.description || 'No description.')
        .addField('❯ Version', body['dist-tags']?.latest ?? 'Unknown', true)
        .addField('❯ License', body.license || 'None', true)
        .addField('❯ Author', body.author ? body.author.name : 'Unknown', true)
        .addField('❯ Creation Date', dayjs(body.time.created).format('YYYY/MM/DD HH:mm:ss'))
        .addField('❯ Modification Date', dayjs(body.time.modified).format('YYYY/MM/DD HH:mm:ss'))
        .addField('❯ Main File', version.main || 'index.js', true)
        .addField('❯ Dependencies', dependencies?.length ? dependencies.join(', ') : 'None')
        .addField('❯ Maintainers', maintainers.join(', '));

    interaction.editReply({ embeds: [embed], components: [[button]] });

    const filter = (i: MessageComponentInteraction) => i.customID === 'delete' && (i?.member as GuildMember).permissions.has(Permissions.FLAGS.MANAGE_MESSAGES);
    return message.awaitMessageComponentInteraction(filter, { time: 15000 }).then(async () => await interaction.deleteReply());
}

export const data: ApplicationCommandData = {
    name: 'npm',
    description: 'Searches NPM for the provided query.',
    options: [
        {
            name: 'query',
            type: 'STRING',
            description: 'The query to search for',
            required: true,
        },
    ],
};