require('dotenv').config()

const { Client, GatewayIntentBits, MessageType, ActivityType, Collection, REST, Routes, ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] })

const JSONdb = require('simple-json-db')
const db = new JSONdb('./database.json')

client.commands = new Collection()
client.buttons = new Collection()
client.contextMenus = new Collection()

const fs = require('fs')

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'))
const contextMenuFiles = fs.readdirSync('./contextmenus').filter(file => file.endsWith('.js'))

const slashCommandsJSON = []

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)

    // add command to json array
    slashCommandsJSON.push(command.data.toJSON())
}

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`)
    client.buttons.set(button.name, button)
}

for (const file of contextMenuFiles) {
    const contextMenu = require(`./contextmenus/${file}`)
    client.contextMenus.set(contextMenu.name, contextMenu)
}


client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)

    try {
        console.log('Started refreshing application (/) commands.')

        const rest = new REST({ version: '10' }).setToken(client.token)
        await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommandsJSON })

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }

    client.user.setActivity('in the clouds', { type: ActivityType.Playing })

    // check if database has pending bump reminders
    const dbJSON = db.JSON()

    for (const [key, value] of Object.entries(dbJSON)) {
        if (key.startsWith('bump_')) {
            const userId = key.split('_')[1]
            const timeRemaining = value - Date.now()
            const channel = client.channels.cache.get('1041869163301445662')

            setTimeout(async () => {
                await channel.send({ content: `<@${userId}>, You can bump again!` })
                db.delete(`bump_${userId}`)
            }, timeRemaining)
        }
    }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        if (client.commands.get(interaction.commandName)) {
            try {
                await client.commands.get(interaction.commandName).run(client, interaction, db)
            } catch (error) {
                console.error(error)
                return interaction.followUp({ content: `There was an error while executing this command!\n\`\`${error}\`\``, ephemeral: true })
            }
        }
    }

    if (interaction.isButton()) {
        if (client.buttons.get(interaction.customId)) {
            try {
                await client.buttons.get(interaction.customId).run(client, interaction, db)
            } catch (error) {
                console.error(error)
                return interaction.followUp({ content: `There was an error while executing this button!\n\`\`${error}\`\``, ephemeral: true })
            }
        }
    }

    if (interaction.isContextMenuCommand()) {
        if (client.contextMenus.get(interaction.commandName)) {
            try {
                await client.contextMenus.get(interaction.commandName).run(client, interaction, db)
            } catch (error) {
                console.error(error)
                return interaction.followUp({ content: `There was an error while executing this context menu!\n\`\`${error}\`\``, ephemeral: true })
            }
        }
    }
})

client.on('messageCreate', async (message) => {
    // check if command is /bump, a chat input command, is in the bump channel, and is from the disboard bot
    if (message.type === MessageType.ChatInputCommand && message.interaction.commandName === 'bump' && message.channelId === '1041869163301445662' && message.author.id === '302050872383242240') {
        console.log(`${message.interaction.user.username} bumped the server!`)
        await message.channel.send({ content: `<@${message.interaction.user.id}>, Thanks for bumping the server! I will ping you again <t:${Math.floor(Date.now() / 1000) + 7200}:R> when you can bump again.` })

        // persist timeout after restart
        db.set(`bump_${message.interaction.user.id}`, Date.now() + 7200000)

        setTimeout(async () => {
            await message.channel.send({ content: `<@${message.interaction.user.id}>, You can bump again!` })
            db.delete(`bump_${message.interaction.user.id}`)
        }, 7200000)
    }
})

client.on('guildMemberAdd', async (member) => {
    console.log(`${member.user.username} joined the server!`)
})

client.on('guildMemberRemove', async (member) => {
    console.log(`${member.user.username} left the server!`)

    const hasChannel = db.has(member.user.id)
    if (!hasChannel) return

    const channelId = db.get(member.user.id)
    const channel = await client.channels.fetch(channelId)
    const messages = await channel.messages.fetch({ limit: 100 })

    const userMessages = messages.filter(message => message.author.id === member.user.id)

    if (userMessages.size === 0) {
        db.delete(member.user.id)
        db.delete(channel.id)

        console.log(`Deleted ${member.user.username}'s channel because they left and didn't upload anything.`)

        return channel.delete()
    }
})

client.login(process.env.TOKEN)

// anticrash

process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error))
process.on('uncaughtException', error => console.error('Uncaught exception:', error))
