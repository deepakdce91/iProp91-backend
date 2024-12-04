const mongoose = require("mongoose");
const collection = "rejected-reasons";

const currentSchema = new mongoose.Schema({
    
    name : {
        type : String,
        required : true,
    },
    enable : {  // yes or no
        type : String,
        required : true,
    },
    addedBy : {
        type : String,
        default : "admin"
    },
},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;