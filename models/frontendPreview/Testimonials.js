const mongoose = require("mongoose");
const collection = "testimonials";

const currentSchema = new mongoose.Schema({
    testimonial : {
        type : String,
        required : true
    },
    userInfo : {
        id : {
            type : String,
            required : true
        },
        profilePicture : {
            type : String,
            default : ""
        },
        name : {
            type : String,
            default : "iProp91 Customer"
        }
    },
    enable : {  
        type : String,
        deafult : "no",
    },
    
},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;