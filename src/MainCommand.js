"use strict";

const fs = require("fs");
const Discord = require("discord.js");

/**
 * @typedef {Function} ExecutionCondition - Executed in the execute of a
 * MainCommand. Should return true, if a the execution should continue, false,
 * if not.
 * @param {Discord.message} - The Discord message of the MainCommand, whose
 * execution this condition is about.
 * @returns {Boolean} - True, if execution should continue, false if not.
 */

/**
 * A MainCommand is a command, which has sub-commands.
 * A MainCommand tries to execute those sub-commands.
 */
module.exports = exports = class MainCommand {
    /**
     * @param {string} subCommandPath - Path to the sub commands of this
     * command.
     * @param {ExecutionCondition[]} executionConditions - An array of
     * ExecutionConditions. Check the ExecutionCondition documentation for more
     * information.
     */
    constructor(subCommandPath, executionConditions) {
        this._subCommands = new Discord.Collection();
        const commandFiles = fs.readdirSync(subCommandPath).filter(file => file.endsWith(".js"));

        // Set sub-commands.
        for (const file of commandFiles) {
            const command = require(`${subCommandPath}/${file}`);

            this._subCommands.set(command.name, command);
        }

        this._executionConditions = executionConditions;
    }

    /**
     * The function to execute for invokations of this command.
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message, args) {
        // If execution conditions were set, return, if an execution condition
        // returns false.
        if (this._executionConditions !== undefined) {
            for (const executionCondition of this._executionConditions) {
                if (!executionCondition(message)) return;
            }
        }

        // Get the provided sub-command.
        const subCommand = args.shift()?.toLowerCase();

        // Check, if a sub-command was actually provided and if yes, if it is
        // valid.
        // Return, if the check fails.
        if (subCommand === undefined || !this._subCommands.has(subCommand)) {
            message.channel.send("Please provide a valid subcommand.");
            return;
        }

        // Try to execute the provided sub-command.
        try {
            this._subCommands.get(subCommand).execute(message, args);
        } catch (error) {
            console.error(error);
            message.send("There was an error trying to execute that command.");
        }
    }
};
