"use strict";

const { decensorRequestHandler } = require("../../../backendInteraction");

const name = "bar";
const description = "Decensor the provided bar-censored image with manually selected regions.";

/**
 * @param {Discord.Message} message
 */
async function execute(message) { await decensorRequestHandler(message, "deepcreampy:bar"); }

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
