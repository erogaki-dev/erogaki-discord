"use strict";

const Discord = require("discord.js");

const { createBackendRequest } = require("../../../backendInteraction");

const name = "mosaic";
const description = "Automatically decensor the provided mosaic-censored image.";

/**
 * @param {Discord.Message} message
 */
async function execute(message) { await createBackendRequest(message, "mask-requests:mosaic", "censored-images"); }

/**
 * @param {Discord.Message} message
 */
async function help(message) {
    // Construct command this help is about.
    const command = message.content.slice("!".length).trim().split(/ +/).slice(1).join(" ");

    const answerEmbed = new Discord.MessageEmbed()
        .setTitle(`Help for !${command}`)
        .setDescription(`**${name}**: ${description}`);

    await message.channel.send(answerEmbed);
}

exports.name = name;
exports.description = description;
exports.execute = execute;
exports.help = help;
