const mongoose = require("mongoose");
const collection = "reported-messages";

const currentSchema = new mongoose.Schema({
    
    groupName : {
        type : String,
        required : true
    },
    groupId : {
      type : String,
      required : true
  },
    message : {
        type : String,
        required : true
    },
    messageId : {
      type : String,
      required : true,
      unique : true
  },
    reportedBy : { // id of reporter
      type : String,
      required : true
    },
    messageBy : { // id of sender
      type : String,
      required : true
    },
    actionTaken : { // id of sender
      type : String,
      default : "false"
    },

},{ timestamps: true })

const model = mongoose.model(collection,currentSchema);

module.exports = model;