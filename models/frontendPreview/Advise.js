const mongoose = require("mongoose");
const collection = "advise";

const currentSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    file : {
        name : {
            type : String,
        },
        url : {
            type : String,
        },
    },
    enable : {  
        type : String,
        deafult : "true",
    },
    
},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;