const mongoose = require("mongoose");
require('dotenv').config();
const uri = `${process.env.MONGO_URL}`

mongoose.connect(uri,()=>{
    console.log("Connected to iprop backend successfully {mongodb}!")
}); 