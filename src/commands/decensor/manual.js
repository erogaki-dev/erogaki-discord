"use strict";

const path = require("path");

const MainCommand = require("../../MainCommand");

const command = new MainCommand(path.resolve(`${__dirname}/manual`));
exports.name = "manual";
exports.description = "Decensor the provided censored image with manually selected regions.";
exports.execute = command.execute.bind(command);
