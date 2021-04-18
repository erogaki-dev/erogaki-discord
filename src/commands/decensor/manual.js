"use strict";

const path = require("path");

const MainCommand = require("../../MainCommand");

const name = "manual";
const description = "Decensor the provided censored image with manually selected regions.";
const command = new MainCommand(name, description, path.resolve(`${__dirname}/manual`));

exports.name = name;
exports.description = description;
exports.execute = command.execute.bind(command);
exports.help = command.help.bind(command);
