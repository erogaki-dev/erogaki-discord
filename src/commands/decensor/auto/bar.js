"use strict";

const { decensorRequestHandler } = require("../../../backendInteraction");

const name = "bar";
const description = "Automatically decensor the provided bar-censored image.";

/**
 * @param {Discord.Message} message
 */
async function execute(message) { await decensorRequestHandler(message, "hent-ai:bar"); }

/**
 * @param {Discord.Message} message
 */
async function help(message) {
    // Construct command this help is about.
    const command = message.content.slice("!".length).trim().split(/ +/).slice(1).join(" ");

    let answer = [ ];
    answer.push(`Help for ${command}`);
    answer.push(`${name}: ${description}`);
    await message.channel.send(answer);
}

exports.name = name;
exports.description = description;
exports.execute = execute;
exports.help = help;
