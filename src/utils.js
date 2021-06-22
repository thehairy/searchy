const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
    embedButtons: () => {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomID('delete')
                    .setEmoji('bin:857030444590432286')
                    .setStyle('DANGER')
            );

        return row;
    }
}