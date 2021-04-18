"use strict";

const path = require("path");

const MainCommand = require("../MainCommand");

const command = new MainCommand(path.resolve(`${__dirname}/decensor`), [
    // Don't execute, if message was sent in a non-nsfw channel.
    (message) => message.channel.nsfw ? true : false,
    // Don't execute, if message doesn't hold an attachement.
    (message) => (message.attachments.filter(attachment => attachment.height !== null && attachment.width !== null).size > 0) ? true : false
]);
exports.name = "decensor";
exports.description = "Decensor the provided censored image.";
exports.execute = command.execute.bind(command);
