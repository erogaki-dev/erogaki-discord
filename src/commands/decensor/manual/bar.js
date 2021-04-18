"use strict";

const { decensorRequestHandler } = require("../../../backendInteraction");

/**
 * @param {Discord.Message} message
 */
async function execute(message) { await decensorRequestHandler(message, "deepcreampy:bar"); }

exports.name = "bar";
exports.description = "Decensor the provided bar-censored image with manually selected regions.";
exports.execute = execute;
