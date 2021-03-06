"use strict";

const https = require("https");
const uuid = require("uuid");
const redis = require("redis");
const Discord = require("discord.js");

const config = require("./config");
const RedisPromisifiedClient = require("./RedisPromisifiedClient");

const redisClient = new RedisPromisifiedClient({
    ...config.redisConfig,
    detect_buffers: true
});
const redisSubscribeClient = redis.createClient(config.redisConfig);

/**
 * @private
 * @param {string} uuid
 */
async function _postBackendRequestCleanup(uuid) {
    await redisClient.del(`censored-images:${uuid}`);
    await redisClient.del(`masked-images:${uuid}`);
    await redisClient.del(`decensored-images:${uuid}`);
    await redisClient.del(`errors:${uuid}`);
}

/**
 * @param {Discord.Message} msg
 * @param {string} requestQueue
 * @param {string} informationStore
 */
async function createBackendRequest(msg, requestQueue, informationStore) {
    console.log(`New image to decensor received from user ${msg.author.tag} in channel ${msg.channel.name} on server ${msg.guild.name}.`);

    // Start typing to indicate that the decensor request was received.
    msg.channel.startTyping();

    // Get the attached image.
    const imageUrl = msg.attachments.filter(attachment => attachment.height !== null && attachment.width !== null).first().url;
    const censoredImage = await new Promise((resolve, reject) => {
        console.log("Downloading image from Discord.");
        https.get(imageUrl, (res) => {
            res.on("error", () => {
                reject(new Error("Censored image couldn't be downloaded."));
            });

            let data = [];
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
    console.log(`Pushing image into ${informationStore}:${imageUUID}.`);
    await redisClient.set(`${informationStore}:${imageUUID}`, censoredImage);

    // Subscribe to keyevents, so we know when the image decensor request was processed.
    const responseChannelPromise = new Promise((resolve) => {
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
    await redisClient.rpush(`${requestQueue}`, imageUUID);

    // Await answer for decensor request.
    const responseChannel = await responseChannelPromise;
    console.log(`Received answer on channel ${responseChannel}.`);

    // Handle the error case.
    if (responseChannel === "errors") {
        const errorJSON = await redisClient.get(`errors:${imageUUID}`);
        const error = JSON.parse(errorJSON);
        console.error(error);

        // Cleanup.
        console.log("Cleaning up.");
        _postBackendRequestCleanup();

        msg.channel.send(error.description);
        msg.channel.stopTyping();
        return;
    }

    // Get the decensored image from Redis.
    console.log("Retrieving image from Redis.");
    const decensoredImage = await redisClient.get(Buffer.from(`decensored-images:${imageUUID}`));

    // Cleanup.
    console.log("Cleaning up.");
    _postBackendRequestCleanup();

    // Send the decensored image into Discord.
    console.log("Sending the decensored image into Discord channel.");
    const messageAttachment = new Discord.MessageAttachment(decensoredImage);
    msg.channel.send(messageAttachment);
    msg.channel.stopTyping();
}

exports.createBackendRequest = createBackendRequest;
