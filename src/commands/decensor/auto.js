"use strict";

const path = require("path");

const MainCommand = require("../../MainCommand");

const name = "auto";
const description = "Automatically decensor the provided censored image.";
const command = new MainCommand(name, description, path.resolve(`${__dirname}/auto`));

exports.name = name;
exports.description = description;
exports.execute = command.execute.bind(command);
exports.help = command.help.bind(command);
