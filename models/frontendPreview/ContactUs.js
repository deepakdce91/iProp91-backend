const mongoose = require("mongoose");
const collection = "contactUs";

const currentSchema = new mongoose.Schema({
    name : { 
        type: String,
        required: true
    },
    mobile : {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    addressed: {  // yes or no
        type: String,
        default: "no",
    },
}, { timestamps: true });
const model = mongoose.model(collection, currentSchema);

module.exports = model;
