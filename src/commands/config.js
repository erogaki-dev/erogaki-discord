"use strict";

const path = require("path");

const MainCommand = require("../MainCommand");

const name = "config";
const description = "Configure the bot.";
const command = new MainCommand(name, description, path.resolve(`${__dirname}/config`), [
    // Don't execute, if message was sent in a non-nsfw channel.
    (message) => message.channel.nsfw ? true : false,
    // Don't execute, if the user isn't an admin.
    (message) => message.member.hasPermission("ADMINISTRATOR")
]);

exports.name = name;
exports.description = description;
exports.execute = command.execute.bind(command);
exports.help = command.help.bind(command);
