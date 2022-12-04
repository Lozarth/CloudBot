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

        // system info
        const cpu = os.cpus()[0].model
        const cpuUsage = Math.round(process.cpuUsage().system / 1024 / 1024)
        const ramUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        const ramTotal = Math.round(os.totalmem() / 1024 / 1024)

        const embed2 = new EmbedBuilder()
            .setTitle('System Info')
            .setFields(
                { name: 'CPU', value: cpu, inline: true },
                { name: 'CPU Usage', value: `${cpuUsage}MB`, inline: true },
                { name: 'RAM Usage', value: `${ramUsage}MB`, inline: true },
                { name: 'RAM Total', value: `${ramTotal}MB`, inline: true }
            )
            .setColor('#5564f2')

        return interaction.reply({ embeds: [embed, embed2] })
    }
}