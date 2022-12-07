module.exports = {
    name: 'unshare',
    description: 'Unshares your upload channel with another user',
    options: [
        {
            name: 'user',
            description: 'User to unshare the channel with',
            type: 6,
            required: true
        }
    ],
    run: async (client, interaction, db) => {
        const targetUser = interaction.options.getUser('user')

        if (targetUser.id === interaction.user.id) return interaction.reply({ content: 'Cannot unshare channel with self!', ephemeral: true })

        const hasChannel = db.has(interaction.user.id)
        if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

        const channelId = db.get(interaction.user.id)
        const channel = await client.channels.fetch(channelId)

        await channel.permissionOverwrites.create(targetUser.id, {
            ViewChannel: false
        })

        console.log(`${interaction.user.username} unshared their upload channel with ${targetUser.username}.`)

        return interaction.reply({ content: 'Unshared upload channel with user!', ephemeral: true })
    }
}