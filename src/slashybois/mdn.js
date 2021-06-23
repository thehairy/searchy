const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const querystring = require('querystring');
const turndown = require('turndown');
const { embedButtons } = require('../utils');

const create = {
    name: 'mdn',
    description: 'Searches MDN for the provided query.',
    options: [
        {
            name: 'query',
            type: 'STRING',
            description: 'The query to search for',
            required: true
        }
    ]
}

const cache = new Map();

module.exports = {
    name: 'mdn',
    create: create,
    execute: async (client, interaction) => {
        await interaction.defer({ ephemeral: false });

        const query = interaction.options.first().value;
        const qString = `https://developer.mozilla.org/api/v1/search?${querystring.encode({ q: query })}`;
        
        let body = cache.get(qString);
        if (!body) {
            const res = await fetch(qString).then(r => r.json());
            body = res.documents?.[0];
            cache.set(qString, body);
        }

        if (!body) return await interaction.followUp({ content: `No result found.`, ephemeral: true });

		const url = `https://developer.mozilla.org${body.mdn_url}`;

		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;
		const intro = body.summary.replace(/\s+/g, ' ')
			.replace(linkReplaceRegex, `[$1](https://developer.mozilla.org<$2>)`)
			.replace(boldCodeBlockRegex, '**`$1`**');

        const embed = new MessageEmbed()
            .setColor(0x066fad)
            .setAuthor('MDN', 'https://i.imgur.com/DFGXabG.png', 'https://developer.mozilla.org/')
            .setURL(url)
            .setTitle(body.title)
            .setDescription(intro);

        return interaction.editReply({ embeds: [embed] /*, components: [embedButtons()]*/ });
    }
}