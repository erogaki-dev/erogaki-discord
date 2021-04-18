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
     * @param {string} name - The name of this command.
     * @param {string} description - A description of this command.
     * @param {string} subCommandPath - Path to the sub commands of this
     * command.
     * @param {ExecutionCondition[]} executionConditions - An array of
     * ExecutionConditions. Check the ExecutionCondition documentation for more
     * information.
     */
    constructor(name, description, subCommandPath, executionConditions) {
        this._name = name;
        this._description = description;
        this._executionConditions = executionConditions;

        this._subCommands = new Discord.Collection();
        const commandFiles = fs.readdirSync(subCommandPath).filter(file => file.endsWith(".js"));

        // Set sub-commands.
        for (const file of commandFiles) {
            const command = require(`${subCommandPath}/${file}`);

            this._subCommands.set(command.name, command);
        }
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
            await message.channel.send("Please provide a valid subcommand.");
            return;
        }

        // Try to execute the provided sub-command.
        try {
            this._subCommands.get(subCommand).execute(message, args);
        } catch (error) {
            console.error(error);
            await message.channel.send("There was an error trying to execute that command.");
        }
    }

    /**
     * Provides help output for this command or calls the help of a
     * sub-command.
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async help(message, args) {
        // Get the provided sub-command.
        const subCommand = args.shift()?.toLowerCase();

        // If no sub-command was provided, send help output for this command.
        if (subCommand === undefined) {
            await this._sendHelpOutput(message);
            return;
        }

        // Check, if a valid sub-command was provided.
        // Return otherwise.
        if (!this._subCommands.has(subCommand)) {
            await message.channel.send("Please specify a valid subcommand.");
            return;
        }

        // Try to call the help function of the provided sub-command.
        try {
            this._subCommands.get(subCommand).help(message, args);
        } catch (error) {
            console.error(error);
            await message.channel.send("There was an error trying to get the help output of that command.");
        }
    }

    /**
     * Sends the help output for this command.
     * @param {Discord.Message} message
     */
    async _sendHelpOutput(message) {
        // Construct command this help is about.
        const command = message.content.slice("!".length).trim().split(/ +/).slice(1).join(" ");

        const answerEmbed = new Discord.MessageEmbed()
            .setTitle(`Help for !${command}`)
            .setDescription(`**${this._name}**: ${this._description}`
                            + "\n"
                            + "\nThe following sub-commands are available:")
            .setFooter("You can call sub-commands like the following:"
                       + `\n!${command} <sub-command>`);

        for (const subCommand of this._subCommands) {
            answerEmbed.addField(`${subCommand[1].name}`, `${subCommand[1].description}`);
        }

        await message.channel.send(answerEmbed);
    }
};
