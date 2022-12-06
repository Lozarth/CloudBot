const ytdl = require('ytdl-core')
const axios = require('axios')
const twitter = require('twitter-url-direct')
const fs = require('fs')

module.exports = {
    name: 'download',
    description: 'Downloads a video from Youtube, Twitter, Tiktok, Instagram',
    options: [
        {
            name: 'url',
            description: 'The url of the video',
            type: 3,
            required: true
        },
        {
            name: 'platform',
            description: 'The platform of the video',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'YouTube',
                    value: 'youtube'
                },
                {
                    name: 'Twitter',
                    value: 'twitter'
                },
                {
                    name: 'TikTok',
                    value: 'tiktok'
                },
                {
                    name: 'Instagram',
                    value: 'instagram'
                }
            ]
        }
    ],
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

            // filter audio and video and mp4 format
            const videoInfo = await ytdl.getInfo(url)

            // stop if video is longer than 30 minutes
            if (videoInfo.videoDetails.lengthSeconds > 1800) return interaction.followUp({ content: 'Video is longer than 30 minutes!', ephemeral: true })

            const videoTitle = videoInfo.videoDetails.title

            const formats = ytdl.filterFormats(videoInfo.formats, 'audioandvideo', 'mp4')

            for (const [index, format] of formats.entries()) {
                try {
                    await interaction.followUp({ content: `${index + 1}/${formats.length}\n**${format.width}x${format.height}** | **${format.qualityLabel}** | **${format.fps}fps** | Video Quality: **${format.quality}** | Audio Quality: **${format.audioQuality}**`, files: [{ attachment: format.url, name: `${videoTitle}.mp4` }] })
                } catch (error) {
                    console.error(error)
                    await interaction.followUp({ content: `I couldn't send this video!\n\`\`${error}\`\`` })
                }
            }
        } else if (platform === 'twitter') {
            const twitterRegex = /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/gm
            if (!twitterRegex.test(url)) return interaction.reply({ content: 'Invalid Twitter URL!', ephemeral: true })

            await interaction.deferReply()

            const urlNoQuery = url.split('?')[0]

            try {
                var tweet = await twitter(urlNoQuery)
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
            // tiktok has a fuckton of video urls so i'm not even gonna bother with regex

            await interaction.deferReply()

            // convert shortened url to full url with id
            const response = await axios.get(url, { maxRedirects: 1 }, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36' } })

            const video = await axios.post('https://tikfast.net/tik-download/download-link', {
                0: response.request.res.responseUrl
            })

            const videoUrl = video.data.data[0].water_free_link

            if (videoUrl === '' || videoUrl === null) return interaction.followUp({ content: 'Video not found!' })

            const videoUrlDecoded = Buffer.from(videoUrl, 'base64').toString('ascii')
            const randomString = Math.random().toString(36).substring(2, 8)

            await interaction.followUp({ files: [{ attachment: videoUrlDecoded, name: `${randomString}.mp4` }] })
        } else if (platform === 'instagram') {
            return interaction.reply({ content: 'Laziest developer ever, this feature is not available yet! If you want this feature added message <@339492485854396426>', ephemeral: true })
        }
    }
}