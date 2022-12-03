module.exports = {
    name: 'share',
    run: async (client, interaction, db) => {
        const targetUser = interaction.options.getUser('user')

        if (targetUser.id === interaction.user.id) return interaction.reply({ content: 'Cannot share channel with self!', ephemeral: true })

        const hasChannel = await db.has(interaction.user.id)
        if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

        const channelId = await db.get(interaction.user.id)
        const channel = await client.channels.fetch(channelId)

        await channel.permissionOverwrites.create(targetUser.id, {
            ViewChannel: true
        })

        console.log(`${interaction.user.tag} shared their upload channel with ${targetUser.tag}.`)

        return interaction.reply({ content: 'Shared upload channel with user! Use **/unshare** to unshare.', ephemeral: true })
    }
}