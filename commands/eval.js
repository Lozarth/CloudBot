const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluates code')
        .addAttachmentOption(option =>
            option.setName('code')
                .setDescription('The code to evaluate')
                .setRequired(true)
        ),
    run: async (client, interaction, db, fetch) => {
        if (interaction.user.id !== '339492485854396426') return interaction.reply({ content: 'You are not the bot owner!', ephemeral: true })

        const attachment = interaction.options.getAttachment('code')
        const code = await fetch(attachment.url).then(res => res.text())

        let result
        try {
            result = eval(code)
        } catch (error) {
            return interaction.reply({ content: `Error: ${error}`, ephemeral: true })
        }

        return interaction.reply({ content: `Result: ${result}`, ephemeral: true })
    }
}