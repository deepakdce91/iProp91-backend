const mongoose = require("mongoose");
const collection = "communities";

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
    thumbnail : {
        type : String,
        default : ""
    },
    projects : [{
      
            type : String,
            required : true
        
    }],
    customers : [{
        profilePicture : {
            type : String,
            default : ""
        },
        _id : {
            type : String,
            required : true
        },
        name : {
            type : String,
            default : "iProp91 User"
        },
        phone : {
            type : String,
            required : true
        },
        admin : {
            type : String,
            default : "false"
        }
    }]
    

},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;