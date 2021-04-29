"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const prefixSchema = new Schema({
    // This should be the Discord Guild Id.
    _id: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        required: true
    },
    // This shouldn't be set manually.
    schema_version: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model("Prefix", prefixSchema);
