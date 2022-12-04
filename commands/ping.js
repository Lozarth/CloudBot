const { EmbedBuilder } = require('discord.js')
const os = require('node:os')

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
            .setFooter({ text: `Running on Ubuntu ${os.release()} (${os.arch()})`, iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Logo-ubuntu_cof-orange-hex.svg/1200px-Logo-ubuntu_cof-orange-hex.svg.png' })
    }
}