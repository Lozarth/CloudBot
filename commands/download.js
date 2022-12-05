const ytdl = require('ytdl-core')
const axios = require('axios')
const twitter = require('twitter-url-direct')
const fs = require('fs')

module.exports = {
    name: 'download',
    run: async (client, interaction, db) => {
        const url = interaction.options.getString('url')
        const platform = interaction.options.getString('platform')

        const hasChannel = await db.has(interaction.user.id)
        if (!hasChannel) return interaction.reply({ content: 'You don\'t have an upload channel!', ephemeral: true })

        const channelId = await db.get(interaction.user.id)

        if (interaction.channel.id !== channelId) return interaction.reply({ content: 'You can only use this command in your upload channel!', ephemeral: true })

        if (platform === 'youtube') {
            const videoRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gm

            if (!videoRegex.test(url)) return interaction.reply({ content: 'Invalid YouTube URL!', ephemeral: true })

            await interaction.deferReply()

            const video = ytdl(url, { filter: 'audioandvideo', filterFormat: 'mp4' })
            const videoInfo = await ytdl.getInfo(url)
            const videoTitle = videoInfo.videoDetails.title

            const fileName = `${videoTitle}.mp4`

            if (videoInfo.videoDetails.lengthSeconds > 1800) return interaction.followUp({ content: 'Video is longer than 30 minutes!' })

            const videoStream = video.pipe(fs.createWriteStream(`./videos/${fileName}`))

            videoStream.on('finish', async () => {
                try {
                    await interaction.followUp({ files: [{ attachment: `./videos/${fileName}`, name: fileName }] })
                } catch (error) {
                    console.error(error)
                    return interaction.followUp({ content: `There was an error while sending the video!\n\`\`${error}\`\`` })
                } finally {
                    fs.unlinkSync(`./videos/${fileName}`)
                }
            })

            videoStream.on('error', async (error) => {
                console.error(error)
                await interaction.followUp({ content: `There was an error while downloading the video!\n\`\`${error}\`\`` })
            })
        } else if (platform === 'twitter') {
            const twitterRegex = /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/gm
            if (!twitterRegex.test(url)) return interaction.reply({ content: 'Invalid Twitter URL!', ephemeral: true })

            await interaction.deferReply()

            try {
                var tweet = await twitter(url)
            } catch (error) {
                console.error(error)
                return interaction.followUp({ content: `There was an error while downloading the video!\n\`\`${error}\`\`` })
            }
            
            if (!tweet.found) return interaction.followUp({ content: 'Tweet not found!' })

            if (tweet.type === 'video' || tweet.type === 'video/gif') {
                await interaction.followUp({ files: [{ attachment: tweet.download[0].url }] })
            } else {
                await interaction.followUp({ content: 'Tweet is not a video or gif!' })
            }
        } else if (platform === 'tiktok') {
            // tiktok has a fuckton of video urls so i'm not gonna bother with regex

            await interaction.deferReply()

            const request1 = await axios.post('https://tikfast.net/tik-download/download-link', {
                0: url
            })

            const videoData = request1.data.data[0].water_free_link
            1
            const video = await axios.post('https://tikfast.net/tik-download/download', {
                url: videoData.toString()
            })

            const videoUrl = video.data.data[0].url
            const videoId = video.data.data[0].vid

            await interaction.followUp({ files: [{ attachment: videoUrl, name: `${videoId}.mp4` }] })
        } else if (platform === 'instagram') {
            return interaction.reply({ content: 'Laziest developer ever, this feature is not available yet! If you want this feature added message <@339492485854396426>', ephemeral: true })
        }
    }
}