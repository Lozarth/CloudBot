const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webhook-sharex')
        .setDescription('Generate a ShareX config for your upload channel'),
    run: async (client, interaction, db) => {
        const hasChannel = db.has(interaction.user.id) 
        if (!hasChannel) return interaction.reply({ content: `You don't have an upload channel!\n<#1041848988158148639>`, ephemeral: true })

        const channelId = db.get(interaction.user.id)
        const channel = await client.channels.fetch(channelId)
        const webhooks = await channel.fetchWebhooks()

        if (webhooks.size === 0) {
            const newWebhook = await channel.createWebhook({
                name: 'ShareX Upload',
                avatar: 'https://getsharex.com/img/ShareX_Logo.png'
            })

            const ShareXConfig = JSON.stringify({
                Version: '14.1.0',
                Name: 'Discord Cloud',
                DestinationType: 'ImageUploader, TextUploader, FileUploader',
                RequestMethod: 'POST',
                RequestURL: newWebhook.url,
                Body: 'MultipartFormData',
                Arguments: {
                    content: '{filename}',
                    tts: 'false'
                },
                FileFormName: 'file',
                URL: '{json:attachments[0].url}'
            })

            console.log(`${interaction.user.username} generated a ShareX config.`)

            return interaction.reply({ content: 'Download and open the file below with ShareX to start uploading files to your upload channel via ShareX.', files: [{ name: 'Discord Webhook.sxcu', attachment: Buffer.from(ShareXConfig) }], ephemeral: true })
        } else {
            const webhook = webhooks.first()

            const ShareXConfig = JSON.stringify({
                Version: '14.1.0',
                Name: 'Discord Cloud',
                DestinationType: 'ImageUploader, TextUploader, FileUploader',
                RequestMethod: 'POST',
                RequestURL: webhook.url,
                Body: 'MultipartFormData',
                Arguments: {
                    content: '{filename}',
                    tts: 'false'
                },
                FileFormName: 'file',
                URL: '{json:attachments[0].url}'
            })

            console.log(`${interaction.user.username} generated a ShareX config.`)

            return interaction.reply({ content: 'Download and open the file below with ShareX to start uploading files to your upload channel via ShareX.', files: [{ name: 'Discord Webhook.sxcu', attachment: Buffer.from(ShareXConfig) }], ephemeral: true })
        }
    }
}