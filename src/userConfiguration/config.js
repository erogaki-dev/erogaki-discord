"use strict";

const mongoose = require("mongoose");

const config = require("../config");
const Prefix = require("./models/prefix");

mongoose.connect(`mongodb://${config.mongoDBConfig.hostname}:${config.mongoDBConfig.port}/${config.mongoDBConfig.db}`, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("error", console.log.bind(console, "connection error:"));

/**
 * Get the prefix used for the specified guild.
 * @param {String} guildId
 * @returns {String} The prefix used for the specified guild.
 */
async function getPrefix(guildId) {
    const prefix = await Prefix.findById(guildId).exec();

    // If no prefix can be found, return the default value.
    if (!prefix) {
        return "!";
    }

    return prefix.prefix;
}

/**
 * Set the prefix to use for the specified guild.
 * @param {String} guildId
 * @param {String} newPrefix
 */
async function setPrefix(guildId, newPrefix) {
    let prefix = await Prefix.findById(guildId).exec();

    // If prefix already exists, set the newPrefix, otherwise create a new prefix.
    if (prefix) {
        prefix.prefix = newPrefix;
    } else {
        prefix = new Prefix({ _id: guildId, prefix: newPrefix });
    }

    prefix.save();
}

exports.getPrefix = getPrefix;
exports.setPrefix = setPrefix;
