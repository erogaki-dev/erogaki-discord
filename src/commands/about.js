"use strict";

const Discord = require("discord.js");

const { version } = require("../../package.json");
const userConfig = require("../userConfiguration/config");

const name = "about";
const description = "Show information about this bot.";

/**
 * @param {Discord.Message} message
 */
async function execute(message) {
    const answerEmbed = new Discord.MessageEmbed()
        .setTitle(`About erogaki-discord ${version}`)
        .setDescription("Find out more about erogaki-discord and the erogaki project at <https://erogaki.moe>.");

    await message.channel.send(answerEmbed);
}

/**
 * @param {Discord.Message} message
 */
async function help(message) {
    // Get the prefix used for the guild.
    const prefix = await userConfig.getPrefix(message.guild.id);

    // Construct command this help is about.
    const command = message.content.slice(prefix.length).trim().split(/ +/).slice(1).join(" ");

    const answerEmbed = new Discord.MessageEmbed()
        .setTitle(`Help for ${prefix}${command}`)
        .setDescription(`**${name}**: ${description}`);

    await message.channel.send(answerEmbed);
}

exports.name = name;
exports.description = description;
exports.execute = execute;
exports.help = help;
