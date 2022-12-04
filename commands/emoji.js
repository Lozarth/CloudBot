const { PermissionsBitField } = require('discord.js')

module.exports = {
    name: 'emoji',
    run: async (client, interaction, db) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) return interaction.reply({ content: 'You don\'t have permission to use this command!', ephemeral: true })
        
        const emoji = interaction.options.getString('emoji')
        const name = interaction.options.getString('name')

        const emojiId = emoji.split(':')[2].replace('>', '')

        if (emojiId) {
            const guild = interaction.guild

            const emoji = await guild.emojis.create({ attachment: `https://cdn.discordapp.com/emojis/${emojiId}.png`, name: name })

            return interaction.reply({ content: `Created emoji: ${emoji}` })
        } else {
            return interaction.reply({ content: 'Invalid emoji!', ephemeral: true })
        }
    }
}