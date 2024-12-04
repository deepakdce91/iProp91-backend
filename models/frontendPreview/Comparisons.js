const mongoose = require("mongoose");
const collection = "comparisons";

const currentSchema = new mongoose.Schema({
    title : { // only for admin use
        type: String,
        required: true
    },
    topText : {
        type: String,
        required: true
    },
    bottomText : {
        type: String,
        required: true
    },
    centerImage1: {
        name : {
            type : String,
            required: true
        },
        url : {
            type : String,
            required: true
        },
    },
    centerImage2: {
        name : {
            type : String,
        },
        url : {
            type : String,
        },
    },
    enable: {  // true or false
        type: String,
        default: "true",
    },
}, { timestamps: true });
const model = mongoose.model(collection, currentSchema);

module.exports = model;
