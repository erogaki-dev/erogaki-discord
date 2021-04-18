#!/usr/bin/env node
"use strict";

const Discord = require("discord.js");

const { version } = require("../package.json");
const config = require("./config");
const { decensorRequestHandler } = require("./backendInteraction");

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
    if (msg.attachments.filter(attachment => attachment.height !== null && attachment.width !== null).size < 1) return;

    // Return, if message doesn't start with a "!decensor manual bar"
    if (!msg.content.startsWith("!decensor")) return;

    if (msg.content.startsWith("!decensor manual bar")) {
        await decensorRequestHandler(msg, "deepcreampy:bar");
    }
    else if (msg.content.startsWith("!decensor bar")) {
        await decensorRequestHandler(msg, "hent-ai:bar");
    }
});
