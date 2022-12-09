const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Steal an emoji from another server')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji to steal')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the emoji')
                .setRequired(false)
        ),
    run: async (client, interaction, db) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) return interaction.reply({ content: 'You don\'t have permission to use this command!', ephemeral: true })

        const emoji = interaction.options.getString('emoji')
        const name = interaction.options.getString('name') || emoji.split(':')[1]

        const emojiId = emoji.split(':')[2].replace('>', '')

        if (emojiId) {
            const guild = interaction.guild

            const emoji = await guild.emojis.create({ attachment: `https://cdn.discordapp.com/emojis/${emojiId}.png`, name: name })

            return interaction.reply({ content: emoji.toString(), ephemeral: true })
        } else {
            return interaction.reply({ content: 'Invalid emoji!', ephemeral: true })
        }
    }
}