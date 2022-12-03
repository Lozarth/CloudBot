const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js')

module.exports = {
    name: 'create_channel',
    run: async (client, interaction, db) => {
        const guild = interaction.guild

        if (!interaction.member.roles.cache.has('1041858413816205312')) return interaction.reply({ content: 'Please read and accept the rules before creating a channel!\n<#1041857262567833640>', ephemeral: true })

        const hasChannel = await db.has(interaction.user.id)
        if (hasChannel) {
            const channelId = await db.get(interaction.user.id)
            const channel = await client.channels.fetch(channelId)
            await channel.permissionOverwrites.create(interaction.user.id, {
                ViewChannel: true
            })
            
            return interaction.reply({ content: 'You already have a channel!', ephemeral: true })
        }

        const channel = await guild.channels.create({
            name: interaction.user.username.toString(),
            type: ChannelType.GuildText
        })

        await channel.setParent('1041849029883080744')

        await channel.permissionOverwrites.set([
            {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
            },
            {
                id: guild.roles.everyone,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: '1041848288070090902',
                deny: [PermissionsBitField.Flags.ViewChannel]
            }
        ])

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Delete Channel')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('delete_channel'),
                new ButtonBuilder()
                    .setLabel('Leave Channel')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('leave_channel')
            )

        const boostLevel = guild.premiumTier
        if (boostLevel === 3) {
            const wlc = await channel.send({ content: `Enjoy your new file upload channel! The server is currently at **Level ${guild.premiumTier}** boosting, free **100mb** file uploads!\n\nUse \`/share [user]\` or right click on someones profile and use the **Share Upload** button under **Apps** to share this channel with another user! (They won't be able to delete the channel)\n\nIf you would like to delete this channel and the files sent in here, click the delete me button below.`, components: [row] })
            await wlc.pin()
        } else if (boostLevel === 2) {
            const wlc = await channel.send({ content: `Enjoy your new file upload channel! The server is currently at **Level ${guild.premiumTier}** boosting, free **50mb** file uploads!\n\nUse \`/share [user]\` or right click on someones profile and use the **Share Upload** button under **Apps** to share this channel with another user! (They won't be able to delete the channel)\n\nIf you would like to delete this channel and the files sent in here, click the delete me button below.`, components: [row] })
            await wlc.pin()
        } else {
            const wlc = await channel.send({ content: `Enjoy your new file upload channel! The server is currently at **Level ${guild.premiumTier}** boosting.\n\nUse \`/share [user]\` or right click on someones profile and use the **Share Upload** button under **Apps** to share this channel with another user! (They won't be able to delete the channel)\n\nIf you would like to delete this channel and the files sent in here, click the delete me button below.`, components: [row] })
            await wlc.pin()
        }

        await db.set(interaction.user.id, channel.id)
        await db.set(channel.id, interaction.user.id)

        console.log(`Created personal channel for ${interaction.user.name}`)

        return interaction.reply({ content: `Created personal channel <#${channel.id}>`, ephemeral: true })
    }
}