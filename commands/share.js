module.exports = {
    name: 'share',
    description: 'Shares your upload channel with another user',
    options: [
        {
            name: 'user',
            description: 'User to share the channel with',
            type: 6,
            required: true
        }
    ],
    run: async (client, interaction, db) => {
        const targetUser = interaction.options.getUser('user')

        if (targetUser.id === interaction.user.id) return interaction.reply({ content: 'Cannot share channel with self!', ephemeral: true })

        const hasChannel = db.has(interaction.user.id)
        if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

        const channelId = db.get(interaction.user.id)
        const channel = await client.channels.fetch(channelId)

        await channel.permissionOverwrites.create(targetUser.id, {
            ViewChannel: true
        })

        console.log(`${interaction.user.username} shared their upload channel with ${targetUser.username}.`)

        return interaction.reply({ content: 'Shared upload channel with user! Use **/unshare** to unshare.', ephemeral: true })
    }
}