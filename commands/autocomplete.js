const { SlashCommandBuilder } = require('discord.js')
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autocomplete')
        .setDescription('Autocomplete command')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Input to autocomplete')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    run: async (client, interaction, db) => {
        const input = interaction.options.getString('input')

        return interaction.reply({ content: `https://www.google.com/search?q=${input}`, ephemeral: true })
    },
    autocomplete: async (client, interaction, db) => {
        const focusedValue = interaction.options.getFocused()
        const google = await axios.get(`https://suggestqueries.google.com/complete/search?client=firefox&q=${focusedValue}`)
        const suggestions = google.data[1]

        await interaction.respond({
            type: 8,
            data: {
                choices: suggestions.map(suggestion => {
                    return {
                        name: suggestion,
                        value: suggestion
                    }
                }
                )
            },
        })
    }
}