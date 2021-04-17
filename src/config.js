"use strict";

/**
 * @typedef {Object} RedisConfig
 * @property {string} hostname
 * @property {number} port
 * @property {string} db
 */

/**
 * @typedef {Object} DiscordConfig
 * @property {string} token
 */

/**
 * @typedef {Object} Config
 * @property {RedisConfig} redisConfig
 */


/**
 * Create a config from environment variables.
 * @private
 * @returns {Config} A valid config.
 */
function createConfig() {
    return {
        redisConfig: {
            hostname: process.env.REDIS_HOSTNAME || "localhost",
            port: parseInt(process.env.REDIS_PORT) || 6379,
            db: process.env.REDIS_DB || 0,
        },
        discordConfig: {
            accessToken: process.env.DISCORD_TOKEN || undefined
        }
    };
}

/**
 * Checks if the given config object has required values set.
 * @private
 * @param {Config} config
 * @returns {Boolean}
 */
function checkConfig(config) {
    if (config.discordConfig.accessToken === undefined) {
        throw new Error("You need to provide a Discord token via the DISCORD_TOKEN environment variable.");
    }
}

const config = createConfig();
checkConfig(config);
module.exports = config;
