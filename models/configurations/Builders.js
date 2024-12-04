const mongoose = require("mongoose");
const collection = "builders";

const currentSchema = new mongoose.Schema({
    
    name : {
        type : String,
        required : true,
    },
    state : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    },
    enable : {  // yes or no
        type : String,
        default : "'yes"
    },
    addedBy : {
        type : String,
        default : "admin"
    },
},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;