const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js')

module.exports = {
    name: 'delete_channel',
    run: async (client, interaction, db) => {
        const ownedChannelId = await db.get(interaction.user.id)
        if (ownedChannelId !== interaction.channel.id) return interaction.reply({ content: 'Only the owner can delete this channel!', ephemeral: true })

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Confirm Delete')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('delete_channel_confirm')
            )

        return interaction.reply({ content: 'Are you sure you want to delete this channel? It cannot be undone and your files cannot be recovered.', components: [row], ephemeral: true })

    }
}