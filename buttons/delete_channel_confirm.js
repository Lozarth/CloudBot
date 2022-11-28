module.exports = {
    name: 'delete_channel_confirm',
    run: async (client, interaction, db) => {
        await db.delete(interaction.user.id)
        await db.delete(interaction.channel.id)

        return interaction.channel.delete()
    }
}