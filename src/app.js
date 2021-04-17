"use strict";

const https = require("https");
const uuid = require("uuid");
const Discord = require("discord.js");
const redis = require("redis");

const { version } = require("../package.json");
const config = require("./config");
const RedisPromisifiedClient = require("./RedisPromisifiedClient");

const redisClient = new RedisPromisifiedClient({
    ...config.redisConfig,
    detect_buffers: true
});
const redisSubscribeClient = redis.createClient(config.redisConfig);

const discordClient = new Discord.Client();
discordClient.login(config.token);

discordClient.on("ready", () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
    discordClient.user.setActivity(`Bot Version ${version}`);
});

discordClient.on("message", async msg => {
    // Return, if message was sent in a non-nsfw channel.
    if (!msg.channel.nsfw) return;

    // Return, if message was sent by a bot.
    if (msg.channel.bot) return;

    // Return, if message doesn't hold an attachement.
    if (msg.attachments.filter(attachment => attachment.height !== null && attachment.width !== null) < 1) return;

    // Return, if message doesn't start with a "!decensor manual bar"
    if (!msg.content.startsWith("!decensor manual bar")) return;

    await dcpBarDecensorRequestHandler(msg);

});

/**
 * @param {Discord.Message} msg
 */
async function dcpBarDecensorRequestHandler(msg) {
    // Start typing to indicate that the decensor request was received.
    msg.channel.startTyping();

    // Get the attached image.
    const imageUrl = msg.attachments.filter(attachment => attachment.height !== null && attachment.width !== null).first().url;
    const censoredImage = await new Promise((resolve, reject) => {
        https.get(imageUrl, (res) => {
            res.on("error", () => {
                reject(new Error("Censored image couldn't be downloaded."));
            });

            let data = []
            res.on("data", (chunk) => {
                data.push(chunk);
            });

            res.on("end", () => {
                resolve(Buffer.concat(data));
            });
        });
    });

    // Create the uuid, which identifies this image.
    const imageUUID = uuid.v4();

    // Put the image into Redis.
    await redisClient.set(`censored-images:${imageUUID}`, censoredImage);

    // Subscribe to keyevents, so we know when the image decensor request was processed.
    const responseChannelPromise = new Promise((resolve, reject) => {
        const redisKeyeventListener = async (channel, message) => {
            if(message === `errors:${imageUUID}` || message === `decensored-images:${imageUUID}`) {
                redisSubscribeClient.removeListener("message", redisKeyeventListener);
                redisSubscribeClient.unsubscribe("__keyevent@0__:set", `decensored-images:${imageUUID}`);
                redisSubscribeClient.unsubscribe("__keyevent@0__:set", `errors:${imageUUID}`);
                resolve(message.split(":")[0]);
            }
        };

        redisSubscribeClient.on("message", redisKeyeventListener);
        redisSubscribeClient.subscribe("__keyevent@0__:set", `decensored-images:${imageUUID}`);
        redisSubscribeClient.subscribe("__keyevent@0__:set", `errors:${imageUUID}`);
    });

    // Add the image uuid to the decensor request queue.
    await redisClient.rpush("censored-images:deepcreampy:bar", imageUUID);

    // Await answer for decensor request.
    const responseChannel = await responseChannelPromise;
    console.log(responseChannel);

    // Handle the error case.
    if (responseChannel === "errors") {
        const errorJSON = await redisClient.get(`errors:${imageUUID}`);
        const error = JSON.parse(errorJSON);
        console.error(error);

        msg.channel.send(error.description);
        msg.channel.stopTyping();
        return;
    }

    // Get the decensored image from Redis.
    const decensoredImage = await redisClient.get(Buffer.from(`decensored-images:${imageUUID}`));

    // Delete the decensored image.
    redisClient.del(`decensored-images:${imageUUID}`);

    // Send the decensored image into Discord.
    const messageAttachment = new Discord.MessageAttachment(decensoredImage);
    msg.channel.send(messageAttachment);
    msg.channel.stopTyping();
}
