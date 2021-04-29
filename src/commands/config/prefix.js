"use strict";

const Discord = require("discord.js");

const userConfig = require("../../userConfiguration/config");

const name = "prefix";
const description = "Get or set the prefix this bot uses.";

/**
 * @param {Discord.Message} message
 * @param {string[]} args
 */
async function execute(message, args) {
    if (!args[0]) {
        await message.channel.send("You didn't provide enough arguments, please see the help for this command for more information.");
        return;
    }

    switch (args[0]) {
        case "get":
            await message.channel.send(`The current prefix is: ${await userConfig.getPrefix(message.guild.id)}`);
            break;
        case "set":
            if (!args[1]) {
                await message.channel.send("You didn't provide a prefix, please see the help for this command for more information.");
                return;
            }

            await userConfig.setPrefix(message.guild.id, args[1]);
            await message.channel.send(`Set prefix to ${args[1]}`);
            break;
        default:
            await message.channel.send("You didn't provide the right arguments, please see the help for this command for more information.");
    }
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
        .setDescription(`**${name}**: ${description}\n`
                        + "You need to provide one of the following arguments:")
        .addField("get", "Get the prefix currently in use.")
        .addField("set <prefix>", "Set the prefix to the specified value.");


    await message.channel.send(answerEmbed);
}

exports.name = name;
exports.description = description;
exports.execute = execute;
exports.help = help;
