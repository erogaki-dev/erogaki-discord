"use strict";

const { promisify } = require("util");
const redis = require("redis");

module.exports = exports = class RedisPromisifiedClient {
    /**
     * @param {redis.ClientOpts} config
     */
    constructor(config) {
        this.originalClient = redis.createClient(config);

        this.set = promisify(this.originalClient.set).bind(this.originalClient);
        this.get = promisify(this.originalClient.get).bind(this.originalClient);
        this.del = promisify(this.originalClient.del).bind(this.originalClient);
        this.rpush = promisify(this.originalClient.rpush).bind(this.originalClient);
    }
};
