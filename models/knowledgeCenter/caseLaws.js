const mongoose = require("mongoose");
const collection = "caseLaws";

const currentSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    content : {
        type : String,
    },
    file : {
        name : {
            type : String,
        },
        url : {
            type : String,
        },
    },
    enable : {  // yes or no
        type : String,
        deafult : "true",
    },
    
},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;