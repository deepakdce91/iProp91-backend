const mongoose = require("mongoose");
const collection = "projects";

const currentSchema = new mongoose.Schema({
    
    name : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    },
    builder : {
        type : String,
        required : true
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