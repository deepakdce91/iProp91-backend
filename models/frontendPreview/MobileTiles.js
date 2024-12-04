const mongoose = require("mongoose");
const collection = "mobileTiles";

const currentSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    image: {
        name : {
            type : String,
            required: true
        },
        url : {
            type : String,
            required: true
        },
    },
    enable: {  // true or false
        type: String,
        default: "false",
    },
}, { timestamps: true });
const model = mongoose.model(collection, currentSchema);

module.exports = model;
