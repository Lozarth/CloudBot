module.exports = {
    name: 'delete_channel_confirm',
    run: async (client, interaction, db) => {
        await db.delete(interaction.user.id)
        await db.delete(interaction.channel.id)

        console.log(`${interaction.user.name} deleted their upload channel.`)

        return interaction.channel.delete()
    }
}