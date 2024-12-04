const mongoose = require("mongoose");
const collection = "laws";

const currentSchema = new mongoose.Schema({
    type :  {
        type : String,  // state or central
        required : true
    },
    state :   {
        type : String,
    },
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