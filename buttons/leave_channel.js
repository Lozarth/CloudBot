module.exports = {
    name: 'leave_channel',
    run: async (client, interaction, db) => {
        const channelOwnerId = await db.get(interaction.channel.id)
        if (interaction.user.id === channelOwnerId) return interaction.reply({ content: 'Channel owners can\'t leave their own channel!', ephemeral: true })

        await interaction.channel.permissionOverwrites.create(interaction.user.id, {
            ViewChannel: false
        })

        console.log(`${interaction.user.name} left an upload channel.`)

        return interaction.reply({ content: 'Left channel!', ephemeral: true })
    }
}