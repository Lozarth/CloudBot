module.exports = {
    name: 'delete_channel_confirm',
    run: async (client, interaction, db) => {
        db.delete(interaction.user.id)
        db.delete(interaction.channel.id)

        console.log(`${interaction.user.username} deleted their upload channel.`)

        return interaction.channel.delete()
    }
}