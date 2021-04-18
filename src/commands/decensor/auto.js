"use strict";

const path = require("path");

const MainCommand = require("../../MainCommand");

const command = new MainCommand(path.resolve(`${__dirname}/auto`));
exports.name = "auto";
exports.description = "Automatically decensor the provided censored image.";
exports.execute = command.execute.bind(command);
