const { Client, GatewayIntentBits, MessageType, ActivityType, Collection, REST, Routes } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] })

const fs = require('fs')

const JSONdb = require('simple-json-db')
const db = new JSONdb('./database.json')

require('dotenv').config()

const slashCommandsJSON = require('./slashcommands.json')
client.commands = new Collection()
client.buttons = new Collection()
client.contextMenus = new Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'))
const contextMenuFiles = fs.readdirSync('./contextmenus').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
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
    const dbJSON = await db.JSON()
    for (const [key, value] of Object.entries(dbJSON)) {
        if (key.startsWith('bump_')) {
            const userId = key.split('_')[1]
            const timeRemaining = value - Date.now()
            const channel = client.channels.cache.get('1041869163301445662')

            setTimeout(async () => {
                await channel.send({ content: `<@${userId}>, You can bump again!` })
                await db.delete(`bump_${userId}`)
            }, timeRemaining)
        }
    }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        if (client.commands.get(interaction.commandName)) {
            try {
                client.commands.get(interaction.commandName).run(client, interaction, db)
            } catch (error) {
                console.error(error)
                return interaction.reply({ content: `There was an error while executing this command!\n\`\`${error}\`\``, ephemeral: true })
            }
        }
    }

    if (interaction.isButton()) {
        if (client.buttons.get(interaction.customId)) {
            try {
                client.buttons.get(interaction.customId).run(client, interaction, db)
            } catch (error) {
                console.error(error)
                return interaction.reply({ content: `There was an error while executing this button!\n\`\`${error}\`\``, ephemeral: true })
            }
        }
    }

    if (interaction.isContextMenuCommand()) {
        if (client.contextMenus.get(interaction.commandName)) {
            try {
                client.contextMenus.get(interaction.commandName).run(client, interaction, db)
            } catch (error) {
                console.error(error)
                return interaction.reply({ content: `There was an error while executing this context menu!\n\`\`${error}\`\``, ephemeral: true })
            }
        }
    }
})

client.on('messageCreate', async (message) => {
    if (message.type === MessageType.ChatInputCommand && message.channelId === '1041869163301445662' && message.interaction.commandName === 'bump' && message.author.id === '302050872383242240') {
        await message.channel.send({ content: `<@${message.interaction.user.id}>, Thanks for bumping the server! I will ping you again in 2 hours when you can bump again.` })

        // persist timeout after restart
        await db.set(`bump_${message.interaction.user.id}`, Date.now() + 7200000)

        setTimeout(async () => {
            await message.channel.send({ content: `<@${message.interaction.user.id}>, You can bump again!` })
            await db.delete(`bump_${message.interaction.user.id}`)
        }, 7200000)
    }
})

client.on('guildMemberRemove', async (member) => {
    const hasUploadChannel = await db.has(member.user.id)
    if (hasUploadChannel) {
        const uploadChannelId = await db.get(member.user.id)
        const channel = await client.channels.fetch(uploadChannelId)
        const messages = await channel.messages.fetch({ limit: 100 })

        const userMessages = messages.filter(message => message.author.id === member.user.id)
        if (userMessages.size === 0) {
            await db.delete(member.user.id)
            await db.delete(channel.id)

            return channel.delete()
        }
    }
})

client.login(process.env.TOKEN)
