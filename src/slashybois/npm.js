const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const fetch = require('node-fetch');
const { embedButtons } = require('../utils');

const create = {
    name: 'npm',
    description: 'Searches NPM for the provided query.',
    options: [
        {
            name: 'query',
            type: 'STRING',
            description: 'The query to search for',
            required: true
        }
    ]
}

module.exports = {
    name: 'npm',
    create: create,
    execute: async (client, interaction) => {
        await interaction.defer({ ephemeral: false });

        const pkg = interaction.options.first().value;

        const res = await fetch(`https://registry.npmjs.com/${pkg}`);
        if (res.status === 404) return await interaction.editReply({ content: `No package with the name ${pkg} found.`});
        const body = await res.json();

        if (body.time?.unpublished) return await interaction.editReply({ content: `The owner of this package decided to unpublish it.`});

        const version = body['dist-tags'] ? body.versions[body['dist-tags']?.latest] : {};
        const maintainers = _trimArray(body.maintainers.map(user => user.name));
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
			.addField('❯ Creation Date', moment.utc(body.time.created).format('YYYY/MM/DD HH:mm:ss'), true)
			.addField('❯ Modification Date', moment.utc(body.time.modified).format('YYYY/MM/DD HH:mm:ss'), true)
			.addField('❯ Main File', version.main || 'index.js', true)
			.addField('❯ Dependencies', dependencies?.length ? dependencies.join(', ') : 'None')
			.addField('❯ Maintainers', maintainers.join(', '));

        await interaction.editReply({ embeds: [embed] /*, components: [embedButtons()]*/ });
    }
}

const _trimArray = (arr) => {
    if (arr.length > 10) {
        const len = arr.length - 10;
        arr = arr.slice(0, 10);
        arr.push(`${len} more...`);
    }

    return arr;
}