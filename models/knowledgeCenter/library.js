const mongoose = require("mongoose");
const collection = "library";

const currentSchema = new mongoose.Schema({
    thumbnail: {
        type: String,
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
    },
    youtubeVideos: [
        {
            type: String,
        }
    ],
    additionalMediaLinks: [
        {
            type: String,
        }
    ],
    priority: {
        type: String,
        default : 6,
        min: 1,  // Minimum value for priority
        max: 6  // Maximum value for priority
    },
    enable: {  // yes or no
        type: String,
        default: "true",
    },
}, { timestamps: true });

const model = mongoose.model(collection, currentSchema);

module.exports = model;
