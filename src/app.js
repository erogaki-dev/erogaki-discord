"use strict";

const Discord = require("discord.js");

const { version } = require("../package.json");
const config = require("./config");
const RedisPromisifiedClient = require("./RedisPromisifiedClient");

const redisClient = new RedisPromisifiedClient(config.redisConfig);

const discordClient = new Discord.Client();
discordClient.login(config.token);

discordClient.on("ready", () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
    discordClient.user.setActivity(`Bot Version ${version}`);
});

discordClient.on("message", async msg => {
    if(msg.channel.nsfw && !msg.author.bot) {
        await msg.channel.send("Hello World o/");
    }
});
