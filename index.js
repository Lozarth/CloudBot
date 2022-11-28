const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, MessageType, ButtonStyle, REST, Routes } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] })

const JSONdb = require('simple-json-db')
const db = new JSONdb('./database.json')

require('dotenv').config()

const commands = require('./commands.json')

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)

    try {
        console.log('Started refreshing application (/) commands.')

        const rest = new REST({ version: '10' }).setToken(client.token)
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands })

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'accept') {
            const guild = interaction.guild

            try {
                const role = await guild.roles.fetch('1041858413816205312')
                await interaction.member.roles.add(role)
            } catch (error) {
                await interaction.reply({ content: `An unknown error occured while trying to give you your role.\n${error}`, ephemeral: true })
                return console.error(error)
            }

            return interaction.reply({ content: 'You have accepted the rules!', ephemeral: true })
        }

        if (interaction.customId === 'create_channel') {
            try {
                const guild = interaction.guild

                if (!interaction.member.roles.cache.has('1041858413816205312')) {
                    return interaction.reply({ content: 'Please read and accept the rules before creating a channel!\n<#1041857262567833640>', ephemeral: true })
                }

                const hasChannel = await db.has(interaction.user.id)
                if (hasChannel) {
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
                            .setLabel('Delete Me')
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId('delete_me'),
                        new ButtonBuilder()
                            .setLabel('Leave Channel')
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId('leave_channel')
                    )

                const boostLevel = guild.premiumTier
                if (boostLevel === 2) {
                    const wlc = await channel.send({ content: `Enjoy your new file upload channel! The server is currently at **Level ${guild.premiumTier}** boosting, free **50mb** file uploads!\n\nUse \`/share [user]\` or right click on someones profile and use the **Share Upload** button under **Apps** to share this channel with another user! (They won't be able to delete the channel)\n\nIf you would like to delete this channel and the files sent in here, click the delete me button below.`, components: [row] })
                    await wlc.pin()
                } else if (boostLevel === 3) {
                    const wlc = await channel.send({ content: `Enjoy your new file upload channel! The server is currently at **Level ${guild.premiumTier}** boosting, free **100mb** file uploads!\n\nUse \`/share [user]\` or right click on someones profile and use the **Share Upload** button under **Apps** to share this channel with another user! (They won't be able to delete the channel)\n\nIf you would like to delete this channel and the files sent in here, click the delete me button below.`, components: [row] })
                    await wlc.pin()
                } else {
                    const wlc = await channel.send({ content: `Enjoy your new file upload channel! The server is currently at **Level ${guild.premiumTier}** boosting.\n\nUse \`/share [user]\` or right click on someones profile and use the **Share Upload** button under **Apps** to share this channel with another user! (They won't be able to delete the channel)\n\nIf you would like to delete this channel and the files sent in here, click the delete me button below.`, components: [row] })
                    await wlc.pin()
                }

                await db.set(interaction.user.id, channel.id)
                await db.set(channel.id, interaction.user.id)

                console.log(`Created personal channel for ${interaction.user.id}`)

                return interaction.reply({ content: `Created personal channel <#${channel.id}>`, ephemeral: true })
            } catch (error) {
                await interaction.reply({ content: `An unknown error occured during the creation of your channel.\n${error}`, ephemeral: true })
                return console.error(error)
            }
        }

        if (interaction.customId === 'delete_me') {
            const ownedChannelId = await db.get(interaction.user.id)
            if (ownedChannelId !== interaction.channel.id) return interaction.reply({ content: 'Only the owner can delete this channel!', ephemeral: true })

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Confirm Delete')
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId('delete_confirm')
                )

            return interaction.reply({ content: 'Are you sure you want to delete this channel? It cannot be undone and your files cannot be recovered.', components: [row], ephemeral: true })
        }

        if (interaction.customId === 'delete_confirm') {
            await db.delete(interaction.user.id)
            await db.delete(interaction.channel.id)
            return interaction.channel.delete()
        }

        if (interaction.customId === 'leave_channel') {
            const channelOwnerId = await db.get(interaction.channel.id)
            if (interaction.user.id === channelOwnerId) return interaction.reply({ content: 'Channel owners can\'t leave their own channel!', ephemeral: true})

            await interaction.channel.permissionOverwrites.create(interaction.user.id, {
                ViewChannel: false
            })

            return interaction.reply({ content: 'Left channel!', ephemeral: true })
        }

        if (interaction.customId === 'toggle') {
            if (interaction.user.id !== '339492485854396426') return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true })

            if (interaction.member.roles.cache.has('1041848288070090902')) {
                await interaction.member.roles.remove('1041848288070090902')
                return interaction.reply({ content: 'You have disabled channel management.', ephemeral: true })
            } else {
                await interaction.member.roles.add('1041848288070090902')
                return interaction.reply({ content: 'You have enabled channel management.', ephemeral: true })
            }
        }
    }

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'share') {
            const targetUser = interaction.options.getUser('user')

            if (targetUser.id === interaction.user.id) return interaction.reply({ content: 'Cannot share channel with self!', ephemeral: true })

            const hasChannel = await db.has(interaction.user.id)
            if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

            const channelId = await db.get(interaction.user.id)
            const channel = await client.channels.fetch(channelId)

            await channel.permissionOverwrites.create(targetUser.id, {
                ViewChannel: true
            })

            return interaction.reply({ content: 'Shared upload channel with user! Use **/unshare** to unshare.', ephemeral: true })
        }

        if (interaction.commandName === 'unshare') {
            const targetUser = interaction.options.getUser('user')

            if (targetUser.id === interaction.user.id) return interaction.reply({ content: 'Cannot unshare channel with self!', ephemeral: true })

            const hasChannel = await db.has(interaction.user.id)
            if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

            const channelId = await db.get(interaction.user.id)
            const channel = await client.channels.fetch(channelId)

            await channel.permissionOverwrites.create(targetUser.id, {
                ViewChannel: false
            })

            return interaction.reply({ content: 'Unshared upload channel with user!', ephemeral: true })
        }

        if (interaction.commandName === 'webhook-sharex') {
            const hasChannel = await db.has(interaction.user.id)
            if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

            const channelId = await db.get(interaction.user.id)
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

                return interaction.reply({ content: 'Download and open the file below with ShareX to start uploading files to your upload channel via ShareX.', files: [{ name: 'Discord Webhook.sxcu', attachment: Buffer.from(ShareXConfig) }], ephemeral: true })
            }
        }
    }

    if (interaction.isContextMenuCommand()) {
        if (interaction.commandName === 'Share upload channel') {
            const targetUser = interaction.targetUser

            if (targetUser.id === interaction.user.id) return interaction.reply({ content: 'Cannot share channel with self!', ephemeral: true })

            const hasChannel = await db.has(interaction.user.id)
            if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

            const channelId = await db.get(interaction.user.id)
            const channel = await client.channels.fetch(channelId)

            await channel.permissionOverwrites.create(targetUser.id, {
                ViewChannel: true
            })

            return interaction.reply({ content: 'Shared upload channel with user! Use **Unshare upload channel** to unshare.', ephemeral: true })
        }

        if (interaction.commandName === 'Unshare upload channel') {
            const targetUser = interaction.targetUser

            if (targetUser.id === interaction.user.id) return interaction.reply({ content: 'Cannot unshare channel with self!', ephemeral: true })

            const hasChannel = await db.has(interaction.user.id)
            if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

            const channelId = await db.get(interaction.user.id)
            const channel = await client.channels.fetch(channelId)

            await channel.permissionOverwrites.create(targetUser.id, {
                ViewChannel: false
            })

            return interaction.reply({ content: 'Unshared upload channel with user!', ephemeral: true })
        }
    }
})

client.on('messageCreate', async (message) => {
    if (message.type === MessageType.ChatInputCommand && message.channelId === '1041869163301445662' && message.interaction.commandName === 'bump' && message.author.id === '302050872383242240') {
        await message.channel.send({ content: `<@${message.interaction.user.id}>, Thanks for bumping the server! I will ping you again in 2 hours when you can bump again.` })

        setTimeout(async () => {
            message.channel.send({ content: `<@${message.interaction.user.id}>, You can bump again!` })
        }, 7200000)
    }
})

client.on('guildMemberRemove', async (member) => {
    const hasUploadChannel = await db.has(member.user.id)
    if (hasUploadChannel) {
        const uploadChannelId = await db.get(member.user.id)
        const channel = await client.channels.fetch(uploadChannelId)
        const messages = await channel.messages.fetch({ limit: 100 })

        const filteredMessages = messages.filter((m) => m.author.id === client.user.id)
        if (filteredMessages.size === 0) {
            await db.delete(member.user.id)
            await db.delete(channel.id)
            channel.delete()
        }
    }
})

client.login(process.env.TOKEN)