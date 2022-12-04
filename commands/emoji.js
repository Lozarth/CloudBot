const { PermissionsBitField, Utils } = require('discord.js')

module.exports = {
    name: 'emoji',
    run: async (client, interaction, db) => {
        if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojis)) {
            const emoji = interaction.options.getString('emoji')
            const name = interaction.options.getString('name')

            const parsedEmoji = Utils.parseEmoji(emoji)

            if (parsedEmoji.id) {
                const guild = interaction.guild

                const emoji = await guild.emojis.create(`https://cdn.discordapp.com/emojis/${parsedEmoji.id}.${parsedEmoji.animated ? 'gif' : 'png'}`, name)

                return interaction.reply({ content: `Created emoji: ${emoji}` })
            } else {
                return interaction.reply({ content: 'Invalid emoji!', ephemeral: true })
            }
        }
    }
}