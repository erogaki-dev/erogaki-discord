"use strict";

const { decensorRequestHandler } = require("../../../backendInteraction");

/**
 * @param {Discord.Message} message
 */
async function execute(message) { await decensorRequestHandler(message, "hent-ai:bar"); }

exports.name = "bar";
exports.description = "Automatically decensor the provided bar-censored image.";
exports.execute = execute;
