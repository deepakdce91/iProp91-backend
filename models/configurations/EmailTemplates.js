const mongoose = require("mongoose");
const collection = "emailTemplates";

const currentSchema = new mongoose.Schema({
    // variable suffix -> IPROP_VAR_
    templateName : {
        type : String,
        required : true
    },
    subject : {
        type : String,
        required: true
    },
    body : {
        type : String,
        required: true
    },
    totalVariables : {
        type : Number,
        required: true
    },
    variableNames : { // comma seperrated
        type : String,
        default: ""
    },
    enable : {  // true or false
        type : String,
        deafult : "true",
    },
    
},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;