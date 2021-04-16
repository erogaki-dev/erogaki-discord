"use strict";

const Discord = require("discord.js");

const { version } = require("../package.json");
const config = require("./config");

const client = new Discord.Client();
client.login(config.token);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`Bot Version ${version}`);
});

client.on("message", async msg => {
    if(msg.channel.nsfw && !msg.author.bot) {
        await msg.channel.send("Hello World o/");
    }
});
