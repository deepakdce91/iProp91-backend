const mongoose = require("mongoose");
const collection = "ownersFrom";

const currentSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required: true
    },
    enable : {  // true or false
        type : String,
        deafult : "true",
    },
    
},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;