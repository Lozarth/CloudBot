module.exports = {
    name: 'accept',
    run: async (client, interaction, db) => {
        const guild = interaction.guild

        try {
            const role = await guild.roles.fetch('1041858413816205312')
            await interaction.member.roles.add(role)
        } catch (error) {
            await interaction.reply({ content: `An unknown error occured while trying to give you your role.\n${error}`, ephemeral: true })
            return console.error(error)
        }

        console.log(`${interaction.user.username} accepted the rules.`)

        return interaction.reply({ content: 'You have accepted the rules!', ephemeral: true })
    }
}