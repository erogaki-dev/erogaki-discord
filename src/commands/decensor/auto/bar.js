"use strict";

const Discord = require("discord.js");

const { createBackendRequest } = require("../../../backendInteraction");
const userConfig = require("../../../userConfiguration/config");

const name = "bar";
const description = "Automatically decensor the provided bar-censored image.";

/**
 * @param {Discord.Message} message
 */
async function execute(message) { await createBackendRequest(message, "mask-requests:bar", "censored-images"); }

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
