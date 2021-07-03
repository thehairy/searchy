import type {
  ApplicationCommandData,
  CommandInteraction,
  CommandInteractionOption,
  MessageComponentInteraction,
  GuildMember,
  Message,
} from 'discord.js';
import { MessageButton, MessageEmbed, Permissions } from 'discord.js';
import type { GoogleItem } from 'src/@types';
import { cleanBreaks, fetchJSON } from '../utils.js';

export async function run(interaction: CommandInteraction): Promise<unknown> {
  await interaction.defer();

  const message = (await interaction.fetchReply()) as Message;
  const button = new MessageButton()
    .setCustomID('delete')
    .setEmoji('bin:857030444590432286')
    .setStyle('DANGER');
  const { value: query } = interaction.options.get(
    'query'
  ) as CommandInteractionOption;

  const API_KEY = process.env.GOOGLE_API_KEY;
  const SEARCH_KEY = process.env.GOOGLE_SEARCH_KEY;
  const API_URL = 'https://www.googleapis.com/customsearch/v1';

  const URL = `${API_URL}?key=${API_KEY}&cx=${SEARCH_KEY}&q=${query}`;

  const res = await fetchJSON(URL);

  if (!res.items)
    return interaction.followUp({
      content: 'No search result found.',
      ephemeral: true,
    });

  const item: GoogleItem = res.items[0];

  const embed = new MessageEmbed()
    .setColor(0x0000cb)
    .setAuthor(
      'Google',
      'https://img.icons8.com/color/452/google-logo.png',
      'https://www.google.com/'
    )
    .setTitle(item.title)
    .setDescription(cleanBreaks(item.snippet))
    .setURL(item.link);
  if (item.pagemap.cse_thumbnail[0].src)
    embed.setThumbnail(item.pagemap.cse_thumbnail[0].src);

  interaction.editReply({ embeds: [embed], components: [[button]] });

  const filter = (i: MessageComponentInteraction) =>
    i.customID === 'delete' &&
    (i.user.id === interaction.user.id ||
      (i.member as GuildMember)?.permissions?.has(
        Permissions.FLAGS.MANAGE_MESSAGES
      ));
  return message
    .awaitMessageComponentInteraction({ filter, time: 15000 })
    .then(() => interaction.deleteReply())
    .catch(() => message.edit({ components: [] }));
}

export const data: ApplicationCommandData = {
  name: 'google',
  description: 'Searches Google for the provided query.',
  options: [
    {
      name: 'query',
      type: 'STRING',
      description: 'The query to search for',
      required: true,
    },
  ],
};
