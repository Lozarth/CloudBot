const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'ping',
    run: async (client, interaction, db) => {
        const botPing = Date.now() - interaction.createdTimestamp
        const apiPing = client.ws.ping

        const embed = new EmbedBuilder()
            .setTitle('Pong! :ping_pong:')
            .setFields(
                { name: 'Bot Ping', value: `${botPing}ms`, inline: true },
                { name: 'API Ping', value: `${apiPing}ms`, inline: true }
            )
            .setColor('#5564f2')

        return interaction.reply({ embeds: [embed], ephemeral: true })
    }
}