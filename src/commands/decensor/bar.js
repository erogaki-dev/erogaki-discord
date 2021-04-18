"use strict";

const command = require("./auto/bar.js");

exports.name = command.name;
exports.description = command.description;
exports.execute = command.execute;
exports.help = command.help;
