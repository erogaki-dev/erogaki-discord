#!/usr/bin/env node
"use strict";

const fs = require("fs");
const Discord = require("discord.js");

const { version } = require("../package.json");
const config = require("./config");
const userConfig = require("./userConfiguration/config");

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
    if (message.author.bot) return;

    // Get the prefix configured for the current guild.
    const prefix = await userConfig.getPrefix(message.guild.id);

    // Return, if message doesn't start with the configured prefix.
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Check, if help output was requested.
    if (command === "help") {
        await help(message, args);
        return;
    }

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

/**
 * Provides help output for the bot or calls the help of a command.
 * @param {Discord.Message} message
 * @param {string[]} args
 */
async function help(message, args) {
    // Get the provided command.
    const command = args.shift()?.toLowerCase();

    // If no command was provided, send help output for this bot.
    if (command === undefined) {
        await _sendHelpOutput(message);
        return;
    }

    // Check, if a valid command was provided.
    // Return otherwise.
    if (!discordClient.commands.has(command)) {
        await message.channel.send("Please specify a valid command.");
        return;
    }

    // Try to call the help function of the provided command.
    try {
        discordClient.commands.get(command).help(message, args);
    } catch (error) {
        console.error(error);
        await message.channel.send("There was an error trying to get the help output of that command.");
    }
}

/**
 * Sends the help output for this bot.
 * @param {Discord.Message} message
 */
async function _sendHelpOutput(message) {
    // Get the prefix used for the guild.
    const prefix = await userConfig.getPrefix(message.guild.id);

    const answerEmbed = new Discord.MessageEmbed()
        .setTitle(`Help for erogaki-discord ${version}`)
        .setDescription("The following commands are available:")
        .setFooter(`Just type ${prefix}help <command> to receive help output for a command.`);

    for (const command of discordClient.commands) {
        answerEmbed.addField(`${prefix}${command[1].name}`, command[1].description);
    }

    await message.channel.send(answerEmbed);
}
