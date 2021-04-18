#!/usr/bin/env node
"use strict";

const fs = require("fs");
const Discord = require("discord.js");

const { version } = require("../package.json");
const config = require("./config");

const discordClient = new Discord.Client();
discordClient.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith(".js"));

// Set commands.
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    discordClient.commands.set(command.name, command);
}

discordClient.login(config.token);

discordClient.on("ready", () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
    discordClient.user.setActivity(`Bot Version ${version}`);
});

discordClient.on("message", async message => {
    // Return, if message was sent by a bot.
    if (message.channel.bot) return;

    // Return, if message doesn't start with "!".
    if (!message.content.startsWith("!")) return;

    const args = message.content.slice("!".length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Check, if a valid command was provided.
    if (!discordClient.commands.has(command)) {
        message.channel.send("Please provide a valid command.");
        return;
    }

    try {
        discordClient.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.send("There was an error trying to execute that command.");
    }
});
