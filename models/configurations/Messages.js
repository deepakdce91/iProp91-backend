const mongoose = require("mongoose");
const collection = "messages";

// Reusable sub-schema
const messageSchema = new mongoose.Schema({
    text: { type: String },
    userId: { type: String},
    userProfilePicture : { type: String, default : ""},
    userName: { type: String},
    flag: { type: String, default : "false" },
    file:{
        name : { type: String },
        type :  { type: String },
        url :  { type: String }
    },
}, { _id: true, timestamps: true  });


const currentSchema = new mongoose.Schema({
    
    communityId : {
        type : String,
        required : true
    },
    
    messages : [messageSchema]
    

},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;